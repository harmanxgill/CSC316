<script>
	import * as d3 from 'd3';

	let { data, hoveredGenre = null, onhover } = $props();

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

		<g class="axis grid" bind:this={yAxis} transform="translate({margin.left},0)"></g>

		<g role="list">
		{#each genres as d (d.genre)}
			<!-- The hit area covers the whole row, label included, so one-song genres are easy to hover
			     and moving between rows never passes through a gap. -->
			<g
				class="row"
				class:hovered={d.genre === hoveredGenre}
				role="listitem"
				aria-label="{d.genre}: {d.count} {d.count === 1 ? 'song' : 'songs'}"
				onmouseenter={() => onhover?.(d.genre)}
				onmouseleave={() => onhover?.(null)}
			>
				<rect class="hit" x="0" y={y(d.genre) - (y.step() - y.bandwidth()) / 2} {width} height={y.step()} />
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
			</g>
		{/each}
		</g>

		{#if genres.length === 0}
			<text
				class="empty"
				x={(margin.left + width - margin.right) / 2}
				y={(margin.top + height - margin.bottom) / 2}
				text-anchor="middle"
			>
				No songs in the selected years
			</text>
		{/if}

		<text class="axis-label" x={(margin.left + width - margin.right) / 2} y={height - 6} text-anchor="middle">
			Number of #1 songs
		</text>
	</svg>
</div>

<style>
	.hit {
		fill: transparent;
	}

	.row.hovered .hit {
		fill: var(--highlight-band);
	}

	.row.hovered .mark {
		fill: var(--mark-strong);
		stroke: var(--ink);
		stroke-width: 1.5;
	}

	.row.hovered .value-label {
		font-weight: 700;
	}
</style>
