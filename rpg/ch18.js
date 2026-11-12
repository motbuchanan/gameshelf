// Chapter 18: Under the Mountain. The Troll Road through the mountain: the troll bridge (riddles with
// Mossback, or a fight), trolls that heal unless the sun or a Spark gets them, the sunbeam and mirror
// puzzle, Queen Granite (talk, trade a keepsake, or fight), and the knight steals {dragon} in the night.
// New: {dragon} learns Glow. Text uses {name} and {dragon}. No em dashes.
import CH17 from './ch17.js';

export const LEARNED = { ...CH17.LEARNED };

export const TEXT = {
  ...CH17.TEXT,
  TEACH: { ...CH17.TEXT.TEACH, monsterturn: 'STOMP. STOMP. (The trolls lumber closer.)' },
  REGEN_TEACH: 'Trolls heal a little at the end of every turn! Unless they are standing in a sunbeam, or a Spark just warmed them up.',
  TALK_TARGET: 'Queen Granite',
  TALK_WHO: 'granite',
  CALM_LINES: [
    'Manners? From such small creatures? Hmph. Go on.',
    'You know my nephew Mossback? Little Mossy? He was such a polite boy.',
    'A dragon belongs with its mother. Yes. Yes, I suppose it does.',
  ],
  TALK_FAIL: 'Enough chatter! Troll Queens do not chatter!',
  CHATTER: {
    ...CH17.TEXT.CHATTER,
    t1: ['HRRRM.', 'Troll smash. Politely.', 'Who goes there?'], t2: ['HRMMM!', 'Shiny dragon!', 'Stomp!'], t3: ['Riddle me THIS. Oh wait. Smash.', 'HRRM!'],
    granite: ['Bow before the Queen!', 'Shiny! I want the shiny!', 'HRRRRMMM!', 'Manners, small ones!'],
  },
};

const TROLL = (id, x, y) => ({ id, monster: 'mtroll', name: 'Mountain troll', x, y });

