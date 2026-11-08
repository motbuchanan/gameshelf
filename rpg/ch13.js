// Chapter 13: The Clock Tower. Three ways in, the clockwork knights (an off switch, or a fight with things from
// the bag: oil makes them slip, water jams them), the gear floors (a pattern puzzle), Wren's door, and the chute.
// Text uses {name} for the hero's name. No em dashes.
import CH12 from './ch12.js';
import CH11 from './ch11.js';

export const TEXT = {
  ...CH12.TEXT,
  TEACH: { ...CH12.TEXT.TEACH, monsterturn: 'CLANK. CLANK. (The clockwork knight takes one slow step.)' },
  HERO_RANGED_HINT: 'Your weapon reaches far. Stay back where claws and swords can\'t reach you.',
  STUCK_TEACH: 'It\'s stuck! A stuck monster loses its next turn. Water jams clockwork for two turns.',
  CHATTER: {
    ...CH12.TEXT.CHATTER,
    n1: ['CLANK.', 'HALT. NO VISITORS.', 'CLANK. CLANK.'], n2: ['WHIRR. CLANK.', 'KEEP. OUT.', 'CLANK.'],
  },
};

const KNIGHT = (id, x, y) => ({ id, monster: 'knight', name: 'Clockwork knight', x, y });
const TOWER = [
  '#####__#####',
  '#__________#',
  '#__________#',
  '#_c______c_#',
  '#__________#',
  '#__________#',
  '#__________#',
  '#####__#####',
];

