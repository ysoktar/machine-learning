// Build the static site into dist/ (a plain copy of site/: no dependencies, no bundling).
import { cpSync, rmSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "dist");
rmSync(out, { recursive: true, force: true });
cpSync(join(root, "site"), out, { recursive: true });
let files = 0, bytes = 0;
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f), s = statSync(p);
    if (s.isDirectory()) walk(p); else { files++; bytes += s.size; }
  }
})(out);
console.log(`dist/: ${files} files, ${(bytes / 1024).toFixed(0)} KB`);
