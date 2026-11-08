// Chapter 14: The Clockwork Workshop. Under the tower: a gear bridge puzzle, moving floors, a trap, a room of
// sleeping clockwork animals (tiptoe past or fight), Wren's diary, the clockwork zoo (talk the brass bear down
// or fight), and the Starstone.
// Text uses {name} for the hero's name. No em dashes.
import CH13 from './ch13.js';
import CH11 from './ch11.js';

export const TEXT = {
  ...CH13.TEXT,
  TEACH: { ...CH13.TEXT.TEACH, monsterturn: 'Tick tick whirr! (The clockwork animals wake up.)' },
  BELT_TEACH: 'The floor is moving! Anyone standing on a moving floor slides one square at the end of their turn. Monsters too!',
  TALK_TARGET: 'the brass bear',
  TALK_WHO: 'bear',
  CALM_LINES: [
    'Grrr... click? (The bear tilts its big brass head.)',
    'Rrrrr. (It stops growling and sniffs {name}\'s hand. Sniff, sniff.)',
    'Mrrrr. (The brass bear sits down like a big puppy. The other animals sit down too.)',
  ],
  TALK_FAIL: 'GRRRR-CLANK! (The bear doesn\'t want to listen yet.)',
  CHATTER: {
    ...CH13.TEXT.CHATTER,
    bear: ['GRRR-CLANK.', 'Rrrrr. Whirr.', 'GRRRR.'],
    w1: ['Tweet-click!', 'Peck peck!', 'Tweet!'], w2: ['Chirp-whirr!', 'Tweet tweet!', 'Peck!'], w3: ['Tweet!', 'Click-chirp!', 'Flap flap!'],
  },
};

const MOUSE = (id, x, y) => ({ id, monster: 'mouse', name: 'Windup mouse', x, y });
const BIRD = (id, x, y) => ({ id, monster: 'bird', name: 'Clockwork bird', x, y });

