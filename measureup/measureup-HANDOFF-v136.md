# Measure Up - HANDOFF (v1.36 - Oct 3 2026)

Single-file HTML PWA for Garrett. Repo `motbuchanan/gameshelf`, folder `measureup/`, live at
motbuchanan.github.io/gameshelf/measureup/. Authoritative files: `measureup/index.html` + `measureup/sw.js`.

## v1.36 - START HARDENING (the "nothing happens when you tap Let's Play" fix)

This release fixes the report: tapping Let's Play at load did nothing.

Root cause (a whole class of it, not one line): the start button runs `renderHub(); openTown();`, and
`openTown()` renders the whole town map (`renderTown`) BEFORE it calls `show('scr-town')`. The v1.35 Downtown
layer added map wraps (`townPlan` / `townGeo` / `townFacade`). If any of those threw on a particular saved game or
device, `openTown()` threw before the screen switched - so the tap appeared to do nothing and the player was stuck
on the title. The full-screen splash (z-index 200) also sits over the Let's Play button, so if its one-tap dismiss
ever stalled, taps landed on the invisible splash instead of the button.

What v1.36 does (all additive, no gameplay change):
1. **Hardened the four v1.35 map wraps** (`townPlan`/`townGeo`/`townFacade`/`townGo`) with try/catch + null-safety +
   a loop guard, so they can NEVER throw inside `renderTown`/`openTown`. On any trouble they fall back to the base
   map (you'd just not see the Downtown extras that one frame), never a crash.
2. **`openTown` guard**: wrapped once more so `show('scr-town')` ALWAYS runs even if an inner wrap throws. You can't
   get stuck on the title anymore.
3. **Bulletproof Let's Play button** (block 62): rebuilt handler - every step (`ac`, `sTap`, `renderHub`,
   `openTown`) is individually guarded, with a last-resort path that still gets the player off the title. Debounced
   so a double-tap can't double-fire.
4. **Bulletproof splash**: one tap makes it click-through instantly (the button underneath is live at once) and it
   fully clears in ~0.6s; the band/audio flourish is best-effort and can never strand it; it listens for
   pointer/touch/mouse/click; and a 6-second watchdog force-removes it if it ever lingers. The game can no longer be
   permanently stuck behind the splash at load.

Deploy contract honored: badge `v1.36 - Oct 3` (vbadge + VERSION const), sw cache key `measureup-v1-36`.

### Verification
- `test-v136.js`: 13/13 - version badge; real two-tap flow reaches town (zero errors); start survives a thrown
  `renderTown`; start survives a thrown `renderHub`; splash watchdog clears with no tap then Let's Play works;
  splash dismisses on one tap even when audio/`memberSVG` throw; new player reaches intro.
- `test-v135.js`: 30/30 functional assertions still pass (only the two hard-coded "v1.35" badge asserts flip,
  expected). Real Chromium render: Downtown district + all 4 buildings + Garrett's apartment facade draw correctly,
  shops/bank/apartment all work, persists, ZERO page errors.

### IMPORTANT for Mot - confirm the update landed
After uploading, open the live URL and check the badge reads **v1.36 - Oct 3**. If it still shows v1.35, it's a
cached old build: fully close the app/tab and reopen (the PWA updates when the new `sw.js` with cache key
`measureup-v1-36` installs). The badge is the load-confirmation - if it says v1.36, the fix is live.

---

## v1.35 - DOWNTOWN (Animal-Crossing layer, Phase 1) - still current content

THREE currencies (notes/coins/gold); a Downtown district with Cozy Home (Lumi, furniture), Corner Store (Oompa,
decor/themes + sell), The Bank (Reg, daily allowance + swap), and Your Apartment to decorate (inventory + a wall
strip + floor grid + floor/wall themes). Shared item catalog (27 items) with style tags for Phase 2 tastes.
Everything persists in `S.coins` / `S.inv` / `S.home`. See the in-file v1.35 block comment for specifics.

### NEXT (unchanged roadmap)
- PHASE 2: apartment buildings + homes on the map; visit townspeople; each has a room with a taste (style tags +
  their `likes`); help decorate theirs.
- PHASE 3: trade + fetch quests (bring Fern a plant, trade items between characters, fill wishlists).
