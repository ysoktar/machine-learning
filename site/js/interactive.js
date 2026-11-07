// Teaching widgets built on the interactive point editor: drag, add and remove points; step through algorithms with
// a narration of what happens and why; explore formulas with sliders. Registered into widgets.js (W.*).
import { h, table, frame, area, parseRows, errorBox } from "./lib/ui.js";
import * as ml from "./lib/ml.js";
import { lines } from "./lib/plot.js";
import { pointEditor, pointsToText } from "./lib/editor.js";

const f = ml.fmt;
const vec = (v, d = 3) => `(${v.map((x) => f(x, d)).join(", ")})`;
const sgn = (y) => (y > 0 ? "+1" : "−1");
const put = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false && k !== ""));
const lab = (y) => (y > 0 ? h("span", { class: "pos" }, "+") : h("span", { class: "neg" }, "−"));

function parsePts(text, dims = 2) {
  const rows = parseRows(text);
  return rows.map((r, i) => {
    const x = r.slice(0, dims).map(Number);
    if (x.some((v) => !Number.isFinite(v))) throw new Error(`${i + 1}. satır: sayı bekleniyordu`);
    const l = (r[dims] ?? "").toLowerCase();
    const y = ["+", "+1", "1", "evet", "e"].includes(l) ? 1 : ["-", "−", "-1", "−1", "0", "hayır", "h"].includes(l) ? -1 : NaN;
    if (Number.isNaN(y)) throw new Error(`${i + 1}. satır: etiket + ya da − olmalı`);
    return { x, y, name: r[dims + 1] || String.fromCharCode(65 + i) };
  });
}
function box(pts, pad, extra = []) {
  const xs = [...pts.map((p) => p.x[0]), ...extra.map((e) => e[0])], ys = [...pts.map((p) => p.x[1]), ...extra.map((e) => e[1])];
  const a = Math.min(...xs, 0), b = Math.max(...xs, 1), c = Math.min(...ys, 0), d = Math.max(...ys, 1);
  const sx = (b - a) * pad, sy = (d - c) * pad;
  return { xlim: [a - sx, b + sx], ylim: [c - sy, d + sy] };
}
/** segmented control: [["+", "+ ekle"], …] */
function seg(options, value, onchange) {
  let cur = value;
  const btns = options.map(([v, t]) => {
    const b = h("button", { type: "button", "aria-pressed": String(v === cur) }, t);
    b.addEventListener("click", () => { cur = v; for (const x of btns) x.setAttribute("aria-pressed", String(x === b)); onchange?.(v); });
    return b;
  });
  return { el: h("span", { class: "seg-ctl", role: "group" }, btns), get: () => cur };
}
function slider(label, min, max, step, value, oninput, fmtv = (v) => f(v, 2)) {
  const r = h("input", { type: "range", min, max, step, value });
  const o = h("output", {}, fmtv(Number(value)));
  r.addEventListener("input", () => { o.textContent = fmtv(Number(r.value)); oninput?.(); });
  return { el: h("label", { class: "slider-row" }, h("span", {}, label), r, o), get: () => Number(r.value), set: (v) => { r.value = v; o.textContent = fmtv(Number(v)); } };
}
/** textarea in a <details>, kept in sync with the canvas */
function dataBox(text, onEdit) {
  const t = area(text, 6);
  t.addEventListener("input", () => onEdit(t.value));
  return { el: h("details", { class: "data-box" }, h("summary", { class: "small" }, "Veriyi metin olarak gör / düzenle"), t), set: (v) => { if (document.activeElement !== t) t.value = v; } };
}

