// Kid-first visuals: pixel icons, block meters, and the 100-square chance grid.
// Rule of record: no bare numbers on the main screens. Numbers live on the tap cards.
import { zones, clampSkill } from './rules.js';

const K = '#1a120c';
const MAPS = {
  hammer: { rows: ['.kkkkkk..', 'kRRRRRRk.', 'kRrrrrRk.', '.kkwwkk..', '...kwk...', '...kwk...', '...kwk...', '...kwk...', '...kkk...'], col: { R: '#e8705a', r: '#a8382a', w: '#a0703e' } },
  feather: { rows: ['......kk.', '.....kGGk', '....kGgGk', '...kGgGk.', '..kGgGk..', '.kGgGk...', '.kGGk....', 'kwkk.....', 'k........'], col: { G: '#6fd06f', g: '#2f8a3a', w: '#e8dcc0' } },
  bulb: { rows: ['..kkkkk..', '.kBBBBBk.', 'kBBwBBBBk', 'kBwBBBBBk', 'kBBBBBBBk', '.kBBBBBk.', '..kBBBk..', '..kgggk..', '...kkk...'], col: { B: '#5a9ae8', w: '#d8ecff', g: '#9a9a9a' } },
  bubble: { rows: ['..kkkkk..', '.kYYYYYk.', 'kYYYYYYYk', 'kYdYdYdYk', 'kYYYYYYYk', '.kYYYYYk.', '..kYkkk..', '.kYk.....', '.kk......'], col: { Y: '#f0c44c', d: '#6b4a1a' } },
  shield: { rows: ['kkkkkkkkk', 'kPPPyPPPk', 'kPPPyPPPk', 'kPPPyPPPk', 'kPPPyPPPk', '.kPPyPPk.', '.kPPyPPk.', '..kPyPk..', '...kkk...'], col: { P: '#a46ad8', y: '#f0c44c' } },
  heart: { rows: ['.kk...kk.', 'kRRk.kRRk', 'kRwRkRRRk', 'kRRRRRRRk', '.kRRRRRk.', '..kRRRk..', '...kRk...', '....k....'], col: { R: '#e84a4a', w: '#ffb0b0' } },
  clover: { rows: ['.kk.kk.', 'kGGkGGk', 'kGgkgGk', '.kkkkk.', 'kGgkgGk', 'kGGkGGk', '.kksk..', '...s...'], col: { G: '#74c47a', g: '#2c7340', s: '#8a5a2e' } },
  boot: { rows: ['..kkkk...', '..kbbk...', '..kbbk...', '..kbbk...', '..kbbkk..', '.kbbbbbk.', 'kbbbbbbbk', 'kkkkkkkkk'], col: { b: '#b07a44' } },
  star: { rows: ['....k....', '...kYk...', 'kkkkYkkkk', 'kYYYYYYYk', '.kYYYYYk.', '..kYYYk..', '.kYYkYYk.', '.kYk.kYk.', '.kk...kk.'], col: { Y: '#f0c44c' } },
  flagb: { rows: ['kkkkk..', 'kBBBBk.', 'kBwBBBk', 'kBBBBk.', 'kkkkk..', 'k......', 'k......'], col: { B: '#4a8ee8', w: '#bcdcff' } },
  flagr: { rows: ['kkkkk..', 'kRRRRk.', 'kRwRRRk', 'kRRRRk.', 'kkkkk..', 'k......', 'k......'], col: { R: '#e8503a', w: '#ffc0b0' } },
  die: { rows: ['.kkkkkkk.', 'kWWWWWWWk', 'kWkWWWkWk', 'kWWWWWWWk', 'kWWWkWWWk', 'kWWWWWWWk', 'kWkWWWkWk', 'kWWWWWWWk', '.kkkkkkk.'], col: { W: '#f3e6cc' } },
  turns: { rows: ['...kkk...', '..kGGGk..', '.kGk.kGk.', 'kGk...kGk', 'kk.....kk', 'kGk...kGk', '.kGk.kGk.', '..kGGGk..', '...kkk...'], col: { G: '#6cbf5a' } },
  burst: { rows: ['k...k...k', '.kOkOkOk.', '..kOOOk..', 'kOOOyOOOk', '.kOyyyOk.', 'kOOOyOOOk', '..kOOOk..', '.kOkOkOk.', 'k...k...k'], col: { O: '#e8903a', y: '#f0c44c' } },
  book: { rows: ['kkkkkkkkk', 'kRRRRRRyk', 'kRyyyyRyk', 'kRRRRRRyk', 'kRyyyRRyk', 'kRRRRRRyk', 'kRRRRRRyk', 'kkkkkkkyk', '.kwwwwwwk'], col: { R: '#b8442e', y: '#f0c44c', w: '#f3e6cc' } },
  target: { rows: ['..kkkkk..', '.kRwwwRk.', 'kRwRRRwRk', 'kwRwwwRwk', 'kwRwRwRwk', 'kwRwwwRwk', 'kRwRRRwRk', '.kRwwwRk.', '..kkkkk..'], col: { R: '#e84a4a', w: '#f3e6cc' } },
};

