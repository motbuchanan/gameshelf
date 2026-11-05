// Pixel paper-doll renderer. Every character is drawn in code, layer by layer,
// onto a 32x40 grid of materials. Then one pass shades every material with a
// 3-tone ramp (light from the top-left) and wraps the whole figure in an outline.
// Because gear is just another layer, a helmet or sword swap shows up on the sprite.
//
// Layer order (fixed): back -> legs -> body -> arms -> head -> hair -> headgear -> offHand -> mainHand
import { PAL, OUTLINE } from './art.js';

export const W = 32, H = 40;

// ---------- grid + drawing helpers ----------
export class Grid {
  constructor() { this.m = new Array(W * H).fill(null); }
  set(x, y, mat) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    this.m[y * W + x] = mat;
  }
  get(x, y) { return (x < 0 || y < 0 || x >= W || y >= H) ? null : this.m[y * W + x]; }
  clear(x, y) { this.set(x, y, null); }
}
export function rect(g, x, y, w, h, mat) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) g.set(x + i, y + j, mat); }
export function ellipse(g, cx, cy, rx, ry, mat, clip) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
    if (dx * dx + dy * dy <= 1 && (!clip || clip(x, y))) g.set(x, y, mat);
  }
}
export function poly(g, pts, mat) {
  const ys = pts.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  const xs = pts.map(p => p[0]), x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const px = x + 0.5, py = y + 0.5; let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
    }
    if (inside) g.set(x, y, mat);
  }
}
// Thick line from (x0,y0) to (x1,y1).
export function line(g, x0, y0, x1, y1, w, mat) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    if (w <= 1) g.set(x, y, mat);
    else for (let a = -(w - 1) / 2; a <= (w - 1) / 2; a++) for (let b = -(w - 1) / 2; b <= (w - 1) / 2; b++) g.set(x + a, y + b, mat);
  }
}

// ---------- render: shading + outline ----------
function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
const rgbCache = {};
function rgb(c) { return rgbCache[c] || (rgbCache[c] = hex(c)); }

export function renderGrid(g, palette) {
  const cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d');
  const img = ctx.createImageData(W, H), d = img.data;
  const put = (x, y, c) => { const [r, gg, b] = rgb(c); const i = (y * W + x) * 4; d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const m = g.get(x, y);
    if (m == null) {
      // Outline: an empty pixel touching the figure (4-neighbours).
      if (g.get(x - 1, y) != null || g.get(x + 1, y) != null || g.get(x, y - 1) != null || g.get(x, y + 1) != null) put(x, y, OUTLINE);
      continue;
    }
    const ramp = palette[m] || PAL[m];
    if (!ramp) { put(x, y, '#ff00ff'); continue; }
    if (typeof ramp === 'string') { put(x, y, ramp); continue; }
    // ramp = [shadow, base, light]. Light comes from the top-left.
    const up = g.get(x, y - 1), left = g.get(x - 1, y), down = g.get(x, y + 1), right = g.get(x + 1, y);
    const lit = up !== m || left !== m;
    const dark = down !== m || right !== m;
    put(x, y, lit && !dark ? ramp[2] : dark && !lit ? ramp[0] : ramp[1]);
  }
  ctx.putImageData(img, 0, 0);
  return cvs;
}

// ---------- the character builder ----------
// spec: { build: 'kid'|'goblin'|'kobold'|'gnoll', people, skin, hair, hairColor, outfit, layers:{head, body, mainHand, offHand, back}, palette overrides }
// frame: 0 or 1 (idle bob), pose: 'idle' | 'attack'
import { BUILDS, GEAR } from './art.js';

const cache = new Map();
export function sprite(spec, frame = 0, pose = 'idle') {
  const key = JSON.stringify(spec) + '|' + frame + '|' + pose;
  let c = cache.get(key);
  if (c) return c;
  const g = new Grid();
  const build = BUILDS[spec.build || 'kid'];
  const palette = build.palette(spec);
  const ctx = { g, spec, frame, pose, bob: frame === 1 ? 1 : 0, GEAR, palette };
  build.draw(ctx);
  c = renderGrid(g, palette);
  cache.set(key, c);
  return c;
}

// Draw a character at (x, y) = top-left, integer scale, crisp pixels.
export function draw(ctx2d, spec, x, y, scale = 4, frame = 0, pose = 'idle') {
  const s = sprite(spec, frame, pose);
  ctx2d.imageSmoothingEnabled = false;
  ctx2d.drawImage(s, Math.round(x), Math.round(y), W * scale, H * scale);
}

export function cacheSize() { return cache.size; }

export default { sprite, draw, Grid, rect, ellipse, poly, line, renderGrid, W, H, cacheSize };
