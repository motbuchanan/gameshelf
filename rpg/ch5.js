// Chapter 5: The Gnoll's Camp. Pick your team, sneak or walk in, and the boss fight with Grubjaw.
// Text uses {name} for the hero's name. No em dashes.
import CH4 from './ch4.js';
import CH3 from './ch3.js';

export const TEXT = {
  ...CH4.TEXT,
  TEACH: { ...CH4.TEXT.TEACH, dodge: 'Red squares! Get out of the red squares before he swings!' },
  SURPRISE: 'We snuck in the back! We get to go first, every one of us!',
  WINDUP: 'Heh. Heh heh. HEH HEH HEH.',
  WINDUP_WARN: 'HA HA HA HA HA!',
  WARN_LINE: 'He\'s LAUGHING! Sniffle said that means the big swing is next. Get out of the red squares!',
  SWEEP: 'FLAIL SWEEEEP!',
  SWEEP_HIT: 'HA HA! Bonk bonk bonk!',
  SWEEP_MISS: 'Hey! Hold still, you little pests!',
  SCARED: 'FIRE! NO NO NO! Keep it away from me!',
  CAGE_OPEN: 'FINALLY! I was getting so bored. Hand me that. Now let me at him!',
  HERO_OUT: 'You\'re knocked down and dizzy! Sit tight. Your friends keep fighting.',
  CHATTER: {
    ...CH4.TEXT.CHATTER,
    grubjaw: ['HA HA HA!', 'Tiny heroes! How cute!', 'Grubjaw will squash you!'],
    juni: ['Hit him again!', 'I fixed his wagon to fall apart, by the way.', 'For Millbrook!'],
    g1: ['Boss is watching! Fight hard!', 'Hee hee!', 'Shiny bucket!'],
    g2: ['Hold still!', 'Pew!', 'Almost!'],
    g3: ['Grab them!', 'Hee hee!', 'Boss! Help!'],
    k1: ['Yip!', 'For the boss!', 'Yip yip!'],
    k2: ['Achoo!', 'Yap!', 'Get them!'],
  },
};