// ======================================================================= kNN
export function knn(ds) {
  const { el, body } = frame("kNN: sorguyu sürükle, k'yı değiştir, kararın nasıl oluştuğunu izle");
  let start;
  try { start = parsePts(ds.pts || "1 2 + A\n2 1 + B\n2 3 + C\n3 2 + D\n4 4 - E\n6 4 - F\n7 1 - G\n7 6 - H"); } catch (e) { return errorBox(e.message); }
  const q0 = [Number(ds.qx ?? 4), Number(ds.qy ?? 3)];
  const mode = seg([["q", "◆ sorguyu taşı"], ["+", "● + ekle"], ["-", "■ − ekle"]], "q");
  const k = slider("k (komşu)", 1, 9, 1, Number(ds.k ?? 3), () => render(), (v) => String(v));
  const metric = seg([["euclid2", "Öklid"], ["manhattan", "Manhattan"]], "euclid2", () => render());
  const out = h("div", { class: "out" });
  const B = box(start, 0.15, [q0]);
  const ed = pointEditor({ ...B, points: start, query: q0, getMode: mode.get, onChange: () => { data.set(pointsToText(ed.points)); render(); },
    hint: "◆ sorguyu sürükle · boş yere tıkla (seçili mod) · noktayı sürükle: taşı · noktaya tıkla: sil",
    layers: (api, e) => {
      if (!e.points.length) return "";
      const r = ml.knnRank(e.points, e.query, metric.get());
      const K = Math.min(k.get(), r.length);
      let s = r.slice(0, K).map((p) => api.seg(e.query, p.x, "nb")).join("");
      if (metric.get() === "euclid2") s += api.circle(e.query, Math.sqrt(r[K - 1].d));
      return s;
    },
    decorate: (e) => {
      if (!e.points.length) return {};
      const r = ml.knnRank(e.points, e.query, metric.get());
      const K = Math.min(k.get(), r.length), d = {};
      r.forEach((p, i) => { d[p.name] = i < K ? { ring: "sv", note: `#${i + 1}` } : { dim: true }; });
      return d;
    } });
  const data = dataBox(pointsToText(start), (v) => { try { ed.set(parsePts(v)); render(); } catch { /* keep typing */ } });
  function render() {
    ed.redraw();
    const pts = ed.points, q = ed.query;
    if (!pts.length) { put(out, h("p", {}, "Grafiğe birkaç nokta ekleyin.")); return; }
    const M = metric.get();
    const r = ml.knnRank(pts, q, M);
    const K = Math.min(k.get(), r.length);
    const v = ml.knnVote(r, K);
    const nPos = r.slice(0, K).filter((p) => p.y > 0).length, nNeg = K - nPos;
    const calc = (p) => (M === "euclid2" ? `(${f(p.x[0])}−${f(q[0])})² + (${f(p.x[1])}−${f(q[1])})² = ${f(p.d)}` : `|${f(p.x[0])}−${f(q[0])}| + |${f(p.x[1])}−${f(q[1])}| = ${f(p.d)}`);
    const decision = v.tie ? "beraberlik (k'yı tek seçin ya da kural koyun)" : v.label > 0 ? "+" : "−";
    const byK = [1, 2, 3, 4, 5, 6, 7].filter((kk) => kk <= r.length).map((kk) => { const vv = ml.knnVote(r, kk); return [kk, vv.tie ? "=" : vv.label > 0 ? "+" : "−"]; });
    put(out,
      h("div", { class: "narrate" }, h("b", {}, `k = ${K}: `), `q = (${f(q[0])}, ${f(q[1])}) noktasına en yakın ${K} komşu `,
        r.slice(0, K).map((p) => `${p.name}(${p.y > 0 ? "+" : "−"})`).join(", "), ` → ${nPos} artı, ${nNeg} eksi → karar `, h("b", {}, decision), ".",
        v.boundaryTie ? h("span", { class: "bad" }, ` Dikkat: ${K}. ve ${K + 1}. komşu aynı uzaklıkta; hangisinin sayılacağı bir kurala bağlı.`) : null),
      h("div", { class: "vote-bar", "aria-hidden": "true" }, nPos ? h("div", { class: "vp", style: { flex: nPos } }, `+ ${nPos}`) : null, nNeg ? h("div", { class: "vn", style: { flex: nNeg } }, `− ${nNeg}`) : null),
      table(["sıra", "nokta", M === "euclid2" ? "d² hesabı (karekök gerekmez)" : "L1 hesabı", "sınıf"], r.map((p, i) => ({ row: [i + 1, p.name, calc(p), lab(p.y)], cls: i < K ? "hl" : "" })), { cls: "compact" }),
      h("p", { class: "small" }, "Aynı sorgu için k'ya göre karar: ", byK.map(([kk, d]) => `k=${kk}: ${d}`).join(" · "), ". k büyüdükçe karar daha uzak komşulara bağlanır."));
  }
  body.append(h("div", { class: "controls" }, mode.el, metric.el), k.el, h("div", { class: "two-col" }, ed.el, out), data.el);
  render();
  return el;
}

