# MEASURE UP - MASTER HANDOFF (2026-10-06)

Written so a fresh Claude with zero context can continue. Read it fully before touching anything.

---

## 1. What this is

**Measure Up** is a single-file HTML PWA learning game for Mot's son **Garrett** (about 6-7, homeschooled,
reads above grade level, plays on an **iPad**, rotates it freely). It is a music + learning "city" you walk
around; each building is a wing (band/rhythm, math, reading, spelling/vocab, science, health, etc.) plus an
Animal-Crossing shopping/apartment layer.

- Repo: **`motbuchanan/gameshelf`**, branch **`main`**, folder **`measureup/`**
- Live: **https://motbuchanan.github.io/gameshelf/measureup/**
- Authoritative files: **`measureup/index.html`** (about 1.97 MB, one file) + **`measureup/sw.js`** +
  `measureup/manifest.json`
- Build model: additive. New work goes in a trailing `<script>` block spliced before `</body>`. The named
  `vNNN.js` files in the working tree are the SOURCE of each spliced block, kept for reference and re-splice.

---

## 2. Current state

- **Local authoritative = v1.42 (Oct 6 2026)**, 68 `<script>` blocks, sw cache key `measureup-v1-42`.
  Block 67 = `v141.js` (Neighbors), block 68 = `v142.js` (Errands, trades, wishlists).
- **LIVE on GitHub = v1.40 (Oct 4)**, confirmed byte-identical to the v1.40 snapshot on Oct 6.
  **v1.41 + v1.42 HAVE NOT BEEN DEPLOYED YET.** Build on the index.html in THIS snapshot, not the live file.
- One small in-place edit to the v1.35 block (and `v135.js`): after `window.TOWN_ITEMS=ITEMS;` it now also exposes
  `window.TOWN_BYID=BYID; window.TOWN_ART=ART;` so later blocks can add catalog items that the shops can sell.
- Headless-verified in real Chromium (zero page errors): test-v142 41/41, test-v141 34/34, test-v140 23/23,
  test-v139 25/26 (only the pinned old badge string), landscape render clean. Not on device yet.

### Session lineage (what each version did)
- **v1.35 Downtown** - coins, Cozy Home, Corner Store (+ sell), Bank allowance, inventory, Your Apartment.
- **v1.36 Start hardening** - bulletproof Let's Play + splash watchdog.
- **v1.37 Crash-proof art + on-screen error reporter** (`window.__muErr`).
- **v1.38 Landscape fits all districts** (guards remain under v1.39).
- **v1.39 World Camera** - one fixed plot, drag/pinch camera, district tab strip, fixed UI shell.
- **v1.40 Silly Stories** - fill-in-the-blank activity, 10 original stories.
- **v1.41 Neighbors (AC Phase 2)** - three HOMES districts (MIDWEST / EAST COAST / SOUTH & WEST), six apartment
  buildings by home region (Lakeview Flats + Prairie House = Midwest split in half, Harbor House = Northeast,
  Magnolia Court = Southeast, Lone Star Lofts = South, Canyon Lofts = West). Residents come from MEMBER_HOME, so new
  citizens move in automatically. Knocking a door = meeting them. Each citizen has a room (starter things of their
  own), a TASTE (cozy/natural/cool/fancy/playful/music, from keywords in their likes, hash fallback), gifts from
  Garrett's spare Stuff (+2 match, +1 not), paint with owned themes (+3 match, not consumed). Tiers Bare 0 /
  Homey 8 / Lovely 14 / Dream Home 22 pay once each (30c+10n / 60c+15n / 100c+25n+1 gold). Gifts can be asked back
  (confirm); starter and errand things cannot. 10 new catalog items (vase, gold mirror, velvet chair, trophy,
  guitar, gold record, jukebox, lava lamp, fish tank, kite). Citizen cards gain "Visit their home".
- **v1.42 Errands, trades & wishlists (AC Phase 3)** - ERRANDS & SWAPS row right after Downtown.
  Gus's Errand Board: 3 errands a day (2 FETCH + 1 three-step TRADE courier between two neighbors), done AT the
  neighbor's door via banners in their room; fetch pays price+15 coins +8 notes, trade 40 coins +12 notes, all three
  in a day +1 gold. Delivered things go into the neighbor's room (theirs to keep). WISHLISTS: 3 items per neighbor
  (2 of their taste), shown in their room; filling it pays 60 coins +15 notes +1 gold once, door gets a star; a
  clipboard on a door = an errand there. Flip's Swap Meet: 3 offers a day; Garrett must call GOOD or BAD deal by
  comparing worth (shop price, gold = 30) before swapping; right call +3 notes. Sundays the Square quest is
  "finish an errand" (`wkMark('errand')`). One-time What's New card (flag `seen142`).

