// Chapter 10: Bramble. Fight or talk, the boss with crows and a thorn beast, making things right, and the silver mask.
// Text uses {name} for the hero's name. No em dashes.
import CH9 from './ch9.js';
import CH7 from './ch7.js';

export const TEXT = {
  ...CH9.TEXT,
  TEACH: { ...CH9.TEXT.TEACH, monsterturn: 'CAW!' },
  TALK_TARGET: 'Bramble',
  TALK_WHO: 'bramble',
  CALM_LINES: [
    'Hmph. What do YOU know about it?',
    'You... read about my grove? Nobody ever asked me about the trees before.',
    'They were so beautiful. Silver leaves, like little mirrors. I miss them every day.',
    'I... I don\'t want to hurt anyone. I just wanted the trees to be safe. Fine. FINE. I\'ll listen.',
  ],
  TALK_FAIL: 'Hmph! Words, words. Crows, get them!',
  SUMMON: 'Come to me, my crows!',
  CHATTER: {
    ...CH9.TEXT.CHATTER,
    bramble: ['Leave my woods!', 'You don\'t understand!', 'The trees come first!'],
    beast: ['RRRRRMMMBLE.', 'CRRRACK.', 'RRRMMM.'],
    k1: ['Caw!', 'Caw caw!', 'For Bramble!'], k2: ['Caw!', 'Shoo!', 'Caw caw!'],
  },
};

