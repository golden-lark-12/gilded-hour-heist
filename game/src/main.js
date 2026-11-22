// Boot and frame loop. One job: own the canvas, run updateGame once a
// frame, paint the world in a fixed order, and expose the live state and
// frame rate for headless play-testing.

import { VIEW_W, VIEW_H, PALETTE } from './config.js';
import { createGameState, updateGame, laserIsOn, currentObjective } from './game.js';
import { createInput, endInputFrame } from './input.js';
import { createAudio } from './audio.js';
import {
  drawFloor, drawProps, drawWalls, drawVisionCone, drawGuard, drawCamera,
  drawLasers, drawThief, drawLoot, drawTerminals, drawParticles, renderLighting,
  drawSmoke,
} from './render.js';
import { renderHud, renderBanner, renderCrackBar } from './hud.js';
import { stateForShot, SHOT_NAMES } from './shots.js';
import { DETECTION } from './config.js';
import { circleHitsRect } from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '1') || 1;

let state;
if (shotName && SHOT_NAMES.includes(shotName)) {
  state = stateForShot(shotName, seed);
} else {
  state = createGameState(seed);
  const objective = currentObjective(state);
  state.objective = objective.title;
  state.objectiveDetail = objective.detail;
}

const input = createInput(canvas);
const audio = createAudio();
window.__gameState = state;
window.__audio = audio;

let lastTime = performance.now();
let frameTimes = [];
let fps = 60;
window.__fps = 60;
window.__bootError = null;

function coneOccluders() {
  const museum = state.museum;
  const rects = [...museum.walls];
  if (!museum.vaultDoor.open) rects.push(museum.vaultDoor);
  for (const solid of museum.solids) {
    if (solid.kind === 'case' || solid.kind === 'pillar' || solid.kind === 'statue' || solid.kind === 'desk') {
      rects.push(solid);
    }
  }
  return rects;
}

