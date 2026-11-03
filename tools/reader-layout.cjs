// Reader layout for writing posts, after benji.org/stageshow: a sticky left rail (back link + on-this-page index),
// a narrow reading column, small flat type, section headings with a hairline rule. Idempotent.
const slug = (s) => s.replace(/<[^>]+>/g, "").toLowerCase().replace(/&amp;|&#39;|&quot;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const text = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();

function toReader(html) {
  if (html.includes("data-reader")) return html;
  const re = /<div class="work__inner">\s*<div class="work__head">([\s\S]*?)<div class="essay">\s*<div class="essay__meta">([\s\S]*?)<\/div>\s*<div class="essay__body">([\s\S]*)<\/div>\s*<\/div>\s*<\/div>\s*<\/article>/;
  const m = html.match(re);
  if (!m) return html;
  const [whole, head, meta, bodyRaw] = m;
  const eyebrow = (head.match(/<p class="work__eyebrow">([\s\S]*?)<\/p>/) || [])[1] || "";
  const sub = (head.match(/<p class="work__sub">([\s\S]*?)<\/p>/) || [])[1] || "";
  const title = (head.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "";
  const lede = (head.match(/<p class="cs__lede">([\s\S]*?)<\/p>/) || [])[1] || "";
  const date = eyebrow.replace(/<[^>]+>/g, "").replace(/^\s*Writing\s*·\s*/, "").trim();

  const toc = [];
  const used = new Set();
  const body = bodyRaw.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (all, attrs = "", inner) => {
    let id = (attrs.match(/id="([^"]+)"/) || [])[1];
    if (!id) { id = slug(inner) || "section"; let n = id, i = 2; while (used.has(n)) n = id + "-" + i++; id = n; }
    used.add(id);
    toc.push([id, text(inner)]);
    return `<h2 id="${id}"${attrs.replace(/\sid="[^"]+"/, "")}>${inner}</h2>`;
  });
  const extras = [...meta.matchAll(/<a href="(https?:[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((x) => `<a class="rd__ext" href="${x[1]}" target="_blank" rel="noopener">${x[2]} ↗</a>`).join("");

  const out = `<div class="work__inner">
        <div class="rd" data-reader>
          <aside class="rd__side">
            <a class="rd__back" href="/writing"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true"><path d="M7 4L3 8l4 4M3 8h9a1 1 0 0 1 1 1v2" stroke="currentColor" stroke-width="1.4"/></svg>Writing</a>
            <nav class="rd__toc" aria-label="On this page">
              <p class="rd__doc">On this page</p>
${toc.map(([id, t]) => `              <a href="#${id}">${t.replace(/&/g, "&amp;")}</a>`).join("\n")}
            </nav>
            ${extras}
          </aside>
          <div class="rd__main essay__body">
            <header class="rd__head">
              <div class="rd__top"><h1 class="rd__title" id="essay-title">${title}</h1><span class="rd__date">${date}</span></div>
              <p class="rd__meta">${sub}</p>
              <p class="rd__lede">${lede}</p>
            </header>
${bodyRaw === body ? bodyRaw : body}
          </div>
        </div>
      </div>
    </article>`;
  return html.replace(re, () => out);
}
module.exports = { toReader };
