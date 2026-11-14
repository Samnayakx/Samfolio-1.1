/* Hero HUD: a flight-style instrument panel behind the headline (bracketed side panels, horizontal scales with a heavy bar,
   a central crosshair, a compass tape, small boxed tags). One canvas, one colour, small type only.
   The fixed linework is drawn once into an offscreen layer; each frame blits it and animates the live parts: scales that scroll,
   a compass tape, markers that slide, a ring that pulses from the crosshair, and readouts that change.
   The artwork is laid out in the coordinates of a 1280 x 675 reference grid and scaled to cover the hero. */
(() => {
  const host = document.querySelector(".hero__hud");
  if (!host) return;
  const canvas = document.createElement("canvas");
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const TAU = Math.PI * 2, K = 1.25;                 // reference grid to design space
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1, S = 1, ink = "134,227,200", off = null, raf = 0, visible = true, t0 = performance.now();
  const d = { l: [], r: [], a: "1.12 112.00", b: "0.87 044.00", at: 0 };

  // grid point to screen
  const X = (x) => W / 2 + (x - 640) * K * S, Y = (y) => H / 2 + (y - 337) * K * S, U = (v) => v * K * S;
  const m = (x) => 1280 - x;                         // mirror across the centre line
  const rgba = (a) => `rgba(${ink},${a})`;
  const mono = (px, w = 400) => `${w} ${Math.max(6, px * K * S)}px "Geist Mono", ui-monospace, Menlo, Consolas, monospace`;

  function L(c, x1, y1, x2, y2, a = .6, lw = 1, dash) { c.strokeStyle = rgba(a); c.lineWidth = lw; c.setLineDash(dash || []); c.beginPath(); c.moveTo(X(x1), Y(y1)); c.lineTo(X(x2), Y(y2)); c.stroke(); c.setLineDash([]); }
  function P(c, pts, a = .6, lw = 1, close = false) { c.strokeStyle = rgba(a); c.lineWidth = lw; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y)))); if (close) c.closePath(); c.stroke(); }
  function B(c, x, y, w, h, a = .6, lw = 1) { c.strokeStyle = rgba(a); c.lineWidth = lw; c.strokeRect(X(x), Y(y), U(w), U(h)); }
  function F(c, x, y, w, h, a = .8) { c.fillStyle = rgba(a); c.fillRect(X(x), Y(y), U(w), U(h)); }
  function T(c, s, x, y, px = 6, a = .7, align = "left", w = 400) { c.font = mono(px, w); c.textAlign = align; c.fillStyle = rgba(a); if ("letterSpacing" in c) c.letterSpacing = ".5px"; c.fillText(s, X(x), Y(y)); }
  function dot(c, x, y, r = 1, a = .8) { c.fillStyle = rgba(a); c.beginPath(); c.arc(X(x), Y(y), Math.max(.8, r * K * S), 0, TAU); c.fill(); }
  function tri(c, x, y, s, up, a = .85) { P(c, up ? [[x - s, y + s], [x, y - s], [x + s, y + s]] : [[x - s, y - s], [x, y + s], [x + s, y - s]], a, 1, true); }

  /* ── the fixed layer ── */
  function drawStatic(c) {
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    [false, true].forEach((mir) => {
      const x = (v) => (mir ? m(v) : v), dir = mir ? -1 : 1;
      // outer bracket and the inner pair of stepped brackets
      P(c, [[x(166), 211], [x(152), 211], [x(152), 463], [x(166), 463]], .75, 1.2);
      L(c, x(265), 211, x(291), 211, .7, 1); L(c, x(265), 463, x(291), 463, .7, 1); L(c, x(291), 211, x(291), 214, .7, 1); L(c, x(291), 463, x(291), 460, .7, 1);
      [228, 265, 409, 446].forEach((y) => dot(c, x(265), y, .7, .6));
      T(c, "+ 20", x(266), 201, 6, .7, mir ? "right" : "left"); T(c, "- 20", x(266), 474, 6, .7, mir ? "right" : "left");
      // the short bracket beside the bar
      L(c, x(355), 265, x(381), 265, .7, 1); L(c, x(355), 409, x(381), 409, .7, 1); L(c, x(355), 302, x(361), 302, .6, 1); L(c, x(355), 372, x(361), 372, .6, 1);
      T(c, mir ? "10 +" : "+ 10", x(356), 255, 6, .7, mir ? "right" : "left"); T(c, "- 10", x(356), 423, 6, .7, mir ? "right" : "left");
      // data box with a gap where the bar runs through
      L(c, x(393), 211, x(507), 211, .8, 1); L(c, x(393), 463, x(507), 463, .8, 1); L(c, x(393), 211, x(393), 301, .8, 1); L(c, x(393), 372, x(393), 463, .8, 1);
      [253, 265, 277, 289, 301, 372, 384, 396, 408, 420].forEach((y) => L(c, x(393), y, x(398), y, .5, 1));
      L(c, x(507), 237, x(507), 242, .6, 1); L(c, x(507), 432, x(507), 437, .6, 1); L(c, x(481), 337, x(507), 337, .6, 1);
      // the heavy bar, and its end cap
      L(c, x(152), 337, x(380), 337, .95, 2.6); L(c, x(380), 331, x(380), 343, .9, 1.2);
      // bottom strip
      L(c, x(393), 541, x(507), 541, .7, 1); L(c, x(393), 533, x(393), 541, .7, 1); L(c, x(507), 533, x(507), 541, .7, 1);
      // corner marks and tags
      L(c, x(63), 80, x(70), 80, .5, 1); L(c, x(63), 593, x(70), 593, .5, 1);
      T(c, "×", x(395), 83, 7, .6, "center"); T(c, "×", x(395), 596, 7, .6, "center");
      T(c, mir ? "GS R" : "GS L", x(273), 83, 6, .55, "center"); T(c, mir ? "GS R" : "GS L", x(273), 596, 6, .55, "center");
      T(c, mir ? "A2" : "A1", x(397), 137, 6, .6, mir ? "right" : "left"); T(c, mir ? "A4" : "A3", x(397), 536, 6, .6, mir ? "right" : "left");
      T(c, mir ? "26500" : "1400", x(118), 137, 6, .45, "center"); T(c, mir ? "STD" : "2300", x(118), 536, 6, .45, "center");
      T(c, mir ? "▫ 250" : "250 ▫", x(273), 137, 5.5, .5, "center"); T(c, mir ? "▫ 300" : "300 ▫", x(273), 145, 5.5, .5, "center");
      T(c, mir ? "- 500" : "500 -", x(273), 536, 5.5, .5, "center"); T(c, mir ? "- 550" : "550 -", x(273), 544, 5.5, .5, "center");
      T(c, mir ? "ALT" : "FMC", x(463), 597, 6, .55, "center");
      // altitude column: end arrow, marker dot, dash
      P(c, [[x(144), 334], [x(139), 337], [x(144), 340]], .7, 1);
      dot(c, x(125), 271, 1.1, .8); L(c, x(122), 403, x(128), 403, .6, 1);
    });
    // centre crosshair
    L(c, 640, 211, 640, 237, .85, 1.2); L(c, 640, 437, 640, 463, .85, 1.2);
    L(c, 608, 337, 630, 337, .85, 1.2); L(c, 650, 337, 672, 337, .85, 1.2);
    L(c, 640, 306, 640, 326, .6, 1); L(c, 640, 348, 640, 368, .6, 1);
    // top: coordinate box, compass ends
    B(c, 590, 74, 98, 15, .85, 1);
    L(c, 576, 131, 576, 144, .7, 1); L(c, 703, 131, 703, 144, .7, 1); L(c, 576, 144, 703, 144, .35, 1);
    T(c, "W ◂", 457, 137, 6, .6); T(c, "E ▸", 815, 137, 6, .6); L(c, 456, 143, 467, 143, .5, 1.4); L(c, 815, 143, 826, 143, .5, 1.4);
    // bottom: scale strip and tag
    for (let i = 0; i <= 8; i++) L(c, 576 + i * 15.9, 530, 576 + i * 15.9, 541, .55, 1);
    L(c, 576, 541, 703, 541, .6, 1);
    ["0.0", "1.0", "2.0", "3.0", "4.0", "5.0", "6.0", "7.0"].forEach((s, i) => T(c, s, 578 + i * 17.8, 530, 5, .5, "center"));
    T(c, "LOW", 557, 536, 5.5, .55, "center"); T(c, "HIGH", 720, 536, 5.5, .55, "center");
    B(c, 621, 589, 38, 12, .85, 1); T(c, "VOR/LOC", 640, 598, 6, .85, "center");
  }

  /* ── readouts that change ── */
  const dg = (n) => String(Math.floor(Math.random() * 10 ** n)).padStart(n, "0");
  function refresh() {
    d.l = [`${dg(1)}.${dg(2)}  ${dg(3)}.${dg(2)}`, `0.${dg(2)}  ${dg(3)}.${dg(2)}`, `1.${dg(2)}  ${dg(3)}.${dg(2)}`, `${dg(1)}.${dg(2)}  ${dg(3)}.${dg(2)}`];
    d.r = [`${dg(1)}.${dg(2)}  ${dg(3)}.${dg(2)}`, `${dg(1)}.${dg(2)}  ${dg(3)}.${dg(2)}`, `0.${dg(2)}  ${dg(3)}.${dg(2)}`, `1.${dg(2)}  ${dg(3)}.${dg(2)}`];
    d.a = `1.${dg(2)} ${dg(3)}.${dg(2)}`; d.b = `0.${dg(2)} ${dg(3)}.${dg(2)}`;
  }
  const POINTS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  /* ── the live layer ── */
  function live(c, t) {
    // scrolling scales, left and right of the bar
    [false, true].forEach((mir) => {
      const x = (v) => (mir ? m(v) : v), sp = 31, o = (t * 7) % sp, base = Math.floor(t * 7 / sp);
      c.save(); c.beginPath(); c.rect(Math.min(X(x(165)), X(x(378))), Y(320), Math.abs(X(378) - X(165)), U(40)); c.clip();
      for (let i = -1; i <= 8; i++) {
        const px = 165 + i * sp + o, idx = i - base, edge = Math.min(1, (px - 165) / 24, (378 - px) / 24); if (edge <= 0) continue;
        L(c, x(px), 328, x(px), 334, .7 * edge, 1);
        const v = 10 * ((((mir ? -idx : idx) % 6) + 6) % 6 + 1);
        T(c, String(mir ? v : 70 - v), x(px), 349, 5.5, .7 * edge, "center");
      }
      c.restore();
      // sliding pointer above the bar
      const px = 265 + 38 * Math.sin(t * .35 + (mir ? 1.3 : 0)); tri(c, x(px), 326, 2.6, false, .9);
      // a dot moving up and down the inner bracket
      dot(c, x(265), 337 + 100 * Math.sin(t * .5 + (mir ? 2 : 0)), 1.2, .9);
    });
    // labels that change state
    const s = Math.floor(t / 4) % 2, blink = (t % 4) < .25 ? .3 : .95;
    T(c, s ? "TRACK" : "TARGET", 414, 340, 6.5, blink, "center", 500); T(c, s ? "SYNC" : "LOCKED", 851, 340, 6.5, blink, "center", 500);
    // altitude and side values, drifting
    const alt = 1400 + Math.round(60 * Math.sin(t * .21) / 10) * 10, dw = 26500 + Math.round(120 * Math.sin(t * .17 + 1) / 10) * 10;
    T(c, "ALT " + alt, 128, 340, 7.5, .9, "right", 500); T(c, dw + " DW", 1153, 340, 7.5, .9, "left", 500);
    T(c, String(alt + 100), 118, 306, 6, .6, "center"); T(c, String(alt - 100), 118, 375, 6, .6, "center");
    T(c, String(dw + 1000), 1166, 306, 6, .6, "center"); T(c, String(dw + 39000 - 1000 + Math.round(t) % 7), 1166, 375, 6, .6, "center");
    // coordinate box and compass tape
    const mi = 61 + Math.floor(t / 3) % 9, mo = 79 + Math.floor(t / 5) % 9;
    T(c, `63°${mi}′N  24°${mo}′E`, 639, 85, 6.5, .95, "center");
    c.save(); c.beginPath(); c.rect(X(576), Y(128), U(127), U(18)); c.clip();
    const so = (t * 4) % 8; for (let i = -1; i <= 17; i++) { const px = 576 + i * 8 + so, edge = Math.min(1, (px - 576) / 14, (703 - px) / 14); if (edge > 0) L(c, px, 133, px, i % 4 ? 138 : 141, .65 * edge, 1); }
    c.restore();
    const hd = (t * 6) % 360; B(c, 634, 130, 12, 12, .9, 1); T(c, POINTS[Math.round(hd / 45) % 8], 640, 139.5, 5.5, .95, "center", 500); tri(c, 640, 147, 1.8, true, .8);
    // data blocks
    if (performance.now() - d.at > 520) { refresh(); d.at = performance.now(); }
    d.l.forEach((q, i) => T(c, q, 408, [227, 239, 435, 447][i], 5.8, .8)); d.r.forEach((q, i) => T(c, q, 835, [227, 239, 435, 447][i], 5.8, .8));
    T(c, d.a, 456, 538, 5.5, .7, "center"); T(c, d.b, 819, 538, 5.5, .7, "center");
    // bottom marker sliding along the LOW to HIGH strip
    tri(c, 576 + 127 * (.5 + .45 * Math.sin(t * .4)), 521, 2.2, false, .9);
    // crosshair: the centre dot blinks, the gap breathes, and a ring pulses out
    dot(c, 640, 337, 1.5, (t % 1.4) < .9 ? .95 : .3);
    const u = (t % 5) / 5; c.strokeStyle = rgba((1 - u) * .45); c.lineWidth = 1; c.beginPath(); c.arc(X(640), Y(337), U(14 + u * 110), 0, TAU); c.stroke();
  }

  /* ── frame loop ── */
  function frame(now) { raf = 0; const t = (now - t0) / 1000; paint(reduce() ? 0 : t); schedule(); }
  function paint(t) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.drawImage(off, 0, 0, W, H); live(ctx, t); }
  function schedule() { if (!raf && visible && !document.hidden && !reduce()) raf = requestAnimationFrame(frame); }
  function layout() {
    const r = host.getBoundingClientRect(); W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = W * dpr; canvas.height = H * dpr;
    S = Math.max(W / 1600, H / 900);
    const v = getComputedStyle(host).getPropertyValue("--hud-ink").trim() || "#86E3C8", n = parseInt(v.replace("#", ""), 16); ink = `${n >> 16},${(n >> 8) & 255},${n & 255}`;
    off = document.createElement("canvas"); off.width = W * dpr; off.height = H * dpr; drawStatic(off.getContext("2d"));
    refresh(); cancelAnimationFrame(raf); raf = 0; if (reduce()) paint(0); else schedule();
  }
  layout();
  new ResizeObserver(layout).observe(host);
  new MutationObserver(layout).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }, { threshold: 0 }).observe(host);
  document.addEventListener("visibilitychange", schedule);
  addEventListener("motionchange", layout);
})();