function drawWorld() {
  const museum = state.museum;
  const occluders = coneOccluders();
  drawFloor(ctx, museum);
  drawProps(ctx, museum);
  drawLoot(ctx, museum, state.time);

  drawLasers(ctx, museum, (laser) => laserIsOn(laser, state.time, state.empTime), state.time);
  drawTerminals(ctx, museum, state.time);
  const camerasOff = state.camerasDisabled > 0 || state.empTime > 0;
  for (const camera of museum.cameras) {
    if (!camerasOff) {
      drawVisionCone(ctx, camera.x, camera.y, camera.angle, DETECTION.cameraRange, DETECTION.cameraHalfAngle, PALETTE.cameraCone, occluders);
    }
  }
  for (const guard of museum.guards) {
    const hot = guard.alert > 60 || state.alarm >= DETECTION.chaseAt;
    drawVisionCone(ctx, guard.x, guard.y, guard.angle, DETECTION.guardRange, DETECTION.guardHalfAngle, hot ? PALETTE.coneHot : PALETTE.cone, occluders);
  }
  for (const camera of museum.cameras) drawCamera(ctx, camera, camerasOff);
  for (const guard of museum.guards) drawGuard(ctx, guard, state.alarm >= DETECTION.chaseAt);
  drawThief(ctx, state.player, state.lanternOn);
  drawParticles(ctx, state.particles);
  drawWalls(ctx, museum);
  renderLighting(ctx, state.player, state.lanternOn, museum.vaultDoor.open);

  // Lantern halo on top of the dark, so the thief is never lost.
  const halo = ctx.createRadialGradient(state.player.x, state.player.y, 6, state.player.x, state.player.y, 90);
  halo.addColorStop(0, 'rgba(255,214,106,0.35)');
  halo.addColorStop(1, 'rgba(255,214,106,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(state.player.x, state.player.y, 90, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(state.player.x, state.player.y, 15, 0, Math.PI * 2); ctx.stroke();

  drawSmoke(ctx, state.smokes);

  if (state.laserFlash > 0) {
    ctx.fillStyle = `rgba(230,57,45,${0.25 * (state.laserFlash / 0.35)})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (state.wasSeen) {
    ctx.strokeStyle = 'rgba(230,57,45,0.55)';
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, VIEW_W - 6, VIEW_H - 6);
  }
}

function drawPrompt() {
  const nearby = state.nearby;
  if (!nearby || state.mode !== 'play') return;
  let text = '';
  if (nearby.kind === 'loot') text = `E — Grab ${nearby.ref.name} ($${nearby.ref.value.toLocaleString('en-US')})`;
  if (nearby.kind === 'terminal') text = nearby.ref.hacked ? '' : 'Hold E — Hack terminal';
  if (nearby.kind === 'dial') text = 'E — Crack the Sun Dial case';
  if (!text) return;
  ctx.font = '700 15px Verdana, sans-serif';
  const width = ctx.measureText(text).width + 28;
  ctx.fillStyle = 'rgba(16,13,10,0.88)';
  ctx.fillRect(640 - width / 2, 636, width, 34);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(640 - width / 2, 636, width, 34);
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 640, 654);
  ctx.textAlign = 'left';
}

function drawMessage() {
  if (state.messageTime <= 0 || !state.message) return;
  ctx.font = '700 15px Verdana, sans-serif';
  const width = ctx.measureText(state.message).width + 28;
  ctx.fillStyle = 'rgba(16,13,10,0.88)';
  ctx.fillRect(640 - width / 2, 72, width, 32);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 1;
  ctx.strokeRect(640 - width / 2, 72, width, 32);
  ctx.fillStyle = PALETTE.gold;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.message, 640, 88);
  ctx.textAlign = 'left';
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  frameTimes.push(dt);
  if (frameTimes.length > 90) frameTimes.shift();
  fps = frameTimes.reduce((sum, value) => sum + value, 0) / frameTimes.length;
  window.__fps = Math.round(1 / Math.max(fps, 0.001));

  try {
    if (shotName) {
      // Staged screenshots stay posed: only the visual clock advances, so
      // cones sweep and lasers cycle while the composed frame holds still.
      state.time += dt;
      for (const camera of state.museum.cameras) {
        camera.angle = camera.baseAngle + Math.sin(state.time * 0.55 + camera.phase) * camera.sweep;
      }
    } else {
      const next = updateGame(state, input, audio, dt);
      if (next !== state) {
        state = next;
        window.__gameState = state;
      }
    }
  } catch (error) {
    window.__bootError = String(error && error.message ? error.message : error);
  }

  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawWorld();
  renderHud(ctx, state);
  drawPrompt();
  drawMessage();
  if (state.mode === 'crack' && state.crack) renderCrackBar(ctx, state.crack);

  if (state.mode === 'title') {
    renderBanner(ctx, 'GILDED HOUR', [
      'One museum. One night. One Sun Dial worth $5,000.',
      'Three ways through every room: the doors, the vent, the shadows.',
      'Read the cones before you move. Hack the terminals.',
      'Crack the vault, grab the dial, and reach the EXIT stairs.',
      '',
      'Press ENTER or click to begin the heist.',
    ], PALETTE.gold);
  } else if (state.paused) {
    renderBanner(ctx, 'PAUSED', ['The guards hold their patrol. The clock holds too.', '', 'Press P to keep moving.'], PALETTE.gold);
  } else if (state.mode === 'win' && state.winStats) {
    const stats = state.winStats;
    const minutes = Math.floor(stats.timeLeft / 60);
    const seconds = Math.floor(stats.timeLeft % 60);
    renderBanner(ctx, 'CLEAN GETAWAY', [
      `Rating: ${stats.rating}  ·  Loot: $${stats.loot.toLocaleString('en-US')} (${stats.lootTaken} of 4 targets)`,
      `Time to spare: ${minutes}:${String(seconds).padStart(2, '0')}  ·  Peak alarm: ${stats.alarmPeak}%`,
      'The Sun Dial is gone before dawn. The museum never saw you leave.',
      '',
      'Press R to run it again — quieter this time.',
    ], '#7fc97f');
  } else if (state.mode === 'caught') {
    renderBanner(ctx, 'CAUGHT', [
      state.catchReason,
      '',
      'Press R to retry the night. The floorplan has not changed —',
      'your route should.',
    ], '#e6392d');
  }

  endInputFrame(input);
  requestAnimationFrame(frame);
}

window.addEventListener('pointerdown', () => audio.unlock(), { once: true });
window.addEventListener('keydown', () => audio.unlock(), { once: true });
requestAnimationFrame(frame);
