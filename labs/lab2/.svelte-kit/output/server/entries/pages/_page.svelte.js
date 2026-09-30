import { b as escape_html, i as head, n as derived, o as stringify, r as ensure_array_like, t as attr_class, v as attr, y as clsx } from "../../chunks/server.js";
import * as d3 from "d3";
//#region src/lib/data.js
var rows = [
	{
		"Terminal": "Miscellaneous Terminal",
		"Passengers_2019": 2491987,
		"Passengers_2023": 1057415,
		"Change": -1434572,
		"Change_percent": -57.57
	},
	{
		"Terminal": "T1",
		"Passengers_2019": 8004170,
		"Passengers_2023": 5995807,
		"Change": -2008363,
		"Change_percent": -25.09
	},
	{
		"Terminal": "T2",
		"Passengers_2019": 7083927,
		"Passengers_2023": 6268712,
		"Change": -815215,
		"Change_percent": -11.51
	},
	{
		"Terminal": "T3",
		"Passengers_2019": 6841286,
		"Passengers_2023": 5826077,
		"Change": -1015209,
		"Change_percent": -14.84
	},
	{
		"Terminal": "T4",
		"Passengers_2019": 8785629,
		"Passengers_2023": 4159208,
		"Change": -4626421,
		"Change_percent": -52.66
	},
	{
		"Terminal": "T5",
		"Passengers_2019": 8222531,
		"Passengers_2023": 8729408,
		"Change": 506877,
		"Change_percent": 6.16
	},
	{
		"Terminal": "T6",
		"Passengers_2019": 6650438,
		"Passengers_2023": 4870919,
		"Change": -1779519,
		"Change_percent": -26.76
	},
	{
		"Terminal": "T7",
		"Passengers_2019": 7891471,
		"Passengers_2023": 6645872,
		"Change": -1245599,
		"Change_percent": -15.78
	},
	{
		"Terminal": "T8",
		"Passengers_2019": 2924204,
		"Passengers_2023": 2478080,
		"Change": -446124,
		"Change_percent": -15.26
	},
	{
		"Terminal": "TBIT",
		"Passengers_2019": 14962413,
		"Passengers_2023": 11205699,
		"Change": -3756714,
		"Change_percent": -25.11
	}
];
//#endregion
//#region src/lib/SketchA.svelte
function SketchA($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const width = 560;
		const rowHeight = 34;
		const margin = {
			top: 16,
			right: 24,
			bottom: 52,
			left: 168
		};
		let sorted = derived(() => [...data].sort((a, b) => a.Change_percent - b.Change_percent));
		let height = derived(() => margin.top + margin.bottom + sorted().length * rowHeight);
		let x = derived(() => {
			const [lo, hi] = d3.extent(data, (d) => d.Change_percent);
			return d3.scaleLinear().domain([Math.min(0, Math.floor(lo / 10) * 10 - 10), Math.max(0, Math.ceil(hi / 10) * 10 + 10)]).range([margin.left, width - margin.right]);
		});
		let y = derived(() => d3.scaleBand().domain(sorted().map((d) => d.Terminal)).range([margin.top, height() - margin.bottom]).padding(.25));
		const fmt = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(2) + "%";
		const tickFmt = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + "%";
		$$renderer.push(`<section aria-labelledby="heading-A" class="svelte-1c9c60m"><h2 id="heading-A" class="svelte-1c9c60m">Sketch A: Diverging bar chart</h2> <p class="subtitle svelte-1c9c60m">Percentage change in passengers, Jan–Oct 2019 to Jan–Oct 2023, by terminal</p> <div class="legend svelte-1c9c60m"><span><i class="swatch decrease svelte-1c9c60m"></i>Decrease (2023 below 2019)</span> <span><i class="swatch increase svelte-1c9c60m"></i>Increase (2023 above 2019)</span></div> <svg${attr("viewBox", `0 0 560 ${stringify(height())}`)} role="img" aria-label="Diverging bar chart of percentage change in passenger traffic for ten LAX terminals" class="svelte-1c9c60m"><!--[-->`);
		const each_array = ensure_array_like(x().ticks(8));
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let t = each_array[$$index];
			$$renderer.push(`<line class="grid svelte-1c9c60m"${attr("x1", x()(t))}${attr("x2", x()(t))}${attr("y1", margin.top)}${attr("y2", height() - margin.bottom)}></line><text class="tick svelte-1c9c60m"${attr("x", x()(t))}${attr("y", height() - margin.bottom + 16)} text-anchor="middle">${escape_html(tickFmt(t))}</text>`);
		}
		$$renderer.push(`<!--]--><!--[-->`);
		const each_array_1 = ensure_array_like(sorted());
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let d = each_array_1[$$index_1];
			const x0 = x()(0);
			const xv = x()(d.Change_percent);
			const cy = y()(d.Terminal) + y().bandwidth() / 2;
			$$renderer.push(`<text class="terminal svelte-1c9c60m"${attr("x", margin.left - 8)}${attr("y", cy)} text-anchor="end" dominant-baseline="middle">${escape_html(d.Terminal)}</text><rect${attr_class(clsx(d.Change_percent < 0 ? "decrease" : "increase"), "svelte-1c9c60m")}${attr("x", Math.min(x0, xv))}${attr("y", y()(d.Terminal))}${attr("width", Math.abs(xv - x0))}${attr("height", y().bandwidth())}></rect><text class="value svelte-1c9c60m"${attr("x", d.Change_percent < 0 ? xv - 5 : xv + 5)}${attr("y", cy)}${attr("text-anchor", d.Change_percent < 0 ? "end" : "start")} dominant-baseline="middle">${escape_html(fmt(d.Change_percent))}</text>`);
		}
		$$renderer.push(`<!--]--><line class="zero svelte-1c9c60m"${attr("x1", x()(0))}${attr("x2", x()(0))}${attr("y1", margin.top - 6)}${attr("y2", height() - margin.bottom)}></line><text class="axis-title svelte-1c9c60m"${attr("x", (margin.left + width - margin.right) / 2)}${attr("y", height() - 10)} text-anchor="middle">Percentage change in passengers (%)</text></svg> <p class="note svelte-1c9c60m">Sorted from largest decrease (top) to largest increase (bottom). Only T5 grew; the other nine terminals carried
    fewer passengers in 2023 than in 2019.</p></section>`);
	});
}
//#endregion
//#region src/lib/SketchB.svelte
function SketchB($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const width = 560;
		const rowHeight = 34;
		const margin = {
			top: 16,
			right: 24,
			bottom: 52,
			left: 168
		};
		const radius = 6;
		let sorted = derived(() => [...data].sort((a, b) => a.Change_percent - b.Change_percent));
		let height = derived(() => margin.top + margin.bottom + sorted().length * rowHeight);
		let x = derived(() => {
			const [lo, hi] = d3.extent(data, (d) => d.Change_percent);
			return d3.scaleLinear().domain([Math.min(0, Math.floor(lo / 10) * 10 - 10), Math.max(0, Math.ceil(hi / 10) * 10 + 10)]).range([margin.left, width - margin.right]);
		});
		let y = derived(() => d3.scalePoint().domain(sorted().map((d) => d.Terminal)).range([margin.top + rowHeight / 2, height() - margin.bottom - rowHeight / 2]));
		const fmt = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(2) + "%";
		const tickFmt = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + "%";
		$$renderer.push(`<section aria-labelledby="heading-B" class="svelte-rqwvlp"><h2 id="heading-B" class="svelte-rqwvlp">Sketch B: Lollipop chart</h2> <p class="subtitle svelte-rqwvlp">Percentage change in passengers, Jan–Oct 2019 to Jan–Oct 2023, by terminal</p> <div class="legend svelte-rqwvlp"><span><i class="swatch decrease svelte-rqwvlp"></i>Decrease (2023 below 2019)</span> <span><i class="swatch increase svelte-rqwvlp"></i>Increase (2023 above 2019)</span></div> <svg${attr("viewBox", `0 0 560 ${stringify(height())}`)} role="img" aria-label="Lollipop chart of percentage change in passenger traffic for ten LAX terminals" class="svelte-rqwvlp"><!--[-->`);
		const each_array = ensure_array_like(x().ticks(8));
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let t = each_array[$$index];
			$$renderer.push(`<line class="grid svelte-rqwvlp"${attr("x1", x()(t))}${attr("x2", x()(t))}${attr("y1", margin.top)}${attr("y2", height() - margin.bottom)}></line><text class="tick svelte-rqwvlp"${attr("x", x()(t))}${attr("y", height() - margin.bottom + 16)} text-anchor="middle">${escape_html(tickFmt(t))}</text>`);
		}
		$$renderer.push(`<!--]--><line class="zero svelte-rqwvlp"${attr("x1", x()(0))}${attr("x2", x()(0))}${attr("y1", margin.top - 6)}${attr("y2", height() - margin.bottom)}></line><!--[-->`);
		const each_array_1 = ensure_array_like(sorted());
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let d = each_array_1[$$index_1];
			const xv = x()(d.Change_percent);
			const cy = y()(d.Terminal);
			const cls = d.Change_percent < 0 ? "decrease" : "increase";
			$$renderer.push(`<text class="terminal svelte-rqwvlp"${attr("x", margin.left - 8)}${attr("y", cy)} text-anchor="end" dominant-baseline="middle">${escape_html(d.Terminal)}</text><line${attr_class(`stem ${cls}`, "svelte-rqwvlp")}${attr("x1", x()(0))}${attr("x2", xv)}${attr("y1", cy)}${attr("y2", cy)}></line><circle${attr_class(clsx(cls), "svelte-rqwvlp")}${attr("cx", xv)}${attr("cy", cy)}${attr("r", radius)}></circle><text class="value svelte-rqwvlp"${attr("x", d.Change_percent < 0 ? xv - radius - 5 : xv + radius + 5)}${attr("y", cy)}${attr("text-anchor", d.Change_percent < 0 ? "end" : "start")} dominant-baseline="middle">${escape_html(fmt(d.Change_percent))}</text>`);
		}
		$$renderer.push(`<!--]--><text class="axis-title svelte-rqwvlp"${attr("x", (margin.left + width - margin.right) / 2)}${attr("y", height() - 10)} text-anchor="middle">Percentage change in passengers (%)</text></svg> <p class="note svelte-rqwvlp">Each dot marks a terminal's percentage change; the line runs from 0%. Same order as Sketch A: largest decrease at
    the top.</p></section>`);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer) {
	head("1uha8ag", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Lab 2: LAX Sketches</title>`);
		});
	});
	$$renderer.push(`<main class="svelte-1uha8ag"><h1 class="svelte-1uha8ag">My LAX Sketches</h1> <p>January–October 2019 and 2023 · Ten comparable terminals</p> <p class="question svelte-1uha8ag">Which LAX terminals experienced the largest increases or decreases in passenger traffic from January–October 2019
    to January–October 2023?</p> <div class="sketches svelte-1uha8ag">`);
	SketchA($$renderer, { data: rows });
	$$renderer.push(`<!----> `);
	SketchB($$renderer, { data: rows });
	$$renderer.push(`<!----></div></main>`);
}
//#endregion
export { _page as default };
