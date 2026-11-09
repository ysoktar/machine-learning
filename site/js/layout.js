// Site chrome shared by every page: header, navigation, pager, footer, theme, quizzes, "studied" marks, widgets.
// A page only contains its article; <div data-widget="name"> placeholders are filled by js/widgets.js.
import { h, $, $$, store } from "./lib/ui.js";

export const REPO = "https://github.com/ysoktar/machine-learning";
/** Midterm: 9 November 2026, 16:30 Istanbul time (UTC+3). */
export const MIDTERM = new Date("2026-11-09T16:30:00+03:00");

/** Site map. scope: "midterm" (weeks 1–7) or "final" (week 8 onward; the final covers everything, weighted to 8–12). */
export const NAV = [
  { part: "Başlangıç", items: [
    { id: "index", title: "Genel bakış ve takvim", desc: "Sınav tarihleri, kapsam, haftalık plan ve sitenin kullanımı." },
    { id: "on-bilgi", title: "Matematik ön bilgisi", desc: "Semboller, log ve üstel, vektör ve iç çarpım, türev ve zincir kuralı, olasılık: elle hesap püf noktalarıyla." },
    { id: "sozluk", title: "Terim ve formül sözlüğü", desc: "Bütün terimler sade Türkçeyle, formüller sembol sembol, aranabilir." },
  ] },
  { part: "Bölüm I · Temeller", short: "H1–3", items: [
    { id: "w1-intro", week: 1, title: "Giriş ve temel kavramlar", desc: "T/E/P, öğrenme türleri, hipotez uzayı, Find-S, ezber ve genelleme." },
    { id: "w2-data", week: 2, title: "Veri, öznitelik, değerlendirme", desc: "Kodlama, ölçekleme, PCA, CV, karmaşıklık matrisi, ROC-AUC, regresyon ölçütleri." },
    { id: "w3-knn", week: 3, title: "kNN ve model seçimi", desc: "Kayıp ve risk, kNN, yanlılık-varyans, düzenlileştirme, veri sızıntısı." },
  ] },
  { part: "Bölüm II · Klasik modeller", short: "H4–7", items: [
    { id: "w4-linear", week: 4, title: "Doğrusal modeller", desc: "En küçük kareler, gradyan inişi, lojistik regresyon, perceptron, softmax." },
    { id: "w5-trees", week: 5, title: "Karar ağaçları", desc: "Entropi, bilgi kazancı (ID3), kazanç oranı, Gini, sürekli eşik, budama." },
    { id: "w6-ensembles", week: 6, title: "Topluluk yöntemleri", desc: "Bagging, OOB, rastgele orman, AdaBoost, gradyan artırma, stacking." },
    { id: "w7-svm", week: 7, title: "Destek vektör makineleri", desc: "Marj, destek vektörleri, elle w ve b, yumuşak marj ve C, çekirdekler." },
  ] },
  { part: "Ara sınav", short: "9 Kasım", items: [
    { id: "exam-midterm", title: "Ara sınav rehberi", desc: "Biçim, hafta hafta bilinmesi gerekenler, sık hatalar, kısa sorular." },
    { id: "sample-midterm", title: "Örnek ara sınav: çözüm", desc: "Örnek sınavın bütün soruları adım adım, hesaplar sitede doğrulandı." },
    { id: "drill", title: "Alıştırma üreteci", desc: "Sınırsız rastgele soru: entropi, kNN, perceptron, metrikler, AdaBoost, SVM…" },
    { id: "hyper", title: "Hiperparametre tablosu", desc: "Her hafta sorulan “X artarsa yanlılık / varyans / aşırı uyum?” tablosu, alıştırmalı." },
    { id: "cheatsheet", title: "Formül kâğıdı ve sözlük", desc: "Bütün formüller, log₂ ve eˣ tabloları, Türkçe–İngilizce terimler." },
  ] },
  { part: "Final", short: "H8+", items: [
    { id: "w8-nn", week: 8, scope: "final", title: "Yapay sinir ağları", desc: "XOR, etkinleştirmeler, MLP tasarımı (Boole, bölge), ileri/geri yayılım, Adam." },
    { id: "w9-cnn", week: 9, scope: "final", title: "Derin öğrenme ve CNN", desc: "Eğitim püf noktaları, evrişim hesabı, çıktı boyutu ve parametre sayısı." },
    { id: "exam-final", scope: "final", title: "Final rehberi", desc: "Kapsam, 10–12. hafta konuları ve geçmiş final alıştırma soruları." },
  ] },
];
const ALL = NAV.flatMap((p) => p.items.map((it) => ({ ...it, part: p.part, scope: it.scope ?? (it.week ? "midterm" : "none") })));
export const PAGES = ALL;
export const pageInfo = (id) => ALL.find((p) => p.id === id);
export const href = (id) => (id === "index" ? "index.html" : `${id}.html`);

