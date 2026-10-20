// Fetches the passcode-gated CotonAI studies the way an anonymous visitor (or a crawler) would, and reports what is exposed.
// Prints counts and yes/no only, never the content. Exit 1 means locked material is still reachable without the passcode.
//   BASE=http://localhost:4173 node tests/privacy-probe.cjs
const BASE = process.env.BASE || "http://localhost:4173";
const LOCKED = ["cotonai-modes", "cotonai-design-system", "cotonai-agent"];
const get = async (p) => { const r = await fetch(BASE + p); return { status: r.status, type: r.headers.get("content-type") || "", body: Buffer.from(await r.arrayBuffer()) }; };
(async () => {
  let exposed = 0;
  const flag = (ok, msg) => { console.log(`${ok ? "protected " : "EXPOSED   "} ${msg}`); if (!ok) exposed++; };
  for (const slug of LOCKED) {
    const html = (await get(`/work/${slug}`)).body.toString();
    flag(!/class="study__sec"/.test(html), `/work/${slug}: case text in the HTML a no-JS client receives (${(html.match(/class="study__sec"/g) || []).length} of 7 sections)`);
  }
  const site = (await get("/js/site.js")).body.toString();
  flag(!/slug: "cotonai-(modes|design-system|agent)"[\s\S]{0,6000}cs: \{/.test(site), "/js/site.js: full case-study objects for locked projects shipped to every visitor");
  const assets = [...new Set([...site.matchAll(/\/assets\/images\/cotonai[a-z-]*\/[A-Za-z0-9_\-./]+/g)].map((m) => m[0]))];
  let open = 0;
  for (const a of assets) if ((await get(a)).status === 200) open++;
  flag(open === 0, `locked-study images/videos fetchable without the passcode (${open} of ${assets.length})`);
  const sitemap = (await get("/sitemap.xml")).body.toString();
  flag(!LOCKED.some((s) => sitemap.includes(`/work/${s}`)), "sitemap.xml lists the locked URLs for search engines");
  const gate = (await get("/js/gate.js")).body.toString();
  flag(!/const PASSCODE = "/.test(gate), "/js/gate.js: the passcode compare happens in public client code");
  console.log(exposed ? `\n${exposed} exposure(s): the gate is a courtesy, not authorization.` : "\nNothing exposed.");
  process.exit(exposed ? 1 : 0);
})();
