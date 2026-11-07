// Chapter 7: The Wide World. A new black-feather note, the trail map, camping, and the wolf pack.
// Text uses {name} for the hero's name. No em dashes.
import CH5 from './ch5.js';
import CH3 from './ch3.js';

export const LEARNED = { ...CH3.LEARNED, area: true, heal: false, dodge: true };

export const TEXT = {
  ...CH5.TEXT,
  TEACH: { ...CH5.TEXT.TEACH, monsterturn: 'AROOOO! (The wolves circle closer.)', retreat: 'Yip yip yip! (The wolves run off into the trees.)' },
  INIT_TEACH: 'Roll for who goes first!',
  PACK_TEACH: 'Careful! Wolves hunt in packs. When two wolves are next to the same kid, they get extra colored squares. Don\'t get surrounded!',
  LEADER_TEACH: 'That big dark one is the pack leader. If the leader runs away, they ALL run away!',
  CHATTER: {
    ...CH5.TEXT.CHATTER,
    lead: ['AROOOOO!', 'Grrrrr...', 'Snarl!'],
    w1: ['Grr!', 'Snap snap!', 'Woof!'], w2: ['Grrr!', 'Yip!', 'Snarl!'], w3: ['Woof!', 'Grr!', 'Snap!'], w4: ['Yip yip!', 'Grrr!', 'Woof!'],
  },
};

