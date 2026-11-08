// Dice: 3D physics dice (three.js + cannon-es) rendered low-res for a pixel look,
// plus a flat 2D fallback. Results are ALWAYS chosen first by rng.js; the dice
// are then shown landing on them.
//
// How the landing is made honest: the throw is simulated first, which tells us
// which face really lands up. Every die shape can be turned by one of its own
// symmetry rotations so that any chosen face sits where the landed face is, and
// the shape looks identical afterward. The mesh is drawn with that turn applied
// for the whole throw, so the tumble is real physics and the face that ends up
// on top is the pre-picked value. No snapping or correction at the end.
import * as THREE from './three.module.min.js';
import * as CANNON from './cannon-es.js';
import { float } from './rng.js';
import sfx from './sfx.js';

// ---------- pixel digits (5x7) ----------
const DIGITS = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
};
// Draw text centered at (cx, cy) with pixel size px. Underline marks 6 and 9.
export function drawPixelText(ctx, text, cx, cy, px, color, underline) {
  const w = text.length * 6 * px - px, h = 7 * px;
  let x0 = Math.round(cx - w / 2), y0 = Math.round(cy - h / 2);
  ctx.fillStyle = color;
  for (let i = 0; i < text.length; i++) {
    const g = DIGITS[text[i]];
    if (!g) continue;
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
      if (g[r][c] === '1') ctx.fillRect(x0 + (i * 6 + c) * px, y0 + r * px, px, px);
    }
  }
  if (underline) ctx.fillRect(x0, y0 + h + px, w, px);
}

// ---------- die definitions ----------
const PHI = (1 + Math.sqrt(5)) / 2;
function rawVerts(kind) {
  switch (kind) {
    case 4: return [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
    case 6: { const v = []; for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]); return v; }
    case 8: return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    case 10: {
      // Pentagonal trapezohedron. Planar kites need H = z0 (1 + cos36) / (1 - cos36).
      const z0 = 0.105, c36 = Math.cos(Math.PI / 5), H = z0 * (1 + c36) / (1 - c36);
      const v = [[0, H, 0], [0, -H, 0]];
      for (let k = 0; k < 10; k++) {
        const a = k * Math.PI / 5;
        v.push([Math.cos(a), k % 2 ? -z0 : z0, Math.sin(a)]);
      }
      return v;
    }
    case 12: {
      const v = [], a = 1 / PHI;
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]);
      for (const s of [-1, 1]) for (const t of [-1, 1]) { v.push([0, s * a, t * PHI]); v.push([s * a, t * PHI, 0]); v.push([s * PHI, 0, t * a]); }
      return v;
    }
    case 20: {
      const v = [];
      for (const s of [-1, 1]) for (const t of [-1, 1]) { v.push([0, s, t * PHI]); v.push([s, t * PHI, 0]); v.push([t * PHI, 0, s]); }
      return v;
    }
  }
  throw new Error('no die ' + kind);
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]);
const norm = a => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];

// Find planar faces of a convex polyhedron from its vertices.
function hullFaces(V) {
  const faces = [], planes = [], eps = 1e-6;
  const n = V.length;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    let nn = cross(sub(V[j], V[i]), sub(V[k], V[i]));
    if (len(nn) < 1e-9) continue;
    nn = norm(nn);
    let d = dot(nn, V[i]);
    let pos = 0, neg = 0;
    for (const p of V) { const s = dot(nn, p) - d; if (s > eps) pos++; else if (s < -eps) neg++; }
    if (pos && neg) continue;
    if (pos) { nn = scale(nn, -1); d = -d; }
    if (planes.some(p => dot(p.n, nn) > 1 - 1e-6 && Math.abs(p.d - d) < 1e-5)) continue;
    const on = [];
    V.forEach((p, idx) => { if (Math.abs(dot(nn, p) - d) < 1e-5) on.push(idx); });
    const c = on.reduce((a, idx) => [a[0] + V[idx][0] / on.length, a[1] + V[idx][1] / on.length, a[2] + V[idx][2] / on.length], [0, 0, 0]);
    const ref = norm(sub(V[on[0]], c)), ref2 = cross(nn, ref);
    on.sort((a, b) => {
      const va = sub(V[a], c), vb = sub(V[b], c);
      return Math.atan2(dot(va, ref2), dot(va, ref)) - Math.atan2(dot(vb, ref2), dot(vb, ref));
    });
    planes.push({ n: nn, d });
    faces.push(on); // counter-clockwise seen from outside
  }
  return faces;
}

