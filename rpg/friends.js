// Friends grow too (Book Three). Mot's ruling, Nov 8 2026: friends help however they can. Leveling a friend
// makes them better at what they help with, but even a level 1 friend is still some help.
//
// - Friends who go on the adventure earn the same XP as the hero; friends who stay home earn half (their Home Team job).
// - A friend's level never goes above the hero's.
// - Each level after the first: +2 hearts and +3 to every skill in fights, and 2 more squares when they help with a check.
// - The friends who stay home each do a Home Team job that helps the next fights. Jobs get stronger at levels 3 and 5.
import P from './party.js';

// When levels turn on, each friend gets the XP earned on the adventures since they joined (they were there too).
// JOIN_XP is the hero's XP on the usual road when that friend joined.
export const JOIN_XP = { hollis: 0, nell: 0, pim: 0, sniffle: 13, tobin: 22, pudge: 22, juni: 37, mossback: 59, inkwing: 59 };
// The hero's level on the usual road when each friend joined: a friend never starts below it.
export const JOIN_LV = { sniffle: 2, tobin: 2, pudge: 2, juni: 2, mossback: 3 };
export const NO_LEVELS = ['inkwing'];   // Inkwing scouts and never fights

export function started(s) { return !!(s && s.friends); }

// Turn friend levels on (Chapter 11). Everyone already in the party gets a starting XP.
export function start(s) {
  if (!s) return;
  s.friends = s.friends || {};
  for (const id of s.party || []) if (!s.friends[id] && !NO_LEVELS.includes(id)) s.friends[id] = { xp: Math.max(P.XP_LEVELS[JOIN_LV[id]] || 0, (s.hero.xp || 0) - (JOIN_XP[id] ?? (s.hero.xp || 0))), shown: 1 };   // shown: 1, so the first rest shows how much everyone grew
}
// A friend who joins after levels are on starts a little behind the hero.
export function joined(s, id) {
  if (!started(s) || s.friends[id] || NO_LEVELS.includes(id)) return;
  const lv = Math.max(1, (s.hero.level || 1) - 1);
  s.friends[id] = { xp: P.XP_LEVELS[lv] || 0, shown: lv };
}

export function level(s, id) {
  const f = s && s.friends && s.friends[id];
  if (!f) return 1;
  return Math.max(1, Math.min(P.levelForXp(Math.floor(f.xp)), (s.hero && s.hero.level) || 1));
}
export function levels(s) { const out = {}; for (const id of (s && s.party) || []) out[id] = level(s, id); return out; }

// XP for friends: full for the team that went, half for the friends at home.
export function share(s, n, team) {
  if (!started(s) || !n) return;
  for (const id of s.party || []) {
    const f = s.friends[id]; if (!f) continue;
    f.xp += !team || team.includes(id) ? n : n / 2;
  }
}
// Friends who reached a new level since the last rest (for the "Friends grew" screen).
export function grown(s) {
  if (!started(s)) return [];
  const out = [];
  for (const id of s.party || []) { const f = s.friends[id]; if (!f) continue; const lv = level(s, id); if (lv > (f.shown || 1)) out.push({ id, from: f.shown || 1, to: lv }); }
  return out;
}
export function markShown(s) { if (started(s)) for (const id of Object.keys(s.friends)) s.friends[id].shown = level(s, id); }

// When a friend helps with a check: 10 squares at level 1, 2 more for each level after that.
export function helpBonus(s, id) { return 10 + 2 * (level(s, id) - 1); }

// ---------- Home Team jobs ----------
const tier = lv => (lv >= 5 ? 2 : lv >= 3 ? 1 : 0);
export const JOBS = {
  hollis: { name: 'Guards the camp', what: ['Your team starts each fight with 1 extra heart.', 'Your team starts each fight with 2 extra hearts.', 'Your team starts each fight with 3 extra hearts.'] },
  nell: { name: 'Sets a trap', what: ['One monster is stuck for a turn.', 'Two monsters are stuck for a turn.', 'Two monsters are stuck for 2 turns.'] },
  pim: { name: 'Reads the map', what: ['The map shows you the shorter path.', 'The map shows the shorter path and the treasure.', 'The map shows the shorter path and the treasure.'] },
  tobin: { name: 'Builds a lookout', what: ['Your team rolls 3 higher for who goes first.', 'Your team rolls 6 higher for who goes first.', 'Your team always goes first.'] },
  juni: { name: 'Makes keys', what: ['Locks get 10 extra squares.', 'Locks get 20 extra squares.', 'Locks open with no roll.'], fromCh: 13 },
  sniffle: { name: 'Sniffs out traps', what: ['Traps get 10 extra squares.', 'Traps get 20 extra squares.', 'Traps get 20 extra squares, and one monster is sleepy.'], fromCh: 13 },
  pudge: { name: 'Cooks a pie', what: ['You get 1 Luck back before each fight.', 'You get all your Luck back before each fight.', 'All your Luck back, and 1 extra heart for everyone.'] },
  mossback: { name: 'Guards the road', what: ['He scares off one small monster.', 'He scares off one monster.', 'He scares off two monsters.'] },
  bolt: { name: 'Patrols the streets', what: ['Clockwork monsters get 5 fewer squares to hit you.', 'Clockwork monsters get 10 fewer squares to hit you.', 'Clockwork monsters get 15 fewer squares to hit you.'] },
  wren: { name: 'Tunes up your gear', what: ['Your team\'s armor is 5 better.', 'Your team\'s armor is 8 better.', 'Your team\'s armor is 10 better.'] },
};
// fromCh: a job that only starts helping in a later chapter (Juni's keys and Sniffle's nose need locks and traps, Chapter 13).
export function jobLine(s, id, chNum = 99) { const j = JOBS[id]; return j ? { name: j.name, what: (j.fromCh && chNum < j.fromCh) ? `Starts helping in Chapter ${j.fromCh}.` : j.what[tier(level(s, id))] } : null; }

