// Staged screenshot states. One job: pose the live game in a named,
// reproducible state for each screenshot the maker takes, using only the
// game's own state — no composited or borrowed imagery.

import { createGameState } from './game.js';

export const SHOT_NAMES = ['play', 'tools', 'vault', 'escape'];

export function applyShotState(state, shotName) {
  const museum = state.museum;
  const guardAt = (guard, x, y, angle) => {
    guard.x = x;
    guard.y = y;
    guard.angle = angle;
    guard.pause = 0;
  };

  if (shotName === 'tools') {
    // Live gameplay: the thief slips through the vent gap inside a smoke
    // cloud while the EMP holds cameras and lasers down — tools spent,
    // routes proven, cones still to be read.
    state.mode = 'play';
    state.objective = 'REACH THE VAULT TERMINAL';
    state.objectiveDetail = 'Grab side loot, hack terminals, stay out of cones.';
    state.player.x = 408;
    state.player.y = 310;
    state.player.angle = 0;
    state.alarm = 12;
    state.alarmPeak = 12;
    state.timeLeft = 205;
    state.lootValue = 2050;
    state.lootTaken = 2;
    museum.loot[0].taken = true;
    museum.loot[1].taken = true;
    state.smokeCharges = 1;
    state.empCharges = 0;
    state.empTime = 5;
    state.smokes = [{ x: 408, y: 310, radius: 74, life: 3 }];
    guardAt(museum.guards[0], 620, 200, Math.PI * 0.6);
    guardAt(museum.guards[1], 560, 560, -Math.PI / 2);
    guardAt(museum.guards[2], 1010, 200, Math.PI * 0.4);
    museum.guards[0].alert = 30;
    museum.cameras[0].angle = Math.PI * 0.9;
    museum.cameras[1].angle = Math.PI * 0.1;
    museum.terminals[0].hackProgress = 40;
    return state;
  }

  if (shotName === 'play') {
    state.mode = 'play';
    state.player.x = 600;
    state.player.y = 268;
    state.player.angle = 0;
    state.alarm = 34;
    state.alarmPeak = 34;
    state.timeLeft = 192;
    state.lootValue = 850;
    state.lootTaken = 1;
    museum.loot[0].taken = true;
    state.objective = 'REACH THE VAULT TERMINAL';
    state.objectiveDetail = 'Grab side loot, hack terminals, stay out of cones.';
    guardAt(museum.guards[0], 740, 220, Math.PI * 0.85);
    guardAt(museum.guards[1], 560, 470, -Math.PI / 2);
    guardAt(museum.guards[2], 1010, 210, Math.PI / 2);
    museum.guards[0].alert = 55;
    museum.cameras[0].angle = Math.PI * 0.9;
    museum.cameras[1].angle = Math.PI * 0.1;
    museum.terminals[0].hackProgress = 40;
    return state;
  }

  if (shotName === 'vault') {
    // Climax tension: the 3-tumbler crack ring is live beside the glowing
    // dial, Lockdown is on, and the vault guard's red cone sweeps for
    // the doorway the thief came through.
    state.mode = 'crack';
    state.crack = { marker: 0.46, direction: 1, speed: 1.35, zoneStart: 0.38, zoneWidth: 0.16, hits: 2 };
    museum.vaultDoor.open = true;
    state.player.x = 1041;
    state.player.y = 470;
    state.player.angle = Math.PI / 2;
    state.alarm = 78;
    state.alarmPeak = 78;
    state.timeLeft = 118;
    state.lootValue = 2700;
    state.lootTaken = 3;
    museum.loot[0].taken = true;
    museum.loot[1].taken = true;
    museum.loot[2].taken = true;
    museum.terminals[0].hacked = true;
    museum.terminals[1].hacked = true;
    state.camerasDisabled = 12;
    state.objective = 'STEAL THE SUN DIAL';
    state.objectiveDetail = 'The vault is open. Crack the dial case.';
    state.message = 'SUN DIAL IN REACH — crack it, then run!';
    state.messageTime = 3;
    guardAt(museum.guards[0], 880, 300, Math.PI * 0.3);
    guardAt(museum.guards[1], 780, 430, 0);
    guardAt(museum.guards[2], 950, 430, -Math.PI * 0.75);
    museum.guards[2].alert = 90;
    museum.cameras[0].angle = Math.PI * 0.6;
    museum.cameras[1].angle = Math.PI * 0.4;
    return state;
  }

  // escape: the getaway screen, won with the dial in hand.
  state.mode = 'win';
  museum.vaultDoor.open = true;
  museum.loot.forEach((item) => { item.taken = true; });
  museum.terminals.forEach((terminal) => { terminal.hacked = true; });
  state.player.x = 104;
  state.player.y = 130;
  state.player.angle = -Math.PI / 2;
  state.hasDial = true;
  state.alarm = 62;
  state.alarmPeak = 62;
  state.timeLeft = 96;
  state.lootValue = 7700;
  state.lootTaken = 4;
  state.objective = 'ESCAPE — reach the EXIT stairs';
  state.objectiveDetail = 'The dial is yours. Do not get caught.';
  state.winStats = { loot: 7700, timeLeft: 96, alarmPeak: 62, rating: 'SHADOW', lootTaken: 4 };
  guardAt(museum.guards[0], 700, 260, Math.PI);
  guardAt(museum.guards[1], 600, 560, 0);
  guardAt(museum.guards[2], 680, 340, -Math.PI / 2);
  return state;
}

export function stateForShot(shotName, seed) {
  const state = createGameState(seed || 1);
  return applyShotState(state, shotName);
}