const LOGO = `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
  <circle cx="6" cy="8" r="3" fill="var(--accent)"/><circle cx="6" cy="20" r="3" fill="var(--accent)"/>
  <circle cx="15" cy="6" r="2.6" fill="var(--text-2)"/><circle cx="15" cy="14" r="2.6" fill="var(--text-2)"/><circle cx="15" cy="22" r="2.6" fill="var(--text-2)"/>
  <circle cx="23.5" cy="14" r="3" fill="var(--accent)"/>
  <path d="M6 8L15 6M6 8L15 14M6 8L15 22M6 20L15 6M6 20L15 14M6 20L15 22M15 6L23.5 14M15 14L23.5 14M15 22L23.5 14" stroke="var(--text-2)" stroke-width="0.9" opacity="0.6"/></svg>`;
const THEME_ICONS = {
  auto: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 2a6 6 0 0 0 0 12z" fill="currentColor"/></svg>',
  light: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3"/></svg>',
  dark: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z"/></svg>',
};
const THEME_NAMES = { auto: "Otomatik", light: "Açık", dark: "Koyu" };
const getTheme = () => store.get("theme-v", "auto");
function setTheme(t) {
  store.set("theme-v", t);
  try { if (t === "auto") localStorage.removeItem("theme"); else localStorage.setItem("theme", t); } catch { /* ignore */ }
  if (t === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
}

/** "2 gün 5 saat" until the midterm, or null once it has started. */
export function untilMidterm(now = new Date()) {
  const ms = MIDTERM - now;
  if (ms <= 0) return null;
  const d = Math.floor(ms / 864e5), hh = Math.floor((ms % 864e5) / 36e5), mm = Math.floor((ms % 36e5) / 6e4), ss = Math.floor((ms % 6e4) / 1e3);
  return { d, h: hh, m: mm, s: ss };
}

function buildHeader() {
  const themeBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "Renk teması" });
  const paint = () => { const t = getTheme(); themeBtn.innerHTML = THEME_ICONS[t] + `<span class="label">${THEME_NAMES[t]}</span>`; themeBtn.title = `Tema: ${THEME_NAMES[t]}`; };
  themeBtn.addEventListener("click", () => { const o = ["auto", "light", "dark"]; setTheme(o[(o.indexOf(getTheme()) + 1) % 3]); paint(); });
  paint();
  // English names next to Turkish terms and headings: on by default, remembered per reader
  const enBtn = h("button", { class: "icon-btn en-btn", type: "button" });
  const paintEn = () => {
    const on = store.get("show-en", true);
    document.documentElement.classList.toggle("hide-en", !on);
    enBtn.setAttribute("aria-pressed", String(on));
    enBtn.title = on ? "İngilizce karşılıklar gösteriliyor (gizlemek için tıklayın)" : "İngilizce karşılıklar gizli (göstermek için tıklayın)";
    enBtn.innerHTML = `<span class="en-mark">EN</span><span class="label">${on ? "İngilizce açık" : "İngilizce kapalı"}</span>`;
  };
  enBtn.addEventListener("click", () => { store.set("show-en", !store.get("show-en", true)); paintEn(); });
  paintEn();
  const menu = h("button", { class: "icon-btn menu-btn", type: "button", "aria-label": "Menüyü aç", "aria-expanded": "false" });
  menu.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" stroke-width="1.8"><path d="M2 4.5h14M2 9h14M2 13.5h14"/></svg>';
  menu.addEventListener("click", () => { const open = document.body.classList.toggle("nav-open"); menu.setAttribute("aria-expanded", String(open)); });
  const brand = h("a", { class: "brand", href: "index.html" });
  brand.innerHTML = LOGO;
  brand.append(h("span", { class: "brand-title" }, "Yapay Öğrenme"), h("span", { class: "brand-sub" }, "BİL/YAP 470 · çalışma sitesi"));
  const left = untilMidterm();
  const pill = left
    ? h("a", { class: "exam-pill", href: "exam-midterm.html", title: "Ara sınav: 9 Kasım 2026 Pazartesi, 16:30" }, h("span", { class: "ic ic-clock", "aria-hidden": "true" }), h("span", { class: "long" }, "Ara sınava "), left.d > 0 ? `${left.d} g ${left.h} sa` : `${left.h} sa ${left.m} dk`)
    : h("a", { class: "exam-pill", href: "exam-final.html", title: "Final: 7–18 Aralık" }, "Final: 7–18 Aralık");
  const gh = h("a", { class: "icon-btn", href: REPO, target: "_blank", rel: "noopener", title: "GitHub'daki kaynak kod", "aria-label": "GitHub'daki kaynak kod" });
  gh.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .2a8 8 0 0 0-2.5 15.6c.4 0 .5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.6 3.9.3.3.5.8.5 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 .2z"/></svg>';
  return h("header", { class: "site-header" }, menu, brand, h("div", { class: "header-spacer" }), h("div", { class: "header-actions" }, pill, enBtn, gh, themeBtn));
}

