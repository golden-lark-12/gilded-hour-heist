// The heads-up display. One job: every number the player needs — loot,
// alarm, objective, timer, gadgets, stamina — drawn once, legibly, with
// no overlap, on top of the game frame.

import { PALETTE, HUD_H, VIEW_W, CONTROLS_TEXT } from './config.js';

export function renderHud(ctx, state) {
  ctx.fillStyle = '#100d0a';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = '#c9a24b';
  ctx.fillRect(0, HUD_H - 2, VIEW_W, 2);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 15px Georgia, serif';
  ctx.fillText('GILDED HOUR', 16, 20);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '600 11px Verdana, sans-serif';
  ctx.fillText('THE SUN DIAL HEIST', 16, 42);

  // Loot.
  ctx.fillStyle = PALETTE.text;
  ctx.font = '700 20px Verdana, sans-serif';
  ctx.fillText(`LOOT  $${state.lootValue.toLocaleString('en-US')}`, 210, 22);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '600 11px Verdana, sans-serif';
  ctx.fillText(`${state.lootTaken} of 4 targets`, 210, 44);

  // Alarm meter.
  const meterX = 420;
  const meterW = 240;
  ctx.fillStyle = PALETTE.text;
  ctx.font = '700 12px Verdana, sans-serif';
  ctx.fillText('ALARM', meterX, 14);
  ctx.fillStyle = '#2b2620';
  ctx.fillRect(meterX, 24, meterW, 16);
  const alarmRatio = Math.max(0, Math.min(1, state.alarm / 100));
  ctx.fillStyle = state.alarm >= 70 ? PALETTE.alarmHigh : state.alarm >= 35 ? PALETTE.gold : PALETTE.alarmLow;
  ctx.fillRect(meterX, 24, meterW * alarmRatio, 16);
  ctx.strokeStyle = '#c9a24b';
  ctx.lineWidth = 1;
  ctx.strokeRect(meterX, 24, meterW, 16);
  ctx.fillStyle = alarmRatio > 0.45 ? '#171310' : PALETTE.text;
  ctx.font = '700 12px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(state.alarm)}%`, meterX + meterW / 2, 32);
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '600 11px Verdana, sans-serif';
  ctx.fillText(state.alarm >= 70 ? 'LOCKDOWN — guards chase!' : state.alarm >= 35 ? 'Suspicious — stay out of sight' : 'Undetected', meterX, 50);

  // Objective.
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 12px Verdana, sans-serif';
  ctx.fillText('OBJECTIVE', 690, 14);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 13px Verdana, sans-serif';
  ctx.fillText(state.objective, 690, 34);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '600 11px Verdana, sans-serif';
  ctx.fillText(state.objectiveDetail, 690, 50);

  // Timer.
  const minutes = Math.floor(Math.max(0, state.timeLeft) / 60);
  const seconds = Math.floor(Math.max(0, state.timeLeft) % 60);
  ctx.fillStyle = state.timeLeft < 45 ? PALETTE.alarmHigh : PALETTE.text;
  ctx.font = '700 22px Verdana, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${minutes}:${String(seconds).padStart(2, '0')}`, 1264, 22);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '600 11px Verdana, sans-serif';
  ctx.fillText('until lockdown', 1264, 44);
  ctx.textAlign = 'left';

  // Gadget + stamina strip at the bottom of the floor.
  ctx.fillStyle = 'rgba(16,13,10,0.85)';
  ctx.fillRect(48, 684, 1184, 28);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 12px Verdana, sans-serif';
  ctx.fillText(
    `SMOKE [1] ×${state.smokeCharges}   EMP [2] ×${state.empCharges}   LANTERN [L] ${state.lanternOn ? 'ON — brighter, easier to spot' : 'OFF'}   STAMINA`,
    60, 698,
  );
  ctx.fillStyle = '#2b2620';
  ctx.fillRect(760, 692, 140, 12);
  ctx.fillStyle = '#7fc97f';
  ctx.fillRect(760, 692, 140 * (state.stamina / 100), 12);
  ctx.strokeStyle = '#c9a24b';
  ctx.strokeRect(760, 692, 140, 12);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '600 11px Verdana, sans-serif';
  ctx.fillText(CONTROLS_TEXT, 920, 698);
}

export function renderBanner(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8,6,10,0.72)';
  ctx.fillRect(0, 0, VIEW_W, 720);
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(280, 130, 720, 440);
  ctx.strokeStyle = accent || PALETTE.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(280, 130, 720, 440);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = accent || PALETTE.gold;
  ctx.font = '700 40px Georgia, serif';
  ctx.fillText(title, 640, 180);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 16px Verdana, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, 640, 232 + i * 30));
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '600 13px Verdana, sans-serif';
  ctx.fillText(CONTROLS_TEXT, 640, 540);
  ctx.textAlign = 'left';
}

export function renderCrackBar(ctx, crack) {
  const barX = 440;
  const barY = 610;
  const barW = 400;
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(barX - 20, barY - 44, barW + 40, 86);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(barX - 20, barY - 44, barW + 40, 86);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '700 14px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CRACK THE VAULT — press E when the needle is in the gold zone', 640, barY - 24);
  ctx.fillStyle = '#2b2620';
  ctx.fillRect(barX, barY, barW, 18);
  const zoneX = barX + crack.zoneStart * barW;
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(zoneX, barY, crack.zoneWidth * barW, 18);
  ctx.fillStyle = '#ff6a55';
  ctx.fillRect(barX + crack.marker * barW - 2, barY - 6, 4, 30);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 12px Verdana, sans-serif';
  ctx.fillText(`${crack.hits} of 3 tumblers set`, 640, barY + 36);
  ctx.textAlign = 'left';
}
