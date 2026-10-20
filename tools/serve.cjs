// Tiny static server that mimics vercel.json (cleanUrls, 404.html) so tests hit the files as deployed.
//   node tools/serve.cjs [port]
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".pdf": "application/pdf", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain" };
const send = (res, status, file) => {
  res.writeHead(status, { "content-type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
};
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index";
  let f = path.join(root, path.extname(p) ? p : p + ".html");
  if (!f.startsWith(root) || /\/(node_modules|\.git|tools|tests)\//.test(f) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return send(res, 404, path.join(root, "404.html"));
  send(res, 200, f);
}).listen(Number(process.argv[2]) || 4173, () => console.log("serving", root));
