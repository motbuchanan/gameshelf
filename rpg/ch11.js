// Chapter 11: The Silver Trail. Book Three begins: a silver gear in the new grove, friends grow too,
// Home Team jobs, Inkwing scouting the trail map, windup mice, and Bolt the clockwork dog.
// Text uses {name} for the hero's name. No em dashes.
import CH10 from './ch10.js';
import CH7 from './ch7.js';

export const LEARNED = { ...CH7.LEARNED };

export const TEXT = {
  ...CH10.TEXT,
  TEACH: { ...CH10.TEXT.TEACH, monsterturn: 'Tick tick tick! (The windup mice zoom around.)' },
  CHATTER: {
    ...CH10.TEXT.CHATTER,
    m1: ['Squeak!', 'Tick tick!', 'Zoom!'], m2: ['Squeak squeak!', 'Whirr!', 'Tick!'], m3: ['Zip!', 'Squeak!', 'Whirrr!'],
    m4: ['Tick tock!', 'Squeak!', 'Zoom zoom!'], m5: ['Whirr!', 'Squeak!', 'Tick!'], m6: ['Squeak!', 'Zip zip!', 'Tick!'],
    m7: ['Squeak!', 'Whirr!', 'Tick!'], m8: ['Zoom!', 'Squeak!', 'Tick tock!'],
    bolt: ['Woof! Tick!', 'Grrr-click!', 'Bark bark!'],
  },
};

const MOUSE = (id, x, y) => ({ id, monster: 'mouse', name: 'Windup mouse', x, y });

