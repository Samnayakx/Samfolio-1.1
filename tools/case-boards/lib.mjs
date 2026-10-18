// Shared helpers: launch headless Chrome and drive it over CDP (Node 22+, no dependencies).
import { spawn } from "node:child_process";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export async function openPage({ width, height, scale = 1 }) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "case-boards-"));
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required", "about:blank"], { stdio: "ignore" });
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    try { await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }); const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); target = list.find((t) => t.type === "page"); } catch {}
    if (!target) await sleep(250);
  }
  if (!target) { chrome.kill(); throw new Error("Chrome did not start. Set CHROME to the browser binary."); }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (e) => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
  await send("Page.enable");
  return { send, ev, close: () => { try { ws.close(); } catch {} chrome.kill(); try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch {} } };
}
export async function load(page, file) {
  await page.send("Page.navigate", { url: "file://" + path.resolve(file) });
  for (let i = 0; i < 80 && !(await page.ev("document.readyState==='complete'")); i++) await sleep(150);
  await page.ev("document.fonts.ready.then(()=>1)"); await sleep(600);
}
