// Chapter 2: Not Pretend Anymore. The goblin ambush at Juni's fort.
// Text uses {name} for the hero's name. No em dashes.

export const CH2_FIGHT = {
  id: 'ch2-ambush',
  mode: 'hp',
  // . grass   b bush (cover)   m mud (2 steps)   L log (blocks)   t tree (blocks)   ~ stream (no wading)
  map: [
    'tt...t...tt',
    '.....b....t',
    '..L..~..b..',
    '.b...~.....',
    '.....m..b..',
    '..m..~..L..',
    '.b...~...bt',
    'tt...~..ttt',
  ],
  units: [
    { id: 'hero', side: 'hero', ai: 'player', x: 2, y: 4 },
    { id: 'hollis', side: 'hero', ai: 'friend', bestAt: 'brave', offHand: 'potlid', x: 3, y: 3 },
    { id: 'nell', side: 'hero', ai: 'friend', bestAt: 'sneaky', x: 2, y: 6, prefersBush: true },
    { id: 'pim', side: 'hero', ai: 'friend', bestAt: 'clever', x: 1, y: 5,
      trick: { id: 'pinecones', name: 'Pinecone shower', skill: 'aim', shape: 'circle', r: 1, range: 5, uses: 1, dice: '1d4' } },
    { id: 'gob1', monster: 'goblin', name: 'Snag', x: 9, y: 3 },
    { id: 'gob2', monster: 'goblin', name: 'Grubber', x: 9, y: 5 },
    { id: 'gob3', monster: 'goblin', name: 'Nix', x: 10, y: 4 },
    { id: 'gob4', monster: 'goblinarcher', name: 'Twitch', x: 10, y: 2 },
    { id: 'gob5', monster: 'goblin', name: 'Moss', x: 9, y: 6 },
    // At the fort, not fighting. They get carried off in round 3.
    { id: 'tobin', side: 'hero', ai: 'none', bestAt: 'sneaky', x: 1, y: 1, bystander: true },
    { id: 'juni', side: 'hero', ai: 'none', bestAt: 'brave', x: 2, y: 1, bystander: true },
  ],
  roundCap: 12,
  capResult: 'win',         // goblins get tired and run off
  taught: { move: true, cover: true, mud: true, los: true, range: true },  // learned in Chapter 1
  events: [
    { round: 3, type: 'snatch',
      spawn: [{ id: 'kob1', monster: 'kobold', side: 'monster', x: 0, y: 2 }, { id: 'kob2', monster: 'kobold', side: 'monster', x: 0, y: 1 }],
      grab: { kob1: 'juni', kob2: 'tobin' },
      lines: [
        { who: 'juni', text: 'Hey! HEY! Let go of me!' },
        { who: 'tobin', text: 'HELP! Something has a NET!' },
        { who: null, text: 'Two kobolds sneak out of the ferns behind the fort. They throw a big net over Tobin and Juni and drag them away into the woods!' },
        { who: 'hollis', text: 'They\'re too far! We can\'t reach them! Beat these goblins first, then we go after them. We will get them back.' },
      ] },
  ],
  // Monster pictures that go in the Big Book when this fight starts.
  meets: ['goblin', 'goblinarcher', 'kobold'],
};

