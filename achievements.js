/* achievements.js  —  per-player milestone/challenge badges for The Game Shelf
 * Load AFTER gamenight.js.  Pure logic + localStorage (memory fallback); no DOM.
 *
 * Two ideas live here:
 *   - "played" / "wins" ladders: cumulative milestones, everyone can earn the same
 *     ones (play a game 1/10/50/100/250 times -> Newcomer..Legend).
 *   - "challenge" ladders: reach a best score / level / wave in a solo game.
 *
 * First-place single-holder titles (most coin flips, highest Yahtzee ever) are a
 * DIFFERENT system and live in the High Scores book, not here.
 *
 * Tuning is all in the constants below (single adjustable ladders).
 */
(function(){
"use strict";

/* ---- adjustable tuning ---- */
var PLAYED_LADDER=[1,10,50,100,250];      // per-game "played N times"
var TOTAL_LADDER =[1,25,100,250,500];     // games played across everything
var WIN_LADDER   =[1,10,50,100,250];      // wins across everything
var TIER_NAMES   =["Newcomer","Regular","Veteran","Devotee","Legend"];

/* storage key -> display name (any game that records can live here) */
var NAMES={
  bg_games:"Backgammon", bs_games:"Battleship", blocks_games:"Blocks", ks_games:"Knight School",
  brickbreak_games:"Brick Break", bridge_games:"Bridge", checkers_games:"Checkers",
  chess_games:"Chess", cc_games:"Chinese Checkers", cb_games:"Code Breaker",
  c4_games:"Connect Four", dom_games:"Dominoes", dots_games:"Dots and Boxes",
  farkle_games:"Farkle", gofish_games:"Go Fish", gomoku_games:"Gomoku",
  guesswho_games:"Guess Who", hex_games:"Hex", mancala_games:"Mancala",
  morris_games:"Nine Men's Morris", paddleduel_games:"Paddle Duel",
  reversi_games:"Reversi", sb_games:"Shut the Box", scrabble_games:"Scrabble", snakearcade_games:"Snake",
  sl_games:"Snakes & Ladders", sorry_games:"Sorry!", stardefender_games:"Star Defender",
  trouble_games:"Trouble", ur_games:"Royal Game of Ur", uttt_games:"Tic-Tac-Toe",
  war_games:"War", yahtzee_games:"Yahtzee",
  blackjack_games:"Blackjack", solitaire_games:"Solitaire", memory_games:"Memory",
  gin_games:"Gin Rummy", oldmaid_games:"Old Maid", onecardleft_games:"One Card Left!",
  knuckle_games:"Knucklebones", pig_games:"Pig", liarsdice_games:"Liar's Dice",
  craps_games:"Craps", minesweeper_games:"Minesweeper", gemmatch_games:"Gem Match"
};

/* per-game "challenge" ladders: a single higher-is-better metric (score/level/wave).
   The metric VALUE is supplied by the caller; thresholds live here. */
var CHALLENGES={
  snakearcade_games:{label:"Snake Charmer",   tiers:[15,30,60,100]},
  brickbreak_games: {label:"Brick Buster",    tiers:[50,150,300,600]},
  blocks_games:     {label:"Block Master",    tiers:[3,5,8,12]},
  ks_games:         {label:"Chess Scholar",   tiers:[3,5,8,12]},
  stardefender_games:{label:"Star Defender",  tiers:[3,5,8,12]},
  gemmatch_games:   {label:"Gem Crusher",     tiers:[500,1500,4000,8000]},
  minesweeper_games:{label:"Mine Clearer",    tiers:[200,800,2000,5000]},
  craps_games:      {label:"High Roller",     tiers:[200,500,1000,2500]}
};

/* which rec field is the higher-is-better metric for each challenge game */
var METRIC={snakearcade_games:"score",brickbreak_games:"score",blocks_games:"level",stardefender_games:"wave",
  gemmatch_games:"score",minesweeper_games:"score",craps_games:"score"};

/* ---- storage (localStorage with in-memory fallback, like the ledger) ---- */
var SKEY="gn_achievements", _mem=null;
function load(){try{var v=JSON.parse(localStorage.getItem(SKEY));return v&&v.players?v:(_mem||{players:{}});}
  catch(e){return _mem||{players:{}};}}
function save(d){_mem=d;try{localStorage.setItem(SKEY,JSON.stringify(d));}catch(e){}}
function ensure(d,name){if(!d.players[name])d.players[name]={played:{},totalPlayed:0,wins:0,best:{},earned:{}};
  var p=d.players[name];p.played=p.played||{};p.best=p.best||{};p.earned=p.earned||{};return p;}
function uniq(a){var o=[],s={};(a||[]).forEach(function(x){if(x&&!s[x]){s[x]=1;o.push(x);}});return o;}

/* ---- definitions (built from the constants) ---- */
function defs(){
  var out=[],k;
  for(k in NAMES)out.push({id:"played:"+k,kind:"played",key:k,name:NAMES[k],ladder:PLAYED_LADDER});
  out.push({id:"played:all",kind:"totalPlayed",name:"Game Nights",ladder:TOTAL_LADDER});
  out.push({id:"wins:all",kind:"wins",name:"Winner",ladder:WIN_LADDER});
  for(k in CHALLENGES)out.push({id:"chal:"+k,kind:"best",key:k,name:CHALLENGES[k].label,ladder:CHALLENGES[k].tiers});
  return out;
}
function valFor(def,p){
  if(def.kind==="played")return (p.played[def.key])||0;
  if(def.kind==="totalPlayed")return p.totalPlayed||0;
  if(def.kind==="wins")return p.wins||0;
  if(def.kind==="best")return (p.best[def.key])||0;
  return 0;
}
function tierOf(ladder,v){var t=0;for(var i=0;i<ladder.length;i++)if(v>=ladder[i])t=i+1;return t;}

function evaluate(d,name,fired){
  var p=ensure(d,name),list=defs();
  for(var i=0;i<list.length;i++){var def=list[i];
    var t=tierOf(def.ladder,valFor(def,p));
    var prev=(p.earned[def.id]&&p.earned[def.id].tier)||0;
    if(t>prev){
      p.earned[def.id]={tier:t,at:Date.now()};
      fired.push({player:name,id:def.id,name:def.name,tier:t,tiers:def.ladder.length,
        tierName:TIER_NAMES[Math.min(t-1,TIER_NAMES.length-1)],
        threshold:def.ladder[t-1],leveledUp:prev>0});
    }
  }
}

/* ---- public API ---- */
var Achievements={
  ladders:function(){return {played:PLAYED_LADDER.slice(),total:TOTAL_LADDER.slice(),
    wins:WIN_LADDER.slice(),tierNames:TIER_NAMES.slice()};},
  nameFor:function(key){return NAMES[key]||key;},
  metricFromRec:function(key,rec){var f=METRIC[key];if(!f||!rec)return null;var v=rec[f];return typeof v==="number"?v:null;},
  knownGames:function(){return Object.keys(NAMES);},

  /* Record one finished game.  ctx:
   *   gameKey   storage key of the game (e.g. "c4_games")
   *   players   array of participant names (solo -> [onePlayer])
   *   winner    winner's name or null
   *   metric    optional higher-is-better number (score/level/wave)
   *   metricPlayer  who the metric belongs to (defaults to players[0])
   * Returns an array of newly-earned / leveled-up badges (for the ceremony). */
  applyResult:function(ctx){
    ctx=ctx||{};var d=load(),fired=[];
    var parts=uniq(ctx.players);
    for(var i=0;i<parts.length;i++){var p=ensure(d,parts[i]);
      if(ctx.gameKey){p.played[ctx.gameKey]=(p.played[ctx.gameKey]||0)+1;}
      p.totalPlayed=(p.totalPlayed||0)+1;}
    if(ctx.winner){var w=ensure(d,ctx.winner);w.wins=(w.wins||0)+1;}
    if(ctx.metric!=null&&ctx.gameKey){
      var mp=ctx.metricPlayer||parts[0];
      if(mp){var m=ensure(d,mp);m.best[ctx.gameKey]=Math.max(m.best[ctx.gameKey]||0,ctx.metric);}
    }
    uniq(parts.concat(ctx.winner?[ctx.winner]:[])).forEach(function(n){evaluate(d,n,fired);});
    save(d);
    return fired;
  },

  /* Everything a player has, for display (earned + in-progress, with next target). */
  forPlayer:function(name){
    var d=load(),p=d.players[name]||{played:{},totalPlayed:0,wins:0,best:{},earned:{}};
    return defs().map(function(def){
      var v=valFor(def,p),t=tierOf(def.ladder,v);
      return {id:def.id,name:def.name,kind:def.kind,key:def.key||null,
        value:v,tier:t,tiers:def.ladder.length,ladder:def.ladder.slice(),
        tierName:t>0?TIER_NAMES[Math.min(t-1,TIER_NAMES.length-1)]:null,
        next:t<def.ladder.length?def.ladder[t]:null,earned:t>0};
    });
  },
  summary:function(name){var ach=this.forPlayer(name);
    return {earned:ach.filter(function(a){return a.earned;}).length,total:ach.length,
      tiersEarned:ach.reduce(function(s,a){return s+a.tier;},0)};},
  players:function(){return Object.keys(load().players);},
  reset:function(){_mem={players:{}};try{localStorage.removeItem(SKEY);}catch(e){}}
};

if(typeof window!=="undefined"){window.Achievements=Achievements;if(window.GN)window.GN.achievements=Achievements;}
if(typeof module!=="undefined"&&module.exports)module.exports=Achievements;
})();
