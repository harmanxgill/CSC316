# Quake Encoding: project context
## Stack
- SvelteKit (runs on Vite). Dev server: `npm run dev`, http://localhost:5173.
- Svelte 5 runes ($state, $derived, $props; not legacy `$:`).
- D3 for scales, axes, and CSV loading. Svelte creates the earthquake marks
with {#each}. Do not create them with d3.select/append. D3 axis generators
may use selections to draw inside dedicated axis <g> elements.
## Conventions
- One component per .svelte file in src/lib/; import with the $lib alias.
- The dataset lives in static/earthquakes_M6.0_1year.csv; load it client-side
with d3.csv (in onMount) from /earthquakes_M6.0_1year.csv.
- Convert longitude, latitude, depth, mag to numbers on load.
- Use the D3 margin convention; label axes with units.
## Encoding rules
- Use d3.scaleSqrt for circle radius. For area proportional to the encoded
nonnegative value, radius must be proportional to its square root.
- Set domain AND range to start at 0 for proportional areas. If using
[6, 8.8] -> [3, 30] instead, state that size preserves order, not value ratios.
- Magnitude is logarithmic (each +1 ≈ 32× energy). Size represents magnitude,
not energy. Include an M6/M7/M8 size legend and explain this distinction.
- Position (x/y) via scaleLinear. In SVG y grows downward, so the y range is
[height, 0]; high latitude / high magnitude goes to the TOP.
- Use a sequential scale for the chosen quantitative color column
(e.g. d3.scaleSequential + interpolateViridis). Depth has a long right tail.
If limiting its domain, enable clamping and label the cutoff in the legend.
- magType is categorical → an ordinal scale if ever encoded.
## Data constraints
- M6.0+ only: the small quakes are filtered out. Don't imply quakes are rare.
- No nulls in longitude/latitude/depth/mag. Values load as strings; convert them.
## Definition of done
- npm run dev runs with no console errors.
- Four channels: longitude→x, latitude→y, mag→size (scaleSqrt), and the
chosen quantitative column→color. State the color column in the legend.
- Legends and units on size and color; latitude points north-up.