// All drawing. One job: paint the floorplan, actors, cones, lasers, vault,
// lighting and HUD from game state, with nothing else deciding layout.

import { PALETTE, FLOOR, HUD_H, VIEW_W, VIEW_H } from './config.js';

export function drawFloor(ctx, museum) {
  ctx.fillStyle = '#171310';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h);
  ctx.fillStyle = PALETTE.floorB;
  const tile = 44;
  for (let y = FLOOR.y; y < FLOOR.y + FLOOR.h; y += tile) {
    for (let x = FLOOR.x; x < FLOOR.x + FLOOR.w; x += tile) {
      const odd = ((x - FLOOR.x) / tile + (y - FLOOR.y) / tile) % 2 === 0;
      if (odd) ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = PALETTE.tileLine;
  ctx.lineWidth = 1;
  for (let x = FLOOR.x; x <= FLOOR.x + FLOOR.w; x += tile) {
    ctx.beginPath(); ctx.moveTo(x, FLOOR.y); ctx.lineTo(x, FLOOR.y + FLOOR.h); ctx.stroke();
  }
  for (let y = FLOOR.y; y <= FLOOR.y + FLOOR.h; y += tile) {
    ctx.beginPath(); ctx.moveTo(FLOOR.x, y); ctx.lineTo(FLOOR.x + FLOOR.w, y); ctx.stroke();
  }
  for (const room of museum.rooms) {
    ctx.fillStyle = 'rgba(244,234,210,0.55)';
    ctx.font = '600 13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(room.name, room.labelX, room.labelY);
  }
  for (const prop of museum.props) {
    if (prop.kind === 'rug') {
      ctx.fillStyle = PALETTE.rug;
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.strokeStyle = PALETTE.rugEdge;
      ctx.lineWidth = 3;
      ctx.strokeRect(prop.x + 5, prop.y + 5, prop.w - 10, prop.h - 10);
      ctx.strokeStyle = 'rgba(201,162,75,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(prop.x + 16, prop.y + 16, prop.w - 32, prop.h - 32);
    }
  }
}

export function drawProps(ctx, museum) {
  for (const prop of museum.props) {
    if (prop.kind === 'rug' || prop.kind === 'stairs') continue;
    if (prop.kind === 'case') {
      ctx.fillStyle = '#241d16';
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.fillStyle = PALETTE.glass;
      ctx.fillRect(prop.x + 4, prop.y + 4, prop.w - 8, prop.h - 8);
      ctx.strokeStyle = '#c9a24b';
      ctx.lineWidth = 2;
      ctx.strokeRect(prop.x, prop.y, prop.w, prop.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(prop.x + 10, prop.y + prop.h - 8); ctx.lineTo(prop.x + 26, prop.y + 8); ctx.stroke();
    } else if (prop.kind === 'pillar') {
      ctx.fillStyle = '#4a4238';
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.fillStyle = '#5d5347';
      ctx.fillRect(prop.x + 4, prop.y + 4, prop.w - 8, prop.h - 8);
      ctx.strokeStyle = '#171310';
      ctx.strokeRect(prop.x, prop.y, prop.w, prop.h);
    } else if (prop.kind === 'bench') {
      ctx.fillStyle = '#5a3b22';
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.fillStyle = '#7a5230';
      ctx.fillRect(prop.x + 3, prop.y + 3, prop.w - 6, prop.h - 6);
    } else if (prop.kind === 'plant') {
      ctx.fillStyle = '#7a4a26';
      ctx.fillRect(prop.x + 6, prop.y + 14, 14, 12);
      ctx.fillStyle = '#3f7a3a';
      ctx.beginPath(); ctx.arc(prop.x + 13, prop.y + 10, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5da24f';
      ctx.beginPath(); ctx.arc(prop.x + 9, prop.y + 7, 6, 0, Math.PI * 2); ctx.fill();
    } else if (prop.kind === 'desk') {
      ctx.fillStyle = '#3d2f22';
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.strokeStyle = '#c9a24b';
      ctx.lineWidth = 2;
      ctx.strokeRect(prop.x, prop.y, prop.w, prop.h);
      ctx.fillStyle = '#9fd8ef';
      ctx.fillRect(prop.x + 50, prop.y + 8, 30, 18);
    } else if (prop.kind === 'painting') {
      ctx.fillStyle = '#c9a24b';
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.fillStyle = '#7a5a8c';
      ctx.fillRect(prop.x + 3, prop.y + 3, prop.w - 6, prop.h - 6);
      ctx.fillStyle = '#e8c97a';
      ctx.fillRect(prop.x + 12, prop.y + 4, 10, 4);
    } else if (prop.kind === 'statue') {
      ctx.fillStyle = '#8a8378';
      ctx.fillRect(prop.x + 9, prop.y + 8, 12, 16);
      ctx.beginPath(); ctx.arc(prop.x + 15, prop.y + 6, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6e675c';
      ctx.fillRect(prop.x + 4, prop.y + 24, 22, 6);
    } else if (prop.kind === 'goldbar') {
      ctx.fillStyle = '#8a6a1e';
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(prop.x + 3, prop.y + 3, prop.w - 6, prop.h - 6);
      ctx.fillStyle = '#fff2b0';
      ctx.fillRect(prop.x + 8, prop.y + 6, 14, 5);
    } else if (prop.kind === 'pedestal') {
      ctx.fillStyle = '#4a4238';
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.strokeStyle = '#c9a24b';
      ctx.lineWidth = 2;
      ctx.strokeRect(prop.x, prop.y, prop.w, prop.h);
    }
  }
  // Escape staircase, drawn as steps with a glowing EXIT sign.
  const esc = museum.escape;
  ctx.fillStyle = '#2e2a24';
  ctx.fillRect(esc.x, esc.y, esc.w, esc.h);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? '#3d372e' : '#4a4438';
    ctx.fillRect(esc.x + 4, esc.y + 6 + i * 11, esc.w - 8, 9);
  }
  ctx.fillStyle = '#123b22';
  ctx.fillRect(esc.x + 16, esc.y - 2, 52, 18);
  ctx.fillStyle = '#7fc97f';
  ctx.font = '700 12px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', esc.x + 42, esc.y + 8);
  // Entrance mat.
  ctx.fillStyle = '#5a2326';
  ctx.fillRect(88, 632, 56, 30);
  ctx.fillStyle = '#c9a24b';
  ctx.font = '600 9px Verdana, sans-serif';
  ctx.fillText('ENTER', 116, 647);
}

export function drawWalls(ctx, museum) {
  for (const wall of museum.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, 3);
  }
  const door = museum.vaultDoor;
  if (!door.open) {
    ctx.fillStyle = '#6e675c';
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.fillStyle = '#8a8378';
    ctx.fillRect(door.x + 6, door.y + 2, door.w - 12, door.h - 4);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(door.x + door.w / 2 - 3, door.y - 4, 6, 20);
  } else {
    ctx.fillStyle = '#1c1a16';
    ctx.fillRect(door.x, door.y, door.w, door.h);
  }
}

function rayRectDistance(x, y, dx, dy, rect) {
  let tmin = 0;
  let tmax = Infinity;
  const slabs = [
    [dx, x - rect.x, x - (rect.x + rect.w)],
    [dy, y - rect.y, y - (rect.y + rect.h)],
  ];
  for (const [d, near, far] of slabs) {
    if (Math.abs(d) < 1e-9) {
      if (near > 0 || far < 0) return Infinity;
    } else {
      let t1 = -near / d;
      let t2 = -far / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return Infinity;
    }
  }
  return tmin;
}

export function drawVisionCone(ctx, x, y, angle, range, halfAngle, fill, occluders) {
  const steps = 30;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i <= steps; i++) {
    const a = angle - halfAngle + (2 * halfAngle * i) / steps;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let reach = range;
    for (const rect of occluders || []) {
      const hit = rayRectDistance(x, y, dx, dy, rect);
      if (hit < reach) reach = Math.max(0, hit);
    }
    ctx.lineTo(x + dx * reach, y + dy * reach);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawGuard(ctx, guard, chasing) {
  ctx.save();
  ctx.translate(guard.x, guard.y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(2, 5, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(guard.angle);
  ctx.fillStyle = chasing ? '#7a2a24' : PALETTE.guard;
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.guardTrim;
  ctx.fillRect(2, -5, 12, 10);
  ctx.fillStyle = '#1d2733';
  ctx.beginPath(); ctx.arc(9, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8eef4';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = PALETTE.guardTrim;
  ctx.fillRect(-12, -8, 7, 4);
  ctx.fillRect(-12, 4, 7, 4);
  ctx.restore();
  if (guard.alert > 1) {
    ctx.fillStyle = guard.alert > 60 ? '#ff6a55' : PALETTE.gold;
    ctx.font = '700 13px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(guard.alert > 60 ? '!' : '?', guard.x, guard.y - 16);
  }
}

export function drawCamera(ctx, camera, disabled) {
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.fillStyle = '#22201c';
  ctx.fillRect(-4, -4, 8, 8);
  ctx.rotate(camera.angle);
  ctx.fillStyle = disabled ? '#55504a' : '#3a3f46';
  ctx.fillRect(0, -5, 18, 10);
  ctx.fillStyle = disabled ? '#333' : '#ff3b30';
  ctx.beginPath(); ctx.arc(18, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawLasers(ctx, museum, laserOn, time) {
  for (const laser of museum.lasers) {
    const on = laserOn(laser, time);
    ctx.strokeStyle = on ? PALETTE.laser : PALETTE.laserDim;
    ctx.lineWidth = on ? 3 : 1;
    ctx.setLineDash(on ? [] : [6, 6]);
    ctx.beginPath(); ctx.moveTo(laser.x1, laser.y); ctx.lineTo(laser.x2, laser.y); ctx.stroke();
    ctx.setLineDash([]);
    for (const x of [laser.x1, laser.x2]) {
      ctx.fillStyle = '#3a3f46';
      ctx.fillRect(x - 5, laser.y - 7, 10, 14);
      ctx.fillStyle = on ? '#ff6a55' : '#7a3a36';
      ctx.beginPath(); ctx.arc(x, laser.y, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
}

export function drawThief(ctx, player, lanternOn) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(2, 5, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(player.angle);
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = PALETTE.thiefTrim;
  ctx.fillRect(4, -4, 10, 8);
  ctx.fillStyle = '#f4ead2';
  ctx.beginPath(); ctx.arc(10, 0, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (lanternOn) {
    const glow = ctx.createRadialGradient(player.x, player.y, 8, player.x, player.y, 110);
    glow.addColorStop(0, 'rgba(255,214,106,0.35)');
    glow.addColorStop(1, 'rgba(255,214,106,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(player.x, player.y, 110, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawLoot(ctx, museum, time) {
  for (const item of museum.loot) {
    if (item.taken) continue;
    const pulse = 0.6 + 0.4 * Math.sin(time * 3 + item.x);
    const glow = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, 34);
    glow.addColorStop(0, `rgba(255,215,106,${0.5 * pulse})`);
    glow.addColorStop(1, 'rgba(255,215,106,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(item.x, item.y, 34, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(item.x, item.y);
    if (item.id === 'dial') {
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#fff2b0';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + time * 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
        ctx.lineTo(Math.cos(a) * 15, Math.sin(a) * 15);
        ctx.stroke();
      }
      ctx.fillStyle = '#ff5a3c';
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = PALETTE.loot;
      ctx.save();
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-8, -8, 16, 16);
      ctx.restore();
      ctx.fillStyle = '#fff2b0';
      ctx.save();
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = PALETTE.text;
    ctx.font = '600 11px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`$${item.value.toLocaleString('en-US')}`, item.x, item.y + 24);
  }
}

export function drawTerminals(ctx, museum, time) {
  for (const terminal of museum.terminals) {
    ctx.fillStyle = '#22262e';
    ctx.fillRect(terminal.x - 14, terminal.y - 18, 28, 36);
    ctx.fillStyle = terminal.hacked ? '#3f7a3a' : '#22262e';
    ctx.strokeStyle = terminal.hacked ? '#7fc97f' : '#9fd8ef';
    ctx.lineWidth = 2;
    ctx.strokeRect(terminal.x - 14, terminal.y - 18, 28, 36);
    ctx.fillStyle = terminal.hacked ? '#7fc97f' : '#9fd8ef';
    ctx.fillRect(terminal.x - 9, terminal.y - 12, 18, 11);
    ctx.fillStyle = '#1d2733';
    for (let i = 0; i < 3; i++) ctx.fillRect(terminal.x - 7, terminal.y - 10 + i * 4, 14 - i * 3, 2);
    if (!terminal.hacked && terminal.hackProgress > 0) {
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(terminal.x, terminal.y, 26, -Math.PI / 2, -Math.PI / 2 + (terminal.hackProgress / 100) * Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = PALETTE.text;
    ctx.font = '600 10px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const label = terminal.effect === 'cameras' ? 'CAMERAS' : 'VAULT DOOR';
    ctx.fillText(terminal.hacked ? `${label} OFF` : label, terminal.x, terminal.y - 22);
    ctx.textBaseline = 'top';
  }
}

export function drawParticles(ctx, particles) {
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function renderLighting(ctx, player, lanternOn, vaultOpen) {
  ctx.fillStyle = 'rgba(8,6,10,0.34)';
  ctx.fillRect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const cut = (x, y, radius, strength) => {
    const glow = ctx.createRadialGradient(x, y, 4, x, y, radius);
    glow.addColorStop(0, `rgba(0,0,0,${strength})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  };
  cut(player.x, player.y, lanternOn ? 190 : 120, 0.85);
  cut(1041, 531, vaultOpen ? 210 : 120, 0.7);
  cut(116, 640, 110, 0.5);
  ctx.restore();
}

export function drawSmoke(ctx, smokes) {
  for (const smoke of smokes) {
    ctx.fillStyle = 'rgba(190,190,195,0.30)';
    ctx.beginPath(); ctx.arc(smoke.x, smoke.y, smoke.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(220,220,225,0.22)';
    ctx.beginPath(); ctx.arc(smoke.x - 14, smoke.y - 8, smoke.radius * 0.6, 0, Math.PI * 2); ctx.fill();
  }
}
