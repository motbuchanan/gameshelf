// Chapter 1: Heroes and Monsters. The pretend battle in Whisper Woods.
// Text uses {name} for the hero's name. No em dashes.

export const CH1_FIGHT = {
  id: 'ch1-pretend',
  // . grass   b bush (cover)   m mud (2 steps)   L log (blocks)   t tree (blocks)   ~ stream (no wading)
  map: [
    'tt...~...tt',
    't....~..L.t',
    '..b..~.bL..',
    '......m....',
    '..m..m.....',
    '.b...~..L..',
    't..b.~.bL.t',
    'tt...~...tt',
  ],
  units: [
    { id: 'hollis', side: 'hero', ai: 'friend', bestAt: 'brave', x: 2, y: 3, flags: 3 },
    { id: 'hero', side: 'hero', ai: 'player', x: 1, y: 4, flags: 3 },
    { id: 'nell', side: 'hero', ai: 'friend', bestAt: 'sneaky', x: 2, y: 5, flags: 3, prefersBush: true },
    { id: 'tobin', side: 'monster', ai: 'monster', bestAt: 'sneaky', x: 9, y: 3, flags: 3 },
    { id: 'pim', side: 'hero', ai: 'friend', bestAt: 'clever', x: 1, y: 2, flags: 3,
      trick: { id: 'pinecones', name: 'Pinecone shower', skill: 'aim', shape: 'circle', r: 1, range: 5, uses: 1 } },
    { id: 'juni', side: 'monster', ai: 'monster', bestAt: 'brave', weapon: 'club', x: 9, y: 5, flags: 3, prefersBush: true },
  ],
  // Who goes when. (Rolling for turn order comes in Chapter 2.)
  order: ['hollis', 'hero', 'nell', 'tobin', 'pim', 'juni'],
  // Hand-picked first moves so each friend shows one idea.
  script: {
    nell: { 1: { moveTo: { x: 3, y: 6 }, teach: 'cover' } },
  },
};

// The lesson each kid says the first time their turn shows it.
export const TEACH = {
  move: 'Watch me first! On my turn I can walk up to 4 steps. The blue squares show where I can go.',
  attack: 'To tag a monster, I roll the 100 dice. If the number lands in my colored squares, I pull a flag!',
  cover: 'I\'m hiding in this bush. A bush is cover, so monsters have a harder time tagging me.',
  mud: 'Ugh, mud! Every mud square costs 2 steps instead of 1.',
  monsterturn: 'RAWR! Monsters get turns too. Here I come!',
  area: 'Gran\'s pinecone shower! It hits an AREA. Every monster in the orange squares gets bonked. I can only do it once a game.',
  range: 'My slingshot reaches 6 squares. I like to stay back where swings can\'t reach me.',
  los: 'I can\'t see anyone to shoot. Logs and trees block my slingshot.',
};
export const HERO_FIRST = 'Your turn, {name}! Tap a blue square to walk. Then tap a monster with a red box to tag it. Tap Done when you finish.';
export const HERO_TURN = ['Your turn, {name}!', 'Go get them, {name}!', 'Your move, {name}.'];
export const HERO_RANGED_HINT = 'Your slingshot can reach far. Monsters with a red box are close enough to shoot.';
export const HERO_NO_TARGET = 'Nobody is close enough to tag yet. Walk closer, then tap Done.';

// Short lines once the lessons are done, picked by round.
export const CHATTER = {
  hollis: ['Charge!', 'For Millbrook!', 'Stand back, I\'ve got this!'],
  nell: ['Sneak, sneak, sneak...', 'They won\'t see me coming.', 'Quick and quiet.'],
  pim: ['Let me think...', 'Aim small, hit small.', 'I have a plan.'],
  tobin: ['RAWR!', 'Monsters never give up!', 'I\'m the scariest monster ever!'],
  juni: ['Grrrr!', 'You can\'t catch me!', 'Monster fort forever!'],
};

export const RESULT = {
  legendary: 'LEGENDARY! {target} loses 3 flags!',
  exceptional: 'Great tag! {target} loses 2 flags!',
  success: 'Tag! {target} loses a flag!',
  fail: 'Missed! {target} ducks out of the way.',
  disaster: 'Oops! {actor} trips over a root. Silly!',
};
export const AREA_RESULT = {
  legendary: 'LEGENDARY pinecones! Every monster in the orange squares loses 3 flags!',
  exceptional: 'Great throw! Every monster in the orange squares loses 2 flags!',
  success: 'Bonk! Every monster in the orange squares loses a flag!',
  fail: 'The pinecones bounce off the ground. Nobody gets bonked.',
  disaster: 'Oops! The pinecones fall on Pim\'s own head. Ow, silly!',
};
export const OUT_LINE = '{who} is out of flags and sits on the log to cheer.';
export const HERO_OUT = 'You\'re out of flags! Sit on the log and cheer. Your friends keep playing.';

export const CH1_SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'Saturday morning. The Millbrook kids meet at the edge of Whisper Woods for the best game there is: Heroes and Monsters.' },
      { who: 'hollis', text: '{name}! You made it! You\'re a hero today, with me, Nell and Pim.' },
      { who: 'tobin', text: 'And me and Juni are the MONSTERS! Rawr!' },
      { who: 'nell', text: 'Everybody tucks flags in their belt. Tag someone and you pull a flag. Lose all your flags and you\'re out.' },
      { who: 'juni', text: 'And no tagging the trees. Trees are base.' },
      { who: 'pim', text: 'We take turns, one kid at a time. The row of faces at the top shows whose turn it is.' },
      { who: 'hollis', text: 'Tap anything on the map to learn what it is. Ready? Let\'s play!' },
    ],
    next: 'fight',
  },
  win: {
    lines: [
      { who: 'juni', text: 'Okay, okay! You got all our flags. Heroes win!' },
      { who: 'tobin', text: 'No fair. Next time I get to be the hero.' },
      { who: 'hollis', text: 'Good game, {name}! You\'re a natural.' },
    ],
    next: 'after',
  },
  tie: {
    lines: [
      { who: 'narrator', text: 'The sun dips behind the trees. Someone\'s mom calls them home for supper.' },
      { who: 'hollis', text: 'Nobody won? Then we call it a tie. Good game, {name}!' },
    ],
    next: 'after',
  },
  lose: {
    lines: [
      { who: 'tobin', text: 'MONSTERS WIN! MONSTERS WIN!' },
      { who: 'nell', text: 'That was close. Want to play again, {name}?' },
    ],
    choices: [
      { label: 'Play the battle again', go: 'fight' },
      { label: 'Keep going', go: 'after' },
    ],
  },
  after: {
    lines: [
      { who: 'pim', text: 'Shh. Did anybody else hear that?' },
      { who: 'narrator', text: 'Deep in the woods, a branch snaps. Then a crow takes off, cawing. Then everything goes very quiet.' },
      { who: 'nell', text: 'It\'s probably just a deer...' },
    ],
    next: 'end',
  },
  end: {
    end: true,
    title: 'End of Chapter 1',
    text: 'Chapter 2, Not Pretend Anymore, comes in the next update.',
  },
};

export default { CH1_FIGHT, CH1_SCENES, TEACH, HERO_FIRST, HERO_TURN, HERO_RANGED_HINT, HERO_NO_TARGET, CHATTER, RESULT, AREA_RESULT, OUT_LINE, HERO_OUT };
