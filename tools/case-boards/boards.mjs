// Usage: node tools/case-boards/boards.mjs <folder> [outDir] [scale]
// Renders every element with class "board" in <folder>/index.html to <outDir>/<id>.png (default scale 2).
import fs from "node:fs";
import { openPage, load } from "./lib.mjs";
const [folder, out = `${folder}/out`, scale = "2"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const page = await openPage({ width: 1240, height: 1000, scale: +scale });
await load(page, `${folder}/index.html`);
const ids = JSON.parse(await page.ev("JSON.stringify([...document.querySelectorAll('.board')].map(b=>b.id))"));
for (const id of ids) {
  const r = JSON.parse(await page.ev(`(()=>{const b=document.getElementById('${id}').getBoundingClientRect();return JSON.stringify({x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height})})()`));
  const c = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  fs.writeFileSync(`${out}/${id}.png`, Buffer.from(c.result.data, "base64")); console.log(id, Math.round(r.w), Math.round(r.h));
}
page.close();