// ======================================================================= hard-margin SVM
export function hardsvm(ds) {
  const { el, body } = frame("SVM: noktaları sürükle, en geniş sokağın nasıl değiştiğini izle");
  let start;
  try { start = parsePts(ds.pts || "2 2 + A\n3 1 + B\n0 0 - C\n1 0 - D"); } catch (e) { return errorBox(e.message); }
  const mode = seg([["+", "● + ekle"], ["-", "■ − ekle"]], "+");
  const out = h("div", { class: "out" });
  const B = box(start, 0.35);
  let sol = null;
  const ed = pointEditor({ ...B, points: start, getMode: mode.get, onChange: () => { data.set(pointsToText(ed.points)); render(); },
    layers: (api) => sol ? api.halves(sol.w, sol.b) + api.line(sol.w, sol.b - 1, "line dash") + api.line(sol.w, sol.b + 1, "line dash") + api.line(sol.w, sol.b) : "",
    decorate: () => { const d = {}; if (sol) for (const p of sol.sv) d[p.name] = { ring: "sv", note: "DV" }; return d; } });
  const data = dataBox(pointsToText(start), (v) => { try { ed.set(parsePts(v)); render(); } catch { /* keep typing */ } });
  function render() {
    const pts = ed.points;
    sol = pts.some((p) => p.y > 0) && pts.some((p) => p.y < 0) ? ml.hardMarginSVM(pts) : null;
    ed.redraw();
    if (!pts.some((p) => p.y > 0) || !pts.some((p) => p.y < 0)) { put(out, h("p", {}, "İki sınıftan da en az bir nokta ekleyin.")); return; }
    if (!sol) { put(out, h("div", { class: "narrate" }, h("b", { class: "bad" }, "Tek bir doğruyla ayrılamıyor. "), "Sert marjlı SVM'nin çözümü yok; ya yumuşak marj (birkaç ihlale izin ver) ya da çekirdek gerekir. Bir noktayı sürükleyip sınıfları ayırın.")); return; }
    const al = ml.svmAlphas(sol.w, sol.sv);
    put(out,
      h("div", { class: "narrate" }, "Sokağın kenarına değen ", h("b", {}, `${sol.sv.length} nokta`), ` (${sol.sv.map((p) => p.name).join(", ")}) destek vektörü. Sınırın yerini yalnız onlar belirler: diğer noktaları sürükleyin, sokağa girmedikçe hiçbir şey değişmez. Bir destek vektörünü sürükleyince sokak hemen değişir.`),
      h("p", {}, "Kanonik denklemler (destek vektörlerinde w·x + b = ±1):"),
      h("ul", { class: "steps" }, sol.sv.map((p) => h("li", {}, `${p.name}: ${f(p.x[0])}·w₁ + ${f(p.x[1])}·w₂ + b = ${sgn(p.y)}`))),
      h("p", {}, "Çözüm: w = ", h("b", {}, vec(sol.w)), ", b = ", h("b", {}, f(sol.b)), ` · ‖w‖ = ${f(sol.norm)} · marj 1/‖w‖ = `, h("b", {}, f(sol.margin))),
      al && al.every((a) => a > -1e-9) ? h("p", { class: "small" }, "İkil katsayılar: ", sol.sv.map((p, i) => `α_${p.name} = ${f(al[i])}`).join(", "), " (diğer noktalarda α = 0).") : null,
      table(["nokta", "y", "f(x) = w·x + b", "y·f(x)", "durum"], pts.map((p) => { const fx = ml.dot(sol.w, p.x) + sol.b; const sv = sol.sv.includes(p); return { row: [p.name, sgn(p.y), f(fx), f(p.y * fx), sv ? "destek vektörü (= 1)" : "sokağın dışında (> 1)"], cls: sv ? "hl" : "" }; }), { cls: "compact" }));
  }
  body.append(h("div", { class: "controls" }, mode.el), h("div", { class: "two-col" }, ed.el, out), data.el);
  render();
  return el;
}

