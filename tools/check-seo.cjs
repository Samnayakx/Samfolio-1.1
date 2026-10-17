// Fails if any indexable page lacks a title, meta description, canonical, or a title/description that is unique.
// Usage: node tools/check-seo.cjs   (run after tools/prerender-case-studies.cjs)
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const files = ["index.html", "about.html", "writing.html", "playground.html", "case-study.html", ...["writing", "work"].flatMap((d) => (fs.existsSync(path.join(root, d)) ? fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(".html")).map((f) => `${d}/${f}`) : []))];
const seen = { title: new Map(), desc: new Map() }; let bad = 0;
const fail = (f, m) => { console.error(`✗ ${f}: ${m}`); bad++; };
for (const f of files) {
  const s = fs.readFileSync(path.join(root, f), "utf8");
  const title = (s.match(/<title>([^<]*)<\/title>/) || [])[1], desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1], canon = (s.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (!title) fail(f, "missing <title>"); if (!desc) fail(f, "missing meta description"); if (!canon) fail(f, "missing canonical");
  if (f !== "case-study.html") for (const [k, v] of [["title", title], ["desc", desc]]) if (v) { if (seen[k].has(v)) fail(f, `duplicate ${k} with ${seen[k].get(v)}`); seen[k].set(v, f); }
  if (f.startsWith("work/") && !/study__sec/.test(s)) fail(f, "not prerendered (no case content in HTML)");
}
console.log(bad ? `${bad} problem(s)` : `OK: ${files.length} pages checked`); process.exit(bad ? 1 : 0);
