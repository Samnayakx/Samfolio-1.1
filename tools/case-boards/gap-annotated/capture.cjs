// Captures the real QuickFit prototype states for index.html (needs the site served on :8080 and playwright).
const { chromium } = require("../../../node_modules/playwright");
const fs = require("fs");
(async () => {
  const b = await chromium.launch({ channel: "chrome" });
  const pg = await b.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 4 });
  await pg.goto("http://localhost:8080/work/gap-3d-fit", { waitUntil: "networkidle" });
  await pg.addStyleTag({ content: `.gq { height: 740px !important; } [data-case-demo] { aspect-ratio: 960 / 740 !important; width: 960px !important; max-width: none !important; }` });
  await pg.evaluate(() => document.querySelectorAll("body *").forEach((e) => { if (!e.closest(".gq") && getComputedStyle(e).position === "fixed") e.style.setProperty("visibility", "hidden", "important"); }));
  const gq = pg.locator(".gq").first();
  const rects = {};
  const snap = async (name, sels) => {
    await pg.evaluate(() => document.querySelector(".gq").scrollIntoView({ block: "center" }));
    await pg.waitForTimeout(900);
    const box = await gq.boundingBox();
    rects[name] = { w: box.width, h: box.height };
    for (const [k, sel] of Object.entries(sels)) {
      const r = await pg.locator(sel).first().boundingBox();
      rects[name][k] = { x: r.x - box.x, y: r.y - box.y, w: r.width, h: r.height };
    }
    await gq.screenshot({ path: `src/${name}.png` });
  };
  await gq.scrollIntoViewIfNeeded(); await pg.waitForTimeout(1500);
  await snap("a-entry", { qf: ".gq__qf" });
  await pg.click(".gq__qf"); await pg.waitForTimeout(1500);
  await snap("b-height", { chips: ".gq__hwin", avatar: ".gq__viewport" });
  await pg.click("[data-height]:nth-child(6)", { force: true });
  await pg.click('[data-panel="1"] .gq__next'); await pg.waitForTimeout(500);
  await snap("c-usual", { grid: '[data-panel="2"] .gq__ugrid', next: '[data-panel="2"] .gq__next' });
  await pg.click('[data-usual="8"]'); await pg.click('[data-panel="2"] .gq__next'); await pg.waitForTimeout(700);
  await snap("d-meas", { meas: ".gq__meas" });
  await pg.click('[data-panel="3"] .gq__next'); await pg.waitForTimeout(2500);
  await snap("e-result", { why: ".gq__why", size: ".gq__sz" });
  await pg.click('.gq__z[data-z="Hips"]'); await pg.waitForTimeout(800);
  await snap("f-fit", { zones: ".gq__zones", pop: ".gq__pop" });
  fs.writeFileSync("rects.json", JSON.stringify(rects, null, 1));
  await b.close();
})();