export const FIGHTS = {
  boss: {
    id: 'ch5-boss',
    xp: 12, floor: 3, xpWhy: 'You beat Grubjaw!',
    mode: 'hp',
    map: [
      'ttt.....ttt',
      't....L....t',
      '..b.....b..',
      '...........',
      '.L..m..m.L.',
      '..b.....b..',
      't.........t',
      'ttt.....ttt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 1, y: 3 },
      { id: 'grubjaw', monster: 'gnoll', name: 'Grubjaw', x: 8, y: 3 },
      { id: 'g1', monster: 'goblin', name: 'Snag', x: 7, y: 2 },
      { id: 'g3', monster: 'goblin', name: 'Nix', x: 7, y: 5 },
      { id: 'g2', monster: 'goblinarcher', name: 'Twitch', x: 10, y: 3 },
      { id: 'k1', monster: 'kobold', name: 'Yap', x: 6, y: 6 },
      { id: 'k2', monster: 'kobold', name: 'Snik', x: 8, y: 6 },
      { id: 'juni', side: 'hero', ai: 'none', bestAt: 'brave', x: 9, y: 1, bystander: true },
    ],
    team: { from: 'picked', exclude: ['juni'], spots: [{ x: 2, y: 2 }, { x: 2, y: 4 }, { x: 1, y: 5 }] },
    cage: { x: 9, y: 1, kid: 'juni', opener: 'nell' },
    surpriseIf: ['snuckIn', 'escape'],
    warnIf: 'laugh',
    fireIf: 'fire',
    roundCap: 14, capResult: 'win', boost: { hp: 3, skill: 12 },
    taught: { ...CH3.LEARNED, area: true }, skipHeroFirst: true,
    meets: ['gnoll'],
    events: [
      { round: 0, type: 'remove', ids: ['g1'],
        lines: [{ who: 'narrator', text: 'From the far side of the camp, the friends who stayed outside bang pots and yell. One goblin runs off to see what all the noise is.' }] },
      { round: 0, type: 'remove', ids: ['g3'], if: 'buttons',
        lines: [{ who: 'nell', text: 'Hey, goblins! SHINY BUTTONS!' }, { who: 'narrator', text: 'Nell throws a handful of buttons into the bushes. A goblin squeals and dives after them.' }] },
      { round: 0, type: 'remove', ids: ['g2'], if: 'guardGone',
        lines: [{ who: 'narrator', text: 'Twitch, the goblin with the bow, is nowhere to be seen. He went to find lunch, just like he said.' }] },
      { round: 0, type: 'remove', ids: ['k1', 'k2'], if: 'party:sniffle',
        lines: [{ who: 'sniffle', text: 'Kobolds! It\'s me, Sniffle! These kids are NICE! Go home, have a snack!' }, { who: 'narrator', text: 'The kobolds look at each other, shrug, and wander off. They never liked Grubjaw much anyway.' }] },
      { round: 1, type: 'scare', id: 'grubjaw', turns: 1, if: ['torch', 'fire'],
        lines: [{ who: 'hollis', text: 'Hey, Grubjaw! Look what we brought! Gran\'s TORCH!' }] },
    ],
    then: { win: 'victory', lose: 'boss_lose' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'Grubjaw\'s camp is in an old stone quarry. Tents, a smoky fire, and piles of stolen stuff everywhere.' },
      { who: 'narrator', text: 'In the middle is a wooden cage wagon. And in the cage is Juni, banging on a squeaky wheel with a rock.' },
      { who: 'tobin', text: 'She\'s okay! She\'s making it squeak on purpose. Grubjaw HATES that.' },
      { who: 'narrator', text: 'Then Grubjaw himself walks out of the biggest tent. He is huge. He has a hyena head, a spiky flail, and a laugh like thunder.' },
      { who: 'hollis', text: 'Okay. There are too many of us to sneak in together.' },
    ],
    next: 'team',
  },
  team: {
    lines: [{ who: 'hollis', text: 'Pick who goes in with you. Everybody else makes a distraction outside.' }],
    pickTeam: { size: 3, exclude: ['juni'] },
    next: 'plan',
  },
  plan: {
    lines: [
      { who: 'narrator', text: 'The team is ready. The friends staying outside sneak around to the far side of the camp with pots and pans.' },
      { who: 'nell', text: 'Remember: when he laughs, get out of the way.', if: 'laugh' },
      { who: 'pim', text: 'And he\'s scared of fire. Spark will make him jump!', if: ['fire', 'spark'] },
    ],
    next: 'ways',
  },
  // Three ways to start: the plan, a peek in Grubjaw's tent (a clue), or talking the cage guard out of the fight.
  ways: {
    lines: [{ who: 'hollis', text: 'Last chance to change the plan. What do we do, {name}?' }],
    set: { guardGone: false, snuckIn: false },
    choices: [
      { label: 'Stick to the plan: pots and pans!', go: 'go_in' },
      { label: 'Sneak into Grubjaw\'s tent first', go: 'tent_sneak' },
      { label: 'Talk to the goblin guarding the cage', go: 'guard_talk' },
    ],
  },
  go_in: { nextIf: [{ if: 'backdoor', go: 'sneak_in' }], next: 'front_in' },
  tent_sneak: { check: { skill: 'sneak', help: 'nell', label: 'Sneak into the big tent', great: 'tent', ok: 'tent', miss: 'tent_caught', disaster: 'tent_pots' } },
  tent: {
    xp: 2, xpWhy: 'You found a clue!',
    lines: [
      { who: 'narrator', text: 'Inside the big tent: a pile of old soup bones, a very stinky blanket, and a little table covered in papers.' },
      { who: 'narrator', text: 'Most of the papers have black feathers on them. But one note is in tidy little letters, nothing like the others.' },
      { who: 'narrator', text: '"Bring me anything that glows. I pay in gears. W." Next to it sits a neat little stack of shiny brass gears.' },
      { who: 'hero', text: 'W? Who is W? And why would a gnoll want gears?' },
      { who: 'narrator', text: 'There\'s a bottle of strawberry potion on the table, too. {name} takes it. Then the team slips back out, quiet as mice.' },
    ],
    give: { items: { potion: 1 } },
    set: { wNote0: true },
    next: 'go_in',
  },
  tent_caught: {
    lines: [{ who: 'narrator', text: 'A goblin sees {name}\'s feet sticking out under the tent flap. "INTRUDERS! BOSS! INTRUDERS!" No time for the plan now!' }],
    next: 'front_in',
  },
  tent_pots: {
    lines: [
      { who: 'narrator', text: 'OOPS! {name} trips right over the pots and pans the others were saving for the distraction. CRASH! BANG! CLANG-A-LANG!' },
      { who: 'narrator', text: 'Every monster in the camp turns around. Well. That is ONE way to make a distraction.' },
    ],
    next: 'front_in',
  },
  guard_talk: { check: { skill: 'cheer', help: 'pudge', label: 'Cheer up the grumpy cage guard', great: 'guard_gone', ok: 'guard_gone', miss: 'guard_no' } },
  guard_gone: {
    xp: 2, xpWhy: 'You talked a goblin out of the fight!',
    lines: [
      { who: 'narrator', text: 'A skinny goblin with a bow is guarding the cage. He looks tired. And hungry. And bored.' },
      { who: 'hero', text: 'Hey. You look like you\'ve been standing there all day. Does Grubjaw ever say thank you?' },
      { who: 'narrator', text: '"...No," says the goblin. "Never. Not once. And he eats all the good snacks."' },
      { who: 'pudge', text: 'Twitch! It\'s me, Pudge! These kids SHARE. Come on, there\'s pie in their town!', if: 'party:pudge' },
      { who: 'narrator', text: 'The goblin thinks about it. Then he hangs his bow on the cage, yawns, and wanders off to find lunch.' },
    ],
    set: { guardGone: true },
    next: 'go_in',
  },
  guard_no: {
    lines: [{ who: 'narrator', text: 'The goblin squints at {name}. "Nice try, soap-smeller. BOSS! BOSS! They\'re HERE!"' }],
    next: 'front_in',
  },
  sneak_in: {
    lines: [
      { who: 'narrator', text: '{name} tries the key from the goblin warren on the camp\'s back gate. Click! It opens without a sound.' },
      { who: 'narrator', text: 'The team creeps right up behind Grubjaw before he knows they\'re there.' },
    ],
    set: { snuckIn: true },
    next: 'fight:boss',
  },
  front_in: {
    lines: [
      { who: 'narrator', text: 'The team marches right in the front gate.' },
      { who: 'narrator', text: 'Grubjaw turns around and grins with all his teeth.' },
    ],
    next: 'fight:boss',
  },
  boss_lose: {
    lines: [
      { who: 'narrator', text: 'Grubjaw sweeps the kids off their feet and laughs and laughs.' },
      { who: 'narrator', text: '"Into the cage with the other one! HA HA HA!"' },
    ],
    choices: [
      { label: 'Try the fight again', go: 'fight:boss', retry: true },
      { label: 'See what happens', go: 'cages' },
    ],
  },
  cages: {
    lines: [
      { who: 'narrator', text: 'Grubjaw tosses everyone into the cage wagon with Juni. CLANG goes the door.' },
      { who: 'juni', text: 'Oh, hi, everybody. Took you long enough.' },
      { who: 'narrator', text: 'That night, while Grubjaw snores, Juni pulls a piece of string out of her pocket and starts fiddling with the lock.' },
      { who: 'juni', text: 'I built this lock to break. I just needed someone to rescue first. Ready?' },
      { who: 'narrator', text: 'Click. The cage swings open. Grubjaw is still snoring. This time, the kids get the jump on him.' },
    ],
    set: { escape: true },
    next: 'fight:boss',
  },
  victory: {
    lines: [
      { who: 'narrator', text: 'Grubjaw drops his flail. He backs away, looking at all the kids.' },
      { who: 'narrator', text: '"Ha... ha ha... okay, okay! You win! Grubjaw is going on a very long trip! Far away! Bye!"' },
      { who: 'narrator', text: 'And he runs into the woods, laughing a nervous little laugh. As he goes, a letter falls out of his belt.' },
      { who: 'juni', text: 'Is it over? Is it actually over?' },
      { who: 'hollis', text: 'It\'s over. Everybody is together again.' },
      { who: 'juni', text: 'Good. Because I am STARVING. And I want to go HOME.' },
      { who: 'pim', text: 'Wait. What\'s this letter? It has a black feather on it...' },
    ],
    join: 'juni',
    set: { letter: true, beatGrubjaw: true },
    meet: ['gnoll'],
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 5', text: 'Next: Chapter 6, Home Again. Millbrook is waiting!' },
};

export default { SCENES, FIGHTS, TEXT };
