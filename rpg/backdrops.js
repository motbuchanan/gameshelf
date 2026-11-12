// Place backdrops for the story picture, the fight board's edge, the town hub and the hero page.
// Each place is drawn in code at 128x80 in the same chunky pixel style as the sprites, and each has something
// gently moving (t is a tick that goes up about 6 times a second). The bottom 30 rows are the ground where
// characters stand. No outside images.
const K = '#1a120c';
const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x | 0, y | 0, w | 0, h | 0); };
const hash = n => { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); return (n ^ (n >>> 15)) >>> 0; };
function bands(c, cols, y0 = 0, h = 50) { const s = h / cols.length; cols.forEach((col, i) => R(c, 0, y0 + i * s, 128, Math.ceil(s), col)); }
function speckle(c, y0, h, cols, n, seed = 1) { for (let i = 0; i < n; i++) { const v = hash(i * 31 + seed); R(c, v % 128, y0 + (v >>> 8) % h, 1, 1, cols[i % cols.length]); } }
// a jagged ridge of mountains/hills, filled down to y=bottom
function ridge(c, base, amp, step, col, seed, bottom = 80) {
  for (let x = 0; x < 128; x++) {
    const a = hash(Math.floor(x / step) + seed) % amp, b = hash(Math.floor(x / step) + 1 + seed) % amp, f = (x % step) / step;
    const y = base - (a + (b - a) * f);
    R(c, x, y, 1, bottom - y, col);
  }
}
function peak(c, cx, top, w, col, snow) {
  for (let y = top; y < 60; y++) { const half = ((y - top) / (60 - top)) * w; R(c, cx - half, y, half * 2, 1, col); if (snow && y < top + 7) R(c, cx - half, y, half * 2, 1, snow); }
}
function tree(c, x, y, leaf, dark, trunk = '#6b4226') {
  R(c, x + 6, y + 10, 4, 12, K); R(c, x + 7, y + 10, 2, 12, trunk);
  R(c, x, y, 16, 14, K); R(c, x + 1, y + 1, 14, 12, leaf); R(c, x + 3, y + 3, 4, 3, dark);
}
function pine(c, x, y, col, snow) {
  R(c, x + 4, y + 14, 2, 4, '#5a3a20');
  for (let i = 0; i < 4; i++) { R(c, x + 4 - i, y + i * 4 - 1, 2 + i * 2, 4, K); R(c, x + 5 - i, y + i * 4, i * 2, 3, col); if (snow) R(c, x + 5 - i, y + i * 4, Math.max(1, i), 1, snow); }
}
function house(c, x, y, wall, roof, lit) {
  R(c, x - 1, y + 5, 20, 15, K); R(c, x, y + 6, 18, 13, wall);
  for (let i = 0; i < 7; i++) R(c, x - 2 + i, y + 5 - i, 22 - i * 2, 1, i === 6 ? K : roof);
  R(c, x + 3, y + 9, 4, 4, lit ? '#f0d070' : '#3a4a6a'); R(c, x + 11, y + 12, 4, 7, '#5a3a20');
}
function gear(c, cx, cy, r, col, t, dark) {
  for (let k = 0; k < 8; k++) { const a = t * 0.15 + k * Math.PI / 4; R(c, cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 3, 3, col); }
  for (let y = -r + 1; y < r; y++) { const w = Math.floor(Math.sqrt((r - 1) * (r - 1) - y * y)); R(c, cx - w, cy + y, w * 2, 1, col); }
  R(c, cx - 1, cy - 1, 3, 3, dark || K);
}
function ground(c, top, base, spk) { R(c, 0, top, 128, 80 - top, base); R(c, 0, top, 128, 1, K); speckle(c, top + 2, 80 - top - 2, spk, 70, top); }
// little falling things: leaves, snow, sparkles
function fall(c, t, n, col, speed, drift, seed, y0 = 0, y1 = 80) {
  for (let i = 0; i < n; i++) {
    const v = hash(i * 97 + seed), x = (v % 128 + Math.sin((t + i * 7) * 0.2) * drift + 128) % 128;
    const y = y0 + ((v >>> 8) % (y1 - y0) + t * speed) % (y1 - y0);
    R(c, x, y, 1, 1, col[i % col.length]);
  }
}