## 3. Locked decisions (do not reopen)

- **Town is ONE fixed plot of land, camera-driven, orientation-independent.** `townIsWide()` is forced to
  return `true` (v139). Do NOT reintroduce the portrait/landscape layout switch - that is exactly the thing
  Garrett rejected and the source of the rotation bugs. The old "tall" layout code still exists but is
  unreachable; leave it.
- **Pointer handling uses window-level move/up listeners, NOT `setPointerCapture`.** Pointer capture
  retargets the click to the screen element and silently breaks mouse / trackpad / Apple Pencil taps on
  buildings (touch happened to survive it). Do not "simplify" back to capture. (v139)
- **A drag never counts as a building tap:** after a drag, clicks on the land are swallowed for 300ms; shell
  taps (tabs/pills) are never swallowed. Keep that distinction.
- **Three currencies stay in play:** notes (learning reward), coins (town shopping, v135), gold (rare).
- **Silly Stories content is ORIGINAL.** Do not paste real trademarked Mad Libs text, and do not use the
  phrase "Mad Libs" in the UI (the card says "Silly Stories" / "fill-in-the-blank").
- **Crash-proof art primitives stay.** `creatureSVG`/`memberSVG`/`ellySVG`/`citSvg` return a placeholder
  blob on throw instead of blanking a whole screen. (v137)
- **The on-screen error reporter (`window.__muErr`, red box) stays** as a permanent safety net and debug
  tool. If Garrett ever hits a new error, Mot copies that box.
- **Standing build rules** (see Gotchas): bump badge + sw cache key every change; banned-emoji scan; no em
  dashes; no Jekyll tokens; escape inner `</script`; SVG presentation attrs use literal hex.

---

## 4. Open items (ordered)

1. **DEPLOY v1.42.** Upload `index.html` + `sw.js` to `measureup/`. Confirm the badge reads `v1.42 · Oct 6`.
2. **Device check on the iPad:** knock a few doors, give a gift, run one errand end to end, call a swap.
3. **Tuning after Garrett plays:** tier thresholds (`TIERS` in v141), errand pay (v142 `erGiveFetch`/`erTradeStep`),
   swap good/bad mix (v142 `swaps()`). Taste keyword lists live in `KEYS` in v141.
4. **More Silly Stories** (add to `STORIES` in the v1.40 block).
5. **Optional phone tweak:** `baseZoom()` ~0.85 in the v139 block if portrait phones feel tight.
6. Possible next layer (not requested yet): neighbors visiting Garrett's apartment, seasonal items, a museum.

## 5. Gotchas (bugs that cost time, env quirks, and the gates)

### Bugs + root causes (so they are not re-chased)
- **"Nothing happens on Let's Play"** = `openTown()` threw BEFORE `show('scr-town')` ran, because a v1.35
  map wrap threw on Garrett's specific save. Signature of this class: the tap changes nothing. Fix pattern:
  guard the wrap, and make the entry path always reach the screen. (v136)
- **Blank/black screen (both town AND hub)** = a SHARED render primitive threw. `renderHub` and `renderTown`
  both call `creatureSVG(S.creature,..)` at the top; one bad value in the saved avatar blanked every screen.
  Clean test saves never carried it. Fix: crash-proof the primitives. (v137)
- **Landscape-only crash** = the wide city grid had positions for 6 districts but the town had 8; `geo.pos[
  ri].sign` on the missing rows threw. Rotating to portrait rebuilt fine, which was the tell. (v138, then
  v139 replaced the whole layout with the camera.)
- **The headless "splash auto-dismiss"** was a HEADLESS ARTIFACT (adding any trailing script makes the
  splash linger in Playwright). Do not chase it as a real bug.
- **Pointer capture broke taps** - see Locked decisions.

### Environment quirks
- **Cache staleness is Mot's #1 trust issue.** The version badge is his load-confirmation. ALWAYS bump the
  badge (`#vbadge` text + the `VERSION` const) AND the sw cache key together. If the badge shows an old
  number after deploy, it is a cached old build - fully close and reopen the app so the new `sw.js`
  installs. Say this to him whenever a fix "didn't land".
