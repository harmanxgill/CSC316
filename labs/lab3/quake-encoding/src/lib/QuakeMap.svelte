<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { feature } from 'topojson-client';
	import type { Topology } from 'topojson-specification';
	import landTopology from 'world-atlas/land-110m.json';

	type Quake = {
		id: string;
		place: string;
		longitude: number;
		latitude: number;
		depth: number;
		mag: number;
	};

	// 2:1 plotting area, so one degree of longitude and latitude are the same length.
	const innerWidth = 900;
	const innerHeight = 450;
	const margin = { top: 30, right: 50, bottom: 50, left: 75 };
	const legendHeight = 120;
	const width = innerWidth + margin.left + margin.right;
	const height = innerHeight + margin.top + margin.bottom + legendHeight;

	let quakes = $state<Quake[]>([]);
	let error = $state<string | null>(null);
	let hovered = $state<Quake | null>(null);

	let xAxisEl = $state<SVGGElement>();
	let yAxisEl = $state<SVGGElement>();

	// longitude → x.
	const x = d3.scaleLinear().domain([-180, 180]).range([0, innerWidth]);

	// latitude → y. Range is [innerHeight, 0] so north is at the top.
	const y = d3.scaleLinear().domain([-90, 90]).range([innerHeight, 0]);

	// mag → radius via scaleSqrt, so circle AREA is proportional to magnitude.
	// Domain and range both start at 0, which keeps area ratios meaningful.
	const r = d3.scaleSqrt().domain([0, 8.8]).range([0, 18]);

	// depth → color. Depth has a long right tail (75% of quakes are shallower
	// than 45 km, a few reach 636 km), so the domain stops at the 95th percentile
	// of depth and clamps; the legend labels the cutoff. Viridis is reversed so
	// deeper reads darker.
	const depthCutoff = $derived(d3.quantile(quakes, 0.95, (d) => d.depth) ?? 1);
	const color = $derived(
		d3
			.scaleSequential((t) => d3.interpolateViridis(1 - t))
			.domain([0, depthCutoff])
			.clamp(true)
	);

	const land = feature(
		landTopology as unknown as Topology,
		(landTopology as unknown as Topology).objects.land
	);
	// Equirectangular with this scale and translate is the same mapping as x and y:
	// projection([lon, lat]) equals [x(lon), y(lat)]. Unlike a raw transform, it
	// also cuts land that crosses the ±180° edge.
	const projection = d3
		.geoEquirectangular()
		.scale(innerWidth / (2 * Math.PI))
		.translate([innerWidth / 2, innerHeight / 2]);
	const landPath = d3.geoPath(projection)(land) ?? '';

	// Largest first, so small circles are drawn on top and stay visible.
	const drawOrder = $derived([...quakes].sort((a, b) => b.mag - a.mag));

	// The single largest event gets a direct label.
	const largest = $derived(d3.greatest(quakes, (d) => d.mag));

	const formatLon = (d: d3.NumberValue) =>
		+d === 0 || Math.abs(+d) === 180 ? `${Math.abs(+d)}°` : `${Math.abs(+d)}°${+d < 0 ? 'W' : 'E'}`;
	const formatLat = (d: d3.NumberValue) =>
		+d === 0 ? '0°' : `${Math.abs(+d)}°${+d < 0 ? 'S' : 'N'}`;

	// Tooltip anchor for the hovered quake, as fractions of the SVG so it tracks
	// the chart at any rendered width. It sits just above the circle, or just
	// below when the circle is near the top, and hugs the nearer side at the
	// left and right edges so it stays on the page.
	const tooltip = $derived.by(() => {
		if (!hovered) return null;
		const px = margin.left + x(hovered.longitude);
		const py = margin.top + y(hovered.latitude);
		const gap = r(hovered.mag) + 8;
		const below = py - gap < 70;
		const fx = px / width;
		return {
			left: fx * 100,
			top: ((below ? py + gap : py - gap) / height) * 100,
			shiftX: fx < 0.2 ? '0%' : fx > 0.8 ? '-100%' : '-50%',
			shiftY: below ? '0%' : '-100%'
		};
	});
	const formatMag = d3.format('.1f');
	const formatDepth = (km: number) => `${+km.toFixed(1)} km`;

	const legendMags = [6, 7, 8];
	const colorBar = { x: 330, width: 300, height: 14 };
	const colorStops = d3.range(0, 1.0001, 0.1);
	// Round ticks below the cutoff; the cutoff itself gets its own "≥" label.
	const colorTicks = $derived(d3.range(0, depthCutoff * 0.9, 50));

	onMount(async () => {
		try {
			quakes = await d3.csv('/earthquakes_M6.0_1year.csv', (d) => ({
				id: d.id,
				place: d.place,
				longitude: +d.longitude,
				latitude: +d.latitude,
				depth: +d.depth,
				mag: +d.mag
			}));
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	});

	// D3 draws the axes inside their dedicated <g> elements only.
	$effect(() => {
		// Ticks span the plot as a graticule. The latitude labels sit clear of
		// circles that spill past the 180° edge.
		if (xAxisEl)
			d3.select(xAxisEl).call(
				d3
					.axisBottom(x)
					.tickValues(d3.range(-180, 181, 60))
					.tickSize(-innerHeight)
					.tickPadding(8)
					.tickFormat(formatLon)
			);
		if (yAxisEl)
			d3.select(yAxisEl).call(
				d3
					.axisLeft(y)
					.tickValues(d3.range(-90, 91, 30))
					.tickSize(-innerWidth)
					.tickPadding(24)
					.tickFormat(formatLat)
			);
	});
</script>

{#if error}
	<p class="error">Could not load earthquake data: {error}</p>
{:else}
	<figure>
		<h1>Earthquakes of magnitude 6.0 and larger, May 2025 to May 2026</h1>
		<div class="chart">
			<svg
				viewBox="0 0 {width} {height}"
				role="img"
				aria-label="World map of earthquakes of magnitude 6.0 and larger, sized by magnitude and colored by depth"
			>
				<defs>
					<linearGradient id="depth-gradient">
						{#each colorStops as t (t)}
							<stop offset="{t * 100}%" stop-color={color(t * depthCutoff)} />
						{/each}
					</linearGradient>
				</defs>

				<g transform="translate({margin.left},{margin.top})">
					<rect class="ocean" width={innerWidth} height={innerHeight} />
					<path class="land" d={landPath} />

					<g class="axis" bind:this={xAxisEl} transform="translate(0,{innerHeight})"></g>
					<g class="axis" bind:this={yAxisEl}></g>

					<text class="axis-label" x={innerWidth / 2} y={innerHeight + 40} text-anchor="middle">
						Longitude
					</text>
					<text
						class="axis-label"
						transform="rotate(-90)"
						x={-innerHeight / 2}
						y={-62}
						text-anchor="middle"
					>
						Latitude
					</text>

					{#each drawOrder as d (d.id)}
						<!-- Hover only: the tooltip is a mouse aid, and the SVG is a single image to assistive tech. -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<circle
							class="quake"
							cx={x(d.longitude)}
							cy={y(d.latitude)}
							r={r(d.mag)}
							fill={color(d.depth)}
							onpointerenter={() => (hovered = d)}
							onpointerleave={() => (hovered = null)}
						/>
					{/each}

					{#if largest}
						{@const cx = x(largest.longitude)}
						{@const cy = y(largest.latitude)}
						{@const edge = r(largest.mag)}
						<g class="annotation">
							<line x1={cx - 56} y1={cy - 42} x2={cx - edge * 0.8} y2={cy - edge * 0.6} />
							<text x={cx - 60} y={cy - 44} text-anchor="end">
								M{largest.mag}, largest in this dataset
							</text>
						</g>
					{/if}

					<g class="legend" transform="translate(0,{innerHeight + margin.bottom + 10})">
						<text x="105" y="10" text-anchor="middle">Magnitude (circle area)</text>
						{#each legendMags as m, i (m)}
							<circle class="size-key" cx={35 + i * 70} cy="48" r={r(m)} />
							<text x={35 + i * 70} y="84" text-anchor="middle">M{m}</text>
						{/each}

						<g transform="translate({colorBar.x},0)">
							<text x="0" y="10">Depth (km)</text>
							<rect
								class="color-bar"
								y="38"
								width={colorBar.width}
								height={colorBar.height}
								fill="url(#depth-gradient)"
							/>
							{#each colorTicks as km (km)}
								<text x={(km / depthCutoff) * colorBar.width} y="68" text-anchor="middle">{km}</text>
							{/each}
							<text x={colorBar.width} y="68" text-anchor="middle">≥ {Math.round(depthCutoff)}</text>
							<text x="0" y="98">
								Earthquakes at or deeper than {Math.round(depthCutoff)} km (the 95th percentile)
								share the darkest color.
							</text>
						</g>
					</g>
				</g>
			</svg>
			{#if hovered && tooltip}
				<div
					class="tooltip"
					role="tooltip"
					style:left="{tooltip.left}%"
					style:top="{tooltip.top}%"
					style:transform="translate({tooltip.shiftX}, {tooltip.shiftY})"
				>
					<strong>{hovered.place}</strong>
					<span>Magnitude {formatMag(hovered.mag)}</span>
					<span>Depth {formatDepth(hovered.depth)}</span>
				</div>
			{/if}
		</div>
		<figcaption>
			This dataset includes magnitude 6.0 and larger earthquakes only. Smaller earthquakes are far
			more common and are not shown. Circle area is proportional to the magnitude number. Magnitude
			is logarithmic: each whole step is about 32 times more energy, so circle size shows the
			magnitude value, not the energy released. Source: USGS earthquake catalog.
		</figcaption>
	</figure>
{/if}

<style>
	figure {
		max-width: 1025px;
		margin: 0;
		font-family: system-ui, sans-serif;
	}

	h1 {
		font-size: 20px;
		margin: 0 0 4px;
	}

	svg {
		width: 100%;
		height: auto;
		/* circles near the plot edges extend past the margins */
		overflow: visible;
	}

	.chart {
		position: relative;
	}

	.tooltip {
		position: absolute;
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: max-content;
		max-width: 260px;
		padding: 6px 9px;
		border-radius: 4px;
		background: #1f2328;
		color: #fff;
		font-size: 13px;
		line-height: 1.35;
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
		/* never intercept the pointer, or the tooltip would flicker */
		pointer-events: none;
	}

	.ocean {
		fill: #f5f7f9;
	}

	.land {
		fill: #dfe2e5;
	}

	/* D3 creates the axis elements, so they need :global to be styled here. */
	.axis :global(.domain) {
		display: none;
	}

	.axis :global(.tick line) {
		stroke: #8a929b;
		stroke-opacity: 0.25;
		stroke-width: 0.5;
	}

	.axis :global(.tick text) {
		font-size: 11px;
		fill: #555;
	}

	.annotation line {
		stroke: #222;
		stroke-width: 0.8;
	}

	.annotation text {
		font-size: 12px;
		font-weight: 600;
		paint-order: stroke;
		stroke: #fff;
		stroke-width: 3px;
		stroke-linejoin: round;
	}

	.quake {
		fill-opacity: 0.8;
		stroke: #222;
		stroke-opacity: 0.6;
		stroke-width: 0.6;
	}

	.size-key {
		fill: #b5b9be;
		stroke: #222;
		stroke-opacity: 0.6;
		stroke-width: 0.6;
	}

	.color-bar {
		stroke: #222;
		stroke-opacity: 0.4;
		stroke-width: 0.5;
	}

	.axis-label,
	.legend text {
		font-size: 13px;
		fill: currentColor;
	}

	figcaption {
		font-size: 13px;
		line-height: 1.4;
	}

	.error {
		color: crimson;
	}
</style>
