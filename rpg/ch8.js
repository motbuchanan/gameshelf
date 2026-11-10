// Chapter 8: Riverbend. Mossback's riddles, a bigger town, Patch Up, the crow swarm, and the name Bramble.
// Text uses {name} for the hero's name. No em dashes.
import CH7 from './ch7.js';

export const TEXT = {
  ...CH7.TEXT,
  TEACH: { ...CH7.TEXT.TEACH, heal: 'Page 12! Patch Up! Hold still, this will make you feel better.', monsterturn: 'CAW! CAW! Shiny! Shiny!', retreat: 'Caw! Too many bonks! Back to the tower!' },
  HEAL_LINE: 'All patched up!',
  HEAL_MISS: 'Oops. The spell fizzled. Try again next time.',
  CHATTER: {
    ...CH7.TEXT.CHATTER,
    mossback: ['Pardon me, crows.', 'Excuse me, coming through.', 'That was rude of you, crow.'],
    c1: ['Caw!', 'Shiny!', 'Mine!'], c2: ['Caw caw!', 'Ha!', 'Shiny spoon!'], c3: ['Caw!', 'Grab it!', 'Caw caw!'],
    c4: ['Caw!', 'Fly fly!', 'Mine, mine!'], c5: ['CAW!', 'Shiny!', 'Hee caw!'], c6: ['Caw!', 'Spoons!', 'Caw caw!'], c7: ['Caw!', 'Rings!', 'Caw!'], c8: ['CAW!', 'Mine!', 'Caw!'],
  },
};

export const FIGHTS = {
  // A small, optional fight: two hungry wolves sniffing at Turnip the goat.
  goatwolves: {
    id: 'ch8-goatwolves',
    xpKey: 'goatwolves',
    xp: 3, xpWhy: 'You saved Turnip from the wolves!',
    mode: 'hp',
    map: [
      'tt.t...t.tt',
      't.........t',
      '..b.....b..',
      '...........',
      '.....L.....',
      '...........',
      't.........t',
      'tt.......tt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 'g1', monster: 'wolf', name: 'Hungry wolf', x: 3, y: 1 },
      { id: 'g2', monster: 'wolf', name: 'Hungry wolf', x: 7, y: 1 },
    ],
    team: { from: 'party', exclude: ['inkwing'], spots: [{ x: 4, y: 6 }, { x: 6, y: 6 }, { x: 3, y: 6 }, { x: 7, y: 6 }, { x: 4, y: 7 }, { x: 6, y: 7 }] },
    roundCap: 10, capResult: 'win', boost: { hp: 4, skill: 10 },
    taught: CH7.LEARNED, skipHeroFirst: true,
    then: { win: 'goat_saved', lose: 'goat_lose' },
  },

  crows: {
    id: 'ch8-crows',
    xp: 5,
    mode: 'hp',
    map: [
      'tt.......tt',
      '...~~~~~...',
      '.b.~...~.b.',
      '...~.L.~...',
      '...~...~...',
      '.b.~~.~~.b.',
      '...........',
      'tt.......tt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 'c1', monster: 'crow', name: 'Crow', x: 4, y: 3 },
      { id: 'c2', monster: 'crow', name: 'Crow', x: 6, y: 2 },
      { id: 'c3', monster: 'crow', name: 'Crow', x: 1, y: 1 },
      { id: 'c4', monster: 'crow', name: 'Crow', x: 9, y: 1 },
      { id: 'c5', monster: 'crow', name: 'Crow', x: 5, y: 4 },
      { id: 'c6', monster: 'crow', name: 'Crow', x: 0, y: 4 },
      { id: 'c7', monster: 'crow', name: 'Crow', x: 10, y: 4 },
      { id: 'c8', monster: 'crow', name: 'Crow', x: 6, y: 3 },
    ],
    team: { from: 'party', exclude: ['inkwing'], spots: [{ x: 3, y: 6 }, { x: 7, y: 6 }, { x: 2, y: 7 }, { x: 8, y: 7 }, { x: 1, y: 6 }, { x: 9, y: 6 }] },
    roundCap: 12, capResult: 'win', boost: { hp: 2, skill: 10 },
    taught: CH7.LEARNED, skipHeroFirst: true,
    meets: ['crow'],
    events: [{ round: 0, type: 'say', lines: [{ who: 'pim', text: 'Crows can fly over the water! Swords can\'t reach them out there. Use slingshots, bows and Spark, or wait for them to swoop in close.' }] }],
    then: { win: 'crows_win', lose: 'crows_lose' },
  },
};

