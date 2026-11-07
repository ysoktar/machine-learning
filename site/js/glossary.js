// Hover definitions. The first use of each glossary term on a page gets a dotted underline; hovering, focusing or
// tapping it shows a one-paragraph definition with a link to the glossary page. Data: glossary-data.js (generated from
// the same list as sozluk.html).
import { TERMS } from "./glossary-data.js";

const SKIP = "h1, h2, h3, h4, a, code, pre, button, summary, textarea, input, select, svg, .widget, .fig, .formula, .m, .term, .words, .quiz-options, .page-toc, .section-toc, .toc-rail, .toc-bar, .kicker, .studied, .tree, .glossary, .letter-nav, .table-wrap th";
// a term may take Turkish suffixes (entropisi, marjı, kNN'de…) but must start at a word boundary
const L = "\\p{L}\\p{N}";

/**
 * Underline glossary terms. A term is underlined at its first use in every section (h2) of the page, so a reader who
 * jumps into the middle of a page still gets help. Terms taught in an earlier week are assumed known: on a later
 * page they are underlined only once.
 */
export function annotateTerms(root, pageWeek = 0) {
  const terms = [...TERMS].sort((a, b) => b.match.length - a.match.length);
  const src = terms.map((t, i) => `(?<g${i}>(?:${t.match})[${L}'’]*)`).join("|");
  const re = new RegExp(`(?<![${L}])(?:${src})`, "giu");
  const known = (t) => pageWeek > 0 && t.week > 0 && t.week < pageWeek;
  const perPage = new Set();
  let perSection = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      if (n.nodeType === 1) {
        if (n.tagName === "H2") return NodeFilter.FILTER_ACCEPT;
        return n.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
      }
      return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const items = [];
  while (walker.nextNode()) items.push(walker.currentNode);
  for (const node of items) {
    if (node.nodeType === 1) { perSection = new Set(); continue; }
    if (node.parentElement.closest("h1, h2, h3, h4")) continue;
    const text = node.nodeValue, parts = [];
    let last = 0;
    for (const m of text.matchAll(re)) {
      const key = Object.keys(m.groups).find((g) => m.groups[g] !== undefined);
      const t = terms[Number(key.slice(1))];
      const seen = known(t) ? perPage : perSection;
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      const span = document.createElement("span");
      span.className = "term";
      span.tabIndex = 0;
      span.dataset.term = t.term;
      span.dataset.def = t.def;
      span.dataset.id = t.id;
      span.textContent = m[0];
      parts.push(text.slice(last, m.index), span);
      last = m.index + m[0].length;
    }
    if (parts.length) node.replaceWith(...parts, text.slice(last));
  }
}

/** One shared popover: hover or focus shows it, tap toggles it, Escape closes it. */
export function installTermPopover() {
  const pop = document.createElement("div");
  pop.className = "term-pop";
  pop.setAttribute("role", "tooltip");
  pop.hidden = true;
  document.body.append(pop);
  let current = null, timer = 0;
  const show = (el) => {
    clearTimeout(timer);
    current = el;
    pop.innerHTML = "";
    const b = document.createElement("strong");
    b.textContent = el.dataset.term + ": ";
    const more = document.createElement("a");
    more.href = "sozluk.html#" + el.dataset.id;
    more.textContent = "Sözlükte aç →";
    pop.append(b, document.createTextNode(el.dataset.def), " ", more);
    pop.hidden = false;
    const r = el.getBoundingClientRect(), w = Math.min(340, window.innerWidth - 24);
    pop.style.width = w + "px";
    const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    const below = r.bottom + 8 + pop.offsetHeight < window.innerHeight;
    pop.style.left = left + window.scrollX + "px";
    pop.style.top = (below ? r.bottom + 8 : r.top - pop.offsetHeight - 8) + window.scrollY + "px";
  };
  const hide = () => { pop.hidden = true; current = null; };
  const later = () => { clearTimeout(timer); timer = setTimeout(hide, 180); };
  document.addEventListener("mouseover", (e) => { const t = e.target.closest?.(".term"); if (t) show(t); else if (pop.contains(e.target)) clearTimeout(timer); });
  document.addEventListener("mouseout", (e) => { const t = e.target.closest?.(".term"); if (t && !pop.contains(e.relatedTarget)) later(); });
  pop.addEventListener("mouseleave", later);
  document.addEventListener("focusin", (e) => { if (e.target.classList?.contains("term")) show(e.target); });
  document.addEventListener("focusout", (e) => { if (e.target.classList?.contains("term") && !pop.contains(e.relatedTarget)) later(); });
  document.addEventListener("click", (e) => {
    const t = e.target.closest?.(".term");
    if (t) { if (current === t && !pop.hidden) hide(); else show(t); return; }
    if (!pop.contains(e.target)) hide();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  window.addEventListener("scroll", () => { if (!pop.hidden && current) show(current); }, { passive: true });
}
