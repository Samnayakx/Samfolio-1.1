// Usage: node tools/case-boards/video.mjs <folder> [outDir] [fps] [seconds]   (frames only; encode with ffmpeg, see README)
// <folder>/index.html must expose window.render(t) and set window.__ready = true once fonts are loaded.
import fs from "node:fs";
import { openPage, load, sleep } from "./lib.mjs";
const [folder, out = `${folder}/frames`, fps = "30", dur = "8"] = process.argv.slice(2);
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const page = await openPage({ width: 1920, height: 1080, scale: 1 });
await load(page, `${folder}/index.html`);
for (let i = 0; i < 60 && !(await page.ev("!!window.__ready")); i++) await sleep(200);
const n = +fps * +dur;
for (let i = 0; i < n; i++) {
  await page.ev(`window.render(${i / +fps})`);
  await page.ev("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
  const r = await page.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${out}/${String(i).padStart(4, "0")}.png`, Buffer.from(r.result.data, "base64"));
}
console.log("wrote", n, "frames to", out); page.close();
