# PLAYER PROFILES — design spec (2026-06-14)

Foundational platform feature. Replaces the flat household roster + pairwise Record Book
with **per-player profiles** that each carry that player's stats and (for the device owner)
their preferences. This is the clean answer to "how do we record 2–4-player games": each
seated player's profile accrues their own history, so 2 / 3 / 4 players all just work.

Mot's decisions (the forks that shaped this):
- **Build Profiles FIRST**, before extending any game to multiplayer. It's the foundation.
- **The device owner sets ALL preferences.** Each device has one owner profile; their prefs
  (Easy View, sound, TV mode, etc.) drive that device. A new owner re-customizes. Stats are
  still tracked for EVERYONE who plays on the device (pass-and-play), not just the owner.
- **Nothing is permanent yet** — we will do a full reset of old records once Profiles ships.
  So NO migration of legacy pairwise records into profile stats is required; profiles start
  with empty stats and the old `*_games` keys get wiped.
- **Deleting a profile drops its stats** (behind a confirm dialog) — no archive.
- **New device owner = prompted.** On first launch on a fresh device, ask "Who owns this device?"
  (pick an existing profile or create one); that becomes the owner. Changeable later in the
  Profiles screen.

---

## Where this plugs into the current code (gamenight.js)

- Roster TODAY: `PKEY="gn_players"` localStorage = `[{name,color,light,dark}]`. `pload()/psave()`,
  `GN.players()` (28 games call this), `GN.addPlayer`, `GN.recolorPlayer`, `defaultPlayers()`
  = Mot/Kathy/Garrett. add/recolor mirror to Firebase `households/<hh>/state/players` ({list}).
- Records TODAY: `GN.recordGame(key,rec)` → localStorage[key] + mirror arrayUnion to
  `households/<hh>/records/<key>` ({list}). `GN.readGames(key)`. `GAME_KEYS` array. Schema is
  PAIRWISE: `{winner,loser,draw,score:{name:n},...}`. `GN.openStats`, `records.html`, the
  per-game stats buttons all read these.
- Prefs TODAY (per-device, flat keys): `gn_easy` (Easy View, `GN.easyView`), `gn_muted` (sound,
  in sfx.js GNS), `gn_tv`/`shelf_tv` (TV mode — known key-mismatch bug), per-game (`chess_bot_level`…).
- Sync TODAY: opt-in per device (`GN.sync.enable(code)` → `gn_sync_hh`). `bootSync()`: first
  device with history SEEDS the cloud (global + records + players); empty devices ADOPT via
  `onSnapshot` (global, each records doc, players list). `mirror(fn)` runs only when `_fbReady`.

---

## Data model

A **profile**:
```
{
  id:    "p_<base36 time+rand>",   // STABLE — survives rename; the join key for stats/sync
  name:  "Mot",
  color, light, dark,             // token; absorbs the roster entry
  prefs: { easy:false, muted:false, tv:false },   // applied only when this profile OWNS the device
  stats: {                        // per-game aggregates, keyed by the game's id
    yahtzee: { plays:0, wins:0, best:0 },
    chess:   { plays:0, wins:0, losses:0, draws:0 },
    ...                           // shape can vary per game; always include plays + wins
  }
}
```
- Storage: `gn_profiles` localStorage = `[profile,…]`. This BECOMES the roster source of truth.
- **Device owner**: `gn_owner` localStorage = a profile `id`. NOT synced (each device picks its
  own owner). The owner's `prefs` drive Easy View / sound / TV on this device.
- Sync: a new `households/<hh>/state/profiles` ({list}) doc — parallels the players doc. Whole-list
  `set()` on every profile write (per-field merge of nested stats maps is fiddly; recolor already
  uses whole-list set, same pattern). Stats live INSIDE the synced profiles, so a player's record
  aggregates across the household's devices (last-write-wins on the list — fine for a family).

---

## Identity & avatars (expanded per Mot, 2026-06-14)

