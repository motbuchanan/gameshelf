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
     test. Onboarding (first-launch prompt) is the NEXT sub-chunk.
   - **2b:** avatar picker upgrade — the game-themed **icon gallery** (original SVGs) + **photo
     upload** (canvas crop/downscale → dataURL), wired into the profile screen + onboarding.
3. **Owner prefs:** Easy View / sound / TV read from the owner profile (fills the Phase-1
   `applyOwnerPrefs` stub); switching owner re-applies; fold flat `gn_easy`/`gn_muted`/`gn_tv`
   into `owner.prefs` (incidentally fixes the tv key-mismatch).
4. **Stats wiring:** games write per-player stats on finish via `recordResult` — Batch-1 score
   games first, then the rest. Retire pairwise `recordGame` as each game moves over.
   - **4b. Avatar-as-token:** `GN.avatarSVG(profile,size)` helper; render each player's avatar as
     their token in games that draw tokens (where clean). Per-game, incremental.
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
