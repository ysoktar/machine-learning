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
      { pts: c.map((x) => [x, 3 * Math.exp(-0.45 * x) + 0.05]), cls: "curve1", name: "yanlılık² (Bias²)", color: "pos" },
      { pts: c.map((x) => [x, 0.05 + 0.03 * x * x]), cls: "curve2", name: "varyans (Var)", color: "neg" },
      { pts: c.map((x) => [x, 3 * Math.exp(-0.45 * x) + 0.1 + 0.03 * x * x + 0.4]), cls: "curve3", name: "toplam test hatası (+ gürültü σ²)", color: "s3" },
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

  split: () => svg(460, 130, `${DEFS}
    <rect x="10" y="20" width="300" height="40" rx="6" class="fig-box"/><rect x="310" y="20" width="70" height="40" rx="6" class="fig-box2"/><rect x="380" y="20" width="70" height="40" rx="6" class="fig-box3"/>
    ${T(160, 45, "eğitim (%70): ağırlıkları öğren", { anchor: "middle" })}${T(345, 45, "doğrulama", { anchor: "middle", size: 11 })}${T(415, 45, "test", { anchor: "middle" })}
    <line x1="345" y1="62" x2="345" y2="80" class="fig-proj"/><line x1="415" y1="62" x2="415" y2="104" class="fig-proj"/>
    ${T(160, 84, "model burada öğrenir", { anchor: "middle", cls: "fig-sub" })}${T(350, 92, "k, λ, derinlik seçilir", { anchor: "end", cls: "fig-sub" })}${T(420, 118, "en sonda, yalnız bir kez", { anchor: "end", cls: "fig-sub" })}`, "Veri bölmesi"),

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

  ensemble: () => svg(470, 280, `${DEFS}
    ${T(10, 16, "Bagging / rastgele orman: paralel, bağımsız")}
    ${box(10, 50, 70, 34, "veri")}
    ${[0, 1, 2].map((i) => arrow(80, 67, 128, 41 + i * 30)).join("")}
    ${[0, 1, 2].map((i) => box(130, 28 + i * 30, 140, 26, `örneklem ${i + 1} → ağaç`, "fig-box2")).join("")}
    ${[0, 1, 2].map((i) => arrow(270, 41 + i * 30, 304, 67)).join("")}${box(306, 50, 150, 34, "oy / ortalama", "fig-box3", "varyans ↓")}
    ${T(10, 142, "Boosting: sıralı, her model öncekinin hatasına odaklanır")}
    ${box(10, 160, 80, 40, "model 1")}${arrow(90, 180, 125, 180)}${box(125, 160, 80, 40, "model 2", "fig-box", "hataları ağır")}${arrow(205, 180, 240, 180)}${box(240, 160, 80, 40, "model 3")}${arrow(320, 180, 350, 180)}${box(350, 160, 106, 40, "Σ αₜ·hₜ", "fig-box3", "yanlılık ↓")}
    ${T(235, 236, "AdaBoost: yanlış örneklerin ağırlığını artırır", { anchor: "middle", cls: "fig-sub" })}${T(235, 256, "Gradyan artırma: kalan hataya (kalıntıya) yeni ağaç uydurur", { anchor: "middle", cls: "fig-sub" })}`, "Topluluk yöntemleri"),

  knnidea: () => {
    const P = [[1, 2, 1], [2, 1, 1], [2, 3, 1], [3, 2, 1], [4, 4, -1], [6, 4, -1], [7, 1, -1], [7, 6, -1]];
    const S = 45, ox = 30, oy = 300, X = (v) => ox + v * S, Y = (v) => oy - v * S;
    let s = `<circle cx="${X(4)}" cy="${Y(3)}" r="${1.2 * S}" class="ring"/><circle cx="${X(4)}" cy="${Y(3)}" r="${Math.sqrt(4) * S + 1}" class="ring" style="stroke:var(--s4)"/>`;
    for (const [a, b, y] of P) s += y > 0 ? `<circle cx="${X(a)}" cy="${Y(b)}" r="7" class="pt-pos"/>` : `<rect x="${X(a) - 6}" y="${Y(b) - 6}" width="12" height="12" class="pt-neg"/>`;
    s += `<rect x="${X(4) - 7}" y="${Y(3) - 7}" width="14" height="14" transform="rotate(45 ${X(4)} ${Y(3)})" class="pt-q"/>`;
    s += T(X(4) + 12, Y(3) + 22, "q") + T(10, 326, "İç daire, k = 1: en yakın tek komşu kare (−), karar −", { cls: "fig-sub" }) + T(10, 346, "Dış daire, k = 3: içinde 2 daire (+), 1 kare (−), karar +", { cls: "fig-sub" });
    return svg(370, 356, s, "kNN fikri");
  },
};


