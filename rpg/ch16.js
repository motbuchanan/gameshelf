// Chapter 16: The Hatchling. Book Four begins: name the baby dragon, fix the messes it makes in town,
// Gran's star book and the eggshell map, Sir Bartholomew rides in, the knight's clockwork hounds,
// and the first dragon care at camp.
// Text uses {name} for the hero's name and {dragon} for the dragon's name. No em dashes.
import CH15 from './ch15.js';
import CH11 from './ch11.js';

export const LEARNED = { ...CH11.LEARNED };

export const TEXT = {
  ...CH15.TEXT,
  TEACH: { ...CH15.TEXT.TEACH, monsterturn: 'Sniff sniff, CLANK! (The clockwork hounds are hunting for the dragon.)' },
  CHATTER: {
    ...CH15.TEXT.CHATTER,
    h1: ['Sniff sniff. CLANK.', 'Grrrr-tick!', 'Arooo-clank!'], h2: ['Sniff. Sniff. DRAGON.', 'Grrr-click!', 'Clank clank!'], h3: ['Arooo!', 'Sniff sniff!', 'Tick-grrr!'], h4: ['Grrr-clank!', 'Sniff!'],
    dragon: ['Mew!', 'Mrrp!', 'Achoo! (sparkles)', 'Rawr! (a tiny one)'],
  },
};

const HOUND = (id, x, y) => ({ id, monster: 'hound', name: 'Clockwork hound', x, y });

export const FIGHTS = {
  hounds: {
    id: 'ch16-hounds', xpKey: 'hounds',
    xp: 7, xpWhy: 'You stopped the clockwork hounds!',
    mode: 'hp',
    map: [
      '.t.......t.',
      '...b...b...',
      '...........',
      '..c.....c..',
      '...........',
      '.b.......b.',
      '...........',
      't....L....t',
    ],
    units: [
      { id: 'hero', side: 'hero', ai: 'player', x: 5, y: 5 },
      HOUND('h1', 3, 0), HOUND('h2', 7, 0),
      HOUND('h3', 5, 1),
    ],
    dragon: { x: 5, y: 6 },
    team: { from: 'picked', exclude: ['inkwing', 'dot'], spots: [{ x: 4, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 4 }] },
    roundCap: 14, capResult: 'win', boost: { hp: 4, skill: 50 },
    taught: LEARNED, skipHeroFirst: true,
    meets: ['hound'],
    events: [{ round: 0, type: 'say', lines: [
      { who: 'pim', text: '{dragon} is helping! Your dragon doesn\'t take a spot on the team. It just comes along.' },
      { who: 'pim', text: 'Watch for its Sparkle sneeze. A dazzled monster can hardly see to hit anyone.' },
    ] }],
    then: { win: 'hounds_win', lose: 'hounds_lose' },
  },
};

