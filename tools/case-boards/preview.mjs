// Usage: node tools/case-boards/preview.mjs <folder> <outDir> <t1> <t2> ...   (single frames of a cover, for a quick look)
import fs from "node:fs";
import { openPage, load, sleep } from "./lib.mjs";
const [folder, out, ...times] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const page = await openPage({ width: 1920, height: 1080, scale: 1 });
await load(page, `${folder}/index.html`);
for (let i = 0; i < 60 && !(await page.ev("!!window.__ready")); i++) await sleep(200);
for (const t of times) {
  await page.ev(`window.render(${t})`); await page.ev("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
  const r = await page.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${out}/t${(+t).toFixed(2)}.png`, Buffer.from(r.result.data, "base64"));
}
page.close();
