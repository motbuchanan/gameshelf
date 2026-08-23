# Game Shelf — Roadmap

Repo: `motbuchanan/gameshelf` · Live: https://motbuchanan.github.io/gameshelf/
Last updated: 2026-08-23

This file is the single organizing record for the shelf: what each app is,
what state it's in, what's shipped, and what's next. Update it when a version
ships or a decision changes. Keep entries short. Status tags:

- **LIVE** — deployed and in use
- **ACTIVE** — being built right now
- **PARKED** — paused on purpose, will resume
- **IDEA** — captured, not started

---

## Shelf-wide

- [x] **Share the Shelf** — double-tap the version badge (`verBadge`) shows a QR
  to the shelf index + Add-to-Home-Screen hint. Wired natively into shelf
  **v59** and tested 2026-08-23. Styled to the shelf's gold/dark theme.
- [ ] **This roadmap** — keep `ROADMAP.md` current as the shelf's source of truth. **ACTIVE**
- [ ] Per-app version badges + shared deploy ritual audit across all apps. **IDEA**

---

## Apps

### Measure Up — build-a-band math game  **LIVE**
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
- [ ] Real-art swap — drawn/generated band members as drop-in images; its own
  project. Breathing wrapper, stage, flair, rename all carry over. **IDEA**
- [ ] "Battle of the Bands" — teaser exists in the hub footer, feature unbuilt **IDEA**
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
- **AstroMerge Realms** — merge + space-strategy. Add its own block when worked on.
- **Bot Lab** — AI-creature life-sim sandbox.
- **Star Stuff** — (portal-candidate build).
- **Salon Dash** — time-management game (spun off the Meriki work).
- **Cozy Critter Garden** — merge/blast for a 96-yr-old Candy Crush player.
- **Knight School** — trainer-first chess variant (built for Garrett).
- **Measure Up** — see its full block above.

Classic game library (deployed, stable — bump individually only when revisited):
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
