// All drawing. One job: paint the floorplan, actors, cones, lasers, vault,
// lighting and HUD from game state, with nothing else deciding layout.

import { PALETTE, FLOOR, HUD_H, VIEW_W, VIEW_H } from './config.js';

export function drawFloor(ctx, museum) {
  ctx.fillStyle = '#171310';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h);
  // Midnight-slate architectural stone: alternating slabs with a
  // deterministic fleck, so the floor reads as cut stone, not mud.
  const tile = 44;
  for (let y = FLOOR.y; y < FLOOR.y + FLOOR.h; y += tile) {
    for (let x = FLOOR.x; x < FLOOR.x + FLOOR.w; x += tile) {
      const col = (x - FLOOR.x) / tile;
      const row = (y - FLOOR.y) / tile;
      if ((col + row) % 2 === 0) {
        ctx.fillStyle = PALETTE.floorB;
        ctx.fillRect(x, y, tile, tile);
      }
      if ((col * 7 + row * 11) % 9 === 0) {
        ctx.fillStyle = PALETTE.stoneFleck;
        ctx.fillRect(x + 10, y + 12, 20, 3);
        ctx.fillRect(x + 26, y + 28, 12, 3);
      }
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
  // Gilded trim just inside the floor's edge: light/dark separation.
  ctx.strokeStyle = PALETTE.goldDim;
  ctx.lineWidth = 2;
  ctx.strokeRect(FLOOR.x + 2, FLOOR.y + 2, FLOOR.w - 4, FLOOR.h - 4);
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
  drawShadowCover(ctx, museum);
  drawDuctLines(ctx, museum);
  drawDoorways(ctx, museum);
  for (const room of museum.rooms) {
    ctx.font = '600 13px Georgia, serif';
    const width = ctx.measureText(room.name).width;
    ctx.fillStyle = 'rgba(10,12,20,0.72)';
    ctx.fillRect(room.labelX - 8, room.labelY - 4, width + 16, 22);
    ctx.strokeStyle = 'rgba(201,162,75,0.65)';
    ctx.lineWidth = 1;
    ctx.strokeRect(room.labelX - 8, room.labelY - 4, width + 16, 22);
    ctx.fillStyle = 'rgba(244,234,210,0.92)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(room.name, room.labelX, room.labelY);
  }
}

export function drawShadowCover(ctx, museum) {
  for (const zone of museum.shadowZones || []) {
    ctx.fillStyle = PALETTE.shadowCover;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.strokeStyle = PALETTE.shadowCoverEdge;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(zone.x + 1, zone.y + 1, zone.w - 2, zone.h - 2);
    ctx.setLineDash([]);
  }
}

export function drawDuctLines(ctx, museum) {
  const path = museum.ductPath || [];
  if (path.length < 2) return;
  ctx.strokeStyle = PALETTE.ductLine;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(path[0][0], path[0][1]);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i][0], path[i][1]);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawDoorways(ctx, museum) {
  for (const door of museum.doorways || []) {
    ctx.fillStyle = 'rgba(201,162,75,0.28)';
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    if (door.w > door.h) {
      ctx.beginPath(); ctx.moveTo(door.x, door.y + door.h / 2); ctx.lineTo(door.x + door.w, door.y + door.h / 2); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(door.x + door.w / 2, door.y); ctx.lineTo(door.x + door.w / 2, door.y + door.h); ctx.stroke();
    }
  }
}

export function drawVents(ctx, museum) {
  for (const vent of museum.vents || []) {
    ctx.fillStyle = PALETTE.ventDark;
    ctx.fillRect(vent.x, vent.y, vent.w, vent.h);
    ctx.strokeStyle = PALETTE.ventMetal;
    ctx.lineWidth = 2;
    ctx.strokeRect(vent.x, vent.y, vent.w, vent.h);
    ctx.strokeStyle = 'rgba(220,228,240,0.75)';
    ctx.lineWidth = 2;
    const slats = vent.horizontal ? 4 : 3;
    for (let i = 1; i <= slats; i++) {
      if (vent.horizontal) {
        const sx = vent.x + (vent.w * i) / (slats + 1);
        ctx.beginPath(); ctx.moveTo(sx, vent.y + 4); ctx.lineTo(sx, vent.y + vent.h - 4); ctx.stroke();
      } else {
        const sy = vent.y + (vent.h * i) / (slats + 1);
        ctx.beginPath(); ctx.moveTo(vent.x + 4, sy); ctx.lineTo(vent.x + vent.w - 4, sy); ctx.stroke();
      }
    }
    ctx.fillStyle = PALETTE.gold;
    for (const [rx, ry] of [[vent.x + 3, vent.y + 3], [vent.x + vent.w - 5, vent.y + 3], [vent.x + 3, vent.y + vent.h - 5], [vent.x + vent.w - 5, vent.y + vent.h - 5]]) {
      ctx.fillRect(rx, ry, 2, 2);
    }
  }
}