A profile's look is more than a color now:
```
avatar: { kind:"color" | "icon" | "photo",
          icon?: "<set>.<name>",   // e.g. "chess.knight", "yahtzee.die", "cards.fan"
          photo?: "<dataURL>" }     // user-uploaded picture, downscaled to a small square
color, light, dark                   // always present — the token tint + fallback
```
- **Icon gallery, game-themed, multiple per game.** A picker offers a grid of original SVG icons
  drawn from the shelf's games — e.g. a chess knight, a checkers king, a domino, a die (Yahtzee/
  Farkle), a card fan (One Card Left!), a marble (Chinese Checkers), a peg (Trouble), a ladder
  (Snakes), etc. Several choices PER game so the gallery is rich. Icons are tinted with the
  profile's color so identity = icon + color together.
- **Photo upload — CONFIRMED.** A profile may use an uploaded photo as its avatar: file input →
  draw to a canvas, center-crop square, downscale (~128px), store as a compressed dataURL on the
  profile. Keep it small (sync ships profiles as one doc — watch total size; cap dimension + use
  JPEG quality ~0.7). Circular mask in the UI.
- **Avatar = in-game token — CONFIRMED (its own phase).** The chosen avatar (icon or photo,
  tinted/ringed by the color) shows everywhere the player appears: seat picker, scoreboards,
  stats — AND renders as their TOKEN inside games where a token is drawn. Needs a shared helper
  (e.g. `GN.avatarSVG(profile,size)`) + per-game wiring; do it where it's clean, skip where a
  game's piece art can't host it.
- Color stays the base layer (every profile has one); icon/photo layer on top.

## Onboarding / "log in" (first launch on the next GitHub deploy)

On the next deploy, the shelf checks `GN.profiles.needsOwner()`. If this device has no owner yet:
- Show a **"Welcome — who's playing?"** screen: pick an existing profile to claim as this device's
  owner, OR **create a new profile** (name → color → avatar/icon). The created/picked profile
  becomes `gn_owner` and its prefs drive this device.
- This is the "prompted to create a new profile" flow Mot wants — it greets each new device once.
- Returning devices (owner already set) skip straight to the shelf.

---

```
GN.profiles.list()                    -> [profile]            (seeds from roster on first run)
GN.profiles.get(id)                   -> profile | null
GN.profiles.byName(name)              -> profile | null
GN.profiles.add(name, pal)            -> profile              (replaces/extends GN.addPlayer)
GN.profiles.rename(id, name)          -> profile
GN.profiles.recolor(id, pal)          -> profile              (replaces GN.recolorPlayer path)
GN.profiles.remove(id)                                        (guard: never remove last)
GN.profiles.owner()                   -> profile | null       (this device's owner)
GN.profiles.setOwner(id)                                      (re-applies that profile's prefs)
GN.profiles.pref(key, dflt)           -> value                (reads OWNER's prefs)
GN.profiles.setPref(key, val)                                 (writes OWNER's prefs + applies)
GN.profiles.bump(idOrName, gameKey, delta)                    (merge into stats[gameKey]: plays++,
                                                               wins+=delta.win, best=max, etc.)
GN.profiles.recordResult(gameKey, [{id|name, win, score, place}])  (N-player finish: bump each)
```
- **Back-compat:** `GN.players()` returns the profiles mapped to `{name,color,light,dark}` so all
  28 games keep working unchanged. `GN.addPlayer`/`GN.recolorPlayer` become thin wrappers over the
  profile API (existing picker UI keeps calling them).

---

## Phased build (each phase = its own validated chunk, ship after each)

1. **Foundation (local, no Firebase) — ✅ DONE (validated 2026-06-14).** `GN.profiles` API +
   `gn_profiles` store, seeded from the current roster; `GN.players()`/`addPlayer`/`recolor`
   rerouted onto it (shape preserved). Avatar field + owner + `needsOwner()` + per-profile
   `prefs`/`stats` + `bump`/`recordResult` all in. Validated: 21/21 API checks; roster reroute
   booted clean across connect4/yahtzee/checkers/war/trouble + onecardleft. (`applyOwnerPrefs`
   is a stub until Phase 3.) Legacy `gn_players` is still mirrored on every write for sync
   continuity until Phase 5. NOTE found en route: scrabble.html has a pre-existing latent bug —
   line ~290 `GN.sync && GN.sync()` calls the sync OBJECT as a function (throws); unrelated to
   profiles, worth a one-line fix later (sync auto-boots, so the line can just be removed).
