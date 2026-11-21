# Box Animations

Live: [abdimannor.github.io/box-animations](https://abdimannor.github.io/box-animations/)

A CSS motion lab. It started as an exercise in moving one box inside another and became a place to build an animation, tune its timing by hand or by physics, and take the CSS with you.

## What you can do with it

- **Build your own keyframes.** Add, remove and drag stops on a 0-100% track (arrow keys work too) and give each stop translate, rotate, scale and opacity. A gallery of eight preset animations gives you a starting point.
- **Shape the easing.** Drag the two handles of a cubic-bezier curve, or pick a preset.
- **Use a spring instead.** Mass, stiffness and damping sliders sample a damped spring into a CSS `linear()` easing. Browsers without `linear()` get a note and keep the bezier.
- **Race timing functions.** Five boxes cover the same distance in the same time with different easings, including your own, so the difference is visible at a glance.
- **Scrub through a demo.** Pause one of the three studies and drag through it with the Web Animations API.
- **Copy or share the result.** A live panel shows the CSS for what you built, and a share link carries the keyframes, easing and spring in the URL.

## The three studies

1. **Sliding box (translate).** A box travels along a rail with `transform: translateX(...)`, so nothing around it shifts. `animation-direction: alternate` covers both directions with one keyframe pair; the easing is a symmetric `cubic-bezier(0.65, 0, 0.35, 1)`.
2. **Pulse timing (scale).** Two boxes share one `@keyframes` rule; the second starts 0.42 s later through `animation-delay`, which turns one animation into a two-beat rhythm.
3. **Orbit path (rotation).** A dashed ring turns while the box on its edge counter-rotates for the same length, so it travels round the circle but stays upright. This is the nesting idea from the original exercise: the parent carries the motion, the child corrects it.

Page controls: Pause/Play, a speed slider (0.5x to 2x, which rewrites the duration custom properties), three themes (Paper, Night, Signal, remembered in `localStorage`), and a Copy button on each snippet. The page ends with a short motion checklist.

## Reduced motion

A visible motion switch follows the system's reduced-motion setting by default and remembers an override. With motion off the studies settle into still frames. Without JavaScript the three studies still run; only the tools are inactive, and a `<noscript>` note says so.

## How it is built

No framework and no build step: `index.html`, `style.css` and small ES modules.

- `script.js`: pause, speed, theme and copy for the three studies
- `playground.js`: the shared state, live CSS panel, preview and share link
- `builder.js`, `bezier.js`, `spring.js`, `race.js`, `scrub.js`: one tool each
- `motion.js`: the motion switch

Tests live in `tests/`: Playwright checks that every page loads without errors, that the motion switch works under reduced motion, and that axe finds no accessibility violations. CI runs them with `npm test` on every push.

## Running it locally

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Pushes to `master` deploy to GitHub Pages through `.github/workflows/deploy.yml`.

## License

Released under the MIT License. See [LICENSE](LICENSE).