// Rotations (3x3, row-major arrays) that map the vertex set onto itself.
function symmetries(V, faces) {
  const frame = (f, vIdx) => {
    const c = centroid(V, f), n = faceNormal(V, f);
    const u = norm(sub(V[vIdx], c));
    return [u, cross(n, u), n];
  };
  const f0 = faces[0];
  const F0 = frame(f0, f0[0]);
  const out = [];
  for (const f of faces) {
    if (f.length !== f0.length) continue;
    for (const vIdx of f) {
      const Fj = frame(f, vIdx);
      // M = Fj^T-columns * F0 rows: M x = sum_i (F0_i . x) Fj_i
      const M = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        let s = 0; for (let i = 0; i < 3; i++) s += Fj[i][r] * F0[i][c];
        M[r * 3 + c] = s;
      }
      const ok = V.every(p => { const q = mul(M, p); return V.some(w => len(sub(q, w)) < 1e-4); });
      if (ok) out.push(M);
    }
  }
  return out;
}
const mul = (M, p) => [M[0] * p[0] + M[1] * p[1] + M[2] * p[2], M[3] * p[0] + M[4] * p[1] + M[5] * p[2], M[6] * p[0] + M[7] * p[1] + M[8] * p[2]];
function centroid(V, f) { return f.reduce((a, i) => [a[0] + V[i][0] / f.length, a[1] + V[i][1] / f.length, a[2] + V[i][2] / f.length], [0, 0, 0]); }
function faceNormal(V, f) { return norm(cross(sub(V[f[1]], V[f[0]]), sub(V[f[2]], V[f[0]]))); }

// Types: d4 d6 d8 d10 (1-10) d12 d20, pt (percentile tens 00-90), po (percentile ones 0-9)
const DIE_SCALE = 1.3;
export const STYLE = {
  d4: { body: '#c4473a', ink: '#fff4dc', size: 1.25 },
  d6: { body: '#3b6fb6', ink: '#fff4dc', size: 0.82 },
  d8: { body: '#7a4fb0', ink: '#fff4dc', size: 1.05 },
  d10: { body: '#2f8a5a', ink: '#fff4dc', size: 1.1 },
  d12: { body: '#d0802a', ink: '#24170f', size: 0.98 },
  d20: { body: '#2a9aa0', ink: '#fff4dc', size: 1.0 },
  pt: { body: '#22543a', ink: '#ffd84a', size: 1.3 },
  po: { body: '#efe2c4', ink: '#1a0f0a', size: 1.3 },
};
export const TYPE_FOR_SIDES = { 4: 'd4', 6: 'd6', 8: 'd8', 10: 'd10', 12: 'd12', 20: 'd20' };

const defs = {};
function getDef(type) {
  if (defs[type]) return defs[type];
  const kind = type === 'pt' || type === 'po' ? 10 : parseInt(type.slice(1), 10);
  const raw = rawVerts(kind);
  const R0 = Math.max(...raw.map(len));
  const V = raw.map(p => scale(p, STYLE[type].size * DIE_SCALE / R0));
  const faces = hullFaces(V);
  const normals = faces.map(f => faceNormal(V, f));
  // Values 1..n with opposite faces summing to n+1 (d4 handled separately).
  const n = faces.length, val = new Array(n).fill(0);
  if (kind === 4) {
    // Face i is the one opposite vertex i; reading face is the DOWN face; value = label of the top vertex.
    faces.forEach((f, i) => { val[i] = [0, 1, 2, 3].find(v => !f.includes(v)) + 1; });
  } else {
    let next = 1;
    const order = normals.map((nn, i) => i).sort((a, b) => (normals[b][1] - normals[a][1]) || (Math.atan2(normals[a][2], normals[a][0]) - Math.atan2(normals[b][2], normals[b][0])));
    for (const i of order) {
      if (val[i]) continue;
      const opp = normals.findIndex(m => dot(m, normals[i]) < -0.999);
      val[i] = next; if (opp >= 0) val[opp] = n + 1 - next; next++;
    }
  }
  // Display value: what the game reports. pt: 0..9 tens digit, po: 0..9, d10: 1..10
  const report = val.map(v => (type === 'pt' || type === 'po') ? v - 1 : v);
  const label = val.map((v, i) => type === 'pt' ? (report[i] === 0 ? '00' : String(report[i] * 10)) : String(report[i]));
  const def = { type, kind, V, faces, normals, report, label, sym: symmetries(V, faces), readDown: kind === 4 };
  defs[type] = def;
  return def;
}

