// Friends who can fight beside the hero. Fights list spots; the story fills them from whoever is in the party.
export const ROSTER = {
  hollis: { bestAt: 'brave', offHand: 'potlid' },
  nell: { bestAt: 'sneaky', prefersBush: true },
  pim: { bestAt: 'clever', trick: { id: 'pinecones', name: 'Pinecone shower', skill: 'aim', shape: 'circle', r: 1, range: 5, uses: 1, dice: '1d4' } },
  tobin: { bestAt: 'sneaky' },
  juni: { bestAt: 'brave' },
  sniffle: { monster: 'kobold', name: 'Sniffle' },
  pudge: { monster: 'goblin', name: 'Pudge' },
  mossback: { monster: 'troll', name: 'Mossback' },
  inkwing: { monster: 'crow', name: 'Inkwing' },
  bolt: { monster: 'bolt', name: 'Bolt' },
  // Wren fixes things: her wrench can jam a clockwork monster for a turn.
  // Book Four: Dot, Sir Bartholomew's squire, who loves the dragon.
  dot: { bestAt: 'sneaky', prefersBush: true },
  wren: { monster: 'wren', name: 'Wren', tricks: [{ id: 'jam', name: 'Jam it', skill: 'fingers', shape: 'circle', r: 0, range: 4, uses: 2, dice: '1d4', jam: true }] },
};
// Spark: the first spell, from page 9 of Gran's book. A little ball of fire at one square.
export const SPARK = { id: 'spark', name: 'Spark', skill: 'lore', shape: 'circle', r: 0, range: 5, uses: 2, dice: '1d6', fire: true };

// Patch Up: page 12 of Gran's book. Gives a friend in one square some hearts back.
export const PATCH = { id: 'patch', name: 'Patch Up', skill: 'lore', shape: 'circle', r: 0, range: 4, uses: 2, dice: '1d6', heal: true };

// Snooze: the missing page from Gran's book. A sleepy song: one monster nods off and loses its next turn. No damage.
export const SNOOZE = { id: 'snooze', name: 'Snooze', skill: 'lore', shape: 'circle', r: 0, range: 5, uses: 2, sleep: true };

// Book Four: the baby dragon's tricks. It learns one a chapter (flag), and keeps the ones it knows.
export const DRAGON_TRICKS = [
  { flag: 'dragonSneeze', id: 'sneeze', name: 'Sparkle sneeze', skill: 'lore', shape: 'circle', r: 0, range: 4, uses: 2, dazzle: true },
  { flag: 'dragonWarm', id: 'warm', name: 'Warm belly', skill: 'lore', shape: 'circle', r: 0, range: 1, uses: 1, dice: '1d4', heal: true },
  { flag: 'dragonGlow', id: 'glow', name: 'Glow', skill: 'lore', shape: 'circle', r: 1, range: 3, uses: 1, dazzle: true },
  { flag: 'dragonFlame', id: 'flame', name: 'First flame', skill: 'lore', shape: 'circle', r: 0, range: 3, uses: 1, dice: '1d8', fire: true },
];

// Who starts in the party, in order. Story adds more with join.
export const START_PARTY = ['hollis', 'nell', 'pim'];

export default { ROSTER, SPARK, PATCH, SNOOZE, DRAGON_TRICKS, START_PARTY };
