// Extends writing posts from tools/content/<slug>.json and strips inline hyperlinks from body paragraphs.
// JSON: { "sections": [{ "before": "How I'd test it" | null, "h": "Heading", "flag": "optional note", "p": ["paragraph with <strong>lead.</strong> text", ...] }],
//         "maps": [{ "after": "Existing or new heading text", "caption": "...", "center": "OKLCH", "branches": [{ "label": "Lightness", "children": ["steps evenly", "..."] }] }] }
// Idempotent: generated blocks carry data-x and are removed before re-inserting. Also rebuilds the left-rail index from the h2s.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, ".."), W = path.join(ROOT, "writing"), C = path.join(__dirname, "content");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slugify = (s) => s.replace(/<[^>]+>/g, "").toLowerCase().replace(/&amp;|&#39;|&quot;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();

// ── mindmap: a centre pill, idea pills left and right on curved wires, and each idea's notes hung beneath it on a thin guide.
//    Drawn to fit the reading column (640 units wide), so nothing runs past the page and the text stays readable. ──
function mindmap({ center, branches }) {
  const Wd = 640, cx = Wd / 2, PH = 34, LH = 27, PADY = 26;
  const left = branches.filter((_, i) => i % 2 === 1), right = branches.filter((_, i) => i % 2 === 0);
  const kidsOf = (b) => (b.children || []).slice(0, 2);
  const hOf = (b) => PH + (kidsOf(b).length ? 10 + kidsOf(b).length * LH : 0) + PADY;
  const colH = (L) => L.reduce((t, b) => t + hOf(b), 0) - PADY;
  const H = Math.max(260, colH(left), colH(right)) + 80, cy = H / 2;
  const cw = Math.max(124, center.length * 10 + 44), ch = 46;
  let wires = "", items = "";
  const place = (list, side) => {
    let y = cy - colH(list) / 2;
    list.forEach((b) => {
      const bw = Math.max(86, b.label.length * 9 + 34), x = side < 0 ? 24 : Wd - 24 - 176;
      const px = side < 0 ? x + bw : x, py = y + PH / 2, sx = side < 0 ? cx - cw / 2 : cx + cw / 2, dx = (px - sx) * 0.55;
      wires += `<path class="mm__w" d="M${sx} ${cy}C${sx + dx} ${cy} ${px - dx} ${py} ${px} ${py}"/><circle class="mm__end" cx="${px}" cy="${py}" r="4"/>`;
      items += `<rect class="mm__b" x="${x}" y="${y}" width="${bw}" height="${PH}" rx="${PH / 2}"/><text class="mm__bt" x="${x + bw / 2}" y="${y + PH / 2 + 5.5}" text-anchor="middle">${esc(b.label)}</text>`;
      const ks = kidsOf(b);
      if (ks.length) {
        const gx = x + 20, top = y + PH + 4;
        items += `<path class="mm__g" d="M${gx} ${top}V${top + 10 + (ks.length - 1) * LH + 6}"/>`;
        ks.forEach((k, i) => { const ky = y + PH + 10 + i * LH + 14; items += `<path class="mm__g" d="M${gx} ${ky - 5}h9"/><text class="mm__t" x="${gx + 16}" y="${ky}">${esc(k.length > (side < 0 ? 27 : 21) ? k.slice(0, (side < 0 ? 26 : 20)) + "…" : k)}</text>`; });
      }
      y += hOf(b);
    });
  };
  place(left, -1); place(right, 1);
  const stage = `<circle class="mm__orb" cx="${cx}" cy="${cy}" r="${cw / 2 + 26}"/>`;
  const core = `<rect class="mm__c" x="${cx - cw / 2}" y="${cy - ch / 2}" width="${cw}" height="${ch}" rx="${ch / 2}"/><text class="mm__ct" x="${cx}" y="${cy + 6}" text-anchor="middle">${esc(center)}</text>`;
  return `<svg viewBox="0 0 ${Wd} ${H}" role="img" aria-label="${esc(center)} mindmap">${stage}${wires}${items}${core}</svg>`;
}