// Which face index is the reading face for local->world quaternion q (THREE.Quaternion)?
function readingFace(def, q) {
  let best = -1, bestY = def.readDown ? Infinity : -Infinity;
  const v = new THREE.Vector3();
  def.normals.forEach((nn, i) => {
    v.set(nn[0], nn[1], nn[2]).applyQuaternion(q);
    if (def.readDown ? v.y < bestY : v.y > bestY) { bestY = v.y; best = i; }
  });
  return { face: best, flatness: Math.abs(bestY) };
}

function matToQuat(M) {
  const m4 = new THREE.Matrix4().set(M[0], M[1], M[2], 0, M[3], M[4], M[5], 0, M[6], M[7], M[8], 0, 0, 0, 0, 1);
  return new THREE.Quaternion().setFromRotationMatrix(m4);
}

// ---------- mesh building ----------
const meshCache = {};
function buildGeometry(def) {
  if (meshCache[def.type]) return meshCache[def.type];
  const { V, faces, normals, label, kind } = def;
  const n = faces.length, cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), CELL = 64;
  const cvs = document.createElement('canvas');
  cvs.width = cols * CELL; cvs.height = rows * CELL;
  const ctx = cvs.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const st = STYLE[def.type];
  ctx.fillStyle = st.body; ctx.fillRect(0, 0, cvs.width, cvs.height);

  // Shared extent so every face uses the same pixel scale.
  const frames = faces.map((f, i) => {
    const c = centroid(V, f), nn = normals[i];
    let far = f[0], fd = -1;
    for (const vi of f) { const d = len(sub(V[vi], c)); if (d > fd + 1e-6) { fd = d; far = vi; } }
    const u = norm(sub(V[far], c)), r = cross(u, nn);
    return { c, u, r };
  });
  let ext = 0;
  faces.forEach((f, i) => f.forEach(vi => { const d = sub(V[vi], frames[i].c); ext = Math.max(ext, Math.abs(dot(d, frames[i].u)), Math.abs(dot(d, frames[i].r))); }));

  const pos = [], nor = [], uv = [];
  faces.forEach((f, i) => {
    const col = i % cols, row = Math.floor(i / cols), fr = frames[i];
    const toUV = p => {
      const d = sub(p, fr.c), x = dot(d, fr.r) / ext, y = dot(d, fr.u) / ext;
      return [(col + 0.5 + x * 0.47) / cols, 1 - (row + 0.5 - y * 0.47) / rows];
    };
    for (let t = 1; t < f.length - 1; t++) {
      for (const vi of [f[0], f[t], f[t + 1]]) {
        pos.push(...V[vi]); nor.push(...normals[i]); uv.push(...toUV(V[vi]));
      }
    }
    // Paint the label in this face's cell.
    const cx = (col + 0.5) * CELL, cy = (row + 0.5) * CELL;
    if (kind === 4) {
      // Three small numbers, each near a corner, pointing at that corner.
      for (const vi of f) {
        const d = sub(V[vi], fr.c), x = dot(d, fr.r) / ext, y = dot(d, fr.u) / ext;
        const ang = Math.atan2(x, y);
        ctx.save();
        ctx.translate(cx + x * 0.47 * CELL * 0.55, cy - y * 0.47 * CELL * 0.55);
        ctx.rotate(ang);
        drawPixelText(ctx, String(vi + 1), 0, 0, 2, st.ink, false);
        ctx.restore();
      }
    } else {
      const text = label[i];
      const under = (text === '6' || text === '9') && kind !== 6 && kind !== 8;
      if (kind === 10) {
        // Kite face: put the number across the widest part, as big as fits.
        const toPx = p => { const d = sub(p, fr.c); return [dot(d, fr.r) / ext * 0.47 * CELL, -dot(d, fr.u) / ext * 0.47 * CELL]; };
        const j = f.findIndex(vi => len(sub(V[vi], fr.c)) >= Math.max(...f.map(w => len(sub(V[w], fr.c)))) - 1e-6);
        const a = toPx(V[f[(j + 1) % 4]]), b = toPx(V[f[(j + 3) % 4]]);
        // The kite is a tall triangle (toward the far point) over a short tail.
        // Sit the number just above the widest line, inside the triangle.
        const chord = Math.abs(a[0] - b[0]);
        const chordY = (a[1] + b[1]) / 2;
        const apexY = toPx(V[f[j]])[1];
        const triH = Math.abs(chordY - apexY);
        let px = 2;
        for (let k = 6; k >= 2; k--) {
          const w = (text.length * 6 - 1) * k, h = 7 * k + (under ? 2 * k : 0);
          if (w <= 0.9 * chord * (1 - (h + 2) / triH)) { px = k; break; }
        }
        const h = 7 * px + (under ? 2 * px : 0);
        drawPixelText(ctx, text, cx, cy + chordY - 3 - h / 2 + (under ? px : 0), px, st.ink, under);
      } else {
        const px = text.length > 1 ? (kind === 20 || kind === 12 ? 2 : 3) : (kind === 6 ? 5 : kind === 20 ? 3 : 4);
        drawPixelText(ctx, text, cx, cy, px, st.ink, under);
      }
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const tex = new THREE.CanvasTexture(cvs);
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshLambertMaterial({ map: tex, flatShading: true });
  const edges = new THREE.EdgesGeometry(geo, 10);
  meshCache[def.type] = { geo, mat, edges, atlas: cvs };
  return meshCache[def.type];
}

function cannonShape(def) {
  return new CANNON.ConvexPolyhedron({
    vertices: def.V.map(p => new CANNON.Vec3(p[0], p[1], p[2])),
    faces: def.faces.map(f => f.slice()),
  });
}

// ---------- simulation ----------
const DT = 1 / 60;
// Simulate a throw for the given dice inside a tray of size W x D.
// Returns { frames: [[{p,q}]...per die], landed: [faceIndex] } or null if any die is cocked.
function simulate(types, W, D) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -38, 0) });
  world.allowSleep = true;
  const diceMat = new CANNON.Material('dice'), floorMat = new CANNON.Material('floor');
  world.addContactMaterial(new CANNON.ContactMaterial(diceMat, floorMat, { friction: 0.35, restitution: 0.35 }));
  world.addContactMaterial(new CANNON.ContactMaterial(diceMat, diceMat, { friction: 0.2, restitution: 0.4 }));
  const addPlane = (pos, axis, angle) => {
    const b = new CANNON.Body({ mass: 0, material: floorMat, shape: new CANNON.Plane() });
    b.position.set(pos[0], pos[1], pos[2]);
    if (axis) b.quaternion.setFromAxisAngle(new CANNON.Vec3(axis[0], axis[1], axis[2]), angle);
    world.addBody(b);
  };
  addPlane([0, 0, 0], [1, 0, 0], -Math.PI / 2);         // floor, normal +y
  addPlane([-W / 2, 0, 0], [0, 1, 0], Math.PI / 2);     // left wall, normal +x
  addPlane([W / 2, 0, 0], [0, 1, 0], -Math.PI / 2);     // right wall, normal -x
  addPlane([0, 0, -D / 2], [0, 1, 0], 0);               // back wall, normal +z
  addPlane([0, 0, D / 2], [0, 1, 0], Math.PI);          // front wall, normal -z
  addPlane([0, 14, 0], [1, 0, 0], Math.PI / 2);         // lid, normal -y

  const bodies = types.map((t, i) => {
    const def = getDef(t);
    const b = new CANNON.Body({ mass: 1, material: diceMat, shape: cannonShape(def), linearDamping: 0.08, angularDamping: 0.08 });
    b.sleepSpeedLimit = 0.15; b.sleepTimeLimit = 0.3;
    // Thrown in from the front edge, spread out, toward the middle.
    const spread = Math.min(W - 2.5, types.length * 2);
    const x = (types.length === 1 ? 0 : -spread / 2 + spread * i / (types.length - 1)) + (float() - 0.5) * 0.6;
    b.position.set(x, 2.6 + float() * 1.5 + (i % 2) * 1.2, D / 2 - 1.6);
    b.quaternion.setFromEuler(float() * 6.28, float() * 6.28, float() * 6.28);
    b.velocity.set((float() - 0.5) * 6 - x * 0.6, 2 + float() * 3, -(4 + float() * 4) * Math.min(1.2, D / 8));
    b.angularVelocity.set((float() - 0.5) * 30, (float() - 0.5) * 30, (float() - 0.5) * 30);
    world.addBody(b);
    return b;
  });

  const frames = bodies.map(() => []);
  let still = 0;
  for (let step = 0; step < 60 * 7; step++) {
    world.step(DT);
    bodies.forEach((b, i) => frames[i].push({ p: [b.position.x, b.position.y, b.position.z], q: [b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w] }));
    const moving = bodies.some(b => b.velocity.length() > 0.05 || b.angularVelocity.length() > 0.08);
    still = moving ? 0 : still + 1;
    if (still > 12 && step > 40) break;
  }
  const landed = [];
  for (let i = 0; i < bodies.length; i++) {
    const def = getDef(types[i]);
    const last = frames[i][frames[i].length - 1];
    const rf = readingFace(def, new THREE.Quaternion(...last.q));
    if (rf.flatness < 0.985) return null;                       // cocked die: throw again
    if (Math.abs(last.p[0]) > W / 2 || Math.abs(last.p[2]) > D / 2) return null; // escaped
    landed.push(rf.face);
  }
  return { frames, landed };
}

