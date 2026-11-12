// Chapter 20: Starpeak. The end of Book Four. A boss with three ways to win: knock down the Dragon
// Catcher, talk Sir Bartholomew out of it, or open the cage's three locks. Then the Starmother lands,
// the knight becomes the Keeper of Starpeak, {dragon} learns its First flame, and it stays in Millbrook.
// Text uses {name} for the hero's name and {dragon} for the dragon's name. No em dashes.
import CH19 from './ch19.js';

export const LEARNED = { ...CH19.LEARNED };

export const TEXT = {
  ...CH19.TEXT,
  TEACH: { ...CH19.TEXT.TEACH, monsterturn: 'CLANK! WHIRR! (The Dragon Catcher stomps through the snow.)' },
  WIND_TEACH: 'Wind! Anyone who ends a turn on the windy snow gets blown one square. The Dragon Catcher is too heavy to blow away.',
  TALK_TARGET: 'Sir Bartholomew',
  TALK_WHO: 'catcher',
  CALM_LINES: [
    'Talk? Heroes don\'t TALK! Heroes CATCH things!',
    'Real heroes protect dragons? Nobody ever told me that part of the story.',
    'Sir Gwen... saved a village FROM a dragon. But she never caught one. Hmm.',
    'You\'re right. You\'re all right. I\'ve been a very silly knight. I\'ll stop.',
  ],
  TALK_FAIL: 'La la la! I can\'t hear you over how HEROIC I am!',
  FIX_LINES: [
    'Hey! Stop fiddling with my cage! That\'s MY cage!',
    'How do you know how to do that? Only the girl who built it knew how!',
    'NO! The last lock! My dragon story!',
  ],
  FIX_FAIL: 'Ha! Three locks! Nobody can open three locks!',
  WINDUP: 'Whirrrr... (The Catcher lifts its big iron foot.)',
  WINDUP_WARN: 'Whirrrr... STOMP... (The Catcher lifts its big iron foot!)',
  WARN_LINE: 'Big foot coming! Get out of the red squares!',
  SWEEP: 'STOMP!',
  SWEEP_HIT: 'BOOM! Snow everywhere!',
  SWEEP_MISS: 'STOMP! ...Missed! Hold STILL!',
  CHATTER: {
    ...CH19.TEXT.CHATTER,
    catcher: ['CLANK. WHIRR.', 'My dragon story!', 'For the Hall of Heroes!', 'Behold, the Dragon Catcher!'],
    h1: ['Sniff. CLANK.', 'Grrr-tick!'], h2: ['Arooo-clank!', 'Grrr!'],
  },
};

