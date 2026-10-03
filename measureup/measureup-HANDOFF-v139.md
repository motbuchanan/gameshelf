# Measure Up - HANDOFF (v1.39 - Oct 3 2026)

Single-file HTML PWA for Garrett. Repo `motbuchanan/gameshelf`, folder `measureup/`, live at
motbuchanan.github.io/gameshelf/measureup/. Authoritative files: `measureup/index.html` + `measureup/sw.js`.
Deploy contract: bump the badge (vN.NN - Mon D) + sw cache key (measureup-vN-NN) every change; additive
work goes in a trailing `<script>` block before `</body>`. Gates: node --check every block, no banned emoji
(>= 0x1FA70, 0x1F9CA, 0x1F977), no em dashes, no Jekyll tokens, no inner `</script`, SVG attrs literal hex.

## v1.39 - THE WORLD CAMERA (block 65 = v139.js)

Garrett's note: the town must not change shape when the iPad rotates. Built the Animal-Crossing model:

- **One fixed plot of land.** `townIsWide()` now always returns true, so the town is always the 2-column
  city grid (W 920). The v1.38 backfill gives every district a block; v1.39 adds ONE MORE block at the end
  holding two dashed "NEW DISTRICT - your call" lots (`geo.extra`), so there is always visible room to
  build. Geometry is byte-identical in portrait and landscape (asserted).
- **Camera.** `twFit` is replaced by `camFit`: `#twStage` is absolutely positioned at 0,0 with
  `transform: translate3d(x,y) scale(z)`. Base zoom = clamp(viewportW/920, 1, 1.4) so the land is always
  larger than the screen on phones and fills width on an iPad. Pan is clamped to the land (centered if the
  land is smaller than the viewport on an axis; 62px bottom inset so the last row clears the tab strip).
  `window.twCam = {cam, centerOn(wx,wy,anim,z), fit, refresh}` for debugging / future quests ("fly to the
  Bank").
- **Input.** On `#scr-town`: pointerdown starts a drag; >8px of movement = pan; two pointers = pinch zoom
  (0.6 to 1.6) about the midpoint; wheel = pan (desktop). Move/up/cancel listeners live on `window`
  (NOT setPointerCapture - capture retargets the click to the screen and silently breaks mouse / trackpad /
  Apple Pencil taps on buildings; touch happened to survive it). After a drag, clicks on the LAND are
  swallowed for 300ms so a drag never opens a building; shell taps are never swallowed. Taps on buildings
  still go through their existing `onclick="townGo(..)"`.
- **Shell (fixed UI around the viewport, inside #scr-town so it shows/hides with the screen).**
  `#twShellTop`: GARAGE (`townGo('garage')`) + GROWN-UPS (`townGo('grown')`) pills top-right; the in-map
  `.tw-grown` chips are hidden. `#twTabs`: bottom strip, SQUARE + one chip per district (color = row
  color; names shortened: "STAGE STREET - NUMBER STREET" -> STAGE ST, "DOWNTOWN - HOME" -> YOUR PLACE).
  Tap = camera flies there (CSS transition). The chip nearest the camera center lights up as you pan and
  the strip auto-scrolls to it. `#twHint` ("drag to explore - tap a district below") shows ~3s on a first
  visit. Right inset of the strip (110px) clears Elly + the version badge.
- **Memory.** Camera center + zoom persist in `S.town.cam` (world coords, device independent), saved 500ms
  after a pan/pinch/tab. First ever open centers on the Square. Reopening the town (and re-renders from
  `openTown`/`renderTown` wraps) keep the current focus point. Rotation = re-clamp around the same focus.

### Verified (`test-v139.js`, 26/26, real Chromium, touch + mouse)
badge; identical geometry portrait vs landscape; block for every district + open lot block (2 lots render);
shell present + in-map chips hidden; starts on the Square with SQUARE chip active; drag pans; a drag that
starts on a building does NOT open it; a plain tap does (`townGo('hall')`) for both mouse and touch; tab
flies the camera to Downtown (clamped to the land edge) and lights the chip; camera never leaves the land;
rotation keeps geometry and focus; `S.town.cam` persists across reload; Garage pill leaves the town; zero
uncaught errors; no error overlay. Prior suites still pass (v135 30/30, v136, v137 - only old badge pins
flip). Previews: `preview-portrait.png` (phone) and `preview-landscape.png` (iPad).

### Known / next
- On a 390px PHONE in portrait, centered on the Square you see the square and the edges of both building
  columns; one swipe shows a column. On the iPad it is a non-issue. If that bugs Garrett, lower the phone
  base zoom to ~0.85 in `baseZoom()`.
- The old tall layout code remains but is unreachable (townIsWide is always true). The v1.38 wide-mode
  `twFit` wrap is superseded by `camFit` (twFit is reassigned).
- Phase 2 (apartment buildings + homes to visit) now has a natural home: new district rows just extend the
  plot downward and get a chip automatically; quests can `twCam.centerOn(...)` to point at a building.
- Phase 3: trade + fetch quests.

### Lineage this session
v1.35 Downtown -> v1.36 start hardening -> v1.37 crash-proof art + on-screen error reporter (keep it; it is
how the real bug got found) -> v1.38 landscape fits all districts -> v1.39 world camera.