const studiedKey = (id) => `studied:${id}`;
function buildSidebar(current) {
  const nav = h("nav", { class: "sidebar", "aria-label": "Site" });
  for (const part of NAV) {
    const ol = h("ol");
    for (const it of part.items) {
      const info = pageInfo(it.id);
      const a = h("a", { href: href(it.id) },
        h("span", {}, it.title, info.scope === "final" ? h("span", { class: "nav-tag", title: "Ara sınav kapsamı dışında; finalde" }, "final") : null,
          store.get(studiedKey(it.id), false) ? h("span", { class: "nav-check", title: "Çalıştım olarak işaretlendi" }, "✓") : null),
        it.week ? h("span", { class: "nav-week" }, `H${it.week}`) : null);
      if (it.id === current) a.setAttribute("aria-current", "page");
      ol.append(h("li", {}, a));
    }
    nav.append(h("div", { class: "nav-part" }, h("div", { class: "nav-part-title" }, h("span", {}, part.part), part.short ? h("span", {}, part.short) : null), ol));
  }
  return nav;
}

function buildKicker(info) {
  if (!info || info.id === "index") return null;
  const k = h("div", { class: "kicker" }, h("span", {}, info.part));
  if (info.week) k.append(h("span", { class: "chip" }, `${info.week}. hafta`));
  if (info.scope === "midterm") k.append(h("span", { class: "chip midterm", title: "Ara sınav kapsamı: 1–7. haftalar" }, "Ara sınavda"));
  if (info.scope === "final") k.append(h("span", { class: "chip final", title: "Ara sınavda yok; final 8–12. haftalara ağırlık verir" }, "Finalde (ara sınavda yok)"));
  return k;
}
function buildPager(id) {
  const i = ALL.findIndex((p) => p.id === id);
  if (i < 0) return null;
  const prev = ALL[i - 1], next = ALL[i + 1];
  return h("nav", { class: "pager", "aria-label": "Sayfalar" },
    prev ? h("a", { href: href(prev.id) }, h("div", { class: "dir" }, "← Önceki"), prev.title) : h("span"),
    next ? h("a", { class: "next", href: href(next.id) }, h("div", { class: "dir" }, "Sonraki →"), next.title) : null);
}
function buildFooter() {
  return h("footer", { class: "site-footer" },
    h("p", {}, "BİL/YAP 470 – BİL 570 Yapay Öğrenme (TOBB ETÜ, 2026–2027 Güz) için öğrenci tarafından hazırlanmış, resmî olmayan bir çalışma sitesi. ",
      "Ders slaytlarının kendisi burada yok; anlatımlar ve örnekler yeniden yazıldı, bütün sayısal çözümler sitedeki hesaplayıcılarla (ve testlerle) doğrulandı. ",
      "Kesin bilgi için ders platformunu ve izlenceyi esas alın. ", h("a", { href: REPO }, "Kaynak kod")));
}

