# GAME SHELF — HANDOFF (post-v37, June 2026)

Family pass-and-play web games by Mot (wife Kathy, son Garrett; Caleb gives feedback).
Live: motbuchanan.github.io/gameshelf · repo motbuchanan/gameshelf (Pages from main).
**The newest gameshelf zip uploaded to the chat is the current code — work from it, not from stale project files.**
CLAUDE.md inside the zip is the living engineering log: full version history, conventions, hard-won gotchas. READ IT FIRST.

## State NOW (June 2026 — RETRO ARCADE + ACHIEVEMENTS; SW gameshelf-v16, 33 games + 2 puzzle books) — newest first

Shelf bookshelf now has 8 spines: Rulebook, Record Book, **Achievements**, **High Scores**, How-To, Word Search, Sudoku, Players. Runtime still **gamenight.js?v=12** (network-first SW; ?v inert). sw.js CACHE bumped **v14→v16** (precaches the 5 arcade games + achievements.html + highscores.html).

### Retro arcade — 5 NEW house games (original code; generic/house names, no trademarks)
Single-file canvas games matching the game-page shell (⌂ Shelf bar, GNS sounds via `S(n)`, Rules + Sound buttons, best-score, game-over overlay). Touch + keyboard + on-screen controls. Each records via GN.recordGame with a numeric metric. All 5 wired into index.html GAMES (cover-art SVGs, viewBox 0 0 100 100) and sw.js precache.
- **Snake** (snake.html, key `snakearcade_games`, metric `score`) — 16×16 grid, eat/grow/speed-up; swipe + d-pad + arrows. NB DISTINCT from snakes.html (Snakes & Ladders, key sl_games).
- **Paddle Duel** (paddleduel.html, `paddleduel_games`) — house Pong; vs-Computer OR 2-player pass-and-play, first to 5. (Versus, no challenge ladder; NOT in the solo who's-playing picker.)
- **Brick Break** (brickbreak.html, `brickbreak_games`, metric `score`) — Breakout; ENDLESS descending rows + 3 lives; red danger line = game over if bricks reach the paddle.
- **Blocks** (blocks.html, `blocks_games`, metric `level`) — Tetris; 7 pieces, wall-kick rotate, ghost preview, levels every 10 lines, next-piece.
- **Star Defender** (stardefender.html, `stardefender_games`, metric `wave`) — Space Invaders; AUTO-FIRE, endless escalating waves, 3 lives.

### Achievements + High Scores — TWO SEPARATE systems (Mot specced the split)
**achievements.js** — standalone, data-driven ENGINE. Load after gamenight.js; storage `gn_achievements` (localStorage + in-memory fallback). Auto-loaded on EVERY page by a loader appended to the end of gamenight.js (no per-game `<script>` needed). PER-PLAYER tiered milestones; everyone can earn the same ones:
- Per-game "played" ladder **1/10/50/100/250** → Newcomer/Regular/Veteran/Devotee/Legend (`PLAYED_LADDER` + `TIER_NAMES` constants at top — tune there).
- Cross-game "Game Nights" (totalPlayed) + "Winner" (wins) ladders (`TOTAL_LADDER`/`WIN_LADDER`).
- Per-game CHALLENGE ladders on a best metric: Snake/Brick Break (score), Blocks (level), Star Defender (wave) — `CHALLENGES` + `METRIC` maps.
- API: `applyResult(ctx{gameKey,players,winner,metric,metricPlayer})` → returns newly-earned/leveled badges; `forPlayer(name)`, `summary`, `players`, `nameFor`, `metricFromRec`, `knownGames`, `ladders`, `reset`. (No `all()` — derive via forPlayer.)

**Wire-in lives in gamenight.js (centralized — zero per-game edits beyond the arcade picker):**
- `GN.recordGame` now ends with `try{GN._award(key,rec)}catch(e){}` — achievements can NEVER break recording. `GN._award` feeds the engine with participants + metric, then `GN._ceremony(fired)` pops a celebratory overlay (`#gnAch`, ~500ms after game-over, GNS fanfare).
- Participants captured into **`GN._participants`** at matchStart (1p→[a]; vs→[a,b]; cpu→[a]) and partyStart (non-bot seats). Winner credited ONLY if it's a real participant (`_BADW` filter drops tie/(draw)/Computer/You).
- **`GN.soloStart(done,opts)`** = "Who's playing?" picker (roster chips via .gnSeat + a "just for fun — won't be saved" toggle); sets GN._participants + GN.friendly; remembers last via `gn_solo_player`. Wired into the 4 SOLO arcade games (snake/brickbreak/blocks/stardefender) on load (`pickPlayer()`), plus a tappable **#who** badge in the bar to switch player (uses `GN.whoBadge`).

**achievements.html** — per-player Achievements VIEW (Record-Book book aesthetic): player picker, Overall / Challenges / Games-played sections, tier medals + progress-to-next-tier, **"Preview sample"** toggle (in-memory synth, never written to storage).
**highscores.html** — High Scores BOOK = single-holder FIRST-PLACE titles (conceptually DIFFERENT from achievements): 👑 Most Wins + 🪙 Most Coin Flips (from the household ledger **GN.g** — these ALREADY sync via Firebase), 🎮 Most Games Played (engine totalPlayed), top score per arcade game (engine bests), and per-game champions (most wins, counted from per-game records). "Preview sample" toggle.

**KNOWN GAP — the only remaining piece:** achievement badges + per-game top-scores are stored PER DEVICE (`gn_achievements`, no Firebase mirror yet) → they differ between phones. The ledger-backed titles (Most Wins, Most Coin Flips) DO sync. Next optional chunk: mirror `gn_achievements` like GN.g does, OR recompute per-player best/played from the already-synced per-game records.

### Bug fix shipped earlier this session
- **Bot-freeze fix** (dots/connect4/mancala vs-Computer "did nothing"): those 3 called `GN.bot.play` but never loaded bot.js → silent throw on the computer's turn. Added `<script src="bot.js?v=1">` to all three + a fail-loud guard in each `maybeBot()` ("Computer's brain didn't load — reload"). (SW bumped v13→v14 then; v16 now supersedes.)

### Concept only — NOT live, NOT in the zip
- **shelf2.html** = "standing-boxes cabinet" redesign concept (5-across rich-cover board grid, standing card-game boxes, activity books, retro cases, pull-off-the-shelf tap-to-enlarge). Iterated with Mot to a state he likes; NOT cut over to live index.html.

## State (prior session — post-v37, 28 games + 2 books) — newest first
- **MULTIPLAYER** exists: `GN.partyStart(done,{min,max,start,toggles})` — a separate 2–4 seat picker (humans and/or computers, per-seat difficulty, distinct colors, random first, forced friendly). matchStart (the 2-seat picker) is untouched. partyStart also renders optional **house-rule toggle switches** (opts.toggles → persisted, returned as `rules:{}` in the payload). So far One Card Left! is its only consumer.
- **"ONE CARD LEFT!"** = the shelf's first house CARD game (original name + original card art; Uno-family mechanics are free). Pure engine `tools/ocl_engine.js` (108 cards, match color-or-kind, Skip/Reverse/Draw2/Wild/Wild4, draw-until-playable, auto announce, conservation-proven over thousands of harness games) embedded BYTE-IDENTICAL into onecardleft.html. Rich SVG card art, GNS sounds (🔊 in #bar; respects global mute), flying-card animations, pass-the-device for multi-human / auto-bots for solo-vs-computers. In the Rulebook + an in-game "?" (both generated from one canonical `tools/ocl_rules.js` so they can't drift). Tile = 2nd on the shelf; never recorded (friendly). sw.js CACHE bumped to v6 (onecardleft.html precached).
- **House rule STACKING** (toggle in the picker, off by default): a Draw card can be answered with another Draw card (any +2/+4, "any on any") — `st.pending` builds, shown as a red **+N** on the discard, until someone taps **Take N** and is skipped. Engine-level (`st.pending`, `playable()`, `takeStack`, botMove handles it); validated ~8,500 harness games (conservation never broke) + 8 in-page play-throughs.
- **JUMP-IN is the next planned chunk** (Mot wants it; not built). It's a real-time "everyone watching" mechanic at odds with pass-and-play. Recommended first scope: the one-human-vs-computers mode (hand always visible). Toggle plumbing already supports adding a "Jump-in" switch beside "Stacking". See CLAUDE.md v37 for the engine hook sketch.
- Everything in the "State at handoff (v33…)" block below still holds (books, vs-Computer-in-the-picker, recolor, Easy View, chess flagship, network-first SW, upload ritual). Runtime is still gamenight.js?v=12.

