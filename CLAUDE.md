# The Game Shelf — Project Handoff

*Last verified: 2026-06-11 · Build: cache tag `?v=7` · 19 games live*

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
*2026-06-11 later: Scrabble Classic added (20 games), runtime bumped to v7.*

---

## Files (23 total)

```
index.html        The shelf — box art, shelves, tally, sync button, reset
gamenight.js       SHARED RUNTIME — loaded by every game as ?v=N
backgammon.html   checkers.html   chinese.html   codebreaker.html
connect4.html     dominoes.html   dots.html      gomoku.html
hex.html          mancala.html    pig.html       shutbox.html
snakes.html       sorry.html      trouble.html   uttt.html
war.html          yahtzee.html    battleship.html
scrabble.html     Classic mode playable — original board, ENABLE+QI/ZA/OK/EW
                  dictionary (words.js), live score preview. Bridge Builders
                  mode still pending Mot's Xbox rule photos.
words.js          ENABLE dictionary (~168k words) — must upload alongside
                  scrabble.html.
```

Working dir: `/home/claude/shelf/`. Ships to `/mnt/user-data/outputs/shelf/`
and zipped to `/mnt/user-data/outputs/gameshelf.zip`.

---

## The cache tag (`?v=N`) — important operational rule

Every game page loads the runtime as `gamenight.js?v=7`. The number is a
**cache key, not a version number** — it forces browsers past their cached copy
of the runtime. It only ever grows; never reset it (reusing a number resurrects
the stale-cache bug it exists to prevent). Currently at **v7**.

- **Game/index HTML changed only** → no bump. Upload just the changed files.
  (Pages serves HTML with a ~10-min cache — the "it needed a min" delay.)
- **gamenight.js changed** → bump N in every page → all 23 files upload that commit.
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