2. **Profiles screen + onboarding (UI, visible) — NEXT.** Split into two chunks:
   - **2a — ✅ DONE (validated 2026-06-14):** `profiles.html` — a "Players" book on the shelf.
     Lists profiles with color-token avatars (initial inside), add / rename / recolor / remove
     (confirm + drops stats), "Make this device's owner" (crown + owner banner), and a per-profile
     stats panel. Color avatars only (icons/photos = 2b). `tokenHTML()` already branches on
     avatar.kind so icon/photo drop in later. Added to sw.js CORE; CACHE v6→v7. 13/13 interaction
     test. Onboarding ✅ DONE (validated 2026-06-14): on the shelf, if `needsOwner()`, a
     walnut/gold "Welcome to the Game Shelf — who owns this device?" overlay blocks the shelf and
     lets you claim an existing profile OR create a new one (name + color); choosing sets the
     owner and dismisses. Hidden once an owner exists. 13/13 flow test (claim / create / skip).
   - **2b — ✅ DONE (validated 2026-06-14):** shared avatar layer in gamenight.js — `GN.AVATARS`
     (15 original game-themed + fun icons: die, cards, king, pawn, checker, marble, domino, ladder,
     snake, star, heart, crown, smiley, bolt, paw), `GN.avatarInner()`, and `GN.tokenHTML()` (used
     everywhere). Players editor got an Initial/Icon/Photo picker with a live preview; photo =
     file → canvas center-crop + downscale to 128px JPEG dataURL (guarded fallback). Onboarding
     "create" flow gained a color + icon picker with preview. Validated: catalog 9/9, picker 7/7,
     onboarding+icon 7/7; all icon SVGs parse.
3. **Owner prefs:** Easy View / sound / TV read from the owner profile (fills the Phase-1
   `applyOwnerPrefs` stub); switching owner re-applies; fold flat `gn_easy`/`gn_muted`/`gn_tv`
   into `owner.prefs` (incidentally fixes the tv key-mismatch).
4. **Stats wiring:** games write per-player stats on finish via `recordResult` — Batch-1 score
   games first, then the rest. Retire pairwise `recordGame` as each game moves over.
   - **4b. Avatar-as-token — SCOPE LOCKED (Mot, 2026-06-14): setup/flip screens ONLY.**
     The avatar token appears on the "who's playing / flip for first" pickers (matchStart) and the
     One Card Left! seat-selection picker (partyStart). It must NOT appear on the board or in active
     gameplay — the classic, readable game pieces stay exactly as designed.
     - ✅ DONE: `GN.tokenHTML`/`GN.avatarInner` shared; seat payloads carry `avatar`; tokens render in
       both setup pickers. Validated: matchStart + 5-game regression, partyStart, + revert check.
     - ↩︎ REVERTED: the in-play OCL opponent-panel token (was added then pulled back per Mot) — panel
       restored to name + mini-cards + count.
     - ❌ CANCELLED: canvas board-pieces (Snakes/Sorry!/Trouble/Chinese Checkers). Do NOT replace
       board art with avatars. Classic look is the requirement.
     - Bonus fix retained: `GN.sync()` made a callable no-op in gamenight.js (was throwing on 9 pages).
5. **Sync:** add `state/profiles` to `bootSync` seed + `onSnapshot` adoption + `mirror` on writes.
   Owner id stays device-local. Note last-write-wins on the whole list.
6. **Records book + reset:** repoint `records.html` / `GN.openStats` at profile stats (per-player
   leaderboards instead of pairwise H2H). One-time reset clears legacy `GAME_KEYS` + reseeds.

After Phase 1–5, the **Batch-1 multiplayer extensions** (Yahtzee → Farkle → Shut the Box, then
Trouble/Sorry/Snakes, etc.) record into profiles, and N-player stats are solved everywhere.

---

## Open questions to confirm before/while building

- Profile id vs name as the stat key when synced across devices (id is safer; names can collide
  after rename). Spec uses **id**; `recordResult` accepts name and resolves to id.
- (Resolved) Deleting a profile drops its stats behind a confirm. New-device owner is prompted on
  first launch. See decisions above.


---

## Phase 7 — PEOPLE layer (added 2026-07-19, Mot)

Turns profiles from "who is playing" into "the people in your life." Driven by Garrett
filling out profiles for family and friends for fun.

