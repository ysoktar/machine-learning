// Small SVG plotting: a 2-D scatter with lines and shaded half-planes, and a line chart. Theme colours come from CSS.
import { h } from "./ui.js";

const NS = "http://www.w3.org/2000/svg";
const s = (tag, attrs = {}, ...kids) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  for (const c of kids.flat()) if (c != null) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
};
const nice = (lo, hi) => {
  const span = hi - lo || 1;
  const step = 10 ** Math.floor(Math.log10(span / 5));
  const m = span / 5 / step;
  return step * (m >= 5 ? 5 : m >= 2 ? 2 : 1);
};

/**
 * Scatter plot. opts:
 *  xlim, ylim: [lo, hi]; points: [{x:[a,b], y:+1|-1|"q", name}]; lines: [{w:[w1,w2], b, cls}] (w·x + b = 0);
 *  shade: {w, b} colours the positive side; shadeFn: (x1, x2) -> +1/-1 (grid of cells); circles: [{c:[a,b], r, cls}];
 *  rings: names to circle; onclick(x1, x2, event); labels: show names; xlabel, ylabel.
 */
export function scatter(opts) {
  const W = 420, H = 340, m = { l: 40, r: 14, t: opts.ylabel ? 26 : 12, b: 34 };
  let [x0, x1] = opts.xlim, [y0, y1] = opts.ylim;
  if (opts.equal) {
    // same units per pixel on both axes (margins and right angles look right)
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const ux = (x1 - x0) / pw, uy = (y1 - y0) / ph;
    if (ux > uy) { const c = (y0 + y1) / 2, half = (ux * ph) / 2; y0 = c - half; y1 = c + half; }
    else { const c = (x0 + x1) / 2, half = (uy * pw) / 2; x0 = c - half; x1 = c + half; }
  }
  const X = (v) => m.l + ((v - x0) / (x1 - x0)) * (W - m.l - m.r);
  const Y = (v) => H - m.b - ((v - y0) / (y1 - y0)) * (H - m.t - m.b);
  const inv = (px, py) => [x0 + ((px - m.l) / (W - m.l - m.r)) * (x1 - x0), y0 + ((H - m.b - py) / (H - m.t - m.b)) * (y1 - y0)];
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot", role: "img", "aria-label": opts.aria || "Grafik" });
  const clipId = "c" + Math.random().toString(36).slice(2);
  svg.append(s("defs", {}, s("clipPath", { id: clipId }, s("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b }))));
  const plotArea = s("g", { "clip-path": `url(#${clipId})` });
  // grid + ticks
  const g = s("g", { class: "grid" }), ax = s("g", { class: "axis" });
  const sx = opts.xstep ?? nice(x0, x1), sy = opts.ystep ?? nice(y0, y1);
  for (let v = Math.ceil(x0 / sx) * sx; v <= x1 + 1e-9; v += sx) {
    g.append(s("line", { x1: X(v), x2: X(v), y1: m.t, y2: H - m.b }));
    ax.append(s("text", { x: X(v), y: H - m.b + 15, "text-anchor": "middle" }, +v.toFixed(6)));
  }
  for (let v = Math.ceil(y0 / sy) * sy; v <= y1 + 1e-9; v += sy) {
    g.append(s("line", { y1: Y(v), y2: Y(v), x1: m.l, x2: W - m.r }));
    ax.append(s("text", { x: m.l - 6, y: Y(v) + 4, "text-anchor": "end" }, +v.toFixed(6)));
  }
  ax.append(s("line", { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b }), s("line", { x1: m.l, x2: m.l, y1: m.t, y2: H - m.b }));
  if (opts.xlabel) ax.append(s("text", { x: W - m.r, y: H - 4, "text-anchor": "end", class: "lab" }, opts.xlabel));
  if (opts.ylabel) ax.append(s("text", { x: 6, y: 14, class: "lab" }, opts.ylabel));
  svg.append(g, plotArea, ax);

  if (opts.shadeFn) {
    const N = opts.shadeRes ?? 60;
    const cw = (W - m.l - m.r) / N, ch = (H - m.t - m.b) / N;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const [a, b] = inv(m.l + (i + 0.5) * cw, m.t + (j + 0.5) * ch);
      const v = opts.shadeFn(a, b);
      if (v) plotArea.append(s("rect", { x: m.l + i * cw, y: m.t + j * ch, width: cw + 0.5, height: ch + 0.5, class: v > 0 ? "region-pos" : "region-neg" }));
    }
  }
  const lineEnds = ({ w, b }) => {
    // w1 x + w2 y + b = 0, clipped to the box
    if (Math.abs(w[1]) > 1e-12) return [[x0, -(w[0] * x0 + b) / w[1]], [x1, -(w[0] * x1 + b) / w[1]]];
    if (Math.abs(w[0]) > 1e-12) return [[-b / w[0], y0], [-b / w[0], y1]];
    return null;
  };
  if (opts.shade) {
    const { w, b } = opts.shade;
    const corners = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const poly = (sign) => {
      const pts = [];
      for (let i = 0; i < 4; i++) {
        const p = corners[i], q = corners[(i + 1) % 4];
        const fp = w[0] * p[0] + w[1] * p[1] + b, fq = w[0] * q[0] + w[1] * q[1] + b;
        if (sign * fp >= 0) pts.push(p);
        if (fp * fq < 0) { const t = fp / (fp - fq); pts.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
      }
      return pts.map(([a, c]) => `${X(a)},${Y(c)}`).join(" ");
    };
    plotArea.append(s("polygon", { points: poly(1), class: "region-pos" }), s("polygon", { points: poly(-1), class: "region-neg" }));
  }
  for (const c of opts.circles || []) plotArea.append(s("ellipse", { cx: X(c.c[0]), cy: Y(c.c[1]), rx: Math.abs(X(c.c[0] + c.r) - X(c.c[0])), ry: Math.abs(Y(c.c[1] + c.r) - Y(c.c[1])), class: c.cls || "ring" }));
  for (const L of opts.lines || []) {
    const e = lineEnds(L);
    if (e) plotArea.append(s("line", { x1: X(e[0][0]), y1: Y(e[0][1]), x2: X(e[1][0]), y2: Y(e[1][1]), class: "line " + (L.cls || "") }));
  }
  for (const seg of opts.segments || []) plotArea.append(s("line", { x1: X(seg[0][0]), y1: Y(seg[0][1]), x2: X(seg[1][0]), y2: Y(seg[1][1]), class: "line dash" }));
  for (const p of opts.points || []) {
    const cx = X(p.x[0]), cy = Y(p.x[1]);
    let mark;
    if (p.y === "q") mark = s("rect", { x: cx - 6, y: cy - 6, width: 12, height: 12, class: "pt-q", transform: `rotate(45 ${cx} ${cy})` });
    else if (p.y === 1 || p.y === "+" || p.y === true) mark = s("circle", { cx, cy, r: 6, class: "pt-pos" });
    else mark = s("rect", { x: cx - 5.5, y: cy - 5.5, width: 11, height: 11, class: "pt-neg" });
    if (p.name) mark.append(s("title", {}, p.name));
    svg.append(mark);
    if (p.sv) svg.append(s("circle", { cx, cy, r: 10.5, class: "sv" }));
    if (opts.labels !== false && p.name) svg.append(s("text", { x: cx + 8, y: cy - 7, class: "lab" }, p.name));
  }
  if (opts.onclick) {
    svg.style.cursor = "crosshair";
    svg.addEventListener("pointerdown", (e) => {
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * W, py = ((e.clientY - r.top) / r.height) * H;
      const [a, b] = inv(px, py);
      if (a >= x0 && a <= x1 && b >= y0 && b <= y1) opts.onclick(a, b, e);
    });
  }
  return svg;
}

/** Line chart: series [{pts:[[x,y]...], cls, name}] */
export function lines(opts) {
  const W = 420, H = 260, m = { l: 44, r: 14, t: opts.ylabel ? 26 : 12, b: 34 };
  const all = opts.series.flatMap((se) => se.pts);
  const [x0, x1] = opts.xlim || [Math.min(...all.map((p) => p[0])), Math.max(...all.map((p) => p[0]))];
  const [y0, y1] = opts.ylim || [Math.min(0, ...all.map((p) => p[1])), Math.max(...all.map((p) => p[1]))];
  const X = (v) => m.l + ((v - x0) / (x1 - x0 || 1)) * (W - m.l - m.r);
  // curves are clipped at the plot edge (not flattened onto it); values far outside are capped so the path stays sane
  const Y = (v) => H - m.b - ((Math.min(Math.max(v, y0 - 10 * (y1 - y0)), y1 + 10 * (y1 - y0)) - y0) / (y1 - y0 || 1)) * (H - m.t - m.b);
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot", role: "img", "aria-label": opts.aria || "Grafik" });
  const g = s("g", { class: "grid" }), ax = s("g", { class: "axis" });
  const sx = opts.xstep ?? nice(x0, x1), sy = opts.ystep ?? nice(y0, y1);
  for (let v = Math.ceil(x0 / sx) * sx; v <= x1 + 1e-9; v += sx) { g.append(s("line", { x1: X(v), x2: X(v), y1: m.t, y2: H - m.b })); ax.append(s("text", { x: X(v), y: H - m.b + 15, "text-anchor": "middle" }, +v.toFixed(4))); }
  for (let v = Math.ceil(y0 / sy) * sy; v <= y1 + 1e-9; v += sy) { g.append(s("line", { y1: Y(v), y2: Y(v), x1: m.l, x2: W - m.r })); ax.append(s("text", { x: m.l - 6, y: Y(v) + 4, "text-anchor": "end" }, +v.toFixed(4))); }
  ax.append(s("line", { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b }), s("line", { x1: m.l, x2: m.l, y1: m.t, y2: H - m.b }));
  if (opts.xlabel) ax.append(s("text", { x: W - m.r, y: H - 4, "text-anchor": "end", class: "lab" }, opts.xlabel));
  if (opts.ylabel) ax.append(s("text", { x: 6, y: 14, class: "lab" }, opts.ylabel));
  const clipId = "l" + Math.random().toString(36).slice(2);
  svg.append(s("defs", {}, s("clipPath", { id: clipId }, s("rect", { x: m.l, y: m.t - 4, width: W - m.l - m.r + 4, height: H - m.t - m.b + 8 }))));
  const area = s("g", { "clip-path": `url(#${clipId})` });
  svg.append(g, ax, area);
  for (const se of opts.series) {
    if (!se.noLine) area.append(s("polyline", { points: se.pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(" "), class: se.cls || "curve1" }));
    if (se.dots) for (const [a, b] of se.pts) area.append(s("circle", { cx: X(a), cy: Y(b), r: se.noLine ? 4 : 3, class: (se.cls || "curve1") + "-dot", fill: "currentColor", style: se.noLine ? `fill: var(--${se.color || "neg"})` : "fill: var(--text-2)" }));
  }
  const legend = h("div", { class: "legend" }, opts.series.filter((se) => se.name).map((se) => h("span", {}, h("i", { style: { background: `var(--${se.color || "pos"})` } }), se.name)));
  return h("div", {}, svg, legend);
}
