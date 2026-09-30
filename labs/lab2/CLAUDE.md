# LAX Sketches: project context

## My question
- Question: Which LAX terminals experienced the largest increases or decreases in passenger traffic from January–October 2019 to January–October 2023?
- Audience: Classmates who know what LAX is but have not analyzed this passenger dataset.
- Measure: Percentage change in passenger traffic from 2019 to 2023.
- Two judging criteria:
  1. The visualization should make it easy to identify the terminals with the largest increases and decreases.
  2. The direction and size of the percentage change should be understandable without requiring mental calculation.

## Stack and conventions
- This is the supplied SvelteKit starter. Use JavaScript, Svelte 5 runes, and D3 for calculations where useful.
- The student does not use a code editor. After every change, summarize which files you changed and what each change does, in plain language.
- Keep SketchA.svelte and SketchB.svelte as separate alternatives in src/lib/.
- +page.svelte passes the same rows from src/lib/data.js to each component as a `data` prop.
- Do not load any CSV at runtime. Use only the rows in data.js.
- Keep both sketches visible side by side. Do not add controls, filters, or a dashboard unless asked.
- When revising one sketch, do not change the other.
- Do not run `npm audit fix`, change dependency versions, or run git commands.

## Data constraints
- Preserve the supplied ten-terminal comparison table and all its values.
- Both years cover January through October, summing reported arrivals and departures and domestic and international traffic.
- TBIT West Gates has no 2019 baseline and is excluded. Imperial Terminal has no records in either period. Absence is not zero.
- The included terminals are not all-airport totals for 2023.
- Counts describe passenger movements, not unique people or causes of change.

## Definition of done
- `npm run dev` shows both sketches with no errors in the browser console or the terminal.
- Labels, units, periods, and legends are readable and accurate.
- T1 shows 8,004,170 (2019) and 5,995,807 (2023); change is -2,008,363 or -25.09%.