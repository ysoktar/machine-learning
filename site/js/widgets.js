// Interactive widgets. A page places <div data-widget="name" data-…></div>; mountAll() replaces each one.
// Every number shown here comes from lib/ml.js, which is unit-tested against the course's worked examples.
import { h, $, $$, table, frame, num, select, checkbox, button, area, parseNums, parseRows, errorBox, store, parseBits, parsePosNeg, parseLabels, readNumber } from "./lib/ui.js";
import * as ml from "./lib/ml.js";
import { scatter, lines } from "./lib/plot.js";
import { figure } from "./figures.js";
import * as I from "./interactive.js";
import { GUIDE } from "./guides.js";

const f = ml.fmt;
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹", SUB = "₀₁₂₃₄₅₆₇₈₉";
const sup = (n) => String(n).replace(/\d/g, (d) => SUP[d]).replace("-", "⁻");
const pm = (v) => `${v < 0 ? "−" : "+"} ${f(Math.abs(v))}`;   // "+ 2" / "− 2" instead of "+ −2"
const par = (v) => (v < 0 ? `(${f(v)})` : f(v));
const sub = (n) => String(n).replace(/\d/g, (d) => SUB[d]);

const f2 = (x) => ml.fmt(x, 2);
const tag = (t) => h("span", { class: "tag " + t }, t);
const signTxt = (y) => (y > 0 ? "+1" : "−1");
/** "a·x₁ + b·x₂ + c" with proper signs. */
const lin = (w, b) => { const t = w.map((c, i) => [c, `x${"₁₂₃₄"[i]}`]).filter(([c]) => Math.abs(c) > 1e-12).map(([c, x], k) => `${c < 0 ? (k ? " − " : "−") : k ? " + " : ""}${Math.abs(Math.abs(c) - 1) < 1e-12 ? "" : f(Math.abs(c))}${x}`).join(""); return `${t}${b < 0 ? " − " : " + "}${f(Math.abs(b))}`; };
const vec = (v, d = 3) => `(${v.map((x) => f(x, d)).join(", ")})`;
const W = {};
W.fig = (ds) => figure(ds);

export function mountAll(root) {
  for (const el of $$("[data-widget]", root)) {
    const make = W[el.dataset.widget];
    if (!make) { el.replaceWith(errorBox(`Bilinmeyen araç: ${el.dataset.widget}`)); continue; }
    try {
      const made = make(el.dataset, el);
      const g = GUIDE[el.dataset.widget];
      const bodyEl = made.querySelector?.(":scope > .widget-body");
      if (g && bodyEl && el.dataset.guide !== "off") {
        const inSolution = !!el.closest("details.solution");
        bodyEl.prepend(h("details", { class: "guide", open: !inSolution },
          h("summary", {}, h("span", { class: "ic ic-guide", "aria-hidden": "true" }), "Bu araç ne gösteriyor, nasıl kullanılır?"),
          h("p", {}, g.what),
          g.tryit?.length ? [h("p", {}, h("b", {}, "Şunu dene:")), h("ol", {}, g.tryit.map((t) => h("li", {}, t)))] : null,
          g.see ? h("p", { class: "see" }, h("b", {}, "Ne görmelisin? "), g.see) : null));
      }
      el.replaceWith(made);
    } catch (e) { console.error(e); el.replaceWith(errorBox("Araç yüklenemedi: " + e.message)); }
  }
}

/** Re-run `render` whenever any input inside `body` changes. */
function live(body, render) {
  const run = () => { try { render(); } catch (e) { console.error(e); } };
  body.addEventListener("input", (e) => { if (!e.target.closest(".out")) run(); });
  body.addEventListener("change", (e) => { if (!e.target.closest(".out")) run(); });
  queueMicrotask(run);
  return run;
}
/** replaceChildren that skips null/false (conditional parts). */
const put = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false && k !== ""));
const outBox = () => h("div", { class: "out", "aria-live": "polite" });
function cmTable({ TP, FP, FN, TN }) {
  return h("table", { class: "cm" },
    h("tr", {}, h("th", {}), h("th", {}, "Tahmin +"), h("th", {}, "Tahmin −")),
    h("tr", {}, h("th", {}, "Gerçek +"), h("td", { class: "d" }, `TP = ${TP}`), h("td", { class: "o" }, `FN = ${FN}`)),
    h("tr", {}, h("th", {}, "Gerçek −"), h("td", { class: "o" }, `FP = ${FP}`), h("td", { class: "d" }, `TN = ${TN}`)));
}
function metricRows(m, c) {
  return table(["Ölçüt", "Formül", "Hesap", "Değer"], [
    ["Accuracy", "(TP+TN)/n", `(${c.TP}+${c.TN})/${m.n}`, { v: f(m.accuracy), cls: "num" }],
    ["Precision", "TP/(TP+FP)", `${c.TP}/(${c.TP}+${c.FP})`, { v: f(m.precision), cls: "num" }],
    ["Recall (TPR)", "TP/(TP+FN)", `${c.TP}/(${c.TP}+${c.FN})`, { v: f(m.recall), cls: "num" }],
    ["Specificity", "TN/(TN+FP)", `${c.TN}/(${c.TN}+${c.FP})`, { v: f(m.specificity), cls: "num" }],
    ["F1", "2TP/(2TP+FP+FN)", `${2 * c.TP}/(${2 * c.TP}+${c.FP}+${c.FN})`, { v: f(m.f1), cls: "num" }],
    ["FPR", "FP/(FP+TN)", `${c.FP}/(${c.FP}+${c.TN})`, { v: f(m.fpr), cls: "num" }],
  ]);
}
/** "x1 x2 label [name]" lines -> points with y in {+1,-1} (accepts + - 1 -1 evet hayır). */
function parsePoints(text, { dims = 2, named = true } = {}) {
  const rows = parseRows(text);
  return rows.map((r, i) => {
    const x = r.slice(0, dims).map(Number);
    if (x.some((v) => !Number.isFinite(v))) throw new Error(`${i + 1}. satır: sayı bekleniyordu`);
    const lab = (r[dims] ?? "").toLowerCase();
    const y = ["+", "+1", "1", "evet", "e", "yes", "pos"].includes(lab) ? 1 : ["-", "−", "-1", "−1", "0", "hayır", "h", "no", "neg"].includes(lab) ? -1 : NaN;
    if (Number.isNaN(y)) throw new Error(`${i + 1}. satır: etiket + ya da − olmalı`);
    return { x, y, name: named ? r[dims + 1] || (rows.length <= 26 ? String.fromCharCode(65 + i) : "p" + (i + 1)) : undefined };
  });
}
const bounds = (pts, pad = 0.15, extra = []) => {
  const xs = [...pts.map((p) => p.x[0]), ...extra.map((e) => e[0])], ys = [...pts.map((p) => p.x[1]), ...extra.map((e) => e[1])];
  let [a, b] = [Math.min(...xs), Math.max(...xs)], [c, d] = [Math.min(...ys), Math.max(...ys)];
  const sx = (b - a || 1) * pad, sy = (d - c || 1) * pad;
  return { xlim: [a - sx, b + sx], ylim: [c - sy, d + sy] };
};

// ======================================================================= week 1
W.hypspace = () => {
  const { el, body } = frame("Hipotez uzayını say: VE'li kısıtlar (EnjoySport dili)");
  const inp = h("input", { type: "text", value: "3 2 2 2 2 2", style: { width: "14rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "Her özniteliğin değer sayısı: ", inp)), h("p", { class: "field-hint" }, "Boşlukla ayırın. EnjoySport: Gökyüzü 3, diğer beş öznitelik 2 değerli."), out);
  live(body, () => {
    const v = parseNums(inp.value).filter((x) => x >= 1);
    if (!v.length) { put(out, errorBox("En az bir sayı girin.")); return; }
    const inst = v.reduce((a, b) => a * b, 1);
    const sem = 1 + v.reduce((a, b) => a * (b + 1), 1);
    const syn = v.reduce((a, b) => a * (b + 2), 1);
    put(out, table(["Ne sayılıyor?", "Hesap", "Sonuç"], [
      ["Örnek (gün) sayısı", v.join(" · "), { v: inst.toLocaleString("en-US"), cls: "num" }],
      ["Sözdizimsel hipotez (değer, ?, Ø)", v.map((x) => `(${x}+2)`).join(" · "), { v: syn.toLocaleString("en-US"), cls: "num" }],
      ["Anlamca farklı hipotez", `1 + ${v.map((x) => `(${x}+1)`).join(" · ")}`, { v: sem.toLocaleString("en-US"), cls: "num" }],
      ["Olası bütün kavramlar (evet/hayır etiketlemeleri)", `2${sup(inst)}`, { v: inst <= 60 ? (2 ** inst).toLocaleString("en-US") : `2${sup(inst)} ≈ 10${sup(Math.round(inst * Math.log10(2)))}`, cls: "num" }],
    ]), h("p", { class: "small muted" }, "İçinde Ø geçen her hipotez hiçbir günü kabul etmez; hepsi aynı (boş) kavramdır, bu yüzden bir kez sayılır: “1 +”. Hipotez dilinin ifade edebildiği kavramlar, bütün kavramların küçücük bir kesridir: tümevarımsal yanlılık budur."));
  });
  return el;
};

W.finds = () => {
  const { el, body } = frame("Find-S adım adım");
  const t = area("Güneşli Ilık Normal Kuvvetli Ilık Aynı Evet\nGüneşli Ilık Yüksek Kuvvetli Ilık Aynı Evet\nYağmurlu Soğuk Yüksek Kuvvetli Ilık Değişken Hayır\nGüneşli Ilık Yüksek Kuvvetli Serin Değişken Evet", 5);
  const out = outBox();
  body.append(h("p", { class: "field-hint" }, "Her satır bir örnek: öznitelik değerleri, en sonda Evet/Hayır."), t, out);
  live(body, () => {
    const rows = parseRows(t.value);
    if (!rows.length) return;
    const d = rows[0].length - 1;
    let hyp = Array(d).fill("Ø");
    const steps = [["h₀", "başlangıç", `⟨${hyp.join(", ")}⟩`]];
    rows.forEach((r, i) => {
      const lab = r[d].toLowerCase();
      const posEx = ["evet", "yes", "+", "1"].includes(lab);
      if (posEx) hyp = hyp.map((c, j) => (c === "Ø" ? r[j] : c === r[j] ? c : "?"));
      steps.push([`h${sub(i + 1)}`, `${i + 1}. örnek (${r[d]})`, posEx ? `⟨${hyp.join(", ")}⟩` : "değişmez: negatif örnekler kullanılmaz"]);
    });
    const consistentNeg = rows.filter((r) => !["evet", "yes", "+", "1"].includes(r[d].toLowerCase())).every((r) => !hyp.every((c, j) => c === "?" || c === r[j]));
    put(out, table(["Adım", "Görülen örnek", "Hipotez h (en özelden genele)"], steps),
      h("p", {}, "Son hipotez: ", h("strong", {}, `⟨${hyp.join(", ")}⟩`), ". ", consistentNeg ? "Negatif örneklerin hepsini reddediyor (veriyle tutarlı)." : h("span", { class: "bad" }, "Bir negatif örneği kabul ediyor: veri VE'li dille ifade edilemiyor (ya da gürültülü).")));
  });
  return el;
};

/** Worked solution as numbered steps: what we compute (a sentence), the formula, the numbers put in, the result. */
function steps(items) {
  return h("ol", { class: "steps-box" }, items.filter(Boolean).map((it) => h("li", {},
    h("p", { class: "st-what" }, it.what),
    it.formula ? h("p", { class: "st-formula" }, it.formula) : null,
    it.calc ? h("p", { class: "st-calc" }, it.calc, it.result != null ? [" = ", h("b", {}, it.result)] : null) : null,
    it.note ? h("p", { class: "st-note" }, it.note) : null)));
}

// polynomial fit (bias–variance in one picture). Fitted in u = 2x − 1 ∈ [−1, 1]: with raw x ∈ [0, 1] the degree-9
// normal equations are too ill-conditioned for double precision and the solver gave up (flat zero curve).
function polyfit(xs, ys, deg, lambda = 0) {
  const us = xs.map((x) => 2 * x - 1);
  const A = Array.from({ length: deg + 1 }, (_, i) => Array.from({ length: deg + 1 }, (_, j) => ml.sum(us.map((u) => u ** (i + j))) + (i === j && i > 0 ? lambda : 0)));
  const b = Array.from({ length: deg + 1 }, (_, i) => ml.sum(us.map((u, k) => u ** i * ys[k])));
  const c = ml.solve(A, b) || Array(deg + 1).fill(0);
  return (x) => c.reduce((s, ci, k) => s + ci * (2 * x - 1) ** k, 0);
}
W.polyfit = () => {
  const { el, body } = frame("Ezber mi, öğrenme mi? Polinom derecesi ve hata");
  const rnd = ml.rng(470);
  const noise = () => { let s = 0; for (let i = 0; i < 6; i++) s += rnd(); return (s - 3) * 0.3; };
  const truth = (x) => Math.sin(2 * Math.PI * x);
  const tr = Array.from({ length: 10 }, (_, i) => { const x = (i + 0.5) / 10; return [x, truth(x) + noise()]; });
  const te = Array.from({ length: 100 }, () => { const x = rnd(); return [x, truth(x) + noise()]; });
  const deg = h("input", { type: "range", min: 0, max: 9, value: 3 });
  const lam = select("Düzenlileştirme λ: ", [["0", "0"], ["0.0001", "0.0001"], ["0.01", "0.01"], ["1", "1"]], "0");
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "Derece M: ", deg, h("b", { class: "mval" }, "3")), lam.label), out);
  const rmse = (p, d) => Math.sqrt(ml.mean(d.map(([x, y]) => (y - p(x)) ** 2)));
  live(body, () => {
    const M = Number(deg.value);
    $(".mval", body).textContent = " " + M;
    const L = Number(lam.get());
    const curve = (p) => Array.from({ length: 241 }, (_, i) => { const x = i / 240; return [x, p(x)]; });
    const c = polyfit(tr.map((p) => p[0]), tr.map((p) => p[1]), M, L);
    const errs = Array.from({ length: 10 }, (_, m) => { const cm = polyfit(tr.map((p) => p[0]), tr.map((p) => p[1]), m, L); return [m, rmse(cm, tr), rmse(cm, te)]; });
    const fit = lines({ series: [
      { pts: Array.from({ length: 121 }, (_, i) => [i / 120, truth(i / 120)]), cls: "curve3", name: "gerçek f(x) = sin 2πx", color: "s3" },
      { pts: curve(c), cls: "curve1", name: `M = ${M} polinomu`, color: "pos" },
      { pts: tr, cls: "curve2", dots: true, noLine: true, name: "10 eğitim noktası", color: "neg" },
    ], xlim: [0, 1], ylim: [-1.8, 1.8], xlabel: "x", ylabel: "t", aria: "Polinom uydurma" });
    const err = lines({ series: [
      { pts: errs.map((e) => [e[0], e[1]]), cls: "curve1", name: "eğitim RMSE", color: "pos" },
      { pts: errs.map((e) => [e[0], e[2]]), cls: "curve2", name: "test RMSE", color: "neg" },
    ], xlim: [0, 9], ylim: [0, 1.5], xstep: 1, xlabel: "M", ylabel: "RMSE", aria: "Hata eğrileri" });
    const [, trE, teE] = errs[M];
    const verdict = M <= 1 ? "yetersiz uyum (yüksek yanlılık): iki hata da yüksek" : teE > trE * 3 && M >= 7 ? "aşırı uyum (yüksek varyans): eğitim hatası ≈ 0, test hatası büyük" : "makul: test hatası düşük";
    put(out, h("div", { class: "two-col" }, fit, err), h("p", {}, `M = ${M} iken eğitim RMSE ${f2(trE)}, test RMSE ${f2(teE)}. Tanı: `, h("strong", {}, verdict), "."),
      h("p", { class: "small muted" }, "Dereceyi 9'a çekin: polinom 10 noktanın hepsinden geçer, aralarda savrulur. Sonra λ'yı büyütün: aynı M = 9 sakinleşir (düzenlileştirme)."));
  });
  return el;
};

