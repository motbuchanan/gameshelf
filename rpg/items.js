// How each weapon is used in a fight. Names, art and damage dice live in art.js (GEAR).
// skill: which skill the attack rolls. range: how many squares away it can reach.
export const WEAPON_USE = {
  slingshot: { skill: 'aim', range: 6 },
  shortbow:  { skill: 'aim', range: 8 },
  dagger:    { skill: 'aim', range: 1, quick: true },
  rustknife: { skill: 'aim', range: 1, quick: true },
};
export function weaponUse(id) { return WEAPON_USE[id] || { skill: 'swing', range: 1 }; }

export default { WEAPON_USE, weaponUse };