const R1 = (id, q, opts, right) => ({
  lines: [{ who: 'mossback', text: q }],
  choices: opts.map((o, k) => ({ label: o, go: k === right ? id + '_ok' : id + '_no' })),
});
const OK = (next, line) => ({ xp: 1, xpKey: 'riddle-' + next, xpWhy: 'You solved a riddle!', lines: [{ who: 'mossback', text: line }], next });
const NO = (next, line) => ({ lines: [{ who: 'mossback', text: line }], set: { riddleMiss: true }, next });

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'The road to Riverbend crosses a wide river on an old stone bridge. Sitting in the middle of the bridge is a very large troll.' },
      { who: 'mossback', text: 'Good morning! I am Mossback, keeper of this bridge. To cross, you must answer three riddles. Nicely, please.' },
      { who: 'tobin', text: 'What if we just run past him?' },
    ],
    choices: [
      { label: 'Answer his riddles', go: 'riddle1', set: { polite: true } },
      { label: 'Try to run past', go: 'run_past' },
    ],
  },
  run_past: {
    lines: [
      { who: 'narrator', text: 'Tobin runs. Mossback just... sits down in the middle of the bridge. He is VERY big. Tobin bonks right into his tummy and falls over.' },
      { who: 'mossback', text: 'Oof. That was rude. Riddles, please.' },
    ],
    next: 'riddle1',
  },
  riddle1: { random: ['r1a', 'r1b'] },
  r1a: R1('r1a', 'Riddle one! What has keys, but can\'t open a single lock?', ['A piano', 'A goblin', 'A treasure chest'], 0),
  r1a_ok: OK('riddle2', 'A piano! Correct! Very good.'), r1a_no: NO('riddle2', 'Hmm, no. It was a piano. Pianos have keys! On to the next one.'),
  r1b: R1('r1b', 'Riddle one! What gets wetter the more it dries?', ['A towel', 'A fish', 'The river'], 0),
  r1b_ok: OK('riddle2', 'A towel! Correct!'), r1b_no: NO('riddle2', 'Ah, it was a towel. It dries YOU, and gets wet. On we go.'),
  riddle2: { random: ['r2a', 'r2b'] },
  r2a: R1('r2a', 'Riddle two! I have a face and two hands, but no arms or legs. What am I?', ['A scarecrow', 'A clock', 'A troll'], 1),
  r2a_ok: OK('riddle3', 'A clock! Splendid!'), r2a_no: NO('riddle3', 'It was a clock! A clock has a face and hands. Ho ho.'),
  r2b: R1('r2b', 'Riddle two! What has a neck, but no head?', ['A bottle', 'A snake', 'A goose'], 0),
  r2b_ok: OK('riddle3', 'A bottle! Well done!'), r2b_no: NO('riddle3', 'A bottle! Bottles have necks. Hollis, stop looking at the goose option.'),
  riddle3: { random: ['r3a', 'r3b'] },
  r3a: R1('r3a', 'Last riddle! The more of me you take, the more you leave behind. What am I?', ['Cookies', 'Footsteps', 'Coins'], 1),
  r3a_ok: OK('riddles_done', 'Footsteps! Oh, I do love that one.'), r3a_no: NO('riddles_done', 'Footsteps! You leave them behind as you walk. Oh well.'),
  r3b: R1('r3b', 'Last riddle! What can you catch, but never throw?', ['A ball', 'A cold', 'A fish'], 1),
  r3b_ok: OK('riddles_done', 'A cold! Achoo! Correct!'), r3b_no: NO('riddles_done', 'A cold! You can catch one, but you can\'t throw it. Achoo.'),
  riddles_done: {
    lines: [
      { who: 'mossback', text: 'You answered every riddle, and you were very polite about it. You may cross!', if: 'polite', ifNot: 'riddleMiss' },
      { who: 'mossback', text: 'Close enough! You tried, and you were polite. You may cross.', if: ['polite', 'riddleMiss'] },
      { who: 'mossback', text: 'You may cross. But next time, say please.', ifNot: 'polite' },
      { who: 'mossback', text: 'You know, it gets lonely on this bridge. If you ever need a big friend, I would come along. I am very good at sitting on things.', if: 'polite' },
    ],
    nextIf: [{ if: 'polite', go: 'mossback_join' }],
    next: 'riverbend',
  },
  mossback_join: {
    lines: [{ who: 'hero', text: 'Come with us, Mossback! We could use a big friend.' }, { who: 'mossback', text: 'Splendid! I shall bring my moss.' }],
    join: 'mossback', set: { mossback: true },
    next: 'riverbend',
  },
  riverbend: {
    lines: [
      { who: 'narrator', text: 'Riverbend is BIG. Three streets, a market, a library with a tower, and a big water wheel that goes splish, splash.' },
      { who: 'juni', text: 'Look at that water wheel. It\'s stuck. That hurts my heart.' },
      { who: 'pim', text: 'A LIBRARY. A real one. Can we go? Please?' },
    ],
    next: 'town',
  },
  town: {
    hub: {
      place: 'Riverbend',
      text: 'Riverbend! Tap someone to talk, or visit the shop. Tap Done when you are ready to go on.',
      people: [
        { id: 'library', who: 'pim', label: 'The library', go: 'library' },
        { id: 'woodcutter', label: 'Old Alder', go: 'woodcutter' },
        { id: 'goat', who: 'nell', label: 'Lost goat', go: 'goat' },
        { id: 'wheel', who: 'juni', label: 'Water wheel', go: 'wheel' },
        { id: 'mossback', label: 'Mossback', go: 'moss_talk', if: 'party:mossback' },
        { id: 'moss2', who: 'mossback', label: 'A sad troll', go: 'moss_sad', ifNot: 'party:mossback' },
      ],
      shop: { who: 'smith', name: 'Riverbend market', say: '"Ropes, lanterns, potions and shields! Everything an adventurer needs!"',
        stock: [{ id: 'rope', price: 4 }, { id: 'lantern', price: 4 }, { id: 'potion', price: 5 }, { id: 'buckler', price: 6 }, { id: 'ironcap', price: 6 }, { id: 'steelsword', price: 10 }, { id: 'shortbow', price: 10 }] },
      shopLabel: 'Shop at the market',
      doneLabel: 'Done in Riverbend',
      done: 'night',
    },
  },
  library: {
    lines: [
      { who: 'pim', text: 'Look! A book about Gran\'s book! It says page 12 is a healing spell. Patch Up!' },
      { who: 'pim', text: 'Little ache, little scrape, find your way back into shape: PATCH UP! ...My scraped knee! It\'s all better!' },
      { who: 'narrator', text: 'Pim learned Patch Up! In fights, Pim can heal a friend who is hurt.', ifNot: 'bestAt:clever' },
    ],
    set: { patch: true },
    nextIf: [{ if: 'bestAt:clever', go: 'library_learn' }],
    next: 'library2',
  },
  library_learn: {
    lines: [{ who: 'narrator', text: 'Pim teaches {name} the words too. You learned Patch Up! In a fight, tap Patch Up, then tap a hurt friend, or yourself.' }],
    give: { spell: 'patch' },
    next: 'library2',
  },
  // Gran's missing page (if the fish didn't have it), and a clue on the library cards.
  library2: { nextIf: [{ ifNot: 'snooze', go: 'library_page' }], next: 'library_cards' },
  library_page: {
    lines: [
      { who: 'pim', text: 'If this library has a book about Gran\'s book, maybe somebody copied the missing page. Page 15. Help me look!', if: 'pageQuest' },
      { who: 'pim', text: 'The book says there are more pages. Page 15 is a sleepy song. Maybe somebody copied it down. Help me look!', ifNot: 'pageQuest' },
    ],
    check: { skill: 'lore', help: 'pim', label: 'Search the library for page 15', great: 'page_found', ok: 'page_found', miss: 'page_lost', disaster: 'page_oops' },
  },
  page_found: {
    lines: [
      { who: 'narrator', text: 'Third shelf, behind a big book about soup: a dusty copy of page 15!' },
      { who: 'pim', text: 'Sleepy head, cozy bed, close your eyes and rest your head: SNOOZE! ...Oh no. The librarian fell asleep.' },
      { who: 'narrator', text: 'Pim learned Snooze! In fights, Pim can sing a monster to sleep so it loses its next turn.' },
    ],
    set: { snooze: true },
    nextIf: [{ if: 'bestAt:clever', go: 'page_learn' }],
    next: 'library_cards',
  },
  page_learn: {
    lines: [{ who: 'narrator', text: 'Pim teaches {name} the song too. You learned Snooze! In a fight, tap Snooze, then tap a monster. On a good roll, it nods off.' }],
    give: { spell: 'snooze' },
    next: 'library_cards',
  },
  page_lost: {
    lines: [{ who: 'narrator', text: 'So many books! {name} looks until the letters go wiggly. No page 15 yet. You can come back and look again.' }],
    next: 'library_cards',
  },
  page_oops: {
    lines: [
      { who: 'narrator', text: 'OOPS! {name} pulls out one book, and the whole shelf goes over like dominoes. FWUMP. FWUMP. FWUMP. FWUMP.' },
      { who: 'narrator', text: '"SHHHHH!" says the librarian. It takes a while to put them all back. You can look again later.' },
    ],
    next: 'library_cards',
  },
  library_cards: {
    lines: [
      { who: 'narrator', text: 'On the way out, Pim stops at the shelf of books about stars and clockwork. Almost all of them are gone.' },
      { who: 'pim', text: 'Look at the cards. The same person borrowed every single one. They didn\'t write a name. They just drew a little gear.' },
      { who: 'nell', text: 'Who draws a gear instead of a name?' },
    ],
    set: { libraryGear: true },
    next: 'town',
  },
  woodcutter: {
    lines: [
      { who: 'woodcutter', text: 'Black feathers? Hmm. When I was young, there was a grove of silver trees near here. The prettiest trees you ever saw.' },
      { who: 'woodcutter', text: 'We cut them all down for lumber. I helped. A woman lived in the grove. She cried and cried. Then she went away.' },
      { who: 'woodcutter', text: 'I\'ve been sorry about it for fifty years.' },
      { who: 'woodcutter', text: 'Oof. This firewood gets heavier every winter.', ifNot: 'seedGot' },
    ],
    set: { woodcutter: true },
    choices: [
      { label: 'Help Old Alder carry his firewood', go: 'wood_carry', ifNot: 'seedGot' },
      { label: 'Say goodbye', go: 'town', ifNot: 'seedGot' },
    ],
    next: 'town',
  },
  // A side quest that ends at Bramble's tower: the last silver seed.
  wood_carry: { check: { skill: 'tough', help: 'hollis', label: 'Carry the big pile of firewood', great: 'wood_ok', ok: 'wood_ok', miss: 'wood_toe', disaster: 'wood_roll' } },
  wood_ok: {
    lines: [{ who: 'narrator', text: '{name} carries the whole pile, all the way to Old Alder\'s door, without dropping one stick.' }],
    next: 'seed_get',
  },
  wood_toe: {
    hurt: 1,
    lines: [{ who: 'narrator', text: 'Halfway there, a log slips and lands right on {name}\'s toe. OW. But the firewood gets there in the end.' }],
    next: 'seed_get',
  },
  wood_roll: {
    lines: [
      { who: 'narrator', text: 'OOPS! The pile tips over, and every log rolls down the hill, straight into the market. Bonk. Bonk. CRASH. That was the apple cart.' },
      { who: 'narrator', text: 'It takes a while to pick up all the apples. {name} pays for the squished ones. Old Alder laughs until he has to sit down.' },
    ],
    give: { coins: -2 },
    next: 'seed_get',
  },
  seed_get: {
    lines: [
      { who: 'woodcutter', text: 'You\'re a good kid. Here. I want you to have something.' },
      { who: 'narrator', text: 'He takes a tiny cloth bag out of his pocket. Inside is one seed. It is silver, and it shines a little, even in the daytime.' },
      { who: 'woodcutter', text: 'The last seed from the silver grove. I picked it up the day we cut the trees down. I\'ve carried it for fifty years, and I never knew who to give it to.' },
      { who: 'woodcutter', text: 'Maybe you\'ll meet someone who should have it.' },
    ],
    give: { items: { seed: 1 } },
    set: { seedGot: true },
    next: 'town',
  },
  // A second chance: if Mossback didn't join at the bridge, he came to look at Riverbend's bridges.
  moss_sad: {
    lines: [
      { who: 'narrator', text: 'A very large troll is sitting by the Riverbend bridge with his chin in his hands.' },
      { who: 'mossback', text: 'Oh. It is you. I came to see the bridges of Riverbend. They are lovely bridges. But nobody here says please, either.' },
    ],
    choices: [
      { label: 'Say sorry, and ask him to come along', go: 'moss_sorry' },
      { label: 'Wave and walk on', go: 'town' },
    ],
  },
  moss_sorry: {
    lines: [
      { who: 'hero', text: 'Mossback, I\'m sorry we were rude at your bridge. Would you please come with us? We could really use a big friend.' },
      { who: 'mossback', text: 'You said sorry AND please. In one go! Splendid. I shall bring my moss.' },
      { who: 'narrator', text: 'Mossback joins your team!' },
    ],
    join: 'mossback', set: { mossback: true, polite: true },
    next: 'town',
  },
  goat: { nextIf: [{ if: 'goat_done', go: 'goat_again' }], next: 'goat_ask' },
  goat_ask: {
    lines: [{ who: 'narrator', text: 'A girl is crying. "My goat, Turnip, ran away! He\'s somewhere in town!"' }],
    check: { skill: 'track', help: 'nell', label: 'Follow the goat tracks', great: 'goat_found', ok: 'goat_found', miss: 'goat_far' },
  },
  goat_again: { lines: [{ who: 'narrator', text: 'Turnip the goat is home, eating a hat. Everyone is happy except the hat.' }], next: 'town' },
  goat_found: { lines: [{ who: 'narrator', text: 'Turnip is in the bakery, eating a pie. The girl hugs him and gives you coins.' }], give: { coins: 4 }, set: { goat_done: true }, next: 'town' },
  goat_far: {
    lines: [
      { who: 'narrator', text: 'Turnip isn\'t anywhere in town. You follow the bleats out past the fence... and stop.' },
      { who: 'narrator', text: 'Turnip is backed up against a rock. Two hungry wolves are sniffing at him. BAAA!' },
    ],
    choices: [
      { label: 'Scare them off (look big and loud!)', go: 'goat_scare' },
      { label: 'Fight them', go: 'fight:goatwolves' },
    ],
  },
  goat_scare: { check: { skill: 'brave', help: 'hollis', label: 'Look big and loud to scare the wolves', great: 'goat_scared', ok: 'goat_scared', miss: 'goat_noscare' } },
  goat_scared: {
    xpKey: 'goatwolves',
    xp: 3, xpWhy: 'You scared the wolves away! That counts as winning.',
    lines: [{ who: 'narrator', text: '{name} waves both arms and yells "SHOO!" so loud that a bird falls off a branch. The wolves run for it.' }],
    next: 'goat_saved',
  },
  goat_noscare: {
    lines: [{ who: 'narrator', text: '{name} yells "Shoo!" but it comes out as a squeak. The wolves just look at you. Grrr.' }],
    next: 'fight:goatwolves',
  },
  goat_saved: { lines: [{ who: 'narrator', text: 'Turnip trots home right behind you, very proud of himself. The girl hugs him and gives you coins.' }], give: { coins: 4 }, set: { goat_done: true }, next: 'town' },
  goat_lose: { lines: [{ who: 'narrator', text: 'The wolves chase everyone back to the fence. Then Turnip headbutts the last wolf right in the bottom. It runs away crying. Go, Turnip!' }], give: { coins: 3 }, set: { goat_done: true }, next: 'town' },
  wheel: { nextIf: [{ if: 'wheel_done', go: 'wheel_again' }], next: 'wheel_ask' },
  wheel_ask: {
    lines: [{ who: 'juni', text: 'The water wheel is jammed. If you lift that beam, I can get the stick out.' }],
    check: { skill: 'shove', help: 'juni', label: 'Lift the heavy beam', great: 'wheel_win', ok: 'wheel_win', miss: 'wheel_splash' },
  },
  wheel_again: { lines: [{ who: 'juni', text: 'Splish, splash. Perfect.' }], next: 'town' },
  wheel_win: { lines: [{ who: 'narrator', text: 'Creak, creak... SPLASH! The wheel spins! The miller pays you.' }], give: { coins: 4 }, set: { wheel_done: true }, next: 'town' },
  wheel_splash: { lines: [{ who: 'narrator', text: 'The beam slips and {name} gets soaked. Juni fixes it anyway. The miller pays you.' }], give: { coins: 3 }, set: { wheel_done: true }, next: 'town' },
  moss_talk: { lines: [{ who: 'mossback', text: 'What a lovely town. So many bridges. I may never leave.' }], next: 'town' },
  night: {
    lines: [
      { who: 'narrator', text: 'That night, the kids sleep at the Riverbend inn. In the middle of the night... CAW! CAW! CAW!' },
      { who: 'narrator', text: 'Crows! Dozens of them, swooping down on the town square, grabbing spoons and rings and anything shiny!' },
      { who: 'hollis', text: 'Just like the goblins! Come on!' },
    ],
    next: 'fight:crows',
  },
  crows_win: {
    lines: [
      { who: 'narrator', text: 'The last crow flaps away, cawing angrily. One drops something as it goes: a green ribbon.' },
    ],
    next: 'ribbon',
  },
  crows_lose: {
    lines: [{ who: 'narrator', text: 'The crows swirl around the kids in a black cloud.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:crows', retry: true },
      { label: 'See what happens', go: 'crows_see' },
    ],
  },
  crows_see: {
    lines: [{ who: 'narrator', text: 'The crows fly off with a pile of spoons. But one crow gets tangled in a clothesline and drops something: a green ribbon.' }],
    next: 'ribbon',
  },
  ribbon: {
    lines: [
      { who: 'pim', text: 'There\'s a name stitched on it. B-R-A-M-B-L-E. Bramble.' },
      { who: 'woodcutter', text: 'Bramble? That was HER name. The woman from the silver grove. She lives in the old tower now, they say. With her crows.', if: 'woodcutter' },
      { who: 'nell', text: 'B is for Bramble. We found B.' },
      { who: 'hollis', text: 'Then we go to the tower.' },
    ],
    set: { knowBramble: true },
    heal: true,
    levelUp: true,
    nextIf: [{ if: 'goat_done', go: 'turnip_follow' }],
    next: 'end',
  },
  // A running joke that ends in Gearwick: the goat thinks he's an adventurer now.
  turnip_follow: {
    lines: [
      { who: 'narrator', text: 'As the kids walk out of Riverbend, something behind them goes "Baaa."' },
      { who: 'narrator', text: 'It\'s Turnip the goat. He is following them. He has a little piece of pie on his nose, and a look on his face that says he is an adventurer now.' },
      { who: 'tobin', text: 'Can we keep him? He already ate my hat, so we\'re basically friends.' },
    ],
    set: { turnip: true },
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 8', text: 'Next: Chapter 9, The Old Tower. Puzzles, clockwork owls, and Bramble\'s secret.' },
};

export default { SCENES, FIGHTS, TEXT };
