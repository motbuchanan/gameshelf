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
};

export default GLOSSARY;
