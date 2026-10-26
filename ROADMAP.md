# Game Shelf: Roadmap

Repo: `motbuchanan/gameshelf` · Live: https://motbuchanan.github.io/gameshelf/
Last updated: 2026-10-25

This file is the single organizing record for the shelf: what each app is,
what state it's in, what's shipped, and what's next. Update it when a version
ships or a decision changes. Keep entries short. Status tags:

- **LIVE**: deployed and in use
- **ACTIVE**: being built right now
- **PARKED**: paused on purpose, will resume
- **IDEA**: captured, not started

---

## Shelf-wide

- [x] **Share the Shelf**: double-tap the version badge (`verBadge`) shows a QR
  to the shelf index + Add-to-Home-Screen hint. Wired natively into shelf
  **v59** and tested 2026-08-23. Styled to the shelf's gold/dark theme.
- [x] **Nazca in the Toys bin** (shelf **v62**, 2026-09-22): Mot's infinite-canvas
  drawing app wired into the OLD TOYS bin (now 11 toys), sitting after Color Lab.
  Its own copy of the app lives at `/nazca/` (copied from the site repo; self-contained,
  no leak-out links). Tile art = Mot-supplied sand-carved bird icon (base64 img in the
  toy `art` field). sw.js precache += `nazca/index.html`, `nazca/manifest.json`,
  `nazca/sw.js`, `nazca/icon-192.png`; CACHE + visible badge bumped 59/61 → **v62**.
- [x] **v75 fits the screen** (shelf **v75**, 2026-10-25). Fit check (site tools/fitcheck.py:
  320, 360, 412px and 640x360 landscape) now runs on every build. Fixed: badge names in
  Achievements wrap instead of cutting off; the shelf home drawer decks (Gin Rummy and the
  rest) are full size; old-video-games and toys rows fit a small phone; Bot Lab paint
  buttons, Coloring Book header (v0.12), Critter Garden greeting (v0.8.2, wraps to two
  lines), Dollhouse header, Five Letters ENTER key (v1.2), Bag of Marbles buttons wrap
  (v1.5), SHARP header and keyboard, Star Stuff buttons (v6.3), Thumbstack board leaves
  room for NEXT (v1.9), Nazca top bar (v0.20). The shelf's Nazca cache is now named shelfnazca-v0.20 so it never
  collides with the site's own nazca/ copy (same motbuchanan.com origin). Thumbstack top bar wraps
  instead of pushing the player chip off screen. Upload after v74.
- [x] **v74 follow-ups** (shelf **v74**, 2026-10-25). Bloodstream title now scales to the
  screen (was cut off on phones). Yahtzee gets the official +100 Yahtzee bonus and joker
  rules. Solo games now record and count in Code Breaker, Farkle and Shut the Box, and
  every solo game is marked Solo in Stats, the Record Book and High Scores (solo plays
  count as plays, never as head-to-head wins). Buzz and RPS pulled: removed from the
  sw.js precache; delete buzz.html, rps.html, rock.png, paper.png, scissors.png from the
  repo. Runtime tag gamenight.js?v=14 (gamenight.js changed for solo stats).
- [ ] **Marble Explainer: back burner.** Works offline, has a Shelf link, but nothing on the
  shelf links to it yet. Revisit later (likely from the Marble Arcade menu). **PARKED**
- [ ] **Hex Empire: spin back up.** hexempire.html is in the repo and precached but unlinked
  (it was swapped out of the Old Video Games box for AstroMerge in July). Original build
  chat: claude.ai/chat/7386b769-53d1-4ed3-a2df-05357205ad5d. **NEXT**
- [x] **Break-sweep repair round** (shelf **v73**, 2026-10-25). The v71/v72 bundle
  (Bloodstream wiring, built Oct 18) never went live; live stayed at v70, so v73
  rebuilds it: Bloodstream is in GAMES + ARCADE_H (Old Video Games box) with inline
  SVG box art. Headline fixes: every root page plus measureup/ and stick/ now in the
  sw.js precache (offline claim in How-To is true), shelf sw.js deletes only old
  `gameshelf-*` caches, storage-blocked fallbacks, Rulebook em dashes cleared and
  phone Back returns to contents. Fonts are now local: the shelf links
  `/fonts/fonts.css` (motbuchanan.com shared font folder, v1.1), no Google Fonts;
  sw.js precaches the shared woff2 files. The site's `/fonts/` folder must be
  uploaded (site repo) before or with this shelf upload.
  Also: gamenight.js changed (picker scrolls in landscape, bigger picker links, in-memory
  records when storage is blocked, Computer/ties/draws no longer counted as wins, duplicate
  names refused, Restore pushes to the household, GAME_KEYS += puff_games, bloodstream_games),
  sfx.js gained win/err/flip, every page's runtime tag bumped to gamenight.js?v=13. About 90
  pages got their Break/Fix items from the Oct 24 break sweep; Word Search/Five Letters/
  Crossword word content cleaned for a young child.
- [ ] **Measure Up chat: keep the cache fix.** `measureup/sw.js` now deletes only its
  own old `measureup-*` caches (`k.startsWith('measureup-')&&k!==CACHE`, cache
  `measureup-v1-59`). Measure Up is being edited in another conversation: keep this
  filter when that chat ships its next sw.js, or it will wipe the shelf's offline copy again.
