// Before/after measurements under equal conditions (Chrome, CDP-throttled network).
//   node tests/measure.cjs <label> <outDir>
// Writes screenshots (390 + 1280) and <label>.json. Numbers are raw, not scores.
const { chromium } = require("@playwright/test");
const fs = require("fs"), path = require("path");
const [label = "run", out = "/tmp"] = process.argv.slice(2);
const BASE = process.env.BASE || "http://localhost:4173";
fs.mkdirSync(out, { recursive: true });
const median = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

const periodProbe = () => {
  const h = document.querySelector(".headline");
  const nodes = [], w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
  let s = "";
  for (let n; (n = w.nextNode()); ) { nodes.push([n, s.length]); s += n.data; }
  const i = s.indexOf("startups.");
  if (i < 0) return { error: "text not found" };
  const rectAt = (k) => {
    const [n, off] = nodes.filter(([, o]) => o <= k).pop();
    const r = document.createRange(); r.setStart(n, k - off); r.setEnd(n, k - off + 1);
    const q = r.getClientRects(); return q[q.length - 1];
  };
  const dot = rectAt(i + 8), last = rectAt(i + 7);
  return { orphan: Math.abs(dot.top - last.top) > 4 };
};

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const result = { label, perf: {}, orphans: [], overflow: {} };
  for (const net of ["fast", "slow"]) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Network.enable");
      if (net === "slow") await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      await page.addInitScript(() => {
        window.__m = { lcp: 0, loaderGone: null };
        new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
        document.addEventListener("loader:done", () => (window.__m.loaderGone = performance.now()));
      });
      await page.goto(BASE + "/", { waitUntil: "commit" });
      await page.waitForFunction(() => window.__m.loaderGone !== null || (document.readyState !== "loading" && !document.getElementById("loader")), null, { timeout: 30000 });
      await page.waitForTimeout(800);
      const m = await page.evaluate(() => {
        if (window.__m.loaderGone === null) window.__m.loaderGone = performance.now(); // no loader shown
        const nav = performance.getEntriesByType("navigation")[0];
        return { ...window.__m, dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      runs.push(m); await ctx.close();
    }
    result.perf[net] = Object.fromEntries(["dcl", "load", "lcp", "loaderGone"].map((k) => [k, Math.round(median(runs.map((r) => r[k] ?? 0)))]));
  }
  // Widths: overflow + orphan period + screenshots
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForSelector(".headline.in", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3500);
    result.overflow[width] = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (width === 390 || width === 1280) {
      await page.screenshot({ path: path.join(out, `${label}-home-${width}.png`) });
      await page.locator("#work").scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(out, `${label}-work-${width}.png`) });
    }
    await ctx.close();
  }
  // Orphan sweep at desktop widths
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForSelector(".headline.in", { timeout: 15000 });
  await page.waitForTimeout(3000);
  for (let w = 900; w <= 1600; w += 10) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(60);
    const r = await page.evaluate(periodProbe);
    if (r.orphan) result.orphans.push(w);
  }
  await ctx.close(); await browser.close();
  fs.writeFileSync(path.join(out, `${label}.json`), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
