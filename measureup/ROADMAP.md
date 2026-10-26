# Measure Up - ROADMAP (lives in the repo at measureup/ROADMAP.md)

Updated with every upload. Claude reads this back from the repo before working, to check what was actually
uploaded against what the last chat thought it shipped. Full build notes stay in MEASUREUP-HANDOFF.md
(in the NOTES zip, never uploaded).

## Current
- **v1.59 · Oct 26 2026** (sw cache `measureup-v1-59b`). Contains v1.51 through v1.58. Live URL: https://motbuchanan.github.io/gameshelf/measureup/
- Files in the repo folder: `index.html`, `sw.js`, `manifest.json`, `ROADMAP.md` (this file, new in v1.51).

## What shipped lately
- **v1.59 Fit pass (Oct 26), from the Oct 25 Game Shelf repair round.** Text fits from 320px phones to tablets, portrait
  and landscape: the Garage top bar, the hero cards (Robot Workshop with Ada and Beep, Daily Squawk, Word Lab) and the Bot
  Garage banners now wrap. Checked with site/tools/fitcheck.py plus a 36-screen sweep using its measuring code at six sizes.
  Service worker keeps the shelf v73 rule (deletes only its own `measureup-*` caches). Cache renamed `measureup-v1-59b`
  because `measureup-v1-59` was already live with index v1.58. Fonts: system stacks only, nothing downloaded.
- **v1.58 Words + Code (Oct 24).** STORY STREET, a new row at the bottom of the map.
  THE DAILY SQUAWK: a new subject, GRAMMAR (concept `gram`, its own Words & Grammar strand, placed by the Soundcheck), taught by
  MAC the macaw. Four desks: Word Detective (tap every noun / verb / adjective / adverb / pronoun in a real sentence),
  Proofreader (tap the words that need capitals, pick the end mark), Verb Press (past tense incl. rule-breakers, agreement,
  future), Silly Front Page (pick the right part of speech, then the silly paper prints and is archived). Mac's 5-step Press
  Pass quest (a Press Pass keepsake, +2 packs). ROBOT WORKSHOP CHAPTERS 6-7 star HIS robot from the Bot Garage: Functions (a
  named ⭐ move he builds once and reuses; he can name it) and If This (IF cards on red and blue tiles inside Repeats).
  16 levels, each proven to need the new card. BIBI'S WORD LAB (Root Builder, Analogy Link, Shade Ladder) and 3 new Word
  Hoard chests (More Roots, Synonyms & Antonyms, Context Clues: 64 gems now).
- **v1.57 The Invention Bench (Oct 24).** The Idea Notebook comes to life: every idea Garrett picks after an Ai Co. job
  becomes a blueprint at Ada's Invention Bench. He builds it in 3 steps (count the bolts = multiplication, cut the bar into
  equal pieces = division, measure the frame = feet / yards / inches) and the part goes ON his robot (show up to 4).
  18 parts. Three change the jobs: Tow Trailer (Lift: one more box, 1.5x the load), Metal Detector (Dig: how many squares
  away after a miss), Timer Screen (Dishes: a clock face on the timer step). The rest pay +2 coins on that ability's jobs.
  Ideas he typed himself become custom parts (a gold gear badge, +1 coin on any job).
- **v1.56 Ai Co. Helper Bots + the Candy Bank (Oct 24), Garrett's ideas.** His robot company AI CO. ("for the ai
  corporation"): two helper abilities, DISHES (load the rack in rows x columns, share cups equally with remainders,
  dishwasher timer) and CLEAN UP (sort a messy room into bins, then read the robot's bar graph, line plot, median/mean).
  The AI CO. JOB BOARD: 3 neighbor problems a day (2-part jobs after 5), the design loop: read the problem, pick the
  right ability (wrong tools explained), do it, customer review, pick an improvement for the Idea Notebook. Company
  levels Startup -> Garage Helpers -> Neighborhood Favorite -> Town-Wide -> Legendary. ELLY'S CANDY BANK for Mot and
  Garrett's real deal: real candy = 10% of ALL candy collected (spent candy still counts); lifetime tally, bag, real
  earned, given/owed (grown-up marks given, percent and tally editable). More candy until Nov 7 for Ai Co. jobs, robot
  jobs, Coach's Pick and every 5 right answers. COUNT YOUR HAUL from Halloween night: graph the real candy bag.
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
1. Deploy v1.58 (includes v1.51-v1.57). Device check: both news cards, the Candy Bank numbers (fix the all-time total
   in Grown-ups if the estimate is off), install Dishes + Clean Up, one Ai Co. job end to end.
2. Halloween night (Oct 31): Count Your Haul with the real bag; Grand Finals + Monster Bash open by themselves.
3. Grown-ups report in about a week: Rows & Columns, Line Plots, Mean & Median, Coordinates, Area should move.
4. Device check for v1.58: one Daily Squawk desk, Robot Chapter 6 level 1 with his robot, one Word Lab round.
5. v1.59 LIFE SKILLS: History wing, Money & Life skills (Ai Co. pricing jobs, a robot Shop ability).
6. Tuning after play: Pro proof forceL bands, Pro Soundcheck batch size (11) and maxQ (4), tier toast, To-Do row set.
