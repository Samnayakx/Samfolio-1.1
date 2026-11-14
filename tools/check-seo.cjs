// Fails if any indexable page lacks a title, meta description, canonical, or a title/description that is unique.
// Usage: node tools/check-seo.cjs   (run after tools/prerender-case-studies.cjs)
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const files = ["index.html", "work.html", "about.html", "writing.html", "playground.html", "case-study.html", ...["writing", "work"].flatMap((d) => (fs.existsSync(path.join(root, d)) ? fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(".html")).map((f) => `${d}/${f}`) : []))];
// Most case studies share one seven-section story; a study can declare its own flow in js/site.js (`cs.structure`) and list it here
const FIVE = "overview,problem,hypothesis,solution,learning";
const STRUCTURE_BY_PAGE = { "work/arcade-dev.html": ["web", "mobile"].map((k) => FIVE.split(",").map((x) => `${k}-${x}`).join(",")).join(",") };
const STRUCTURE = FIVE;
const seen = { title: new Map(), desc: new Map() }; let bad = 0;
const fail = (f, m) => { console.error(`✗ ${f}: ${m}`); bad++; };
for (const f of files) {
  const s = fs.readFileSync(path.join(root, f), "utf8");
  const title = (s.match(/<title>([^<]*)<\/title>/) || [])[1], desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1], canon = (s.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (!title) fail(f, "missing <title>"); if (!desc) fail(f, "missing meta description"); if (!canon) fail(f, "missing canonical");
  if (f !== "case-study.html") for (const [k, v] of [["title", title], ["desc", desc]]) if (v) { if (seen[k].has(v)) fail(f, `duplicate ${k} with ${seen[k].get(v)}`); seen[k].set(v, f); }
  if (f.startsWith("work/") && !/study__sec/.test(s)) fail(f, "not prerendered (no case content in HTML)");
  if (f.startsWith("work/")) { // every case study tells its story in the same five sections, in order
    const ids = [...s.matchAll(/<section class="study__sec" id="([^"]+)"/g)].map((m) => m[1]).join(",");
    const want = STRUCTURE_BY_PAGE[f] || STRUCTURE;
    if (ids !== want) fail(f, `sections are not the expected structure (found: ${ids || "none"}; want: ${want})`);
  }
}
console.log(bad ? `${bad} problem(s)` : `OK: ${files.length} pages checked`); process.exit(bad ? 1 : 0);