/** "Studied" toggle under the H1 (stored per browser). */
function buildStudied(id) {
  const c = h("input", { type: "checkbox", checked: store.get(studiedKey(id), false) });
  c.addEventListener("change", () => store.set(studiedKey(id), c.checked));
  return h("label", { class: "studied" }, c, "Bu sayfayı çalıştım");
}

/**
 * Quizzes: <div class="quiz" data-answer="2"><p>Soru</p><ol><li data-why="…">…</li>…</ol><div class="explain">…</div></div>
 */
export function enhanceQuizzes(root = document) {
  let number = $$(".quiz[data-ready]", root).length;
  const all = $$(".quiz:not([data-ready])", root);
  for (const q of all) {
    number++;
    q.dataset.ready = "1";
    const answer = Number(q.dataset.answer);
    const items = $$(":scope > ol > li", q);
    const explain = $(":scope > .explain", q);
    const question = q.querySelector(":scope > p, :scope > .q");
    const extra = $$(":scope > table, :scope > .table-wrap, :scope > pre", q);
    const opts = h("div", { class: "quiz-options" });
    const fb = h("div", { class: "quiz-feedback", "aria-live": "polite" });
    const buttons = [];
    const L = (i) => "ABCDEFG"[i];
    const finish = (revealed) => {
      for (const x of buttons) { x.disabled = true; x.classList.remove("wrong"); }
      buttons[answer - 1].classList.add("correct");
      const list = items.map((li, i) => (li.dataset.why ? `<li class="${i + 1 === answer ? "ok" : "no"}"><strong>${L(i)}</strong> ${i + 1 === answer ? "✓" : "✗"} ${li.dataset.why}</li>` : "")).join("");
      fb.innerHTML = `<span class="verdict ${revealed ? "no" : "ok"}">${revealed ? `Doğru cevap: ${L(answer - 1)}.` : "✓ Doğru."}</span> ${explain ? explain.innerHTML : ""}` + (list ? `<ul class="quiz-whys">${list}</ul>` : "");
      // figures or widgets inside an explanation are mounted when the explanation is shown
      if (fb.querySelector("[data-widget]")) import("./widgets.js").then((m) => m.mountAll(fb));
    };
    items.forEach((li, i) => {
      const b = h("button", { type: "button" }, h("span", { class: "opt-letter" }, L(i)), h("span", { html: li.innerHTML }));
      buttons.push(b);
      b.addEventListener("click", () => {
        const ok = i + 1 === answer;
        const first = !q.dataset.tried;
        q.dataset.tried = "1";
        q.dispatchEvent(new CustomEvent("quizanswer", { bubbles: true, detail: { correct: ok, firstTry: first } }));
        if (ok) { finish(false); return; }
        for (const x of buttons) x.classList.remove("wrong");
        b.classList.add("wrong");
        fb.replaceChildren(h("span", { class: "verdict no" }, "✗ Değil."), " ", h("span", { html: li.dataset.why || "Bu seçenek doğru değil." }), " ",
          h("button", { type: "button", class: "link-btn", onclick: () => finish(true) }, "Cevabı göster"));
      });
      opts.append(b);
    });
    q.replaceChildren(h("div", { class: "quiz-label" }, "Soru " + number), question ? h("div", { class: "quiz-q", html: question.innerHTML }) : "", ...extra, opts, fb);
  }
  // running score when a page has several quizzes
  if (all.length >= 3 && !$(".score-box", root)) {
    let right = 0, done = 0;
    const box = h("div", { class: "score-box", hidden: true });
    root.addEventListener("quizanswer", (e) => {
      if (!e.detail.firstTry) return;
      done++; if (e.detail.correct) right++;
      box.hidden = false;
      box.textContent = `İlk denemede doğru: ${right} / ${done} (sayfada ${all.length} soru)`;
    });
    root.append(box);
  }
}

