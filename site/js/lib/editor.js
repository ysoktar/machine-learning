// Interactive 2-D canvas: points can be added where you click, dragged, and removed; an optional query point can be
// dragged. The SVG element stays the same while you drag (only its content is redrawn), so dragging never "drops".
//
//   const ed = pointEditor({ xlim, ylim, points, query, getMode, layers, onChange, equal, snap })
//   ed.el            the element to insert
//   ed.points        current points [{x:[a,b], y:+1|-1, name}]
//   ed.set(points, query), ed.redraw()
// layers(api) returns SVG markup drawn under the points; api has X(v), Y(v), x0, x1, y0, y1, line(w, b, cls), poly(...)

const NS = "http://www.w3.org/2000/svg";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const nice = (lo, hi) => {
  const span = hi - lo || 1;
  const step = 10 ** Math.floor(Math.log10(span / 6));
  const m = span / 6 / step;
  return step * (m >= 5 ? 5 : m >= 2 ? 2 : 1);
};
const fmt = (v) => String(Math.round(v * 100) / 100).replace("-", "−");

export function pointEditor(opts) {
  const W = 440, H = 360, m = { l: 40, r: 14, t: 12, b: 34 };
  let [x0, x1] = opts.xlim, [y0, y1] = opts.ylim;
  if (opts.equal !== false) {
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const ux = (x1 - x0) / pw, uy = (y1 - y0) / ph;
    if (ux > uy) { const c = (y0 + y1) / 2, hh = (ux * ph) / 2; y0 = c - hh; y1 = c + hh; }
    else { const c = (x0 + x1) / 2, hh = (uy * pw) / 2; x0 = c - hh; x1 = c + hh; }
  }
  const X = (v) => m.l + ((v - x0) / (x1 - x0)) * (W - m.l - m.r);
  const Y = (v) => H - m.b - ((v - y0) / (y1 - y0)) * (H - m.t - m.b);
  const inv = (px, py) => [x0 + ((px - m.l) / (W - m.l - m.r)) * (x1 - x0), y0 + ((H - m.b - py) / (H - m.t - m.b)) * (y1 - y0)];
  const snap = opts.snap ?? 0.1;
  const rs = (v) => Math.round(v / snap) * snap;

  const ed = { points: (opts.points || []).map((p) => ({ ...p, x: [...p.x] })), query: opts.query ? [...opts.query] : null };
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("class", "plot editor");
  svg.setAttribute("role", "application");
  svg.setAttribute("aria-label", opts.aria || "Etkileşimli grafik");
  svg.style.touchAction = "none";

  // static layer: grid and axes
  const sx = nice(x0, x1), sy = nice(y0, y1);
  let grid = `<defs><clipPath id="clip${(ed.id = Math.random().toString(36).slice(2))}"><rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}"/></clipPath></defs><g class="grid">`;
  let axis = `<g class="axis">`;
  for (let v = Math.ceil(x0 / sx) * sx; v <= x1 + 1e-9; v += sx) { grid += `<line x1="${X(v)}" x2="${X(v)}" y1="${m.t}" y2="${H - m.b}"/>`; axis += `<text x="${X(v)}" y="${H - m.b + 15}" text-anchor="middle">${fmt(v)}</text>`; }
  for (let v = Math.ceil(y0 / sy) * sy; v <= y1 + 1e-9; v += sy) { grid += `<line y1="${Y(v)}" y2="${Y(v)}" x1="${m.l}" x2="${W - m.r}"/>`; axis += `<text x="${m.l - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(v)}</text>`; }
  axis += `<line x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}"/><line x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${H - m.b}"/>`;
  if (opts.xlabel) axis += `<text x="${W - m.r}" y="${H - 4}" text-anchor="end" class="lab">${opts.xlabel}</text>`;
  if (opts.ylabel) axis += `<text x="6" y="${m.t + 4}" class="lab">${opts.ylabel}</text>`;
  svg.innerHTML = grid + "</g>" + axis + "</g>";
  const under = document.createElementNS(NS, "g");
  under.setAttribute("clip-path", `url(#clip${ed.id})`);
  const over = document.createElementNS(NS, "g");
  svg.append(under, over);

  const api = {
    X, Y, x0, x1, y0, y1,
    /** line w·x + b = 0 clipped to the box */
    line(w, b, cls = "line") {
      let p;
      if (Math.abs(w[1]) > 1e-12) p = [[x0, -(w[0] * x0 + b) / w[1]], [x1, -(w[0] * x1 + b) / w[1]]];
      else if (Math.abs(w[0]) > 1e-12) p = [[-b / w[0], y0], [-b / w[0], y1]];
      else return "";
      return `<line x1="${X(p[0][0])}" y1="${Y(p[0][1])}" x2="${X(p[1][0])}" y2="${Y(p[1][1])}" class="${cls}"/>`;
    },
    /** the two half-planes of w·x + b coloured */
    halves(w, b) {
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
      return `<polygon points="${poly(1)}" class="region-pos"/><polygon points="${poly(-1)}" class="region-neg"/>`;
    },
    /** coloured cells from a function (x1, x2) -> +1 / -1 / 0 */
    cells(fn, n = 44) {
      let s = "";
      const cw = (W - m.l - m.r) / n, ch = (H - m.t - m.b) / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const [a, c] = inv(m.l + (i + 0.5) * cw, m.t + (j + 0.5) * ch);
        const v = fn(a, c);
        if (v) s += `<rect x="${m.l + i * cw}" y="${m.t + j * ch}" width="${cw + 0.4}" height="${ch + 0.4}" class="${v > 0 ? "region-pos" : "region-neg"}"/>`;
      }
      return s;
    },
    seg(a, b, cls = "line dash") { return `<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" class="${cls}"/>`; },
    circle(c, r, cls = "ring") { return `<ellipse cx="${X(c[0])}" cy="${Y(c[1])}" rx="${Math.abs(X(c[0] + r) - X(c[0]))}" ry="${Math.abs(Y(c[1] + r) - Y(c[1]))}" class="${cls}"/>`; },
    text(p, s, cls = "lab") { return `<text x="${X(p[0])}" y="${Y(p[1])}" class="${cls}">${esc(s)}</text>`; },
  };

  let hover = null;
  function redraw() {
    under.innerHTML = opts.layers ? opts.layers(api, ed) : "";
    const deco = opts.decorate ? opts.decorate(ed) : {};
    let s = "";
    for (const p of ed.points) {
      const cx = X(p.x[0]), cy = Y(p.x[1]);
      const d = deco[p.name] || {};
      const cls = (p.y > 0 ? "pt-pos" : "pt-neg") + (d.dim ? " dim" : "") + (d.bad ? " bad" : "");
      if (d.ring) s += `<circle cx="${cx}" cy="${cy}" r="${11.5 * Math.max(1, d.size || 1)}" class="${d.ring}"/>`;
      const r = 7 * (d.size || 1);
      s += p.y > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r}" class="${cls}" data-name="${esc(p.name)}"/>` : `<rect x="${cx - r + 0.5}" y="${cy - r + 0.5}" width="${2 * r - 1}" height="${2 * r - 1}" class="${cls}" data-name="${esc(p.name)}"/>`;
      if (d.cross) s += `<path d="M${cx - 9} ${cy - 9}L${cx + 9} ${cy + 9}M${cx + 9} ${cy - 9}L${cx - 9} ${cy + 9}" class="miss"/>`;
      if (opts.labels !== false) s += `<text x="${cx + 9}" y="${cy - 8}" class="lab">${esc(p.name)}${d.note ? ` <tspan class="note">${esc(d.note)}</tspan>` : ""}</text>`;
    }
    if (ed.query) {
      const cx = X(ed.query[0]), cy = Y(ed.query[1]);
      s += `<rect x="${cx - 7}" y="${cy - 7}" width="14" height="14" transform="rotate(45 ${cx} ${cy})" class="pt-q" data-name="__q"/><text x="${cx + 10}" y="${cy + 18}" class="lab">q</text>`;
    }
    if (hover) s += `<g class="tip"><rect x="${hover.px + 10}" y="${hover.py - 26}" width="${hover.t.length * 6.6 + 12}" height="20" rx="4"/><text x="${hover.px + 16}" y="${hover.py - 12}">${esc(hover.t)}</text></g>`;
    over.innerHTML = s;
  }
  const changed = () => { redraw(); opts.onChange?.(ed); };

  const local = (e) => { const r = svg.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
  const hit = (px, py) => {
    if (ed.query && Math.hypot(px - X(ed.query[0]), py - Y(ed.query[1])) < 12) return "__q";
    let best = null, bd = 12;
    for (const p of ed.points) { const d = Math.hypot(px - X(p.x[0]), py - Y(p.x[1])); if (d < bd) { bd = d; best = p; } }
    return best;
  };
  const nextName = () => {
    const used = new Set(ed.points.map((p) => p.name));
    for (let i = 0; i < 26; i++) { const n = String.fromCharCode(65 + i); if (!used.has(n)) return n; }
    let k = 1; while (used.has("p" + k)) k++; return "p" + k;
  };
  let drag = null;
  svg.addEventListener("pointerdown", (e) => {
    if (opts.editable === false) return;
    const [px, py] = local(e);
    const target = hit(px, py);
    if (target) {
      drag = { target, sx: px, sy: py, moved: false };
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    const [a, b] = inv(px, py);
    if (a < x0 || a > x1 || b < y0 || b > y1) return;
    const mode = opts.getMode ? opts.getMode() : "+";
    const pos = [rs(a), rs(b)];
    if (mode === "q" && ed.query) { ed.query = pos; changed(); return; }
    if (mode !== "+" && mode !== "-") return;
    if (ed.points.some((p) => Math.hypot(X(p.x[0]) - X(pos[0]), Y(p.x[1]) - Y(pos[1])) < 15)) { flash("Orada zaten bir nokta var: sürükleyerek taşıyabilir ya da tıklayarak silebilirsin."); return; }
    if (opts.maxPoints && ed.points.length >= opts.maxPoints) { flash(`En çok ${opts.maxPoints} nokta.`); return; }
    ed.points.push({ x: pos, y: mode === "+" ? 1 : -1, name: nextName() });
    changed();
  });
  svg.addEventListener("pointermove", (e) => {
    const [px, py] = local(e);
    if (!drag) {
      const t = hit(px, py);
      const nh = t && t !== "__q" ? { px, py, t: `${t.name} (${fmt(t.x[0])}, ${fmt(t.x[1])}) ${t.y > 0 ? "+" : "−"}` } : null;
      if (JSON.stringify(nh?.t) !== JSON.stringify(hover?.t)) { hover = nh; redraw(); }
      svg.style.cursor = t ? "grab" : opts.editable === false ? "default" : "crosshair";
      return;
    }
    if (!drag.moved && Math.hypot(px - drag.sx, py - drag.sy) < 4) return;
    drag.moved = true;
    hover = null;
    const [a, b] = inv(px, py);
    const pos = [Math.min(x1, Math.max(x0, rs(a))), Math.min(y1, Math.max(y0, rs(b)))];
    if (drag.target === "__q") ed.query = pos; else drag.target.x = pos;
    svg.style.cursor = "grabbing";
    if (!drag.raf) drag.raf = requestAnimationFrame(() => { if (drag) drag.raf = 0; changed(); });
  });
  const end = () => {
    if (!drag) return;
    if (!drag.moved && drag.target !== "__q" && opts.removable !== false) {
      const gone = drag.target;
      ed.points = ed.points.filter((p) => p !== gone);
      hover = null;
      changed();
      flash(`${gone.name} silindi.`);
    } else if (drag.moved) changed();
    drag = null;
  };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  svg.addEventListener("pointerleave", () => { if (!drag && hover) { hover = null; redraw(); } });

  const msg = document.createElement("div");
  msg.className = "editor-msg";
  msg.setAttribute("aria-live", "polite");
  let mt;
  function flash(t) { msg.textContent = t; msg.classList.add("show"); clearTimeout(mt); mt = setTimeout(() => msg.classList.remove("show"), 2600); }
  const wrap = document.createElement("div");
  wrap.className = "editor-wrap";
  wrap.append(svg, msg);
  if (opts.hint !== false) {
    const hint = document.createElement("p");
    hint.className = "editor-hint";
    hint.textContent = opts.hint || "Boş yere tıkla: nokta ekle · noktayı sürükle: taşı · noktaya tıkla: sil";
    wrap.append(hint);
  }
  ed.el = wrap;
  ed.redraw = redraw;
  ed.flash = flash;
  ed.set = (points, query) => { ed.points = points.map((p) => ({ ...p, x: [...p.x] })); if (query) ed.query = [...query]; redraw(); };
  ed.api = api;
  redraw();
  return ed;
}

/** "x1 x2 label name" text for a set of points (keeps the textarea in sync with the canvas) */
export const pointsToText = (pts) => pts.map((p) => `${fmt(p.x[0]).replace("−", "-")} ${fmt(p.x[1]).replace("−", "-")} ${p.y > 0 ? "+" : "-"} ${p.name}`).join("\n");
