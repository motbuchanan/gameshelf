// Chapter 17: The Frostpine Pass. A quick stop in Gearwick for fur cloaks, the road up the mountain
// (the frozen lake or the pine forest), frost foxes on the ice, the avalanche, and troll footprints.
// New: ice floors that slide you, snowdrifts that take 2 steps, warm gear, and {dragon}'s Warm belly.
// Text uses {name} for the hero's name and {dragon} for the dragon's name. No em dashes.
import CH16 from './ch16.js';

export const LEARNED = { ...CH16.LEARNED };

export const TEXT = {
  ...CH16.TEXT,
  TEACH: { ...CH16.TEXT.TEACH, monsterturn: 'Yip yip! (The frost foxes skid across the ice.)' },
  ICE_TEACH: 'Ice! If you stop on ice, you keep sliding the way you were going until you bump into something or reach the snow. Foxes slide too!',
  CHATTER: {
    ...CH16.TEXT.CHATTER,
    f1: ['Yip!', 'Yip yip!', 'Hrrrr!'], f2: ['Yip yip yip!', 'Skrrrt!', 'Arf!'], f3: ['Yap!', 'Hrrr!', 'Yip!'], f4: ['Skrrrt!', 'Yip!', 'Arf arf!'], f5: ['Yip!', 'Skrrrt!'],
    goatherd: ['Baaa?'],
  },
};

const FOX = (id, x, y) => ({ id, monster: 'fox', name: 'Frost fox', x, y });

