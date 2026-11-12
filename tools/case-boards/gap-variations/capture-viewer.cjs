// Captures the real 3D viewer (jeans on the avatar) and the final result dialog, so every variation shows the identical viewer.
const { chromium } = require("../../../node_modules/playwright");
(async () => {
  const b = await chromium.launch({ channel: "chrome" });
  const pg = await b.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 4 });
  await pg.goto("http://localhost:8080/work/gap-3d-fit", { waitUntil: "networkidle" });
  await pg.addStyleTag({ content: `.gq { height: 740px !important; } [data-case-demo] { aspect-ratio: 960 / 740 !important; width: 960px !important; max-width: none !important; }` });
  await pg.evaluate(() => document.querySelectorAll("body *").forEach((e) => { if (!e.closest(".gq") && getComputedStyle(e).position === "fixed") e.style.setProperty("visibility", "hidden", "important"); }));
  const gq = pg.locator(".gq").first(); await gq.scrollIntoViewIfNeeded(); await pg.waitForTimeout(1500);
  await pg.click(".gq__qf"); await pg.waitForTimeout(1500);
  await pg.click("[data-height]:nth-child(6)", { force: true });
  await pg.click('[data-panel="1"] .gq__next'); await pg.waitForTimeout(400);
  await pg.click('[data-usual="8"]'); await pg.click('[data-panel="2"] .gq__next'); await pg.waitForTimeout(500);
  await pg.click('[data-panel="3"] .gq__next'); await pg.waitForTimeout(2800);
  await pg.evaluate(() => document.querySelector(".gq").scrollIntoView({ block: "center" })); await pg.waitForTimeout(800);
  const gb = await gq.boundingBox();
  const r = await pg.locator(".gq__viewport").first().boundingBox();
  console.log("viewport", r.x - gb.x, r.y - gb.y, r.width, r.height);
  await pg.locator(".gq__viewport").first().screenshot({ path: "src/viewer.png" });
  await gq.screenshot({ path: "src/final.png" });
  await b.close();
})();
