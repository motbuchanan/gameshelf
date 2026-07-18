# Game Shelf — Handoff (v51)

## What this is
Game Shelf is a family PWA game library — a "shelf" of cartridge tiles, each launching a self-contained HTML game. Deployed via GitHub Pages at **motbuchanan.github.io/gameshelf** (repo `motbuchanan/gameshelf`, branch `main`). Primary player is Mot's son (~6) on an iPad, so per-frame performance and touch targets matter. The authoritative signal of what's deployed is the cache string in `sw.js` (`const CACHE="gameshelf-vNN"`) plus the badge in `index.html` (`>vNN<`); these two must always match.

## Current state
**Deployed target: v51** (previous live = v50). This session did NOT boost any game art — it fixed a viewport clipping bug reported on two games.

Shipped this session (v50 → v51):
- **Viewport clip fix on `critter-garden.html` (v0.7 → v0.8) and `botlab.html` (v18.0 → v18.1).** On Mot's device the bottom control row was cut off and unreachable (Critter's "My Garden / Match / ⚙️" row; Bot Lab's MEALS/POP/GEN/MOOD stats row). Root cause: both games sized their frame to `100dvh` with `overflow:hidden`, and Android Chrome reports `100dvh` as the *toolbar-hidden* height while the toolbar is showing — so the bottom 24–31px landed behind the toolbar with no way to scroll it into view. Fix: size the frame to `100svh` (the small/always-visible viewport), add a scroll safety-valve (Critter) or keep `overflow:hidden` for canvas-gesture safety (Bot Lab), and add `env(safe-area-inset-bottom)` reserve so the bottom row never rides the edge.
- **Bot Lab latent bug fixed in the same pass:** `#moreSheet` (the "More controls" panel) had NO positioning rule — it was `position:static` and rendered inline instead of as a bottom sheet, and its tap-outside-to-close couldn't fire. Gave it the same fixed-overlay rule as `#feedSheet` (shared selector), both now `100svh` with safe-bottom padding on `.sheetbox`.
- **Blocks line-clear FX fix (`blocks.html`).** Reported: the screen flashed white on a line clear, faded very slowly, and the game appeared to slow down. Root cause: `loop()` ran on rAF but **never called `draw()`** — it only advanced the drop timer, so rendering was event-driven (move / rotate / drop-step / new game). The visual boost had added frame-decayed effects (`_flash-=0.06`, `pt.life-=0.02`) to a game that only redraws on state change, so at level 1 (800ms drop interval) the flash needed ~17 draws ≈ **13 seconds** to clear and particles advanced one step per drop. Fix: `loop()` now calls `draw(dt)` every frame (and keeps drawing when the game is over so FX settle); all FX decay is scaled by `k = dt/16.67`, making it framerate-independent; flash peak lowered 0.22 → 0.16. Because the game went from ~1 render/sec to 60, the shimmer motes were re-baked to a single offscreen sprite instead of constructing 6 radial gradients per frame.
  Measured before → after: flash 13,213ms → 278ms; particles >30,000ms → 828ms; 62fps held; peak flash alpha verified at 0.158 by reading canvas pixels directly.
