<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import KpiRow from '#lib/KpiRow.svelte';
	import Timeline from '#lib/Timeline.svelte';
	import GenreBars from '#lib/GenreBars.svelte';
	import Scatter from '#lib/Scatter.svelte';
	import '../app.css';

	const LAST_YEAR = 2025;
	const parseDate = d3.timeParse('%d-%b-%y');

	let songs = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Shared linking state, owned here. GenreBars sets it; Scatter and GenreBars read it.
	let hoveredGenre = $state(null);

	// Shared filter state, owned here. Timeline's brush sets it; null means all years.
	let yearRange = $state(null);
	let filtered = $derived(
		yearRange ? songs.filter((d) => d.year >= yearRange[0] && d.year <= yearRange[1]) : songs
	);

	const yearLabel = $derived(
		!yearRange
			? null
			: yearRange[0] === yearRange[1]
				? `${yearRange[0]}`
				: `${yearRange[0]} to ${yearRange[1]}`
	);

	// Blank or non-numeric cells become null, never 0.
	function toNumber(value) {
		const text = (value ?? '').trim();
		if (text === '') return null;
		const n = Number(text);
		return Number.isFinite(n) ? n : null;
	}

	// "4-Aug-58" means 1958. %y pivots at 1969, so pull future years back a century.
	function toDate(value) {
		const date = parseDate((value ?? '').trim());
		if (!date) return null;
		if (date.getFullYear() > LAST_YEAR) date.setFullYear(date.getFullYear() - 100);
		return date;
	}

	// Primary genre is the text before the first semicolon; blank stays as a real category.
	function toPrimaryGenre(value) {
		return (value ?? '').split(';')[0].trim() || 'Unlabeled';
	}

	function toSong(row) {
		const date = toDate(row['Date']);
		return {
			date,
			year: date ? date.getFullYear() : null,
			song: row['Song'],
			artist: row['Artist'],
			weeks: toNumber(row['Weeks at Number One']),
			genre: toPrimaryGenre(row['CDR Genre']),
			bpm: toNumber(row['BPM']),
			energy: toNumber(row['Energy']),
			danceability: toNumber(row['Danceability']),
			happiness: toNumber(row['Happiness']),
			acousticness: toNumber(row['Acousticness']),
			loudness: toNumber(row['Loudness (dB)']),
			length: toNumber(row['Length (Sec)'])
		};
	}

	onMount(async () => {
		try {
			songs = await d3.csv('/billboard_hot_100_no1.csv', toSong);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Billboard Hot 100 #1 songs</title>
</svelte:head>

<main>
	<header>
		<h1>Billboard Hot 100 #1 songs, 1958 to 2025</h1>
		<p>One row per song that reached #1. This is the top of the chart only, not all music.</p>
	</header>

	{#if loading}
		<p class="status">Loading songs…</p>
	{:else if error}
		<p class="status error">Could not load the dataset: {error}</p>
	{:else if songs.length === 0}
		<p class="status">The dataset loaded but contains no songs.</p>
	{:else}
		<KpiRow data={filtered} />

		<section class="panel">
			<div class="panel-head">
				<div>
					<h2>#1 songs per year</h2>
					<p class="note">
						Drag across years to filter the dashboard. Bars count songs that reached #1, not weeks at #1.
					</p>
				</div>
				<div class="selection">
					<span aria-live="polite">
						{#if yearRange}
							Selected: <strong>{yearLabel}</strong>
							({filtered.length} {filtered.length === 1 ? 'song' : 'songs'})
						{:else}
							All years
						{/if}
					</span>
					<button type="button" disabled={!yearRange} onclick={() => (yearRange = null)}>
						Clear selection
					</button>
				</div>
			</div>
			<Timeline data={songs} {yearRange} onbrush={(range) => (yearRange = range)} />
		</section>

		<div class="bottom">
			<section class="panel">
				<h2>#1 songs by primary genre</h2>
				<p class="note">
					Hover a genre to highlight its songs. Primary genre is the first one listed; blank is "Unlabeled".
				</p>
				<GenreBars data={filtered} {hoveredGenre} onhover={(genre) => (hoveredGenre = genre)} />
			</section>

			<section class="panel">
				<h2>Danceability and energy</h2>
				<Scatter data={filtered} {hoveredGenre} />
			</section>
		</div>
	{/if}
</main>

<style>
	/* The whole dashboard fits one screen: fixed-size header and KPI rows, and the two
	   chart rows share the remaining height. */
	main {
		box-sizing: border-box;
		max-width: 1400px;
		height: 100dvh;
		min-height: 520px;
		margin: 0 auto;
		padding: 12px 16px;
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr) minmax(0, 1.35fr);
		gap: 12px;
	}

	h1 {
		margin: 0;
		font-size: 1.25rem;
	}

	header p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--ink-muted);
	}

	.panel-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}

	.selection {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: none;
		font-size: 0.8125rem;
		color: var(--ink-muted);
		font-variant-numeric: tabular-nums;
	}

	.selection strong {
		color: var(--ink);
	}

	button {
		font: inherit;
		color: var(--ink);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 4px 10px;
		cursor: pointer;
	}

	button:disabled {
		color: var(--ink-muted);
		opacity: 0.6;
		cursor: default;
	}

	.bottom {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 12px;
		min-height: 0;
	}

	/* Narrow screens stack the views and scroll instead of squeezing them. */
	@media (max-width: 800px) {
		main {
			height: auto;
			grid-template-rows: none;
		}

		.bottom {
			grid-template-columns: minmax(0, 1fr);
		}

		.panel-head {
			flex-direction: column;
		}

		main :global(.chart) {
			flex: none;
			height: 280px;
		}
	}

	.status {
		padding: 32px 0;
		color: var(--ink-muted);
	}

	.status.error {
		color: var(--error);
	}
</style>
