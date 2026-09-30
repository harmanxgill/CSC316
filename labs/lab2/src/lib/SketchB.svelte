<script>
  import * as d3 from 'd3';

  let { data } = $props();

  const width = 560;
  const rowHeight = 34;
  const margin = { top: 16, right: 24, bottom: 52, left: 168 };
  const radius = 6;

  // Same order as Sketch A: largest decrease first.
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
      .scalePoint()
      .domain(sorted.map((d) => d.Terminal))
      .range([margin.top + rowHeight / 2, height - margin.bottom - rowHeight / 2])
  );

  const fmt = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%';
  const tickFmt = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '%';
</script>

<section aria-labelledby="heading-B">
  <h2 id="heading-B">Sketch B: Lollipop chart</h2>
  <p class="subtitle">Percentage change in passengers, Jan–Oct 2019 to Jan–Oct 2023, by terminal</p>

  <div class="legend">
    <span><i class="swatch decrease"></i>Decrease (2023 below 2019)</span>
    <span><i class="swatch increase"></i>Increase (2023 above 2019)</span>
  </div>

  <svg viewBox="0 0 {width} {height}" role="img" aria-label="Lollipop chart of percentage change in passenger traffic for ten LAX terminals">
    <!-- Gridlines and x-axis ticks -->
    {#each x.ticks(8) as t}
      <line class="grid" x1={x(t)} x2={x(t)} y1={margin.top} y2={height - margin.bottom} />
      <text class="tick" x={x(t)} y={height - margin.bottom + 16} text-anchor="middle">{tickFmt(t)}</text>
    {/each}

    <!-- Stems, drawn first so the zero line and dots sit on top -->
    {#each sorted as d}
      <line
        class="stem {d.Change_percent < 0 ? 'decrease' : 'increase'}"
        x1={x(0)}
        x2={x(d.Change_percent)}
        y1={y(d.Terminal)}
        y2={y(d.Terminal)} />
    {/each}

    <!-- Zero reference line -->
    <line class="zero" x1={x(0)} x2={x(0)} y1={margin.top - 8} y2={height - margin.bottom + 4} />

    <!-- Dots and labels -->
    {#each sorted as d}
      {@const xv = x(d.Change_percent)}
      {@const cy = y(d.Terminal)}
      {@const cls = d.Change_percent < 0 ? 'decrease' : 'increase'}
      <text class="terminal" x={margin.left - 8} y={cy} text-anchor="end" dominant-baseline="middle">{d.Terminal}</text>
      <circle class={cls} cx={xv} cy={cy} r={radius} />
      <text
        class="value"
        x={d.Change_percent < 0 ? xv - radius - 5 : xv + radius + 5}
        y={cy}
        text-anchor={d.Change_percent < 0 ? 'end' : 'start'}
        dominant-baseline="middle">{fmt(d.Change_percent)}</text>
    {/each}

    <text class="axis-title" x={(margin.left + width - margin.right) / 2} y={height - 10} text-anchor="middle">
      Percentage change in passengers (%)
    </text>
  </svg>

  <p class="note">
    Each dot marks a terminal's percentage change; the line runs from 0%. Same order as Sketch A: largest decrease at
    the top.
  </p>
</section>

<style>
  section { padding: 1.5rem; background: white; border: 1px solid #bbb; border-radius: 6px; }
  h2 { margin: 0 0 0.25rem; font-size: 1.15rem; }
  .subtitle { margin: 0 0 0.75rem; color: #444; }
  svg { width: 100%; height: auto; display: block; }
  .legend { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; color: #333; margin-bottom: 0.5rem; }
  .swatch { display: inline-block; width: 12px; height: 12px; margin-right: 6px; vertical-align: -1px; border-radius: 50%; }
  .swatch.decrease { background: #c8553d; }
  .swatch.increase { background: #2f6fa8; }
  circle.decrease { fill: #c8553d; }
  circle.increase { fill: #2f6fa8; }
  .stem { stroke-width: 1; opacity: 0.45; }
  .stem.decrease { stroke: #c8553d; }
  .stem.increase { stroke: #2f6fa8; }
  .grid { stroke: #e3e3e3; }
  .zero { stroke: #111; stroke-width: 3; }
  .tick { font-size: 11px; fill: #555; }
  .terminal { font-size: 12.5px; fill: #222; }
  .value { font-size: 11.5px; fill: #222; font-variant-numeric: tabular-nums; }
  .axis-title { font-size: 12px; fill: #333; }
  .note { font-size: 0.85rem; color: #555; margin: 0.5rem 0 0; }
</style>
