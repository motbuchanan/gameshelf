# Measure Up - ROADMAP (lives in the repo at measureup/ROADMAP.md)

Updated with every upload. Claude reads this back from the repo before working, to check what was actually
uploaded against what the last chat thought it shipped. Full build notes stay in MEASUREUP-HANDOFF.md
(in the NOTES zip, never uploaded).

## Current
- **v1.55 · Oct 24 2026** (sw cache `measureup-v1-55`). Contains v1.51 through v1.54. Live URL: https://motbuchanan.github.io/gameshelf/measureup/
- Files in the repo folder: `index.html`, `sw.js`, `manifest.json`, `ROADMAP.md` (this file, new in v1.51).

## What shipped lately
- **v1.55 Robot abilities 2 + Constellation Connect (Oct 24).** Bot Garage: PAINT (pick a color; area by squares or
  rows x columns, perimeter all the way around, cans = area / coverage rounded UP; L-shaped rooms at the top tier) and
  LIFT (read a dial scale with unlabeled ticks, add a load against what the robot can carry, pounds and ounces). The
  robot has a paint-roller pose and a lifting pose. Vega's dome: CONSTELLATION CONNECT (stars where grid lines cross:
  Big Dipper, Cassiopeia, Cygnus, Orion, Leo; "2 right and 1 down from the last star" at Coordinates 6+) and DESIGN YOUR
  OWN (up to 8 stars, named, kept in the dome). Pro bands to 20 for Tens & Ones (place value), Skip Counting, Volume.
- **v1.54 Starlight Row (Oct 24), Garrett's own ideas.** VEGA (a cat, Arizona) and the STARLIGHT DOME: the Star Organ, whose
  8 pipes are telescopes pointed at the planets (short pipe = high note, Mercury to Neptune), Play for Vega (3 challenges),
  4 Sky Shows (Day & Night, Moon Phases, Planet Lineup, Seasons: predict, work the model, quick check, Star Log), and Vega's
  5-step Star Quest (Pocket Telescope + Star Antenna). New concept Space & Sky. THE BOT GARAGE: build and name your own
  robot (4 heads, 4 eyes, 4 bodies, wheels/treads/legs/hover, antennas, 9 paints, 6 light colors), install abilities:
  DIG (treasure on a coordinate grid, 3 tiers) and COOK (scale a recipe, measure cups, oven timer; 8 dishes). Gold paint at
  10 robot jobs. Probability Pro bands to Lvl 20. Fix: v1.52 keepsakes, Lab Coat and Golden Magnifier now register.
- **v1.53 Coach's Pick + Clock Quest (Oct 23), built from Garrett's Grown-ups report.** Weekly Checkup unblocked (3 unplaced
  concepts kept it from ever running; now up to 5 unplaced are asked first and count as placed). Coach's Pick: Elly picks 3
  low or long-unplayed concepts a day, one-tap Jam each, all three = a gold record; Hank's jobs and Dot's cases favor the picks
  3 to 1. Clock push (Clocks & Time was Lvl 2): a clock-face Big Job, a "read the long hand as minutes" mistake kind for Dot,
  and Tock's 5-step Clock Quest ending in the Golden Pocket Watch. Pro bands (to Lvl 20) for the five he had capped: Rounding,
  Negative Numbers, Days & Months, Money & Coins, Greater & Less Than (15 more Elly lessons). News card, guides, To-Do rows,
  Grown-ups card.
- **v1.52 Think Tank + Labs (Oct 23).** Four new neighbors on two new streets at the bottom of the map. THINK TANK: Hank's
  Big Jobs (generated 2-3 step word problems, one step at a time, 5 a day + overtime) and Dot's Detective Desk (Spot the
  Mistake: one planted error per case, find it then fix it; 13 kinds of mistake to collect for the Golden Magnifier).
  LAB ROW: Fizz's Science Lab (Melt & Freeze, Magnet Test, Sink or Float, Ramp Racer) and Honey's Life Lab (Life Cycles,
  Food Chains): predict, test, see what happened, quick check, Lab Notebook; all six earn Fizz's Lab Coat. Science is a
  real concept now (Soundcheck, checkups, duels). Tiers 13-16 / 17-20 renamed Heroic / Legendary. Bright Ideas Building,
  Bright Ideas card page (197 cards), news card, guides, To-Do rows, Grown-ups card.
- **v1.51 Pro Levels + Quest Log + guide audit (Oct 23).** Level cap 12 -> 20 for 21 concepts (Adding & Subtracting,
  Multiplying & Dividing, Fractions & Decimals), two tiers above Platinum (Heroic 13-16, Legendary 17-20 since v1.52, renamable in
  the Grown-ups' corner), 63 Elly lessons that open before the first question of each new band, Proof IV and V, Pro
  Soundcheck re-placement above 12, money question fix (no more negative change). The TO DO pill: every open quest with
  the exact step and how to do it, today's jobs with done marks, New in town, Everything in the city, news archive.
  Every screen has a "?" guide now (was 14 screens, now 50+). Sound-only changes: none.
- **v1.50 Robot Workshop (Oct 22).** Coding & Logic: Ada + Beep, 40 puzzles, daily Test Track, Build a Track.
- **v1.49 (Oct 22).** Modal-backdrop null guard; find-step cards (acorns) with Show me / Ask Fern.
- **v1.48 (Oct 20).** News queue + first-visit guides for the Halloween and Card Club screens.
- **v1.47 (Oct 20).** Card Club: 191 cards, packs, duels, Town Rank.
- **v1.46 (Oct 19).** Hollow Lane: 8 newcomers with welcome quests, trick-or-treat, pumpkin hunt, costumes, contest.

## Locked decisions (short list; the handoff has the full one)
- Levels 1-12 are never re-scaled; new content only goes ABOVE 12. Non-Pro concepts stay capped at 12 until their bands exist.
- Teach first: a new Pro band never asks a question before Elly's lesson for that band has been shown (except in placement, where the point is to measure).
- Every new feature ships with: a MU_NEWS card, a G guide for each new screen, a row in the To-Do "New in town" list, and (if it has daily or step state) a To-Do entry.
- One fixed plot of land, camera-driven; no pointer capture; three currencies; crash-proof art; the red error box stays.

## Open queue (in order)
1. Deploy v1.55 (includes v1.51-v1.54). Device check: news card, install Paint and Lift, one paint job, one lift job,
   one constellation, design one.
2. Grown-ups report in about a week: Coordinates, Area, Perimeter, Measurement should move; check what else is near 12.
3. v1.56 WORDS + CODE: Word Hoard depth, Robot Workshop chapters 6-7 with Garrett's own robot as a second bot, Grammar.
   Pro bands from the report (likely Odd & Even, Doubling & Halving, Fractions follow-ups).
4. v1.57 LIFE SKILLS: History wing, Money & Life skills (a robot Shop ability: budgets, change, unit prices).
5. Ideas parked: a robot Garden ability (plant needs, measuring growth), Vega's planet postcards (distances, big numbers).
6. Tuning after play: Pro proof forceL bands, Pro Soundcheck batch size (11) and maxQ (4), tier toast, To-Do row set.