export function drawPatrolPaths(ctx, museum) {
  for (const guard of museum.guards) {
    ctx.strokeStyle = PALETTE.patrolDot;
    ctx.lineWidth = 2;
    ctx.setLineDash([1, 9]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    const points = guard.waypoints;
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineCap = 'butt';
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
    // High-contrast bevel: a gilded top edge and a pale bevel line, so
    // walls read as raised stone against the midnight floor.
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, 3);
    ctx.fillStyle = PALETTE.wallBevel;
    if (wall.w >= wall.h) ctx.fillRect(wall.x, wall.y + 3, wall.w, 2);
    else ctx.fillRect(wall.x + 3, wall.y, 2, wall.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.w - 1, wall.h - 1);
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

export function drawVisionCone(ctx, x, y, angle, range, halfAngle, fill, occluders, edge) {
  const steps = 30;
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const a = angle - halfAngle + (2 * halfAngle * i) / steps;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let reach = range;
    for (const rect of occluders || []) {
      const hit = rayRectDistance(x, y, dx, dy, rect);
      if (hit < reach) reach = Math.max(0, hit);
    }
    points.push([x + dx * reach, y + dy * reach, a, reach]);
  }
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (const [px, py] of points) ctx.lineTo(px, py);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  // Clean outer edge rays and a crisp arc, so the cone's reach is exact.
  if (edge) {
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(points[0][0], points[0][1]);
    ctx.moveTo(x, y);
    ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
  }
}

export function drawGuard(ctx, guard, chasing) {
  ctx.save();
  ctx.translate(guard.x, guard.y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(2, 5, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(guard.angle);
  // Shoulders: a broad top-down torso, wider than it is long.
  ctx.fillStyle = chasing ? '#7a2a24' : PALETTE.guard;
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = chasing ? '#93352c' : '#4a6a94';
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
  // Shoulder pads, left and right of the facing axis.
  ctx.fillStyle = PALETTE.guardTrim;
  ctx.fillRect(-13, -11, 7, 5);
  ctx.fillRect(-13, 6, 7, 5);
  // Cap: crown behind the face, brim pointing where the guard looks.
  ctx.fillStyle = '#1d2733';
  ctx.beginPath(); ctx.arc(2, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#243447';
  ctx.fillRect(7, -6, 8, 12);
  ctx.fillStyle = PALETTE.guardTrim;
  ctx.fillRect(7, -6, 8, 2);
  ctx.fillRect(7, 4, 8, 2);
  // Flashlight origin: a bright lens at the front of the cap.
  ctx.fillStyle = '#fff8d6';
  ctx.beginPath(); ctx.arc(16, 0, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8eef4';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 14, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  if (guard.alert > 1) {
    const mark = guard.alert > 60 ? '!' : '?';
    ctx.fillStyle = 'rgba(10,10,14,0.85)';
    ctx.beginPath(); ctx.arc(guard.x, guard.y - 24, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = guard.alert > 60 ? '#ff6a55' : PALETTE.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(guard.x, guard.y - 24, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = guard.alert > 60 ? '#ff6a55' : PALETTE.gold;
    ctx.font = '700 13px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mark, guard.x, guard.y - 23);
  }
}

export function drawCamera(ctx, camera, disabled, time) {
  const tickTime = time || 0;
  // Wall bracket behind the turret.
  ctx.fillStyle = '#22201c';
  ctx.fillRect(camera.x - 6, camera.y - 6, 12, 12);
  ctx.strokeStyle = '#8a94a6';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(camera.x - 6, camera.y - 6, 12, 12);
  // Sweep-arc tick marks: the arc the camera sweeps through.
  ctx.strokeStyle = disabled ? 'rgba(140,140,140,0.35)' : 'rgba(255,106,85,0.55)';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    const a = camera.baseAngle + (i / 2) * camera.sweep;
    ctx.beginPath();
    ctx.moveTo(camera.x + Math.cos(a) * 30, camera.y + Math.sin(a) * 30);
    ctx.lineTo(camera.x + Math.cos(a) * 36, camera.y + Math.sin(a) * 36);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.rotate(camera.angle);
  // Angled turret body, clearly larger than a dot.
  ctx.fillStyle = disabled ? '#55504a' : '#3a3f46';
  ctx.beginPath();
  ctx.moveTo(-6, -8);
  ctx.lineTo(22, -7);
  ctx.lineTo(27, 0);
  ctx.lineTo(22, 7);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c8ccd4';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Lens at the front, with a glint.
  ctx.fillStyle = disabled ? '#333' : '#ff3b30';
  ctx.beginPath(); ctx.arc(24, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(25, -2, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Blinking LED on the bracket: on when the camera is live.
  const ledOn = !disabled && Math.sin(tickTime * 4 + camera.phase) > -0.2;
  ctx.fillStyle = disabled ? '#44403a' : ledOn ? '#ff5a4e' : '#7a1d18';
  ctx.beginPath(); ctx.arc(camera.x - 6, camera.y - 6, 3, 0, Math.PI * 2); ctx.fill();
}

export function drawLasers(ctx, museum, laserOn, time) {
  for (const laser of museum.lasers) {
    const on = laserOn(laser, time);
    // Bright beam: a wide soft glow under a crisp hot core.
    ctx.strokeStyle = on ? 'rgba(255,59,48,0.30)' : 'rgba(122,29,24,0.25)';
    ctx.lineWidth = on ? 9 : 3;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(laser.x1, laser.y); ctx.lineTo(laser.x2, laser.y); ctx.stroke();
    ctx.strokeStyle = on ? PALETTE.laser : PALETTE.laserDim;
    ctx.lineWidth = on ? 3 : 1;
    ctx.setLineDash(on ? [] : [6, 6]);
    ctx.beginPath(); ctx.moveTo(laser.x1, laser.y); ctx.lineTo(laser.x2, laser.y); ctx.stroke();
    ctx.setLineDash([]);
    for (const x of [laser.x1, laser.x2]) {
      // Glowing emitter node.
      const glow = ctx.createRadialGradient(x, laser.y, 2, x, laser.y, 16);
      glow.addColorStop(0, on ? 'rgba(255,106,85,0.55)' : 'rgba(122,58,54,0.25)');
      glow.addColorStop(1, 'rgba(255,106,85,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x, laser.y, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a3f46';
      ctx.fillRect(x - 6, laser.y - 9, 12, 18);
      ctx.strokeStyle = '#c8ccd4';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 6, laser.y - 9, 12, 18);
      ctx.fillStyle = on ? '#ff6a55' : '#7a3a36';
      ctx.beginPath(); ctx.arc(x, laser.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(x + 1, laser.y - 1, 1.4, 0, Math.PI * 2); ctx.fill();
    }
  }
}

export function drawThief(ctx, player, lanternOn) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(2, 5, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(player.angle);
  // Cloak: a dark hooded silhouette, broad at the shoulders, tapering back.
  // The full gold outline is what defines the shape on any floor.
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.quadraticCurveTo(6, -15, -10, -11);
  ctx.quadraticCurveTo(-15, 0, -10, 11);
  ctx.quadraticCurveTo(6, 15, 16, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Hooded head with a masked face: dark hood, pale mask slit.
  ctx.fillStyle = '#22314f';
  ctx.beginPath(); ctx.arc(7, 0, 8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(7, 0, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#f4ead2';
  ctx.fillRect(9, -4, 6, 8);
  ctx.fillStyle = '#22314f';
  ctx.fillRect(11, -2, 4, 1.6);
  ctx.fillRect(11, 1, 4, 1.6);
  // Lantern dot at the thief's hand, ahead of the hood.
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath(); ctx.arc(17, 7, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff8d6';
  ctx.beginPath(); ctx.arc(17, 7, 1.4, 0, Math.PI * 2); ctx.fill();
  // Facing chevron just ahead of the hood.
  ctx.fillStyle = PALETTE.thiefTrim;
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(17, -4);
  ctx.lineTo(17, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Warm lantern glow ring around the thief, so the hero never gets lost.
  const ring = ctx.createRadialGradient(player.x, player.y, 14, player.x, player.y, 26);
  ring.addColorStop(0, 'rgba(255,214,106,0.55)');
  ring.addColorStop(0.6, 'rgba(255,214,106,0.18)');
  ring.addColorStop(1, 'rgba(255,214,106,0)');
  ctx.fillStyle = ring;
  ctx.beginPath(); ctx.arc(player.x, player.y, 26, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,106,0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(player.x, player.y, 20, 0, Math.PI * 2); ctx.stroke();
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
    if (item.id === 'dial') {
      // Radiant gilded sunburst pedestal + golden halo for the $5,000 dial.
      const halo = ctx.createRadialGradient(item.x, item.y, 4, item.x, item.y, 62);
      halo.addColorStop(0, `rgba(255,215,106,${0.55 * pulse})`);
      halo.addColorStop(1, 'rgba(255,215,106,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(item.x, item.y, 62, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.strokeStyle = `rgba(255,215,106,${0.5 + 0.3 * pulse})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + time * 0.25;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
        ctx.lineTo(Math.cos(a) * 34, Math.sin(a) * 34);
        ctx.stroke();
      }
      ctx.fillStyle = '#3a332a';
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
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
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(-1, -1, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else {
      const glow = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, 34);
      glow.addColorStop(0, `rgba(255,215,106,${0.5 * pulse})`);
      glow.addColorStop(1, 'rgba(255,215,106,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(item.x, item.y, 34, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.translate(item.x, item.y);
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
      ctx.restore();
    }
    drawPriceTag(ctx, item);
  }
}

export function drawPriceTag(ctx, item) {
  const label = `$${item.value.toLocaleString('en-US')}`;
  ctx.font = '700 11px Verdana, sans-serif';
  const width = ctx.measureText(label).width + 14;
  const tagX = item.x - width / 2;
  const tagY = item.y + 24;
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(tagX, tagY, width, 17);
  ctx.strokeStyle = '#7a5c14';
  ctx.lineWidth = 1;
  ctx.strokeRect(tagX, tagY, width, 17);
  ctx.fillStyle = '#171310';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, item.x, tagY + 9);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
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

// The darkness layer is composited offscreen: cutting light pools out of
// it on the main canvas would erase the thief, loot and cones standing
// in the light. Offscreen, only the darkness is cut, never the scene.
let lightLayer = null;

export function renderLighting(ctx, player, lanternOn, vaultOpen) {
  if (!lightLayer) {
    lightLayer = document.createElement('canvas');
    lightLayer.width = VIEW_W;
    lightLayer.height = VIEW_H;
  }
  const layer = lightLayer.getContext('2d');
  layer.clearRect(0, 0, VIEW_W, VIEW_H);
  layer.globalCompositeOperation = 'source-over';
  layer.fillStyle = 'rgba(8,6,10,0.28)';
  layer.fillRect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h);
  layer.globalCompositeOperation = 'destination-out';
  const cut = (x, y, radius, strength) => {
    const glow = layer.createRadialGradient(x, y, 4, x, y, radius);
    glow.addColorStop(0, `rgba(0,0,0,${strength})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    layer.fillStyle = glow;
    layer.beginPath(); layer.arc(x, y, radius, 0, Math.PI * 2); layer.fill();
  };
  cut(player.x, player.y, lanternOn ? 190 : 120, 0.85);
  cut(1041, 531, vaultOpen ? 210 : 120, 0.7);
  cut(116, 640, 110, 0.5);
  layer.globalCompositeOperation = 'source-over';
  ctx.drawImage(lightLayer, 0, 0);
}

export function drawSmoke(ctx, smokes) {
  for (const smoke of smokes) {
    ctx.fillStyle = 'rgba(190,190,195,0.30)';
    ctx.beginPath(); ctx.arc(smoke.x, smoke.y, smoke.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(220,220,225,0.22)';
    ctx.beginPath(); ctx.arc(smoke.x - 14, smoke.y - 8, smoke.radius * 0.6, 0, Math.PI * 2); ctx.fill();
  }
}
