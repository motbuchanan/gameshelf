// Chapter 19: The Sky Bridge. Follow Dot's red ribbons up the mountain, the snow goblins on the ledges
// (high ground), the rope bridge in the wind, {dragon} learns Little wings, and Dot joins.
// Text uses {name} for the hero's name and {dragon} for the dragon's name. No em dashes.
import CH18 from './ch18.js';

export const LEARNED = { ...CH18.LEARNED };

export const TEXT = {
  ...CH18.TEXT,
  TEACH: { ...CH18.TEXT.TEACH, monsterturn: 'Hee hee! Snowball! (The snow goblins giggle on the ledges.)' },
  CHATTER: {
    ...CH18.TEXT.CHATTER,
    g1: ['Snowball!', 'Hee hee!', 'Shiny dragon is OURS!'], g2: ['Get them!', 'Hee hee hee!', 'Brrr!'], g3: ['SNOWBALL!', 'Grubjaw says hi! Hee!'],
    g4: ['Hee!', 'Shinies!', 'Brrrr!'], g5: ['Snowball time!', 'Hee hee!'],
  },
};

const GOB = (id, x, y) => ({ id, monster: 'snowgob', name: 'Snow goblin', x, y });
const ARCHER = (id, x, y) => ({ id, monster: 'snowgobarcher', name: 'Snowball goblin', x, y });

