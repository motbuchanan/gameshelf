// Chapter 3: The Trail. Tracking the goblins, snares, Sniffle, the stream, and the kobold patrol.
// Text uses {name} for the hero's name. No em dashes.
import CH2 from './ch2.js';

// Lessons from Chapters 1 and 2 are already learned.
export const LEARNED = { move: true, cover: true, mud: true, los: true, range: true, attack: true, monsterturn: true, retreat: true, area: true };

export const TEXT = {
  ...CH2,
  TEACH: { ...CH2.TEACH, monsterturn: 'Yip yip! Get them!', retreat: 'Yip! Too many bonks! Run home!' },
  INIT_TEACH: 'Roll for who goes first!',
  HERO_TURN: ['Your turn, {name}!', 'Go get them, {name}!', 'Your move, {name}.'],
  CHATTER: {
    ...CH2.CHATTER,
    sniffle: ['Achoo! Sorry!', 'Sniffle helps!', 'For the kind kids!'],
    k1: ['Yip!', 'Get the bucket kid!', 'Yip yip!'],
    k2: ['Achoo!', 'Kobolds rule!', 'Yap!'],
    k3: ['Yip! Yip!', 'Boss will be happy!', 'Grrr-yip!'],
    k4: ['Yap yap!', 'Sneak attack!', 'Yip!'],
    trap: ['Watch your feet, hee!', 'Snare time!', 'Yip yip!'],
  },
};