- [ ] **This roadmap**: keep `ROADMAP.md` current as the shelf's source of truth. **ACTIVE**
- [ ] Per-app version badges + shared deploy ritual audit across all apps. **IDEA**

---

## Apps

### Bloodstream: body-exploring trail game  **LIVE**
Path: `bloodstream.html` · Current: **v0.6** (2026-10-25) · shelf **v73**
Oregon Trail / FTL-style single-file game (Old Video Games box, ARCADE_H) built for Garrett from his own Body Trail
Builder answers (ride: Bubble Pod; crew: Oxinator, Fighty, Patchlet; boss: Sugar Monster;
Blood Red palette). Heart hub + node map (Stomach, Bones, Cell Lab open; Lungs unlock on
boss win; Brain locked). Event cards, snack-heal (feeds the boss), math-gated shop that
scales addition → division, 3 missions (Pizza Night math, Running Race catch, Scraped Knee
tap), Sugar Monster tap fight, Journal (cells, organs, germs, routes, mysteries). Nobody dies.
Writes plays to `bloodstream_games` (shelf Most Played); progress in `bloodstream_v1`.
`bloodstream_games` added to gamenight GAME_KEYS / achievements NAMES in the Oct 25 repair round.
- [ ] Phase 2: Fighty germ-swat minigame, Brain missions, more organs/bosses, crew bios in Journal **IDEA**

### Measure Up: build-a-band math game  **LIVE**
Path: `/measureup/` · Current: **v0.33** (2026-08-23)
Single-file HTML PWA. Build a band of 11 members + Elly the host; each member
teaches one math concept (addition through money) through jams, auditions,
proofs, gigs, a Band Room, and a shop. Built for Garrett first, wider K-5 second.

**Shipped this cycle (v0.17 → v0.33):**
- 11 members covering addition, subtraction, multiplication, fractions, clocks,
  days/months, measurement, division, negatives, skip counting, money
- Elly the guide (host, wrong-answer chime, intro tour, per-screen hints)
- Playable instruments for every member (Practice Room) + splash/intro
- Band Room with a real practice-stage (truss, risers, monitors, lights) and
  12 songs across many styles; Gain runs the stage lights
- Gear Shop (flair, voice packs, backdrops, sheet-music songs, show FX)
- Practice mode on every mini-game; proofs generalized to all members
- Gain's negative-numbers lesson; Doot's division games rebuilt (visible air-track)
- Money member (Register) with story problems
- Character art passes; navigation safety (labeled Back buttons + global Home)
- Completion tracking (✓ per game, progress on cards); toast + "undefined" bug fixes

**Next / backlog:**
- [ ] Character art: Slice (escape the plain circle), Gauge + Luna depth/beauty pass **IDEA**
- [ ] Real-art swap: drawn/generated band members as drop-in images; its own
  project. Breathing wrapper, stage, flair, rename all carry over. **IDEA**
- [ ] "Battle of the Bands": teaser exists in the hub footer, feature unbuilt **IDEA**
- [ ] Composition sandbox (free-play beat maker) **IDEA**
- [ ] Parent PIN view; sensory dials (confetti/animation intensity, quiet mode) **IDEA**
- [ ] Possible new concepts later: place value, comparing numbers, rounding/estimation **IDEA**
- Handoff doc: `MEASURE-UP-HANDOFF.md` (rewrite when starting a fresh chat)

---

### The rest of the shelf  **LIVE** (shelf build v59)
The shelf index (`index.html`, badge **v59**) links 53 games/apps. Measure Up is
the one with full history in this roadmap; the others are listed here so nothing
is lost. I don't have each app's internal version from its own file, so per-app
`Current:` and detailed backlogs stay blank until we open that app's file.

Original / featured builds (have their own dev history elsewhere):
- **AstroMerge Realms**: merge + space-strategy. Add its own block when worked on.
- **Bot Lab**: AI-creature life-sim sandbox.
- **Star Stuff**: (portal-candidate build).
- **Salon Dash**: time-management game (spun off the Meriki work).
- **Cozy Critter Garden**: merge/blast for a 96-yr-old Candy Crush player.
- **Knight School**: trainer-first chess variant (built for Garrett).
- **Measure Up**: see its full block above.

Classic game library (deployed, stable; bump individually only when revisited):
Marble Arcade, Blackjack, Solitaire, Memory, Gin Rummy, Old Maid, Chess,
One Card Left!, Scrabble, Bridge Builders, Sorry!, Trouble, Guess Who, Checkers,
Connect Four, Battleship, Royal Game of Ur, Backgammon, Mancala, Dominoes,
Yahtzee, Farkle, Go Fish, Reversi, Nine Men's Morris, Chinese Checkers, War,
Shut the Box, Snakes & Ladders, Ultimate TTT, Gomoku, Dots and Boxes, Hex,
Code Breaker, Snake, Paddle Duel, Brick Break, Blocks, Thumbstack, Star Defender,
Knucklebones, Pig, Craps, Liar's Dice, Minesweeper, Gem Match.

> To give any of these a real block (version, shipped, next), open that app's
> file in a session and we'll fill it in.

---

## How to keep this current
- When a version ships, bump its **Current** line and move done items out of Next.
- When a decision changes direction, edit the item in place (keep the history in
  a phrase, e.g. "was X, now Y").
- New app on the shelf → add a block under **Apps** with a status tag.
