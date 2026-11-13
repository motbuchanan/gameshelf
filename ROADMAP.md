# Game Shelf: Roadmap

Repo: `motbuchanan/gameshelf` · Live: https://motbuchanan.github.io/gameshelf/
Last updated: 2026-11-12

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
- [x] **The Keep in the Old Video Games box** (shelf **v76**, 2026-11-03): Mot's living-valley
  walker added as a cartridge after Bloodstream so Garrett can wander it and help test.
  LINKED, not copied: href `https://motbuchanan.com/thekeep/?from=shelf` (same origin as the shelf; `from=shelf` makes The Keep v0.25.1+ show a "⌂ Shelf" back button), because
  The Keep is multi-file and ships new versions often in the site repo; it has no links out of
  itself. Sticker = `thekeep-sticker.png` (from the-keep-icon.png). No shelf records, so no
  GAME_KEYS or achievements entry. sw.js precache += the sticker only; CACHE + badge 75 to **v76**.
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
Path: `bloodstream.html` · Current: **v0.9** (2026-11-12) · shelf **v78** (Old Video Games box, ARCADE_H)
Oregon Trail / FTL-style single-file game built for Garrett from his own Body Trail Builder answers
(ride: Bubble Pod; crew: Oxinator, Fighty, Patchlet; Blood Red palette). Nobody dies.
What is in it: 12 organs on a node map (Heart hub; Stomach, Bones, Cell Lab open at start; the rest
unlock by boss), 11 missions (Pizza Night and Apple Snack math, Running Race, Scraped Knee, Sneeze
Attack, Swimming, Brush Teeth, Bedtime, Stretch Out, Dizzy Spin, Eye Spy), 13 event cards, 5 bosses
in order each with its own fight (Sugar Monster falling blobs @Heart, Cold Virus splitting copies
@Lungs, Belly Bug darting target @Stomach, Cavity Crew tooth drillers @Teeth, Fever Dragon drag-and-
cool thermostat @Brain), Journal (3 crew bios, 12 organ facts, 8 germs, 12 vessels, 11 mysteries),
5-card story intro, travel tutorial (GO badges, arrow, Where-next buttons), math shop that scales
addition to division. Progress in `bloodstream_v1`; plays to `bloodstream_games` via GN.recordGame
(GAME_KEYS + achievements NAMES since the Oct 25 repair round).
- v0.6 (Oct 25): title fits 320px; plays recorded through gamenight.js.
- v0.5 (Oct 18): unique boss fights. v0.4: 12 organs, 5 bosses, 4 missions. v0.3: intro + tutorial +
  Fighty swat + Brain board + crew bios. v0.2: shelf wiring. v0.1: core loop.
- Nov 12 2026 full audit (BLOODSTREAM-AUDIT.md in Mot's files): 0 crashes, 0 overflow, 1 soft-lock
  (empty tank + 0 stars at the Heart has no exit), tired crew have no effect, Maps journal tab is
  filler, sneeze-speed fact is a myth, game ends after ~90 min with nothing to come back for.
- v0.9 (Nov 12): Night Shift. After 7pm (iPad clock) or when the title toggle says always: purple
  night palette, slower vein pulse, spooky germ skins (spiky, glowing eyes) in every swat and boss,
  5 night-only event cards (Bad Dream, Growing Pains, Night Sweats, Tooth Fairy Patrol, owl), 2
  night mysteries, bosses +2 HP, Bedtime +1 star. Title toggle: Night auto / always / off.
- v0.8 (Nov 12): audit Part B. Daily Body Report at the Heart: date-seeded scenario (19 stories,
  boss rematches included once beaten), one modifier (fast / long / double stars), bonus 3 stars,
  streak counter; title shows ready/done. High scores: every minigame keeps a best (shown on its
  mission row and in the briefing), bosses keep a best time (boss board), "NEW BEST" on the finish
  card, missions replayable with an Again button. Three crew from Garrett's questionnaire join on
  boss wins: Zap the Nerve Messenger (Sugar Monster) with Reflex Test at the Brain (tap numbered
  stations in order), Lock the Antibody (Belly Bug) with Wanted Poster at the Cell Lab (swat only
  the posted color), Snip the Enzyme (Cavity Crew) with Chop Shop at the Stomach (cut food chains
  to single bites). Crew cards in the Journal with bios. Old saves get their crew via syncUnlocks.
- v0.7 (Nov 12): audit Part A. Heart pumps +1 oxygen +1 water on every arrival (soft-lock gone);
  Go buttons disable when a trip is unaffordable and a Drift Home button appears away from the
  Heart; Journal locked during a minigame (reviewer Break: the loop kept running blind); Back on
  every math screen; subtraction never 0, empty answer ignored, third miss shows the answer;
  old-save field backfill; Scraped Knee forced after Pizza + Race; Convert off under 4 water;
  a 0-heart crew member gets a 60% timer in its game and the briefing says so; New Trip on the
  hub; 23 route cards replaced by 12 Vessel cards with facts (old saves migrate, visited organs
  grant their vessel); sneeze fact rewritten; Journal button 48px.
- [ ] Part C: second body on the same engine (Dog Body first) as a separate data block **IDEA**
- [ ] Part D: "From Dad" fact cards typed in by Mot **IDEA**

### Oops Lab: mistakes-are-fun contraption game  **LIVE**
Path: `oopslab.html` · Current: **v0.8** (2026-11-13) · shelf **v78**
v0.8: Daily Experiments (3 per day, seeded by date, streak calendar, Shiny Charm reward), Crew Missions (8 three-step chains, each unlocks a Lab Tale), Shiny cards (1 in 20, 1 in 5 with charm), 12 new badges (61 total), award popup moved above the controls.
v0.7: fixed sound spam after Kaboom / Hat Trick (cosmetic updates were re-running landing code every frame), knocked-over character now gets back up, first-time how-to card per contraption + "? How" button, GOAL arrow for the first 3 tries, update checker (auto-refresh on open, "Update now" bar during play). Fuzz-tested every contraption x yard x ammo: no stuck shots, no errors, no sound spam.
Single-file canvas game (arcade cabinet, ARCADE_H, sits after Bloodstream). Built to practice making
mistakes and handling the feelings without grading the player: the player coaches a crew character
through frustration (5 calm-down tools, all valid; each character has a hidden favorite) and collects
failures as cards. 8 characters (4 unlock by play, Perfectionator has a growth arc), 5 contraptions
(Catapult, Splash Cannon, Balloon Lift, Rocket, Seesaw), 5 ammo, 4 test yards, 70 Oops Book cards +
crew versions, combos, rare moments, 49 badges, 14 Lab Tales, Oops Museum, Buddy Mode, crew shout-outs.
Progress in localStorage `oopslab.v1`. Does NOT load gamenight.js and writes no `_games` record yet,
so it is not in Most Played or the shelf achievements (no GAME_KEYS / NAMES entry needed until it does).
- [ ] Next from the retention list: Invention Workshop (design your own card / crew member), Dad Duels, seasonal events **IDEA**
- [ ] Optional: record plays to `oopslab_games` (needs gamenight GAME_KEYS + achievements NAMES) **IDEA**
- [ ] Art pass for the other contraptions and the moon (v0.6 detail is Test Yard + catapult) **IDEA**

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
