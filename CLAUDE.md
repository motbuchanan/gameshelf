# The Game Shelf — Project Handoff

*Last verified: 2026-06-14 (later) · runtime `gamenight.js?v=12` · 28 games + 2 puzzle books · vs-Computer in the picker · MULTIPLAYER (2-4, humans+computers) via GN.partyStart · One Card Left! card game with house STACKING toggle · (early history below says 19 games / ?v=6 — living log is at the BOTTOM)*

---

## What this is

A single-player-device collection of two-player (soon multiplayer) browser games
for Mot and his family, living at **motbuchanan.github.io/gameshelf/**
(repo: github.com/motbuchanan/gameshelf, lowercase). Mot is red, Kathy is blue,
Garrett is green. Plays on phone, desktop, and Fire Stick. No app, no install,
no batteries — hence the footer: "Built by Mot · one shelf, no batteries."

---

## Current state — 19 games, all verified booting

**Originals (1–10):** Sorry!, Checkers, Connect Four, Trouble, Mancala
(Kalah + Avalanche modes), Dominoes, Yahtzee, Battleship, Chinese Checkers,
Backgammon.

**Added this run (11–19):** War, Pig, Shut the Box, Snakes & Ladders,
Ultimate Tic-Tac-Toe, Gomoku, Dots and Boxes, Hex, Code Breaker (Mastermind).

Every game carries the full Game Night standard: player picker, 3D coin flip,
friendly-game toggle, stats page, rules page, and household cloud sync.

**Audit result (2026-06-11):** all 21 files pass syntax + CSS brace balance,
all element IDs resolve, all 19 index links map to existing files with matching
storage keys, runtime API surface fully present (matchStart, recordGame,
readGames, openStats, statsButton, rulesButton, addPlayer, palette, cubeDie,
sync, g.addDice/addFlip). All 19 games boot against the runtime.
Note: Sorry! has its own camera/zoom system (`window.camReset`) that predates
the planned shared camera layer; it is correctly guarded and works in production
— a harness-only load-order artifact is the single "failure" seen in testing
and is not a real bug.

---

## Files (21 total)

```
index.html        The shelf — box art, shelves, tally, sync button, reset
gamenight.js       SHARED RUNTIME — loaded by every game as ?v=N
backgammon.html   checkers.html   chinese.html   codebreaker.html
connect4.html     dominoes.html   dots.html      gomoku.html
hex.html          mancala.html    pig.html       shutbox.html
snakes.html       sorry.html      trouble.html   uttt.html
war.html          yahtzee.html    battleship.html
```

Working dir: `/home/claude/shelf/`. Ships to `/mnt/user-data/outputs/shelf/`
and zipped to `/mnt/user-data/outputs/gameshelf.zip`.

---

## The cache tag (`?v=N`) — important operational rule

Every game page loads the runtime as `gamenight.js?v=6`. The number is a
**cache key, not a version number** — it forces browsers past their cached copy
of the runtime. It only ever grows; never reset it (reusing a number resurrects
the stale-cache bug it exists to prevent). Currently at **v6**.

- **Game/index HTML changed only** → no bump. Upload just the changed files.
  (Pages serves HTML with a ~10-min cache — the "it needed a min" delay.)
- **gamenight.js changed** → bump N in every page → all 21 files upload that commit.
  This is the cost of a shared runtime, and the reason most builds are small.

---

## Upload ritual (hard-won — both failures we hit were here)

1. Repo → Add file → Upload files → select the changed files
2. Wait for every progress bar to finish
3. **SCROLL DOWN** past the file list → tap the green **Commit changes** button.
   *This is the step that silently gets skipped on mobile.* Navigate away without
   it and everything evaporates with no error.
4. **Verify:** back on the repo file list, pull to refresh — every uploaded file
   should read "X minutes ago." Mixed timestamps = partial commit.
5. Pages redeploys in ~1 min (green check under the Actions tab). Then reload.
   Cached tab still stale? Use an incognito tab to confirm, or wait out the
   10-min HTML cache.

Known gremlins: phone Downloads can rename files (`index-2.html`) — re-name
before committing if you see it. Pasting into GitHub's web editor sidesteps the
rename issue entirely.

---

## Firebase household sync (LIVE, verified working)

- Project: **buchanan-gameshelf**. Config baked into gamenight.js.
- Compat SDK 10.12.2 from gstatic, loaded only when the `gn_sync_hh` flag is set.
- Footer link "Sync this device to the household" → passcode prompt → the
  passcode is hashed (djb2 → base36) into a household ID (`hh_...`).
- Firestore structure: `households/{hh}/state/global`, `.../state/players`,
  `.../records/{gameKey}`. First device seeds the cloud; others adopt via
  onSnapshot live updates.
- Anonymous auth enabled; rules: read/write on `households/{hh}/**` if
  `request.auth != null`. **Verified:** Mot's phone synced and writing
  (household `hh_yjakhc` confirmed in Firestore with state + records).

**Sync rules to remember:**
- The link alone is 100% safe — games run locally, nothing touches Firebase
  unless someone taps Sync AND types a passcode.
- The passcode IS the household. **Never share your passcode** — anyone who types
  it joins (and pollutes) the family ledger. Testers typing their own made-up
  passcode just create their own private household; harmless.
- Testers never need a new URL. The link always serves the current build.
- `GAME_KEYS` in the runtime lists all 19 record keys (verified complete) so
  first-seed and resetCloud cover every game.

---

## How the runtime works (gamenight.js)

`const GN={}; window.GN=GN;` — games read `GN` as a global. Key surface:

- **GN.matchStart(done)** — seat picker (tap chips to cycle players, "+ add a
  player"), friendly toggle, 3D coin flip; calls `done({a,b,first,friendly})`.
  Friendly games leave zero trace (no flip recorded, no result, no global).
- **GN.addPlayer(name, chosenPal?)** — now accepts a chosen palette entry
  (the color picker added this run). 8-color PALETTE. Dup names return existing.
- **GN.palette()** — returns the 8-color palette (for the swatch picker).
- **GN.cubeDie(size)** — SHARED 3D DIE component. Returns `{el, show(v),
  tumble(finalV,opts,done), setBust(bool)}`. True die geometry (opposite faces
  sum to 7), idle tilt, full 3D tumble, soft grounding shadow. Used by Pig,
  Shut the Box, Snakes & Ladders, and (via its own inline copy) Trouble & Yahtzee.
- **GN.g** — global ledger: addFlip, addDice, addSentHome, addResult, read.
- **GN.recordGame(key, rec)** / **GN.readGames(key)** — per-game records.
- **GN.statsButton / GN.rulesButton** — inject footer buttons + overlays.
- **GN.sync** — status/enable/disable/resetCloud.

---

## Working conventions (do not deviate — these are scar tissue)

- **Small validated chunks.** Ship after every chunk. Giant turns died
  mid-generation and Mot lost work. Break large builds into named pieces and
  stop before the generation limit rather than push through.
- **Validate every file edit:** CSS brace balance, `node --check` on the script,
  boot smoke test against the stub harness. Use a heredoc to `/tmp/*.js` — shell
  quoting breaks on braces in `node -e`.
- **Patch scripts assert + grep-verify.** A patch script once died at its first
  assert and silently skipped all later fixes while boots still passed on
  unchanged files. ALWAYS grep-verify a patch actually landed before zipping.
- **Index splices are dangerous.** The box-art array has bitten us twice with
  `}},` double-braces from bad anchors. Anchor on a unique closing fragment and
  syntax-check index immediately after.
- **Mot iterates by screenshot** and is the arbiter of what looks right. Tune
  toward single adjustable constants ("that's 2 numbers I can turn").
- **Test harness stub** lives at `/tmp/stub.js` — a Proxy-based canvas context +
  per-id mock DOM nodes. After loading the runtime, mirror `global.GN =
  global.window.GN` so games resolve `GN` the way a browser does.

---

## Visual / materials campaign (in progress)

The look is moving from flat to physical, one surface at a time, driven by Mot's
screenshots. Established direction: **one light source, top-left, obeyed by every
element** — that coherence is what sells "physical object." Gradients, cast
shadows, material textures (felt, lacquer, plastic sheen, drilled sockets,
cardstock), and weight in movement (squash, spring, settle).

**Done:**
- **3D dice** everywhere (shared cubeDie + Yahtzee's canvas renderer). Lands
  flat & face-up (idle tilt 9°/11°, corner radius 11% — both tunable if needed).
- **Trouble** — flagship pass: molded slate-plastic tray with specular rim,
  drilled sockets, weighted pegs, clear-bubble Pop-O-Matic dome with the 3D die
  under glass. Plus a gameplay fix (see below).
- **The shelf (index)** — wallpaper-textured wall, wood-grain planks with
  contact shadows, box lids as printed cardboard (cardstock texture, key-light
  gloss sweep, letterpress serif titles, print vignette, slight per-box rotation).

**Queued (next visual targets, in suggested order):**
Backgammon (canvas dice from the Yahtzee renderer + felt/lacquer board) →
Checkers → Mancala → Sorry!/Trouble tracks → card games. Plus: SVG rules
diagrams, and Sorry!'s full conversion to the player picker (still partial).

---

## KNOWN BUGS / NEXT-BUILD FIXES (do these first)

1. **Trouble home-space blocking (REPORTED, unconfirmed root cause).** A tester
   hit a deadlock; a finish-line-advance fix shipped (pegs can now advance within
   the finish column and unblock the entrance — 9-case harness passed). Mot then
   reported home spaces may *still* be blocked. **SUSPECT:** when a peg is bumped,
   it's sent back as a generic `{state:"home"}` with no slot index — this may
   stack pegs or confuse re-entry occupancy checks. **Trace with a harness before
   touching anything.** This is top priority — a tester is mid-playtest.

---

## ROADMAP (agreed order)

### Platform work (the "console" layer Mot spec'd)
1. **Trouble home-space bug** — investigate + fix first.
2. **Party seats** — runtime upgrade: 2–6 seat picker, turn-order draw instead of
   coin flip for 3+, records reworked from winner/loser to placements. Then
   per-game enablement:
   - *Cheap:* Snakes & Ladders, Pig, Yahtzee, Shut the Box, Dots and Boxes,
     future card games. (Curtain flow from Battleship/Code Breaker already
     solves hidden hands for any count.)
   - *Board work:* Trouble & Sorry! 4-player (draw 4 entries/runways).
   - *Chinese Checkers:* up to 6 (star has 6 corners).
   - *Permanently 2P:* Checkers, C4, Battleship, Backgammon, Gomoku, Hex, UTTT,
     War, Gin.
3. **Controller layer** (Gamepad API, no app):
   - Virtual cursor (d-pad/stick) + synthesized tap at cursor = every game
     controller-playable with zero per-game work.
   - Four inputs: cursor, **confirm (Do)**, **cancel (Back)**, **peek**.
   - **Hold-to-peek hands** — card hands render on the TV only while the peek
     button is held, then vanish. Replaces the pass-the-phone curtain for
     controller play (curtain stays as no-controller fallback).
   - **Button mapping screen** — "press the button you want for X," captures
     codes, saves a profile **per controller model** and auto-detects which is
     connected. MANDATORY for the Switch-Pro-style pads (their A/B/X/Y are
     physically swapped vs Xbox and they report quirky codes).
   - Test hardware: Mot has VOYEE Switch Pro clones (good — buy more matching
     ones; 8BitDo is the gold standard). Xbox 360 wireless = proprietary dongle,
     won't pair over Bluetooth (skip). PS3 = pre-standard BT (skip).
4. **Camera layer** — perspective tilt of the whole board plane ("table view"),
   stick-driven zoom/pan. Games opt into tilt individually (Trouble/Sorry/Snakes
   love it; Scrabble stays flat). Fire Stick gets the static-tilt conservative
   version per Pi-class performance rules. (Note: Sorry! already has a zoom/pan
   camera — reconcile with the shared layer when built.)

### Game queue (after platform work)
Build order, all public-domain mechanics, all harness-able:

*Quick/mid:* Farkle, Liar's Dice, Othello/Reversi, Nine Men's Morris,
Fox and Geese, Royal Game of Ur, Go Fish.
*Heavies (last):* Gin Rummy, Stratego, Quoridor, Hnefatafl, Cribbage, Chess.

### Flagship (its own multi-session track, parked)
**Scrabble** — the house game, gets full materials treatment from day one.
- Full ENABLE competitive word list (~173k words), shipped as `words.txt` in the
  repo (~1.7MB, ~600KB gzipped, cached after first load, fully offline).
  Mot confirmed: **full competitive list** (QI, ZA, etc. all legal).
- **Word Lab live checking** — words validate green/red and score in real time as
  uncommitted tiles sit on the board; nothing counts until commit. Built for
  playing with Garrett (the board teaches; he experiments freely). House-rule
  departure from tournament play (open dictionary) — the right call for this table.
- Modes: Classic (full scoring — premiums, blanks, bingo, endgame rack
  deductions, curtain between turns) + **Bridge Builders** (from Xbox Family
  Game Night).
- **Bridge Builders rules (partially documented — NEEDS MOT'S PHOTOS):**
  Both players start on the LEFT around the 1/3 mark, race RIGHT to the far edge.
  You may only build off YOUR OWN tiles (not the opponent's). You can cross in
  front of and block the opponent. Bonus tiles spawn in random-but-fairly-spaced
  new locations each game. Reaching the far edge gives bonus points.
  **THE SCORING MATH IS UNDOCUMENTED ONLINE** — two web searches found nothing
  beyond the above. Mot will photograph the in-game rules/options/results screens
  from the Xbox 360. Needs: rules screens, options/toggles screen, mid-game
  score+bonus-tile shot, end-game results breakdown, start positions. This must
  be "perfect" — the family has played it for years without understanding scoring.
- Build shape: (1) board + rack + dictionary + live validation,
  (2) scoring + bag + blanks + curtain + endgame, (3) Bridge Builders + materials.

### After Scrabble — party & RPG tracks (research done, content-heavy)
- **Family Codenames** — house version. The clue language IS the game (family
  names, inside jokes, Garrett's worlds as the word pool). Clean spatial-deduction
  engine; spymaster peek fits the controller layer. The standout of the party tier.
- **Custom judging game** (Apples-to-Apples / CAH-style engine, house-written
  decks) — becomes a platform once built; a deck editor is its own fun build.
  Teaches Garrett to play judging games at parties.
- **House Munchkin** — dungeon-crawl loop (roll/modify/compare/resolve) with the
  numbers filed down and jokes up. Garrett's existing creatures (Monoculus,
  Mismageus, Spaceland/Treat Land canon) become the monster deck. The D&D on-ramp.
- **Family d20 / kid RPG** — see the separate RPG research doc. Legally wide open
  (SRD 5.1 & 5.2.1 are Creative Commons, irrevocable). Recommendation: a custom
  light d6 system (not full d20) in Mot's world with Garrett's creatures, built
  GM-toolkit-first, with SRD/d20 as what Garrett graduates into when older.

---

## Copyright stance (Mot's standing rule)

Never infringe. The line: **rules/mechanics are free** (Checkers is Checkers;
ancient games have no owner; SRD is Creative Commons). **Content and branded
identity are not** (a specific game's cards, art, named characters, logos).
House versions for family play — including of games Mot physically owns — are
fine; the value Mot wants (family inside jokes, Garrett's worlds) is content
he authors anyway, which is *better* as a house version than the boxed one.
Games still designed-and-sold (Hive, Santorini, etc.) are not reskinned.
Scrabble builds an original engine + free dictionary, not copied board art.

## Update — 2026-06-11 evening (v8)
- Runtime bumped to **v8**; all pages reference `gamenight.js?v=8`.
- GAME_KEYS: added `farkle_games`, `gofish_games`, `reversi_games`, `morris_games`; removed dead `pig_games`.
- **Pig removed** from the shelf (browser-rendering ghost on some devices; not worth chasing). `pig.html` deleted — remove from repo if present.
- New games: `farkle.html` (to 5000, opening-rule toggle), `gofish.html` (go-again rule), `reversi.html`, `morris.html` (Nine Men's Morris).
- New shared file: `bot.js` — drop-in AI opponent engine (minimax+alpha-beta, easy/medium/hard, policy hook for chance games, GN.bot.skillButton UI). Not yet wired into any game.
- Shelf badges show per-game player ranges via `players:` field (aspirational until party-seats ships).
- File count: 28 (24 game/index html + gamenight.js + words.js + bot.js + CLAUDE.md).
- Bridge Builders: spec locked in BRIDGE_SPEC.md; path-scoring engine proven in bridge_core.js (8/8 tests). Game assembly pending — read BRIDGE_SPEC.md first.
- v9 (zip): Trouble sings — bot opponent (easy/med/hard via bot.js policy, drives blue/player-2 seat, "vs Computer" button), new shared sfx.js (Web Audio synth: pop/bump/chime/fanfare/move/womp + persistent mute button). Trouble promoted to shelf slot 3. Runtime still gamenight.js?v=8 (unchanged). sfx.js?v=1, bot.js?v=1 referenced by trouble.html only so far.
- CONVENTION: footers/button rows must be phone-first — flex-wrap:wrap, justify-content:center, side padding, nowrap labels. Audit any game when adding buttons.
- v10 (zip): runtime bumped to gamenight.js?v=9 — global "⟨ Shelf" back-out on the matchStart picker/flip overlay (exits without recording; records only happen at game end). Trouble: home pegs now a 2x2 pocket cluster (tunables HOME_ANG/HOME_R/HOME_GAP).
- v11 (zip): BRIDGE BUILDERS shipped — bridge.html (Scrabble engine + ownership tinting, per-player arrows r4/r10, fixed mirror-symmetric premium positions w/ types shuffled per game, own-network connectivity, race to col 14 → +10 + dual best-path bridge scoring per BRIDGE_SPEC.md). Key "bridge_games" NOT yet in GAME_KEYS (batch into next runtime bump). 24 tiles on shelf.
- v12 (zip): GUESS WHO classic — guesswho.html. Characters are DATA (attribute vectors -> procedural SVG faces) so custom boards/editor (Yanke board) slot in later. 24-char board mathematically balanced (all hair colors x4, 12/12, greedy-isolation avg 4.7 questions, harness-verified). Pass-and-play, verbal questions, per-player flips, secret peek on pass screens, wrong-guess-loses. Key "guesswho_games" awaits next runtime bump. 25 tiles.
- v13 (zip): RUNTIME v10 — GAME_KEYS += bridge_games, guesswho_games (cloud sync live for both). sorry.html flip-credit uses PN() not hardcoded names; battleship pass-screen uses player's name not "She". All 26 pages bumped to ?v=10.
- v13 chunk 2: SORRY MIGRATED to runtime — GN.matchStart supplies seats (SEAT{red,blue})+FRIENDLY (its own 3D coin still decides first player, by design); PN()=SEAT lookup; GS/pawnsHome keyed by live names; records via GN.recordGame (friendly games skip, legacy Store fallback); save-snapshots carry SEAT for resume; stats screen generalized (statNames() discovers the record pair — legacy Mot/Kathy history reads perfectly, harness 10/10). THEME .player fields now dead data. Footer-wrap convention applied to backgammon/battleship/checkers/chinese/connect4/dominoes/mancala/yahtzee (sorry's #actions already wrapped).
- REMAINING from "do it all": ③ sounds rollout (sfx in 3/25 games), ④ PWA manifest+SW+icons, ⑤ bots checkers/reversi, ⑥ Royal Game of Ur, then editor/bookshelf/decks.
- v14 (zip): SOUNDS EVERYWHERE — sfx.js?v=3 adds automatic tap layer (any button.act click = soft tap, zero per-game wiring). All 25 games include sfx v3 + mute button (sorry: in its menu via #sndSlot) + win fanfare at overlay; dice sound in backgammon/farkle/shutbox/snakes/yahtzee. Gotcha fixed twice during rollout: statsButton specials break naive regex inserts (paren-count instead), and single-expression arrow overlay-shows need block conversion when prepending. sfx.js v2->v3 means ALL pages must upload together with sfx.js.
- v15 (zip): POP rebuilt per Caleb's ear — old sine sweep (the "digital bounce") removed; now membrane snap + 5-7 randomized resonant bandpass ticks (plastic die tumbling) + settle tock. Each pop differs (organic). New tick(t,f,g,dur) helper in sfx.js for plastic clicks. sfx.js -> ?v=4 on all pages.
- v16 (zip): POP v3 per Caleb round 2 — added hollow 420Hz dome thump (the "kick-up" body); tumble ticks louder (0.26->0.42), warmer (900-2400Hz), softer Q (8); womp softened globally (sawtooth 0.5s/0.2 -> triangle 0.26s/0.09). tick() now takes optional Q arg. sfx ?v=5.
- v17 (zip): PWA — manifest.webmanifest, icons (192/512/maskable, PIL-generated shelf art), sw.js NETWORK-FIRST service worker (online = always fresh, offline = full shelf from cache, cross-origin/Firebase passes through, cache keys stripped of query strings). Registration in gamenight.js (?v=11). index head: manifest link, theme-color, apple-touch-icon.
- NEW WORKFLOW once v17 is live and a device has visited TWICE (first visit installs SW, second is controlled): uploads appear on plain refresh — NO MORE ?v= or ?x= cache busting on that device. ?v refs in html are now inert legacy; leave them. Bump CACHE const in sw.js only when adding/removing files from the precache list (new game), so offline seeds refresh.
- PWA install: Android Chrome -> menu -> "Add to Home screen" (or install prompt). Launches standalone, portrait, with the shelf icon. Works offline (Firebase sync resumes when online).
- v18 (zip): BOTS in Reversi + Checkers via bot.js minimax (first real use of the search side; Trouble used policy). Reversi: corner/mobility/disc eval, pass-moves inside search, tap split (tap=human guard, tap2=move path). Checkers: capsFor/stepsFor/sideHasCapture/movablePieces take optional board param (backward compatible) for pure search; spec models multi-jump chains via state.chain, forced captures, king-ends-chain. Both drive the player-2 seat (B/blue), watcher-interval w/ state-key dedupe, "vs Computer" skill button. Harnesses: reversi 6/6 (hard 4/4 vs easy), checkers 9/9 (hard 4/4 vs easy).
- v19 (zip): ROYAL GAME OF UR shipped (urgame.html) — Finkel-standard rules: 3x8 board w/ historical gaps, 14-square paths sharing the middle battle lane, 4 binary pyramid dice (0-4, 0 = lost turn), 5 rosettes (extra roll; center = safe haven), captures in shared lane, exact bear-off, 7 pieces. Bot day one (policy: capture>rosette>bear-off>enter>advance; hard adds shared-lane danger awareness). Engine harness 16/16. KEY="ur_games" awaits next runtime bump. SW: precache +urgame.html, CACHE -> gameshelf-v2 (per convention: bump cache only when file list changes). 26 tiles.
- v20 (zip): RULEBOOKS — (1) BUG: GN.openRules read s.p only; 8 newer games used t: -> every body rendered "undefined". Renderer now reads t||p AND supports per-section svg: (inline illustration, .gnIll) and ex: (worked-example callout, .gnEx, gold left border). Runtime ?v=12. (2) DETAILED RULES batch 1 (front row 7): scrabble(9 sec), bridge(7), trouble(7), checkers(7), guesswho(6), ur(8), sorry(7) — each w/ illustration + worked examples. Render-tested through actual renderer logic (no undefined, balanced svg). REMAINING batch 2: connect4, battleship, yahtzee, backgammon, mancala, dominoes, gofish, war, farkle, reversi, morris, gomoku, uttt, hex, dots, snakes, shutbox, chinese, codebreaker (19 games). Rules-as-data = Bookshelf compiles from these sections later.
- v21 (zip): RULEBOOKS COMPLETE — all 26 games now carry detailed rules: 153 sections, 15 SVG illustrations, 35 worked examples, all matching coded behavior (recon-verified house variants: farkle 5000+Open/500 toggle, shutbox 1-9+one-die rule, war three-down-one-up, backgammon w/ doubling cube+gammons, codebreaker human-set 4-peg/6-color/repeats/10 guesses, mancala Kalah capture+free turn, gofish go-again-on-hit, snakes exact-100). Full-shelf render verification green. Rules are structured data (sections arrays) -> Bookshelf compiles from them.
- v22 (zip): THE BOOKSHELF — book pile at the bottom of index (stacked horizontal books w/ rotation offsets, hardback page-edges, spiral rings; plank under). Three volumes: rules.html (The Rulebook: paper-styled reader, TOC -> illustrated per-game rules, "Play this game" link; reads rulesdata.js), records.html (The Record Book: ledger-styled all-games leaderboard w/ bars + game-by-game table, friendly-skipping by construction since friendlies never record; charts = future edition), howto.html (spiral-notebook guides: install, offline, sound, TV mode, vs computer, sort, friendly games; Bluetooth controller marked coming-soon). rulesdata.js GENERATED from games' own rules sections — REGENERATE on any rules change (node extract script in transcript; keep in zips). GN.GAME_KEYS now exported. SW: +4 files, CACHE v3.
- v23 (zip): FAT-FINGER GUARD (global, in runtime) — GN._inPlay lifecycle (matchStart open=false, seats confirmed=true, recordGame=false) + document capture-phase interceptor on #newBtn/#mainBtn/a[href="index.html"]: mid-game taps open GN.confirmEnd overlay ("Hold on ✋" / Keep playing / Yes end this game); links navigate on confirm, buttons re-click through GN._bypass. Exempt contexts: anything inside .gnOv (picker back-out) or #overlay (post-game Play again) — always one tap. Scrabble/bridge/yahtzee have no mid-game new button (safe by design); sorry keeps its own menuQuit confirm; battleship's dynamic New-game button now id="newBtn". Harness 11/11 (synthetic clicks through stub DOM w/ id-registry + querySelector memoization). Known soft edge: after a FRIENDLY game ends, header shelf link prompts once (recordGame never fires) — harmless.
- ROADMAP — CHESS (committed, future flagship): full pass-and-play chess + bots, hand-rolled (NO Stockfish/external engines). Two bot products:
  (1) PLAYING BOTS — LEVELS 1-10 (not the 3-step skillButton; chess gets its own level picker): ONE strong engine (quiescence, transposition table, move ordering, eval w/ material + piece-square tables + king safety + pawn structure; top end ~1800-2000 club strength), with levels derived by dialing depth, time budget, eval noise, and blunder probability. Calibration intent: L1 barely looks ahead and misses hanging pieces (a kid learning the moves can win); L3-4 punishes free pieces but plans little; L5-6 solid casual adult; L7-8 strong club tactics; L9-10 full strength for the serious-player guests. Each step should feel like a real rung — calibrate via bot-vs-bot ladders (level N beats N-2 reliably). Remember level per device (localStorage) so a learner's progress sticks.
  (2) TRAINING BOT (coach mode, distinct from playing a seat): hint button (shows a good move + one-line why), blunder warning before committing a losing move (optional toggle), post-move feedback ("that hangs the knight"), takeback in coach mode, maybe end-of-game "3 moves that decided it" recap. Coach explanations come from the engine's own search results (e.g. eval swing + principal variation), not canned text.
  Build order: phase 1 board+complete rules (castling, en passant, promotion, check/mate/stalemate, 50-move, threefold) fully harnessed w/ perft tests; phase 2 playing bots; phase 3 coach. Perft = the standard move-generator correctness test (known node counts from standard positions) — non-negotiable before any bot work.
- v24 (zip): PINCH ZOOM — GN.pinchZoom(boardEl) runtime module: wraps board in overflow-hidden viewport (touch-action:none), CSS transform translate+scale so browser hit-testing keeps cell taps exact at any zoom. Pinch 1-3x w/ midpoint anchor invariant, one-finger pan when zoomed (8px threshold; capture-phase click suppressor stops pan falling through as a cell tap), double-tap toggles 1x<->2.2x at tap point, translate clamped to content. Pure math on GN._pz (12/12 harness incl anchor invariants). Wired: scrabble + bridge (DOM grids; innerHTML rebuilds keep the wrapper). Candidates if asked: battleship, gomoku/hex/chinese/dots (CANVAS games — audit their pointer math first: rect-relative scaling survives CSS transforms, offsetX does not). Howto: gesture guide added.
- v25 (zip): ♔ CHESS SHIPPED — the new flagship (chess.html, ~37KB single file).
  ENGINE: 0x88 board, full rules (castling-through-check legality, en passant + EP pins, underpromotion, fifty-move, threefold via rep map, insufficient material incl same-color bishops), make/unmake. CERTIFIED: perft 17/17 across 5 standard positions (startpos d4=197281, kiwipete, pos3/4/5), status tests 6/6, 60-ply unmake symmetry.
  AI (CAI): alpha-beta + quiescence + MVV ordering + PSTs + doubled/isolated pawns + phase-aware king tables; iterative deepening at root w/ hard ms deadlines (only completed iterations commit — KEY fix: deadline mid-root must not let junk scores outrank searched ones; root moves get FULL window, fail-hard windowing collapses ties). LEVELS 1-10 = depth/ms/noise/blunder dials; persisted chess_bot_level. Calibrated ladder: 3>1, 5>3, 7>5, 10>8 all 4-0 at 1/10 clocks. Tactics: mate-in-1, free piece, no horizon blunder. L10 ≤5s/move budget.
  UI: original SVG piece set (gradient fills via CSS vars), 4 board materials × 4 piece materials w/ live-preview picker (persisted), captured-piece trays, last-move/check/hint highlights, auto-flip pass-and-play (TV mode + bot games keep White down), promotion picker, algebraic coords. Bot plays Black.
  COACH (toggle): Hint (analyze L7, highlights + plain-words why via describe()), blunder nudge (quick L6 analyze; >180cp drop → GN.confirmEnd repurposed w/ relabeled buttons "Take another look"/"Play it anyway"), Takeback (undoes bot reply too).
  Sounds: move/bump(capture)/chime(castle/check@1.4rate/promote)/fanfare/womp(draw). Stats: checkmates, wins vs computer; draws not recorded as wins. Rules: 9 sections w/ castling SVG + EP example. Tile FIRST on shelf. SW: +chess.html, CACHE v4. rulesdata regen (27 games). GAME_KEYS += chess_games + ur_games (both pending keys cleared). PERF LESSON: never call status()/posKey() per search node.
- v26 (zip): PWA ICON REPAIR — manifest.webmanifest / sw.js / index.html all referenced HYPHENATED icon names (icon-192.png, icon-512.png, icon-maskable-512.png) that 404'd against the real files on disk (icon192.png, icon512.png, iconmaskable512.png). Two failures: (a) broken install / home-screen / apple-touch icons (screenshot fallback); (b) sw.js precache uses cache.addAll(CORE) which is ATOMIC — the two icon 404s rejected the WHOLE precache, so the guaranteed full-shelf offline seed silently failed on install (online-visited games still cached via the network-first put, so it went unnoticed). Repointed all 6 refs to real names; CACHE v4→v5 to force reseed (precache LIST changed). 3 files. Found by audit. Validated: manifest JSON parse + node --check sw.js + grep-assert zero "icon-" refs remain + broken-asset sweep clean.
- v27 (zip): EASY VIEW — per-device large-text/large-target toggle for low-vision players (Mot's 95yo grandmother), the global rail TV mode never got (TV mode is per-game AND key-inconsistent — chess reads gn_tv, shelf writes shelf_tv; that mismatch is a separate UNFIXED latent bug). GN.easyView in gamenight.js (on/apply/set/toggle; localStorage "gn_easy"); applied as html.gn-easy root class at gamenight LOAD on EVERY page, so the setting follows the player into all 27 games. Injected stylesheet (in the shared css string, !important to beat inline px) enlarges SHARED CHROME ONLY: .gnTitle/.gnBtn/.gnSeat/.gnStats/.gnMeta/.gnEx — seat picker, end-game buttons, Rules & Stats modals, confirm dialogs. Shelf (index.html): 🔎 Easy view toggle beside TV mode + html.gn-easy rules for tiles/.name/.tally/text. Default OFF (no one else affected). 2 files; NO CACHE bump (precache list unchanged, network-first). Validated: node --check + DOM-stub boot test (loads clean; toggle flips root class on/off). PHASE 1 = chrome + shelf only; PHASE 2 (per-game board/piece scaling under same class, screenshot-tuned, one game at a time) NOT yet done.
- v28 (zip): ♔ CHESS r2 — the repair. Two items, both harness-validated headlessly (engine extracted + run in node):
  (1) OPENING VARIETY — fixes the logged "opening repetition" soft edge (no book/noise at L9-10 meant one fixed line every game). pick() now, for the first OPENING_MOVES=5 full moves, picks at RANDOM among root moves within OPENING_SPREAD=35cp of best — varied AND sound (never a weak move). Sits after the blunder roll so low levels keep their character. Harness: 6 distinct first moves over 25 trials (e4/d4/d3/e3/Nf3/Nc3), ZERO outside the 35cp window; startpos eval 0. Both knobs are single tunable constants for screenshot tuning.
  (2) "3 MOVES THAT DECIDED IT" recap — delivered from the v25 coach-roadmap "maybe". doCommit() pushes a static-eval trace (CAI.evaluate, white-POV cp — instant, NO search) to GS.trace {n,mover,name,from,to,desc,evalW}; trace reset in newGame, POPPED on takeback (incl the bot-reply double-pop) to stay in sync. finish() → recapHTML(): per-move swing = ΔevalW, top-3 by |swing| ≥ RECAP_MIN=60cp, rendered CHRONOLOGICALLY with mover + direction (toward White/Black, cp→pawns); <6 moves or no swing ≥ min → "an even game" / hidden. New #ovRecap overlay block; escH() guards player-entered names. Harness: synthetic trace picks the 3 biggest swings, chronological, correct directions.
  NO runtime bump, NO CACHE bump — chess.html isn't in the SW precache list and the SW is network-first, so the edit flows through on plain refresh. Known soft edge "chess opening repetition" → RESOLVED.

## Update — 2026-06-14 session (Word Search · vs-Computer in the picker · recolor · Sudoku)
- v29 (zip): WORD SEARCH — first puzzle BOOK (not a game: no picker/records, just a book on the shelf). tools/wsgen.py generates 10 themed 13×13 grids (110 words, 8 directions); the generator ships a page ONLY if every placed word is a real dictionary word (words.js) AND is independently re-scanned as findable in the finished grid. wordsearch.js = window.WORDSEARCHES (theme + grid + word list + answer coords). wordsearch.html player: two-tap select (first letter → last letter), green-locks found words, prev/next pager, Easy-View CSS overrides, sfx taps, win overlay. 4th bookshelf spine. NOT in the SW precache (network-first caches it on visit, like games). End-to-end: all 110 words player-findable, zero validation errors.
- v30 (zip): vs COMPUTER, UNIFIED IN THE PICKER — the bot now lives in the seat picker (GN.matchStart), not a footer button. matchStart(done,opts): opts.bot adds a "vs Computer" mode + Easy/Med/Hard row; opts.solo adds "1 player"; opts.botSimple = vs-Computer with NO difficulty (pure-luck games). CPU seat = {name:"Computer", #6b7280}. vs-Computer is forced FRIENDLY (never recorded). done payload gains {bot:level, vsComputer:true}. Five games wired this round (all validated by actual play in jsdom): CONNECT 4 (alpha-beta, window eval, center-first ordering), MANCALA (minimax mirroring BOTH Kalah + Avalanche — mSimulate rule-parity tested vs the game's own sow/capture over 80,000 random positions, 0 mismatches; fixed 2 capture edge-cases), DOTS & BOXES (5×5 too big for minimax → strategy POLICY: take free boxes, avoid the 3rd side, Hard opens the shortest chain; Hard beat Easy 39/40), WAR + SNAKES (botSimple — War just labels the Computer seat; Snakes auto-rolls on the computer's turn incl. "6 rolls again", with a byBot guard so the human can't double-roll).
- v31 (zip): PLAYER RECOLOR — GN.recolorPlayer(name,pal) updates the roster element, psaves, and PUSHES THE FULL LIST to Firebase via set() (arrayUnion can't replace an existing entry). Picker gained a "🎨 change a color" button → player list → color grid (factored openColorGrid; other players' current colors are locked). Built because token colors live in the household's Firebase sync (not in code), so the only correct fix for "Garrett wants his token yellow" is an in-app recolor that writes + syncs to every device. PALETTE index 6 = yellow. Boot-tested: recolor via UI, taken-color locking, every picker mode regresses clean.
- v32 (zip): 4 OLDER BOTS MIGRATED into the picker + two picker-UX decisions. checkers/reversi/urgame/trouble dropped their footer GN.bot.skillButton and now read difficulty from the picker: `botLevel = m.vsComputer ? (m.bot||"medium") : null` in the matchStart callback, plus opts.bot. All four already had a setInterval poller that fires the bot when `botLevel && turn===<computer seat blue/B>`, so computer-first "just works" after the coin flip — no extra trigger needed. Per Mot's choices the picker now: (a) ASKS for difficulty — vs Computer starts with NOTHING pre-selected; the Start button is DISABLED reading "Pick a difficulty" until a level is tapped, then enables reading "Flip for first" (botSimple games skip this gate); (b) COIN-FLIPS for first vs Computer — routes through the same 3D coin path as 2-player (b=CPU) instead of human-first, and if the Computer wins the flip the poller moves it first. Picker boot test 11/11; all 4 games: inline JS parses, skillButton gone, boxes read 1-2, sound buttons intact.
- v33 (zip): SUDOKU — second puzzle BOOK, built so difficulty tiers slot in later (every puzzle carries difficulty:"gentle"; the player reads a flat list, so Medium/Hard sets are just more tagged entries + a picker later). tools/sudokugen.py emits sudoku.js = window.SUDOKUS (10× {id,difficulty,givens,solution,clues}). A puzzle ships ONLY if ALL hold: solution is a valid complete grid; givens agree with the solution; EXACTLY ONE solution (independent backtracking counter capped at 2); SOLVABLE BY SINGLES ONLY (naked + hidden singles = gentle, no guessing). All 10 came out at 38 clues, zero errors, and were RE-VALIDATED by a second solver in node (unique solution confirmed independently of the Python generator). sudoku.html player: 9×9 with 3×3 box rules, pen entry that FLAGS WRONG digits red the instant they're placed (compared to the solution), pencil-mark mini-grid (✎ toggle), Hint (fills one correct empty cell — the selected one if you're stuck on it, else random — and counts hints), same-number highlight, the number pad dims a digit once all 9 are correctly placed, win overlay, prev/next. RESUME: per-puzzle entries + marks + hints + solved flag persisted to localStorage "shelf_sudoku" (real-site key, NOT the artifact storage API). Player play-through 11/11 in jsdom (wrong-flag, correct entry, pencil marks, resume-after-reload, hint, full-grid completion, win, solved-persist). 5th shelf spine. NOT in the SW precache. NO runtime/CACHE bump.
- SHELF STATE after this session: 27 games + 2 puzzle books (Word Search, Sudoku) = 50 files in the zip. vs-Computer is now offered by: chess (its own in-page engine, levels 1-10) + connect4/mancala/dots/war/snakes/checkers/reversi/ur/trouble (bot.js via the picker, Easy/Med/Hard except botSimple war/snakes) + the earlier solo score-chase games (yahtzee/shutbox/farkle/codebreaker). Runtime stays gamenight.js?v=12 — the picker changes are INSIDE the runtime and flow through on plain refresh (network-first SW; ?v refs are inert fossils). The footer GN.bot.skillButton helper in bot.js is now retired from all games (kept in bot.js, just unused).

## Update — 2026-06-14 (later session): MULTIPLAYER · "One Card Left!" · house-rule STACKING
- v34 (zip): MULTIPLAYER FOUNDATION + the shelf's first house CARD GAME. **GN.partyStart(done,{min,max,start,toggles})** — a NEW seat picker (matchStart left UNTOUCHED → zero regression for the 27 turn-based games). 2–4 seats; each seat a roster human OR a Computer (per-seat Easy/Med/Hard via the chooser sheet); distinct colors auto-assigned (normalize() pulls PALETTE minus the human colors; computers numbered "Computer"/"Computer 2"…); requires ≥1 human (Start disabled "Add a person" otherwise); randomizes first player with the cycling highlight; forced FRIENDLY. Payload: `{seats:[{name,color,light,dark,bot:level|null}], first, friendly:true, rules:{…}}`. localStorage `gn_party_n` remembers the count. **"ONE CARD LEFT!"** = original-name house version of a colored shed-your-hand card game (Uno-family mechanics are free; the NAME + all card ART are original — house version, same stance as Sorry!/Scrabble). Pure DOM-free engine `tools/ocl_engine.js` (108-card deck: per color 0×1 / 1-9×2 / Skip+Reverse+Draw2 ×2, +4 Wild +4 Wild4; match by color OR kind; Skip/Reverse[2p=play-again]/Draw2/Wild/Wild4; DRAW-UNTIL-PLAYABLE then play-or-keep; auto "One Card Left!"; winner on empty hand). `var OCL=(function(){…})()` + node export; embedded BYTE-IDENTICAL into onecardleft.html (re-embed script splices `var OCL…})();` from the canonical, dropping the export line; a parity check asserts embed===canonical). HARNESS: deck composition, every action effect, reshuffle conservation, thousands of random + bot games — hard 108-card CONSERVATION invariant + termination + valid winner, all pass. Page = table UI on partyStart: opponents row (counts + turn glow, data-seat), center discard(rich SVG)+colorRing+draw pile, bottom hand; pass-the-device curtains for multi-human, hand-always-up + auto-playing bots (850ms) when one human vs computers; wild color picker; win overlay. Tile is 2nd on the shelf (after chess); key `onecardleft_games` is NOT in GAME_KEYS (never recorded — friendly). sw.js: +onecardleft.html in CORE, CACHE v5→v6.
- v35 (zip): One Card Left! POLISH. Rich card ART (SVG faces: white frame, oblique oval, colored number, action icons [no-entry Skip, double-arrow Reverse, two-card Draw Two], 4-color diamond Wild + "+4" Wild4, corner indices, gloss; "OCL" backs). SOUNDS via shared GNS (respects the global mute; a 🔊 button added to #bar): dice=deal riffle, place=number slap, womp=Draw Two buzz, bump=Skip/Wild4/Take, chime=Reverse/Wild, tap=draw, fanfare=win. **Bug found by the win test:** win() called `S("win")` — there is NO "win" sound in sfx.js (the set is tap/place/pop/dice/move/bump/chime/fanfare/womp/six), so the victory sound had NEVER fired → fixed to `S("fanfare")`. FLYING-CARD animations: flyCard(fromRect,toRect,faceHTML,ms) clones a fixed-position card and transitions transform src→discard (plays) or deck→hand (draws), ~260ms, purely cosmetic (logic/render proceed in parallel); bots fly from their opponent panel (located via data-seat). jsdom-safe (zero rects → no throw).
- v36 (zip): One Card Left! in the RULEBOOK. Canonical rules live ONCE in `tools/ocl_rules.js` (title + sections[{h,t,svg?,ex?}], house terms only — never names the trademarked game); a generator stamps the SAME JSON into BOTH (a) the in-game Rules button (a compact "?" added to #bar via GN.rulesButton, #bar got flex-wrap so it never overflows) and (b) the `onecardleft` entry in rulesdata.js (inserted as the LAST key before the closing `};`) so the two CANNOT drift. 7 sections; TWO original SVG diagrams — matching (a blue 6 on the pile + the cards that answer it) and the action cards (Skip/Reverse/Draw Two mini-cards). rulesdata.js now 28 games. Boot-tested: "?" opens, content correct, no "uno" leak.
- v37 (zip): house-rule STACKING + reusable partyStart toggle switches. **GN.partyStart now takes opts.toggles** = [{key,label,sub,default}] → renders an on/off switch row before Start (each persisted to localStorage `gn_party_tog_<key>`), and returns their values as `rules:{…}` in the payload (backward-compatible: no toggles → empty rules, the 27 matchStart games are unaffected). ENGINE stacking (added to ocl_engine.js + re-embedded): newGame gains a `rules` param + `st.pending` (0 normally) + `st.rules`; with stacking ON a Draw card does NOT make the next player draw immediately — it adds to `st.pending` (+2/+4) and passes the turn; the targeted player may stack ANY Draw card (a +2 or +4 — "any Draw on any Draw", color-free during a stack via new `playable(card,st)`) or take the pile (`takeStack` → draw `pending`, reset to 0, and be skipped). New exported `playable()` (engine + UI use it for highlight/legality); legalMoves under pending returns only Draw-card plays + takeStack; botMove under pending stacks if it can (easy 50/50) else takes. One Card Left! wires it: a "Stacking" switch in the picker, a red **+N** badge on the discard (id `pendBadge`), the Draw button becomes "Take N", bots take stacks too. VALIDATION: ~8,500 harness games stack-ON and stack-OFF — 108-card conservation NEVER broke (stacks climbed to 32 and always resolved), every bot game terminated with a valid winner, stack-OFF is a clean regression (pending never >0); then 8 in-page play-throughs (4 ON / 4 OFF) — all complete, zero JS errors, +N badge & Take button appear ONLY with stacking on; embed byte-identical to canonical. Rules text updated to document the optional toggle. Files: gamenight.js + onecardleft.html + rulesdata.js (tools/ocl_engine.js + tools/ocl_rules.js are the excluded canonical sources).
- PENDING — JUMP-IN (Mot wants it; deliberately deferred to its own chunk). It's a REAL-TIME "everyone watching the pile" mechanic that fights the pass-and-play turn flow (hands are hidden behind pass curtains between turns). RECOMMENDED scope when built: enable it for the **one-human-vs-computers** mode first (the human's hand is always visible there, so a duplicate-of-top card can light up as a jump-in and computers can jump in on a short delay) — that's the natural, low-friction home. A full multi-human "race to tap" needs a shared "table is face-up, no curtains" sub-mode (a deliberate choice at setup) and is a bigger design; treat it as a second step. Engine hook: a `jumpin` move (legal iff rules.jumpin && hand card EXACTLY matches top color+kind) that sets turn=jumper then applies the card; UI needs a brief jump-in window between turns. The partyStart toggle plumbing already supports adding a "Jump-in" switch next to "Stacking".
- SHELF STATE after this session: **28 games + 2 puzzle books** (One Card Left! is the new game, 2nd tile). Multiplayer (2–4, humans + computers) exists via GN.partyStart (One Card Left! is its only consumer so far). Runtime still gamenight.js?v=12 (partyStart + toggles are INSIDE the runtime, flow through on refresh). sw.js CACHE = gameshelf-v6 (onecardleft.html added to precache). tools/ now also holds ocl_engine.js, ocl_rules.js (canonical sources for the embedded engine + rules — all of tools/ excluded from the zip).
