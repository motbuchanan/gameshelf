# Measure Up - HANDOFF (v1.37 - Oct 3 2026)

Single-file HTML PWA for Garrett. Repo `motbuchanan/gameshelf`, folder `measureup/`, live at
motbuchanan.github.io/gameshelf/measureup/. Authoritative files: `measureup/index.html` + `measureup/sw.js`.

## v1.37 - RENDER CRASH-PROOFING (the blank/black-screen fix)

Follow-up to v1.36. After v1.36 the Let's Play button transitioned correctly (the freeze was gone) but it
landed on a blank/black screen, and the Garage (hub) was blank too - only Elly's floating button showed.

Root cause: both `renderHub()` and `renderTown()` call `creatureSVG(S.creature, ..)` and `memberSVG(..)`
at the very top, and `creatureSVG` reads `c.col` with no guard. One bad value in Garrett's actual saved
avatar (or a band member's art) throws, the render aborts mid-way, and the screen is left empty. Because
BOTH screens render the avatar, both blanked. Clean synthesized test saves never carried the bad value,
which is why it didn't show up in testing.

What v1.37 does (block 63, additive, no gameplay change):
1. **Crash-proof art primitives.** `creatureSVG` / `memberSVG` / `ellySVG` / `citSvg` are wrapped so a bad
   value returns a safe placeholder blob instead of throwing. A screen now RENDERS (with a placeholder for
   the one broken piece) instead of going black.
2. **No more black screens.** `renderHub` / `renderTown` are wrapped; if anything still throws, the town
   shows a visible "Go to the Garage" button instead of black, and the hub never aborts the whole app.
3. **On-screen error reporter.** `window.onerror`, unhandled promise rejections, and the wrappers above all
   feed a small red overlay at the bottom of the screen that shows the exact failing function + line, with
   a Copy button. If anything still misbehaves on Garrett's device, that text pins the root cause exactly -
   read/copy it back and the real fix is a one-liner.

Kept from v1.36: the bulletproof Let's Play handler, the `openTown` guard that always shows the town
screen, and the hardened splash + 6s watchdog. Kept from v1.35: the whole Downtown / shops / coins /
apartment layer.

Deploy contract: badge `v1.37 - Oct 3` (vbadge + VERSION const), sw cache key `measureup-v1-37`.

### Verification
- `test-v137.js`: 16/16 - badge; guarded primitives return a placeholder on bad input (never throw);
  **avatar art throwing does NOT blank the hub or town** (the real bug); renderTown hard-fail shows the
  Garage fallback; normal flow reaches a fully-rendered town with zero uncaught errors.
- `test-v136.js`: start-hardening all pass (only the two v1.36 badge-string asserts flip, expected).
- `test-v135.js`: 30/30 Downtown/shop/apartment functional asserts pass (only the two v1.35 badge-string
  asserts flip, expected).
- Full file: 0 banned emoji, 0 Jekyll tokens, 63/63 script blocks pass `node --check`, no added em dashes.

### IMPORTANT for Mot
After uploading, confirm the badge reads **v1.37 - Oct 3**. If it still shows an older number it's a cached
build: fully close and reopen the app so the new `sw.js` (cache key `measureup-v1-37`) installs.

Then open the game. Two outcomes:
- **It works** (town + Garage render, maybe with one placeholder blob somewhere) - great, the crash-proofing
  caught it. If you see a placeholder where Garrett's avatar should be, that tells us his saved avatar is the
  culprit and I can repair it cleanly next.
- **You see a red error box at the bottom** - tap Copy and send me that text. It names the exact function and
  line that's failing, and I'll ship the precise fix.

### NEXT (unchanged roadmap)
- PHASE 2: apartment buildings + homes on the map; visit townspeople; each has a room/taste; help decorate.
- PHASE 3: trade + fetch quests.