- **Mobile-app rendering limits (from his saved prefs):** deliver visuals as FILE CARDS (inline images
  collapse for him); deliver HTML inside a ZIP (a bare .html file card opens instead of downloading);
  deliver drafted messages as plain text (message cards don't render); relay plugin/connector suggestions
  as plain text (those cards don't render).
- **Container working dir sometimes resets to `/home/claude`;** the project files live in **`/home/claude/mu`**.
- `file://` has no service worker; mic/export/Firebase features only work on the https Pages URL (N/A here).

### Validation gates - RUN BEFORE EVERY SHIP (hard requirements)
- `node --check` on every extracted `<script>` block (0 failures).
- Banned-emoji scan: no codepoint `>= 0x1FA70`, plus not `0x1F9CA` (ice cube) or `0x1F977` (ninja).
- No em dashes (U+2014) anywhere. Mot pref + it has bitten before.
- 0 Jekyll tokens (`{{`, `{%`) - breaks GitHub Pages.
- No unescaped inner `</script` inside JS strings.
- SVG presentation attributes use literal hex (`var(--token)` does NOT resolve in presentation attrs).
- Bump badge + sw cache key.
- Verify with a headless render (Playwright, real Chromium at the path in the shot scripts) AND a logic test
  where practical.

---

## 6. File map

- **Authoritative deploy files:** `measureup/index.html` (v1.42), `measureup/sw.js`
  (`measureup-v1-42`), `measureup/manifest.json`. In this snapshot: the top-level `index.html` / `sw.js` /
  `manifest.json`.
- **Working directory:** `/home/claude/mu`
- **Repo / branch / folder:** `motbuchanan/gameshelf` / `main` / `measureup/`
- **Live URL:** https://motbuchanan.github.io/gameshelf/measureup/
- **Raw (to check live version only, NOT to build on while local is ahead):**
  https://raw.githubusercontent.com/motbuchanan/gameshelf/main/measureup/index.html
- **Additive block sources (splice history):** `v130.js` ... `v142.js` (v134 was edited in place, no
  separate file). Each is the exact content of one trailing `<script>` block.
- **Tests:** `test-v142.js` (errands/swaps/wishlists, 41 asserts), `test-v141.js` (neighbors, 34 asserts),
  `test-v135.js` (Downtown 30 asserts), `test-v136.js` (start hardening), `test-v137.js`
  (crash-proofing), `test-v139.js` (world camera, 26 asserts), `test-v140.js` (Silly Stories, 23 asserts). Test seeds must set `S.flags.seen142=true` or the one-time What's New card
  covers the town and blocks pointer tests (test-v139 already does).
  Older version-badge asserts in old suites intentionally fail after a bump (they pin the old string) - only
  real functional failures matter.
- **Render/debug scripts:** `shot-v135.js` (portrait town), `shot-land.js` (landscape), `shots*/` outputs.
- **Side project (SEPARATE from the game, do not splice into it):** the coloring book -
  `measureup-coloring-book.pdf`, `measureup-coloring-pack.zip`, `measureup-lineart-pack.zip`, and the
  coloring-book artifact at https://claude.ai/artifact/GjsWBJpzLjVfzCzRgob8Cs .

### Code anchors (v1.40 line numbers, approximate; v1.42 adds two blocks at the end - grep to confirm before patching)
- Splash markup `#splash` ~846; title `#scr-title` / `#btnStart` ~593-597; badge `#vbadge` ~931;
  `VERSION` const ~938.
- `show(id)` ~1252; `creatureSVG` ~1292; `ellySVG` ~1318; `memberSVG` ~1334; `renderHub` ~1811; `addNotes`
  ~1275.
- `openTown` base ~14271; `twMount`/`renderTown` base ~14224/14231; `twFit` base ~14593; `openHoard`
  ~14461; `openLibrary`/`libRender` ~15040; `zPay`/`zScr`/`zRoom`/`zTabs` ~15235-15240; `townIsWide`
  ~15520; `townGeo` base ~15520; `renderTown` MAIN wrap (the city draw) ~15545; `townFacade` base ~15534.
- **Additive blocks are at the END, before `</script>\n</body>\n</html>`.** `renderHub`/`renderTown`/
  `townPlan`/`townGeo`/`townGo`/`townFacade`/`openTown`/`twFit`/`libRender`/`load` are all wrapped MULTIPLE
  times across versions; the newest wrap wins. When wrapping, always call the previous (`var _x=fn; fn=...`)
  and keep it throw-safe.

### Key runtime state + APIs
- `S` = save object (localStorage key `bq_save_v1`), `save()`/`load()`. `load()` does a shallow merge so new
  top-level `DEF` keys get defaults; new features guard their own sub-state (see `HS()` v135, `ML()` v140).
- `S.coins` / `S.inv{id:n}` / `S.home{placed,themes,floor,wall}` - Downtown + apartment (v135).
- `S.town.cam{cx,cy,z}` - camera focus + zoom (v139). `S.town.allowDay`/`granted` - bank allowance/starter.
- `S.madlib{done{},saved[],plays}` - Silly Stories (v140).
- `S.nb{rooms{id:{placed[{id,zone,slot,g}],floor,wall,closet[]}},tier{id:n},gifts}` - neighbors (v141). `g:true` =
  a gift Garrett can ask back.
- `S.er{day,board[],carry,allDay,done,deals,wishDone{},swap{day,offers[]}}` - errands/swaps/wishlists (v142).
- v141 API: `openBuilding(bid)`, `nbVisit(id)`, `nbTaste(id)`, `nbRoom(id)`, `nbPoints(id)`, `nbCheckTier(id,quiet)`,
  `nbResidents(bid)`, `nbBuildingOf(id)`, `NB_BUILDINGS`, `NB_STYLES`. Extension points (wrap them):
  `nbRoomTop(id)` html under the room header, `nbDoorBadge(id)` html on a door, `nbOnPlace(id,itemId)` after a gift.
- v142 API: `openErrands()`, `openSwap()`, `erBoard()`, `erWishOf(id)`, `erCheckWish(id)`, `erSwaps()`.
- `window.twCam = {cam, centerOn(wx,wy,anim,z), fit, refresh}` - camera control (useful for "fly to X"
  quests).
- `window.__muErr(where, err)` - draw the on-screen error box. Global error + unhandledrejection feed it.
- Currency helpers: `addNotes(n)`, `window.addCoins(n,msg)`, `window.spendCoins(n)`, `addGold(n)`,
  `zPay(n,msg)` (notes + coin drip + confetti + toast).
- Screen helpers: `zScr(id,scoreId,bodyId,hint)`, `zRoom(id,title,sub)`, `zTabs(cur,tabs,fn)`.

### How to add a feature (the splice workflow)
1. Write `vNNN.js` as one IIFE; wrap any base fn you extend; expose inline-onclick handlers on `window`.
2. `node --check vNNN.js`; run the banned-emoji / em-dash / jekyll / inner-`</script` scan.
3. Bump: `#vbadge` text, the `VERSION` const (both to `vN.NN - <Mon D>` with TODAY's real date), and the
   `sw.js` cache key to `measureup-vN-NN`.
4. Splice the block before the single `</script>\n</body>\n</html>` marker.
5. Re-extract all blocks and `node --check` each; render with Playwright; run a logic test.
6. Package a zip (index.html + sw.js + manifest.json + handoff + tests) and deliver as a FILE CARD.

---

## 7. People

- **Garrett** - Mot's son, THE player. ~6-7, homeschooled, reads above grade level, iPad, rotates it. Names
  things in his games. Design for him: big tap targets, scaffolding (never a bare control), silly + kind.
- **Kathy** - Mot's wife, Garrett's primary caregiver and homeschool teacher.
- (No external stakeholders or approvals on this personal project.)

---

## 8. Re-entry instructions (literal first actions for the next session)

1. **Read this handoff fully.** Treat section 3 (Locked decisions) as binding.
2. **Get the authoritative file:** use the `index.html` in this snapshot zip (v1.42). Do NOT `curl` the live
   GitHub file to build on - it is v1.40 and would roll back Neighbors + Errands. (You MAY fetch live just to
   check what version is deployed. If its badge reads v1.42, Mot has deployed and live == local.)
3. **Set up the working tree:** put the snapshot files in `/home/claude/mu` (or recreate that dir). Confirm
   version: `grep -oE 'v1\.[0-9]+ - [A-Za-z]+ [0-9]+' index.html | head -1` should say v1.42, and
   `grep CACHE= sw.js` should say `measureup-v1-42`.
4. **Sanity-run the suites:** `node test-v142.js`, `node test-v141.js`, `node test-v140.js`, `node test-v139.js` (expect all functional asserts to
   pass; the lone "badge" assert failing is just the pinned old version string).
5. **Then build** per the section 6 splice workflow, stamping the real current date, and deliver as a zip
   file card.

### One-line status to open with
"Measure Up is at v1.42 locally (Neighbors + Errands) but still v1.40 live - v1.42 needs uploading. Next is
tuning from Garrett's first play unless you want something else."
