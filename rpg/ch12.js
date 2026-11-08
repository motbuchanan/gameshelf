// Chapter 12: Gearwick. A clockwork town hub, real gear at the smith, the toymaker's story, side jobs,
// the night market chase, the windup cats in the alley (puzzle or fight), and a light in the clock tower.
// Text uses {name} for the hero's name. No em dashes.
import CH11 from './ch11.js';

export const TEXT = {
  ...CH11.TEXT,
  TEACH: { ...CH11.TEXT.TEACH, monsterturn: 'Hisss-click! (The windup cats pounce.)' },
  CHATTER: {
    ...CH11.TEXT.CHATTER,
    c1: ['Hisss!', 'Mrrr-click!', 'Tick tick!'], c2: ['Mrow-whirr!', 'Hiss!', 'Click click!'], c3: ['Mrrrow!', 'Hiss-click!', 'Tick!'],
  },
};

export const FIGHTS = {
  cats: {
    id: 'ch12-cats', xpKey: 'cats',
    xp: 5, xpWhy: 'You beat the windup cats!',
    mode: 'hp',
    map: [
      'ttttttttttt',
      't....b....t',
      't.........t',
      't..L...L..t',
      't.........t',
      't.........t',
      't.........t',
      'tttt...tttt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 'c1', monster: 'windcat', name: 'Windup cat', x: 3, y: 1 },
      { id: 'c2', monster: 'windcat', name: 'Windup cat', x: 7, y: 1 },
      { id: 'c3', monster: 'windcat', name: 'Windup cat', x: 5, y: 2 },
    ],
    team: { from: 'picked', exclude: ['inkwing'], spots: [{ x: 4, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 7 }] },
    roundCap: 12, capResult: 'win', boost: { hp: 14, skill: 26 },
    taught: CH11.LEARNED, skipHeroFirst: true,
    meets: ['windcat'],
    events: [{ round: 0, type: 'say', lines: [{ who: null, text: 'These are windup cats. Fast and pouncy, but they wind down like any clockwork.' }] }],
    then: { win: 'cats_win', lose: 'cats_lose' },
  },
};