export const FIGHTS = {
  knights: {
    id: 'ch13-knights', xpKey: 'knights',
    xp: 7, xpWhy: 'You beat the clockwork knights!',
    mode: 'hp',
    map: TOWER,
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      KNIGHT('n1', 5, 2), KNIGHT('n2', 7, 2),
    ],
    team: { from: 'picked', exclude: ['inkwing', 'wren'], spots: [{ x: 4, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 7 }] },
    roundCap: 14, capResult: 'win', boost: { hp: 6, skill: 25 },
    taught: CH11.LEARNED, skipHeroFirst: true,
    meets: ['knight'],
    events: [{ round: 0, type: 'say', lines: [
      { who: 'pim', text: 'Clockwork knights are SUPER hard to hit. But they\'re slow!' },
      { who: 'juni', text: 'Use your bag! Tap the oil can to make one slip. Throw water to jam it. A stuck knight loses its turn.' },
    ] }],
    then: { win: 'knights_win', lose: 'knights_lose' },
  },
  knight1: {
    id: 'ch13-knight1', xpKey: 'knights',
    xp: 7, xpWhy: 'You beat the clockwork knight!',
    mode: 'hp',
    map: TOWER,
    units: [{ id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 }, KNIGHT('n1', 6, 2)],
    team: { from: 'picked', exclude: ['inkwing', 'wren'], spots: [{ x: 4, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 7 }] },
    roundCap: 14, capResult: 'win', boost: { hp: 6, skill: 25 },
    taught: CH11.LEARNED, skipHeroFirst: true,
    meets: ['knight'],
    events: [{ round: 0, type: 'say', lines: [{ who: 'juni', text: 'Only one knight left! It\'s really hard to hit, so try your bag: oil makes it slip, and water jams it.' }] }],
    then: { win: 'knights_win', lose: 'knights_lose' },
  },
  gearmice: {
    id: 'ch13-gearmice', xpKey: 'gearmice',
    xp: 3, xpWhy: 'You stopped the windup mice!',
    mode: 'hp',
    map: [
      '###########',
      '#_________#',
      '#__c___c__#',
      '#_________#',
      '#_________#',
      '#_________#',
      '#####_#####',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 5 },
      { id: 'm1', monster: 'mouse', name: 'Windup mouse', x: 2, y: 1 },
      { id: 'm2', monster: 'mouse', name: 'Windup mouse', x: 5, y: 1 },
      { id: 'm3', monster: 'mouse', name: 'Windup mouse', x: 8, y: 1 },
      { id: 'm4', monster: 'mouse', name: 'Windup mouse', x: 5, y: 2 },
    ],
    team: { from: 'picked', exclude: ['inkwing', 'wren'], spots: [{ x: 4, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 6 }] },
    roundCap: 10, capResult: 'win', boost: { hp: 0, skill: 38 },
    taught: CH11.LEARNED, skipHeroFirst: true,
    meets: ['mouse'],
    events: [{ round: 0, type: 'say', lines: [{ who: null, text: 'Oops! The wrong step woke up some windup mice!' }] }],
    then: { win: 'floor2', lose: 'floor2' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'Morning in Gearwick. Tick, tock, ding! The kids eat breakfast at the Rusty Spring Inn and look up at the clock tower.' },
      { who: 'toymaker', text: 'You\'re going up the tower? Then take this. An oil can, for stuck gears. Wren\'s machines hate oil on their feet.' },
      { who: 'juni', text: 'And I filled two buckets at the fountain. Water makes clockwork go fzzzt.' },
      { who: 'pim', text: 'Oil, water... we can throw these in a fight! Tap them on your turn.' },
    ],
    give: { items: { oil: 1, water: 2 } },
    next: 'team',
  },
  team: {
    lines: [{ who: 'narrator', text: 'The tower stairs are narrow and twisty. Only three friends can go up with you.' }],
    pickTeam: { size: 3, exclude: ['inkwing', 'wren'] },
    next: 'door',
  },
  // ----- getting in: three ways, three different clues -----
  door: {
    lines: [
      { who: 'narrator', text: 'The big tower door is locked tight. A sign says "KEEP OUT. I MEAN IT." Vines climb all the way up the wall to an open window.' },
      { who: 'nell', text: 'Three ways in. Pick one!' },
    ],
    choices: [
      { label: 'Use Old Tock\'s key', go: 'door_key', if: 'item:towerkey' },
      { label: 'Pick the lock', go: 'door_lock' },
      { label: 'Climb the vines to the window', go: 'door_climb' },
    ],
  },
  door_key: {
    use: 'towerkey',
    lines: [
      { who: 'narrator', text: 'Click. The old key turns. On the inside of the door, there\'s a dusty note, taped up a long time ago.' },
      { who: 'pim', text: 'It says: "Wren, come back anytime. The workbench is still yours. Old Tock." She never got it. She never comes in the front door.' },
    ],
    set: { tockNote: true },
    next: 'knights',
  },
  door_lock: { check: { skill: 'fingers', help: 'juni', lock: true, label: 'Pick the tower lock', great: 'door_picked', ok: 'door_picked', miss: 'door_stuck' } },
  door_picked: {
    lines: [
      { who: 'narrator', text: 'Click, click, CLUNK. The lock pops open. Inside the lock, tiny gears are shaped like little animals.' },
      { who: 'juni', text: 'Whoever made this lock made it for fun. Look, the gears are mice and cats. She plays, even when she builds locks.' },
    ],
    set: { lockToys: true },
    next: 'knights',
  },
  door_stuck: {
    lines: [{ who: 'narrator', text: 'The lock goes SPROING and won\'t budge. Okay, okay. The vines it is. Up we go!' }],
    next: 'door_climb',
  },
  door_climb: { check: { skill: 'climb', help: 'hollis', label: 'Climb the vines', great: 'door_window', ok: 'door_window', miss: 'door_slip' } },
  door_slip: {
    hurt: 1,
    lines: [{ who: 'narrator', text: 'Whoops! {name} slides down a vine and lands on a soft pile of leaves. Second try. Slower. Got it!' }],
    next: 'door_window',
  },
  door_window: {
    lines: [
      { who: 'narrator', text: 'Through the window, the kids tumble into a room full of drawings. One big drawing shows a grove of trees with silver leaves.' },
      { who: 'pim', text: 'There\'s an X under the biggest tree. And it says: "The star sleeps here." Wren drew a treasure map of Bramble\'s grove!' },
    ],
    set: { groveMap: true },
    next: 'knights',
  },
  // ----- the clockwork knights: an off switch, or a fight -----
  knights: {
    lines: [
      { who: 'narrator', text: 'Up the stairs: CLANK. CLANK. Two tall suits of armor step out to block the way. Their eyes glow yellow.' },
      { who: 'narrator', text: '"HALT. NO VISITORS," they say, in voices like a squeaky door.' },
      { who: 'bolt', text: 'Grrrr-click!', if: 'team:bolt' },
      { who: 'pim', text: 'Clockwork knights! Every machine has an off switch somewhere. If we can spot it...' },
    ],
    meet: ['knight'],
    choices: [
      { label: 'Look for the off switch', go: 'switch' },
      { label: 'Fight the clockwork knights', go: 'fight:knights' },
    ],
  },
  switch: { check: { skill: 'notice', help: 'pim', label: 'Spot the knights\' off switch', great: 'switch_both', ok: 'switch_one', miss: 'switch_miss' } },
  switch_both: {
    xpKey: 'knights', xp: 7, xpWhy: 'You switched off the knights! That counts as winning.',
    lines: [
      { who: 'narrator', text: 'There! A little brass lever behind each knight\'s knee. {name} ducks under a big sword. Click! Click!' },
      { who: 'narrator', text: 'Whirrrr... clunk. Both knights freeze, like statues. Phew!' },
    ],
    next: 'floor1',
  },
  switch_one: {
    lines: [
      { who: 'narrator', text: 'There! A brass lever behind the knee. Click! One knight freezes like a statue.' },
      { who: 'narrator', text: 'But the other one turns around. CLANK. "INTRUDER."' },
    ],
    next: 'fight:knight1',
  },
  switch_miss: {
    lines: [{ who: 'narrator', text: '{name} looks and looks, but the knights are already swinging. CLANK! Here they come!' }],
    next: 'fight:knights',
  },
  knights_win: {
    lines: [{ who: 'narrator', text: 'The last knight wobbles, creaks, and sits down with a big CLONK. Its eyes blink off.' }],
    next: 'floor1',
  },
  knights_lose: {
    lines: [
      { who: 'narrator', text: 'The knights push the kids back down the stairs. Then they stop. And stand still. And wait.' },
      { who: 'juni', text: 'They only guard the stairs. They don\'t chase. Wait for it... they\'re winding down!' },
      { who: 'narrator', text: 'Tick... tick... clunk. Both knights run out of wind. The kids tiptoe past.' },
    ],
    next: 'floor1',
  },
  // ----- the gear floors: a pattern puzzle with no timer -----
  floor1: {
    lines: [
      { who: 'narrator', text: 'The next floor is one giant gear, turning slowly. To cross, you have to step on the right tooth.' },
      { who: 'narrator', text: 'The teeth light up as they go by: RED, BLUE, RED, BLUE, RED...' },
      { who: 'juni', text: 'It\'s a pattern! Take your time. Which color comes next?' },
    ],
    choices: [
      { label: 'Blue comes next', go: 'floor1_ok' },
      { label: 'Red comes next', go: 'floor1_oops' },
    ],
  },
  floor1_ok: {
    xp: 1, xpWhy: 'You figured out the pattern!',
    lines: [{ who: 'narrator', text: 'BLUE! {name} steps on the blue tooth and rides it all the way across. Everyone follows. Easy!' }],
    next: 'floor2',
  },
  floor1_oops: {
    lines: [{ who: 'narrator', text: 'RED... no! It was blue. The gear clanks, and a little door in the wall pops open. Squeak squeak squeak!' }],
    next: 'fight:gearmice',
  },
  floor2: {
    lines: [
      { who: 'narrator', text: 'One more gear floor. This one is trickier: RED, RED, BLUE, RED, RED, BLUE, RED, RED...' },
      { who: 'pim', text: 'Look for the part that repeats. Red, red, blue. Red, red, blue. Red, red...' },
    ],
    choices: [
      { label: 'Blue comes next', go: 'floor2_ok' },
      { label: 'Red comes next', go: 'floor2_oops' },
    ],
  },
  floor2_ok: {
    xp: 1, xpWhy: 'You figured out the pattern!',
    lines: [{ who: 'narrator', text: 'BLUE! Step, ride, hop. Everyone makes it across.' }],
    next: 'trap',
  },
  floor2_oops: {
    lines: [
      { who: 'narrator', text: 'Bonk! The gear bumps {name} right back to the start. No mice this time. Just a bump.' },
      { who: 'pim', text: 'Red, red, BLUE. Red, red, BLUE. Red, red...' },
    ],
    choices: [
      { label: 'Blue comes next', go: 'floor2_ok' },
      { label: 'Red comes next', go: 'floor2_oops' },
    ],
  },
  // ----- a trapped stair (Sniffle's nose helps from home) -----
  trap: {
    lines: [{ who: 'narrator', text: 'The last stairs. One step looks a little different from the others. Shinier. Newer.' }],
    check: { skill: 'notice', help: 'nell', trap: true, label: 'Find the trap step', great: 'trap_found', ok: 'trap_found', miss: 'trap_sprung' },
  },
  trap_found: {
    lines: [{ who: 'narrator', text: 'A trap step! {name} hops right over it. Everyone hops too. Hop, hop, hop!' }],
    next: 'wrendoor',
  },
  trap_sprung: {
    lines: [{ who: 'narrator', text: 'SPROING! The step flips, and a shower of soft feathers falls on everyone. Achoo! It\'s a silly trap. Nobody is hurt, just fluffy.' }],
    next: 'wrendoor',
  },
  // ----- Wren's door -----
  wrendoor: {
    lines: [
      { who: 'narrator', text: 'At the top is a little round door. It\'s covered in drawings: animals, each with a name. "Pip. Clank. Mr. Whiskers. Bolt."' },
      { who: 'narrator', text: 'And in the middle, a drawing of kids playing tag. Under it, in small letters: "KNOCK. (Nobody ever knocks.)"' },
      { who: 'nell', text: 'Those are friends. She made friends. And she wants someone to knock.' },
    ],
    choices: [
      { label: 'Knock on the door', go: 'knock' },
      { label: 'Just open it', go: 'bellroom' },
    ],
  },
  knock: {
    lines: [
      { who: 'narrator', text: 'Knock, knock, knock. Nobody answers. But from far away, deep inside the tower, something goes "...hello?"' },
      { who: 'nell', text: 'Did you hear that? Somebody heard us.' },
    ],
    set: { knocked: true },
    next: 'bellroom',
  },
  bellroom: {
    lines: [
      { who: 'narrator', text: 'Behind the door is the bell room, right under the giant clock. A big bell hangs in the middle. It\'s empty. Nobody is home.' },
      { who: 'narrator', text: 'In the corner, {name} finds a fishing net. "For catching runaway mice," says the label. That might come in handy!' },
      { who: 'pim', text: 'Let\'s rest here. My legs are noodles.' },
    ],
    give: { items: { net: 1 } },
    heal: true,
    levelUp: true,
    next: 'chute',
  },
  chute: {
    lines: [
      { who: 'narrator', text: 'Then the big clock strikes. BONG. BONG. BONG.' },
      { who: 'narrator', text: 'And the floor... tips. Everyone slides into a big brass chute. Down, down, DOWN, around and around!' },
      { who: 'tobin', text: 'WHEEEEEE!', if: 'team:tobin' },
      { who: 'hollis', text: 'AAAAAAAH!', if: 'team:hollis' },
      { who: 'narrator', text: 'Far below the tower, a light is glowing. Something huge is ticking down there.' },
    ],
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 13', text: 'You got the oil can and a net! Next: Chapter 14, The Clockwork Workshop.' },
};

export default { SCENES, FIGHTS, TEXT };
