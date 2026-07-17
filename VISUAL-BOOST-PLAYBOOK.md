# Game Shelf — Visual Boost Playbook

The standing recipe for giving each arcade game a "living space" glow-up. Every game follows this so
the set stays consistent. Snake is the reference implementation.

## The non-negotiables

1. **Never touch game logic.** Only the render layer changes — no edits to movement, collision,
   scoring, records, controls, or the Firebase/GN calls. If the game played before, it plays
   identically after.

2. **Bake the static world once.** Pre-render the backdrop + all fixed decor to an offscreen canvas
   using a *seeded* PRNG (so decor never flickers frame-to-frame). Blit that image each frame. This is
   what keeps it cheap on Garrett's iPad.

3. **One continuous rAF loop, layered under the game.** Game logic keeps its own tick/timer and just
   updates state. Replace the old `draw()` with a no-op, add `renderScene(t)`, and start a single
   `requestAnimationFrame` loop that reads current state every frame. Guard every state read
   (`if(snake)…`) so early frames before init don't throw.

4. **Depth stack, back to front:** backdrop gradient → mottled patches → fine texture flecks → baked
   decor → baked vignette + directional light → [live] drifting light/ambient → object shadows →
   game objects (with gloss) → [live] ambient creatures on top.

5. **Every object gets gradient + gloss + a contact shadow.** No flat fills. Objects sit *in* the
   space, not on top of it.

6. **Add ambient life.** 1–2 drifting creatures/particles themed to the world (butterflies, asteroids,
   sparks…), gentle continuous motion, each casting a tiny shadow. Plus subtle environment motion
   (sway, shimmer, drift, twinkle).

7. **Echo the cover character.** Where the cover art has a character, bring it into the gameplay
   (Snake's face, Star Defender's ship, Minesweeper's bomb).

8. **Keep gameplay readable.** Decor stays low-contrast / desaturated so the bright, high-contrast
   game objects pop. Playability beats prettiness every time.

9. **Palette comes from the cover + existing theme.** Don't invent new hues; extend what's there.

## Performance budget (per frame)

1 offscreen blit + a handful of gradients + game objects + 1–2 creatures. Ground is never redrawn.
If a scene needs many gradients, cache them. Respect `prefers-reduced-motion`: it's fine to freeze
the ambient animation to a single static frame for those users.

## Ship process (per game)

1. Read the game's real render + game-loop code (fetch live file first, never splice blind).
2. Build a **standalone animated preview** of the new look. Show Mot. Get approval.
3. Integrate the approved renderer into the real file (bake + rAF + no-op draw).
4. Validate: syntax-check every script; render-test that the game starts, plays, and throws nothing;
   screenshot review.
5. **Hold the file** — do NOT bump/deploy per game. Accumulate all six.
6. When all six are done: one shelf deploy — bump cache once, badge once, precache unchanged (files
   already listed), one zip.

## The six

Snake ✅ done · Star Defender · Brick Break · Blocks · Paddle Duel · Minesweeper

## World notes (starting direction per game)

- **Star Defender** — deep starfield, drifting nebula, a distant planet; glowing ship + engine trail;
  cover-style alien sprites; laser glow; ambient twinkles + occasional shooting star.
- **Brick Break** — dark arcade cabinet feel; glowing ball with a light trail; glossy beveled bricks;
  particle chips on break; subtle scanline/vignette.
- **Blocks** — glossy beveled tetrominoes (the cover already shows this); soft glow on the active
  piece; faint grid; gentle ambient shimmer in the well.
- **Paddle Duel** — neon arena; glowing paddles + ball with a light trail; center-line shimmer;
  soft crowd-dark edges.
- **Minesweeper** — richer dug/undug tiles with real depth; nicer flag; the sweating-bomb character
  from the cover on reveal; subtle grass/felt board texture.
