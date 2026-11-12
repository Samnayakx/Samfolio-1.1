// Dev helper: renders chosen frames into one contact sheet (out/sheet.jpg). node sheet.mjs 40 110 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "QuickFitDemo" });
for (const f of frames) await renderStill({ serveUrl, composition, frame: f, output: `${process.env.OUT || "out/stills"}/f${String(f).padStart(3, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 70, scale: 0.5 });
console.log("total frames", composition.durationInFrames);