**Mot's decisions:**
- **People data is saved to each device only.** Not synced, not mirrored, no cloud copy.
- **Phone/email included, local-only, behind a toggle** (off by default).

### Why it is a separate store (this is the load-bearing decision)
`gn_profiles` is written to Firestore as a whole-list `set()` on EVERY profile write
(`mirrorProfiles`). So any field added to the profile object syncs by construction. People
data therefore lives in its own key, `gn_people`, keyed by profile id, and **no `mirror()`
call exists anywhere in the `GN.people` block**. This makes the privacy property structural
rather than a thing to remember: a future edit to the profile shape cannot leak birthdays,
notes or contacts into the cloud, because they are not in that object.

This matters because a lot of these records are other families' children.

### Store
`gn_people` (localStorage) = `{ "<profileId>": { born, interests[], notes, rel[], contact:{phone,email} } }`
`gn_contacts_on` = `"1" | "0"` — whether phone/email fields are shown at all.

### API (gamenight.js)
```
GN.people.get(id) / .set(id,patch) / .all() / .forget(id)
GN.people.zodiac(born)        -> {name,glyph} | null      western sun sign
GN.people.chineseSign(born)   -> "Rat".."Pig" | null      by birth YEAR (approximate near lunar new year)
GN.people.age(born)           -> number | null
GN.people.daysToBirthday(born)-> number | null
GN.people.addInterest(id,tag) / .removeInterest(id,tag)   case-insensitive dedupe
GN.people.interestIndex()     -> { tagLower: {tag, ids[]} }   <- the seed for the interest graph
GN.people.shared(idA,idB)     -> [tag]                        <- "these two both like X"
GN.people.contactsOn() / .setContactsOn(bool)
```
`rel[]` is in the model but has no UI yet — it is the anchor for Phase 8.

### Status
- **7a - DONE (validated 2026-07-19).** Store + API + editor UI in `profiles.html`:
  birthday with a live readout (`Aries . year of the Pig . 7 years old . birthday in 267 days`),
  interest chips with case-insensitive dedupe, notes, and phone/email behind the toggle.
  Removing a profile also forgets its people record.
  Validated: zodiac boundaries (Mar20/21, Dec21/22, Jan19/20 all correct), Feb 30 rejected as a
  real date not just by regex, chinese signs 2019/2020/2024 correct, persistence across reload,
  and **leak check: profile object still has exactly [id,name,color,light,dark,avatar,prefs,stats]
  and its serialized form contains none of the people data.** 0 page errors.

### Next (not built)
- **7b - Relationships.** Typed edges on `rel[]` (parent / child / sibling / grandparent / cousin /
  friend), auto-writing the inverse edge. Needs a generational layout for a real family tree, which
  is a DIFFERENT renderer from the interest graph - build the edges once, render them twice.
- **7c - Interest graph.** Force-directed / constellation view over `interestIndex()`, linking
  people by shared tags and clustering groups. The "two people who have never met both like
  dinosaurs" link is the novel bit and is pure local derivation.
- **7d - Contacts import.** NOTE: the Contacts Picker API is Chrome-on-Android only. iOS Safari
  does not implement it, so it CANNOT work on Garrett's iPad. Manual entry works everywhere;
  vCard paste is the portable middle ground if bulk import is wanted.

### 7b - Schema + field engine (DONE, validated 2026-07-19)

Mot's framing: *"there's always one more layer to unravel only if you care to. Never pressure,
just always an opportunity."* A name on its own must remain a complete, valid profile.

So depth is **data, not markup**. `GN.schema` is a registry, `GN.fields` renders whatever schema
it is handed. This exists in this shape specifically so the **dollhouse character/creature creator
and other creator games register their own schema and reuse the same renderer** rather than
growing a second bespoke form.

```
GN.schema.register(id, {layers:[...]})   GN.schema.get(id)   GN.schema.list()
GN.fields.build(hostEl, schema, record, {gates:{...}, onChange, openFirst})
GN.fields.filledCount(layer, record)     GN.fields.isFilled(field, record)

layer  = {id, label, hint, gate?, fields:[]}
field  = {k, label, type, ph?, help?, opts?, max?, live?}
types  = text | longtext | date | tags | choice | number
gate   = names a boolean the host must approve before the layer renders (contacts uses this)
live(v)= returns a string rendered under the input (the star-sign readout uses it)
```

