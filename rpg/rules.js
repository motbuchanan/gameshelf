// Core rules: percentile checks, result tiers, second chances, dice notation.
// Exact values come from kid-rpg-plan.md "Rules values".
import { int } from './rng.js';

export const SKILL_CAP = 95;
export const TIERS = ['legendary', 'exceptional', 'success', 'fail', 'disaster'];
export const TIER_LABEL = {
  legendary: 'Legendary!',
  exceptional: 'Exceptional',
  success: 'Success',
  fail: 'Fail',
  disaster: 'Disaster!',
};

export function clampSkill(s) {
  return Math.max(1, Math.min(SKILL_CAP, Math.round(s)));
}

// Roll d100 from two d10s. tens: 0..9 (shown 00..90), ones: 0..9. 00 + 0 = 100.
export function rollD100() {
  const tens = int(0, 9);
  const ones = int(0, 9);
  return makeRoll(tens, ones);
}

export function makeRoll(tens, ones) {
  const v = tens * 10 + ones;
  return { tens, ones, value: v === 0 ? 100 : v };
}

// Zone edges for a skill, used by the chart and by tierFor.
export function zones(skill) {
  const S = clampSkill(skill);
  return {
    legendaryMax: Math.max(1, Math.floor(S / 10)),
    exceptionalMax: Math.floor(S / 2),
    successMax: S,
    disasterMin: 96,
  };
}

export function tierFor(skill, value) {
  const z = zones(skill);
  if (value <= z.legendaryMax) return 'legendary';
  if (value <= z.exceptionalMax) return 'exceptional';
  if (value <= z.successMax) return 'success';
  if (value >= z.disasterMin) return 'disaster';
  return 'fail';
}

// Flip the dice: swap tens and ones. 00 + 0 (100) stays 100.
export function flip(roll) {
  if (roll.value === 100) return makeRoll(0, 0);
  return makeRoll(roll.ones, roll.tens);
}

// Companion help: shift the result up one tier.
export function shiftUp(tier) {
  const i = TIERS.indexOf(tier);
  return TIERS[Math.max(0, i - 1)];
}

// Dice notation: "1d20", "2d4+1", "3d6-2", "1d6 + 1d8 + 2"
export const DIE_SIDES = [4, 6, 8, 10, 12, 20];
export function parseDice(notation) {
  const s = String(notation).replace(/\s+/g, '').toLowerCase();
  if (!s) throw new Error('empty dice notation');
  const parts = s.match(/[+-]?[^+-]+/g);
  const dice = [];
  let mod = 0;
  for (const p of parts) {
    const sign = p[0] === '-' ? -1 : 1;
    const body = p.replace(/^[+-]/, '');
    const m = body.match(/^(\d*)d(\d+)$/);
    if (m) {
      const count = m[1] === '' ? 1 : parseInt(m[1], 10);
      const sides = parseInt(m[2], 10);
      if (sign < 0) throw new Error('negative dice not supported: ' + notation);
      if (!DIE_SIDES.includes(sides) && sides !== 100) throw new Error('unknown die d' + sides);
      if (count < 1 || count > 12) throw new Error('dice count out of range: ' + notation);
      for (let i = 0; i < count; i++) dice.push(sides);
    } else if (/^\d+$/.test(body)) {
      mod += sign * parseInt(body, 10);
    } else {
      throw new Error('bad dice notation: ' + notation);
    }
  }
  return { dice, mod };
}

export function rollDice(notation) {
  const { dice, mod } = parseDice(notation);
  const rolled = dice.map(sides => ({ sides, value: int(1, sides) }));
  const total = rolled.reduce((a, d) => a + d.value, 0) + mod;
  return { dice: rolled, mod, total };
}

export default { SKILL_CAP, TIERS, TIER_LABEL, clampSkill, rollD100, makeRoll, zones, tierFor, flip, shiftUp, parseDice, rollDice, DIE_SIDES };