const slug = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "bolum";
const tocText = (hd) => (hd.dataset.toc || hd.textContent).replace(/\s+/g, " ").trim();

/**
 * In-page navigation, built after the widgets are mounted:
 *   - "Bu sayfada" under the introduction (the page's sections)
 *   - "Bu bölümde" at the start of a section with several sub-sections
 *   - a table of contents that stays in view: a right-hand column on wide screens, a bar under the header otherwise;
 *     the section being read is highlighted and its sub-sections open
 */
function buildPageNav(content, id) {
  const all = $$(":scope > h2, :scope > h3", content);
  const used = new Set($$("[id]").map((e) => e.id));
  for (const hd of all) {
    if (hd.id) continue;
    const base = slug(tocText(hd));
    let s = base, k = 2;
    while (used.has(s)) s = `${base}-${k++}`;
    hd.id = s; used.add(s);
  }
  const tree = [];
  for (const hd of all) {
    if (hd.tagName === "H2") tree.push({ hd, subs: [] });
    else if (tree.length) tree[tree.length - 1].subs.push(hd);
  }
  if (id === "index" || tree.length < 3) return;
  const link = (hd, cls) => h("a", { href: `#${hd.id}`, class: cls || null, "data-target": hd.id }, tocText(hd));

  if (!$(".page-toc", content)) {
    const toc = h("nav", { class: "page-toc", "aria-label": "Bu sayfada" }, h("div", { class: "page-toc-title" }, "Bu sayfada"),
      h("ol", {}, tree.map((t) => h("li", {}, link(t.hd)))));
    ($(":scope > .studied", content) || $(":scope > .lead", content) || $(":scope > h1", content)).after(toc);
  }
  for (const t of tree) {
    if (t.subs.length < 3 || t.hd.nextElementSibling?.classList.contains("section-toc")) continue;
    t.hd.after(h("nav", { class: "section-toc", "aria-label": `${tocText(t.hd)}: bu bölümde` }, h("span", { class: "page-toc-title" }, "Bu bölümde"), t.subs.map((s) => link(s))));
  }

  const info = pageInfo(id);
  const i = ALL.findIndex((p) => p.id === id);
  const prev = ALL[i - 1], next = ALL[i + 1];
  const top = () => h("a", { href: "#", class: "toc-top", onclick: (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }, "↑ Sayfanın başı");
  const railPager = () => h("nav", { class: "toc-pager", "aria-label": "Önceki ve sonraki sayfa" },
    prev ? h("a", { href: href(prev.id), class: "prev" }, h("span", { class: "dir" }, "← Önceki"), h("span", {}, prev.title)) : null,
    next ? h("a", { href: href(next.id), class: "next" }, h("span", { class: "dir" }, "Sonraki →"), h("span", {}, next.title)) : null);
  const makeList = () => h("ol", { class: "toc-list" }, tree.map((t) => {
    const li = h("li", { "data-section": t.hd.id });
    const row = h("div", { class: "toc-row" }, link(t.hd, "toc-h2"));
    if (t.subs.length) {
      const chev = h("button", { type: "button", class: "toc-chev", "aria-label": `${tocText(t.hd)}: alt başlıkları aç/kapat`, "aria-expanded": "false" }, h("span", { "aria-hidden": "true" }, "▸"));
      chev.addEventListener("click", (e) => { e.stopPropagation(); li.dataset.user = li.classList.contains("open") ? "closed" : "open"; spy(); });
      row.append(chev);
      li.append(row, h("ol", { class: "toc-subs" }, t.subs.map((s) => h("li", {}, link(s, "toc-h3")))));
    } else li.append(row);
    return li;
  }));
  const rail = h("aside", { class: "toc-rail", "aria-label": "İçindekiler" },
    info ? h("div", { class: "toc-rail-head" }, info.week ? h("span", { class: "toc-rail-ch" }, `${info.week}. hafta`) : null, h("span", { class: "toc-rail-title" }, info.title)) : null,
    h("div", { class: "page-toc-title" }, "İçindekiler"), makeList(), top(), railPager());
  const main = content.closest(".main");
  main.classList.add("has-rail");
  main.append(rail);

  const label = h("span", { class: "toc-current" });
  const toggle = h("button", { type: "button", class: "toc-toggle", "aria-expanded": "false" }, h("span", { class: "toc-bar-title" }, "Bu sayfada"), label, h("span", { class: "toc-caret", "aria-hidden": "true" }, "▾"));
  const panel = h("div", { class: "toc-panel", hidden: true }, makeList(), top(), railPager());
  const bar = h("div", { class: "toc-bar" }, toggle, panel);
  const setOpen = (open) => { panel.hidden = !open; toggle.setAttribute("aria-expanded", String(open)); };
  toggle.addEventListener("click", () => { setOpen(panel.hidden); if (!panel.hidden) spy(); });
  panel.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".toc-bar")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  document.body.append(bar);

  const offset = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) + 64;
  let ticking = false;
  const follow = (box) => {
    const active = $$("a.current", box).pop();
    if (!active || box.scrollHeight <= box.clientHeight) return;
    const r = active.getBoundingClientRect(), rr = box.getBoundingClientRect();
    if (r.top < rr.top + 30 || r.bottom > rr.bottom - 30) box.scrollTop += r.top - rr.top - rr.height / 2;
  };
  function spy() {
    ticking = false;
    const lim = offset();
    let cur = null, curSub = null;
    for (const t of tree) if (t.hd.getBoundingClientRect().top <= lim) { cur = t; curSub = null; for (const s of t.subs) if (s.getBoundingClientRect().top <= lim) curSub = s; }
    for (const list of [rail, panel]) {
      for (const li of $$(":scope .toc-list > li", list)) {
        const reading = !!cur && li.dataset.section === cur.hd.id;
        const open = li.dataset.user === "open" || (reading && li.dataset.user !== "closed");
        li.classList.toggle("open", open);
        li.querySelector(".toc-chev")?.setAttribute("aria-expanded", String(open));
        if (!reading && li.dataset.user === "closed") delete li.dataset.user;
      }
      for (const a of $$("a[data-target]", list)) a.classList.toggle("current", a.dataset.target === (curSub || cur?.hd)?.id || (a.dataset.target === cur?.hd.id && a.classList.contains("toc-h2")));
    }
    label.textContent = cur ? tocText(curSub || cur.hd) : "";
    bar.classList.toggle("show", window.scrollY > 280);
    follow(rail);
    if (!panel.hidden) follow(panel);
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();
}