// Lessons, said the first time a turn shows them. Chapter 1 lessons already learned are skipped.
export const TEACH = {
  attack: 'This isn\'t the game anymore. Real hits now! If I hit, I roll my weapon\'s dice, and the goblin loses that many hearts.',
  monsterturn: 'Hee hee! Shiny buckets! Give us your shiny things!',
  area: 'Gran\'s pinecone shower! Every goblin in the orange squares gets bonked, and each one loses hearts.',
  retreat: 'Ow ow OW! Too many bonks! Run away, run away!',
};
export const INIT_TEACH = 'In a real fight, everybody rolls the 20-sided die to see who goes first. Quick feet add a little extra. Tap Roll!';
export const DAMAGE_TEACH = 'A hit! Now the damage dice. The number on the dice is how many hearts the goblin loses.';
export const ARMOR_TEACH = 'See their armor? Armor makes a kid or a monster harder to hit. Your bucket helmet counts!';
export const LUCK_TEACH = 'Missed! But you have Luck clovers. Spend one to pick up the dice and roll again. You only have 3, so save them for big moments.';
export const KNOCKED_LINE = '{who} is knocked down and too dizzy to fight. They\'ll be okay.';
export const FLED_LINE = '{who} runs away into the woods!';
export const HERO_FIRST = 'Your turn, {name}! Same as the pretend game: walk on blue, then tap a goblin in a red box. But now a hit takes away hearts.';
export const HERO_TURN = ['Your turn, {name}!', 'Go get them, {name}!', 'Your move, {name}.'];
export const HERO_RANGED_HINT = 'Your slingshot reaches far. Stay back where knives can\'t reach you.';
export const HERO_NO_TARGET = 'No goblin is close enough yet. Walk closer, then tap Done.';
export const HERO_OUT = 'You\'re knocked down and dizzy! Sit tight. Your friends keep fighting.';

export const CHATTER = {
  hollis: ['For Millbrook!', 'Get away from our woods!', 'I\'m not scared of you!'],
  nell: ['Quick and quiet.', 'They won\'t see me coming.', 'Sneak, sneak...'],
  pim: ['Aim small, hit small.', 'I have a plan.', 'Stay calm, stay calm.'],
  gob1: ['Shiny! Shiny!', 'Hee hee hee!', 'Give us your buttons!'],
  gob2: ['Smells like soap. Yuck!', 'Grab the shiny kid!', 'Hee hee!'],
  gob3: ['Boss will be happy!', 'Nix wants that bucket!', 'Hee hee hee!'],
  gob5: ['Moss is hungry!', 'Hee hee!', 'Shiny bucket for Moss!'],
  gob4: ['Hold still!', 'Twitch never misses. Almost never.', 'Pew!'],
};

export const RESULT = {
  legendary: 'LEGENDARY! A perfect hit on {target}!',
  exceptional: 'Great hit on {target}! Extra damage!',
  success: 'Hit! {target} gets bonked.',
  fail: 'Missed! {target} ducks out of the way.',
  disaster: 'Oops! {actor} trips over a root. Silly!',
};
export const AREA_RESULT = {
  legendary: 'LEGENDARY pinecones! A whole storm of them!',
  exceptional: 'Great throw! The pinecones rain down hard!',
  success: 'Bonk bonk bonk! Pinecones everywhere!',
  fail: 'The pinecones bounce off the ground. Nobody gets bonked.',
  disaster: 'Oops! The pinecones fall on Pim\'s own head. Ow, silly!',
};