// Pick the symmetry turn that puts the target face where the landed face is.
function turnFor(def, targetValue, landedFace) {
  const targetFaces = def.faces.map((f, i) => i).filter(i => def.report[i] === targetValue);
  if (!targetFaces.length) throw new Error(def.type + ' has no face ' + targetValue);
  const nL = def.normals[landedFace];
  for (const t of targetFaces) {
    const nT = def.normals[t];
    for (const M of def.sym) {
      if (len(sub(mul(M, nT), nL)) < 1e-4) return matToQuat(M);
    }
  }
  throw new Error('no symmetry for ' + def.type);
}

// ---------- the dice tray ----------
let container, glCanvas, flatCanvas, renderer, scene, camera, trayMesh, raf = 0;
let mode = '3d', onSlow = null, live = [], tray = { W: 10, D: 6.5 }, pendingTray = null;
function applyPendingTray() {
  if (!pendingTray) return;
  tray = pendingTray; pendingTray = null;
  if (scene) { buildTray(); fitCamera(); }
}
let lastResult = [];

export function init(el, opts = {}) {
  container = el;
  onSlow = opts.onSlow || null;
  flatCanvas = document.createElement('canvas');
  flatCanvas.className = 'dice-flat';
  container.appendChild(flatCanvas);
  setMode(opts.mode || '3d');
  ro = new ResizeObserver(() => resize());
  ro.observe(container);
  resize();
}