// ======================================================================= perceptron stepper
export function perceptron(ds) {
  const { el, body } = frame("Perceptron adım adım: her örnekte ne oluyor, doğru neden dönüyor?");
  const text0 = ds.pts || "2 3 +\n1 1 -\n3 2 +\n0 2 -\n3 4 +\n2 0 -\n1 3 +";
  const rows = parseRows(text0);
  const li = rows.length ? rows[0].findIndex((tk) => ["+", "-", "−", "+1", "-1"].includes(tk)) : -1;
  const dims = li > 0 ? li : 2;
  let start;
  try { start = parsePts(text0, dims).map((p, i) => ({ ...p, name: String(i + 1) })); } catch (e) { return errorBox(e.message); }
  const wIn = h("input", { type: "text", value: ds.w || "-0.5 0.5", style: { width: "6.5rem" } });
  const bIn = h("input", { type: "number", step: "any", value: ds.b ?? -0.7, style: { width: "4.5rem" } });
  const eIn = h("input", { type: "number", step: "any", value: ds.eta ?? 0.4, style: { width: "4.5rem" } });
  const epIn = h("input", { type: "number", step: 1, min: 1, value: ds.epochs ?? 3, style: { width: "3.8rem" } });
  const narr = h("div", { class: "narrate", "aria-live": "polite" });
  const out = h("div", { class: "out" });
  const count = h("span", { class: "count" });
  let steps = [], t = 0, timer = 0, result = null;
  const two = dims === 2;
  const B = two ? box(start, 0.25) : null;
  const ed = two ? pointEditor({ ...B, points: start, getMode: () => mode.get(), onChange: () => { data.set(pointsToText(ed.points)); t = 0; recompute(); },
    layers: (api) => {
      const cur = state();
      let s = "";
      if (cur.prev && cur.changed) s += api.line(cur.prev.w, cur.prev.b, "line ghost");
      s += api.halves(cur.w, cur.b) + api.line(cur.w, cur.b);
      return s;
    },
    decorate: (e) => {
      const cur = state(), d = {};
      for (const p of e.points) { const z = ml.dot(cur.w, p.x) + cur.b; if ((z >= 0 ? 1 : -1) !== p.y) d[p.name] = { cross: true }; }
      if (cur.step) d[cur.step.name] = { ...(d[cur.step.name] || {}), ring: "cur" };
      return d;
    } }) : null;
  const mode = seg([["+", "● + ekle"], ["-", "■ − ekle"]], "+");
  const data = dataBox(two ? pointsToText(start) : text0, (v) => { try { const p = parsePts(v, dims).map((q, i) => ({ ...q, name: q.name || String(i + 1) })); if (ed) ed.set(p); else start = p; recompute(); } catch { /* typing */ } });
  const pts = () => (ed ? ed.points : start);
  function recompute() {
    stop();
    const W0 = wIn.value.trim().split(/[\s,;]+/).map(Number), b0 = Number(bIn.value), eta = Number(eIn.value);
    if (W0.length !== dims || W0.some((v) => !Number.isFinite(v))) { put(out, errorBox(`w ${dims} sayı olmalı.`)); return; }
    const P = pts();
    result = ml.perceptron(P, W0, b0, eta, { epochs: Math.min(30, Math.max(1, Number(epIn.value) || 1)) });
    steps = [{ w: W0, b: b0 }];
    result.passes.forEach((pass) => pass.steps.forEach((s) => steps.push({ w: s.w, b: s.b, step: { ...s, name: P[s.i].name, epoch: pass.epoch }, eta })));
    t = Math.min(t, steps.length - 1);
    show();
  }
  function state() {
    const s = steps[t] || { w: [0, 0], b: 0 };
    const prev = t > 0 ? steps[t - 1] : null;
    return { ...s, prev, changed: !!(s.step && s.step.wrong) };
  }
  function show() {
    const cur = state();
    count.textContent = `adım ${t} / ${steps.length - 1}`;
    if (ed) ed.redraw();
    if (!cur.step) {
      put(narr, h("b", {}, "Başlangıç. "), `w = ${vec(cur.w)}, b = ${f(cur.b)}. Çizgi bu ağırlıkların sınırı; renkli bölge modelin + dediği taraf. Çarpı işaretli noktalar şu an yanlış sınıflanıyor. ▶ ile ilk örneğe geçin.`);
    } else {
      const s = cur.step, x = s.x, p = cur.prev;
      const term = (c, k) => `${c < 0 ? (k ? " − " : "−") : k ? " + " : ""}${f(Math.abs(c))}`;
      const zTxt = `${x.map((xi, j) => `${term(p.w[j], j)}·${f(xi)}`).join("")}${term(p.b, 1)} = ${f(s.z)}`;
      const head = h("b", {}, `${s.epoch}. epoch, örnek ${s.name}: `);
      if (!s.wrong) put(narr, head, `z = ${zTxt} → ŷ = ${sgn(s.pred)} (z ≥ 0 ise +1). Gerçek y = ${sgn(s.y)}: `, h("b", { class: "good" }, "doğru, hiçbir şey değişmez."));
      else put(narr, head, `z = ${zTxt} → ŷ = ${sgn(s.pred)}, ama gerçek y = ${sgn(s.y)}: `, h("b", { class: "bad" }, "yanlış!"), " ",
        s.y > 0 ? "Pozitif örnek eksi tarafta kalmış: ağırlıklara η·x eklenir, sınır örneği + tarafa alacak yönde döner. " : "Negatif örnek artı tarafta kalmış: ağırlıklardan η·x çıkarılır, sınır örneği − tarafa itecek yönde döner. ",
        `w ← ${vec(p.w)} ${s.y > 0 ? "+" : "−"} ${f(cur.eta)}·${vec(x)} = `, h("b", {}, vec(cur.w)), `; b ← ${f(p.b)} ${s.y > 0 ? "+" : "−"} ${f(cur.eta)} = `, h("b", {}, f(cur.b)), ". Kesikli gri çizgi eski sınır.");
    }
    const ev = result ? result.evalRows : [];
    const wrongNow = pts().filter((q) => ((ml.dot(cur.w, q.x) + cur.b) >= 0 ? 1 : -1) !== q.y).length;
    put(out,
      h("p", { class: "small" }, `Şu anki ağırlıklarla ${pts().length} örnekten ${wrongNow} tanesi yanlış. `, result?.converged ? `Algoritma ${result.passes.length}. epoch'ta hatasız bir tur yaptı ve durdu.` : `${result?.passes.length} epoch sonunda hâlâ hata var (veri ayrılabilir değilse hiç bitmez).`),
      h("details", {}, h("summary", { class: "small" }, "Bütün adımların sınav tablosu"),
        result ? result.passes.map((pass) => [h("h4", {}, `${pass.epoch}. epoch (${pass.mistakes} güncelleme)`), table(["#", "x", "y", "z", "ŷ", "hata?", "yeni w", "yeni b"], pass.steps.map((s) => ({ row: [pts()[s.i].name, vec(s.x, 2), sgn(s.y), f(s.z), sgn(s.pred), s.wrong ? "evet" : "hayır", vec(s.w), f(s.b)], cls: s.wrong ? "hl" : "" })), { cls: "compact" })]) : null),
      ev.length && result.passes.length ? (() => { const c = ml.confusion(ev.map((e) => e.y), ev.map((e) => e.pred)); return h("p", { class: "small" }, `Son ağırlıklarla: TP ${c.TP}, FN ${c.FN}, FP ${c.FP}, TN ${c.TN}; accuracy ${f(ml.metrics(c).accuracy)}.`); })() : null);
  }
  const go = (d) => { t = Math.max(0, Math.min(steps.length - 1, t + d)); show(); };
  function stop() { clearInterval(timer); timer = 0; playBtn.textContent = "▶▶ Oynat"; }
  const playBtn = h("button", { type: "button", class: "btn small" }, "▶▶ Oynat");
  playBtn.addEventListener("click", () => {
    if (timer) { stop(); return; }
    if (t >= steps.length - 1) t = 0;
    playBtn.textContent = "❚❚ Durdur";
    timer = setInterval(() => { if (t >= steps.length - 1) stop(); else go(1); }, 1100);
  });
  const bar = h("div", { class: "stepbar" },
    h("button", { type: "button", class: "btn small", onclick: () => { stop(); t = 0; show(); } }, "⏮ Baştan"),
    h("button", { type: "button", class: "btn small", onclick: () => { stop(); go(-1); } }, "◀ Geri"),
    h("button", { type: "button", class: "btn small primary", onclick: () => { stop(); go(1); } }, "İleri ▶"),
    playBtn,
    h("button", { type: "button", class: "btn small", onclick: () => { stop(); t = steps.length - 1; show(); } }, "Sona ⏭"), count);
  for (const i of [wIn, bIn, eIn, epIn]) i.addEventListener("input", () => { t = 0; recompute(); });
  body.append(h("div", { class: "controls" }, h("label", {}, "w ", wIn), h("label", {}, "b ", bIn), h("label", {}, "η ", eIn), h("label", {}, "en çok epoch ", epIn), two ? mode.el : null),
    bar, narr, two ? h("div", { class: "two-col" }, ed.el, out) : out, data.el);
  recompute();
  return el;
}

