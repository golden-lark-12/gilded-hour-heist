// Game rules and state machine. One job: move from title to infiltration to
// vault to escape or capture, updating guards, cameras, lasers, hacking,
// cracking, loot and the alarm — and nothing about pixels.

import { PLAYER, DETECTION, TIMING, GADGETS } from './config.js';
import { buildMuseum, moveWithCollision, lineOfSightBlocked, nearestInteractable, circleHitsRect } from './world.js';
import { inputMoveAxis, consumeJustPressed } from './input.js';
import { makeSeededRandom } from './random.js';

export function createGameState(seed) {
  const museum = buildMuseum();
  return {
    seed: seed || 1,
    random: makeSeededRandom(seed || 1),
    museum,
    mode: 'title',
    paused: false,
    time: 0,
    timeLeft: TIMING.startSeconds,
    player: { x: museum.entrance.x, y: museum.entrance.y, radius: PLAYER.radius, angle: -Math.PI / 2 },
    alarm: 0,
    alarmPeak: 0,
    lootValue: 0,
    lootTaken: 0,
    hasDial: false,
    lanternOn: true,
    stamina: PLAYER.staminaMax,
    dashTime: 0,
    dashCooldown: 0,
    dashX: 0,
    dashY: 0,
    smokeCharges: GADGETS.smokeCharges,
    empCharges: GADGETS.empCharges,
    smokeCooldown: 0,
    empCooldown: 0,
    camerasDisabled: 0,
    empTime: 0,
    smokes: [],
    particles: [],
    crack: null,
    hacking: null,
    laserZapCooldown: 0,
    laserFlash: 0,
    spottedFlash: 0,
    wasSeen: false,
    catchReason: '',
    winStats: null,
    message: '',
    messageTime: 0,
  };
}

export function resetGameState(state) {
  const fresh = createGameState(state.seed);
  fresh.mode = 'play';
  return fresh;
}

function spawnLootBurst(state, x, y) {
  for (let i = 0; i < 22; i++) {
    const angle = state.random() * Math.PI * 2;
    const speed = 30 + state.random() * 90;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.7, maxLife: 0.7,
      size: 2 + state.random() * 3,
      color: state.random() < 0.5 ? '#f2c14e' : '#fff2b0',
    });
  }
}

function updateParticles(state, dt) {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
}

function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

function watcherSees(state, wx, wy, angle, range, halfAngle) {
  const player = state.player;
  if (state.smokes.some((s) => circleHitsRect(player.x, player.y, player.radius, { x: s.x - s.radius, y: s.y - s.radius, w: s.radius * 2, h: s.radius * 2 }))) return false;
  const dx = player.x - wx;
  const dy = player.y - wy;
  const distance = Math.hypot(dx, dy);
  let reach = range;
  if (state.lanternOn) reach *= DETECTION.lanternMultiplier;
  if (state.sneaking) reach *= DETECTION.sneakMultiplier;
  if (distance > reach) return false;
  if (angleDifference(Math.atan2(dy, dx), angle) > halfAngle) return false;
  return !lineOfSightBlocked(wx, wy, player.x, player.y, state.museum);
}

export function checkDetection(state, dt, audio) {
  let seen = false;
  for (const guard of state.museum.guards) {
    if (watcherSees(state, guard.x, guard.y, guard.angle, DETECTION.guardRange, DETECTION.guardHalfAngle)) {
      seen = true;
      guard.alert = Math.min(100, guard.alert + 60 * dt);
    } else {
      guard.alert = Math.max(0, guard.alert - 18 * dt);
    }
  }
  if (state.camerasDisabled <= 0 && state.empTime <= 0) {
    for (const camera of state.museum.cameras) {
      if (watcherSees(state, camera.x, camera.y, camera.angle, DETECTION.cameraRange, DETECTION.cameraHalfAngle)) {
        seen = true;
      }
    }
  }
  if (seen) {
    state.alarm = Math.min(100, state.alarm + DETECTION.fillPerSecond * dt);
    if (!state.wasSeen) audio.spotted();
  } else {
    state.alarm = Math.max(0, state.alarm - DETECTION.decayPerSecond * dt);
  }
  state.wasSeen = seen;
  state.alarmPeak = Math.max(state.alarmPeak, state.alarm);
  return seen;
}