const BOSSES = ['gnoll', 'bramble', 'beast'];
const CLOCKWORK = ['mouse', 'windcat', 'owl', 'knight', 'bear', 'bird', 'beast'];
// Change a fight to match who stayed home. d is the built fight; home is the list of friends at home.
export function applyHomeJobs(s, d, home, names) {
  const lines = [];
  const lvOf = id => level(s, id);
  const monsters = d.units.filter(u => u.monster && !u.side && !u.ai);
  const notBoss = monsters.filter(u => !BOSSES.includes(u.monster));
  d.stuck = d.stuck || {};
  for (const id of home) {
    const t = tier(lvOf(id)), who = names(id);
    if (id === 'hollis') { d.teamHearts = (d.teamHearts || 0) + [1, 2, 3][t]; lines.push(`${who} guarded the camp all night. Everyone feels stronger!`); }
    if (id === 'nell' && notBoss.length) { notBoss.slice(0, t ? 2 : 1).forEach(u => { d.stuck[u.id] = { turns: t === 2 ? 2 : 1, tag: 'Trapped!', say: 'Hey! A net! Who put this here?' }; }); lines.push(`${who} set a trap before the fight. Look, something is stuck!`); }
    if (id === 'tobin') { if (t === 2) { d.surprise = true; d.lookout = true; } else d.initPlus = (d.initPlus || 0) + [3, 6][t]; lines.push(`${who} watched from the lookout and spotted them first!`); }
    if (id === 'sniffle' && t === 2 && notBoss.length) { const u = notBoss[notBoss.length - 1]; if (!d.stuck[u.id]) d.stuck[u.id] = { turns: 1, tag: 'Sleepy!', say: 'Zzz... huh? What?' }; lines.push(`${who} sniffed out a sleepy monster!`); }
    if (id === 'pudge') { d.pudge = t; if (t === 2) d.teamHearts = (d.teamHearts || 0) + 1; lines.push(`${who} sent a pie along. Yum! Luck back!`); }
    if (id === 'bolt') { d.clockMinus = [5, 10, 15][t]; if (monsters.some(u => CLOCKWORK.includes(u.monster))) lines.push(`${who} has been patrolling. The clockwork monsters are nervous!`); }
    if (id === 'wren') { d.teamArmor = (d.teamArmor || 0) + [5, 8, 10][t]; lines.push(`${who} tuned up everyone's gear. Clank, clank, done!`); }
    if (id === 'mossback' && notBoss.length > 2) {
      const pool = t === 0 ? notBoss.filter(u => ['mouse', 'kobold', 'crow', 'bird'].includes(u.monster)) : notBoss;
      const go = pool.slice(-(t === 2 ? 2 : 1)).map(u => u.id);
      if (go.length) { d.events = [{ round: 0, type: 'remove', ids: go, lines: [{ who: null, text: `${who} stomps out from the trees. "SHOO!" Some of the monsters run away!` }] }, ...(d.events || [])]; }
    }
  }
  if (lines.length) d.events = [{ round: 0, type: 'say', lines: [{ who: null, text: 'Your Home Team helped! ' + lines.join(' ') }] }, ...(d.events || [])];
  return d;
}
// Checks: Juni helps with locks, Sniffle with traps.
export function homeCheckBonus(s, chk, home) {
  let bonus = 0, auto = false, why = [];
  if (chk.lock && home.includes('juni')) { const t = tier(level(s, 'juni')); if (t === 2) auto = true; bonus += [10, 20, 20][t]; why.push('Juni made you a key!'); }
  if (chk.trap && home.includes('sniffle')) { const t = tier(level(s, 'sniffle')); bonus += [10, 20, 20][t]; why.push('Sniffle sniffed out the trap!'); }
  return { bonus, auto, why: why.join(' ') };
}

export default { JOIN_XP, started, start, joined, level, levels, share, grown, markShown, helpBonus, JOBS, jobLine, applyHomeJobs, homeCheckBonus };
