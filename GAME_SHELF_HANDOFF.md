# GAME SHELF — HANDOFF (post-v28, June 2026)

Family pass-and-play web games by Mot (wife Kathy, son Garrett; Caleb gives feedback).
Live: motbuchanan.github.io/gameshelf · repo motbuchanan/gameshelf (Pages from main).
**The newest gameshelf zip uploaded to the chat is the current code — work from it, not from stale project files.**
CLAUDE.md inside the zip is the living engineering log: full version history, conventions, hard-won gotchas. READ IT FIRST.

## State at handoff (v28, 45 files, 27 games)
- PWA installed & loved: sw.js is NETWORK-FIRST → uploads appear on plain refresh. NO MORE ?v= cache busting (existing refs are inert fossils). Bump sw.js CACHE const ONLY when the precache file LIST changes (currently gameshelf-v5).
- v26 icon fix: manifest/sw.js/index.html referenced hyphenated icon names (icon-192.png…) that 404'd against the real files (icon192.png, icon512.png, iconmaskable512.png) — broke install icons AND the atomic addAll precache (one 404 rejected the whole offline seed). Repointed to real names; CACHE v4→v5 to reseed.
- v27 Easy View: per-device large-text/large-target toggle (🔎 on the shelf, beside TV mode; localStorage gn_easy). GN.easyView in gamenight.js sets html.gn-easy at load on every page → injected stylesheet enlarges the SHARED CHROME (seat picker, end-game buttons, Rules/Stats modals, dialogs) across all games; shelf enlarges its own tiles/text. Default OFF. Phase 1 = chrome + shelf; Phase 2 (per-game board scaling, screenshot-tuned) NOT done. NB latent bug surfaced: TV mode key mismatch (chess gn_tv vs shelf shelf_tv) — unfixed.
- Runtime gamenight.js: matchStart/recordGame(friendly skips)/rulesButton(t|p + svg + ex)/statsButton/cubeDie/sync/GAME_KEYS(incl chess_games, ur_games)/fat-finger guard (GN._inPlay + confirmEnd; exempts .gnOv + #overlay)/GN.pinchZoom (wired: scrabble, bridge).
- bot.js: 3-level minimax/policy (trouble, checkers, reversi, ur). Chess has its OWN engine+AI in-page (levels 1-10).
- Bookshelf: rules.html (reads rulesdata.js — GENERATED from games' rulesButton sections; REGENERATE on any rules change, script in CLAUDE.md/transcripts), records.html (leaderboard; charts promised as "future edition"), howto.html.
- CHESS = flagship: perft-certified engine, L1-10 ladder (calibrated N beats N-2), coach (hint/blunder nudge/takeback), 4×4 themes, original SVG pieces. Sent to Mot's chess-playing coworker — feedback may arrive. r2 SHIPPED (v28): opening variety (random among moves within OPENING_SPREAD=35cp of best for first OPENING_MOVES=5 — varied AND sound, harness-verified 0 weak picks) + end-game "3 moves that decided it" recap (static-eval swings, RECAP_MIN=60cp).

## Untested by humans (verdicts pending)
- Chess entirely (strength feel, coach, themes, piece art on a real phone) + r2 recap wording and OPENING_SPREAD/RECAP_MIN thresholds (await Mot's eye on a real game)
- Pinch-zoom gesture feel on Scrabble/Bridge (decides rollout to battleship + canvas games — canvas games need tap-math audit first: rect-relative scaling survives CSS transforms, offsetX does not)
- Pop sound v3 (Caleb), bookshelf pile look, fat-finger guard in real play
- Easy View on a real phone (grandmother) — is the chrome/text big enough; tile-title size (.name 20px) and shelf bumps are first guesses to tune by screenshot

## Roadmap (who drives)
MOT AT THE WHEEL (design sessions, evenings):
1. Guess Who character editor → design the Yanke coworker board together (next big build) — DESIGN CAPTURED in MAKER_SPEC.md
2. House Rules Decks (Caleb's feature — design chat before any code) — folded into MAKER_SPEC.md (the unified "Maker": in-app wizard → friendly labeled block → Mot relays to Claude → validate → ship as additive deck/board/ruleset). Guess Who is first target; standard Apples/Codenames decks bake in.
SOLO-GRINDABLE:
3. Record Book charts/visualizations (win streaks, head-to-head, trends)
4. Looks pass: snakes, gomoku, uttt, chinese, dots, shutbox
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
- After a FRIENDLY game finishes, header shelf link prompts once (recordGame never fires).
- Chess opening repetition (no book/noise at L9-10) — RESOLVED in r2 (near-best opening randomization).
- ur_games/chess_games cloud sync now registered; older devices need a visit to pick up runtime.
