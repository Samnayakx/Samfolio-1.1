#!/usr/bin/env python3
"""Local dev server that mimics vercel.json cleanUrls: /about -> about.html, /work/x -> work/x.html.

Run from anywhere:  python3 tools/dev-server.py [port]   (default 8000)
"""
import os, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        if path.endswith(".html") and path != "/404.html":
            # cleanUrls: /about.html redirects to /about
            self.send_response(308)
            self.send_header("Location", path[:-5] or "/")
            self.end_headers()
            return None
        # trailingSlash: false: /writing/ redirects to /writing (never a folder listing)
        if len(path) > 1 and path.endswith("/") and not os.path.isfile(os.path.join(self.translate_path(path), "index.html")):
            self.send_response(308)
            self.send_header("Location", path.rstrip("/"))
            self.end_headers()
            return None
        fs = self.translate_path(path)
        is_dir = os.path.isdir(fs) and not os.path.isfile(os.path.join(fs, "index.html"))
        if (not os.path.exists(fs) or is_dir) and not path.endswith("/") and os.path.isfile(fs + ".html"):
            self.path = path + ".html"
        return super().send_head()

    def send_error(self, code, message=None, explain=None):
        if code == 404 and os.path.isfile(os.path.join(ROOT, "404.html")):
            body = open(os.path.join(ROOT, "404.html"), "rb").read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"Serving {ROOT} at http://localhost:{port}")
    ThreadingHTTPServer(("", port), Handler).serve_forever()