Rendered as native `<details>` per layer: collapsed by default, summary shows the hint when empty
and `n of N` once anything is filled. First layer opens; nothing is ever required.

People schema ships 5 layers / 15 fields: About them (birthday + likes), Favourites (food, colour,
animal, thing to do), Their story (grew up, lives now, work or school), More about them (dislikes,
how you know them, notes), Contact (phone, email - gated).

Validated: layers render and collapse correctly, the gated Contact layer appears only with the
toggle on, live star-sign readout intact, all 15 fields persist across reload, filled counts
correct, and the leak check still passes - profile object remains exactly
`[id,name,color,light,dark,avatar,prefs,stats]` with none of the people values in its serialized form.

### Device integration - what is actually possible (checked, not assumed)
- **Camera + photo library: YES on iPad.** `<input type="file" accept="image/*" capture="environment">`
  works in iOS Safari; the existing avatar flow already does file -> canvas -> centre-crop -> 128px
  JPEG dataURL. Richer per-person photos are achievable on the same path.
- **Linking to a person's photo FOLDER: NO on iPad.** That needs the File System Access API
  (`showDirectoryPicker`), which iOS Safari does not implement. Desktop Chrome only.
- **Contacts import: NO on iPad.** Contacts Picker API is Chrome-on-Android only. Manual entry works
  everywhere; vCard paste is the portable option for bulk.
- **Storage ceiling.** `localStorage` is ~5MB total. 128px avatars (~4-8KB) are fine for dozens of
  people. Anything approaching a photo gallery per person must move to **IndexedDB** - plan that
  before adding multi-photo support, not after.

### Reuse path for creator games
A creature/character creator registers e.g. `GN.schema.register("dollhouseChar", {layers:[...]})`
with types already supported (choice for species, tags for traits, text for name, number for age)
and calls the same `GN.fields.build`. Only genuinely new *field types* need engine work.

### 7c - Almanac (DONE, validated 2026-07-19)

Everything derivable from a BIRTH DATE alone. No network, no birth time, no birth place.
`GN.almanac.facts(born)` returns: star sign + element + mode, full Chinese sexagenary sign
(animal AND element, the real 60-year cycle), moon phase that night with % lit, weekday +
"Monday's child" line, birthstone, birth flower, season, generation, life path number,
days alive + next 1,000-day milestone with its date, half-birthday, and which weekday this
year's birthday lands on.

`GN.almanac.compare(bornA, bornB)` -> shared sign / element / Chinese animal / birthstone /
weekday / moon phase / same month or day, plus the day gap. Rendered in the editor as
"Grandma: both Aries, same birthstone (Diamond)". Needs no new fields.
`GN.almanac.upcoming(n)` -> whose birthday is next across every profile that has one.

UI: a read-only Almanac panel in the profile editor that appears the moment a valid birthday
exists and disappears if it is cleared. Live-updates as the date field changes.

**Validated against known values, not eyeballed:** 8/8 moon phases correct (2000-01-06,
2024-01-11, 2024-01-25, 2023-08-01, 2024-12-30, 2025-01-13, 2024-02-09, 2024-08-19) and
5/5 Chinese sexagenary pairs (2020 Metal Rat, 2024 Wood Dragon, 1984 Wood Rat, 1972 Water Rat,
1988 Earth Dragon). 0 page errors.

Known approximations, both surfaced honestly in the UI or code comments:
- Moon uses the mean synodic month, good to about half a day. Fine for "the moon that night",
  can sit on the wrong side of an exact quarter by a few hours.
- Chinese New Year falls Jan 21 - Feb 20, so a date in that window may belong to the previous
  animal. `chinese.unsure` is true for those dates and the panel says so rather than lying.
- The "Monday's child" rhyme is in a single `RHYME` object at the top of the module. The
  traditional Wednesday line is "full of woe" - reword it there if that is not wanted for kids.

### NOT built - needs a birth time + birth place layer (parked by Mot)
Rising sign, houses, and an exact Moon sign all need the hour and the city, not just the date.
Planet-in-sign at birth (Jupiter, Saturn, Mars) is date-only and IS feasible later without
birth time, since those planets sit in a sign for months or years.
