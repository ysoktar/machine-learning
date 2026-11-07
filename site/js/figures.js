// Explanatory figures (static SVG drawn with the theme's colours). <div data-widget="fig" data-fig="entropy" data-caption="…">
import { h } from "./lib/ui.js";
import { lines } from "./lib/plot.js";
import * as ml from "./lib/ml.js";

const NS = "http://www.w3.org/2000/svg";
function svg(w, hgt, inner, label) {
  const el = document.createElementNS(NS, "svg");
  el.setAttribute("viewBox", `0 0 ${w} ${hgt}`);
  el.setAttribute("class", "plot fig-svg");
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", label || "Şekil");
  el.innerHTML = inner;
  return el;
}
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" ${o.anchor ? `text-anchor="${o.anchor}"` : ""} class="${o.cls || "lab"}" ${o.size ? `style="font-size:${o.size}px"` : ""}>${s}</text>`;
const box = (x, y, w, hh, label, cls = "fig-box", sub = "") => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="8" class="${cls}"/>${T(x + w / 2, y + hh / 2 + (sub ? -2 : 4), label, { anchor: "middle" })}${sub ? T(x + w / 2, y + hh / 2 + 14, sub, { anchor: "middle", cls: "fig-sub" }) : ""}`;
const arrow = (x1, y1, x2, y2, cls = "fig-arrow") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" marker-end="url(#ah)"/>`;
const DEFS = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fig-head"/></marker></defs>`;
const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