// ======================================================================= line game: find w, b by hand
export function lineplay(ds) {
  const { el, body } = frame("Doğruyu elle ayarla: w₁, w₂, b ne yapıyor?", "Keşfet");
  let start;
  try { start = parsePts(ds.pts || "1 3 + A\n2 4 + B\n3 3.5 + C\n2 1 - D\n3 1.5 - E\n4 2 - F"); } catch (e) { return errorBox(e.message); }
  const w1 = slider("w₁", -3, 3, 0.1, ds.w1 ?? 0.5, () => render()), w2 = slider("w₂", -3, 3, 0.1, ds.w2 ?? 1, () => render()), b = slider("b", -8, 8, 0.1, ds.b ?? -2, () => render());
  const mode = seg([["+", "● + ekle"], ["-", "■ − ekle"]], "+");
  const goal = h("div", { class: "goal" });
  const out = h("div", { class: "out" });
  const W = () => [w1.get(), w2.get()];
  const ed = pointEditor({ ...box(start, 0.3), points: start, getMode: mode.get, onChange: () => render(),
    layers: (api) => {
      const w = W(), B0 = b.get();
      if (Math.hypot(...w) < 1e-9) return "";
      // arrow of w from the point of the line nearest the centre of the view
      const c = [(api.x0 + api.x1) / 2, (api.y0 + api.y1) / 2];
      const t0 = -(ml.dot(w, c) + B0) / ml.dot(w, w);
      const p = [c[0] + t0 * w[0], c[1] + t0 * w[1]];
      const n = Math.hypot(...w), L = (api.x1 - api.x0) / 8;
      const q = [p[0] + (w[0] / n) * L, p[1] + (w[1] / n) * L];
      return api.halves(w, B0) + api.line(w, B0) + `<line x1="${api.X(p[0])}" y1="${api.Y(p[1])}" x2="${api.X(q[0])}" y2="${api.Y(q[1])}" class="warrow"/>` + api.text(q, " w");
    },
    decorate: (e) => { const d = {}; for (const p of e.points) { const z = ml.dot(W(), p.x) + b.get(); d[p.name] = { cross: (z >= 0 ? 1 : -1) !== p.y, note: `z=${f(z, 1)}` }; } return d; } });
  function render() {
    ed.redraw();
    const w = W(), B0 = b.get(), n = Math.hypot(...w);
    const wrong = ed.points.filter((p) => ((ml.dot(w, p.x) + B0) >= 0 ? 1 : -1) !== p.y);
    goal.className = "goal" + (wrong.length ? "" : " done");
    goal.textContent = wrong.length ? `Görev: bütün noktaları doğru tarafa al. Şu an ${wrong.length} yanlış (çarpılı): ${wrong.map((p) => p.name).join(", ")}.` : "✓ Bütün noktalar doğru tarafta! Şimdi aynı oranla w₁, w₂, b'yi iki katına çıkarın: sınır hiç kıpırdamaz.";
    const eq = Math.abs(w[1]) > 1e-9 ? `x₂ = ${f(-w[0] / w[1])}·x₁ + ${f(-B0 / w[1])}` : Math.abs(w[0]) > 1e-9 ? `x₁ = ${f(-B0 / w[0])}` : "—";
    put(out, h("div", { class: "narrate" }, `Sınır: ${f(w[0])}x₁ + ${f(w[1])}x₂ + ${f(B0)} = 0  ⇔  ${eq}`),
      h("ul", { class: "steps small" },
        h("li", {}, h("b", {}, "b"), " sınırı kendine paralel kaydırır (eğimi değişmez)."),
        h("li", {}, h("b", {}, "w₁, w₂"), " sınırı döndürür; ok (w) sınıra diktir ve + tarafı gösterir."),
        h("li", {}, "Her noktanın yanındaki z = w·x + b: işareti tarafı, |z|/‖w‖ sınıra uzaklığı verir", n > 0 ? ` (‖w‖ = ${f(n)}).` : ".")),
      table(["nokta", "y", "z = w·x + b", "ŷ", "uzaklık"], ed.points.map((p) => { const z = ml.dot(w, p.x) + B0; const ok = (z >= 0 ? 1 : -1) === p.y; return { row: [p.name, sgn(p.y), f(z), sgn(z >= 0 ? 1 : -1), n ? f(Math.abs(z) / n) : "–"], cls: ok ? "" : "hl" }; }), { cls: "compact" }));
  }
  body.append(goal, h("div", { class: "two-col" }, h("div", {}, w1.el, w2.el, b.el, h("div", { class: "controls" }, mode.el), ed.el), out));
  render();
  return el;
}

