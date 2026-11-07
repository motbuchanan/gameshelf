// Chapter 6: Home Again. The party, the town, the shop, side jobs, level 5, and the letter from B.
// Text uses {name} for the hero's name. No em dashes.
import CH5 from './ch5.js';

export const TEXT = { ...CH5.TEXT };

const back = 'town';

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'The kids walk out of Whisper Woods together. All of them. Even Juni, who complains about her feet the whole way.' },
      { who: 'narrator', text: 'And when they get to Millbrook, the whole town is waiting.' },
      { who: 'baker', text: 'HOLLIS! You\'re okay! You\'re ALL okay!' },
      { who: 'narrator', text: 'Parents hug kids. Kids hug parents. Mister Stoutbarrel brings out a pie as big as a wagon wheel.' },
      { who: 'sniffle', text: 'Is... is Sniffle allowed to have pie?', if: 'party:sniffle' },
      { who: 'pudge', text: 'Pudge LOVES pie.', if: 'party:pudge' },
      { who: 'baker', text: 'Any friend of these kids gets pie!', if: 'party:sniffle' },
      { who: 'gran', text: 'Pim. You used page 9, didn\'t you? I can tell. Your eyebrows are a little bit singed.', if: 'spark' },
    ],
    next: 'town',
  },
  town: {
    hub: {
      text: 'Millbrook is happy to have you back. Tap someone to talk, or visit the shop. Tap Done when you\'re ready.',
      people: [
        { id: 'gran', label: 'Gran' },
        { id: 'baker', label: 'The baker' },
        { id: 'smith', label: 'The smith', go: 'smith' },
        { id: 'captain', label: 'Captain Ward' },
        { id: 'hollis', label: 'Hollis' },
        { id: 'juni', label: 'Juni' },
        { id: 'tobin', label: 'Tobin' },
        { id: 'sniffle', label: 'Sniffle', if: 'party:sniffle' },
        { id: 'pudge', label: 'Pudge', if: 'party:pudge' },
      ].map(p => ({ go: p.id, ...p })),
      shop: true,
      doneLabel: 'Done in town',
      done: 'letter',
    },
  },

  // Gran: find her runaway cat.
  gran: {
    lines: [
      { who: 'gran', text: 'Welcome home, little hero. Thank you for bringing my Pim back.' },
      { who: 'gran', text: 'Now, I hate to ask, but my cat Biscuit ran into the woods when all the fuss started. Would you look for her?', ifNot: 'cat_done' },
      { who: 'gran', text: 'Biscuit is asleep on my pillow, right where she belongs. Thank you again.', if: 'cat_done' },
    ],
    nextIf: [{ if: 'cat_done', go: back }],
    choices: [
      { label: 'Look for Biscuit', go: 'cat' },
      { label: 'Maybe later', go: back },
    ],
  },
  cat: { check: { skill: 'track', help: 'nell', label: 'Follow the little paw prints', great: 'cat_found', ok: 'cat_found', miss: 'cat_tree' } },
  cat_found: {
    lines: [
      { who: 'narrator', text: 'The paw prints lead to a hollow log. Inside, Biscuit is curled up, purring.' },
      { who: 'gran', text: 'Biscuit! Here, take these coins. And a cookie. Mostly the coins.' },
    ],
    give: { coins: 4 }, set: { cat_done: true },
    next: back,
  },
  cat_tree: {
    lines: [
      { who: 'narrator', text: '{name} can\'t find the prints. But then a tiny "mew" comes from way, way up a tree.' },
      { who: 'narrator', text: 'Hollis climbs up, Biscuit climbs down, and Hollis gets stuck. It takes a while. Everybody laughs.' },
      { who: 'gran', text: 'Biscuit! And Hollis, eventually. Here, a few coins for your trouble.' },
    ],
    give: { coins: 3 }, set: { cat_done: true },
    next: back,
  },

  baker: {
    lines: [
      { who: 'baker', text: 'There\'s my boy\'s best friend! You brought my Hollis home. Have some pie. Have ALL the pie.' },
      { who: 'baker', text: 'And here. The town took up a collection for the kids who saved Millbrook. Use it at the smithy!', ifNot: 'baker_paid' },
      { who: 'baker', text: 'Want to hear a joke? Why did the goblin take a bath? He didn\'t. Ha! Goblins never take baths!', if: 'baker_paid' },
    ],
    give: { coins: 0 },
    nextIf: [{ if: 'baker_paid', go: back }],
    next: 'baker_pay',
  },
  baker_pay: { give: { coins: 5 }, set: { baker_paid: true }, lines: [{ who: 'narrator', text: 'You got 5 coins!' }], next: back },

  smith: {
    lines: [
      { who: 'smith', text: 'So you\'re the kid with the bucket. Brenna. I make real gear, for real heroes.' },
      { who: 'smith', text: 'Got any goblin junk from that warren? Rusty knives, bent spoons? I\'ll buy it all.', ifNot: 'junk_sold' },
      { who: 'smith', text: 'Tap "Shop at the smithy" to see what I\'ve got.', if: 'junk_sold' },
    ],
    nextIf: [{ if: 'junk_sold', go: back }],
    next: 'smith_junk',
  },
  smith_junk: {
    lines: [
      { who: 'narrator', text: 'The kids empty their pockets: rusty knives, a goblin sock, three bent spoons, and a whistle.' },
      { who: 'smith', text: 'Phew, that sock. Here, 8 coins for the lot. Spend them in my shop!' },
    ],
    give: { coins: 8 }, set: { junk_sold: true },
    next: back,
  },

  captain: {
    lines: [
      { who: 'captain', text: 'I owe you kids an apology. A message came saying there was trouble at the far bridge. We all rode out there. Nothing. Not a thing.' },
      { who: 'captain', text: 'And the message had a little black feather on it. Strange, isn\'t it?' },
      { who: 'hero', text: 'We saw a black feather too. On a note, and on a letter Grubjaw dropped.', if: 'letter' },
      { who: 'captain', text: 'Hm. Then someone wanted the guards gone. That is not good. Keep your eyes open, little hero.' },
    ],
    set: { feather: true },
    next: back,
  },

  // Hollis: the geese.
  hollis: {
    lines: [
      { who: 'hollis', text: '{name}. I need help. Don\'t laugh.', ifNot: 'geese_done' },
      { who: 'hollis', text: 'There are GEESE in my dad\'s garden. Big ones. I can fight goblins, but geese are different. Geese are evil.', ifNot: 'geese_done' },
      { who: 'hollis', text: 'Thanks for the geese thing. You didn\'t tell anybody, right? Right?', if: 'geese_done' },
    ],
    nextIf: [{ if: 'geese_done', go: back }],
    choices: [
      { label: 'Chase the geese out', go: 'geese' },
      { label: 'Maybe later', go: back },
    ],
  },
  geese: { check: { skill: 'brave', help: 'hollis', label: 'Be brave and chase the geese away', great: 'geese_win', ok: 'geese_win', miss: 'geese_chase' } },
  geese_win: {
    lines: [
      { who: 'narrator', text: '{name} waves both arms and yells, "SHOO!" The geese honk and waddle off in a huff.' },
      { who: 'baker', text: 'My garden! Saved! Here are some coins, hero.' },
    ],
    give: { coins: 4 }, set: { geese_done: true },
    next: back,
  },
  geese_chase: {
    hurt: 1,
    lines: [
      { who: 'narrator', text: 'HONK! The biggest goose chases {name} around the garden three times. Then Hollis gets brave and chases the goose.' },
      { who: 'hollis', text: 'I DID IT! I chased a GOOSE!' },
      { who: 'baker', text: 'Ha! Well, the garden is safe. Here, a few coins.' },
    ],
    give: { coins: 3 }, set: { geese_done: true },
    next: back,
  },

  // Juni: fix the mill wheel.
  juni: {
    lines: [
      { who: 'juni', text: 'Hey, {name}. The mill wheel is stuck again. Can you help me lift it while I fix it?', ifNot: 'mill_done' },
      { who: 'juni', text: 'The mill wheel is working great. I made it squeak a tiny bit. For old times\' sake.', if: 'mill_done' },
    ],
    nextIf: [{ if: 'mill_done', go: back }],
    choices: [
      { label: 'Help fix the mill', go: 'mill' },
      { label: 'Maybe later', go: back },
    ],
  },
  mill: { check: { skill: 'shove', help: 'juni', label: 'Lift the heavy mill wheel', great: 'mill_win', ok: 'mill_win', miss: 'mill_splash' } },
  mill_win: {
    lines: [
      { who: 'narrator', text: '{name} lifts with all their might. Juni slides a new peg in. The wheel creaks, then spins!' },
      { who: 'juni', text: 'Teamwork! The miller says thanks, and here are your coins.' },
    ],
    give: { coins: 4 }, set: { mill_done: true },
    next: back,
  },
  mill_splash: {
    lines: [
      { who: 'narrator', text: 'The wheel slips, and SPLASH, {name} ends up sitting in the millpond. Juni fixes it anyway, while laughing.' },
      { who: 'juni', text: 'Still counts! Here, the miller paid us.' },
    ],
    give: { coins: 3 }, set: { mill_done: true },
    next: back,
  },

  tobin: {
    lines: [
      { who: 'tobin', text: 'Did you know I ate ALL the goblins\' snacks? Did I tell you that? I\'m telling everybody.' },
      { who: 'tobin', text: 'Also, when I was in the pantry, I heard Grubjaw talking. He said someone was PAYING him. Someone called "B."' },
    ],
    set: { heardB: true },
    next: back,
  },
  sniffle: {
    lines: [
      { who: 'sniffle', text: 'Millbrook is so nice! Nobody yells at Sniffle here. Achoo! Sorry.' },
      { who: 'sniffle', text: 'Back at the camp, Grubjaw got letters with black feathers. He always got nervous when he read them. Even Grubjaw was scared of B.' },
    ],
    set: { heardB: true },
    next: back,
  },
  pudge: {
    lines: [
      { who: 'pudge', text: 'The baker gave Pudge a pie. A whole pie! Pudge is never going back to the warren.' },
      { who: 'pudge', text: 'Psst. Grubjaw said the woods would belong to someone new soon. Someone with a black feather. Pudge doesn\'t like the sound of that.' },
    ],
    set: { heardB: true },
    next: back,
  },

  letter: {
    lines: [
      { who: 'narrator', text: 'That night, everyone sits around a big bonfire in the town square. Pim takes out the letter Grubjaw dropped.' },
      { who: 'pim', text: 'It says: "Grubjaw. Chase the people out of Whisper Woods. The woods are mine. B."' },
      { who: 'captain', text: 'The same black feather as the bridge message. Someone planned all of this.' },
      { who: 'tobin', text: 'B! Grubjaw talked about B!', if: 'heardB' },
      { who: 'nell', text: 'So Grubjaw wasn\'t the real boss. Somebody else was.' },
      { who: 'juni', text: 'Who\'s B? What does B want with the woods?' },
      { who: 'narrator', text: 'Nobody knows. The world is bigger than Millbrook and Whisper Woods. Much bigger. And somewhere out there is B.' },
      { who: 'hollis', text: '{name}? I think we have another adventure coming.' },
    ],
    levelUp: 'stat',
    next: 'finale',
  },
  finale: {
    end: true,
    party: true,
    title: 'The End of Book One',
    text: 'You saved your friends, beat Grubjaw, and made friends with monsters. Book Two, Who Is B?, comes in a future update.',
  },
};

export default { SCENES, TEXT };
