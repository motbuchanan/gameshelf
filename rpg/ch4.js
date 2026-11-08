// Chapter 4: The Warren. Pudge at the door, trap tunnels, Spark, the goblin treasure pile, and Tobin.
// Text uses {name} for the hero's name. No em dashes.
import CH3 from './ch3.js';

export const TEXT = {
  ...CH3.TEXT,
  TEACH: { ...CH3.TEXT.TEACH, area: 'Page 9! SPARK! A little ball of fire, right where I point!' },
  CHATTER: {
    ...CH3.TEXT.CHATTER,
    tobin: ['YAAAH!', 'That\'s for locking me in the pantry!', 'Tobin is BACK!'],
    pudge: ['Pudge is on your side now!', 'Bonk!', 'Snack break after this?'],
    door: ['No visitors!', 'Go away!', 'Grrr!'],
    g1: ['Hee hee! Shiny!', 'Get them!', 'Our tunnels!'],
    g2: ['Grab the bucket!', 'Hee hee hee!', 'Boss will be happy!'],
    k5: ['Yip!', 'Yip yip!', 'Get them!'],
    trap: ['Snare time!', 'Watch your feet!', 'Yip!'],
  },
};
const LEARNED = { ...CH3.LEARNED, area: false };

export const FIGHTS = {
  door: {
    id: 'ch4-door',
    xpKey: 'door',
    xp: 5,
    mode: 'hp',
    map: [
      'ttttt.ttttt',
      't.........t',
      't..b...b..t',
      '...........',
      't..L...L..t',
      't.........t',
      't....m....t',
      'ttttttttttt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 'door', monster: 'goblin', name: 'Pudge', x: 5, y: 1 },
      { id: 'g1', monster: 'goblin', name: 'Wart', x: 3, y: 1 },
      { id: 'g2', monster: 'goblin', name: 'Fizz', x: 7, y: 1 },
    ],
    team: { from: 'party', spots: [{ x: 3, y: 5 }, { x: 7, y: 5 }, { x: 2, y: 6 }, { x: 8, y: 6 }] },
    roundCap: 10, capResult: 'win', boost: { hp: 3, skill: 12 },
    taught: CH3.LEARNED, skipHeroFirst: true,
    meets: ['goblin'],
    then: { win: 'door_win', lose: 'door_lose' },
  },
  tunnel: {
    id: 'ch4-tunnel',
    xp: 7, xpWhy: 'A hard fight, and you won it!',
    mode: 'hp',
    map: [
      'ttttttttttt',
      't...t.....t',
      't.m.t.b.L.t',
      '......t...t',
      't.....t...t',
      't.L.....m..',
      't...t.....t',
      'ttttttttttt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 1, y: 3 },
      { id: 'trap', monster: 'koboldtrapper', name: 'Skritch', x: 9, y: 2 },
      { id: 'g1', monster: 'goblin', name: 'Wart', x: 8, y: 4 },
      { id: 'g2', monster: 'goblinarcher', name: 'Twitch', x: 9, y: 6 },
      { id: 'k5', monster: 'kobold', name: 'Nibs', x: 8, y: 1 },
      { id: 'k6', monster: 'kobold', name: 'Tup', x: 7, y: 6, if: 'party:sniffle' },
    ],
    team: { from: 'party', spots: [{ x: 2, y: 4 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 3 }] },
    roundCap: 12, capResult: 'win', boost: { hp: 4, skill: 15 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['goblin', 'goblinarcher', 'koboldtrapper'],
    then: { win: 'tunnel_win', lose: 'tunnel_lose' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'The little round door in the hill. Behind it: goblin tunnels, dark and twisty and smelly.' },
      { who: 'hollis', text: 'Front door, with a guard on it. Or...' },
      { who: 'sniffle', text: 'Sniffle knows the back door! The goblins use it to sneak snacks.', if: 'party:sniffle' },
      { who: 'nell', text: 'Kobold whistles open kobold doors. I bet there\'s a back way.', if: 'whistle', ifNot: 'party:sniffle' },
    ],
    choices: [
      { label: 'Go to the front door', go: 'front' },
      { label: 'Sniffle shows the back door', go: 'back', if: 'party:sniffle' },
      { label: 'Use the kobold whistle', go: 'back', if: 'whistle', ifNot: 'party:sniffle' },
    ],
  },
  back: {
    xpKey: 'door',
    xp: 5, xpWhy: 'You found a secret way in! No fight needed.',
    lines: [
      { who: 'narrator', text: 'Around the far side of the hill, behind a bush, there\'s a tiny door that smells like cookies.' },
      { who: 'sniffle', text: 'Knock three times, then sneeze. Achoo! See? Open!', if: 'party:sniffle' },
      { who: 'narrator', text: 'Nell blows the whistle: tweet-tweedle-tweet. Click! The little door swings open.', ifNot: 'party:sniffle' },
    ],
    next: 'tunnels',
  },
  front: {
    lines: [
      { who: 'narrator', text: 'A round goblin sits in front of the door, eating a mushroom. He jumps up.' },
      { who: 'pudge', text: 'Halt! I\'m Pudge, and I\'m the GUARD. No visitors! Especially not clean ones. You smell like SOAP.' },
      { who: 'pim', text: 'He keeps looking at Gran\'s bread...', if: 'torch' },
      { who: 'hollis', text: 'He keeps looking at my emergency cookies...', ifNot: 'torch' },
    ],
    choices: [
      { label: 'Sneak past him', go: 'front_sneak' },
      { label: 'Make friends (share a snack)', go: 'front_talk' },
      { label: 'Charge!', go: 'fight:door' },
    ],
  },
  front_sneak: { check: { skill: 'sneak', help: 'nell', label: 'Sneak past Pudge', great: 'front_snuck', ok: 'front_snuck', miss: 'front_caught' } },
  front_snuck: {
    xpKey: 'door',
    xp: 5, xpWhy: 'You sneaked past Pudge! That counts as winning!',
    lines: [{ who: 'narrator', text: 'Pudge turns around to scratch his back on the door frame, and the kids slip right past him into the dark.' }],
    next: 'tunnels',
  },
  front_caught: {
    lines: [
      { who: 'pudge', text: 'HEY! I SEE you! Wart! Fizz! Intruders!' },
      { who: 'narrator', text: 'Two more goblins come running out of the door.' },
    ],
    next: 'fight:door',
  },
  front_talk: { check: { skill: 'talk', help: 'pim', label: 'Make friends with Pudge', great: 'pudge_friend', ok: 'pudge_friend', miss: 'pudge_grumpy' } },
  pudge_friend: {
    xpKey: 'door',
    xp: 5, xpWhy: 'You made a friend instead of fighting!',
    lines: [
      { who: 'hero', text: 'Hi, Pudge. Do you want a snack? We have plenty.' },
      { who: 'pudge', text: 'A snack? For ME? Nobody shares with Pudge. Grubjaw eats all the good stuff.' },
      { who: 'narrator', text: 'Pudge munches happily. Crumbs everywhere.' },
      { who: 'pudge', text: 'You know what? Grubjaw is mean. He made us take your friends. The little loud one is in the pantry. The fixer girl went to his camp.' },
      { who: 'pudge', text: 'And psst: Grubjaw is SO scared of fire. Pudge wants to come with you!' },
    ],
    join: 'pudge',
    set: { pudge: true, fire: true },
    next: 'tunnels',
  },
  pudge_grumpy: {
    lines: [
      { who: 'pudge', text: 'Is that... a trick snack? Pudge is too smart for tricks! WART! FIZZ!' },
    ],
    next: 'fight:door',
  },
  door_win: {
    lines: [
      { who: 'narrator', text: 'The goblins run off down the hill, leaving the door wide open.' },
      { who: 'hollis', text: 'That was the easy part. In we go.' },
    ],
    next: 'tunnels',
  },
  door_lose: {
    lines: [{ who: 'narrator', text: 'The goblins knock the kids into a pile in the grass.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:door', retry: true },
      { label: 'See what happens', go: 'door_see' },
    ],
  },
  door_see: {
    lines: [
      { who: 'narrator', text: 'The goblins get bored of guarding and go inside for lunch. They forget to close the door.' },
      { who: 'nell', text: 'Goblins are not very good guards.' },
    ],
    next: 'tunnels',
  },
  tunnels: {
    lines: [
      { who: 'narrator', text: 'Inside, the tunnels are low and dark. Roots hang from the ceiling. Something drips.' },
      { who: 'pim', text: 'Careful. Kobolds put traps in goblin tunnels. It\'s like their job.' },
    ],
    check: { skill: 'notice', help: 'pim', label: 'Look for tripwires', great: 'trap1_spot', ok: 'trap1_spot', miss: 'trap1_oops' },
  },
  trap1_spot: {
    lines: [{ who: 'hero', text: 'Stop! There\'s a string across the floor. Everybody step over it.' }],
    next: 'trap2',
  },
  trap1_oops: {
    hurt: 1,
    lines: [
      { who: 'narrator', text: 'Twang! A tripwire! A whole bucket of pinecones dumps down on {name}\'s head. BONK BONK BONK.' },
      { who: 'hollis', text: 'Good thing you wear a bucket.' },
    ],
    next: 'trap2',
  },
  trap2: {
    lines: [{ who: 'narrator', text: 'Further in, a big wooden box sits in the middle of the tunnel, with a sign: "NOT A TRAP."' }],
    check: { skill: 'fingers', help: 'nell', label: 'Take the "not a trap" apart carefully', great: 'trap2_safe', ok: 'trap2_safe', miss: 'trap2_oops' },
  },
  trap2_safe: {
    lines: [
      { who: 'narrator', text: 'Click, click, snip. Inside is a spring with a boxing glove on it. {name} takes the spring out. Now it\'s just a box.' },
      { who: 'nell', text: 'Goblins are SO sneaky. And SO bad at spelling.' },
    ],
    next: 'dark',
  },
  trap2_oops: {
    hurt: 1,
    lines: [
      { who: 'narrator', text: 'BOING! A boxing glove on a spring pops out and bops {name} right on the bucket.' },
      { who: 'pim', text: 'In fairness, the sign did say it was not a trap.' },
    ],
    next: 'dark',
  },
  dark: {
    lines: [
      { who: 'narrator', text: 'Then the tunnel gets so dark nobody can see their own hands.' },
      { who: 'pim', text: 'Wait. Gran said, "When it gets dark, read page 9." I can\'t read in the dark, but I memorized it.' },
      { who: 'pim', text: 'Little light, little flame, come and help me, hear your name: SPARK!' },
      { who: 'narrator', text: 'POP! A tiny ball of fire floats above Pim\'s hand, lighting up the whole tunnel.' },
      { who: 'pim', text: 'It WORKS! Gran\'s book really works! And I think I can throw it, too.' },
    ],
    set: { spark: true },
    nextIf: [{ if: 'bestAt:clever', go: 'spark_learn' }],
    next: 'treasure',
  },
  spark_learn: {
    lines: [
      { who: 'pim', text: '{name}, you\'re clever too. Say it with me. Little light, little flame...' },
      { who: 'narrator', text: 'POP! A second spark floats above {name}\'s hand. You learned your first spell: Spark! In fights, tap the Spark button to throw it.' },
    ],
    give: { spell: 'spark' },
    next: 'treasure',
  },
  treasure: {
    lines: [
      { who: 'narrator', text: 'The Spark lights up a big round room. And in the middle: a HUGE pile of shiny stuff.' },
      { who: 'hollis', text: 'That\'s Mrs. Pell\'s teapot! And the mayor\'s spoons! The goblins have been stealing from Millbrook for weeks!' },
      { who: 'nell', text: 'MY BUTTONS! My whole button pouch! You stinky goblins!' },
      { who: 'narrator', text: 'In the pile is real gear that fits just right, a big ring with a key that says "CAMP: BACK GATE," and a bag of coins.' },
      { who: 'pim', text: 'Look at the wall. Goblin drawings. That\'s Grubjaw... running away from a campfire. He really IS scared of fire.' },
    ],
    give: { gearBy: { brave: 'steelsword', sneaky: 'shortbow', clever: 'padded' }, gear: ['padded'], coins: 12 },
    set: { buttons: true, backdoor: true, fire: true },
    next: 'gear_note',
  },
  gear_note: {
    lines: [
      { who: 'narrator', text: '{name} puts on a padded jacket. It is armor, so you\'re harder to hit now. And a new weapon feels just right in your hands.', ifNot: 'bestAt:clever' },
      { who: 'narrator', text: '{name} puts on a padded jacket. It is armor, so you\'re harder to hit now. You keep your trusty slingshot for throwing, and Spark for fire.', if: 'bestAt:clever' },
      { who: 'narrator', text: 'Then, from behind a little door, someone yells.' },
      { who: 'tobin', text: 'HELLO? IS SOMEBODY OUT THERE? I CAN HEAR NELL YELLING ABOUT BUTTONS!' },
    ],
    next: 'tobin',
  },
  tobin: {
    lines: [
      { who: 'narrator', text: 'Hollis yanks the little door open. It\'s a pantry. Tobin is sitting inside, surrounded by empty snack wrappers.' },
      { who: 'tobin', text: 'You came! I knew you\'d come! I ate ALL their snacks. Every single one. That\'ll show them.' },
      { who: 'nell', text: 'Where\'s Juni?' },
      { who: 'tobin', text: 'They took her to the big boss. Grubjaw. He wants her to fix his cage wagon. She told him she\'d fix it to fall apart.' },
      { who: 'hollis', text: 'That\'s Juni. Okay. Tobin, you\'re with us now.' },
    ],
    join: 'tobin',
    set: { tobin: true },
    next: 'ambush',
  },
  ambush: {
    lines: [
      { who: 'narrator', text: 'Footsteps! Lots of them. Goblins and kobolds pour into the tunnel, and they do not look happy about their empty pantry.' },
      { who: 'tobin', text: 'Uh oh. They noticed about the snacks.' },
    ],
    next: 'fight:tunnel',
  },
  tunnel_win: {
    lines: [
      { who: 'narrator', text: 'The last goblin runs off squealing. The tunnel is quiet.' },
      { who: 'hollis', text: 'Is everybody okay?' },
      { who: 'tobin', text: 'Never better. That was AWESOME.' },
    ],
    next: 'rest',
  },
  tunnel_lose: {
    lines: [{ who: 'narrator', text: 'The goblins and kobolds push the kids back into the treasure room and slam the door.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:tunnel', retry: true },
      { label: 'See what happens', go: 'tunnel_see' },
    ],
  },
  tunnel_see: {
    lines: [
      { who: 'narrator', text: 'The door is locked, but Tobin knows this place. He opens a little hatch behind the teapot pile.' },
      { who: 'tobin', text: 'Snack tunnel. The goblins don\'t think I know about it. I know about ALL the snacks.' },
      { who: 'narrator', text: 'The kids crawl out the back of the warren while the goblins guard an empty room.' },
    ],
    next: 'rest',
  },
  rest: {
    lines: [
      { who: 'narrator', text: 'Out under the stars, the kids rest. Tobin shares the snacks he saved in his pockets.' },
      { who: 'pim', text: 'One more day. Then we get Juni.' },
      { who: 'hollis', text: 'Hey {name}, want to learn my secret trick? If a roll goes wrong, flip the two dice around. 82 becomes 28!' },
      { who: 'narrator', text: 'New talent: Flip the dice! Once each fight, if you miss, you can swap the two dice.' },
    ],
    heal: true,
    give: { talent: 'flip' },
    levelUp: true,
    next: 'night',
  },
  night: {
    lines: [
      { who: 'narrator', text: 'Over the next hill, a big campfire glows. A huge shadow walks in front of it, and laughs. HA HA HA HA!' },
      { who: 'tobin', text: 'That\'s him. That\'s Grubjaw.' },
      { who: 'hollis', text: 'Tomorrow, he gives Juni back.' },
    ],
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 4', text: 'Next: Chapter 5, The Gnoll\'s Camp. Time to rescue Juni!' },
};

export default { SCENES, FIGHTS, TEXT };