// ======================================================================= sigmoid and log-loss explorer
export function sigplay() {
  const { el, body } = frame("Sigmoid ve log-loss: skor değişince olasılık ve kayıp ne yapar?", "Keşfet");
  const z = slider("skor z", -6, 6, 0.1, 1, () => render());
  const out = h("div", { class: "out" });
  function render() {
    const Z = z.get(), p = ml.sigmoid(Z);
    const zs = Array.from({ length: 121 }, (_, i) => -6 + i * 0.1);
    put(out, h("div", { class: "two-col" },
      lines({ series: [{ pts: zs.map((v) => [v, ml.sigmoid(v)]), cls: "curve1", name: "σ(z)", color: "pos" }, { pts: [[Z, 0], [Z, p]], cls: "curve3", dots: true, name: "şu anki z", color: "s3" }], xlim: [-6, 6], ylim: [0, 1], xstep: 2, ystep: 0.25, xlabel: "z" }),
      h("div", {},
        h("p", {}, `p = σ(${f(Z, 1)}) = 1/(1 + e^${f(-Z, 1)}) = `, h("b", {}, f(p))),
        h("p", {}, "Gerçek y = 1 ise kayıp −ln p = ", h("b", {}, f(-Math.log(p)))),
        h("p", {}, "Gerçek y = 0 ise kayıp −ln(1 − p) = ", h("b", {}, f(-Math.log(1 - p)))),
        h("div", { class: "vote-bar" }, h("div", { class: "vp", style: { flex: p } }, p > 0.12 ? `P(1) ${f(p, 2)}` : ""), h("div", { class: "vn", style: { flex: 1 - p } }, 1 - p > 0.12 ? `P(0) ${f(1 - p, 2)}` : "")),
        h("p", { class: "small muted" }, "z'yi 5'e çekin ve y = 0 kaybına bakın: emin olup yanılmak çok pahalı. z = 0'da p = 0.5, iki kayıp da ln 2 = 0.693."))));
  }
  body.append(z.el, out);
  render();
  return el;
}

