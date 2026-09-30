<script>
  import * as d3 from 'd3';

  let { data } = $props();

  const width = 560;
  const rowHeight = 34;
  const margin = { top: 16, right: 24, bottom: 52, left: 168 };

  // Largest decrease first, so it sits at the top of the chart.
  let sorted = $derived([...data].sort((a, b) => a.Change_percent - b.Change_percent));
  let height = $derived(margin.top + margin.bottom + sorted.length * rowHeight);

  let x = $derived.by(() => {
    const [lo, hi] = d3.extent(data, (d) => d.Change_percent);
    return d3
      .scaleLinear()
      .domain([Math.min(0, Math.floor(lo / 10) * 10 - 20), Math.max(0, Math.ceil(hi / 10) * 10 + 10)])
      .range([margin.left, width - margin.right]);
  });

  let y = $derived(
    d3
      .scaleBand()
      .domain(sorted.map((d) => d.Terminal))
      .range([margin.top, height - margin.bottom])
      .padding(0.25)
  );

  const fmt = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%';
  const tickFmt = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '%';
</script>

<section aria-labelledby="heading-A">
  <h2 id="heading-A">Sketch A: Diverging bar chart</h2>
  <p class="subtitle">Percentage change in passengers, Jan–Oct 2019 to Jan–Oct 2023, by terminal</p>

  <div class="legend">
    <span><i class="swatch decrease"></i>Decrease (2023 below 2019)</span>
    <span><i class="swatch increase"></i>Increase (2023 above 2019)</span>
  </div>

  <svg viewBox="0 0 {width} {height}" role="img" aria-label="Diverging bar chart of percentage change in passenger traffic for ten LAX terminals">
    <!-- Gridlines and x-axis ticks -->
    {#each x.ticks(8) as t}
      <line class="grid" x1={x(t)} x2={x(t)} y1={margin.top} y2={height - margin.bottom} />
      <text class="tick" x={x(t)} y={height - margin.bottom + 16} text-anchor="middle">{tickFmt(t)}</text>
    {/each}

    <!-- Bars and value labels -->
    {#each sorted as d}
      {@const x0 = x(0)}
      {@const xv = x(d.Change_percent)}
      {@const cy = y(d.Terminal) + y.bandwidth() / 2}
      <text class="terminal" x={margin.left - 8} y={cy} text-anchor="end" dominant-baseline="middle">{d.Terminal}</text>
      <rect
        class={d.Change_percent < 0 ? 'decrease' : 'increase'}
        x={Math.min(x0, xv)}
        y={y(d.Terminal)}
        width={Math.abs(xv - x0)}
        height={y.bandwidth()}
      />
      <text
        class="value"
        x={d.Change_percent < 0 ? xv - 5 : xv + 5}
        y={cy}
        text-anchor={d.Change_percent < 0 ? 'end' : 'start'}
        dominant-baseline="middle">{fmt(d.Change_percent)}</text>
    {/each}

    <!-- Zero reference line -->
    <line class="zero" x1={x(0)} x2={x(0)} y1={margin.top - 6} y2={height - margin.bottom} />

    <text class="axis-title" x={(margin.left + width - margin.right) / 2} y={height - 10} text-anchor="middle">
      Percentage change in passengers (%)
    </text>
  </svg>

  <p class="note">
    Sorted from largest decrease (top) to largest increase (bottom). Only T5 grew; the other nine terminals carried
    fewer passengers in 2023 than in 2019.
  </p>
</section>

<style>
  section { padding: 1.5rem; background: white; border: 1px solid #bbb; border-radius: 6px; }
  h2 { margin: 0 0 0.25rem; font-size: 1.15rem; }
  .subtitle { margin: 0 0 0.75rem; color: #444; }
  svg { width: 100%; height: auto; display: block; }
  .legend { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; color: #333; margin-bottom: 0.5rem; }
  .swatch { display: inline-block; width: 12px; height: 12px; margin-right: 6px; vertical-align: -1px; border-radius: 2px; }
  .swatch.decrease, rect.decrease { fill: #c8553d; background: #c8553d; }
  .swatch.increase, rect.increase { fill: #2f6fa8; background: #2f6fa8; }
  .grid { stroke: #e3e3e3; }
  .zero { stroke: #222; stroke-width: 1.5; }
  .tick { font-size: 11px; fill: #555; }
  .terminal { font-size: 12.5px; fill: #222; }
  .value { font-size: 11.5px; fill: #222; font-variant-numeric: tabular-nums; }
  .axis-title { font-size: 12px; fill: #333; }
  .note { font-size: 0.85rem; color: #555; margin: 0.5rem 0 0; }
</style>