for (const f of fs.readdirSync(W).filter((x) => x.endsWith(".html"))) {
  const slug = f.slice(0, -5), file = path.join(W, f);
  let html = fs.readFileSync(file, "utf8");
  const m = html.match(/(<div class="rd__main essay__body">[\s\S]*?<\/header>)([\s\S]*?)(\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/article>)/);
  if (!m) continue;
  let body = m[2].replace(/<(section|figure|h2|p)[^>]*data-x[^>]*>[\s\S]*?<\/\1>\s*/g, "");
  const srcAt = body.indexOf('<section class="essay__sources"');
  let main = srcAt < 0 ? body : body.slice(0, srcAt), tail = srcAt < 0 ? "" : body.slice(srcAt);
  // 1. no inline hyperlinks in the reading text: keep the words, drop the anchor (References keep theirs)
  main = main.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/g, "$1");
  // 2. expand
  const spec = fs.existsSync(path.join(C, slug + ".json")) ? JSON.parse(fs.readFileSync(path.join(C, slug + ".json"), "utf8")) : null;
  if (spec) {
    const chunks = main.split(/(?=<h2\b)/); // chunk 0 is the figure/lede, then one chunk per h2
    const idx = (t) => chunks.findIndex((c, i) => i > 0 && plain((c.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "").toLowerCase() === String(t).toLowerCase());
    for (const s of spec.sections || []) {
      const block = `<h2 data-x>${esc(s.h)}</h2>\n            ${s.flag ? `<p class="essay__flag" data-x>${esc(s.flag)}</p>\n            ` : ""}${s.p.map((p) => `<p data-x>${p}</p>`).join("\n            ")}\n            `;
      const at = s.before ? idx(s.before) : -1;
      if (at > 0) chunks.splice(at, 0, block); else chunks.push(block);
    }
    for (const mp of spec.maps || []) {
      const fig = `<figure class="mm" data-x>${mindmap(mp)}<figcaption>${esc(mp.caption || "")}</figcaption></figure>\n            `;
      const at = idx(mp.after);
      if (at > 0) chunks[at] = chunks[at].replace(/\s*$/, "\n            ") + fig; else chunks.push(fig);
    }
    main = chunks.join("");
  }
  // 3. ids on every h2, and the left-rail index rebuilt from them
  const used = new Set(), toc = [];
  const reId = (s) => s.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (a, at = "", inner) => {
    let id = (at.match(/id="([^"]+)"/) || [])[1] || slugify(inner) || "section";
    let n = id, i = 2; while (used.has(n)) n = id + "-" + i++; used.add(n);
    toc.push([n, plain(inner)]);
    return `<h2 id="${n}"${at.replace(/\sid="[^"]+"/, "").replace(/\sdata-x/, "")}${/data-x/.test(at) ? " data-x" : ""}>${inner}</h2>`;
  });
  main = reId(main); tail = reId(tail);
  html = html.replace(m[0], () => m[1] + main + tail + m[3]);
  html = html.replace(/(<p class="rd__doc">On this page<\/p>)[\s\S]*?(<\/nav>)/, (a, h, c2) => `${h}\n${toc.map(([id, t]) => `              <a href="#${id}">${esc(t)}</a>`).join("\n")}\n            ${c2}`);
  // read time follows the real length (about 200 words a minute)
  const words = html.slice(html.indexOf('class="rd__main'), html.indexOf('<section class="essay__sources"')).replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(3, Math.round(words / 200));
  html = html.replace(/(<p class="rd__meta">)\d+ min read/, `$1${mins} min read`);
  fs.writeFileSync(file, html);
  const wf = path.join(ROOT, "writing.html"); let w = fs.readFileSync(wf, "utf8");
  w = w.replace(new RegExp(`(href="/writing/${slug}">[\\s\\S]*?)`), "$1");
  const re = new RegExp(`(<span class="post__read">)\\d+ min read(?=[^<]*</span></div>\\s*<a class="post__link" href="/writing/${slug}")`);
  w = w.replace(re, `$1${mins} min read`); fs.writeFileSync(wf, w);
}
console.log("expanded");
module.exports = { mindmap };