export const SCENES = {
  intro: {
    lines: [
      { who: 'narrator', text: 'The morning after the party, Millbrook is very quiet. Then: "Mew."' },
      { who: 'narrator', text: 'The baby dragon is asleep in an empty pie tin on Gran\'s windowsill. Its tail is curled around its nose, and every time it breathes out, a little sparkle floats up.' },
      { who: 'pim', text: 'It slept in a pie tin. Of course it did.' },
      { who: 'hollis', text: 'It needs a name! It can\'t just be "the dragon" forever.' },
      { who: 'nell', text: '{name}, you were the first one it looked at when it hatched. You should name it.' },
    ],
    nameDragon: true,
    next: 'named',
  },
  named: {
    lines: [
      { who: 'hero', text: 'Your name is {dragon}.' },
      { who: 'dragon', text: 'Mew! (It sneezes. ACHOO! A puff of sparkles lands in Hollis\'s beard.)' },
      { who: 'hollis', text: 'It likes it! {dragon}! Welcome to Millbrook, {dragon}!' },
      { who: 'narrator', text: '{dragon} is your dragon now. It goes everywhere you go, and it learns something new on every adventure.' },
    ],
    meet: ['dragon'],
    set: { dragon: true, dragonSneeze: true },
    next: 'town_intro',
  },
  town_intro: {
    lines: [
      { who: 'narrator', text: 'By lunchtime, {dragon} has made three messes. Maybe four. Everybody in town has a dragon problem to tell you about.' },
      { who: 'captain', text: '{name}! Your dragon is sitting on top of the mill. AGAIN.' },
    ],
    next: 'town',
  },
  town: {
    hub: {
      place: 'Millbrook',
      text: 'Dragon trouble all over Millbrook! Tap someone to help. Tap Done when the messes are fixed.',
      people: [
        { id: 'pies16', who: 'baker', label: 'The bakery is on fire!', go: 'pies', ifNot: 'piesDone' },
        { id: 'mill16', who: 'captain', label: 'A dragon on the roof', go: 'roof', ifNot: 'roofDone' },
        { id: 'gran16', who: 'gran', label: 'Gran\'s star book', go: 'starbook' },
        { id: 'wren16', who: 'wren', label: 'Wren and the eggshell', go: 'shell', if: 'party:wren' },
        { id: 'wrenv16', who: 'wren', label: 'Wren came to visit', go: 'shell', ifNot: 'party:wren' },
        { id: 'snif16', who: 'sniffle', label: 'Sniffle is sneezing too', go: 'sniffle_sneeze', if: 'party:sniffle', ifNot: 'sneezeOff' },
      ],
      doneLabel: 'All fixed',
      done: 'knight',
    },
  },
  // ----- the pies -----
  pies: {
    lines: [
      { who: 'baker', text: 'Your little friend sneezed at my cooling rack! Now every pie is on fire! Well, a little on fire. Toasty, at least.' },
      { who: 'narrator', text: 'Twelve pies are smoking on the windowsill. {dragon} is licking its lips.' },
    ],
    choices: [
      { label: 'Grab the bucket by the well', go: 'pies_bucket' },
      { label: 'Ask Pudge to help', go: 'pies_pudge', if: 'party:pudge' },
      { label: 'Blow them out like birthday candles', go: 'pies_blow' },
    ],
  },
  pies_bucket: {
    lines: [{ who: 'narrator', text: '{name} fills the bucket at the well and runs back, sloshing all the way.' }],
    check: { skill: 'climb', label: 'Run with a full bucket', great: 'pies_saved', ok: 'pies_saved', miss: 'pies_soggy', disaster: 'pies_oops' },
  },
  pies_pudge: {
    xp: 1, xpKey: 'pies',
    lines: [
      { who: 'pudge', text: 'Pudge knows what to do with hot pie. Pudge EATS it, so it can\'t burn anymore!' },
      { who: 'narrator', text: 'Pudge eats two pies very fast. The rest stop smoking because everybody is laughing so hard they blow on them.' },
      { who: 'baker', text: 'Well, that\'s one way to do it.' },
    ],
    set: { piesDone: true },
    give: { coins: 2 },
    next: 'town',
  },
  pies_blow: {
    lines: [{ who: 'hero', text: 'Everybody! Big breath! One, two, three... WHOOOOSH!' }],
    check: { skill: 'cheer', label: 'Get everybody blowing at once', great: 'pies_saved', ok: 'pies_saved', miss: 'pies_soggy' },
  },
  pies_saved: {
    lines: [
      { who: 'narrator', text: 'The fires go out with a little puff. The pies are a tiny bit crispy on top. The baker tries one.' },
      { who: 'baker', text: 'Hmm. Actually... dragon-toasted pie is DELICIOUS. I\'m putting it on the menu!' },
    ],
    set: { piesDone: true },
    give: { coins: 3 },
    next: 'town',
  },
  pies_soggy: {
    lines: [
      { who: 'narrator', text: 'Splash, splash, splash. The fires are out, but so is the cream. The pies are very soggy now.' },
      { who: 'baker', text: 'Ah well. The pigs will love them. Thank you for trying!' },
    ],
    set: { piesDone: true },
    next: 'town',
  },
  pies_oops: {
    lines: [
      { who: 'narrator', text: '{name} trips on the doorstep. The whole bucket goes up... and comes down on the baker. SPLOOSH.' },
      { who: 'baker', text: '...' },
      { who: 'baker', text: 'Well, I needed a bath anyway. HA! The fire\'s out too!' },
      { who: 'dragon', text: 'Mew! (It sneezes on the baker to dry him off. Now he sparkles.)' },
    ],
    set: { piesDone: true },
    next: 'town',
  },
  // ----- the mill roof -----
  roof: {
    lines: [
      { who: 'narrator', text: '{dragon} is curled up on top of the windmill, napping in the warm sun. Every time the blades go around, it lifts its head and says "Mew?"' },
      { who: 'captain', text: 'It\'s cute. I know it\'s cute. But the miller can\'t work with a dragon on his roof!' },
    ],
    choices: [
      { label: 'Call it down nicely', go: 'roof_call' },
      { label: 'Wave a pie at it', go: 'roof_pie', if: 'piesDone' },
      { label: 'Climb up and get it', go: 'roof_climb' },
    ],
  },
  roof_call: {
    lines: [{ who: 'hero', text: '{dragon}! Come here, {dragon}! Who\'s a good dragon? You are!' }],
    check: { skill: 'cheer', label: 'Coax {dragon} down', help: 'nell', great: 'roof_down', ok: 'roof_down', miss: 'roof_stuck' },
  },
  roof_pie: {
    xp: 1, xpKey: 'roof',
    lines: [
      { who: 'narrator', text: '{name} holds up a pie. {dragon}\'s nose twitches. Sniff, sniff...' },
      { who: 'narrator', text: 'WHUMP! It slides down the windmill blade like a slide and lands right in {name}\'s arms, pie and all.' },
    ],
    set: { roofDone: true },
    next: 'town',
  },
  roof_climb: {
    lines: [{ who: 'narrator', text: '{name} grabs the ladder. The windmill is VERY tall.' }],
    check: { skill: 'climb', label: 'Climb the windmill', great: 'roof_down', ok: 'roof_down', miss: 'roof_stuck' },
  },
  roof_down: {
    lines: [
      { who: 'narrator', text: '{dragon} yawns, stretches, and flops into {name}\'s arms. It\'s warm, like holding a hot water bottle that purrs.' },
      { who: 'captain', text: 'Thank you. Now, please, maybe find it a lower place to nap?' },
    ],
    set: { roofDone: true },
    next: 'town',
  },
  roof_stuck: {
    lines: [
      { who: 'narrator', text: 'It just looks at you and goes back to sleep. Then the wind changes, and it sneezes, and it slides right off the roof by itself.' },
      { who: 'narrator', text: 'PLOP. Right into the hay cart. It thinks this is the best thing that has ever happened.' },
    ],
    set: { roofDone: true },
    next: 'town',
  },
  // ----- Gran's star book -----
  starbook: {
    lines: [
      { who: 'gran', text: 'Come in, come in. I\'ve been up all night with my oldest book. Look here.' },
      { who: 'narrator', text: 'It\'s a picture of a mountain so tall that it pokes through the clouds. Dragons fly around the top, silver and blue, with stars on their wings.' },
      { who: 'gran', text: 'Star dragons. They live on Starpeak, the tallest mountain in the world. They lay their eggs right at the top, where the night sky is closest.' },
      { who: 'gran', text: 'When I was a little girl, a star fell into the silver grove. The trees glowed for a week. I always thought it was a star.' },
      { who: 'pim', text: 'It was an egg! Gran, your falling star was {dragon}\'s egg!' },
      { who: 'gran', text: 'It was. It must have rolled off the mountain in a storm. And somewhere up there, a mother has been looking for it all this time.' },
    ],
    set: { starBook: true },
    next: 'town',
  },
  // ----- Wren and the eggshell map -----
  shell: {
    lines: [
      { who: 'wren', text: 'I kept the eggshell. I keep everything. Look inside it, though. Hold it up to the dark.' },
      { who: 'narrator', text: 'Inside the eggshell, tiny dots glow like stars. They make a picture: a line of little stars, and one big bright one at the end.' },
      { who: 'wren', text: 'It\'s a map. A star map! The big dot points to the tallest mountain past Gearwick. The egg knew the way home.' },
      { who: 'wren', text: 'Ooh, I want to build an eggshell lamp now. Later. Later!', ifNot: 'party:wren' },
    ],
    set: { shellMap: true },
    next: 'town',
  },
  sniffle_sneeze: {
    lines: [
      { who: 'sniffle', text: 'Achoo! Achoo! {dragon} sneezes, I sneeze. I sneeze, {dragon} sneezes. ACHOO!' },
      { who: 'dragon', text: 'Achoo! (sparkles)' },
      { who: 'sniffle', text: 'ACHOO! We can\'t stop!' },
      { who: 'narrator', text: 'They sneeze back and forth until the whole street sparkles. Then they both fall over giggling. Sniffle has a new best friend.' },
    ],
    set: { sneezeOff: true },
    next: 'town',
  },
  // ----- Sir Bartholomew rides in -----
  knight: {
    lines: [
      { who: 'narrator', text: 'TA-RA-RAAAA! A trumpet blares at the town gate. A knight rides in on the shiniest horse you have ever seen.' },
      { who: 'sirbart', text: 'Good people of... wherever this is! I am Sir Bartholomew Boldly! Hero! Champion! Future dragon catcher!' },
      { who: 'narrator', text: 'Behind him, a girl with a big satchel is nailing posters to every post. REWARD: ONE DRAGON.' },
      { who: 'sirbart', text: 'I have heard there is a dragon in this town. A small one. A CATCHABLE one.' },
      { who: 'gran', text: 'You\'ll find no dragons here, sir. Only pies.' },
      { who: 'sirbart', text: 'Out of my way, old woman!' },
      { who: 'dot', text: '(quietly) Sorry. He\'s sorry. He\'s not, but I am. I\'m Dot. I\'m his squire.' },
    ],
    meet: ['sirbart', 'dot', 'shinyhorse'],
    choices: [
      { label: 'Hide {dragon} quick', go: 'hide' },
      { label: 'Talk to the knight', go: 'talk_knight' },
    ],
  },
  hide: {
    lines: [{ who: 'narrator', text: '{name} scoops up {dragon} and dives behind the rain barrel. Shh. Shhh. Don\'t sneeze. Please don\'t sneeze.' }],
    check: { skill: 'sneak', label: 'Hide {dragon} behind the barrel', help: 'nell', great: 'hide_ok', ok: 'hide_ok', miss: 'hide_sneeze' },
  },
  hide_ok: {
    lines: [
      { who: 'narrator', text: 'The knight clanks right past the barrel. {dragon} holds its breath so hard its cheeks puff out.' },
      { who: 'sirbart', text: 'Bah! No dragon. Come, Dot. We ride for the mountains at dawn!' },
      { who: 'narrator', text: 'Dot looks right at the barrel for a second. She saw. She smiles a tiny smile, and says nothing.' },
    ],
    set: { dotSaw: true },
    next: 'night',
  },
  hide_sneeze: {
    lines: [
      { who: 'dragon', text: 'Mmmm... mmmm... ACHOO!' },
      { who: 'narrator', text: 'A puff of sparkles floats up over the rain barrel. The knight stops. He turns. His visor squeaks.' },
      { who: 'dot', text: 'Oh! Sir! Look! A... a firefly! A really big firefly! Over there!' },
      { who: 'sirbart', text: 'Where? WHERE? ...Bah. Come, Dot. We ride for the mountains at dawn.' },
      { who: 'nell', text: 'She covered for us. Did you see that? The squire covered for us.' },
    ],
    set: { dotSaw: true },
    next: 'night',
  },
  talk_knight: {
    lines: [{ who: 'hero', text: 'Sir Bartholomew? Why do you want to catch a dragon anyway?' }],
    check: { skill: 'talk', label: 'Talk to the knight', help: 'pim', great: 'talk_knight_ok', ok: 'talk_knight_ok', miss: 'talk_knight_no' },
  },
  talk_knight_ok: {
    lines: [
      { who: 'sirbart', text: 'Why? WHY? Because every knight in the Hall of Heroes has a dragon story, child! Every one! Except me.' },
      { who: 'sirbart', text: 'Sir Gwen saved a village from a dragon. Sir Roland rode one! And Sir Bartholomew Boldly has... a very shiny horse.' },
      { who: 'narrator', text: 'For a second, he looks sad, not scary. Then he puffs up again.' },
      { who: 'sirbart', text: 'But not for long! Come, Dot. To the mountains!' },
    ],
    set: { knightSad: true },
    next: 'night',
  },
  talk_knight_no: {
    lines: [
      { who: 'sirbart', text: 'Questions, questions! Heroes don\'t answer questions. Heroes ride off dramatically! Come, Dot!' },
      { who: 'narrator', text: 'He tries to ride off dramatically. The horse eats a flower first. Then they ride off dramatically.' },
    ],
    next: 'night',
  },
  // ----- the hounds -----
  night: {
    lines: [
      { who: 'narrator', text: 'That night, something sniffs around the bakery. Sniff. Sniff. CLANK.' },
      { who: 'narrator', text: 'Three iron dogs with glowing eyes, nose to the ground, following a trail of sparkles straight to Gran\'s house.' },
      { who: 'bolt', text: 'GRRRR-tick-tick. WOOF!', if: 'party:bolt' },
      { who: 'juni', text: 'Look at their collars. There\'s a little gear stamped on them. These are Wren\'s old design!' },
      { who: 'wren', text: 'They ARE. I built hounds like those years ago. I sold the plans to a knight who said he wanted a guard dog. Oh no.', if: 'party:wren' },
    ],
    set: { houndStamp: true },
    next: 'team',
  },
  team: {
    lines: [{ who: 'narrator', text: 'The hounds have caught {dragon}\'s smell. Who runs out to stop them?' }],
    pickTeam: { size: 3, exclude: ['inkwing', 'dot'] },
    next: 'fight:hounds',
  },
  hounds_win: {
    lines: [
      { who: 'narrator', text: 'The last hound clanks over and lies still. Its eyes blink out.' },
      { who: 'dragon', text: 'Rawr! (A very tiny rawr. It\'s very proud of itself.)' },
      { who: 'hollis', text: 'Did you see {dragon}? It sneezed right in that hound\'s face! It couldn\'t see a thing!' },
    ],
    next: 'decide',
  },
  hounds_lose: {
    lines: [
      { who: 'narrator', text: 'The hounds knock everyone over... and then they hear the town bell. Captain Ward is coming, with a lantern and a very big broom.' },
      { who: 'narrator', text: 'The hounds run off into the dark, clanking. Nobody is hurt. {dragon} is hiding under {name}\'s shirt.' },
    ],
    next: 'decide',
  },
  decide: {
    lines: [
      { who: 'gran', text: 'Children. Come sit by the fire.' },
      { who: 'gran', text: '{dragon} is growing fast. It already eats a whole pie for breakfast. And now there are knights and iron dogs looking for it.' },
      { who: 'nell', text: 'Millbrook can\'t keep a dragon safe. Can it?' },
      { who: 'pim', text: 'But its mom can. On Starpeak.' },
      { who: 'hero', text: 'Then we take {dragon} home. All the way to the top of the mountain.' },
      { who: 'hollis', text: 'A real quest. A REAL one. With a map and everything!' },
    ],
    next: 'camp',
  },
  camp: {
    lines: [
      { who: 'narrator', text: 'Before bed, {dragon} needs taking care of. What does it need most tonight?' },
    ],
    choices: [
      { label: 'Feed it (+3 hearts for {dragon} next time)', go: 'care_fed', set: { careFed: true, carePlayed: false, careNap: false } },
      { label: 'Play with it (+10 for its tricks next time)', go: 'care_play', set: { careFed: false, carePlayed: true, careNap: false } },
      { label: 'Let it nap (one more trick next time)', go: 'care_nap', set: { careFed: false, carePlayed: false, careNap: true } },
    ],
  },
  care_fed: {
    lines: [{ who: 'narrator', text: '{dragon} eats a whole crispy pie, licks the tin, and burps a little sparkle. Then it curls up, round and happy.' }],
    next: 'cliff',
  },
  care_play: {
    lines: [{ who: 'narrator', text: '{name} rolls a ball of yarn across the floor. {dragon} pounces, rolls over, and sneezes sparkles all over the yarn. Again! Again!' }],
    next: 'cliff',
  },
  care_nap: {
    lines: [{ who: 'narrator', text: '{dragon} snuggles into a pile of warm laundry and falls asleep right away, snoring tiny sparkly snores.' }],
    next: 'cliff',
  },
  cliff: {
    lines: [
      { who: 'narrator', text: 'In the middle of the night, {dragon} wakes up and climbs onto the windowsill. It stares at the mountains, far away past Gearwick.' },
      { who: 'dragon', text: 'Wheeeeee-ooo. (A long, sad little whistle that floats out over the hills.)' },
      { who: 'narrator', text: 'Everything is quiet. And then, very far away, from the top of the tallest mountain...' },
      { who: 'narrator', text: '...something whistles back.' },
    ],
    set: { answerWhistle: true },
    heal: true,
    levelUp: true, banter: true,
    next: 'end',
  },
  end: { end: true, title: 'End of Chapter 16', text: 'Next: Chapter 17, The Frostpine Pass. Snow, ice, and a long road up the mountain.' },
};

export default { SCENES, FIGHTS, TEXT, LEARNED };
