<script>
	import * as d3 from 'd3';

	let { data, hoveredGenre = null } = $props();

	const margin = { top: 8, right: 16, bottom: 40, left: 56 };
	const radius = 2.5;

	const baseOpacity = 0.35;
	const matchOpacity = 1;
	const dimOpacity = 0.1;

	let width = $state(500);
	let height = $state(356);
	let xAxis = $state();
	let yAxis = $state();

	// A song missing either value has no position; plotting it at 0 would invent data.
	const points = $derived(data.filter((d) => d.danceability != null && d.energy != null));
	const omitted = $derived(data.length - points.length);

	const x = $derived(
		d3
			.scaleLinear()
			.domain([0, 100])
			.range([margin.left, width - margin.right])
	);

	const y = $derived(
		d3
			.scaleLinear()
			.domain([0, 100])
			.range([height - margin.bottom, margin.top])
	);

	// Linking only changes opacity. Every dot stays in the DOM at the same position.
	function opacityFor(d) {
		if (hoveredGenre == null) return baseOpacity;
		return d.genre === hoveredGenre ? matchOpacity : dimOpacity;
	}

	$effect(() => {
		if (!xAxis || !yAxis) return;
		d3.select(xAxis).call(
			d3
				.axisBottom(x)
				.ticks(5)
				.tickSize(-(height - margin.top - margin.bottom))
		);
		d3.select(yAxis).call(
			d3
				.axisLeft(y)
				.ticks(5)
				.tickSize(-(width - margin.left - margin.right))
		);
	});
</script>

<p class="note">
	One dot per song, both on a 0 to 100 scale.
	{#if omitted > 0}
		{omitted} {omitted === 1 ? 'song' : 'songs'} without both values {omitted === 1 ? 'is' : 'are'} not shown.
	{/if}
</p>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<svg {width} {height} role="img" aria-label="Scatterplot of danceability against energy for each #1 song">
		<g class="axis grid" bind:this={xAxis} transform="translate(0,{height - margin.bottom})"></g>
		<g class="axis grid" bind:this={yAxis} transform="translate({margin.left},0)"></g>

		{#each points as d, i (i)}
			<circle class="mark" cx={x(d.danceability)} cy={y(d.energy)} r={radius} fill-opacity={opacityFor(d)} />
		{/each}

		{#if points.length === 0}
			<text
				class="empty"
				x={(margin.left + width - margin.right) / 2}
				y={(margin.top + height - margin.bottom) / 2}
				text-anchor="middle"
			>
				No songs to plot in the selected years
			</text>
		{/if}

		<text class="axis-label" x={(margin.left + width - margin.right) / 2} y={height - 6} text-anchor="middle">
			Danceability (0 to 100)
		</text>
		<text
			class="axis-label"
			transform="translate(14,{(margin.top + height - margin.bottom) / 2}) rotate(-90)"
			text-anchor="middle"
		>
			Energy (0 to 100)
		</text>
	</svg>
</div>