export const FIG = {
  entropy: () => lines({ series: [
    { pts: range(0.001, 0.999, 120).map((p) => [p, ml.entropy([p, 1 - p])]), cls: "curve1", name: "entropi H(p)", color: "pos" },
    { pts: range(0, 1, 120).map((p) => [p, ml.gini([p, 1 - p])]), cls: "curve2", name: "Gini 1 − p² − (1−p)²", color: "neg" },
  ], xlim: [0, 1], ylim: [0, 1.05], xstep: 0.25, ystep: 0.25, xlabel: "p (bir sınıfın oranı)", ylabel: "safsızlık", aria: "Entropi eğrisi" }),

  sigmoid: () => lines({ series: [
    { pts: range(-6, 6, 120).map((z) => [z, ml.sigmoid(z)]), cls: "curve1", name: "σ(z) = 1/(1 + e⁻ᶻ)", color: "pos" },
    { pts: [[-6, 0.5], [6, 0.5]], cls: "curve3", name: "karar eşiği 0.5 (z = 0)", color: "s3" },
  ], xlim: [-6, 6], ylim: [0, 1], xstep: 2, ystep: 0.25, xlabel: "z = w·x + b", ylabel: "p", aria: "Sigmoid" }),

  logloss: () => lines({ series: [
    { pts: range(0.02, 1, 100).map((p) => [p, -Math.log(p)]), cls: "curve1", name: "gerçek y = 1: kayıp −ln p", color: "pos" },
    { pts: range(0, 0.98, 100).map((p) => [p, -Math.log(1 - p)]), cls: "curve2", name: "gerçek y = 0: kayıp −ln(1 − p)", color: "neg" },
  ], xlim: [0, 1], ylim: [0, 4], xstep: 0.25, ystep: 1, xlabel: "modelin verdiği p = P(y = 1)", ylabel: "kayıp", aria: "Log-loss" }),

  hinge: () => lines({ series: [
    { pts: [[-2, 1], [0, 1], [0, 0], [3, 0]], cls: "curve3", name: "0-1 kaybı (hata mı?)", color: "s3" },
    { pts: range(-2, 3, 50).map((m) => [m, Math.max(0, 1 - m)]), cls: "curve1", name: "menteşe max(0, 1 − y·f)", color: "pos" },
    { pts: range(-2, 3, 80).map((m) => [m, Math.log(1 + Math.exp(-m)) / Math.LN2]), cls: "curve2", name: "lojistik kayıp (log₂ ölçekli)", color: "neg" },
  ], xlim: [-2, 3], ylim: [0, 3], xstep: 1, ystep: 1, xlabel: "y·f(x) (doğru tarafta ne kadar emin?)", ylabel: "kayıp", aria: "Kayıplar" }),

  bowl: () => {
    const L = (w) => (w - 2) ** 2 + 0.3;
    const path = (w0, eta, n) => { const p = [[w0, L(w0)]]; let w = w0; for (let i = 0; i < n; i++) { w = w - eta * 2 * (w - 2); p.push([w, L(w)]); } return p; };
    return lines({ series: [
      { pts: range(-1, 5, 100).map((w) => [w, L(w)]), cls: "curve3", name: "kayıp L(w)", color: "s3" },
      { pts: path(-0.5, 0.1, 8), cls: "curve1", dots: true, name: "küçük η: yavaş ama emin", color: "pos" },
      { pts: path(4.6, 0.9, 6), cls: "curve2", dots: true, name: "büyük η: sağa sola savrulur", color: "neg" },
    ], xlim: [-1, 5], ylim: [0, 8], xstep: 1, ystep: 2, xlabel: "w", ylabel: "L(w)", aria: "Gradyan inişi" });
  },

  bvcurve: () => {
    const c = range(0, 10, 100);
    return lines({ series: [
      { pts: c.map((x) => [x, 3 * Math.exp(-0.45 * x) + 0.05]), cls: "curve1", name: "yanlılık²", color: "pos" },
      { pts: c.map((x) => [x, 0.05 + 0.03 * x * x]), cls: "curve2", name: "varyans", color: "neg" },
      { pts: c.map((x) => [x, 3 * Math.exp(-0.45 * x) + 0.1 + 0.03 * x * x + 0.4]), cls: "curve3", name: "toplam test hatası (+ gürültü)", color: "s3" },
    ], xlim: [0, 10], ylim: [0, 3.6], xstep: 2, ystep: 1, xlabel: "model karmaşıklığı →", ylabel: "hata", aria: "Yanlılık varyans" });
  },

  dartboard: () => {
    const rnd = ml.rng(7);
    const board = (cx, cy, title, bias, spread) => {
      let s = `<circle cx="${cx}" cy="${cy}" r="56" class="fig-ring"/><circle cx="${cx}" cy="${cy}" r="36" class="fig-ring"/><circle cx="${cx}" cy="${cy}" r="14" class="fig-bull"/>`;
      for (let i = 0; i < 9; i++) {
        const a = rnd() * 6.283, r = spread * Math.sqrt(rnd());
        s += `<circle cx="${cx + bias + r * Math.cos(a)}" cy="${cy - bias * 0.6 + r * Math.sin(a)}" r="4" class="pt-pos"/>`;
      }
      return s + T(cx, cy + 76, title, { anchor: "middle" });
    };
    return svg(460, 360, board(115, 80, "düşük yanlılık · düşük varyans", 0, 9) + board(345, 80, "düşük yanlılık · yüksek varyans", 0, 42)
      + board(115, 255, "yüksek yanlılık · düşük varyans", 30, 9) + board(345, 255, "yüksek yanlılık · yüksek varyans", 26, 40), "Hedef tahtası");
  },

  split: () => svg(460, 120, `${DEFS}
    <rect x="10" y="30" width="300" height="40" rx="6" class="fig-box"/><rect x="310" y="30" width="70" height="40" rx="6" class="fig-box2"/><rect x="380" y="30" width="70" height="40" rx="6" class="fig-box3"/>
    ${T(160, 55, "eğitim (%70): ağırlıkları öğren", { anchor: "middle" })}${T(345, 55, "doğrulama", { anchor: "middle", size: 11 })}${T(415, 55, "test", { anchor: "middle" })}
    ${T(345, 95, "k, λ, derinlik seç", { anchor: "middle", cls: "fig-sub" })}${T(415, 95, "en sonda, 1 kez", { anchor: "middle", cls: "fig-sub" })}${T(160, 95, "model burada öğrenir", { anchor: "middle", cls: "fig-sub" })}`, "Veri bölmesi"),

  cv: () => {
    let s = "";
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) s += `<rect x="${70 + c * 66}" y="${12 + r * 30}" width="62" height="24" rx="4" class="${c === r ? "fig-box3" : "fig-box"}"/>`;
      s += T(10, 29 + r * 30, `Tur ${r + 1}`) + T(410, 29 + r * 30, `→ skor ${r + 1}`);
    }
    return svg(470, 175, s + T(235, 170, "renkli kat doğrulama, diğer dördü eğitim · sonuç = ortalama ± std", { anchor: "middle", cls: "fig-sub" }), "Çapraz doğrulama");
  },

  neuron: () => svg(460, 200, `${DEFS}
    ${box(10, 20, 60, 34, "x₁")}${box(10, 83, 60, 34, "x₂")}${box(10, 146, 60, 34, "1", "fig-box2")}
    <circle cx="230" cy="100" r="38" class="fig-box"/>${T(230, 96, "Σ", { anchor: "middle", size: 20 })}${T(230, 116, "z = w·x + b", { anchor: "middle", cls: "fig-sub" })}
    ${arrow(70, 37, 193, 90)}${arrow(70, 100, 192, 100)}${arrow(70, 163, 193, 110)}
    ${T(120, 52, "w₁")}${T(120, 95, "w₂")}${T(120, 150, "b")}
    ${box(300, 80, 70, 40, "g(z)", "fig-box2")}${arrow(268, 100, 300, 100)}${arrow(370, 100, 410, 100)}${T(430, 105, "ŷ", { anchor: "middle", size: 16 })}
    ${T(335, 140, "sign → perceptron", { anchor: "middle", cls: "fig-sub" })}${T(335, 156, "σ → lojistik regresyon", { anchor: "middle", cls: "fig-sub" })}${T(335, 172, "yok → doğrusal regresyon", { anchor: "middle", cls: "fig-sub" })}`, "Tek nöron"),

  mlp: () => {
    const n = (x, y, l, cls = "fig-box") => `<circle cx="${x}" cy="${y}" r="22" class="${cls}"/>${T(x, y + 5, l, { anchor: "middle" })}`;
    let e = "";
    for (const [a, b] of [[60, 60], [60, 150]]) for (const [c, d] of [[230, 60], [230, 150]]) e += `<line x1="${a + 22}" y1="${b}" x2="${c - 22}" y2="${d}" class="fig-arrow"/>`;
    for (const [c, d] of [[230, 60], [230, 150]]) e += `<line x1="${c + 22}" y1="${d}" x2="${378}" y2="105" class="fig-arrow"/>`;
    return svg(460, 215, e + n(60, 60, "x₁") + n(60, 150, "x₂") + n(230, 60, "h₁", "fig-box2") + n(230, 150, "h₂", "fig-box2") + n(400, 105, "ŷ", "fig-box3")
      + T(60, 200, "girdi", { anchor: "middle", cls: "fig-sub" }) + T(230, 200, "gizli katman: h = g(Wx + b)", { anchor: "middle", cls: "fig-sub" }) + T(400, 200, "çıktı: σ(v·h + c)", { anchor: "middle", cls: "fig-sub" }), "2-2-1 ağı");
  },

  street: () => {
    // boundary x1 + x2 = 2.5 on a 0..4 grid
    const S = 70, ox = 40, oy = 300, X = (v) => ox + v * S, Y = (v) => oy - v * S;
    const line = (c) => `<line x1="${X(-0.3)}" y1="${Y(c + 0.3)}" x2="${X(c + 0.3)}" y2="${Y(-0.3)}"`;
    const pts = [[2, 2, 1, true], [3, 1, 1, true], [3.3, 2.6, 1, false], [0, 0, -1, false], [1, 0, -1, true], [0.2, 1, -1, false]];
    let s = `${DEFS}<polygon points="${X(-0.3)},${Y(1.8)} ${X(1.8)},${Y(-0.3)} ${X(3.5)},${Y(-0.3)} ${X(-0.3)},${Y(3.5)}" class="fig-street"/>`;
    s += `${line(2.5)} class="line"/>${line(1.5)} class="line dash"/>${line(3.5)} class="line dash"/>`;
    for (const [a, b, y, sv] of pts) s += (y > 0 ? `<circle cx="${X(a)}" cy="${Y(b)}" r="7" class="pt-pos"/>` : `<rect x="${X(a) - 6}" y="${Y(b) - 6}" width="12" height="12" class="pt-neg"/>`) + (sv ? `<circle cx="${X(a)}" cy="${Y(b)}" r="12" class="sv"/>` : "");
    s += `<line x1="${X(1)}" y1="${Y(0)}" x2="${X(1.5)}" y2="${Y(0.5)}" class="fig-arrow" marker-end="url(#ah)"/>${T(X(1.32), Y(0.15), "marj 1/‖w‖", { cls: "fig-sub" })}`;
    s += T(X(2.75), Y(-0.05), "w·x + b = −1", { cls: "fig-sub" }) + T(X(3.05), Y(0.5), "w·x + b = 0", { cls: "fig-sub" }) + T(X(3.2), Y(1.2), "w·x + b = +1", { cls: "fig-sub" });
    s += T(X(2.6), Y(3.6), "halkalı = destek vektörü", { cls: "fig-sub" });
    return svg(360, 340, s, "SVM sokağı");
  },

  tree: () => {
    const nb = (x, y, t, sub, cls = "fig-box") => box(x - 70, y, 140, 44, t, cls, sub);
    return svg(460, 260, `${DEFS}${nb(230, 10, "Acele var mı?", "kök: en büyük IG")}
      ${arrow(195, 54, 110, 100)}${arrow(265, 54, 340, 100)}${T(130, 80, "hayır")}${T(320, 80, "evet")}
      ${nb(100, 100, "→ Evet", "yaprak [4/0]", "fig-box3")}${nb(350, 100, "Kiminle?", "[1 Evet / 2 Hayır]")}
      ${arrow(320, 144, 270, 190)}${arrow(380, 144, 420, 190)}${T(268, 172, "yalnız")}${T(408, 172, "arkadaş")}
      ${nb(250, 190, "→ Hayır", "[0/2]", "fig-box3")}${box(370, 190, 85, 44, "→ Evet", "fig-box3", "[1/0]")}`, "Karar ağacı");
  },

  ensemble: () => svg(470, 250, `${DEFS}
    ${T(10, 18, "Bagging / rastgele orman: paralel, bağımsız")}
    ${box(10, 30, 70, 34, "veri")}
    ${[0, 1, 2].map((i) => arrow(80, 47, 120, 25 + i * 22)).join("")}
    ${[0, 1, 2].map((i) => box(122, 12 + i * 22, 110, 20, `bootstrap ${i + 1} → ağaç`, "fig-box2")).join("")}
    ${[0, 1, 2].map((i) => arrow(232, 22 + i * 22, 290, 47)).join("")}${box(292, 30, 160, 34, "oy / ortalama", "fig-box3", "varyans ↓")}
    ${T(10, 128, "Boosting: sıralı, her model öncekinin hatasına odaklanır")}
    ${box(10, 145, 80, 40, "model 1")}${arrow(90, 165, 125, 165)}${box(125, 145, 80, 40, "model 2", "fig-box", "hataları ağır")}${arrow(205, 165, 240, 165)}${box(240, 145, 80, 40, "model 3")}${arrow(320, 165, 350, 165)}${box(350, 145, 102, 40, "Σ αₜ·hₜ", "fig-box3", "yanlılık ↓")}
    ${T(235, 225, "AdaBoost: yanlış örneklerin ağırlığını artır · gradyan artırma: kalıntıya yeni ağaç uydur", { anchor: "middle", cls: "fig-sub" })}`, "Topluluk yöntemleri"),

  knnidea: () => {
    const P = [[1, 2, 1], [2, 1, 1], [2, 3, 1], [3, 2, 1], [4, 4, -1], [6, 4, -1], [7, 1, -1], [7, 6, -1]];
    const S = 45, ox = 30, oy = 300, X = (v) => ox + v * S, Y = (v) => oy - v * S;
    let s = `<circle cx="${X(4)}" cy="${Y(3)}" r="${Math.SQRT2 * S}" class="ring"/><circle cx="${X(4)}" cy="${Y(3)}" r="${Math.sqrt(4) * S + 1}" class="ring" style="stroke:var(--s4)"/>`;
    for (const [a, b, y] of P) s += y > 0 ? `<circle cx="${X(a)}" cy="${Y(b)}" r="7" class="pt-pos"/>` : `<rect x="${X(a) - 6}" y="${Y(b) - 6}" width="12" height="12" class="pt-neg"/>`;
    s += `<rect x="${X(4) - 7}" y="${Y(3) - 7}" width="14" height="14" transform="rotate(45 ${X(4)} ${Y(3)})" class="pt-q"/>`;
    s += T(X(4) + 12, Y(3) + 22, "q") + T(X(5.2), Y(5.3), "k = 1: en yakın tek komşu (−)", { cls: "fig-sub" }) + T(X(5.2), Y(4.9), "k = 3: dairede 2 artı, 1 eksi → +", { cls: "fig-sub" });
    return svg(370, 320, s, "kNN fikri");
  },
};

export function figure(ds) {
  const make = FIG[ds.fig];
  if (!make) return h("p", { class: "err" }, "Bilinmeyen şekil: " + ds.fig);
  return h("figure", { class: "fig" }, make(ds), ds.caption ? h("figcaption", {}, ds.caption) : null);
}
