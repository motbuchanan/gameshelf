// Fair randomness for every game outcome. Never use Math.random() for outcomes.
// crypto.getRandomValues with rejection sampling removes modulo bias.
const buf = new Uint32Array(1);
const RANGE = 0x100000000; // 2^32

function u32() {
  globalThis.crypto.getRandomValues(buf);
  return buf[0];
}

// Uniform integer in [min, max], inclusive.
export function int(min, max) {
  const span = max - min + 1;
  if (span <= 0 || !Number.isInteger(span)) throw new Error('rng.int bad range ' + min + '..' + max);
  const limit = RANGE - (RANGE % span); // largest multiple of span below 2^32
  let x;
  do { x = u32(); } while (x >= limit);
  return min + (x % span);
}

// Uniform float in [0, 1) for cosmetic use (dice throw angles), still crypto-backed.
export function float() {
  return u32() / RANGE;
}

export function pick(arr) {
  return arr[int(0, arr.length - 1)];
}

export default { int, float, pick };
