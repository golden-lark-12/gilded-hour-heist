// The museum floorplan. One job: build every wall, room, prop, guard route,
// camera, laser, loot case and terminal, and answer collision / sight questions.

import { FLOOR, LOOT_VALUES } from './config.js';

export function buildMuseum() {
  const walls = [];
  const addWall = (x, y, w, h) => walls.push({ x, y, w, h });

  // Outer shell (thick walls).
  addWall(FLOOR.x - 14, FLOOR.y - 14, FLOOR.w + 28, 14);
  addWall(FLOOR.x - 14, FLOOR.y + FLOOR.h, FLOOR.w + 28, 14);
  addWall(FLOOR.x - 14, FLOOR.y - 14, 14, FLOOR.h + 28);
  addWall(FLOOR.x + FLOOR.w, FLOOR.y - 14, 14, FLOOR.h + 28);

  // Wall between Entry Hall and the east rooms (x = 430), with a main door
  // and a narrow vent gap the thief can crawl through unseen.
  addWall(430, 84, 12, 196);
  addWall(430, 340, 12, 150);
  addWall(430, 540, 12, 136);
  // Wall between Gallery and Laser Hall (y = 380), west of the vault wing.
  addWall(442, 380, 240, 12);
  addWall(742, 380, 88, 12);
  // Wall between the vault wing and the west rooms (x = 830).
  addWall(830, 84, 12, 236);
  addWall(830, 380, 12, 296);
  // Wall between Antechamber and Vault (y = 380), holding the vault door.
  addWall(842, 380, 138, 12);
  addWall(1080, 380, 152, 12);

  // Room labels sit on clear floor at the foot of each room, away from
  // walls, props, cameras and the top banner zone: no label ever shares
  // its patch of floor with another drawn element.
  const rooms = [
    { name: 'ENTRY HALL', x: 48, y: 84, w: 382, h: 592, labelX: 170, labelY: 648 },
    { name: 'GALLERY', x: 442, y: 84, w: 388, h: 296, labelX: 458, labelY: 352 },
    { name: 'LASER HALL', x: 442, y: 392, w: 388, h: 284, labelX: 458, labelY: 400 },
    { name: 'ANTECHAMBER', x: 842, y: 84, w: 390, h: 296, labelX: 858, labelY: 352 },
    { name: 'VAULT', x: 842, y: 392, w: 390, h: 284, labelX: 858, labelY: 400 },
  ];

  const props = [
    // Entry hall furniture: benches, plants, ticket desk, staircase.
    { kind: 'bench', x: 120, y: 300, w: 110, h: 26 },
    { kind: 'bench', x: 120, y: 470, w: 110, h: 26 },
    { kind: 'plant', x: 380, y: 120, w: 26, h: 26 },
    { kind: 'plant', x: 380, y: 620, w: 26, h: 26 },
    { kind: 'desk', x: 180, y: 120, w: 130, h: 34 },
    { kind: 'stairs', x: 62, y: 98, w: 84, h: 64 },
    // Gallery: display cases double as cover; paintings hang on the walls.
    { kind: 'case', x: 520, y: 170, w: 74, h: 44 },
    { kind: 'case', x: 660, y: 250, w: 74, h: 44 },
    { kind: 'case', x: 560, y: 310, w: 74, h: 44 },
    { kind: 'painting', x: 500, y: 138, w: 66, h: 18 },
    { kind: 'painting', x: 700, y: 138, w: 66, h: 18 },
    { kind: 'rug', x: 520, y: 190, w: 230, h: 130 },
    // Laser hall: pillars break sight lines and give cover between beams.
    { kind: 'pillar', x: 500, y: 470, w: 30, h: 30 },
    { kind: 'pillar', x: 700, y: 470, w: 30, h: 30 },
    { kind: 'pillar', x: 600, y: 590, w: 30, h: 30 },
    { kind: 'rug', x: 480, y: 430, w: 310, h: 200 },
    // Antechamber: cases, desk, statue.
    { kind: 'case', x: 920, y: 170, w: 74, h: 44 },
    { kind: 'case', x: 1090, y: 250, w: 74, h: 44 },
    { kind: 'statue', x: 1010, y: 150, w: 30, h: 30 },
    { kind: 'rug', x: 920, y: 190, w: 230, h: 130 },
    // Vault: gold bars, pedestal, vault door frame.
    { kind: 'goldbar', x: 900, y: 560, w: 60, h: 26 },
    { kind: 'goldbar', x: 1100, y: 560, w: 60, h: 26 },
    { kind: 'pedestal', x: 1015, y: 505, w: 52, h: 52 },
  ];
  // Props that block movement and sight.
  const solids = props.filter((p) => p.kind !== 'rug' && p.kind !== 'stairs');

  // Cool-indigo shadow cover: shaded alcoves tucked behind display cases,
  // pillars and the vault pedestal. Visual only — they mark where a
  // thief standing behind a prop is hard to spot.
  const shadowZones = [
    { x: 506, y: 214, w: 102, h: 30 },
    { x: 646, y: 294, w: 102, h: 30 },
    { x: 546, y: 354, w: 102, h: 20 },
    { x: 486, y: 500, w: 58, h: 26 },
    { x: 686, y: 500, w: 58, h: 26 },
    { x: 586, y: 620, w: 58, h: 26 },
    { x: 906, y: 214, w: 102, h: 30 },
    { x: 1076, y: 294, w: 102, h: 30 },
    { x: 1001, y: 557, w: 80, h: 28 },
  ];

  // Clear doorways: the gaps in the interior walls, marked on the floor
  // with a gilded threshold so every route reads at a glance.
  const doorways = [
    { x: 430, y: 280, w: 12, h: 60 },
    { x: 430, y: 490, w: 12, h: 50 },
    { x: 682, y: 380, w: 60, h: 12 },
    { x: 830, y: 320, w: 12, h: 60 },
  ];

  // Vent grates: metallic grates set in the walls, joined by faint dashed
  // blueprint duct lines that show the crawl route between rooms.
  const vents = [
    { x: 424, y: 286, w: 24, h: 48, horizontal: false },
    { x: 500, y: 374, w: 48, h: 24, horizontal: true },
    { x: 824, y: 326, w: 24, h: 48, horizontal: false },
  ];
  const ductPath = [
    [436, 310], [620, 310], [712, 310], [712, 386], [712, 440],
    [900, 440], [1000, 440], [1041, 480],
  ];

  const loot = [
    { id: 'painting', name: 'Gilded Portrait', value: LOOT_VALUES.painting, x: 533, y: 93, taken: false, radius: 26 },
    { id: 'gems', name: 'Sapphire Set', value: LOOT_VALUES.gems, x: 697, y: 272, taken: false, radius: 26 },
    { id: 'coins', name: 'Coin Hoard', value: LOOT_VALUES.coins, x: 615, y: 605, taken: false, radius: 26 },
    { id: 'dial', name: 'THE SUN DIAL', value: LOOT_VALUES.dial, x: 1041, y: 531, taken: false, radius: 30, vaultOnly: true },
  ];

  const terminals = [
    { id: 'cam-terminal', name: 'Camera terminal', x: 505, y: 640, hacked: false, hackProgress: 0, effect: 'cameras' },
    { id: 'vault-terminal', name: 'Vault terminal', x: 1190, y: 120, hacked: false, hackProgress: 0, effect: 'vault' },
  ];

  const guards = [
    {
      id: 'gallery-guard', name: 'Gallery guard', x: 600, y: 160, radius: 13, angle: 0,
      waypoints: [[600, 160], [770, 160], [770, 330], [500, 330], [500, 200]],
      waypointIndex: 1, speed: 62, pause: 0, alert: 0,
    },
    {
      id: 'laser-guard', name: 'Laser hall guard', x: 480, y: 640, radius: 13, angle: Math.PI,
      waypoints: [[480, 640], [790, 640], [790, 430], [480, 430]],
      waypointIndex: 1, speed: 58, pause: 0, alert: 0,
    },
    {
      id: 'vault-guard', name: 'Vault guard', x: 900, y: 120, radius: 13, angle: 0,
      waypoints: [[900, 120], [1180, 120], [1180, 330], [900, 330]],
      waypointIndex: 1, speed: 66, pause: 0, alert: 0,
    },
  ];

  const cameras = [
    { id: 'cam-gallery', x: 812, y: 100, baseAngle: Math.PI * 0.75, sweep: 0.7, phase: 0, angle: Math.PI * 0.75 },
    { id: 'cam-vault', x: 858, y: 100, baseAngle: Math.PI * 0.25, sweep: 0.7, phase: 1.6, angle: Math.PI * 0.25 },
  ];

  const lasers = [
    { id: 'laser-1', y: 462, x1: 470, x2: 800, phase: 0 },
    { id: 'laser-2', y: 534, x1: 470, x2: 800, phase: 0.4 },
    { id: 'laser-3', y: 606, x1: 470, x2: 800, phase: 0.8 },
  ];

  return {
    walls, rooms, props, solids, shadowZones, doorways, vents, ductPath, loot, terminals, guards, cameras, lasers,
    vaultDoor: { x: 980, y: 380, w: 100, h: 12, open: false },
    escape: { x: 62, y: 98, w: 84, h: 64 },
    entrance: { x: 110, y: 640 },
  };
}