// ======================================================================= entropy explorer
export function entplay() {
  const { el, body } = frame("Entropi: bir düğüm ne kadar karışık?", "Keşfet");
  const a = slider("Evet sayısı", 0, 12, 1, 3, () => render(), (v) => String(v)), b = slider("Hayır sayısı", 0, 12, 1, 1, () => render(), (v) => String(v));
  const out = h("div", { class: "out" });
  function render() {
    const A = a.get(), Bn = b.get(), n = A + Bn;
    if (!n) { put(out, h("p", {}, "Düğüm boş.")); return; }
    const p = A / n, H = ml.entropy([A, Bn]), G = ml.gini([A, Bn]);
    const term = (k) => (k ? `${k}/${n}·log₂(${n}/${k}) = ${f((k / n) * -ml.log2(k / n))}` : "0 (0·log 0 = 0)");
    put(out, h("div", { class: "two-col" },
      lines({ series: [{ pts: Array.from({ length: 101 }, (_, i) => [i / 100, ml.entropy([i, 100 - i])]), cls: "curve1", name: "H(p)", color: "pos" }, { pts: [[p, 0], [p, H]], cls: "curve3", dots: true, name: "bu düğüm", color: "s3" }], xlim: [0, 1], ylim: [0, 1.05], xstep: 0.25, ystep: 0.25, xlabel: "p = Evet oranı" }),
      h("div", {},
        h("div", { class: "vote-bar" }, A ? h("div", { class: "vp", style: { flex: A } }, `Evet ${A}`) : null, Bn ? h("div", { class: "vn", style: { flex: Bn } }, `Hayır ${Bn}`) : null),
        h("p", {}, "H = ", term(A), " + ", term(Bn), " = ", h("b", {}, f(H)), " bit"),
        h("p", {}, "Gini = 1 − (", `${A}/${n})² − (${Bn}/${n})² = `, h("b", {}, f(G))),
        h("p", { class: "small" }, H === 0 ? "Saf düğüm: belirsizlik yok, burası yaprak olur." : Math.abs(p - 0.5) < 1e-9 ? "Yarı yarıya: en belirsiz durum (1 bit)." : "Karışık düğüm: bölmeye devam etmek kazanç getirebilir."))));
  }
  body.append(a.el, b.el, out);
  render();
  return el;
}

