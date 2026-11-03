// One-off/idempotent: rewrite every writing/*.html into the reader layout.
const fs = require("fs"), path = require("path");
const { toReader } = require("./reader-layout.cjs");
const dir = path.resolve(__dirname, "..", "writing");
let n = 0, skipped = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".html"))) {
  const p = path.join(dir, f), s = fs.readFileSync(p, "utf8"), o = toReader(s);
  if (o === s && !s.includes("data-reader")) skipped.push(f); else if (o !== s) { fs.writeFileSync(p, o); n++; }
}
console.log("converted", n, "unmatched", skipped);
