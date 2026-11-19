# Box Animations

A small CSS motion lab. It started as an exercise in moving one box inside another and grew into a page with three animation studies, live controls and copyable snippets.

**Live:** [abdimannor.github.io/box-animations](https://abdimannor.github.io/box-animations/)

## What it shows

1. **Sliding box (translate).** A box travels back and forth along a rounded rail. It moves with `transform: translateX(...)`, so the layout around it never shifts, and `animation-direction: alternate` lets one keyframe pair cover both directions. The easing is a symmetric `cubic-bezier(0.65, 0, 0.35, 1)`, slow at both ends.
2. **Pulse timing (scale).** Two boxes share one `@keyframes` rule that scales, rotates and fades them. The second box starts 0.42 s later through `animation-delay`, which turns a single animation into a two-beat rhythm.
3. **Orbit path (rotation).** A dashed ring rotates a full turn while the box sitting on its edge runs a counter-rotation of the same length. The two cancel out, so the box travels around the circle but stays upright. This is the nesting idea from the original exercise: the parent carries the motion, the child corrects it.

## Controls

- **Pause / Play** adds a class that sets `animation-play-state: paused` on everything.
- **Speed** (0.5x to 2x) rewrites the duration custom properties (`--slide-duration`, `--pulse-duration`, `--orbit-duration`) from `script.js`, so the CSS keeps the animations and JavaScript only adjusts timing.
- **Theme** switches between three colour presets (Paper, Night, Signal) defined as custom-property sets and remembers the choice in `localStorage`.
- Each snippet card has a **Copy** button for the matching CSS.

Without JavaScript the animations still run; only the controls are inactive, and a `<noscript>` note says so.

## Reduced motion

When the system asks for reduced motion (`prefers-reduced-motion: reduce`), animations and transitions are cut to a near-instant single run and the hover lifts on buttons are switched off, so the page settles into still frames.

## Running it locally

There is no build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Pushes to `master` deploy to GitHub Pages through `.github/workflows/deploy.yml`.

## Files

- `index.html`: page structure, the three studies and the snippets
- `style.css`: themes, layout, keyframes and the reduced-motion rules
- `script.js`: pause, speed, theme and copy controls

## Possible next steps

A custom keyframe editor, exportable CSS variables per theme, and a side-by-side view for comparing easing curves.

## License

Released under the MIT License. See [LICENSE](LICENSE).
