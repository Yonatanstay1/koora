// After `next build` with BASE_PATH set: add the base path to plain asset links
// ("/images/...", "/videos/...") that Next does not prefix by itself.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
const base = process.env.BASE_PATH || "";
if (!base) process.exit(0);
const re = /(["'(])\/(images|videos)\//g;
let n = 0;
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|css|txt|json)$/.test(f)) {
      const t = readFileSync(p, "utf8");
      const u = t.replace(re, `$1${base}/$2/`);
      if (u !== t) { writeFileSync(p, u); n++; }
    }
  }
})("out");
console.log(`prefixed asset links in ${n} files with ${base}`);
