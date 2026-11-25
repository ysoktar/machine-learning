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
        // one sentence always visible; the try-this list and the takeaway fold away until asked for
        bodyEl.prepend(h("div", { class: "guide-lite" },
          h("p", {}, h("span", { class: "ic ic-guide", "aria-hidden": "true" }), " ", g.what),
          g.tryit?.length || g.see ? h("details", { class: "guide" }, h("summary", {}, "Ne denemeli, ne görmeli?"),
            g.tryit?.length ? h("ol", {}, g.tryit.map((t) => h("li", {}, t))) : null,
            g.see ? h("p", { class: "see" }, h("b", {}, "Ne görmelisin? "), g.see) : null) : null));
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
      scalingSvg(x, mm.values, z.values, t), h("p", { class: "small muted" }, "Üç doğru aynı noktaları gösterir: ölçekleme noktaların sırasını ve aralarındaki oranları korur, yalnız ekseni kaydırıp esnetir. min-max her şeyi [0, 1]'e, z-score ortalamayı 0'a ve yayılımı 1'e getirir."),
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
  const tmp = h("input", { type: "range", min: "0.25", max: "4", step: "0.25", value: "1", style: { width: "8rem" } }), tl = h("span", { class: "small" }, "T = 1");
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "skorlar z: ", z), y.label, h("label", {}, "sıcaklık (skorları T'ye böl) ", tmp, tl)), out);
  live(body, () => {
    const Tt = Number(tmp.value); tl.textContent = `T = ${Tt}`;
    const Z = parseNums(z.value).map((v) => v / Tt);
    if (!Z.length) return;
    const p = ml.softmax(Z), e = Z.map(Math.exp), s = ml.sum(e);
    const k = Math.min(Z.length, Math.max(1, Math.round(y.get()))) - 1;
    put(out, softmaxBars(Z, p, k), Tt !== 1 ? h("p", { class: "small" }, `Skorlar ${Tt}'e bölündü: T büyüdükçe olasılıklar eşitlenir, küçüldükçe en büyük skora yığılır. Sınavdaki softmax T = 1'dir.`) : null, table(["sınıf", ...Z.map((_, i) => i + 1)], [[Tt !== 1 ? "z/T" : "z", ...Z.map((v) => f(v))], ["eᶻ", ...e.map((v) => f(v))], [`p = eᶻ / ${f(s)}`, ...p.map((v) => f(v))]], { cls: "center compact" }),
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
    put(out, verdict, ...visible, more, state.shown >= maxDepth ? [h("p", {}, h("strong", {}, "Son ağaç"), " (köşeli parantezde sınıf sayıları):"), treeSvg(tree), h("details", {}, h("summary", { class: "small" }, "Ağacın metin hâli"), h("div", { class: "tree" }, treeText(tree)))] : null);
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
    put(out, thresholdSvg(r.sorted, r.rows, best), h("p", {}, "Sıralı: ", r.sorted.map(([v, c]) => `${f(v)}(${c})`).join("  "), ` · üst düğüm ${crit.get() === "gini" ? "Gini" : "H"} = ${f(r.parent)}`),
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
      mlpSvg(net, r.nVars),
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
  { m: "RNN / Transformer", hp: "Gizli boyut / katman sayısı", b: "↓", v: "↑", r: "↑", why: "Kapasite artar; az veride seyreltme gerekir." },
  { m: "RNN / Transformer", hp: "Gömme boyutu d", b: "↓", v: "↑", r: "↑", why: "Her kelime daha çok sayıyla temsil edilir; kapasite artar." },
  { m: "RNN / Transformer", hp: "Bağlam penceresi / dizi uzunluğu", b: "↓", v: "↑", r: "↑", why: "Daha çok bağlam görülür; dikkatin maliyeti n² ile büyür." },
  { m: "RNN / Transformer", hp: "Dikkat başı sayısı h (d sabit)", b: "=", v: "=", r: "=", why: "Her baş d/h boyutludur; toplam kapasite aynı kalır." },
  { m: "RNN / Transformer", hp: "İnce ayar epoch sayısı", b: "↓", v: "↑", r: "↑", why: "Küçük etiketli veriye giderek daha çok uyar; erken durdurmayla izlenir." },
  { m: "RNN / Transformer", hp: "İnce ayar öğrenme oranı", b: "=", v: "↑", r: "↑", why: "Büyük oran ön eğitimde öğrenilen bilgiyi siler." },
  { m: "k-ortalamalar", hp: "Küme sayısı k", b: "↓", v: "↑", r: "↑", why: "WCSS hep düşer; k = n iken her nokta kendi kümesidir." },
  { m: "Pekiştirmeli öğrenme", hp: "Durum sayısı", b: "↓", v: "↑", r: "↑", why: "Daha ince gösterim; ama her durum daha az ziyaret edilir ve kestirimler gürültülenir." },
  { m: "Pekiştirmeli öğrenme", hp: "Az keşif (yetersiz keşif)", b: "↑", v: "↑", r: "↑", why: "Ajan az sayıdaki deneyimine uyar; denenmemiş eylemlerin değerleri yanlış kalır ve yetersiz bir politikada takılır." },
  { m: "Pekiştirmeli öğrenme", hp: "Aşırı sömürü", b: "↑", v: "↑", r: "↑", why: "Hep bilinen en iyi eylem seçilir; daha iyi eylemler keşfedilmez ve politika gördüğü dar deneyime göre ezberlenir." },
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
  ig: { title: "Bilgi kazancı (ID3 kökü)", wk: 5, make(R) {
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
  metrics: { title: "Karmaşıklık matrisi ve ölçütler", wk: 2, make(R) {
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
  knn: { title: "kNN elle", wk: 3, make(R) {
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
  perceptron: { title: "Perceptron, bir epoch", wk: 4, make(R) {
    const pts = Array.from({ length: 4 }, () => { const x = [R.int(-1, 3), R.int(-1, 3)]; return { x, y: x[0] - x[1] + R.pick([-0.5, 0.5]) > 0 ? 1 : -1 }; });
    const w0 = [R.pick([-1, -0.5, 0, 0.5]), R.pick([-0.5, 0, 0.5, 1])], b0 = R.pick([-0.5, 0, 0.5]), eta = R.pick([0.5, 1]);
    const r = ml.perceptron(pts, w0, b0, eta, { epochs: 1 });
    return {
      prompt: [h("p", {}, `Başlangıç w = ${vec(w0)}, b = ${f(b0)}, η = ${f(eta)}. z ≥ 0 ise ŷ = +1. Örnekleri sırayla bir kez işleyin; son w ve b nedir?`), table(["#", "x₁", "x₂", "y"], pts.map((p, i) => [i + 1, f(p.x[0]), f(p.x[1]), signTxt(p.y)]), { cls: "center compact" })],
      fields: [{ label: "w₁", v: r.w[0] }, { label: "w₂", v: r.w[1] }, { label: "b", v: r.b }],
      solution: () => [table(["#", "z", "ŷ", "hata?", "w", "b"], r.passes[0].steps.map((s) => [s.i + 1, f(s.z), signTxt(s.pred), s.wrong ? "evet" : "hayır", vec(s.w), f(s.b)]), { cls: "compact" })],
    };
  } },
  logistic: { title: "Lojistik regresyon adımı", wk: 4, make(R) {
    const x = [R.int(-1, 2), R.int(0, 2)], y = R.pick([0, 1]), eta = R.pick([0.2, 0.4, 0.5]);
    const r = ml.logisticStep([0, 0], 0, x, y, eta);
    return {
      prompt: [h("p", {}, `w = (0, 0), b = 0, η = ${eta}, tek örnek x = (${x.join(", ")}), y = ${y}. Bir gradyan adımından sonra w ve b?`)],
      fields: [{ label: "p (önce)", v: r.p }, { label: "w₁", v: r.w[0] }, { label: "w₂", v: r.w[1] }, { label: "b", v: r.b }],
      solution: () => [h("p", {}, `Başlangıçta w = 0 olduğu için z = 0 ve p = σ(0) = 0.5 olur. Çıktı hatası p − y = ${f(r.gb)}. ∇w = ${vec(r.gw)}. w = ${vec(r.w)}, b = ${f(r.b)}. Yeni p = σ(${f(r.z2)}) = ${f(r.p2)}.`)],
    };
  } },
  scaling: { title: "min-max ve z-score", wk: 2, make(R) {
    let xs; do { xs = Array.from({ length: R.int(4, 6) }, () => R.int(0, 12)); } while (ml.uniq(xs).length < 3);
    const t = R.int(0, 14);
    const mm = ml.minmax([t], xs).values[0], z = ml.zscore([t], xs);
    return {
      prompt: [h("p", {}, `Eğitim verisi: ${xs.join(", ")}. Test değeri ${t}'i eğitim parametreleriyle ölçekleyin (σ hesaplanırken kare toplamı n'ye bölünür).`)],
      fields: [{ label: "μ", v: z.mean }, { label: "σ", v: z.sd }, { label: "min-max", v: mm }, { label: "z", v: z.values[0] }],
      solution: () => [h("p", {}, `min = ${Math.min(...xs)}, max = ${Math.max(...xs)}, μ = ${f(z.mean)}, σ = ${f(z.sd)}. Bu değerlerle min-max sonucu ${f(mm)}, z-skoru ${f(z.values[0])} olur.`)],
    };
  } },
  auc: { title: "ROC-AUC (çift sayma)", wk: 2, make(R) {
    const n = R.int(6, 9);
    let l; do { l = Array.from({ length: n }, () => R() < 0.5); } while (!l.includes(true) || !l.includes(false));
    const r = ml.roc(l);
    return {
      prompt: [h("p", {}, `Skora göre sıralı (yüksekten düşüğe) gerçek sınıflar: ${l.map((v) => (v ? "+" : "−")).join(" ")}. AUC?`)],
      fields: [{ label: "AUC", v: r.auc }],
      solution: () => [h("p", {}, `${r.P} pozitif, ${r.N} negatif. Her negatifin önündeki pozitifler toplamı ${r.goodPairs} olduğu için AUC = ${r.goodPairs}/${r.pairs} = ${f(r.auc)}.`)],
    };
  } },
  adaboost: { title: "AdaBoost turu", wk: 6, make(R) {
    const n = R.pick([8, 10]), k = R.int(1, 3);
    const w = Array(n).fill(1 / n), y = Array(n).fill(1), hh = y.map((_, i) => (i < k ? -1 : 1));
    const r = ml.adaboostRound(w, y, hh);
    return {
      prompt: [h("p", {}, `${n} örnek, eşit ağırlık 1/${n}. Seçilen kütük ${k} örnekte yanılıyor. ε, α ve normalleştirilmiş yeni ağırlıklar? (${LN_TABLE})`)],
      fields: [{ label: "ε", v: r.eps }, { label: "α", v: r.alpha }, { label: "yanlış w", v: r.next[0] }, { label: "doğru w", v: r.next[n - 1] }],
      solution: () => [h("p", {}, `ε = ${k}/${n} = ${f(r.eps)}; α = ½ ln(${f(1 - r.eps)}/${f(r.eps)}) = ${f(r.alpha)}. Kestirme: yanlışlar × 1/(2ε) = ${f(r.factorWrong)} → ${f(r.next[0])}; doğrular × 1/(2(1−ε)) = ${f(r.factorRight)} → ${f(r.next[n - 1])}. Yanlışların toplamı 0.5.`)],
    };
  } },
  svm: { title: "SVM: f(x), uzaklık, menteşe", wk: 7, make(R) {
    const w = [R.int(-2, 2) || 1, R.int(-2, 2) || 1], b = R.int(-3, 3), x = [R.int(-1, 3), R.int(-1, 3)], y = R.pick([1, -1]);
    const p = ml.svmPoint(w, b, x, y);
    return {
      prompt: [h("p", {}, `w = ${vec(w)}, b = ${b}, nokta x = (${x.join(", ")}), y = ${signTxt(y)}. f(x), sınıra uzaklık, menteşe kaybı ve marj?`)],
      fields: [{ label: "f(x)", v: p.f }, { label: "uzaklık", v: p.distance }, { label: "menteşe", v: p.hinge }, { label: "marj 1/‖w‖", v: 1 / ml.norm(w) }],
      solution: () => [h("p", {}, `f = ${f(p.f)}, ‖w‖ = ${f(ml.norm(w))}, uzaklık |f|/‖w‖ = ${f(p.distance)}, y·f = ${f(p.yf)}; menteşe kaybı max(0, 1 − y·f) = ${f(p.hinge)} (${p.where}).`)],
    };
  } },
  lsq: { title: "En küçük kareler", wk: 4, make(R) {
    const x = [1, 2, 3, 4], a = R.pick([0.5, 1, 1.5, 2]), c = R.int(0, 2);
    const y = x.map((v) => Math.round(c + a * v + R.pick([-1, 0, 0, 1]) * 0.5 * 2) );
    const r = ml.leastSquares1(x, y);
    return {
      prompt: [h("p", {}, `x = (${x.join(", ")}), y = (${y.join(", ")}). y = w₀ + w₁x doğrusunu ve MSE'yi bulun.`)],
      fields: [{ label: "w₁", v: r.w1 }, { label: "w₀", v: r.w0 }, { label: "MSE", v: r.mse }],
      solution: () => [h("p", {}, `x̄ = ${f(r.xbar)}, ȳ = ${f(r.ybar)}, Σ(x−x̄)(y−ȳ) = ${f(r.sxy)}, Σ(x−x̄)² = ${f(r.sxx)}; buradan w₁ = ${f(r.w1)}, w₀ = ${f(r.w0)}; MSE = ${f(r.mse)}.`)],
    };
  } },
  vote: { title: "Çoğunluk oyu hatası", wk: 6, make(R) {
    const n = R.pick([3, 5]), p = R.pick([0.6, 0.7, 0.8, 0.9]);
    return { prompt: [h("p", {}, `${n} bağımsız sınıflandırıcı, her biri %${Math.round(p * 100)} doğru. Çoğunluk oyunun hata olasılığı?`)], fields: [{ label: "hata", v: ml.majorityError(n, p) }],
      solution: () => [h("p", {}, `En az ${Math.floor(n / 2) + 1} üye yanılmalı: Σ C(${n},k)·${f(1 - p, 1)}^k·${f(p, 1)}^(${n}−k) = ${f(ml.majorityError(n, p), 4)}.`)] };
  } },
  softmax: { title: "Softmax", wk: 4, make(R) {
    const z = [R.int(-1, 2), R.int(-1, 2), R.int(-1, 2)], k = R.int(0, 2);
    const p = ml.softmax(z);
    return { prompt: [h("p", {}, `Skorlar z = (${z.join(", ")}). Olasılıklar ve doğru sınıf ${k + 1} iken çapraz entropi kaybı? (e = 2.718, e⁻¹ = 0.368, e² = 7.389)`)],
      fields: [...p.map((v, i) => ({ label: `p${i + 1}`, v })), { label: "kayıp", v: -Math.log(p[k]) }],
      solution: () => [h("p", {}, `eᶻ = ${vec(z.map(Math.exp))}, toplamları ${f(ml.sum(z.map(Math.exp)))}; her birini bu toplama bölünce p = ${vec(p)}; −ln p${k + 1} = ${f(-Math.log(p[k]))}.`)] };
  } },
  // ---------------------------------------------------------------- final topics (weeks 9–12); wk = page that teaches it
  convsize: { title: "Evrişim: çıktı boyutu ve parametre", wk: 9, make(R) {
    const n = R.pick([28, 32, 64, 100, 128]), k = R.pick([3, 5, 7]), p = R.pick([0, 1, 2]), s = R.pick([1, 2, 3]), C = R.pick([1, 3, 16, 32]), F = R.pick([8, 16, 32, 64]);
    const o = Math.floor((n + 2 * p - k) / s) + 1, par = (k * k * C + 1) * F;
    return {
      prompt: [h("p", {}, `Girdi ${n}×${n}×${C}; ${F} tane ${k}×${k} filtre, dolgu p = ${p}, adım s = ${s}. Çıktının yüksekliği (= genişliği) ve katmanın toplam parametre sayısı?`)],
      fields: [{ label: "çıktı boyu", v: o, tol: 0 }, { label: "parametre", v: par, tol: 0 }],
      solution: () => [steps([
        { what: "Çıktı boyu formülü (aşağı yuvarla, sonra 1 ekle).", formula: "⌊(n + 2p − k)/s⌋ + 1", calc: `⌊(${n} + ${2 * p} − ${k})/${s}⌋ + 1 = ⌊${f((n + 2 * p - k) / s)}⌋ + 1`, result: String(o) },
        { what: "Her filtre bütün girdi kanallarına bakar ve bir bias taşır.", formula: "(k·k·C_in + 1)·F", calc: `(${k}·${k}·${C} + 1)·${F} = ${k * k * C + 1}·${F}`, result: par.toLocaleString("en-US"), note: `Çıktı ${o}×${o}×${F}; parametre sayısı girdinin ${n}×${n} boyutuna bağlı değildir.` },
      ])],
    };
  } },
  conv1d: { title: "1B evrişim (dolgu ve adım)", wk: 9, make(R) {
    const L = 7, x = Array.from({ length: L }, () => R.int(-3, 6)), g = R.pick([[1, 0, -1], [-1, 0, 1], [1, 2, 1], [1, 1, 1], [0, 1, -1]]), p = R.pick([0, 1]), s = R.pick([1, 2]);
    const xp = [...Array(p).fill(0), ...x, ...Array(p).fill(0)], len = Math.floor((L + 2 * p - 3) / s) + 1;
    const out = Array.from({ length: len }, (_, i) => ml.sum(g.map((w, j) => w * xp[i * s + j])));
    return {
      prompt: [h("p", {}, `f = (${x.map(f).join(", ")}), filtre g = (${g.map(f).join(", ")}), sıfır dolgu p = ${p}, adım s = ${s}. Çıktının uzunluğu, ilk ve son değeri?`)],
      fields: [{ label: "uzunluk", v: len, tol: 0 }, { label: "ilk", v: out[0], tol: 0 }, { label: "son", v: out[len - 1], tol: 0 }],
      solution: () => [steps([
        { what: "Uzunluk formülü.", formula: "⌊(n + 2p − k)/s⌋ + 1", calc: `⌊(${L} + ${2 * p} − 3)/${s}⌋ + 1`, result: String(len) },
        { what: p ? "Sinyalin iki ucuna birer 0 eklenir." : "Dolgu yok.", calc: `(${xp.map(f).join(", ")})` },
        { what: `Filtre ${s} adım kayarak her pencerede çarpıp toplar.`, calc: out.map((v, i) => `(${xp.slice(i * s, i * s + 3).map(f).join(", ")})·g = ${f(v)}`).join(";  ") },
      ])],
    };
  } },
  rnnp: { title: "RNN / LSTM / GRU parametresi", wk: 10, make(R) {
    const d = R.pick([4, 8, 10, 16, 32, 50, 64, 128]), hh = R.pick([3, 8, 16, 20, 32, 64, 100, 256]), g = hh * (d + hh) + hh;
    return {
      prompt: [h("p", {}, `Girdi boyutu d = ${d}, gizli boyut h = ${hh}. Bir grubun, LSTM'in ve GRU'nun parametre sayısı?`)],
      fields: [{ label: "grup", v: g, tol: 0 }, { label: "LSTM", v: 4 * g, tol: 0 }, { label: "GRU", v: 3 * g, tol: 0 }],
      solution: () => [steps([
        { what: "Bir kapı, girdi ile önceki gizli durumun birleşimine (d + h) bakan h çıkışlı bir katmandır.", formula: "h·(d + h) + h", calc: `${hh}·${d + hh} + ${hh}`, result: g.toLocaleString("en-US") },
        { what: "LSTM 4 grup (unutma, girdi, çıktı, aday); GRU 3 grup.", formula: "4·grup, 3·grup", calc: `4·${g} ve 3·${g}`, result: `${(4 * g).toLocaleString("en-US")} ve ${(3 * g).toLocaleString("en-US")}` },
      ])],
    };
  } },
  attn: { title: "Dikkat ağırlıkları (iki anahtar)", wk: 10, make(R) {
    const q = [R.int(0, 2), R.int(0, 2)];
    if (!q[0] && !q[1]) q[0] = 1;
    const K = [[R.int(0, 2), R.int(0, 2)], [R.int(0, 2), R.int(0, 2)]], V = [[R.int(0, 4), R.int(0, 4)], [R.int(0, 4), R.int(0, 4)]];
    const sc = K.map((k) => dot(q, k) / Math.SQRT2), e = sc.map(Math.exp), a = e.map((x) => x / ml.sum(e)), z = [0, 1].map((c) => a[0] * V[0][c] + a[1] * V[1][c]);
    return {
      prompt: [h("p", {}, `q = ${vec(q)}; k₁ = ${vec(K[0])}, k₂ = ${vec(K[1])}; v₁ = ${vec(V[0])}, v₂ = ${vec(V[1])}; dₖ = 2. Ölçekli skorların üstelleri: e^${f(sc[0])} ≈ ${f(e[0])}, e^${f(sc[1])} ≈ ${f(e[1])}. a₁ ve çıktının iki bileşeni?`)],
      fields: [{ label: "a₁", v: a[0], tol: 0.006 }, { label: "z₁", v: z[0], tol: 0.02 }, { label: "z₂", v: z[1], tol: 0.02 }],
      solution: () => [steps([
        { what: "Skorlar: iç çarpım, sonra √2'ye böl.", formula: "q·kⱼ/√dₖ", calc: `${dot(q, K[0])}/1.414 = ${f(sc[0])};  ${dot(q, K[1])}/1.414 = ${f(sc[1])}` },
        { what: "Softmax: üstelleri toplamlarına böl.", formula: "aⱼ = eˢʲ/Σ eˢ", calc: `${f(e[0])}/(${f(e[0])} + ${f(e[1])})`, result: `a₁ = ${f(a[0])}, a₂ = ${f(a[1])}` },
        { what: "Değerlerin ağırlıklı toplamı.", formula: "z = a₁v₁ + a₂v₂", calc: `${f(a[0])}·${vec(V[0])} + ${f(a[1])}·${vec(V[1])}`, result: vec(z) },
      ])],
    };
  } },
  cos: { title: "Kosinüs benzerliği", wk: 10, make(R) {
    const u = [R.int(0, 3), R.int(0, 3), R.int(0, 3)], v = [R.int(0, 3), R.int(0, 3), R.int(0, 3)];
    if (!norm(u)) u[0] = 1;
    if (!norm(v)) v[2] = 2;
    const c = dot(u, v) / (norm(u) * norm(v));
    return {
      prompt: [h("p", {}, `u = ${vec(u)}, v = ${vec(v)}. İç çarpım ve kosinüs benzerliği?`)],
      fields: [{ label: "u·v", v: dot(u, v), tol: 0 }, { label: "cos", v: c }],
      solution: () => [steps([
        { what: "İç çarpım.", formula: "Σ uᵢvᵢ", calc: dotTxt(u, v), result: f(dot(u, v)) },
        { what: "Uzunluklar.", formula: "‖u‖ = √Σ uᵢ²", calc: `‖u‖ = ${f(norm(u))}, ‖v‖`, result: f(norm(v)) },
        { what: "Böl.", formula: "u·v/(‖u‖‖v‖)", calc: `${f(dot(u, v))}/(${f(norm(u))}·${f(norm(v))})`, result: f(c) },
      ])],
    };
  } },
  skipgram: { title: "Word2Vec: skip-gram çift sayısı", wk: 10, make(R) {
    const n = R.int(5, 9), w = R.int(1, 3), cnt = Array.from({ length: n }, (_, i) => Math.min(i, w) + Math.min(n - 1 - i, w));
    return {
      prompt: [h("p", {}, `${n} kelimelik bir cümle, pencere = ${w} (her yönde ${w} komşu). Kaç skip-gram eğitim çifti çıkar? İkinci kelimenin kaç çifti vardır?`)],
      fields: [{ label: "toplam", v: ml.sum(cnt), tol: 0 }, { label: "2. kelime", v: cnt[1], tol: 0 }],
      solution: () => [steps([
        { what: "Her kelime solundan ve sağından en çok pencere kadar komşu alır; uçlarda daha az.", calc: cnt.map((c, i) => `${i + 1}. kelime: ${c}`).join(", ") },
        { what: "Komşu sayılarını topla.", calc: cnt.join(" + "), result: String(ml.sum(cnt)) },
      ])],
    };
  } },
  kmeans1: { title: "k-ortalamalar: bir yineleme", wk: 11, make(R) {
    let P, c, a;
    for (let t = 0; t < 40; t++) {
      P = ml.uniq(Array.from({ length: 6 }, () => R.int(0, 14))).sort((x, y) => x - y);
      if (P.length < 5) continue;
      c = [R.pick(P), R.pick(P)].sort((x, y) => x - y);
      if (c[0] === c[1]) continue;
      a = P.map((p) => (Math.abs(p - c[0]) < Math.abs(p - c[1]) ? 0 : Math.abs(p - c[0]) > Math.abs(p - c[1]) ? 1 : -1));
      if (!a.includes(-1) && a.includes(0) && a.includes(1)) break;
    }
    const m = [0, 1].map((j) => ml.sum(P.filter((_, i) => a[i] === j)) / P.filter((_, i) => a[i] === j).length);
    return {
      prompt: [h("p", {}, `Noktalar ${P.join(", ")}; merkezler m₁ = ${c[0]}, m₂ = ${c[1]}. Bir yineleme (atama ve güncelleme) sonra yeni merkezler?`)],
      fields: [{ label: "m₁", v: m[0] }, { label: "m₂", v: m[1] }],
      solution: () => [steps([
        { what: "Her noktayı en yakın merkeze ata.", calc: P.map((p, i) => `${p}: |${p} − ${c[0]}| = ${Math.abs(p - c[0])}, |${p} − ${c[1]}| = ${Math.abs(p - c[1])}, küme ${a[i] + 1}`).join(";  ") },
        { what: "Her merkez kümesinin ortalaması olur.", formula: "mⱼ = ortalama", calc: [0, 1].map((j) => `m${sub(j + 1)} = (${P.filter((_, i) => a[i] === j).join(" + ")})/${P.filter((_, i) => a[i] === j).length}`).join(";  "), result: `${f(m[0])}, ${f(m[1])}` },
      ])],
    };
  } },
  rlreturn: { title: "İndirimli getiri", wk: 12, make(R) {
    const nR = R.int(3, 4), r = Array.from({ length: nR }, (_, i) => (i === nR - 1 ? R.pick([5, 10, 20]) : R.pick([-1, 0, -2]))), g = R.pick([0.5, 0.8, 0.9]);
    const G = ml.sum(r.map((x, i) => x * g ** i));
    return {
      prompt: [h("p", {}, `Bir bölümde ödüller sırasıyla ${r.map(f).join(", ")}; γ = ${g}. Başlangıçtaki getiri G?`)],
      fields: [{ label: "G", v: G }],
      solution: () => [steps([{ what: "İlk ödül indirimsiz, sonrakiler γ'nın artan kuvvetleriyle çarpılır.", formula: "G = r₁ + γr₂ + γ²r₃ + …", calc: r.map((x, i) => `${f(g ** i)}·${par(x)}`).join(" + "), result: f(G) }])],
    };
  } },
  qupd: { title: "Q-öğrenme güncellemesi", wk: 12, make(R) {
    const Q = R.int(-2, 6), r = R.pick([-2, -1, 0, 1, 2, 5]), nx = [R.int(0, 8), R.int(0, 8)], al = R.pick([0.1, 0.2, 0.5]), g = R.pick([0.5, 0.8, 0.9]), term = R() < 0.2;
    const mx = term ? 0 : Math.max(...nx), tgt = r + g * mx, nq = Q + al * (tgt - Q);
    return {
      prompt: [h("p", {}, `Q(s, a) = ${f(Q)}, ödül r = ${f(r)}, ${term ? "s′ son durum (bölüm bitti)" : `s′'ndeki Q değerleri ${nx.join(" ve ")}`}; α = ${al}, γ = ${g}. Hedef ve yeni Q(s, a)?`)],
      fields: [{ label: "hedef", v: tgt }, { label: "yeni Q", v: nq }],
      solution: () => [steps([
        { what: term ? "Son durumda sonraki değer 0'dır." : "Hedef: ödül + γ·(s′'ndeki en büyük Q).", formula: "r + γ·max Q(s′, ·)", calc: `${f(r)} + ${g}·${f(mx)}`, result: f(tgt) },
        { what: "Eski değer farkın α katı kadar hedefe yaklaşır.", formula: "Q + α·(hedef − Q)", calc: `${f(Q)} + ${al}·(${f(tgt)} − ${par(Q)})`, result: f(nq) },
      ])],
    };
  } },
  egreedy: { title: "ε-greedy olasılıkları", wk: 12, make(R) {
    const A = R.int(2, 5), e = R.pick([0.1, 0.2, 0.3, 0.4]);
    return {
      prompt: [h("p", {}, `${A} eylem, ε = ${e}. En iyi eylemin ve öteki bir eylemin seçilme olasılığı?`)],
      fields: [{ label: "en iyi", v: 1 - e + e / A }, { label: "öteki", v: e / A }],
      solution: () => [steps([
        { what: "Rastgele kısımda her eylem eşit pay alır.", formula: "ε/|A|", calc: `${e}/${A}`, result: f(e / A) },
        { what: "En iyi eylem açgözlü kısmı ve rastgele payını birlikte alır.", formula: "1 − ε + ε/|A|", calc: `${f(1 - e)} + ${f(e / A)}`, result: f(1 - e + e / A) },
      ])],
    };
  } },
};
W.drill = (ds) => {
  const scope = ds.week ? ds.week.split(",") : ds.set === "final" ? ["9", "10", "11", "12"] : null;
  const { el, body } = frame(scope ? `Sınırsız alıştırma: ${ds.week ? ds.week.replace(/,/g, ", ") + ". hafta" : "9–12. haftalar"}` : "Alıştırma üreteci", "Alıştırma");
  const types = Object.entries(GEN).filter(([, g]) => !scope || scope.includes(String(g.wk)));
  const skey = "drill-type" + (scope ? scope.join("") : "");
  const saved = store.get(skey, "any");
  const typ = select("soru türü ", [["any", "karışık"], ...types.map(([k, g]) => [k, g.title])], ds.type || (types.some(([k]) => k === saved) ? saved : "any"));
  const seedIn = h("input", { type: "number", value: Math.floor(Math.random() * 99999), style: { width: "6.5rem" } });
  const out = outBox();
  let stats = store.get("drill-stats", { ok: 0, all: 0 });
  const scoreEl = h("span", { class: "small muted" });
  const paintScore = () => (scoreEl.textContent = stats.all ? `Bu tarayıcıda: ${stats.ok}/${stats.all} soru tam doğru` : "");
  body.append(h("div", { class: "controls" }, typ.label, h("label", {}, "soru no ", seedIn), button("Yeni soru", () => { seedIn.value = Math.floor(Math.random() * 99999); gen(); }, "primary"), scoreEl), out);
  const gen = () => {
    store.set(skey, typ.get());
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
  // the final period opens on 7 December; the exact exam slot comes from the academic calendar
  const target = new Date("2026-12-07T09:00:00+03:00"), end = new Date("2026-12-18T23:59:00+03:00");
  const paint = () => {
    const now = new Date(), ms = target - now;
    if (ms <= 0) { box.replaceChildren(h("div", { class: "label" }, now < end ? "Final dönemi başladı" : "Final dönemi bitti"), h("div", { class: "when" }, "7–18 Aralık 2026"), h("p", { class: "small" }, "Kesin sınav günü ve saati için akademik takvime ve ders platformuna bakın.")); return; }
    const d = Math.floor(ms / 864e5), hh = Math.floor((ms % 864e5) / 36e5), mm = Math.floor((ms % 36e5) / 6e4), ss = Math.floor((ms % 6e4) / 1e3);
    box.replaceChildren(h("div", { class: "label" }, "Final dönemine kalan"), h("div", { class: "when" }, "Final dönemi 7–18 Aralık 2026 (kesin gün akademik takvimden)"),
      h("div", { class: "digits" }, [[d, "gün"], [hh, "saat"], [mm, "dakika"], [ss, "saniye"]].map(([v, l]) => h("div", {}, h("b", {}, String(v).padStart(2, "0")), h("span", {}, l)))),
      h("p", { class: "small muted", style: { margin: "0.6rem 0 0" } }, "Kâğıt üzerinde · dersin tamamı, ağırlık 8–12. haftalarda · hesap makinesi yok · log ve üstel tablolar verilir"));
  };
  paint();
  setInterval(paint, 1000);
  return box;
};


// ======================================================================= interactive versions (drag, step, explore)
// ======================================================================= week 10: sequences, attention, embeddings
/** A bracketed matrix (same look as the .mat matrices in the text). */
const matEl = (rows, d = 3) => h("span", { class: "mat", style: `--cols:${rows[0]?.length || 1}` }, rows.flat().map((v) => h("span", {}, typeof v === "string" ? v : f(v, d))));
const matRows = (txt) => parseRows(txt).map((r) => r.map((t) => Number(t.replace(",", "."))).filter(Number.isFinite)).filter((r) => r.length);
const dot = (a, b) => a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0);
const norm = (a) => Math.sqrt(dot(a, a));
const dotTxt = (a, b) => a.map((x, i) => `${par(x)}·${par(b[i] ?? 0)}`).join(" + ");

W.attention = () => {
  const { el, body } = frame("Dikkat hesabı: softmax(Q·Kᵀ/√dₖ)·V adım adım");
  const q = area("1 0\n0 1\n1 1", 3), k = area("1 0\n0 1\n1 1", 3), v = area("1 2\n3 0\n0 1", 3);
  const mask = checkbox(" nedensel maske (her kelime yalnız kendisine ve öncesine bakar)", false);
  const row = h("input", { type: "text", value: "3", style: { width: "3rem" } });
  const out = outBox();
  body.append(h("div", { class: "three-col" },
    h("div", {}, h("p", { class: "field-hint" }, "Q (her satır bir sorgu qᵢ)"), q),
    h("div", {}, h("p", { class: "field-hint" }, "K (her satır bir anahtar kⱼ)"), k),
    h("div", {}, h("p", { class: "field-hint" }, "V (her satır bir değer vⱼ)"), v)),
    h("div", { class: "controls" }, mask.label, h("label", {}, "ayrıntısı gösterilecek satır ", row)), out);
  live(body, () => {
    const Q = matRows(q.value), K = matRows(k.value), V = matRows(v.value);
    if (!Q.length || !K.length || !V.length) return put(out, errorBox("Üç matrisi de doldurun."));
    if (K.length !== V.length) return put(out, errorBox("K ile V'nin satır sayısı (kelime sayısı) aynı olmalı."));
    const dk = K[0].length, sq = Math.sqrt(dk);
    if (Q.some((r) => r.length !== dk) || K.some((r) => r.length !== dk)) return put(out, errorBox("Sorgu ve anahtar vektörlerinin boyutu aynı olmalı."));
    const S = Q.map((qi) => K.map((kj) => dot(qi, kj)));
    const Ss = S.map((r, i) => r.map((s, j) => (mask.get() && j > i ? -Infinity : s / sq)));
    const E = Ss.map((r) => r.map((s) => Math.exp(s)));
    const A = E.map((r) => { const t = ml.sum(r); return r.map((e) => e / t); });
    const Z = A.map((a) => V[0].map((_, c) => ml.sum(a.map((w, j) => w * V[j][c]))));
    const i = Math.min(Q.length, Math.max(1, Math.round(readNumber(row.value)) || 1)) - 1;
    const allowed = K.map((_, j) => !(mask.get() && j > i));
    const idx = K.map((_, j) => j).filter((j) => allowed[j]);
    put(out,
      h("div", { class: "mat-eq" }, "Q·Kᵀ =", matEl(S), " ölçekli (÷√", String(dk), " = ", f(sq), ") =", matEl(Ss.map((r) => r.map((x) => (x === -Infinity ? "−∞" : f(x)))))),
      h("div", { class: "mat-eq" }, "ağırlıklar A =", matEl(A), "  çıktılar Z = A·V =", matEl(Z)),
      h("p", {}, h("b", {}, `${i + 1}. satırın (q${sub(i + 1)}) hesabı`)),
      steps([
        { what: `Sorguyu her anahtarla iç çarpıp skorları buluruz.${mask.get() && idx.length < K.length ? " Maske açık olduğu için sonraki kelimelerin skorları −∞ yapılır." : ""}`, formula: "sⱼ = qᵢ·kⱼ",
          calc: K.map((kj, j) => (allowed[j] ? `s${sub(j + 1)} = ${dotTxt(Q[i], kj)} = ${f(S[i][j])}` : `s${sub(j + 1)} = −∞`)).join(";  ") },
        { what: "Skorları anahtar boyutunun kareköküne böleriz.", formula: `sⱼ / √dₖ, √${dk} = ${f(sq)}`, calc: idx.map((j) => f(Ss[i][j])).join(", ") },
        { what: "Her skorun üstelini alıp hepsinin toplamını buluruz.", formula: "eˢ ve toplam Σ eˢ", calc: `${idx.map((j) => f(E[i][j])).join(" + ")}`, result: f(ml.sum(E[i])) },
        { what: "Her üsteli toplama bölerek ağırlıkları buluruz (softmax); toplamları 1'dir.", formula: "aⱼ = eˢʲ / Σ eˢ", calc: idx.map((j) => `a${sub(j + 1)} = ${f(E[i][j])}/${f(ml.sum(E[i]))} = ${f(A[i][j])}`).join(";  ") },
        { what: "Değer vektörlerini bu ağırlıklarla toplarız: kelimenin bağlama göre yeni vektörü.", formula: "zᵢ = Σ aⱼ·vⱼ", calc: idx.map((j) => `${f(A[i][j])}·${vec(V[j])}`).join(" + "), result: vec(Z[i]) },
      ]),
      table(["Kelime", ...K.map((_, j) => `a·${j + 1}`), "çıktı z"], A.map((r, ii) => ({ row: [String(ii + 1), ...r.map((w) => ({ v: f(w), cls: "num" })), vec(Z[ii])] })), { cls: "center compact" }));
  });
  return el;
};

W.cosine = () => {
  const { el, body } = frame("Kosinüs benzerliği ve Öklid uzaklığı");
  const src = area("kedi: 2 1 0\nköpek: 1 2 0\nborsa: 0 1 3", 4);
  const out = outBox();
  body.append(h("p", { class: "field-hint" }, "Her satıra bir ad ve vektör yazın (ad: sayılar)."), src, out);
  live(body, () => {
    const items = src.value.split("\n").map((l) => l.trim()).filter(Boolean).map((l, n) => {
      const m = l.match(/^([^:]+):(.*)$/);
      return m ? { name: m[1].trim(), v: parseNums(m[2]) } : { name: `v${n + 1}`, v: parseNums(l) };
    }).filter((it) => it.v.length);
    if (items.length < 2) return put(out, errorBox("En az iki vektör yazın."));
    const pairs = [];
    for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
      const u = items[a].v, w = items[b].v, d = dot(u, w), nu = norm(u), nw = norm(w);
      pairs.push({ a: items[a].name, b: items[b].name, u, w, d, nu, nw, cos: d / (nu * nw), eu: Math.sqrt(ml.sum(u.map((x, i) => (x - (w[i] ?? 0)) ** 2))) });
    }
    const best = pairs.reduce((m, p) => (p.cos > m.cos ? p : m));
    put(out,
      table(["Çift", "u·v", "‖u‖", "‖v‖", "kosinüs", "Öklid"], pairs.map((p) => ({ cls: p === best ? "hl" : "", row: [`${p.a}, ${p.b}`, { v: f(p.d), cls: "num" }, { v: f(p.nu), cls: "num" }, { v: f(p.nw), cls: "num" }, { v: f(p.cos), cls: "num" }, { v: f(p.eu), cls: "num" }] })), { cls: "center compact" }),
      h("p", {}, h("b", {}, `En benzer çift: ${best.a} ve ${best.b}. Hesabı:`)),
      steps([
        { what: "İç çarpım: karşılıklı bileşenlerin çarpımlarını toplarız.", formula: "u·v = Σ uᵢvᵢ", calc: dotTxt(best.u, best.w), result: f(best.d) },
        { what: "İki vektörün uzunluklarını buluruz.", formula: "‖u‖ = √(Σ uᵢ²)", calc: `‖${best.a}‖ = √(${best.u.map((x) => `${par(x)}²`).join(" + ")}) = ${f(best.nu)};  ‖${best.b}‖ = √(${best.w.map((x) => `${par(x)}²`).join(" + ")})`, result: f(best.nw) },
        { what: "İç çarpımı uzunlukların çarpımına böleriz.", formula: "cos = u·v / (‖u‖·‖v‖)", calc: `${f(best.d)} / (${f(best.nu)}·${f(best.nw)})`, result: f(best.cos),
          note: "Kosinüs yalnız yöne bakar: bir vektörü 2 ile çarpmak kosinüsü değiştirmez ama Öklid uzaklığını değiştirir." },
      ]));
  });
  return el;
};

W.rnnparams = () => {
  const { el, body } = frame("RNN, LSTM ve GRU katmanının parametre sayısı");
  const d = h("input", { type: "text", value: "4", style: { width: "4rem" } }), hh = h("input", { type: "text", value: "3", style: { width: "4rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "girdi boyutu d ", d), h("label", {}, "gizli boyut h ", hh)), out);
  live(body, () => {
    const D = Math.round(readNumber(d.value)), H = Math.round(readNumber(hh.value));
    if (!(D > 0 && H > 0)) return put(out, errorBox("d ve h pozitif tam sayı olmalı."));
    const g = H * (D + H) + H, n = (x) => x.toLocaleString("en-US");
    put(out, steps([
      { what: "Her kapı girdi ile önceki gizli durumun birleşimine bakar; birleşik vektörün uzunluğu d + h'dir.", formula: "d + h", calc: `${D} + ${H}`, result: String(D + H) },
      { what: "Bir grubun (bir kapının ya da adayın) h çıktısı vardır: h·(d + h) ağırlık ve h sabit terim.", formula: "h·(d + h) + h", calc: `${H}·${D + H} + ${H}`, result: n(g) },
      { what: "Yalın RNN tek gruptur.", formula: "1 · grup", calc: `1·${n(g)}`, result: n(g) },
      { what: "LSTM'de dört grup vardır: unutma, girdi, çıktı kapıları ve aday.", formula: "4 · grup", calc: `4·${n(g)}`, result: n(4 * g) },
      { what: "GRU'da üç grup vardır: sıfırlama, güncelleme kapıları ve aday.", formula: "3 · grup", calc: `3·${n(g)}`, result: n(3 * g), note: "GRU, LSTM'den her zaman tam %25 daha az parametre taşır." },
    ]));
  });
  return el;
};

W.w2v = () => {
  const { el, body } = frame("Word2Vec eğitim çiftleri: skip-gram ve CBOW");
  const sent = h("input", { type: "text", value: "öğrenci sınav öncesi evde ders çalışmayı sever", style: { width: "100%" } });
  const win = h("input", { type: "text", value: "2", style: { width: "3rem" } });
  const out = outBox();
  body.append(h("label", { class: "block" }, "cümle ", sent), h("div", { class: "controls" }, h("label", {}, "pencere (her yönde komşu) ", win)), out);
  live(body, () => {
    const w = sent.value.trim().split(/\s+/).filter(Boolean), m = Math.max(1, Math.round(readNumber(win.value)) || 1);
    if (w.length < 2) return put(out, errorBox("En az iki kelime yazın."));
    const rows = w.map((c, i) => { const nb = []; for (let j = Math.max(0, i - m); j <= Math.min(w.length - 1, i + m); j++) if (j !== i) nb.push(w[j]); return { c, nb }; });
    const total = ml.sum(rows.map((r) => r.nb.length));
    put(out, table(["Merkez", "Skip-gram çiftleri (merkez, komşu)", "CBOW girdisi (etiketi merkez kelime)", "Sayı"],
      rows.map((r) => [r.c, r.nb.map((x) => `(${r.c}, ${x})`).join(", "), `(${r.nb.join(", ")})`, { v: String(r.nb.length), cls: "num" }]),
      { cls: "compact", foot: [{ v: "Toplam", span: 3 }, { v: String(total), cls: "num" }] }),
    h("p", { class: "small" }, `Skip-gram çifti sayısı, her kelimenin komşu sayılarının toplamıdır: ${rows.map((r) => r.nb.length).join(" + ")} = ${total}. Etiketler metnin kendisinden çıktığı için bu öz-gözetimli öğrenmedir.`));
  });
  return el;
};

W.lstmstep = () => {
  const { el, body } = frame("Bir LSTM adımı: kapılar belleği nasıl değiştirir?");
  const mk = (lab, val) => { const i = h("input", { type: "text", value: val, style: { width: "4rem" } }); return { i, label: h("label", {}, lab, i) }; };
  const c0 = mk("eski bellek cₜ₋₁ ", "1"), fg = mk("unutma fₜ ", "0.9"), ig = mk("girdi iₜ ", "0.5"), gg = mk("aday gₜ ", "0.6"), og = mk("çıktı oₜ ", "0.8");
  const out = outBox();
  body.append(h("div", { class: "controls" }, c0.label, fg.label, ig.label, gg.label, og.label), out);
  live(body, () => {
    const [C, F, I, G, O] = [c0, fg, ig, gg, og].map((x) => readNumber(x.i.value));
    if ([C, F, I, G, O].some((x) => !Number.isFinite(x))) return put(out, errorBox("Beş değeri de sayı olarak yazın."));
    const c = F * C + I * G, hh = O * Math.tanh(c);
    const bad = [F, I, O].some((x) => x < 0 || x > 1) ? "Not: kapılar sigmoid çıktısıdır, 0 ile 1 arasında olmalı." : null;
    put(out, steps([
      { what: "Unutma kapısı eski belleğin ne kadarının kalacağını seçer.", formula: "fₜ·cₜ₋₁", calc: `${f(F)}·${par(C)}`, result: f(F * C) },
      { what: "Girdi kapısı adayın ne kadarının yazılacağını seçer.", formula: "iₜ·gₜ", calc: `${f(I)}·${par(G)}`, result: f(I * G) },
      { what: "İkisini toplayınca yeni bellek çıkar (toplamalı yol).", formula: "cₜ = fₜ·cₜ₋₁ + iₜ·gₜ", calc: `${f(F * C)} ${pm(I * G)}`, result: f(c) },
      { what: "Çıktı kapısı belleğin tanh'ının ne kadarının dışarı verileceğini seçer.", formula: "hₜ = oₜ·tanh(cₜ)", calc: `${f(O)}·tanh(${f(c)}) = ${f(O)}·${f(Math.tanh(c))}`, result: f(hh), note: bad },
    ]), h("p", { class: "small muted" }, "Unutma kapısını 0 yapın: eski bellek tamamen silinir. Girdi kapısını 0 yapın: hiçbir şey yazılmaz ve bellek yalnız unutma kapısı kadar korunur."));
  });
  return el;
};

// ======================================================================= week 11: clustering, Naive Bayes
const SVGNS = "http://www.w3.org/2000/svg";
const svgEl = (w, hh, inner, label) => { const e = document.createElementNS(SVGNS, "svg"); e.setAttribute("viewBox", `0 0 ${w} ${hh}`); e.setAttribute("class", "plot fig-svg"); e.setAttribute("role", "img"); e.setAttribute("aria-label", label); e.innerHTML = inner; return e; };
const d2 = (p, q) => p.reduce((s, x, i) => s + (x - (q[i] ?? 0)) ** 2, 0);
const ptTxt = (p) => (p.length === 1 ? f(p[0]) : vec(p));

/** Scatter of 1D/2D points coloured by cluster, centres drawn as rings. */
function clusterPic(P, assign, C) {
  const two = P[0].length > 1, xs = P.map((p) => p[0]).concat(C.map((c) => c[0])), ys = two ? P.map((p) => p[1]).concat(C.map((c) => c[1])) : [0];
  const x0 = Math.min(...xs) - 1, x1 = Math.max(...xs) + 1, y0 = Math.min(...ys) - 1, y1 = Math.max(...ys) + 1;
  const W = 360, H = two ? 260 : 90, m = 22, X = (v) => m + ((v - x0) / (x1 - x0)) * (W - 2 * m), Y = (v) => (two ? H - m - ((v - y0) / (y1 - y0)) * (H - 2 * m) : H / 2);
  let s = `<line x1="${m}" y1="${two ? H - m : H / 2}" x2="${W - m}" y2="${two ? H - m : H / 2}" class="fig-grid"/>`;
  P.forEach((p, i) => { s += `<circle cx="${X(p[0])}" cy="${Y(p[1] ?? 0)}" r="6" class="kc${assign[i] % 4}"/>`; });
  C.forEach((c, j) => { s += `<circle cx="${X(c[0])}" cy="${Y(c[1] ?? 0)}" r="11" class="kring kc${j % 4}"/><text x="${X(c[0]) + 13}" y="${Y(c[1] ?? 0) - 9}" class="lab">m${"₁₂₃₄₅₆₇₈₉"[j] || j + 1}</text>`; });
  const e = svgEl(W, H, s, "Kümeler ve merkezler"); e.style.maxWidth = "380px"; e.style.display = "block"; e.style.margin = "0.5rem auto"; return e;
}

W.kmeans = () => {
  const { el, body } = frame("k-ortalamalar adım adım");
  const pts = area("1 1\n1.5 2\n3 4\n5 7\n3.5 5\n4.5 5\n3.5 4.5", 5), cen = area("1 1\n5 7", 3);
  const its = h("input", { type: "text", value: "3", style: { width: "3rem" } });
  const out = outBox();
  body.append(h("div", { class: "two-col" }, h("div", {}, h("p", { class: "field-hint" }, "Noktalar (her satır bir nokta; tek ya da iki sayı)"), pts), h("div", {}, h("p", { class: "field-hint" }, "Başlangıç merkezleri (k satır)"), cen)),
    h("div", { class: "controls" }, h("label", {}, "yineleme sayısı ", its)), out);
  live(body, () => {
    const P = matRows(pts.value), C0 = matRows(cen.value);
    if (P.length < 2 || !C0.length) return put(out, errorBox("Noktaları ve en az bir merkezi yazın."));
    const dim = P[0].length;
    if (P.some((p) => p.length !== dim) || C0.some((c) => c.length !== dim)) return put(out, errorBox("Bütün noktalar ve merkezler aynı boyutta olmalı."));
    const n = Math.min(10, Math.max(1, Math.round(readNumber(its.value)) || 1));
    let C = C0.map((c) => c.slice()), prev = null;
    const blocks = [];
    let assign = [];
    for (let t = 1; t <= n; t++) {
      const D = P.map((p) => C.map((c) => d2(p, c)));
      assign = D.map((r) => r.indexOf(Math.min(...r)));
      const NC = C.map((c, j) => { const mem = P.filter((_, i) => assign[i] === j); return mem.length ? c.map((_, d) => ml.sum(mem.map((p) => p[d])) / mem.length) : c; });
      const sse = ml.sum(P.map((p, i) => d2(p, NC[assign[i]])));
      const groups = C.map((_, j) => P.map((p, i) => [p, i]).filter(([, i]) => assign[i] === j).map(([p]) => ptTxt(p)));
      const same = prev && prev.every((a, i) => a === assign[i]);
      blocks.push(h("h4", {}, `${t}. yineleme`),
        table(["Nokta", ...C.map((c, j) => `m${sub(j + 1)} = ${ptTxt(c)} uzaklık²`), "küme"], P.map((p, i) => [ptTxt(p), ...D[i].map((v, j) => ({ v: f(v), cls: j === assign[i] ? "num hlc" : "num" })), `küme ${assign[i] + 1}`]), { cls: "center compact" }),
        steps([
          { what: "Her nokta, uzaklık karesi en küçük olan merkezin kümesine atanır.", calc: groups.map((g, j) => `küme ${j + 1}: {${g.join(", ")}}`).join(";  ") },
          { what: "Her merkez, kümesindeki noktaların ortalaması olur.", formula: "mⱼ = (1/|Cⱼ|)·Σ x", calc: NC.map((c, j) => `m${sub(j + 1)} = ${ptTxt(c)}`).join(";  ") },
          { what: "Kare hataların toplamı (küçük olması iyi).", formula: "SSE = Σ ‖x − m‖²", calc: "SSE", result: f(sse), note: same ? "Atamalar bir önceki yinelemeyle aynı: algoritma yakınsadı." : null },
        ]));
      prev = assign; C = NC;
    }
    put(out, clusterPic(P, assign, C), ...blocks);
  });
  return el;
};

W.linkage = () => {
  const { el, body } = frame("Hiyerarşik kümeleme: uzaklık matrisinden dendrogram");
  const src = area("A B C D E\n0 1.12 4.24 5 6.36\n1.12 0 3.2 3.91 5.32\n4.24 3.2 0 1 2.12\n5 3.91 1 0 1.58\n6.36 5.32 2.12 1.58 0", 6);
  const meth = select("bağlantı ", [["single", "tekil (en küçük)"], ["complete", "tam (en büyük)"], ["average", "ortalama"]], "single");
  const out = outBox();
  body.append(h("p", { class: "field-hint" }, "İlk satır adlar, sonraki satırlar simetrik uzaklık matrisi."), src, h("div", { class: "controls" }, meth.label), out);
  live(body, () => {
    const rows = src.value.trim().split("\n").map((l) => l.trim().split(/[\s,;]+/).filter(Boolean));
    if (rows.length < 3) return put(out, errorBox("Adları ve matrisi yazın."));
    const names = rows[0], M = rows.slice(1).map((r) => r.map((t) => Number(t.replace(",", "."))));
    const n = names.length;
    if (M.length !== n || M.some((r) => r.length !== n || r.some((v) => !Number.isFinite(v)))) return put(out, errorBox(`${n} ad için ${n}×${n} sayı gerekir.`));
    let cl = names.map((nm, i) => ({ name: nm, items: [i], x: i, hgt: 0 }));
    const dist = (a, b) => { const v = a.items.flatMap((i) => b.items.map((j) => M[i][j])); return meth.get() === "single" ? Math.min(...v) : meth.get() === "complete" ? Math.max(...v) : ml.sum(v) / v.length; };
    const st = [], merges = [];
    while (cl.length > 1) {
      let best = null;
      for (let a = 0; a < cl.length; a++) for (let b = a + 1; b < cl.length; b++) { const d = dist(cl[a], cl[b]); if (!best || d < best.d - 1e-12) best = { a, b, d }; }
      const A = cl[best.a], B = cl[best.b], N = { name: A.name + B.name, items: A.items.concat(B.items), hgt: best.d, kids: [A, B] };
      merges.push(N);
      const rest = cl.filter((_, i) => i !== best.a && i !== best.b);
      st.push({ what: `En yakın iki küme {${A.name}} ve {${B.name}}; yükseklik ${f(best.d)}'de birleşir.`, calc: rest.length ? `Yeni uzaklıklar (${meth.get() === "single" ? "en küçük" : meth.get() === "complete" ? "en büyük" : "ortalama"}): ` + rest.map((r) => `d(${N.name}, ${r.name}) = ${f(dist(N, r))}`).join(";  ") : "Tek küme kaldı." });
      cl = rest.concat([N]);
    }
    // dendrogram: leaves in merge order so branches never cross
    const order = []; const walk = (c) => (c.kids ? (walk(c.kids[0]), walk(c.kids[1])) : order.push(c.items[0])); walk(cl[0]);
    const W = 360, H = 220, m = 30, top = cl[0].hgt || 1, X = (i) => m + (order.indexOf(i) + 0.5) * ((W - 2 * m) / n), Y = (v) => H - m - (v / top) * (H - 2 * m);
    let s = `<line x1="${m - 6}" y1="${H - m}" x2="${m - 6}" y2="${m}" class="fig-grid"/>` + [0, top / 2, top].map((v) => `<text x="${m - 10}" y="${Y(v) + 4}" text-anchor="end" class="fig-sub">${f(v)}</text>`).join("");
    const pos = (c) => (c.kids ? c.px : X(c.items[0]));
    for (const N of merges) {
      const [a, b] = N.kids, xa = pos(a), xb = pos(b), ya = Y(a.hgt), yb = Y(b.hgt), y = Y(N.hgt);
      s += `<path d="M${xa},${ya} V${y} H${xb} V${yb}" class="fig-arrow" fill="none"/>`;
      N.px = (xa + xb) / 2;
    }
    names.forEach((nm, i) => { s += `<text x="${X(i)}" y="${H - m + 16}" text-anchor="middle" class="lab">${nm}</text>`; });
    const dg = svgEl(W, H, s, "Dendrogram"); dg.style.maxWidth = "420px"; dg.style.display = "block"; dg.style.margin = "0.5rem auto";
    put(out, dg, steps(st));
  });
  return el;
};

W.nbayes = () => {
  const { el, body } = frame("Naive Bayes ile metin sınıflandırma (Laplace düzeltmeli)");
  const src = area("spor: gol maç takım\nspor: maç kupa\nekonomi: faiz dolar hisse\nekonomi: hisse gol dolar", 5);
  const q = h("input", { type: "text", value: "gol dolar", style: { width: "100%" } });
  const out = outBox();
  body.append(h("p", { class: "field-hint" }, "Her satır: sınıf: metin"), src, h("label", { class: "block" }, "yeni metin ", q), out);
  live(body, () => {
    const docs = src.value.split("\n").map((l) => l.match(/^\s*([^:]+):(.*)$/)).filter(Boolean).map((m) => ({ c: m[1].trim(), w: m[2].trim().toLocaleLowerCase("tr").split(/\s+/).filter(Boolean) }));
    if (!docs.length) return put(out, errorBox("“sınıf: metin” biçiminde en az bir satır yazın."));
    const classes = ml.uniq(docs.map((d) => d.c)), V = ml.uniq(docs.flatMap((d) => d.w)), words = q.value.trim().toLocaleLowerCase("tr").split(/\s+/).filter(Boolean);
    const info = classes.map((c) => {
      const ds = docs.filter((d) => d.c === c), all = ds.flatMap((d) => d.w), tot = all.length, den = tot + V.length;
      const probs = words.map((w) => ({ w, k: all.filter((x) => x === w).length }));
      const prior = ds.length / docs.length, score = prior * probs.reduce((s, p) => s * ((p.k + 1) / den), 1);
      return { c, n: ds.length, tot, den, probs, prior, score };
    });
    const Z = ml.sum(info.map((i) => i.score)), best = info.reduce((a, b) => (b.score > a.score ? b : a));
    put(out, steps([
      { what: "Önsel olasılıklar: her sınıfın eğitim metinleri içindeki oranı.", formula: "P(C) = sınıftaki metin / toplam metin", calc: info.map((i) => `P(${i.c}) = ${i.n}/${docs.length}`).join(";  ") },
      { what: `Sözlükte ${V.length} farklı kelime var. Her sınıfın kelime sayısına |V| eklenerek payda bulunur.`, formula: "payda = toplam kelime(C) + |V|", calc: info.map((i) => `${i.c}: ${i.tot} + ${V.length} = ${i.den}`).join(";  ") },
      ...info.map((i) => ({ what: `${i.c} sınıfında yeni metnin kelimelerinin olasılıkları (sayı + 1)/payda:`, formula: "P(w | C) = (sayı + 1)/payda",
        calc: i.probs.map((p) => `P(${p.w}) = (${p.k} + 1)/${i.den}`).join(";  ") + `;  çarpım × önsel = ${f(i.score, 6)}` })),
      { what: "Çarpımlar karşılaştırılır; toplamlarına bölününce sonsal olasılıklar çıkar.", formula: "P(C | metin) = skor(C) / Σ skor", calc: info.map((i) => `P(${i.c} | metin) = ${f(i.score / Z)}`).join(";  "), result: `${best.c}` },
    ]), words.some((w) => !V.includes(w)) ? h("p", { class: "small muted" }, "Sözlükte olmayan kelimeler her sınıfta aynı (1/payda) olasılığı alır.") : null);
  });
  return el;
};

// ======================================================================= week 12: reinforcement learning
W.qlearn = () => {
  const { el, body } = frame("Bir Q-öğrenme güncellemesi");
  const mk = (lab, val, w = "4rem") => { const i = h("input", { type: "text", value: val, style: { width: w } }); return { i, label: h("label", {}, lab, i) }; };
  const q = mk("eski Q(s, a) ", "2"), r = mk("ödül r ", "1"), nx = mk("sonraki durumdaki Q değerleri ", "4 3", "6rem"), al = mk("α ", "0.5"), ga = mk("γ ", "0.9");
  const term = checkbox(" s′ son durum (bölüm bitti)", false);
  const out = outBox();
  body.append(h("div", { class: "controls" }, q.label, r.label, nx.label, al.label, ga.label, term.label), out);
  live(body, () => {
    const Q = readNumber(q.i.value), R = readNumber(r.i.value), A = readNumber(al.i.value), G = readNumber(ga.i.value), N = parseNums(nx.i.value);
    if ([Q, R, A, G].some((x) => !Number.isFinite(x))) return put(out, errorBox("Sayıları kontrol edin."));
    const mx = term.get() || !N.length ? 0 : Math.max(...N), tgt = R + G * mx, diff = tgt - Q, nq = Q + A * diff;
    put(out, steps([
      { what: term.get() ? "Bölüm bittiği için sonraki durumun değeri 0 alınır." : "Varılan durumdaki en iyi eylemin Q değerini buluruz.", formula: "max Q(s′, a′)", calc: term.get() ? "son durum" : `max(${N.map((x) => f(x)).join(", ")})`, result: f(mx) },
      { what: "Yeni örnekten gelen hedef: ödül artı indirimli en iyi sonraki değer.", formula: "hedef = r + γ·max Q(s′, a′)", calc: `${f(R)} + ${f(G)}·${par(mx)}`, result: f(tgt) },
      { what: "Hedef ile eski tahmin arasındaki fark (TD hatası).", formula: "fark = hedef − Q(s, a)", calc: `${f(tgt)} − ${par(Q)}`, result: f(diff) },
      { what: "Eski değeri farkın α katı kadar hedefe yaklaştırırız.", formula: "Q(s, a) ← Q(s, a) + α·fark", calc: `${f(Q)} + ${f(A)}·${par(diff)}`, result: f(nq) },
    ]));
  });
  return el;
};

W.valueiter = () => {
  const { el, body } = frame("Değer yinelemesi: koridor dünyası");
  const n = h("input", { type: "text", value: "3", style: { width: "3rem" } }), goal = h("input", { type: "text", value: "10", style: { width: "4rem" } }), step = h("input", { type: "text", value: "-1", style: { width: "4rem" } }), ga = h("input", { type: "text", value: "0.9", style: { width: "4rem" } });
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "kare sayısı (hedef hariç) ", n), h("label", {}, "hedef ödülü ", goal), h("label", {}, "adım ödülü ", step), h("label", {}, "γ ", ga)), out);
  live(body, () => {
    const N = Math.min(8, Math.max(1, Math.round(readNumber(n.value)) || 3)), Rg = readNumber(goal.value), Rs = readNumber(step.value), G = readNumber(ga.value);
    if ([Rg, Rs, G].some((x) => !Number.isFinite(x))) return put(out, errorBox("Sayıları kontrol edin."));
    const names = Array.from({ length: N }, (_, i) => String.fromCharCode(65 + i));
    let V = Array(N).fill(0);
    const rows = [["0", ...V.map((v) => ({ v: f(v), cls: "num" }))]];
    const val = (Vp, i, dir) => { const j = i + dir; if (j >= N) return Rg; return Rs + G * Vp[Math.max(0, j)]; };
    let it = 0, done = false;
    while (it < 30 && !done) {
      it++;
      const NV = V.map((_, i) => Math.max(val(V, i, 1), val(V, i, -1)));
      done = NV.every((v, i) => Math.abs(v - V[i]) < 1e-9);
      V = NV; rows.push([String(it), ...V.map((v) => ({ v: f(v), cls: "num" }))]);
    }
    const pol = V.map((_, i) => (val(V, i, 1) >= val(V, i, -1) ? "sağ" : "sol"));
    const last = N - 1;
    put(out, table(["Yineleme", ...names], rows, { cls: "center compact" }),
      steps([
        { what: `Hedefin hemen solundaki ${names[last]} karesinde sağa gitmek hedef ödülünü verir (G'nin değeri 0).`, formula: "V(s) = max(sağ, sol)", calc: `sağ = ${f(Rg)}, sol = ${f(Rs)} + ${f(G)}·V(${names[Math.max(0, last - 1)]})`, result: f(V[last]) },
        N > 1 ? { what: `Öteki karelerde sağa gitmek: adım ödülü + γ·(sağdaki karenin değeri).`, formula: "sağ = r + γ·V(s′)", calc: names.slice(0, last).map((nm, i) => `V(${nm}) = ${f(Rs)} + ${f(G)}·${f(V[i + 1])} = ${f(V[i])}`).join(";  ") } : null,
        { what: done ? `${it - 1}. yinelemeden sonra değerler değişmedi; en iyi politika her karede max'ı veren eylemdir.` : "30 yinelemede tam yakınsamadı; son değerler gösteriliyor.", calc: names.map((nm, i) => `${nm}: ${pol[i]}`).join(", ") },
      ]));
  });
  return el;
};

// ======================================================================= step-through demos (weeks 9, 10, 12)
/** Grid of numbers as SVG cells; hl(i, j) returns a class or null. */
const gridSvg = (M, x0, y0, c, hl, fmt = (v) => f(v)) => M.map((r, i) => r.map((v, j) => `<rect x="${x0 + j * c}" y="${y0 + i * c}" width="${c}" height="${c}" class="${hl(i, j) || "fig-box2"}"/><text x="${x0 + j * c + c / 2}" y="${y0 + i * c + c / 2 + 5}" text-anchor="middle" class="lab">${v === null ? "" : fmt(v)}</text>`).join("")).join("");

W.convstep = () => {
  const { el, body } = frame("Evrişimi adım adım izle: pencere nereye gidiyor?");
  const img = area("1 2 0 1\n0 1 3 1\n2 1 0 0\n1 0 1 2", 4), ker = area("1 0 -1\n1 0 -1\n1 0 -1", 3);
  const pad = h("input", { type: "text", value: "0", style: { width: "3rem" } }), st = h("input", { type: "text", value: "1", style: { width: "3rem" } });
  let pos = 0;
  const pic = h("div"), info = h("div");
  const prev = button("◀ önceki", () => { pos--; draw(); }), next = button("sonraki ▶", () => { pos++; draw(); }, "primary"), all = button("hepsini doldur", () => { pos = 1e9; draw(); });
  body.append(h("div", { class: "two-col" }, h("div", {}, h("p", { class: "field-hint" }, "Görüntü"), img), h("div", {}, h("p", { class: "field-hint" }, "Filtre"), ker)),
    h("div", { class: "controls" }, h("label", {}, "dolgu ", pad), h("label", {}, "adım ", st), prev, next, all), pic, info);
  const draw = () => {
    const I = matRows(img.value), K = matRows(ker.value), p = Math.max(0, Math.round(readNumber(pad.value)) || 0), s = Math.max(1, Math.round(readNumber(st.value)) || 1);
    if (!I.length || !K.length) return;
    const H = I.length + 2 * p, Wd = I[0].length + 2 * p, kh = K.length, kw = K[0].length;
    const P = Array.from({ length: H }, (_, i) => Array.from({ length: Wd }, (_, j) => (i < p || j < p || i >= H - p || j >= Wd - p ? 0 : I[i - p][j - p] ?? 0)));
    const oh = Math.floor((H - kh) / s) + 1, ow = Math.floor((Wd - kw) / s) + 1;
    if (oh < 1 || ow < 1) return put(pic, errorBox("Filtre dolgulu görüntüden büyük."));
    const total = oh * ow; pos = Math.max(0, Math.min(pos, total - 1));
    const r = Math.floor(pos / ow), c = pos % ow, R0 = r * s, C0 = c * s;
    const O = Array.from({ length: oh }, (_, i) => Array.from({ length: ow }, (_, j) => (i * ow + j <= pos ? ml.sum(K.flatMap((kr, a) => kr.map((kv, b) => kv * P[i * s + a][j * s + b]))) : null)));
    const cs = Math.min(34, Math.floor(300 / Math.max(H, Wd)));
    let svgs = gridSvg(P, 4, 20, cs, (i, j) => (i >= R0 && i < R0 + kh && j >= C0 && j < C0 + kw ? "fig-hl" : i < p || j < p || i >= H - p || j >= Wd - p ? "fig-box" : null));
    const kx = 4 + Wd * cs + 30;
    svgs += `<text x="${kx - 15}" y="${20 + (H * cs) / 2}" text-anchor="middle" class="lab" style="font-size:20px">∗</text>` + gridSvg(K, kx, 20, cs, () => "fig-box3");
    const ox = kx + kw * cs + 34;
    svgs += `<text x="${ox - 17}" y="${20 + (H * cs) / 2}" text-anchor="middle" class="lab" style="font-size:20px">=</text>` + gridSvg(O, ox, 20, cs, (i, j) => (i === r && j === c ? "fig-hl" : "fig-box"));
    svgs += `<text x="4" y="12" class="fig-sub">${p ? "gri kenar: sıfır dolgu" : "dolgu yok"} · sarı: şu anki pencere</text>`;
    const Wtot = ox + ow * cs + 6, Htot = 26 + Math.max(H, kh, oh) * cs;
    const sv = document.createElementNS(SVGNS, "svg"); sv.setAttribute("viewBox", `0 0 ${Wtot} ${Htot}`); sv.setAttribute("class", "plot fig-svg"); sv.style.maxWidth = `${Math.min(640, Wtot * 1.4)}px`; sv.innerHTML = svgs;
    const terms = K.flatMap((kr, a) => kr.map((kv, b) => [kv, P[R0 + a][C0 + b]]));
    put(pic, sv);
    put(info, steps([
      { what: `Çıktı ${oh}×${ow}. Şimdi ${pos + 1}. hücre: satır ${r + 1}, sütun ${c + 1}. Pencere, dolgulu görüntünün ${R0 + 1}. satır ${C0 + 1}. sütunundan başlar${s > 1 ? ` (adım ${s} olduğu için her seferinde ${s} kaydı)` : ""}.`, formula: "çıktı = ⌊(n + 2p − k)/s⌋ + 1", calc: `⌊(${I.length} + ${2 * p} − ${kh})/${s}⌋ + 1 = ${oh}, ⌊(${I[0].length} + ${2 * p} − ${kw})/${s}⌋ + 1`, result: String(ow) },
      { what: "Pencere ile filtrenin karşılıklı hücreleri çarpılıp toplanır (sıfırlı terimler yazılmadı).", calc: terms.filter(([a, b]) => a && b).map(([a, b]) => `${par(a)}·${par(b)}`).join(" + ") || "hepsi 0", result: f(O[r][c]) },
    ]));
    prev.disabled = pos === 0; next.disabled = pos === total - 1;
  };
  body.addEventListener("input", () => { pos = 0; draw(); });
  queueMicrotask(draw);
  return el;
};

W.attnplay = () => {
  const { el, body } = frame("Dikkat bir yumuşak aramadır: sorguyu taşı, ağırlıkları izle");
  let keys = [];
  const keySrc = area("kedi: 1 0\nhasır: 0 1\nüstünde: 1 1", 4);
  const readKeys = () => { keys = keySrc.value.split("\n").map((l) => l.match(/^\s*([^:]+):(.*)$/)).filter(Boolean).map((m, i) => ({ v: m[1].trim(), k: parseNums(m[2]).slice(0, 2), c: "kc" + (i % 4) })).filter((x) => x.k.length === 2).slice(0, 4); };
  readKeys();
  let q = [1, 1];
  const scale = checkbox(" √dₖ ile böl", true);
  const temp = h("input", { type: "range", min: "0.5", max: "4", step: "0.1", value: "1", style: { width: "9rem" } });
  const pic = h("div"), info = h("div");
  body.append(h("p", { class: "small" }, "Düzleme tıklayarak sorgu vektörünü q (sarı) taşıyın. Anahtarlara (renkli noktalar) yönü benzeyen ve uzun bir sorgu, o anahtarın ağırlığını büyütür. Anahtarları ve kelimeleri aşağıdan değiştirebilir, en çok dört anahtar yazabilirsiniz (koordinatlar −0.5 ile 3 arasında görünür)."),
    h("div", { class: "two-col" }, h("div", {}, h("p", { class: "field-hint" }, "anahtarlar (kelime: x y)"), keySrc), h("div", { class: "controls" }, scale.label, h("label", {}, "sorgunun uzunluğunu çarp ", temp))), pic, info);
  const S = 70, o = 30, X = (v) => o + (v + 0.5) * S, Y = (v) => 250 - (v + 0.5) * S;
  const draw = () => {
    readKeys();
    if (!keys.length) return put(info, errorBox("En az bir anahtar yazın: kelime: x y"));
    const m = Number(temp.value), qq = q.map((x) => x * m), sq = scale.get() ? Math.SQRT2 : 1;
    const sc = keys.map((kk) => dot(qq, kk.k) / sq), e = sc.map(Math.exp), a = e.map((x) => x / ml.sum(e));
    let s = `<line x1="${X(-0.5)}" y1="${Y(0)}" x2="${X(3)}" y2="${Y(0)}" class="fig-grid"/><line x1="${X(0)}" y1="${Y(-0.5)}" x2="${X(0)}" y2="${Y(3)}" class="fig-grid"/>`;
    keys.forEach((kk, i) => { s += `<circle cx="${X(kk.k[0])}" cy="${Y(kk.k[1])}" r="${6 + 14 * a[i]}" class="${kk.c}" opacity="0.85"/><text x="${X(kk.k[0]) + 12}" y="${Y(kk.k[1]) + 22}" class="lab">${kk.v}</text>`; });
    s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(qq[0])}" y2="${Y(qq[1])}" class="fig-arrow" marker-end="url(#ahq)"/><circle cx="${X(qq[0])}" cy="${Y(qq[1])}" r="6" class="pt-q"/>`;
    // weight bars
    keys.forEach((kk, i) => { const y = 40 + i * 36; s += `<text x="300" y="${y + 14}" class="lab">${kk.v}</text><rect x="370" y="${y}" width="${150 * a[i]}" height="20" class="${kk.c}"/><text x="${376 + 150 * a[i]}" y="${y + 15}" class="lab">${f(a[i])}</text>`; });
    const sv = document.createElementNS(SVGNS, "svg"); sv.setAttribute("viewBox", "0 0 560 260"); sv.setAttribute("class", "plot fig-svg"); sv.style.cursor = "crosshair";
    sv.innerHTML = `<defs><marker id="ahq" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fig-head"/></marker></defs>` + s;
    sv.addEventListener("pointerdown", (ev) => {
      const r = sv.getBoundingClientRect(), px = ((ev.clientX - r.left) / r.width) * 560, py = ((ev.clientY - r.top) / r.height) * 260;
      if (px > 280) return;
      q = [Math.round(((px - o) / S - 0.5) * 10) / 10 / m, Math.round(((250 - py) / S - 0.5) * 10) / 10 / m]; draw();
    });
    put(pic, sv);
    put(info, steps([
      { what: "Skorlar: sorgunun her anahtarla iç çarpımı" + (scale.get() ? ", √2'ye bölünmüş." : " (ölçeklemesiz)."), calc: keys.map((kk, i) => `${kk.v}: ${f(sc[i])}`).join(";  ") },
      { what: "Softmax skorları toplamı 1 olan ağırlıklara çevirir. Sorgu uzadıkça (kaydırıcı) farklar büyür ve ağırlık en benzer anahtara yığılır; √dₖ'ye bölmek bunu yumuşatır.", calc: keys.map((kk, i) => `${kk.v}: ${f(a[i])}`).join(";  ") },
    ]));
  };
  live(body, draw);
  return el;
};

W.qcorridor = () => {
  const { el, body } = frame("Q-öğrenme oyun alanı: koridorda ajanı eğit");
  let N = 4, names = [];
  const mk = (lab, val) => { const i = h("input", { type: "text", value: val, style: { width: "3.5rem" } }); return { i, label: h("label", {}, lab, i) }; };
  const al = mk("α ", "0.5"), ga = mk("γ ", "0.9"), ep = mk("ε ", "0.2"), nn = mk("kare sayısı ", "4"), rg = mk("hedef ödülü ", "10"), rs = mk("adım ödülü ", "-1");
  let Q, s, epi, steps_, last, R;
  const reset = () => { N = Math.max(2, Math.min(7, Math.round(readNumber(nn.i.value)) || 4)); names = [...Array.from({ length: N }, (_, i) => String.fromCharCode(65 + i)), "G"]; Q = Array.from({ length: N }, () => [0, 0]); s = 0; epi = 0; steps_ = 0; last = null; R = ml.rng(470); };
  reset();
  const pic = h("div"), info = h("div");
  const stepOnce = () => {
    const A = readNumber(al.i.value), G = readNumber(ga.i.value), E = readNumber(ep.i.value);
    const greedy = Q[s][1] > Q[s][0] ? 1 : Q[s][0] > Q[s][1] ? 0 : R() < 0.5 ? 0 : 1;
    const explore = R() < E, act = explore ? (R() < 0.5 ? 0 : 1) : greedy;
    const s2 = act ? s + 1 : Math.max(0, s - 1), done = s2 === N, r = done ? readNumber(rg.i.value) : readNumber(rs.i.value);
    const mx = done ? 0 : Math.max(...Q[s2]), old = Q[s][act], tgt = r + G * mx, nq = old + A * (tgt - old);
    Q[s][act] = nq; last = { s, act, s2, r, mx, old, tgt, nq, explore, A, G };
    steps_++; s = done ? 0 : s2; if (done) epi++;
    return done;
  };
  const runEp = (k) => { for (let t = 0; t < k; t++) { let g = 0; while (!stepOnce() && g++ < 200); } draw(); };
  [nn.i, rg.i, rs.i].forEach((x) => x.addEventListener("change", () => { reset(); draw(); }));
  body.append(h("div", { class: "controls" }, nn.label, rg.label, rs.label), h("div", { class: "controls" }, al.label, ga.label, ep.label, button("bir adım", () => { stepOnce(); draw(); }, "primary"), button("bir bölüm", () => runEp(1)), button("20 bölüm", () => runEp(20)), button("sıfırla", () => { reset(); draw(); })), pic, info);
  const draw = () => {
    let sv = "";
    names.forEach((nm, i) => {
      const bw = 520 / names.length - 14, x = 10 + i * (520 / names.length), cx = x + bw / 2;
      sv += `<rect x="${x}" y="20" width="${bw}" height="46" rx="8" class="${i === N ? "fig-box3" : i === s ? "fig-hl" : "fig-box2"}"/><text x="${cx}" y="48" text-anchor="middle" class="lab">${nm}${i === s ? (names.length > 6 ? "*" : " (ajan)") : ""}</text>`;
      if (i < N) {
        const best = Q[i][1] > Q[i][0] ? "→" : Q[i][0] > Q[i][1] ? "←" : "·";
        sv += `<text x="${cx}" y="84" text-anchor="middle" class="fig-sub">sol ${f(Q[i][0], 2)}</text><text x="${cx}" y="98" text-anchor="middle" class="fig-sub">sağ ${f(Q[i][1], 2)}</text><text x="${cx}" y="114" text-anchor="middle" class="lab">${best}</text>`;
      }
    });
    sv += `<text x="10" y="12" class="fig-sub">Kutunun altında Q(sol) ve Q(sağ); ok, şu anki en iyi (açgözlü) eylem.</text>`;
    const e2 = document.createElementNS(SVGNS, "svg"); e2.setAttribute("viewBox", "0 0 530 120"); e2.setAttribute("class", "plot fig-svg"); e2.innerHTML = sv;
    put(pic, e2, h("p", { class: "small" }, `Bölüm: ${epi} · adım: ${steps_}`));
    put(info, last ? steps([
      { what: `${names[last.s]} durumunda ${last.act ? "sağa" : "sola"} gidildi (${last.explore ? "keşif: rastgele seçim" : "sömürü: en iyi bilinen eylem"}); ödül ${last.r}, varılan durum ${names[last.s2]}.` },
      { what: last.s2 === N ? "Hedefe varıldı: sonraki değer 0." : `Varılan durumdaki en büyük Q.`, formula: "hedef = r + γ·max Q(s′, ·)", calc: `${last.r} + ${f(last.G)}·${f(last.mx)}`, result: f(last.tgt) },
      { what: "Eski değer hedefe α kadar yaklaşır.", formula: "Q ← Q + α·(hedef − Q)", calc: `${f(last.old)} + ${f(last.A)}·(${f(last.tgt)} − ${par(last.old)})`, result: f(last.nq) },
    ]) : h("p", { class: "small muted" }, "“bir adım” ile başlayın. Ödülün hedeften geriye doğru, bölüm bölüm yayıldığını izleyin; Bölümler arttıkça Q(sağ) değerleri değer yinelemesinin sonucuna yaklaşır: A'dan D'ye 4.58, 6.2, 8, 10. Ajan keşif yüzünden ara sıra sola gitse de hedefte max kullanıldığı için doğru değerler öğrenilir (politika dışı öğrenme)."));
  };
  queueMicrotask(draw);
  return el;
};

// ======================================================================= week 9: interactive CNN demos
const svgBox = (w, hh, inner, maxW) => { const e = document.createElementNS(SVGNS, "svg"); e.setAttribute("viewBox", `0 0 ${w} ${hh}`); e.setAttribute("class", "plot fig-svg"); if (maxW) e.style.maxWidth = maxW + "px"; e.innerHTML = inner; return e; };
const fracTxt = (v) => { for (const d of [1, 2, 3, 4, 5, 6]) { const n = v * d; if (Math.abs(n - Math.round(n)) < 1e-9) return d === 1 ? f(v) : `${Math.round(n) < 0 ? "−" : ""}${Math.abs(Math.round(n))}/${d}`; } return f(v, 2); };

W.conv1step = () => {
  const { el, body } = frame("1B evrişim: filtreyi kaydır, dolguyu ve adımı değiştir");
  const sig = h("input", { type: "text", value: "4 3 2 -5 3 5 2 5 5 6", style: { width: "16rem" } });
  const fil = h("input", { type: "text", value: "1/3 1/3 1/3", style: { width: "8rem" } });
  const padSel = select("uçlar ", [["valid", "dolgusuz"], ["zero", "sıfır dolgu"], ["rep", "kenar tekrarı"]], "valid");
  const st = h("input", { type: "text", value: "1", style: { width: "3rem" } });
  const presets = h("span", { class: "btn-group" },
    button("kutu (alçak geçiren)", () => { fil.value = "1/3 1/3 1/3"; reset(); }),
    button("fark (yüksek geçiren)", () => { fil.value = "-1 0 1"; reset(); }),
    button("basamak sinyali", () => { sig.value = "6 6 6 9 12 0 12 6 0 6"; reset(); }));
  let pos = 0;
  const pic = h("div"), plot = h("div"), info = h("div");
  const prev = button("◀", () => { pos--; draw(); }), next = button("sonraki konum ▶", () => { pos++; draw(); }, "primary"), all = button("hepsi", () => { pos = 1e9; draw(); });
  body.append(h("div", { class: "controls" }, h("label", {}, "sinyal f ", sig), h("label", {}, "filtre g ", fil), padSel.label, h("label", {}, "adım ", st)),
    h("div", { class: "controls" }, presets), h("div", { class: "controls" }, prev, next, all), pic, info, plot);
  const reset = () => { pos = 0; draw(); };
  const draw = () => {
    const x = sig.value.trim().split(/[\s,;]+/).map(readNumber).filter(Number.isFinite), g = fil.value.trim().split(/[\s,;]+/).map(readNumber).filter(Number.isFinite);
    if (x.length < 2 || !g.length) return;
    const k = g.length, p = padSel.get() === "valid" ? 0 : Math.floor((k - 1) / 2) || (k > 1 ? 1 : 0), s = Math.max(1, Math.round(readNumber(st.value)) || 1);
    const padV = padSel.get() === "rep" ? [x[0], x[x.length - 1]] : [0, 0];
    const xp = [...Array(p).fill(padV[0]), ...x, ...Array(p).fill(padV[1])];
    const len = Math.floor((xp.length - k) / s) + 1;
    if (len < 1) return put(pic, errorBox("Filtre sinyalden uzun."));
    pos = Math.max(0, Math.min(pos, len - 1));
    const out = Array.from({ length: len }, (_, i) => ml.sum(g.map((w, j) => w * xp[i * s + j])));
    const cw = Math.min(46, Math.floor(560 / (xp.length + 2))), x0 = 70, start = pos * s;
    let sv = `<text x="4" y="30" class="fig-sub">f</text><text x="4" y="80" class="fig-sub">g</text><text x="4" y="130" class="fig-sub">f ∗ g</text>`;
    xp.forEach((v, i) => { const isPad = i < p || i >= xp.length - p; sv += `<rect x="${x0 + i * cw}" y="12" width="${cw}" height="30" class="${i >= start && i < start + k ? "fig-hl" : isPad ? "fig-box" : "fig-box2"}"/><text x="${x0 + i * cw + cw / 2}" y="32" text-anchor="middle" class="lab">${fracTxt(v)}</text>`; });
    g.forEach((v, j) => { sv += `<rect x="${x0 + (start + j) * cw}" y="62" width="${cw}" height="30" class="fig-box3"/><text x="${x0 + (start + j) * cw + cw / 2}" y="82" text-anchor="middle" class="lab">${fracTxt(v)}</text>`; });
    out.forEach((v, i) => { const cx = x0 + (i * s + (k - 1) / 2) * cw; sv += i <= pos ? `<rect x="${cx}" y="112" width="${cw}" height="30" class="${i === pos ? "fig-hl" : "fig-box"}"/><text x="${cx + cw / 2}" y="132" text-anchor="middle" class="lab">${fracTxt(v)}</text>` : `<rect x="${cx}" y="112" width="${cw}" height="30" class="fig-box" opacity="0.35"/>`; });
    put(pic, svgBox(x0 + xp.length * cw + 10, 150, sv, 640));
    const terms = g.map((w, j) => `${fracTxt(w)}·${par(xp[start + j])}`).join(" + ");
    put(info, steps([
      { what: `Çıktı uzunluğu: ${padSel.get() === "valid" ? "dolgu yok" : `iki uca ${p}'er ${padSel.get() === "rep" ? "kenar değeri" : "sıfır"} eklendi`}${s > 1 ? `, filtre ${s}'şer atlıyor` : ""}.`, formula: "⌊(n + 2p − k)/s⌋ + 1", calc: `⌊(${x.length} + ${2 * p} − ${k})/${s}⌋ + 1`, result: String(len) },
      { what: `${pos + 1}. çıktı hücresi: filtre ${start + 1}. konumdan başlayan pencerenin üzerinde (sarı); karşılıklı değerler çarpılıp toplanır.`, calc: terms, result: fracTxt(out[pos]) },
    ]));
    // input vs output as curves: smoothing vs edges becomes visible at a glance
    const centre = (i) => i * s + (k - 1) / 2 - p;
    const lo = Math.min(...x, ...out) - 1, hi = Math.max(...x, ...out) + 1;
    put(plot, h("figure", { class: "fig" }, lines({ series: [
      { pts: x.map((v, i) => [i, v]), cls: "curve3", dots: true, name: "sinyal f", color: "s3" },
      { pts: out.map((v, i) => [centre(i), v]), cls: "curve1", dots: true, name: "çıktı f ∗ g", color: "pos" },
    ], xlim: [-0.5, x.length - 0.5], ylim: [lo, hi], xstep: 1, xlabel: "konum", ylabel: "değer", aria: "Sinyal ve çıktı" }),
    h("figcaption", {}, "Kutu filtrede çıktı eğrisi sinyalin yumuşatılmış hâlidir (alçak geçiren); fark filtresinde düz bölgeler 0'a iner, sıçramalar tepe yapar (yüksek geçiren).")));
    prev.disabled = pos === 0; next.disabled = pos === len - 1;
  };
  body.addEventListener("input", reset); body.addEventListener("change", reset);
  queueMicrotask(draw);
  return el;
};

W.poolstep = () => {
  const { el, body } = frame("Havuzlama: blok blok en büyük ya da ortalama");
  const img = area("1 2 0 1\n0 1 3 1\n2 1 0 0\n1 0 1 2", 4);
  const kind = select("tür ", [["max", "max havuzlama"], ["avg", "ortalama havuzlama"]], "max");
  const sz = h("input", { type: "text", value: "2", style: { width: "3rem" } });
  let pos = 0;
  const pic = h("div"), info = h("div");
  const next = button("sonraki blok ▶", () => { pos++; draw(); }, "primary"), all = button("hepsi", () => { pos = 1e9; draw(); });
  body.append(h("div", { class: "two-col" }, img, h("div", {}, h("div", { class: "controls" }, kind.label, h("label", {}, "pencere = adım ", sz)), h("div", { class: "controls" }, next, all))), pic, info);
  const draw = () => {
    const I = matRows(img.value), k = Math.max(1, Math.round(readNumber(sz.value)) || 2);
    if (!I.length) return;
    const oh = Math.floor(I.length / k), ow = Math.floor(I[0].length / k);
    if (!oh || !ow) return put(pic, errorBox("Pencere görüntüden büyük."));
    pos = Math.max(0, Math.min(pos, oh * ow - 1));
    const r = Math.floor(pos / ow), c = pos % ow;
    const block = (i, j) => I.slice(i * k, i * k + k).flatMap((row) => row.slice(j * k, j * k + k));
    const val = (i, j) => (kind.get() === "max" ? Math.max(...block(i, j)) : ml.sum(block(i, j)) / (k * k));
    const O = Array.from({ length: oh }, (_, i) => Array.from({ length: ow }, (_, j) => (i * ow + j <= pos ? val(i, j) : null)));
    const cs = 36;
    let sv = gridSvg(I, 4, 6, cs, (i, j) => (Math.floor(i / k) === r && Math.floor(j / k) === c ? "fig-hl" : (Math.floor(i / k) + Math.floor(j / k)) % 2 ? "fig-box" : null));
    const ox = 4 + I[0].length * cs + 50;
    sv += `<text x="${ox - 25}" y="${6 + (I.length * cs) / 2}" text-anchor="middle" class="lab">→</text>` + gridSvg(O, ox, 6 + ((I.length - oh) * cs) / 2, cs, (i, j) => (i === r && j === c ? "fig-hl" : "fig-box3"), (v) => f(v, 2));
    put(pic, svgBox(ox + ow * cs + 6, I.length * cs + 12, sv, 420));
    const b = block(r, c);
    put(info, steps([
      { what: `Görüntü ${k}×${k} bloklara bölünür; çıktı ${oh}×${ow}. Şimdiki blok (sarı): {${b.join(", ")}}.`, formula: kind.get() === "max" ? "en büyük değer" : "ortalama", calc: kind.get() === "max" ? `max(${b.join(", ")})` : `(${b.join(" + ")})/${k * k}`, result: f(val(r, c), 3),
        note: "Havuzlamanın öğrenilen parametresi yoktur. Blok içindeki bir değer bir hücre kaysa da çıktı çoğu zaman aynı kalır: küçük kaymalara dayanıklılık buradan gelir." },
    ]));
    next.disabled = pos === oh * ow - 1;
  };
  body.addEventListener("input", () => { pos = 0; draw(); }); body.addEventListener("change", () => { pos = 0; draw(); });
  queueMicrotask(draw);
  return el;
};

/** Draw a CNN as a row of feature-map blocks: height ∝ spatial size, depth ∝ channels; vectors as thin bars. */
function cnnDiagram(shapes) {
  // shapes: [{label, kind, C, H, W, flat, params}] starting with the input
  const maxHW = Math.max(...shapes.filter((s) => !s.flat).map((s) => s.H), 1), maxC = Math.max(...shapes.filter((s) => !s.flat).map((s) => s.C), 1);
  const totalP = shapes.reduce((a, s) => a + (s.params || 0), 0);
  let x = 10, sv = "";
  const base = 190;
  shapes.forEach((s, i) => {
    if (s.flat) {
      const hh = Math.max(14, Math.min(150, 14 + 22 * Math.log10(s.flat)));
      sv += `<rect x="${x}" y="${base - hh}" width="12" height="${hh}" class="fig-box3"/>`;
      sv += `<text x="${x + 6}" y="${base + 16}" text-anchor="middle" class="fig-sub">${s.flat}</text>`;
      s.cx = x + 6; x += 12;
    } else {
      const hh = 20 + 130 * Math.sqrt(s.H / maxHW), d = 6 + 34 * Math.sqrt(s.C / maxC), w = 8 + 26 * Math.sqrt(s.W / maxHW) * 0.4;
      const y = base - hh;
      // front face, top face, side face (pseudo 3D)
      sv += `<polygon points="${x},${y} ${x + d},${y - d * 0.5} ${x + d + w},${y - d * 0.5} ${x + w},${y}" class="fig-box"/>`;
      sv += `<polygon points="${x + w},${y} ${x + w + d},${y - d * 0.5} ${x + w + d},${base - d * 0.5} ${x + w},${base}" class="fig-box2"/>`;
      sv += `<rect x="${x}" y="${y}" width="${w}" height="${hh}" class="${i === 0 ? "fig-box3" : "fig-box2"}"/>`;
      sv += `<text x="${x + (w + d) / 2}" y="${base + 16}" text-anchor="middle" class="fig-sub">${s.C}×${s.H}×${s.W}</text>`;
      s.cx = x + (w + d) / 2; x += w + d;
    }
    if (i < shapes.length - 1) {
      const n = shapes[i + 1];
      sv += `<line x1="${x + 6}" y1="${base - 40}" x2="${x + 50}" y2="${base - 40}" class="fig-arrow" marker-end="url(#ahc)"/>`;
      sv += `<text x="${x + 28}" y="${base - 48}" text-anchor="middle" class="fig-sub">${n.kind}</text>`;
      if (n.params) sv += `<text x="${x + 28}" y="${base - 24}" text-anchor="middle" class="fig-sub">${n.params.toLocaleString("en-US")} p.</text><text x="${x + 28}" y="${base - 12}" text-anchor="middle" class="fig-sub">%${Math.round((100 * n.params) / totalP)}</text>`;
      x += 58;
    }
  });
  sv += `<text x="10" y="${base + 36}" class="fig-sub">blok yüksekliği: uzamsal boyut (H×W) · blok derinliği: kanal sayısı</text><text x="10" y="${base + 52}" class="fig-sub">okun altındaki sayı: o katmanın parametresi (p.) ve toplamdaki payı</text>`;
  const W = Math.max(x + 14, 560), e = document.createElementNS(SVGNS, "svg");
  e.setAttribute("viewBox", `0 0 ${W} ${base + 60}`); e.setAttribute("class", "plot fig-svg"); e.setAttribute("role", "img"); e.setAttribute("aria-label", "CNN mimarisi");
  e.innerHTML = `<defs><marker id="ahc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fig-head"/></marker></defs>` + sv;
  return h("div", { class: "scroll-x" }, e);
}

W.cnnstack = () => {
  const { el, body } = frame("Katman katman: boyutlar ve parametreler, çizimiyle");
  const inp = h("input", { type: "text", value: "3 32 32", style: { width: "7rem" } });
  const src = area("conv 16 3 1 1\npool 2\nconv 32 3 1 1\npool 2\nflatten\nfc 10", 6);
  const set = (i, s) => { inp.value = i; src.value = s; run(); };
  const add = (line) => { src.value = src.value.replace(/\s*$/, "") + "\n" + line; run(); };
  const presets = h("span", { class: "btn-group" },
    button("SmallCNN (derste)", () => set("3 32 32", "conv 16 3 1 1\npool 2\nconv 32 3 1 1\npool 2\nflatten\nfc 10")),
    button("LeNet benzeri (Problem 6)", () => set("1 28 28", "conv 8 5 0 1\npool 2\nconv 16 5 0 1\npool 2\nflatten\nfc 10")),
    button("VGG tarzı blok", () => set("3 64 64", "conv 32 3 1 1\nconv 32 3 1 1\npool 2\nconv 64 3 1 1\nconv 64 3 1 1\npool 2\nflatten\nfc 100\nfc 10")),
    button("havuzlamasız (MLP gibi)", () => set("3 32 32", "flatten\nfc 256\nfc 10")));
  const adders = h("span", { class: "btn-group" }, button("+ conv 3×3", () => add("conv 32 3 1 1")), button("+ adım 2 conv", () => add("conv 64 3 1 2")), button("+ pool 2", () => add("pool 2")), button("+ flatten", () => add("flatten")), button("+ fc 10", () => add("fc 10")), button("son satırı sil", () => { src.value = src.value.trim().split("\n").slice(0, -1).join("\n"); run(); }));
  const out = outBox();
  body.append(h("div", { class: "controls" }, h("label", {}, "girdi C H W ", inp)), h("div", { class: "controls" }, presets), h("div", { class: "controls" }, adders),
    h("p", { class: "field-hint" }, "Her satır bir katman: conv F k p s (filtre sayısı, filtre boyu, dolgu, adım) · pool k · flatten · fc çıktı. Satırları istediğiniz gibi yazın, silin, sıralayın."), src, out);
  const run = live(body, () => {
    let [C, H, Wd] = parseNums(inp.value);
    if (!(C > 0 && H > 0 && Wd > 0)) return put(out, errorBox("Girdiyi C H W olarak yazın."));
    let flat = null; const rows = [], shapes = [{ kind: "girdi", C, H, W: Wd }]; let total = 0, err = null;
    for (const line of src.value.split("\n").map((l) => l.trim()).filter(Boolean)) {
      const [t, ...a] = line.toLowerCase().split(/\s+/); const n = a.map(Number); const inS = flat ? String(flat) : `${C}×${H}×${Wd}`;
      if (t === "conv") {
        if (flat) { err = `“${line}”: düzleştirmeden sonra evrişim yapılamaz.`; break; }
        const [F, k, p = 0, s = 1] = n; const oh = Math.floor((H + 2 * p - k) / s) + 1, ow = Math.floor((Wd + 2 * p - k) / s) + 1, pr = (k * k * C + 1) * F;
        if (!(F > 0 && k > 0) || oh < 1 || ow < 1) { err = `“${line}”: filtre girdiden büyük ya da sayılar eksik.`; break; }
        rows.push([line, inS, `${F}×${oh}×${ow}`, `(${k}·${k}·${C} + 1)·${F}`, pr]); C = F; H = oh; Wd = ow; total += pr; shapes.push({ kind: `conv ${k}×${k}${s > 1 ? ", s=" + s : ""}`, C, H, W: Wd, params: pr });
      } else if (t === "pool") {
        const [k = 2] = n; if (flat || H < k) { err = `“${line}”: havuzlanacak görüntü kalmadı.`; break; }
        H = Math.floor(H / k); Wd = Math.floor(Wd / k); rows.push([line, inS, `${C}×${H}×${Wd}`, "yok", 0]); shapes.push({ kind: `pool ${k}`, C, H, W: Wd, params: 0 });
      } else if (t === "flatten") {
        flat = C * H * Wd; rows.push([line, inS, String(flat), "yok", 0]); shapes.push({ kind: "flatten", flat, params: 0 });
      } else if (t === "fc") {
        const [o] = n; if (!(o > 0)) { err = `“${line}”: çıktı sayısı eksik.`; break; }
        const i = flat ?? C * H * Wd; const pr = i * o + o; rows.push([line, String(i), String(o), `${i}·${o} + ${o}`, pr]); flat = o; total += pr; shapes.push({ kind: `fc ${o}`, flat: o, params: pr });
      } else { err = `Anlaşılmayan satır: “${line}”.`; break; }
    }
    if (err) return put(out, errorBox(err));
    if (!rows.length) return put(out, h("p", { class: "small muted" }, "Bir katman ekleyin."));
    const big = rows.reduce((a, r) => (r[4] > a[4] ? r : a), rows[0]);
    put(out, cnnDiagram(shapes),
      table(["Katman", "Girdi", "Çıktı", "Parametre formülü", "Parametre", "Pay"], rows.map((r) => ({ cls: r === big && total ? "hl" : "", row: [r[0], r[1], r[2], r[3], { v: r[4].toLocaleString("en-US"), cls: "num" }, { html: `<span class="bar" style="width:${total ? Math.round((80 * r[4]) / total) : 0}px"></span> ${total ? Math.round((100 * r[4]) / total) : 0}%` }] })),
        { cls: "compact", foot: ["Toplam", "", "", "", { v: total.toLocaleString("en-US"), cls: "num" }, ""] }),
      h("p", { class: "small" }, `En çok parametre “${big[0]}” katmanında. Çizimde bloklar derinleştikçe (kanal arttıkça) kısalıyor (uzamsal boyut küçülüyor): CNN'lerin ortak kalıbı. Evrişimin parametresi yalnız filtreye bağlıdır; tam bağlı katmanınki girdisinin tamamına bağlı olduğu için genellikle en büyüğüdür. “havuzlamasız” ön ayarını deneyip farkı görün.`));
  });
  return el;
};

/** Clickable grid editor: values cycle through `cycle` on click. */
function clickGrid(M, cycle, onchange, cs = 34) {
  const wrap = h("div", { class: "click-grid", style: `--cols:${M[0].length}` });
  const paint = () => wrap.replaceChildren(...M.flatMap((r, i) => r.map((v, j) => h("button", { type: "button", class: `cg-cell ${v > 0 ? "cg-pos" : v < 0 ? "cg-neg" : "cg-zero"}`, style: `width:${cs}px;height:${cs}px`, "aria-label": `satır ${i + 1} sütun ${j + 1}: ${v}`,
    onclick: () => { M[i][j] = cycle[(cycle.indexOf(v) + 1) % cycle.length]; paint(); onchange(); } }, v > 0 ? `+${v}` : String(v).replace("-", "−")))));
  paint();
  return { el: wrap, repaint: paint };
}
const heatCls = (v, mx) => (v > 0 ? `fill:var(--pos);fill-opacity:${(0.15 + 0.85 * v / mx).toFixed(2)}` : v < 0 ? `fill:var(--neg);fill-opacity:${(0.15 + 0.85 * -v / mx).toFixed(2)}` : "fill:var(--surface-2)");

W.template = () => {
  const { el, body } = frame("Neden evrişim? Kendi görüntünü ve filtreni çiz, haritayı izle");
  const LET = {
    "X": [[1, -1, -1, 1], [-1, 1, 1, -1], [-1, 1, 1, -1], [1, -1, -1, 1]].map((r) => r.slice()),
    "O": [[-1, 1, 1, -1], [1, -1, -1, 1], [1, -1, -1, 1], [-1, 1, 1, -1]],
    "\\": [[1, -1, -1, -1], [-1, 1, -1, -1], [-1, -1, 1, -1], [-1, -1, -1, 1]],
    "/": [[-1, -1, -1, 1], [-1, -1, 1, -1], [-1, 1, -1, -1], [1, -1, -1, -1]],
    "dikey çizgi": [[-1, 1, -1, -1], [-1, 1, -1, -1], [-1, 1, -1, -1], [-1, 1, -1, -1]],
    "yatay çizgi": [[-1, -1, -1, -1], [1, 1, 1, 1], [-1, -1, -1, -1], [-1, -1, -1, -1]],
  };
  const FIL = { "“\\” köşegen": [[1, -1], [-1, 1]], "“/” köşegen": [[-1, 1], [1, -1]], "dikey kenar 3×3": [[1, 0, -1], [1, 0, -1], [1, 0, -1]], "yatay kenar 3×3": [[1, 1, 1], [0, 0, 0], [-1, -1, -1]], "dikey çizgi 3×1": [[1], [1], [1]] };
  let N = 6, I = Array.from({ length: N }, () => Array(N).fill(-1)), K = FIL["“\\” köşegen"].map((r) => r.slice());
  const put4 = (P) => { I = Array.from({ length: N }, () => Array(N).fill(-1)); P.forEach((r, i) => r.forEach((v, j) => { if (i + 1 < N && j + 1 < N) I[i + 1][j + 1] = v; })); };
  put4(LET["X"]);
  const imgBox = h("div"), kerBox = h("div"), pic = h("div"), info = h("div");
  const shift = (di, dj) => { I = I.map((r, i) => r.map((_, j) => (I[i - di] && I[i - di][j - dj] !== undefined ? I[i - di][j - dj] : -1))); draw(true); };
  const letters = h("span", { class: "btn-group" }, Object.keys(LET).map((k) => button(k, () => { put4(LET[k]); draw(true); })), button("temizle", () => { I = I.map((r) => r.map(() => -1)); draw(true); }));
  const filters = h("span", { class: "btn-group" }, Object.keys(FIL).map((k) => button(k, () => { K = FIL[k].map((r) => r.slice()); draw(true); })));
  const kh = h("input", { type: "text", value: "2 2", style: { width: "4rem" } });
  body.append(h("p", { class: "small" }, "Görüntünün piksellerine tıklayın (+1 koyu, −1 açık) ya da bir ön ayar seçin. Filtrenin hücrelerine tıklayınca +1, 0, −1 arasında döner; boyutunu da değiştirebilirsiniz. Harita, filtrenin her konumdaki iç çarpımıdır: koyu mavi “desen burada güçlü”, koyu kırmızı “tersi burada”."),
    h("div", { class: "controls" }, h("span", { class: "field-hint" }, "görüntü ön ayarları: "), letters),
    h("div", { class: "controls" }, h("span", { class: "field-hint" }, "filtre ön ayarları: "), filters, h("label", {}, "filtre boyu (satır sütun) ", kh)),
    h("div", { class: "controls" }, button("◀ kaydır", () => shift(0, -1)), button("kaydır ▶", () => shift(0, 1)), button("▲", () => shift(-1, 0)), button("▼", () => shift(1, 0))),
    h("div", { class: "tmpl-row" }, h("div", {}, h("p", { class: "field-hint" }, `görüntü (${N}×${N})`), imgBox), h("div", {}, h("p", { class: "field-hint" }, "filtre"), kerBox), h("div", {}, h("p", { class: "field-hint" }, "öznitelik haritası"), pic)), info);
  kh.addEventListener("change", () => { const [a, b] = parseNums(kh.value); const r = Math.max(1, Math.min(4, a || 2)), c = Math.max(1, Math.min(4, b || a || 2)); K = Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => (K[i] && K[i][j] !== undefined ? K[i][j] : 0))); draw(true); });
  let gI, gK;
  const draw = (rebuild) => {
    if (rebuild || !gI) { gI = clickGrid(I, [-1, 1], () => draw()); gK = clickGrid(K, [1, 0, -1], () => draw()); imgBox.replaceChildren(gI.el); kerBox.replaceChildren(gK.el); kh.value = `${K.length} ${K[0].length}`; }
    const oh = N - K.length + 1, ow = N - K[0].length + 1;
    const M = Array.from({ length: oh }, (_, i) => Array.from({ length: ow }, (_, j) => ml.sum(K.flatMap((r, a) => r.map((w, b) => w * I[i + a][j + b])))));
    const best = K.flat().reduce((s, w) => s + Math.abs(w), 0) || 1, cs = 30;
    let sv = "";
    M.forEach((r, i) => r.forEach((v, j) => { sv += `<rect x="${j * cs}" y="${i * cs}" width="${cs}" height="${cs}" style="${heatCls(v, best)}" class="hm"/><text x="${j * cs + cs / 2}" y="${i * cs + cs / 2 + 5}" text-anchor="middle" class="lab">${f(v)}</text>`; }));
    put(pic, svgBox(ow * cs, oh * cs, sv, ow * cs * 1.15));
    const hits = []; M.forEach((r, i) => r.forEach((v, j) => v === best && hits.push(`(${i + 1}, ${j + 1})`)));
    put(info, steps([
      { what: `Harita ${oh}×${ow}: filtre ${K.length}×${K[0].length} olduğu için ${N} − ${K.length} + 1 = ${oh} satır ve ${N} − ${K[0].length} + 1 = ${ow} sütun konumu var. Her hücre, filtre ile altındaki pencerenin iç çarpımıdır.`, formula: "(I ∗ K)[i, j] = Σₐ Σ_b I[i + a, j + b]·K[a, b]" },
      { what: hits.length ? `Filtre deseni ${hits.join(", ")} konumlarında tam eşleşiyor (en büyük değer ${best}: filtredeki her +1 bir +1 piksele, her −1 bir −1 piksele denk geldi).` : `Hiçbir konumda tam eşleşme yok; en büyük değer ${f(Math.max(...M.flat()))} (tam eşleşme ${best} olurdu).`,
        note: `Bu filtrenin ${K.flat().filter((w) => w).length} ağırlığı görüntünün bütün konumlarında aynen kullanıldı. Aynı işi tam bağlı bir katmanla yapmak her çıktı hücresi için ${N * N} ağırlık, yani ${oh * ow * N * N} ağırlık isterdi. Görüntüyü kaydırın: harita da aynı yöne kayar, filtre değişmez.` },
    ]));
  };
  queueMicrotask(() => draw(true));
  return el;
};

// ======================================================================= pictures for the midterm-week calculators
function svgWrap(w, hh, inner, maxW, label = "Şekil") {
  const e = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  e.setAttribute("viewBox", `0 0 ${w} ${hh}`); e.setAttribute("class", "plot fig-svg"); e.setAttribute("role", "img"); e.setAttribute("aria-label", label);
  if (maxW) e.style.maxWidth = maxW + "px";
  e.innerHTML = `<defs><marker id="ahv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fig-head"/></marker></defs>` + inner;
  return e;
}
const esc_ = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Decision tree drawn as boxes: internal nodes ask a question, leaves give the class; counts under every node. */
function treeSvg(tree) {
  const leaves = (n) => (n.leaf ? 1 : n.children.reduce((s, c) => s + leaves(c.child), 0));
  const depth = (n) => (n.leaf ? 0 : 1 + Math.max(...n.children.map((c) => depth(c.child))));
  const L = leaves(tree), D = depth(tree), colW = 118, rowH = 86, W = Math.max(260, L * colW), H = (D + 1) * rowH + 10;
  let s = "", slot = 0;
  const place = (n) => {
    if (n.leaf) { n._x = (slot++ + 0.5) * colW; return; }
    n.children.forEach((c) => place(c.child));
    n._x = (n.children[0].child._x + n.children.at(-1).child._x) / 2;
  };
  place(tree);
  const draw = (n, d) => {
    const y = 10 + d * rowH, bw = 104, bh = 40;
    if (!n.leaf) n.children.forEach((c) => {
      const ch = c.child, y2 = 10 + (d + 1) * rowH;
      s += `<line x1="${n._x}" y1="${y + bh}" x2="${ch._x}" y2="${y2}" class="fig-arrow"/>`;
      s += `<text x="${(n._x + ch._x) / 2}" y="${(y + bh + y2) / 2 + 4}" text-anchor="middle" class="fig-sub tree-edge">${esc_(c.value)}</text>`;
      draw(ch, d + 1);
    });
    s += `<rect x="${n._x - bw / 2}" y="${y}" width="${bw}" height="${bh}" rx="${n.leaf ? 18 : 6}" class="${n.leaf ? "fig-box3" : "fig-box2"}"/>`;
    s += `<text x="${n._x}" y="${y + 17}" text-anchor="middle" class="lab">${esc_(n.leaf ? n.label : n.feature + "?")}</text>`;
    s += `<text x="${n._x}" y="${y + 32}" text-anchor="middle" class="fig-sub">[${n.counts.join(" / ")}]</text>`;
  };
  draw(tree, 0);
  return h("div", { class: "scroll-x" }, svgWrap(W, H, s, Math.max(420, W), "Karar ağacı"));
}

/** Points on a number line with candidate thresholds; the best one highlighted. */
function thresholdSvg(sorted, rows, best) {
  const xs = sorted.map(([v]) => v), lo = Math.min(...xs), hi = Math.max(...xs), pad = (hi - lo || 1) * 0.08;
  const W = 520, X = (v) => 30 + ((v - lo + pad) / (hi - lo + 2 * pad)) * (W - 60);
  const cls = ml.uniq(sorted.map(([, c]) => c));
  let s = `<line x1="20" y1="60" x2="${W - 20}" y2="60" class="fig-grid"/>`;
  for (const q of rows) s += `<line x1="${X(q.t)}" y1="30" x2="${X(q.t)}" y2="86" class="${q === best ? "line accent" : "line dash"}"/><text x="${X(q.t)}" y="${q === best ? 24 : 100}" text-anchor="middle" class="fig-sub">${f(q.t)}${q === best ? " (en iyi)" : ""}</text>`;
  sorted.forEach(([v, c], i) => { const dup = sorted.slice(0, i).filter(([u]) => u === v).length; s += `<circle cx="${X(v)}" cy="${60 - dup * 14}" r="7" class="kc${cls.indexOf(c) % 4}"/><text x="${X(v)}" y="${78 + 0}" text-anchor="middle" class="fig-sub">${f(v)}</text>`; });
  s += cls.map((c, i) => `<circle cx="${30 + i * 70}" cy="116" r="6" class="kc${i % 4}"/><text x="${40 + i * 70}" y="120" class="fig-sub">${esc_(c)}</text>`).join("");
  return svgWrap(W, 126, s, 560, "Eşik adayları");
}

/** Raw values and their min-max and z-score positions on three aligned number lines. */
function scalingSvg(x, mm, z, tests = []) {
  const W = 520, rows = [["ham x", x, Math.min(...x, ...tests), Math.max(...x, ...tests)], ["min-max", mm, Math.min(0, ...mm), Math.max(1, ...mm)], ["z-score", z, Math.min(-2, ...z), Math.max(2, ...z)]];
  let s = "";
  rows.forEach(([name, vals, lo, hi], r) => {
    const y = 30 + r * 52, X = (v) => 90 + ((v - lo) / (hi - lo || 1)) * (W - 120);
    s += `<text x="4" y="${y + 4}" class="fig-sub">${name}</text><line x1="90" y1="${y}" x2="${W - 30}" y2="${y}" class="fig-grid"/>`;
    const ticks = name === "min-max" ? [0, 0.5, 1] : name === "z-score" ? [-2, -1, 0, 1, 2] : [lo, (lo + hi) / 2, hi];
    s += ticks.map((t) => `<line x1="${X(t)}" y1="${y - 4}" x2="${X(t)}" y2="${y + 4}" class="fig-grid"/><text x="${X(t)}" y="${y + 18}" text-anchor="middle" class="fig-sub">${f(t, 2)}</text>`).join("");
    vals.forEach((v, i) => { const dup = vals.slice(0, i).filter((u) => Math.abs(u - v) < 1e-9).length; s += `<circle cx="${X(v)}" cy="${y - dup * 9}" r="5" class="kc0" opacity="0.85"/>`; });
  });
  return svgWrap(W, 170, s, 560, "Ölçekleme");
}

/** Softmax probabilities as bars, the correct class marked. */
function softmaxBars(Z, p, k) {
  const W = 420, bw = Math.min(60, (W - 40) / Z.length - 10);
  let s = `<line x1="20" y1="140" x2="${W - 10}" y2="140" class="fig-grid"/>`;
  p.forEach((v, i) => { const x = 30 + i * (bw + 10), hh = 120 * v; s += `<rect x="${x}" y="${140 - hh}" width="${bw}" height="${hh}" class="${i === k ? "kc2" : "kc0"}"/><text x="${x + bw / 2}" y="${134 - hh}" text-anchor="middle" class="fig-sub">${f(v, 2)}</text><text x="${x + bw / 2}" y="156" text-anchor="middle" class="fig-sub">${i + 1}${i === k ? " (doğru)" : ""}</text>`; });
  return svgWrap(W, 164, s, 440, "Softmax olasılıkları");
}

/** Step-unit network from inputs through AND units to an OR output, every weight and bias written. */
function mlpSvg(net, n) {
  const units = net.units, single = units.length === 1, H = Math.max(n, units.length) * 46 + 40, W = 470;
  const yIn = (i) => 30 + (i + 0.5) * ((H - 40) / n), yH = (k) => 30 + (k + 0.5) * ((H - 40) / units.length);
  let s = `<text x="40" y="16" text-anchor="middle" class="fig-sub">girdi</text><text x="230" y="16" text-anchor="middle" class="fig-sub">${single ? "çıktı (VE)" : "gizli: VE nöronları"}</text>${single ? "" : `<text x="410" y="16" text-anchor="middle" class="fig-sub">çıktı: VEYA</text>`}`;
  units.forEach((u, k) => u.w.forEach((w, i) => { if (!w) return; const y1 = yIn(i), y2 = yH(k); s += `<line x1="58" y1="${y1}" x2="204" y2="${y2}" class="${w > 0 ? "line accent" : "line dash"}"/>`; }));
  if (!single) units.forEach((_, k) => { s += `<line x1="256" y1="${yH(k)}" x2="384" y2="${H / 2 + 10}" class="line accent"/>`; });
  for (let i = 0; i < n; i++) s += `<circle cx="40" cy="${yIn(i)}" r="18" class="fig-box2"/><text x="40" y="${yIn(i) + 5}" text-anchor="middle" class="lab">x${"₁₂₃₄₅₆₇₈₉"[i] || i + 1}</text>`;
  units.forEach((u, k) => { s += `<circle cx="230" cy="${yH(k)}" r="24" class="fig-box"/><text x="230" y="${yH(k) + 5}" text-anchor="middle" class="lab">h${"₁₂₃₄₅₆₇₈₉"[k] || k + 1}</text><text x="260" y="${yH(k) - 18}" class="fig-sub">b = ${f(u.bias)}</text>`; });
  if (!single) s += `<circle cx="410" cy="${H / 2 + 10}" r="24" class="fig-box3"/><text x="410" y="${H / 2 + 15}" text-anchor="middle" class="lab">y</text><text x="410" y="${H / 2 + 50}" text-anchor="middle" class="fig-sub">b = −0.5</text>`;
  s += `<text x="4" y="${H - 4}" class="fig-sub">düz çizgi: ağırlık +1 · kesikli: −1 · bağlantı yoksa ağırlık 0 · her nöron step(w·x + b)</text>`;
  return svgWrap(W, H + 6, s, 520, "MLP şeması");
}

W.knn = I.knn;
W.hardsvm = I.hardsvm;
W.perceptron = I.perceptron;
W.lineplay = I.lineplay;
W.sigplay = I.sigplay;
W.entplay = I.entplay;
W.gdplay = I.gdplay;
W.threshplay = I.threshplay;
W.adaboost = I.adaboost;