/** "How to study this page" box: the order to follow and what the coloured boxes mean. */
const HOWTO = {
  week: {
    title: "<span class='ic ic-book' aria-hidden='true'></span>Bu sayfa nasıl çalışılır? (önerilen sıra ve kutuların anlamı)",
    steps: [
      "<b><span class='ic ic-target' aria-hidden='true'></span>Sınav haritasına</b> 1 dakika göz at: bu haftadan ne sorulduğunu ve puanın nereden geldiğini söyler. Terimleri henüz bilmiyorsan sorun değil.",
      "Bölümleri <b>yukarıdan aşağı</b> oku. Her bölüm önce sarı <b><span class='ic ic-idea' aria-hidden='true'></span>sezgi</b> kutusuyla başlar: önce fikri anla, formül sonra gelir.",
      "Her formülün altındaki <b>“Nasıl okunur?”</b> satırları sembolleri tek tek açıklar. Altı <span class=\"term-demo\">noktalı çizili</span> bir kelimeye takılırsan üzerine gel ya da dokun: kısa tanımı çıkar.",
      "Mor çerçeveli <b><span class='ic ic-guide' aria-hidden='true'></span>araç kılavuzunu</b> okuyup aracı kullan: “Şunu dene” adımlarını yap, “Ne görmelisin?” cümlesini kendin gözlemle.",
      "<b><span class='ic ic-try' aria-hidden='true'></span>Hemen dene</b> sorularını cevabı açmadan çöz; yapamazsan bir önceki paragrafa dön.",
      "<b><span class='ic ic-recipe' aria-hidden='true'></span>Tarif</b> kutuları sınavda kâğıda nasıl yazacağını adım adım söyler; sınav tipi problemleri bu tariflerle çöz.",
      "Son olarak <b>sık hatalar</b> listesini ve <b>sınama sorularını</b> yap. Sağdaki içindekiler nerede olduğunu gösterir; bitirince en üstteki “Bu sayfayı çalıştım”ı işaretle.",
    ],
  },
  exam: {
    title: "<span class='ic ic-book' aria-hidden='true'></span>Bu sayfa nasıl kullanılır?",
    steps: [
      "Önce soruyu kâğıtta kendin çöz (süre tut), sonra “çözüm”ü aç ve adım adım karşılaştır.",
      "Takıldığın her adımın yanında ilgili haftanın sayfasına bağlantı var: oradaki <span class='ic ic-idea' aria-hidden='true'></span>sezgi ve <span class='ic ic-recipe' aria-hidden='true'></span>tarif kutularına dön.",
      "Çözüm içindeki araçlar aynı veriyle hazır gelir: bir sayıyı değiştirip sonucun nasıl değiştiğine bak.",
    ],
  },
  tool: {
    title: "<span class='ic ic-book' aria-hidden='true'></span>Bu sayfa nasıl kullanılır?",
    steps: [
      "Aracın üstündeki <span class='ic ic-guide' aria-hidden='true'></span>kutusunu oku: ne yaptığını ve ne denemen gerektiğini söyler.",
      "Cevabını önce kendin bul, sonra denetle; yanlışsa çözümü açmadan bir kez daha dene.",
      "Bir türde üst üste 3 doğru yaptıysan o konu hazır; zayıf olduğun türe geç.",
    ],
  },
};
const HOWTO_KIND = { "sample-midterm": "exam", "exam-midterm": "exam", "exam-final": "exam", drill: "tool", hyper: "tool" };
function buildHowto(id, info) {
  const kind = HOWTO_KIND[id] || (info?.week ? "week" : null);
  if (!kind) return null;
  const k = HOWTO[kind];
  const open = store.get("howto-open-" + kind, true);
  const d = h("details", { class: "howto", open }, h("summary", { html: k.title }), h("ol", {}, k.steps.map((st) => h("li", { html: st }))));
  d.addEventListener("toggle", () => store.set("howto-open-" + kind, d.open));
  return d;
}

