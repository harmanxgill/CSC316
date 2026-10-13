<script>
	import { untrack } from 'svelte';
	import * as d3 from 'd3';

	let { data, yearRange = null, onbrush } = $props();

	const margin = { top: 8, right: 16, bottom: 40, left: 56 };

	let width = $state(900);
	let height = $state(260);
	let xAxis = $state();
	let yAxis = $state();
	let brushLayer = $state();

	// One entry per calendar year in the range, so a year with no songs still gets a slot.
	const years = $derived.by(() => {
		const dated = data.filter((d) => d.year != null);
		if (dated.length === 0) return [];
		const counts = d3.rollup(
			dated,
			(v) => v.length,
			(d) => d.year
		);
		const [first, last] = d3.extent(dated, (d) => d.year);
		return d3.range(first, last + 1).map((year) => ({ year, count: counts.get(year) ?? 0 }));
	});

	const x = $derived(
		d3
			.scaleLinear()
			.domain(years.length ? [years[0].year - 0.5, years.at(-1).year + 0.5] : [0, 1])
			.range([margin.left, width - margin.right])
	);

	const y = $derived(
		d3
			.scaleLinear()
			.domain([0, d3.max(years, (d) => d.count) ?? 1])
			.nice()
			.range([height - margin.bottom, margin.top])
	);

	const barWidth = $derived(Math.max(1, x(1) - x(0) - 2));

	// Each year owns the slot [year - 0.5, year + 0.5] on the x scale. A year is selected when
	// the brush covers any part of its slot, so the result is an inclusive integer range.
	// The small epsilon keeps a brush edge that sits exactly on a slot boundary from spilling over.
	function toYearRange([left, right]) {
		const first = years[0].year;
		const last = years.at(-1).year;
		const clamp = (year) => Math.max(first, Math.min(last, year));
		const start = clamp(Math.floor(x.invert(left) + 0.5 + 1e-6));
		const end = clamp(Math.ceil(x.invert(right) - 0.5 - 1e-6));
		return [start, Math.max(start, end)];
	}

	function toPixels([start, end]) {
		return [x(start - 0.5), x(end + 0.5)];
	}

	function sameRange(a, b) {
		return a === b || (a != null && b != null && a[0] === b[0] && a[1] === b[1]);
	}

	// Programmatic moves (snapping, clearing, resizing) have no sourceEvent and are ignored,
	// so only the user's own dragging reports a range.
	function handleBrush(event) {
		if (!event.sourceEvent || years.length === 0) return;
		const range = event.selection ? toYearRange(event.selection) : null;
		if (event.type === 'end' && range) {
			d3.select(brushLayer).call(brush.move, toPixels(range));
		}
		if (!sameRange(range, yearRange)) onbrush?.(range);
	}

	const brush = d3.brushX().on('brush end', handleBrush);

	// Size the brush to the plot area, and keep an existing selection on the same years on resize.
	$effect(() => {
		if (!brushLayer || width <= margin.left + margin.right) return;
		brush.extent([
			[margin.left, margin.top],
			[width - margin.right, height - margin.bottom]
		]);
		const layer = d3.select(brushLayer).call(brush);
		const range = untrack(() => yearRange);
		layer.call(brush.move, range && years.length ? toPixels(range) : null);
	});

	// When the page clears yearRange, remove the visible brush as well.
	$effect(() => {
		if (!brushLayer || yearRange) return;
		if (d3.brushSelection(brushLayer)) d3.select(brushLayer).call(brush.move, null);
	});

	$effect(() => {
		if (!xAxis || !yAxis) return;
		d3.select(xAxis).call(d3.axisBottom(x).ticks(8, 'd').tickSizeOuter(0));
		d3.select(yAxis).call(
			d3
				.axisLeft(y)
				.ticks(5)
				.tickSize(-(width - margin.left - margin.right))
		);
	});
</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<svg {width} {height} role="img" aria-label="Bar chart of the number of #1 songs per year">
		<g class="axis grid" bind:this={yAxis} transform="translate({margin.left},0)"></g>

		{#each years as d (d.year)}
			<rect
				class="mark"
				x={x(d.year) - barWidth / 2}
				y={y(d.count)}
				width={barWidth}
				height={y(0) - y(d.count)}
			/>
		{/each}

		<g class="brush" bind:this={brushLayer}></g>

		<g class="axis" bind:this={xAxis} transform="translate(0,{height - margin.bottom})"></g>

		<text class="axis-label" x={(margin.left + width - margin.right) / 2} y={height - 6} text-anchor="middle">
			Year
		</text>
		<text
			class="axis-label"
			transform="translate(14,{(margin.top + height - margin.bottom) / 2}) rotate(-90)"
			text-anchor="middle"
		>
			Number of #1 songs
		</text>
	</svg>
</div>
