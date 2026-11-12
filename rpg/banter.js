// Camp chatter for Books Three and Four: every friend on the team gets a line at camp, so nobody goes quiet
// after they join. Inkwing caws, and Pim says what she means. Lines show only for friends on the team
// (team:) or, for Inkwing, in the party. Text uses {name} and {dragon}. No em dashes.
const L = (who, text, extra = {}) => ({ who, text, if: who === 'inkwing' ? 'party:inkwing' : 'team:' + who, ...extra });
const INK = (caw, meaning) => [L('inkwing', caw), { who: 'pim', text: meaning, if: ['party:inkwing', 'team:pim'] }, { who: 'narrator', text: meaning.replace(/^She says/, 'Inkwing seems to say'), if: 'party:inkwing', ifNot: 'team:pim' }];

const LINES = {
  11: [
    L('hollis', 'My arms are stronger than in Chapter... I mean, than last spring. I can swing my broom twice as long now!'),
    L('tobin', 'I\'m going to name every star tonight. That one is Tobin. That one is also Tobin.'),
    L('sniffle', 'Bolt ticks when he sleeps. It\'s nice. Like a clock telling you everything is okay.'),
    L('pudge', 'Pudge packed six sandwiches. Pudge has eaten five sandwiches. Pudge regrets nothing.'),
    L('mossback', 'In my day, we didn\'t have clockwork dogs. We had regular dogs. They also licked you.'),
    ...INK('Caw. Caw caw. Tick!', 'She says she doesn\'t trust anything that ticks. Except Bolt. Bolt is fine.'),
  ],
  12: [
    L('nell', 'Gearwick has the best rooftops. I\'ve already climbed four. Don\'t tell Captain Ward.'),
    L('juni', 'Everything here has a spring in it. Even the doorknobs. I want to take ALL of it apart.'),
    L('bolt', 'Woof! Tick tick. (He has found a gear on the floor of the inn and is very proud of it.)'),
    L('sniffle', 'The clocks keep chiming. Every chime, I jump. I have jumped a hundred times.'),
    L('pudge', 'Gearwick pie has a gear baked in it for luck. Pudge found it the hard way. Ow.'),
    ...INK('Caw! Caw caw caw!', 'She says the lady at the market tried to sell her a clockwork worm. She is insulted.'),
  ],
  13: [
    L('hollis', 'I bonked a clockwork knight today. My broom handle has a dent now. A HERO dent.'),
    L('tobin', 'The tower was SO tall. I counted the stairs. There were... a lot. I lost count at eleventy.'),
    L('bolt', 'Woof. (He sleeps with one ear up, listening to the tower tick.)'),
    L('mossback', 'Stairs are not made for trolls. I have bumped my head on every single one.'),
    L('pudge', 'Pudge does not like the floor that moves. Pudge likes the floor that stays.'),
    ...INK('Caw. Caw.', 'She says she flew up the outside of the tower. It was faster. Show-off.'),
  ],
  14: [
    L('nell', 'Those sleeping animals in the workshop... they looked like they were waiting for someone. I feel sorry for them.'),
    L('juni', 'Wren\'s workshop is the most amazing place I\'ve ever seen. I hope we can be friends with her. Is that weird?'),
    L('sniffle', 'The brass bear looked at me. It had sad eyes. Do clockwork bears have feelings?'),
    L('bolt', 'Whine. Tick. (Bolt keeps looking at the workshop door. He knows this place.)'),
    L('mossback', 'Whoever built all this must be very clever and very lonely. That is a sad mix.'),
    ...INK('Caw...', 'She says the clockwork birds don\'t sing. They only tick. She doesn\'t like that at all.'),
  ],
  16: [
    L('hollis', 'A quest to the top of the tallest mountain in the world. With a DRAGON. I\'m going to write this down so I remember it forever.'),
    L('nell', '{dragon} curled up in my cape today. Right in the hood. It fits perfectly.'),
    L('tobin', 'I taught {dragon} to roar! It\'s a very small roar. More of a squeak. We\'re working on it.'),
    L('bolt', 'Woof! Tick. (Bolt and {dragon} are sleeping back to back. One ticks, one sparkles.)'),
    L('pudge', 'Pudge and {dragon} both love pie. Pudge thinks this means they are the same kind of creature.'),
    L('wren', 'I\'m sorry about the hounds. I built them before I knew any better. I\'ll make it right.'),
    ...INK('Caw caw! CAW.', 'She says {dragon} keeps trying to sit on her. She is NOT an egg.'),
  ],
  17: [
    L('juni', 'My fingers are so cold I can\'t feel them. {dragon}, can you sit on my hands? Thanks.'),
    L('sniffle', 'Snow makes me sneeze. Everything makes me sneeze. Achoo!'),
    L('mossback', 'The mountain air smells like home. I didn\'t know I missed it.'),
    L('pudge', 'Pudge built a snow-Pudge. It is very handsome. Like the real Pudge.'),
    L('bolt', 'Grrr-click. (Bolt does not like snow in his gears. He shakes it off every two minutes.)'),
    L('wren', 'Fur cloaks are good, but a clockwork heater would be better. I\'m drawing one. Look.'),
    ...INK('Caw! Brrr. Caw!', 'She says crows were not made for mountains. She wants to go home and sit in a nice warm tree.'),
  ],
  18: [
    L('hollis', 'Trolls. Real trolls. Big ones. Nobody back in Millbrook is going to believe this.'),
    L('nell', 'I tiptoed past a sleeping troll today. I was so quiet, I couldn\'t even hear myself.'),
    L('tobin', 'Queen Granite has four hundred spoons. I counted. Okay, I counted to forty. Then I guessed.'),
    L('juni', 'Those mirrors were like the ones in Bramble\'s tower. Light is so cool.'),
    L('bolt', 'Woof. (He found a spoon in the treasure pile and won\'t give it back.)'),
    L('wren', 'The trolls asked if I could fix their door. I said yes. I think I have a new job.'),
    ...INK('Caw. Caw caw.', 'She says the trolls offered her a mushroom. She is still deciding how she feels about it.'),
  ],
  19: [
    L('hollis', 'Tomorrow we get {dragon} back. I can feel it. In my beard. A little beard. It\'s coming in.'),
    L('nell', 'Dot\'s drawings are really good. Way better than mine. Don\'t tell her I said so. Actually, do.'),
    L('juni', 'Three locks. I can do three locks. I\'ve done harder. Probably.'),
    L('sniffle', 'I miss {dragon}. Nobody sneezes back at me.'),
    L('pudge', 'Pudge is saving the last cookie for {dragon}. Pudge is very brave.'),
    L('mossback', 'Great-Aunt Granite gave me a spoon for good luck. I think it was a hint.'),
    L('wren', 'I built that cage. I can open it. I KNOW I can.'),
    ...INK('Caw. Caw. CAW!', 'She says tomorrow she\'ll fly ahead and peck that knight right on his shiny helmet.'),
  ],
};

export function BANTER(n) { return LINES[n] || []; }
export default { BANTER };