// ======================================================================= week 2
W.scaling = () => {
  const { el, body } = frame("Ölçekleme: min-max ve z-score");
  const tr = h("input", { type: "text", value: "2 4 4 4 5 5 7 9", style: { width: "16rem" } });
  const te = h("input", { type: "text", value: "", style: { width: "8rem" }, placeholder: "örn. 7" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "Eğitim değerleri: ", tr), h("label", {}, "Test değeri(leri): ", te)), out);
  live(body, () => {
    const x = parseNums(tr.value).filter(Number.isFinite), t = parseNums(te.value).filter(Number.isFinite);
    if (x.length < 2) { put(out, errorBox("En az iki eğitim değeri girin.")); return; }
    const mm = ml.minmax(x), z = ml.zscore(x);
    const dev = x.map((v) => (v - z.mean) ** 2);
    const rows = x.map((v, i) => [f(v), { v: f2(mm.values[i]), cls: "num" }, f2(v - z.mean), f2(dev[i]), { v: f2(z.values[i]), cls: "num" }]);
    put(out, 
      h("div", { class: "kv" }, h("span", {}, "min = ", h("b", {}, f(mm.min))), h("span", {}, "max = ", h("b", {}, f(mm.max))), h("span", {}, "μ = ", h("b", {}, `${f(ml.sum(x))}/${x.length} = ${f(z.mean)}`)),
        h("span", {}, "σ² = Σ(x−μ)²/n = ", h("b", {}, `${f(ml.sum(dev))}/${x.length} = ${f(z.sd ** 2)}`)), h("span", {}, "σ = ", h("b", {}, f(z.sd)))),
      table(["x", "min-max (x−min)/(max−min)", "x − μ", "(x − μ)²", "z = (x−μ)/σ"], rows),
      t.length ? h("p", {}, "Test değerleri ", h("strong", {}, "eğitimin"), " min/max/μ/σ'sıyla dönüştürülür: ", t.map((v) => `${f(v)} → min-max ${f2(ml.minmax([v], x).values[0])}, z ${f2(ml.zscore([v], x).values[0])}`).join("; "), ". (min-max [0,1] dışına taşabilir; bu normaldir.)") : null);
  });
  return el;
};

W.confusion = (ds) => {
  const { el, body } = frame("Tahminlerden karmaşıklık matrisine ve ölçütlere");
  const mode = select("Girdi: ", [["vec", "gerçek ve tahmin dizileri"], ["counts", "TP, FN, FP, TN sayıları"]], ds.mode || "vec");
  const y = h("input", { type: "text", value: ds.y || "1 1 1 1 1 1 0 0 0 0", style: { width: "15rem" } });
  const p = h("input", { type: "text", value: ds.p || "1 1 1 1 0 0 1 0 0 0", style: { width: "15rem" } });
  const tp = num("TP ", 60), fn = num("FN ", 60), fp = num("FP ", 40), tn = num("TN ", 120);
  const vecRow = h("div", { class: "controls" }, h("label", {}, "gerçek y: ", y), h("label", {}, "tahmin ŷ: ", p));
  const cntRow = h("div", { class: "controls" }, tp.label, fn.label, fp.label, tn.label);
  const out = outBox();
  body.append(h("div", { class: "controls" }, mode.label), vecRow, cntRow, out);
  live(body, () => {
    const vm = mode.get() === "vec";
    vecRow.hidden = !vm; cntRow.hidden = vm;
    let c, extra = null;
    if (vm) {
      const a = parseBits(y.value), b = parseBits(p.value);
      if (a.length !== b.length || !a.length) { put(out, errorBox("İki dizi aynı uzunlukta olmalı (1 = pozitif, 0 = negatif).")); return; }
      c = ml.confusion(a, b, 1);
      extra = table(["örnek", ...a.map((_, i) => i + 1)], [["gerçek", ...a], ["tahmin", ...b], ["durum", ...c.tags.map(tag)]], { cls: "center compact" });
    } else c = { TP: tp.get(), FN: fn.get(), FP: fp.get(), TN: tn.get() };
    const m = ml.metrics(c);
    put(out, extra || "", h("div", { class: "two-col" }, h("div", {}, cmTable(c), h("p", { class: "small muted" }, `Denetim: TP+FN = ${c.TP + c.FN} pozitif, FP+TN = ${c.FP + c.TN} negatif, toplam ${m.n}.`)), h("div", {}, h("p", { class: "small" }, `Dengeli accuracy = (TPR + TNR)/2 = ${f(m.balanced)}`))), metricRows(m, c));
  });
  return el;
};