// Move the dice table into another box (the fight screen borrows it for attack rolls).
let ro = null;
export function mount(el) {
  if (!el || el === container) return;
  clearTags();
  container = el;
  container.appendChild(flatCanvas);
  if (glCanvas) container.appendChild(glCanvas);
  if (ro) { ro.disconnect(); ro.observe(container); }
  resize();
}

export function getMode() { return mode; }

export function setMode(m) {
  clearTags();
  if (m === '3d' && !setup3D()) m = '2d';
  mode = m;
  if (glCanvas) glCanvas.style.display = mode === '3d' ? 'block' : 'none';
  flatCanvas.style.display = mode === '2d' ? 'block' : 'none';
  resize();
  return mode;
}

function setup3D() {
  if (renderer) return true;
  try {
    glCanvas = document.createElement('canvas');
    glCanvas.className = 'dice-gl';
    renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(glCanvas);
  } catch (e) {
    renderer = null; if (glCanvas) glCanvas.remove(); glCanvas = null;
    return false;
  }
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, 1.5, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xfff2d8, 0x6a5a48, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.3);
  sun.position.set(-4, 10, 6);
  scene.add(sun);
  buildTray();
  return true;
}

function buildTray() {
  if (trayMesh) scene.remove(trayMesh);
  const { W, D } = tray, rim = 0.9, PX = 16; // texture px per world unit
  const cvs = document.createElement('canvas');
  cvs.width = Math.round((W + rim * 2) * PX); cvs.height = Math.round((D + rim * 2) * PX);
  const c = cvs.getContext('2d');
  // wood rim
  c.fillStyle = '#6b4226'; c.fillRect(0, 0, cvs.width, cvs.height);
  for (let y = 0; y < cvs.height; y += 3) { c.fillStyle = (y / 3) % 2 ? '#5d3920' : '#744a2b'; c.fillRect(0, y, cvs.width, 1); }
  // felt
  const fx = rim * PX, fy = rim * PX, fw = W * PX, fh = D * PX;
  c.fillStyle = '#2d5a3a'; c.fillRect(fx, fy, fw, fh);
  for (let i = 0; i < fw * fh / 40; i++) {
    c.fillStyle = float() < 0.5 ? '#285234' : '#33633f'; // cosmetic felt speckle
    c.fillRect(fx + Math.floor(float() * fw), fy + Math.floor(float() * fh), 1, 1);
  }
  c.fillStyle = '#1d3a26'; c.fillRect(fx, fy, fw, 2); c.fillRect(fx, fy, 2, fh);
  c.fillStyle = '#c9a03a'; c.fillRect(fx - 2, fy - 2, fw + 4, 1); c.fillRect(fx - 2, fy + fh + 1, fw + 4, 1); c.fillRect(fx - 2, fy - 2, 1, fh + 4); c.fillRect(fx + fw + 1, fy - 2, 1, fh + 4);
  const tex = new THREE.CanvasTexture(cvs);
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  trayMesh = new THREE.Mesh(new THREE.PlaneGeometry(W + rim * 2, D + rim * 2), new THREE.MeshLambertMaterial({ map: tex }));
  trayMesh.rotation.x = -Math.PI / 2;
  scene.add(trayMesh);
}