// ---------------------------------------------------------------- figures added for the gaps found in the audit
const pt = (x, y, cls, r = 6) => cls === "pos" ? `<circle cx="${x}" cy="${y}" r="${r}" class="pt-pos"/>` : cls === "neg" ? `<rect x="${x - r + 0.5}" y="${y - r + 0.5}" width="${2 * r - 1}" height="${2 * r - 1}" class="pt-neg"/>` : `<circle cx="${x}" cy="${y}" r="${r}" class="fig-gray"/>`;
Object.assign(FIG, {
  cm: () => svg(470, 290, `
    ${T(285, 18, "Modelin tahmini", { anchor: "middle" })}
    ${T(205, 42, "Pozitif dedi", { anchor: "middle", cls: "fig-sub" })}${T(365, 42, "Negatif dedi", { anchor: "middle", cls: "fig-sub" })}
    <text x="22" y="165" class="lab" transform="rotate(-90 22 165)" text-anchor="middle">Gerçek sınıf</text>
    ${T(80, 112, "Gerçekte", { anchor: "middle", cls: "fig-sub" })}${T(80, 127, "pozitif", { anchor: "middle", cls: "fig-sub" })}${T(80, 212, "Gerçekte", { anchor: "middle", cls: "fig-sub" })}${T(80, 227, "negatif", { anchor: "middle", cls: "fig-sub" })}
    <rect x="125" y="52" width="160" height="100" class="fig-ok"/><rect x="285" y="52" width="160" height="100" class="fig-bad"/>
    <rect x="125" y="152" width="160" height="100" class="fig-bad"/><rect x="285" y="152" width="160" height="100" class="fig-ok"/>
    ${T(205, 95, "TP", { anchor: "middle", size: 20 })}${T(205, 117, "doğru pozitif", { anchor: "middle", cls: "fig-sub" })}${T(205, 132, "hastaya “hasta”", { anchor: "middle", cls: "fig-sub" })}
    ${T(365, 95, "FN", { anchor: "middle", size: 20 })}${T(365, 117, "kaçırılan", { anchor: "middle", cls: "fig-sub" })}${T(365, 132, "hastaya “sağlıklı”", { anchor: "middle", cls: "fig-sub" })}
    ${T(205, 195, "FP", { anchor: "middle", size: 20 })}${T(205, 217, "yanlış alarm", { anchor: "middle", cls: "fig-sub" })}${T(205, 232, "sağlıklıya “hasta”", { anchor: "middle", cls: "fig-sub" })}
    ${T(365, 195, "TN", { anchor: "middle", size: 20 })}${T(365, 217, "doğru negatif", { anchor: "middle", cls: "fig-sub" })}${T(365, 232, "sağlıklıya “sağlıklı”", { anchor: "middle", cls: "fig-sub" })}
    ${T(285, 278, "yeşil köşegen: doğru tahminler · kırmızı: hatalar", { anchor: "middle", cls: "fig-sub" })}`, "Karmaşıklık matrisi"),

  cmread: () => {
    const cell = (x, y, t, n, cls) => `<rect x="${x}" y="${y}" width="80" height="56" class="${cls}"/>${T(x + 40, y + 26, t, { anchor: "middle" })}${T(x + 40, y + 44, n, { anchor: "middle", cls: "fig-sub" })}`;
    const m = (ox, hl, title, formula) => `${T(ox + 80, 18, title, { anchor: "middle" })}
      ${cell(ox, 30, "TP", "4", hl.includes("TP") ? "fig-hl" : "fig-box")}${cell(ox + 80, 30, "FN", "2", hl.includes("FN") ? "fig-hl" : "fig-box")}
      ${cell(ox, 86, "FP", "1", hl.includes("FP") ? "fig-hl" : "fig-box")}${cell(ox + 80, 86, "TN", "3", hl.includes("TN") ? "fig-hl" : "fig-box")}
      ${T(ox + 80, 166, formula, { anchor: "middle", cls: "fig-sub" })}`;
    return svg(560, 180, m(10, ["TP", "FP"], "Precision: sol sütun", "TP / (TP + FP) = 4/5 = 0.80") + m(200, ["TP", "FN"], "Recall: üst satır", "TP / (TP + FN) = 4/6 = 0.67") + m(390, ["TP", "TN"], "Accuracy: köşegen", "(TP + TN) / n = 7/10 = 0.70"), "Ölçütlerin matristeki yeri");
  },

  onehot: () => svg(470, 190, `${DEFS}
    ${T(60, 20, "şehir", { anchor: "middle" })}
    ${["Ankara", "İzmir", "Ankara", "İstanbul"].map((c, i) => box(10, 30 + i * 36, 100, 30, c, "fig-box")).join("")}
    ${arrow(118, 95, 170, 95)}
    ${["Ankara", "İzmir", "İstanbul"].map((c, j) => T(225 + j * 85, 20, c, { anchor: "middle", size: 11 })).join("")}
    ${[[1, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]].map((r, i) => r.map((v, j) => box(185 + j * 85, 30 + i * 36, 80, 30, String(v), v ? "fig-box3" : "fig-box")).join("")).join("")}
    ${T(300, 182, "her şehir için bir 0/1 sütunu; her satırda tam bir tane 1", { anchor: "middle", cls: "fig-sub" })}`, "One-hot kodlama"),

  pcawalk: () => {
    // the worked example of week 2: A(0,0) B(1,1) C(3,2) D(4,1), mean (2,1), PC1 ∝ (3,1), PC2 ∝ (−1,3)
    const P = [["A", 0, 0], ["B", 1, 1], ["C", 3, 2], ["D", 4, 1]];
    const S = 70, ox = 50, oy = 240, X = (v) => ox + v * S, Y = (v) => oy - v * S;
    const m = [2, 1], u = [3 / Math.sqrt(10), 1 / Math.sqrt(10)], w = [-u[1], u[0]];
    let s = `${DEFS}`;
    for (let i = -0.5; i <= 4.51; i += 0.5) s += `<line x1="${X(i)}" y1="${Y(-0.5)}" x2="${X(i)}" y2="${Y(2.8)}" class="fig-grid"/>`;
    for (let j = -0.5; j <= 2.81; j += 0.5) s += `<line x1="${X(-0.5)}" y1="${Y(j)}" x2="${X(4.5)}" y2="${Y(j)}" class="fig-grid"/>`;
    for (let i = 0; i <= 4; i++) s += T(X(i), Y(-0.5) + 14, i, { anchor: "middle", cls: "fig-sub" });
    for (let j = 0; j <= 2; j++) s += T(X(-0.5) - 6, Y(j) + 4, j, { anchor: "end", cls: "fig-sub" });
    s += `<line x1="${X(m[0] - u[0] * 2.6)}" y1="${Y(m[1] - u[1] * 2.6)}" x2="${X(m[0] + u[0] * 2.6)}" y2="${Y(m[1] + u[1] * 2.6)}" class="line accent" marker-end="url(#ah)"/>`;
    s += `<line x1="${X(m[0])}" y1="${Y(m[1])}" x2="${X(m[0] + w[0] * 1.3)}" y2="${Y(m[1] + w[1] * 1.3)}" class="line dash" marker-end="url(#ah)"/>`;
    for (const [n, a, b] of P) {
      const t = (a - m[0]) * u[0] + (b - m[1]) * u[1], fx = m[0] + t * u[0], fy = m[1] + t * u[1];
      s += `<line x1="${X(a)}" y1="${Y(b)}" x2="${X(fx)}" y2="${Y(fy)}" class="fig-proj"/>`;
      s += `<circle cx="${X(fx)}" cy="${Y(fy)}" r="3" class="fig-gray"/>`;
      // point label away from the PC1 line: points below it get the label underneath, points above it on top
      const below = (a - m[0]) * w[0] + (b - m[1]) * w[1] < 0;
      s += pt(X(a), Y(b), "pos") + T(X(a), Y(b) + (below ? 20 : -11), `${n}(${a}, ${b})`, { anchor: "middle", size: 12 });
    }
    s += pt(X(m[0]), Y(m[1]), "q", 5) + T(X(m[0]) - 8, Y(m[1]) - 8, "μ", { anchor: "end" });
    s += T(X(4.45), Y(1.95), "PC1 ∝ (3, 1)", { anchor: "end", cls: "fig-sub" }) + T(X(m[0] + w[0] * 1.3) - 8, Y(m[1] + w[1] * 1.3) + 4, "PC2 ∝ (−1, 3)", { anchor: "end", cls: "fig-sub" });
    return svg(400, 300, s, "PCA örneği");
  },
  pcaaxes: () => {
    const P = [[1, 2], [2, 3], [3, 3], [4, 5], [5, 4], [6, 7]];
    const S = 42, ox = 40, oy = 330, X = (v) => ox + v * S, Y = (v) => oy - v * S;
    const m = [3.5, 4], v1 = [0.72, 0.69], v2 = [-0.69, 0.72];
    let s = `${DEFS}`;
    for (let i = 0; i <= 8; i++) s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(8)}" class="fig-grid"/><line x1="${X(0)}" y1="${Y(i)}" x2="${X(8)}" y2="${Y(i)}" class="fig-grid"/>`;
    s += `<line x1="${X(m[0] - v1[0] * 4.5)}" y1="${Y(m[1] - v1[1] * 4.5)}" x2="${X(m[0] + v1[0] * 4.5)}" y2="${Y(m[1] + v1[1] * 4.5)}" class="line accent" marker-end="url(#ah)"/>`;
    s += `<line x1="${X(m[0] - v2[0] * 1.3)}" y1="${Y(m[1] - v2[1] * 1.3)}" x2="${X(m[0] + v2[0] * 1.3)}" y2="${Y(m[1] + v2[1] * 1.3)}" class="line dash" marker-end="url(#ah)"/>`;
    for (const [a, b] of P) {
      const t = (a - m[0]) * v1[0] + (b - m[1]) * v1[1];
      s += `<line x1="${X(a)}" y1="${Y(b)}" x2="${X(m[0] + t * v1[0])}" y2="${Y(m[1] + t * v1[1])}" class="fig-proj"/>` + pt(X(a), Y(b), "pos");
    }
    s += pt(X(m[0]), Y(m[1]), "q", 4) + pt(250, 344, "q", 4) + T(260, 348, "= verinin ortalaması", { cls: "fig-sub" });
    s += T(X(6.4), Y(7.55), "PC1: en çok yayılma (%95)", { anchor: "end", cls: "fig-sub" }) + T(X(1.4), Y(5.6), "PC2: dik yön (%5)", { cls: "fig-sub" });
    return svg(400, 356, s, "PCA eksenleri");
  },

  rocex: () => lines({ series: [
    { pts: [[0, 0], [0, 0.25], [0, 0.5], [0.25, 0.5], [0.25, 0.75], [0.5, 0.75], [0.5, 1], [0.75, 1], [1, 1]], cls: "curve1", dots: true, name: "model (AUC = 0.81)", color: "pos" },
    { pts: [[0, 0], [1, 1]], cls: "curve3", name: "rastgele tahmin (AUC = 0.5)", color: "s3" },
  ], xlim: [0, 1], ylim: [0, 1], xstep: 0.25, ystep: 0.25, xlabel: "FPR (yanlış alarm oranı)", ylabel: "TPR (recall)", aria: "Örnek ROC" }),

  residuals: () => {
    const P = [[1, 2], [2, 3], [3, 5], [4, 6]], f = (x) => 0.5 + 1.4 * x;
    const S = 70, ox = 40, oy = 300, X = (v) => ox + v * S, Y = (v) => oy - v * 40;
    let s = "";
    for (let i = 0; i <= 5; i++) s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(7)}" class="fig-grid"/>${T(X(i), Y(0) + 15, i, { anchor: "middle", cls: "fig-sub" })}`;
    for (let j = 0; j <= 7; j++) s += `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(5)}" y2="${Y(j)}" class="fig-grid"/>${T(X(0) - 8, Y(j) + 4, j, { anchor: "end", cls: "fig-sub" })}`;
    s += `<line x1="${X(0)}" y1="${Y(f(0))}" x2="${X(5)}" y2="${Y(f(5))}" class="line accent"/>`;
    for (const [a, b] of P) s += `<line x1="${X(a)}" y1="${Y(b)}" x2="${X(a)}" y2="${Y(f(a))}" class="fig-err"/>` + pt(X(a), Y(b), "pos") + T(X(a) + 8, (Y(b) + Y(f(a))) / 2 + 4, `y − ŷ = ${(b - f(a)).toFixed(1)}`, { cls: "fig-sub" });
    s += T(X(3.4), Y(6.6), "ŷ = 0.5 + 1.4x", { cls: "fig-sub" }) + T(X(5), Y(0) + 30, "x", { anchor: "end" }) + T(X(0) - 30, Y(7), "y");
    return svg(440, 340, s, "Artıklar");
  },

  fitpanels: () => {
    const P = [[0.05, 0.3], [0.15, 0.9], [0.25, 1.0], [0.35, 0.55], [0.45, 0.2], [0.55, -0.45], [0.65, -0.9], [0.75, -1.0], [0.85, -0.55], [0.95, 0.1]];
    const panel = (ox, title, fn, sub) => {
      const X = (v) => ox + 10 + v * 130, Y = (v) => 110 - v * 55;
      let s = `<rect x="${ox}" y="30" width="150" height="160" rx="8" class="fig-box"/>${T(ox + 75, 20, title, { anchor: "middle" })}${T(ox + 75, 210, sub, { anchor: "middle", cls: "fig-sub" })}`;
      for (const [a, b] of P) s += pt(X(a), Y(b), "pos", 3.5);
      const pts = Array.from({ length: 81 }, (_, i) => { const x = i / 80; return `${X(x)},${Math.max(32, Math.min(188, Y(fn(x))))}`; }).join(" ");
      return s + `<polyline points="${pts}" class="curve2"/>`;
    };
    const wig = (x) => P.reduce((acc, [xi, yi], i) => acc + yi * P.reduce((m, [xj], j) => (j === i ? m : (m * (x - xj)) / (xi - xj)), 1), 0);
    return svg(500, 225, panel(5, "yetersiz uyum", () => 0, "çok basit: deseni kaçırır") + panel(175, "iyi uyum", (x) => Math.sin(2 * Math.PI * x), "deseni yakalar, gürültüyü değil") + panel(345, "aşırı uyum", wig, "her noktadan geçer, savrulur"), "Uyum türleri");
  },

  percupdate: () => {
    // old w = (−1, 1), b = −1.5 misclassifies (4, 4); update with η = 0.1: w = (−0.6, 1.4), b = −1.4 separates all six points
    const S = 52, ox = 40, oy = 290, X = (v) => ox + v * S, Y = (v) => oy - v * S;
    const line = (w, b, cls) => { const x0 = -0.5, x1 = 6; return `<line x1="${X(x0)}" y1="${Y(-(w[0] * x0 + b) / w[1])}" x2="${X(x1)}" y2="${Y(-(w[0] * x1 + b) / w[1])}" class="${cls}"/>`; };
    let s = `${DEFS}<defs><clipPath id="pclip"><rect x="${X(0)}" y="${Y(5)}" width="${X(5.5) - X(0)}" height="${Y(0) - Y(5)}"/></clipPath></defs>`;
    for (let i = 0; i <= 5; i++) s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(5)}" class="fig-grid"/>${T(X(i), Y(0) + 15, i, { anchor: "middle", cls: "fig-sub" })}`;
    for (let j = 0; j <= 5; j++) s += `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(5.5)}" y2="${Y(j)}" class="fig-grid"/>${T(X(0) - 8, Y(j) + 4, j, { anchor: "end", cls: "fig-sub" })}`;
    s += `<g clip-path="url(#pclip)">${line([-1, 1], -1.5, "line ghost")}${line([-0.6, 1.4], -1.4, "line accent")}</g>`;
    for (const [a, c] of [[1, 3], [2, 3.5]]) s += pt(X(a), Y(c), "pos");
    for (const [a, c] of [[1, 1], [3, 1], [4, 2]]) s += pt(X(a), Y(c), "neg");
    s += pt(X(4), Y(4), "pos", 7) + `<circle cx="${X(4)}" cy="${Y(4)}" r="12" class="cur"/>`;
    s += T(X(4), Y(3.45), "(4, 4): pozitif ama", { anchor: "middle", cls: "fig-sub" }) + T(X(4), Y(3.2), "eski sınırın eksi tarafında", { anchor: "middle", cls: "fig-sub" });
    s += T(X(1.15), Y(1.9), "eski sınır", { cls: "fig-sub" }) + T(X(4.6), Y(2.95), "yeni sınır", { cls: "fig-sub" });
    return svg(360, 320, s, "Perceptron güncellemesi");
  },

  softbars: () => {
    const z = [2, 1, 0], e = z.map(Math.exp), sm = e.reduce((a, b) => a + b), p = e.map((v) => v / sm);
    let s = "";
    z.forEach((v, i) => {
      const x = 40 + i * 140;
      s += `<rect x="${x}" y="${150 - v * 30}" width="40" height="${v * 30 + 1}" class="fig-box"/>${T(x + 20, 140 - v * 30, `z = ${v}`, { anchor: "middle", cls: "fig-sub" })}`;
      s += `<rect x="${x + 50}" y="${150 - p[i] * 120}" width="40" height="${p[i] * 120}" class="fig-box3"/>${T(x + 70, 140 - p[i] * 120, `p = ${p[i].toFixed(3)}`, { anchor: "middle", cls: "fig-sub" })}`;
      s += T(x + 45, 172, `sınıf ${i + 1}`, { anchor: "middle" });
    });
    return svg(450, 190, `<line x1="20" y1="150" x2="430" y2="150" class="fig-arrow"/>` + s + T(225, 14, "gri: ham skorlar · mavi: softmax olasılıkları (toplam 1)", { anchor: "middle", cls: "fig-sub" }), "Softmax");
  },

  ridgelasso: () => {
    const panel = (ox, title, shape, sub) => {
      const cx = ox + 110, cy = 130;
      let s = `<line x1="${ox + 10}" y1="${cy}" x2="${ox + 210}" y2="${cy}" class="fig-arrow"/><line x1="${cx}" y1="30" x2="${cx}" y2="230" class="fig-arrow"/>${T(ox + 205, cy - 6, "w₁", { anchor: "end", cls: "fig-sub" })}${T(cx + 6, 40, "w₂", { cls: "fig-sub" })}`;
      for (const r of [30, 55, 80]) s += `<ellipse cx="${cx + 85}" cy="${cy - 75}" rx="${r * 1.15}" ry="${r * 0.7}" transform="rotate(-25 ${cx + 85} ${cy - 75})" class="fig-ring"/>`;
      const [l1, l2] = sub;
      s += shape(cx, cy) + T(ox + 110, 18, title, { anchor: "middle" }) + T(ox + 110, 248, l1, { anchor: "middle", cls: "fig-sub" }) + T(ox + 110, 262, l2, { anchor: "middle", cls: "fig-sub" });
      return s;
    };
    const circle = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="48" class="fig-box2"/><circle cx="${cx + 33}" cy="${cy - 35}" r="5" class="fig-dot"/>`;
    const diamond = (cx, cy) => `<polygon points="${cx},${cy - 58} ${cx + 58},${cy} ${cx},${cy + 58} ${cx - 58},${cy}" class="fig-box2"/><circle cx="${cx}" cy="${cy - 58}" r="5" class="fig-dot"/>`;
    return svg(460, 272, panel(5, "Ridge: ‖w‖² ≤ t (daire)", circle, ["çözüm yuvarlak kenarda:", "ağırlıklar küçülür, sıfır olmaz"]) + panel(235, "Lasso: |w₁| + |w₂| ≤ t (elmas)", diamond, ["çözüm köşede: w₁ = 0,", "öznitelik modelden atılır"]), "Ridge ve lasso");
  },

  threshline: () => {
    const v = [[2, "E"], [3, "E"], [5, "H"], [7, "H"], [8, "E"]], X = (x) => 40 + (x - 1) * 50;
    let s = `<line x1="${X(1)}" y1="80" x2="${X(9)}" y2="80" class="fig-arrow"/>`;
    for (let i = 1; i <= 9; i++) s += `<line x1="${X(i)}" y1="76" x2="${X(i)}" y2="84" class="fig-arrow"/>${T(X(i), 100, i, { anchor: "middle", cls: "fig-sub" })}`;
    for (const [x, c] of v) s += pt(X(x), 60, c === "E" ? "pos" : "neg", 8) + T(X(x), 40, c === "E" ? "Evet" : "Hayır", { anchor: "middle", cls: "fig-sub" });
    for (const [t, good] of [[2.5, 0], [4, 1], [6, 0], [7.5, 1]]) s += `<line x1="${X(t)}" y1="25" x2="${X(t)}" y2="120" class="${good ? "line accent" : "line ghost"}"/>${T(X(t), 138, `t = ${t}`, { anchor: "middle", cls: "fig-sub" })}`;
    return svg(470, 160, s + T(235, 156, "renkli: sınıfın değiştiği aday eşikler (bakmak yeterli) · gri: değişmeyenler", { anchor: "middle", cls: "fig-sub" }), "Eşik adayları");
  },

  regstep: () => {
    const P = [[1, 1], [2, 2], [3, 2], [4, 9], [5, 10], [6, 12]];
    const X = (x) => 40 + x * 55, Y = (y) => 220 - y * 15;
    let s = "";
    for (let j = 0; j <= 12; j += 3) s += `<line x1="${X(0.5)}" y1="${Y(j)}" x2="${X(6.5)}" y2="${Y(j)}" class="fig-grid"/>${T(X(0.5) - 6, Y(j) + 4, j, { anchor: "end", cls: "fig-sub" })}`;
    s += `<polyline points="${X(0.6)},${Y(5 / 3)} ${X(3.5)},${Y(5 / 3)} ${X(3.5)},${Y(31 / 3)} ${X(6.4)},${Y(31 / 3)}" class="curve2"/>`;
    s += `<line x1="${X(3.5)}" y1="${Y(13)}" x2="${X(3.5)}" y2="${Y(0)}" class="line ghost"/>${T(X(3.5) + 4, Y(12.5), "x ≤ 3.5 ?", { cls: "fig-sub" })}`;
    for (const [a, b] of P) s += pt(X(a), Y(b), "pos", 5) + T(X(a), Y(0) + 16, a, { anchor: "middle", cls: "fig-sub" });
    s += T(X(1.5), Y(5 / 3) - 8, "sol yaprak: ortalama 1.67", { cls: "fig-sub" }) + T(X(4), Y(31 / 3) - 8, "sağ yaprak: ortalama 10.33", { cls: "fig-sub" });
    return svg(440, 250, s, "Regresyon ağacı");
  },

  prune: () => lines({ series: [
    { pts: [[1, 0.70], [3, 0.80], [5, 0.86], [7, 0.90], [10, 0.92], [15, 0.95], [20, 0.97], [30, 0.99], [40, 1.0]], cls: "curve1", name: "eğitim doğruluğu", color: "pos" },
    { pts: [[1, 0.68], [3, 0.78], [5, 0.85], [7, 0.90], [10, 0.89], [15, 0.87], [20, 0.86], [30, 0.83], [40, 0.82]], cls: "curve2", name: "doğrulama doğruluğu", color: "neg" },
  ], xlim: [0, 40], ylim: [0.6, 1], xstep: 10, ystep: 0.1, xlabel: "yaprak sayısı", ylabel: "doğruluk", aria: "Budama" }),

  bootstrap: () => {
    const orig = [1, 2, 3, 4, 5], samples = [[1, 1, 2, 4, 5], [2, 3, 3, 4, 4], [1, 2, 2, 5, 5]];
    let s = `${DEFS}${T(20, 22, "orijinal veri")}`;
    orig.forEach((v, i) => { s += box(120 + i * 52, 6, 44, 28, String(v), "fig-box"); });
    samples.forEach((sm, k) => {
      const y = 70 + k * 58;
      s += T(20, y + 20, `örneklem ${k + 1}`);
      sm.forEach((v, i) => { s += box(120 + i * 52, y, 44, 28, String(v), "fig-box2"); });
      const out = orig.filter((v) => !sm.includes(v));
      s += T(395, y + 13, "torba dışı:", { cls: "fig-sub" }) + T(395, y + 28, out.join(", "), { cls: "fig-sub" });
    });
    return svg(470, 250, s + T(235, 246, "yerine koyarak çekiliş: bazı örnekler birden çok, bazıları hiç seçilmez", { anchor: "middle", cls: "fig-sub" }), "Bootstrap");
  },

  adaweights: () => {
    const names = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const rounds = [[1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8], [1 / 14, 0.5, 1 / 14, 1 / 14, 1 / 14, 1 / 14, 1 / 14, 1 / 14], [0.042, 0.292, 0.25, 0.25, 0.042, 0.042, 0.042, 0.042]];
    const wrong = [[], ["B"], ["C", "D"]];
    let s = "";
    rounds.forEach((w, r) => {
      const ox = 10 + r * 155;
      s += T(ox + 70, 18, ["başta (eşit)", "1. turdan sonra", "2. turdan sonra"][r], { anchor: "middle" });
      w.forEach((v, i) => {
        const hgt = v * 260, x = ox + i * 17;
        s += `<rect x="${x}" y="${180 - hgt}" width="13" height="${hgt}" class="${wrong[r].includes(names[i]) ? "fig-bad" : "fig-box3"}"/>${T(x + 6.5, 196, names[i], { anchor: "middle", cls: "fig-sub" })}`;
      });
    });
    return svg(470, 220, s + T(235, 215, "kırmızı: bir önceki turda yanlış bilinen müşteriler; ağırlıkları büyür", { anchor: "middle", cls: "fig-sub" }), "AdaBoost ağırlıkları");
  },

  gbstages: () => lines({ series: [
    { pts: [[1, 1], [2, 3], [3, 5], [4, 7]], cls: "curve3", dots: true, name: "gerçek y", color: "s3" },
    { pts: [[0.6, 4], [4.4, 4]], cls: "curve1", name: "F₀ = 4 (ortalama)", color: "pos" },
    { pts: [[0.6, 3], [2.5, 3], [2.5, 5], [4.4, 5]], cls: "curve2", name: "F₁ = F₀ + 0.5·kütük", color: "neg" },
    { pts: [[0.6, 2.5], [1.5, 2.5], [1.5, 3.5], [2.5, 3.5], [2.5, 4.5], [3.5, 4.5], [3.5, 5.5], [4.4, 5.5]], cls: "curve1", name: "F₂ (her tur hatanın bir kısmını kapatır)", color: "pos" },
  ], xlim: [0.5, 4.5], ylim: [0, 8], xstep: 1, ystep: 2, xlabel: "x", ylabel: "tahmin", aria: "Gradyan artırma" }),

  kerneltrick: () => {
    const xs = [-3, -2.5, -2, 2, 2.5, 3], inner = [-1, -0.5, 0, 0.5, 1];
    const p1 = (x) => 30 + (x + 3.5) * 28;
    let s = `${DEFS}${T(118, 18, "1 boyut: tek eşikle ayrılmaz", { anchor: "middle" })}<line x1="20" y1="90" x2="215" y2="90" class="fig-arrow"/>`;
    for (const x of xs) s += pt(p1(x), 90, "neg");
    for (const x of inner) s += pt(p1(x), 90, "pos");
    s += T(118, 120, "x", { anchor: "middle", cls: "fig-sub" }) + arrow(225, 90, 255, 90) + T(240, 80, "φ(x) = (x, x²)", { anchor: "middle", cls: "fig-sub" });
    const X = (x) => 270 + (x + 3.5) * 26, Y = (y) => 200 - y * 17;
    s += T(360, 18, "2 boyut: bir doğruyla ayrılır", { anchor: "middle" }) + `<line x1="265" y1="${Y(0)}" x2="455" y2="${Y(0)}" class="fig-arrow"/><line x1="${X(0)}" y1="${Y(10)}" x2="${X(0)}" y2="${Y(0)}" class="fig-arrow"/>`;
    for (const x of xs) s += pt(X(x), Y(x * x), "neg");
    for (const x of inner) s += pt(X(x), Y(x * x), "pos");
    s += `<line x1="265" y1="${Y(2.5)}" x2="455" y2="${Y(2.5)}" class="line accent"/>` + T(450, Y(2.5) - 6, "x² = 2.5", { anchor: "end", cls: "fig-sub" }) + T(X(0) + 6, Y(9.5), "x²", { cls: "fig-sub" });
    return svg(470, 215, s, "Çekirdek hilesi");
  },

  workflow: () => {
    const steps = ["Problem", "Veri", "Öznitelikler", "Model", "Değerlendirme", "Kullanım"];
    let s = DEFS;
    // two rows of three, so labels stay readable on a phone; arrows sit in the gaps, never over a box
    const bw = 116, bh = 40, gap = 26, x0 = 6, ys = [8, 92];
    const pos = (i) => [x0 + (i % 3) * (bw + gap), ys[Math.floor(i / 3)]];
    steps.forEach((t, i) => {
      const [x, y] = pos(i);
      s += box(x, y, bw, bh, t, i === 1 || i === 2 ? "fig-box2" : "fig-box");
      if (i % 3 < 2) s += arrow(x + bw + 3, y + bh / 2, x + bw + gap - 3, y + bh / 2);
    });
    const [ax, ay] = pos(2), [bx, by] = pos(3);
    s += `<path d="M${ax + bw / 2},${ay + bh + 2} V${ay + bh + 20} H${bx + bw / 2} V${by - 3}" class="fig-arrow" fill="none" marker-end="url(#ah)"/>`;
    const W = x0 * 2 + 3 * bw + 2 * gap;
    return svg(W, 168, s + T(W / 2, 158, "Renkli adımlar, zamanın çoğunun geçtiği yerdir: veriyi anlamak ve hazırlamak.", { anchor: "middle", cls: "fig-sub" }), "İş akışı");
  },

  learntypes: () => {
    const rnd = ml.rng(5);
    const panel = (ox, title, body, sub) => `<rect x="${ox}" y="28" width="148" height="140" rx="8" class="fig-box"/>${T(ox + 74, 18, title, { anchor: "middle" })}${body}${T(ox + 74, 186, sub, { anchor: "middle", cls: "fig-sub" })}`;
    let a = "", b = "";
    for (let i = 0; i < 7; i++) { a += pt(20 + rnd() * 50, 50 + rnd() * 100, "pos", 5); a += pt(90 + rnd() * 50, 50 + rnd() * 100, "neg", 5); }
    a += `<line x1="80" y1="40" x2="82" y2="160" class="line dash"/>`;
    for (const [cx, cy] of [[200, 70], [270, 90], [225, 140]]) for (let i = 0; i < 6; i++) b += pt(cx + (rnd() - 0.5) * 34, cy + (rnd() - 0.5) * 30, "gray", 4.5);
    const c = `${DEFS}${box(330, 50, 60, 34, "ajan", "fig-box2")}${box(400, 120, 60, 34, "ortam", "fig-box3")}${arrow(392, 72, 425, 118)}${arrow(405, 137, 365, 88)}${T(420, 92, "eylem", { cls: "fig-sub" })}${T(318, 125, "ödül", { cls: "fig-sub" })}`;
    return svg(470, 200, panel(5, "gözetimli", a, "etiketli örnekler, sınır öğren") + panel(160, "gözetimsiz", b, "etiket yok, grupları bul") + c + `<rect x="315" y="28" width="150" height="140" rx="8" class="fig-box" style="fill:none"/>` + T(390, 18, "pekiştirmeli", { anchor: "middle" }) + T(390, 186, "dene, ödüle göre davran", { anchor: "middle", cls: "fig-sub" }), "Öğrenme türleri");
  },
});


// ---------------------------------------------------------------- sample midterm figures
const MID = [["P1", 0.1, 1, 1], ["P2", 0.3, 0.25, 1], ["P3", 0, 0.75, 1], ["P4", 0.7, 0.75, -1], ["P5", 1, 0, -1], ["P6", 0.4, 0, -1], ["P7", 0.8, 0.5, -1]];
function midPlot(extra, labelNotes = {}) {
  const S = 300, ox = 50, oy = 330, X = (v) => ox + v * S, Y = (v) => oy - v * S;
  let s = `${DEFS}<defs><clipPath id="mclip"><rect x="${X(-0.05)}" y="${Y(1.05)}" width="${X(1.05) - X(-0.05)}" height="${Y(-0.05) - Y(1.05)}"/></clipPath></defs>`;
  for (let i = 0; i <= 10; i += 2) { const v = i / 10; s += `<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(1)}" class="fig-grid"/><line x1="${X(0)}" y1="${Y(v)}" x2="${X(1)}" y2="${Y(v)}" class="fig-grid"/>${T(X(v), Y(0) + 15, v, { anchor: "middle", cls: "fig-sub" })}${T(X(0) - 8, Y(v) + 4, v, { anchor: "end", cls: "fig-sub" })}`; }
  s += T(X(1), Y(0) + 30, "x₁′ (rüzgâr, ölçekli)", { anchor: "end" }) + T(X(0) - 40, Y(1) - 10, "x₂′ (görüş)");
  s += `<g clip-path="url(#mclip)">${extra(X, Y)}</g>`;
  for (const [n, a, b, y] of MID) s += pt(X(a), Y(b), y > 0 ? "pos" : "neg", 6) + T(X(a) + 9, Y(b) - 8, n + (labelNotes[n] ? " " + labelNotes[n] : ""), { cls: labelNotes[n] ? "lab" : "fig-sub" });
  return svg(390, 370, s, "Ölçeklenmiş noktalar");
}
Object.assign(FIG, {
  midscatter: () => midPlot((X, Y) => `<line x1="${X(0.35)}" y1="${Y(-0.1)}" x2="${X(0.35)}" y2="${Y(1.1)}" class="line accent"/><line x1="${X(0.26)}" y1="${Y(-0.1)}" x2="${X(0.74)}" y2="${Y(1.1)}" class="line dash"/>`),
  midperc: () => midPlot((X, Y) => `<polygon points="${X(-0.1)},${Y(-0.1)} ${X(1.1)},${Y(1.1)} ${X(-0.1)},${Y(1.1)}" class="region-pos"/><polygon points="${X(-0.1)},${Y(-0.1)} ${X(1.1)},${Y(1.1)} ${X(1.1)},${Y(-0.1)}" class="region-neg"/><line x1="${X(-0.1)}" y1="${Y(-0.1)}" x2="${X(1.1)}" y2="${Y(1.1)}" class="line"/>`, { P2: "(z = −0.05: FN)", P4: "(z = +0.05: FP)" }),
  dronetree: () => {
    const nb = (x, y, t, sub, cls = "fig-box") => box(x - 72, y, 144, 44, t, cls, sub);
    return svg(460, 260, `${DEFS}${nb(230, 10, "Rüzgâr?", "IG = 0.522 (en büyük)")}
      ${arrow(195, 54, 120, 100)}${arrow(265, 54, 340, 100)}${T(132, 82, "Kuvvetli")}${T(312, 82, "Hafif")}
      ${nb(110, 100, "→ Hayır", "4, 5, 7 [0 Evet / 3 Hayır]", "fig-box3")}${nb(350, 100, "Yağış?", "1, 2, 3, 6 [3 / 1]")}
      ${arrow(320, 144, 270, 190)}${arrow(380, 144, 410, 190)}${T(272, 172, "Yok")}${T(402, 172, "Var")}
      ${nb(250, 190, "→ Evet", "1, 2, 3 [3 / 0]", "fig-box3")}${box(368, 190, 88, 44, "→ Hayır", "fig-box3", "6 [0 / 1]")}`, "Dron karar ağacı");
  },
  lambdacurve: () => lines({ series: [
    { pts: [[0, 0.02], [1, 0.05], [2, 0.09], [3, 0.17], [4, 0.33]], cls: "curve1", dots: true, name: "eğitim hatası", color: "pos" },
    { pts: [[0, 0.31], [1, 0.22], [2, 0.14], [3, 0.18], [4, 0.34]], cls: "curve2", dots: true, name: "doğrulama hatası", color: "neg" },
  ], xlim: [0, 4], ylim: [0, 0.4], xstep: 1, ystep: 0.1, xlabel: "λ: 0 · 0.01 · 0.1 · 1 · 10", ylabel: "hata", aria: "Lambda eğrisi" }),
});

export function figure(ds) {
  const make = FIG[ds.fig];
  if (!make) return h("p", { class: "err" }, "Bilinmeyen şekil: " + ds.fig);
  return h("figure", { class: "fig" }, make(ds), ds.formula ? h("div", { class: "formula fig-formula" }, ds.formula.split(/\s{2,}·\s{2,}/).map((part) => h("span", { class: "ff" }, part.trim()))) : null, ds.caption ? h("figcaption", {}, ds.caption) : null);
}
