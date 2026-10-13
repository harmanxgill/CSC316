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

	// Detail on demand. This is local to the scatter: no other view reads it, so it is not shared state.
	// x and y are the hovered dot's centre in viewport coordinates.
	let tip = $state(null);
	let tipWidth = $state(0);
	let tipHeight = $state(0);

	// If a filter removes the hovered song before the pointer leaves it, the tooltip goes too.
	const activeTip = $derived(tip && points.includes(tip.song) ? tip : null);

	// Prefer above and to the right of the dot; flip, then clamp, so the box stays inside the viewport.
	const tipPosition = $derived.by(() => {
		if (!activeTip) return null;
		const gap = 10;
		const edge = 8;
		const viewWidth = document.documentElement.clientWidth;
		const viewHeight = document.documentElement.clientHeight;
		let left = activeTip.x + gap;
		if (left + tipWidth > viewWidth - edge) left = activeTip.x - gap - tipWidth;
		let top = activeTip.y - gap - tipHeight;
		if (top < edge) top = activeTip.y + gap;
		return {
			left: Math.max(edge, Math.min(left, viewWidth - edge - tipWidth)),
			top: Math.max(edge, Math.min(top, viewHeight - edge - tipHeight))
		};
	});

	function showTip(event, song) {
		const box = event.currentTarget.getBoundingClientRect();
		tip = { song, x: box.x + box.width / 2, y: box.y + box.height / 2 };
	}

	function hideTip() {
		tip = null;
	}

	function describe(song) {
		return `${song.song} by ${song.artist}, ${weeksLabel(song)} at number one`;
	}

	function weeksLabel(song) {
		if (song.weeks == null) return 'weeks unknown';
		return `${song.weeks} ${song.weeks === 1 ? 'week' : 'weeks'}`;
	}

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
	One dot per song. Hover a dot for song details.
	{#if omitted > 0}
		{omitted} {omitted === 1 ? 'song' : 'songs'} without both values {omitted === 1 ? 'is' : 'are'} not shown.
	{/if}
</p>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<svg {width} {height} role="img" aria-label="Scatterplot of danceability against energy for each #1 song">
		<g class="axis grid" bind:this={xAxis} transform="translate(0,{height - margin.bottom})"></g>
		<g class="axis grid" bind:this={yAxis} transform="translate({margin.left},0)"></g>

		{#each points as d, i (i)}
			<circle
				class="mark"
				class:active={activeTip?.song === d}
				cx={x(d.danceability)}
				cy={y(d.energy)}
				r={radius}
				fill-opacity={opacityFor(d)}
				role="img"
				aria-label={describe(d)}
				onmouseenter={(event) => showTip(event, d)}
				onmouseleave={hideTip}
			/>
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

{#if activeTip}
	<div
		class="tooltip"
		role="tooltip"
		bind:clientWidth={tipWidth}
		bind:clientHeight={tipHeight}
		style:left="{tipPosition.left}px"
		style:top="{tipPosition.top}px"
	>
		<div class="song">{activeTip.song.song}</div>
		<div>{activeTip.song.artist}</div>
		<div class="weeks">Weeks at Number One: {activeTip.song.weeks ?? 'n/a'}</div>
	</div>
{/if}

<style>
	/* A transparent stroke widens the hover target without changing how the dot looks. */
	circle {
		stroke: transparent;
		stroke-width: 7;
	}

	circle.active {
		fill-opacity: 1;
		stroke: var(--ink);
		stroke-width: 1.5;
	}

	/* Fixed, so the viewport is the positioning box and no panel can clip it. */
	.tooltip {
		position: fixed;
		z-index: 10;
		max-width: 260px;
		padding: 8px 10px;
		border-radius: 6px;
		background: var(--ink);
		color: var(--panel);
		font-size: 0.8125rem;
		line-height: 1.35;
		pointer-events: none;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
	}

	.song {
		font-weight: 600;
	}

	.weeks {
		margin-top: 2px;
		font-variant-numeric: tabular-nums;
	}
</style>