export const FIGHTS = {
  catcher: {
    id: 'ch20-catcher',
    xpKey: 'catcher',
    xp: 12, floor: 9, xpWhy: 'You beat the Dragon Catcher!',
    mode: 'hp',
    map: [
      'rrssssssssrr',
      'rsssssssssss',
      'ss}}}}}}}}ss',
      'ssssssdsssss',
      'ssrsssssssrs',
      'ss{{{{{{{{ss',
      'ssssssssssss',
      'rsssssssssss',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 6, y: 7 },
      { id: 'catcher', monster: 'catcher', name: 'The Dragon Catcher', x: 6, y: 1 },
      { id: 'h1', monster: 'hound', name: 'Clockwork hound', x: 3, y: 1 },
      { id: 'h2', monster: 'hound', name: 'Clockwork hound', x: 9, y: 1 },
    ],
    team: { from: 'picked', exclude: ['inkwing'], spots: [{ x: 4, y: 7 }, { x: 8, y: 7 }, { x: 6, y: 6 }] },
    warn: true, bossEnds: true,
    calm: { max: 4, bonusIf: { knightSad: 10, starBook: 10, 'team:dot': 10, dotSaw: 5, queenFriend: 5 }, startIf: { talkedFirst: 1 } },
    fix: { max: 3, target: 'catcher', bonusIf: { 'team:wren': 15, 'team:dot': 10, 'team:juni': 10, wrenTip: 5, cageMark: 5 },
      label: 'Open a lock', hint: 'Walk next to the Dragon Catcher to open the cage locks', done: 'open', roll: 'You open a lock', yay: 'Click!', icon: 'hammer' },
    roundCap: 18, capResult: 'win', boost: { hp: 8, skill: 40 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['catcher', 'hound'],
    events: [{ round: 0, type: 'say', lines: [
      { who: 'pim', text: 'Three ways to win! FIGHT the Catcher. TALK to Sir Bartholomew with the Talk button. Or walk right up to it and tap Open a lock.' },
      { who: 'dot', text: 'Open all three locks and {dragon} is free! Watch out for its big foot!', if: 'team:dot' },
      { who: 'juni', text: 'Open all three locks and {dragon} is free! Watch out for its big foot!', ifNot: 'team:dot' },
    ] }],
    then: { win: 'beat', calm: 'calmed', fixed: 'freed', lose: 'lost' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'By morning the storm is gone. The kids climb the last steep path, and then there is no more mountain above them. Only sky.' },
      { who: 'narrator', text: 'The top of Starpeak is flat and white, with the whole world spread out below. You can see Gearwick. You can almost see Millbrook.' },
      { who: 'narrator', text: 'And in the middle of the snow stands a giant iron machine with long arms and big flat feet. In the seat on top: Sir Bartholomew.' },
      { who: 'narrator', text: 'Hanging from one arm is the cage, with three big locks. Inside, {dragon} is glowing blue.' },
      { who: 'sirbart', text: 'Behold! The DRAGON CATCHER! Built from the finest plans money can buy! Now nobody can take my dragon!' },
      { who: 'dot', text: '(whispering) He bought those plans from Wren too. Everything he has, she built first.' },
    ],
    meet: ['catcher', 'sirbart'],
    next: 'team',
  },
  team: {
    lines: [{ who: 'narrator', text: 'The Catcher takes one giant step. CLANK. Who stands with you?' }],
    pickTeam: { size: 3, exclude: ['inkwing'] },
    next: 'choose',
  },
  choose: {
    lines: [{ who: 'sirbart', text: 'Well? Have you come to watch me become a HERO?' }],
    set: { talkedFirst: false },
    choices: [
      { label: 'We want to talk', go: 'talk_first' },
      { label: 'Let our dragon go!', go: 'fight_start' },
    ],
  },
  talk_first: {
    lines: [{ who: 'hero', text: 'Sir Bartholomew, you want a dragon story. But the best dragon stories aren\'t about catching dragons. They\'re about helping them.' }],
    check: { skill: 'talk', label: 'Talk to Sir Bartholomew', help: 'dot', bonusIf: { knightSad: 10, starBook: 10, 'team:dot': 10, dotSaw: 5 }, bonusWhy: 'You know his story. That helps!',
      great: 'talk_peace', ok: 'talk_some', miss: 'talk_no' },
  },
  talk_peace: {
    xpKey: 'catcher',
    xp: 12, xpFloor: 9, xpWhy: 'You talked the knight down! That counts as winning.',
    lines: [
      { who: 'sirbart', text: 'Helping them? But... the Hall of Heroes...' },
      { who: 'dot', text: 'Sir, you taught me that a knight protects things that can\'t protect themselves. You said it on my very first day.' },
      { who: 'sirbart', text: 'I did say that. I did. Oh, Dot. I forgot my own best words.' },
      { who: 'narrator', text: 'The Dragon Catcher lowers its arm, slowly, all the way down to the snow.' },
    ],
    set: { peaceful4: true },
    next: 'unlock',
  },
  talk_some: {
    lines: [
      { who: 'sirbart', text: 'Helping? HELPING? No! Heroes catch things! Catcher, STOMP!' },
      { who: 'narrator', text: 'He\'s still shouting, but he heard you. One calm bubble is already full.' },
    ],
    set: { talkedFirst: true },
    next: 'fight:catcher',
  },
  talk_no: {
    lines: [{ who: 'sirbart', text: 'Speeches are for AFTER the dragon is caught! Catcher, STOMP!' }],
    next: 'fight:catcher',
  },
  fight_start: {
    lines: [
      { who: 'sirbart', text: 'Never! Catcher, attack! Hounds, SNIFF!' },
      { who: 'narrator', text: 'The Catcher\'s eyes glow red. Its gears spin. Two clockwork hounds jump down from its shoulders.' },
    ],
    next: 'fight:catcher',
  },
  beat: {
    lines: [
      { who: 'narrator', text: 'The Dragon Catcher wobbles. Creaks. Then it sits down in the snow with a CRASH, and its eyes go dark.' },
      { who: 'narrator', text: 'Sir Bartholomew tumbles out of the seat into a snowbank. Only his feet stick out. They wiggle.' },
      { who: 'narrator', text: 'Nobody is hurt.' },
    ],
    next: 'unlock',
  },
  calmed: {
    lines: [
      { who: 'narrator', text: 'The Catcher stops stomping. Sir Bartholomew climbs down, very slowly, and takes off his helmet. His face is red, and his eyes are wet.' },
      { who: 'sirbart', text: 'I just wanted to be in the Hall of Heroes. I\'m the only knight with no story.' },
      { who: 'hero', text: 'Then let\'s make a new one. Together.' },
    ],
    set: { peaceful4: true },
    next: 'unlock',
  },
  freed: {
    lines: [
      { who: 'narrator', text: 'Click. Twist. And the frozen lock in the middle... drip, drip, CLICK.' },
      { who: 'narrator', text: 'Inside the cage, {dragon} takes a deep breath and blows. A tiny puff of real fire! The frozen lock melts right open!' },
      { who: 'narrator', text: 'The cage door swings open, and {dragon} flies straight into {name}\'s arms.' },
      { who: 'sirbart', text: 'You... you opened all three? Nobody can open all three!' },
      { who: 'wren', text: 'Somebody can. I built it. I always put the hard lock in the middle.', if: 'team:wren' },
    ],
    set: { dragonFlame: true, freedDragon: true },
    next: 'mother',
  },
  lost: {
    lines: [{ who: 'narrator', text: 'STOMP! STOMP! The kids get pushed all the way back to the edge of the peak.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:catcher', retry: true },
      { label: 'See what happens', go: 'lost_see' },
    ],
  },
  lost_see: {
    lines: [
      { who: 'narrator', text: 'Inside the cage, {dragon} sees its friends fall down in the snow. Its tummy glows. Brighter. BRIGHTER.' },
      { who: 'narrator', text: 'It takes a deep breath and blows. A tiny puff of real fire! It isn\'t enough to melt the lock yet, but the knight jumps in his seat.' },
      { who: 'sirbart', text: 'What? It breathes FIRE? Nobody told me it breathes fire!' },
      { who: 'narrator', text: 'The kids get up. {dragon} is cheering them on from inside the cage. This time, they all try together.' },
    ],
    set: { talkedFirst: true, dragonFlame: true },
    next: 'fight:catcher',
  },
  unlock: {
    lines: [
      { who: 'narrator', text: 'The kids run to the cage. One lock, two locks... but the middle one is frozen solid.' },
      { who: 'narrator', text: 'Inside, {dragon} takes a deep breath. Its tummy glows orange, then gold. And then...' },
      { who: 'narrator', text: 'FWOOSH. A tiny puff of real fire! The frozen lock melts right open.' },
      { who: 'pim', text: '{dragon} breathed FIRE! Its first flame!' },
      { who: 'narrator', text: '{dragon} flies out of the cage and straight into {name}\'s arms.' },
    ],
    set: { dragonFlame: true },
    next: 'mother',
  },
  // ----- the Starmother -----
  mother: {
    lines: [
      { who: 'narrator', text: 'Then the sky goes dark. A huge shadow falls over the whole peak. Wind roars. Everybody looks up.' },
      { who: 'narrator', text: 'A dragon lands in the snow. She is enormous, silver and blue, with stars on her wings. The ground shakes. Nobody moves.' },
      { who: 'dragon', text: 'Wheeeeee-ooo!' },
      { who: 'starmother', text: 'Wheeeeee-ooo.' },
      { who: 'narrator', text: '{dragon} flies out of {name}\'s arms and lands on its mother\'s nose. She closes her huge eyes and curls her long neck all the way around her baby.' },
      { who: 'nell', text: '(whispering) She found it. After all this time.' },
      { who: 'narrator', text: 'Then the Starmother opens her eyes and looks at the kids. One by one. And she bows her great head, all the way down to the snow.' },
    ],
    meet: ['starmother'],
    set: { metMother: true },
    next: 'stay',
  },
  stay: {
    lines: [
      { who: 'narrator', text: '{dragon} looks at its mother. Then it looks at {name}. Then at its mother again. It whistles, soft and worried.' },
      { who: 'narrator', text: 'The Starmother listens to her baby for a long time. Then she makes a deep, gentle sound, like a laugh.' },
      { who: 'narrator', text: 'She nudges {dragon} back toward {name}. She taps the moon, low in the sky, with one claw. Then she taps her own chest.' },
      { who: 'pim', text: 'I think... I think she means {dragon} can stay with us. Until it\'s grown. And she\'ll come visit. Every full moon.' },
      { who: 'dragon', text: 'MEW! MEW MEW MEW!' },
      { who: 'hollis', text: 'It\'s STAYING! {dragon} is STAYING!' },
    ],
    set: { dragonStays: true, dragonBig: true },
    next: 'keeper',
  },
  keeper: {
    lines: [
      { who: 'sirbart', text: 'I... I almost took a baby from its mother. For a story. What kind of knight does that?' },
      { who: 'dot', text: 'A knight who can still do the right thing, sir.' },
      { who: 'narrator', text: 'The Starmother looks at the knight for a long, long time. Then she lowers one wing, like a ramp, to the dragon nests behind her.' },
      { who: 'hero', text: 'Sir Bartholomew. The dragons up here need someone to keep bad people away. Someone brave. Someone with a very shiny horse.' },
      { who: 'sirbart', text: 'A Keeper of Starpeak? A knight who PROTECTS dragons? That\'s... that\'s the best story I\'ve ever heard.' },
      { who: 'sirbart', text: 'Dot! You\'ll be my first student. If you\'ll still have me as your knight.' },
      { who: 'dot', text: 'I will, sir. But I\'m coming to visit {dragon} too.' },
    ],
    meet: ['shinyhorse'],
    set: { starDone: true, keeper: true },
    next: 'home',
  },
  // ----- home -----
  home: {
    place: 'millbrook',
    lines: [
      { who: 'narrator', text: 'The Starmother carries everyone home on her back, flying over the mountains, over Gearwick, over the woods, all the way to Millbrook.' },
      { who: 'narrator', text: 'And Millbrook throws a party. Of course it does. The biggest one yet.' },
      { who: 'narrator', text: 'Gran, Captain Ward, the baker, Old Tock, Wren, Bramble, Queen Granite (who brings spoons), and even Sir Bartholomew and Dot.' },
      { who: 'baker', text: 'Dragon-toasted pie for everyone!', if: 'piesDone' },
      { who: 'bramble', text: 'Hmph. A dragon in the village. I suppose that\'s better than goblins. Marginally.' },
      { who: 'mossback', text: 'Great-Aunt Granite came! She brought a present for Gran. It\'s a spoon. She has so many spoons.', if: 'party:mossback' },
      { who: 'wren', text: 'I\'m building {dragon} a clockwork ball to chase. It will NOT have any locks on it. I promise.' },
      { who: 'dragon', text: 'Mew! (It is much bigger now. It still sleeps in a pie tin. A very big pie tin.)' },
    ],
    meet: ['bramble'],
    heal: true,
    levelUp: true,
    next: 'moon',
  },
  moon: {
    lines: [
      { who: 'narrator', text: 'That night is the first full moon. Everyone stays up late in Gran\'s garden.' },
      { who: 'narrator', text: 'And at midnight, a huge silver shape glides down out of the stars and lands softly in the meadow.' },
      { who: 'narrator', text: '{dragon} runs to its mother, and they curl up together under the moon. The kids fall asleep right there in the grass, all in a pile.' },
      { who: 'narrator', text: 'Somewhere far away, on a very tall mountain, a knight polishes his horse and tells a young squire the best dragon story ever told.' },
    ],
    next: 'end',
  },
  end: {
    end: true, party: true, book: 4, extraFaces: ['dot', 'dragon', 'starmother'],
    title: 'The End of Book Four',
    text: 'You took {dragon} all the way home, and {dragon} chose to stay. The adventures of the Heroes of Millbrook will go on in a future book!',
  },
};

export default { SCENES, FIGHTS, TEXT, LEARNED };