const SMITH_STOCK = [
  { id: 'potion', price: 5 }, { id: 'oil', price: 2 },
  { id: 'helmet', price: 8 }, { id: 'roundshield', price: 8 }, { id: 'chainshirt', price: 9 },
  { id: 'longsword', price: 12 }, { id: 'longbow', price: 12 },
];

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'Gearwick! Every roof has a gear on it. Every door has a bell. Even the birds in the trees are made of brass.' },
      { who: 'narrator', text: 'Tick. Tock. Ding! Whirr. Clank. The whole town sounds like the inside of a clock.' },
      { who: 'bolt', text: 'Woof! Tick tick!' },
      { who: 'tobin', text: 'Bolt knows this place! Look at his tail go!' },
      { who: 'nell', text: 'Look up. That\'s the big clock tower we saw from the hill. The windows at the top are all dark.' },
    ],
    meet: ['gearsmith', 'toymaker'],
    next: 'town',
  },
  town: {
    hub: {
      place: 'Gearwick',
      text: 'Gearwick! Tap someone to talk, or visit the smith for real gear. Tap Done when you are ready for the night market.',
      people: [
        { id: 'toymaker', label: 'The toy shop', go: 'toys' },
        { id: 'tower', who: 'nell', label: 'The clock tower', go: 'tower' },
        { id: 'chicken', who: 'tobin', label: 'Runaway chicken', go: 'chicken' },
        { id: 'fountain', who: 'juni', label: 'The broken fountain', go: 'fountain' },
        { id: 'bakery', who: 'pudge', label: 'The bakery', go: 'bakery', if: 'party:pudge' },
      ],
      shop: { who: 'gearsmith', name: 'Mara Ironhand, the smith', say: '"Real knight gear, made to fit. Try it on!"', stock: SMITH_STOCK },
      shopLabel: 'Visit the smith',
      doneLabel: 'Go to the night market',
      done: 'team_market',
    },
  },
  toys: { nextIf: [{ if: 'toymaker', go: 'toys_again' }], next: 'toys_first' },
  toys_again: { lines: [{ who: 'toymaker', text: 'Good luck up in that tower. And tell Wren that Old Tock misses her.' }], next: 'town' },
  toys_first: {
    lines: [
      { who: 'narrator', text: 'The toy shop is full of ticking things: a dancing bear, a frog that hops, a tiny train that goes round and round.' },
      { who: 'toymaker', text: 'Welcome, welcome. I\'m Old Tock. Oh! Is that Bolt? I haven\'t seen him in years.' },
      { who: 'toymaker', text: 'A girl made him. Wren. She used to bring me broken toys to fix. She was the best tinker I ever saw, and only six years old.' },
      { who: 'toymaker', text: 'But the other kids never played with her. They said she talked too much about gears. One day she stopped coming. Now she lives in the clock tower, all alone.' },
      { who: 'juni', text: 'She makes friends out of gears because nobody would be her friend.' },
      { who: 'toymaker', text: 'Here. My spare key to the tower. If you find her... tell her Old Tock misses her.' },
    ],
    give: { items: { towerkey: 1 } },
    set: { toymaker: true, wrenName: true },
    next: 'town',
  },
  tower: {
    lines: [
      { who: 'narrator', text: 'The clock tower is tall and dark. The big door is locked, and there\'s a sign: "KEEP OUT. I MEAN IT."' },
      { who: 'nell', text: 'Somebody really doesn\'t want visitors.' },
      { who: 'narrator', text: 'Way up high, a little light blinks on... and off again.', if: 'toymaker' },
    ],
    next: 'town',
  },
  chicken: { nextIf: [{ if: 'chicken_done', go: 'chicken_again' }], next: 'chicken_ask' },
  chicken_ask: {
    lines: [
      { who: 'narrator', text: 'A clockwork chicken is zooming around the square, clucking and pecking everyone\'s shoes!' },
      { who: 'narrator', text: 'A farmer waves his hat. "My chicken! She wound herself up too tight! Please catch her!"' },
    ],
    check: { skill: 'sneak', help: 'tobin', label: 'Sneak up on the clockwork chicken', great: 'chicken_got', ok: 'chicken_got', miss: 'chicken_chase' },
  },
  chicken_got: {
    xp: 1, xpWhy: 'You caught the chicken!',
    lines: [{ who: 'narrator', text: 'Tiptoe, tiptoe, GOTCHA! The chicken clucks, ticks, and lays a shiny brass egg. The farmer gives you coins and the egg.' }],
    give: { coins: 4 }, set: { chicken_done: true }, next: 'town',
  },
  chicken_chase: {
    lines: [{ who: 'narrator', text: 'The chicken zooms between {name}\'s legs, around the fountain, and right into Bolt\'s mouth. Bolt drops it gently. Good dog!' }],
    give: { coins: 3 }, set: { chicken_done: true }, next: 'town',
  },
  chicken_again: { lines: [{ who: 'narrator', text: 'The clockwork chicken is home, wound just right, laying brass eggs.' }], next: 'town' },
  fountain: { nextIf: [{ if: 'fountain_done', go: 'fountain_again' }], next: 'fountain_ask' },
  fountain_ask: {
    lines: [
      { who: 'narrator', text: 'The town fountain is dry. Inside, three gears are stuck: a big one, a middle one and a tiny one.' },
      { who: 'juni', text: 'Gears have to go from biggest to smallest, so the water speeds up. Which one goes first?' },
    ],
    choices: [
      { label: 'The big gear first', go: 'fountain2' },
      { label: 'The tiny gear first', go: 'fountain_splash' },
      { label: 'The middle gear first', go: 'fountain_splash' },
    ],
  },
  fountain2: {
    lines: [{ who: 'narrator', text: 'Clunk. The big gear turns. Now the middle one or the tiny one?' }],
    choices: [
      { label: 'The tiny one', go: 'fountain_splash' },
      { label: 'The middle one', go: 'fountain_fixed' },
    ],
  },
  fountain_fixed: {
    xp: 1, xpWhy: 'You solved the fountain puzzle!',
    lines: [{ who: 'narrator', text: 'Big, middle, tiny. Whirrrr... SPLOOSH! Water shoots up into the air, and everyone in the square cheers!' }],
    give: { coins: 4 }, set: { fountain_done: true }, next: 'town',
  },
  fountain_splash: {
    lines: [
      { who: 'narrator', text: 'Sproing! The gears spin backwards and squirt water right in {name}\'s face. Bolt barks at the fountain.' },
      { who: 'juni', text: 'Biggest to smallest, remember? Let\'s try again.' },
    ],
    choices: [
      { label: 'The big gear first', go: 'fountain2' },
      { label: 'The tiny gear first', go: 'fountain_splash' },
    ],
  },
  fountain_again: { lines: [{ who: 'narrator', text: 'The fountain sparkles. Somebody has already thrown a coin in for luck.' }], next: 'town' },
  bakery: {
    lines: [
      { who: 'pudge', text: 'Gearwick has a GEAR-SHAPED pie. Pudge has never been so happy.' },
      { who: 'sniffle', text: 'Achoo! Sorry. Pie dust.', if: 'party:sniffle' },
    ],
    next: 'town',
  },
  // ----- the night market -----
  team_market: {
    lines: [
      { who: 'narrator', text: 'The night market is crowded and twisty. A big group would get noticed.' },
      { who: 'pim', text: 'Three of us should go with you. The rest can help from the inn.' },
    ],
    pickTeam: { size: 3, exclude: ['inkwing'] },
    next: 'market',
  },
  market: {
    lines: [
      { who: 'narrator', text: 'At night, Gearwick lights up with a hundred lanterns. The night market is full of stalls selling springs, bells and ticking toys.' },
      { who: 'nell', text: 'Look at the posters. "WANTED: ANYTHING FROM THE SILVER GROVE. GOOD PRICES. ASK AT THE CLOCK TOWER."' },
      { who: 'narrator', text: 'Then, between two stalls, a small figure in a hooded cloak hurries past. Under the hood, something shines. A silver mask!' },
    ],
    choices: [
      { label: 'Follow the masked figure!', go: 'chase1' },
      { label: 'Ask the town guards', go: 'guards' },
    ],
  },
  chase1: { check: { skill: 'sneak', help: 'nell', label: 'Follow without being seen', great: 'chase2', ok: 'chase2', miss: 'chase2_seen' } },
  chase2_seen: {
    lines: [{ who: 'narrator', text: 'The figure looks back! The kids duck behind a stall full of cuckoo clocks. CUCKOO! CUCKOO! Phew, they didn\'t see you.' }],
    next: 'chase2',
  },
  chase2: {
    lines: [{ who: 'narrator', text: 'The figure climbs over a fence and drops a little brass gear on the way.' }],
    check: { skill: 'climb', help: 'hollis', label: 'Climb the fence', great: 'chase3', ok: 'chase3', miss: 'chase3_bump' },
  },
  chase3_bump: {
    hurt: 1,
    lines: [{ who: 'narrator', text: 'Bonk. {name} slips and lands in a cart of squishy oranges. Your friends pull you over the fence.' }],
    next: 'chase3',
  },
  chase3: {
    lines: [{ who: 'narrator', text: 'The figure turns down a dark alley. Something small falls out of their cloak.' }],
    check: { skill: 'notice', help: 'pim', label: 'Spot what they dropped', great: 'chase_clue', ok: 'chase_clue', miss: 'alley' },
  },
  chase_clue: {
    lines: [
      { who: 'pim', text: 'A drawing! It\'s a picture of a grove with silver leaves. And under it, in tiny letters: "The Starstone. Under the biggest tree."' },
      { who: 'nell', text: 'Starstone? What\'s a Starstone?' },
    ],
    set: { starstoneClue: true },
    next: 'alley',
  },
  guards: { check: { skill: 'talk', help: 'pim', label: 'Ask the guards politely', great: 'guards_help', ok: 'guards_help', miss: 'guards_grump' } },
  guards_help: {
    lines: [
      { who: 'narrator', text: 'A guard scratches his head. "The masked one? Comes through every night. Always goes down Sprocket Alley. Strange kid."' },
      { who: 'narrator', text: '"Watch out for the cats down there. Not real cats. Windup cats. They guard her back door."' },
    ],
    set: { catWarning: true },
    next: 'alley',
  },
  guards_grump: {
    lines: [{ who: 'narrator', text: 'The guard yawns. "Masked kid? Sprocket Alley, probably. Now go to bed." Not very helpful, but it\'s something.' }],
    next: 'alley',
  },
  // ----- the alley: puzzle or fight -----
  alley: {
    lines: [
      { who: 'narrator', text: 'Sprocket Alley is dark and narrow. At the end is a little door with a gear on it. In front of the door sit three brass cats with glowing eyes.' },
      { who: 'narrator', text: 'Their wind-up keys are on their backs. Next to the door hangs a ring of three keys: a gold one, a silver one and a copper one.' },
      { who: 'pim', text: 'If we turn the right key, maybe the cats wind down. The cats\' eyes are glowing... copper colored.', if: 'catWarning' },
      { who: 'pim', text: 'Look at the cats\' eyes. What color are they glowing?', ifNot: 'catWarning' },
    ],
    meet: ['windcat'],
    choices: [
      { label: 'Turn the copper key', go: 'cats_sleep' },
      { label: 'Turn the gold key', go: 'cats_wake' },
      { label: 'Fight the cats', go: 'fight:cats' },
    ],
  },
  cats_sleep: {
    xpKey: 'cats', xp: 5, xpWhy: 'You wound the cats down! That counts as winning.',
    lines: [{ who: 'narrator', text: 'Click, click, click. The cats\' eyes fade from copper to gray. Purrrr... tick... tock... stop. They\'re asleep!' }],
    next: 'door',
  },
  cats_wake: {
    lines: [{ who: 'narrator', text: 'CLANG! Wrong key! The cats\' eyes flash bright. HISSSS!' }],
    next: 'fight:cats',
  },
  cats_win: {
    lines: [{ who: 'narrator', text: 'The cats wind down with a sad little "mrrr...click." Bolt sniffs them and wags his tail.' }],
    next: 'door',
  },
  cats_lose: {
    lines: [{ who: 'narrator', text: 'The cats chase everyone out of the alley, then go back to sit by the door. But Bolt grabbed something on the way out.' }],
    next: 'door',
  },
  door: {
    lines: [
      { who: 'narrator', text: 'Behind the little door is a tiny workshop, full of gears and springs. On the wall: drawings of animals, each with a name. "Pip. Clank. Mr. Whiskers. Bolt."' },
      { who: 'nell', text: 'Bolt! She drew Bolt. Those aren\'t monsters. Those are her friends.' },
      { who: 'narrator', text: 'On the desk is a toolbox with letters scratched on the lid: W. G.' },
      { who: 'juni', text: 'W. G. Wren Gearwright. The toymaker\'s Wren!', if: 'wrenName' },
      { who: 'pim', text: 'W. G. The W from the note!', ifNot: 'wrenName' },
    ],
    set: { wrenWorkshop: true },
    next: 'inn',
  },
  inn: {
    lines: [
      { who: 'narrator', text: 'The kids rent a room at the Rusty Spring Inn. Soft beds. Warm soup. Bolt ticks happily at the foot of the bed.' },
      { who: 'narrator', text: 'Just before sleep, {name} looks out the window. High in the clock tower, a light blinks on.' },
      { who: 'narrator', text: 'A small figure in a silver mask looks out at the town. Then it pulls the curtain shut.' },
      { who: 'nell', text: '(whispering) Tomorrow, we go up that tower.' },
    ],
    heal: true,
    levelUp: true,
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 12', text: 'Next: Chapter 13, The Clock Tower, comes in the next update.' },
};

export default { SCENES, FIGHTS, TEXT };