export const FIGHTS = {
  wolves: {
    id: 'ch7-wolves',
    mode: 'hp',
    map: [
      'tt.t...t.tt',
      't.........t',
      '..b..L..b..',
      '...........',
      '.m.......m.',
      '..b..L..b..',
      't.........t',
      'tt.t...t.tt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 3 },
      { id: 'lead', monster: 'wolfleader', name: 'Old Gray', x: 10, y: 3 },
      { id: 'w1', monster: 'wolf', name: 'Wolf', x: 9, y: 1 },
      { id: 'w2', monster: 'wolf', name: 'Wolf', x: 0, y: 3 },
      { id: 'w3', monster: 'wolf', name: 'Wolf', x: 9, y: 6 },
      { id: 'w4', monster: 'wolf', name: 'Wolf', x: 1, y: 6 },
    ],
    team: { from: 'party', exclude: ['inkwing'], spots: [{ x: 4, y: 4 }, { x: 6, y: 4 }, { x: 4, y: 2 }, { x: 6, y: 2 }, { x: 5, y: 1 }, { x: 5, y: 6 }] },
    roundCap: 12, capResult: 'win', boost: { hp: 2, skill: 12 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['wolf', 'wolfleader'],
    events: [{ round: 0, type: 'say', lines: [{ who: 'nell', text: 'Careful! Wolves hunt in packs. When two wolves are next to the same kid, they get extra colored squares. Don\'t get surrounded!' }, { who: 'pim', text: 'That big dark one is the pack leader. If the leader runs away, they ALL run away!' }] }],
    then: { win: 'wolves_win', lose: 'wolves_lose' },
  },
};

const MAP = (here, extra = {}) => ({
  title: 'The lands past Whisper Woods',
  here,
  nodes: [
    { id: 'millbrook', label: 'Millbrook', x: 10, y: 48, icon: 'star' },
    { id: 'hills', label: 'Tall Hills', x: 34, y: 16, icon: 'boot' },
    { id: 'creek', label: 'Silver Creek', x: 36, y: 46, icon: 'boot' },
    { id: 'camp', label: 'Pine Camp', x: 60, y: 32, icon: 'heart' },
    { id: 'riverbend', label: 'Riverbend', x: 88, y: 24, icon: 'bubble' },
    { id: 'tower', label: 'Old Tower', x: 86, y: 52, icon: 'shield' },
  ].map(n => ({ ...n, ...(extra[n.id] || {}) })),
  paths: [['millbrook', 'hills'], ['millbrook', 'creek'], ['hills', 'camp'], ['creek', 'camp'], ['camp', 'riverbend'], ['riverbend', 'tower']],
});
export { MAP };

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'A week after the big party, Captain Ward runs into the town square holding a piece of paper.' },
      { who: 'captain', text: 'Another note! Nailed to the gate last night. It says: "Leave the woods, or else. B." And it has a black feather.' },
      { who: 'hollis', text: 'B again!' },
      { who: 'captain', text: 'I can\'t take the guards away from town. Not after last time. Someone has to find out who B is...' },
      { who: 'hero', text: 'We\'ll go!' },
      { who: 'gran', text: 'I thought you might say that. Here. A map of the lands past Whisper Woods, a bag of snacks, and two healing potions. Drink one if you get hurt in a fight.' },
      { who: 'pim', text: 'A map! I\'ve never been past the woods. Nobody our age has!' },
    ],
    give: { items: { potion: 2 } },
    next: 'map1',
  },
  map1: {
    lines: [{ who: 'nell', text: 'Look, two ways to go. Over the Tall Hills, or along Silver Creek. Tap where we go next!' }],
    trailmap: { ...MAP('millbrook', { hills: { go: 'hills' }, creek: { go: 'creek' } }), text: 'Where should we go first? Tap a place on the map.' },
  },
  hills: {
    lines: [{ who: 'narrator', text: 'The Tall Hills are steep and rocky. At the top, you can see for miles.' }],
    check: { skill: 'climb', help: 'hollis', label: 'Climb the steepest hill', great: 'hills_top', ok: 'hills_top', miss: 'hills_slide' },
  },
  hills_top: {
    lines: [
      { who: 'narrator', text: 'From the very top, {name} sees everything: forests, a river, a town far away, and an old stone tower on a hill.' },
      { who: 'nell', text: 'Look at the crows. Hundreds of them. They\'re all flying toward that tower.' },
    ],
    set: { sawTower: true },
    next: 'map2',
  },
  hills_slide: {
    hurt: 1,
    lines: [{ who: 'narrator', text: 'Whoops! {name} slides all the way down on the seat of their pants. Hollis laughs so hard he has to sit down.' }],
    next: 'map2',
  },
  creek: {
    lines: [
      { who: 'narrator', text: 'Silver Creek is calm and sparkly. An old fisherman sits on a rock, looking sad.' },
      { who: 'narrator', text: '"The big fish keeps stealing my bait," he sighs. "Want to try? I\'ll pay you."' },
    ],
    choices: [
      { label: 'Try to catch the big fish', go: 'fish' },
      { label: 'Keep walking', go: 'map2c' },
    ],
  },
  fish: { check: { skill: 'fingers', help: 'tobin', label: 'Catch the big fish', great: 'fish_win', ok: 'fish_win', miss: 'fish_splash' } },
  fish_win: {
    lines: [{ who: 'narrator', text: 'Splash! {name} pulls out a fish as big as Tobin. The fisherman cheers and pays you.' }],
    give: { coins: 5 },
    next: 'map2c',
  },
  fish_splash: {
    lines: [{ who: 'narrator', text: 'The fish pulls {name} right into the creek! Everybody gets splashed. The fisherman laughs and pays you anyway.' }],
    give: { coins: 2 },
    next: 'map2c',
  },
  map2: {
    lines: [{ who: 'pim', text: 'It\'s getting dark. Pine Camp is next on the map.' }],
    trailmap: { ...MAP('hills', { camp: { go: 'camp' } }), text: 'Tap Pine Camp to make camp for the night.' },
  },
  map2c: {
    lines: [{ who: 'pim', text: 'It\'s getting dark. Pine Camp is next on the map.' }],
    trailmap: { ...MAP('creek', { camp: { go: 'camp' } }), text: 'Tap Pine Camp to make camp for the night.' },
  },
  camp: {
    lines: [
      { who: 'narrator', text: 'The kids make camp under tall pine trees. Juni builds the fire. Tobin eats most of the snacks.' },
      { who: 'juni', text: 'Camping rule: when you rest, you get your hearts and your Luck back. Everybody sleep well.' },
      { who: 'nell', text: 'Can somebody tell a story first?' },
    ],
    choices: [
      { label: 'Ask Hollis for a story', go: 'story_hollis' },
      { label: 'Ask Nell for a story', go: 'story_nell' },
      { label: 'Ask Pim for a story', go: 'story_pim' },
    ],
  },
  story_hollis: {
    lines: [{ who: 'hollis', text: 'Okay. One time, a goose chased me all the way home. Then I grew up big and brave, and now I fight goblins. But I still don\'t like geese.' }],
    heal: true, next: 'howl',
  },
  story_nell: {
    lines: [{ who: 'nell', text: 'My grandpa says the stars are lanterns, held up by giant owls. When an owl gets tired, a star falls. That\'s why you make a wish: to help the owl.' }],
    heal: true, next: 'howl',
  },
  story_pim: {
    lines: [{ who: 'pim', text: 'Gran says a long time ago, there was a grove of silver trees near Riverbend. People cut them all down. And someone cried for a whole year.' }],
    heal: true, set: { heardGrove: true }, next: 'howl',
  },
  howl: {
    lines: [
      { who: 'narrator', text: 'In the middle of the night: AROOOOO! Glowing eyes in the dark, all around the camp.' },
      { who: 'juni', text: 'Wolves! Everybody up!' },
    ],
    next: 'fight:wolves',
  },
  wolves_win: {
    lines: [
      { who: 'narrator', text: 'Old Gray, the pack leader, runs into the dark, and the whole pack follows him.' },
      { who: 'nell', text: 'Did anybody else notice the crow? It sat on that branch the WHOLE fight. Just watching.' },
      { who: 'narrator', text: 'A big black crow looks right at {name}. Then it flaps away, toward the town of Riverbend.' },
    ],
    next: 'feather',
  },
  wolves_lose: {
    lines: [{ who: 'narrator', text: 'The wolves knock the kids down and grab the snack bag.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:wolves', retry: true },
      { label: 'See what happens', go: 'wolves_see' },
    ],
  },
  wolves_see: {
    lines: [
      { who: 'narrator', text: 'The wolves run off with the snack bag. That\'s all they wanted. Tobin is very upset.' },
      { who: 'tobin', text: 'My SNACKS. Those were my SNACKS.' },
      { who: 'narrator', text: 'Up on a branch, a big black crow watches. Then it flaps away, toward Riverbend.' },
    ],
    next: 'feather',
  },
  feather: {
    lines: [
      { who: 'narrator', text: 'In the morning, there\'s a black feather lying right next to {name}\'s pillow.' },
      { who: 'pim', text: 'B was here. Or B\'s crow was. We\'re being watched.' },
      { who: 'hollis', text: 'Then let\'s go to Riverbend and find out why.' },
    ],
    heal: true,
    levelUp: true,
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 7', text: 'Next: Chapter 8, Riverbend. A troll, a town, and a lot of crows.' },
};

export default { SCENES, FIGHTS, TEXT, LEARNED, MAP };
