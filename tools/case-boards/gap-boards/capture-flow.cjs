// Captures the real QuickFit prototype states for the "final flow" board (needs the site served on :8080 and playwright).
const { chromium } = require("../../../node_modules/playwright");
(async () => {
  const b = await chromium.launch({ channel: "chrome" });
  const pg = await b.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 4 });
  await pg.goto("http://localhost:8080/work/gap-3d-fit", { waitUntil: "networkidle" });
  await pg.addStyleTag({ content: `.gq { height: 740px !important; } [data-case-demo] { aspect-ratio: 960 / 740 !important; width: 960px !important; max-width: none !important; }` });
  await pg.evaluate(() => document.querySelectorAll("body *").forEach((e) => { if (!e.closest(".gq") && getComputedStyle(e).position === "fixed") e.style.setProperty("visibility", "hidden", "important"); }));
  const gq = pg.locator(".gq").first(); await gq.scrollIntoViewIfNeeded(); await pg.waitForTimeout(1500);
  const center = () => pg.evaluate(() => document.querySelector(".gq").scrollIntoView({ block: "center" })).then(() => pg.waitForTimeout(900));
  const snap = async (n) => { await center(); await gq.screenshot({ path: `src2/${n}.png` }); };
  await pg.click(".gq__qf"); await pg.waitForTimeout(1500); await snap("s1-height");
  await pg.click("[data-height]:nth-child(6)", { force: true }); await pg.click('[data-panel="1"] .gq__next'); await pg.waitForTimeout(500); await snap("s2-usual");
  await pg.click('[data-usual="8"]'); await pg.click('[data-panel="2"] .gq__next'); await pg.waitForTimeout(600); await snap("s3-meas");
  await pg.click('[data-panel="3"] .gq__next'); await pg.waitForTimeout(2800); await snap("s4-result");
  for (const z of ["Waist", "Hips", "Calf"]) {
    await pg.click(`.gq__z[data-z="${z}"]`); await pg.waitForTimeout(800); await center();
    await pg.locator(".gq__pop").first().screenshot({ path: `src2/pop-${z.toLowerCase()}.png` });
    await pg.click(".gq__pop [data-close-pop]").catch(() => {}); await pg.waitForTimeout(300);
  }
  await b.close();
})();
