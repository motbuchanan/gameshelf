# The Maker — custom decks, boards & house rules

Design spec. No code yet. Captures the design settled on June 13 2026 so the build
starts from a fixed target rather than re-litigating it.

## The idea in one line

Players run a guided in-app **questionnaire** that ends by printing a **friendly,
labeled text block**. They send that block to Mot; Mot pastes it to Claude; Claude
generates the real content, runs it through a validator, and it ships as a new
selectable deck / board / ruleset on the shelf.

The player never edits raw data. Nothing broken can reach the shelf, because three
gates sit between their answers and the published content: Mot's eyes, Claude, and a
per-type validation harness. This is the same trust guarantee as the puzzle book —
just with a human relay instead of an in-app generator.

## Why a wizard, not a live editor

- The quality gate stays with Mot + Claude + a harness. A live editor would let a
  player ship a broken board (e.g. a Guess Who set where every face wears glasses,
  so half the questions are useless) and lose faith in the whole system.
- The friendly output block doubles as the **seed for the next version**: to tweak a
  deck later, pull up the last block, change two lines, resend. Iteration is nearly
  free, and players learn the input→output mapping by reading their own block.
- It generalizes. Every future "make your own ___" is a new script + output tag, not
  new plumbing.

## Architecture

### 1. Sequence runner (build once)
The shared engine — the `gamenight.js` of this feature. It plays a question script:
prompts, single/multi select, dropdowns, color pickers, free text, and **branches**
(answers change later questions and change what the final block contains). It ends by
assembling a tagged output block and offering Copy / Share.

Each game supplies only **data**: its question script + its output tag. The runner
code is game-agnostic.

### 2. Output block (the contract)
Friendly and labeled — readable enough for Mot to eyeball, unambiguous enough that
Claude doesn't have to guess. Self-identifying header with a version. Example:

```
=== GAMESHELF MAKER · GUESS WHO BOARD · v1 ===
Theme: Yanke coworkers
People are: real coworkers
  - Dave   — bald, big mustache, glasses, always smiling
  - Priya  — long black hair, earrings, no glasses
  - ...(target ~24)
Vibe: affectionate, work-safe
=== END ===
```

### 3. Relay
Player → (send block) → Mot → (paste) → Claude → generate + validate → ship as an
additive deck/board/theme alongside the baked-in standards.

### 4. Validation gate (per content type — non-negotiable)
- **Guess Who board** → convert descriptions to attribute vectors + procedural faces;
  run the existing balance harness so each attribute roughly splits the field and
  questions stay meaningful. A custom board may be recognition-first (the Yanke board
  is about laughing at Dave, not competitive balance), so balance is reported, never
  forced — but the harness still catches the unplayable extreme.
- **Word decks (Codenames-style)** → dedupe, count-check against required deck size,
  kid-appropriate filter.
- **Card decks (Apples-style)** → sort into the deck's categories (e.g. red/green),
  count-check each pile, kid-appropriate filter.

## Standard vs custom content

- Apples-style and Codenames-style ship with a large **baked-in standard deck** of
  generic, house-written (copyright-clean) cards — playable out of the box.
- Custom decks/boards are **additive**: they appear in the same picker as the
  standard, selectable per game. House rules live alongside as named, saveable sets.

## House rules note

House rules already half-exist as the variant toggles in Farkle / Shut the Box / Go
Fish. A "House Rules Deck" can start as simply **saving and sharing a named set of
those toggles**, then grow the vocabulary over time — an on-ramp, not a from-scratch
system.

## First build target

Guess Who is the natural first system: characters are already pure data vectors
(name, sex, skin, hair, eyes, short/long, six flags) rendering procedural faces, so
the wizard's fields map one-to-one and the balance harness already exists. The first
real deliverable is the **Yanke coworker board**, designed with Mot.

## Open questions (decide at build time)

- Wizard reachable from the bookshelf, or per-game on each game's screen?
- Does a shipped custom board sync to the household (Firebase, like records do) or
  stay on the device it was published to?