W.roc = (ds) => {
  const { el, body } = frame("Sıralı skorlardan ROC eğrisi ve AUC");
  const inp = h("input", { type: "text", value: ds.seq || "+ + − + − + − −", style: { width: "18rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "Skora göre sıralı (en yüksek önce) gerçek sınıflar: ", inp)), h("p", { class: "field-hint" }, "+ / − (ya da 1 / 0) yazın; aralara boşluk ya da virgül koymak isteğe bağlıdır (++−+ de olur). Eşik “ilk k örnek pozitif” diye kaydırılır."), out);
  live(body, () => {
    const labs = parsePosNeg(inp.value);
    if (labs.length < 2) return;
    const r = ml.roc(labs);
    const plot = lines({ series: [{ pts: r.table.map((t) => [t.FPR, t.TPR]), cls: "curve1", name: "ROC", color: "pos" }, { pts: [[0, 0], [1, 1]], cls: "curve3", name: "rastgele (AUC 0.5)", color: "s3" }], xlim: [0, 1], ylim: [0, 1], xstep: 0.25, ystep: 0.25, xlabel: "FPR", ylabel: "TPR" });
    put(out, 
      table(["ilk k pozitif", ...r.table.map((t) => t.k)], [["TP", ...r.table.map((t) => t.TP)], ["FP", ...r.table.map((t) => t.FP)], [`TPR = TP/${r.P}`, ...r.table.map((t) => f2(t.TPR))], [`FPR = FP/${r.N}`, ...r.table.map((t) => f2(t.FPR))]], { cls: "center compact" }),
      h("div", { class: "two-col" }, plot, h("div", {},
        h("p", {}, "Köşe noktaları (FPR, TPR): ", r.corners.map((c) => `(${f2(c[0])}, ${f2(c[1])})`).join(", ")),
        h("p", {}, "AUC (çift sayma): her negatifin önünde kaç pozitif var? Toplam ", h("b", {}, r.goodPairs), ` / (${r.P}·${r.N} = ${r.pairs}) = `, h("b", {}, f(r.auc)), "."),
        h("p", { class: "small muted" }, "Yorum: rastgele seçilen bir pozitifin rastgele bir negatiften yüksek skor alma olasılığı. Yamuk kuralı aynı sayıyı verir."))));
  });
  return el;
};

W.regmetrics = () => {
  const { el, body } = frame("Regresyon ölçütleri: MSE, RMSE, MAE, R²");
  const y = h("input", { type: "text", value: "3 5 4 6 8 10", style: { width: "14rem" } });
  const p = h("input", { type: "text", value: "2.5 5 4.5 6 7 10", style: { width: "14rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "y: ", y), h("label", {}, "ŷ: ", p)), out);
  live(body, () => {
    const a = parseNums(y.value), b = parseNums(p.value);
    if (a.length !== b.length || a.length < 2) { put(out, errorBox("Aynı uzunlukta iki dizi girin.")); return; }
    const r = ml.regressionMetrics(a, b);
    put(out, table(["i", ...a.map((_, i) => i + 1), "Σ"], [
      ["y", ...a.map((v) => f(v)), f(ml.sum(a))], ["ŷ", ...b.map((v) => f(v)), ""], ["y − ŷ", ...r.errors.map((v) => f(v)), ""],
      ["(y − ŷ)²", ...r.errors.map((v) => f(v * v)), f(r.sse)], ["|y − ŷ|", ...r.errors.map((v) => f(Math.abs(v))), f(ml.sum(r.errors.map(Math.abs)))],
      [`(y − ȳ)², ȳ = ${f(r.ybar)}`, ...a.map((v) => f((v - r.ybar) ** 2)), f(r.sst)]], { cls: "center compact" }),
    steps([
      { what: "MSE, hataların karelerinin ortalamasıdır; kare aldığı için büyük hataları ağır cezalandırır.", formula: "MSE = (1/n)·Σ(y − ŷ)²", calc: `MSE = ${f(r.sse)}/${a.length}`, result: f(r.mse) },
      { what: "RMSE, MSE'nin kareköküdür; sonucu yeniden y'nin birimine getirir.", formula: "RMSE = √MSE", calc: `RMSE = √${f(r.mse)}`, result: f(r.rmse) },
      { what: "MAE, hataların mutlak değerlerinin ortalamasıdır; büyük hatalara MSE kadar duyarlı değildir.", formula: "MAE = (1/n)·Σ|y − ŷ|", calc: `MAE = ${f(ml.sum(r.errors.map(Math.abs)))}/${a.length}`, result: f(r.mae) },
      { what: "R², modelin hatasını her şeye ortalamayı (ȳ) söylemenin hatasıyla karşılaştırır; 1 kusursuz, 0 ortalama kadar iyi demektir.", formula: "R² = 1 − Σ(y − ŷ)² / Σ(y − ȳ)²", calc: `ȳ = ${f(r.ybar)}; R² = 1 − ${f(r.sse)}/${f(r.sst)}`, result: f(r.r2) },
    ]));
  });
  return el;
};

W.pca = (ds) => {
  const { el, body } = frame("2 boyutlu PCA, elle hesap gibi");
  const t = area(ds.pts || "1 1\n2 3\n3 2\n4 4", 5);
  const out = outBox();
  body.append(h("p", { class: "field-hint" }, "Her satır bir nokta: x₁ x₂. Kovaryans n − 1 ile."), t, out);
  live(body, () => {
    const pts = parseRows(t.value).map((r) => r.slice(0, 2).map(Number)).filter((p) => p.every(Number.isFinite));
    if (pts.length < 2) return;
    const r = ml.pca2(pts);
    const n1 = pts.length - 1;
    const c = r.centered;
    const rows = pts.map((p, i) => [f(p[0]), f(p[1]), f(c[i][0]), f(c[i][1]), f(c[i][0] ** 2), f(c[i][1] ** 2), f(c[i][0] * c[i][1]), f(r.scores[i])]);
    rows.push({ row: ["Σ / ort.", "", "", "", f(ml.sum(c.map((q) => q[0] ** 2))), f(ml.sum(c.map((q) => q[1] ** 2))), f(ml.sum(c.map((q) => q[0] * q[1]))), ""], cls: "hl" });
    const mx = pts.map((p) => p[0]), my = pts.map((p) => p[1]);
    const R = Math.max(...mx, ...my) - Math.min(...mx, ...my) || 1;
    const P = r.pc1, M0 = r.mean;
    const plot = scatter({ ...bounds(pts.map((x) => ({ x })), 0.25), points: pts.map((x, i) => ({ x, y: 1, name: String(i + 1) })),
      segments: [[[M0[0] - P[0] * R, M0[1] - P[1] * R], [M0[0] + P[0] * R, M0[1] + P[1] * R]]], xlabel: "x₁", ylabel: "x₂", aria: "PCA" });
    put(out, 
      h("p", {}, `μ = (${f(r.mean[0])}, ${f(r.mean[1])})`),
      table(["x₁", "x₂", "x₁−μ₁", "x₂−μ₂", "(x₁−μ₁)²", "(x₂−μ₂)²", "çarpım", "PC1 skoru"], rows, { cls: "compact" }),
      h("div", { class: "two-col" }, steps([
        { what: "Her sütunun ortalamasını bulur ve noktaları merkezleriz (tablonun 3. ve 4. sütunları).", formula: "μ = (Σx₁ / n, Σx₂ / n)", calc: `μ = (${f(r.mean[0])}, ${f(r.mean[1])})` },
        { what: "Kovaryans matrisini kurarız: tablodaki üç toplamı n − 1'e böleriz.", formula: "s₁₁ = Σd₁² / (n − 1), s₂₂ = Σd₂² / (n − 1), s₁₂ = Σd₁d₂ / (n − 1)",
          calc: h("span", { class: "mat-eq", style: { justifyContent: "flex-start" } }, `toplamlar / ${n1}: S = `, h("span", { class: "mat" }, ...[r.cov[0][0], r.cov[0][1], r.cov[1][0], r.cov[1][1]].map((v) => h("span", {}, f(v))))) },
        { what: "Özdeğerleri buluruz: det(S − λI) = 0 denkleminin kökleri. Her özdeğer bir yöndeki yayılmadır.", formula: "λ = (s₁₁ + s₂₂)/2 ± √( ((s₁₁ − s₂₂)/2)² + s₁₂² )",
          calc: `λ² − ${f(r.trace)}·λ + ${f(r.det)} = 0 ⇒ λ₁ = ${f(r.eig[0])}, λ₂ = ${f(r.eig[1])}`,
          note: `Denetim: λ₁ + λ₂ = s₁₁ + s₂₂ = ${f(r.trace)} ve λ₁·λ₂ = det(S) = ${f(r.det)} olmalı.` },
        { what: "PC1'in yönünü buluruz: büyük özdeğerin özvektörü, uzunluğu 1 yapılarak.", formula: "(S − λ₁I)·v = 0, u₁ = v / ‖v‖", calc: `u₁ ≈ ${vec(r.pc1)}` },
        { what: "PC1'in toplam yayılmanın ne kadarını taşıdığını buluruz.", formula: "λ₁ / (λ₁ + λ₂)", calc: `${f(r.eig[0])} / ${f(r.trace)}`, result: `%${f(100 * r.ratio, 1)}`,
          note: r.ratio >= 0.9 ? "Tek bileşen yayılmanın %90'ından fazlasını taşıyor: veriyi tek boyuta indirmek makul." : "PC1 %90'ın altında: tek boyuta inmek çok bilgi kaybettirir." },
        { what: "Tablonun son sütunu, her noktanın PC1 üzerindeki konumudur (PC1 skoru).", formula: "zᵢ = (xᵢ − μ)·u₁" },
      ]), plot));
  });
  return el;
};

// ======================================================================= week 3: kNN
W.knn = (ds) => {
  const { el, body } = frame("kNN: noktalara tıklayın, sorguyu taşıyın");
  const t = area(ds.pts || "1 2 + A\n2 1 + B\n2 3 + C\n3 2 + D\n4 4 - E\n6 4 - F\n7 1 - G\n7 6 - H", 7);
  const qx = num("sorgu x₁ ", ds.qx ?? 4, { width: "4.5rem" }), qy = num("x₂ ", ds.qy ?? 3, { width: "4.5rem" });
  const k = num("k ", 3, { min: 1, step: 1, width: "4rem" });
  const metric = select("uzaklık ", [["euclid2", "Öklid (d²)"], ["manhattan", "Manhattan (L1)"]], "euclid2");
  const weighted = checkbox(" 1/d ağırlıklı oy", false);
  const add = select("tıklama ", [["q", "sorguyu taşır"], ["+", "+ nokta ekler"], ["-", "− nokta ekler"]], "q");
  const out = outBox();
  body.append(h("details", {}, h("summary", { class: "small" }, "Veriyi düzenle (x₁ x₂ etiket ad)"), t), h("div", { class: "controls" }, qx.label, qy.label, k.label, metric.label, weighted.label, add.label), out);
  const run = live(body, () => {
    let pts;
    try { pts = parsePoints(t.value); } catch (e) { put(out, errorBox(e.message)); return; }
    const q = [qx.get(), qy.get()], K = Math.max(1, Math.min(pts.length, Math.round(k.get())));
    const rank = ml.knnRank(pts, q, metric.get());
    const vote = ml.knnVote(rank, K, { weighted: weighted.get() });
    const radius = metric.get() === "euclid2" ? Math.sqrt(rank[K - 1].d) : null;
    const b = bounds(pts, 0.15, [q]);
    const plot = scatter({ ...b, equal: true, points: [...pts.map((p) => ({ ...p, sv: vote.top.includes(p) || vote.top.some((t2) => t2.name === p.name) })), { x: q, y: "q", name: "q" }],
      circles: radius ? [{ c: q, r: radius }] : [], xlabel: "x₁", ylabel: "x₂", aria: "kNN",
      onclick: (a, bb) => {
        const r1 = (v) => Math.round(v * 2) / 2;
        if (add.get() === "q") { qx.input.value = r1(a); qy.input.value = r1(bb); }
        else t.value += `\n${r1(a)} ${r1(bb)} ${add.get()}`;
        run();
      } });
    const lab = (y) => (y > 0 ? h("span", { class: "pos" }, "+") : h("span", { class: "neg" }, "−"));
    put(out, h("div", { class: "two-col" }, plot, h("div", {},
      table(["sıra", "nokta", metric.get() === "euclid2" ? "d²" : "L1", "sınıf"], rank.map((p, i) => ({ row: [i + 1, `${p.name} (${p.x.join(", ")})`, { v: f(p.d), cls: "num" }, lab(p.y)], cls: i < K ? "hl" : "" })), { cls: "compact" }))),
      h("p", {}, `k = ${K}: oylar `, Object.entries(vote.votes).map(([y, c]) => `${y > 0 ? "+" : "−"}: ${f(c)}`).join(", "), " → karar ", h("strong", {}, vote.tie ? "beraberlik!" : vote.label > 0 ? "+" : "−"),
        vote.boundaryTie ? h("span", { class: "bad" }, ` · Dikkat: ${K}. ve ${K + 1}. komşu eşit uzaklıkta; bir beraberlik kuralı (en küçük ad, rastgele, hepsini al) yazılmalı.`) : null));
  });
  return el;
};

W.loo = (ds) => {
  const { el, body } = frame("Birini dışarıda bırak (LOO) ile k seçimi");
  const t = area(ds.pts || "1 2 + A\n2 2 + B\n1 4 + C\n6 3 + D\n4 2 - E\n4 5 - F\n5 3 - G\n4 4 - H", 7);
  const ks = h("input", { type: "text", value: "1 3 5", style: { width: "7rem" } });
  const out = outBox();
  body.append(t, h("div", { class: "controls" }, h("label", {}, "denenecek k değerleri: ", ks)), out);
  live(body, () => {
    let pts;
    try { pts = parsePoints(t.value); } catch (e) { put(out, errorBox(e.message)); return; }
    const K = parseNums(ks.value).filter((v) => v >= 1 && v < pts.length);
    const res = ml.loo(pts, K);
    const head = ["nokta", "sınıf", ...res.flatMap((r) => [`k=${r.k} komşular (d²)`, "tahmin"])];
    const rows = pts.map((p, i) => [p.name, signTxt(p.y), ...res.flatMap((r) => [r.rows[i].top.map((n) => `${n.name}(${f(n.d)})`).join(" "), { v: signTxt(r.rows[i].pred) + (r.rows[i].ok ? "" : " ✗"), cls: r.rows[i].ok ? "good" : "bad" }])]);
    const best = res.reduce((a, b) => (b.acc > a.acc ? b : a), res[0]);
    put(out, table(head, rows, { cls: "compact" }), h("p", {}, res.map((r) => `k = ${r.k}: LOO doğruluğu ${r.rows.filter((x) => x.ok).length}/${pts.length} = ${f(r.acc)}`).join(" · "), best ? h("strong", {}, ` → seçim k = ${best.k}`) : null),
      h("p", { class: "small muted" }, "Eğitim doğruluğu k = 1'de hep 1.0'dır (her nokta kendi komşusudur); seçim ölçütü olamaz. LOO = n katlı çapraz doğrulama."));
  });
  return el;
};

// ======================================================================= week 4: linear models
W.lsq = (ds) => {
  const { el, body } = frame("En küçük kareler (tek değişkenli), tablo hâlinde");
  const x = h("input", { type: "text", value: ds.x || "1 2 3 4", style: { width: "10rem" } });
  const y = h("input", { type: "text", value: ds.y || "2 4 5 7", style: { width: "10rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "x: ", x), h("label", {}, "y: ", y)), out);
  live(body, () => {
    const a = parseNums(x.value), b = parseNums(y.value);
    if (a.length !== b.length || a.length < 2) { put(out, errorBox("Aynı uzunlukta iki dizi girin.")); return; }
    const r = ml.leastSquares1(a, b);
    const rows = a.map((xi, i) => [i + 1, f(xi), f(b[i]), f(xi - r.xbar), f(b[i] - r.ybar), f((xi - r.xbar) * (b[i] - r.ybar)), f((xi - r.xbar) ** 2), f(r.pred[i]), f(r.residuals[i] ** 2)]);
    rows.push({ row: ["Σ", `x̄ = ${f(r.xbar)}`, `ȳ = ${f(r.ybar)}`, "0", "0", f(r.sxy), f(r.sxx), "", f(r.sse)], cls: "hl" });
    const pts = a.map((xi, i) => ({ x: [xi, b[i]], y: 1 }));
    const plot = scatter({ ...bounds(pts, 0.2), points: pts, labels: false, lines: [{ w: [r.w1, -1], b: r.w0, cls: "accent" }], xlabel: "x", ylabel: "y" });
    const n = a.length, sst = r.sst;
    put(out,
      h("p", { class: "small" }, "Hesap tablosu: her satır bir nokta. Son satırdaki toplamlar aşağıdaki formüllerde kullanılır."),
      table(["i", "x", "y", "x − x̄", "y − ȳ", "(x − x̄)(y − ȳ)", "(x − x̄)²", "ŷ", "(y − ŷ)²", "(y − ȳ)²"], [
        ...a.map((xi, i) => [i + 1, f(xi), f(b[i]), f(xi - r.xbar), f(b[i] - r.ybar), f((xi - r.xbar) * (b[i] - r.ybar)), f((xi - r.xbar) ** 2), f(r.pred[i]), f(r.residuals[i] ** 2), f((b[i] - r.ybar) ** 2)]),
        { row: ["Σ", f(ml.sum(a)), f(ml.sum(b)), "0", "0", f(r.sxy), f(r.sxx), "", f(r.sse), f(sst)], cls: "hl" }], { cls: "compact" }),
      h("div", { class: "two-col" }, steps([
        { what: "Önce x ve y'nin ortalamalarını buluruz; doğru her zaman (x̄, ȳ) noktasından geçer.", formula: "x̄ = Σx / n, ȳ = Σy / n",
          calc: `x̄ = ${f(ml.sum(a))}/${n} = ${f(r.xbar)}, ȳ = ${f(ml.sum(b))}/${n}`, result: f(r.ybar) },
        { what: "Eğimi buluruz: x ile y'nin birlikte değişiminin, x'in kendi değişimine oranı.", formula: "w₁ = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²",
          calc: `Tablodaki iki sütunun toplamları: w₁ = ${f(r.sxy)}/${f(r.sxx)}`, result: f(r.w1) },
        { what: "Kesişimi buluruz: doğru (x̄, ȳ)'den geçtiği için ȳ = w₀ + w₁·x̄ olmalı.", formula: "w₀ = ȳ − w₁·x̄",
          calc: `w₀ = ${f(r.ybar)} − ${f(r.w1)}·${f(r.xbar)}`, result: f(r.w0) },
        { what: "Doğruyu yazarız; tablodaki ŷ sütunu her x için bu doğrunun tahminidir.", formula: "ŷ = w₀ + w₁·x",
          calc: `ŷ = ${f(r.w0)} + ${f(r.w1)}·x` },
        { what: "Hatayı ölçeriz: tahmin hatalarının karelerinin ortalaması.", formula: "MSE = (1/n)·Σ(y − ŷ)²",
          calc: `MSE = ${f(r.sse)}/${n}`, result: f(r.mse) },
        { what: "Doğrunun, her şeye ortalamayı söylemekten ne kadar iyi olduğunu ölçeriz (1'e yakınsa iyi).", formula: "R² = 1 − Σ(y − ŷ)² / Σ(y − ȳ)²",
          calc: `R² = 1 − ${f(r.sse)}/${f(sst)}`, result: f(r.r2),
          note: `Denetim: artıkların toplamı Σ(y − ŷ) = ${f(ml.sum(r.residuals))}; sabit terimi olan her en küçük kareler çözümünde 0 çıkar.` },
      ]), plot));
  });
  return el;
};

W.gd = () => {
  const { el, body } = frame("Gradyan inişi: ŷ = w·x, L(w) = (1/n) Σ (w xᵢ − yᵢ)²");
  const pts = h("input", { type: "text", value: "1 2; 2 4", style: { width: "9rem" } });
  const eta = num("η ", 0.1, { width: "4.5rem" }), w0 = num("w başlangıç ", 0, { width: "4.5rem" }), st = num("adım ", 5, { step: 1, min: 1, width: "4rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "noktalar (x y; …): ", pts), eta.label, w0.label, st.label), out);
  live(body, () => {
    const P = pts.value.split(/[;\n]/).map((s) => parseNums(s)).filter((p) => p.length === 2);
    if (!P.length) return;
    const r = ml.gdNoBias(P, w0.get(), eta.get(), Math.min(60, Math.max(1, Math.round(st.get()))));
    const div = Math.abs(r.w) > 1e6 || r.steps.some((s) => Math.abs(s.next) > Math.abs(s.w) * 1.5 + 5);
    put(out, h("p", { class: "small" }, `∂L/∂w = (2/n) Σ (w xᵢ − yᵢ) xᵢ · güncelleme w ← w − η·∂L/∂w`),
      table(["adım", "w", "L(w)", "∂L/∂w", "yeni w"], r.steps.map((s) => [s.step, f(s.w), f(s.loss), f(s.grad), f(s.next)]), { cls: "compact" }),
      h("p", {}, div ? h("span", { class: "bad" }, "Iraksıyor: η bu eğrilik için çok büyük, her adım minimumu aşıp daha uzağa düşüyor.") : `Son w = ${f(r.w)}, L = ${f(r.loss)}.`));
  });
  return el;
};

W.gates = () => {
  const { el, body } = frame("Mantık kapısı tek nöronla: z = w₁x₁ + w₂x₂ + b ≥ 0 ise çıktı 1");
  const w1 = num("w₁ ", 1, { width: "4rem" }), w2 = num("w₂ ", 1, { width: "4rem" }), b = num("b ", -1.5, { width: "4rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, w1.label, w2.label, b.label, button("AND", () => { w1.input.value = 1; w2.input.value = 1; b.input.value = -1.5; body.dispatchEvent(new Event("input")); }),
    button("OR", () => { w1.input.value = 1; w2.input.value = 1; b.input.value = -0.5; body.dispatchEvent(new Event("input")); }),
    button("NAND", () => { w1.input.value = -1; w2.input.value = -1; b.input.value = 1.5; body.dispatchEvent(new Event("input")); })), out);
  live(body, () => {
    const X = [[0, 0], [0, 1], [1, 0], [1, 1]];
    const z = X.map(([a, c]) => w1.get() * a + w2.get() * c + b.get());
    const o = z.map((v) => (v >= 0 ? 1 : 0)).join("");
    const names = { "0001": "AND", "0111": "OR", "1110": "NAND", "1000": "NOR", "0110": "XOR", "1001": "XNOR", "0000": "hep 0", "1111": "hep 1" };
    // picture: the four inputs coloured by the neuron's output, its line w₁x₁ + w₂x₂ + b = 0 and the two sides
    const W1 = w1.get(), W2 = w2.get(), B = b.get();
    const flat = Math.abs(W1) < 1e-12 && Math.abs(W2) < 1e-12;
    const pic = scatter({ xlim: [-0.5, 1.5], ylim: [-0.5, 1.5], xstep: 0.5, ystep: 0.5, equal: true, labels: true,
      points: X.map((x, i) => ({ x, y: z[i] >= 0 ? 1 : -1, name: `(${x[0]}, ${x[1]})` })),
      ...(flat ? { shadeFn: () => (B >= 0 ? 1 : -1), shadeRes: 4 } : { shade: { w: [W1, W2], b: B }, lines: [{ w: [W1, W2], b: B, cls: "accent" }] }),
      xlabel: "x₁", ylabel: "x₂", aria: "Nöronun sınırı" });
    const xorPic = scatter({ xlim: [-0.5, 1.5], ylim: [-0.5, 1.5], xstep: 0.5, ystep: 0.5, equal: true, labels: true,
      points: X.map((x) => ({ x, y: x[0] !== x[1] ? 1 : -1, name: `(${x[0]}, ${x[1]})` })), xlabel: "x₁", ylabel: "x₂", aria: "XOR" });
    put(out, h("div", { class: "two-col" },
        h("figure", { class: "fig" }, pic, h("figcaption", {}, `Bu nöronun sınırı ${flat ? "yok (w = 0): bütün düzlem tek sınıf" : `${lin([W1, W2], B)} = 0 doğrusu`}. Mavi taraf çıktı 1, kırmızı taraf çıktı 0; daireler 1, kareler 0 çıkan girdiler.`)),
        h("figure", { class: "fig" }, xorPic, h("figcaption", {}, "XOR'da 1 çıkması gereken iki girdi (mavi) çapraz köşelerde, 0 çıkması gerekenler (kırmızı) öbür iki köşede. Hangi doğruyu çizerseniz çizin, iki maviyi iki kırmızıdan ayıramazsınız."))),
      table(["x₁", "x₂", "z", "çıktı"], X.map((x, i) => [x[0], x[1], f(z[i]), z[i] >= 0 ? 1 : 0]), { cls: "center compact" }),
      h("p", {}, "Bu nöron ", h("strong", {}, names[o] || `çıktı ${o}`), " hesaplıyor. XOR (çıktılar 0, 1, 1, 0) ise hiçbir (w₁, w₂, b) ile elde edilemez. Nedeni: (0, 1) ve (1, 0) girdilerinde 1 çıkması için w₂ + b ≥ 0 ve w₁ + b ≥ 0 olmalı; bu ikisini toplayınca w₁ + w₂ + 2b ≥ 0 bulunur. (0, 0) girdisinde 0 çıkması için b < 0 olmalı, bu da w₁ + w₂ + b ≥ −b > 0 demektir. Oysa (1, 1) girdisinde 0 çıkması için w₁ + w₂ + b < 0 gerekir: çelişki."));
  });
  return el;
};

W.logstep = (ds) => {
  const { el, body } = frame("Lojistik regresyon: tek bir gradyan adımı");
  const x = h("input", { type: "text", value: ds.x || "1 2", style: { width: "6rem" } });
  const w = h("input", { type: "text", value: ds.w || "0 0", style: { width: "6rem" } });
  const b = num("b ", Number(ds.b ?? 0), { width: "4rem" }), y = select("y ", [["1", "1"], ["0", "0"]], ds.y || "1"), eta = num("η ", Number(ds.eta ?? 0.4), { width: "4rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "x = ", x), h("label", {}, "w = ", w), b.label, y.label, eta.label), out);
  live(body, () => {
    const X = parseNums(x.value), Wv = parseNums(w.value);
    if (X.length !== Wv.length) { put(out, errorBox("x ve w aynı boyutta olmalı.")); return; }
    const Y = Number(y.get());
    const r = ml.logisticStep(Wv, b.get(), X, Y, eta.get());
    // left: where the example sits on the sigmoid before and after the step
    const zr = Math.max(4, Math.ceil(Math.max(Math.abs(r.z), Math.abs(r.z2)) + 1));
    const sigPic = h("figure", { class: "fig" }, lines({ series: [
      { pts: Array.from({ length: 121 }, (_, i) => { const z = -zr + (2 * zr * i) / 120; return [z, ml.sigmoid(z)]; }), cls: "curve3", name: "σ(z)", color: "s3" },
      { pts: [[r.z, r.p]], cls: "curve2", dots: true, noLine: true, name: `önce: z = ${f(r.z)}, p = ${f(r.p)}`, color: "neg" },
      { pts: [[r.z2, r.p2]], cls: "curve1", dots: true, noLine: true, name: `sonra: z = ${f(r.z2)}, p = ${f(r.p2)}`, color: "pos" },
    ], xlim: [-zr, zr], ylim: [0, 1], ystep: 0.25, xlabel: "z", ylabel: "p", aria: "Sigmoid üzerinde önce ve sonra" }),
      h("figcaption", {}, `Örnek sigmoid eğrisinin üzerinde: kırmızı adımdan önce, mavi adımdan sonra. Gerçek etiket ${Y} olduğu için p'nin ${Y ? "1'e" : "0'a"} yaklaşması istenir.`));
    // right: the example and the decision boundary w·x + b = 0 before (dashed) and after (solid), for 2 features
    let planePic = null;
    if (X.length === 2) {
      const R = Math.max(2, Math.abs(X[0]), Math.abs(X[1])) + 1;
      planePic = h("figure", { class: "fig" }, scatter({ xlim: [-R, R], ylim: [-R, R], equal: true, labels: true,
        points: [{ x: X, y: Y ? 1 : -1, name: `x (y = ${Y})` }],
        shade: { w: r.w, b: r.b },
        lines: [{ w: Wv, b: b.get(), cls: "dash" }, { w: r.w, b: r.b, cls: "accent" }], xlabel: "x₁", ylabel: "x₂", aria: "Karar sınırı önce ve sonra" }),
        h("figcaption", {}, `${Wv.every((v) => Math.abs(v) < 1e-12) ? "Adımdan önce w = 0 olduğu için bir sınır yoktu; düz çizgi adımdan sonraki" : "Kesikli çizgi adımdan önceki, düz çizgi adımdan sonraki"} karar sınırıdır (w·x + b = 0). Mavi taraf p > 0.5, kırmızı taraf p < 0.5. Sınır, örneği ${Y ? "mavi" : "kırmızı"} tarafa almak için ${Wv.every((v) => Math.abs(v) < 1e-12) ? "oluştu" : "döndü"}.`));
    }
    put(out, table(["", "z = w·x + b", "p = σ(z)", "kayıp −[y ln p + (1−y) ln(1−p)]"], [["adımdan önce", f(r.z), f(r.p), f(r.loss)], ["adımdan sonra", f(r.z2), f(r.p2), f(r.loss2)]], { cls: "compact" }),
      h("div", { class: "two-col" }, sigPic, planePic),
      steps([
        { what: "Tahmin hatasını buluruz: model 1 olasılığını p verdi, gerçek etiket y.", formula: "hata = p − y", calc: `${f(r.p)} − ${Y}`, result: f(r.gb) },
        { what: "Ağırlıkları güncelleriz: hata × girdi kadar, öğrenme oranıyla çarpılıp ters yönde.", formula: "w ← w − η·(p − y)·x",
          calc: `${vec(Wv)} − ${f(eta.get())}·${par(r.gb)}·${vec(X)} = ${vec(Wv)} − ${vec(r.gw.map((g) => eta.get() * g))}`, result: vec(r.w) },
        { what: "Sabit terimi güncelleriz (girdisi 1 sayılır).", formula: "b ← b − η·(p − y)", calc: `${f(b.get())} − ${f(eta.get())}·${par(r.gb)}`, result: f(r.b) },
        { what: "Yeni ağırlıklarla aynı örneğe yeniden bakarız.", formula: "z = w·x + b, p = σ(z)", calc: `z = ${f(r.z2)}, p`, result: f(r.p2),
          note: r.loss2 < r.loss ? `Olasılık ${f(r.p)}'den ${f(r.p2)}'ye ${Y ? "çıktı" : "indi"}, kayıp ${f(r.loss)}'den ${f(r.loss2)}'ye düştü: adım doğru yönde.` : "Kayıp artmış: η çok büyük, adım minimumun ötesine geçti." },
      ]));
  });
  return el;
};

W.perceptron = (ds) => {
  const { el, body } = frame("Perceptron: epoch epoch, sınav tablosu biçiminde");
  const t = area(ds.pts || "2 3 +\n1 1 -\n3 2 +\n0 2 -\n3 4 +\n2 0 -\n1 3 +", 7);
  const w = h("input", { type: "text", value: ds.w || "-0.5 0.5", style: { width: "7rem" } });
  const b = num("b ", Number(ds.b ?? -0.7), { width: "4.5rem" }), eta = num("η ", Number(ds.eta ?? 0.4), { width: "4.5rem" }), ep = num("epoch ", Number(ds.epochs ?? 1), { step: 1, min: 1, width: "4rem" });
  const out = outBox();
  body.append(h("p", { class: "field-hint" }, "Satırlar: x₁ x₂ (…) etiket. Kural: z ≥ 0 ise ŷ = +1. Hatada w ← w + η·y·x, b ← b + η·y."), t,
    h("div", { class: "controls" }, h("label", {}, "w başlangıç: ", w), b.label, eta.label, ep.label), out);
  live(body, () => {
    const rows = parseRows(t.value);
    const d = rows.length ? rows[0].length - 1 : 0;
    let pts;
    try { pts = parsePoints(t.value, { dims: d, named: false }); } catch (e) { put(out, errorBox(e.message)); return; }
    const W0 = parseNums(w.value);
    if (W0.length !== d) { put(out, errorBox(`w ${d} bileşenli olmalı.`)); return; }
    const r = ml.perceptron(pts, W0, b.get(), eta.get(), { epochs: Math.min(100, Math.max(1, Math.round(ep.get()))) });
    const parts = [];
    for (const p of r.passes) {
      parts.push(h("h4", {}, `${p.epoch}. epoch (${p.mistakes} güncelleme)`), table(["#", "x", "y", "z = w·x + b", "ŷ", "hata?", "yeni w", "yeni b"],
        p.steps.map((s) => ({ row: [s.i + 1, vec(s.x, 2), signTxt(s.y), f(s.z), signTxt(s.pred), s.wrong ? h("span", { class: "tag upd" }, "evet") : "hayır", vec(s.w), f(s.b)], cls: s.wrong ? "hl" : "" })), { cls: "compact" }));
    }
    const c = ml.confusion(r.evalRows.map((e) => e.y), r.evalRows.map((e) => e.pred), 1);
    const m = ml.metrics(c);
    const plot = d === 2 ? scatter({ ...bounds(pts, 0.2), points: pts.map((p, i) => ({ ...p, name: String(i + 1) })), shade: { w: r.w, b: r.b }, lines: [{ w: r.w, b: r.b }], xlabel: "x₁", ylabel: "x₂" }) : null;
    put(out, ...parts, h("p", {}, "Son ağırlıklar: w = ", h("b", {}, vec(r.w)), ", b = ", h("b", {}, f(r.b)), r.converged ? " — son epoch hatasız: yakınsadı." : " — henüz hatasız değil."),
      h("div", { class: "two-col" }, h("div", {}, h("p", { class: "small" }, "Son ağırlıklarla değerlendirme:"), cmTable(c), h("p", { class: "small" }, `Accuracy ${f(m.accuracy)} · Precision ${f(m.precision)} · Recall ${f(m.recall)} · F1 ${f(m.f1)}`)), plot));
  });
  return el;
};

W.softmax = () => {
  const { el, body } = frame("Softmax ve çapraz entropi");
  const z = h("input", { type: "text", value: "2 1 0", style: { width: "9rem" } });
  const y = num("doğru sınıf (1'den) ", 1, { step: 1, min: 1, width: "4rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "skorlar z: ", z), y.label), out);
  live(body, () => {
    const Z = parseNums(z.value);
    if (!Z.length) return;
    const p = ml.softmax(Z), e = Z.map(Math.exp), s = ml.sum(e);
    const k = Math.min(Z.length, Math.max(1, Math.round(y.get()))) - 1;
    put(out, table(["sınıf", ...Z.map((_, i) => i + 1)], [["z", ...Z.map((v) => f(v))], ["eᶻ", ...e.map((v) => f(v))], [`p = eᶻ / ${f(s)}`, ...p.map((v) => f(v))]], { cls: "center compact" }),
      h("p", {}, `Tahmin: ${p.indexOf(Math.max(...p)) + 1}. sınıf (olasılığı en yüksek olan). Doğru sınıf ${k + 1} olduğu için kayıp −ln p${sub(k + 1)} = −ln ${f(p[k])} = `, h("b", {}, f(-Math.log(p[k])))));
  });
  return el;
};

W.boundary = () => {
  const { el, body } = frame("Doğrusal karar sınırı: çiz, sınıfla, uzaklığı bul");
  const w = h("input", { type: "text", value: "1 -2", style: { width: "6rem" } });
  const b = num("b ", 1, { width: "4rem" });
  const t = h("input", { type: "text", value: "1 1; 3 1; 0 2; 4 3", style: { width: "12rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "w = ", w), b.label, h("label", {}, "noktalar: ", t)), out);
  live(body, () => {
    const Wv = parseNums(w.value), B = b.get();
    const P = t.value.split(/[;\n]/).map((s) => parseNums(s)).filter((p) => p.length === 2);
    if (Wv.length !== 2) return;
    const n = ml.norm(Wv);
    const rows = P.map((p) => { const z = ml.dot(Wv, p) + B; return [`(${p.join(", ")})`, `${f(Wv[0])}·${par(p[0])} ${pm(Wv[1])}·${par(p[1])} ${pm(B)} = ${f(z)}`, z >= 0 ? "+1" : "−1", f(Math.abs(z) / n)]; });
    const eq = Math.abs(Wv[1]) > 1e-12 ? `x₂ = ${f(-Wv[0] / Wv[1])}·x₁ ${pm(-B / Wv[1])}` : `x₁ = ${f(-B / Wv[0])}`;
    const plot = scatter({ ...bounds(P.map((x) => ({ x })), 0.4), equal: true, points: P.map((x) => ({ x, y: ml.dot(Wv, x) + B >= 0 ? 1 : -1, name: `(${x.join(",")})` })), shade: { w: Wv, b: B }, lines: [{ w: Wv, b: B }], xlabel: "x₁", ylabel: "x₂" });
    put(out, h("p", {}, `Sınır: ${lin(Wv, B)} = 0  ⇔  ${eq}. ‖w‖ = ${f(n)}; w sınıra diktir ve + tarafı gösterir.`),
      h("div", { class: "two-col" }, table(["nokta", "z", "ŷ (z ≥ 0 → +1)", "uzaklık |z|/‖w‖"], rows, { cls: "compact" }), plot),
      h("p", { class: "small muted" }, "w ve b'yi aynı sayıyla çarpın: sınır ve uzaklıklar değişmez, yalnız z'nin ölçeği değişir. SVM bu ölçeği kanonik biçimle (destek vektörlerinde |z| = 1) sabitler."));
  });
  return el;
};

// ======================================================================= week 5: trees
W.entropy = () => {
  const { el, body } = frame("Entropi ve Gini hesaplayıcı");
  const c = h("input", { type: "text", value: "5 2", style: { width: "8rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "sınıf sayıları: ", c)), out);
  live(body, () => {
    const v = parseNums(c.value).filter((x) => x >= 0);
    const n = ml.sum(v);
    if (!n) return;
    const terms = v.map((k) => (k ? `(${k}/${n})·log₂(${n}/${k})` : "0")), vals = v.map((k) => (k ? f((k / n) * -ml.log2(k / n)) : "0"));
    put(out, h("p", {}, "H = −Σ pᵢ log₂ pᵢ = ", terms.join(" + "), " = ", vals.join(" + "), " = ", h("b", {}, f(ml.entropy(v))), v.includes(0) ? " (0·log 0 = 0 kabul edilir)" : ""),
      h("p", {}, "Gini = 1 − Σ pᵢ² = 1 − ", v.map((k) => `(${k}/${n})²`).join(" − "), " = ", h("b", {}, f(ml.gini(v)))));
  });
  return el;
};

const DEFAULT_ID3 = `Boy Saç Göz Sınıf
kısa sarı mavi +
uzun sarı kahve -
uzun kızıl mavi +
uzun koyu kahve -
kısa koyu mavi -
uzun koyu mavi -
uzun sarı mavi +
kısa sarı kahve -`;
function treeText(t, pad = "", label = "") {
  const cnt = (n) => `[${n.counts.join("/")}]`;
  if (t.leaf) return `${pad}${label}→ ${t.label} ${cnt(t)}\n`;
  let s = `${pad}${label}${t.feature}? ${cnt(t)}\n`;
  for (const c of t.children) s += treeText(c.child, pad + "    ", `${c.value}: `);
  return s;
}
W.id3 = (ds) => {
  const { el, body } = frame("ID3 adım adım: her düğümde bütün adayların kazancı");
  const t = area(ds.data || DEFAULT_ID3, 9);
  const crit = select("ölçüt ", [["entropy", "entropi / bilgi kazancı"], ["gr", "kazanç oranı (C4.5)"], ["gini", "Gini"]], ds.crit || "entropy");
  const out = outBox();
  body.append(h("p", { class: "field-hint" }, "İlk satır sütun adları, son sütun sınıf. Değerler boşlukla ayrılır (boşluklu değerlere alt çizgi koyun)."), t, h("div", { class: "controls" }, crit.label), out);
  const state = { key: "", shown: -1, guess: null };
  const run = live(body, () => {
    const rows = parseRows(t.value);
    if (rows.length < 3) return;
    const head = rows[0], data = rows.slice(1).map((r) => Object.fromEntries(head.map((k, i) => [k, r[i]])));
    const target = head.at(-1), feats = head.slice(0, -1);
    const classes = ml.uniq(data.map((r) => r[target]));
    const mode = crit.get();
    const tree = ml.id3(data, feats, target, { classes, crit: mode === "gini" ? "gini" : "entropy", useGainRatio: mode === "gr" });
    const blocks = [];
    let maxDepth = 0;
    const walk = (node, path) => {
      if (node.leaf && !node.cands) return;
      maxDepth = Math.max(maxDepth, node.depth);
      const title = path.length ? path.join(" ∧ ") : "Kök";
      const imp = mode === "gini" ? "Gini" : "H";
      const part = [h("h4", {}, `${title}: n = ${node.rows.length}, sınıflar ${classes.map((c, i) => `${c}=${node.counts[i]}`).join(", ")}, ${imp} = ${f(node.imp)}`)];
      if (node.cands) {
        const rowsT = [];
        for (const c of node.cands) {
          c.branches.forEach((b, i) => rowsT.push({ row: [i === 0 ? c.feature : "", b.value, b.n, b.counts.join(" / "), f(b.imp), i === 0 ? f(c.weighted) : "", i === 0 ? f(c.gain) : "", mode === "gr" && i === 0 ? `${f(c.splitInfo)} → ${f(c.gainRatio)}` : ""], cls: !node.leaf && c.feature === node.feature ? "hl" : "" }));
        }
        const hd = ["öznitelik", "değer", "n", classes.join(" / "), imp, mode === "gini" ? "ağırlıklı Gini" : "ağırlıklı H", mode === "gini" ? "azalma" : "IG"];
        if (mode === "gr") hd.push("SplitInfo → GR");
        part.push(table(hd, rowsT, { cls: "compact" }));
        part.push(h("p", { class: "small" }, node.leaf ? "Hiçbir bölme kazanç getirmiyor: yaprak (çoğunluk sınıfı)." : `Seçilen: ${node.feature} (en büyük ${mode === "gini" ? "azalma" : mode === "gr" ? "kazanç oranı" : "kazanç"}). ${node.children.filter((c) => c.child.leaf).map((c) => `${node.feature} = ${c.value} dalı saf → yaprak “${c.child.label}”.`).join(" ")}`));
      }
      blocks.push({ depth: node.depth, part });
      if (!node.leaf) for (const c of node.children) walk(c.child, [...path, `${node.feature} = ${c.value}`]);
    };
    walk(tree, []);
    const key = t.value + mode;
    if (key !== state.key) { state.key = key; state.shown = -1; state.guess = null; }
    const rootGain = tree.cands ? Object.fromEntries(tree.cands.map((c) => [c.feature, mode === "gr" ? c.gainRatio : c.gain])) : {};
    if (state.shown < 0 && tree.cands) {
      put(out, h("div", { class: "guess" }, h("b", {}, "Önce tahmin et: "), `kökte hangi öznitelik olur? Tabloya bakın: hangi sütunun değerleri sınıfları en “saf” gruplara ayırıyor?`,
        h("div", { class: "btn-row" }, feats.map((ft) => h("button", { type: "button", class: "btn small", onclick: () => { state.guess = ft; state.shown = 0; run(); } }, ft)),
          h("button", { type: "button", class: "btn small", onclick: () => { state.shown = maxDepth; run(); } }, "Tahmin etmeden bütün çözümü göster"))));
      return;
    }
    const verdict = state.guess ? (state.guess === tree.feature ? h("div", { class: "goal done" }, `✓ Doğru: kök ${tree.feature}.`) : h("div", { class: "goal" }, `Tahminin ${state.guess} (kazanç ${f(rootGain[state.guess])}), ama ${tree.feature} daha çok kazandırıyor (${f(rootGain[tree.feature])}). Aşağıdaki tabloda nedenini görün.`)) : null;
    const visible = blocks.filter((b) => b.depth <= state.shown).flatMap((b) => b.part);
    const more = state.shown < maxDepth ? h("div", { class: "stepbar" }, h("button", { type: "button", class: "btn small primary", onclick: () => { state.shown++; run(); } }, `Sonraki seviyeyi göster (${state.shown + 2}. seviye) ▶`),
      h("button", { type: "button", class: "btn small", onclick: () => { state.shown = maxDepth; run(); } }, "Hepsini göster")) : null;
    put(out, verdict, ...visible, more, state.shown >= maxDepth ? [h("p", {}, h("strong", {}, "Son ağaç"), " (köşeli parantezde sınıf sayıları):"), h("div", { class: "tree" }, treeText(tree))] : null);
  });
  return el;
};

W.threshold = (ds) => {
  const { el, body } = frame("Sayısal öznitelikte en iyi eşik");
  const x = h("input", { type: "text", value: ds.x || "2 3 5 7 8", style: { width: "12rem" } });
  const y = h("input", { type: "text", value: ds.y || "E E H H E", style: { width: "12rem" } });
  const crit = select("ölçüt ", [["entropy", "entropi"], ["gini", "Gini"]], "entropy");
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "değerler: ", x), h("label", {}, "sınıflar: ", y), crit.label), out);
  live(body, () => {
    const a = parseNums(x.value), b = parseLabels(y.value, a.length);
    if (a.length !== b.length || a.length < 2) { put(out, errorBox("Aynı uzunlukta iki dizi girin.")); return; }
    const r = ml.thresholdTable(a, b, crit.get());
    const best = r.rows.reduce((p, q) => (q.gain > p.gain + 1e-12 ? q : p), r.rows[0]);
    const imp = (cnt) => (crit.get() === "gini" ? ml.gini(cnt) : ml.entropy(cnt));
    put(out, h("p", {}, "Sıralı: ", r.sorted.map(([v, c]) => `${f(v)}(${c})`).join("  "), ` · üst düğüm ${crit.get() === "gini" ? "Gini" : "H"} = ${f(r.parent)}`),
      table(["eşik t (orta nokta)", "sınıf değişiyor mu?", "sol x ≤ t", "sağ x > t", "ağırlıklı", "kazanç"], r.rows.map((q) => ({ row: [f(q.t), q.changes ? "evet" : "hayır", `${q.nl}: ${q.left.join("/")}`, `${q.nr}: ${q.right.join("/")}`, f(q.weighted), f(q.gain)], cls: q === best ? "hl" : "" })), { cls: "compact" }),
      steps([
        { what: "Değerleri küçükten büyüğe sıralarız ve aday eşikleri, yan yana duran iki değerin orta noktası olarak alırız.", formula: "aday eşik t = (aᵢ + aᵢ₊₁) / 2", calc: `adaylar: ${r.rows.map((q) => f(q.t)).join(", ")}` },
        { what: `Bölmeden önceki düğümün ${crit.get() === "gini" ? "Gini" : "entropi"} değerini buluruz.`, formula: crit.get() === "gini" ? "Gini = 1 − Σ pᵢ²" : "H = −Σ pᵢ·log₂ pᵢ", calc: `üst düğüm`, result: f(r.parent) },
        { what: "Her eşik için iki tarafın değerini, o tarafa düşen örneklerin oranıyla ağırlıklandırıp toplarız (tablonun “ağırlıklı” sütunu).", formula: crit.get() === "gini" ? "ağırlıklı = (n_sol / n)·Gini(sol) + (n_sağ / n)·Gini(sağ)" : "ağırlıklı = (n_sol / n)·H(sol) + (n_sağ / n)·H(sağ)",
          calc: `en iyi eşik t = ${f(best.t)} için: (${best.nl}/${best.nl + best.nr})·${f(imp(best.left))} + (${best.nr}/${best.nl + best.nr})·${f(imp(best.right))}`, result: f(best.weighted) },
        { what: "Kazanç, bölmenin belirsizliği ne kadar azalttığıdır; en büyük kazancı veren eşik seçilir.", formula: "kazanç = üst düğüm − ağırlıklı", calc: `${f(r.parent)} − ${f(best.weighted)}`, result: f(best.gain),
          note: `En iyi bölme x ≤ ${f(best.t)}. Sınavda yalnız sınıfın değiştiği eşiklere bakmak yeter: en iyi eşik her zaman onlardan biridir.` },
      ]));
  });
  return el;
};

W.regtree = () => {
  const { el, body } = frame("Regresyon ağacı: SSE ile bölme");
  const x = h("input", { type: "text", value: "1 2 3 4 5 6", style: { width: "10rem" } });
  const y = h("input", { type: "text", value: "1 2 2 9 10 12", style: { width: "10rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "x: ", x), h("label", {}, "y: ", y)), out);
  live(body, () => {
    const a = parseNums(x.value), b = parseNums(y.value);
    if (a.length !== b.length || a.length < 2) return;
    const r = ml.regressionSplits(a, b);
    const best = r.rows.reduce((p, q) => (q.total < p.total ? q : p));
    put(out, h("p", {}, `Kök (tek yaprak): tahmin ȳ = ${f(r.rootMean)}, SSE = ${f(r.root)}`),
      table(["eşik", "sol ortalama", "sol SSE", "sağ ortalama", "sağ SSE", "toplam SSE"], r.rows.map((q) => ({ row: [f(q.t), f(q.meanL), f(q.sseL), f(q.meanR), f(q.sseR), f(q.total)], cls: q === best ? "hl" : "" })), { cls: "compact" }),
      steps([
        { what: "Bölmeden önce bütün örnekler tek bir yapraktadır; yaprak ortalamayı tahmin eder ve hatası kareler toplamıdır.", formula: "SSE = Σ(y − ȳ)²", calc: `ȳ = ${f(r.rootMean)}, SSE`, result: f(r.root) },
        { what: "Her aday eşik için iki yaprağın kendi ortalamasını ve kendi SSE'sini hesaplarız (tablonun sütunları).", formula: "toplam SSE = Σ_sol (y − ȳ_sol)² + Σ_sağ (y − ȳ_sağ)²",
          calc: `en iyi eşik x ≤ ${f(best.t)} için: ${f(best.sseL)} + ${f(best.sseR)}`, result: f(best.total) },
        { what: "Toplam SSE'yi en çok düşüren eşik seçilir.", formula: "azalma = SSE(kök) − toplam SSE", calc: `${f(r.root)} − ${f(best.total)}`, result: f(r.root - best.total),
          note: `Sonuç: x ≤ ${f(best.t)} ise ${f(best.meanL)}, değilse ${f(best.meanR)} tahmin edilir. Her yaprak bir sabit tahmin eder; ağaç bir merdiven işlevidir.` },
      ]));
  });
  return el;
};

// ======================================================================= week 6: ensembles
W.vote = () => {
  const { el, body } = frame("Kalabalığın bilgeliği: bağımsız oyların çoğunluk hatası");
  const n = num("üye sayısı n (tek) ", 3, { step: 2, min: 1, width: "4rem" }), p = num("her birinin doğruluğu p ", 0.8, { step: 0.05, min: 0, max: 1, width: "4.5rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, n.label, p.label), out);
  live(body, () => {
    const N = Math.max(1, Math.round(n.get())) | 1, P = p.get();
    const terms = [];
    for (let k = Math.floor(N / 2) + 1; k <= N; k++) terms.push([`C(${N},${k})·${f(1 - P, 2)}${sup(k)}·${f(P, 2)}${sup(N - k)}`, f(ml.binom(N, k) * (1 - P) ** k * P ** (N - k), 4)]);
    const series = [1, 3, 5, 7, 9, 11, 15, 21, 31, 51].map((m) => [m, ml.majorityError(m, P)]);
    put(out, h("p", {}, "Çoğunluk ancak üyelerin yarısından fazlası yanılırsa yanılır. Bu olasılık ", terms.map((t) => t[0]).join(" + "), " = ", terms.map((t) => t[1]).join(" + "), " = ", h("b", {}, f(ml.majorityError(N, P), 4)), ` (tek üyenin hatası ${f(1 - P)})`),
      lines({ series: [{ pts: series, cls: "curve2", name: "çoğunluk hatası", color: "neg" }], xlim: [1, 51], ylim: [0, Math.max(0.5, 1 - P)], xlabel: "n", ylabel: "hata" }),
      h("p", { class: "small muted" }, "p < 0.5 deneyin: kalabalık bu sefer daha kötü olur. Asıl varsayım bağımsızlık: aynı veriyle eğitilen modeller aynı yerde yanılır; bagging, rastgele öznitelikler ve yeniden ağırlıklandırma çeşitlilik üretmek içindir."));
  });
  return el;
};

W.bootstrap = () => {
  const { el, body } = frame("Bootstrap: bir örneğin dışarıda kalma olasılığı");
  const n = num("n ", 10, { step: 1, min: 1, width: "5rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, n.label), out);
  live(body, () => {
    const N = Math.max(1, Math.round(n.get()));
    const q = ml.bootstrapOut(N);
    put(out, h("p", {}, `(1 − 1/${N})${sup(N)} = `, h("b", {}, f(q)), `. Yani bir bootstrap örneklemi ortalama olarak örneklerin yaklaşık %${f(100 * (1 - q), 1)} kadarını içerir; geri kalan %${f(100 * q, 1)} kadarı torba dışı (OOB) kalır. n → ∞ için e⁻¹ = 0.368.`));
  });
  return el;
};

W.adaboost = (ds) => {
  const { el, body } = frame("AdaBoost tur tur (karar kütükleriyle)");
  const t = area(ds.pts || "0 0 - A\n0 0.5 - B\n0 1 + C\n0.5 0 - D\n0.5 0.5 + E\n0.5 1 + F\n1 0.5 + G\n1 1 + H", 8);
  const T = num("tur ", 3, { step: 1, min: 1, width: "4rem" });
  const out = outBox();
  body.append(h("p", { class: "field-hint" }, "Varsayılan veri: 6. haftanın “cep bankası” (x₁ = bakiye, x₂ = yaş). Aday kütükler: her öznitelikte ardışık değerlerin ortasında “≥ eşik → +” ve “< eşik → +”."), t, h("div", { class: "controls" }, T.label), out);
  live(body, () => {
    let pts;
    try { pts = parsePoints(t.value); } catch (e) { put(out, errorBox(e.message)); return; }
    const pool = [];
    for (const j of [0, 1]) {
      const v = ml.uniq(pts.map((p) => p.x[j])).sort((a, b) => a - b);
      for (let i = 0; i + 1 < v.length; i++) { const th = (v[i] + v[i + 1]) / 2; pool.push({ name: `x${j + 1} ≥ ${f(th)} ise +`, f: (x) => (x[j] >= th ? 1 : -1) }); }
    }
    for (const j of [0, 1]) {
      const v = ml.uniq(pts.map((p) => p.x[j])).sort((a, b) => a - b);
      for (let i = 0; i + 1 < v.length; i++) { const th = (v[i] + v[i + 1]) / 2; pool.push({ name: `x${j + 1} < ${f(th)} ise +`, f: (x) => (x[j] < th ? 1 : -1) }); }
    }
    const res = ml.adaboost(pts.map((p) => p.x), pts.map((p) => p.y), pool, Math.min(20, Math.max(1, Math.round(T.get()))));
    const blocks = [];
    for (const r of res.rounds) {
      const top = [...r.cands].sort((a, b) => a.eps - b.eps).slice(0, 4);
      blocks.push(h("h4", {}, `Tur ${r.t}`), h("p", { class: "small" }, "En iyi adaylar (ağırlıklı hata ε): ", top.map((c) => `${c.name}: ${f(c.eps)}`).join(" · ")));
      if (r.stop) { blocks.push(h("p", {}, r.best.eps <= 1e-12 ? "Hatasız bir kütük var: dur." : "En iyi kütüğün hatası 0.5: yeni bilgi yok, dur.")); break; }
      blocks.push(table(["örnek", "y", "h(x)", "doğru?", "w (önce)", "çarpan", "w (sonra)"], pts.map((p, i) => ({ row: [p.name, signTxt(p.y), signTxt(r.best.h[i]), r.wrong[i] ? h("span", { class: "bad" }, "HAYIR") : "evet", f(r.w[i]), r.wrong[i] ? `× ${f(r.factorWrong)}` : `× ${f(r.factorRight)}`, f(r.next[i])], cls: r.wrong[i] ? "hl" : "" })), { cls: "compact" }),
        h("p", {}, `Seçilen h${r.t}: ${r.best.name}. ε = ${f(r.eps)}, α = ½ ln((1−ε)/ε) = ½ ln(${f((1 - r.eps) / r.eps)}) = `, h("b", {}, f(r.alpha)), `. Kestirme: yanlışlar × 1/(2ε), doğrular × 1/(2(1−ε)); normalleştirmeden sonra yanlışların toplam ağırlığı hep 0.5.`));
    }
    const used = res.rounds.filter((r) => !r.stop);
    const H = res.score;
    blocks.push(h("h4", {}, "Son oylama H(x) = sign(Σ αₜ hₜ(x))"), table(["örnek", "y", ...used.map((r) => `h${sub(r.t)} (α = ${f(r.alpha)})`), "Σ αh", "H", "doğru?"], pts.map((p, i) => [p.name, signTxt(p.y), ...used.map((r) => signTxt(r.best.h[i])), f(H[i]), signTxt(H[i] >= 0 ? 1 : -1), Math.sign(H[i]) === p.y ? "evet" : h("span", { class: "bad" }, "hayır")]), { cls: "compact" }));
    put(out, ...blocks);
  });
  return el;
};

W.gboost = () => {
  const { el, body } = frame("Gradyan artırma (kare kayıp): kalıntıya kütük uydur");
  const x = h("input", { type: "text", value: "1 2 3 4", style: { width: "8rem" } }), y = h("input", { type: "text", value: "1 3 5 7", style: { width: "8rem" } });
  const eta = num("η ", 0.5, { width: "4rem" }), R = num("tur ", 2, { step: 1, min: 1, width: "4rem" }), th = num("kütük eşiği (boş = en iyi) ", 2.5, { width: "4.5rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "x: ", x), h("label", {}, "y: ", y), eta.label, R.label, th.label), out);
  live(body, () => {
    const a = parseNums(x.value), b = parseNums(y.value);
    if (a.length !== b.length || a.length < 2) return;
    const thr = th.input.value === "" ? undefined : th.get();
    const res = ml.gradientBoost(a, b, eta.get(), Math.min(20, Math.max(1, Math.round(R.get()))), thr);
    const rows = [["F₀ = ȳ", ...res[0].F.map((v) => f(v)), f(res[0].mse)]];
    for (const r of res.slice(1)) {
      rows.push([`kalıntı r = y − F${sub(r.round - 1)}`, ...r.residuals.map((v) => f(v)), ""]);
      rows.push([`kütük x ≤ ${f(r.t)}: sol ${f(r.leftMean)}, sağ ${f(r.rightMean)}`, ...a.map((xi) => f(xi <= r.t ? r.leftMean : r.rightMean)), ""]);
      rows.push({ row: [`F${sub(r.round)} = F${sub(r.round - 1)} + η·f`, ...r.F.map((v) => f(v)), f(r.mse)], cls: "hl" });
    }
    put(out, table(["", ...a.map((v) => `x=${f(v)}`), "MSE"], rows, { cls: "compact" }), h("p", { class: "small muted" }, "η = 1 deneyin: ilk tur hızla iner ama aynı kütük ikinci turda hiçbir şey ekleyemez. Küçük η + çok ağaç (erken durdurmayla) daha iyi genelleşir."));
  });
  return el;
};

// ======================================================================= week 7: SVM
W.svmpoint = (ds) => {
  const { el, body } = frame("Marj, uzaklık ve menteşe kaybı");
  const w = h("input", { type: "text", value: ds.w || "1 2", style: { width: "6rem" } }), b = num("b ", Number(ds.b ?? -3), { width: "4rem" });
  const t = area(ds.pts || "2 2 +\n1 1 +\n3 0 -\n0 2 -", 4);
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "w = ", w), b.label), t, out);
  live(body, () => {
    const Wv = parseNums(w.value);
    let pts;
    try { pts = parsePoints(t.value); } catch (e) { put(out, errorBox(e.message)); return; }
    const n = ml.norm(Wv);
    put(out, h("p", {}, `‖w‖ = ${f(n)} · marj 1/‖w‖ = `, h("b", {}, f(1 / n)), " · sokak genişliği 2/‖w‖ = ", h("b", {}, f(2 / n))),
      table(["nokta", "y", "f(x) = w·x + b", "y·f(x)", "menteşe max(0, 1 − yf)", "uzaklık |f|/‖w‖", "konum"], pts.map((p) => { const r = ml.svmPoint(Wv, b.get(), p.x, p.y); return [`(${p.x.join(", ")})`, signTxt(p.y), f(r.f), f(r.yf), f(r.hinge), f(r.distance), r.where]; }), { cls: "compact" }),
      h("p", { class: "small muted" }, "Destek vektörü olabilecekler: y·f(x) ≤ 1 olanlar (α > 0). Sert marj çözümünde hepsi tam y·f = 1'dedir."));
  });
  return el;
};

W.hardsvm = (ds) => {
  const { el, body } = frame("Sert marjlı doğrusal SVM: destek vektörleri, w ve b");
  const t = area(ds.pts || "2 2 +\n3 1 +\n0 0 -\n1 0 -", 6);
  const add = select("tıklama ", [["+", "+ nokta ekler"], ["-", "− nokta ekler"]], "+");
  const out = outBox();
  body.append(h("p", { class: "field-hint" }, "Satırlar: x₁ x₂ etiket. Grafiğe tıklayarak da nokta ekleyebilirsiniz."), t, h("div", { class: "controls" }, add.label, button("Temizle", () => { t.value = ""; run(); })), out);
  const run = live(body, () => {
    let pts;
    try { pts = parsePoints(t.value); } catch (e) { put(out, errorBox(e.message)); return; }
    const onclick = (a, b2) => { t.value += `${t.value.trim() ? "\n" : ""}${Math.round(a * 2) / 2} ${Math.round(b2 * 2) / 2} ${add.get()}`; run(); };
    if (!pts.some((p) => p.y > 0) || !pts.some((p) => p.y < 0)) { put(out, h("p", {}, "İki sınıftan da en az bir nokta gerekli."), scatter({ xlim: [-1, 5], ylim: [-1, 5], points: pts, onclick })); return; }
    const s = ml.hardMarginSVM(pts);
    const B = bounds(pts, 0.3);
    if (!s) { put(out, h("p", { class: "bad" }, "Doğrusal ayrılamıyor: sert marj çözümü yok (yumuşak marj ya da çekirdek gerekir)."), scatter({ ...B, points: pts, onclick })); return; }
    const svNames = new Set(s.sv.map((p) => p.name));
    const alphas = ml.svmAlphas(s.w, s.sv);
    const plot = scatter({ ...B, equal: true, points: pts.map((p) => ({ ...p, sv: svNames.has(p.name) })), shade: { w: s.w, b: s.b }, lines: [{ w: s.w, b: s.b }, { w: s.w, b: s.b - 1, cls: "dash" }, { w: s.w, b: s.b + 1, cls: "dash" }], xlabel: "x₁", ylabel: "x₂", onclick });
    const eqs = s.sv.map((p) => `${f(p.x[0])}·w₁ + ${f(p.x[1])}·w₂ + b = ${signTxt(p.y)}`);
    const nonneg = alphas && alphas.every((a) => a > -1e-9);
    put(out, h("div", { class: "two-col" }, plot, h("div", {},
      h("p", {}, "Destek vektörleri (halkalı): ", s.sv.map((p) => `${p.name}(${p.x.join(", ")})`).join(", ")),
      h("p", { class: "small" }, "Kanonik denklemler: ", h("br"), ...eqs.flatMap((e) => [e, h("br")])),
      h("p", {}, "w = ", h("b", {}, vec(s.w)), ", b = ", h("b", {}, f(s.b))),
      h("p", {}, `Sınır: ${lin(s.w, s.b)} = 0 · ‖w‖ = ${f(s.norm)} · marj = `, h("b", {}, f(s.margin)), ` · sokak = ${f(s.width)}`),
      alphas && nonneg ? h("p", { class: "small" }, "İkil katsayılar (w = Σ αᵢyᵢxᵢ, Σ αᵢyᵢ = 0): ", s.sv.map((p, i) => `α_${p.name} = ${f(alphas[i])}`).join(", "), ". Diğer bütün noktalarda α = 0: silinseler çözüm değişmez.") : null)),
      table(["nokta", "y", "f(x)", "y·f(x)", ""], pts.map((p) => { const fx = ml.dot(s.w, p.x) + s.b; return { row: [p.name, signTxt(p.y), f(fx), f(p.y * fx), svNames.has(p.name) ? "destek vektörü (= 1)" : "sokağın dışında (> 1)"], cls: svNames.has(p.name) ? "hl" : "" }; }), { cls: "compact" }));
  });
  return el;
};

W.softsvm = () => {
  const { el, body } = frame("Yumuşak marj: iki adayı ½‖w‖² + C·Σξ ile karşılaştır");
  const t = area("0 0 -\n1 1 -\n3 0 +\n3 3 +\n1.5 2 +", 5);
  const w1 = h("input", { type: "text", value: "1 0", style: { width: "5rem" } }), b1 = num("b₁ ", -2, { width: "4rem" });
  const w2 = h("input", { type: "text", value: "2 2", style: { width: "5rem" } }), b2 = num("b₂ ", -5, { width: "4rem" });
  const C = h("input", { type: "text", value: "1 10", style: { width: "6rem" } });
  const out = outBox();
  body.append(t, h("div", { class: "controls" }, h("label", {}, "H1: w = ", w1), b1.label, h("label", {}, "H2: w = ", w2), b2.label, h("label", {}, "C değerleri: ", C)), out);
  live(body, () => {
    let pts;
    try { pts = parsePoints(t.value); } catch (e) { put(out, errorBox(e.message)); return; }
    const H = [[parseNums(w1.value), b1.get()], [parseNums(w2.value), b2.get()]];
    const Cs = parseNums(C.value);
    const objs = H.map(([w, b]) => ml.softObjective(w, b, pts, 1));
    const plot = scatter({ ...bounds(pts, 0.3), equal: true, points: pts, lines: [{ w: H[0][0], b: H[0][1], cls: "accent" }, { w: H[1][0], b: H[1][1] }], xlabel: "x₁", ylabel: "x₂" });
    put(out, h("div", { class: "two-col" }, table(["nokta", "y", "ξ (H1)", "ξ (H2)"], pts.map((p, i) => [`(${p.x.join(", ")})`, signTxt(p.y), f(objs[0].slacks[i]), f(objs[1].slacks[i])]), { cls: "compact" }), plot),
      table(["", "½‖w‖²", "Σξ", "marj 1/‖w‖", ...Cs.map((c) => `J (C = ${c})`)], H.map(([w], k) => [`H${k + 1} (çizgi: ${k ? "koyu" : "renkli"})`, f(objs[k].half), f(objs[k].sumXi), f(1 / ml.norm(w)), ...Cs.map((c) => { const J = objs[k].half + c * objs[k].sumXi, J2 = objs[1 - k].half + c * objs[1 - k].sumXi; return { v: f(J) + (J < J2 ? " ✓" : ""), cls: J < J2 ? "good" : "" }; })]), { cls: "compact" }),
      h("p", { class: "small muted" }, "Küçük C: geniş marj için birkaç ihlali göze alır (yüksek yanlılık, düşük varyans). Büyük C: ihlal pahalı, dar marj, aykırı noktayı izler (sert marja yaklaşır)."));
  });
  return el;
};

W.kernel = () => {
  const { el, body } = frame("Çekirdekler: polinom ve RBF");
  const x = h("input", { type: "text", value: "1 1", style: { width: "5rem" } }), z = h("input", { type: "text", value: "2 0", style: { width: "5rem" } });
  const g = num("γ ", 0.5, { width: "4rem" }), d = num("d ", 2, { step: 1, width: "3.5rem" }), r = num("r ", 0, { width: "3.5rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "x = ", x), h("label", {}, "z = ", z), g.label, d.label, r.label), out);
  live(body, () => {
    const X = parseNums(x.value), Z = parseNums(z.value);
    if (X.length !== Z.length) return;
    const d2 = ml.sum(X.map((v, i) => (v - Z[i]) ** 2));
    const extra = X.length === 2 && d.get() === 2 && r.get() === 0 && g.get() === 1
      ? (() => { const phi = (v) => [v[0] ** 2, Math.SQRT2 * v[0] * v[1], v[1] ** 2]; return h("p", { class: "small" }, `Açık özniteliklerle denetim: φ(x) = ${vec(phi(X))}, φ(z) = ${vec(phi(Z))}, φ(x)·φ(z) = ${f(ml.dot(phi(X), phi(Z)))}`); })()
      : h("p", { class: "small muted" }, "γ = 1, d = 2, r = 0 seçin: (x·z)² ile φ(x)·φ(z) aynı çıkar, φ(v) = (v₁², √2·v₁v₂, v₂²).");
    put(out, h("p", {}, `x·z = ${f(ml.dot(X, Z))} · doğrusal K = ${f(ml.kernels.linear(X, Z))}`),
      h("p", {}, `Polinom K = (γ x·z + r)ᵈ = (${f(g.get())}·${f(ml.dot(X, Z))} + ${f(r.get())})${sup(d.get())} = `, h("b", {}, f(ml.kernels.poly(X, Z, { gamma: g.get(), d: d.get(), r: r.get() })))),
      h("p", {}, `RBF K = exp(−γ‖x − z‖²) = exp(−${f(g.get())}·${f(d2)}) = `, h("b", {}, f(ml.kernels.rbf(X, Z, { gamma: g.get() })))), extra,
      h("p", { class: "small muted" }, "γ büyüdükçe benzerlik daha hızlı söner: her destek vektörü yalnız yakın çevresini etkiler, sınır noktaların etrafında adalar yapar (aşırı uyum)."));
  });
  return el;
};

// ======================================================================= week 8: neural networks
W.mlp = () => {
  const { el, body } = frame("2-2-1 ağı: ileri yayılım, geri yayılım, bir adım");
  const inputs = {
    W: h("input", { type: "text", value: "0.5 0.5; -1 1", style: { width: "8rem" } }), b: h("input", { type: "text", value: "0 -0.5", style: { width: "6rem" } }),
    v: h("input", { type: "text", value: "1 -1", style: { width: "5rem" } }), c: num("c ", -1, { width: "4rem" }),
    x: h("input", { type: "text", value: "1 2", style: { width: "5rem" } }),
  };
  const y = select("y ", [["1", "1"], ["0", "0"]], "1"), g = select("gizli etkinleştirme ", [["relu", "ReLU"], ["sigmoid", "sigmoid"], ["tanh", "tanh"]], "relu"), eta = num("η ", 0.1, { width: "4rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "W (satır = gizli nöron) ", inputs.W), h("label", {}, "b ", inputs.b), h("label", {}, "v ", inputs.v), inputs.c.label),
    h("div", { class: "controls" }, h("label", {}, "x ", inputs.x), y.label, g.label, eta.label), out);
  live(body, () => {
    const Wm = inputs.W.value.split(";").map(parseNums);
    const r = ml.mlp221({ W: Wm, b: parseNums(inputs.b.value), v: parseNums(inputs.v.value), c: inputs.c.get(), x: parseNums(inputs.x.value), y: Number(y.get()), hidden: g.get(), eta: eta.get() });
    const gn = ml.act[g.get()].name;
    put(out, h("h4", {}, "İleri yayılım"), table(["adım", "değer"], [
      ["z₁ = w₁₁x₁ + w₁₂x₂ + b₁", f(r.z[0])], [`h₁ = ${gn}(z₁)`, f(r.h[0])], ["z₂ = w₂₁x₁ + w₂₂x₂ + b₂", f(r.z[1])], [`h₂ = ${gn}(z₂)`, f(r.h[1])],
      ["u = v₁h₁ + v₂h₂ + c", f(r.u)], ["ŷ = σ(u)", f(r.yhat)], ["L = −[y ln ŷ + (1−y) ln(1−ŷ)]", f(r.loss)]], { cls: "compact" }),
    h("h4", {}, "Geri yayılım (delta kuralı)"), table(["büyüklük", "ifade", "değer"], [
      ["δ_out", "ŷ − y", f(r.dOut)], ["∂L/∂v₁", "δ_out · h₁", f(r.dv[0])], ["∂L/∂v₂", "δ_out · h₂", f(r.dv[1])], ["∂L/∂c", "δ_out", f(r.dc)],
      ["δ₁", `δ_out · v₁ · ${gn}′(z₁)`, f(r.delta[0])], ["δ₂", `δ_out · v₂ · ${gn}′(z₂)`, f(r.delta[1])],
      ["∂L/∂w₁₁, ∂L/∂w₁₂", "δ₁ · (x₁, x₂)", vec(r.dW[0])], ["∂L/∂w₂₁, ∂L/∂w₂₂", "δ₂ · (x₁, x₂)", vec(r.dW[1])], ["∂L/∂b₁, ∂L/∂b₂", "δ₁, δ₂", vec(r.db)]], { cls: "compact" }),
    h("p", {}, `Bir adım sonra (θ ← θ − η∇L): W = [${r.next.W.map((row) => vec(row)).join("; ")}], b = ${vec(r.next.b)}, v = ${vec(r.next.v)}, c = ${f(r.next.c)}`),
    r.z.some((z) => z <= 0) && g.get() === "relu" ? h("p", { class: "small bad" }, "Bir gizli nöronda z ≤ 0: ReLU′ = 0, o nöronun giriş ağırlıkları bu örnekte hiç güncellenmez (ölü ReLU).") : null);
  });
  return el;
};

/** Parse a Boolean formula (¬ ! ~ not, ∧ & and, ∨ | or, parentheses, x1 … xn) to DNF terms. */
export function parseBool(src) {
  const toks = src.replace(/[¬!]/g, " ! ").replace(/&+/g, " & ").replace(/\|+/g, " | ").replace(/∧/g, " & ").replace(/∨/g, " | ").replace(/\(/g, " ( ").replace(/\)/g, " ) ")
    .replace(/\bnot\b/gi, " ! ").replace(/\band\b|\bve\b/gi, " & ").replace(/\bor\b|\bveya\b/gi, " | ").replace(/~/g, " ! ").split(/\s+/).filter(Boolean);
  let i = 0;
  const peek = () => toks[i], eat = (t) => { if (toks[i] !== t) throw new Error(`“${t}” bekleniyordu`); i++; };
  const orE = () => { let n = andE(); while (peek() === "|") { i++; n = { op: "or", a: n, b: andE() }; } return n; };
  const andE = () => { let n = notE(); while (peek() === "&") { i++; n = { op: "and", a: n, b: notE() }; } return n; };
  const notE = () => { if (peek() === "!") { i++; return { op: "not", a: notE() }; } return atom(); };
  const atom = () => {
    const t = peek();
    if (t === "(") { i++; const n = orE(); eat(")"); return n; }
    const m = /^x_?(\d+)$/i.exec(t || "");
    if (!m) throw new Error(`anlaşılmayan simge: ${t ?? "(son)"}`);
    i++;
    return { op: "var", i: Number(m[1]) - 1 };
  };
  const ast = orE();
  if (i < toks.length) throw new Error(`fazladan simge: ${toks[i]}`);
  const dnf = (n, neg = false) => {
    if (n.op === "var") return [[{ i: n.i, neg }]];
    if (n.op === "not") return dnf(n.a, !neg);
    const isAnd = (n.op === "and") !== neg;
    const A = dnf(n.a, neg), B = dnf(n.b, neg);
    if (!isAnd) return [...A, ...B];
    return A.flatMap((x) => B.map((y) => [...x, ...y]));
  };
  let terms = dnf(ast).map((t) => {
    const seen = new Map();
    for (const l of t) { if (seen.has(l.i) && seen.get(l.i) !== l.neg) return null; seen.set(l.i, l.neg); }
    return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([k, neg]) => ({ i: k, neg }));
  }).filter(Boolean);
  const key = (t) => t.map((l) => (l.neg ? "!" : "") + l.i).join(",");
  const sub = (a, b) => a.every((l) => b.some((m) => m.i === l.i && m.neg === l.neg));
  terms = terms.filter((t, k) => !terms.some((u, j) => j !== k && sub(u, t) && (u.length < t.length || (u.length === t.length && j < k))));
  const uniqT = [...new Map(terms.map((t) => [key(t), t])).values()];
  const nVars = Math.max(0, ...uniqT.flat().map((l) => l.i + 1));
  return { ast, terms: uniqT, nVars };
}
W.boolmlp = (ds) => {
  const { el, body } = frame("Boole ifadesinden MLP (step etkinleştirme)");
  const inp = h("input", { type: "text", value: ds.expr || "(¬x1 ∧ ¬x2) ∧ (¬x3 ∨ ¬x4)", style: { width: "min(26rem, 100%)" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "ifade: ", inp)), h("p", { class: "field-hint" }, "¬ (ya da !), ∧ (&), ∨ (|), parantez ve x1, x2, … yazın. step(z) = 1 ⇔ z > 0."), out);
  live(body, () => {
    let r;
    try { r = parseBool(inp.value); } catch (e) { put(out, errorBox(e.message)); return; }
    if (!r.terms.length) { put(out, h("p", {}, "İfade hiçbir girdide doğru değil: çıktı nöronu w = 0, b = −1 (hep 0) yeter.")); return; }
    const net = ml.dnfToMLP(r.terms, r.nVars);
    const lit = (l) => (l.neg ? `¬x${sub(l.i + 1)}` : `x${sub(l.i + 1)}`);
    const unitRows = net.units.map((u, k) => [`h${sub(k + 1)}`, u.term.map(lit).join(" ∧ "), u.w.map((w, i) => (w ? `${w > 0 ? "+" : "−"}x${sub(i + 1)}` : "")).filter(Boolean).join(" ") + ` ${u.bias >= 0 ? "+" : "−"} ${f(Math.abs(u.bias))}`,
      (() => { const k = u.term.filter((l) => !l.neg).length; return k ? `${k} olumlu değişken olduğu için b = −${k} + 0.5 = ${f(0.5 - k)}` : "olumlu değişken olmadığı için b = 0 + 0.5 = 0.5"; })()]);
    const X = ml.allBinary(r.nVars);
    const evalAst = (n, x) => (n.op === "var" ? !!x[n.i] : n.op === "not" ? !evalAst(n.a, x) : n.op === "and" ? evalAst(n.a, x) && evalAst(n.b, x) : evalAst(n.a, x) || evalAst(n.b, x));
    const bad = X.filter((x) => ml.evalMLP(net, x).y !== (evalAst(r.ast, x) ? 1 : 0));
    const single = net.units.length === 1;
    put(out, h("p", {}, "VE'lerin VEYA'sı (DNF): ", h("strong", {}, r.terms.map((t) => "(" + t.map(lit).join(" ∧ ") + ")").join(" ∨ "))),
      table(["gizli nöron", "terim (VE)", "z = w·x + b", "neden bu bias?"], unitRows, { cls: "compact" }),
      h("p", {}, single ? "Tek terim var: bu nöronun kendisi çıktı olabilir (gizli katman gerekmez)." : `Çıktı nöronu (VEYA): y = step(${net.units.map((_, k) => `h${sub(k + 1)}`).join(" + ")} − 0.5).`),
      h("p", { class: "small" }, `Doğruluk tablosunun ${X.length} satırı denetlendi: `, bad.length ? h("span", { class: "bad" }, `${bad.length} satır tutmuyor!`) : h("span", { class: "good" }, "hepsi tutuyor ✓")),
      h("details", {}, h("summary", { class: "small" }, "Doğruluk tablosunu göster"), table([...Array.from({ length: r.nVars }, (_, i) => `x${sub(i + 1)}`), ...net.units.map((_, k) => `h${sub(k + 1)}`), "y"], X.map((x) => { const e = ml.evalMLP(net, x); return { row: [...x, ...e.h, e.y], cls: e.y ? "hl" : "" }; }), { cls: "center compact" })));
  });
  return el;
};

W.activations = () => {
  const { el, body } = frame("Etkinleştirme işlevleri ve türevleri");
  const z = num("z ", 0, { width: "4.5rem" });
  const out = outBox();
  body.append(h("div", { class: "controls" }, z.label), out);
  live(body, () => {
    const Z = z.get();
    const xs = Array.from({ length: 121 }, (_, i) => -6 + i * 0.1);
    put(out, h("div", { class: "two-col" },
      lines({ series: [{ pts: xs.map((x) => [x, ml.sigmoid(x)]), cls: "curve1", name: "sigmoid", color: "pos" }, { pts: xs.map((x) => [x, Math.tanh(x)]), cls: "curve2", name: "tanh", color: "neg" }, { pts: xs.map((x) => [x, Math.max(0, x) / 3]), cls: "curve3", name: "ReLU/3", color: "s3" }], xlim: [-6, 6], ylim: [-1, 2], xstep: 2, xlabel: "z" }),
      lines({ series: [{ pts: xs.map((x) => [x, ml.act.sigmoid.d(x)]), cls: "curve1", name: "σ′ (en çok 0.25)", color: "pos" }, { pts: xs.map((x) => [x, ml.act.tanh.d(x)]), cls: "curve2", name: "tanh′ (en çok 1)", color: "neg" }, { pts: xs.map((x) => [x, x > 0 ? 1 : 0]), cls: "curve3", name: "ReLU′", color: "s3" }], xlim: [-6, 6], ylim: [0, 1.1], xstep: 2, xlabel: "z" })),
    table(["işlev", "g(z)", "g′(z)"], ["sigmoid", "tanh", "relu", "step", "sign"].map((k) => [ml.act[k].name, f(ml.act[k].f(Z)), k === "step" || k === "sign" ? "0 (türev yok)" : f(ml.act[k].d(Z))]), { cls: "compact" }),
    h("p", { class: "small muted" }, "Kaybolan gradyan: geri yayılımda her sigmoid katmanı gradyanı en az 4 kat küçültür (σ′ ≤ 0.25); 10 katmanda 0.25¹⁰ ≈ 10⁻⁶. ReLU'nun türevi pozitif bölgede 1'dir."));
  });
  return el;
};

// ======================================================================= week 9: CNN
W.conv = () => {
  const { el, body } = frame("2B evrişim elle: dolgu ve adım");
  const img = area("1 2 0 1\n0 1 3 1\n2 1 0 0\n1 0 1 2", 4);
  const ker = area("1 0 -1\n1 0 -1\n1 0 -1", 3);
  const pad = h("input", { type: "text", value: "0", style: { width: "4rem" } }), st = h("input", { type: "text", value: "1", style: { width: "4rem" } });
  const out = outBox();
  body.append(h("div", { class: "two-col" }, h("div", {}, h("p", { class: "field-hint" }, "Girdi"), img), h("div", {}, h("p", { class: "field-hint" }, "Filtre (çekirdek)"), ker)),
    h("div", { class: "controls" }, h("label", {}, "dolgu p (satır sütun) ", pad), h("label", {}, "adım s (satır sütun) ", st)), out);
  live(body, () => {
    const I = parseRows(img.value).map((r) => r.map(Number)), K = parseRows(ker.value).map((r) => r.map(Number));
    if (!I.length || !K.length) return;
    const P = parseNums(pad.value), S = parseNums(st.value);
    const p2 = [P[0] ?? 0, P[1] ?? P[0] ?? 0], s2 = [S[0] ?? 1, S[1] ?? S[0] ?? 1];
    const o = ml.conv2d(I, K, { pad: p2, stride: s2 });
    const oh = ml.convOut(I.length, K.length, p2[0], s2[0]), ow = ml.convOut(I[0].length, K[0].length, p2[1], s2[1]);
    put(out, h("p", {}, `Çıktı boyutu: ⌊(${I.length} + 2·${p2[0]} − ${K.length})/${s2[0]}⌋ + 1 = ${oh} satır, ⌊(${I[0].length} + 2·${p2[1]} − ${K[0].length})/${s2[1]}⌋ + 1 = ${ow} sütun`),
      oh > 0 && ow > 0 ? table(null, o.map((r) => r.map((v) => ({ v: f(v), cls: "num" }))), { cls: "center compact" }) : errorBox("Filtre girdiden büyük."),
      h("p", { class: "small muted" }, "Derin öğrenme kütüphanelerindeki “evrişim” aslında çapraz ilişkidir: filtre ters çevrilmeden kaydırılır (bu araç da öyle yapar). Sol üst çıktı = filtre ile girdinin sol üst penceresinin eleman eleman çarpımlarının toplamı."));
  });
  return el;
};
W.convlayer = () => {
  const { el, body } = frame("Evrişim katmanı: çıktı boyutu ve parametre sayısı");
  const inp = h("input", { type: "text", value: "128 128 16", style: { width: "8rem" } }), k = h("input", { type: "text", value: "3 7", style: { width: "5rem" } });
  const F = num("filtre sayısı ", 64, { step: 1, width: "5rem" }), s = h("input", { type: "text", value: "2 3", style: { width: "5rem" } }), p = h("input", { type: "text", value: "1 2", style: { width: "5rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "girdi H W C ", inp), h("label", {}, "filtre kh kw ", k), F.label, h("label", {}, "adım ", s), h("label", {}, "dolgu ", p)), out);
  live(body, () => {
    const [H, Wd, C] = parseNums(inp.value), [kh, kw] = parseNums(k.value), S = parseNums(s.value), P = parseNums(p.value);
    const r = ml.convLayer({ inH: H, inW: Wd, inC: C, filters: F.get(), kh, kw, stride: [S[0], S[1] ?? S[0]], pad: [P[0], P[1] ?? P[0]] });
    put(out, h("p", {}, `Yükseklik ⌊(${H} + 2·${P[0]} − ${kh})/${S[0]}⌋ + 1 = ${r.oh}; genişlik ⌊(${Wd} + 2·${P[1] ?? P[0]} − ${kw})/${S[1] ?? S[0]}⌋ + 1 = ${r.ow}; çıktı `, h("b", {}, `${r.oh}×${r.ow}×${r.oc}`)),
      h("p", {}, `Ağırlık: ${F.get()} filtre × ${kh}×${kw}×${C} = `, h("b", {}, r.weights.toLocaleString("en-US")), " · bias: ", h("b", {}, r.biases), ` · toplam ${(r.weights + r.biases).toLocaleString("en-US")}`),
      h("p", { class: "small muted" }, "Her filtre girdinin bütün kanallarını kapsar (derinliği C); filtre sayısı çıktı kanal sayısıdır. Parametre sayısı girdinin yüksekliğine/genişliğine bağlı değildir: ağırlık paylaşımı."));
  });
  return el;
};

// ======================================================================= hyperparameter drill
export const HYPER = [
  { m: "Genel", hp: "Model esnekliği (derece M, öznitelik sayısı…)", b: "↓", v: "↑", r: "↑", why: "Daha esnek bir model gürültüye de uyar." },
  { m: "Genel", hp: "Eğitim örneği sayısı n", b: "=", v: "↓", r: "↓", why: "Daha çok veri modeli sabitler; modelin biçimini (yanlılığı) değiştirmez." },
  { m: "Genel", hp: "Düzenlileştirme gücü λ", b: "↑", v: "↓", r: "↓", why: "Katsayılar küçülür, model basitleşir." },
  { m: "kNN", hp: "k", b: "↑", v: "↓", r: "↓", why: "Daha çok komşunun ortalaması: sınır düzleşir; k = n çoğunluk sınıfı." },
  { m: "kNN", hp: "Öznitelik sayısı d (ilgisizler dahil)", b: "↓", v: "↑", r: "↑", why: "Boyut laneti: uzaklıklar anlamını yitirir." },
  { m: "kNN", hp: "1/d ağırlıklı oylama (açılırsa)", b: "↓", v: "↑", r: "↑", why: "En yakın komşu baskın olur, model yerelleşir." },
  { m: "PCA", hp: "Bileşen sayısı", b: "↓", v: "↑", r: "↑", why: "Daha çok bilgi ama daha çok gürültü de kalır." },
  { m: "Doğrusal", hp: "Polinom öznitelik derecesi", b: "↓", v: "↑", r: "↑", why: "Hipotez uzayı doğrulardan eğrilere büyür." },
  { m: "Doğrusal", hp: "scikit-learn C (= 1/λ)", b: "↓", v: "↑", r: "↑", why: "Büyük C daha az düzenlileştirme demektir." },
  { m: "Doğrusal / MLP", hp: "Gradyan inişi epoch sayısı (ezberleyebilen modelde)", b: "↓", v: "↑", r: "↑", why: "Uyum eğitim kümesinde sıkılaşır; erken durdurma bir düzenlileştiricidir." },
  { m: "Karar ağacı", hp: "max_depth", b: "↓", v: "↑", r: "↑", why: "Ağaç daha küçük bölgeler oyar; derinlik 1 = karar kütüğü." },
  { m: "Karar ağacı", hp: "min_samples_leaf / min_samples_split", b: "↑", v: "↓", r: "↓", why: "Yaprak başına daha çok örnek: daha basık, kararlı ağaç." },
  { m: "Karar ağacı", hp: "ccp_alpha (budama)", b: "↑", v: "↓", r: "↓", why: "Yaprak sayısı cezalandırılır." },
  { m: "Karar ağacı", hp: "Yaprak sayısı |T|", b: "↓", v: "↑", r: "↑", why: "Modelin karmaşıklığı doğrudan budur." },
  { m: "Rastgele orman", hp: "Ağaç sayısı B (n_estimators)", b: "=", v: "↓", r: "↓", why: "Ortalama daha kararlı olur; hata bir platoya iner, aşırı uyum artmaz. Bedeli zaman." },
  { m: "Rastgele orman", hp: "max_features m", b: "↓", v: "↑", r: "↑", why: "Ağaçlar birbirine benzer (korelasyon artar); m = p torbalamadır." },
  { m: "Rastgele orman", hp: "min_samples_leaf", b: "↑", v: "↓", r: "↓", why: "Gürültülü veride ağaçlar daha az ezberler." },
  { m: "Gradyan artırma", hp: "Ağaç / tur sayısı M", b: "↓", v: "↑", r: "↑", why: "Her tur kalıntıya biraz daha uyar; erken durdurmayla seçilir." },
  { m: "Gradyan artırma", hp: "Öğrenme oranı η", b: "↓", v: "↑", r: "↑", why: "Büyük adımlar kalıntının gürültüsüne hızla uyar." },
  { m: "Gradyan artırma", hp: "Ağaç derinliği", b: "↓", v: "↑", r: "↑", why: "Daha yüksek dereceden etkileşimler." },
  { m: "AdaBoost", hp: "Tur sayısı T", b: "↓", v: "↑", r: "↑", why: "Gürültülü etiketlerin ağırlığını büyütmeyi sürdürür." },
  { m: "SVM", hp: "C (ihlalin bedeli)", b: "↓", v: "↑", r: "↑", why: "Dar marj, az destek vektörü; C → ∞ sert marj." },
  { m: "SVM", hp: "RBF γ", b: "↓", v: "↑", r: "↑", why: "Dar tümsekler, noktaların etrafında adalar; γ → 0 doğrusala yaklaşır." },
  { m: "SVM", hp: "Polinom derecesi d", b: "↓", v: "↑", r: "↑", why: "Kapasite büyür; d > 3 nadiren gerekir." },
  { m: "MLP", hp: "Gizli nöron sayısı (genişlik)", b: "↓", v: "↑", r: "↑", why: "Daha esnek işlev (evrensel yaklaşım)." },
  { m: "MLP", hp: "Katman sayısı (derinlik)", b: "↓", v: "↑", r: "↑", why: "Aynı esneklik daha az nöronla; eğitimi daha zor." },
  { m: "MLP", hp: "Ağırlık sönümü λ (L2)", b: "↑", v: "↓", r: "↓", why: "Ridge ile aynı mantık." },
  { m: "MLP", hp: "Dropout oranı", b: "↑", v: "↓", r: "↓", why: "Her adımda nöronların bir kısmı kapanır: bir tür topluluk/düzenlileştirme." },
  { m: "MLP", hp: "Erken durdurma sabrı (patience)", b: "↓", v: "↑", r: "↑", why: "Daha büyük sabır daha uzun eğitir." },
  { m: "CNN", hp: "Evrişim katmanı / filtre sayısı", b: "↓", v: "↑", r: "↑", why: "Kapasite artar." },
  { m: "CNN", hp: "Havuzlama katmanı sayısı", b: "↑", v: "↓", r: "↓", why: "Uzamsal ayrıntı atılır, parametre azalır." },
];
W.hyper = (ds) => {
  const { el, body } = frame("“X artarsa?” alıştırması", "Alıştırma");
  const models = ml.uniq(HYPER.map((r) => r.m));
  const filt = select("model ", [["", "hepsi"], ...models.map((m) => [m, m])], ds.model || "");
  const out = outBox();
  const opts = [["", "?"], ["↑", "artar ↑"], ["↓", "azalır ↓"], ["=", "değişmez ="]];
  body.append(h("p", { class: "field-hint" }, "Her satırda yanlılık, varyans ve aşırı uyum riskini seçin, sonra denetleyin. Kural: model esnekleşiyorsa yanlılık düşer, varyans ve risk yükselir; katılaşıyorsa tersi."),
    h("div", { class: "controls" }, filt.label, button("Denetle", () => check(), "primary"), button("Cevapları göster", () => check(true)), button("Sıfırla", () => draw())), out);
  let rows = [];
  const draw = () => {
    const sel = HYPER.filter((r) => !filt.get() || r.m === filt.get());
    rows = sel.map((r) => ({ r, s: [0, 1, 2].map(() => h("select", {}, opts.map(([v, t]) => h("option", { value: v }, t)))), why: h("td", { class: "small muted" }), tr: null }));
    const tb = h("tbody", {}, rows.map((x) => (x.tr = h("tr", { class: "hp-row" }, h("td", {}, h("span", { class: "muted small" }, x.r.m + " · "), x.r.hp), ...x.s.map((s) => h("td", {}, s)), x.why))));
    put(out, h("div", { class: "table-wrap" }, h("table", { class: "simple" }, h("thead", {}, h("tr", {}, h("th", {}, "Arttıkça…"), h("th", {}, "Yanlılık"), h("th", {}, "Varyans"), h("th", {}, "Aşırı uyum riski"), h("th", {}, "Neden"))), tb)), h("p", { class: "hp-score" }));
  };
  const check = (reveal = false) => {
    let ok = 0;
    for (const x of rows) {
      const want = [x.r.b, x.r.v, x.r.r];
      if (reveal) x.s.forEach((s, i) => (s.value = want[i]));
      const good = x.s.every((s, i) => s.value === want[i]);
      x.s.forEach((s, i) => s.classList.toggle("no", s.value !== want[i]));
      x.tr.classList.toggle("ok", good); x.tr.classList.toggle("no", !good);
      x.why.textContent = x.r.why;
      if (good) ok++;
    }
    $(".hp-score", out).textContent = reveal ? "Cevaplar yazıldı." : `${ok} / ${rows.length} satır tamamen doğru.`;
  };
  filt.input.addEventListener("change", draw);
  draw();
  return el;
};

// ======================================================================= drill (random problems with answer checking)
const LN_TABLE = "ln 2 = 0.693, ln 3 = 1.099, ln 5 = 1.609, ln 7 = 1.946";
const GEN = {
  ig: { title: "Bilgi kazancı (ID3 kökü)", make(R) {
    const feats = ["A", "B", "C"], vals = [["a1", "a2"], ["b1", "b2", "b3"], ["c1", "c2"]];
    const n = R.int(6, 8);
    let rows;
    for (let tries = 0; tries < 50; tries++) {
      rows = Array.from({ length: n }, () => ({ A: R.pick(vals[0]), B: R.pick(vals[1]), C: R.pick(vals[2]), y: R() < 0.55 ? "+" : "−" }));
      const ys = rows.map((r) => r.y);
      if (ys.includes("+") && ys.includes("−") && feats.every((ft) => ml.uniq(rows.map((r) => r[ft])).length > 1)) break;
    }
    const stats = feats.map((ft) => ml.splitStats(rows, ft, "y", ["+", "−"]));
    return {
      prompt: [h("p", {}, "Her öznitelik için bilgi kazancını bulun (3 ondalık) ve kökü seçin."), table(["#", ...feats, "y"], rows.map((r, i) => [i + 1, r.A, r.B, r.C, r.y]), { cls: "center compact" })],
      fields: [{ label: "H(D)", v: ml.entropy(ml.countClasses(rows, "y", ["+", "−"])) }, ...stats.map((s) => ({ label: `IG(${s.feature})`, v: s.gain }))],
      solution: () => [table(["öznitelik", "dallar n(+/−) H", "ağırlıklı H", "IG"], stats.map((s) => [s.feature, s.branches.map((b) => `${b.value}: ${b.n}(${b.counts.join("/")}) ${f(b.imp)}`).join("; "), f(s.weighted), f(s.gain)]), { cls: "compact" }),
        h("p", {}, "Kök: ", h("b", {}, stats.reduce((a, b) => (b.gain > a.gain + 1e-12 ? b : a)).feature))],
    };
  } },
  metrics: { title: "Karmaşıklık matrisi ve ölçütler", make(R) {
    const n = R.int(10, 14);
    const y = Array.from({ length: n }, () => (R() < 0.45 ? 1 : 0)), p = y.map((t) => (R() < 0.75 ? t : 1 - t));
    if (!y.includes(1)) y[0] = 1;
    if (!p.includes(1)) p[1] = 1;
    const c = ml.confusion(y, p), m = ml.metrics(c);
    return {
      prompt: [h("p", {}, "Pozitif sınıf 1. Accuracy, precision, recall ve F1'i bulun."), table(["örnek", ...y.map((_, i) => i + 1)], [["gerçek", ...y], ["tahmin", ...p]], { cls: "center compact" })],
      fields: [{ label: "Accuracy", v: m.accuracy }, { label: "Precision", v: m.precision }, { label: "Recall", v: m.recall }, { label: "F1", v: m.f1 }],
      solution: () => [table(["örnek", ...y.map((_, i) => i + 1)], [["durum", ...c.tags.map(tag)]], { cls: "center compact" }), cmTable(c), metricRows(m, c)],
    };
  } },
  knn: { title: "kNN elle", make(R) {
    const pts = [];
    const used = new Set();
    while (pts.length < 7) { const x = [R.int(0, 7), R.int(0, 7)]; const k = x.join(); if (used.has(k)) continue; used.add(k); pts.push({ x, y: x[0] + x[1] + R.int(-2, 2) > 7 ? -1 : 1, name: String.fromCharCode(65 + pts.length) }); }
    let q; do { q = [R.int(1, 6), R.int(1, 6)]; } while (used.has(q.join()));
    const rank = ml.knnRank(pts, q);
    const ans = [1, 3, 5].map((k) => ml.knnVote(rank, k).label);
    return {
      prompt: [h("p", {}, `Sorgu q = (${q.join(", ")}). Öklid uzaklığıyla k = 1, 3, 5 için kararı +1 / −1 olarak yazın (eşitlikte sıradaki ad önce).`), table(["nokta", "x₁", "x₂", "sınıf"], pts.map((p) => [p.name, p.x[0], p.x[1], signTxt(p.y)]), { cls: "center compact" })],
      fields: ans.map((a, i) => ({ label: `k = ${[1, 3, 5][i]}`, v: a, tol: 0 })),
      solution: () => [table(["sıra", "nokta", "d²", "sınıf"], rank.map((p, i) => [i + 1, p.name, f(p.d), signTxt(p.y)]), { cls: "compact" }), h("p", {}, ans.map((a, i) => `k=${[1, 3, 5][i]}: ${signTxt(a)}`).join(" · "))],
    };
  } },
  perceptron: { title: "Perceptron, bir epoch", make(R) {
    const pts = Array.from({ length: 4 }, () => { const x = [R.int(-1, 3), R.int(-1, 3)]; return { x, y: x[0] - x[1] + R.pick([-0.5, 0.5]) > 0 ? 1 : -1 }; });
    const w0 = [R.pick([-1, -0.5, 0, 0.5]), R.pick([-0.5, 0, 0.5, 1])], b0 = R.pick([-0.5, 0, 0.5]), eta = R.pick([0.5, 1]);
    const r = ml.perceptron(pts, w0, b0, eta, { epochs: 1 });
    return {
      prompt: [h("p", {}, `Başlangıç w = ${vec(w0)}, b = ${f(b0)}, η = ${f(eta)}. z ≥ 0 ise ŷ = +1. Örnekleri sırayla bir kez işleyin; son w ve b nedir?`), table(["#", "x₁", "x₂", "y"], pts.map((p, i) => [i + 1, f(p.x[0]), f(p.x[1]), signTxt(p.y)]), { cls: "center compact" })],
      fields: [{ label: "w₁", v: r.w[0] }, { label: "w₂", v: r.w[1] }, { label: "b", v: r.b }],
      solution: () => [table(["#", "z", "ŷ", "hata?", "w", "b"], r.passes[0].steps.map((s) => [s.i + 1, f(s.z), signTxt(s.pred), s.wrong ? "evet" : "hayır", vec(s.w), f(s.b)]), { cls: "compact" })],
    };
  } },
  logistic: { title: "Lojistik regresyon adımı", make(R) {
    const x = [R.int(-1, 2), R.int(0, 2)], y = R.pick([0, 1]), eta = R.pick([0.2, 0.4, 0.5]);
    const r = ml.logisticStep([0, 0], 0, x, y, eta);
    return {
      prompt: [h("p", {}, `w = (0, 0), b = 0, η = ${eta}, tek örnek x = (${x.join(", ")}), y = ${y}. Bir gradyan adımından sonra w ve b?`)],
      fields: [{ label: "p (önce)", v: r.p }, { label: "w₁", v: r.w[0] }, { label: "w₂", v: r.w[1] }, { label: "b", v: r.b }],
      solution: () => [h("p", {}, `Başlangıçta w = 0 olduğu için z = 0 ve p = σ(0) = 0.5 olur. Çıktı hatası p − y = ${f(r.gb)}. ∇w = ${vec(r.gw)}. w = ${vec(r.w)}, b = ${f(r.b)}. Yeni p = σ(${f(r.z2)}) = ${f(r.p2)}.`)],
    };
  } },
  scaling: { title: "min-max ve z-score", make(R) {
    let xs; do { xs = Array.from({ length: R.int(4, 6) }, () => R.int(0, 12)); } while (ml.uniq(xs).length < 3);
    const t = R.int(0, 14);
    const mm = ml.minmax([t], xs).values[0], z = ml.zscore([t], xs);
    return {
      prompt: [h("p", {}, `Eğitim verisi: ${xs.join(", ")}. Test değeri ${t}'i eğitim parametreleriyle ölçekleyin (σ hesaplanırken kare toplamı n'ye bölünür).`)],
      fields: [{ label: "μ", v: z.mean }, { label: "σ", v: z.sd }, { label: "min-max", v: mm }, { label: "z", v: z.values[0] }],
      solution: () => [h("p", {}, `min = ${Math.min(...xs)}, max = ${Math.max(...xs)}, μ = ${f(z.mean)}, σ = ${f(z.sd)}. Bu değerlerle min-max sonucu ${f(mm)}, z-skoru ${f(z.values[0])} olur.`)],
    };
  } },
  auc: { title: "ROC-AUC (çift sayma)", make(R) {
    const n = R.int(6, 9);
    let l; do { l = Array.from({ length: n }, () => R() < 0.5); } while (!l.includes(true) || !l.includes(false));
    const r = ml.roc(l);
    return {
      prompt: [h("p", {}, `Skora göre sıralı (yüksekten düşüğe) gerçek sınıflar: ${l.map((v) => (v ? "+" : "−")).join(" ")}. AUC?`)],
      fields: [{ label: "AUC", v: r.auc }],
      solution: () => [h("p", {}, `${r.P} pozitif, ${r.N} negatif. Her negatifin önündeki pozitifler toplamı ${r.goodPairs} olduğu için AUC = ${r.goodPairs}/${r.pairs} = ${f(r.auc)}.`)],
    };
  } },
  adaboost: { title: "AdaBoost turu", make(R) {
    const n = R.pick([8, 10]), k = R.int(1, 3);
    const w = Array(n).fill(1 / n), y = Array(n).fill(1), hh = y.map((_, i) => (i < k ? -1 : 1));
    const r = ml.adaboostRound(w, y, hh);
    return {
      prompt: [h("p", {}, `${n} örnek, eşit ağırlık 1/${n}. Seçilen kütük ${k} örnekte yanılıyor. ε, α ve normalleştirilmiş yeni ağırlıklar? (${LN_TABLE})`)],
      fields: [{ label: "ε", v: r.eps }, { label: "α", v: r.alpha }, { label: "yanlış w", v: r.next[0] }, { label: "doğru w", v: r.next[n - 1] }],
      solution: () => [h("p", {}, `ε = ${k}/${n} = ${f(r.eps)}; α = ½ ln(${f(1 - r.eps)}/${f(r.eps)}) = ${f(r.alpha)}. Kestirme: yanlışlar × 1/(2ε) = ${f(r.factorWrong)} → ${f(r.next[0])}; doğrular × 1/(2(1−ε)) = ${f(r.factorRight)} → ${f(r.next[n - 1])}. Yanlışların toplamı 0.5.`)],
    };
  } },
  svm: { title: "SVM: f(x), uzaklık, menteşe", make(R) {
    const w = [R.int(-2, 2) || 1, R.int(-2, 2) || 1], b = R.int(-3, 3), x = [R.int(-1, 3), R.int(-1, 3)], y = R.pick([1, -1]);
    const p = ml.svmPoint(w, b, x, y);
    return {
      prompt: [h("p", {}, `w = ${vec(w)}, b = ${b}, nokta x = (${x.join(", ")}), y = ${signTxt(y)}. f(x), sınıra uzaklık, menteşe kaybı ve marj?`)],
      fields: [{ label: "f(x)", v: p.f }, { label: "uzaklık", v: p.distance }, { label: "menteşe", v: p.hinge }, { label: "marj 1/‖w‖", v: 1 / ml.norm(w) }],
      solution: () => [h("p", {}, `f = ${f(p.f)}, ‖w‖ = ${f(ml.norm(w))}, uzaklık |f|/‖w‖ = ${f(p.distance)}, y·f = ${f(p.yf)}; menteşe kaybı max(0, 1 − y·f) = ${f(p.hinge)} (${p.where}).`)],
    };
  } },
  lsq: { title: "En küçük kareler", make(R) {
    const x = [1, 2, 3, 4], a = R.pick([0.5, 1, 1.5, 2]), c = R.int(0, 2);
    const y = x.map((v) => Math.round(c + a * v + R.pick([-1, 0, 0, 1]) * 0.5 * 2) );
    const r = ml.leastSquares1(x, y);
    return {
      prompt: [h("p", {}, `x = (${x.join(", ")}), y = (${y.join(", ")}). y = w₀ + w₁x doğrusunu ve MSE'yi bulun.`)],
      fields: [{ label: "w₁", v: r.w1 }, { label: "w₀", v: r.w0 }, { label: "MSE", v: r.mse }],
      solution: () => [h("p", {}, `x̄ = ${f(r.xbar)}, ȳ = ${f(r.ybar)}, Σ(x−x̄)(y−ȳ) = ${f(r.sxy)}, Σ(x−x̄)² = ${f(r.sxx)}; buradan w₁ = ${f(r.w1)}, w₀ = ${f(r.w0)}; MSE = ${f(r.mse)}.`)],
    };
  } },
  vote: { title: "Çoğunluk oyu hatası", make(R) {
    const n = R.pick([3, 5]), p = R.pick([0.6, 0.7, 0.8, 0.9]);
    return { prompt: [h("p", {}, `${n} bağımsız sınıflandırıcı, her biri %${Math.round(p * 100)} doğru. Çoğunluk oyunun hata olasılığı?`)], fields: [{ label: "hata", v: ml.majorityError(n, p) }],
      solution: () => [h("p", {}, `En az ${Math.floor(n / 2) + 1} üye yanılmalı: Σ C(${n},k)·${f(1 - p, 1)}^k·${f(p, 1)}^(${n}−k) = ${f(ml.majorityError(n, p), 4)}.`)] };
  } },
  softmax: { title: "Softmax", make(R) {
    const z = [R.int(-1, 2), R.int(-1, 2), R.int(-1, 2)], k = R.int(0, 2);
    const p = ml.softmax(z);
    return { prompt: [h("p", {}, `Skorlar z = (${z.join(", ")}). Olasılıklar ve doğru sınıf ${k + 1} iken çapraz entropi kaybı? (e = 2.718, e⁻¹ = 0.368, e² = 7.389)`)],
      fields: [...p.map((v, i) => ({ label: `p${i + 1}`, v })), { label: "kayıp", v: -Math.log(p[k]) }],
      solution: () => [h("p", {}, `eᶻ = ${vec(z.map(Math.exp))}, toplamları ${f(ml.sum(z.map(Math.exp)))}; her birini bu toplama bölünce p = ${vec(p)}; −ln p${k + 1} = ${f(-Math.log(p[k]))}.`)] };
  } },
};
W.drill = (ds) => {
  const { el, body } = frame("Alıştırma üreteci", "Alıştırma");
  const types = Object.entries(GEN);
  const typ = select("soru türü ", [["any", "karışık"], ...types.map(([k, g]) => [k, g.title])], ds.type || store.get("drill-type", "any"));
  const seedIn = h("input", { type: "number", value: Math.floor(Math.random() * 99999), style: { width: "6.5rem" } });
  const out = outBox();
  let stats = store.get("drill-stats", { ok: 0, all: 0 });
  const scoreEl = h("span", { class: "small muted" });
  const paintScore = () => (scoreEl.textContent = stats.all ? `Bu tarayıcıda: ${stats.ok}/${stats.all} soru tam doğru` : "");
  body.append(h("div", { class: "controls" }, typ.label, h("label", {}, "soru no ", seedIn), button("Yeni soru", () => { seedIn.value = Math.floor(Math.random() * 99999); gen(); }, "primary"), scoreEl), out);
  const gen = () => {
    store.set("drill-type", typ.get());
    const seed = Number(seedIn.value) || 1;
    const R = ml.rng(seed);
    const key = typ.get() === "any" ? types[seed % types.length][0] : typ.get();
    const g = GEN[key];
    const p = g.make(R);
    const inputs = p.fields.map((fl) => ({ fl, input: h("input", { type: "text", inputmode: "decimal", "aria-label": fl.label }) }));
    const sol = h("div", { hidden: true });
    const verdict = h("p");
    let counted = false;
    const check = () => {
      let all = true;
      for (const { fl, input } of inputs) {
        const v = readNumber(input.value);
        const ok = input.value.trim() !== "" && Number.isFinite(v) && (Number.isNaN(fl.v) ? false : Math.abs(v - fl.v) <= (fl.tol ?? 0.006 + Math.abs(fl.v) * 0.002));
        input.classList.toggle("ok", ok); input.classList.toggle("no", !ok);
        all &&= ok;
      }
      verdict.replaceChildren(all ? h("span", { class: "verdict ok" }, "✓ Hepsi doğru.") : h("span", { class: "verdict no" }, "Kırmızı kutuları yeniden hesaplayın (3 ondalık yeter)."));
      if (!counted) { counted = true; stats = { ok: stats.ok + (all ? 1 : 0), all: stats.all + 1 }; store.set("drill-stats", stats); paintScore(); }
    };
    put(out, h("h4", {}, `${g.title} · soru ${seed}`), ...p.prompt,
      h("div", { class: "answer-row" }, inputs.map(({ fl, input }) => h("label", {}, fl.label + " = ", input))),
      h("div", { class: "btn-row" }, button("Denetle", check, "primary"), button("Çözümü göster", () => { sol.hidden = false; sol.replaceChildren(...p.solution(), h("p", { class: "small muted" }, "Beklenen: " + p.fields.map((fl) => `${fl.label} = ${f(fl.v)}`).join(", "))); })),
      verdict, sol);
  };
  typ.input.addEventListener("change", gen);
  seedIn.addEventListener("change", gen);
  paintScore();
  gen();
  return el;
};

// ======================================================================= index
W.countdown = () => {
  const box = h("div", { class: "countdown" });
  const target = new Date("2026-11-09T16:30:00+03:00");
  const paint = () => {
    const ms = target - new Date();
    if (ms <= 0) { box.replaceChildren(h("div", { class: "label" }, "Ara sınav"), h("div", { class: "when" }, "9 Kasım 2026 Pazartesi, 16:30 — geçti"), h("p", { class: "small" }, "Sıradaki: final, 7–18 Aralık (kesin tarih akademik takvimden). Final rehberine bakın.")); return; }
    const d = Math.floor(ms / 864e5), hh = Math.floor((ms % 864e5) / 36e5), mm = Math.floor((ms % 36e5) / 6e4), ss = Math.floor((ms % 6e4) / 1e3);
    box.replaceChildren(h("div", { class: "label" }, "Ara sınava kalan"), h("div", { class: "when" }, "9 Kasım 2026 Pazartesi, 16:30 · ders saatinde, her zamanki derslik"),
      h("div", { class: "digits" }, [[d, "gün"], [hh, "saat"], [mm, "dakika"], [ss, "saniye"]].map(([v, l]) => h("div", {}, h("b", {}, String(v).padStart(2, "0")), h("span", {}, l)))),
      h("p", { class: "small muted", style: { margin: "0.6rem 0 0" } }, "Kâğıt üzerinde · 1–7. haftalar · hesap makinesi yok · log ve üstel tablolar verilir"));
  };
  paint();
  setInterval(paint, 1000);
  return box;
};

// ======================================================================= interactive versions (drag, step, explore)
W.knn = I.knn;
W.hardsvm = I.hardsvm;
W.perceptron = I.perceptron;
W.lineplay = I.lineplay;
W.sigplay = I.sigplay;
W.entplay = I.entplay;
W.gdplay = I.gdplay;
W.threshplay = I.threshplay;
W.adaboost = I.adaboost;
