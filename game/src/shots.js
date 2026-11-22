// Staged screenshot states. One job: pose the live game in a named,
// reproducible state for each screenshot the maker takes, using only the
// game's own state — no composited or borrowed imagery.

import { createGameState } from './game.js';

export const SHOT_NAMES = ['start', 'play', 'vault', 'escape'];

export function applyShotState(state, shotName) {
  const museum = state.museum;
  const guardAt = (guard, x, y, angle) => {
    guard.x = x;
    guard.y = y;
    guard.angle = angle;
    guard.pause = 0;
  };

  if (shotName === 'start') {
    state.mode = 'title';
    state.objective = 'REACH THE VAULT TERMINAL';
    state.objectiveDetail = 'Grab side loot, hack terminals, stay out of cones.';
    state.player.x = 116;
    state.player.y = 600;
    state.player.angle = -Math.PI / 2;
    state.alarm = 0;
    state.timeLeft = 240;
    state.lootValue = 0;
    guardAt(museum.guards[0], 600, 170, 0.4);
    guardAt(museum.guards[1], 480, 640, Math.PI);
    guardAt(museum.guards[2], 900, 130, 0);
    museum.cameras[0].angle = Math.PI * 0.75;
    museum.cameras[1].angle = Math.PI * 0.25;
    return state;
  }

  if (shotName === 'play') {
    state.mode = 'play';
    state.player.x = 640;
    state.player.y = 300;
    state.player.angle = Math.PI / 2;
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
    state.mode = 'play';
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
    guardAt(museum.guards[2], 950, 430, Math.PI / 2);
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
  guardAt(museum.guards[2], 1080, 300, -Math.PI / 2);
  return state;
}

export function stateForShot(shotName, seed) {
  const state = createGameState(seed || 1);
  return applyShotState(state, shotName);
}