async function init() {
  const id = document.body.dataset.page || "index";
  const info = pageInfo(id);
  const main = $("main");
  main.classList.add("main");
  main.id = "content";
  const content = $(".content", main);
  const h1 = $("h1", content);
  const kicker = buildKicker(info);
  if (h1 && kicker) h1.before(kicker);
  if (h1 && id !== "index") ($(":scope > .lead", content) || h1).after(buildStudied(id));
  const howto = buildHowto(id, info);
  if (howto) ($(":scope > .studied", content) || h1).after(howto);
  const pager = buildPager(id);
  if (pager) content.append(pager);
  content.append(buildFooter());
  const layout = h("div", { class: "layout" }, buildSidebar(id));
  main.replaceWith(layout);
  layout.append(main);
  document.body.prepend(h("a", { class: "skip-link", href: "#content" }, "İçeriğe geç"), buildHeader(), h("div", { class: "scrim", onclick: () => document.body.classList.remove("nav-open") }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.body.classList.remove("nav-open"); });
  enhanceQuizzes(content);
  if ($("[data-widget]", content)) {
    const { mountAll } = await import("./widgets.js");
    mountAll(content);
  }
  if (id !== "sozluk") {
    const { annotateTerms, installTermPopover } = await import("./glossary.js");
    annotateTerms(content, info?.week || 0, id);
    installTermPopover();
  }
  buildPageNav(content, id);
  const cur = $(".sidebar [aria-current]"), side = $(".sidebar");
  if (cur && side) side.scrollTop = Math.max(0, cur.offsetTop - side.clientHeight / 2);
  if (location.hash) { const t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView(); }
}

init();