export const STAT_ICON = { might: 'hammer', finesse: 'feather', wits: 'bulb', presence: 'bubble', resolve: 'shield' };
export const STAT_COLOR = { might: '#d0503a', finesse: '#3fa64a', wits: '#3b7fd0', presence: '#e0a92a', resolve: '#8a4fc0' };
export const STAT_WORD = { might: 'Strong muscles', finesse: 'Quick and quiet', wits: 'Sharp mind', presence: 'Good with people', resolve: 'Brave heart' };
export const TIER_COLOR = { legendary: '#f0c44c', exceptional: '#3fc1b0', success: '#6cbf5a', fail: '#5e554c', disaster: '#d0503a' };
export const TIER_WORD = { legendary: 'Legendary', exceptional: 'Exceptional', success: 'It works', fail: 'Miss', disaster: 'Oops!' };

// icon('heart', 20, true) draws a faded "used up" version.
export function icon(name, size = 20, empty = false) {
  const m = MAPS[name];
  if (!m) return '';
  const col = { k: K, ...m.col };
  let rects = '';
  m.rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch === '.') return;
    const fill = empty && ch !== 'k' ? '#3a2e24' : col[ch];
    rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill}"/>`;
  }));
  const w = m.rows[0].length, h = m.rows.length;
  return `<svg class="ico${empty ? ' empty' : ''}" viewBox="0 0 ${w} ${h}" width="${size}" height="${Math.round(size * h / w)}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

// Ten blocks; each block is 10 points. A block can be full, half (5) or empty.
export function blocks(value) {
  const v = clampSkill(value);
  return Array.from({ length: 10 }, (_, i) => (v >= (i + 1) * 10 ? 2 : v >= i * 10 + 5 ? 1 : 0));
}
export function meter(value, color, cls = '') {
  const b = blocks(value).map(s => `<i class="${s === 2 ? 'f' : s === 1 ? 'h' : ''}"></i>`).join('');
  return `<span class="meter ${cls}" style="--mc:${color}" role="img" aria-label="${value} out of 100">${b}</span>`;
}

// The 100-square chance grid: one square per number on the percentile dice.
export function tierAt(n, z) {
  if (n <= z.legendaryMax) return 'legendary';
  if (n <= z.exceptionalMax) return 'exceptional';
  if (n <= z.successMax) return 'success';
  if (n >= z.disasterMin) return 'disaster';
  return 'fail';
}
export function chanceGrid(skill, color) {
  const S = clampSkill(skill), z = zones(S);
  const wrap = document.createElement('div'); wrap.className = 'chance';
  let cells = '';
  for (let n = 1; n <= 100; n++) cells += `<i style="background:${TIER_COLOR[tierAt(n, z)]}"></i>`;
  const order = ['legendary', 'exceptional', 'success', 'fail', 'disaster'];
  const legend = order.map(t => `<span><i style="background:${TIER_COLOR[t]}"></i>${TIER_WORD[t]}</span>`).join('');
  wrap.innerHTML = `<div class="chance-top">${meter(S, color || TIER_COLOR.success, 'big')}</div>`
    + `<div class="chance-grid" aria-hidden="true">${cells}</div>`
    + `<p class="chance-say">Each square is one number on the 100 dice. <b>${S} squares</b> are colored, so roll <b>${S} or less</b> and it works.</p>`
    + `<div class="chance-legend">${legend}</div>`;
  return wrap;
}

export default { icon, meter, blocks, chanceGrid, tierAt, STAT_ICON, STAT_COLOR, STAT_WORD, TIER_COLOR, TIER_WORD };
