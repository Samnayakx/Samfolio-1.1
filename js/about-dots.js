// About portrait: a photo made of dots. They fall into place on load and scatter from pointer motion, then spring back.
// After bruce-cao.com/#about. The motion is a spring per dot; nothing here is a copy of their code.
(() => {
  const cv = document.querySelector(".ab__dots");
  if (!cv) return;
  const host = cv.parentElement, ctx = cv.getContext("2d");
  const srcs = JSON.parse(cv.dataset.srcs || "[]"), focus = JSON.parse(cv.dataset.focus || "[]");
  const P = {
    gap: 4, size: 3, bleed: 100, radius: Number(cv.dataset.radius) || 8, maxDots: 90000,
    stiff: 170, damp: 9,                      // the spring that pulls every dot home
    stirR: 120, stirK: 12,                    // pointer stir: reach in px, and strength
    spread: 1200, stagger: 3000, fade: 250,   // entry: how far dots fall from, how long the fall takes to sweep down, fade-in
    swapMs: 700, scatter: 150, swirl: 1400, chaos: 700, // picture swap
  };
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ptr = { x: -1e5, y: -1e5, vx: 0, vy: 0, t: 0 };
  let imgs = [], cols = [], S = 0, W = 0, H = 0, CW = 0, CH = 0, dpr = 1;
  let x, y, vx, vy, hx, hy, delay, rot, from, to, str;
  let index = 0, swapT = 1e9, last = 0, t0 = 0, started = false, settled = false, vis = true, raf = 0, cooked = true;

  const load = (s) => new Promise((res) => { const i = new Image(); i.decoding = "async"; i.onload = () => res(i); i.onerror = () => res(null); i.src = s; });
  const inside = (px, py, w, h, r) => {
    const cx = px < r ? r : px > w - r ? w - r : px, cy = py < r ? r : py > h - r ? h - r : py;
    return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
  };
  const strings = (c) => { const a = new Array(S); for (let i = 0; i < S; i++) a[i] = `rgb(${c[i * 3]},${c[i * 3 + 1]},${c[i * 3 + 2]})`; return a; };

  // One colour per dot, sampled from the picture cropped to fill the frame
  const sample = (img, fy, g, nc, cells) => {
    const o = document.createElement("canvas"); o.width = W; o.height = H;
    const c = o.getContext("2d", { willReadFrequently: true });
    const sc = Math.max(W / img.naturalWidth, H / img.naturalHeight), dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    c.drawImage(img, (W - dw) / 2, (H - dh) * fy, dw, dh);
    const d = c.getImageData(0, 0, W, H).data, out = new Uint8ClampedArray(S * 3);
    for (let i = 0; i < S; i++) {
      const cx = cells[i] % nc, cy = (cells[i] / nc) | 0, p = (Math.min(((cy * g + g / 2) | 0), H - 1) * W + Math.min(((cx * g + g / 2) | 0), W - 1)) * 4;
      out[i * 3] = d[p]; out[i * 3 + 1] = d[p + 1]; out[i * 3 + 2] = d[p + 2];
    }
    return out;
  };

  function build() {
    const r = host.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height);
    if (!W || !H || !imgs[0]) return;
    dpr = innerWidth < 768 ? 1 : Math.min(2, devicePixelRatio || 1);
    const b = P.bleed; CW = W + 2 * b; CH = H + 2 * b;
    cv.width = Math.round(CW * dpr); cv.height = Math.round(CH * dpr);
    cv.style.width = CW + "px"; cv.style.height = CH + "px"; cv.style.left = -b + "px"; cv.style.top = -b + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let g = P.gap; while (Math.ceil(W / g) * Math.ceil(H / g) > P.maxDots) g++;
    const nc = Math.floor(W / g), nr = Math.floor(H / g), cells = [];
    for (let j = 0; j < nr; j++) for (let i = 0; i < nc; i++) if (inside(i * g + g / 2, j * g + g / 2, W, H, P.radius)) cells.push(j * nc + i);
    S = cells.length;
    x = new Float32Array(S); y = new Float32Array(S); vx = new Float32Array(S); vy = new Float32Array(S);
    hx = new Float32Array(S); hy = new Float32Array(S); delay = new Float32Array(S); rot = new Float32Array(S);
    cols = imgs.map((im, k) => (im ? sample(im, focus[k] ?? 0.5, g, nc, cells) : null));
    cols = cols.map((c) => c || cols[0]);
    index = Math.min(index, cols.length - 1); to = cols[index]; from = new Uint8ClampedArray(to); str = strings(to); cooked = true; swapT = 1e9;
    const still = reduce();
    for (let i = 0; i < S; i++) {
      const cx = cells[i] % nc, cy = (cells[i] / nc) | 0;
      hx[i] = cx * g + g / 2 + b; hy[i] = cy * g + g / 2 + b;
      rot[i] = (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.6);
      if (still) { x[i] = hx[i]; y[i] = hy[i]; delay[i] = 0; continue; }
      x[i] = hx[i] + (Math.random() - 0.5) * P.spread * 0.15;
      y[i] = hy[i] - P.spread * (0.5 + Math.random() * 0.5);
      delay[i] = (nr > 1 ? cy / (nr - 1) : 0) * P.stagger * 0.85 + Math.random() * P.stagger * 0.15;
    }
    started = still; settled = false; t0 = 0;
    if (still) draw(0, 0, 1e9);
  }

  // Draws one frame. Returns the fastest dot's speed, so the loop can go idle once everything has come to rest.
  function draw(dt, elapsed, swapAt) {
    ctx.clearRect(0, 0, CW, CH);
    const swapping = swapAt < P.swapMs, u = swapping ? swapAt / P.swapMs : 1, ease = 1 - (1 - u) ** 3, me = swapping ? (1 - u) ** 2 : 0;
    const sw = P.swirl * me, ch = P.chaos * me, mx = CW / 2, my = CH / 2, tm = performance.now() * 0.004;
    const stir = Math.abs(ptr.vx) + Math.abs(ptr.vy) > 1, R2 = P.stirR * P.stirR, K = P.stirK * dt, rad = P.size / 2;
    let fastest = 0, allIn = true;
    for (let i = 0; i < S; i++) {
      if (!started && elapsed < delay[i]) { allIn = false; continue; }
      if (dt) {
        vx[i] += (P.stiff * (hx[i] - x[i]) - P.damp * vx[i]) * dt;
        vy[i] += (P.stiff * (hy[i] - y[i]) - P.damp * vy[i]) * dt;
        if (swapping) {
          const dx = x[i] - mx, dy = y[i] - my, d = Math.hypot(dx, dy) || 1;
          vx[i] += (-dy / d) * sw * rot[i] * dt + Math.sin(hy[i] * 0.035 + tm) * ch * dt;
          vy[i] += (dx / d) * sw * rot[i] * dt + Math.cos(hx[i] * 0.035 + tm) * ch * dt;
        }
        if (stir) {
          const dx = x[i] - ptr.x, dy = y[i] - ptr.y, d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1, f = K * (1 - d / P.stirR), push = Math.abs(ptr.vx + ptr.vy) * f * 0.35;
            vx[i] += ptr.vx * f + (dx / d) * push; vy[i] += ptr.vy * f + (dy / d) * push;
          }
        }
        x[i] += vx[i] * dt; y[i] += vy[i] * dt;
        const sp = Math.abs(vx[i]) + Math.abs(vy[i]); if (sp > fastest) fastest = sp;
      }
      if (swapping) ctx.fillStyle = `rgb(${(from[i * 3] + (to[i * 3] - from[i * 3]) * ease) | 0},${(from[i * 3 + 1] + (to[i * 3 + 1] - from[i * 3 + 1]) * ease) | 0},${(from[i * 3 + 2] + (to[i * 3 + 2] - from[i * 3 + 2]) * ease) | 0})`;
      else ctx.fillStyle = str[i];
      let a = 1;
      if (!started) { a = Math.min((elapsed - delay[i]) / P.fade, 1); if (a < 1) allIn = false; }
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(x[i], y[i], rad, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!started && allIn) started = true;
    return fastest;
  }

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (!vis || document.hidden || !S) { last = ts; return; }
    if (!t0) { t0 = ts; last = ts; }
    const dt = Math.min((ts - last) / 1000, 1 / 30); last = ts;
    const k = Math.exp(-5 * dt); ptr.vx *= k; ptr.vy *= k;
    swapT += dt * 1000;
    if (swapT >= P.swapMs && !cooked) { from = new Uint8ClampedArray(to); str = strings(to); cooked = true; }
    const stir = Math.abs(ptr.vx) + Math.abs(ptr.vy) > 1, swapping = swapT < P.swapMs;
    if (settled && !stir && !swapping) return;
    const fastest = draw(dt, ts - t0, swapT);
    settled = started && !stir && !swapping && fastest < 0.6;
  }

  addEventListener("pointermove", (e) => {
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, now = performance.now(), dt = (now - ptr.t) / 1000;
    if (ptr.t && dt > 0 && dt < 0.2) { ptr.vx = ptr.vx * 0.5 + ((px - ptr.x) / dt) * 0.5; ptr.vy = ptr.vy * 0.5 + ((py - ptr.y) / dt) * 0.5; }
    ptr.x = px; ptr.y = py; ptr.t = now; settled = false;
  }, { passive: true });
  addEventListener("blur", () => { ptr.vx = 0; ptr.vy = 0; ptr.t = 0; });

  new IntersectionObserver(([e]) => { vis = e.isIntersecting; settled = false; }, { threshold: 0 }).observe(host);
  let rz = 0;
  new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(() => { if (imgs[0] && (host.clientWidth !== W || host.clientHeight !== H)) build(); }, 150); }).observe(host);
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => imgs[0] && build());
  Promise.all(srcs.map(load)).then((r) => { imgs = r; build(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); host.classList.add("is-ready"); });
})();
