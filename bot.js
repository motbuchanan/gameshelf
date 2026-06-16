/* ============================================================
   bot.js — shared AI opponent for the Game Shelf.
   Drop-in for any game. Loads AFTER gamenight.js. Attaches GN.bot (and window.GNBot).

   A game supplies a "spec" describing its rules; the engine does the thinking.

   spec = {
     current(state) -> side        // whose turn it is in `state` ("A" / "B" / 1 / 2 ... any token)
     moves(state)   -> [move,...]   // legal moves for the side to act
     apply(state,m) -> newState     // MUST NOT mutate `state` — return a fresh copy
     terminal(state)-> bool         // is the game over in `state`?
     evaluate(state, me) -> number  // board score from `me`'s perspective (+ good for me).
                                     //   At a win for me return a big +; loss a big -.
     // OPTIONAL — for dice/card/chance games where minimax doesn't fit:
     policy(state, level) -> move   // return a move directly; engine skips the search.
   }

   Usage:
     const move = GN.bot.chooseMove(state, spec, "easy");   // synchronous
     GN.bot.play(state, spec, level, move => { ...apply move... });  // with a natural delay

   Skill levels (tunable in one place below):
     easy   — looks 1 move ahead, blunders often       (good for a beginner to learn against)
     medium — looks a few moves ahead, occasional slip
     hard   — full-depth, always the best move it sees
============================================================ */
(function(){
  "use strict";
  var Bot = {};

  // ---- skill presets ---------------------------------------------------
  // depth   : how many plies the search looks ahead (bigger = stronger, slower)
  // blunder : chance per move of throwing the search away and playing a random legal move
  // topN    : when NOT blundering, pick randomly among this many best moves (variety)
  Bot.LEVELS = {
    easy:   { key:"easy",   label:"Easy",   depth:1, blunder:0.55, topN:4 },
    medium: { key:"medium", label:"Medium", depth:3, blunder:0.18, topN:2 },
    hard:   { key:"hard",   label:"Hard",   depth:6, blunder:0.00, topN:1 }
  };
  Bot.LEVEL_ORDER = ["easy","medium","hard"];

  function resolve(level){
    if(!level) return Bot.LEVELS.medium;
    if(typeof level === "string") return Bot.LEVELS[level] || Bot.LEVELS.medium;
    return level; // already a preset object (allows custom {depth,blunder,topN})
  }

  // ---- minimax with alpha-beta ----------------------------------------
  // Returns a numeric score from `me`'s perspective. Node cap guards runaway trees.
  function search(state, spec, depth, alpha, beta, me, budget){
    if(budget.n++ > budget.cap) return spec.evaluate(state, me);
    if(depth <= 0 || spec.terminal(state)) return spec.evaluate(state, me);
    var moves = spec.moves(state);
    if(!moves.length) return spec.evaluate(state, me);
    var side = spec.current(state), i, v;
    if(side === me){ // maximizing
      var best = -Infinity;
      for(i=0;i<moves.length;i++){
        v = search(spec.apply(state, moves[i]), spec, depth-1, alpha, beta, me, budget);
        if(v > best) best = v;
        if(best > alpha) alpha = best;
        if(alpha >= beta) break; // prune
      }
      return best;
    } else { // minimizing (opponent)
      var worst = Infinity;
      for(i=0;i<moves.length;i++){
        v = search(spec.apply(state, moves[i]), spec, depth-1, alpha, beta, me, budget);
        if(v < worst) worst = v;
        if(worst < beta) beta = worst;
        if(alpha >= beta) break; // prune
      }
      return worst;
    }
  }

  // Score every root move (best first). Useful for UI / testing / variety.
  Bot.scoredMoves = function(state, spec, level){
    var L = resolve(level);
    var me = spec.current(state);
    var moves = spec.moves(state);
    var budget = { n:0, cap: 120000 };
    var scored = moves.map(function(m){
      return { move:m, score: search(spec.apply(state, m), spec, L.depth-1, -Infinity, Infinity, me, budget) };
    });
    scored.sort(function(a,b){ return b.score - a.score; });
    return scored;
  };

  // Pick a move honoring the skill level.
  Bot.chooseMove = function(state, spec, level){
    var L = resolve(level);
    if(typeof spec.policy === "function") return spec.policy(state, L); // chance/heuristic games
    var moves = spec.moves(state);
    if(!moves.length) return null;
    if(moves.length === 1) return moves[0];
    // blunder: occasionally just play something random (this is what makes Easy beatable)
    if(Math.random() < L.blunder) return moves[(Math.random()*moves.length)|0];
    var scored = Bot.scoredMoves(state, spec, L);
    // among the best `topN`, pick at random so the bot isn't robotically identical each game
    var pool = Math.max(1, Math.min(L.topN, scored.length));
    // keep only moves genuinely tied-or-near the top for hard; looser for easy
    return scored[(Math.random()*pool)|0].move;
  };

  // Convenience: choose after a short, human-feeling delay, then hand the move to cb.
  Bot.play = function(state, spec, level, cb, delayMs){
    var d = (delayMs == null) ? 550 : delayMs;
    setTimeout(function(){ cb(Bot.chooseMove(state, spec, level)); }, d);
  };

  // ---- shared UI control ----------------------------------------------
  // Renders one button that cycles Off -> Easy -> Medium -> Hard -> Off.
  // onChange(levelKey|null) fires each tap. Returns the button element.
  // Style matches the games' existing ".act.ghost" buttons.
  Bot.skillButton = function(container, opts){
    opts = opts || {};
    var seq = [null].concat(Bot.LEVEL_ORDER); // null = off
    var idx = 0;
    if(opts.start){ var p = seq.indexOf(opts.start); if(p>=0) idx = p; }
    var b = document.createElement("button");
    b.className = "act ghost";
    function labelFor(k){ return "vs Computer: " + (k ? Bot.LEVELS[k].label : "Off"); }
    function paint(){ b.textContent = labelFor(seq[idx]); }
    b.addEventListener("click", function(){
      idx = (idx + 1) % seq.length;
      paint();
      if(opts.onChange) opts.onChange(seq[idx]);
    });
    paint();
    if(container) container.appendChild(b);
    if(opts.onChange && opts.start) opts.onChange(seq[idx]);
    return b;
  };

  // expose
  if(typeof window !== "undefined"){
    window.GNBot = Bot;
    if(window.GN) window.GN.bot = Bot;
  }
  if(typeof module !== "undefined" && module.exports) module.exports = Bot; // for tests
})();