export function updateGuards(state, dt) {
  const chasing = state.alarm >= DETECTION.chaseAt;
  for (const guard of state.museum.guards) {
    if (chasing) {
      const dx = state.player.x - guard.x;
      const dy = state.player.y - guard.y;
      const distance = Math.hypot(dx, dy) || 1;
      const speed = 98;
      const stepX = (dx / distance) * speed * dt;
      const stepY = (dy / distance) * speed * dt;
      const before = { x: guard.x, y: guard.y };
      moveWithCollision(guard, stepX, stepY, state.museum);
      if (guard.x !== before.x || guard.y !== before.y) guard.angle = Math.atan2(guard.y - before.y, guard.x - before.x);
      continue;
    }
    if (guard.pause > 0) {
      guard.pause -= dt;
      guard.angle += Math.sin(state.time * 1.4 + guard.x) * 0.35 * dt;
      continue;
    }
    const target = guard.waypoints[guard.waypointIndex];
    const dx = target[0] - guard.x;
    const dy = target[1] - guard.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 8) {
      guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
      guard.pause = 0.9;
      continue;
    }
    const stepX = (dx / distance) * guard.speed * dt;
    const stepY = (dy / distance) * guard.speed * dt;
    moveWithCollision(guard, stepX, stepY, state.museum);
    guard.angle = Math.atan2(stepY, stepX);
  }
}

export function updateCameras(state, dt) {
  for (const camera of state.museum.cameras) {
    camera.angle = camera.baseAngle + Math.sin(state.time * 0.55 + camera.phase) * camera.sweep;
  }
}

export function laserIsOn(laser, time, empTime) {
  if (empTime > 0) return false;
  const cycle = TIMING.laserCycleSeconds;
  return ((time + laser.phase) % cycle) < cycle * 0.55;
}

export function updateLasers(state, dt, audio) {
  state.laserZapCooldown = Math.max(0, state.laserZapCooldown - dt);
  for (const laser of state.museum.lasers) {
    if (!laserIsOn(laser, state.time, state.empTime)) continue;
    if (state.laserZapCooldown > 0) continue;
    const player = state.player;
    if (player.x > laser.x1 - 8 && player.x < laser.x2 + 8 && Math.abs(player.y - laser.y) < player.radius + 3) {
      state.alarm = Math.min(100, state.alarm + 18);
      state.laserFlash = 0.35;
      state.laserZapCooldown = 1.2;
      audio.laserZap();
      spawnLootBurst(state, player.x, player.y);
    }
  }
}

export function hackTerminal(state, terminal, dt, audio) {
  state.hacking = terminal;
  terminal.hackProgress = Math.min(100, terminal.hackProgress + 55 * dt);
  if (Math.floor(state.time * 4) !== Math.floor((state.time - dt) * 4)) audio.hackTick();
  if (terminal.hackProgress >= 100) {
    terminal.hacked = true;
    state.hacking = null;
    if (terminal.effect === 'cameras') {
      state.camerasDisabled = TIMING.cameraDisableSeconds;
      state.message = 'Cameras disabled for 20 seconds';
    } else {
      state.museum.vaultDoor.open = true;
      state.message = 'Vault door open — take the Sun Dial';
    }
    state.messageTime = 3;
    audio.pickup();
  }
}

export function startCrack(state) {
  state.crack = {
    marker: 0,
    direction: 1,
    speed: 1.35,
    zoneStart: 0.3 + state.random() * 0.4,
    zoneWidth: 0.16,
    hits: 0,
  };
  state.mode = 'crack';
}

export function crackVault(state, audio) {
  const crack = state.crack;
  if (!crack) return;
  const inZone = crack.marker >= crack.zoneStart && crack.marker <= crack.zoneStart + crack.zoneWidth;
  if (inZone) {
    crack.hits += 1;
    audio.crackGood();
    if (crack.hits >= TIMING.crackNeeded) {
      const dial = state.museum.loot.find((item) => item.id === 'dial');
      dial.taken = true;
      state.hasDial = true;
      state.lootValue += dial.value;
      state.lootTaken += 1;
      state.crack = null;
      state.mode = 'play';
      state.alarm = Math.min(100, state.alarm + 35);
      state.message = 'SUN DIAL TAKEN — get to the EXIT stairs!';
      state.messageTime = 4;
      spawnLootBurst(state, dial.x, dial.y);
      audio.pickup();
      return;
    }
    crack.zoneStart = 0.15 + state.random() * 0.55;
    crack.speed += 0.18;
  } else {
    state.alarm = Math.min(100, state.alarm + 8);
    audio.crackBad();
    crack.zoneStart = 0.15 + state.random() * 0.55;
  }
}

