// Gilded Hour: tuning, palette and shared constants.
// One job: every number the rest of the game reads, in one place.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 64;
export const FLOOR = { x: 48, y: 84, w: 1184, h: 592 };

export const PALETTE = {
  wall: '#131924',
  wallTop: '#c9a24b',
  wallBevel: '#3d4a63',
  floorA: '#3b4353',
  floorB: '#323947',
  tileLine: '#232a38',
  stoneFleck: '#4a5366',
  rug: '#7a1f2b',
  rugEdge: '#c9a24b',
  gold: '#f2c14e',
  goldDim: '#9c7a2e',
  loot: '#ffd76a',
  thief: '#2e4066',
  thiefTrim: '#f2c14e',
  guard: '#3f5a7d',
  guardTrim: '#d8dee8',
  cone: 'rgba(242,193,78,0.26)',
  coneEdge: 'rgba(255,214,106,0.85)',
  coneHot: 'rgba(230,57,45,0.34)',
  coneHotEdge: 'rgba(255,106,85,0.9)',
  cameraCone: 'rgba(230,57,45,0.22)',
  cameraConeEdge: 'rgba(255,106,85,0.85)',
  laser: '#ff3b30',
  laserDim: '#7a1d18',
  text: '#f4ead2',
  muted: '#b8a888',
  alarmLow: '#7fc97f',
  alarmHigh: '#e6392d',
  panel: 'rgba(16,13,10,0.88)',
  glass: 'rgba(180,220,235,0.22)',
  shadowCover: 'rgba(64,76,150,0.38)',
  shadowCoverEdge: 'rgba(120,140,220,0.55)',
  ventMetal: '#8a94a6',
  ventDark: '#2b313c',
  ductLine: 'rgba(127,179,213,0.30)',
  patrolDot: 'rgba(242,193,78,0.45)',
};

export const PLAYER = {
  radius: 13,
  walkSpeed: 168,
  sneakSpeed: 92,
  dashSpeed: 430,
  dashTime: 0.16,
  dashCooldown: 1.1,
  staminaMax: 100,
  staminaDrain: 34,
  staminaRegen: 26,
};

export const DETECTION = {
  guardRange: 215,
  guardHalfAngle: 0.56,
  cameraRange: 245,
  cameraHalfAngle: 0.42,
  lanternMultiplier: 1.35,
  sneakMultiplier: 0.55,
  fillPerSecond: 46,
  decayPerSecond: 9,
  chaseAt: 70,
  catchDistance: 24,
};

export const TIMING = {
  startSeconds: 240,
  cameraDisableSeconds: 20,
  empSeconds: 8,
  smokeSeconds: 4,
  laserCycleSeconds: 3.2,
  crackNeeded: 3,
};

export const LOOT_VALUES = { painting: 850, gems: 1200, coins: 650, dial: 5000 };

export const GADGETS = {
  smokeCharges: 2,
  empCharges: 1,
  smokeCooldown: 6,
  empCooldown: 14,
};

export const CONTROLS_TEXT =
  'WASD move · SHIFT sneak · SPACE dash · E use';
