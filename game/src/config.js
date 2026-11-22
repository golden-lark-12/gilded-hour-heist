// Gilded Hour: tuning, palette and shared constants.
// One job: every number the rest of the game reads, in one place.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 64;
export const FLOOR = { x: 48, y: 84, w: 1184, h: 592 };

export const PALETTE = {
  wall: '#2b2620',
  wallTop: '#4a4238',
  floorA: '#3a332a',
  floorB: '#332c24',
  tileLine: '#241f19',
  rug: '#6e1f24',
  rugEdge: '#c9a24b',
  gold: '#f2c14e',
  goldDim: '#9c7a2e',
  loot: '#ffd76a',
  thief: '#2e4257',
  thiefTrim: '#f2c14e',
  guard: '#31435c',
  guardTrim: '#d8dee8',
  cone: 'rgba(242,193,78,0.20)',
  coneHot: 'rgba(230,57,45,0.30)',
  cameraCone: 'rgba(230,57,45,0.16)',
  laser: '#ff3b30',
  laserDim: '#7a1d18',
  text: '#f4ead2',
  muted: '#b8a888',
  alarmLow: '#7fc97f',
  alarmHigh: '#e6392d',
  panel: 'rgba(16,13,10,0.88)',
  glass: 'rgba(180,220,235,0.22)',
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
