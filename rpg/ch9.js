// Chapter 9: The Old Tower. The Thornwood, items from the bag, tower puzzles, clockwork owls, and Bramble's diary.
// Text uses {name} for the hero's name. No em dashes.
import CH8 from './ch8.js';
import CH7 from './ch7.js';

export const TEXT = {
  ...CH8.TEXT,
  TEACH: { ...CH8.TEXT.TEACH, monsterturn: 'TICK. TOCK. INTRUDERS. (The owl\'s eyes glow.)' },
  CHATTER: {
    ...CH8.TEXT.CHATTER,
    o1: ['TICK. TOCK.', 'HOO. HOO.', 'WHIRR.'], o2: ['TOCK. TICK.', 'HOO.', 'CLANK.'], o3: ['WHIRRR.', 'HOO HOO.', 'TICK.'],
    v1: ['Caw!', 'Go away!', 'Caw caw!'], v2: ['Grrr!', 'Snarl!', 'Woof!'], v3: ['Caw!', 'Caw caw!', 'Shoo!'],
  },
};

export const FIGHTS = {
  thorns: {
    id: 'ch9-thorns',
    mode: 'hp',
    map: [
      'ttt..t..ttt',
      't..b...b..t',
      '...........',
      '..L.....L..',
      '...........',
      't..b...b..t',
      'tt.......tt',
      'ttt..t..ttt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 'v1', monster: 'crow', name: 'Crow', x: 3, y: 1 },
      { id: 'v2', monster: 'wolf', name: 'Wolf', x: 5, y: 1 },
      { id: 'v3', monster: 'crow', name: 'Crow', x: 7, y: 1 },
    ],
    team: { from: 'party', exclude: ['inkwing'], spots: [{ x: 4, y: 6 }, { x: 6, y: 6 }, { x: 3, y: 6 }, { x: 7, y: 6 }, { x: 4, y: 5 }, { x: 6, y: 5 }] },
    roundCap: 10, capResult: 'win', boost: { hp: 2, skill: 12 },
    taught: CH7.LEARNED, skipHeroFirst: true,
    then: { win: 'tower_door', lose: 'thorns_lose' },
  },
  owls: {
    id: 'ch9-owls',
    mode: 'hp',
    map: [
      'ttttttttttt',
      't....L....t',
      't.........t',
      't..b...b..t',
      't.........t',
      't...L.L...t',
      't.........t',
      'ttttttttttt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 'o1', monster: 'owl', name: 'Owl', x: 3, y: 1 },
      { id: 'o2', monster: 'owl', name: 'Owl', x: 7, y: 1 },
      { id: 'o3', monster: 'owl', name: 'Owl', x: 5, y: 2 },
    ],
    team: { from: 'picked', exclude: ['inkwing'], spots: [{ x: 3, y: 6 }, { x: 7, y: 6 }, { x: 4, y: 6 }] },
    roundCap: 14, capResult: 'win', boost: { hp: 0, skill: 10 },
    taught: CH7.LEARNED, skipHeroFirst: true,
    meets: ['owl'],
    events: [{ round: 0, type: 'say', lines: [{ who: 'pim', text: 'Clockwork owls! Their brass is really hard to hit, and fire barely warms them. Spark only does half.' }, { who: 'juni', text: 'But they\'re SLOW. Gang up on one at a time!' }] }],
    then: { win: 'owls_win', lose: 'owls_lose' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'The old tower stands on a hill past Riverbend. Between the town and the tower is the Thornwood: a forest of twisty, thorny vines.' },
      { who: 'nell', text: 'The vines are MOVING. That is not normal.' },
      { who: 'pim', text: 'It\'s so dark in there. We need light.' },
    ],
    nextIf: [{ if: 'item:lantern', go: 'lantern' }, { if: 'spark', go: 'spark_light' }],
    next: 'dark_path',
  },
  lantern: {
    lines: [{ who: 'narrator', text: '{name} lights the lantern from the Riverbend market. The vines curl away from the light!' }],
    next: 'ravine',
  },
  spark_light: {
    lines: [{ who: 'pim', text: 'Spark! ...Look, the vines don\'t like light. They\'re backing away!' }],
    next: 'ravine',
  },
  dark_path: {
    hurt: 1,
    lines: [{ who: 'narrator', text: 'It is very dark. Vines scratch everybody\'s arms. Ouch, ouch, ouch.' }],
    next: 'ravine',
  },
  ravine: {
    lines: [{ who: 'narrator', text: 'Halfway through, the path stops at a deep, rocky ravine. The tower is on the other side.' }],
    nextIf: [{ if: 'item:rope', go: 'rope' }],
    next: 'no_rope',
  },
  rope: {
    lines: [
      { who: 'narrator', text: '{name} ties the rope from the market to a big tree, and everyone swings across one at a time. WHEEE!' },
      { who: 'tobin', text: 'Again! Can we do that again?' },
    ],
    use: 'rope',
    next: 'tower_door',
  },
  no_rope: {
    lines: [
      { who: 'juni', text: 'No rope. We\'ll have to go the long way around.' },
      { who: 'narrator', text: 'The long way goes right past a nest of crows, and a very grumpy wolf.' },
    ],
    next: 'fight:thorns',
  },
  thorns_lose: {
    lines: [{ who: 'narrator', text: 'The crows and the wolf chase the kids back into the vines.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:thorns', retry: true },
      { label: 'See what happens', go: 'thorns_see' },
    ],
  },
  thorns_see: {
    lines: [{ who: 'narrator', text: 'The kids hide in a hollow log until the wolf gets bored. Then they tiptoe the rest of the way to the tower.' }],
    next: 'tower_door',
  },
  tower_door: {
    lines: [
      { who: 'narrator', text: 'The tower door is tiny. Only a few kids can squeeze through at once.' },
      { who: 'hollis', text: 'The rest of us will guard the way back. Pick who goes in with you.' },
    ],
    pickTeam: { size: 3, exclude: ['inkwing'] },
    next: 'levers',
  },
  levers: {
    lines: [
      { who: 'narrator', text: 'Floor one. A locked door, and three levers: a red one, a blue one, and a yellow one. On the wall, a faded painting.' },
      { who: 'pim', text: 'Look closely at the painting. I bet it\'s a hint.' },
    ],
    check: { skill: 'notice', help: 'pim', label: 'Look closely at the painting', great: 'levers_hint', ok: 'levers_hint', miss: 'levers_guess' },
  },
  levers_hint: {
    lines: [{ who: 'hero', text: 'The painting shows a sunrise! The sky goes... blue, then red, then yellow when the sun comes up!' }],
    choices: [
      { label: 'Blue, red, yellow', go: 'levers_ok' },
      { label: 'Red, yellow, blue', go: 'levers_bad' },
      { label: 'Yellow, blue, red', go: 'levers_bad' },
    ],
  },
  levers_guess: {
    lines: [{ who: 'hero', text: 'I can\'t tell what the painting is. Something about the sky? I\'ll have to guess.' }],
    choices: [
      { label: 'Blue, red, yellow', go: 'levers_ok' },
      { label: 'Red, yellow, blue', go: 'levers_bad' },
      { label: 'Yellow, blue, red', go: 'levers_bad' },
    ],
  },
  levers_bad: {
    hurt: 1,
    lines: [{ who: 'narrator', text: 'CLUNK. A trapdoor opens, and a bucket of cold water dumps on everybody. Brrr! The levers reset. Try again!' }],
    choices: [
      { label: 'Blue, red, yellow', go: 'levers_ok' },
      { label: 'Red, yellow, blue', go: 'levers_bad' },
      { label: 'Yellow, blue, red', go: 'levers_bad' },
    ],
  },
  levers_ok: {
    lines: [{ who: 'narrator', text: 'Click, click, CLICK. The door swings open! Up the stairs to floor two.' }],
    next: 'mirror',
  },
  mirror: {
    lines: [
      { who: 'narrator', text: 'Floor two. A sunbeam comes in a window and hits the floor. Across the room, a lock is shaped like a sun. In the corner, a big mirror on wheels.' },
      { who: 'juni', text: 'Ooh, a light puzzle. What do we do with the mirror?' },
    ],
    choices: [
      { label: 'Roll the mirror into the sunbeam', go: 'mirror_ok' },
      { label: 'Hit the lock really hard', go: 'mirror_bonk' },
      { label: 'Look at yourself in the mirror', go: 'mirror_silly' },
    ],
  },
  mirror_bonk: {
    lines: [{ who: 'narrator', text: 'BONK. The lock does not care. Hollis\'s broom handle is now a little shorter.' }],
    choices: [
      { label: 'Roll the mirror into the sunbeam', go: 'mirror_ok' },
      { label: 'Look at yourself in the mirror', go: 'mirror_silly' },
    ],
  },
  mirror_silly: {
    lines: [{ who: 'narrator', text: '{name} makes a silly face in the mirror. Tobin makes a sillier one. Very fun, but the lock is still locked.' }],
    choices: [
      { label: 'Roll the mirror into the sunbeam', go: 'mirror_ok' },
      { label: 'Hit the lock really hard', go: 'mirror_bonk' },
    ],
  },
  mirror_ok: {
    lines: [{ who: 'narrator', text: 'The sunbeam bounces off the mirror and lands right on the sun lock. It glows, and CLICK! Up to floor three.' }],
    next: 'tiles',
  },
  tiles: {
    lines: [
      { who: 'narrator', text: 'Floor three. The whole floor is wooden tiles. Some of them creak. Somewhere above, something goes TICK. TOCK.' },
      { who: 'nell', text: 'If we step on a creaky one, whatever that is will hear us. Walk only on the quiet tiles.' },
    ],
    check: { skill: 'sneak', help: 'nell', label: 'Tiptoe on the quiet tiles', great: 'tiles_quiet', ok: 'tiles_quiet', miss: 'tiles_creak' },
  },
  tiles_quiet: {
    lines: [{ who: 'narrator', text: 'Tiptoe, tiptoe. Not one creak. At the top of the stairs: three brass owls with glowing eyes. They haven\'t noticed you yet.' }],
    set: { quietTiles: true },
    next: 'owls_spot',
  },
  tiles_creak: {
    lines: [{ who: 'narrator', text: 'CREEEAK. TICK. TOCK. TICK. Three brass owls swivel their heads toward you, eyes glowing.' }],
    next: 'owls_spot',
  },
  owls_spot: {
    lines: [{ who: 'pim', text: 'Clockwork owls! Bramble\'s guards!' }],
    choices: [
      { label: 'Sneak past them', go: 'owls_sneak', if: 'quietTiles' },
      { label: 'Fight them', go: 'fight:owls' },
    ],
  },
  owls_sneak: { check: { skill: 'sneak', help: 'nell', label: 'Sneak past the clockwork owls', great: 'owls_snuck', ok: 'owls_snuck', miss: 'owls_noticed' } },
  owls_snuck: {
    lines: [{ who: 'narrator', text: 'The owls tick and tock and stare at the wall. The kids slip right past them, up the last stairs.' }],
    next: 'diary',
  },
  owls_noticed: {
    lines: [{ who: 'narrator', text: 'Oops. One owl turns its head all the way around. HOO. HOO. INTRUDERS.' }],
    next: 'fight:owls',
  },
  owls_win: {
    lines: [{ who: 'narrator', text: 'The last owl winds down. Tick... tock... tick... clunk. The way up is open.' }],
    next: 'diary',
  },
  owls_lose: {
    lines: [{ who: 'narrator', text: 'The owls flap their brass wings and herd the kids back down the stairs.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:owls', retry: true },
      { label: 'See what happens', go: 'owls_see' },
    ],
  },
  owls_see: {
    lines: [
      { who: 'narrator', text: 'The owls go back to their spots. But they forget one thing: clockwork needs winding.' },
      { who: 'juni', text: 'Watch. Their keys are in their backs. Just wait.' },
      { who: 'narrator', text: 'Tick... tock... tick... clunk. One by one, the owls wind down and stop. The kids walk right past.' },
    ],
    next: 'diary',
  },
  diary: {
    lines: [
      { who: 'narrator', text: 'The top floor is a cozy room full of plants and crow feathers. On the desk is an old leather diary.' },
      { who: 'pim', text: 'It\'s Bramble\'s diary. Look, a drawing of silver trees. "My grove. My beautiful grove."' },
      { who: 'pim', text: 'And this page: "If no one lives near the woods, no one can ever cut them down again."' },
      { who: 'nell', text: 'She\'s not trying to be mean. She\'s trying to protect the trees.' },
      { who: 'hollis', text: 'She still scared our whole town. And she sent Grubjaw.' },
      { who: 'juni', text: 'Both things can be true.' },
    ],
    set: { diary: true },
    heal: true,
    levelUp: true,
    next: 'roof',
  },
  roof: {
    lines: [
      { who: 'narrator', text: 'Then the ceiling opens like a flower. Above them is the tower roof, and the sky is black with crows.' },
      { who: 'narrator', text: 'And standing in the middle of the roof, holding a crooked staff, is an old woman in a crown of black feathers.' },
    ],
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 9', text: 'Next: Chapter 10, Bramble. Will you fight, or will you talk?' },
};

export default { SCENES, FIGHTS, TEXT };