export const FIGHTS = {
  sleepers: {
    id: 'ch14-sleepers', xpKey: 'sleepers',
    xp: 5, xpWhy: 'You stopped the clockwork animals!',
    mode: 'hp',
    map: [
      '############',
      '#__________#',
      '#_c______c_#',
      '#>>>>>>>>>>#',
      '#__________#',
      '#<<<<<<<<<<#',
      '#__________#',
      '#####__#####',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      MOUSE('m1', 2, 1), MOUSE('m2', 5, 1), MOUSE('m3', 8, 1), MOUSE('m4', 10, 2),
      BIRD('w1', 3, 2), BIRD('w2', 7, 2),
    ],
    team: { from: 'picked', exclude: ['inkwing', 'wren'], spots: [{ x: 4, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 7 }] },
    roundCap: 12, capResult: 'win', boost: { hp: 3, skill: 40 },
    taught: CH11.LEARNED, skipHeroFirst: true,
    meets: ['mouse', 'bird'],
    events: [{ round: 0, type: 'say', lines: [{ who: 'juni', text: 'Look at the floor! Those stripes are moving floors. Stand on one and it slides you along at the end of your turn.' }] }],
    then: { win: 'sleepers_win', lose: 'sleepers_lose' },
  },
  zoo: {
    id: 'ch14-zoo', xpKey: 'zoo',
    xp: 7, xpWhy: 'You got past the clockwork zoo!',
    mode: 'hp',
    map: [
      '############',
      '#__c____c__#',
      '#__________#',
      '#__________#',
      '#<<<<__>>>>#',
      '#__________#',
      '#__________#',
      '#####__#####',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 'bear', monster: 'bear', name: 'Brass bear', x: 6, y: 1 },
      BIRD('w1', 2, 2), BIRD('w2', 9, 2),
      MOUSE('m1', 4, 2), MOUSE('m2', 7, 2),
    ],
    team: { from: 'picked', exclude: ['inkwing', 'wren'], spots: [{ x: 4, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 7 }] },
    calm: { max: 3, bonusIf: { 'team:bolt': 10, diary2: 5 }, startIf: { talkBear: 1 } },
    roundCap: 14, capResult: 'win', boost: { hp: 4, skill: 15 },
    taught: CH11.LEARNED, skipHeroFirst: true,
    meets: ['bear', 'bird', 'mouse'],
    events: [
      { round: 0, type: 'say', if: 'team:bolt', lines: [{ who: 'nell', text: 'The bear stopped to listen to Bolt! Tap Talk on your turn to calm it down. Fill all the bubbles and the zoo will stop.' }] },
      { round: 0, type: 'say', ifNot: 'team:bolt', lines: [{ who: 'nell', text: 'Maybe the bear will listen. Tap Talk on your turn to calm it down. Fill all the bubbles and the zoo will stop.' }] },
    ],
    then: { win: 'zoo_win', calm: 'zoo_calm', lose: 'zoo_lose' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'WHUMP! The chute drops everyone onto a big pile of soft packing straw.' },
      { who: 'narrator', text: 'They are in a giant workshop under the tower. Gears as big as wagon wheels turn in the walls. Everything ticks.' },
      { who: 'bolt', text: 'Woof! Woof! Tick tick tick!', if: 'team:bolt' },
      { who: 'pim', text: 'Bolt knows this place. This is where he was made. This is Wren\'s real workshop.', if: 'team:bolt' },
      { who: 'pim', text: 'Look at all the half-built animals. This is where Bolt was made. This is Wren\'s real workshop.', ifNot: 'team:bolt' },
    ],
    next: 'bridge',
  },
  // ----- a gear bridge: a puzzle with a hint painted on the wall -----
  bridge: {
    lines: [
      { who: 'narrator', text: 'A deep pit, and a bridge folded up on the other side. Next to you is a gear with a handle. It touches the bridge gear.' },
      { who: 'narrator', text: 'Painted on the wall: "GEARS THAT TOUCH TURN OPPOSITE WAYS."' },
      { who: 'juni', text: 'The bridge gear has to turn LEFT to come down. Our gear touches it. Which way do we turn ours?' },
    ],
    choices: [
      { label: 'Turn our gear RIGHT', go: 'bridge2' },
      { label: 'Turn our gear LEFT', go: 'bridge_oops' },
    ],
  },
  bridge_oops: {
    lines: [
      { who: 'narrator', text: 'Creak... the bridge folds up even tighter! Wrong way.' },
      { who: 'juni', text: 'Opposite ways, remember? If ours turns right, the one it touches turns left.' },
    ],
    choices: [
      { label: 'Turn our gear RIGHT', go: 'bridge2' },
      { label: 'Turn our gear LEFT', go: 'bridge_oops' },
    ],
  },
  bridge2: {
    xp: 1, xpWhy: 'You figured out the gears!',
    lines: [
      { who: 'narrator', text: 'Clunk, clunk, CLUNK. The bridge swings down! Halfway across, there\'s another lock: three gears in a row.' },
      { who: 'pim', text: 'We turn the first gear RIGHT. The second one turns left. So which way does the third gear turn?' },
    ],
    choices: [
      { label: 'The third gear turns RIGHT', go: 'bridge_done' },
      { label: 'The third gear turns LEFT', go: 'bridge2_oops' },
    ],
  },
  bridge2_oops: {
    lines: [
      { who: 'narrator', text: 'The bridge shakes a little. Wobble, wobble. Not quite!' },
      { who: 'pim', text: 'Right, then left, then...?' },
    ],
    choices: [
      { label: 'The third gear turns RIGHT', go: 'bridge_done' },
      { label: 'The third gear turns LEFT', go: 'bridge2_oops' },
    ],
  },
  bridge_done: {
    xp: 1, xpWhy: 'You figured out the gears!',
    lines: [{ who: 'narrator', text: 'Right, left, RIGHT! The bridge locks in place with a happy ding. Everyone walks across.' }],
    next: 'belts',
  },
  // ----- moving floors -----
  belts: {
    lines: [
      { who: 'narrator', text: 'The next room is full of moving floors, like long rubber belts, carrying crates back and forth.' },
      { who: 'narrator', text: 'The switch to open the far door is on the other side. The only way there is to ride!' },
      { who: 'juni', text: 'Moving floors slide anyone standing on them. Even in a fight. Remember that!' },
    ],
    check: { skill: 'brave', help: 'hollis', label: 'Ride the moving floors to the switch', great: 'belts_ok', ok: 'belts_ok', miss: 'belts_tumble' },
  },
  belts_ok: {
    lines: [{ who: 'narrator', text: 'Hop on, ride, hop off, ride the next one... {name} slaps the big red switch. DING! The far door opens.' }],
    next: 'tripwire',
  },
  belts_tumble: {
    hurt: 1,
    lines: [{ who: 'narrator', text: 'Whoa, whoa, WHOA! {name} rides a belt right into a pile of crates. Thump. Ouch. But the switch is right there! DING!' }],
    next: 'tripwire',
  },
  // ----- a trap (Sniffle's nose helps from home) -----
  tripwire: {
    lines: [{ who: 'narrator', text: 'A long hallway. Something shiny glints at ankle height, all the way across.' }],
    set: { noisy: false },
    check: { skill: 'notice', help: 'nell', trap: true, label: 'Spot the trap in the hallway', great: 'trip_found', ok: 'trip_found', miss: 'trip_sprung' },
  },
  trip_found: {
    lines: [{ who: 'narrator', text: 'A tripwire! Everyone steps over it, nice and high.' }],
    next: 'sleep',
  },
  trip_sprung: {
    lines: [{ who: 'narrator', text: 'TWANG! A bucket of rubber balls dumps on everyone\'s heads. Boing, boing, boing. Silly, but LOUD. Shhh!' }],
    set: { noisy: true },
    next: 'sleep',
  },
  // ----- sleeping clockwork animals: tiptoe past, or wake them on purpose -----
  sleep: {
    lines: [
      { who: 'narrator', text: 'A big quiet room. Clockwork mice and birds are curled up everywhere, ticking very slowly. Tick..... tick..... They\'re asleep.' },
      { who: 'nell', text: '(whispering) We could tiptoe past. Or wake them up and fight.' },
      { who: 'narrator', text: '(They look a little restless after all that noise.)', if: 'noisy' },
    ],
    meet: ['bird'],
    choices: [
      { label: 'Tiptoe past', go: 'tiptoe' },
      { label: 'Wake them up and fight', go: 'fight:sleepers' },
    ],
  },
  tiptoe: { check: { skill: 'sneak', help: 'nell', label: 'Tiptoe past the sleeping animals', great: 'tiptoe_ok', ok: 'tiptoe_ok', miss: 'tiptoe_oops' } },
  tiptoe_ok: {
    xpKey: 'sleepers', xp: 5, xpWhy: 'You snuck past! That counts as winning.',
    lines: [{ who: 'narrator', text: 'Tiptoe... tiptoe... tiptoe. Not one tick changes. Everyone makes it to the next door. Phew!' }],
    next: 'diary',
  },
  tiptoe_oops: {
    lines: [{ who: 'narrator', text: 'Creeeak. A loose floorboard! Tick, tick, TICK TICK TICK! Every animal wakes up at once!' }],
    next: 'fight:sleepers',
  },
  sleepers_win: {
    lines: [{ who: 'narrator', text: 'The last bird flutters down and winds to a stop. The room is quiet again.' }],
    next: 'diary',
  },
  sleepers_lose: {
    lines: [{ who: 'narrator', text: 'The kids run for the next door and slam it shut. Behind it: tick, tick... then quiet. They went back to sleep.' }],
    next: 'diary',
  },
  // ----- Wren's diary -----
  diary: {
    lines: [
      { who: 'narrator', text: 'A little bedroom, tucked in a corner of the workshop. A cot, a lamp, and a desk with a fat notebook on it.' },
      { who: 'pim', text: 'It\'s a diary. Wren\'s diary. Listen: "Today I built Pip. Pip can\'t talk, but he listens."' },
      { who: 'pim', text: '"Nobody came to my birthday again. Clank and Mr. Whiskers came. They have to. I built them."' },
      { who: 'pim', text: '"The old book says a star fell under the silver grove, long ago. If the star wakes up my friends, I\'ll never be alone again."' },
      { who: 'nell', text: 'She\'s not mean. She\'s lonely.' },
      { who: 'juni', text: 'Just like Bramble was.' },
    ],
    set: { diary2: true },
    next: 'gate',
  },
  // ----- a locked gate (Juni's keys help from home) -----
  gate: {
    lines: [{ who: 'narrator', text: 'A tall gate of brass bars. Behind it, something big is growling. GRRR-CLANK.' }],
    check: { skill: 'fingers', help: 'juni', lock: true, label: 'Open the gate lock', great: 'gate_open', ok: 'gate_open', miss: 'gate_bolt' },
  },
  gate_open: {
    lines: [{ who: 'narrator', text: 'Click! The gate swings open.' }],
    next: 'zoo',
  },
  gate_bolt: {
    lines: [
      { who: 'narrator', text: 'The lock won\'t open. Then Bolt squeezes between the bars, stands up, and pushes the latch with his nose. Click! Good dog!', if: 'team:bolt' },
      { who: 'narrator', text: 'The lock won\'t open. {name} looks closer: the latch is just a little brass hook on the inside. A long stick through the bars, a wiggle, a push... Click!', ifNot: 'team:bolt' },
    ],
    next: 'zoo',
  },
  // ----- the clockwork zoo: talk to the bear, or fight -----
  zoo: {
    lines: [
      { who: 'narrator', text: 'A huge round room, like a zoo. A brass bear stands up on its back legs. Clockwork birds flap. Mice zoom out of little holes.' },
      { who: 'narrator', text: 'They\'re guarding something: a glass case in the middle of the room, glowing gold.' },
      { who: 'bolt', text: 'Woof! WOOF! Tick tick tick!', if: 'team:bolt' },
      { who: 'narrator', text: 'The brass bear stops. It tilts its head at Bolt, like it\'s listening.', if: 'team:bolt' },
      { who: 'narrator', text: 'The brass bear looks right at {name}. Its eyes flicker, like it\'s trying to decide something.', ifNot: 'team:bolt' },
    ],
    meet: ['bear'],
    set: { talkBear: false },
    choices: [
      { label: 'Talk to the brass bear', go: 'zoo_talk' },
      { label: 'Fight the clockwork zoo!', go: 'fight:zoo' },
    ],
  },
  zoo_talk: {
    lines: [{ who: 'hero', text: 'Hey, big bear. It\'s okay. We\'re not here to break anything. We just want to talk to Wren.' }],
    set: { talkBear: true },
    next: 'fight:zoo',
  },
  zoo_calm: {
    lines: [
      { who: 'narrator', text: 'The brass bear sits down with a soft clonk. The birds land on its head. The mice curl up by its feet.' },
      { who: 'bolt', text: 'Woof!', if: 'team:bolt' },
      { who: 'nell', text: 'They just wanted someone to be nice to them. Like Wren.' },
    ],
    next: 'stone',
  },
  zoo_win: {
    lines: [{ who: 'narrator', text: 'The brass bear wobbles and sits down with a big CLONK. Its eyes blink, then dim. The birds and mice wind down too.' }],
    next: 'stone',
  },
  zoo_lose: {
    lines: [
      { who: 'narrator', text: 'The zoo chases the kids around and around the room. Then, all at once, every animal stops.' },
      { who: 'narrator', text: 'Tick... tick... clunk. They ran out of wind. Even clockwork gets tired.' },
    ],
    next: 'stone',
  },
  // ----- the Starstone -----
  stone: {
    lines: [
      { who: 'narrator', text: 'In the glass case sits a smooth, round stone as big as a pumpkin. It glows gold, and it\'s warm, like a cup of cocoa.' },
      { who: 'pim', text: 'The Starstone. Wren dug it up from under the silver grove, long before Bramble came back to the woods.' },
      { who: 'nell', text: 'So that\'s why she wanted Whisper Woods empty. So nobody would see her digging.' },
      { who: 'juni', text: 'Is it... humming?' },
      { who: 'narrator', text: 'It is. Very softly. Hmmmm. Hmmmm. Like something sleeping.' },
    ],
    set: { sawStone: true },
    next: 'rest',
  },
  rest: {
    lines: [
      { who: 'narrator', text: 'The kids sit down by the glass case to rest. It\'s warm here, like sitting next to a fireplace.' },
      { who: 'pim', text: 'Wren has to come back here sometime. When she does, we\'ll be waiting. And we\'ll talk.' },
    ],
    heal: true,
    levelUp: true,
    next: 'cliff',
  },
  cliff: {
    lines: [
      { who: 'narrator', text: 'Then the walls start to move. CLANK. CLANK. CLANK. The whole far wall slides open.' },
      { who: 'narrator', text: 'Behind it, something enormous stands up. A giant clockwork beast, as tall as a house, with three gears glowing on its chest.' },
      { who: 'narrator', text: 'And riding on its head is a small figure. In a silver mask.' },
    ],
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 14', text: 'You found Wren\'s diary. Next: Chapter 15, The Silver Mask.' },
};

export default { SCENES, FIGHTS, TEXT };
