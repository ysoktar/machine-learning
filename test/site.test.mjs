// Site structure: every page in the navigation exists, every internal link and #anchor resolves, every widget exists.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const site = join(import.meta.dirname, "..", "site");
const pages = readdirSync(site).filter((f) => f.endsWith(".html"));
const html = Object.fromEntries(pages.map((p) => [p, readFileSync(join(site, p), "utf8")]));
const layout = readFileSync(join(site, "js", "layout.js"), "utf8");
const widgets = readFileSync(join(site, "js", "widgets.js"), "utf8");

// the same slug rule as layout.js (headings get ids at run time)
const slug = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "bolum";
const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
function anchors(src) {
  const ids = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of src.matchAll(/<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/g)) if (!/\sid=/.test(m[0])) ids.add(slug(strip(m[2])));
  return ids;
}

test("every navigation entry has a page with the right data-page", () => {
  const ids = [...layout.matchAll(/\{ id: "([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 15);
  for (const id of ids) {
    const f = id === "index" ? "index.html" : `${id}.html`;
    assert.ok(html[f], `missing page ${f}`);
    assert.match(html[f], new RegExp(`data-page="${id}"`), f);
  }
});

test("internal links and anchors resolve", () => {
  for (const [p, src] of Object.entries(html)) {
    for (const m of src.matchAll(/href="([^"#:]*)(#[^"]*)?"/g)) {
      const [, file, hash] = m;
      if (file.startsWith("http") || file.startsWith("mailto")) continue;
      const target = file || p;
      if (target.startsWith("css/") || target.startsWith("img/")) { assert.ok(existsSync(join(site, target)), `${p}: ${target}`); continue; }
      assert.ok(html[target], `${p}: broken link ${target}`);
      if (hash && hash.length > 1) assert.ok(anchors(html[target]).has(decodeURIComponent(hash.slice(1))), `${p}: missing anchor ${target}${hash}`);
    }
  }
});

test("every data-widget is implemented", () => {
  for (const [p, src] of Object.entries(html)) for (const m of src.matchAll(/data-widget="([^"]+)"/g))
    assert.ok(new RegExp(`W\\.${m[1]} = `).test(widgets), `${p}: unknown widget ${m[1]}`);
});

test("quizzes have a valid answer and options", () => {
  for (const [p, src] of Object.entries(html)) for (const m of src.matchAll(/<div class="quiz" data-answer="(\d)">([\s\S]*?)<\/ol>/g)) {
    const n = (m[2].match(/<li/g) || []).length;
    assert.ok(Number(m[1]) >= 1 && Number(m[1]) <= n, `${p}: answer ${m[1]} of ${n}`);
  }
});

test("the midterm date is the updated one everywhere", () => {
  for (const [p, src] of Object.entries(html)) assert.doesNotMatch(src, /2 Kasım'da yapılacak|ara sınav 2 Kasım/i, p);
  assert.match(layout, /2026-11-09T16:30:00\+03:00/);
});
