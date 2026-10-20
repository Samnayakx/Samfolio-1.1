// Offline link audit: every internal href/src and fragment resolves to a file (and an id) the way vercel.json serves it,
// every /assets/ path named in HTML, CSS or JS exists, vercel.json redirects land on real pages, and the résumé is a PDF.
// External links are listed, never fetched (bot walls and logins are not broken links).
//   node tools/check-links.cjs
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (["node_modules", ".git", "tools", "tests", "docs", ".claude"].includes(e.name) ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const all = walk(root), rel = (f) => path.relative(root, f);
const pages = all.filter((f) => f.endsWith(".html"));
let bad = 0;
// Referenced in CSS as the top layer over a gradient fallback, never added: a silent 404 for now, so a warning rather than a failure
const OPTIONAL = new Set(["/assets/images/playground/moss.jpg", "/assets/images/playground/sunset.jpg"]);
const fail = (where, msg) => { console.error(`✗ ${where}: ${msg}`); bad++; };

const fileFor = (urlPath) => {
  let p = decodeURIComponent(urlPath);
  if (p === "/") p = "/index";
  const f = path.join(root, path.extname(p) ? p : p + ".html");
  return fs.existsSync(f) && fs.statSync(f).isFile() ? f : null;
};
const ids = new Map();
const idsOf = (f) => ids.get(f) || ids.set(f, new Set([...fs.readFileSync(f, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))).get(f);
const external = new Map();

for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  const here = "/" + rel(page).replace(/\.html$/, "").replace(/^index$/, "");
  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]*)"/g)) {
    const u = m[1];
    if (!u || /^(mailto:|tel:|javascript:|data:)/.test(u)) continue;
    if (/^https?:\/\//.test(u)) { const h = new URL(u).host; external.set(h, (external.get(h) || 0) + 1); if (new URL(u).host.endsWith("sambitnayak.com")) { /* canonical/og: not a link to resolve locally */ } continue; }
    const [pathPart, frag] = u.split("#");
    const [p0] = pathPart.split("?");
    let target = null;
    if (!p0) target = page;                                   // "#fragment" on this page
    else target = fileFor(p0.startsWith("/") ? p0 : path.posix.join(path.posix.dirname(here + ".x"), p0));
    if (!target) { fail(rel(page), `${u} does not resolve`); continue; }
    if (frag && frag !== "top" && !idsOf(target).has(frag) && !/\.(js|css)$/.test(target)) fail(rel(page), `${u}: no id="${frag}" in ${rel(target)}`);
  }
}

// /assets/... named anywhere in HTML, CSS or JS
const sources = all.filter((f) => /\.(html|css|js)$/.test(f));
for (const f of sources) {
  const text = fs.readFileSync(f, "utf8");
  for (const m of new Set([...text.matchAll(/["'(]((?:\/)assets\/[A-Za-z0-9_\-./%]+\.[a-z0-9]+)/g)].map((x) => x[1]))) {
    if (!fs.existsSync(path.join(root, decodeURIComponent(m)))) { if (OPTIONAL.has(m)) console.warn(`! ${rel(f)}: ${m} is missing (gradient fallback in place)`); else fail(rel(f), `${m} is missing`); }
  }
}

// Routes named in JS (project hrefs, nav links)
for (const f of all.filter((x) => x.endsWith(".js"))) {
  for (const m of new Set([...fs.readFileSync(f, "utf8").matchAll(/href: "(\/[^"#?]*)/g)].map((x) => x[1]))) if (!fileFor(m)) fail(rel(f), `route ${m} has no page`);
}

// Redirect destinations
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
for (const r of vercel.redirects || []) if (r.destination.startsWith("/") && !fileFor(r.destination.split("?")[0])) fail("vercel.json", `redirect to ${r.destination} has no page`);

// Résumé
const resume = path.join(root, "assets/Sambit-Nayak-Resume.pdf");
if (!fs.existsSync(resume) || fs.readFileSync(resume).subarray(0, 4).toString() !== "%PDF") fail("assets", "résumé is not a PDF");

console.log("External hosts (not fetched):", [...external].map(([h, n]) => `${h} ×${n}`).join(", "));
console.log(bad ? `${bad} problem(s)` : `OK: ${pages.length} pages, ${sources.length} sources checked`);
process.exit(bad ? 1 : 0);