- **Thumbstack section + title fix (`index.html`).** Thumbstack was rendering among the board/dice games with its cover art covering its own title. Cause: it was registered in GAMES, `sw.js` and GAME_KEYS but never added to `ARCADE_H`, and the board grid is built as "everything not in `ARCADE_H`/`CARD_H`". Because board tiles expect a small SVG icon while cartridges use full-bleed sticker art, the misrouting also produced the title overlap. Fix: added `'thumbstack.html'` to `ARCADE_H` (after `blocks.html`). Verified: cartridge metrics now identical to the other arcade tiles (cart 183px, title top 161px, art bottom 101px, no overlap), present once, in `.vcarts`, absent from the board grid. Arcade count 13 → 14.
- **Escape-hatch audit + fix (7 games).** Garrett got stuck in AstroMerge and Cozy Critter Garden on iPad: installed/standalone PWA has no browser back button (Android's OS back had been masking this). Audited all 71 HTML files for a route back to the shelf. Seven had **none**: `astromerge`, `botlab`, `critter-garden`, `starstuff` (all four in the arcade box), plus `coloringbook`, `harmonica` (HARP) and `sharp` (SHARP). Every other game already had one. Added a `⌂ Shelf` link to all seven, verified each renders, sits on top, and navigates to `index.html`.
  Placement rule discovered: an in-header link gets covered by intro/tutorial overlays. Bot Lab was the proof — it shows a "Start empty / Give me a demo" chooser on **every** launch with no saved colony, so a header link left no way out at exactly the screen a lost kid lands on. Final design: `position:fixed` pill at top-left, `z-index:2147483000`, safe-area insets, ~83×39px touch target, above all modals; colliding headers (`botlab`, `critter-garden`, `sharp`) got reserved left padding so nothing is covered. `harmonica` uses an in-flow link (no overlays). Verified Bot Lab is escapable while its chooser is still up.
- **Shelf bump:** `sw.js` `gameshelf-v50` → `gameshelf-v51`, `index.html` badge `>v50<` → `>v51<`. Required so returning devices refresh the three precached game files (`botlab.html`, `critter-garden.html`, `blocks.html`, `astromerge.html`, `starstuff.html`, `coloringbook.html`, `harmonica.html`, `sharp.html` are all in the precache list). No game added/removed — GAME_KEYS / achievements / tiles untouched.

Verified this session (headless Playwright at 411×825, 411×740, 360×640, iPad-ish DPR 2.625):
- Critter bottom row clears the fold by 24px at every tested height; zero page errors.
- Bot Lab stats row clears the fold by 31px; zero page errors.
- Bot Lab `#moreSheet` now renders `position:fixed`, dimmed backdrop, sheet anchored to the bottom, content scrolls.
- Validation gate passed both files: 1 inline script each, `node --check` ok, acorn AST parse ok, 0 Jekyll tokens, 0 unescaped `</script`.
- `sw.js` `node --check` ok; cache/badge/game-badges all consistent (v51 / v51 / v0.8 / v18.1).

Untested on device: not yet confirmed on Garrett's actual iPad. The fix is CSS-only (svh + safe-area + one missing overlay rule); no logic touched. Worth a real-device tap-test that the bottom rows are reachable and the More sheet opens correctly.

## Locked decisions
Method and per-game taste calls are settled — do not reopen without a reason:

- **Fit-to-viewport frames use `100svh`, never bare `100dvh`/`100vh`, when the layout has an interactive bottom row and `overflow:hidden`.** `dvh` over-reports on Android Chrome while the toolbar is visible, hiding the bottom strip. `svh` = the smallest (toolbar-shown) viewport, so the whole app stays inside the always-visible area; when the toolbar retracts, the background just fills the small gap below (invisible). Always pair with `env(safe-area-inset-bottom)` bottom reserve.
- **The visual-boost method is `VISUAL-BOOST-PLAYBOOK.md`** (bundled). Never touch game logic; bake the static world once to an offscreen canvas with a seeded PRNG and blit it; run one continuous rAF loop layered under the game; particles are triggered by *diffing game state each frame*, never by hooking game code.
- **Preview → approve → integrate → validate → HOLD; deploy all approved games in one batch** at the end, not per-game.
- **Star Defender enemies have character, not generic silhouettes.** Three species by row: cyclops (one big eye + horns), tentacled squid, fang-grin. Mot rejected the generic Galaga/Space-Invaders look. Sleek glowing ship replaced the old triangle.
- **Brick Break** — neon-arcade-grid backdrop (rejected: cosmic, plain dark), subtle chips, glowing blue ball matching the cover.
- **Blocks** — outline ghost (rejected: translucent-fill ghost), flash + flying particles on line clear, subtle drifting shimmer in the well.
- **Paddle Duel** — red top / blue bottom paddles matching the cover (rejected: keeping green), cross-streak + particles on impact, tinted red/blue goal ends.
- **Minesweeper** — sweating-bomb character (rejected: plain 💣), classic colored numbers, life effects A (reveal-pop) + B (ambient fireflies) + D (living bomb). Rejected: C (tile sheen sweep).
- **When a separate chat hands over files for an existing game/shelf, do NOT upload them wholesale.** Merge only the new content into the current version.

## Open items
No blocking item. In rough priority:
1. **Real-device pass on the v51 fix** — tap the bottom rows on Critter and Bot Lab on Garrett's iPad; open Bot Lab's "More" sheet. Confirm nothing is clipped and the More sheet dims/anchors correctly.
2. **`svh` sweep on the remaining games** — `match3` (Gem Match), `salon-dash`, `astromerge`, `starstuff`, `thumbstack` likely share the same `100dvh + overflow:hidden` frame and the same latent bottom-row clip fixed in v51. This is a layout bug, unrelated to the (closed) art track. Grep each for `100dvh` and `overflow:hidden` on the frame element and apply the v51 pattern.
3. **Art/graphics track is DONE — do not re-propose it.** The visual boost and the cover-art pass are complete and deployed (verified in the repo at v50: Snake, Star Defender, Brick Break, Blocks, Paddle Duel, Minesweeper all carry their visual layer; all 13 `*-sticker.png` covers are present and current). Any future art work is new scope Mot initiates, not leftover work.
4. **Real-device pass on the six already-boosted games** (Snake, Star Defender, Brick Break, Blocks, Paddle Duel, Minesweeper) — iPad frame rate + touch; especially Star Defender (most layered) and Minesweeper's firefly rAF loop.
5. *(Closed — Star Defender cover was updated and is live; see item 3.)*
6. **Project-knowledge sync** — stored knowledge files lag the live repo. Treat GitHub raw as source of truth.

## Gotchas
- **`100dvh + overflow:hidden` clips the bottom row on Android Chrome.** This session's bug. Use `100svh` for the frame + `env(safe-area-inset-bottom)` reserve. Verify headlessly by rendering at the true *visible* height (≈ screenshot pixel-height ÷ DPR, e.g. 1080×2168 @2.625 → 411×825) and asserting the bottom element's `getBoundingClientRect().bottom ≤ innerHeight`. NOTE: the clip does NOT reproduce at the same viewport headlessly unless you account for it — headless Chrome's dvh == visible, so a naive render "fits" while the device clips. Test at the reduced visible height, not the device's full height.
- **A missing overlay positioning rule renders a "sheet" inline.** Bot Lab's `#moreSheet` had only `#moreSheet.hide{display:none}` and no `position:fixed` base rule, so it fell back to `position:static`. Symptom: a panel that's meant to be a modal/sheet shows up shoved into normal flow and its backdrop-click-close does nothing. When adding a new sheet, mirror the existing one's full rule (or use a shared `#a,#b{…}` selector).
- **A new game must be registered in FIVE systems** or it silently half-works: `index.html` **GAMES entry**, `index.html` **`ARCADE_H`** (or `CARD_H`) for section routing, `sw.js` (precache the `.html` **and** its `-sticker.png`, plus bump the cache), `gamenight.js` (`<key>_games` in GAME_KEYS), `achievements.js` (NAMES + ladder + METRIC). Externally-prepped game notes routinely omit `achievements.js` and the sticker precache — check both explicitly.
- **`ARCADE_H` / `CARD_H` are section routers, and omission fails silently and confusingly.** `index.html` builds the board-games grid as "everything not in `ARCADE_H` and not in `CARD_H`", so a missing entry doesn't error — the game just appears in the wrong section. Worse, the two layouts expect different art: cartridges (`.vcarts`) use full-bleed `<img>` sticker art, board tiles expect a small inline SVG icon. A full-bleed sticker rendered as a board tile covers its own title. Thumbstack hit exactly this (fixed in v51): it was in GAMES, `sw.js` and GAME_KEYS but not `ARCADE_H`, so it landed among the dice/board games with its cover art over the name. **Symptom-to-cause shortcut: "game is in the wrong section" and "art is covering the title" are the same bug, not two.**
- **`ks_games` substring trap:** grepping `ks_games` matches `blocks_games`. Use exact-boundary matching (`"key_games"`).
- **Cache + badge move together** every deploy (`sw.js` `gameshelf-vNN` and `index.html` `>vNN<`), or precached files serve stale to returning devices. The real index badge is the `>vNN</div>` inside `#verBadge` (~line 402) — there is a coincidental `v50`/`vNN` substring inside the base64 RockSalt font at ~line 13; do NOT edit that one.
- **Validation gate before shipping:** extract each inline `<script>` and `node --check` + acorn parse; assert zero Jekyll tokens (`{{`, `{%`); assert zero unescaped `</script`; Playwright render-test (boots, plays, no page errors) at reduced visible heights; screenshot review.
- **Frame-decayed FX in an event-driven render loop = effects that last for seconds.** Before adding any continuous effect (flash, particles, shimmer, pulse), confirm the game actually renders every frame. Discrete-step games (Blocks/Tetris-style) often run rAF purely as a *timer* and call `draw()` only on state change — dropping frame-based decay into that makes a 280ms flash last 13 seconds and particles crawl. Checked this session: Blocks was the only offender; Snake, Star Defender, Brick Break, Paddle Duel and Minesweeper all already render every frame. Prefer time-scaled decay (`k = dt/16.67`) over per-frame constants everywhere — per-frame decay also runs 2× fast on a 120Hz display (Brick Break and Paddle Duel still use raw per-frame `life-=` constants; harmless today, but that's why).
- **Going from event-driven to per-frame rendering multiplies the cost of anything built per frame.** Blocks was constructing 6 radial gradients per `draw()`; at ~1 draw/sec that was free, at 60fps it is the most expensive thing on screen. Bake gradients/glows to an offscreen canvas once and `drawImage` them.
- **Do not verify short-lived effects with screenshots.** A 278ms flash is gone before Playwright's capture completes, and a wrong pixel region silently reports "no change." Read canvas pixels via `getImageData` (freeze the loop, set the effect value, call `draw()` once) and compute implied alpha.
- **Every game needs its own way back to the shelf — an installed PWA has no back button.** Android's OS back button masks this during testing; on iPad standalone there is no escape at all. Any new game/tool MUST ship a `⌂ Shelf` link to `index.html`. Prefer a fixed, top-of-stack pill (`position:fixed`, very high z-index, safe-area insets) over a header link: header links get buried by the game's own intro/tutorial/chooser overlays, which is precisely the screen a stuck child is on. Reserve left padding in the header so the pill covers nothing. Audit command: grep every game for `href="index.html"` — zero hits means a dead end.
- **Patch minified structures with Python string replacement, not `sed`.**
- **Mobile deploy:** GitHub's Commit button sits below the file list and is easy to miss.

## File map
- Repo / branch: `motbuchanan/gameshelf` / `main`. Live: `https://motbuchanan.github.io/gameshelf`.
- Version source of truth: `sw.js` → `const CACHE="gameshelf-vNN"`; mirror in `index.html` badge `>vNN<` (inside `#verBadge`). **Currently v51.**
- Fetch current files: `https://raw.githubusercontent.com/motbuchanan/gameshelf/main/<file>`.
- Changed this session (in this bundle, ready to drop into the repo): `critter-garden.html`, `botlab.html`, `sw.js`, `index.html`.
- Filename traps (shelf id ≠ filename in two places):
  - Critter game file is **`critter-garden.html`** (hyphenated); prose in earlier handoffs said `crittergarden`.
  - Gem Match uses shelf id/key **`gemmatch`** (`gemmatch_games`, `gemmatch-sticker.png`) but the actual game file is **`match3.html`**. Grepping for `gemmatch.html` finds nothing.
  - Salon Dash file is **`salon-dash.html`** (hyphenated) while its sticker is **`salondash-sticker.png`** (not hyphenated).
- Per-game version badges: Critter `v0.8 · Jul 17`; Bot Lab `v18.1 · Jul 17`.
- Interlocking registration files: `index.html`, `sw.js`, `gamenight.js` (GAME_KEYS), `achievements.js`. Rules in `rulesdata.js`.
- Standing recipe: `VISUAL-BOOST-PLAYBOOK.md` (bundled).
- Working directory this session: `/home/claude/v50/`.

## People
- **Mot** — developer / owner. Makes all taste calls; approves each visual direction before integration.
- **Garrett** (~6) — primary player, on iPad. Performance, readability, age-appropriate content are constraints.

## Re-entry instructions (first actions for the next session)
1. `curl -s https://raw.githubusercontent.com/motbuchanan/gameshelf/main/sw.js | grep CACHE` — confirm the deployed version. If it still reads v50, the v51 bundle in this handoff has not been committed yet; deploy it first.
2. Read this handoff and `VISUAL-BOOST-PLAYBOOK.md` fully; treat Locked decisions as binding.
3. For any edit, fetch the current file from the raw GitHub URL — never splice against a stale project-knowledge copy.
4. To fix bottom-row clipping on any other game: switch the frame element from `100dvh` to `100svh`, add `env(safe-area-inset-bottom)` bottom reserve, and (unless the game owns a full-screen canvas gesture surface) add an `overflow-y:auto; overscroll-behavior-y:contain` safety valve. Verify at reduced visible height per the Gotchas note.
5. To add a new game: register in all five systems (GAMES, ARCADE_H/CARD_H, sw.js, gamenight.js, achievements.js); verify with exact-boundary key matching; independently check `achievements.js` and the `-sticker.png` precache line (external handoffs twice omitted both).

## Standing rules established this session (suggest adding to skills)
1. **`gameshelf-project` / `mot-vibe-code-standards`:** fit-to-viewport frames with an interactive bottom row use `100svh` + `env(safe-area-inset-bottom)`, never bare `100dvh`/`100vh` under `overflow:hidden`. Verify headlessly at the *reduced visible height*, not the device's full height (the clip won't reproduce otherwise).
2. **`gameshelf-project`:** when adding a bottom-sheet/modal, mirror an existing sheet's full positioning rule (or share the selector) — a missing `position:fixed` base rule silently renders the sheet inline as `position:static`.