export function circleHitsRect(cx, cy, radius, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < radius * radius;
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  // Slab test: does the segment cross the rectangle?
  let tmin = 0;
  let tmax = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const axes = [
    [dx, x1 - rect.x, x1 - (rect.x + rect.w)],
    [dy, y1 - rect.y, y1 - (rect.y + rect.h)],
  ];
  for (const [d, near, far] of axes) {
    if (Math.abs(d) < 1e-9) {
      if (near > 0 || far < 0) return false;
    } else {
      let t1 = -near / d;
      let t2 = -far / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }
  }
  return true;
}

export function lineOfSightBlocked(x1, y1, x2, y2, museum) {
  for (const wall of museum.walls) {
    if (segmentHitsRect(x1, y1, x2, y2, wall)) return true;
  }
  if (!museum.vaultDoor.open) {
    const d = museum.vaultDoor;
    if (segmentHitsRect(x1, y1, x2, y2, d)) return true;
  }
  for (const solid of museum.solids) {
    if (solid.kind === 'case' || solid.kind === 'pillar' || solid.kind === 'statue' || solid.kind === 'desk') {
      if (segmentHitsRect(x1, y1, x2, y2, solid)) return true;
    }
  }
  return false;
}

export function moveWithCollision(entity, dx, dy, museum) {
  const nextX = entity.x + dx;
  if (!collidesAt(nextX, entity.y, entity.radius, museum)) entity.x = nextX;
  const nextY = entity.y + dy;
  if (!collidesAt(entity.x, nextY, entity.radius, museum)) entity.y = nextY;
  entity.x = Math.max(FLOOR.x + entity.radius, Math.min(FLOOR.x + FLOOR.w - entity.radius, entity.x));
  entity.y = Math.max(FLOOR.y + entity.radius, Math.min(FLOOR.y + FLOOR.h - entity.radius, entity.y));
}

