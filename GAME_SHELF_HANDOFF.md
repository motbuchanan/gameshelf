# GAME SHELF — HANDOFF (post-v33, June 2026)

Family pass-and-play web games by Mot (wife Kathy, son Garrett; Caleb gives feedback).
Live: motbuchanan.github.io/gameshelf · repo motbuchanan/gameshelf (Pages from main).
**The newest gameshelf zip uploaded to the chat is the current code — work from it, not from stale project files.**
CLAUDE.md inside the zip is the living engineering log: full version history, conventions, hard-won gotchas. READ IT FIRST.

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
- True storage keys (don't guess): chess/scrabble/bridge/sorry/trouble/guesswho/checkers/ur/c4/bs/yahtzee/bg/mancala/dom/gofish/war/farkle/reversi/morris/gomoku/uttt/hex/dots/sl/sb/cc/cb + "_games".
- Zips: full versioned zips on request; Mot uploads to GitHub manually; remind him new files must all land.

## Known soft edges (accepted)
- vs-Computer games are FRIENDLY by design → never recorded (beating the bot won't appear in the Record Book; intended, not a bug).
- After a FRIENDLY game finishes, header shelf link prompts once (recordGame never fires).
- Chess opening repetition (no book/noise at L9-10) — RESOLVED in r2 (near-best opening randomization).
- ur_games/chess_games cloud sync now registered; older devices need a visit to pick up runtime.