// ======================================================================= gradient descent animation
export function gdplay() {
  const { el, body } = frame("Gradyan inişi: öğrenme oranını değiştir, adımları izle", "Keşfet");
  const eta = slider("η (öğrenme oranı)", 0.02, 1.1, 0.02, 0.2, () => reset()), w0 = slider("başlangıç w", -1, 5, 0.1, -0.5, () => reset());
  const L = (w) => (w - 2) ** 2 + 0.5, dL = (w) => 2 * (w - 2);
  const out = h("div", { class: "out" });
  let path = [];
  const reset = () => { path = [w0.get()]; render(); };
  const step = () => { const w = path.at(-1); path.push(w - eta.get() * dL(w)); render(); };
  function render() {
    const w = path.at(-1), e = eta.get();
    const fate = e < 0.5 ? "her adım minimuma biraz yaklaşır (küçük η: yavaş ama emin)" : e < 1 ? "minimumun iki yanına sıçrayarak yaklaşır" : e === 1 ? "iki nokta arasında sonsuza kadar gidip gelir" : "her adım minimumdan daha uzağa düşer: ıraksar";
    const ws = Array.from({ length: 121 }, (_, i) => -1.5 + i * 0.05);
    const clipped = path.map((v) => [Math.max(-1.5, Math.min(5.5, v)), Math.min(L(v), 13)]);
    put(out, h("div", { class: "two-col" },
      lines({ series: [{ pts: ws.map((v) => [v, L(v)]), cls: "curve3", name: "L(w) = (w − 2)² + 0.5", color: "s3" }, { pts: clipped, cls: "curve2", dots: true, name: "adımlar", color: "neg" }], xlim: [-1.5, 5.5], ylim: [0, 13], xstep: 1, ystep: 2, xlabel: "w" }),
      h("div", {},
        h("div", { class: "narrate" }, `${path.length - 1}. adım: w = ${f(w)}, L = ${f(L(w))}. Eğim L′(w) = 2(w − 2) = ${f(dL(w))} → sonraki w = w − η·L′ = ${f(w)} − ${f(e, 2)}·${f(dL(w))} = `, h("b", {}, f(w - e * dL(w)))),
        h("p", { class: "small" }, `Bu η ile: ${fate}. (Bu eğride sınır η = 1.)`),
        table(["adım", "w", "L(w)"], path.slice(-6).map((v, i) => [path.length - Math.min(6, path.length) + i, f(v), f(L(v))]), { cls: "compact" }))));
  }
  body.append(eta.el, w0.el, h("div", { class: "stepbar" }, h("button", { type: "button", class: "btn small primary", onclick: step }, "Bir adım ▶"), h("button", { type: "button", class: "btn small", onclick: () => { for (let i = 0; i < 10; i++) step(); } }, "10 adım"), h("button", { type: "button", class: "btn small", onclick: reset }, "Sıfırla")), out);
  reset();
  return el;
}
