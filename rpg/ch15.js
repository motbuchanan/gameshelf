// Chapter 15: The Silver Mask. The end of Book Three. A boss with three ways to win: fight the clockwork beast,
// talk to Wren, or fix the beast's three glowing gears. Off comes the mask, making it right, Wren joins
// (if you ask), a party in Millbrook, and the Starstone hatches: a baby dragon.
// Text uses {name} for the hero's name. No em dashes.
import CH14 from './ch14.js';
import CH11 from './ch11.js';

export const TEXT = {
  ...CH14.TEXT,
  TEACH: { ...CH14.TEXT.TEACH, monsterturn: 'CLANK! CLANK! (The clockwork beast stomps closer.)' },
  TALK_TARGET: 'Wren',
  TALK_WHO: 'beast',
  CALM_LINES: [
    'Go away! You don\'t know anything about me!',
    'You... read my diary? Nobody ever reads anything I write.',
    'Old Tock misses me? He said that? I thought everybody forgot about me.',
    'I just... I just wanted somebody to play with. Okay. Okay. I\'ll stop.',
  ],
  TALK_FAIL: 'La la la, I can\'t hear you! Beast, STOMP!',
  FIX_LINES: [
    'Hey! Get away from my beast\'s gears!',
    'How are you DOING that? That\'s... that\'s actually a really good fix.',
    'You fixed all of them? Nobody can fix my machines but me...',
  ],
  FIX_FAIL: 'Ha! Those gears are tricky. Only I know how they work!',
  SUMMON: 'Mice! Help me!',
  WINDUP: 'Creeeeak... (The beast lifts one giant foot.)',
  WINDUP_WARN: 'Creeeeak... STOMP... (The beast lifts one giant foot!)',
  WARN_LINE: 'It\'s lifting its big foot! Get out of the red squares!',
  SWEEP: 'STOMP!',
  SWEEP_HIT: 'BOOM! Everybody bounces!',
  SWEEP_MISS: 'STOMP! ...Hey! Hold still!',
  CHATTER: {
    ...CH14.TEXT.CHATTER,
    beast: ['CLANK. CLANK.', 'Get out of my workshop!', 'WHIRRRR. CLANK.', 'The star is MINE!'],
    sc1: ['Squeak!', 'Tick!'], sc2: ['Zoom!', 'Squeak!'], sc3: ['Tick tick!', 'Squeak!'], sc4: ['Whirr!', 'Zip!'],
    sc5: ['Squeak!', 'Zoom!'], sc6: ['Tick!', 'Squeak!'], sc7: ['Zip!', 'Tick!'], sc8: ['Squeak!', 'Whirr!'],
  },
};