const PLACES = {
  woods(c, t) {
    bands(c, ['#8ac8e8', '#a2d6ee', '#bfe2f0'], 0, 22);
    R(c, 104, 4, 8, 8, '#fff2b0'); R(c, 105, 5, 6, 6, '#ffe070');
    R(c, 0, 18, 128, 32, '#2d5a3a');
    for (let x = -6; x < 128; x += 18) tree(c, x, 12 + ((x * 7) & 7), '#245a26', '#3a7a34');
    ground(c, 46, '#4f8a3c', ['#5f9a48', '#437a33']);
    fall(c, t, 6, ['#d88a2a', '#e8b040', '#a8601e'], 0.6, 3, 5, 10, 78);
  },
  woodsnight(c, t) {
    bands(c, ['#101830', '#18223e', '#202c4a'], 0, 22);
    speckle(c, 0, 16, ['#ffffff', '#c8d4ff'], 14, 3);
    R(c, 101, 3, 6, 10, '#e8ecf8'); R(c, 99, 5, 10, 6, '#e8ecf8'); R(c, 100, 4, 8, 8, '#e8ecf8'); R(c, 102, 6, 2, 2, '#c8cce0'); R(c, 105, 9, 2, 1, '#c8cce0');
    R(c, 0, 18, 128, 32, '#13281c');
    for (let x = -6; x < 128; x += 18) tree(c, x, 12 + ((x * 7) & 7), '#173a1c', '#20502a', '#3a2818');
    ground(c, 46, '#2a4a24', ['#345a2c', '#1e3a1a']);
    for (let i = 0; i < 7; i++) { const v = hash(i + 40); if ((t + i * 3) % 10 < 6) R(c, (v % 120 + Math.sin((t + i) * 0.3) * 4 + 128) % 128, 22 + (v >>> 8) % 40 + Math.sin((t + i * 5) * 0.25) * 2, 1, 1, '#e8f070'); }
  },
  millbrook(c, t) {
    bands(c, ['#8ac8e8', '#a2d6ee', '#c4e6f2'], 0, 30);
    ridge(c, 34, 6, 16, '#6aa860', 11);
    house(c, 6, 22, '#d8c4a0', '#a84a3a', false); house(c, 40, 24, '#e0d0b0', '#3a6aa8', false); house(c, 92, 22, '#d0b890', '#7a5aa0', false);
    // windmill with turning blades
    R(c, 70, 14, 10, 30, K); R(c, 71, 15, 8, 29, '#e8dcc0');
    for (let k = 0; k < 4; k++) { const a = t * 0.08 + k * Math.PI / 2; for (let r = 2; r < 12; r++) R(c, 75 + Math.cos(a) * r, 16 + Math.sin(a) * r, 2, 2, r % 3 ? '#8a6a4a' : '#f0e8d8'); }
    R(c, 74, 15, 3, 3, K);
    // chimney smoke
    R(c, 14, 18, 3, 6, '#7a4a3a');
    for (let i = 0; i < 4; i++) { const y = 16 - ((t * 0.5 + i * 5) % 18); R(c, 15 + Math.sin((t + i * 4) * 0.2) * 2 - i * 0.3, y, 3, 2, i % 2 ? '#e8e8e8' : '#d0d0d0'); }
    ground(c, 46, '#6a9a50', ['#7aaa5a', '#5a8a44']);
    R(c, 0, 58, 128, 8, '#b8a888'); speckle(c, 58, 8, ['#a89878', '#c8b898'], 30, 9);
  },
  creek(c, t) {
    bands(c, ['#8ac8e8', '#a8d8ee'], 0, 18);
    R(c, 0, 14, 128, 24, '#2d5a3a');
    for (let x = -4; x < 128; x += 20) tree(c, x, 10 + ((x * 5) & 7), '#2a6a2c', '#3a8a3c');
    ground(c, 34, '#5a9a44', ['#6aaa50', '#4a8a3a']);
    R(c, 0, 44, 128, 12, '#3a7ac0'); R(c, 0, 44, 128, 1, '#2a5a90'); R(c, 0, 55, 128, 1, '#2a5a90');
    for (let i = 0; i < 10; i++) { const v = hash(i + 70); if ((t + i * 2) % 6 < 3) R(c, (v % 128 + t) % 128, 45 + (v >>> 8) % 9, 3, 1, '#b8e0ff'); }
    for (const x of [18, 60, 102]) { R(c, x, 48, 6, 4, '#8a8a8a'); R(c, x + 1, 48, 3, 1, '#b0b0b0'); }
  },
  riverbend(c, t) {
    bands(c, ['#9ac8e0', '#b6dcec'], 0, 22);
    house(c, 4, 6, '#d8c8a8', '#a85a3a', false); house(c, 30, 4, '#e0d4b8', '#5a7a3a', false); house(c, 96, 6, '#d0c0a0', '#6a4a8a', false);
    R(c, 0, 26, 128, 6, '#6aa860');
    R(c, 0, 32, 128, 16, '#3a7ac0');
    for (let i = 0; i < 12; i++) { const v = hash(i + 90); R(c, (v % 128 + t * 0.7) % 128, 33 + (v >>> 8) % 14, 4, 1, '#8ac0f0'); }
    // the stone bridge
    R(c, 50, 26, 32, 8, K); R(c, 51, 27, 30, 6, '#a89880'); R(c, 58, 31, 16, 6, '#3a7ac0'); R(c, 57, 30, 18, 1, K);
    ground(c, 48, '#5a9a44', ['#6aaa50', '#4a8a3a']);
  },
  thornwood(c, t) {
    bands(c, ['#5a5068', '#6a6078', '#7a7088'], 0, 26);
    R(c, 0, 22, 128, 28, '#3a3044');
    for (let x = -2; x < 128; x += 14) {
      const h = 10 + (hash(x) % 10);
      R(c, x + 5, 46 - h - 10, 3, h + 10, '#2a2030');
      for (let k = 0; k < 4; k++) { const L = k % 2, y = 40 - h + k * 5; for (let s = 0; s < 4; s++) R(c, x + (L ? 8 + s : 4 - s), y - s, 1, 1, '#2a2030'); R(c, x + (L ? 12 : 0), y - 4, 1, 1, '#a04060'); }
    }
    ground(c, 46, '#4a4038', ['#5a4e44', '#3a3028']);
    for (let i = 0; i < 2; i++) { const x = (t * (1.2 + i * 0.5) + i * 60) % 150 - 10, y = 8 + i * 6 + Math.sin(t * 0.4 + i) * 2, up = (t + i) % 4 < 2; R(c, x, y, 3, 1, K); R(c, x - 2, y - (up ? 1 : -1), 2, 1, K); R(c, x + 3, y - (up ? 1 : -1), 2, 1, K); }
  },
  tower(c, t) {
    bands(c, ['#e8a070', '#d8806a', '#a86070', '#704a6a'], 0, 46);
    R(c, 96, 6, 6, 6, '#ffd8a0');
    ridge(c, 44, 6, 20, '#3a4a3a', 21);
    // Bramble's tower, with a glowing window and vines
    R(c, 44, 4, 26, 44, K); R(c, 45, 5, 24, 43, '#6a6070');
    for (let y = 8; y < 46; y += 5) for (let x = 46 + ((y / 5) % 2) * 3; x < 68; x += 6) R(c, x, y, 4, 1, '#5a5060');
    for (let i = 0; i < 6; i++) R(c, 41 + i * 6, 2 - (i % 2), 4, 4, K);
    R(c, 53, 14, 8, 10, K); R(c, 54, 15, 6, 8, (t % 12) < 9 ? '#f0d070' : '#e0b850');
    for (let y = 20; y < 48; y += 2) R(c, 46 + Math.sin(y * 0.6) * 1.5, y, 2, 1, '#3a7a34');
    ground(c, 48, '#4a6a3a', ['#5a7a44', '#3a5a30']);
  },
  gearwick(c, t) {
    bands(c, ['#a8b8c8', '#bcc8d4'], 0, 26);
    // the clock tower in the middle
    R(c, 54, 0, 20, 46, K); R(c, 55, 1, 18, 45, '#8a6a5a');
    R(c, 57, 6, 14, 14, K); R(c, 58, 7, 12, 12, '#f0e8d0');
    const a = t * 0.05; R(c, 64, 13, 1, 1, K); for (let r = 0; r < 5; r++) R(c, 64 + Math.cos(a) * r, 13 + Math.sin(a) * r, 1, 1, K); for (let r = 0; r < 3; r++) R(c, 64 + Math.cos(a / 12) * r, 13 + Math.sin(a / 12) * r, 1, 1, '#a83a2a');
    for (const [x, w, col] of [[0, 22, '#9a5a4a'], [22, 30, '#7a6a8a'], [76, 26, '#8a5a4a'], [102, 26, '#6a7a8a']]) {
      R(c, x, 20, w, 26, K); R(c, x + 1, 21, w - 2, 25, col);
      for (let wy = 24; wy < 42; wy += 8) for (let wx = x + 3; wx < x + w - 4; wx += 7) R(c, wx, wy, 3, 4, '#f0d070');
    }
    gear(c, 20, 14, 5, '#c8a040', t); gear(c, 108, 12, 6, '#a88a3a', -t);
    ground(c, 46, '#8a8478', ['#9a9488', '#7a7468']);
    for (let x = 0; x < 128; x += 8) R(c, x, 52 + (x % 16 ? 0 : 4), 6, 1, '#6a6458');
  },
  clocktower(c, t) {
    R(c, 0, 0, 128, 80, '#3a2e2a');
    for (let y = 0; y < 48; y += 6) for (let x = (y / 6) % 2 * 6; x < 128; x += 12) R(c, x, y, 10, 1, '#2a2020');
    gear(c, 24, 18, 14, '#a88a3a', t, '#5a4a2a'); gear(c, 50, 30, 8, '#c8a040', -t * 1.7, '#5a4a2a'); gear(c, 104, 16, 12, '#b89a48', -t * 1.1, '#5a4a2a');
    // swinging pendulum
    const sw = Math.sin(t * 0.25) * 8;
    for (let r = 0; r < 26; r++) R(c, 78 + sw * r / 26, 4 + r, 1, 1, '#d8c070');
    R(c, 75 + sw, 29, 7, 7, K); R(c, 76 + sw, 30, 5, 5, '#e8c84a');
    ground(c, 48, '#6a4a32', ['#7a5a3a', '#5a3a28']);
    for (let x = 0; x < 128; x += 16) R(c, x, 49, 1, 31, '#4a3020');
  },
  workshop(c, t) {
    R(c, 0, 0, 128, 80, '#4a3a30');
    for (let x = 0; x < 128; x += 10) R(c, x, 0, 1, 48, '#3a2a22');
    // shelves of toys
    for (const y of [10, 26]) { R(c, 4, y + 8, 50, 2, '#7a5a3a'); for (let i = 0; i < 6; i++) { const v = hash(i + y); R(c, 6 + i * 8, y + 2, 6, 6, ['#c8a040', '#a83a2a', '#3a7ac0', '#7ac04a'][v % 4]); R(c, 7 + i * 8, y + 3, 2, 2, '#fff2c0'); } }
    // the big workbench with a lamp
    R(c, 70, 34, 54, 4, K); R(c, 71, 34, 52, 3, '#8a6a4a');
    R(c, 100, 14, 2, 20, '#5a4a3a'); R(c, 94, 12, 14, 4, '#c8a040');
    const glow = (t % 10) < 8; R(c, 96, 16, 10, 2, glow ? '#fff2b0' : '#f0d070');
    gear(c, 80, 26, 6, '#c8a040', t); gear(c, 88, 30, 3, '#a88a3a', -t * 2);
    if (t % 7 < 2) { R(c, 84, 22, 1, 1, '#fff2b0'); R(c, 86, 20, 1, 1, '#ffe070'); }
    ground(c, 48, '#6a4a32', ['#7a5a3a', '#5a3a28']);
  },
  frostpine(c, t) {
    bands(c, ['#b8d0e8', '#ccdcee', '#dfe8f2'], 0, 30);
    peak(c, 30, 4, 30, '#8a9cb0', '#ffffff'); peak(c, 92, 0, 36, '#7a8ca0', '#ffffff'); peak(c, 62, 12, 22, '#9aaabc', '#ffffff');
    ridge(c, 44, 5, 12, '#c8d8e8', 31);
    for (let x = -2; x < 128; x += 15) pine(c, x, 26 + (hash(x) % 6), '#2a5a3a', '#ffffff');
    ground(c, 46, '#dfe8f2', ['#c4d2e2', '#ffffff']);
    fall(c, t, 22, ['#ffffff', '#e8f0ff'], 0.8, 3, 17);
  },
  caves(c, t) {
    R(c, 0, 0, 128, 80, '#2a2428');
    for (let i = 0; i < 18; i++) { const v = hash(i + 120); R(c, v % 128, (v >>> 8) % 46, 6 + v % 8, 3, '#3a3238'); }
    for (let x = 4; x < 128; x += 14) { const h = 4 + hash(x) % 8; for (let y = 0; y < h; y++) R(c, x + y / 2, y, 6 - y / 2 * 1.2, 1, '#1a1418'); }
    // the sunbeam from a hole in the roof
    c.globalAlpha = 0.35 + 0.08 * Math.sin(t * 0.2);
    for (let y = 0; y < 80; y++) R(c, 74 - y * 0.25, y, 14 + y * 0.4, 1, '#f0d878');
    c.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { const v = hash(i + 150); if ((t + i * 4) % 14 < 3) R(c, v % 128, 30 + (v >>> 8) % 16, 1, 1, '#a8e0ff'); else R(c, v % 128, 30 + (v >>> 8) % 16, 1, 1, '#5a6a8a'); }
    ground(c, 48, '#4a4248', ['#5a525a', '#3a3238']);
    fall(c, t, 5, ['#fff0b0'], 0.3, 2, 33, 4, 60);
  },
  starpeak(c, t) {
    bands(c, ['#101838', '#18224a', '#22305a', '#3a4a7a'], 0, 46);
    for (let i = 0; i < 26; i++) { const v = hash(i + 200); if ((t + i * 3) % 16 !== 0) R(c, v % 128, (v >>> 8) % 36, 1, 1, i % 5 ? '#ffffff' : '#ffe27a'); }
    peak(c, 18, 30, 16, '#5a6a90', '#dfe8f2'); peak(c, 110, 26, 20, '#4a5a80', '#dfe8f2');
    for (let i = 0; i < 3; i++) { const x = (t * (0.3 + i * 0.15) + i * 50) % 170 - 30, y = 36 + i * 4; R(c, x, y, 26, 3, '#7a88b0'); R(c, x + 4, y - 2, 14, 2, '#8a98c0'); }
    ridge(c, 50, 4, 16, '#c8d4e8', 41);
    ground(c, 50, '#dfe8f2', ['#c4d2e2', '#ffffff']);
  },
};
// which place a chapter happens in (a scene can say place: 'millbrook' to change it)
export const CHAPTER_PLACE = {
  ch0: 'woods', ch1: 'woods', ch2: 'woods', ch3: 'woods', ch4: 'woods', ch5: 'woodsnight', ch6: 'millbrook', ch7: 'creek', ch8: 'riverbend',
  ch9: 'thornwood', ch10: 'tower', ch11: 'woods', ch12: 'gearwick', ch13: 'clocktower', ch14: 'workshop', ch15: 'workshop',
  ch16: 'millbrook', ch17: 'frostpine', ch18: 'caves', ch19: 'frostpine', ch20: 'starpeak',
};
export const PLACE_NAME = {
  woods: 'Whisper Woods', woodsnight: 'Whisper Woods at night', millbrook: 'Millbrook', creek: 'Silver Creek', riverbend: 'Riverbend', thornwood: 'The Thornwood',
  tower: 'Bramble\'s tower', gearwick: 'Gearwick', clocktower: 'Inside the clock tower', workshop: 'Wren\'s workshop', frostpine: 'The Frostpine Pass',
  caves: 'Deep underground', starpeak: 'Starpeak',
};
export const PLACE_IDS = Object.keys(PLACES);
export function drawPlace(c, id, t = 0) {
  const f = PLACES[id] || PLACES.woods;
  c.save(); f(c, Math.floor(t)); c.restore();
}
// A still picture of a place, as a data URL, for CSS backgrounds (fight board edge, hub, hero page). Cached.
const urls = {};
export function placeURL(id, dim = 0) {
  const key = id + ':' + dim;
  if (urls[key]) return urls[key];
  try {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 80;
    const c = cv.getContext('2d'); drawPlace(c, id, 3);
    if (dim) { c.fillStyle = `rgba(10,8,6,${dim})`; c.fillRect(0, 0, 128, 80); }
    urls[key] = cv.toDataURL();
  } catch (e) { urls[key] = ''; }
  return urls[key];
}
// A small tile of a place's ground (grass, cobbles, snow, cave floor), dimmed, to repeat around the fight board.
export function groundURL(id, dim = 0.35) {
  const key = 'g:' + id + ':' + dim;
  if (urls[key]) return urls[key];
  try {
    const big = document.createElement('canvas'); big.width = 128; big.height = 80; drawPlace(big.getContext('2d'), id, 3);
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 14;
    const c = cv.getContext('2d'); c.drawImage(big, 40, 66, 32, 14, 0, 0, 32, 14);
    c.fillStyle = `rgba(10,8,6,${dim})`; c.fillRect(0, 0, 32, 14);
    urls[key] = cv.toDataURL();
  } catch (e) { urls[key] = ''; }
  return urls[key];
}
export default { drawPlace, placeURL, groundURL, CHAPTER_PLACE, PLACE_NAME, PLACE_IDS };
