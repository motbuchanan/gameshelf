/* Game Shelf service worker — NETWORK-FIRST.
   Online: every request goes to the network, so uploads appear on plain refresh
   (no more ?v= cache-busting). Successful responses are cached as they fly by.
   Offline: requests fall back to the cache, so the whole shelf plays with no signal.
   CACHE name only needs bumping when the precache LIST changes (e.g. a new game),
   to seed offline copies; day-to-day edits need nothing. */
const CACHE="gameshelf-v30";
const CORE=["index.html","gamenight.js","sfx.js","bot.js","words.js","achievements.js","manifest.webmanifest",
  "icon192.png","icon512.png","iconmaskable512.png",
  "rules.html","records.html","achievements.html","highscores.html","howto.html","profiles.html","rulesdata.js","backup.html",
  "wordsearch.html","wordsearch.js","sudoku.html","sudoku.js",
  "maze.html","nonogram.html","spot.html","crossword.html","slide.html","crypto.html",
  "backgammon.html","battleship.html","bridge.html","checkers.html","chess.html","chinese.html",
  "codebreaker.html","connect4.html","dominoes.html","dots.html","farkle.html",
  "gofish.html","gomoku.html","guesswho.html","hex.html","mancala.html","morris.html",
  "reversi.html","scrabble.html","shutbox.html","snakes.html","sorry.html","trouble.html","urgame.html",
  "uttt.html","war.html","yahtzee.html","onecardleft.html",
  "knucklebones.html","pig.html","craps.html","liarsdice.html",
  "blackjack.html","solitaire.html","memory.html","gin.html","oldmaid.html",
  "snake.html","paddleduel.html","brickbreak.html","blocks.html","stardefender.html","minesweeper.html","match3.html",
  "salon-dash.html","hexempire.html","theorb.html","dollhouse.html","magic8.html","beatforge.html","harmonica.html","sharp.html"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(
    ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
function stripped(req){const u=new URL(req.url);return u.origin+u.pathname;}
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  const u=new URL(req.url);
  if(u.origin!==location.origin)return; // Firebase etc. go straight through
  e.respondWith(
    fetch(req).then(resp=>{
      if(resp&&resp.ok){const cl=resp.clone();caches.open(CACHE).then(c=>c.put(stripped(req),cl));}
      return resp;
    }).catch(()=>caches.match(stripped(req)).then(m=>m||caches.match("index.html")))
  );
});
