// Passcode gate for protected case studies. Runs in <head> so the page never flashes before it is covered.
// Note: this is a courtesy gate. It is client-side only and keeps casual visitors out, not determined ones.
(() => {
  const LOCKED = { 2: "CotonAI Modes", 3: "CotonAI Design System", 6: "CotonAI Agent" };
  const SLUGS = { "cotonai-modes": 2, "cotonai-design-system": 3, "cotonai-agent": 6 };
  const PASSCODE = "hello";
  const KEY = "samfolio-unlocked";
  const slug = location.pathname.replace(/\.html$/, "").split("/").filter(Boolean).pop();
  const id = SLUGS[slug] || parseInt(new URLSearchParams(location.search).get("case") || "1", 10);
  const read = () => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } };
  const write = () => { try { sessionStorage.setItem(KEY, "1"); } catch {} };
  if (!LOCKED[id] || read()) return;

  const root = document.documentElement;
  root.classList.add("is-gated");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Needlepoint cows ──
  const W = 19, H = 14;                       // sprite grid, in cells
  const PAL = { W: "#F6F5EF", K: "#1B1B1B", P: "#E9A0A6", H: "#C9C8C0" };
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

  // One cow as a grid of palette letters. mode: 0 / 1 = grazing (head bobbing), 2 = head up and smiling.
  function cowGrid(seed, mode) {
    const g = Array.from({ length: H }, () => Array(W).fill("."));
    const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c; };
    const r = rng(seed);
    for (let y = 5; y <= 9; y++) for (let x = 3; x <= 13; x++) if (!((y === 5 || y === 9) && (x === 3 || x === 13))) put(x, y, "W");
    for (const x of [4, 6, 11, 13]) { put(x, 10, "W"); put(x, 11, "W"); put(x, 12, "K"); }
    put(2, 5, "W"); put(2, 6, "W"); put(2, 7, "W"); put(1, 7, "K"); put(1, 8, "K");   // tail
    for (let n = 0; n < 4; n++) {                                                    // coat patches
      const cx = 4 + Math.floor(r() * 9), cy = 5 + Math.floor(r() * 4), rad = 1 + r() * 1.3;
      for (let y = 5; y <= 9; y++) for (let x = 3; x <= 13; x++) if (g[y][x] === "W" && (x - cx) ** 2 + ((y - cy) * 1.4) ** 2 < rad * rad * 1.6) put(x, y, "K");
    }
    if (mode < 2) {                                                                  // head down, grazing
      const dy = mode;
      put(13, 6, "W"); put(14, 6, "W"); put(14, 7 + dy, "W"); put(14, 8 + dy, "W");
      for (let y = 7 + dy; y <= 9 + dy; y++) for (let x = 15; x <= 16; x++) put(x, y, "W");
      put(15, 10 + dy, "P"); put(16, 10 + dy, "P"); put(15, 7 + dy, "K"); put(14, 6 + dy, "K");
    } else {                                                                         // head up, smiling
      for (const y of [3, 4, 5]) put(13, y, "W");                                    // neck
      put(14, 0, "K"); put(15, 0, "H");                                              // ear + horn
      for (let x = 14; x <= 17; x++) put(x, 1, "W");
      for (let x = 13; x <= 18; x++) put(x, 2, "W");
      put(15, 2, "K");                                                               // eye
      put(14, 3, "W"); put(15, 3, "W"); put(16, 3, "P"); put(17, 3, "P"); put(18, 3, "P");   // muzzle
      put(14, 4, "W"); put(15, 4, "K"); put(16, 4, "P"); put(17, 4, "P"); put(18, 4, "K");   // smile corners
      put(14, 5, "W"); put(15, 5, "W"); put(16, 5, "K"); put(17, 5, "K"); put(18, 5, "W");   // smile
    }
    return g;
  }

  // ── Build the overlay ──
  function build() {
    const gate = document.createElement("div");
    gate.className = "gate";
    gate.innerHTML = `
      <canvas class="gate__bg" aria-hidden="true"></canvas>
      <form class="gate__card" autocomplete="off">
        <p class="gate__label">Case study ${String(id).padStart(2, "0")} · ${LOCKED[id]}</p>
        <h1 class="gate__title">Passcode, please.</h1>
        <p class="gate__hint">This one is behind a passcode. Don't have it? Ask Sambit.</p>
        <div class="gate__field">
          <input class="gate__input" type="password" name="passcode" aria-label="Passcode" placeholder="Passcode" autocomplete="off" autocapitalize="off" spellcheck="false" />
          <button class="gate__btn" type="submit">Unlock</button>
        </div>
        <p class="gate__msg" role="status" aria-live="polite"></p>
        <a class="gate__back" href="/#work">← Back to work</a>
      </form>`;
    document.body.appendChild(gate);
    const canvas = gate.querySelector("canvas"), ctx = canvas.getContext("2d");
    const card = gate.querySelector(".gate__card"), input = gate.querySelector("input"), msg = gate.querySelector(".gate__msg");
    let cows = [], bg = null, dpr = 1, vw = 0, vh = 0, G = 5, happyAll = false, raf = 0;
    const ptr = { x: -999, y: -999 };

    // Pre-render one sprite: every cell becomes k×k cross-stitches
    function sprite(grid, k) {
      const s = G * k, c = document.createElement("canvas");
      c.width = W * s * dpr; c.height = H * s * dpr;
      const x = c.getContext("2d"); x.scale(dpr, dpr);
      for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) {
        const ch = grid[gy][gx]; if (ch === ".") continue;
        for (let sy = 0; sy < k; sy++) for (let sx = 0; sx < k; sx++) stitch(x, gx * s + sx * G, gy * s + sy * G, PAL[ch]);
      }
      return c;
    }
    function stitch(x, px, py, color) {
      x.fillStyle = color; x.fillRect(px, py, G, G);
      x.fillStyle = "rgb(255 255 255 / .22)"; x.fillRect(px, py, G - 1, 1); x.fillRect(px, py, 1, G - 1);
      x.fillStyle = "rgb(0 0 0 / .2)"; x.fillRect(px, py + G - 1, G, 1); x.fillRect(px + G - 1, py, 1, G);
    }

    function layout() {
      dpr = Math.min(2, window.devicePixelRatio || 1); vw = innerWidth; vh = innerHeight;
      G = vw < 600 ? 4 : 5;
      for (const c of [canvas]) { c.width = vw * dpr; c.height = vh * dpr; }
      // green canvas weave, drawn once
      bg = document.createElement("canvas"); bg.width = vw * dpr; bg.height = vh * dpr;
      const b = bg.getContext("2d"); b.scale(dpr, dpr);
      const r = rng(7), greens = ["#5b9733", "#559030", "#62a038", "#5a9532", "#4f8a2c"];
      for (let y = 0; y < vh; y += G) for (let x = 0; x < vw; x += G) stitch(b, x, y, greens[Math.floor(r() * greens.length)]);
      // herd: bigger cows lower down, like the canvas
      const rect = card.getBoundingClientRect(), pad = 30, r2 = rng(42), list = [];
      const target = vw < 600 ? 14 : 26;
      for (let tries = 0; tries < 900 && list.length < target; tries++) {
        const ny = Math.pow(r2(), 0.8), k = ny < 0.3 ? 1 : ny < 0.62 ? 2 : 3;
        const w = W * G * k, h = H * G * k, x = Math.round((r2() * (vw - w * 0.6) - w * 0.2) / G) * G, y = Math.round((ny * (vh - h * 0.7)) / G) * G;
        const cx = x + w / 2, cy = y + h / 2;
        if (x + w > rect.left - pad && x < rect.right + pad && y + h > rect.top - pad && y < rect.bottom + pad) continue;
        if (list.some((o) => Math.abs(o.cx - cx) < (o.w + w) * 0.42 && Math.abs(o.cy - cy) < (o.h + h) * 0.42)) continue;
        list.push({ x, y, w, h, cx, cy, k });
      }
      list.sort((a, b2) => a.y + a.h - (b2.y + b2.h));
      cows = list.map((c, i) => ({ ...c, phase: r2() * 1000, hap: 0, imgs: [0, 1, 2].map((m) => sprite(cowGrid(100 + i * 13, m), c.k)) }));
    }

    function frame(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const c of cows) {
        const near = happyAll || (ptr.x > c.x - 20 && ptr.x < c.x + c.w + 20 && ptr.y > c.y - 20 && ptr.y < c.y + c.h + 20);
        c.hap += ((near ? 1 : 0) - c.hap) * 0.25;
        const mode = c.hap > 0.5 ? 2 : (reduced ? 0 : Math.floor((t + c.phase) / 750) % 2);
        const lift = Math.round(c.hap * G * (c.k > 1 ? 1.5 : 1)) ;
        ctx.drawImage(c.imgs[mode], c.x, c.y - lift, c.w, c.h);
      }
      raf = requestAnimationFrame(frame);
    }

    layout(); raf = requestAnimationFrame(frame);
    let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
    addEventListener("pointermove", (e) => { ptr.x = e.clientX; ptr.y = e.clientY; }, { passive: true });
    addEventListener("pointerdown", (e) => { ptr.x = e.clientX; ptr.y = e.clientY; }, { passive: true });
    addEventListener("pointerleave", () => { ptr.x = ptr.y = -999; });

    card.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value.trim().toLowerCase() === PASSCODE) {
        write(); card.classList.remove("has-error"); msg.textContent = "";
        happyAll = true;                                   // the whole herd smiles
        setTimeout(() => {
          root.classList.remove("is-gated"); gate.classList.add("is-leaving");
          setTimeout(() => { cancelAnimationFrame(raf); gate.remove(); }, 600);
        }, reduced ? 0 : 650);
      } else {
        msg.textContent = "Not quite. The cows are keeping the secret.";
        card.classList.add("has-error"); card.classList.remove("is-shaking"); void card.offsetWidth; card.classList.add("is-shaking");
        input.select();
      }
    });
    setTimeout(() => input.focus({ preventScroll: true }), 50);
  }

  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
