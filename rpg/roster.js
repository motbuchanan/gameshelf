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
};
// Spark: the first spell, from page 9 of Gran's book. A little ball of fire at one square.
export const SPARK = { id: 'spark', name: 'Spark', skill: 'lore', shape: 'circle', r: 0, range: 5, uses: 2, dice: '1d6', fire: true };

// Patch Up: page 12 of Gran's book. Gives a friend in one square some hearts back.
export const PATCH = { id: 'patch', name: 'Patch Up', skill: 'lore', shape: 'circle', r: 0, range: 4, uses: 2, dice: '1d6', heal: true };

// Who starts in the party, in order. Story adds more with join.
export const START_PARTY = ['hollis', 'nell', 'pim'];

export default { ROSTER, SPARK, PATCH, START_PARTY };