export const FIGHTS = {
  patrol: {
    id: 'ch3-patrol',
    xpKey: 'patrol',
    xp: 5,
    mode: 'hp',
    map: [
      'tt..t...ttt',
      '...b...L...',
      '.L....b..b.',
      '....m......',
      '.b.....L.b.',
      '...L..b....',
      '.b......m..',
      'tt...t...tt',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 1, y: 3 },
      { id: 'k1', monster: 'kobold', name: 'Yap', x: 8, y: 2 },
      { id: 'k2', monster: 'kobold', name: 'Snik', x: 9, y: 3 },
      { id: 'k3', monster: 'kobold', name: 'Rikki', x: 8, y: 5 },
      { id: 'trap', monster: 'koboldtrapper', name: 'Skritch', x: 10, y: 4 },
    ],
    team: { from: 'party', spots: [{ x: 2, y: 2 }, { x: 2, y: 4 }, { x: 1, y: 5 }, { x: 1, y: 1 }] },
    roundCap: 12, capResult: 'win', boost: { hp: 3, skill: 20 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['kobold', 'koboldtrapper'],
    then: { win: 'patrol_win', lose: 'patrol_lose' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'Morning in Whisper Woods. Birds are singing like nothing bad ever happened.' },
      { who: 'hollis', text: 'Okay. Today we find Tobin and Juni. Nell, can you find the trail?' },
      { who: 'nell', text: 'The tracks are still fresh. This will be easy.', if: 'fresh' },
      { who: 'pim', text: 'I brought Gran\'s torch. And her bread. Mostly the bread.', if: 'torch' },
      { who: 'nell', text: 'I\'ll try. Help me look, {name}.' },
    ],
    nextIf: [{ if: 'fresh', go: 'track_fresh' }],
    next: 'track',
  },
  track: { check: { skill: 'track', help: 'nell', label: 'Follow the goblin tracks', great: 'track_great', ok: 'track_ok', miss: 'track_miss' } },
  track_fresh: { check: { skill: 'track', help: 'nell', label: 'Follow the goblin tracks', bonus: 10, bonusWhy: 'The trail is still fresh!', great: 'track_great', ok: 'track_ok', miss: 'track_miss' } },
  track_great: {
    lines: [
      { who: 'nell', text: 'Look! Little claw prints. And there, tied on that branch...' },
      { who: 'hollis', text: 'A piece of string! Juni always has string in her pockets!' },
      { who: 'pim', text: 'She\'s leaving us a trail. Juni is SO smart.' },
    ],
    set: { string: true },
    next: 'snares',
  },
  track_ok: {
    lines: [
      { who: 'nell', text: 'Claw prints, and two long scrape lines. They went this way.' },
      { who: 'hollis', text: 'Then that\'s our way too. Come on!' },
    ],
    next: 'snares',
  },
  track_miss: {
    lines: [
      { who: 'nell', text: 'Hmm. The tracks just... stop. I don\'t know where they went.' },
      { who: 'narrator', text: 'The kids stand very still. Then, far away, a voice yells.' },
      { who: 'tobin', text: 'I\'M OVER HEEEERE! PUT ME DOWN, YOU STINKY LIZARDS!' },
      { who: 'hollis', text: 'Ha! Tobin is the loudest kid in Millbrook. That way!' },
    ],
    next: 'snares',
  },
  snares: {
    lines: [
      { who: 'narrator', text: 'The trail goes into tall grass. Something about it looks wrong.' },
      { who: 'pim', text: 'Wait. Everybody stop. I read about this. Kobolds hide rope loops in the grass to catch things.' },
    ],
    check: { skill: 'notice', help: 'pim', label: 'Spot the hidden snares', great: 'snare_spot', ok: 'snare_spot', miss: 'snare_oops' },
  },
  snare_spot: {
    lines: [
      { who: 'hero', text: 'There! And there! And... there\'s a lot of them.' },
      { who: 'narrator', text: 'The kids tiptoe around every single loop. Nobody gets caught.' },
    ],
    next: 'sniffle',
  },
  snare_oops: {
    hurt: 1,
    lines: [
      { who: 'narrator', text: 'SNAP! A rope grabs {name}\'s ankle, and WHOOSH! Up into the air, upside down!' },
      { who: 'hollis', text: 'Hang on! I\'ve got you!' },
      { who: 'nell', text: 'You look like a bat. A bat with a bucket.' },
      { who: 'narrator', text: 'Nell cuts the rope and {name} lands in a big pile of leaves. Ouch, but okay.' },
    ],
    next: 'sniffle',
  },
  sniffle: {
    lines: [
      { who: 'narrator', text: 'Past the grass, something is crying. A little kobold is caught in one of the snares, hanging by its tail.' },
      { who: 'sniffle', text: 'Achoo! Please don\'t bonk me! I\'m just Sniffle. I sweep the boss\'s camp. I set this trap wrong and it got ME.' },
      { who: 'hollis', text: 'It\'s one of THEM. The ones who took our friends.' },
      { who: 'pim', text: 'He\'s just little. And he\'s really stuck.' },
    ],
    choices: [
      { label: 'Help him down', go: 'sniffle_help' },
      { label: 'Leave him', go: 'sniffle_leave' },
    ],
  },
  sniffle_help: {
    lines: [
      { who: 'narrator', text: '{name} lifts Sniffle up, and Nell unties the rope. Sniffle lands on his feet and stares at them.' },
      { who: 'sniffle', text: 'You... helped me? Nobody ever helps Sniffle. The boss just yells.' },
      { who: 'sniffle', text: 'I know where they took your friends. The big boss is Grubjaw. And here\'s a secret: when Grubjaw LAUGHS, he\'s about to swing his big flail. Get out of the way!' },
      { who: 'hero', text: 'Do you want to come with us, Sniffle?' },
      { who: 'sniffle', text: 'Really? Achoo! Yes! Sniffle helps!' },
    ],
    join: 'sniffle',
    set: { sniffle: true, laugh: true },
    next: 'stream',
  },
  sniffle_leave: {
    lines: [
      { who: 'sniffle', text: 'Okay. Bye. I will just... hang here. Achoo.' },
      { who: 'nell', text: 'Someone from his camp will find him. Let\'s keep going.' },
    ],
    next: 'stream',
  },
  stream: {
    lines: [
      { who: 'narrator', text: 'The trail stops at a fast, splashy stream. There\'s a skinny log across it, and big wet rocks a little way down.' },
      { who: 'pim', text: 'Which way do we cross?' },
    ],
    choices: [
      { label: 'Walk across the log', go: 'stream_log' },
      { label: 'Climb over the rocks', go: 'stream_rocks' },
    ],
  },
  stream_log: { check: { skill: 'brave', help: 'hollis', label: 'Walk the skinny log (don\'t look down!)', great: 'stream_ok', ok: 'stream_ok', miss: 'stream_splash', disaster: 'stream_oops' } },
  stream_rocks: { check: { skill: 'climb', help: 'hollis', label: 'Climb over the slippery rocks', great: 'stream_ok', ok: 'stream_ok', miss: 'stream_splash', disaster: 'stream_oops' } },
  stream_ok: {
    lines: [{ who: 'narrator', text: 'One careful step at a time, {name} makes it across. Everybody follows, and nobody falls in.' }],
    next: 'patrol_spot',
  },
  stream_splash: {
    hurt: 1,
    lines: [
      { who: 'narrator', text: 'SPLOOSH! {name} slips right into the stream. It is very, very cold.' },
      { who: 'hollis', text: 'Grab my broom!' },
      { who: 'narrator', text: 'Hollis pulls {name} out, dripping like a wet puppy. Water pours out of the bucket helmet.' },
    ],
    next: 'patrol_spot',
  },
  // An Oops roll: a funny setback, never the end of the adventure.
  stream_oops: {
    hurt: 1,
    lines: [
      { who: 'narrator', text: 'OOPS! {name} slips, spins, and goes in with a giant SPLOOSH. The bucket helmet pops off and floats away downstream like a little boat.' },
      { who: 'nell', text: 'I\'ve got it! I\'ve got it! ...There\'s a frog in it now.' },
      { who: 'narrator', text: 'The frog looks at {name}. Ribbit. It hops out. The bucket goes back on, a little bit slimy.' },
    ],
    next: 'patrol_spot',
  },
  patrol_spot: {
    lines: [
      { who: 'narrator', text: 'Up ahead, smoke. A kobold patrol is sitting around a little campfire, cooking something that smells like old socks.' },
      { who: 'sniffle', text: 'That\'s the patrol. They\'re grumpy before lunch.', if: 'party:sniffle' },
      { who: 'nell', text: 'We could sneak past them. Or...' },
      { who: 'hollis', text: 'Or we CHARGE!' },
    ],
    choices: [
      { label: 'Sneak past', go: 'patrol_sneak' },
      { label: 'Charge!', go: 'fight:patrol' },
    ],
  },
  patrol_sneak: { check: { skill: 'sneak', help: 'nell', label: 'Sneak past the kobold patrol', great: 'sneak_great', ok: 'sneak_ok', miss: 'sneak_miss' } },
  sneak_great: {
    xpKey: 'patrol',
    xp: 5, xpWhy: 'You sneaked past the patrol! That counts as winning!',
    lines: [
      { who: 'narrator', text: 'Quiet as mice, the kids creep right behind the kobolds. Close enough to hear them talking.' },
      { who: 'narrator', text: '"Don\'t let the boss see the fire-pot," one kobold whispers. "He\'s SO scared of fire. He screams like a baby."' },
      { who: 'pim', text: '(whispering) Grubjaw is scared of fire! Remember that!' },
      { who: 'nell', text: '(whispering) Look. One of them has a whistle on its belt...' },
    ],
    set: { fire: true },
    choices: [
      { label: 'Grab the whistle', go: 'whistle' },
      { label: 'Leave it', go: 'hill' },
    ],
  },
  whistle: { check: { skill: 'fingers', help: 'nell', label: 'Snatch the whistle without getting caught', great: 'whistle_got', ok: 'whistle_got', miss: 'sneak_miss' } },
  whistle_got: {
    lines: [
      { who: 'narrator', text: 'Snip! The whistle slides right off the kobold\'s belt. It doesn\'t notice a thing.' },
      { who: 'nell', text: 'Nice fingers! Kobold whistles open kobold doors. That could be useful.' },
    ],
    set: { whistle: true },
    next: 'hill',
  },
  sneak_ok: {
    xpKey: 'patrol',
    xp: 5, xpWhy: 'You sneaked past the patrol! That counts as winning!',
    lines: [
      { who: 'narrator', text: 'The kids creep past. On the way, they hear one kobold say, "The boss hates fire. Keep the fire-pot away from him!"' },
      { who: 'pim', text: '(whispering) Grubjaw is scared of fire. Good to know.' },
    ],
    set: { fire: true },
    next: 'hill',
  },
  sneak_miss: {
    lines: [
      { who: 'narrator', text: 'CRACK! A twig snaps under someone\'s foot. Every kobold head turns at once.' },
      { who: 'narrator', text: '"YIP! INTRUDERS!"' },
    ],
    next: 'fight:patrol',
  },
  patrol_win: {
    lines: [
      { who: 'narrator', text: 'The last kobold runs off, yelling over its shoulder.' },
      { who: 'narrator', text: '"You\'ll be sorry! The boss will get you! Unless you have FIRE... wait, don\'t tell them that!"' },
      { who: 'pim', text: 'Grubjaw is scared of fire? That\'s a really good clue.' },
    ],
    set: { fire: true },
    next: 'hill',
  },
  patrol_lose: {
    lines: [{ who: 'narrator', text: 'The kobolds knock everybody down and start tying them up with their snare rope.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:patrol', retry: true },
      { label: 'See what happens', go: 'patrol_see' },
    ],
  },
  patrol_see: {
    lines: [
      { who: 'narrator', text: 'The kobolds tie the kids in one big bundle and go back to their lunch.' },
      { who: 'sniffle', text: 'Psst. Sniffle is good at knots. Hold still.', if: 'party:sniffle' },
      { who: 'nell', text: 'Kobolds are bad at knots. Hold still, I can wiggle out.', ifNot: 'party:sniffle' },
      { who: 'narrator', text: 'A minute later, the kids are free and tiptoeing away. The kobolds are too busy eating to notice.' },
    ],
    next: 'hill',
  },
  hill: {
    lines: [
      { who: 'narrator', text: 'By sunset, the trail ends at a big grassy hill. There\'s a little round door in the side of it, just goblin-sized.' },
      { who: 'nell', text: 'It\'s the hill from the map!' },
      { who: 'hollis', text: 'Juni\'s string goes right up to the door.', if: 'string' },
      { who: 'pim', text: 'A goblin warren. Tunnels, all under the hill. That\'s where they took them.' },
      { who: 'hollis', text: 'We go in tomorrow. Tonight, we rest.' },
    ],
    levelUp: true,
    next: 'night',
  },
  night: {
    lines: [
      { who: 'narrator', text: 'Under the hill, very faint, something is laughing. HA HA HA.' },
      { who: 'sniffle', text: 'That\'s him. That\'s Grubjaw. Achoo.', if: 'party:sniffle' },
      { who: 'nell', text: 'We\'re coming, Tobin. We\'re coming, Juni.' },
    ],
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 3', text: 'Next: Chapter 4, The Warren. Into the goblin tunnels!' },
};

export default { SCENES, FIGHTS, TEXT, LEARNED };