function fitCamera() {
  if (!camera) return;
  const w = container.clientWidth || 300, h = container.clientHeight || 200;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  // Move the camera in until the tray (with its rim) just fills the view.
  const rim = 0.9, tilt = 0.3, corners = [];
  for (const x of [-1, 1]) for (const z of [-1, 1]) corners.push(new THREE.Vector3(x * (tray.W / 2 + rim), 0, z * (tray.D / 2 + rim)));
  const v = new THREE.Vector3();
  let dist = 40;
  for (let d = 6; d < 60; d += 0.25) {
    camera.position.set(0, d * Math.cos(tilt), d * Math.sin(tilt));
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const fits = corners.every(c => { v.copy(c).project(camera); return Math.abs(v.x) < 0.97 && Math.abs(v.y) < 0.97; });
    if (fits) { dist = d; break; }
  }
  camera.position.set(0, dist * Math.cos(tilt), dist * Math.sin(tilt));
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

function resize() {
  if (!container) return;
  const w = container.clientWidth || 300, h = container.clientHeight || 200;
  // Tray shape follows the box it sits in, so the felt fills the view.
  const Wt = w >= h ? 10 : 7.5;
  const want = { W: Wt, D: Math.round(Math.min(13, Math.max(5.5, Wt * (h / w) * 1.25)) * 2) / 2 };
  // Never reshape the tray under dice that are showing. A new shape waits for the next throw.
  pendingTray = (want.W !== tray.W || want.D !== tray.D) ? want : null;
  if (pendingTray && !live.length && !rolling) applyPendingTray();
  if (renderer) {
    // Aim for about 420 render pixels across the tray on any screen, counting real device pixels,
    // so phones get the same readable dice as tablets. Whole-number scale keeps pixels square.
    const dpr = window.devicePixelRatio || 1;
    const k = Math.max(1, Math.round((w * dpr) / 420));
    renderer.setSize(Math.max(1, Math.round(w * dpr / k)), Math.max(1, Math.round(h * dpr / k)), false);
    fitCamera();
    renderer.render(scene, camera);
    placeTags();
  }
  flatCanvas.width = Math.max(1, Math.round(w / 3)); flatCanvas.height = Math.max(1, Math.round(h / 3));
  draw2D(lastFlat);
}

function makeDieObject(type) {
  const def = getDef(type), g = buildGeometry(def);
  const group = new THREE.Group();
  const inner = new THREE.Group();
  const mesh = new THREE.Mesh(g.geo, g.mat);
  const lines = new THREE.LineSegments(g.edges, new THREE.LineBasicMaterial({ color: 0x1a120c }));
  inner.add(mesh, lines);
  group.add(inner);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(STYLE[type].size * DIE_SCALE * 0.9, 12), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  scene.add(shadow);
  scene.add(group);
  return { def, group, inner, mesh, shadow };
}

let rolling = false;
export function isRolling() { return rolling; }
let settlePrev = null;          // finishes a roll that a newer roll interrupted
// Test hook: play throws faster. 1 = real time.
let timeScale = 1;
export function setTimeScale(k) { timeScale = Math.max(1, k); }

// list: [{type:'d6', value:4}] or [{sides:6, value:4}]. Resolves with the list once settled.
export function rollSet(list) {
  const items = list.map(d => ({ type: d.type || TYPE_FOR_SIDES[d.sides], value: d.value }));
  items.forEach(d => { const def = getDef(d.type); if (!def.report.includes(d.value)) throw new Error(d.type + ' cannot show ' + d.value); });
  lastResult = items;
  if (settlePrev) settlePrev();   // a new roll never strands the one before it
  const stop = sfx.tumble();
  return (mode === '2d' ? roll2D(items) : roll3D(items)).then(r => { stop(); return r; }, e => { stop(); throw e; });
}

// Percentile pair for a d100 roll {tens, ones}.
export function roll(target) {
  return rollSet([{ type: 'pt', value: target.tens }, { type: 'po', value: target.ones }]);
}

function roll3D(items) {
  rolling = true;
  cancelAnimationFrame(raf);
  live.forEach(d => { scene.remove(d.group); scene.remove(d.shadow); });
  live = [];
  clearTags();
  applyPendingTray();
  const types = items.map(d => d.type);
  let sim = null;
  for (let tries = 0; tries < 25 && !sim; tries++) sim = simulate(types, tray.W, tray.D);
  if (!sim) { rolling = false; return roll2D(items); } // extremely unlikely; still honest
  live = items.map((d, i) => {
    const o = makeDieObject(d.type);
    o.turn = turnFor(o.def, d.value, sim.landed[i]);
    o.frames = sim.frames[i];
    return o;
  });
  const total = Math.max(...sim.frames.map(f => f.length));
  return new Promise(resolve => {
    settlePrev = () => { settlePrev = null; resolve(items); };
    const t0 = performance.now();
    let frameCount = 0, slowFrames = 0, last = t0;
    const q = new THREE.Quaternion();
    const tick = now => {
      const dt = now - last; last = now; frameCount++;
      if (frameCount > 3 && dt > 34) slowFrames++;
      const idx = Math.max(0, Math.min(total - 1, Math.floor((now - t0) * timeScale / 1000 / DT)));
      live.forEach(o => {
        const f = o.frames[Math.min(idx, o.frames.length - 1)];
        o.group.position.set(f.p[0], f.p[1], f.p[2]);
        q.set(f.q[0], f.q[1], f.q[2], f.q[3]);
        o.group.quaternion.copy(q).multiply(o.turn);
        const h = Math.max(0, f.p[1]);
        o.shadow.position.set(f.p[0] + h * 0.25, 0.01, f.p[2] - h * 0.15);
        o.shadow.scale.setScalar(1 / (1 + h * 0.12));
        o.shadow.material.opacity = 0.35 / (1 + h * 0.3);
      });
      renderer.render(scene, camera);
      if (idx < total - 1) { raf = requestAnimationFrame(tick); return; }
      rolling = false; settlePrev = null;
      showTags(items);
      if (frameCount > 30 && slowFrames / frameCount > 0.5 && onSlow) onSlow();
      resolve(items);
    };
    raf = requestAnimationFrame(tick);
  });
}

// ---------- result tags: a big readable number floats over each landed die ----------
let tags = [], tagItems = null;
function tagText(d) {
  if (d.type === 'pt') return d.value === 0 ? '00' : String(d.value * 10);
  return String(d.value);
}
function clearTags() { tags.forEach(t => t.remove()); tags = []; tagItems = null; }
function placeTags() {
  if (!tagItems || !camera) return;
  const w = container.clientWidth, h = container.clientHeight;
  const c = new THREE.Vector3(), top = new THREE.Vector3();
  const screenUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  live.forEach((o, i) => {
    const t = tags[i]; if (!t) return;
    // Put the tag just above the die's outline on screen, never on top of the die.
    const r = STYLE[o.def.type].size * DIE_SCALE * 1.05;
    c.copy(o.group.position);
    top.copy(c).addScaledVector(screenUp, r).project(camera);
    c.project(camera);
    t.style.left = ((c.x + 1) / 2 * w) + 'px';
    t.style.top = Math.max(34, (1 - top.y) / 2 * h - 4) + 'px';
  });
}
function showTags(items) {
  clearTags();
  tagItems = items;
  items.forEach(d => {
    const t = document.createElement('div');
    t.className = 'die-tag die-tag-' + d.type;
    t.textContent = tagText(d);
    container.appendChild(t);
    tags.push(t);
  });
  placeTags();
}

// Test hook: read what each 3D die is actually showing, from the drawn mesh.
export function readVisual() {
  return live.map(o => {
    const wq = new THREE.Quaternion();
    o.group.getWorldQuaternion(wq);
    const rf = readingFace(o.def, wq);
    return { type: o.def.type, value: o.def.report[rf.face], flatness: rf.flatness };
  });
}

// ---------- 2D fallback ----------
let lastFlat = null;
const SHAPES = { d4: 3, d6: 4, d8: 4, d10: 4, d12: 5, d20: 6, pt: 4, po: 4 };
function draw2D(state) {
  if (!flatCanvas) return;
  const c = flatCanvas.getContext('2d'), W = flatCanvas.width, H = flatCanvas.height;
  c.imageSmoothingEnabled = false;
  c.fillStyle = '#6b4226'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#2d5a3a'; c.fillRect(6, 6, W - 12, H - 12);
  if (!state) return;
  const n = state.length, size = Math.min(36, Math.floor((W - 20) / Math.max(1, n) / 1.3), Math.floor(H / 2.6));
  state.forEach((d, i) => {
    const cx = Math.round(W / 2 + (i - (n - 1) / 2) * size * 1.3 + (d.dx || 0));
    const cy = Math.round(H / 2 + (d.dy || 0));
    const st = STYLE[d.type], sides = SHAPES[d.type], rot = d.rot || 0;
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(cx - size / 2 + 3, cy + size / 2 - 1, size, 3);
    c.beginPath();
    for (let k = 0; k < sides; k++) {
      const a = rot + (k / sides) * Math.PI * 2 + (d.type === 'd8' || d.type === 'd10' || d.type === 'pt' || d.type === 'po' ? 0 : -Math.PI / 2 + Math.PI / sides);
      const rx = d.type === 'd10' || d.type === 'pt' || d.type === 'po' ? 0.42 : 0.55;
      c.lineTo(cx + Math.cos(a) * size * (k % 2 && sides === 4 && d.type !== 'd6' && d.type !== 'd8' ? rx : 0.55), cy + Math.sin(a) * size * 0.55);
    }
    c.closePath(); c.fillStyle = st.body; c.fill(); c.strokeStyle = '#1a120c'; c.lineWidth = 2; c.stroke();
    const def = getDef(d.type);
    const shown = d.type === 'pt' ? (d.show === 0 ? '00' : String(d.show * 10)) : String(d.show);
    drawPixelText(c, shown, cx, cy, shown.length > 1 ? 2 : 3, st.ink, false);
    void def;
  });
}

function roll2D(items) {
  cancelAnimationFrame(raf);
  rolling = true;
  return new Promise(resolve => {
    settlePrev = () => { settlePrev = null; resolve(items); };
    const t0 = performance.now(), dur = 1100 / timeScale;
    const state = items.map(d => ({ type: d.type, show: d.value, rot: 0, dx: 0, dy: 0, spin: (float() - 0.5) * 20 }));
    const tick = now => {
      const t = Math.max(0, Math.min(1, (now - t0) / dur)), e = 1 - Math.pow(1 - t, 3);
      state.forEach((s, i) => {
        const def = getDef(s.type);
        s.rot = s.spin * (1 - e);
        s.dy = (1 - e) * 60 - Math.abs(Math.sin(e * 9)) * (1 - e) * 20;
        s.dx = (1 - e) * (i % 2 ? 20 : -20);
        s.show = t < 0.85 ? def.report[Math.floor(now / 70 + i * 3) % def.report.length] : items[i].value;
      });
      lastFlat = state; draw2D(state);
      if (t < 1) { raf = requestAnimationFrame(tick); return; }
      rolling = false; settlePrev = null; resolve(items);
    };
    raf = requestAnimationFrame(tick);
  });
}

export default { init, mount, setMode, getMode, roll, rollSet, readVisual, isRolling, setTimeScale, TYPE_FOR_SIDES, drawPixelText };
// Exposed for Node-side geometry tests.
export const _test = { getDef, turnFor, symmetries, hullFaces, simulate, buildGeometry };