export const CH2_SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'Everything is very quiet. Over by the edge of the clearing, Juni is building a fort out of sticks, and Tobin is "helping," which mostly means eating crackers.' },
      { who: 'juni', text: 'Tobin, hold this branch still. STILL.' },
      { who: 'pim', text: 'Um. Does anybody else smell wet dog and old cheese?' },
      { who: 'narrator', text: 'A crow caws. Then the bushes burst open, and four goblins tumble out, giggling and waving rusty knives.' },
      { who: 'goblin', text: 'Hee hee hee! Shiny kids with shiny buckets! Get them!' },
      { who: 'hollis', text: 'Those aren\'t pretend monsters. Those are REAL goblins! Everybody, get ready!' },
    ],
    next: 'fight',
  },
  win: {
    lines: [
      { who: 'narrator', text: 'The last goblin runs off into the trees, yelling about soap.' },
      { who: 'nell', text: 'Look! One of them dropped a pouch.' },
      { who: 'pim', text: 'It\'s a map. A crumpled, smelly map. There\'s a drawing of a big hill, and a laughing face with lots of teeth.' },
    ],
    set: { map: true },
    next: 'gone',
  },
  lose: {
    lines: [
      { who: 'narrator', text: 'The goblins knock the kids down, grab a few shiny things, and run off giggling.' },
    ],
    choices: [
      { label: 'Try the fight again', go: 'fight', retry: true },
      { label: 'See what happens', go: 'see' },
    ],
  },
  see: {
    lines: [
      { who: 'narrator', text: 'A little while later, the kids sit up. Everybody has bumps and grass in their hair, but everybody is okay.' },
      { who: 'nell', text: 'They\'re gone. But look, one of them dropped this in the mud. A crumpled, smelly map.' },
      { who: 'pim', text: 'There\'s a drawing of a big hill, and a laughing face with lots of teeth.' },
    ],
    set: { map: true },
    next: 'gone',
  },
  gone: {
    lines: [
      { who: 'hollis', text: 'Tobin! Juni! Where are you?' },
      { who: 'narrator', text: 'The fort is knocked over. There are little clawed footprints in the dirt, and two long lines where something heavy got dragged.' },
      { who: 'nell', text: 'Those are kobold tracks. They took them that way, deeper into the woods.' },
      { who: 'pim', text: 'What do we do? Do we go get help, or go after them right now?' },
    ],
    choices: [
      { label: 'Get help from town', go: 'town', set: { help: 'town' } },
      { label: 'Follow them now', go: 'follow', set: { help: 'follow' } },
    ],
  },
  town: {
    lines: [
      { who: 'narrator', text: 'The kids run all the way back to Millbrook. But the guard house is empty.' },
      { who: 'hollis', text: 'Where is everybody? The guards are always here!' },
      { who: 'narrator', text: 'A note on the door says the guards went to the far bridge. Someone sent a message about trouble there. The note is signed with a little black feather.' },
      { who: 'pim', text: 'Gran! Gran will help!' },
      { who: 'narrator', text: 'Pim\'s Gran listens to the whole story. Then she packs bandages, a torch, and some bread, and looks Pim right in the eye.' },
      { who: 'pim', text: 'She says: "My book\'s tricks do work, Pim. When it gets dark, read page 9."' },
    ],
    set: { torch: true, gran: true },
    next: 'camp',
  },
  follow: {
    lines: [
      { who: 'hollis', text: 'No time! If we go to town, the trail goes cold. We go now.' },
      { who: 'nell', text: 'The tracks are fresh. I can follow these easy.' },
      { who: 'narrator', text: 'The kids follow the tracks deeper into Whisper Woods, until the sun goes down and they can\'t see the ground anymore.' },
    ],
    set: { fresh: true },
    next: 'camp',
  },
  camp: {
    lines: [
      { who: 'narrator', text: 'The kids make a little camp under a big oak tree. Everybody is tired, and a little scared.' },
      { who: 'nell', text: 'Do you think they\'re okay?' },
      { who: 'hollis', text: 'Juni is the toughest kid in Millbrook, and Tobin is the loudest. They\'re okay. And we\'re getting them back.' },
      { who: 'pim', text: 'Today was the scariest day ever. But {name}, you were really brave.' },
    ],
    levelUp: true,
    next: 'night',
  },
  night: {
    lines: [
      { who: 'narrator', text: 'The fire crackles. Then, far away in the dark, something laughs. A big, booming laugh. HA HA HA HA!' },
      { who: 'nell', text: '...That was not a deer.' },
    ],
    next: 'end',
  },
  end: {
    end: true,
    title: 'End of Chapter 2',
    text: 'Chapter 3, The Trail, comes in the next update.',
  },
};

export default { CH2_FIGHT, CH2_SCENES, TEACH, INIT_TEACH, DAMAGE_TEACH, ARMOR_TEACH, LUCK_TEACH, KNOCKED_LINE, FLED_LINE, HERO_FIRST, HERO_TURN, HERO_RANGED_HINT, HERO_NO_TARGET, HERO_OUT, CHATTER, RESULT, AREA_RESULT };
