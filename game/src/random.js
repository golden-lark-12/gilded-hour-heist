// Seeded random numbers. One job: deterministic jitter for particles and
// guard phase offsets, so staged screenshots reproduce exactly.

export function makeSeededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function nextRandom() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function pickSeeded(random, items) {
  return items[Math.floor(random() * items.length)];
}
