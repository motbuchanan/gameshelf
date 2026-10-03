# Measure Up - HANDOFF (v1.38 - Oct 3 2026)

Single-file HTML PWA for Garrett. Repo `motbuchanan/gameshelf`, folder `measureup/`, live at
motbuchanan.github.io/gameshelf/measureup/. Authoritative files: `measureup/index.html` + `measureup/sw.js`.

## v1.38 - LANDSCAPE CITY FITS ALL DISTRICTS (the real black-screen fix)

The v1.37 on-screen error reporter pinned the exact cause. The stack pointed at `renderTown` line 15565,
`geo.pos[ri].sign`, inside the district loop - and it only happened **in landscape**.

Root cause: the town has two layouts. Portrait builds one map position per district row, so it scales to any
number of districts. Landscape is a 2-column city grid that was sized for exactly **6 districts**. The
Downtown layer (v1.35) pushed the town to **8** district rows, so in landscape rows 7-8 (Downtown + your
apartment) had no map position and the render threw - a blank screen with just Elly's button. Rotating to
portrait rebuilt with all 8 positions, which is why it came back in portrait. (Before Downtown there were
exactly 6 rows, a perfect fit, so landscape had always worked.)

What v1.38 does:
1. **Permanent crash guard** (base `renderTown`): the district loop now skips any row without a map
   position instead of throwing. No pos/plan mismatch can ever black out the town again.
2. **Landscape shows every district** (block 64, `townGeo` wide wrap): continues the exact same 2-column
   grid downward so there is a block for every district row (formula matches the existing blocks, so the
   first 6 districts don't move), and grows the city height to fit.
3. **Whole city scaled to the screen** (`twFit` wide wrap): landscape now scales the full city (however
   tall) to fit the viewport, reading the real stage size, so nothing is cut off. Portrait fitting is
   untouched.

Verified in a real 1080x810 landscape Chromium render: all 8 districts draw in a clean 4-level grid
(UPTOWN / STAGE STREET, THE COVE / WORD ROW, POST & ART / HEALTH ROW, DOWNTOWN / DOWNTOWN-HOME with
Garrett's own blob on Your Apartment), scaled to fit, ZERO page errors, no error overlay. Portrait render
still clean (Downtown present, persists, zero errors).

Kept from prior releases: v1.37 crash-proof art primitives + on-screen error reporter (still there as a
safety net - if anything else ever throws you'll see the red box again), v1.36 bulletproof Let's Play +
splash, v1.35 Downtown/shops/coins/apartment.

Deploy contract: badge `v1.38 - Oct 3` (vbadge + VERSION const), sw cache key `measureup-v1-38`.

### Validation
- Full file: 0 banned emoji, 0 Jekyll tokens, 64/64 script blocks pass `node --check`, no added em dashes.
- `test-v137.js` crash-proofing: all functional asserts pass (only the two v1.37 badge-string asserts flip).
- `test-v135.js` features: 30/30 (only the two v1.35 badge-string asserts flip).
- Landscape render `shot-land.js`: planRows 8, posWide 8 (was 6), 16 facades, zero errors.

### For Mot
Confirm the badge reads **v1.38 - Oct 3** after uploading (fully close/reopen if it shows an older number so
the new service worker installs). Hand Garrett the iPad in landscape - the whole city, Downtown included,
should be there. If a red error box ever shows up again, tap Copy and send it; that reporter stays in as a
safety net.

### NEXT (unchanged roadmap)
- PHASE 2: apartment buildings + homes on the map; visit townspeople; each has a room/taste; help decorate.
- PHASE 3: trade + fetch quests.