function collidesAt(x, y, radius, museum) {
  for (const wall of museum.walls) {
    if (circleHitsRect(x, y, radius, wall)) return true;
  }
  if (!museum.vaultDoor.open && circleHitsRect(x, y, radius, museum.vaultDoor)) return true;
  for (const solid of museum.solids) {
    if (circleHitsRect(x, y, radius, solid)) return true;
  }
  return false;
}

export function nearestInteractable(player, museum) {
  let best = null;
  let bestDistance = 46;
  for (const item of museum.loot) {
    if (item.taken) continue;
    if (item.vaultOnly && !museum.vaultDoor.open) continue;
    const d = Math.hypot(player.x - item.x, player.y - item.y);
    if (d < bestDistance) { bestDistance = d; best = { kind: 'loot', ref: item }; }
  }
  for (const terminal of museum.terminals) {
    if (terminal.hacked) continue;
    const d = Math.hypot(player.x - terminal.x, player.y - terminal.y);
    if (d < bestDistance) { bestDistance = d; best = { kind: 'terminal', ref: terminal }; }
  }
  const dial = museum.loot.find((item) => item.id === 'dial');
  if (dial && !dial.taken && museum.vaultDoor.open) {
    const d = Math.hypot(player.x - dial.x, player.y - dial.y);
    if (d < 52) best = { kind: 'dial', ref: dial };
  }
  return best;
}