export const FIGHTS = {
  ledges: {
    id: 'ch19-ledges', xpKey: 'ledges',
    xp: 7, xpWhy: 'You beat the snow goblins!',
    mode: 'hp',
    map: [
      'rhhhsssshhhr',
      'rhhhsssshhhr',
      'ssssssrsssss',
      'ssdsssssssds',
      'sssssssrssss',
      'ssshhsssssss',
      'ssshhsssssss',
      'ssssssssssss',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 6, y: 7 },
      ARCHER('g1', 2, 0), ARCHER('g2', 9, 0),
      GOB('g3', 5, 2), GOB('g4', 7, 3), GOB('g5', 3, 3),
    ],
    team: { from: 'picked', exclude: ['inkwing', 'dot'], spots: [{ x: 5, y: 7 }, { x: 7, y: 7 }, { x: 4, y: 6 }] },
    roundCap: 14, capResult: 'win', boost: { hp: 2, skill: 32 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['snowgob', 'snowgobarcher'],
    events: [{ round: 0, type: 'say', lines: [
      { who: 'pim', text: 'Ledges! Standing up high makes it easier to shoot down at someone: 10 more squares.' },
      { who: 'juni', text: 'Climbing up takes two steps. Let\'s get up there too!' },
    ] }],
    then: { win: 'ledges_win', lose: 'ledges_lose' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'The kids run out of the troll tunnel into the morning. The air is thin and cold, and the peak is right above them, poking through the clouds.' },
      { who: 'hollis', text: 'He took {dragon}. He TOOK {dragon}! In a NET!' },
      { who: 'nell', text: 'Look. There. A red ribbon, tied to that rock.' },
      { who: 'narrator', text: 'On the ribbon is a little drawing of {dragon}, done in pencil. Not a very good one. But you can tell who it is.' },
    ],
    set: { dotRibbons: true },
    next: 'team',
  },
  team: {
    lines: [{ who: 'narrator', text: 'Who climbs after the knight with you?' }],
    pickTeam: { size: 3, exclude: ['inkwing', 'dot'] },
    next: 'ribbon1',
  },
  ribbon1: {
    lines: [{ who: 'narrator', text: 'The path splits three ways around a boulder. Somewhere there\'s another red ribbon. But the wind is blowing snow everywhere.' }],
    check: { skill: 'track', label: 'Find the next ribbon', help: 'nell', great: 'ribbon2', ok: 'ribbon2', miss: 'ribbon1_miss' },
  },
  ribbon1_miss: {
    lines: [
      { who: 'narrator', text: 'Snow, snow, rocks, snow. No ribbon anywhere.' },
      { who: 'inkwing', text: 'CAW! Caw caw!', if: 'party:inkwing' },
      { who: 'narrator', text: 'Inkwing swoops down and lands on a rock with a red ribbon in her beak. She found it!', if: 'party:inkwing' },
      { who: 'narrator', text: 'Then Tobin sneezes, and when everyone looks at him, they see it, right behind his head: a red ribbon, flapping in the wind.', ifNot: 'party:inkwing' },
    ],
    next: 'ribbon2',
  },
  ribbon2: {
    lines: [
      { who: 'narrator', text: 'This ribbon has another drawing. {dragon} again, but better this time. Dot drew it smiling.' },
      { who: 'nell', text: 'She\'s getting better at drawing it. She must be looking at it the whole way up.' },
      { who: 'narrator', text: 'The next ribbon is high up, at the top of a steep, icy rock.' },
    ],
    check: { skill: 'climb', label: 'Climb the icy rock', help: 'hollis', great: 'ribbon3', ok: 'ribbon3', miss: 'ribbon2_miss', disaster: 'ribbon2_oops' },
  },
  ribbon2_miss: {
    lines: [{ who: 'narrator', text: 'Slip, slide, bump. It takes three tries and a lot of grumbling. But {name} makes it up and grabs the ribbon.' }],
    next: 'ribbon3',
  },
  ribbon2_oops: {
    lines: [
      { who: 'narrator', text: '{name} slides all the way down the rock on their bottom, like a sled, straight into a snowbank. FWUMP.' },
      { who: 'narrator', text: 'Everyone laughs, even {name}. Then Juni climbs up the easy way, around the back, and brings down the ribbon.' },
    ],
    hurt: 1,
    next: 'ribbon3',
  },
  ribbon3: {
    lines: [
      { who: 'narrator', text: 'Around the next bend, the path runs between high stone ledges. On top of them: fluffy white hoods, and lots and lots of snowballs.' },
      { who: 'narrator', text: '"Hee hee! The knight pays us in shinies to stop you! Snowball time!"' },
      { who: 'pudge', text: 'Snow goblins? Pudge has cousins up here? Nobody tells Pudge anything.', if: 'party:pudge' },
    ],
    meet: ['snowgob', 'snowgobarcher'],
    next: 'fight:ledges',
  },
  ledges_win: {
    lines: [
      { who: 'narrator', text: 'The snow goblins run off, giggling and throwing snowballs over their shoulders. They seem to have had a great time anyway.' },
    ],
    next: 'bridge',
  },
  ledges_lose: {
    lines: [
      { who: 'narrator', text: 'The kids end up buried in snowballs. The goblins cheer, grab some shiny buttons from Nell\'s pocket, and run off happy.' },
      { who: 'narrator', text: 'Nobody is hurt. Just very, very snowy.' },
    ],
    next: 'bridge',
  },
  // ----- the sky bridge -----
  bridge: {
    lines: [
      { who: 'narrator', text: 'At the top of the path, the mountain splits in two. A rope bridge swings across the gap in the wind. Way, way down, you can see clouds.' },
      { who: 'narrator', text: 'On the far side, a shiny horse is tied to a post. A cage hangs from the saddle. Inside the cage, something glows blue.' },
      { who: 'dragon', text: 'MEW! MEW MEW!' },
      { who: 'hero', text: '{dragon}! We\'re coming!' },
      { who: 'narrator', text: 'The knight is nowhere to be seen. But the rope bridge is old, and the wind is strong.' },
    ],
    choices: [
      { label: 'Cross carefully, one at a time', go: 'cross' },
      { label: 'Tobin, can you spot a better way?', go: 'tobin_way', if: 'team:tobin' },
      { label: 'Call to {dragon}', go: 'wings' },
    ],
  },
  cross: {
    lines: [{ who: 'narrator', text: 'One step. The bridge sways. Another step. The wind howls. Don\'t look down. Don\'t look down.' }],
    check: { skill: 'brave', label: 'Cross the sky bridge', help: 'juni', great: 'wings_after', ok: 'wings_after', miss: 'cross_stuck' },
  },
  tobin_way: {
    xp: 1, xpKey: 'bridge',
    lines: [
      { who: 'tobin', text: 'Look! The rocks under the bridge are like steps. If we hold the ropes and go low, the wind can\'t get us!' },
      { who: 'narrator', text: 'He\'s right. Everyone crawls across low, holding on tight, while the wind whistles over their heads.' },
    ],
    next: 'wings_after',
  },
  cross_stuck: {
    lines: [
      { who: 'narrator', text: 'Halfway across, a big gust swings the bridge sideways. {name} freezes, holding on with both hands.' },
      { who: 'dragon', text: 'MEW!' },
    ],
    next: 'wings',
  },
  wings: {
    lines: [
      { who: 'narrator', text: 'In the cage, {dragon} wiggles. It pushes its head between the bars. Then one wing. Then the other wing. It\'s just small enough!' },
      { who: 'narrator', text: '{dragon} pops out of the cage, flaps its little wings, flaps HARDER... and flies! Wobbly, but flying!' },
      { who: 'nell', text: 'It\'s FLYING! {dragon} can FLY!' },
      { who: 'narrator', text: '{dragon} grabs the end of a spare rope in its mouth, flies it across the gap, and drops it right in {name}\'s hands. Now the bridge is safe to hold.' },
      { who: 'narrator', text: 'Then it lands on {name}\'s head, very proud, and licks {name}\'s ear.' },
    ],
    set: { dragonWings: true, dragonBack: true },
    next: 'knight_back',
  },
  wings_after: {
    lines: [
      { who: 'narrator', text: 'The kids make it to the far side. In the cage, {dragon} sees them and wiggles with joy. It pushes its head between the bars. Then one wing. Then the other.' },
      { who: 'narrator', text: '{dragon} pops out of the cage, flaps its little wings, flaps HARDER... and flies! Wobbly, but flying! Straight into {name}\'s arms.' },
      { who: 'nell', text: 'It can FLY now! {dragon} learned to fly!' },
    ],
    set: { dragonWings: true, dragonBack: true },
    next: 'knight_back',
  },
  knight_back: {
    lines: [
      { who: 'sirbart', text: 'MY DRAGON! Unhand my dragon, you... you SMALL PEOPLE!' },
      { who: 'narrator', text: 'Sir Bartholomew clanks out from behind a rock and throws a big net. {dragon} is too tired from flying to dodge. The net catches it.' },
      { who: 'sirbart', text: 'HA! And THIS time, the cage gets a lock! Three locks! Come, Dot! To the peak!' },
      { who: 'narrator', text: 'He rides up the last path toward the top of the mountain, with the cage swinging from the saddle.' },
      { who: 'narrator', text: 'But Dot doesn\'t follow him. She stands very still, with her hands in fists.' },
    ],
    set: { dragonBack: false },
    next: 'dot',
  },
  // ----- Dot -----
  dot: {
    lines: [
      { who: 'dot', text: 'I\'m sorry. I\'m so sorry. I didn\'t want to show him the way. He said if he caught a dragon, he\'d finally be a real hero.' },
      { who: 'dot', text: 'But {dragon} isn\'t a trophy. {dragon} is the best thing I\'ve ever seen. I drew it on every ribbon.' },
    ],
    choices: [
      { label: 'Help us get {dragon} back?', go: 'dot_join' },
      { label: 'Why should we trust you?', go: 'dot_trust' },
    ],
  },
  dot_trust: {
    lines: [
      { who: 'dot', text: 'Because I left you the ribbons. Because I told him the firefly was a firefly. Because I know how the cage works.' },
      { who: 'nell', text: 'She did all of that. She was on our side the whole time.' },
    ],
    next: 'dot_join',
  },
  dot_join: {
    lines: [
      { who: 'dot', text: 'The cage has three locks. A key lock, a twisty lock, and a frozen one in the middle that only opens if it gets warm.' },
      { who: 'dot', text: 'It has a little gear stamped on the door. Sir Bartholomew bought it from a girl in Gearwick, years ago.' },
      { who: 'wren', text: 'Me. That was me. I always put the hard lock in the middle. I can open that cage. I KNOW I can.', if: 'team:wren' },
      { who: 'hero', text: 'Then come with us, Dot. Let\'s get {dragon} back together.' },
      { who: 'narrator', text: 'Dot joins your team! She is sneaky, kind, and she knows all about the knight\'s machines.' },
    ],
    join: 'dot',
    meet: ['dot'],
    set: { dotFriend: true, cageMark: true },
    next: 'camp',
  },
  camp: {
    lines: [
      { who: 'narrator', text: 'It\'s too dark to climb the last part tonight. The kids camp under a rock, with no dragon to keep them warm.' },
      { who: 'narrator', text: 'Everybody misses {dragon}. Dot shows you her drawings, one by one, by the fire.' },
      { who: 'hollis', text: 'I\'m saving my last cookie for {dragon}. For when we get it back. Not if. When.', if: 'team:hollis' },
    ],
    next: 'cliff',
  },
  cliff: {
    lines: [
      { who: 'narrator', text: 'In the night, a storm rolls in. Thunder booms. Snow whirls.' },
      { who: 'narrator', text: 'At the very top of the peak, a tiny figure holds a cage up to the sky. "COME AND SEE MY DRAGON, WORLD!"' },
      { who: 'narrator', text: 'And in the clouds, lit up by the lightning, something enormous is flying. Something with wings as wide as a barn.' },
    ],
    heal: true,
    levelUp: true, banter: true,
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 19', text: 'Next: Chapter 20, Starpeak. The top of the world, the Dragon Catcher, and something huge in the clouds.' },
};

export default { SCENES, FIGHTS, TEXT, LEARNED };
