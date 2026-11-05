// Every explainable term in the game. ui.explain(id) opens one as a card.
// Write for a strong young reader: short sentences, real words, no baby talk.
export const GLOSSARY = {
  skill: {
    title: 'Skill',
    body: 'A skill is how good your hero is at something, like sneaking, climbing or swinging a sword. It is written as a percent. A skill of 50% means you will usually succeed about half the time. As your hero practices and levels up, skills get higher.',
    prereq: 'Every hero has every skill. Training and gear make them grow.',
  },
  percentile: {
    title: 'Percentile dice',
    body: 'Two ten-sided dice rolled together. The green one is the tens (00, 10, 20 ... 90). The light one is the ones (0 to 9). Put them together to read a number from 1 to 100. Rolling 00 and 0 means 100. To succeed, you want to roll your skill number or LOWER.',
  },
  chart: {
    title: 'The result chart',
    body: 'The bar shows every number from 1 to 100. Low rolls are good, high rolls are bad. The colored zones show what each roll would mean for this skill. Higher skill makes the good zones bigger.',
  },
  legendary: {
    title: 'Legendary!',
    body: 'The best result there is. You do it perfectly AND something extra good happens. A Legendary roll is about one tenth of your skill, so it is rare. When it happens, the story remembers.',
  },
  exceptional: {
    title: 'Exceptional',
    body: 'You succeed, and you do it really well. You might get a bonus, learn something extra, or do more damage. It happens on rolls up to half of your skill.',
  },
  success: {
    title: 'Success',
    body: 'It works! You roll your skill number or lower, and you do what you were trying to do.',
  },
  fail: {
    title: 'Fail',
    body: 'It does not work this time, but nothing terrible happens. You can try another way, use a second chance, or ask a friend for help. A fail never ends the adventure.',
  },
  disaster: {
    title: 'Disaster!',
    body: 'Rolls of 96 to 100 always go wrong, no matter how good you are. Not only do you fail, something else goes wrong too, like dropping the keys and waking the guard. Disasters make the best stories later.',
  },
  luck: {
    title: 'Luck',
    body: 'Luck lets you roll again. Spend one Luck point to pick up both dice and roll a fresh number. You have 3 Luck points. They come back when your party rests or finishes a chapter, so spend them when it really matters.',
    prereq: 'Every hero starts with 3 Luck.',
  },
  flip: {
    title: 'Flip the dice',
    body: 'A special trick: swap the two percentile dice, so the tens become the ones. A 72 becomes a 27! It only helps when the flipped number is lower. You get a few flips each rest.',
    prereq: 'Learned as a talent or given by a lucky item. You can practice it here.',
  },
  helper: {
    title: 'Friends help',
    body: 'A friend standing nearby can help you. Their help moves your result up one step on the chart, like turning a Fail into a Success. Each friend can help once per fight or scene.',
  },
  d4: {
    title: 'Four-sided die (d4)',
    body: 'Shaped like a little pyramid. It rolls 1 to 4. A d4 has no top face, so you read the number at the TOP POINT. Used for small weapons like a stick or a dagger, and for healing potions.',
  },
  d6: {
    title: 'Six-sided die (d6)',
    body: 'The cube everyone knows. It rolls 1 to 6. Opposite sides always add up to 7. Used for practice swords, slings and some spells.',
  },
  d8: {
    title: 'Eight-sided die (d8)',
    body: 'Shaped like two pyramids stuck together. It rolls 1 to 8. Used for real swords and stronger weapons.',
  },
  d10: {
    title: 'Ten-sided die (d10)',
    body: 'A pointy die with kite-shaped sides. It rolls 1 to 10. Two of them together make the percentile dice. Used for big weapons like a flail.',
  },
  d12: {
    title: 'Twelve-sided die (d12)',
    body: 'Every side is a five-sided shape called a pentagon. It rolls 1 to 12. Used for the biggest weapons, like a heavy axe, and for some treasure tables.',
  },
  d20: {
    title: 'Twenty-sided die (d20)',
    body: 'The famous one, with twenty triangle sides. It rolls 1 to 20. Everyone rolls a d20 at the start of a fight to see who goes first. It is also used for surprise tables.',
  },
  dicebag: {
    title: 'The dice bag',
    body: 'Adventurers use lots of different dice. Tap a die to add it to the bag, then roll them all at once. The total is all the dice added together. "2d6" means two six-sided dice.',
  },

  // ---------- stats ----------
  stat_might: { title: 'Might', body: 'How strong you are. Might helps you swing a weapon, climb, and shove heavy things. It also gives you more hit points.', prereq: 'Skills that use Might: Swing, Climb, Lift & shove.' },
  stat_finesse: { title: 'Finesse', body: 'How quick and careful your hands and feet are. Finesse helps you sneak, aim, and do tricky things with your fingers. It also helps you go first in a fight.', prereq: 'Skills that use Finesse: Sneak, Aim, Nimble fingers.' },
  stat_wits: { title: 'Wits', body: 'How sharp your mind is. Wits helps you notice clues, follow tracks, and remember things you have read or heard.', prereq: 'Skills that use Wits: Notice, Tracking, Lore.' },
  stat_presence: { title: 'Presence', body: 'How well you get along with people. Presence helps you talk your way out of trouble and cheer your friends on so they do better.', prereq: 'Skills that use Presence: Talk, Cheer on.' },
  stat_resolve: { title: 'Resolve', body: 'How brave and tough you are inside. Resolve helps you stay calm when something is scary and keep going when you are hurt. It also gives you more hit points.', prereq: 'Skills that use Resolve: Stay brave, Tough it out.' },
  // ---------- skills ----------
  skill_swing: { title: 'Swing', body: 'Hitting with a sword, stick or club. Roll Swing to see if your attack lands.', prereq: 'Comes from Might.' },
  skill_climb: { title: 'Climb', body: 'Getting up trees, walls and cliffs without falling.', prereq: 'Comes from Might.' },
  skill_shove: { title: 'Lift & shove', body: 'Moving heavy things: pushing a rock, lifting a log, or shoving a goblin out of the way.', prereq: 'Comes from Might.' },
  skill_sneak: { title: 'Sneak', body: 'Moving without being seen or heard. Good for getting past guards.', prereq: 'Comes from Finesse.' },
  skill_aim: { title: 'Aim', body: 'Hitting things from far away with a slingshot, a bow, or a well-thrown rock.', prereq: 'Comes from Finesse.' },
  skill_fingers: { title: 'Nimble fingers', body: 'Tricky hand work: picking a pocket, untying a knot, or opening a lock.', prereq: 'Comes from Finesse.' },
  skill_notice: { title: 'Notice', body: 'Spotting things other people miss, like a trap, a hidden door, or a goblin in a bush.', prereq: 'Comes from Wits.' },
  skill_track: { title: 'Tracking', body: 'Reading footprints, broken twigs and other signs to follow someone.', prereq: 'Comes from Wits.' },
  skill_lore: { title: 'Lore', body: 'Knowing things: what a monster is afraid of, what a strange symbol means, or which mushroom is safe to eat.', prereq: 'Comes from Wits.' },
  skill_talk: { title: 'Talk', body: 'Getting people (and some monsters) to listen to you, believe you, or help you.', prereq: 'Comes from Presence.' },
  skill_cheer: { title: 'Cheer on', body: 'Shouting encouragement so a friend does better on their next try.', prereq: 'Comes from Presence.' },
  skill_brave: { title: 'Stay brave', body: 'Not running away when something scary happens.', prereq: 'Comes from Resolve.' },
  skill_tough: { title: 'Tough it out', body: 'Keeping going when you are tired, cold, hurt or hungry.', prereq: 'Comes from Resolve.' },
  trained: { title: 'Practiced skill', body: 'A skill your hero practices a lot. It gets one extra block (10 more squares) on top of the stat it comes from.' },
  // ---------- other numbers ----------
  hp: { title: 'Hit points (HP)', body: 'How many hits your hero can take before they are knocked down. When HP runs out in a fight, you are out until a friend helps you up or the fight ends. Resting brings HP back.', prereq: 'Starts at 6, plus one for every 10 points of Might and of Resolve.' },
  move: { title: 'Move', body: 'How many squares your hero can walk on their turn in a fight. Mud and bushes cost extra.' },
  level: { title: 'Level', body: 'How experienced your hero is. Every adventure gives experience points (XP). Enough XP and you level up, and your hero gets better at things.' },
  xp: { title: 'Experience (XP)', body: 'Points you earn for trying things, finishing fights and solving problems. Even failing gives a little XP, because you learn from it.' },
  // ---------- peoples ----------
  people_human: { title: 'Humans', body: 'The most common people in Millbrook. Humans are friendly and good at getting along with everyone.', prereq: 'Bonus: +5 Presence.' },
  people_elf: { title: 'Elves', body: 'Elves have pointed ears and sharp minds. Elf families have lived in the woods near Millbrook for longer than anyone remembers.', prereq: 'Bonus: +5 Wits.' },
  people_dwarf: { title: 'Dwarves', body: 'Dwarves are short, sturdy and stubborn. Dwarf kids can keep going long after everyone else is ready for a nap.', prereq: 'Bonus: +5 Resolve.' },
  // ---------- best at ----------
  best_brave: { title: 'Being brave', body: 'You run toward trouble. Strong and steady, you are great at fighting up close and at not giving up.', prereq: 'High Might and Resolve. Trained in Swing and Stay brave.' },
  best_sneaky: { title: 'Being sneaky', body: 'You are quick, quiet and hard to catch. You are great at sneaking, climbing and tricky hand work.', prereq: 'High Finesse. Trained in Sneak and Nimble fingers.' },
  best_clever: { title: 'Being clever', body: 'You notice things and figure things out. You are great at spotting clues, knowing facts and talking to people.', prereq: 'High Wits and Presence. Trained in Notice and Lore.' },
  // ---------- starting gear ----------
  gear_woodsword: { title: 'Practice sword', body: 'A wooden sword made for practice. It still hurts if it hits you.', prereq: 'Damage: 1d6. Uses the Swing skill.' },
  gear_stick: { title: 'Sturdy stick', body: 'The best stick in the whole woods. You found it yourself.', prereq: 'Damage: 1d4. Uses the Swing skill.' },
  gear_slingshot: { title: 'Slingshot', body: 'A forked branch and a strip of leather. Hits from far away.', prereq: 'Damage: 1d4. Uses the Aim skill. Reaches 6 squares.' },
  gear_bucket: { title: 'Bucket helmet', body: 'An old tin bucket worn upside down. Not real armor, but it does make goblin knives bounce off sometimes.', prereq: 'Armor: 1.' },
  gear_satchel: { title: 'Satchel', body: 'A bag for carrying things you find. Every adventurer needs one.' },
  gear_broomstick: { title: 'Broom handle', body: 'Hollis took it off his mom\'s broom. She hasn\'t noticed yet.', prereq: 'Damage: 1d4. Uses the Swing skill.' },
  gear_dagger: { title: 'Kitchen dagger', body: 'A small blade from the kitchen drawer. It is quick to poke with, so it uses Aim instead of Swing.', prereq: 'Damage: 1d4. Uses the Aim skill. Reaches 1 square.' },
  gear_club: { title: 'Knobby club', body: 'A heavy stick with a knob on the end.', prereq: 'Damage: 1d6. Uses the Swing skill.' },
  // ---------- the grid and fights ----------
  terrain_grass: { title: 'Grass', body: 'Open ground. Walking on it costs 1 step per square.' },
  terrain_bush: { title: 'Bush', body: 'A thick bush you can hide in. Anyone standing in a bush has cover, so they are harder to hit.', prereq: 'Costs 1 step. Gives cover.' },
  terrain_mud: { title: 'Mud', body: 'Sticky, squishy mud. Your boots get stuck, so it takes extra steps to cross.', prereq: 'Costs 2 steps per square.' },
  terrain_log: { title: 'Log', body: 'A fallen log. You can\'t walk through it, and it blocks slingshots and arrows.', prereq: 'Blocks walking and shots.' },
  terrain_tree: { title: 'Tree', body: 'A big old tree. You can\'t walk through it, and it blocks slingshots and arrows.', prereq: 'Blocks walking and shots.' },
  terrain_stream: { title: 'Stream', body: 'Cold running water. Too deep and slippery to wade across, so look for the crossing. Shots fly over it just fine.', prereq: 'No walking. Does not block shots.' },
  flags: { title: 'Flags', body: 'In the pretend game, every kid tucks flags in their belt. A tag pulls a flag. Lose all your flags and you are out, and you sit on the log to cheer.', prereq: 'A good tag pulls 1 flag, a great tag pulls 2, a legendary tag pulls 3.' },
  turns: { title: 'Taking turns', body: 'In a fight, everyone takes turns, one at a time. On your turn you can walk once and do one thing, like tag someone. The row of faces shows who goes next.', prereq: 'Walk, then act. Or act, then walk.' },
  cover: { title: 'Cover', body: 'Hiding behind or inside something makes you harder to hit. A kid standing in a bush has cover.', prereq: 'Cover takes 20 squares off the chance to hit you.' },
  range: { title: 'Range', body: 'How far away you can reach. A stick or sword can only reach the squares right next to you. A slingshot can reach far, as long as no log or tree is in the way.' },
  area: { title: 'Area', body: 'Some tricks and spells hit a whole patch of squares at once. The orange squares show the area. One roll decides what happens to everyone inside.' },
  trick_pinecones: { title: 'Pinecone shower', body: 'Pim\'s secret trick from Gran\'s book: toss a whole handful of pinecones up high so they rain down on a patch of squares.', prereq: 'Area: 3 by 3 squares. Uses Aim. Once per game.' },
  move_steps: { title: 'Walking', body: 'On your turn you can walk up to 4 steps. The blue squares show everywhere you can reach. Mud costs extra, and you can\'t walk through logs, trees or the stream.' },
};

export default GLOSSARY;
