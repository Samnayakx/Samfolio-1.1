// Captures the real QuickFit prototype (js/case-demos.js) state by state, plus a transparent 3D turn
// sequence, into public/cap for the Remotion composition. Run: node tools/gap-demo-video/capture.cjs
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require(path.resolve(__dirname, "../../node_modules/playwright"));
const root = path.resolve(__dirname, "../.."), out = path.join(__dirname, "public/cap");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".bin": "application/octet-stream", ".woff2": "font/woff2", ".mp4": "video/mp4" };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (!path.extname(p)) p += ".html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
});
const FRAMES = +process.env.TURN_FRAMES || 72;
(async () => {
  await new Promise((r) => srv.listen(0, r));
  const base = `http://localhost:${srv.address().port}`;
  const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=metal", "--enable-gpu"] });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: +process.env.DPR || 2, reducedMotion: "reduce" });
  await page.goto(`${base}/work/gap-3d-fit`, { waitUntil: "networkidle" });
  const host = page.locator('[data-case-demo="gapQuickFit"]');
  await host.scrollIntoViewIfNeeded(); await page.waitForSelector(".gq__qf");
  await page.addStyleTag({ content: "*{transition:none!important;animation:none!important;caret-color:transparent!important}" });
  const stage = page.locator(".gq");
  const snap = async (name, loc = stage) => { await page.waitForTimeout(250); await loc.screenshot({ path: path.join(out, name + ".png") }); console.log(name); };
  await page.mouse.move(0, 0);
  await snap("01-pdp");
  await snap("el-qf", page.locator(".gq__qf"));
  await page.click(".gq__qf"); await page.waitForTimeout(400);
  await snap("02-height");
  await page.click('[data-height="66"]'); await page.waitForTimeout(500);
  await snap("03-height-on"); await snap("q-1", page.locator('[data-panel="1"]'));
  await page.click('[data-panel="1"] .gq__next'); await page.waitForTimeout(400);
  await page.click('[data-usual="8"]').catch(async () => { const b = page.locator("[data-usual]").nth(5); await b.click(); });
  await page.waitForTimeout(500);
  await snap("04-usual"); await snap("q-2", page.locator('[data-panel="2"]'));
  await page.click('[data-panel="2"] .gq__next'); await page.waitForTimeout(500);
  await snap("05-meas"); await snap("q-3", page.locator('[data-panel="3"]'));
  await page.click('[data-panel="3"] .gq__next'); await page.waitForTimeout(1500);
  await snap("06-result");
  await snap("el-right", page.locator(".gq__right"));
  await snap("el-left", page.locator(".gq__left")); await snap("el-zones", page.locator(".gq__zones")); await snap("el-sz", page.locator(".gq__sz")); await snap("el-add", page.locator(".gq__add")); await snap("el-why-link", page.locator(".gq__why")); await snap("el-rsizes", page.locator("[data-rsizes]"));
  await page.click(".gq__why"); await page.waitForTimeout(400);
  await snap("07-why"); await snap("el-why", page.locator(".gq__whyCard"));
  await page.click("[data-close-why]"); await page.waitForTimeout(300);
  await page.click('.gq__z[data-z="Hips"]'); await page.waitForTimeout(400);
  await snap("08-zone"); await snap("el-pop", page.locator(".gq__pop"));
  await page.click("[data-close-pop]"); await page.waitForTimeout(300);
  await page.mouse.move(0, 0); await page.waitForTimeout(300);
  await snap("06b-result-clean");
  await page.click(".gq__add"); await page.locator(".gq__add").screenshot({ path: path.join(out, "el-added.png") }); console.log("el-added");
  await page.waitForTimeout(700); await page.mouse.move(0, 0); await page.locator(".gq").screenshot({ path: path.join(out, "09-pdp-added.png") }); console.log("09-pdp-added");
  await page.click(".gq__qf"); await page.waitForTimeout(800);

  // Transparent 3D turn: clear every background behind the canvas, then drag one step per frame
  await page.addStyleTag({ content: "*,*::before,*::after{background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.gq__hint,.gq__load{display:none!important}.gq__pdp,.gq__left,.gq__right,.gq__tabs,.gq__ttl,.gq__close{visibility:hidden!important}.gq__finder{backdrop-filter:none!important;box-shadow:none!important}.gq__app{box-shadow:none!important;border:0!important}" });
  const vp = page.locator(".gq__viewport"), bb = await vp.boundingBox();
  const step = (Math.PI * 2 / FRAMES) / 0.012; let x = bb.x + 20, y = bb.y + bb.height / 2;
  fs.mkdirSync(path.join(out, "turn"), { recursive: true });
  await page.mouse.move(x, y); await page.mouse.down();
  for (let i = 0; i < FRAMES; i++) {
    await page.waitForTimeout(60);
    await vp.screenshot({ path: path.join(out, "turn", `t${String(i).padStart(3, "0")}.png`), omitBackground: true });
    x += step; if (x > bb.x + bb.width - 10) { await page.mouse.up(); x = bb.x + 20; await page.mouse.move(x, y); await page.mouse.down(); }
    await page.mouse.move(x, y, { steps: 1 });
  }
  await page.mouse.up();
  console.log("turn", FRAMES, JSON.stringify(bb));
  await browser.close(); srv.close();
})();