## State at handoff (v33, 50 files, 27 games + 2 puzzle books)
- TWO PUZZLE BOOKS now on the shelf (a new category — books, not games: no picker/records, no GAME_KEYS). Each = a validated generator in tools/ + a flat data .js + an HTML player + a bookshelf spine; neither is in the SW precache (network-first caches them on visit). WORD SEARCH (wordsearch.html/.js, wsgen.py): 10 themed 13×13 grids, two-tap select. SUDOKU (sudoku.html/.js, sudokugen.py): 10 gentle puzzles, pen + pencil marks, live wrong-flagging, hint, RESUME via localStorage "shelf_sudoku". Generators ship a page ONLY when proven correct (word search: every word real + re-found; sudoku: unique solution + singles-only solvable, double-checked by a second solver). Both built so MORE/HARDER content slots in later (sudoku carries difficulty:"gentle" for future tiers; word search just needs more themed pages).
- vs COMPUTER now lives in the SEAT PICKER for every bot game — the old footer "skill button" is retired everywhere. GN.matchStart(done,opts): opts.bot → a "vs Computer" mode + Easy/Med/Hard; opts.solo → "1 player"; opts.botSimple → vs-Computer with no difficulty (war/snakes). The picker ASKS for difficulty (nothing pre-selected; Start is disabled "Pick a difficulty" until you tap one) and COIN-FLIPS for who goes first vs the Computer (CPU can move first). vs-Computer is always FRIENDLY (never recorded). done payload: {bot:level, vsComputer:true}.
- PLAYER RECOLOR: picker "🎨 change a color" → GN.recolorPlayer(name,pal) rewrites the roster, psaves, and set()s the FULL list to Firebase (arrayUnion can't replace) so the new color syncs to every device. (Token colors live in household sync, not code — this is the only correct way to change one.)
- PWA installed & loved: sw.js is NETWORK-FIRST → uploads appear on plain refresh. NO ?v= cache busting (existing refs are inert fossils). Bump sw.js CACHE const ONLY when the precache file LIST changes (currently gameshelf-v5; books/games are NOT in it).
- v26 icon fix (history): manifest/sw.js/index.html had hyphenated icon names that 404'd vs the real files (icon192.png, icon512.png, iconmaskable512.png) — broke install icons AND the atomic addAll precache. Repointed; CACHE v4→v5.
- v27 Easy View: per-device large-text/large-target toggle (🔎 on the shelf; localStorage gn_easy). GN.easyView sets html.gn-easy at load on every page → injected stylesheet enlarges SHARED CHROME (seat picker, end-game buttons, Rules/Stats modals); each page/book adds its own html.gn-easy rules for its board. Default OFF. Phase 2 (per-game board scaling) NOT done. NB latent bug: TV mode key mismatch (chess gn_tv vs shelf shelf_tv) — unfixed.
- Runtime gamenight.js: matchStart (now with solo / bot / botSimple modes + ask-difficulty + coin-flip-first vs Computer + 🎨 recolor) / recordGame(friendly skips) / recolorPlayer / rulesButton(t|p + svg + ex) / statsButton / cubeDie / sync / GAME_KEYS(incl chess_games, ur_games) / fat-finger guard (GN._inPlay + confirmEnd; exempts .gnOv + #overlay) / GN.pinchZoom (wired: scrabble, bridge) / GN.easyView.
- bot.js: 3-level minimax/policy engine. Now driving (via the picker): connect4, mancala, dots, war, snakes, checkers, reversi, ur, trouble. War/Snakes use botSimple (no difficulty). Chess has its OWN engine+AI in-page (levels 1-10). The footer GN.bot.skillButton helper is retired (still in bot.js, unused).
- Bookshelf: 5 spines — rules.html (reads rulesdata.js — GENERATED from games' rulesButton sections; REGENERATE on any rules change, script in CLAUDE.md/transcripts), records.html (leaderboard; charts promised as "future edition"), howto.html, + two BOOKS: wordsearch.html, sudoku.html.
- CHESS = flagship: perft-certified engine, L1-10 ladder (calibrated N beats N-2), coach (hint/blunder nudge/takeback), 4×4 themes, original SVG pieces. Sent to Mot's chess-playing coworker — feedback may arrive. r2 SHIPPED (v28): opening variety (random among moves within OPENING_SPREAD=35cp of best for first OPENING_MOVES=5 — varied AND sound, harness-verified 0 weak picks) + end-game "3 moves that decided it" recap (static-eval swings, RECAP_MIN=60cp).

## Untested by humans (verdicts pending)
- **The 5 retro arcade games on a real phone** (Garrett first): control feel (swipe/d-pad/keys), difficulty/speed curves, Paddle Duel 2-player on one device, best-score tracking. Tunable constants are single values at the top of each (grid size, speeds, ladders).
- **Achievements end-to-end in real play**: the badge ceremony popping after recorded games, the who's-playing picker on the 4 solo arcade games, the #who switch-player badge, the Achievements view + High Scores book populated with real data (medal colors, milestone numbers, layout — all easy to tune).
- The two puzzle BOOKS on a real phone — Word Search and Sudoku (Garrett, and grandmother on Easy View): grid/cell sizes, pencil-mark legibility, the resume flow, hint feel
- The new picker flow on a real device: ask-for-difficulty gating + coin-flip-first vs Computer (does the disabled "Pick a difficulty" Start read clearly; does the CPU-wins-flip-moves-first feel right)
- The five newer bots' strength feel in real play (connect4 / mancala / dots / war / snakes) and the four migrated ones now that difficulty comes from the picker
- Player recolor end to end across two real devices (does Garrett's yellow sync)
- Chess entirely (strength feel, coach, themes, piece art) + r2 recap wording and OPENING_SPREAD/RECAP_MIN thresholds
- Pinch-zoom gesture feel on Scrabble/Bridge (decides rollout to battleship + canvas games — canvas needs tap-math audit first: rect-relative scaling survives CSS transforms, offsetX does not)
- Pop sound v3 (Caleb), bookshelf pile look, fat-finger guard in real play
- Easy View on a real phone (grandmother) — is the chrome/text big enough

## Roadmap (who drives)
MOT AT THE WHEEL (design sessions, evenings):
1. Guess Who character editor → design the Yanke coworker board together (next big build) — DESIGN CAPTURED in MAKER_SPEC.md
2. House Rules Decks (Caleb's feature — design chat before any code) — folded into MAKER_SPEC.md (the unified "Maker": in-app wizard → friendly labeled block → Mot relays to Claude → validate → ship as additive deck/board/ruleset). Guess Who is first target; standard Apples/Codenames decks bake in.
SOLO-GRINDABLE:
3. Record Book charts/visualizations (win streaks, head-to-head, trends)
4. Looks pass: snakes, gomoku, uttt, chinese, dots, shutbox
4b. Puzzle books — expand: SUDOKU difficulty tiers (Medium/Hard sets — sudokugen.py already digs deeper toward harder/minimal; every puzzle is already tagged difficulty, so it's "generate tagged sets + add a difficulty picker to sudoku.html"); more WORD SEARCH themed pages; and CROSSWORDS (still BLOCKED on a curated clue corpus ~600-1000 words = the real foundation; deferred each time in favor of shippable books).
5. Chess polish r2: opening variety + "3 moves that decided it" recap — DONE (v28). Remaining: tune OPENING_SPREAD/RECAP_MIN by screenshot.
6. Seasonal shelf decorations — DESIGNED, not built. Scope: SHELF CHROME ONLY, boards untouched (avoids semantic-color collapse inside games). Procedural SVG (no image files, no precache impact, copyright-clean). Manually chosen, "none" is default + resting state (auto-by-date deferred). Each set = a named "bin in the closet" in a small list on index.html; accumulates forever. First set: July 4th (bunting + corner stars). Sibling to the Maker registry — accumulating named data objects.
7. Backlog games: Liar's Dice, Cribbage, Gin, Quoridor, Stratego-ish, Hnefatafl, Fox&Geese
8. Bluetooth controller support (+ its waiting howto entry)
9. Easy View Phase 2 — per-game board/piece scaling under html.gn-easy, one game at a time, screenshot-tuned, single size constant each; start with grandma's favorites.

## Working agreements
- Build in small validated chunks; ship a zip at every seam; stop before generation limits rather than push through.
- Validate EVERYTHING: awk-extract inline scripts → node --check; brace counts; logic harnesses for engines (perft for chess); boot tests w/ DOM stubs; patch scripts use assert + grep-verify. Paren-counting (not regex) to find call ends; never prepend statements to expression arrows.
- Mot iterates by screenshot and decides looks; favor single tunable constants (--w/--rot style).
- Copyright: mechanics free, branded content not; original art/text only; house versions fine for family play. Kid-appropriate always (Garrett plays and helps build).
- True storage keys (don't guess): chess/scrabble/bridge/sorry/trouble/guesswho/checkers/ur/c4/bs/yahtzee/bg/mancala/dom/gofish/war/farkle/reversi/morris/gomoku/uttt/hex/dots/sl/sb/cc/cb + "_games"; arcade: snakearcade_games, paddleduel_games, brickbreak_games, blocks_games, stardefender_games. Non-record localStorage: gn_achievements (per-player badges/bests), gn_solo_player (last who's-playing pick), gn_global (household ledger: wins, flips, dice…).
- Zips: full versioned zips on request; Mot uploads to GitHub manually; remind him new files must all land.

## Known soft edges (accepted)
- vs-Computer games are FRIENDLY by design → never recorded (beating the bot won't appear in the Record Book; intended, not a bug).
- After a FRIENDLY game finishes, header shelf link prompts once (recordGame never fires).
- Chess opening repetition (no book/noise at L9-10) — RESOLVED in r2 (near-best opening randomization).
- ur_games/chess_games cloud sync now registered; older devices need a visit to pick up runtime.
