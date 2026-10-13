<script>
	import * as d3 from 'd3';

	let { data } = $props();

	const formatCount = d3.format(',d');
	const formatMean = d3.format('.1f');

	// d3.mean skips null, so songs with a missing value do not pull the average toward 0.
	const cards = $derived.by(() => {
		const bpmCount = data.filter((d) => d.bpm != null).length;
		const weeksCount = data.filter((d) => d.weeks != null).length;
		const meanBpm = d3.mean(data, (d) => d.bpm);
		const meanWeeks = d3.mean(data, (d) => d.weeks);
		return [
			{ label: '#1 songs', value: formatCount(data.length), detail: 'one row per song' },
			{
				label: 'Average BPM',
				value: meanBpm == null ? 'n/a' : formatMean(meanBpm),
				detail: coverage(bpmCount, data.length)
			},
			{
				label: 'Average weeks at #1',
				value: meanWeeks == null ? 'n/a' : formatMean(meanWeeks),
				detail: coverage(weeksCount, data.length)
			}
		];
	});

	function coverage(known, total) {
		const missing = total - known;
		if (missing === 0) return 'per song';
		return `per song, ${missing} without a value excluded`;
	}
</script>

<div class="kpis">
	{#each cards as card (card.label)}
		<div class="panel card">
			<div class="label">{card.label}</div>
			<div class="value">{card.value}</div>
			<div class="detail">{card.detail}</div>
		</div>
	{/each}
</div>

<style>
	.kpis {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}

	.card {
		padding: 8px 16px;
	}

	@media (max-width: 600px) {
		.kpis {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.label {
		font-size: 0.8125rem;
		color: var(--ink-muted);
	}

	.value {
		font-size: 1.5rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		line-height: 1.2;
	}

	.detail {
		font-size: 0.75rem;
		color: var(--ink-muted);
	}
</style>
