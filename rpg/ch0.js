// Chapter 0: Who are you? Words for the character creation steps.
// The narrator talks to Garrett directly. Short sentences, real words, no baby talk.
export const CH0 = {
  title: {
    say: 'Morning in Millbrook. The mill wheel is turning, the bakery smells like cinnamon, and the other kids are already waiting at the edge of the woods. Someone is missing from the game. You!',
  },
  people: {
    heading: 'Who are you?',
    say: 'First things first. Millbrook is home to humans, elves and dwarves. Which are you? Tap the ? to learn about each one.',
  },
  look: {
    heading: 'What do you look like?',
    say: 'Look in the puddle by the well. That is you! Your bucket helmet is off so you can see your hair. Change anything you like.',
  },
  name: {
    heading: 'What is your name?',
    say: 'The other kids are shouting for you. What name are they shouting?',
    placeholder: 'Type your name',
  },
  bestat: {
    heading: 'What are you best at?',
    say: 'Every hero is good at something. This choice fills your five meters. More colored blocks means better at it. The gold label shows what each choice is best at.',
  },
  weapon: {
    heading: 'Grab your pretend weapon',
    say: 'Nobody plays heroes-and-monsters empty-handed. Your bucket helmet is already on. What else are you bringing?',
    fits: 'Fits you',
  },
  review: {
    heading: 'Your character sheet',
    say: 'This is your character sheet. It holds everything about your hero. Tap anything to learn what it does. Tap a skill to see your chances. When you are ready, tap Begin and the game starts!',
    begin: 'Begin the adventure',
  },
  sheet: {
    say: 'Your hero is saved. Tap the gold button to play the next chapter, or tap anything on your sheet to learn about it.',
  },
};

// Name ideas by people. Grounded, easy to read, not the usual fantasy-generator names.
export const NAMES = {
  human: ['Bram', 'Ada', 'Ned', 'Rosie', 'Wil', 'Mabel', 'Otis', 'Hattie', 'Jory', 'Bess', 'Calvin', 'Winnie'],
  elf: ['Fenn', 'Ilsa', 'Tamsin', 'Lio', 'Sorrel', 'Quill', 'Merrit', 'Ivo', 'Larkin', 'Odette'],
  dwarf: ['Gunnar', 'Hilde', 'Bodo', 'Magda', 'Ragi', 'Tova', 'Brannoc', 'Ulla', 'Durk', 'Greta'],
};

export default { CH0, NAMES };
