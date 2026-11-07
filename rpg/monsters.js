// Real monsters for the fights. Pictures, names and bios live in art.js (CAST), keyed by cast.
// skills: what they roll to hit. armor: squares taken off the chance to hit them.
// retreatAt: when their hearts drop this low, they run for the edge of the map.
export const MONSTERS = {
  goblin:       { cast: 'goblin',        name: 'Goblin',        hp: 7, armor: 5, finesse: 40, skills: { swing: 64, aim: 30 }, weapon: 'rustknife', move: 4, retreatAt: 2 },
  goblinarcher: { cast: 'goblinarcher',  name: 'Goblin archer', hp: 5, armor: 0, finesse: 45, skills: { swing: 25, aim: 65 }, weapon: 'shortbow',  move: 4, retreatAt: 1, range: 6 },
  kobold:       { cast: 'kobold',        name: 'Kobold',        hp: 4, armor: 0, finesse: 50, skills: { swing: 35, aim: 30 }, weapon: 'spear',     move: 5, retreatAt: 1 },
  koboldtrapper:{ cast: 'koboldtrapper', name: 'Kobold trapper',hp: 6, armor: 0, finesse: 50, skills: { swing: 30, aim: 40 }, weapon: 'spear',     move: 5, retreatAt: 1 },
  gnoll:        { cast: 'gnoll',         name: 'Grubjaw',       hp: 44, armor: 10, finesse: 30, skills: { swing: 60, aim: 20 }, weapon: 'flail',     move: 4, retreatAt: 0, boss: true, sweepDice: '1d8' },
  // Book Two
  wolf:         { cast: 'wolf',          name: 'Wolf',          hp: 7, armor: 0, finesse: 55, skills: { swing: 50, aim: 0 }, weapon: 'fangs', dice: '1d6', move: 6, retreatAt: 2, pack: true },
  wolfleader:   { cast: 'wolfleader',    name: 'Pack leader',   hp: 12, armor: 5, finesse: 55, skills: { swing: 55, aim: 0 }, weapon: 'fangs', dice: '1d8', move: 6, retreatAt: 3, pack: true, leader: true },
  crow:         { cast: 'crow',          name: 'Crow',          hp: 5, armor: 0, finesse: 70, skills: { swing: 50, aim: 0 }, weapon: 'beak', dice: '1d4', move: 6, retreatAt: 1, fly: true },
  owl:          { cast: 'owl',           name: 'Clockwork owl', hp: 12, armor: 25, finesse: 20, skills: { swing: 55, aim: 0 }, weapon: 'talons', dice: '1d6', move: 3, retreatAt: 0, fireResist: true },
  thornbeast:   { cast: 'thornbeast',    name: 'Thorn beast',   hp: 16, armor: 10, finesse: 25, skills: { swing: 60, aim: 0 }, weapon: 'vines', dice: '1d8', move: 3, retreatAt: 0 },
  bramble:      { cast: 'bramble',       name: 'Bramble',       hp: 26, armor: 5, finesse: 45, skills: { swing: 30, aim: 60 }, weapon: 'thornbolt', dice: '1d6', move: 3, retreatAt: 0, range: 5, summoner: true },
  troll:        { cast: 'mossback',      name: 'Mossback',      hp: 18, armor: 5, finesse: 20, skills: { swing: 55, aim: 0 }, weapon: 'fists', dice: '1d8', move: 3, retreatAt: 0 },
};

// Armor from what a kid is wearing.
export const ARMOR = { bucket: 5, ironcap: 10, hood: 0, padded: 5, potlid: 5, buckler: 10 };
export function armorOf(gear) {
  let a = 0;
  for (const k in gear) a += ARMOR[gear[k]] || 0;
  return a;
}

export default { MONSTERS, ARMOR, armorOf };