export const FIGHTS = {
  bridge: {
    id: 'ch18-bridge', xpKey: 'bridge',
    xp: 7, xpWhy: 'You got past the troll bridge!',
    mode: 'hp',
    map: [
      'wwwwwwwwwww',
      'w,,,,u,,,,w',
      'w,,,,,,,,,w',
      'gggg,,,gggg',
      'gggg,,,gggg',
      'w,,,,,,,,,w',
      'w,,u,,,u,,w',
      'wwwww,wwwww',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      TROLL('t1', 4, 1), TROLL('t2', 6, 1),
    ],
    dragon: { x: 5, y: 7 },
    team: { from: 'picked', exclude: ['inkwing', 'dot'], spots: [{ x: 4, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 5 }] },
    roundCap: 16, capResult: 'win', boost: { hp: 4, skill: 45 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['mtroll'],
    events: [{ round: 0, type: 'say', lines: [
      { who: 'pim', text: 'Trolls heal every turn! See the yellow sunbeam squares? A troll standing in the sun can\'t heal.' },
      { who: 'pim', text: 'And fire warms them up too. A Spark stops a troll healing for a turn.' },
    ] }],
    then: { win: 'bridge_win', lose: 'bridge_lose' },
  },
  queen: {
    id: 'ch18-queen', xpKey: 'queen',
    xp: 10, xpWhy: 'You beat Queen Granite!',
    mode: 'hp',
    map: [
      'wwwwwwwwwwwww',
      'w,,,,,,,,,,,w',
      'w,u,,,,,,,u,w',
      'w,,,,,c,,,,,w',
      'w,,,,uuu,,,,w',
      'w,,c,,,,,c,,w',
      'w,u,,,,,,,u,w',
      'wwwwww,wwwwww',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 6, y: 6 },
      { id: 'granite', monster: 'granite', name: 'Queen Granite', x: 6, y: 1 },
      TROLL('t1', 3, 2), TROLL('t2', 9, 2),
    ],
    dragon: { x: 6, y: 7 },
    team: { from: 'picked', exclude: ['inkwing', 'dot'], spots: [{ x: 5, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 5 }] },
    calm: { max: 3, bonusIf: { 'team:mossback': 15, trollTree: 5, mannersUsed: 10 }, startIf: { talkedFirst: 1 } },
    roundCap: 16, capResult: 'win', boost: { hp: 2, skill: 30 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['granite', 'mtroll'],
    events: [{ round: 0, type: 'say', lines: [
      { who: 'pim', text: 'You can still Talk to the Queen in the middle of the fight! Trolls love good manners.' },
      { who: 'juni', text: 'And lure them into the sunbeams so they can\'t heal!' },
    ] }],
    then: { win: 'queen_beat', calm: 'queen_calm', lose: 'queen_lose' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'The footprints lead to a huge stone door in the side of the mountain. Carved over it are the words: THE TROLL ROAD. MIND YOUR MANNERS.' },
      { who: 'pim', text: 'The only way through the mountain is under it.' },
      { who: 'narrator', text: 'Inside, it\'s dark. Really, really dark. Then {dragon} blinks, and... its scales start to glow, soft and blue, like a nightlight.' },
      { who: 'nell', text: '{dragon} is GLOWING! It learned to glow!' },
      { who: 'dragon', text: 'Mew! (It looks very surprised at itself.)' },
    ],
    set: { dragonGlow: true, dragonGrown: true },
    next: 'mossback_home',
  },
  mossback_home: { nextIf: [{ if: 'party:mossback', go: 'mossback_talk' }], next: 'team' },
  mossback_talk: {
    lines: [
      { who: 'mossback', text: 'I grew up down here, you know. Before the Riverbend bridge. My whole family lives under this mountain.' },
      { who: 'mossback', text: 'Cousin Boulder, Uncle Gravel, and my great-aunt. She is the Queen. She is... a lot.' },
      { who: 'mossback', text: 'Please, whatever happens, say please and thank you. Trolls care about manners more than anything. Well. Manners and shiny things.' },
    ],
    set: { trollTree: true },
    next: 'team',
  },
  team: {
    lines: [{ who: 'narrator', text: 'The Troll Road goes deep. Who walks into the dark with you?' }],
    pickTeam: { size: 3, exclude: ['inkwing', 'dot'] },
    next: 'bridge',
  },
  // ----- the troll bridge -----
  bridge: {
    lines: [
      { who: 'narrator', text: 'The road crosses a deep crack in the mountain on a stone bridge. Two big gray trolls stand in the middle of it.' },
      { who: 'narrator', text: 'They are even bigger than Mossback. They have rocks growing on their shoulders, like moss on a log.' },
      { who: 'narrator', text: '"HRRRM. Nobody crosses the Troll Road without answering three riddles." Then the other one adds, "Please."' },
    ],
    meet: ['mtroll'],
    choices: [
      { label: 'Let Mossback do the talking', go: 'riddles_moss', if: 'team:mossback' },
      { label: 'We\'ll answer your riddles', go: 'riddle1' },
      { label: 'Get out of our way!', go: 'rude' },
    ],
  },
  riddles_moss: {
    lines: [
      { who: 'mossback', text: 'Cousin Boulder! Cousin Pebble! It\'s me, Mossback. Little Mossy!' },
      { who: 'narrator', text: 'The trolls squint. Then they gasp, and grab Mossback in a hug so big you hear his back pop.' },
      { who: 'narrator', text: '"MOSSY! You got so... medium! Of course your friends can cross. But you must answer ONE riddle. Family rules."' },
      { who: 'mossback', text: 'I\'ll take it. Go on, Cousin.' },
    ],
    set: { mossHome: true, trollTree: true },
    next: 'riddle3',
  },
  riddle1: {
    lines: [{ who: 'narrator', text: '"First riddle. The more of me you take, the more you leave behind. What am I?"' }],
    choices: [
      { label: 'Footsteps', go: 'riddle2' },
      { label: 'Cookies', go: 'riddle_wrong' },
      { label: 'Snow', go: 'riddle_wrong' },
    ],
  },
  riddle2: {
    lines: [{ who: 'narrator', text: '"HRRM. Correct. Second riddle. What has to be broken before you can use it?"' }],
    choices: [
      { label: 'A promise', go: 'riddle_wrong2' },
      { label: 'An egg', go: 'riddle3' },
      { label: 'A rock', go: 'riddle_wrong2' },
    ],
  },
  riddle3: {
    lines: [{ who: 'narrator', text: '"Last riddle. I have a head and a tail, but no body. What am I?"' }],
    choices: [
      { label: 'A snake', go: 'riddle_wrong3' },
      { label: 'A coin', go: 'riddle_right' },
      { label: 'A dragon', go: 'riddle_wrong3' },
    ],
  },
  riddle_wrong: {
    lines: [
      { who: 'narrator', text: '"HRRRM. Wrong. But you said it so politely. Try again."' },
      { who: 'pim', text: 'Think about it slowly. Read it one more time.' },
    ],
    next: 'riddle1',
  },
  riddle_wrong2: {
    lines: [{ who: 'narrator', text: '"HRRRM. Wrong. But very polite. Try again."' }],
    next: 'riddle2',
  },
  riddle_wrong3: {
    lines: [{ who: 'narrator', text: '"Wrong! But polite. One more try."' }],
    next: 'riddle3',
  },
  riddle_right: {
    xp: 7, xpKey: 'bridge', xpWhy: 'You answered the troll riddles!',
    lines: [
      { who: 'narrator', text: '"A COIN! Correct! HRRRM HRRRM!" (That is how trolls laugh.) They step aside and bow.' },
      { who: 'narrator', text: '"Thank you for your manners. Go see the Queen. She will want to see your shiny little dragon. She likes shiny things. Very much."' },
    ],
    set: { mannersUsed: true },
    next: 'mirrors',
  },
  rude: {
    lines: [
      { who: 'narrator', text: '"RUDE!" both trolls roar at once. "No riddles for rude people! Only SMASH!"' },
      { who: 'mossback', text: 'Oh, dear. I did say manners. I did say.', if: 'team:mossback' },
    ],
    next: 'fight:bridge',
  },
  bridge_win: {
    lines: [
      { who: 'narrator', text: 'The trolls sit down on the bridge with a big THUMP. "HRRM. Fine. You are strong. Go. But the Queen will hear about this."' },
    ],
    next: 'mirrors',
  },
  bridge_lose: {
    lines: [
      { who: 'narrator', text: 'The trolls pick everyone up, very gently, and carry them across the bridge like sacks of potatoes.' },
      { who: 'narrator', text: '"Rude people don\'t cross. But lost children go to the Queen. Those are the rules."' },
    ],
    next: 'mirrors',
  },
  // ----- the sunbeam and mirror puzzle -----
  mirrors: {
    lines: [
      { who: 'narrator', text: 'The next cave is full of sleeping trolls, snoring like thunder. On the far side is the only door.' },
      { who: 'narrator', text: 'High in the ceiling, a hole lets in one thin sunbeam. Around the room stand three tall mirrors on wheels.' },
      { who: 'pim', text: 'Sun makes trolls sleepy and stiff. If we bounce the sunbeam onto them, they\'ll stay asleep while we tiptoe past!' },
      { who: 'juni', text: 'Like the mirror puzzle in Bramble\'s tower! I remember!', if: 'party:juni' },
      { who: 'narrator', text: 'The first mirror can tip the beam left, right, or straight down.' },
    ],
    choices: [
      { label: 'Tip it to the right, toward the trolls', go: 'mirror2' },
      { label: 'Tip it straight down', go: 'mirror_down' },
      { label: 'Tip it to the left, toward the wall', go: 'mirror_wall' },
    ],
  },
  mirror_down: {
    lines: [
      { who: 'narrator', text: 'The beam lands on the floor in a bright circle. It makes a cozy warm spot. {dragon} lies down in it like a cat.' },
      { who: 'pim', text: 'Nice, but the trolls are on the right. Try again!' },
    ],
    next: 'mirrors_again',
  },
  mirror_wall: {
    lines: [
      { who: 'narrator', text: 'The beam bounces off the wall and right into a troll\'s nose. "Hrrrm... ah... AH... AHCHOO!"' },
      { who: 'narrator', text: 'Everyone freezes. The troll rolls over, scratches its belly, and goes back to sleep. Phew.' },
    ],
    next: 'mirrors_again',
  },
  mirrors_again: {
    lines: [{ who: 'narrator', text: 'The first mirror can tip the beam left, right, or straight down.' }],
    choices: [
      { label: 'Tip it to the right, toward the trolls', go: 'mirror2' },
      { label: 'Tip it straight down', go: 'mirror_down' },
      { label: 'Tip it to the left, toward the wall', go: 'mirror_wall' },
    ],
  },
  mirror2: {
    lines: [
      { who: 'narrator', text: 'The beam hits the second mirror. Now it needs to spread out over all the trolls at once. The mirror has a little crank.' },
      { who: 'narrator', text: 'And the far corner of the cave is dark. Too dark to see where the beam is going.' },
    ],
    choices: [
      { label: '{dragon}, glow over there!', go: 'mirror_glow' },
      { label: 'Turn the crank and hope', go: 'mirror_crank' },
    ],
  },
  mirror_glow: {
    xp: 3, xpKey: 'mirrors', xpWhy: 'You solved the sunbeam puzzle!',
    lines: [
      { who: 'narrator', text: '{dragon} pads into the dark corner and glows bright blue. Now everyone can see the third mirror, and the trolls, and the door.' },
      { who: 'narrator', text: 'Crank, crank, click. The sunbeam spreads across the whole row of trolls. One by one, they stop snoring and go stiff, like statues.' },
      { who: 'nell', text: 'Tiptoe. Tiptoe. Tiptoe...' },
    ],
    next: 'queen_hall',
  },
  mirror_crank: {
    lines: [{ who: 'narrator', text: 'Crank, crank, crank. The beam swings around the dark room. Is it on the trolls yet? It\'s hard to tell.' }],
    check: { skill: 'notice', label: 'Aim the beam in the dark', help: 'pim', great: 'mirror_ok', ok: 'mirror_ok', miss: 'mirror_wake', disaster: 'mirror_wake' },
  },
  mirror_ok: {
    xp: 3, xpKey: 'mirrors', xpWhy: 'You solved the sunbeam puzzle!',
    lines: [{ who: 'narrator', text: 'Click! The beam spreads over the trolls. They go stiff and still. Everyone tiptoes past, holding their breath.' }],
    next: 'queen_hall',
  },
  mirror_wake: {
    lines: [
      { who: 'narrator', text: 'The beam swings the wrong way and lights up the door instead. A troll wakes up, sees the kids, and yawns.' },
      { who: 'narrator', text: '"HRRM? Visitors? The Queen will want to see you. Come along, come along." It carries everyone to the throne room. At least it\'s polite.' },
    ],
    next: 'queen_hall',
  },
  // ----- Queen Granite -----
  queen_hall: {
    lines: [
      { who: 'narrator', text: 'The throne room is full of treasure: coins, cups, crowns, a rocking horse, and about four hundred spoons.' },
      { who: 'narrator', text: 'On a throne made of a giant geode sits the biggest troll of all. She wears a crown made of a hubcap.' },
      { who: 'granite', text: 'Visitors! And what is THAT? Oh. Oh, my. It glows. It SPARKLES. I must have it for my treasure pile!' },
      { who: 'dragon', text: 'Mew? (It hides behind {name}\'s legs.)' },
      { who: 'mossback', text: 'Great-Aunt Granite! It\'s me, Mossback!', if: 'team:mossback' },
      { who: 'granite', text: 'Little Mossy! You came home! And you brought me a present! How thoughtful!', if: 'team:mossback' },
    ],
    meet: ['granite'],
    set: { talkedFirst: false },
    choices: [
      { label: 'Talk to the Queen, very politely', go: 'queen_talk' },
      { label: 'Offer her a toy instead', go: 'queen_trade_toy', if: 'item:toybear' },
      { label: 'Offer her a toy instead', go: 'queen_trade_frog', if: 'item:toyfrog', ifNot: 'item:toybear' },
      { label: 'Offer her a toy instead', go: 'queen_trade_train', if: 'item:toytrain', ifNot: ['item:toybear', 'item:toyfrog'] },
      { label: 'Offer her the lucky gear instead', go: 'queen_trade', if: 'item:brassgear', ifNot: ['item:toybear', 'item:toyfrog', 'item:toytrain', 'team:wren'] },
      { label: '{dragon} is NOT treasure!', go: 'queen_fight' },
    ],
  },
  queen_talk: {
    lines: [{ who: 'hero', text: 'Your Majesty, thank you for having us. Please, may we explain? {dragon} isn\'t a thing. {dragon} is a baby, and we\'re taking it home to its mother.' }],
    check: { skill: 'talk', label: 'Talk to Queen Granite', help: 'mossback', bonusIf: { 'team:mossback': 15, mannersUsed: 10, trollTree: 5 }, bonusWhy: 'Good manners and family help!',
      great: 'queen_peace', ok: 'queen_some', miss: 'queen_no' },
  },
  queen_peace: {
    xp: 10, xpKey: 'queen', xpWhy: 'You talked to the Queen! That counts as winning.',
    lines: [
      { who: 'granite', text: 'A baby? With a mother looking for it? Oh. Oh, dear.' },
      { who: 'granite', text: 'My own mother used to say, the shiniest thing in the world is a good heart. I always thought she meant a heart-shaped ruby.' },
      { who: 'granite', text: 'Go. Take the little one home. And take the back tunnel. It comes out right below the peak.' },
    ],
    set: { queenFriend: true },
    next: 'queen_after',
  },
  queen_some: {
    lines: [
      { who: 'granite', text: 'Manners! I do like manners. But I like SHINY even more! Guards!' },
      { who: 'narrator', text: 'She\'s not convinced yet, but she\'s listening. One calm bubble is already full.' },
    ],
    set: { talkedFirst: true },
    next: 'fight:queen',
  },
  queen_no: {
    lines: [{ who: 'granite', text: 'Enough talk! A queen gets what a queen wants! Guards, bring me that sparkly thing!' }],
    next: 'fight:queen',
  },
  queen_trade: {
    xp: 10, xpKey: 'queen', xpWhy: 'You made a deal with the Queen! That counts as winning.',
    lines: [
      { who: 'hero', text: 'Your Majesty, would you take this instead? It\'s a lucky gear. The first one a great tinker ever made.' },
      { who: 'granite', text: 'Ooooh. Brass. Lucky. One of a kind! Yes. YES. That is MUCH easier to keep on a shelf than a dragon.' },
      { who: 'narrator', text: 'Wren would understand. Probably. You hope.' },
    ],
    use: 'brassgear',
    set: { queenFriend: true, tradedGear: true },
    next: 'queen_after',
  },
  queen_trade_toy: {
    xp: 10, xpKey: 'queen', xpWhy: 'You made a deal with the Queen! That counts as winning.',
    lines: [
      { who: 'hero', text: 'Your Majesty, would you take this instead? It\'s a dancing bear from the best toy shop in Gearwick.' },
      { who: 'narrator', text: 'The little bear dances on her giant palm. The Queen claps so hard that dust falls from the ceiling.' },
      { who: 'granite', text: 'It DANCES! A treasure that dances! Yes! The dragon may go!' },
    ],
    use: 'toybear',
    set: { queenFriend: true },
    next: 'queen_after',
  },
  queen_trade_frog: {
    xp: 10, xpKey: 'queen', xpWhy: 'You made a deal with the Queen! That counts as winning.',
    lines: [
      { who: 'hero', text: 'Your Majesty, would you take this instead? It\'s a hopping frog from the best toy shop in Gearwick.' },
      { who: 'granite', text: 'It HOPS! On its own! HRRRM HRRRM! The dragon may go!' },
    ],
    use: 'toyfrog',
    set: { queenFriend: true },
    next: 'queen_after',
  },
  queen_trade_train: {
    xp: 10, xpKey: 'queen', xpWhy: 'You made a deal with the Queen! That counts as winning.',
    lines: [
      { who: 'hero', text: 'Your Majesty, would you take this instead? It\'s a wind-up train from the best toy shop in Gearwick.' },
      { who: 'granite', text: 'Choo choo! A treasure that goes CHOO CHOO! The dragon may go!' },
    ],
    use: 'toytrain',
    set: { queenFriend: true },
    next: 'queen_after',
  },
  queen_fight: {
    lines: [
      { who: 'hero', text: '{dragon} is NOT treasure! {dragon} is our friend!' },
      { who: 'granite', text: 'Then I shall have to TAKE it! Guards!' },
    ],
    next: 'fight:queen',
  },
  queen_beat: {
    lines: [
      { who: 'narrator', text: 'Queen Granite sits down on her throne with a THUD that rattles every spoon in the room.' },
      { who: 'granite', text: 'HRRRM. You fight hard for that little one. Harder than I fight for my spoons.' },
      { who: 'granite', text: 'Maybe it is not a treasure after all. Maybe it is family. Go on. Take the back tunnel.' },
    ],
    next: 'queen_after',
  },
  queen_calm: {
    lines: [
      { who: 'narrator', text: 'Queen Granite stops. She looks at {dragon}, glowing and shaking behind {name}.' },
      { who: 'granite', text: '...It is frightened of me. I don\'t want to frighten a baby. Go. Take the back tunnel to the peak.' },
    ],
    set: { queenFriend: true },
    next: 'queen_after',
  },
  queen_lose: {
    lines: [
      { who: 'narrator', text: 'The trolls scoop up everyone. But when the Queen reaches for {dragon}, it whistles for its mother, long and sad.' },
      { who: 'granite', text: '...Oh. Oh, put them down. Put them DOWN. I can\'t keep a baby who cries for its mother. What kind of queen would I be?' },
    ],
    next: 'queen_after',
  },
  queen_after: {
    lines: [
      { who: 'mossback', text: 'Thank you, Great-Aunt. I\'ll come visit more. I promise.', if: 'team:mossback' },
      { who: 'granite', text: 'You had better, Mossy. And bring your friends. They have nice manners. Mostly.', if: 'team:mossback' },
      { who: 'narrator', text: 'The trolls make a big supper of mushroom stew and let everyone sleep in the warm treasure room, on a soft pile of old cloaks.' },
    ],
    give: { coins: 5 },
    next: 'camp',
  },
  camp: {
    lines: [
      { who: 'narrator', text: '{dragon} tries the mushroom stew. It loves it. It has three bowls and a troll-sized burp.' },
      { who: 'narrator', text: 'Then it falls asleep on top of a pile of gold coins, which it seems to think is the comfiest bed in the world.' },
    ],
    next: 'cliff',
  },
  cliff: {
    lines: [
      { who: 'narrator', text: 'In the middle of the night, there\'s a soft thump. Then a squeak. Then the sound of hooves, galloping away down the tunnel.' },
      { who: 'narrator', text: '{name} sits up. The pile of cloaks next to you is empty. {dragon} is gone.' },
      { who: 'nell', text: 'There\'s a net hook in the floor. And... a note.' },
      { who: 'dot', text: '(The note says:) "I\'m so sorry. He made me show him the way. He\'s going to the top. I\'ll leave you a trail. Red ribbons. Hurry. Dot."' },
    ],
    set: { dragonTaken: true },
    heal: true,
    levelUp: true, banter: true,
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 18', text: 'Next: Chapter 19, The Sky Bridge. Follow the red ribbons and get your dragon back!' },
};

export default { SCENES, FIGHTS, TEXT, LEARNED };