function updateCrack(state, dt) {
  const crack = state.crack;
  crack.marker += crack.direction * crack.speed * dt;
  if (crack.marker >= 1) { crack.marker = 1; crack.direction = -1; }
  if (crack.marker <= 0) { crack.marker = 0; crack.direction = 1; }
}

export function collectLoot(state, interactable, audio) {
  if (interactable.kind === 'loot') {
    const item = interactable.ref;
    item.taken = true;
    state.lootValue += item.value;
    state.lootTaken += 1;
    state.message = `${item.name} secured — $${item.value.toLocaleString('en-US')}`;
    state.messageTime = 2.5;
    spawnLootBurst(state, item.x, item.y);
    audio.pickup();
  }
}

export function currentObjective(state) {
  if (state.hasDial) return { title: 'ESCAPE — reach the EXIT stairs', detail: 'The dial is yours. Do not get caught.' };
  if (state.museum.vaultDoor.open) return { title: 'STEAL THE SUN DIAL', detail: 'The vault is open. Crack the dial case.' };
  if (state.museum.terminals[1].hacked) return { title: 'OPEN THE VAULT', detail: 'The door is open. Cross to the vault.' };
  return { title: 'REACH THE VAULT TERMINAL', detail: 'Grab side loot, hack terminals, stay out of cones.' };
}

function startSmoke(state) {
  if (state.smokeCharges <= 0 || state.smokeCooldown > 0) return;
  state.smokeCharges -= 1;
  state.smokeCooldown = GADGETS.smokeCooldown;
  state.smokes.push({ x: state.player.x, y: state.player.y, radius: 74, life: TIMING.smokeSeconds });
}

function startEmp(state) {
  if (state.empCharges <= 0 || state.empCooldown > 0) return;
  state.empCharges -= 1;
  state.empCooldown = GADGETS.empCooldown;
  state.empTime = TIMING.empSeconds;
  state.message = 'EMP burst — cameras and lasers down';
  state.messageTime = 2.5;
}