export const FIGHTS = {
  bramble: {
    id: 'ch10-bramble',
    xpKey: 'bramble',
    xp: 12, floor: 5, xpWhy: 'You beat Bramble!',
    mode: 'hp',
    map: [
      '...........',
      '.b...L...b.',
      '...........',
      '..m.....m..',
      '...........',
      '.L.......L.',
      '...b...b...',
      '...........',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 6 },
      { id: 'bramble', monster: 'bramble', name: 'Bramble', x: 5, y: 0 },
      { id: 'beast', monster: 'thornbeast', name: 'Thorn beast', x: 5, y: 2 },
      { id: 'k1', monster: 'crow', name: 'Crow', x: 2, y: 1 },
      { id: 'k2', monster: 'crow', name: 'Crow', x: 8, y: 1 },
    ],
    team: { from: 'picked', exclude: ['inkwing'], spots: [{ x: 3, y: 7 }, { x: 7, y: 7 }, { x: 5, y: 7 }] },
    calm: { max: 4, bonusIf: { diary: 15, woodcutter: 10, heardGrove: 5, seedGiven: 15 }, startIf: { talkedFirst: 1 } },
    roundCap: 16, capResult: 'win', boost: { hp: -2, skill: -6 },
    taught: CH7.LEARNED, skipHeroFirst: true,
    meets: ['bramble', 'thornbeast', 'crow'],
    events: [{ round: 0, type: 'say', lines: [{ who: 'pim', text: 'You don\'t have to only fight! Tap Talk on your turn to talk to her. Every good Talk roll fills a bubble. Fill them all, and she might listen.' }] }],
    then: { win: 'beat', calm: 'calmed', lose: 'lost' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'bramble', text: 'So. You\'re the children who beat my gnoll. I am Bramble Blackfeather. And this is MY tower.' },
      { who: 'bramble', text: 'Go home. Tell your town to leave the woods. Or my crows will chase you all the way back to Millbrook.' },
      { who: 'nell', text: 'She looks so tired.' },
      { who: 'bramble', text: 'And you tiptoed right past my owls. Hmph. Clever. I don\'t like clever.', if: 'owlsSnuck' },
      { who: 'bramble', text: 'And you BROKE my owls. Do you know how hard it is to get good owls?', if: 'owlsFought' },
      { who: 'pim', text: 'We read the diary. We know about the silver grove.', if: 'diary' },
    ],
    meet: ['bramble'],
    choices: [
      { label: 'We want to talk', go: 'talk_first' },
      { label: 'Give her the silver seed', go: 'seed_give', if: 'item:seed' },
      { label: 'Stop scaring our town!', go: 'fight_start' },
    ],
  },
  // The silver seed side quest pays off: talking gets much easier.
  seed_give: {
    lines: [
      { who: 'hero', text: 'Bramble, wait. We brought you something. Old Alder kept it for fifty years. He didn\'t know who to give it to.' },
      { who: 'narrator', text: '{name} opens the little cloth bag. The silver seed shines in the dark, like a tiny moon.' },
      { who: 'bramble', text: 'That... that is from my grove. I thought they were all gone. Every one.' },
    ],
    use: 'seed',
    set: { seedGiven: true },
    check: { skill: 'talk', help: 'nell', label: 'Talk to Bramble', bonus: 30, bonusWhy: 'The silver seed means a lot to her!', bonusIf: { diary: 15, woodcutter: 10, heardGrove: 5 }, great: 'talk_peace', ok: 'talk_peace', miss: 'talk_some' },
  },
  talk_first: {
    lines: [{ who: 'hero', text: 'Bramble, wait. We don\'t want to fight. We want to understand.' }],
    check: { skill: 'talk', help: 'pim', label: 'Talk to Bramble', bonusIf: { diary: 15, woodcutter: 10 }, bonusWhy: 'You know her story. That helps!',
      great: 'talk_peace', ok: 'talk_some', miss: 'talk_no' },
  },
  talk_peace: {
    xpKey: 'bramble',
    xp: 12, xpFloor: 5, xpWhy: 'You talked Bramble down! That counts as winning.',
    lines: [
      { who: 'hero', text: 'We know someone cut down your grove. We\'re sorry. That was wrong. But scaring people won\'t bring the trees back.' },
      { who: 'bramble', text: '...' },
      { who: 'bramble', text: 'Nobody has ever said sorry to me. Not in fifty years.' },
      { who: 'narrator', text: 'Bramble lowers her staff. The crows settle down on the roof, quiet.' },
    ],
    set: { peaceful: true },
    next: 'deal',
  },
  talk_some: {
    lines: [
      { who: 'bramble', text: 'You know about the grove? Hmph. Words are easy. Show me you mean it!' },
      { who: 'narrator', text: 'She\'s still angry, but she\'s listening a little. One calm bubble is already full.' },
    ],
    set: { talkedFirst: true },
    next: 'fight:bramble',
  },
  talk_no: {
    lines: [{ who: 'bramble', text: 'Hmph! I\'ve heard it all before. Crows! Thorn beast! Chase them out!' }],
    next: 'fight:bramble',
  },
  fight_start: {
    lines: [
      { who: 'bramble', text: 'Then you leave me no choice. Rise, thorn beast!' },
      { who: 'narrator', text: 'Vines burst up through the roof and twist into a huge, growling creature.' },
    ],
    next: 'fight:bramble',
  },
  beat: {
    lines: [
      { who: 'narrator', text: 'Bramble stumbles and drops her staff. The thorn beast falls apart into a pile of leaves. The crows fly up into the sky.' },
      { who: 'bramble', text: 'Enough. ENOUGH. You win. Are you going to throw me in a cage now, like Grubjaw\'s wagon?' },
      { who: 'hero', text: 'No. We want to talk. Why did you do all this?' },
      { who: 'narrator', text: 'And for the first time, Bramble tells them about her silver grove.' },
    ],
    set: { peaceful: false },
    next: 'deal',
  },
  calmed: {
    lines: [
      { who: 'narrator', text: 'Bramble lowers her staff. The thorn beast sits down like a big leafy dog. The crows go quiet.' },
      { who: 'bramble', text: 'You could have kept fighting. Why did you keep talking to me?' },
      { who: 'hero', text: 'Because you\'re not a monster. You\'re sad.' },
      { who: 'bramble', text: '...Yes. I suppose I am.' },
    ],
    set: { peaceful: true },
    next: 'deal',
  },
  lost: {
    lines: [{ who: 'narrator', text: 'The crows swirl, the thorn beast roars, and the kids are pushed back to the edge of the roof.' }],
    choices: [
      { label: 'Try the fight again', go: 'fight:bramble', retry: true },
      { label: 'See what happens', go: 'lost_see' },
    ],
  },
  lost_see: {
    lines: [
      { who: 'narrator', text: 'Bramble\'s crows pick the kids up by their shirts and carry them gently down to the bottom of the tower. Gently. She doesn\'t want anyone hurt.' },
      { who: 'nell', text: 'She could have dropped us. She didn\'t.' },
      { who: 'pim', text: 'She doesn\'t want to hurt us. That means we can talk to her. Let\'s go back up.' },
      { who: 'narrator', text: 'Up the stairs again. This time, Bramble already looks a little less sure.' },
    ],
    set: { talkedFirst: true },
    next: 'fight:bramble',
  },
  deal: {
    lines: [
      { who: 'bramble', text: 'I just wanted the trees to be safe. If no one lived near the woods, no one could ever cut them down again.' },
      { who: 'juni', text: 'What if we planted a NEW grove? Millbrook and Riverbend together. And nobody ever cuts it down.' },
      { who: 'woodcutter', text: 'I\'d plant the first tree myself. I owe you that, Bramble. I\'m sorry.', if: 'woodcutter' },
      { who: 'bramble', text: 'A new grove... You would do that?' },
      { who: 'hero', text: 'We promise. And you promise to stop scaring people.' },
      { who: 'bramble', text: '...Deal. My crows will bring back everything they took. And Inkwing, my smartest crow, will go with you. To keep an eye on you. In a nice way.' },
    ],
    join: 'inkwing',
    set: { beatBramble: true, inkwing: true },
    nextIf: [{ if: 'item:seed', go: 'deal_seed' }],
    next: 'home',
  },
  deal_seed: {
    lines: [
      { who: 'hero', text: 'Bramble, we have something for the new grove. Old Alder kept it for fifty years.' },
      { who: 'narrator', text: '{name} opens the little cloth bag. The silver seed shines like a tiny moon.' },
      { who: 'bramble', text: 'From my grove. I thought they were all gone. Every one. ...Thank you, child. We will plant it first.' },
    ],
    use: 'seed',
    set: { seedGiven: true },
    next: 'home',
  },
  home: {
    lines: [
      { who: 'narrator', text: 'A week later, the whole town of Millbrook and half of Riverbend plant a hundred little trees at the far edge of Whisper Woods, right where the old silver grove used to stand.' },
      { who: 'narrator', text: 'Then there\'s a party. Of course there\'s a party. And Bramble comes. She sits in the corner looking grumpy, but she comes.' },
      { who: 'sniffle', text: 'Miss Bramble, do you want to hear a joke? Achoo! Sorry. That wasn\'t the joke.', if: 'party:sniffle' },
      { who: 'pudge', text: 'Miss Bramble, try the pie. Pie fixes everything.', if: 'party:pudge' },
      { who: 'narrator', text: 'And for the first time in fifty years, Bramble Blackfeather laughs.' },
      { who: 'narrator', text: 'In the middle of the new grove, Bramble plants the silver seed herself. She pats the dirt down very, very gently.', if: 'seedGiven' },
    ],
    nextIf: [{ if: 'geese_done', go: 'geese2' }],
    next: 'hook',
  },
  // Hollis and the geese, part two.
  geese2: {
    lines: [
      { who: 'narrator', text: 'HONK. Everybody at the party freezes. The geese are back. All of them. And they are looking at the pie table.' },
      { who: 'hollis', text: 'No. Not today, geese. NOT TODAY. {name}... cheer for me?' },
    ],
    check: { skill: 'cheer', help: 'tobin', label: 'Cheer Hollis on against the geese', great: 'geese2_win', ok: 'geese2_win', miss: 'geese2_run' },
  },
  geese2_win: {
    lines: [
      { who: 'hero', text: 'GO, HOLLIS! YOU FOUGHT A GNOLL! YOU CAN DO THIS!' },
      { who: 'narrator', text: 'Hollis marches right at the geese with his arms out wide. "SHOO!" The biggest goose looks at him. Hollis does not blink. The goose blinks.' },
      { who: 'narrator', text: 'The geese waddle away. The whole party cheers. Hollis looks ten feet tall.' },
      { who: 'hollis', text: 'I did it. All by myself. Well, with cheering.' },
    ],
    next: 'hook',
  },
  geese2_run: {
    lines: [
      { who: 'narrator', text: 'Hollis takes one step. The biggest goose takes two. Hollis runs. The geese chase him twice around the party.' },
      { who: 'narrator', text: 'Then Bramble raises one eyebrow at the geese. Just one. The geese leave at once, very quietly.' },
      { who: 'hollis', text: 'How did you DO that? Teach me. Please teach me.' },
    ],
    next: 'hook',
  },
  hook: {
    lines: [
      { who: 'bramble', text: 'Children. Come here. There is something I didn\'t tell you.' },
      { who: 'bramble', text: 'I wasn\'t the only one who wanted your woods empty. Someone came to my tower. Someone who told me where to find Grubjaw, and how to scare a town.' },
      { who: 'bramble', text: 'They came from far away. And they wore a mask. A silver mask.' },
      { who: 'nell', text: 'A silver mask...' },
      { who: 'hollis', text: '{name}? I think we have another adventure coming.' },
    ],
    nextIf: [{ ifNot: 'brassGear', go: 'hook_gear' }],
    next: 'end',
  },
  // A keepsake and a clue for Book Three.
  hook_gear: {
    lines: [
      { who: 'bramble', text: 'One more thing. My visitor dropped this on the tower stairs. Take it. I don\'t want it in my house.' },
      { who: 'narrator', text: 'It\'s a little brass gear, no bigger than a button. On the back, someone scratched a tiny letter: W.' },
    ],
    give: { items: { brassgear: 1 } },
    set: { brassGear: true },
    next: 'end',
  },
  end: {
    end: true, party: true, book: 2, extraFaces: ['bramble'],
    title: 'The End of Book Two',
    text: 'You found B, and you made a friend instead of an enemy. Book Three, The Silver Mask, starts in Chapter 11.',
  },
};

export default { SCENES, FIGHTS, TEXT };