export const FIGHTS = {
  mice: {
    id: 'ch11-mice', xpKey: 'mice',
    xp: 5, xpWhy: 'You stopped the windup mice!',
    mode: 'hp',
    map: [
      'ttt.....ttt',
      't..b...b..t',
      '...........',
      '..L.....L..',
      '...........',
      't..b...b..t',
      't.........t',
      'ttt.....ttt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      MOUSE('m1', 3, 0), MOUSE('m2', 5, 0), MOUSE('m3', 7, 0), MOUSE('m4', 1, 2), MOUSE('m5', 9, 2), MOUSE('m6', 5, 2), MOUSE('m7', 0, 4), MOUSE('m8', 10, 4),
    ],
    team: { from: 'picked', exclude: ['inkwing'], spots: [{ x: 4, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 7 }] },
    roundCap: 12, capResult: 'win', boost: { hp: 0, skill: 38 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['mouse'],
    events: [{ round: 0, type: 'say', lines: [{ who: null, text: 'Windup mice! They are fast, but one good bonk stops each one.' }] }],
    then: { win: 'mice_win', lose: 'mice_lose' },
  },
};

const MAP = (here, extra = {}) => ({
  title: 'The road to the silver gears',
  here,
  nodes: [
    { id: 'grove', label: 'The new grove', x: 8, y: 46, icon: 'star' },
    { id: 'mine', label: 'Old mine road', x: 38, y: 16, icon: 'boot', scout: 'monster', short: true },
    { id: 'windmill', label: 'Windmill hill', x: 40, y: 48, icon: 'boot', scout: 'shop', treasure: true },
    { id: 'spring', label: 'The brass dog', x: 66, y: 32, icon: 'bubble' },
    { id: 'gearwick', label: 'Gearwick', x: 90, y: 22, icon: 'star' },
  ].map(n => ({ ...n, ...(extra[n.id] || {}) })),
  paths: [['grove', 'mine'], ['grove', 'windmill'], ['mine', 'spring'], ['windmill', 'spring'], ['spring', 'gearwick']],
});

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'Spring comes to Whisper Woods. At the edge of the trees, a hundred little trees are growing in neat rows. The new grove.' },
      { who: 'narrator', text: 'And right in the middle, one tiny tree is different. Its three little leaves are silver. The seed from Old Alder\'s pocket is growing.', if: 'seedGiven' },
      { who: 'bramble', text: 'Dig carefully, children. Little roots are delicate.' },
      { who: 'narrator', text: 'Bramble pushes her shovel into the dirt. Clink. She pulls out something shiny.' },
      { who: 'bramble', text: 'A silver gear. This is from the one in the mask. They were digging here long before I came back.' },
      { who: 'juni', text: 'Digging for what?' },
      { who: 'bramble', text: 'I don\'t know. But Inkwing has seen gears like this before. Far to the east, in a town that ticks like a clock.' },
      { who: 'inkwing', text: 'Caw! Tick-tock! Caw!' },
      { who: 'mossback', text: 'A town that ticks? I do hope it has bridges.', if: 'party:mossback' },
    ],
    meet: ['bramble'],
    next: 'grow',
  },
  grow: {
    lines: [
      { who: 'hollis', text: 'Hey, {name}. Remember when I could barely swing my broom handle? Watch this!' },
      { who: 'narrator', text: 'Hollis spins his broom handle like a real knight. Whoosh, whoosh, WHOOSH.' },
      { who: 'pim', text: 'We grew, too! Every adventure we went on taught us something. Friends level up, just like you.' },
      { who: 'pim', text: 'Friends who come with you earn full XP. Friends who stay home earn half, because they do a Home Team job that helps you.' },
      { who: 'nell', text: 'And the higher our level, the more we help. More hearts, better skills, and better jobs back home.' },
    ],
    friendsGrow: true,
    levelUp: true,
    next: 'team_talk',
  },
  team_talk: {
    lines: [
      { who: 'captain', text: 'It\'s a long trip, and the woods still need watching. Only three friends can go with you.' },
      { who: 'pim', text: 'The rest of us will help from here. Look at each friend to see their Home Team job.' },
    ],
    pickTeam: { size: 3, exclude: ['inkwing'] },
    next: 'map1',
  },
  map1: {
    lines: [{ who: 'narrator', text: 'Inkwing lands on {name}\'s shoulder. Caw!' }],
    trailmap: { ...MAP('grove', { mine: { go: 'mine', set: { road: 'mine' } }, windmill: { go: 'windmill', set: { road: 'windmill' } } }), text: 'Which way? Tap Inkwing\'s button to scout, then tap a path.' },
  },
  // ----- the old mine road: windup mice and a cart ride -----
  mine: {
    lines: [
      { who: 'narrator', text: 'The old mine road goes right through a tunnel. Inside, something goes tick, tick, tick.' },
      { who: 'narrator', text: 'Eight tiny brass mice zoom out of the dark, squeaking! There\'s an old mine cart on the track next to you.' },
      { who: 'pim', text: 'Wait. I know that ticking. That\'s the little brass mouse from our very first game of Heroes and Monsters! Somebody has been watching the woods since the start.', if: 'tickMouse' },
    ],
    meet: ['mouse'],
    choices: [
      { label: 'Jump in the mine cart and zoom past!', go: 'cart' },
      { label: 'Fight the windup mice', go: 'fight:mice' },
    ],
  },
  cart: { check: { skill: 'brave', help: 'hollis', label: 'Hold on tight in the mine cart!', great: 'cart_ride', ok: 'cart_ride', miss: 'cart_crash' } },
  cart_ride: {
    xpKey: 'mice', xp: 5, xpWhy: 'You zoomed past the mice! That counts as winning.',
    lines: [
      { who: 'narrator', text: 'WHEEEE! The cart rattles down the track, past the mice, and out the other side of the tunnel!' },
      { who: 'narrator', text: 'A little brass mouse falls into the cart with you. It winds down. Tick... tick... stop. It has a note tied to its tail.' },
    ],
    next: 'note',
  },
  cart_crash: {
    lines: [{ who: 'narrator', text: 'The cart hits a bump and tips over. Everyone tumbles out, right in the middle of the mice!' }],
    next: 'fight:mice',
  },
  mice_win: {
    lines: [{ who: 'narrator', text: 'Bonk, bonk, bonk. The mice wind down one by one. The last one has a note tied to its tail.' }],
    next: 'note',
  },
  mice_lose: {
    lines: [{ who: 'narrator', text: 'The mice zoom off squeaking, but one of them drops a little note on the way out.' }],
    next: 'note',
  },
  note: {
    lines: [
      { who: 'pim', text: 'The note says: "Bring me anything shiny you find in the woods. W." And it has a silver gear stamped on it.' },
      { who: 'pim', text: 'A gear instead of a name. Just like the cards in the Riverbend library! W borrowed all those books about stars.', if: 'libraryGear' },
      { who: 'hero', text: 'And W left a note in Grubjaw\'s tent, too. "Bring me anything that glows."', if: 'wNote0' },
      { who: 'nell', text: 'W. Not B this time. Somebody new.' },
    ],
    set: { noteW: true },
    next: 'map2',
  },
  // ----- windmill hill: a peddler who sells an oil can -----
  windmill: {
    lines: [
      { who: 'narrator', text: 'At the top of windmill hill, a squeaky cart is parked under the windmill. A peddler waves.' },
      { who: 'peddler', text: 'Hello hello! I\'m Fennick. Good prices! Today only: an oil can. Makes stuck things un-stuck. Good price!' },
    ],
    meet: ['peddler'],
    choices: [
      { label: 'Buy the oil can (2 coins)', go: 'oil_buy', if: 'coins:2' },
      { label: 'Ask Fennick about silver gears', go: 'fennick_talk' },
    ],
  },
  oil_buy: {
    lines: [{ who: 'peddler', text: 'A fine choice! Squirt, squirt. Good price!' }],
    give: { items: { oil: 1 }, coins: -2 },
    set: { boughtOil: true },
    next: 'fennick_talk',
  },
  fennick_talk: {
    lines: [
      { who: 'peddler', text: 'Silver gears? I trade them sometimes. A girl in Gearwick buys every one I find. Always wears a mask. Never says please.' },
      { who: 'peddler', text: 'Here, take this. One of her little mice left it in my cart.' },
      { who: 'pim', text: 'A note! "Bring me anything shiny you find in the woods. W." With a silver gear stamped on it.' },
      { who: 'pim', text: 'A gear instead of a name. Just like the cards in the Riverbend library! W borrowed all those books about stars.', if: 'libraryGear' },
      { who: 'hero', text: 'And W left a note in Grubjaw\'s tent, too. "Bring me anything that glows."', if: 'wNote0' },
    ],
    set: { noteW: true, fennick: true },
    next: 'map2w',
  },
  map2: {
    lines: [{ who: 'pim', text: 'Gearwick is past those hills. Let\'s keep going.' }],
    trailmap: { ...MAP('mine', { spring: { go: 'bolt' } }), text: 'Tap the next place on the map.' },
  },
  map2w: {
    lines: [{ who: 'pim', text: 'Gearwick is past those hills. Let\'s keep going.' }],
    trailmap: { ...MAP('windmill', { spring: { go: 'bolt' } }), text: 'Tap the next place on the map.' },
  },
  // ----- Bolt the clockwork dog -----
  bolt: {
    lines: [
      { who: 'narrator', text: 'Next to the road, something is whimpering. Clink. Clink. Whine.' },
      { who: 'narrator', text: 'It\'s a brass dog! His wind-up spring has popped out and wrapped around his legs. He can\'t move.' },
      { who: 'juni', text: 'Poor thing. His spring is all tangled. Somebody needs to put it back.' },
    ],
    meet: ['bolt'],
    choices: [
      { label: 'Use the oil can on his spring', go: 'bolt_oil', if: 'item:oil' },
      { label: 'Untangle the spring with your fingers', go: 'bolt_fix' },
      { label: 'Keep walking', go: 'bolt_walk' },
    ],
  },
  bolt_oil: {
    use: 'oil',
    xp: 3, xpKey: 'bolt', xpWhy: 'You helped Bolt!',
    lines: [{ who: 'narrator', text: 'Squirt, squirt. The spring slides right back where it belongs. Click!' }],
    next: 'bolt_join',
  },
  bolt_fix: { check: { skill: 'fingers', help: 'juni', label: 'Untangle the brass spring', great: 'bolt_fixed', ok: 'bolt_fixed', miss: 'bolt_juni' } },
  bolt_fixed: {
    xp: 3, xpKey: 'bolt', xpWhy: 'You helped Bolt!',
    lines: [{ who: 'narrator', text: 'Twist, tuck, CLICK. The spring pops back into place!' }],
    next: 'bolt_join',
  },
  bolt_juni: {
    xp: 3, xpKey: 'bolt', xpWhy: 'You helped Bolt!',
    lines: [
      { who: 'narrator', text: 'Sproing! The spring flips out of {name}\'s hands and bonks {name} right on the nose.' },
      { who: 'juni', text: 'Here, hold this part, and I\'ll push. One, two, three!', if: 'team:juni' },
      { who: 'narrator', text: '{name} tries again, slower this time. Hold this part, push that part. One, two, three!', ifNot: 'team:juni' },
      { who: 'narrator', text: 'CLICK. Fixed, together.', if: 'team:juni' },
      { who: 'narrator', text: 'CLICK. Fixed! {name} did it.', ifNot: 'team:juni' },
    ],
    next: 'bolt_join',
  },
  bolt_walk: {
    lines: [
      { who: 'narrator', text: 'The kids walk on. Behind them: clink... clink... clink. The brass dog is hopping after them on three legs.' },
      { who: 'narrator', text: 'He really wants to come. Okay, okay. {name} kneels down and pushes the spring back into place. Click!' },
      { who: 'narrator', text: 'The dog spins in a happy circle.' },
    ],
    next: 'bolt_join',
  },
  bolt_join: {
    lines: [
      { who: 'narrator', text: 'The brass dog jumps up and licks {name}\'s face. His tongue is cold and tastes like pennies.' },
      { who: 'tobin', text: 'He has a name tag! It says... BOLT.' },
      { who: 'bolt', text: 'Woof! Tick tick tick! Woof!' },
      { who: 'pim', text: 'Someone made Bolt. Someone who is really, really good with gears.' },
      { who: 'narrator', text: 'Bolt joins your team! He is a clockwork friend, and he knows his way around clockwork things.' },
    ],
    join: 'bolt',
    set: { bolt: true },
    next: 'camp',
  },
  camp: {
    lines: [
      { who: 'narrator', text: 'That night, the kids camp on a hill. Bolt curls up by the fire, ticking softly, like a sleeping clock.' },
      { who: 'nell', text: 'Look over there. Lights. Hundreds of them, all blinking.' },
      { who: 'narrator', text: 'Far away, a whole town ticks like a giant clock. In the middle stands a tall tower with a clock face that glows.' },
      { who: 'pim', text: 'Gearwick. That\'s where W is. I just know it.' },
    ],
    heal: true,
    levelUp: true,
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 11', text: 'Next: Chapter 12, Gearwick. A town full of clocks, and a girl in a silver mask.' },
};

export default { SCENES, FIGHTS, TEXT, LEARNED };
