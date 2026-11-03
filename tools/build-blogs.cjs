#!/usr/bin/env node
// Builds the "Design craft in the age of AI" posts from markdown into /writing/*.html,
// copies their mindmaps, and rewrites the generated block of writing.html and sitemap.xml.
// Usage: node tools/build-blogs.cjs "<folder with index.md and blogs/>"
const fs = require("fs");
const { thumbTile: pdpTile } = require("./thumbs.cjs");
const { toReader } = require("./reader-layout.cjs");
const path = require("path");

const SRC = path.resolve(process.argv[2] || "");
const ROOT = path.resolve(__dirname, "..");
const BLOGS = path.join(SRC, "blogs");
if (!fs.existsSync(path.join(BLOGS, "01-semantic-tokens.md"))) { console.error("Source folder not found:", SRC); process.exit(1); }

const ORIGIN = "https://www.sambitnayak.com";
const MONTH = "Nov 2026";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attr = esc;

const inline = (raw) => {
  let s = esc(raw);
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
    const ext = /^https?:/.test(u);
    return `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
};

// index.md → category per post number
const category = {};
let group = "";
for (const line of fs.readFileSync(path.join(SRC, "index.md"), "utf8").split("\n")) {
  if (line.startsWith("## ")) group = line.slice(3).trim();
  const m = line.match(/^(\d+)\. \[/);
  if (m) category[+m[1]] = group;
}
const TAGS = {
  "Design systems and craft": "Design systems · Craft",
  "Designers who shaped the field": "Designers · Craft",
  "Interaction and motion": "Interaction · Motion",
  "Designing for AI": "AI interfaces · Craft",
  "Strategy, culture, and people": "Strategy · Culture",
};

const posts = fs.readdirSync(BLOGS).filter((f) => /^\d\d-.*\.md$/.test(f)).sort().map((file) => {
  const num = +file.slice(0, 2), slug = file.slice(3, -3);
  const lines = fs.readFileSync(path.join(BLOGS, file), "utf8").split("\n");
  let title = "", lede = "", alt = "", i = 0;
  const body = [];
  let sources = [], inSources = false, listType = null, para = [], seenDate = false;
  const flushPara = () => { if (para.length) { body.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const closeList = () => { if (listType) { body.push(`</${listType}>`); listType = null; } };
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("# ")) { title = l.slice(2).trim(); continue; }
    if (/^\*[^*].*\*$/.test(l.trim()) && !l.startsWith("**")) {
      const t = l.trim().slice(1, -1);
      if (/^November 2026$/.test(t)) { seenDate = true; continue; }
      if (!lede) { lede = t; continue; }
    }
    const img = l.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (img) { alt = img[1]; continue; }
    if (l.startsWith("## ")) {
      flushPara(); closeList();
      const h = l.slice(3).trim();
      inSources = h === "References";
      if (!inSources) body.push(`<h2>${inline(h)}</h2>`);
      continue;
    }
    if (inSources) { const m = l.match(/^- (.*)$/); if (m) sources.push(m[1]); continue; }
    if (l.startsWith("> ")) {
      flushPara(); closeList();
      body.push(`<p class="essay__flag">${inline(l.slice(2).replace(/^\*\*|\*\*$/g, ""))}</p>`);
      continue;
    }
    const li = l.match(/^(?:- |(\d+)\. )(.*)$/);
    if (li) {
      flushPara();
      const t = li[1] ? "ol" : "ul";
      if (listType !== t) { closeList(); body.push(`<${t}>`); listType = t; }
      body.push(`<li>${inline(li[2])}</li>`);
      continue;
    }
    if (!l.trim()) { flushPara(); closeList(); continue; }
    closeList(); para.push(l.trim());
  }
  flushPara(); closeList();
  const words = body.join(" ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length + sources.length * 8;
  return { num, slug, title, lede, alt, body, sources, mins: Math.max(3, Math.round(words / 200)), tag: TAGS[category[num]] || "Design craft", seenDate };
});

// Mindmaps
const imgDir = path.join(ROOT, "assets/images/writing/craft");
fs.mkdirSync(imgDir, { recursive: true });
for (const p of posts) fs.copyFileSync(path.join(BLOGS, "diagrams", `${String(p.num).padStart(2, "0")}-${p.slug}.png`), path.join(imgDir, `${p.slug}.png`));

// Template: reuse the shell (header, footer, scripts) of an existing essay
const tpl = fs.readFileSync(path.join(ROOT, "writing/confidence-is-the-missing-layer.html"), "utf8");
const [headAndNav, rest] = tpl.split('<main id="top">');
const tail = rest.slice(rest.indexOf("</main>"));
const swap = (s, re, val) => s.replace(re, val);

const pageFor = (p, idx) => {
  const url = `${ORIGIN}/writing/${p.slug}`;
  const docTitle = `${p.title} | Sambit Nayak`;
  const desc = p.lede.replace(/\.$/, "") + ".";
  let head = headAndNav;
  head = swap(head, /<title>.*?<\/title>/, `<title>${esc(docTitle)}</title>`);
  head = swap(head, /(<meta name="description" content=")[^"]*"/, `$1${attr(desc)}"`);
  head = swap(head, /(<link rel="canonical" href=")[^"]*"/, `$1${url}"`);
  head = swap(head, /(<meta property="og:title" content=")[^"]*"/, `$1${attr(docTitle)}"`);
  head = swap(head, /(<meta property="og:description" content=")[^"]*"/, `$1${attr(desc)}"`);
  head = swap(head, /(<meta property="og:url" content=")[^"]*"/, `$1${url}"`);
  head = swap(head, /(<meta name="twitter:title" content=")[^"]*"/, `$1${attr(docTitle)}"`);
  head = swap(head, /(<meta name="twitter:description" content=")[^"]*"/, `$1${attr(desc)}"`);
  const ld = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ["Writing", "/writing"], [p.title, `/writing/${p.slug}`]].map(([name, u], i) => ({ "@type": "ListItem", position: i + 1, name, item: ORIGIN + u })) });
  head = swap(head, /<script type="application\/ld\+json">.*?<\/script>/, () => `<script type="application/ld+json">${ld}</script>`);

  const next = posts[(idx + 1) % posts.length];
  const nextLink = idx + 1 < posts.length
    ? `<a href="/writing/${next.slug}"><small>Next</small><strong>${esc(next.title.split(":")[0])}</strong></a>`
    : `<a href="/writing/confidence-is-the-missing-layer"><small>Start</small><strong>Confidence is the missing layer</strong></a>`;
  const sources = p.sources.length ? `
            <section class="essay__sources" aria-labelledby="sources-title">
              <h2 id="sources-title">References</h2>
              <ol>
${p.sources.map((s, n) => `                <li id="source-${n + 1}">${inline(s)}</li>`).join("\n")}
              </ol>
            </section>
` : "";
  const main = `<main id="top">
    <article class="sheet sheet--first">
      <div class="work__inner">
        <div class="work__head">
          <div class="work__label">
            <p class="work__eyebrow"><a href="/writing">Writing</a> · ${MONTH}</p>
            <p class="work__sub">${p.mins} min read · ${esc(p.tag)}</p>
          </div>
          <div class="work__headline">
            <h1 class="work__title" id="essay-title">${inline(p.title)}</h1>
            <p class="cs__lede">${inline(p.lede)}</p>
          </div>
        </div>

        <div class="essay">
          <div class="essay__meta">
            <a href="/writing">All writing</a>
          </div>
          <div class="essay__body">
            <figure class="essay__map">
              <img src="/assets/images/writing/craft/${p.slug}.webp" alt="${attr(p.alt)}" width="1500" height="1060" loading="eager">
            </figure>

            ${p.body.join("\n            ")}
${sources}
            <div class="essay__foot">
              <nav class="cs__next" aria-label="More writing">
                <a href="/writing"><small>Index</small><strong>All writing</strong></a>
                ${nextLink}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
  return toReader(head + main + tail);
};

posts.forEach((p, i) => fs.writeFileSync(path.join(ROOT, "writing", `${p.slug}.html`), pageFor(p, i)));

// writing.html: replace everything between the markers (added on first run)
const START = "<!-- craft:start -->", END = "<!-- craft:end -->";
const items = posts.map((p) => `      <li class="post">
        <div class="post__label"><span>${MONTH}</span><span class="post__read">${p.mins} min read · ${String(p.num).padStart(2, "0")} / ${posts.length}</span></div>
        <a class="post__link" href="/writing/${p.slug}">
          ${pdpTile(p.slug)}
          <span class="post__tag">${esc(p.tag)}</span>
          <h2 class="post__title">${inline(p.title.split(": ")[0])}</h2>
          <p class="post__excerpt">${inline(p.lede)}</p>
          <span class="case__cta">Read post <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg></span>
        </a>
      </li>`).join("\n");
const block = `${START}\n${items}\n      ${END}`;
let w = fs.readFileSync(path.join(ROOT, "writing.html"), "utf8");
if (w.includes(START)) w = w.replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => block);
else w = w.replace(/(\n        <\/ul>\n      <\/div>\n    <\/section>\n\n    <section class="sheet" aria-labelledby="sub-title">)/, (m) => `\n      ${block}${m}`);
w = w.replace(/Research-backed notes on how AI systems remember, decide, act, and earn trust\./, "Research-backed notes on how AI systems remember, decide, act, and earn trust, plus twenty short posts on design craft in the age of AI.");
fs.writeFileSync(path.join(ROOT, "writing.html"), w);

// sitemap
let sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
sm = sm.replace(new RegExp(`  <url><loc>[^<]*/writing/(?:${posts.map((p) => p.slug).join("|")})</loc>.*</url>\n`, "g"), "");
const today = new Date().toISOString().slice(0, 10);
sm = sm.replace("</urlset>", posts.map((p) => `  <url><loc>${ORIGIN}/writing/${p.slug}</loc><lastmod>${today}</lastmod></url>\n`).join("") + "</urlset>");
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sm);
console.log(`Built ${posts.length} posts.`);