export const FIGHTS = {
  // The frozen lake: shorter, and slippery. Line up a slide on purpose.
  lake: {
    id: 'ch17-lake', xpKey: 'foxes',
    xp: 7, xpWhy: 'You beat the frost foxes!',
    mode: 'hp',
    map: [
      'sssPsssssPss',
      'ssiiiiiiiiss',
      'siiiiiiiiiis',
      'siiirsiiiiis',
      'siiiiiisriis',
      'siiiiiiiiiis',
      'ssiiiiiiiiss',
      'ssssssssssss',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 6, y: 7 },
      FOX('f1', 3, 1), FOX('f2', 8, 1), FOX('f3', 1, 3), FOX('f4', 10, 3), FOX('f5', 6, 1),
    ],
    dragon: { x: 5, y: 7 },
    team: { from: 'picked', exclude: ['inkwing', 'dot'], spots: [{ x: 4, y: 7 }, { x: 8, y: 7 }, { x: 7, y: 7 }] },
    roundCap: 14, capResult: 'win', boost: { hp: 4, skill: 45 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['fox'],
    events: [{ round: 0, type: 'say', lines: [
      { who: 'pim', text: 'Careful, the whole lake is ice! Stop on the ice and you slide until you hit something.' },
      { who: 'juni', text: 'Use it! Slide right up next to a fox, and bonk it on your next turn.' },
    ] }],
    then: { win: 'lake_win', lose: 'lake_lose' },
  },
  // The pine forest: snowdrifts slow everyone down.
  forest: {
    id: 'ch17-forest', xpKey: 'foxes',
    xp: 7, xpWhy: 'You beat the frost foxes!',
    mode: 'hp',
    map: [
      'PsssdddsssP',
      'sssdddsssss',
      'sPssssssPss',
      'ssddssddsss',
      'ssddssddsss',
      'sssssssssPs',
      'Pssssssssss',
      'PPssssssPPP',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      FOX('f1', 2, 0), FOX('f2', 8, 0), FOX('f3', 5, 1), FOX('f4', 1, 1),
    ],
    dragon: { x: 4, y: 7 },
    team: { from: 'picked', exclude: ['inkwing', 'dot'], spots: [{ x: 4, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 7 }] },
    roundCap: 14, capResult: 'win', boost: { hp: 4, skill: 52 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['fox'],
    events: [{ round: 0, type: 'say', lines: [
      { who: 'pim', text: 'Deep snow! Snowdrifts take two steps to walk through. Go around them if you can.' },
    ] }],
    then: { win: 'forest_win', lose: 'lake_lose' },
  },
};

const OLD_TOCK_STOCK = [
  { id: 'furcloak', price: 6 }, { id: 'potion', price: 5 }, { id: 'oil', price: 2 }, { id: 'net', price: 3 },
];

const MAP = (here, extra = {}) => ({
  title: 'Up the Frostpine Pass',
  here,
  nodes: [
    { id: 'gearwick', label: 'Gearwick', x: 8, y: 48, icon: 'star' },
    { id: 'lake', label: 'The frozen lake', x: 40, y: 18, icon: 'boot', scout: 'monster', short: true },
    { id: 'forest', label: 'The pine forest', x: 40, y: 48, icon: 'boot', scout: 'friend', treasure: true },
    { id: 'slope', label: 'The big slope', x: 70, y: 32, icon: 'boot' },
    { id: 'cave', label: 'A cave', x: 92, y: 18, icon: 'star' },
  ].map(n => ({ ...n, ...(extra[n.id] || {}) })),
  paths: [['gearwick', 'lake'], ['gearwick', 'forest'], ['lake', 'slope'], ['forest', 'slope'], ['slope', 'cave']],
});

export const SCENES = {
  intro: {
    place: 'gearwick',
    lines: [
      { who: 'narrator', text: 'The kids set off at sunrise with {dragon} riding on {name}\'s shoulder, like a warm scarf that sneezes.' },
      { who: 'narrator', text: 'Two days later, they reach Gearwick. Past the clock tower, the mountains rise up white and huge.' },
      { who: 'toymaker', text: 'Starpeak? Up the Frostpine Pass? In THOSE clothes? You\'ll freeze into little kid-shaped icicles!' },
      { who: 'toymaker', text: 'Come into the shop. I have just the thing.' },
      { who: 'wren', text: 'You\'re going to Starpeak? Then I\'m coming too. I built those hounds. I have to help fix this.', if: 'party:wren' },
    ],
    shop: { who: 'toymaker', name: 'Old Tock\'s shop', say: '"Fur cloaks for the snow, and a few useful things for the road. Good price, for heroes!"', stock: OLD_TOCK_STOCK },
    next: 'wren_gate',
  },
  wren_gate: { nextIf: [{ if: 'party:wren', go: 'team' }], next: 'wren_stay' },
  wren_stay: {
    lines: [
      { who: 'wren', text: 'Wait! You\'re going after the knight? He has my old hound plans. Maybe more of my plans.' },
      { who: 'wren', text: 'I can\'t leave Old Tock alone with all the toy orders. But if you ever need to open something I built, remember: I always put the hard lock in the middle.' },
    ],
    set: { wrenTip: true },
    next: 'team',
  },
  team: {
    place: 'frostpine',
    lines: [{ who: 'narrator', text: 'The road gets steep and snowy from here. Who comes up the mountain with you?' }],
    pickTeam: { size: 3, exclude: ['inkwing', 'dot'] },
    next: 'map1',
  },
  map1: {
    lines: [
      { who: 'pim', text: 'Two ways up. Over the frozen lake, or through the pine forest.' },
      { who: 'inkwing', text: 'Caw! Caw caw!', if: 'party:inkwing' },
      { who: 'pim', text: 'Inkwing says she can fly ahead and look. I think. Either that or she wants a cracker.', if: 'party:inkwing' },
    ],
    trailmap: { ...MAP('gearwick', { lake: { go: 'lake', set: { road4f: false } }, forest: { go: 'forest', set: { road4f: true } } }), text: 'Which way? Tap Inkwing\'s button to scout, then tap a path.' },
  },
  // ----- the frozen lake -----
  lake: {
    lines: [
      { who: 'narrator', text: 'The lake is frozen solid and smooth as glass. It\'s beautiful. It\'s also VERY slippery.' },
      { who: 'tobin', text: 'Wheee! Look, I can slide all the way across! Wheeeee...!', if: 'team:tobin' },
      { who: 'narrator', text: 'Yip! Yip yip! Five white foxes skid out from behind a rock, sliding on their bellies, grinning.' },
      { who: 'nell', text: 'Frost foxes! They\'re not scared of ice at all.' },
    ],
    meet: ['fox'],
    next: 'fight:lake',
  },
  lake_win: {
    lines: [
      { who: 'narrator', text: 'The last fox slides away across the ice, yipping, and disappears into the snow.' },
      { who: 'hollis', text: 'Did anyone else fall down eleven times? Just me? Okay.', if: 'team:hollis' },
    ],
    next: 'map2',
  },
  lake_lose: {
    lines: [
      { who: 'narrator', text: 'Everyone ends up in a big heap at the edge of the ice. The foxes yip with laughter and run off to tell their friends.' },
      { who: 'narrator', text: 'Nobody is hurt, just cold and a little bit embarrassed.' },
    ],
    next: 'map2',
  },
  // ----- the pine forest -----
  forest: {
    lines: [
      { who: 'narrator', text: 'The pine forest is quiet and deep. The snow comes up to your knees. Every branch has a little hat of snow on it.' },
      { who: 'narrator', text: 'Somebody is crying for help. "Baaaa! Help! Baaaa!" A goat herder is stuck in a drift, with three goats standing on her.' },
    ],
    choices: [
      { label: 'Dig her out', go: 'herder' },
      { label: '{dragon}, can you warm the snow?', go: 'herder_warm' },
    ],
  },
  herder: {
    lines: [{ who: 'narrator', text: '{name} starts digging like a dog. Snow flies everywhere.' }],
    check: { skill: 'tough', label: 'Dig through the cold snow', help: 'hollis', great: 'herder_out', ok: 'herder_out', miss: 'herder_slow' },
  },
  herder_warm: {
    lines: [
      { who: 'narrator', text: '{dragon} climbs onto the snowdrift and lies down on it, belly first. Its tummy glows warm, like a little stove.' },
      { who: 'narrator', text: 'Drip... drip... the snow melts away underneath it. {dragon} learned something new!' },
    ],
    set: { dragonWarm: true, warmLearned: true },
    next: 'herder_out',
  },
  herder_slow: {
    lines: [{ who: 'narrator', text: 'It takes forever, and everyone\'s fingers turn pink. But at last the goat herder pops out of the drift like a cork.' }],
    next: 'herder_out',
  },
  herder_out: {
    lines: [
      { who: 'narrator', text: '"Oh, thank you, thank you! I\'m Hilde. I keep goats up here." The goats look at you like they own the mountain.' },
      { who: 'narrator', text: 'Hilde gives you a little bottle of honey tonic. "Drink it if you get hurt. And watch out for foxes. They\'re thick as fleas this year."' },
      { who: 'narrator', text: 'Yip! Yip yip! Right on cue, four frost foxes bound out of the trees.' },
    ],
    give: { items: { potion: 1 } },
    meet: ['fox'],
    next: 'fight:forest',
  },
  forest_win: {
    lines: [{ who: 'narrator', text: 'The foxes give up and bounce away through the drifts, leaving little paw holes behind them.' }],
    next: 'map2',
  },
  // ----- the slope and the avalanche -----
  map2: { nextIf: [{ if: 'road4f', go: 'map2f' }], next: 'map2l' },
  map2l: {
    lines: [{ who: 'pim', text: 'The cave is past the big slope. Almost there!' }],
    trailmap: { ...MAP('lake', { slope: { go: 'slope' } }), text: 'Tap the next place on the map.' },
  },
  map2f: {
    lines: [{ who: 'pim', text: 'The cave is past the big slope. Almost there!' }],
    trailmap: { ...MAP('forest', { slope: { go: 'slope' } }), text: 'Tap the next place on the map.' },
  },
  slope: {
    lines: [
      { who: 'narrator', text: 'Halfway up the big slope, the mountain makes a sound. A deep, low rumble. Rrrrrrrmmmm.' },
      { who: 'narrator', text: 'Above you, a whole wall of snow starts to slide.' },
      { who: 'juni', text: 'AVALANCHE! Run!' },
    ],
    choices: [
      { label: 'Run for the cave!', go: 'run' },
      { label: '{dragon}, melt us a tunnel!', go: 'tunnel', if: 'dragonWarm' },
    ],
  },
  run: {
    lines: [{ who: 'narrator', text: 'Everyone runs as fast as their legs will go. The cave is right there. The snow is right behind!' }],
    check: { skill: 'climb', label: 'Scramble up to the cave', help: 'tobin', great: 'safe', ok: 'safe', miss: 'buried', disaster: 'buried' },
  },
  tunnel: {
    xp: 1, xpKey: 'slope',
    lines: [
      { who: 'narrator', text: '{dragon} puffs up its warm belly and walks straight into the nearest snowbank. Hssss. Steam everywhere.' },
      { who: 'narrator', text: 'It makes a tunnel, just big enough for kids. Everyone crawls through while the avalanche roars by overhead. Nobody even gets snowy.' },
    ],
    next: 'safe',
  },
  buried: {
    lines: [
      { who: 'narrator', text: 'WHUMP. The snow catches everyone. Now there\'s a row of kid heads sticking out of the snow, like snowmen.' },
      { who: 'hollis', text: 'I can\'t feel my nose. Is my nose still there?', if: 'team:hollis' },
      { who: 'narrator', text: '{dragon} scampers from head to head, breathing warm air until the snow melts away. It\'s pretty pleased with itself.' },
    ],
    set: { dragonWarm: true },
    hurt: 1,
    next: 'safe',
  },
  safe: {
    lines: [
      { who: 'narrator', text: 'Inside the cave, it\'s dry and quiet. The avalanche settles outside with a soft whumpf.' },
      { who: 'narrator', text: '{dragon} curls up in the middle of the kids and makes its tummy glow, so everyone stays warm.', ifNot: 'warmLearned' },
      { who: 'pim', text: 'That\'s new! {dragon} can make its tummy warm now. It\'s like a little campfire with a tail.', ifNot: 'warmLearned' },
    ],
    set: { dragonWarm: true },
    next: 'camp',
  },
  camp: {
    lines: [{ who: 'narrator', text: 'Before bed, {dragon} needs taking care of. What does it need most tonight?' }],
    choices: [
      { label: 'Feed it (+3 hearts for {dragon} next time)', go: 'care_fed', set: { careFed: true, carePlayed: false, careNap: false } },
      { label: 'Play with it (+10 for its tricks next time)', go: 'care_play', set: { careFed: false, carePlayed: true, careNap: false } },
      { label: 'Let it nap (one more trick next time)', go: 'care_nap', set: { careFed: false, carePlayed: false, careNap: true } },
    ],
  },
  care_fed: { lines: [{ who: 'narrator', text: '{dragon} eats a whole loaf of bread, two apples, and one of Hollis\'s socks. Oops.' }], next: 'cliff' },
  care_play: { lines: [{ who: 'narrator', text: 'Snowball fight! {dragon} catches every snowball in its mouth and melts it. Then it sneezes steam.' }], next: 'cliff' },
  care_nap: { lines: [{ who: 'narrator', text: '{dragon} falls asleep with its warm tummy against {name}\'s feet. Best foot warmer in the world.' }], next: 'cliff' },
  cliff: {
    lines: [
      { who: 'narrator', text: 'In the morning, Nell finds footprints in the snow outside the cave.' },
      { who: 'narrator', text: 'They are huge. Bigger than Mossback\'s. Each one is as long as Tobin is tall.' },
      { who: 'mossback', text: '(sniff, sniff) Oh, dear. Oh, my. Those are trolls. My cousins.', if: 'party:mossback' },
      { who: 'mossback', text: 'I haven\'t been home in a very, very long time.', if: 'party:mossback' },
      { who: 'pim', text: 'Those look like troll footprints. Big ones. And they go right into the mountain.', ifNot: 'party:mossback' },
    ],
    heal: true,
    levelUp: true, banter: true,
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 17', text: 'Next: Chapter 18, Under the Mountain. Trolls, sunbeams, and a queen who loves shiny things.' },
};

export default { SCENES, FIGHTS, TEXT, LEARNED };
