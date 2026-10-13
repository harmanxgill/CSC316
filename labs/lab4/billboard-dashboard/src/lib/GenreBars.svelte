<script>
	import * as d3 from 'd3';

	let { data } = $props();

	const margin = { top: 4, right: 44, bottom: 40, left: 116 };

	let width = $state(500);
	let height = $state(356);
	let xAxis = $state();
	let yAxis = $state();

	// Every primary genre, "Unlabeled" included, largest first. Ties sort by name so order is stable.
	const genres = $derived(
		d3
			.rollups(
				data,
				(v) => v.length,
				(d) => d.genre
			)
			.map(([genre, count]) => ({ genre, count }))
			.sort((a, b) => d3.descending(a.count, b.count) || d3.ascending(a.genre, b.genre))
	);

	const x = $derived(
		d3
			.scaleLinear()
			.domain([0, d3.max(genres, (d) => d.count) ?? 1])
			.nice()
			.range([margin.left, width - margin.right])
	);

	const y = $derived(
		d3
			.scaleBand()
			.domain(genres.map((d) => d.genre))
			.range([margin.top, height - margin.bottom])
			.padding(0.25)
	);

	$effect(() => {
		if (!xAxis || !yAxis) return;
		d3.select(xAxis).call(
			d3
				.axisBottom(x)
				.ticks(5)
				.tickSize(-(height - margin.top - margin.bottom))
		);
		d3.select(yAxis).call(d3.axisLeft(y).tickSize(0).tickPadding(8));
	});
</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<svg {width} {height} role="img" aria-label="Bar chart of the number of #1 songs by primary genre">
		<g class="axis grid" bind:this={xAxis} transform="translate(0,{height - margin.bottom})"></g>

		{#each genres as d (d.genre)}
			<rect
				class="mark"
				x={x(0)}
				y={y(d.genre)}
				width={x(d.count) - x(0)}
				height={y.bandwidth()}
			/>
			<text class="value-label" x={x(d.count) + 6} y={y(d.genre) + y.bandwidth() / 2} dy="0.35em">
				{d.count}
			</text>
		{/each}

		<g class="axis grid" bind:this={yAxis} transform="translate({margin.left},0)"></g>

		<text class="axis-label" x={(margin.left + width - margin.right) / 2} y={height - 6} text-anchor="middle">
			Number of #1 songs
		</text>
	</svg>
</div>
