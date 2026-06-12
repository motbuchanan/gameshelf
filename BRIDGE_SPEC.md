# Bridge Builders — locked house spec (from Mot's Xbox observation, 2026-06-11)

## Source
No in-game rules screen exists. Spec reverse-engineered by Mot from live play + photos.

## Board
- 15x15. Premium square POSITIONS are FIXED across games; the TYPE at each position
  (DL/TL/DW/TW) is RESHUFFLED each new game. House version: fixed designed layout
  (similar density to Xbox photos, ~40-46 premiums, scattered, none on arrows),
  types shuffled per game. Swap-in point: single PREM_POSITIONS array.
- Two START ARROWS fixed on the LEFT edge (col 0), roughly 1/3 and 2/3 down
  (rows 4 and 10). One per player.

## Play
- Tiles are OWNED: tinted per player (their seat colors).
- A play must connect to YOUR OWN network (first play covers your arrow).
- Words may pass THROUGH opponent tiles (their letters count in the word for
  dictionary + turn scoring) but opponent tiles are NOT part of your bridge.
- Turn scoring = standard Scrabble scoring incl. premiums (verified vs "26" preview).
- Racks of 7, standard 100-tile bag, blanks, swap/pass — reuse scrabble.html engine.
- Dictionary: words.js (ENABLE + QI/ZA/OK/EW etc).

## Ending
- When a player's own network reaches the RIGHT edge (col 14): game ends at the
  end of that turn. That player gets +10.
- Then FINAL PATH SCORING runs for BOTH players (bridge_core.js, proven 2026-06-11):
  * path = simple path over own tiles starting at col 0
  * horizontal word touched -> full word letter-value once
  * vertical connector letters -> own value, only when traversed
  * maximize over paths (best branch wins at corners)
- Winner = turn-score total + path score + crossing bonus, highest wins.

## Status
- bridge_core.js: DONE, 8/8 harness tests pass (in repo/outputs).
- Remaining: assemble bridge.html around scrabble engine patterns
  (tinted tiles, own-network validation, fixed-positions/shuffled-types premiums,
  arrows, race end, dual path scoring, stats key "bridge_games" -> next runtime bump).

## Visual key (from Mot's cleaned photo)
- GREEN = Triple Letter Score
- BLUE  = Double Letter Score
- ORANGE = Triple Word Score
- PINK  = Double Word Score
- Tile ownership tint: player 1 blue/teal cast, player 2 red/pink cast;
  opponent letters can sit inside your word (e.g. L[I]NTZ with pink I).
- Rack is a dark red tray; preview score appears on a notepad icon (top corner).