export function updateGame(state, input, audio, dt) {
  state.time += dt;
  updateParticles(state, dt);
  state.messageTime = Math.max(0, state.messageTime - dt);
  state.laserFlash = Math.max(0, state.laserFlash - dt);
  state.spottedFlash = Math.max(0, state.spottedFlash - dt);

  if (state.mode === 'title') {
    updateCameras(state, dt);
    if (consumeJustPressed(input, 'Enter') || consumeJustPressed(input, ' ') || input.clicked) {
      state.mode = 'play';
      audio.unlock();
    }
    return state;
  }

  if (state.mode === 'win' || state.mode === 'caught') {
    if (consumeJustPressed(input, 'r') || consumeJustPressed(input, 'R')) {
      return resetGameState(state);
    }
    return state;
  }

  if (consumeJustPressed(input, 'p') || consumeJustPressed(input, 'P')) {
    state.paused = !state.paused;
  }
  if (state.paused) return state;
  if (consumeJustPressed(input, 'm') || consumeJustPressed(input, 'M')) audio.toggleMute();
  if (consumeJustPressed(input, 'l') || consumeJustPressed(input, 'L')) state.lanternOn = !state.lanternOn;

  if (state.mode === 'crack') {
    updateCrack(state, dt);
    if (consumeJustPressed(input, 'e') || consumeJustPressed(input, 'E') || input.clicked) {
      crackVault(state, audio);
    }
    if (consumeJustPressed(input, 'Escape')) { state.crack = null; state.mode = 'play'; }
    return state;
  }

  // Timers.
  state.timeLeft -= dt;
  state.camerasDisabled = Math.max(0, state.camerasDisabled - dt);
  state.empTime = Math.max(0, state.empTime - dt);
  state.smokeCooldown = Math.max(0, state.smokeCooldown - dt);
  state.empCooldown = Math.max(0, state.empCooldown - dt);
  state.smokes = state.smokes.filter((smoke) => {
    smoke.life -= dt;
    return smoke.life > 0;
  });

  // Gadgets: keys and the bottom-strip mouse buttons.
  if (consumeJustPressed(input, '1')) startSmoke(state);
  if (consumeJustPressed(input, '2')) startEmp(state);
  if (input.clicked) {
    if (input.mouseX >= 48 && input.mouseX <= 250 && input.mouseY >= 684 && input.mouseY <= 712) startSmoke(state);
    if (input.mouseX >= 250 && input.mouseX <= 430 && input.mouseY >= 684 && input.mouseY <= 712) startEmp(state);
  }

  // Movement.
  const axis = inputMoveAxis(input);
  state.sneaking = input.keys.has('Shift');
  const moving = axis.x !== 0 || axis.y !== 0;
  if (moving) state.player.angle = Math.atan2(axis.y, axis.x);
  let speed = state.sneaking ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
  if (state.dashCooldown > 0) state.dashCooldown -= dt;
  if (consumeJustPressed(input, ' ') && state.dashCooldown <= 0 && state.stamina >= 20 && moving) {
    state.dashTime = PLAYER.dashTime;
    state.dashCooldown = PLAYER.dashCooldown;
    state.stamina -= 20;
    state.dashX = axis.x;
    state.dashY = axis.y;
  }
  if (state.dashTime > 0) {
    state.dashTime -= dt;
    moveWithCollision(state.player, state.dashX * PLAYER.dashSpeed * dt, state.dashY * PLAYER.dashSpeed * dt, state.museum);
  } else if (moving) {
    moveWithCollision(state.player, axis.x * speed * dt, axis.y * speed * dt, state.museum);
  }
  if (state.sneaking && moving) state.stamina = Math.max(0, state.stamina - 4 * dt);
  else state.stamina = Math.min(PLAYER.staminaMax, state.stamina + PLAYER.staminaRegen * dt);

  // Interaction: hold E to hack, tap E to grab loot or start the crack.
  const interactable = nearestInteractable(state.player, state.museum);
  state.nearby = interactable;
  if (interactable && interactable.kind === 'terminal' && input.keys.has('e')) {
    hackTerminal(state, interactable.ref, dt, audio);
  } else {
    state.hacking = null;
    if (interactable) {
      for (const terminal of state.museum.terminals) {
        if (!terminal.hacked) terminal.hackProgress = Math.max(0, terminal.hackProgress - 30 * dt);
      }
    }
    if (consumeJustPressed(input, 'e') || consumeJustPressed(input, 'E')) {
      if (!interactable) { /* nothing in reach */ }
      else if (interactable.kind === 'loot') collectLoot(state, interactable, audio);
      else if (interactable.kind === 'dial') startCrack(state);
    }
  }

  updateGuards(state, dt);
  updateCameras(state, dt);
  checkDetection(state, dt, audio);
  updateLasers(state, dt, audio);

  // Timeout: the museum locks down.
  if (state.timeLeft <= 0) {
    state.mode = 'caught';
    state.catchReason = 'The clock hit zero — the museum locked down around you.';
    audio.caught();
    return state;
  }

  // Caught: a chasing guard closes the distance.
  for (const guard of state.museum.guards) {
    const distance = Math.hypot(guard.x - state.player.x, guard.y - state.player.y);
    if (distance < DETECTION.catchDistance && state.alarm >= 50) {
      state.mode = 'caught';
      state.catchReason = `${guard.name} caught you in the open. Cones and cameras feed the alarm — break sight before it passes 50%.`;
      audio.caught();
      return state;
    }
  }

  // Escape with the dial.
  const esc = state.museum.escape;
  if (state.hasDial && circleHitsRect(state.player.x, state.player.y, state.player.radius, esc)) {
    state.mode = 'win';
    const rating = state.alarmPeak < 40 ? 'GHOST' : state.alarmPeak < 70 ? 'SHADOW' : 'LOUD AND PROUD';
    state.winStats = {
      loot: state.lootValue,
      timeLeft: Math.max(0, state.timeLeft),
      alarmPeak: Math.round(state.alarmPeak),
      rating,
      lootTaken: state.lootTaken,
    };
    audio.win();
  }

  const objective = currentObjective(state);
  state.objective = objective.title;
  state.objectiveDetail = objective.detail;
  return state;
}
