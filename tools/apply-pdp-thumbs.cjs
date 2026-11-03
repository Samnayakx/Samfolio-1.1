// Idempotent: replaces everything between the link and its tag span.
// One-off: swap every writing tile in writing.html for its PDP slice. build-blogs.cjs uses the same module for the craft posts.
const fs = require("fs"), path = require("path");
const { thumbTile: pdpTile } = require("./thumbs.cjs");
const f = path.resolve(__dirname, "..", "writing.html");
let w = fs.readFileSync(f, "utf8"), n = 0;
w = w.replace(/(<a class="post__link" href="\/writing\/([^"]+)">\s*)(?:<span class="post__tags">[\s\S]*?<\/span>\s*)?<div class="post__tile[\s\S]*?(?=\s*<span class="post__tag">)/g, (m, a, slug) => { n++; return a + pdpTile(slug); });
fs.writeFileSync(f, w); console.log("tiles replaced:", n);
