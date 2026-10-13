# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CSC316 lab 4: an interactive dashboard over every Billboard Hot 100 #1 song, 1958 to 2025. The project is a fresh `sv create` scaffold (SvelteKit minimal template, no type checking, no add-ons) plus D3. `src/routes/+page.svelte` is still the starter page; the dashboard has not been written yet.

Read `billboard_README.md` before touching the data. It describes the columns, ranges, and data quirks summarized below.

## Commands

- `npm run dev`: dev server at http://localhost:5173
- `npm run build`: production build
- `npm run preview`: serve the production build

There is no test runner, linter, or formatter configured.

## Stack

- SvelteKit 3 on Vite 8, Svelte 5, plain JavaScript (no TypeScript).
- Use Svelte 5 runes: `$state`, `$derived`, `$props`, not legacy `$:`. Runes mode is forced for all project files in `vite.config.js`, so legacy syntax (`$:`, `export let`) will not compile.
- The lib alias is `#lib` (a `package.json` `imports` entry), not `$lib`. Example: `import Timeline from '#lib/Timeline.svelte'`.
- Use D3 v7 for scales, axes, CSV loading, and brushing.
- Svelte renders data marks with `{#each}`. D3 may manage axes and brushes inside dedicated `<g>` elements.

## Coordination

- Keep `yearRange` and `hoveredGenre` as shared state in `+page.svelte`, each with one owner.
- Use `let yearRange = $state(null)` and one `$derived` filtered subset.
- `KpiRow`, `GenreBars`, and `Scatter` receive that same filtered subset through `data` props.
- `Timeline` always receives the full dataset and keeps its full year domain.
- Linking (genre hover) highlights matches and dims nonmatches without removing data or changing aggregates.
- Filtering (year brush) removes nonmatches and recomputes aggregates.
- Clearing the year selection restores all songs.

## Data

Both CSVs live in `static/`, so they are served from the site root:

- `/billboard_hot_100_no1.csv`: the full dataset, 1,177 songs, 105 columns, about 2.3 MB. Load this one using `d3.csv` in `onMount`.
- `/billboard_no1_slice20.csv`: a 20-row slice with the same columns, for quick iteration.

Use these 12 columns and drop the rest on load: `Date`, `Song`, `Artist`, `Weeks at Number One`, `CDR Genre`, `BPM`, `Energy`, `Danceability`, `Happiness`, `Acousticness`, `Loudness (dB)`, `Length (Sec)`.

Every value loads as a string. Convert numeric strings to numbers and parse `Date`.

### Rules that prevent wrong charts

- **Two-digit years.** `Date` looks like `4-Aug-58`, which means 1958, not 2058. `d3.timeParse("%d-%b-%y")` gets this wrong, so after parsing, subtract 100 from any year above 2025 (or build the four-digit year by hand). The dataset spans 1958 to 2025 and the time axis must show that.
- **One row is one song, not one week.** A row is the week a song reached #1. Distinguish song counts (number of rows) from `Weeks at Number One`, and label charts accordingly.
- **Primary genre.** Primary genre is the text before the first semicolon in `CDR Genre`, trimmed (`Pop;Rock` becomes `Pop`). Map blank genres to `"Unlabeled"` and retain those rows. 88 songs are blank.
- **Mixed units.** `Energy`, `Danceability`, `Happiness`, and `Acousticness` use 0 to 100 scales. `BPM`, `Loudness (dB)`, and `Length (Sec)` have separate units and must not share a scale with the others or with each other.
- **Blanks in numeric columns.** Two songs have blank `BPM`, `Energy`, `Danceability`, `Happiness`, `Acousticness`, and `Loudness (dB)`. `+""` is `0` in JavaScript, so check for empty strings before converting and keep those values out of averages and off the scatter.
- **#1 songs only.** These are only songs that reached #1, not all music. Titles and annotations should say "#1 songs".
- **Verify aggregates against the CSV.** The handout's listed genre counts do not sum to its stated 1,177 songs, so do not trust numbers copied from it.

## Git

- Remind the user to commit after each checked, working feature.
- Use small commits with descriptive messages.
- Inspect `git diff` when an interaction breaks. Before restoring files, explain what would be discarded so the user can save work.

## Definition of done

- Four separate components: `Timeline`, `GenreBars`, `Scatter`, `KpiRow`.
- One year brush filter and one genre hover link.
- All filtered views update together; hover still works after brushing.
- `npm run dev` works without console errors, including during interaction.
