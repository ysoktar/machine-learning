// DOM helpers shared by the layout and the widgets.

/** Tiny hyperscript: h("div", {class: "x", onclick: f}, "text", child, …). Strings become text nodes. */
export function h(tag, attrs = {}, ...children) {
  const el = tag.startsWith("svg:") ? document.createElementNS("http://www.w3.org/2000/svg", tag.slice(4)) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "class") el.setAttribute("class", v);
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "html") el.innerHTML = v; // only used with markup built by this site
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k === "value") el.value = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** A table from a header row and body rows. Cells may be strings, nodes or {v, cls, html}. */
export function table(head, rows, { cls = "", foot } = {}) {
  const cell = (tag, c) => {
    if (c && typeof c === "object" && !(c instanceof Node)) return h(tag, { class: c.cls, html: c.html, colspan: c.span }, c.html ? null : c.v);
    return h(tag, {}, c);
  };
  const t = h("table", { class: "simple " + cls },
    head ? h("thead", {}, h("tr", {}, head.map((c) => cell("th", c)))) : null,
    h("tbody", {}, rows.map((r) => (r && r.row ? h("tr", { class: r.cls }, r.row.map((c) => cell("td", c))) : h("tr", {}, r.map((c) => cell("td", c)))))),
    foot ? h("tfoot", {}, h("tr", {}, foot.map((c) => cell("td", c)))) : null);
  return h("div", { class: "table-wrap" }, t);
}

/** Widget frame: title bar + body. */
export function frame(title, badge = "Etkileşimli") {
  const body = h("div", { class: "widget-body" });
  const el = h("div", { class: "widget" }, h("div", { class: "widget-head" }, badge ? h("span", { class: "badge" }, badge) : null, title), body);
  return { el, body };
}
export function num(label, value, { step = "any", min, max, width, oninput } = {}) {
  const input = h("input", { type: "number", step, min, max, value, style: width ? { width } : null });
  if (oninput) input.addEventListener("input", oninput);
  return { label: h("label", {}, label, input), input, get: () => Number(input.value) };
}
export function select(label, options, value, onchange) {
  const s = h("select", {}, options.map(([v, t]) => h("option", { value: v, selected: v === value }, t)));
  if (onchange) s.addEventListener("change", onchange);
  return { label: h("label", {}, label, s), input: s, get: () => s.value };
}
export function checkbox(label, checked, onchange) {
  const c = h("input", { type: "checkbox", checked });
  if (onchange) c.addEventListener("change", onchange);
  return { label: h("label", {}, c, label), input: c, get: () => c.checked };
}
export function button(label, onClick, kind = "") {
  return h("button", { type: "button", class: "btn small " + kind, onclick: onClick }, label);
}
export function area(value, rows = 6, oninput) {
  const t = h("textarea", { class: "data", rows, spellcheck: "false" });
  t.value = value;
  if (oninput) t.addEventListener("input", oninput);
  return t;
}
// Readers type numbers in many ways: "−1" (typographic minus), "1,2,3", "1;2", extra spaces. All of them must work.
const normMinus = (s) => String(s).replace(/[−–]/g, "-");
/** Parse "1, 2, 3" / "1 2 3" / "1;2;3" into numbers; typographic minus signs are accepted, junk tokens dropped. */
export function parseNums(s) {
  return normMinus(s).trim().split(/[\s;,]+/).filter(Boolean).map(Number).filter(Number.isFinite);
}
/** 0/1 sequences: "1 1 0", "1,1,0" and also "110" with no separators at all. */
export function parseBits(s) {
  const t = normMinus(s).trim();
  if (/^[01\s,;]+$/.test(t)) return t.replace(/[\s,;]/g, "").split("").map(Number);
  return parseNums(t);
}
/** Positive/negative labels: "+ + −", "++−", "1 1 0", "110", "p p n", "+,+,-". Returns true for positive. */
export function parsePosNeg(s) {
  const t = normMinus(s).toLowerCase().replace(/[\s,;]/g, "");
  return t.split("").filter((c) => "+-10pnye".includes(c)).map((c) => "+1py".includes(c));
}
/** Class labels for n values: "E E H", "E,E,H" or "EEH" (single-letter labels typed together). */
export function parseLabels(s, n) {
  const toks = s.trim().split(/[\s,;]+/).filter(Boolean);
  if (toks.length !== n) { const joined = toks.join(""); if (joined.length === n) return joined.split(""); }
  return toks;
}
/** One number typed by a reader: "0,5", "−1", "4/5", " 2 " all work. NaN if it is not a number. */
export function readNumber(s) {
  const t = normMinus(s).trim().replace(",", ".").replace(/\s+/g, "");
  const fr = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fr) return Number(fr[1]) / Number(fr[2]);
  return t === "" ? NaN : Number(t);
}
/** Lines of whitespace/comma separated tokens, ignoring empty lines and # comments. */
export function parseRows(s) {
  return normMinus(s).split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean).map((l) => l.split(/[\s,;|]+/).filter(Boolean));
}
export function errorBox(msg) { return h("p", { class: "err" }, "⚠ " + msg); }
export const sup = (s) => h("sup", {}, s);
export const sub = (s) => h("sub", {}, s);

/** Remember small per-viewer choices; never throws. */
export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