export const FIGHTS = {
  beast: {
    id: 'ch15-beast',
    xpKey: 'mask',
    xp: 12, floor: 7, xpWhy: 'You beat the clockwork beast!',
    mode: 'hp',
    map: [
      '#############',
      '#___________#',
      '#_c_______c_#',
      '#___________#',
      '#>>>>___<<<<#',
      '#___________#',
      '#___c___c___#',
      '#___________#',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 6, y: 7 },
      { id: 'beast', monster: 'beast', name: 'Wren and her beast', x: 6, y: 1 },
      { id: 'm1', monster: 'mouse', name: 'Windup mouse', x: 3, y: 2 },
      { id: 'm2', monster: 'mouse', name: 'Windup mouse', x: 9, y: 2 },
      { id: 'w1', monster: 'bird', name: 'Clockwork bird', x: 2, y: 1 },
      { id: 'w2', monster: 'bird', name: 'Clockwork bird', x: 10, y: 1 },
    ],
    team: { from: 'picked', exclude: ['inkwing', 'wren'], spots: [{ x: 4, y: 7 }, { x: 8, y: 7 }, { x: 6, y: 6 }] },
    warn: true,
    calm: { max: 4, bonusIf: { diary2: 10, toymaker: 10, tockNote: 5, knocked: 5, mouseDoor: 5, brassGear: 5, 'team:bolt': 10 }, startIf: { talkedFirst: 1 } },
    fix: { max: 3, target: 'beast', bonusIf: { 'team:bolt': 10, 'team:juni': 10, lockToys: 5, groveMap: 5 } },
    summonBoost: 30, bossEnds: true,
    roundCap: 18, capResult: 'win', boost: { hp: 4, skill: 35 },
    taught: CH11.LEARNED, skipHeroFirst: true,
    meets: ['beast', 'mouse', 'bird'],
    events: [{ round: 0, type: 'say', lines: [
      { who: 'pim', text: 'Three ways to win! FIGHT the beast. TALK to Wren with the Talk button. Or walk right up to the beast and tap Fix a gear.' },
      { who: 'juni', text: 'Fix all three glowing gears and it will sit down. Watch out for its big foot!' },
    ] }],
    then: { win: 'beat', calm: 'calmed', fixed: 'fixed', lose: 'lost' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'silvermask', text: 'You shouldn\'t be here. Nobody is allowed in my workshop!' },
      { who: 'silvermask', text: 'Leave the star alone. It\'s MINE. It\'s going to wake up my friends. Real friends who never leave!' },
      { who: 'nell', text: '(whispering) That voice. It\'s a kid. Just a kid.' },
      { who: 'pim', text: 'We read your diary, Wren. We know.', if: 'diary2' },
    ],
    meet: ['beast', 'silvermask'],
    next: 'team',
  },
  team: {
    lines: [{ who: 'narrator', text: 'The beast takes a giant step. CLANK. Who stands with you?' }],
    pickTeam: { size: 3, exclude: ['inkwing', 'wren'] },
    next: 'choose',
  },
  choose: {
    lines: [{ who: 'silvermask', text: 'Well? Are you leaving, or not?' }],
    set: { talkedFirst: false },   // Bramble's fight used the same flag: start fresh
    choices: [
      { label: 'We want to talk', go: 'talk_first' },
      { label: 'We\'ll stop you!', go: 'fight_start' },
    ],
  },
  talk_first: {
    lines: [{ who: 'hero', text: 'Wren, wait. We didn\'t come to fight. We came because Old Tock misses you. And because we want to be your friends.' }],
    check: { skill: 'talk', help: 'nell', label: 'Talk to Wren', bonusIf: { diary2: 10, toymaker: 10, tockNote: 5, knocked: 5, mouseDoor: 5, brassGear: 5 }, bonusWhy: 'You know her story. That helps!',
      great: 'talk_peace', ok: 'talk_some', miss: 'talk_no' },
  },
  talk_peace: {
    xpKey: 'mask',
    xp: 12, xpFloor: 7, xpWhy: 'You talked Wren down! That counts as winning.',
    lines: [
      { who: 'silvermask', text: 'My... friends? You want to be my friends? Why? Nobody ever wants to.' },
      { who: 'hero', text: 'Because you build amazing things. And because nobody should be alone.' },
      { who: 'narrator', text: 'The beast lowers its head, slowly, all the way to the floor. The silver mask climbs down.' },
    ],
    set: { peaceful3: true },
    next: 'unmask',
  },
  talk_some: {
    lines: [
      { who: 'silvermask', text: 'Old Tock... misses me? No. No! You\'re just saying that! Beast, get them!' },
      { who: 'narrator', text: 'She\'s still upset, but she heard you. One calm bubble is already full.' },
    ],
    set: { talkedFirst: true },
    next: 'fight:beast',
  },
  talk_no: {
    lines: [{ who: 'silvermask', text: 'La la la, not listening! Beast, show them out!' }],
    next: 'fight:beast',
  },
  fight_start: {
    lines: [
      { who: 'silvermask', text: 'Then I\'ll make you leave! Beast, STOMP!' },
      { who: 'narrator', text: 'The giant beast\'s eyes glow red. Its gears spin faster. WHIRRRRR.' },
    ],
    next: 'fight:beast',
  },
  beat: {
    lines: [
      { who: 'narrator', text: 'The beast wobbles. Creaks. Then it sits down with a CRASH that shakes the whole workshop. Its eyes go dark.' },
      { who: 'narrator', text: 'The masked kid tumbles off its head and lands on the soft straw. She sits up and rubs her head.' },
      { who: 'bolt', text: 'Woof! (Bolt runs over and licks the silver mask.)', if: 'team:bolt' },
      { who: 'narrator', text: 'Nobody is hurt.' },
    ],
    next: 'unmask',
  },
  calmed: {
    lines: [
      { who: 'narrator', text: 'The beast stops stomping. It sits down, very gently, like a giant brass puppy.' },
      { who: 'silvermask', text: 'You kept talking to me. Even when I was being mean. Why?' },
      { who: 'hero', text: 'Because you\'re not mean. You\'re lonely. We know what that\'s like.' },
    ],
    set: { peaceful3: true },
    next: 'unmask',
  },
  fixed: {
    lines: [
      { who: 'narrator', text: 'Click. Click. CLICK. All three gears stop glowing and spin smooth and slow. The beast hums, happy, and sits down.' },
      { who: 'silvermask', text: 'You FIXED it? Nobody fixes my machines. Nobody even... nobody even looks at them.' },
      { who: 'juni', text: 'They\'re really good machines. I mean it.' },
    ],
    set: { fixedBeast: true },
    next: 'unmask',
  },
  lost: {
    lines: [{ who: 'narrator', text: 'STOMP! STOMP! The kids get pushed all the way back to the straw pile by the chute.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:beast', retry: true },
      { label: 'See what happens', go: 'lost_see' },
    ],
  },
  lost_see: {
    lines: [
      { who: 'narrator', text: 'The beast stands over the kids. Then... it stops. The masked kid stares down at them for a long time.' },
      { who: 'silvermask', text: 'Why aren\'t you running away? Everybody always runs away from me.' },
      { who: 'nell', text: 'Because we\'re not scared of you. We came to find you.' },
      { who: 'narrator', text: 'Something has changed. The kids stand up and try again. This time the masked kid is already listening a little.' },
    ],
    set: { talkedFirst: true },
    next: 'fight:beast',
  },
  // ----- off comes the mask -----
  unmask: {
    lines: [
      { who: 'narrator', text: 'Slowly, the small figure takes off the silver mask.' },
      { who: 'wren', text: 'It\'s a welding mask. For working with hot metal. I just... never took it off.' },
      { who: 'narrator', text: 'Underneath is a kid. Freckles, messy hair, and grease on her nose. Not much older than you.' },
      { who: 'wren', text: 'I\'m Wren. Nobody ever wanted to play with me. So I built friends who had to.' },
      { who: 'wren', text: 'I made the owls for Bramble\'s tower. I told her how to scare your town. I wanted the woods empty, so nobody would see me dig up the star.' },
      { who: 'wren', text: 'I\'m sorry. I\'m really, really sorry.' },
      { who: 'pim', text: 'The notes signed W. The gear on the library cards. The stamp inside the owls. It was you the whole time.', if: ['owlStamp', 'libraryGear'] },
      { who: 'pim', text: 'The notes signed W. The stamp inside the owls. It was you the whole time.', if: 'owlStamp', ifNot: 'libraryGear' },
      { who: 'pim', text: 'The notes signed W. It was you the whole time.', if: 'noteW', ifNot: 'owlStamp' },
      { who: 'wren', text: 'I asked the goblins to find the star for me, too. "Bring me anything that glows." I paid them in gears. They just brought me spoons. SO many spoons.', if: 'wNote0' },
      { who: 'hero', text: 'Is this yours? Bramble found it on her stairs.', if: 'item:brassgear' },
      { who: 'wren', text: 'My lucky gear! It\'s the first one I ever made. I thought it was gone forever. You... you kept it safe for me?', if: 'item:brassgear' },
      { who: 'wren', text: 'And you found Pip\'s house. Nobody was ever supposed to find Pip\'s house. ...I\'m kind of glad you did.', if: 'mouseDoor' },
    ],
    meet: ['wren'],
    set: { maskDone: true, wrenName: true },
    next: 'right',
  },
  right: {
    lines: [
      { who: 'juni', text: 'You don\'t need a star to make friends, Wren. You need someone to show up.' },
      { who: 'nell', text: 'And we showed up.' },
      { who: 'narrator', text: 'Wren starts crying. Then laughing. Then both at the same time.' },
      { who: 'wren', text: 'I\'ll give everything back. Every shiny thing my mice took. I promise.' },
      { who: 'toymaker', text: 'Wren? Wren! Is that really you?' },
      { who: 'narrator', text: 'It\'s Old Tock, puffing down the chute stairs with a lantern.' },
      { who: 'toymaker', text: 'My workbench is still yours. I need the best tinker in Gearwick to help me fix toys. Will you come?' },
      { who: 'wren', text: '...Yes. Yes, I will.' },
    ],
    meet: ['toymaker'],
    next: 'ask',
  },
  ask: {
    lines: [{ who: 'wren', text: 'Um. {name}? Can I... can I still see you? Sometimes?' }],
    choices: [
      { label: 'Ask Wren to join your team', go: 'join_yes' },
      { label: 'Say "Come visit us anytime!"', go: 'join_later' },
    ],
  },
  join_yes: {
    lines: [
      { who: 'hero', text: 'Wren, do you want to join our team? We go on adventures. We could really use someone who can fix things.' },
      { who: 'wren', text: 'Really? REALLY? Yes! I can fix stuff in fights. I can jam a clockwork monster with my wrench. I can tune up everyone\'s armor!' },
      { who: 'narrator', text: 'Wren joins your team! She fixes things, and she jams clockwork monsters with her big wrench.' },
    ],
    join: 'wren',
    set: { wrenFriend: true },
    next: 'home',
  },
  join_later: {
    lines: [
      { who: 'hero', text: 'Come visit us anytime! Millbrook has the best pie in the world.' },
      { who: 'wren', text: 'Okay! I will! I\'ll fix toys with Old Tock, and I\'ll visit. I promise.' },
    ],
    set: { wrenTock: true },
    next: 'home',
  },
  // ----- home, and the egg -----
  home: {
    place: 'millbrook',
    lines: [
      { who: 'narrator', text: 'A week later, Millbrook throws a party. Of course it does. Everyone comes: Gran, Captain Ward, the baker, and friends from all over.' },
      { who: 'narrator', text: 'Bramble sits in the grumpy corner. And next to her, very quietly, sits Wren.' },
      { who: 'wren', text: 'I made you something. I\'m sorry about the owls.' },
      { who: 'narrator', text: 'It\'s a tiny clockwork crow. It hops onto Bramble\'s finger and says "Caw! Tick!"' },
      { who: 'bramble', text: 'Hmph. ...It\'s lovely. Thank you, child.' },
      { who: 'bramble', text: 'Sit by me. These children talked to me when I was at my worst, too. They are stubborn like that.', if: 'peaceful' },
      { who: 'bramble', text: 'You may sit here. I was a great deal of trouble to these children myself, once. They got over it. Mostly.', ifNot: 'peaceful' },
      { who: 'pudge', text: 'Pie for everyone! Even the clockwork dog!', if: 'party:pudge' },
      { who: 'bolt', text: 'Woof! Tick tick!' },
    ],
    meet: ['bramble'],
    heal: true,
    levelUp: true,
    next: 'egg',
  },
  egg: {
    lines: [
      { who: 'narrator', text: 'The Starstone sits on a pillow in the middle of the party. Wren brought it, to give back to the grove.' },
      { who: 'narrator', text: 'Then it wobbles. Wobble. Wobble. It gets warm... then hot... then...' },
      { who: 'narrator', text: 'CRRRRACK!' },
      { who: 'narrator', text: 'A tiny snout pokes out. Then two big, blinking eyes. Then a sneeze: ACHOO! A puff of sparkles floats up into the air.' },
      { who: 'dragon', text: 'Mew?' },
      { who: 'pim', text: 'That\'s not a star. That\'s an EGG!' },
      { who: 'hollis', text: 'A BABY DRAGON?!' },
      { who: 'sniffle', text: 'Achoo! Oh no. It sneezes like me.', if: 'party:sniffle' },
    ],
    meet: ['dragon'],
    set: { dragon: true },
    next: 'end',
  },
  end: {
    end: true, party: true, book: 3, extraFaces: ['wren', 'dragon'],
    title: 'The End of Book Three',
    text: 'You found the Silver Mask, and you made another friend. And now there\'s a baby dragon! Book Four is coming in a future update.',
  },
};

export default { SCENES, FIGHTS, TEXT };
