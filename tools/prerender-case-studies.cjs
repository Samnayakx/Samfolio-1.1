// Bakes each case study into static HTML at work/<slug>.html so crawlers that don't run JS
// (most AI crawlers) see the full text, alt text, canonical, social tags and JSON-LD.
// js/site.js re-renders over it on load. Re-run after editing PROJECTS in js/site.js:
//   node tools/prerender-case-studies.cjs   (PRERENDER_CHANNEL=chrome uses the installed Chrome instead of Playwright's Chromium)
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".json": "application/json" };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.startsWith("/work/")) p = "/case-study.html"; // always render from the template, never a stale prerender
  else if (!path.extname(p)) p += ".html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
});
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
(async () => {
  await new Promise((r) => srv.listen(0, r));
  const base = `http://localhost:${srv.address().port}`;
  const slugs = [...fs.readFileSync(path.join(root, "js/site.js"), "utf8").matchAll(/slug: "([a-z0-9-]+)", href: "\/work\//g)].map((m) => m[1]);
  const tpl = fs.readFileSync(path.join(root, "case-study.html"), "utf8");
  const browser = await chromium.launch(process.env.PRERENDER_CHANNEL ? { channel: process.env.PRERENDER_CHANNEL } : {}), page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => { try { sessionStorage.setItem("samfolio-unlocked", "1"); } catch {} }); // the passcode gate would cover the locked studies
  fs.mkdirSync(path.join(root, "work"), { recursive: true });
  for (const slug of slugs) {
    await page.goto(`${base}/work/${slug}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-cs-root] .study__sec");
    const r = await page.evaluate(() => {
      const m = document.querySelector("[data-cs-root]"), h = document.head;
      const tags = [...h.querySelectorAll('link[rel="canonical"], meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], script[data-cs-ld]')].map((e) => e.outerHTML);
      // Interactive demos mount client-side; bake only their empty placeholder, never a live, already-mounted copy
      const c = m.cloneNode(true);
      c.querySelectorAll("[data-case-demo]").forEach((d) => { d.replaceChildren(); d.removeAttribute("data-on"); d.removeAttribute("style"); });
      c.querySelectorAll("[data-gq-notes]").forEach((n) => n.remove()); // the demo script adds its callouts on load
      return { title: document.title, tags, style: m.getAttribute("style") || "", html: c.innerHTML };
    });
    let out = tpl
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`)
      .replace(/\s*<link rel="canonical"[^>]*>|\s*<meta name="description"[^>]*>|\s*<meta property="og:[^>]*>|\s*<meta name="twitter:[^>]*>/g, "")
      .replace("</title>", "</title>\n  " + r.tags.join("\n  "))
      .replace('<div class="study" data-cs-root></div>', `<div class="study" data-cs-root${r.style ? ` style="${esc(r.style)}"` : ""}>${r.html}</div>`);
    // site.js leaves the head alone on a prerendered study, so the template's generic head would replace the real one:
    // keep the title, description, canonical, social tags and JSON-LD already in work/<slug>.html
    const file = path.join(root, "work", `${slug}.html`);
    if (fs.existsSync(file)) {
      const head = (h) => h.match(/<head>[\s\S]*<\/head>/)[0];
      out = out.replace(head(out), () => head(fs.readFileSync(file, "utf8")));
    }
    fs.writeFileSync(file, out);
    console.log("wrote work/" + slug + ".html", (out.length / 1024).toFixed(0) + " KB");
  }
  await browser.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
