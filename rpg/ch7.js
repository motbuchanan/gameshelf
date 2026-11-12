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
  // A small, optional fight: two young wolves on the hill path (sneak past them, or wake them up).
  scouts: {
    id: 'ch7-scouts',
    xpKey: 'den',
    xp: 3, xpWhy: 'You chased off the young wolves!',
    mode: 'hp',
    map: [
      'ttt..t..ttt',
      't.........t',
      '...b...b...',
      '...........',
      '..L.....L..',
      '...........',
      't.........t',
      'ttt.....ttt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 's1', monster: 'wolf', name: 'Young wolf', x: 4, y: 1 },
      { id: 's2', monster: 'wolf', name: 'Young wolf', x: 6, y: 1 },
    ],
    team: { from: 'party', exclude: ['inkwing'], spots: [{ x: 4, y: 6 }, { x: 6, y: 6 }, { x: 3, y: 6 }, { x: 7, y: 6 }, { x: 4, y: 7 }, { x: 6, y: 7 }] },
    roundCap: 10, capResult: 'win', boost: { hp: 4, skill: 10 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['wolf'],
    then: { win: 'den_win', lose: 'den_lose' },
  },
  // A small, optional fight: crows swoop in when you splash into the creek.
  creekcrows: {
    id: 'ch7-creekcrows',
    xpKey: 'stones',
    xp: 3, xpWhy: 'You shooed the snack thieves!',
    mode: 'hp',
    map: [
      '...........',
      '.b.~~~~~.b.',
      '...~...~...',
      '...~~.~~...',
      '...........',
      '.L.......L.',
      '...........',
      'tt.......tt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 'q1', monster: 'crow', name: 'Crow', x: 4, y: 2 },
      { id: 'q2', monster: 'crow', name: 'Crow', x: 6, y: 2 },
      { id: 'q3', monster: 'crow', name: 'Crow', x: 5, y: 0 },
    ],
    team: { from: 'party', exclude: ['inkwing'], spots: [{ x: 4, y: 6 }, { x: 6, y: 6 }, { x: 3, y: 6 }, { x: 7, y: 6 }, { x: 4, y: 7 }, { x: 6, y: 7 }] },
    roundCap: 10, capResult: 'win', boost: { hp: 3, skill: 10 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['crow'],
    events: [{ round: 0, type: 'say', lines: [{ who: 'pim', text: 'Crows can fly over the water! Slingshots and bows can reach them there.' }] }],
    then: { win: 'stones_win', lose: 'stones_lose' },
  },

  wolves: {
    id: 'ch7-wolves',
    xp: 5,
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
    place: 'millbrook',
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
    place: 'woods',
    lines: [{ who: 'narrator', text: 'The Tall Hills are steep and rocky. At the top, you can see for miles.' }],
    check: { skill: 'climb', help: 'hollis', label: 'Climb the steepest hill', great: 'hills_top', ok: 'hills_top', miss: 'hills_slide' },
  },
  hills_top: {
    lines: [
      { who: 'narrator', text: 'From the very top, {name} sees everything: forests, a river, a town far away, and an old stone tower on a hill.' },
      { who: 'nell', text: 'Look at the crows. Hundreds of them. They\'re all flying toward that tower.' },
    ],
    set: { sawTower: true },
    next: 'den',
  },
  hills_slide: {
    hurt: 1,
    lines: [{ who: 'narrator', text: 'Whoops! {name} slides all the way down on the seat of their pants. Hollis laughs so hard he has to sit down.' }],
    next: 'den',
  },
  creek: {
    place: 'creek',
    lines: [
      { who: 'narrator', text: 'Silver Creek is calm and sparkly. An old fisherman sits on a rock, looking sad.' },
      { who: 'narrator', text: '"The big fish keeps stealing my bait," he sighs. "Want to try? I\'ll pay you."' },
    ],
    choices: [
      { label: 'Try to catch the big fish', go: 'fish' },
      { label: 'Keep walking', go: 'stones' },
    ],
  },
  fish: { check: { skill: 'fingers', help: 'tobin', label: 'Catch the big fish', great: 'fish_win', ok: 'fish_win', miss: 'fish_splash', disaster: 'fish_boot' } },
  fish_win: {
    lines: [{ who: 'narrator', text: 'Splash! {name} pulls out a fish as big as Tobin. The fisherman cheers and pays you.' }],
    give: { coins: 5 },
    nextIf: [{ ifNot: 'snooze', go: 'fish_page' }],
    next: 'stones',
  },
  // Gran's missing page turns up in a very strange place.
  fish_page: {
    lines: [
      { who: 'narrator', text: 'Wait. There\'s something in the fish\'s mouth. A soggy piece of paper, with a crow feather stuck to it.' },
      { who: 'pim', text: 'It says "15" at the top. It\'s Gran\'s missing page! A crow must have dropped it in the creek, and the fish thought it was a snack.', if: 'pageQuest' },
      { who: 'pim', text: 'It says "15" at the top. It\'s a page from a spell book, just like Gran\'s! A crow must have dropped it in the creek, and the fish thought it was a snack.', ifNot: 'pageQuest' },
      { who: 'pim', text: 'Sleepy head, cozy bed, close your eyes and rest your head: SNOOZE! ...Oh no. The fish fell asleep.' },
      { who: 'narrator', text: 'Pim learned Snooze! In fights, Pim can sing a monster to sleep so it loses its next turn.' },
    ],
    set: { snooze: true },
    nextIf: [{ if: 'bestAt:clever', go: 'fish_page_learn' }],
    next: 'stones',
  },
  fish_page_learn: {
    lines: [{ who: 'narrator', text: 'Pim teaches {name} the song too. You learned Snooze! In a fight, tap Snooze, then tap a monster. On a good roll, it nods off.' }],
    give: { spell: 'snooze' },
    next: 'stones',
  },
  fish_boot: {
    lines: [
      { who: 'narrator', text: 'OOPS! The big fish grabs {name}\'s boot, pulls it right off, and swims away with it. Bloop.' },
      { who: 'narrator', text: 'The fisherman laughs so hard he almost falls in. He lends you an old boot of his. It squelches when you walk. Squelch. Squelch.' },
    ],
    give: { coins: 1 },
    next: 'stones',
  },
  fish_splash: {
    lines: [{ who: 'narrator', text: 'The fish pulls {name} right into the creek! Everybody gets splashed. The fisherman laughs and pays you anyway.' }],
    give: { coins: 2 },
    next: 'stones',
  },
  // Puzzle or fight: two young wolves asleep on the path.
  den: {
    place: 'woods',
    lines: [
      { who: 'narrator', text: 'Halfway down the far side of the hill, two young wolves are curled up asleep, right in the middle of the path.' },
      { who: 'nell', text: '(whispering) We could tiptoe past. Or go the long way through the brambles. Or... wake them up.' },
    ],
    choices: [
      { label: 'Tiptoe past', go: 'den_sneak' },
      { label: 'Take the long way (ouch, prickles)', go: 'den_long' },
      { label: 'Wake them up and fight', go: 'fight:scouts' },
    ],
  },
  den_sneak: { check: { skill: 'sneak', help: 'nell', label: 'Tiptoe past the sleeping wolves', great: 'den_snuck', ok: 'den_snuck', miss: 'den_woke' } },
  den_snuck: {
    xpKey: 'den',
    xp: 3, xpWhy: 'You tiptoed past the wolves! That counts as winning.',
    lines: [{ who: 'narrator', text: 'Tiptoe, tiptoe. One wolf snores. The other one twitches its paw, dreaming. Nobody wakes up.' }],
    next: 'map2',
  },
  den_woke: {
    lines: [{ who: 'narrator', text: 'SNAP! Tobin steps on a stick. Two pairs of yellow eyes pop open. Grrrr!' }],
    next: 'fight:scouts',
  },
  den_long: {
    lines: [{ who: 'narrator', text: 'The long way goes right through a wall of prickly brambles.' }],
    check: { skill: 'tough', help: 'juni', label: 'Tough it out through the prickles', great: 'den_long_ok', ok: 'den_long_ok', miss: 'den_long_ouch' },
  },
  den_long_ok: {
    xpKey: 'den', xp: 3, xpWhy: 'You found a way around the wolves!',
    lines: [{ who: 'narrator', text: '{name} goes first and holds the prickly branches back for everybody. A few scratches, no big deal. And nobody wakes the wolves.' }],
    next: 'map2',
  },
  den_long_ouch: {
    hurt: 1,
    xpKey: 'den', xp: 3, xpWhy: 'You found a way around the wolves!',
    lines: [{ who: 'narrator', text: 'Ouch, ouch, OUCH. The brambles win this one. But nobody wakes the wolves.' }],
    next: 'map2',
  },
  den_win: {
    lines: [{ who: 'narrator', text: 'The young wolves yip and run off over the hill. Hollis puffs out his chest. "We did that."' }],
    next: 'map2',
  },
  den_lose: {
    lines: [{ who: 'narrator', text: 'The young wolves chase the kids all the way down the hill, then get bored and wander off. Phew.' }],
    next: 'map2',
  },
  // Puzzle or fight: stepping stones across the creek.
  stones: {
    place: 'creek',
    lines: [
      { who: 'narrator', text: 'The path crosses Silver Creek on stepping stones. Some of the stones wobble. Crows watch from a dead tree. They look hungry for snacks.' },
      { who: 'juni', text: 'Wobbly stones are clean. Stones that never move get covered in green moss. Step on the mossy ones!' },
    ],
    choices: [
      { label: 'Step on the green mossy stone', go: 'stones2' },
      { label: 'Step on the shiny clean stone', go: 'stones_splash' },
      { label: 'Jump! Skip the first stone', go: 'stones_splash' },
    ],
  },
  stones2: {
    lines: [{ who: 'narrator', text: 'Squish. The mossy stone doesn\'t move at all. Two more stones to the other side: a gray one with moss on top, and a pale one with none.' }],
    choices: [
      { label: 'The pale stone with no moss', go: 'stones_splash' },
      { label: 'The gray stone with moss on top', go: 'stones_across' },
    ],
  },
  stones_across: {
    xpKey: 'stones',
    xp: 1, xpWhy: 'You solved the stepping-stone puzzle!',
    lines: [{ who: 'narrator', text: 'Squish, squish, hop! Everyone crosses with dry feet. The crows grumble and stay in their tree.' }],
    next: 'map2c',
  },
  stones_splash: {
    lines: [
      { who: 'narrator', text: 'WOBBLE... SPLASH! Down goes {name}, and the snack bag goes flying!' },
      { who: 'narrator', text: 'CAW! CAW! The crows dive for the snacks!' },
    ],
    next: 'fight:creekcrows',
  },
  stones_win: {
    lines: [{ who: 'narrator', text: 'The crows flap away with nothing. Tobin hugs the snack bag. "MY snacks."' }],
    next: 'map2c',
  },
  stones_lose: {
    lines: [{ who: 'narrator', text: 'The crows fly off with one cookie. Just one. Tobin will talk about that cookie for weeks.' }],
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
    place: 'woodsnight',
    lines: [
      { who: 'narrator', text: 'The kids make camp under tall pine trees. Juni builds the fire. Tobin eats most of the snacks.' },
      { who: 'juni', text: 'Camping rule: when you rest, you get your hearts and your Luck back. Everybody sleep well.' },
      { who: 'nell', text: 'Can somebody tell a story first?' },
    ],
    set: { campH: false, campN: false, campP: false },
    choices: [
      { label: 'Ask Hollis for a story', go: 'story_hollis' },
      { label: 'Ask Nell for a story', go: 'story_nell' },
      { label: 'Ask Pim for a story', go: 'story_pim' },
    ],
  },
  story_hollis: {
    lines: [{ who: 'hollis', text: 'Okay. One time, a goose chased me all the way home. Then I grew up big and brave, and now I fight goblins. But I still don\'t like geese.' }],
    heal: true, set: { campH: true }, next: 'camp_more',
  },
  story_nell: {
    lines: [{ who: 'nell', text: 'My grandpa says the stars are lanterns, held up by giant owls. When an owl gets tired, a star falls. That\'s why you make a wish: to help the owl. He says a fallen star would be warm, and round, and glowing.' }],
    heal: true, set: { campN: true, starOwls: true }, next: 'camp_more',
  },
  // You can ask for more than one story before bed.
  camp_more: {
    lines: [{ who: 'tobin', text: 'Another one! Another one! ...Or we could go to sleep, I guess.' }],
    choices: [
      { label: 'Ask Hollis for a story', go: 'story_hollis', ifNot: 'campH' },
      { label: 'Ask Nell for a story', go: 'story_nell', ifNot: 'campN' },
      { label: 'Ask Pim for a story', go: 'story_pim', ifNot: 'campP' },
      { label: 'Time to sleep', go: 'howl' },
    ],
  },
  story_pim: {
    lines: [{ who: 'pim', text: 'Gran says a long time ago, there was a grove of silver trees near Riverbend. People cut them all down. And someone cried for a whole year.' }],
    heal: true, set: { campP: true, heardGrove: true }, next: 'camp_more',
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
