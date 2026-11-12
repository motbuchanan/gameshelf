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
  owl:          { cast: 'owl',           name: 'Clockwork owl', hp: 12, armor: 25, finesse: 20, skills: { swing: 55, aim: 0 }, weapon: 'talons', dice: '1d6', move: 3, retreatAt: 0, fireResist: true, clockwork: true },
  thornbeast:   { cast: 'thornbeast',    name: 'Thorn beast',   hp: 16, armor: 10, finesse: 25, skills: { swing: 60, aim: 0 }, weapon: 'vines', dice: '1d8', move: 3, retreatAt: 0, heavy: true },
  bramble:      { cast: 'bramble',       name: 'Bramble',       hp: 26, armor: 5, finesse: 45, skills: { swing: 30, aim: 60 }, weapon: 'thornbolt', dice: '1d6', move: 3, retreatAt: 0, range: 5, summoner: true, heavy: true },
  mouse:        { cast: 'mouse',         name: 'Windup mouse',  hp: 1, armor: 0, finesse: 75, skills: { swing: 45, aim: 0 }, weapon: 'teeth', dice: '1d4', move: 6, retreatAt: 0, clockwork: true },
  windcat:      { cast: 'windcat',       name: 'Windup cat',    hp: 6, armor: 5, finesse: 65, skills: { swing: 55, aim: 0 }, weapon: 'claws', dice: '1d6', move: 5, retreatAt: 0, clockwork: true },
  bolt:         { cast: 'bolt',          name: 'Bolt',          hp: 12, armor: 10, finesse: 55, skills: { swing: 55, aim: 0 }, weapon: 'fangs', dice: '1d6', move: 5, retreatAt: 0, clockwork: true },
  // Book Three: the clock tower and Wren's workshop
  knight:       { cast: 'knight',        name: 'Clockwork knight', hp: 14, armor: 30, finesse: 15, skills: { swing: 60, aim: 0 }, weapon: 'sword', dice: '1d8', move: 2, retreatAt: 0, clockwork: true },
  bear:         { cast: 'bear',          name: 'Brass bear',    hp: 18, armor: 15, finesse: 25, skills: { swing: 60, aim: 0 }, weapon: 'paws', dice: '1d8', move: 3, retreatAt: 0, clockwork: true },
  bird:         { cast: 'bird',          name: 'Clockwork bird', hp: 4, armor: 5, finesse: 70, skills: { swing: 50, aim: 0 }, weapon: 'beak', dice: '1d4', move: 6, retreatAt: 0, fly: true, clockwork: true },
  beast:        { cast: 'beast',         name: 'Clockwork beast', hp: 24, armor: 15, finesse: 25, skills: { swing: 60, aim: 55 }, weapon: 'gears', dice: '2d6', range: 4, move: 3, retreatAt: 0, boss: true, sweepDice: '1d10', summoner: true, summonKind: 'mouse', clockwork: true, big: true, restTurns: 3 },
  wren:         { cast: 'wren',          name: 'Wren',          hp: 10, armor: 10, finesse: 50, skills: { swing: 45, aim: 50, fingers: 70 }, weapon: 'wrench', dice: '1d6', move: 4, retreatAt: 0 },
  // Book Four: the baby dragon (a friend), the knight's clockwork hounds, the mountain, the troll caves and Starpeak.
  babydragon:   { cast: 'dragon',        name: 'Baby dragon',   hp: 10, armor: 5, finesse: 60, skills: { swing: 50, aim: 0, lore: 65 }, weapon: 'claws', dice: '1d4', move: 4, retreatAt: 0 },
  hound:        { cast: 'hound',         name: 'Clockwork hound', hp: 9, armor: 15, finesse: 55, skills: { swing: 60, aim: 0 }, weapon: 'fangs', dice: '1d6', move: 5, retreatAt: 0, clockwork: true },
  fox:          { cast: 'fox',           name: 'Frost fox',     hp: 7, armor: 0, finesse: 65, skills: { swing: 60, aim: 0 }, weapon: 'fangs', dice: '1d6', move: 6, retreatAt: 2, pack: true },
  snowgob:      { cast: 'snowgob',       name: 'Snow goblin',   hp: 9, armor: 5, finesse: 45, skills: { swing: 65, aim: 40 }, weapon: 'rustknife', move: 4, retreatAt: 2 },
  snowgobarcher:{ cast: 'snowgobarcher', name: 'Snowball goblin', hp: 7, armor: 0, finesse: 50, skills: { swing: 25, aim: 65 }, weapon: 'snowballs', dice: '1d6', move: 4, retreatAt: 2, range: 6 },
  mtroll:       { cast: 'mtroll',        name: 'Mountain troll', hp: 20, armor: 10, finesse: 20, skills: { swing: 65, aim: 0 }, weapon: 'fists', dice: '1d8', move: 3, retreatAt: 0, regen: 2, heavy: true },
  granite:      { cast: 'granite',       name: 'Queen Granite', hp: 24, armor: 10, finesse: 20, skills: { swing: 60, aim: 0 }, weapon: 'fists', dice: '1d8', move: 3, retreatAt: 0, regen: 2, heavy: true },
  catcher:      { cast: 'catcher',       name: 'The Dragon Catcher', hp: 32, armor: 15, finesse: 25, skills: { swing: 60, aim: 55 }, weapon: 'snowballs', dice: '2d6', range: 4, move: 2, retreatAt: 0, boss: true, sweepDice: '1d10', clockwork: true, big: true, restTurns: 3 },
  troll:        { cast: 'mossback',      name: 'Mossback',      hp: 18, armor: 5, finesse: 20, skills: { swing: 55, aim: 0 }, weapon: 'fists', dice: '1d8', move: 3, retreatAt: 0 },
};

// Armor from what a kid is wearing.
export const ARMOR = { weldmask: 10, bucket: 5, ironcap: 10, hood: 0, padded: 5, potlid: 5, buckler: 10, helmet: 15, roundshield: 15, chainshirt: 10, furcloak: 5 };
export function armorOf(gear) {
  let a = 0;
  for (const k in gear) a += ARMOR[gear[k]] || 0;
  return a;
}

export default { MONSTERS, ARMOR, armorOf };
