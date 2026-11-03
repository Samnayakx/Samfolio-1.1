// Playground: live interaction studies and the tile overlay.
// Each demo is built at a fixed design size and scaled to fit its stage, so it reads the same in a tile and in the overlay.
// Demos take { auto } — in a tile they play a scripted loop; in the overlay they are fully interactive.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const motionOff = () => (window.motionReduced ? window.motionReduced() : matchMedia("(prefers-reduced-motion: reduce)").matches);
  const reduce = motionOff();
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Scale a fixed-size canvas to fit its stage; returns a getter for the current scale (pointer maths needs it)
  function fit(stage, canvas, w, hgt, pad = 0.86, max = Infinity) {
    let s = 1;
    const ro = new ResizeObserver(() => {
      const r = stage.getBoundingClientRect();
      s = Math.min(max, (r.width * pad) / w, (r.height * pad) / hgt);
      canvas.style.transform = `translate(-50%, -50%) scale(${s})`;
    });
    canvas.style.width = `${w}px`; canvas.style.height = `${hgt}px`;
    ro.observe(stage);
    return { scale: () => s, stop: () => ro.disconnect() };
  }

  // Runs a loop only while the element is on screen
  // ...and only while the tab is shown and motion isn't paused (the header's Pause motion switch applies live)
  function whileVisible(node, start) {
    let stop = null, visible = false;
    const sync = () => {
      const run = visible && !document.hidden && !motionOff();
      if (run && !stop) stop = start();
      else if (!run && stop) { stop(); stop = null; }
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.2 });
    io.observe(node);
    document.addEventListener("visibilitychange", sync);
    addEventListener("motionchange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); removeEventListener("motionchange", sync); stop && stop(); stop = null; };
  }

  const ICON = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="11" cy="11" r="7.6"/><path d="M16.6 16.6 21 21"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 2.5c.5 3.9 2.6 6 6.5 6.5-3.9.5-6 2.6-6.5 6.5-.5-3.9-2.6-6-6.5-6.5 3.9-.5 6-2.6 6.5-6.5Z"/><path d="M17.5 12.5c.3 2.2 1.5 3.4 3.7 3.7-2.2.3-3.4 1.5-3.7 3.7-.3-2.2-1.5-3.4-3.7-3.7 2.2-.3 3.4-1.5 3.7-3.7Z"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>',
  };

  // ── 02 · Bounding box (after Azlen, @azlenelza) ──
  function boundingBox(stage, { auto }) {
    const W = 520, H = 340;
    const c = h("div", "ix ix-bb");
    c.innerHTML = `<div class="bb__zoom"><div class="bb__box">
      <span class="bb__mid"></span>
      ${["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((d) => `<span class="bb__h" data-d="${d}"><i></i></span>`).join("")}
      <span class="bb__dim bb__dim--w"><b class="bb__eq">=</b><input inputmode="numeric" aria-label="Width" /></span>
      <span class="bb__dim bb__dim--h"><b class="bb__eq">=</b><input inputmode="numeric" aria-label="Height" /></span>
    </div></div>`;
    stage.appendChild(c);
    const f = fit(stage, c, W, H, 0.92);
    const zoom = c.querySelector(".bb__zoom"), box = c.querySelector(".bb__box");
    const dimW = c.querySelector(".bb__dim--w"), dimH = c.querySelector(".bb__dim--h");
    const inW = dimW.querySelector("input"), inH = dimH.querySelector("input");
    const r = { x: 140, y: 90, w: 240, h: 160 };
    const MIN = 40;
    const draw = () => {
      Object.assign(box.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
      if (document.activeElement !== inW) inW.value = Math.round(r.w);
      if (document.activeElement !== inH) inH.value = Math.round(r.h);
      inW.style.width = `${String(inW.value).length + 0.4}ch`; inH.style.width = `${String(inH.value).length + 0.4}ch`;
    };
    draw();

    // Intro: start tight on the bottom-right corner, then pull back to the whole box
    const intro = () => {
      c.classList.add("is-intro"); c.classList.remove("is-ready");
      zoom.style.transition = "none";
      zoom.style.transformOrigin = `${r.x + r.w}px ${r.y + r.h}px`;
      zoom.style.transform = "scale(3.2)";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        zoom.style.transition = ""; zoom.style.transform = "scale(1)";
        setTimeout(() => { c.classList.remove("is-intro"); c.classList.add("is-ready"); }, 950);
      }));
    };
    reduce ? c.classList.add("is-ready") : intro();

    // Drag a handle: corners move both edges, mids move one
    let drag = null;
    const apply = (d, dx, dy, s0) => {
      let { x, y, w, h: hh } = s0;
      if (d.includes("e")) w = Math.max(MIN, s0.w + dx);
      if (d.includes("s")) hh = Math.max(MIN, s0.h + dy);
      if (d.includes("w")) { w = Math.max(MIN, s0.w - dx); x = s0.x + s0.w - w; }
      if (d.includes("n")) { hh = Math.max(MIN, s0.h - dy); y = s0.y + s0.h - hh; }
      Object.assign(r, { x, y, w, h: hh });
      draw();
    };
    const showDims = (d) => {
      c.dataset.drag = d;
      dimW.classList.toggle("on", d !== "n" && d !== "s");
      dimH.classList.toggle("on", d !== "e" && d !== "w");
    };
    c.querySelectorAll(".bb__h").forEach((hd) => {
      hd.addEventListener("pointerdown", (e) => {
        if (auto) return;
        e.preventDefault(); hd.setPointerCapture(e.pointerId);
        drag = { d: hd.dataset.d, sx: e.clientX, sy: e.clientY, s0: { ...r }, el: hd };
        hd.classList.add("is-active"); showDims(drag.d); c.classList.add("is-dragging");
      });
      hd.addEventListener("pointermove", (e) => {
        if (!drag || drag.el !== hd) return;
        const s = f.scale();
        apply(drag.d, (e.clientX - drag.sx) / s, (e.clientY - drag.sy) / s, drag.s0);
      });
      const end = () => { if (!drag) return; drag.el.classList.remove("is-active"); c.classList.remove("is-dragging"); drag = null; };
      hd.addEventListener("pointerup", end); hd.addEventListener("pointercancel", end);
    });

    // Readouts stay after a drag; hover turns one into a field you can type a value into
    const commit = (input, key) => {
      const v = parseInt(input.value, 10);
      if (Number.isFinite(v)) {
        const max = key === "w" ? W - r.x - 10 : H - r.y - 10;
        box.classList.add("is-tween"); r[key] = clamp(v, MIN, max); draw();
        setTimeout(() => box.classList.remove("is-tween"), 380);
      }
      draw();
    };
    [[inW, "w"], [inH, "h"]].forEach(([input, key]) => {
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") { commit(input, key); input.blur(); } if (e.key === "Escape") { e.stopPropagation(); input.blur(); draw(); } });
      input.addEventListener("blur", () => commit(input, key));
      input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, "").slice(0, 3); input.style.width = `${input.value.length + 0.4}ch`; });
    });
    c.addEventListener("pointerleave", () => { if (!drag && !c.contains(document.activeElement)) { dimW.classList.remove("on"); dimH.classList.remove("on"); } });

    // Tile loop: replay the intro, then a scripted corner drag and an edge drag
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(c, () => {
      let on = true;
      const tween = (d, to, ms) => new Promise((res) => {
        const s0 = { ...r }, t0 = performance.now(), el = c.querySelector(`.bb__h[data-d="${d}"]`);
        el.classList.add("is-active"); showDims(d); c.classList.add("is-dragging");
        const step = (t) => {
          if (!on) return res();
          const k = clamp((t - t0) / ms, 0, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          apply(d, to.dx * e, to.dy * e, s0);
          k < 1 ? requestAnimationFrame(step) : (el.classList.remove("is-active"), c.classList.remove("is-dragging"), res());
        };
        requestAnimationFrame(step);
      });
      (async () => {
        while (on) {
          Object.assign(r, { x: 140, y: 90, w: 240, h: 160 }); draw(); dimW.classList.remove("on"); dimH.classList.remove("on");
          intro(); await wait(1500); if (!on) break;
          await tween("se", { dx: 100, dy: 70 }, 1100); await wait(500); if (!on) break;
          await tween("e", { dx: -110, dy: 0 }, 900); await wait(500); if (!on) break;
          await tween("se", { dx: 50, dy: -60 }, 800); await wait(1300);
        }
      })();
      return () => { on = false; };
    });
    return () => { f.stop(); stopLoop && stopLoop(); };
  }

  // ── 03 · Segmented navigation (after Till Janek, @tilljanek) ──
  function segmentedNav(stage, { auto }) {
    const N = 10;
    const c = h("div", "ix ix-sn");
    const bar = h("nav", "sn__bar"); bar.setAttribute("aria-label", "Segmented navigation demo");
    const ticks = Array.from({ length: N }, (_, i) => {
      const a = h("a", "sn__t"); a.href = "#"; a.setAttribute("aria-label", `Link ${i + 1}`);
      a.appendChild(h("span", "sn__l", `LINK ${i + 1}`));
      a.addEventListener("click", (e) => e.preventDefault());
      a.addEventListener("focus", () => { hover = true; active = i; });
      a.addEventListener("blur", () => { hover = false; });
      bar.appendChild(a);
      return { el: a, label: a.firstChild, w: 3, h: 12, c: 72, r: 1.5, o: 0 };
    });
    c.appendChild(bar); stage.appendChild(c);
    const f = fit(stage, c, 520, 200, 0.95);
    let hover = false, active = -1, px = null, padY = 8, padX = 18, raf = 0, last = performance.now();
    const target = (i) => {
      if (!hover || active < 0) return { w: 3, h: 12, c: 72, r: 1.5, o: 0 };
      const d = Math.abs(i - active);
      if (d === 0) return { w: 64, h: 30, c: 255, r: 8, o: 1 };
      if (d === 1) return { w: 6, h: 22, c: 205, r: 3, o: 0 };
      if (d === 2) return { w: 5, h: 18, c: 150, r: 2.5, o: 0 };
      return { w: 4, h: 14, c: 82, r: 2, o: 0 };
    };
    const pick = () => {
      if (px == null) return;
      let best = 0, bd = Infinity;
      ticks.forEach((t, i) => { const b = t.el.getBoundingClientRect(), d = Math.abs(px - (b.left + b.width / 2)); if (d < bd) { bd = d; best = i; } });
      active = best;
    };
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const k = 1 - Math.exp(-dt * 16);
      pick();
      ticks.forEach((t, i) => {
        const g = target(i), pw = t.w;
        t.w += (g.w - t.w) * k; t.h += (g.h - t.h) * k; t.c += (g.c - t.c) * k; t.r += (g.r - t.r) * k; t.o += (g.o - t.o) * (1 - Math.exp(-dt * 22));
        const v = Math.abs(t.w - pw) / Math.max(dt, 0.001);
        const cc = Math.round(t.c);
        t.el.style.cssText = `width:${t.w}px;height:${t.h}px;border-radius:${t.r}px;background:rgb(${cc},${cc},${cc});filter:blur(${Math.min(2.5, v / 260).toFixed(2)}px)`;
        t.label.style.opacity = clamp((t.w - 40) / 24, 0, 1) * t.o;
      });
      const py = hover ? 11 : 8, pxp = hover ? 22 : 18;
      padY += (py - padY) * k; padX += (pxp - padX) * k;
      bar.style.padding = `${padY}px ${padX}px`;
      bar.style.gap = `${hover ? 11 : 9}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    bar.addEventListener("pointerenter", () => { hover = true; });
    bar.addEventListener("pointermove", (e) => { hover = true; px = e.clientX; });
    bar.addEventListener("pointerleave", () => { hover = false; px = null; active = -1; });

    // Tile loop: a cursor that drifts across the bar, pauses, and leaves
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(c, () => {
      let on = true, real = false;
      const enter = () => (real = true), leave = () => (real = false);
      bar.addEventListener("pointerenter", enter); bar.addEventListener("pointerleave", leave);
      (async () => {
        const path = [3, 3, 6, 9, 9, 5, 0, 0, 4, 4];
        while (on) {
          await wait(900);
          for (const i of path) { if (!on || real) break; hover = true; const b = ticks[i].el.getBoundingClientRect(); px = b.left + b.width / 2; await wait(480); }
          if (!real) { hover = false; px = null; active = -1; }
          await wait(1400);
        }
      })();
      return () => { on = false; bar.removeEventListener("pointerenter", enter); bar.removeEventListener("pointerleave", leave); };
    });
    return () => { cancelAnimationFrame(raf); f.stop(); stopLoop && stopLoop(); };
  }

  // ── 04 · Clouds that wiggle (after Oğuz Yağız Kara, @oguzyagizkara) ──
  let cloudSeq = 0;
  function cloudSVG() {
    const id = `cw${++cloudSeq}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "150 120 970 480");
    svg.setAttribute("class", "cw__cloud");
    svg.innerHTML = `
      <defs><filter id="${id}" x="-15%" y="-25%" width="130%" height="150%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="1" seed="1" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/>
      </filter></defs>
      <g class="cw__g">
        <path fill="#F5592A" d="M203 557C195 440 270 390 348 395C345 300 440 255 497 295C560 140 810 120 876 318C860 360 852 425 770 428L448 437C436 438 436 450 448 450L765 460C795 462 812 480 806 520L797 557Z"/>
        <path fill="#FCA00F" d="M815 557L828 520C845 470 880 455 940 452L980 449C992 448 992 436 980 436L935 434C890 432 868 405 882 348L890 327C1000 325 1085 430 1043 557Z"/>
      </g>`;
    svg.dataset.f = id;
    return { svg, g: svg.querySelector(".cw__g"), turb: svg.querySelector("feTurbulence"), disp: svg.querySelector("feDisplacementMap") };
  }
  function clouds(stage, { auto }) {
    const c = h("div", "ix ix-cw");
    const grid = h("div", "cw__grid");
    const sizes = ["sm", "sm", "md", "md", "lg", "lg"];
    const items = sizes.map((s) => {
      const cell = h("div", `cw__cell cw__cell--${s}`), cl = cloudSVG();
      cell.appendChild(cl.svg); grid.appendChild(cell);
      const it = { cell, ...cl, t0: -1, raf: 0 };
      cell.addEventListener("pointerenter", () => wiggle(it));
      return it;
    });
    c.appendChild(grid); stage.appendChild(c);
    const f = fit(stage, c, 520, 480, 0.9);
    function wiggle(it) {
      if (reduce) return;
      if (it.t0 >= 0 && performance.now() - it.t0 < 250) return;
      it.t0 = performance.now(); cancelAnimationFrame(it.raf);
      it.g.setAttribute("filter", `url(#${it.svg.dataset.f})`); // only filtered while it moves, so the resting logo stays crisp
      const D = 820;
      const step = (now) => {
        const k = clamp((now - it.t0) / D, 0, 1);
        const amp = Math.sin(Math.min(1, k * 6) * Math.PI / 2) * Math.pow(1 - k, 2.2);
        it.disp.setAttribute("scale", (amp * 110).toFixed(1));
        it.turb.setAttribute("seed", String(Math.floor(now / 45) % 97));
        const sq = Math.sin(k * Math.PI * 5) * 0.05 * (1 - k);
        it.svg.style.transform = `scale(${1 + sq}, ${1 - sq})`;
        if (k < 1) it.raf = requestAnimationFrame(step); else { it.disp.setAttribute("scale", "0"); it.g.removeAttribute("filter"); it.svg.style.transform = ""; it.t0 = -1; }
      };
      it.raf = requestAnimationFrame(step);
    }
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(c, () => {
      let on = true;
      (async () => { let prev = -1; while (on) { await wait(900 + Math.random() * 700); if (!on) break; let i; do { i = Math.floor(Math.random() * items.length); } while (i === prev); prev = i; wiggle(items[i]); } })();
      return () => { on = false; };
    });
    return () => { f.stop(); stopLoop && stopLoop(); items.forEach((it) => cancelAnimationFrame(it.raf)); };
  }

  // ── 05 · Market select: a yield flow that gets smaller the more you touch it ──
  const MARKETS = [
    { name: "Euler Resolv", apr: 9.55, color: "#1FCF8A",
      icon: '<circle cx="16" cy="16" r="16" fill="#1FCF8A"/><path d="M10.5 11.2 18.6 7.6v4.1l-8.1 3.6zM10.5 16.4l11-4.9v4.1l-11 4.9zM13.4 21.3l8.1-3.6v4.1l-8.1 3.6z" fill="#0E1C16"/>' },
    { name: "Euler Liquidity Hub", apr: 10.21, color: "#2DE2B4",
      icon: '<circle cx="16" cy="16" r="16" fill="#2DE2B4"/><path d="M10 13.4l9.6-4.2M9.6 18.2l12.4-5.4M12.4 22.8l9.6-4.2" stroke="#0E1C16" stroke-width="2.7" stroke-linecap="round"/>' },
    { name: "Morpho MEV Capital", apr: 8.30, color: "#2771E0",
      icon: '<circle cx="16" cy="16" r="16" fill="#2771E0"/><path d="M14.2 9.6a6.6 6.6 0 0 0 0 12.8 8.4 8.4 0 0 1 0-12.8ZM17.8 9.6a6.6 6.6 0 0 1 0 12.8 8.4 8.4 0 0 0 0-12.8Z" fill="#fff"/>' },
  ];
  const AMOUNT = 10000;
  const chev = '<svg viewBox="0 0 12 20" aria-hidden="true"><path d="M2.5 2.5 9.5 10l-7 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const mIcon = (m, cls = "ms__ico") => `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true">${m.icon}</svg>`;

  // The poster's background: horizontal streaks, lavender light bleeding in from the edges over slate blue, sinking into black
  function streaks(cv) {
    const ctx = cv.getContext("2d"), W = 320, H = 520;
    cv.width = W; cv.height = H;
    const R = Array.from({ length: H }, () => [Math.random(), Math.random(), Math.random(), Math.random()]);
    const tri = (x) => Math.abs((((x % 1) + 1) % 1) * 2 - 1);
    const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    return (t) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#56658F"); g.addColorStop(0.42, "#5B6894"); g.addColorStop(0.62, "#2B2C38"); g.addColorStop(0.78, "#16161C"); g.addColorStop(1, "#111115");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const ph = t * 0.000035;
      for (let i = 0; i < 6; i++) { const r = R[Math.floor(Math.random() * H)]; r[0] = Math.random(); } // a little flicker
      for (let y = 0; y < H; y++) {
        const v = y / H, [a, b, c, d] = R[y];
        // Light from the edges, its reach zigzagging down the page
        const lit = 1 - sm(0.5, 0.62, v);
        if (lit > 0 && a > 0.06) {
          const L = W * (0.05 + 0.3 * tri(v * 2.4 + ph)) * (0.3 + 1.1 * b * b) * lit;
          const Rr = W * (0.04 + 0.28 * tri(v * 2.4 + 0.45 - ph)) * (0.3 + 1.1 * c * c) * lit;
          ctx.fillStyle = "rgba(220,210,226,.16)"; ctx.fillRect(0, y, L, 1); ctx.fillRect(W - Rr, y, Rr, 1);
          ctx.fillStyle = "rgba(226,216,230,.26)"; ctx.fillRect(0, y, L * 0.62, 1); ctx.fillRect(W - Rr * 0.6, y, Rr * 0.6, 1);
          ctx.fillStyle = "rgba(236,228,238,.34)"; ctx.fillRect(0, y, L * 0.3, 1); ctx.fillRect(W - Rr * 0.28, y, Rr * 0.28, 1);
        }
        if (v < 0.06 && b > 0.45) { ctx.fillStyle = "rgba(228,220,232,.3)"; ctx.fillRect(0, y, W * (0.25 + 0.2 * c), 1); }
        // The dark tide creeping in from both sides
        const dk = sm(0.44, 0.74, v + 0.05 * (tri(v * 11 + ph * 3) - 0.5));
        if (dk > 0) {
          ctx.fillStyle = `rgba(14,14,19,${(0.55 + 0.4 * d) * Math.min(1, dk * 1.4)})`;
          ctx.fillRect(0, y, W * Math.min(1, dk * (0.9 + 0.5 * a)), 1);
          ctx.fillRect(W - W * Math.min(1, dk * (0.8 + 0.6 * c)), y, W, 1);
          if (d > 0.93) { ctx.fillStyle = "rgba(170,178,210,.22)"; ctx.fillRect(W * c, y, W * 0.2 * b, 1); }
        }
      }
    };
  }

  function marketSelect(stage, { auto }) {
    const root = h("div", "ms");
    root.innerHTML = `
      <canvas class="ms__bg" aria-hidden="true"></canvas>
      <button class="ms__ai" type="button" aria-label="Let AI pick the markets"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2c.7 4.6 3.6 7.6 8.2 8.3-4.6.7-7.5 3.7-8.2 8.3-.7-4.6-3.6-7.6-8.2-8.3 4.6-.7 7.5-3.7 8.2-8.3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></button>
      <div class="ix ms__ui">
        <div class="ms__stack">
          <div class="ms__card ms__main">
            <div class="ms__view is-on" data-v="select">
              <ul class="ms__rows" role="list">${MARKETS.map((m, i) => `
                <li><button class="ms__row is-on" type="button" aria-pressed="true" data-i="${i}">${mIcon(m)}<span class="ms__name">${m.name}</span><span class="ms__apr">${m.apr.toFixed(2)}% APR</span></button></li>`).join("")}
              </ul>
              <button class="ms__foot" type="button" data-go="alloc"><span class="ms__count"><span class="ms__num">3</span> <span class="ms__lbl">Market Selected</span></span><span class="ms__next">Next ${chev}</span></button>
            </div>
            <div class="ms__view" data-v="alloc">
              <div class="ms__head"><button class="ms__back" type="button" data-go="select">${chev}Markets</button><span class="ms__step">Review</span></div>
              <div class="ms__sum">
                <div><p class="ms__k">Deposit</p><p class="ms__amt">$10,000 <small>USDC</small></p></div>
                <div class="ms__blend"><p class="ms__k">Blended</p><p class="ms__bapr"><span>0.00</span>% APR</p></div>
              </div>
              <div class="ms__bar"></div>
              <ul class="ms__alloc" role="list"></ul>
              <button class="ms__foot ms__hold" type="button"><span class="ms__fill" aria-hidden="true"></span><span class="ms__holdlbl">Hold to Deposit</span><span class="ms__next">${chev}</span></button>
            </div>
            <div class="ms__view" data-v="run">
              <div class="ms__head ms__head--run"><span class="ms__title">Depositing</span><span class="ms__step ms__prog">0 of 0</span></div>
              <ul class="ms__alloc ms__alloc--run" role="list"></ul>
            </div>
            <button class="ms__view ms__done" type="button" data-v="done" data-go="select" aria-label="Start again">
              <span class="ms__pile"></span>
              <span class="ms__dtxt"><b>Earning <span class="ms__dapr">0.00</span>% APR</b><small></small></span>
            </button>
          </div>
          <button class="ms__card ms__auto" type="button"><span>Auto Select Markets</span><span class="ms__next">Next ${chev}</span></button>
        </div>
      </div>
      <p class="ms__cap">Your portfolio keeps thinking even when you don’t.</p>
      <p class="ms__cap ms__cap--2">the more you touch it, the smaller it gets.</p>`;
    stage.appendChild(root);
    const f = fit(root, root.querySelector(".ms__ui"), 520, 560, 0.9, 1.15);
    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const main = $(".ms__main"), autoCard = $(".ms__auto"), rows = $$(".ms__row"), num = $(".ms__num"), foot = $('.ms__foot[data-go="alloc"]');
    const sel = new Set([0, 1, 2]);
    let view = "select", busy = false;

    // Background: redraw the streaks a couple of dozen times a second while visible
    const paint = streaks($(".ms__bg"));
    paint(0);
    const stopBg = reduce ? null : whileVisible(root, () => {
      let raf = 0, last = 0;
      const loop = (t) => { if (t - last > 42) { paint(t); last = t; } raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    });

    // Card height follows whichever view is showing; the views cross-fade inside it
    const size = () => { const v = main.querySelector(".ms__view.is-on"); main.style.height = `${v.offsetHeight}px`; };
    const go = (v) => {
      view = v;
      $$(".ms__view").forEach((n) => { const on = n.dataset.v === v; n.classList.toggle("is-on", on); n.inert = !on; });
      root.dataset.view = v;
      size();
    };

    // Rolling count: the old number leaves upward, the new one arrives from below
    const roll = (n) => {
      const old = +num.textContent;
      if (old === n) return;
      const up = n > old ? 1 : -1;
      num.animate([{ transform: "translateY(0)", opacity: 1, filter: "blur(0)" }, { transform: `translateY(${-14 * up}px)`, opacity: 0, filter: "blur(3px)" }], { duration: 140, easing: "ease-in" }).onfinish = () => {
        num.textContent = n;
        num.animate([{ transform: `translateY(${14 * up}px)`, opacity: 0, filter: "blur(3px)" }, { transform: "translateY(0)", opacity: 1, filter: "blur(0)" }], { duration: 220, easing: "cubic-bezier(.2,.9,.3,1.2)" });
      };
      $(".ms__lbl").textContent = n ? "Market Selected" : "Pick a market";
      if (!n) num.textContent = "";
      foot.disabled = !n;
    };
    const toggle = (i, on = !sel.has(i)) => {
      on ? sel.add(i) : sel.delete(i);
      const r = rows[i]; r.classList.toggle("is-on", on); r.setAttribute("aria-pressed", on);
      r.animate([{ transform: "scale(1)" }, { transform: "scale(.97)" }, { transform: "scale(1)" }], { duration: 260, easing: "ease-out" });
      if (sel.size) num.textContent ||= "0";
      roll(sel.size);
    };
    rows.forEach((r) => r.addEventListener("click", () => !busy && toggle(+r.dataset.i)));

    // Allocation: weights follow APR, so the better market gets more
    const plan = () => {
      const picked = [...sel].sort((a, b) => MARKETS[b].apr - MARKETS[a].apr).map((i) => MARKETS[i]);
      const tot = picked.reduce((s, m) => s + m.apr, 0);
      const pct = picked.map((m) => Math.round((m.apr / tot) * 100));
      pct[0] += 100 - pct.reduce((s, p) => s + p, 0);
      const blend = picked.reduce((s, m) => s + (m.apr / tot) * m.apr, 0);
      return { picked, pct, blend };
    };
    const money = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
    const count = (el, to, ms = 700) => {
      const t0 = performance.now();
      const step = (t) => { const k = clamp((t - t0) / ms, 0, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(2); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const toAlloc = () => {
      if (!sel.size) return;
      const { picked, pct, blend } = plan();
      $(".ms__bar").innerHTML = picked.map((m) => `<i style="background:${m.color}"></i>`).join("");
      $(".ms__alloc").innerHTML = picked.map((m, k) => `<li style="--d:${k * 70}ms">${mIcon(m, "ms__ico ms__ico--sm")}<span class="ms__name">${m.name}</span><span class="ms__pct">${pct[k]}%</span><span class="ms__usd">${money((AMOUNT * pct[k]) / 100)}</span></li>`).join("");
      go("alloc");
      count($(".ms__bapr span"), blend);
      requestAnimationFrame(() => requestAnimationFrame(() => $$(".ms__bar i").forEach((b, k) => (b.style.flexGrow = pct[k]))));
    };

    // Hold to deposit: press and hold fills the footer; letting go early drains it
    const hold = $(".ms__hold"), fill = $(".ms__fill"), holdLbl = $(".ms__holdlbl");
    let hp = 0, hraf = 0, holding = false;
    const HOLD = 1100;
    const holdTick = (() => { let last = 0; return (t) => {
      const dt = last ? t - last : 16; last = t;
      hp = clamp(hp + (holding ? dt / HOLD : -dt / 260), 0, 1);
      fill.style.transform = `scaleX(${hp})`;
      if (hp >= 1) { last = 0; holding = false; holdLbl.textContent = "Depositing…"; run(); return; }
      if (hp <= 0 && !holding) { last = 0; holdLbl.textContent = "Hold to Deposit"; return; }
      hraf = requestAnimationFrame(holdTick);
    }; })();
    const startHold = () => { if (busy) return; holding = true; holdLbl.textContent = "Keep holding…"; cancelAnimationFrame(hraf); hraf = requestAnimationFrame(holdTick); };
    const endHold = () => { if (!holding) return; holding = false; };
    hold.addEventListener("pointerdown", (e) => { e.preventDefault(); startHold(); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => hold.addEventListener(ev, endHold));
    hold.addEventListener("click", (e) => { if (e.detail === 0 && !busy) { hp = 1; run(); } }); // keyboard: Enter or Space confirms at once

    // Deposit: each market confirms in turn, then the whole card folds down to a summary
    async function run() {
      busy = true;
      const { picked, blend } = plan();
      const list = $(".ms__alloc--run"), prog = $(".ms__prog");
      list.innerHTML = picked.map((m) => `<li>${mIcon(m, "ms__ico ms__ico--sm")}<span class="ms__name">${m.name}</span><span class="ms__st"><i></i></span></li>`).join("");
      prog.textContent = `0 of ${picked.length}`;
      await wait(220); go("run");
      const items = [...list.children];
      for (let k = 0; k < items.length; k++) {
        items[k].classList.add("is-busy"); await wait(reduce ? 120 : 620);
        items[k].classList.replace("is-busy", "is-ok"); prog.textContent = `${k + 1} of ${picked.length}`;
        await wait(160);
      }
      await wait(380);
      $(".ms__pile").innerHTML = picked.map((m) => mIcon(m, "ms__ico ms__ico--pile")).join("");
      $(".ms__done small").textContent = `${money(AMOUNT)} across ${picked.length} market${picked.length > 1 ? "s" : ""}`;
      go("done"); count($(".ms__dapr"), blend, 600);
      hp = 0; fill.style.transform = "scaleX(0)"; holdLbl.textContent = "Hold to Deposit";
      busy = false;
    }

    // Auto select: a shimmer reads the list, clears it, then picks the two best yields and moves on
    async function autoPick() {
      if (busy) return;
      busy = true;
      if (view !== "select") { go("select"); await wait(420); }
      main.classList.add("is-thinking"); $(".ms__ai").classList.add("is-thinking");
      for (const i of [...sel]) { toggle(i, false); await wait(70); }
      await wait(520);
      const best = MARKETS.map((m, i) => i).sort((a, b) => MARKETS[b].apr - MARKETS[a].apr).slice(0, 2);
      for (const i of best) { toggle(i, true); await wait(300); }
      await wait(380);
      main.classList.remove("is-thinking"); $(".ms__ai").classList.remove("is-thinking");
      busy = false;
      toAlloc();
    }

    const reset = () => { [0, 1, 2].forEach((i) => { sel.add(i); rows[i].classList.add("is-on"); rows[i].setAttribute("aria-pressed", "true"); }); num.textContent = "3"; $(".ms__lbl").textContent = "Market Selected"; foot.disabled = false; go("select"); };
    root.addEventListener("click", (e) => {
      const g = e.target.closest("[data-go]");
      if (!g || busy) return;
      if (g.dataset.go === "alloc") toAlloc();
      else if (view === "done") reset();
      else go(g.dataset.go);
    });
    autoCard.addEventListener("click", autoPick);
    $(".ms__ai").addEventListener("click", autoPick);
    go("select");
    const ro = new ResizeObserver(size); $$(".ms__view").forEach((v) => ro.observe(v));

    // Tile loop: the whole flow, by hand and then by AI
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(root, () => {
      let on = true;
      const press = async (el, ms = 160) => { el.classList.add("is-press"); await wait(ms); el.classList.remove("is-press"); };
      (async () => {
        while (on) {
          reset(); await wait(1400); if (!on) break;
          await press(rows[2]); toggle(2); await wait(1000); if (!on) break;
          await press(foot); toAlloc(); await wait(1700); if (!on) break;
          startHold(); await wait(HOLD + 200); endHold();
          while (on && view !== "done") await wait(200);
          await wait(2600); if (!on) break;
          reset(); await wait(1200); if (!on) break;
          await press(autoCard); await autoPick(); await wait(2400);
        }
      })();
      return () => { on = false; holding = false; busy = false; reset(); };
    });
    return () => { f.stop(); ro.disconnect(); stopBg && stopBg(); stopLoop && stopLoop(); cancelAnimationFrame(hraf); };
  }

  // ── Material motion: tokens (mirrored in CSS as --m3-*), pointer drag and clipboard helpers ──
  const M3 = { std: "cubic-bezier(.2,0,0,1)", dec: "cubic-bezier(.05,.7,.1,1)", acc: "cubic-bezier(.3,0,.8,.15)" };
  const pad2 = (n) => String(Math.floor(n)).padStart(2, "0");
  const mmss = (s) => `${pad2(s / 60)}:${pad2(s % 60)}`;
  function drag(el, onMove, { onStart, onEnd } = {}) {
    const down = (e) => {
      if (e.button > 0) return;
      try { el.setPointerCapture(e.pointerId); } catch {} onStart && onStart(e); onMove(e);
      const move = (ev) => onMove(ev);
      const up = (ev) => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); onEnd && onEnd(ev); };
      el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    };
    el.addEventListener("pointerdown", down);
    return () => el.removeEventListener("pointerdown", down);
  }
  const copyText = async (t) => { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } };
  const IC = {
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="8.5" y="3.5" width="12" height="12" rx="3"/><path d="M15.5 20.5h-9a3 3 0 0 1-3-3v-9"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    cursor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5 19.5 10l-6.2 1.7L10.6 18 5 3.5Z" fill="#3a3a3a" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  };

  // ── 08 · Onboarding tour: a card whose preview changes with the selected feature (shared axis + fade through) ──
  function onboardingTour(stage, { auto }) {
    const STEPS = [
      ["Generate Pages", "Enter your prompt and get your first generation.", '<path d="M12 3 3.5 8 12 13l8.5-5L12 3Z"/><path d="m3.5 12 8.5 5 8.5-5"/>'],
      ["Components", "Create reusable components for your projects.", '<path d="M12 4.5 15 8l-3 3.5L9 8l3-3.5ZM12 12.5l3 3.5-3 3.5L9 16l3-3.5ZM4.5 12l3-3 3 3-3 3-3-3ZM13.5 12l3-3 3 3-3 3-3-3Z" transform="translate(0 -.5) scale(.98)"/>'],
      ["Quick Prototyping", "Create flows and prototype them in minutes.", '<path d="M9 7.5v9l7.5-4.5L9 7.5Z"/>'],
      ["Code Export", "Get the frontend code for each design.", '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5Z"/><path d="m10.5 12-1.5 1.5 1.5 1.5M13.5 12l1.5 1.5-1.5 1.5"/>'],
      ["Teams & Collaboration", "Collaborate on projects with your team.", '<rect x="5" y="4" width="14" height="16" rx="2.5"/><circle cx="12" cy="10.5" r="2.2"/><path d="M8 17c.6-2 2.2-3 4-3s3.4 1 4 3"/>'],
    ];
    const COPY = [
      ["Generate Pages", "Describe a page in a sentence and get a first layout you can refine, with real structure instead of a flat image."],
      ["Components", "Turn any part of a design into a reusable component and keep every project in sync."],
      ["Quick Prototyping", "Link screens into a flow and click through it right away, with no separate prototyping step."],
      ["Code Export", "Export clean frontend code for each design, ready to drop into your project."],
      ["Teams & Collaborations", "Work seamlessly with your teammates by inviting them to your organization. Share projects, track iterations and manage team members in one place."],
    ];
    const PEOPLE = [["Bessie Cooper", "bessie.cooper@gmail.com", "Engineering", "BC", 1], ["Arlene McCoy", "arlene.mccoy@gmail.com", "Product", "AM", 2], ["Esther Howard", "esther.howard@gmail.com", "Designer", "EH", 3]];
    const av = (p) => `<span class="pm__av" data-t="${p[3]}"><img src="/assets/images/playground/avatar-${p[4]}.jpg" alt="" onerror="this.remove()"></span>`;
    const c = h("div", "ix ix-pm");
    c.innerHTML = `
      <div class="pm__left">
        <div class="pm__logo"><svg viewBox="0 0 20 16" aria-hidden="true">${Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, k) => (k + r > 2 ? `<rect x="${k * 4}" y="${r * 4}" width="3" height="3" rx=".6"/>` : "")).join("")).join("")}</svg>Polymet</div>
        <h3 class="pm__h">Welcome to the Polymet.</h3>
        <p class="pm__sub">Thanks for joining Polymet. Were happy to have you here!</p>
        <div class="pm__list" role="tablist" aria-label="Features" aria-orientation="vertical">
          <span class="pm__sel" aria-hidden="true"></span>
          ${STEPS.map(([t, d, ic], i) => `<button class="pm__item" type="button" role="tab" data-i="${i}"><span class="pm__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${ic}</svg></span><span class="pm__txt"><b>${t}</b><small>${d}</small></span></button>`).join("")}
        </div>
        <div class="pm__foot"><span class="pm__chip"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="3" y="2" width="10" height="12" rx="1.5"/><path d="M5.5 5.5h5M5.5 8h5"/></svg>Polymet Academy</span><span>Pricing</span></div>
      </div>
      <div class="pm__right">
        <div class="pm__view">
          <div class="pm__scene" data-s="0"><div class="pm__prompt"><span class="pm__type">Landing page for a coffee roaster</span><i class="pm__caret"></i></div><div class="pm__gen"><i></i><i></i><i></i></div></div>
          <div class="pm__scene" data-s="1"><div class="pm__grid">${Array.from({ length: 6 }, (_, k) => `<i style="--k:${k}"></i>`).join("")}</div></div>
          <div class="pm__scene" data-s="2"><div class="pm__flow"><b class="pm__scr"></b><i class="pm__link"></i><b class="pm__scr"></b><i class="pm__link"></i><b class="pm__scr"></b><span class="pm__cur">${IC.cursor}</span></div></div>
          <div class="pm__scene" data-s="3"><div class="pm__code">${[62, 38, 74, 50, 66, 30].map((w, k) => `<i style="--w:${w}%;--k:${k}"></i>`).join("")}</div></div>
          <div class="pm__scene" data-s="4"><div class="pm__users">${PEOPLE.map((p, k) => `<div class="pm__user pm__user--${k}">${av(p)}<span class="pm__who"><b>${p[0]}</b><small>${p[1]}</small></span><em>${p[2]}</em></div>`).join("")}<span class="pm__cur">${IC.cursor}</span><i class="pm__ping"></i></div></div>
        </div>
        <div class="pm__copy"><h4 class="pm__ttl"></h4><p class="pm__dsc"></p></div>
        <button class="pm__cta" type="button">Start Designing</button>
      </div>`;
    stage.appendChild(c);
    const f = fit(stage, c, 800, 540, 0.92);
    const items = [...c.querySelectorAll(".pm__item")], scenes = [...c.querySelectorAll(".pm__scene")];
    const sel = c.querySelector(".pm__sel"), copy = c.querySelector(".pm__copy"), ttl = c.querySelector(".pm__ttl"), dsc = c.querySelector(".pm__dsc");
    let cur = -1, swap = 0;
    const place = () => { const it = items[cur]; if (it) { sel.style.height = `${it.offsetHeight}px`; sel.style.transform = `translateY(${it.offsetTop}px)`; } };
    const go = (i) => {
      if (i === cur) return;
      const first = cur === -1; cur = i;
      items.forEach((b, k) => { b.setAttribute("aria-selected", k === i); b.tabIndex = k === i ? 0 : -1; });
      scenes.forEach((s, k) => s.classList.toggle("is-on", k === i));
      place();
      const set = () => { ttl.textContent = COPY[i][0]; dsc.textContent = COPY[i][1]; copy.classList.remove("is-out"); };
      clearTimeout(swap);
      if (first || reduce) set(); else { copy.classList.add("is-out"); swap = setTimeout(set, 120); }
    };
    items.forEach((b, i) => {
      b.addEventListener("click", () => go(i));
      b.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0; if (!d) return;
        e.preventDefault(); const n = (i + d + items.length) % items.length; go(n); items[n].focus();
      });
    });
    c.querySelector(".pm__cta").addEventListener("click", () => go(0));
    c.style.visibility = "hidden"; go(4);
    requestAnimationFrame(() => { place(); c.style.visibility = ""; });
    document.fonts && document.fonts.ready.then(place);
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(c, () => { const id = setInterval(() => go((cur + 1) % STEPS.length), 3400); return () => clearInterval(id); });
    return () => { clearTimeout(swap); f.stop(); stopLoop && stopLoop(); };
  }

  // ── 09 · API key and install snippets: reveal, copy, sliding tab underline ──
  function apiKey(stage, { auto }) {
    const KEY = "8f3a-27c1-b9e0-41d6", MASK = "****-****-****-****";
    const URL_ = "https://mosaic.example/r/mosaic-util.json";
    const CMD = { NPM: ["npx", `shadcn@latest add mosaic-util --url=${URL_}`], BUN: ["bunx --bun", `shadcn@latest add mosaic-util --url=${URL_}`], YARN: ["yarn dlx", `shadcn@latest add mosaic-util --url=${URL_}`], PNPM: ["pnpm dlx", `shadcn@latest add mosaic-util --url=${URL_}`] };
    const c = h("div", "ix ix-ak");
    c.innerHTML = `
      <p class="ak__lbl">API Key</p>
      <div class="ak__field">
        <span class="ak__key" aria-live="polite">${MASK}</span>
        <button class="ak__btn ak__reveal" type="button"><span class="ak__spark">${ICON.sparkle}</span><span class="ak__rl">Reveal</span></button>
        <button class="ak__btn ak__copy" type="button"><span class="ak__ic"><span class="ak__i1">${IC.copy}</span><span class="ak__i2">${IC.check}</span></span><span class="ak__cl">Copy</span></button>
      </div>
      <div class="ak__card ak__cmd">
        <div class="ak__tabs" role="tablist" aria-label="Package manager">${Object.keys(CMD).map((k, i) => `<button class="ak__tab" type="button" role="tab" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${k}</button>`).join("")}<i class="ak__ul" aria-hidden="true"></i><span class="ak__term">Terminal</span></div>
        <div class="ak__line"><code class="ak__run"></code><button class="ak__cp" type="button" aria-label="Copy command"><span class="ak__i1">${IC.copy}</span><span class="ak__i2">${IC.check}</span></button></div>
      </div>
      <div class="ak__card ak__code">
        <button class="ak__cp" type="button" aria-label="Copy code"><span class="ak__i1">${IC.copy}</span><span class="ak__i2">${IC.check}</span></button>
        <pre><code><span class="r">export const</span> <span class="b">metadata</span> = {
  openGraph<span class="r">:</span> {
    images<span class="r">:</span> [
      {
        url<span class="r">:</span> <span class="g">'https://mosaic.example/use?url=https://your-site.com'</span>,
        width<span class="r">:</span> <span class="b">1200</span>,
        height<span class="r">:</span> <span class="b">630</span>,
      },
    ],
  },
}</code></pre>
      </div>`;
    stage.appendChild(c);
    const f = fit(stage, c, 480, 590, 0.92);
    const $ = (s) => c.querySelector(s);
    const keyEl = $(".ak__key"), rl = $(".ak__rl"), cl = $(".ak__cl"), reveal = $(".ak__reveal"), copyBtn = $(".ak__copy");
    const tabs = [...c.querySelectorAll(".ak__tab")], ul = $(".ak__ul"), run = $(".ak__run");
    let shown = false, tw = 0, tabSwap = 0, doneT = new Map(), curTab = 0;
    const setKey = (on) => {
      shown = on; clearInterval(tw); reveal.classList.toggle("is-on", on);
      const from = on ? MASK : KEY, to = on ? KEY : MASK;
      if (reduce) keyEl.textContent = to;
      else { let n = 0; tw = setInterval(() => { n++; keyEl.textContent = to.slice(0, n) + from.slice(n); if (n >= to.length) clearInterval(tw); }, 24); }
      rl.classList.add("is-out"); setTimeout(() => { rl.textContent = on ? "Hide" : "Reveal"; rl.classList.remove("is-out"); }, reduce ? 0 : 100);
    };
    const flash = (btn, label) => {
      clearTimeout(doneT.get(btn)); btn.classList.add("is-done"); label && (label.textContent = "Copied");
      doneT.set(btn, setTimeout(() => { btn.classList.remove("is-done"); label && (label.textContent = "Copy"); }, 1600));
    };
    const place = () => { const t = tabs[curTab]; ul.style.width = `${t.offsetWidth}px`; ul.style.transform = `translateX(${t.offsetLeft}px)`; };
    const paint = (name) => { const [bin, rest] = CMD[name]; run.innerHTML = `<span class="p">${bin}</span> ${rest}`; };
    const setTab = (i, instant) => {
      curTab = i; tabs.forEach((t, k) => { t.setAttribute("aria-selected", k === i); t.tabIndex = k === i ? 0 : -1; });
      place(); clearTimeout(tabSwap);
      if (instant || reduce) paint(tabs[i].textContent); else { run.classList.add("is-out"); tabSwap = setTimeout(() => { paint(tabs[i].textContent); run.classList.remove("is-out"); }, 110); }
    };
    reveal.addEventListener("click", () => setKey(!shown));
    copyBtn.addEventListener("click", async () => { await copyText(KEY); flash(copyBtn, cl); });
    c.querySelectorAll(".ak__cp").forEach((b) => b.addEventListener("click", async () => { await copyText(b.closest(".ak__cmd") ? `${CMD[tabs[curTab].textContent].join(" ")}` : c.querySelector(".ak__code code").textContent); flash(b); }));
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => setTab(i));
      t.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return; e.preventDefault(); const n = (i + d + tabs.length) % tabs.length; setTab(n); tabs[n].focus(); });
    });
    paint("NPM"); requestAnimationFrame(place); document.fonts && document.fonts.ready.then(place);
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(c, () => {
      let on = true;
      (async () => {
        while (on) {
          await wait(1400); for (const i of [1, 2, 3, 0]) { if (!on) return; setTab(i); await wait(1100); }
          if (!on) return; setKey(true); await wait(1400); flash(copyBtn, cl); await wait(2200); setKey(false); await wait(900);
        }
      })();
      return () => { on = false; };
    });
    return () => { clearInterval(tw); clearTimeout(tabSwap); doneT.forEach(clearTimeout); f.stop(); stopLoop && stopLoop(); };
  }

  // ── 10 · Day timeline: a draggable playhead over two tracks, with a live event count ──
  function timelineScrub(stage, { auto }) {
    const W = 720, H = 460, X0 = 48, X1 = 672, H0 = 6, H1 = 24, PXH = (X1 - X0) / (H1 - H0);
    const xOf = (hr) => X0 + (hr - H0) * PXH;
    const TRACKS = [{ y: 232, segs: [[6, 12], [12, 16], [16, 21], [21, 24]] }, { y: 352, stub: [6, 7], segs: [[7, 8], [8, 14], [14, 17.5], [17.5, 24]] }];
    const CUTS = [12, 16, 21, 8, 14, 17.5];
    const c = h("div", "ix ix-tl");
    c.innerHTML = `
      <div class="tl__chip"><span class="tl__date">7th April</span><span class="tl__plus" aria-live="polite">+5</span></div>
      <button class="tl__play" type="button" aria-label="Play"><svg class="tl__ip" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.500 2.800v10.400L13 8 4.500 2.800Z"/></svg><svg class="tl__ipause" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3.500" y="2.800" width="3" height="10.400" rx=".8"/><rect x="9.500" y="2.800" width="3" height="10.400" rx=".8"/></svg></button>
      <div class="tl__ruler" aria-hidden="true"><i class="tl__base"></i>${Array.from({ length: H1 - H0 + 1 }, (_, k) => { const hr = H0 + k, major = hr % 3 === 0; return `<i class="tl__tick${major ? " is-major" : ""}" style="left:${xOf(hr)}px"></i>${major ? `<span class="tl__lbl" data-h="${hr}" style="left:${xOf(hr)}px">${hr}</span>` : ""}`; }).join("")}</div>
      ${TRACKS.map((tr) => `<div class="tl__track" style="top:${tr.y}px">${tr.stub ? `<i class="tl__stub" style="left:${xOf(tr.stub[0])}px;width:${(tr.stub[1] - tr.stub[0]) * PXH - 4}px"></i>` : ""}${tr.segs.map(([a, b]) => `<i class="tl__seg" style="left:${xOf(a)}px;width:${(b - a) * PXH}px"></i>`).join("")}</div>`).join("")}
      <div class="tl__ph"><span class="tl__tip" aria-hidden="true">18:20</span><span class="tl__grip" aria-hidden="true"><i></i><i></i><i></i></span><span class="tl__cap"><svg viewBox="0 0 16 12" aria-hidden="true"><path d="M1 1h14L8 11 1 1Z" fill="currentColor"/></svg><i class="tl__ln"></i><i class="tl__dot"></i></span><i class="tl__dot tl__dot--b"></i><i class="tl__ln tl__ln--b"></i></div>
      <div class="tl__hit" role="slider" tabindex="0" aria-label="Time of day" aria-valuemin="${H0}" aria-valuemax="${H1}"></div>`;
    stage.appendChild(c);
    const f = fit(stage, c, W, H, 0.98);
    const $ = (s) => c.querySelector(s);
    const ph = $(".tl__ph"), hit = $(".tl__hit"), plus = $(".tl__plus"), tip = $(".tl__tip"), play = $(".tl__play"), labels = [...c.querySelectorAll(".tl__lbl")];
    hit.style.cssText = `left:${X0 - 24}px;width:${X1 - X0 + 48}px`;
    let target = 18.3, pos = target, playing = false, dragging = false, count = -1, hot = null, raf = 0, last = performance.now();
    const fmt = (hr) => `${pad2(hr)}:${pad2((hr % 1) * 60)}`;
    const eventsAt = (hr) => CUTS.filter((x) => x <= hr).length;
    const setPlaying = (on) => { playing = on; play.classList.toggle("is-on", on); play.setAttribute("aria-label", on ? "Pause" : "Play"); };
    const fromEvent = (e) => { const r = hit.getBoundingClientRect(), fx = clamp((e.clientX - r.left) / r.width, 0, 1); const hr = H0 + ((fx * (X1 - X0 + 48) - 24) / (X1 - X0)) * (H1 - H0); return clamp(hr, H0, H1); };
    const unDrag = drag(hit, (e) => { target = fromEvent(e); }, { onStart: () => { dragging = true; setPlaying(false); c.classList.add("is-drag"); }, onEnd: () => { dragging = false; c.classList.remove("is-drag"); } });
    hit.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 0.25 : e.key === "ArrowLeft" ? -0.25 : 0;
      if (d) { e.preventDefault(); setPlaying(false); target = clamp(Math.round((target + d) * 4) / 4, H0, H1); }
      else if (e.key === " ") { e.preventDefault(); setPlaying(!playing); }
      else if (e.key === "Home") target = H0; else if (e.key === "End") target = H1;
    });
    play.addEventListener("click", () => { if (!playing && target >= H1 - 0.01) target = pos = H0; setPlaying(!playing); });
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (playing) { target += dt / 1.4; if (target >= H1) { target = H1; setPlaying(false); } }
      pos += (target - pos) * (1 - Math.exp(-dt * (dragging ? 26 : 14)));
      ph.style.transform = `translateX(${xOf(pos)}px)`;
      const n = eventsAt(pos);
      if (n !== count) { count = n; plus.textContent = `+${n}`; plus.classList.remove("bump"); void plus.offsetWidth; plus.classList.add("bump"); }
      let best = null, bd = 99; labels.forEach((l) => { const d = Math.abs(+l.dataset.h - pos); if (d < bd) { bd = d; best = l; } });
      if (best !== hot) { hot && hot.classList.remove("is-hot"); best && bd < 1.6 && best.classList.add("is-hot"); hot = bd < 1.6 ? best : null; }
      tip.textContent = fmt(pos); hit.setAttribute("aria-valuenow", pos.toFixed(2)); hit.setAttribute("aria-valuetext", fmt(pos));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(c, () => {
      let on = true;
      (async () => {
        while (on) {
          target = 18.3; await wait(1200); if (!on) return;
          for (const hr of [9.5, 14.8, 22, 18.3]) { if (!on) return; target = hr; await wait(1500); }
          await wait(900);
        }
      })();
      return () => { on = false; };
    });
    return () => { cancelAnimationFrame(raf); unDrag(); f.stop(); stopLoop && stopLoop(); };
  }

  // ── 11 · Glass sliders: four image adjustments that filter the photo behind them ──
  function glassSliders(stage, { auto }) {
    const ROWS = [
      { key: "brightness", name: "Brightness", min: 0, max: 200, def: 100, unit: "%", css: (v) => `brightness(${v}%)` },
      { key: "contrast", name: "Contrast", min: 0, max: 200, def: 100, unit: "%", css: (v) => `contrast(${v}%)` },
      { key: "hue", name: "Hue", min: -180, max: 180, def: 0, unit: "°", css: (v) => `hue-rotate(${v}deg)` },
      { key: "saturation", name: "Saturation", min: 0, max: 200, def: 100, unit: "%", css: (v) => `saturate(${v}%)` },
    ];
    const root = h("div", "sl");
    root.innerHTML = `<div class="sl__bg"></div><div class="sl__shade"></div>`;
    const cv = h("div", "ix ix-sl");
    cv.innerHTML = ROWS.map((r) => `
      <div class="sl__row" data-k="${r.key}" role="slider" tabindex="0" aria-label="${r.name}" aria-valuemin="${r.min}" aria-valuemax="${r.max}">
        <div class="sl__fill"></div><i class="sl__h"></i>
        <span class="sl__name">${r.name}</span><span class="sl__val"></span>
      </div>`).join("");
    root.appendChild(cv); stage.appendChild(root);
    const f = fit(stage, cv, 700, 330, 0.9);
    const bg = root.querySelector(".sl__bg");
    const st = {}; ROWS.forEach((r) => { st[r.key] = { r, el: cv.querySelector(`[data-k="${r.key}"]`), v: r.def, shown: 0 }; });
    const frac = (s) => (s.v - s.r.min) / (s.r.max - s.r.min);
    const apply = () => {
      bg.style.filter = ["blur(2px)", ...ROWS.map((r) => r.css(st[r.key].v))].join(" ");
      ROWS.forEach((r) => { const s = st[r.key], txt = `${s.v}${r.unit}`; s.el.querySelector(".sl__val").textContent = txt; s.el.setAttribute("aria-valuenow", s.v); s.el.setAttribute("aria-valuetext", txt); });
    };
    const setVal = (key, v) => { const s = st[key]; s.v = clamp(Math.round(v), s.r.min, s.r.max); apply(); };
    let raf = 0, last = performance.now(), active = null;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ROWS.forEach((r) => { const s = st[r.key]; s.shown += (frac(s) - s.shown) * (1 - Math.exp(-dt * (active === s ? 30 : 16))); s.el.style.setProperty("--f", s.shown.toFixed(4)); });
      raf = requestAnimationFrame(tick);
    };
    ROWS.forEach((r) => {
      const s = st[r.key], el = s.el;
      drag(el, (e) => { const b = el.getBoundingClientRect(), x = clamp((e.clientX - b.left) / b.width, 0, 1); setVal(r.key, r.min + x * (r.max - r.min)); }, { onStart: () => { active = s; el.classList.add("is-drag"); }, onEnd: () => { active = null; el.classList.remove("is-drag"); } });
      el.addEventListener("dblclick", () => setVal(r.key, r.def));
      el.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
        if (d) { e.preventDefault(); setVal(r.key, s.v + d * (e.shiftKey ? 20 : 5)); } else if (e.key === "Home" || e.key === "0") { e.preventDefault(); setVal(r.key, r.def); }
      });
    });
    apply(); ROWS.forEach((r) => { st[r.key].shown = frac(st[r.key]); });
    raf = requestAnimationFrame(tick);
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(root, () => {
      let on = true;
      (async () => {
        while (on) {
          await wait(1200);
          for (const [k, v] of [["brightness", 150], ["contrast", 140], ["hue", 90], ["saturation", 160], ["hue", -120], ["brightness", 70], ["saturation", 40], ["contrast", 100], ["hue", 0], ["brightness", 100], ["saturation", 100]]) { if (!on) return; setVal(k, v); await wait(900); }
        }
      })();
      return () => { on = false; };
    });
    return () => { cancelAnimationFrame(raf); f.stop(); stopLoop && stopLoop(); };
  }

  // ── 12 · Podcast player: a transcript that follows playback, a segmented timeline, pins and speed ──
  function podcastPlayer(stage, { auto }) {
    const DUR = 314, SPEEDS = [1, 1.25, 1.5, 2];
    const LINES = [
      [4, "Alex", "Thanks for having me. I have been thinking about memory in products for a long time."],
      [38, "You", "Let us start there. Where should memory live, in the product or in the person?"],
      [62, "Alex", "In the product. People should carry intent, not state. When a tool forgets, it pushes that work back onto you."],
      [96, "You", "And how do you show that without it feeling like surveillance?"],
      [111, "Alex", "You make it visible and reversible. Say what was kept, why it was kept, and give one clear way to take it back."],
      [150, "You", "That sounds like a design rule more than a feature."],
      [166, "Alex", "It is. Every remembered thing needs a visible edge, a source and an undo."],
      [204, "You", "What would you cut first?"],
      [216, "Alex", "Anything that remembers silently. Start small, earn trust, then widen what it keeps."],
      [286, "You", "That is a good place to stop."],
    ];
    const SEGS = LINES.map(([t, who], i) => [t, Math.min((LINES[i + 1] ? LINES[i + 1][0] : DUR) - 3, t + (i % 2 ? 26 : 34)), who]);
    const c = h("div", "ix ix-pp");
    c.innerHTML = `
      <div class="pp__tx" aria-live="off"><div class="pp__lines">${LINES.map(([t, who, txt], i) => `<button class="pp__ln" type="button" data-i="${i}" aria-label="Jump to ${mmss(t)}"><small>${who} <span>${mmss(t)}</span></small><span>${txt}</span></button>`).join("")}</div></div>
      <div class="pp__trk">
        <div class="pp__pins"></div>
        <div class="pp__bar" role="slider" tabindex="0" aria-label="Playback position" aria-valuemin="0" aria-valuemax="${DUR}">
          ${SEGS.map(([a, b, who]) => `<i class="pp__seg pp__seg--${who === "You" ? "p" : "g"}" style="left:${(a / DUR) * 100}%;width:max(14px,${((b - a) / DUR) * 100}%)"></i>`).join("")}
          <i class="pp__head"></i>
        </div>
        <div class="pp__times"><span class="pp__el">01:50</span><span class="pp__rem">-03:24</span></div>
      </div>
      <div class="pp__ctl">
        <button class="pp__spd" type="button" aria-label="Playback speed">1x</button>
        <button class="pp__skip" type="button" data-d="-5" aria-label="Back 5 seconds"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.500 6.500 6 10l3.500 3.500"/><path d="M6 10h10a8 8 0 1 1-8 8"/></svg><b>5</b></button>
        <button class="pp__play" type="button" aria-label="Play"><svg class="pp__i1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.200v13.600L19 12 8 5.200Z"/></svg><svg class="pp__i2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.500" width="4.200" height="15" rx="1.200"/><rect x="13.800" y="4.500" width="4.200" height="15" rx="1.200"/></svg></button>
        <button class="pp__skip" type="button" data-d="5" aria-label="Forward 5 seconds"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22.500 6.500 26 10l-3.500 3.500"/><path d="M26 10H16a8 8 0 1 0 8 8"/></svg><b>5</b></button>
        <button class="pp__set" type="button" aria-label="Options" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="#000"/><circle cx="15" cy="12" r="2" fill="#000"/><circle cx="8" cy="17" r="2" fill="#000"/></svg></button>
        <div class="pp__menu" hidden><button type="button" class="pp__pin">Pin this moment</button></div>
      </div>
      <i class="pp__home" aria-hidden="true"></i>`;
    stage.appendChild(c);
    const f = fit(stage, c, 380, 560, 0.94);
    const $ = (s) => c.querySelector(s);
    const lines = [...c.querySelectorAll(".pp__ln")], box = $(".pp__lines"), tx = $(".pp__tx"), bar = $(".pp__bar"), head = $(".pp__head"), el = $(".pp__el"), rem = $(".pp__rem");
    const playBtn = $(".pp__play"), spd = $(".pp__spd"), set = $(".pp__set"), menu = $(".pp__menu"), pins = $(".pp__pins");
    let t = 110, playing = false, si = 0, cur = -1, off = 0, offT = 0, raf = 0, last = performance.now(), dragging = false;
    const PINS = [14, 30];
    const drawPins = () => { pins.replaceChildren(...PINS.map((p) => { const i = h("i", "pp__pn"); i.style.left = `${(p / DUR) * 100}%`; i.innerHTML = '<svg viewBox="0 0 12 14" fill="currentColor" aria-hidden="true"><path d="M3 1h6v1.5L8 3.500v3L10 9H6.700V13h-1.400V9H2l2-2.500v-3L3 2.500V1Z"/></svg>'; return i; })); };
    const setPlaying = (on) => { playing = on; playBtn.classList.toggle("is-on", on); playBtn.setAttribute("aria-label", on ? "Pause" : "Play"); };
    const seek = (s) => { t = clamp(s, 0, DUR); };
    const frac = (e) => { const r = bar.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1); };
    const unDrag = drag(bar, (e) => seek(frac(e) * DUR), { onStart: () => { dragging = true; c.classList.add("is-scrub"); }, onEnd: () => { dragging = false; c.classList.remove("is-scrub"); } });
    bar.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : 0; if (d) { e.preventDefault(); seek(t + d); } else if (e.key === " ") { e.preventDefault(); setPlaying(!playing); } });
    playBtn.addEventListener("click", () => { if (!playing && t >= DUR - 0.2) seek(0); setPlaying(!playing); });
    c.querySelectorAll(".pp__skip").forEach((b) => b.addEventListener("click", () => { seek(t + +b.dataset.d); b.classList.remove("is-tap"); void b.offsetWidth; b.classList.add("is-tap"); }));
    spd.addEventListener("click", () => { si = (si + 1) % SPEEDS.length; spd.textContent = `${SPEEDS[si]}x`; });
    lines.forEach((l, i) => l.addEventListener("click", () => seek(LINES[i][0])));
    const toggleMenu = (on) => { menu.hidden = !on; set.setAttribute("aria-expanded", on); };
    set.addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(menu.hidden); });
    $(".pp__pin").addEventListener("click", () => { if (PINS.length < 12) { PINS.push(Math.round(t)); drawPins(); } toggleMenu(false); });
    const onDoc = (e) => { if (!menu.hidden && !menu.contains(e.target)) toggleMenu(false); };
    document.addEventListener("click", onDoc);
    drawPins();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (playing && !dragging) { t += dt * SPEEDS[si]; if (t >= DUR) { t = DUR; setPlaying(false); } }
      head.style.transform = `translateX(${(t / DUR) * 100}%)`;
      el.textContent = mmss(t); rem.textContent = `-${mmss(DUR - t)}`; bar.setAttribute("aria-valuenow", Math.round(t)); bar.setAttribute("aria-valuetext", mmss(t));
      let n = -1; LINES.forEach((l, i) => { if (l[0] <= t) n = i; });
      if (n !== cur) { cur = n; lines.forEach((l, i) => { l.classList.toggle("is-now", i === n); l.classList.toggle("is-past", i < n); }); if (n >= 0) offT = lines[n].offsetTop - 12; else offT = 0; }
      off += (offT - off) * (1 - Math.exp(-dt * 9));
      box.style.transform = `translateY(${-off}px)`;
      raf = requestAnimationFrame(tick);
    };
    document.fonts && document.fonts.ready.then(() => { cur = -2; });
    raf = requestAnimationFrame(tick);
    setTimeout(() => { off = offT; }, 60);
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(c, () => { setPlaying(true); if (t > DUR - 20) seek(60); return () => setPlaying(false); });
    return () => { cancelAnimationFrame(raf); document.removeEventListener("click", onDoc); unDrag(); f.stop(); stopLoop && stopLoop(); };
  }


  // ── 13 · Compose bar in three themes: type, refine, dictate, send (the message lands in the feed) ──
  function composeBars(stage, { auto }) {
    const DICT = ["Remember", "to", "book", "a", "table", "for", "Friday", "and", "ask", "if", "they", "have", "a", "quiet", "corner."];
    const THEMES = [["dark", "Dark"], ["light", "Light"], ["sun", "Dusk"]];
    const TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7M10.200 11v5M13.800 11v5"/></svg>';
    const RING = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.500" stroke-dasharray="1.400 3.100"/><circle cx="12" cy="12" r="4.800"/></svg>';
    const MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="9" y="4" width="6" height="10" rx="3"/><path d="M6.500 11.500a5.500 5.500 0 0 0 11 0M12 17v3"/></svg>';
    const SIGNAL = '<svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.500" width="3" height="6.500" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg>';
    const WIFI = '<svg viewBox="0 0 17 12" fill="none" stroke="currentColor" stroke-width="1.700" stroke-linecap="round" aria-hidden="true"><path d="M1.200 4.200a10 10 0 0 1 14.600 0M3.700 6.900a6.300 6.300 0 0 1 9.600 0M6.200 9.600a2.800 2.800 0 0 1 4.600 0"/></svg>';
    const BATT = '<svg viewBox="0 0 27 13" aria-hidden="true"><rect x=".5" y=".5" width="22" height="12" rx="3.500" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="19" height="9" rx="2.200" fill="currentColor"/><path d="M24.500 4.500v4c.8-.3 1.500-1.100 1.500-2s-.7-1.700-1.500-2Z" fill="currentColor" opacity=".5"/></svg>';

    /* One iPhone-sized screen (393 × 852 pt, the 15's), and a switch under it for the three looks. Nothing here is a miniature:
       the targets are the real ones, 44pt for the icons and the send button, 17pt for the text, so it reads the way it would in hand. */
    const c = h("div", "ix ix-cb");
    c.innerHTML = `
      <div class="cb" data-th="dark">
        <i class="cb__bg cb__bg--dark"></i><i class="cb__bg cb__bg--light"></i><i class="cb__bg cb__bg--sun"></i>
        <div class="cb__status" aria-hidden="true"><b>9:41</b><i class="cb__island"></i><span>${SIGNAL}${WIFI}${BATT}</span></div>
        <div class="cb__head" aria-hidden="true"><span>Notes</span><small>Today</small></div>
        <div class="cb__feed" aria-live="polite"></div>
        <div class="cb__bar">
          <textarea class="cb__in" rows="1" placeholder="Write your thoughts..." aria-label="Write your thoughts"></textarea>
          <div class="cb__row">
            <button class="cb__ic cb__trash" type="button" aria-label="Clear">${TRASH}</button>
            <button class="cb__ic cb__magic" type="button" aria-label="Refine the text">${RING}</button>
            <button class="cb__ic cb__mic" type="button" aria-label="Dictate" aria-pressed="false"><span class="cb__i1">${MIC}</span><span class="cb__i2"><i></i><i></i><i></i><i></i></span></button>
            <button class="cb__send" type="button" aria-label="Send">${ICON.up}</button>
          </div>
        </div>
        <i class="cb__home" aria-hidden="true"></i>
      </div>
      <div class="cb__switch" role="radiogroup" aria-label="Theme"><i class="cb__thumb" aria-hidden="true"></i>${THEMES.map(([id, label], i) => `<button type="button" role="radio" data-th="${id}" aria-checked="${i === 0}" tabindex="${i ? -1 : 0}">${label}</button>`).join("")}</div>`;
    stage.appendChild(c);
    const f = fit(stage, c, 440, 960, 0.94);

    const el = c.querySelector(".cb"), q = (sel) => el.querySelector(sel), inp = q(".cb__in"), feed = q(".cb__feed"), send = q(".cb__send"), trash = q(".cb__trash"), magic = q(".cb__magic"), mic = q(".cb__mic");
    const sw = c.querySelector(".cb__switch"), opts = [...sw.querySelectorAll("button")];
    let dict = 0, listening = null, theme = 0;

    const setTheme = (i) => {
      theme = (i + THEMES.length) % THEMES.length;
      el.dataset.th = THEMES[theme][0];
      sw.style.setProperty("--i", theme);
      opts.forEach((o, k) => { o.setAttribute("aria-checked", String(k === theme)); o.tabIndex = k === theme ? 0 : -1; });
    };
    opts.forEach((o, i) => {
      o.addEventListener("click", () => setTheme(i));
      o.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
        e.preventDefault(); e.stopPropagation(); setTheme(theme + d); opts[theme].focus();
      });
    });

    const sync = () => {
      inp.style.height = "auto"; inp.style.height = `${Math.min(132, inp.scrollHeight)}px`;
      const has = inp.value.trim().length > 0; send.disabled = !has; trash.disabled = !inp.value.length; magic.disabled = !has;
    };
    const post = () => {
      const v = inp.value.trim(); if (!v) return;
      const b = h("p", "cb__msg"); b.textContent = v; feed.appendChild(b);
      while (feed.children.length > 4) feed.firstChild.remove();
      inp.value = ""; sync(); stopMic();
    };
    const stopMic = () => { clearInterval(listening); listening = null; mic.classList.remove("is-on"); mic.setAttribute("aria-pressed", "false"); };
    const refine = (s) => { s = s.replace(/\s+/g, " ").trim(); s = s.charAt(0).toUpperCase() + s.slice(1); return /[.!?]$/.test(s) ? s : s + "."; };
    inp.addEventListener("input", sync);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); post(); } });
    send.addEventListener("click", post);
    trash.addEventListener("click", () => { inp.value = ""; sync(); stopMic(); inp.focus(); });
    magic.addEventListener("click", () => {
      if (magic.classList.contains("is-busy")) return;
      magic.classList.add("is-busy"); inp.classList.add("is-busy");
      setTimeout(() => { inp.value = refine(inp.value); sync(); magic.classList.remove("is-busy"); inp.classList.remove("is-busy"); }, reduce ? 0 : 700);
    });
    mic.addEventListener("click", () => {
      if (listening) return stopMic();
      mic.classList.add("is-on"); mic.setAttribute("aria-pressed", "true");
      listening = setInterval(() => { inp.value += (inp.value && !/\s$/.test(inp.value) ? " " : "") + DICT[dict++ % DICT.length]; sync(); if (dict % DICT.length === 0) stopMic(); }, 380);
    });
    sync(); setTheme(0);

    // In the board tile: write a line, send it, change the look, and go round again
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(c, () => {
      let on = true;
      const lines = ["Call mum on Sunday", "Draft the launch note", "Walk before sunset"];
      (async () => {
        while (on) {
          feed.replaceChildren(); inp.value = ""; sync(); setTheme(0);
          await wait(900);
          for (let i = 0; i < 3 && on; i++) {
            for (const ch of lines[i]) { if (!on) return; inp.value += ch; sync(); await wait(55); }
            await wait(450); if (!on) return; post(); await wait(700);
            if (!on) return; setTheme(i + 1); await wait(1100);
          }
          await wait(1200);
        }
      })();
      return () => { on = false; };
    });
    return () => { stopMic(); f.stop(); stopLoop && stopLoop(); };
  }

  // ── 15 · Empty state: a stack of windows you can shuffle, with pixel glyphs that drift against the pointer ──
  function emptySessions(stage, { auto }) {
    const GLYPHS = [
      { c: "#F26B0F", x: 30, y: 215, r: -8, d: 1.1, g: ["#.#.#", ".#.#.", "#.#.#", ".#.#.", "#.#.#"] },
      { c: "#0A8CFF", x: 90, y: 70, r: -14, d: 1.4, g: ["####.", "#...#", "#.##.", "....#", ".##.."] },
      { c: "#F5D90A", x: 285, y: 20, r: 12, d: 1.8, g: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"] },
      { c: "#2AA876", x: 470, y: 60, r: 8, d: 1.3, g: ["..#..", ".###.", "#.#.#", ".###.", "..#.."] },
      { c: "#D9439E", x: 535, y: 200, r: -6, d: 1.6, g: ["#...#", ".###.", ".###.", ".###.", "#...#"] },
    ];
    const c = h("div", "ix ix-es");
    const glyph = (g) => { const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 40 40"); svg.setAttribute("shape-rendering", "crispEdges"); svg.setAttribute("aria-hidden", "true");
      g.g.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "#") { const r = document.createElementNS(NS, "rect"); r.setAttribute("x", x * 8); r.setAttribute("y", y * 8); r.setAttribute("width", 7); r.setAttribute("height", 7); svg.appendChild(r); } })); return svg; };
    c.innerHTML = `
      <div class="es__card">
        <div class="es__stage">
          <button class="es__stack" type="button" aria-label="Shuffle the windows">
            ${[0, 1, 2].map((i) => `<span class="es__win" data-role="${i}"><i></i><i></i><i></i></span>`).join("")}
          </button>
        </div>
        <p class="es__msg">You currently have 0 Sessions.</p>
        <p class="es__sub">Think this is an error? Reach out on <a href="https://discord.com" target="_blank" rel="noopener">Discord.</a></p>
        <div class="es__foot"><span>adria.studio</span><span>steel.dev</span></div>
      </div>`;
    const stageEl = c.querySelector(".es__stage");
    GLYPHS.forEach((g, i) => { const b = h("span", "es__g"); b.style.cssText = `left:${g.x}px;top:${g.y}px;--c:${g.c};--r:${g.r}deg;--d:${g.d};--i:${i}`; b.appendChild(glyph(g)); b.addEventListener("pointerenter", () => { b.classList.remove("is-hop"); void b.offsetWidth; b.classList.add("is-hop"); }); stageEl.appendChild(b); });
    stage.appendChild(c);
    const f = fit(stage, c, 640, 640, 0.94);
    const wins = [...c.querySelectorAll(".es__win")], stack = c.querySelector(".es__stack");
    const roles = [0, 1, 2];
    const place = () => wins.forEach((w, i) => { w.dataset.role = roles[i]; });
    const shuffle = () => { for (let i = 0; i < roles.length; i++) roles[i] = (roles[i] + 1) % 3; place(); };
    stack.addEventListener("click", shuffle);
    const card = c.querySelector(".es__card");
    const move = (e) => { const r = card.getBoundingClientRect(); c.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3)); c.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3)); };
    const leave = () => { c.style.setProperty("--px", 0); c.style.setProperty("--py", 0); };
    if (!reduce) { card.addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") move(e); }); card.addEventListener("pointerleave", leave); }
    place();
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(c, () => {
      let on = true;
      (async () => { let k = 0; while (on) { await wait(2400); if (!on) return; shuffle(); const g = c.querySelectorAll(".es__g")[k++ % 5]; g.classList.remove("is-hop"); void g.offsetWidth; g.classList.add("is-hop"); } })();
      return () => { on = false; };
    });
    return () => { f.stop(); stopLoop && stopLoop(); };
  }


  // ── 18 · The Box: image tiles that fly in fast and settle slowly (GSAP) ──
  function theBox(stage, { auto }) {
    const W = 720, H = 520, g = window.gsap;
    const c = h("div", "ix ix-box");
    // x, y, w, h, artwork, crop (position and zoom)
    const T = [
      [250, -30, 175, 165, 12, "50% 30%"], [28, 150, 215, 215, 9, "50% 25%"], [585, -34, 125, 112, 11, "50% 40%"],
      [606, 92, 150, 235, 13, "40% 50%"], [452, 300, 172, 150, 4, "50% 20%"], [-34, 338, 130, 190, 6, "50% 20%"],
      [226, 362, 172, 178, 8, "50% 40%"], [122, 400, 96, 96, 5, "50% 60%"], [640, 348, 120, 150, 10, "50% 30%"],
    ];
    const els = T.map(([x, y, w, hh, n, crop]) => {
      const e = h("i", "bx__t"); e.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${hh}px;background:url(/assets/images/playground/photos/p${n}.webp) ${crop} / cover no-repeat`;
      c.appendChild(e); return e;
    });
    const title = h("p", "bx__title", 'THE BOX<sup>™</sup>'); c.appendChild(title);
    stage.appendChild(c);
    const f = fit(stage, c, W, H, 1.22);
    const stopVis = whileVisible(c, () => {
      if (!g) return () => {};
      // each tile starts far out along its own direction, then shoots home: expo.out is very fast, then suddenly slow
      const cx = W / 2, cy = H / 2;
      const from = T.map(([x, y, w, hh]) => { const dx = x + w / 2 - cx, dy = y + hh / 2 - cy, d = Math.hypot(dx, dy) || 1; return { x: (dx / d) * 900, y: (dy / d) * 700 }; });
      const tl = g.timeline({ repeat: -1, repeatDelay: 0.5 });
      tl.fromTo(els, { x: (i) => from[i].x, y: (i) => from[i].y, scale: 0.6, rotate: (i) => (i % 2 ? 7 : -7), opacity: 0 },
        { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, duration: 2.4, ease: "expo.out", stagger: { each: 0.08, from: "random" } }, 0);
      tl.fromTo(title, { opacity: 0, y: 26, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: "expo.out" }, 0.45);
      tl.to(els, { x: (i) => (i % 2 ? 7 : -7), y: (i) => (i % 3 ? -6 : 6), duration: 3.2, ease: "sine.inOut" }, ">-0.6");
      tl.to(els, { opacity: 0, scale: 0.92, duration: 0.5, ease: "power2.in", stagger: 0.03 }, ">+0.1");
      tl.to(title, { opacity: 0, duration: 0.35, ease: "power1.in" }, "<");
      return () => { tl.kill(); g.set([...els, title], { clearProps: "all" }); };
    });
    c.addEventListener("click", () => { if (g && !reduce) g.getTweensOf(els).forEach((t) => t.totalTime(0)); });
    return () => { f.stop(); stopVis(); g && g.killTweensOf([...els, title]); };
  }

  // ── 20 · Armillary sphere: a wireframe globe that turns by itself, can be dragged, and lights up under the pointer ──
  function armillary(stage, { auto }) {
    const g = window.gsap, root = h("div", "sp");
    const cv = h("canvas", "sp__cv"), card = h("div", "sp__card");
    const MSG = [
      "Every model needs an interface people trust. We design it.",
      "Agents act fast. People need to see why. We make that visible.",
      "Working prototypes beat decks. We ship the interface first.",
    ];
    card.innerHTML = '<svg class="sp__ico" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><circle cx="14" cy="14" r="10"/><ellipse cx="14" cy="14" rx="4.5" ry="10"/><ellipse cx="14" cy="14" rx="9" ry="10" opacity=".6"/><path d="M4.5 14h19M6 9h16M6 19h16M10 2l8 24" opacity=".7"/></svg><p class="sp__t"></p>';
    const txt = card.querySelector(".sp__t"); txt.textContent = MSG[0];
    root.append(cv, card); stage.appendChild(root);
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1;
    const ro = new ResizeObserver(() => { const r = stage.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1); cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; draw(); });
    ro.observe(stage);

    const S = { yaw: 0.6, pitch: -0.28, vy: 0, vp: 0, ring: 0, px: -999, py: -999, drag: false, ox: 0, oy: 0, moved: 0 };
    const SPIN = 0.16;
    const rot = (x, y, z) => { // yaw about the vertical axis, then pitch about the horizontal one
      const cy = Math.cos(S.yaw), sy = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      return [x1, y1, z2];
    };
    // a circle on the sphere: a great or small circle given by its normal tilt, as points
    const circle = (fn, n) => Array.from({ length: n }, (_, i) => fn((i / n) * Math.PI * 2));
    const LINES = [];
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI; LINES.push({ r: 1, pts: circle((t) => [Math.cos(t) * Math.cos(a), Math.sin(t), Math.cos(t) * Math.sin(a)], 72), dots: 24 }); }
    [-50, 0, 50].forEach((lat) => { const la = (lat * Math.PI) / 180; LINES.push({ r: 1, pts: circle((t) => [Math.cos(la) * Math.cos(t), Math.sin(la), Math.cos(la) * Math.sin(t)], 72), dots: 24 }); });
    // three wider orbits, each tilted and drifting on its own
    const ORB = [[1.2, 0.5, 0.2, 0.05], [1.3, -0.9, 0.9, -0.04], [1.16, 1.2, -0.4, 0.03]].map(([r, tx, tz, sp2], i) => ({ r, tx, tz, sp2, pts: circle((t) => [Math.cos(t), 0, Math.sin(t)], 90), dots: 28 }));
    const orbRot = (o, p) => { const [x, y, z] = p; const cx = Math.cos(o.tx), sx = Math.sin(o.tx), cz = Math.cos(o.tz + S.ring * o.sp2 * 4), sz = Math.sin(o.tz + S.ring * o.sp2 * 4); const y1 = y * cx - z * sx, z1 = y * sx + z * cx; return [x * cz - y1 * sz, x * sz + y1 * cz, z1]; };
    const GRAY = [205, 205, 205];
    function draw() {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W * 0.46, H * 0.4);
      const P = (x, y, z) => [cx + x * R, cy - y * R];
      const near = (X, Y) => { const d = Math.hypot(X - S.px, Y - S.py); return Math.exp(-(d * d) / (R * R * 0.045)); };
      const path = (pts, front) => { // draw only the visible side (or the hidden one, lighter)
        ctx.beginPath(); let pen = false;
        pts.forEach(([x, y, z]) => { const vis = front ? z >= -0.05 : z < 0.05; if (!vis) { pen = false; return; } const [X, Y] = P(x, y, z); pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true; });
        ctx.stroke();
      };
      const set = (a) => { ctx.strokeStyle = `rgba(${GRAY[0]},${GRAY[1]},${GRAY[2]},${a})`; };
      const dot = (x, y, z, a) => { const [X, Y] = P(x, y, z), n = near(X, Y), r = 2.4 + n * 3.2; ctx.fillStyle = n > 0.05 ? `rgba(${Math.round(205 - 150 * n)},${Math.round(205 - 150 * n)},${Math.round(205 - 150 * n)},${Math.min(1, a + n)})` : `rgba(${GRAY[0]},${GRAY[1]},${GRAY[2]},${a})`; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); };
      ctx.lineWidth = 1.4; ctx.lineCap = "round";
      LINES.forEach((L) => {
        const pts = L.pts.map(([x, y, z]) => rot(x, y, z));
        set(0.28); path(pts, false); set(1); path(pts, true);
        for (let i = 0; i < L.dots; i++) { const q = pts[Math.round((i / L.dots) * (pts.length - 1))]; if (q[2] >= -0.02) dot(q[0], q[1], q[2], 1); }
      });
      ORB.forEach((O) => {
        const pts = O.pts.map(([x, y, z]) => { const q = orbRot(O, [x * O.r, y * O.r, z * O.r]); return rot(q[0], q[1], q[2]); });
        set(0.35); path(pts, false); set(0.9); path(pts, true);
        for (let i = 0; i < O.dots; i++) { const q = pts[Math.round((i / O.dots) * (pts.length - 1))]; if (q[2] >= -0.02) dot(q[0], q[1], q[2], 0.9); }
      });
      // the silhouette ring with its ticks: it turns with the sphere, and the ticks are uneven so you can see it
      ctx.strokeStyle = "rgb(205,205,205)"; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      ctx.lineWidth = 3;
      const T = 120;
      for (let i = 0; i < T; i++) {
        const a = (i / T) * Math.PI * 2 + S.ring, len = R * (0.05 + 0.07 * (0.5 + 0.5 * Math.sin(i * 0.45 + 1.3)) * (0.55 + 0.45 * Math.sin(a * 2 - 0.6))), lean = 0.22;
        const px0 = cx + Math.cos(a) * (R + 5), py0 = cy + Math.sin(a) * (R + 5), n = near(px0, py0);
        ctx.strokeStyle = `rgb(${Math.round(205 - 120 * n)},${Math.round(205 - 120 * n)},${Math.round(205 - 120 * n)})`;
        ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(cx + Math.cos(a + lean * (len / R) * 4) * (R + 5 + len + n * 6), cy + Math.sin(a + lean * (len / R) * 4) * (R + 5 + len + n * 6)); ctx.stroke();
      }
    }

    // pointer: drag to turn it (with momentum), hover to light the dots under the pointer
    const pos = (e) => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.style.touchAction = "pan-y";
    cv.addEventListener("pointerdown", (e) => { S.drag = true; S.moved = 0; [S.ox, S.oy] = pos(e); cv.setPointerCapture(e.pointerId); S.vy = 0; S.vp = 0; });
    cv.addEventListener("pointermove", (e) => {
      const [x, y] = pos(e); S.px = x; S.py = y;
      if (S.drag) { const dx = x - S.ox, dy = y - S.oy; S.moved += Math.abs(dx) + Math.abs(dy); S.yaw += dx * 0.007; S.pitch = Math.max(-1.2, Math.min(1.2, S.pitch + dy * 0.007)); S.vy = dx * 0.007 * 60; S.vp = dy * 0.007 * 60; S.ox = x; S.oy = y; }
      if (reduce || !g) draw();
    });
    const end = () => { S.drag = false; };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    cv.addEventListener("pointerleave", () => { S.px = S.py = -999; if (reduce || !g) draw(); });
    stage.addEventListener("click", (e) => { if (S.moved > 4) { e.stopPropagation(); e.preventDefault(); S.moved = 0; } }, true); // a drag is not a click on the tile
    // the card: its line changes on a timer, and on click in the overlay
    let mi = 0;
    const say = (i) => { mi = (i + MSG.length) % MSG.length; if (!g || reduce) { txt.textContent = MSG[mi]; return; } g.to(txt, { opacity: 0, y: -6, duration: 0.25, ease: "power2.in", onComplete: () => { txt.textContent = MSG[mi]; g.fromTo(txt, { y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }); } }); };
    if (!auto) card.addEventListener("click", (e) => { e.stopPropagation(); say(mi + 1); }), card.classList.add("is-live");

    const stopVis = whileVisible(root, () => {
      if (!g) return () => {};
      const timer = g.delayedCall(4.6, function again() { say(mi + 1); timer2 = g.delayedCall(4.6, again); }); let timer2 = null;
      const tick = (time, dt) => {
        const s = Math.min(0.05, dt / 1000);
        if (!S.drag) { // momentum decays toward the slow idle spin
          S.yaw += (S.vy + SPIN) * s; S.pitch = Math.max(-1.2, Math.min(1.2, S.pitch + S.vp * s));
          S.vy *= Math.exp(-s * 2.4); S.vp *= Math.exp(-s * 2.4);
          S.pitch += (-0.28 - S.pitch) * (1 - Math.exp(-s * 0.5));  // and the tilt drifts back to rest
        }
        S.ring += s * 0.12; draw();
      };
      g.ticker.add(tick);
      return () => { timer.kill(); timer2 && timer2.kill(); g.ticker.remove(tick); };
    });
    return () => { ro.disconnect(); stopVis(); g && g.killTweensOf(txt); };
  }

  // ── 21 · Media tray: a stack of cards that fans out on hover; tap a card to lift it, play the memo, add more with + (GSAP) ──
  function mediaTray(stage, { auto }) {
    const W = 700, H = 330, g = window.gsap, A = 440, CW = 108;
    const c = h("div", "ix ix-mt");
    const tray = h("div", "mt__tray"), stack = h("div", "mt__stack"), plus = h("button", "mt__plus", '<i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></i>');
    plus.type = "button"; plus.setAttribute("aria-label", "Add a card");
    tray.append(stack, plus); c.appendChild(tray); stage.appendChild(c);
    const f = fit(stage, c, W, H, 0.98);
    const bars = Array.from({ length: 23 }, (_, i) => `<b style="--h:${[10, 18, 30, 14, 36, 22, 44, 30, 16, 40, 26, 48, 24, 38, 16, 34, 20, 42, 14, 28, 12, 22, 8][i]}px"></b>`).join("");
    const photo = (n) => `<span class="mt__ph" style="background:url(/assets/images/playground/photos/p${n}.webp) 50% 30% / cover no-repeat"></span>`;
    const KINDS = {
      photo1: () => photo(5),
      note: () => '<span class="mt__note"><b>I had an incredible weekend at Yosemite. The views were absolutely breathtaking, and I can\u2019t wait to hike more.</b></span>',
      photo2: () => photo(13),
      voice: () => `<span class="mt__voice"><span class="mt__wave">${bars}</span><span class="mt__prog"><i></i></span></span>`,
    };
    const cards = [];
    let spread = 0, lifted = null, uid = 0;
    const step = (n) => { const full = Math.min(122, (A - CW) / Math.max(1, n - 1)), col = Math.min(44, (A - CW) / Math.max(1, n - 1)); return col + (full - col) * spread; };
    const place = (animate) => {
      const n = cards.length, st = step(n);
      cards.forEach((C, i) => { const x = 16 + i * st, y = C === lifted ? -14 : 0; C.el.style.zIndex = C === lifted ? 60 : i + 1; if (!animate || !g) g && g.set(C.el, { x, y }); else C.x = x, C.y = y; });
    };
    const apply = () => { const n = cards.length, st = step(n); cards.forEach((C, i) => g.set(C.el, { x: 16 + i * st, y: C === lifted ? -14 : (C.y || 0) * 0 })); cards.forEach((C, i) => { C.el.style.zIndex = C === lifted ? 60 : i + 1; }); };
    const addCard = (kind, fromPlus) => {
      const C = { kind, id: ++uid, el: h("div", `mt__c mt__c--${kind.replace(/\d+$/, "").replace("-", "")}`, kind.startsWith("photo-") ? photo(+kind.slice(6)) : KINDS[kind]()) };
      C.el.dataset.k = kind; stack.appendChild(C.el); cards.push(C);
      if (g) { g.set(C.el, { x: 16 + (cards.length - 1) * step(cards.length), y: 0 }); if (fromPlus) g.fromTo(C.el, { x: 460, scale: 0.7, opacity: 0 }, { x: 16 + (cards.length - 1) * step(cards.length), scale: 1, opacity: 1, duration: 1.1, ease: "expo.out", overwrite: "auto" }); }
      return C;
    };
    ["photo1", "note", "photo2", "voice"].forEach((k) => addCard(k));
    apply();
    const setSpread = (v, dur = 0.9) => { if (!g || reduce) { spread = v; apply(); return; } g.to({ v: spread }, { v, duration: dur, ease: v ? "expo.out" : "power3.inOut", onUpdate() { spread = this.targets()[0].v; apply(); } }); };
    stack.addEventListener("pointerenter", () => setSpread(1)); stack.addEventListener("pointerleave", () => { lifted = null; setSpread(0, 1.1); });
    // tap a card: lift it to the front (tap again to put it down); the voice memo plays and pauses
    let playing = false, ptw = null, wtw = null;
    const voice = () => cards.find((C) => C.kind === "voice");
    const setPlay = (on) => {
      const V = voice(); if (!V || !g) return; playing = on; wtw && wtw.kill(); ptw && ptw.kill();
      const bs = V.el.querySelectorAll(".mt__wave b"), pr = V.el.querySelector(".mt__prog i");
      if (on && !reduce) { wtw = g.to(bs, { scaleY: () => 0.35 + Math.random() * 0.75, duration: 0.28, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: { each: 0.03, from: "center", repeat: -1, yoyo: true } }); ptw = g.fromTo(pr, { scaleX: 0.1 }, { scaleX: 1, duration: 9, ease: "none", onComplete: () => setPlay(false) }); }
      else g.to(bs, { scaleY: 1, duration: 0.4, ease: "power3.out", overwrite: true });
    };
    stack.addEventListener("click", (e) => {
      const el = e.target.closest(".mt__c"); if (!el) return; e.stopPropagation();
      const C = cards.find((x) => x.el === el); lifted = lifted === C ? null : C; apply();
      if (g) cards.forEach((x) => g.to(x.el, { y: x === lifted ? -14 : 0, scale: x === lifted ? 1.04 : 1, duration: 0.6, ease: "back.out(1.4)", overwrite: "auto" }));
      if (C.kind === "voice") setPlay(!playing);
    });
    // + adds a card that flies in from the button; the oldest leaves when the tray is full
    plus.addEventListener("click", (e) => {
      e.stopPropagation();
      if (g && !reduce) g.fromTo(plus.firstChild, { rotate: 0 }, { rotate: 90, duration: 0.7, ease: "expo.out" });
      if (cards.length >= 6) { const old = cards.splice(0, 1)[0]; g ? g.to(old.el, { x: "-=60", opacity: 0, scale: 0.85, duration: 0.5, ease: "power2.in", onComplete: () => old.el.remove() }) : old.el.remove(); }
      addCard("photo-" + (1 + Math.floor(Math.random() * 14)), true); lifted = null; setSpread(1, 0.8); apply();
      const n2 = cards.length; cards.forEach((C2, i) => g && g.to(C2.el, { x: 16 + i * step(n2), duration: 0.8, ease: "expo.out", overwrite: "auto" }));
    });
    const stopVis = whileVisible(c, () => {
      if (!g) return () => {};
      if (auto) setPlay(true);
      // idle hint for anyone not touching it: the stack opens, the memo plays, then it closes again
      const tl = g.timeline({ repeat: -1, repeatDelay: 1.2, delay: 1.2 });
      tl.call(() => setSpread(1, 1.1)).to({}, { duration: 2.4 }).call(() => { if (!stack.matches(":hover")) setSpread(0, 1.2); }).to({}, { duration: 3.6 });
      return () => { tl.kill(); setPlay(false); };
    });
    return () => { f.stop(); stopVis(); g && g.killTweensOf([...cards.map((x) => x.el), plus]); };
  }

  // ── 22 · Word wheel: a vertical picker where the centre card is large and the rest recede; drag, wheel, arrows or tap (GSAP) ──
  function wordWheel(stage, { auto }) {
    const W = 520, H = 485, g = window.gsap;
    const WORDS = [
      ["syncing", "#9CFF6B", "#3B5BF5", "dot"], ["updating", "#7A1F2B", "#F7C9E8", "ring"], ["scheduling", "#FF4A12", "#E0F95A", "halo", "#E8C6F5"],
      ["reviewing", "#245A4A", "#F5F26B", "ring"], ["organizing", "#D9F25A", "#E9C6F6", "ring2", "#4A64E8"], ["drafting", "#3F3A8F", "#FFC9A8", "ring"], ["planning", "#0F8B8D", "#FFF1C9", "dot"],
    ];
    const N = WORDS.length, c = h("div", "ix ix-ww");
    const icon = ([, a, b, kind, c2]) => kind === "halo" ? `<i class="ww__i" style="--a:${a};--b:${b};--c:${c2}"><u></u></i>` : `<i class="ww__i ww__i--${kind}" style="--a:${a};--b:${b};--c:${c2 || a}"><u></u></i>`;
    const rows = WORDS.map((w, i) => { const r = h("div", "ww__r", `${icon(w)}<span>${w[0]}</span>`); r.dataset.i = i; c.appendChild(r); return r; });
    stage.appendChild(c);
    const f = fit(stage, c, W, H, 1.0);
    const S = { pos: 2, vel: 0 };
    const wrap = (d) => ((d + N / 2) % N + N) % N - N / 2;
    const layout = () => rows.forEach((r, i) => {
      const d = wrap(i - S.pos), a = Math.abs(d);
      const y = d * 92 + Math.sign(d) * Math.max(0, a - 1) * -6, w = 410 - Math.min(a, 2.2) * 26, hh = 96 - Math.min(a, 2.2) * 8;
      r.style.cssText = `width:${w}px;height:${hh}px;transform:translate(-50%, calc(-50% + ${y}px));opacity:${Math.max(0, Math.min(1, 2.7 - a)).toFixed(3)};z-index:${Math.round(100 - a * 10)}`;
      r.style.setProperty("--f", Math.max(0, 1 - a).toFixed(3));  // focus 0..1: drives the icon size and the ink
    });
    layout();
    const goTo = (target) => { if (!g || reduce) { S.pos = target; layout(); return; } g.to(S, { pos: target, duration: 0.9, ease: "expo.out", overwrite: true, onUpdate: layout }); };
    const snap = () => goTo(Math.round(S.pos));
    // drag: the wheel follows the finger, throws with momentum and lands on a card
    let down = false, y0 = 0, p0 = 0, lastY = 0, lastT = 0, moved = 0;
    c.style.touchAction = "pan-x";
    c.addEventListener("pointerdown", (e) => { down = true; moved = 0; y0 = lastY = e.clientY; lastT = performance.now(); p0 = S.pos; S.vel = 0; g && g.killTweensOf(S); c.setPointerCapture(e.pointerId); });
    c.addEventListener("pointermove", (e) => { if (!down) return; const sc = c.getBoundingClientRect().height / H || 1; moved += Math.abs(e.clientY - lastY); S.pos = p0 - (e.clientY - y0) / (92 * sc); const now = performance.now(); S.vel = (-(e.clientY - lastY) / (92 * sc)) / Math.max(1, now - lastT) * 1000; lastY = e.clientY; lastT = now; layout(); });
    const up = () => { if (!down) return; down = false; const t = Math.round(S.pos + S.vel * 0.18); goTo(t); };
    c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up);
    c.addEventListener("click", (e) => { if (moved > 6) { e.stopPropagation(); return; } const r = e.target.closest(".ww__r"); if (!r) return; const d = wrap(+r.dataset.i - S.pos); if (Math.abs(d) > 0.3) { e.stopPropagation(); goTo(S.pos + Math.round(d)); } }, true);
    if (!auto) { // in the overlay the wheel and the arrow keys also drive it
      let acc = 0; c.addEventListener("wheel", (e) => { e.preventDefault(); acc += e.deltaY; if (Math.abs(acc) > 40) { goTo(Math.round(S.pos) + Math.sign(acc)); acc = 0; } }, { passive: false });
      const key = (e) => { if (e.key === "ArrowDown") goTo(Math.round(S.pos) + 1); if (e.key === "ArrowUp") goTo(Math.round(S.pos) - 1); };
      document.addEventListener("keydown", key); c.__key = key;
    }
    let hot = false; c.addEventListener("pointerenter", () => { hot = true; }); c.addEventListener("pointerleave", () => { hot = false; });
    const stopVis = whileVisible(c, () => {
      if (!g) return () => {};
      const t = g.delayedCall(2.3, function again() { if (!hot && !down) goTo(Math.round(S.pos) + 1); t2 = g.delayedCall(2.3, again); }); let t2 = null;
      return () => { t.kill(); t2 && t2.kill(); };
    });
    return () => { f.stop(); stopVis(); g && g.killTweensOf(S); c.__key && document.removeEventListener("keydown", c.__key); };
  }

  // ── 23 · Archive search: a globe of image tiles you can turn, with a search bar that finds and rotates to matches (GSAP) ──
  function archiveSearch(stage, { auto }) {
    const W = 560, H = 420, g = window.gsap, R = 214, TS = 104;
    // one tag per photo (p1..p14)
    const PT = ["footwear", "portrait", "bag", "coat", "leather", "navy", "knit", "loafer", "bomber", "purple", "orange", "studio", "bag", "tee"];
    const c = h("div", "ix ix-as"), clip = h("div", "as__clip"), scene = h("div", "as__scene"), globe = h("div", "as__globe");
    const tiles = []; let idx = 0;
    // seamless: each row's tiles are cut to the exact chord between neighbours (plus a hair of overlap), rows touch, and the poles are covered
    const ROW = 25, TH = 2 * R * Math.sin(((ROW / 2) * Math.PI) / 180) + 2;
    [-75, -50, -25, 0, 25, 50, 75].forEach((lat, row) => {
      const cl2 = Math.cos((lat * Math.PI) / 180), n = Math.max(4, Math.round(14 * cl2)), TW = 2 * R * cl2 * Math.sin(Math.PI / n) + 2;
      for (let k = 0; k < n; k++) {
        const ph = (idx * 5 + row * 3) % 14, lon = (k / n) * 360 + (row % 2 ? 180 / n : 0), tag = PT[ph];
        const el = h("div", "as__t"), im = h("i");
        im.style.background = `url(/assets/images/playground/photos/p${ph + 1}.webp) 50% 30% / cover no-repeat`;
        el.style.width = `${TW.toFixed(1)}px`; el.style.height = `${TH.toFixed(1)}px`;
        el.style.transform = `translate(-50%, -50%) rotateY(${lon}deg) rotateX(${-lat}deg) translateZ(${R}px)`;
        el.appendChild(im); globe.appendChild(el); tiles.push({ el, im, lat, lon, tag }); idx++;
      }
    });
    scene.appendChild(globe); clip.appendChild(scene); c.appendChild(clip);
    // floating tiles around the edge: each one searches its own tag when tapped
    const FL = [[16, 36, 66, 66, 13], [-12, 150, 66, 84, 11], [30, 300, 72, 72, 8], [488, 40, 72, 72, 10], [498, 172, 66, 88, 5], [470, 306, 70, 58, 12]];
    const floats = FL.map(([x, y, w, hh, n], i) => {
      const e = h("button", "as__f"); e.type = "button"; e.setAttribute("aria-label", `Search ${PT[n - 1]}`); e.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${hh}px;background:url(/assets/images/playground/photos/p${n}.webp) 50% 30% / cover no-repeat`;
      e.dataset.tag = PT[n - 1]; c.appendChild(e); return e;
    });
    const bar = h("label", "as__bar", '<svg class="as__mag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg><span class="as__txt"><em></em><i class="as__caret"></i></span><input class="as__in" type="text" aria-label="Search the archive" autocomplete="off" spellcheck="false"><button type="button" class="as__go" aria-label="Spin the globe"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="3.4" ry="8"/><path d="M4 12h16M5.6 8h12.8M5.6 16h12.8"/></svg></button>');
    c.appendChild(bar); stage.appendChild(c);
    const f = fit(stage, c, W, H, 1.0);
    const input = bar.querySelector(".as__in"), em = bar.querySelector(".as__txt em"), go = bar.querySelector(".as__go");
    const PLACE = "Search the archive";
    const S = { yaw: -20, pitch: -8, px: 0, py: 0 };
    let q = "", demoOn = true, down = false, vy = 0, vp = 0, moved = 0, ox = 0, oy = 0, idle = true;
    const paint = () => { globe.style.transform = `rotateX(${S.pitch + S.py * 5}deg) rotateY(${S.yaw + S.px * 7}deg)`; };
    const show = () => { em.textContent = q || PLACE; bar.classList.toggle("is-empty", !q); };
    const match = () => {
      const k = q.trim().toLowerCase(); let first = null;
      tiles.forEach((T) => { const on = !k || T.tag.startsWith(k) || T.tag.includes(k); T.on = on; if (on && !first && k) first = T; if (g) g.to(T.im, { opacity: on ? 1 : 0.28, scale: on ? 1 : 0.9, duration: 0.5, ease: "power3.out", overwrite: "auto" }); else T.im.style.opacity = on ? 1 : 0.28; });
      if (first) { // bring the first match to the front by the short way round
        let ty = -first.lon, d = ((ty - S.yaw) % 360 + 540) % 360 - 180; ty = S.yaw + d;
        g && !reduce ? g.to(S, { yaw: ty, pitch: -first.lat * 0.8, duration: 1.4, ease: "expo.out", overwrite: "auto", onUpdate: paint }) : (S.yaw = ty, S.pitch = -first.lat * 0.8, paint());
      }
    };
    const setQ = (v) => { q = v; show(); match(); };
    show(); paint();
    // typing, for real
    input.addEventListener("input", () => { demoOn = false; setQ(input.value); });
    input.addEventListener("focus", () => { demoOn = false; bar.classList.add("is-focus"); }); input.addEventListener("blur", () => bar.classList.remove("is-focus"));
    bar.addEventListener("click", (e) => { e.stopPropagation(); if (e.target.closest(".as__go")) return; input.focus(); });
    go.addEventListener("click", (e) => { e.stopPropagation(); demoOn = false; if (g && !reduce) { vy = 0; g.to(S, { yaw: S.yaw + 360, duration: 1.6, ease: "expo.out", overwrite: "auto", onUpdate: paint }); } });
    floats.forEach((e) => e.addEventListener("click", (ev) => { ev.stopPropagation(); demoOn = false; input.value = e.dataset.tag; setQ(e.dataset.tag); }));
    // drag the globe; it keeps turning, and leans toward the pointer
    scene.style.touchAction = "pan-y";
    scene.addEventListener("pointerdown", (e) => { down = true; moved = 0; ox = e.clientX; oy = e.clientY; vy = vp = 0; demoOn = false; scene.setPointerCapture(e.pointerId); g && g.killTweensOf(S); });
    scene.addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - ox, dy = e.clientY - oy; moved += Math.abs(dx) + Math.abs(dy); S.yaw += dx * 0.45; S.pitch = Math.max(-50, Math.min(50, S.pitch - dy * 0.3)); vy = dx * 0.45 * 60; vp = -dy * 0.3 * 60; ox = e.clientX; oy = e.clientY; paint(); });
    const up = () => { down = false; }; scene.addEventListener("pointerup", up); scene.addEventListener("pointercancel", up);
    stage.addEventListener("click", (e) => { if (moved > 4) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
    stage.addEventListener("pointermove", (e) => { const r = stage.getBoundingClientRect(); const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1; g && !reduce && (g.to(S, { px: nx, py: ny, duration: 0.8, ease: "power3.out", overwrite: false, onUpdate: paint })); });

    const stopVis = whileVisible(c, () => {
      if (!g) return () => {};
      const tick = (t, dt) => { const s = Math.min(0.05, dt / 1000); if (!down) { S.yaw += (vy + 5) * s; S.pitch = Math.max(-50, Math.min(50, S.pitch + vp * s)); vy *= Math.exp(-s * 2.2); vp *= Math.exp(-s * 2.2); S.pitch += (-8 - S.pitch) * (1 - Math.exp(-s * 0.4)); paint(); } };
      g.ticker.add(tick);
      const bobs = floats.map((e, i) => g.to(e, { y: i % 2 ? -7 : 7, duration: 2.6 + i * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true }));
      // a demo for anyone not touching it: type a word, let the globe turn to the matches, clear, and try another
      let run = 0;
      const sleep = (ms) => new Promise((res) => g.delayedCall(ms / 1000, res));
      (async () => {
        const id = ++run, words = ["leather", "bag", "knit", "orange"]; let n = 0;
        await sleep(1400);
        while (id === run && demoOn && auto) {
          const w = words[n++ % words.length];
          for (let i = 1; i <= w.length && demoOn && id === run; i++) { setQ(w.slice(0, i)); await sleep(150); }
          await sleep(2600); if (!demoOn || id !== run) break;
          for (let i = w.length - 1; i >= 0 && demoOn && id === run; i--) { setQ(w.slice(0, i)); await sleep(60); }
          await sleep(1100);
        }
      })();
      return () => { run++; g.ticker.remove(tick); bobs.forEach((b) => b.kill()); };
    });
    return () => { f.stop(); stopVis(); g && (g.killTweensOf(S), tiles.forEach((T) => g.killTweensOf(T.im))); };
  }

  // ── Stageshow-style scripted cursor, shared: a shallow arc timed by distance on the travel curve, a visible press, aims measured live ──
  function stageCursor(stage, g) {
    const cub = (x1, y1, x2, y2) => (t) => { let q = t; for (let i = 0; i < 8; i++) { const x = 3 * (1 - q) * (1 - q) * q * x1 + 3 * (1 - q) * q * q * x2 + q * q * q - t, dx = 3 * (1 - q) * (1 - q) * x1 + 6 * (1 - q) * q * (x2 - x1) + 3 * q * q * (1 - x2); if (Math.abs(dx) < 1e-6) break; q -= x / dx; } q = Math.max(0, Math.min(1, q)); return 3 * (1 - q) * (1 - q) * q * y1 + 3 * (1 - q) * q * q * y2 + q * q * q; };
    const ease = cub(0.45, 0, 0.1, 1), live = new Set(), pos = { x: 0, y: 0 };
    const el = h("div", "sc__cur", '<svg viewBox="0 0 16 22" width="20" height="28" aria-hidden="true"><path d="M1.5 1.5v15.2l3.7-3.4 2.6 6 2.7-1.2-2.6-5.9h5.1z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/></svg>');
    stage.appendChild(el); g.set(el, { opacity: 0 });
    const track = (tw) => (live.add(tw), tw);
    const api = {
      el,
      at: (t, fx = 0.5, fy = 0.5) => { const r = t.getBoundingClientRect(), b = stage.getBoundingClientRect(); return { x: r.left - b.left + r.width * fx, y: r.top - b.top + r.height * fy }; },
      sleep: (ms) => new Promise((res) => track(g.delayedCall(ms / 1000, res))),
      place: (x, y) => { pos.x = x; pos.y = y; g.set(el, { x, y, scale: 1 }); },
      show: () => track(g.to(el, { opacity: 1, duration: 0.35 })),
      hide: () => track(g.to(el, { opacity: 0, duration: 0.35 })),
      travel: (target) => new Promise((res) => {
        const a = { x: pos.x, y: pos.y }, d0 = target(), k = { v: 0 };
        const dur = Math.min(1.4, 0.42 + Math.hypot(d0.x - a.x, d0.y - a.y) / 520);
        track(g.to(k, { v: 1, duration: dur, ease, onUpdate: () => {
          const b = target(), t = k.v, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, arc = Math.sin(Math.PI * t) * Math.min(36, len * 0.12);
          pos.x = a.x + dx * t - (dy / len) * arc; pos.y = a.y + dy * t + (dx / len) * arc; g.set(el, { x: pos.x, y: pos.y });
        }, onComplete: res }));
      }),
      press: async () => { track(g.to(el, { scale: 0.84, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "0 0" })); await api.sleep(220); },
      stop: () => { live.forEach((t) => t.kill()); live.clear(); g.to(el, { opacity: 0, duration: 0.25 }); },
    };
    return api;
  }

  // ── 24 · Story reactions: stacked stories with progress, tap to move through them, double-tap or ♥ to burst, reply with an emoji (GSAP) ──
  function storyReactions(stage, { auto }) {
    const W = 560, H = 500, g = window.gsap, P = "/assets/images/playground/photos/p";
    const STORIES = [[9, "Leather bomber"], [5, "Shearling jacket"], [13, "Python tote"], [12, "Striped shirt"], [10, "Purple puffer"], [7, "Fair Isle polo"]];
    const EMO = ["🔮", "👀", "🤯", "😍", "🔥"];
    const c = h("div", "ix ix-sr");
    // stickers around the stack (from the references): a speech bubble that collects reactions, a heart, a close-friends chip, an avatar ring
    const bubble = h("div", "sr__bubble", "<span>🔮</span><span>👀</span><span>🤯</span>");
    const heartS = h("i", "sr__heart", '<svg viewBox="0 0 48 44" aria-hidden="true"><defs><linearGradient id="srh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7A1A"/><stop offset="1" stop-color="#E5139A"/></linearGradient></defs><path d="M24 43 5.6 25.2C-1.3 18.6 1.9 4.4 12.8 4.4c5 0 8.6 3 11.2 7 2.6-4 6.2-7 11.2-7 10.9 0 14.1 14.2 7.2 20.8z" fill="url(#srh)"/></svg>');
    const chip = h("i", "sr__chip", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="#fff"/></svg><b>✓</b>');
    const avatar = h("i", "sr__avatar"); avatar.style.backgroundImage = `url(${P}4.webp)`;
    const face1 = h("i", "sr__face", "😊"), face2 = h("i", "sr__face sr__face--b", "😍");
    // three cards: left, centre, right; the centre one is the story you are watching
    const SEG = STORIES.map(() => "<i><b></b></i>").join("");
    const mk = () => { const el = h("div", "sr__card", `<span class="sr__ph"></span><span class="sr__seg">${SEG}</span><span class="sr__tag">🏷 <em></em></span><span class="sr__cmt"><i></i><em>Love it! Going to try it out.</em></span><span class="sr__bot"><button type="button" class="sr__reply">Send message</button><button type="button" class="sr__like" aria-label="Like"><svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.6 3.4 12.3C.3 9.3 1.8 3 6.7 3c2.4 0 4 1.4 5.3 3.2C13.3 4.4 14.9 3 17.3 3c4.9 0 6.4 6.3 3.3 9.3z"/></svg></button></span><span class="sr__tray">${EMO.map((e) => `<button type="button" data-e="${e}">${e}</button>`).join("")}</span><span class="sr__big"><svg viewBox="0 0 48 44"><path d="M24 43 5.6 25.2C-1.3 18.6 1.9 4.4 12.8 4.4c5 0 8.6 3 11.2 7 2.6-4 6.2-7 11.2-7 10.9 0 14.1 14.2 7.2 20.8z" fill="#fff"/></svg></span>`); return { el, story: 0 }; };
    const cards = [mk(), mk(), mk()];
    c.append(heartS, face1, ...cards.map((k) => k.el), bubble, chip, avatar, face2); stage.appendChild(c);
    const f = fit(stage, c, W, H, 1.0);
    const SLOT = { L: { x: -150, s: 0.84, r: -5, z: 1 }, C: { x: 0, s: 1, r: 0, z: 3 }, R: { x: 150, s: 0.84, r: 5, z: 2 } };
    let order = [cards[0], cards[1], cards[2]], cur = 1, liked = new Set();
    const fill = (k, i) => {
      k.story = (i + STORIES.length) % STORIES.length; const [n, tag] = STORIES[k.story];
      k.el.querySelector(".sr__ph").style.backgroundImage = `url(${P}${n}.webp)`; k.el.querySelector(".sr__tag em").textContent = tag;
      k.el.querySelectorAll(".sr__seg b").forEach((b, j) => (b.style.transform = `scaleX(${j < k.story ? 1 : 0})`));
      k.el.classList.toggle("is-liked", liked.has(k.story)); k.el.classList.remove("is-cmt", "is-tray");
    };
    fill(order[0], cur - 1); fill(order[1], cur); fill(order[2], cur + 1);
    const slotOf = (k) => ["L", "C", "R"][order.indexOf(k)];
    const put = (k, anim, d = 0) => { const S = SLOT[slotOf(k)]; k.el.style.zIndex = S.z; if (!g || !anim || reduce) { g ? g.set(k.el, { x: S.x, scale: S.s, rotate: S.r }) : (k.el.style.transform = `translateX(${S.x}px) scale(${S.s}) rotate(${S.r}deg)`); return; } g.to(k.el, { x: S.x, scale: S.s, rotate: S.r, duration: 0.85, ease: "expo.out", delay: d, overwrite: "auto" }); };
    cards.forEach((k) => put(k, false));
    // progress: the current segment of the centre card fills; when it ends, the next story comes forward
    let prog = null;
    const startProg = () => {
      prog && prog.kill(); const k = order[1], seg = k.el.querySelectorAll(".sr__seg b")[k.story];
      if (!g || reduce) { seg.style.transform = "scaleX(1)"; return; }
      prog = g.fromTo(seg, { scaleX: 0 }, { scaleX: 1, duration: 9, ease: "none", onComplete: () => go(1) });
      if (!running) prog.pause();
    };
    const go = (dir) => {
      cur += dir; const front = order[1];
      if (dir > 0) { order = [front, order[2], order[0]]; fill(order[2], cur + 1); }
      else { order = [order[2], order[0], front]; fill(order[0], cur - 1); }
      fill(order[1], cur);
      // the card that travels around the back changes behind the others, so it never swaps in view
      cards.forEach((k) => { if (k !== order[1] && k !== front) k.el.style.zIndex = 0; });
      cards.forEach((k) => put(k, true));
      startProg();
    };
    // likes: the ♥ fills with a pop, a big heart blooms on the photo, small hearts float up, and a comment arrives
    const burst = (k) => {
      liked.add(k.story); k.el.classList.add("is-liked");
      if (!g || reduce) { k.el.classList.add("is-cmt"); return; }
      const like = k.el.querySelector(".sr__like"), big = k.el.querySelector(".sr__big");
      g.fromTo(like, { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
      g.fromTo(big, { scale: 0.2, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.55, ease: "back.out(2.2)" });
      g.to(big, { scale: 1.12, opacity: 0, duration: 0.4, ease: "power2.in", delay: 0.75 });
      for (let i = 0; i < 7; i++) {
        const p = h("i", "sr__p", '<svg viewBox="0 0 48 44"><path d="M24 43 5.6 25.2C-1.3 18.6 1.9 4.4 12.8 4.4c5 0 8.6 3 11.2 7 2.6-4 6.2-7 11.2-7 10.9 0 14.1 14.2 7.2 20.8z" fill="url(#srh)"/></svg>'); k.el.appendChild(p);
        g.fromTo(p, { x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }, { x: (Math.random() - 0.5) * 140, y: -120 - Math.random() * 120, scale: 0.7 + Math.random() * 0.6, rotate: (Math.random() - 0.5) * 60, opacity: 0, duration: 1.2 + Math.random() * 0.5, ease: "power2.out", delay: i * 0.04, onComplete: () => p.remove() });
      }
      g.delayedCall(0.5, () => { k.el.classList.add("is-cmt"); g.fromTo(k.el.querySelector(".sr__cmt"), { y: 12, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" }); });
    };
    // reply: the tray of emoji rises from the pill; a pick flies up to the bubble, which keeps the last three
    const openTray = (k, on) => { k.el.classList.toggle("is-tray", on); if (g && on && !reduce) g.fromTo(k.el.querySelectorAll(".sr__tray button"), { y: 14, scale: 0.6, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.04 }); };
    const react = (k, btn) => {
      const e = btn.dataset.e; openTray(k, false);
      const fly = h("i", "sr__fly", e); c.appendChild(fly);
      const cb = c.getBoundingClientRect(), sc = cb.width / W, a = btn.getBoundingClientRect(), b = bubble.getBoundingClientRect();
      const ax = (a.left - cb.left) / sc, ay = (a.top - cb.top) / sc, bx = (b.right - cb.left) / sc - 30, by = (b.top - cb.top) / sc + 6;
      const done = () => { fly.remove(); const s2 = h("span", "", e); bubble.appendChild(s2); while (bubble.children.length > 3) bubble.firstChild.remove(); g && g.fromTo(bubble, { scale: 1.12 }, { scale: 1, duration: 0.6, ease: "back.out(3)" }); };
      if (!g || reduce) return done();
      g.set(fly, { x: ax, y: ay }); const k2 = { t: 0 };
      g.to(k2, { t: 1, duration: 0.9, ease: "power3.inOut", onUpdate: () => { const t = k2.t, lift = Math.sin(Math.PI * t) * 90; g.set(fly, { x: ax + (bx - ax) * t, y: ay + (by - ay) * t - lift, scale: 1 + Math.sin(Math.PI * t) * 0.8, rotate: t * 30 }); }, onComplete: done });
    };
    // taps: left third goes back, the rest goes forward; a double tap likes; hold pauses
    let tapT = null;
    c.addEventListener("click", (e) => {
      const card = e.target.closest(".sr__card"); if (!card) return; e.stopPropagation();
      const k = cards.find((x) => x.el === card);
      if (k !== order[1]) { go(k === order[2] ? 1 : -1); return; }
      const like = e.target.closest(".sr__like"), reply = e.target.closest(".sr__reply"), emo = e.target.closest(".sr__tray button");
      if (like) { liked.has(k.story) ? (liked.delete(k.story), k.el.classList.remove("is-liked", "is-cmt")) : burst(k); return; }
      if (reply) { openTray(k, !k.el.classList.contains("is-tray")); return; }
      if (emo) { react(k, emo); return; }
      if (k.el.classList.contains("is-tray")) { openTray(k, false); return; }
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (tapT) { tapT.kill(); tapT = null; burst(k); return; }
      tapT = g ? g.delayedCall(0.26, () => { tapT = null; go(x < 0.34 ? -1 : 1); }) : (go(x < 0.34 ? -1 : 1), null);
    });
    c.addEventListener("pointerdown", (e) => { if (e.target.closest(".sr__card") === order[1].el && !e.target.closest("button")) prog && prog.pause(); });
    const resume = () => { running && prog && prog.resume(); };
    c.addEventListener("pointerup", resume); c.addEventListener("pointercancel", resume);
    // the stickers drift, and lean against the pointer
    const stick = [bubble, heartS, chip, avatar, face1, face2];
    stage.addEventListener("pointermove", (e) => { if (!g || reduce) return; const r = stage.getBoundingClientRect(), nx = ((e.clientX - r.left) / r.width - 0.5) * 2, ny = ((e.clientY - r.top) / r.height - 0.5) * 2; stick.forEach((s2, i) => g.to(s2, { x: nx * (6 + i * 2), y: ny * (5 + i * 2), duration: 0.9, ease: "power3.out", overwrite: "auto" })); });

    // a scripted demo for the board: like, reply with an emoji, move on (Stageshow: every move goes to the next action, the payoff holds)
    const curs = auto && g && !reduce ? stageCursor(stage, g) : null;
    let run = 0, running = false, resumeT = null;
    async function story(id) {
      const ok = () => id === run, k = () => order[1], b = stage.getBoundingClientRect();
      curs.place(b.width * 0.82, b.height * 0.9); curs.show(); await curs.sleep(350); if (!ok()) return;
      await curs.travel(() => curs.at(k().el.querySelector(".sr__like"), 0.6, 0.62)); if (!ok()) return;
      await curs.press(); if (!liked.has(k().story)) burst(k()); await curs.sleep(1900); if (!ok()) return;
      await curs.travel(() => curs.at(k().el.querySelector(".sr__reply"), 0.82, 0.6)); if (!ok()) return;
      await curs.press(); openTray(k(), true); await curs.sleep(650); if (!ok()) return;
      const pick = k().el.querySelector('.sr__tray button[data-e="🤯"]');
      await curs.travel(() => curs.at(pick, 0.7, 0.66)); if (!ok()) return;
      await curs.press(); react(k(), pick); await curs.sleep(1500); if (!ok()) return;
      await curs.travel(() => curs.at(k().el, 0.84, 0.42)); if (!ok()) return;
      await curs.press(); go(1); await curs.sleep(900); if (!ok()) return;
      await curs.travel(() => ({ x: b.width * 0.82, y: b.height * 0.9 })); curs.hide(); await curs.sleep(1300);
    }
    const startDemo = () => { if (!curs) return; const id = ++run; (async () => { while (id === run && running) await story(id); })(); };
    const stopDemo = () => { run++; curs && curs.stop(); };
    if (curs) {
      stage.addEventListener("pointerenter", (e) => { if (e.pointerType === "touch") return; resumeT && resumeT.kill(); stopDemo(); });
      stage.addEventListener("pointerleave", (e) => { if (e.pointerType === "touch" || !running) return; resumeT = g.delayedCall(3, startDemo); });
    }
    const stopVis = whileVisible(c, () => {
      running = true; startProg(); startDemo();
      const bobs = g ? stick.map((s2, i) => g.to(s2.firstChild && s2 === bubble ? s2 : s2, { "--bob": i % 2 ? -6 : 6, duration: 2.4 + i * 0.35, ease: "sine.inOut", repeat: -1, yoyo: true })) : [];
      return () => { running = false; prog && prog.pause(); stopDemo(); resumeT && resumeT.kill(); bobs.forEach((t) => t.kill()); };
    });
    startProg();
    return () => { f.stop(); stopVis(); prog && prog.kill(); g && cards.forEach((k) => g.killTweensOf(k.el)); };
  }

  // ── 25 · Fold cards: a row of dark cards that each fold down to a pill and open again ──
  function foldCards(stage, { auto }) {
    const W = 600, H = 560, P = "/assets/images/playground/photos/p";
    const CARDS = [
      { t: "Explore", s: "Looks", ph: 5, cap: "Browse looks cut for your mood." },
      { t: "Fit Plan", s: "Mon", dial: true, cap: "Plan your week, balance your workload and stay within capacity." },
      { t: "Capsule", s: "Winter", ph: 10, cap: "Meet the season's pieces, folded into one capsule." },
    ];
    const c = h("div", "ix ix-fc");
    const cards = CARDS.map((d, i) => {
      const body = d.dial
        ? `<div class="fc__dial" data-dial><span class="fc__pct" data-pct>86%</span><i class="fc__ln"></i><i class="fc__tk"></i><i class="fc__ring" data-ring><u></u></i><i class="fc__dot" style="left:30%;top:62%"></i><i class="fc__dot" style="left:44%;top:70%"></i><i class="fc__dot" style="left:64%;top:58%"></i><i class="fc__dot" style="left:60%;top:78%"></i></div>`
        : `<div class="fc__ph" style="background:url(${P}${d.ph}.webp) 50% 18% / cover no-repeat"></div>`;
      const el = h("div", "fc__c", `<div class="fc__hd"><div class="fc__tt"><b>${d.t}</b><span>${d.s}</span></div><button class="fc__b" type="button" aria-expanded="true" aria-label="Fold ${d.t}"><i></i></button></div><div class="fc__bd">${body}<p>${d.cap}</p></div>`);
      el.style.left = `${18 + i * 190}px`;
      c.appendChild(el);
      return el;
    });
    stage.appendChild(c);
    const f = fit(stage, c, W, H, 1.0);
    const toggle = (el, to) => {
      const shut = to == null ? !el.classList.contains("is-shut") : !to;
      el.classList.toggle("is-shut", shut);
      const b = el.querySelector(".fc__b"); b.setAttribute("aria-expanded", String(!shut)); b.setAttribute("aria-label", `${shut ? "Open" : "Fold"} ${el.querySelector("b").textContent}`);
    };
    if (!auto) cards.forEach((el) => el.querySelector(".fc__b").addEventListener("click", () => toggle(el)));
    // the dial: drag the ring up and down to set the load
    const dial = c.querySelector("[data-dial]"), ring = c.querySelector("[data-ring]"), pct = c.querySelector("[data-pct]");
    const setLoad = (v) => { v = clamp(v, 0.12, 0.88); ring.style.top = `${v * 100}%`; pct.textContent = `${Math.round((1 - v) * 100 + 0)}%`; };
    setLoad(0.14);
    let drag = false;
    if (!auto) {
      dial.style.cursor = "ns-resize"; dial.style.touchAction = "none";
      dial.addEventListener("pointerdown", (e) => { drag = true; dial.setPointerCapture(e.pointerId); mv(e); });
      const mv = (e) => { if (!drag) return; const r = dial.getBoundingClientRect(); setLoad((e.clientY - r.top) / r.height); };
      dial.addEventListener("pointermove", mv);
      dial.addEventListener("pointerup", () => { drag = false; }); dial.addEventListener("pointercancel", () => { drag = false; });
    }
    let hot = false; c.addEventListener("pointerenter", () => { hot = true; }); c.addEventListener("pointerleave", () => { hot = false; });
    let n = 0;
    const stopVis = whileVisible(c, () => {
      const t = setInterval(() => { if (hot || document.hidden) return; toggle(cards[n % 3]); n++; }, 1700);
      return () => clearInterval(t);
    });
    return () => { f.stop(); stopVis(); };
  }

  const DEMOS = { foldCards, storyReactions, archiveSearch, mediaTray, wordWheel, armillary, theBox, boundingBox, segmentedNav, clouds, marketSelect, onboardingTour, apiKey, timelineScrub, glassSliders, podcastPlayer, composeBars, emptySessions, tradeTicket, motionLab };

  // ── 16 · Trade ticket: a three-step stock order (entry, risk, review) where only the open step is expanded ──
  function tradeTicket(stage, { auto }) {
    const EASE = "cubic-bezier(.23,1,.32,1)";
    const CW = 496, PH = 200, NB = 56;
    const SYM = "AAPL", BP = 24860, DL = 184.8, DH = 191.6;
    const TYPES = ["Market", "Limit", "Stop limit"];
    const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="tt__ck" pathLength="1" d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    const MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>';
    const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>';
    const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    const comma = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const usd = (v, d = 2) => `${v < 0 ? "−" : ""}$${comma(Math.abs(v).toFixed(d))}`;
    const sgn = (v, d = 1) => `${v < 0 ? "−" : "+"}${Math.abs(v).toFixed(d)}%`;
    const zp = (z) => DL + z * (DH - DL);

    const root = h("div", "tt");
    const cv = h("div", "ix ix-tt");
    cv.innerHTML = `
      <header class="tt__top">
        <span class="tt__ico"><svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l6-7 5 4 9-11"/><path d="M18 6h6v6"/></svg></span>
        <div class="tt__who"><h4>${SYM} <i>Apple Inc.</i></h4><p>NASDAQ · market open · buying power ${usd(BP, 0)}</p></div>
        <div class="tt__px"><b data-px>189.42</b><span data-chg>+1.82 (0.97%)</span></div>
      </header>
      <section class="tt__card" data-i="0" aria-label="Step 1, entry">
        <header class="tt__head"><span class="tt__n"><em>1</em>${TICK}</span><div><h5>Entry</h5><p>How and where to buy</p></div><span class="tt__sum" data-sum></span><button class="tt__edit" type="button">Edit</button></header>
        <div class="tt__fold"><div class="tt__fi"><div class="tt__body">
          <div class="tt__cols">
            <div class="tt__col">
              <div class="tt__lab"><span>Order type</span></div>
              <div class="tt__seg" role="radiogroup" aria-label="Order type"><i class="tt__thumb"></i>${TYPES.map((t, i) => `<button type="button" role="radio" data-t="${i}">${t}</button>`).join("")}</div>
              <div class="tt__lab"><span>Quantity</span><em>shares</em></div>
              <div class="tt__step"><button type="button" aria-label="Fewer shares" data-d="-1">${MINUS}</button><output><b data-q>25</b><u>sh</u></output><button type="button" aria-label="More shares" data-d="1">${PLUS}</button></div>
              <div class="tt__cost"><div><b data-cost>$4,735.50</b><span>est. cost</span></div><div class="tt__meter"><i data-meter></i></div><p data-bp>19% of buying power</p></div>
            </div>
            <div class="tt__col tt__col--z" data-zone>
              <div class="tt__lab"><span>Entry zone</span><strong data-win>$187.25 – $188.88</strong></div>
              <div class="tt__hist" data-hist aria-hidden="true"><i class="tt__now" data-now></i></div>
              <div class="tt__rng" data-rng>
                <span class="tt__tk"></span><i class="tt__rf"></i>
                <b class="tt__hd" data-h="lo" role="slider" tabindex="0" aria-label="Entry zone low" aria-valuemin="0" aria-valuemax="1"></b>
                <b class="tt__hd" data-h="hi" role="slider" tabindex="0" aria-label="Entry zone high" aria-valuemin="0" aria-valuemax="1"></b>
              </div>
              <div class="tt__ax"><span>${DL.toFixed(2)}</span><span>volume at price, today</span><span>${DH.toFixed(2)}</span></div>
              <p class="tt__mk">Market orders fill at the best price available, so there is no zone to set.</p>
            </div>
          </div>
          <footer class="tt__foot"><p>Limit orders fill only at your price or better.</p><button class="tt__btn tt__btn--p" type="button" data-go="0">Confirm entry ${ARROW}</button></footer>
        </div></div></div>
      </section>
      <section class="tt__card" data-i="1" aria-label="Step 2, risk">
        <header class="tt__head"><span class="tt__n"><em>2</em>${TICK}</span><div><h5>Risk</h5><p>Stop loss and take profit</p></div><span class="tt__sum" data-sum></span><button class="tt__edit" type="button">Edit</button></header>
        <div class="tt__fold"><div class="tt__fi"><div class="tt__body">
          <div class="tt__cols">
            <div class="tt__col">
              <p class="tt__read"><b data-rr>1 : 2.5</b><span>risk / reward</span></p>
              <div class="tt__pad" tabindex="0" role="group" aria-label="Stop loss and take profit. Left and right set the stop distance, up and down set the target. Use the arrow keys." data-pad>
                <i class="tt__hy"></i><i class="tt__vx"></i><i class="tt__rk"></i><i class="tt__rw"></i>
                <span class="tt__c tt__c--tl">bigger target</span><span class="tt__c tt__c--bl">tight stop</span><span class="tt__c tt__c--br">wide stop</span>
                <span class="tt__puck"><i class="tt__halo"></i><i class="tt__dot"></i></span>
              </div>
            </div>
            <div class="tt__col">
              <div class="tt__stats">
                <div><span>Stop loss</span><b class="is-dn" data-stop>$184.28</b><em data-stopp>−2.0%</em></div>
                <div><span>Take profit</span><b class="is-up" data-tgt>$197.50</b><em data-tgtp>+5.0%</em></div>
              </div>
              <button class="tt__row" type="button" role="switch" aria-checked="true" data-sw="trail"><span><b>Trailing stop</b><em>follows the price up</em></span><i class="tt__sw"><i></i></i></button>
              <button class="tt__row" type="button" role="switch" aria-checked="false" data-sw="gtc"><span><b>Good till cancelled</b><em>otherwise it ends today</em></span><i class="tt__sw"><i></i></i></button>
            </div>
          </div>
          <footer class="tt__foot"><p data-risk>Max loss −$99.40 · potential gain +$248.00</p><button class="tt__btn tt__btn--p" type="button" data-go="1">Confirm risk ${ARROW}</button></footer>
        </div></div></div>
      </section>
      <section class="tt__card" data-i="2" aria-label="Step 3, review and place">
        <header class="tt__head"><span class="tt__n"><em>3</em>${TICK}</span><div><h5>Review and place</h5><p>Check it, then hold to send</p></div><span class="tt__sum" data-sum></span></header>
        <div class="tt__fold"><div class="tt__fi"><div class="tt__body">
          <div class="tt__rev">
            <div class="tt__cols">
              <dl class="tt__list" data-list></dl>
              <div class="tt__col tt__col--t">
                <p class="tt__lab2">Order total</p>
                <p class="tt__total" data-total>$4,735.50</p>
                <div class="tt__stats tt__stats--s">
                  <div><span>Buying power after</span><b data-after>$20,124.50</b></div>
                  <div><span>Risk / reward</span><b data-rr2>1 : 2.5</b></div>
                </div>
              </div>
            </div>
            <footer class="tt__foot"><p>Press and hold to place. Let go early to cancel.</p><button class="tt__btn tt__btn--p tt__btn--hold" type="button" data-place><i class="tt__fill"></i><span>Hold to place order</span></button></footer>
          </div>
          <div class="tt__ok" aria-live="polite">
            <span class="tt__okc">${TICK}</span>
            <h5>Order filled</h5>
            <p class="tt__okm" data-fill></p>
            <p class="tt__okn" data-oknote></p>
            <button class="tt__btn" type="button" data-new>New order</button>
          </div>
        </div></div></div>
      </section>`;
    root.appendChild(cv); stage.appendChild(root);
    const f = fit(stage, cv, 1120, 856, 0.94);
    const $ = (s) => cv.querySelector(s);
    const cards = [...cv.querySelectorAll(".tt__card")];

    // ── State: S is where things should be, shown is where they are right now ──
    const DEF = { sx: .333, sy: .636, zlo: .36, zhi: .6, qty: 25 };
    const S = { ...DEF, type: 1, trail: true, gtc: false };
    const shown = { ...DEF };
    const KEYS = ["sx", "sy", "zlo", "zhi", "qty"], EPS = { sx: .0005, sy: .0005, zlo: .0005, zhi: .0005, qty: .05 };
    const RATE = { sx: 13, sy: 13, zlo: 15, zhi: 15, qty: 18 };
    let held = null, raf = 0, last = 0, price = 189.42, open = 189.42 - 1.82, seed = 7;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

    const entryAt = (v, p = price) => (S.type === 0 ? p : S.type === 1 ? zp((v.zlo + v.zhi) / 2) : zp(v.zhi));
    const stopPct = (v) => .5 + v.sx * 4.5, tgtPct = (v) => 1 + (1 - v.sy) * 11;
    const calc = (v) => { const e = entryAt(v), q = Math.round(v.qty), sp = stopPct(v), tp = tgtPct(v); return { e, q, sp, tp, cost: e * q, stop: e * (1 - sp / 100), tgt: e * (1 + tp / 100), loss: e * q * sp / 100, gain: e * q * tp / 100, rr: tp / sp }; };

    const bars = [], inWin = [];
    const hist = $("[data-hist]"), nowEl = $("[data-now]");
    const gauss = (u) => Math.exp(-(u * u) / 2);
    for (let i = 0; i < NB; i++) {
      const c = (i + .5) / NB, n = Math.sin(i * 12.9898 + 4.1) * 43758.5453, noise = n - Math.floor(n);
      const b = h("i"); b.style.height = `${Math.round(8 + 108 * (gauss((c - .5) / .2) * .8 + gauss((c - .72) / .07) * .38) * (.8 + .32 * noise))}px`;
      hist.insertBefore(b, nowEl); bars.push(b); inWin.push(false);
    }
    const pad = $("[data-pad]"), rng = $("[data-rng]"), zone = $("[data-zone]");
    const puck = $(".tt__puck"), vx = $(".tt__vx"), hy = $(".tt__hy"), rk = $(".tt__rk"), rw = $(".tt__rw"), rf = $(".tt__rf");
    const hLo = $('[data-h="lo"]'), hHi = $('[data-h="hi"]'), thumb = $(".tt__thumb"), segB = [...cv.querySelectorAll(".tt__seg button")];
    const T = (sel, v) => { const e = $(sel); if (e.textContent !== v) e.textContent = v; };

    const paint = () => {
      const c = calc(shown);
      const px = shown.sx * CW, py = shown.sy * PH;
      puck.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      vx.style.transform = `translate3d(${px}px, 0, 0)`; hy.style.transform = `translate3d(0, ${py}px, 0)`;
      rk.style.transform = `scaleX(${shown.sx})`; rw.style.transform = `scaleY(${1 - shown.sy})`;
      hLo.style.transform = `translate3d(${shown.zlo * CW}px, 0, 0)`; hHi.style.transform = `translate3d(${shown.zhi * CW}px, 0, 0)`;
      rf.style.transform = `translate3d(${shown.zlo * CW}px, 0, 0) scaleX(${Math.max(0, shown.zhi - shown.zlo)})`;
      nowEl.style.transform = `translate3d(${clamp((price - DL) / (DH - DL), 0, 1) * CW}px, 0, 0)`;
      for (let i = 0; i < NB; i++) { const on = (i + .5) / NB >= shown.zlo && (i + .5) / NB <= shown.zhi; if (on !== inWin[i]) { inWin[i] = on; bars[i].classList.toggle("is-in", on); } }
      T("[data-win]", `${usd(zp(shown.zlo))} – ${usd(zp(shown.zhi))}`);
      T("[data-q]", String(c.q)); T("[data-cost]", usd(c.cost));
      $("[data-meter]").style.transform = `scaleX(${clamp(c.cost / BP, 0, 1)})`;
      T("[data-bp]", c.cost > BP ? "Over your buying power" : `${Math.round(c.cost / BP * 100)}% of buying power`);
      cards[0].classList.toggle("is-over", c.cost > BP);
      T("[data-rr]", `1 : ${c.rr.toFixed(1)}`); T("[data-rr2]", `1 : ${c.rr.toFixed(1)}`);
      T("[data-stop]", usd(c.stop)); T("[data-stopp]", sgn(-c.sp)); T("[data-tgt]", usd(c.tgt)); T("[data-tgtp]", sgn(c.tp));
      T("[data-risk]", `Max loss ${usd(-c.loss)} · potential gain +${usd(c.gain)}`);
      T("[data-total]", usd(c.cost)); T("[data-after]", usd(BP - c.cost));
    };
    const priceTxt = () => {
      T("[data-px]", price.toFixed(2)); const d = price - open;
      T("[data-chg]", `${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(2)} (${(Math.abs(d) / open * 100).toFixed(2)}%)`);
      $(".tt__px").classList.toggle("is-dn", d < 0);
    };
    const aria = () => { hLo.setAttribute("aria-valuenow", S.zlo); hHi.setAttribute("aria-valuenow", S.zhi); pad.setAttribute("aria-valuetext", `Stop ${stopPct(S).toFixed(1)} percent, target ${tgtPct(S).toFixed(1)} percent`); };
    const tick = (now) => {
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
      let busy = false;
      for (const k of KEYS) {
        const d = S[k] - shown[k], fast = held === k || (held === "pad" && (k === "sx" || k === "sy"));
        if (reduce || Math.abs(d) <= EPS[k]) shown[k] = S[k]; else { shown[k] += d * (1 - Math.exp(-dt * RATE[k] * (fast ? 2 : 1))); busy = true; }
      }
      paint();
      if (busy) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
    };
    const kick = () => { aria(); if (!raf) raf = requestAnimationFrame(tick); };
    const r3 = (v) => Math.round(v * 1000) / 1000;

    // ── Step 1: entry ──
    const setType = (i) => { S.type = i; segB.forEach((b, k) => b.setAttribute("aria-checked", k === i)); thumb.style.transform = `translateX(${i * 100}%)`; zone.classList.toggle("is-off", i === 0); hLo.tabIndex = hHi.tabIndex = i === 0 ? -1 : 0; kick(); };
    segB.forEach((b, i) => b.addEventListener("click", () => setType(i)));
    const setZone = (lo, hi) => { S.zlo = r3(clamp(lo, 0, .94)); S.zhi = r3(clamp(hi, S.zlo + .06, 1)); kick(); };
    const offs = [];
    let which = "lo";
    offs.push(drag(rng, (e) => {
      if (S.type === 0) return;
      const b = rng.getBoundingClientRect(), v = (e.clientX - b.left) / b.width;
      if (which === "lo") setZone(Math.min(v, S.zhi - .06), S.zhi); else setZone(S.zlo, Math.max(v, S.zlo + .06));
    }, { onStart: (e) => { if (S.type === 0) return; const b = rng.getBoundingClientRect(), v = (e.clientX - b.left) / b.width; which = Math.abs(v - S.zlo) <= Math.abs(v - S.zhi) ? "lo" : "hi"; held = which === "lo" ? "zlo" : "zhi"; rng.classList.add("is-drag"); rng.dataset.on = which; },
         onEnd: () => { held = null; rng.classList.remove("is-drag"); delete rng.dataset.on; kick(); } }));
    [hLo, hHi].forEach((el) => el.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0; if (!d) return;
      e.preventDefault(); const st = d * (e.shiftKey ? .05 : .01);
      if (el === hLo) setZone(Math.min(S.zlo + st, S.zhi - .06), S.zhi); else setZone(S.zlo, Math.max(S.zhi + st, S.zlo + .06));
    }));
    const qb = [...cv.querySelectorAll(".tt__step button")];
    const bump = (d) => { S.qty = clamp(S.qty + d * (d && Math.abs(S.qty) >= 100 ? 10 : 5) * (S.qty === 1 && d > 0 ? 1 : 1), 5, 250); sync(); kick(); };
    const sync = () => qb.forEach((b) => { b.disabled = (+b.dataset.d < 0 && S.qty <= 5) || (+b.dataset.d > 0 && S.qty >= 250); });
    qb.forEach((b) => {
      const d = +b.dataset.d; let t = 0;
      const stop = () => { clearTimeout(t); t = 0; if (held === "qty") held = null; };
      b.addEventListener("pointerdown", (e) => { if (e.button > 0 || b.disabled) return; bump(d); held = "qty"; t = setTimeout(function loop() { bump(d); if (b.disabled) return stop(); loop.gap = Math.max(40, (loop.gap || 120) - 10); t = setTimeout(loop, loop.gap); }, 380); });
      ["pointerup", "pointerleave", "pointercancel", "blur"].forEach((ev) => b.addEventListener(ev, stop));
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bump(d); } });
    });

    // ── Step 2: risk ──
    const setPad = (x, y) => { S.sx = r3(clamp(x, 0, 1)); S.sy = r3(clamp(y, 0, 1)); kick(); };
    offs.push(drag(pad, (e) => { const b = pad.getBoundingClientRect(); setPad((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height); },
      { onStart: () => { held = "pad"; pad.classList.add("is-drag"); }, onEnd: () => { held = null; pad.classList.remove("is-drag"); kick(); } }));
    pad.addEventListener("keydown", (e) => {
      const st = e.shiftKey ? .1 : .02, m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
      if (m) { e.preventDefault(); setPad(S.sx + m[0], S.sy + m[1]); } else if (e.key === "Home") { e.preventDefault(); setPad(DEF.sx, DEF.sy); }
    });
    const sw = {}; cv.querySelectorAll("[data-sw]").forEach((b) => { sw[b.dataset.sw] = b; b.addEventListener("click", () => toggleSw(b.dataset.sw)); });
    const toggleSw = (k) => { S[k] = !S[k]; sw[k].setAttribute("aria-checked", S[k]); fillList(); };

    // ── Flow: one open step at a time, finished steps fold to a summary ──
    let step = 0, filled = false;
    const setState = () => cards.forEach((c, i) => {
      const st = filled || i < step ? "done" : i === step ? "active" : "locked";
      c.dataset.s = st; c.querySelector(".tt__fi").inert = st !== "active" && !(i === 2 && filled);
      c.querySelector(".tt__head").setAttribute("aria-expanded", st === "active" || (i === 2 && filled));
    });
    const fillList = () => {
      const c = calc(S), ty = TYPES[S.type];
      const rows = [["Action", `Buy ${c.q} ${SYM}`], ["Type", `${ty} · ${S.gtc ? "GTC" : "Day"}`], ["Entry", S.type === 0 ? `${usd(c.e)} at market` : usd(c.e)], ["Stop loss", `${usd(c.stop)} (${sgn(-c.sp)})`], ["Take profit", `${usd(c.tgt)} (${sgn(c.tp)})`], ["Trailing stop", S.trail ? "On" : "Off"]];
      const dl = $("[data-list]"); dl.replaceChildren(); rows.forEach(([k, v]) => { const d = h("div"); d.append(h("dt", "", k), h("dd", "", v)); dl.append(d); });
    };
    const summaries = () => {
      const c = calc(S);
      cards[0].querySelector("[data-sum]").textContent = S.type === 0 ? `Market · ${c.q} sh` : `${TYPES[S.type]} · ${c.q} sh · ${usd(zp(S.zlo))}–${usd(zp(S.zhi))}`;
      cards[1].querySelector("[data-sum]").textContent = `Stop ${sgn(-c.sp)} · Target ${sgn(c.tp)} · 1 : ${c.rr.toFixed(1)}`;
    };
    const setStep = (n) => { step = n; filled = false; cards[2].querySelector(".tt__head p").textContent = "Check it, then hold to send"; cv.querySelector(".tt__ok").parentElement.classList.remove("is-filled"); setState(); };
    const confirm = (i) => { if (i === 0 && calc(S).cost > BP) return; summaries(); fillList(); setStep(i + 1); };
    cv.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => confirm(+b.dataset.go)));
    cv.querySelectorAll(".tt__edit").forEach((b, i) => b.addEventListener("click", () => setStep(i)));

    // Hold to place: a deliberate press fills slowly, letting go drains fast
    const placeBtn = $("[data-place]"), body3 = cards[2].querySelector(".tt__body");
    let holdT = 0;
    const holdOn = () => { if (holdT || filled || step !== 2) return; placeBtn.classList.add("is-hold"); holdT = setTimeout(() => { holdT = 0; placeBtn.classList.remove("is-hold"); place(); }, 1200); };
    const holdOff = () => { clearTimeout(holdT); holdT = 0; placeBtn.classList.remove("is-hold"); };
    placeBtn.addEventListener("pointerdown", (e) => { if (e.button > 0) return; holdOn(); });
    ["pointerup", "pointerleave", "pointercancel", "blur"].forEach((ev) => placeBtn.addEventListener(ev, holdOff));
    placeBtn.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); holdOn(); } });
    placeBtn.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") holdOff(); });
    const place = () => {
      const c = calc(S), id = `#ORD-${48000 + Math.floor(rnd() * 900)}`;
      $("[data-fill]").textContent = `${c.q} ${SYM} @ ${usd(c.e)}`;
      $("[data-oknote]").textContent = `${id} · stop ${usd(c.stop)} and target ${usd(c.tgt)} are live${S.trail ? ", trailing" : ""}.`;
      cards[2].querySelector("[data-sum]").textContent = `Filled · ${id}`;
      cards[2].querySelector(".tt__head p").textContent = "Order sent";
      filled = true; body3.classList.add("is-filled"); setState();
    };
    $("[data-new]").addEventListener("click", () => reset());
    const reset = () => { Object.assign(S, { ...DEF, trail: true, gtc: false }); setType(1); Object.keys(sw).forEach((k) => sw[k].setAttribute("aria-checked", S[k])); sync(); kick(); body3.classList.remove("is-filled"); setStep(0); };

    // A quiet price feed, only while the ticket is on screen
    let feed = 0;
    const startFeed = () => { if (feed) return; feed = setInterval(() => { price = clamp(price + (rnd() - .5) * .14, DL + .5, DH - .5); priceTxt(); if (!raf) paint(); }, 1500); };
    const stopFeed = () => { clearInterval(feed); feed = 0; };
    const ioFeed = new IntersectionObserver(([e]) => (e.isIntersecting ? startFeed() : stopFeed()), { threshold: .1 }); ioFeed.observe(root);

    setType(1); sync(); fillList(); summaries(); setState(); priceTxt(); aria(); paint();

    // ── Tile loop: place an order from start to finish ──
    let stopLoop = null;
    if (auto) stopLoop = whileVisible(root, () => {
      let on = true;
      const go = async (ms, fn) => { if (!on) throw 0; fn && fn(); await wait(ms); };
      (async () => {
        await wait(1400);
        try {
          while (on) {
            await go(1000, () => setType(1)); await go(800, () => setZone(.28, .52));
            for (let i = 0; i < 3; i++) await go(260, () => bump(1));
            await go(1000, () => setZone(.34, .6)); await go(900, () => confirm(0));
            await go(1100, () => setPad(.2, .3)); await go(1000, () => setPad(.46, .18)); await go(800, () => toggleSw("gtc"));
            await go(1000, () => confirm(1));
            await go(500, () => { if (!holdT) { placeBtn.classList.add("is-hold"); } }); await go(1250, () => { placeBtn.classList.remove("is-hold"); place(); });
            await go(3000); await go(900, reset);
          }
        } catch {}
      })();
      return () => { on = false; placeBtn.classList.remove("is-hold"); };
    });
    return () => { cancelAnimationFrame(raf); f.stop(); offs.forEach((o) => o()); clearTimeout(holdT); stopFeed(); ioFeed.disconnect(); stopLoop && stopLoop(); };
  }

  // ── 17 · Motion lab: a bench for tuning a brand's motion system before storyboarding a launch film ──
  // Every system runs on one shared clock. Tempo, offset, wave, shaping and stagger are global; each system adds its own controls.
  // The drawing code below is self-contained on purpose: Export serialises it into a runnable file.
  function motionLab(stage, { auto, full, bleed }) {
    const W = 1360, KEY = "pg-motion-lab", UID = Math.random().toString(36).slice(2, 7);
    /* on the page, when the window is too narrow for the real layout, the design is scaled to fit: give it the window's own
       proportions so it fills the screen instead of leaving bands above and below */
    const H = bleed && !full ? clamp(Math.round((W * stage.clientHeight) / Math.max(1, stage.clientWidth)), 600, 1200) : 760;
    const TAU = Math.PI * 2;
    const DEFAULT_PAL = ["#3D9FE0", "#E86E9C", "#E9A23B", "#E5633A", "#D8283C", "#7C7C7A"], PAL = DEFAULT_PAL.slice();
    const PAL_NAMES = ["Blue", "Pink", "Amber", "Orange", "Red", "Grey"];
    /* the two grounds are the system's own: #F4F4F4 off-white and #040404 black (DESIGN.md §2.1) */
    const PAPERS = { paper: { bg: "#F4F4F4", fg: "#040404" }, ink: { bg: "#040404", fg: "#FFFFFF" } };
    const WAVES = {
      sine: (p) => Math.sin(p * TAU),
      triangle: (p) => 1 - 4 * Math.abs((((p + 0.25) % 1) + 1) % 1 - 0.5),
      snappy: (p) => { const s = Math.sin(p * TAU); return Math.sign(s) * Math.abs(s) ** 0.3; },
      stepped: (p) => Math.round(Math.sin(p * TAU) * 2) / 2,
      saw: (p) => ((((p % 1) + 1) % 1) * 2 - 1),
    };
    const SHAPING = {
      linear: (v) => v,
      smooth: (v) => { const s = (v + 1) / 2; return s * s * (3 - 2 * s) * 2 - 1; },
      sharp: (v) => Math.sign(v) * Math.abs(v) ** 2.2,
      bounce: (v) => (v >= 0 ? v : v * -0.35),
    };
    const STAGGER = {
      linear: (i) => i,
      reverse: (i, n) => n - 1 - i,
      center: (i, n) => Math.abs(i - (n - 1) / 2),
      random: (i) => ((((Math.sin(i * 127.1 + 3.7) * 43758.5453) % 1) + 1) % 1) * 6,
    };
    const NAMES = {
      wave: { sine: "Sine", triangle: "Triangle", snappy: "Snappy", stepped: "Stepped", saw: "Saw" },
      shaping: { linear: "Linear", smooth: "Smooth", sharp: "Sharp", bounce: "Bounce" },
      stagger: { linear: "In order", reverse: "Reverse", center: "From centre", random: "Scattered" },
      colorMode: { solid: "Solid", cycle: "Cycle palette" },
      bgMode: { plain: "Plain", grid: "Dot grid" },
    };
    const PRESETS = {
      Calm: { tempo: 0.8, offset: 1.6, wave: "sine", shaping: "smooth", stagger: "linear" },
      Snappy: { tempo: 2.2, offset: 0.8, wave: "snappy", shaping: "sharp", stagger: "center" },
      Stepped: { tempo: 1.4, offset: 1, wave: "stepped", shaping: "linear", stagger: "linear" },
      Glitch: { tempo: 2.8, offset: 2.6, wave: "stepped", shaping: "sharp", stagger: "random" },
      Breathe: { tempo: 0.6, offset: 0.3, wave: "sine", shaping: "smooth", stagger: "center" },
      Bounce: { tempo: 1.6, offset: 1.2, wave: "triangle", shaping: "bounce", stagger: "reverse" },
    };
    // One part's position on the shared wave: clock × speed, its place in the stagger order, and the copy's place on screen
    const waveFor = (S, P, copy, c, n) => {
      const f = (i, mul = 1, off = 0) => {
        const j = STAGGER[S.stagger](i, n);
        return SHAPING[S.shaping](WAVES[S.wave](c * (P.speed ?? 1) * 0.32 * mul + j * 0.12 * S.offset + copy * 0.21 * S.offset + off)) * (P.travel ?? 1);
      };
      f.t = c * (P.speed ?? 1) * 0.32;
      return f;
    };
    const rgb = (c) => (c[0] === "#" ? ((n) => [n >> 16, (n >> 8) & 255, n & 255])(parseInt(c.slice(1), 16)) : c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number));
    const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(" ")})`; };
    const colourAt = (S, c) => {
      const pal = S.palette, i = S.colorIndex;
      if (S.colorMode !== "cycle") return pal[i];
      const p = ((((c * 0.08) % 1) + 1) % 1) * pal.length, a = Math.floor(p);
      return mix(pal[(i + a) % pal.length], pal[(i + a + 1) % pal.length], p - a);
    };
    const dot = (ctx, x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0.2, r), 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
    const seg = (ctx, x1, y1, x2, y2, w, col) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = "round"; ctx.stroke(); };
    const LAYOUTS = [[4, 2], [3, 3], [5, 2]];
    const WFONT = '900 100px "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif';
    const mctx = document.createElement("canvas").getContext("2d"), glyphs = {};
    const glyph = (ch) => {
      if (!glyphs[ch]) { mctx.font = WFONT; const m = mctx.measureText(ch); glyphs[ch] = { l: m.actualBoundingBoxLeft, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, a: m.actualBoundingBoxAscent, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent }; }
      return glyphs[ch];
    };

    // ── The systems. Each draws into an s × s box centred on (x, y); sizes are authored for s = 100. ──
    function drawNode(ctx, x, y, s, P, col, f) {
      const k = s / 100, n = Math.round(P.nodes), light = mix(col, BG(), 0.55), rot = f.t * P.spin * TAU * 0.25, pts = [];
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * TAU) / n + rot, r = 30 * k * P.spread * (1 + 0.15 * P.drift * f(i));
        pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
      }
      if (P.ring) pts.forEach(([px, py], i) => { const [qx, qy] = pts[(i + 1) % n]; seg(ctx, px, py, qx, qy, P.line * k * 0.6, light); });
      pts.forEach(([px, py]) => seg(ctx, x, y, px, py, P.line * k, light));
      pts.forEach(([px, py], i) => dot(ctx, px, py, 6 * k * P.dot * (1 + 0.3 * P.pulse * f(i, 1, 0.25)), i % 3 === 2 ? light : col));
      dot(ctx, x, y, 7.5 * k * P.dot, col);
    }
    function drawCells(ctx, x, y, s, P, col, f) {
      const k = s / 100, [cols, rows] = LAYOUTS[Math.round(P.layout)], c = Math.min(92 / cols, 92 / rows) * k, gap = c * P.gap, cs = c - gap;
      const x0 = x - (cols * c) / 2 + gap / 2, y0 = y - (rows * c) / 2 + gap / 2, pat = Math.round(P.pattern);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const idx = j * cols + i, circle = pat === 3 ? (i + j) % 2 === 0 : (i + j * 2 + pat) % 3 === 0, v = f(idx);
        const a = Math.min(1, Math.max(0, P.faint + (1 - P.faint) * (0.5 + 0.5 * v))), sc = 1 + P.scale * 0.12 * v, w = cs * sc;
        ctx.beginPath(); ctx.roundRect(x0 + i * c + (cs - w) / 2, y0 + j * c + (cs - w) / 2, w, w, circle ? (w / 2) * P.round : w * 0.08);
        ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;
        if (P.outline > 0) { ctx.lineWidth = P.outline * k * 0.6; ctx.strokeStyle = mix(col, BG(), 0.3); ctx.stroke(); }
      }
    }
    function drawBurst(ctx, x, y, s, P, col, f) {
      const k = s / 100, n = Math.round(P.rays), rot = f.t * P.spin * TAU * 0.25;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * TAU) / n + rot, L = P.len * k * (1 + 0.12 * P.stretch * f(i)) * (i % 2 && P.alt ? 0.7 : 1), r0 = P.inner * k;
        seg(ctx, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * L, y + Math.sin(a) * L, P.line * k * 0.7, mix(col, BG(), 0.25));
        dot(ctx, x + Math.cos(a) * L, y + Math.sin(a) * L, P.dot * k * 0.55 * (1 + 0.4 * P.pulse * f(i, 1, 0.3)), col);
      }
      dot(ctx, x, y, 3 * k, col);
    }
    function drawAsterisk(ctx, x, y, s, P, col, f) {
      const k = s / 100, n = Math.round(P.arms), arm = mix(col, BG(), 1 - P.tint), rot = f.t * P.spin * TAU * 0.25, tips = [];
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * TAU) / n + rot, L = P.len * k * (1 + 0.08 * P.stretch * f(i));
        tips.push([x + Math.cos(a) * L, y + Math.sin(a) * L, i]);
      }
      tips.forEach(([tx, ty]) => seg(ctx, x, y, tx, ty, P.width * k, arm));
      tips.forEach(([tx, ty, i]) => dot(ctx, tx, ty, P.dot * k * (1 + 0.3 * P.pulse * f(i, 1, 0.25)), col));
      if (P.hub > 0) dot(ctx, x, y, P.hub * k, col);
    }
    function drawGraph(ctx, x, y, s, P, col, f) {
      const k = s / 100, gw = 80 * k, gh = 60 * k, L = x - gw / 2, B = y + gh / 2, nb = Math.round(P.bars), np = Math.round(P.points), light = mix(col, BG(), 0.6);
      for (let i = 0; i < nb; i++) {
        const bx = L + ((i + 0.5) * gw) / nb, bh = gh * (0.45 + 0.25 * f(i, 0.7, 0.5));
        seg(ctx, bx, B, bx, B - Math.max(2 * k, bh), 2.4 * k, light);
      }
      const pts = [];
      for (let i = 0; i < np; i++) pts.push([L + (i * gw) / (np - 1), y - (i % 2 ? -1 : 1) * 14 * k * P.amp - 12 * k * P.amp * f(i)]);
      if (P.fill) {
        ctx.beginPath(); ctx.moveTo(pts[0][0], B); pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.lineTo(pts[np - 1][0], B); ctx.closePath();
        ctx.globalAlpha = 0.18; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.lineWidth = P.line * k; ctx.strokeStyle = col; ctx.lineJoin = "round"; ctx.stroke();
      pts.forEach(([px, py]) => dot(ctx, px, py, 3.2 * k, col));
    }
    function drawTrack(ctx, x, y, s, P, col, f) {
      const k = s / 100, L = P.len * k, x0 = x - L / 2, m = Math.round(P.stops), light = mix(col, BG(), 0.6), riders = Math.round(P.riders);
      seg(ctx, x0, y, x0 + L, y, 1.5 * k, light);
      for (let i = 0; i < m; i++) dot(ctx, x0 + (i * L) / (m - 1), y, 2.4 * k, mix(col, BG(), 0.35));
      for (let r = 0; r < riders; r++) {
        const u = 0.5 + 0.5 * Math.min(1, Math.max(-1, f(r, 1, r * 0.17))), g = 0.5 + 0.5 * Math.min(1, Math.max(-1, f(r, 1, r * 0.17 - 0.06)));
        dot(ctx, x0 + g * L, y, P.dot * k * 0.7, light);
        dot(ctx, x0 + u * L, y, P.dot * k, col);
      }
    }
    function drawOrbit(ctx, x, y, s, P, col, f) {
      const k = s / 100, rings = Math.round(P.rings), per = Math.round(P.dots), light = mix(col, BG(), 0.7);
      for (let r = 0; r < rings; r++) {
        const R = (14 + ((r + 1) * 32) / rings) * k * P.radius, dir = r % 2 ? -1 : 1;
        ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.lineWidth = Math.max(0.5, k); ctx.strokeStyle = light; ctx.stroke();
        for (let d = 0; d < per; d++) {
          const idx = r * per + d, a = r * 0.7 + (d * TAU) / per + dir * f.t * P.spin * TAU * 0.5 + P.wobble * 0.3 * f(idx);
          dot(ctx, x + Math.cos(a) * R, y + Math.sin(a) * R, P.dot * k * (1 + 0.3 * f(idx, 1, 0.2)), r === rings - 1 ? col : mix(col, BG(), 0.3));
        }
      }
      dot(ctx, x, y, P.dot * k * 1.3, col);
    }
    function drawMatrix(ctx, x, y, s, P, col, f) {
      const k = s / 100, cols = Math.round(P.cols), rows = Math.round(P.rows), c = Math.min(92 / cols, 92 / rows) * k, dir = Math.round(P.dir);
      const x0 = x - ((cols - 1) * c) / 2, y0 = y - ((rows - 1) * c) / 2;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const idx = dir === 0 ? i + j : dir === 1 ? i : dir === 2 ? j : Math.round(Math.hypot(i - (cols - 1) / 2, j - (rows - 1) / 2));
        const u = 0.5 + 0.5 * Math.min(1, Math.max(-1, f(idx)));
        ctx.globalAlpha = 0.3 + 0.7 * u;
        dot(ctx, x0 + i * c, y0 + j * c, Math.min(c * 0.48, P.dot * k * (P.min + (1 - P.min) * u)), col);
        ctx.globalAlpha = 1;
      }
    }
    function drawRibbon(ctx, x, y, s, P, col, f) {
      const k = s / 100, n = Math.round(P.bars), gw = 84 * k, step = gw / n, light = mix(col, BG(), 0.45);
      for (let i = 0; i < n; i++) {
        const u = 0.5 + 0.5 * Math.min(1, Math.max(-1, f(i))), hh = 70 * k * P.height * (P.min + (1 - P.min) * u), bx = x - gw / 2 + (i + 0.5) * step;
        seg(ctx, bx, y - hh / 2, bx, y + hh / 2, Math.min(step * 0.8, P.width * k), i % 2 && P.tint ? light : col);
      }
    }
    function drawWord(ctx, x, y, s, P, col, f, ex = {}) {
      const chars = [...(P.word || " ")], n = chars.length, bw = ex.bw || s * 0.92, bh = ex.bh || s * 0.34, L = x - bw / 2, T = y - bh / 2, bg = BG();
      ctx.fillStyle = mix(col, bg, 0.62); ctx.fillRect(L, T, bw, bh);
      const ptr = ex.ptr && ex.ptr.on ? ex.ptr : null;
      const ks = chars.map((ch, i) => {
        let w = ch === " " ? 0.45 : 1 + P.wave * f(i) + P.second * f(i, 2.3, 0.37);
        if (ptr) { const d = (ptr.x - (L + (bw * (i + 0.5)) / n)) / (bw / n); w += P.push * Math.exp(-d * d); }
        return Math.max(0.25, w);
      });
      const sum = ks.reduce((a, b) => a + b, 0);
      let cx = L;
      chars.forEach((ch, i) => {
        const cw = (bw * ks[i]) / sum, g = ch === " " ? null : glyph(ch);
        if (g && g.w > 0 && g.h > 0) {
          const lift = P.bob * bh * 0.08 * f(i, 1, 0.5);
          ctx.save(); ctx.translate(cx + cw * 0.03, T + bh * 0.06 + lift); ctx.scale((cw * 0.94) / g.w, (bh * 0.88) / g.h);
          ctx.font = WFONT; ctx.fillStyle = mix(col, bg, Math.min(0.8, Math.max(0, 0.5 - (i % 2 ? P.even : P.odd)))); ctx.fillText(ch, g.l, g.a); ctx.restore();
        }
        cx += cw;
      });
    }
    function shape(ctx, kind, x, y, r, col) {
      const bg = BG();
      if (kind === "dot") dot(ctx, x, y, r, col);
      else if (kind === "square") { ctx.fillStyle = col; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
      else if (kind === "ring") { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = r * 0.45; ctx.strokeStyle = col; ctx.stroke(); }
      else if (kind === "rect") { ctx.fillStyle = col; ctx.fillRect(x - 1.6 * r, y - 0.7 * r, 3.2 * r, 1.4 * r); }
      else if (kind === "cell") { ctx.beginPath(); ctx.roundRect(x - r, y - r, 2 * r, 2 * r, r * 0.3); ctx.fillStyle = mix(col, bg, 0.5); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = col; ctx.stroke(); }
      else if (kind === "node") { seg(ctx, x - 1.6 * r, y, x + 1.6 * r, y, Math.max(0.6, r * 0.25), mix(col, bg, 0.5)); dot(ctx, x - 1.6 * r, y, r * 0.5, col); dot(ctx, x + 1.6 * r, y, r * 0.5, col); dot(ctx, x, y, r * 0.7, col); }
      else { ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, TAU); ctx.lineWidth = 1; ctx.strokeStyle = col; ctx.stroke(); }
    }
    function drawProcMini(ctx, x, y, s, P, col, f) {
      const k = s / 100, pts = [[-38, 16], [-12, -6], [12, 8], [38, -18]].map(([px, py], i) => [x + px * k, y + py * k + 4 * k * f(i)]);
      ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.lineWidth = 1.6 * k; ctx.strokeStyle = col; ctx.stroke();
      pts.forEach(([px, py], i) => (i === 2 ? (ctx.beginPath(), ctx.arc(px, py, 7 * k, 0, TAU), ctx.fillStyle = BG(), ctx.fill(), ctx.lineWidth = 2.4 * k, ctx.strokeStyle = col, ctx.stroke()) : dot(ctx, px, py, 3.4 * k, col)));
    }
    function drawPatMini(ctx, x, y, s, P, col, f) {
      const k = s / 100;
      ctx.beginPath(); ctx.arc(x - 16 * k, y, 13 * k, 0, TAU); ctx.lineWidth = 3 * k; ctx.strokeStyle = col; ctx.stroke();
      dot(ctx, x - 16 * k, y, 4.5 * k * (1 + 0.25 * f(0)), col);
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * f(1 + i + j * 2)); ctx.fillStyle = col;
        ctx.beginPath(); ctx.roundRect(x + 6 * k + i * 13 * k, y - 12 * k + j * 13 * k, 11 * k, 11 * k, 2 * k); ctx.fill(); ctx.globalAlpha = 1;
      }
    }
    const backOut = (t, o) => { const c = 1.70158 * o, u = t - 1; return 1 + (c + 1) * u ** 3 + c * u ** 2; };

    // ── System definitions: params are [key, label, min, max, step, default, group]; toggles are on/off params ──
    const sp = (k, label, min, max, step, def, group) => ({ k, label, min, max, step, def, group });
    const tg = (k, label, def, group = "Shape") => ({ k, label, toggle: true, def, group });
    const MOTION = (speed = 1) => [sp("speed", "Speed", 0.2, 3, 0.01, speed, "Motion"), sp("travel", "Travel", 0, 2, 0.01, 1, "Motion")];
    const SPIN = sp("spin", "Spin", -2, 2, 0.01, 0, "Motion");
    const SYS = {
      node: { name: "Node", group: "Patterns", desc: "A hub with satellites on hairlines. The satellites drift in and out on the shared wave and their dots pulse.",
        params: [sp("nodes", "Nodes", 3, 8, 1, 4, "Shape"), sp("spread", "Spread", 0.5, 1.4, 0.01, 1, "Shape"), sp("dot", "Dot size", 0.5, 2, 0.01, 1, "Shape"), sp("line", "Line width", 0.5, 4, 0.1, 1.5, "Shape"), tg("ring", "Join the satellites", false), sp("drift", "Drift", 0, 2, 0.01, 1, "Motion"), sp("pulse", "Dot pulse", 0, 1, 0.01, 0.5, "Motion"), SPIN, ...MOTION()],
        variant: ["nodes", [3, 4, 5]], parts: (P) => Math.round(P.nodes), draw: drawNode },
      cells: { name: "Cells", group: "Patterns", desc: "A grid of squares and circles. Each cell fades between faint and solid, one after another.",
        params: [sp("layout", "Layout", 0, 2, 1, 0, "Shape"), sp("pattern", "Circle pattern", 0, 3, 1, 0, "Shape"), sp("round", "Circle roundness", 0, 1, 0.01, 1, "Shape"), sp("gap", "Gap", 0, 0.4, 0.01, 0.12, "Shape"), sp("outline", "Outline", 0, 3, 0.1, 1.4, "Shape"), sp("faint", "Faintest", 0, 1, 0.01, 0.25, "Motion"), sp("scale", "Scale pulse", 0, 2, 0.01, 0, "Motion"), ...MOTION(2.3)],
        variant: ["layout", [0, 1, 2], (v) => `Layout ${v}`], parts: (P) => LAYOUTS[Math.round(P.layout)][0] * LAYOUTS[Math.round(P.layout)][1], draw: drawCells },
      burst: { name: "Burst", group: "Patterns", desc: "Thin rays with a dot on each end. The rays breathe in and out as the wave goes round.",
        params: [sp("rays", "Rays", 6, 24, 1, 12, "Shape"), sp("len", "Ray length", 10, 44, 0.1, 30, "Shape"), sp("inner", "Inner gap", 0, 20, 0.1, 6, "Shape"), sp("dot", "Dot size", 1, 8, 0.1, 3.5, "Shape"), sp("line", "Line width", 0.5, 3, 0.1, 1.5, "Shape"), tg("alt", "Alternate long and short", false), sp("stretch", "Stretch amount", 0, 3, 0.01, 2, "Motion"), sp("pulse", "Dot pulse", 0, 1, 0.01, 0.7, "Motion"), SPIN, ...MOTION()],
        variant: ["rays", [10, 12, 14]], parts: (P) => Math.round(P.rays), draw: drawBurst },
      asterisk: { name: "Asterisk", group: "Patterns", desc: "Thick tinted arms with a solid dot at each tip. Same wave as the burst, chunkier shape.",
        params: [sp("arms", "Arms", 3, 8, 1, 5, "Shape"), sp("len", "Arm length", 15, 45, 0.1, 35.8, "Shape"), sp("width", "Arm width", 2, 18, 0.1, 10, "Shape"), sp("tint", "Arm tint", 0, 1, 0.01, 0.35, "Shape"), sp("dot", "Dot size", 2, 12, 0.1, 7.5, "Shape"), sp("hub", "Hub size", 0, 12, 0.1, 0, "Shape"), sp("stretch", "Stretch amount", 0, 3, 0.01, 2, "Motion"), sp("pulse", "Dot pulse", 0, 1, 0.01, 0.7, "Motion"), SPIN, ...MOTION()],
        variant: ["arms", [4, 5, 6]], parts: (P) => Math.round(P.arms), draw: drawAsterisk },
      graph: { name: "Graph", group: "Patterns", desc: "A line chart over a field of bars. The points rise and fall in turn, the bars breathe underneath.",
        params: [sp("points", "Points", 3, 8, 1, 5, "Shape"), sp("bars", "Bars", 4, 20, 1, 10, "Shape"), sp("line", "Line width", 1, 4, 0.1, 2, "Shape"), tg("fill", "Fill under the line", false), sp("amp", "Amplitude", 0, 1, 0.01, 0.6, "Motion"), ...MOTION()],
        variant: ["points", [4, 5, 6]], parts: (P) => Math.round(P.points), draw: drawGraph },
      track: { name: "Track", group: "Patterns", desc: "A rail with fixed stops and dots travelling between them, easing at each end of the wave.",
        params: [sp("stops", "Stops", 2, 6, 1, 3, "Shape"), sp("len", "Length", 40, 95, 0.1, 80, "Shape"), sp("dot", "Dot size", 2, 8, 0.1, 4, "Shape"), sp("riders", "Riders", 1, 4, 1, 1, "Shape"), ...MOTION()],
        variant: ["stops", [2, 3, 4]], parts: (P) => Math.round(P.riders), draw: drawTrack },
      orbit: { name: "Orbit", group: "Patterns", desc: "Dots riding concentric rings. Neighbouring rings turn in opposite directions; the wave nudges each dot along its path.",
        params: [sp("rings", "Rings", 1, 4, 1, 2, "Shape"), sp("dots", "Dots per ring", 1, 8, 1, 3, "Shape"), sp("radius", "Radius", 0.5, 1.3, 0.01, 1, "Shape"), sp("dot", "Dot size", 1, 6, 0.1, 3.2, "Shape"), SPIN, sp("wobble", "Wobble", 0, 2, 0.01, 1, "Motion"), ...MOTION()],
        extra: { spin: 0.5 }, variant: ["rings", [1, 2, 3]], parts: (P) => Math.round(P.rings) * Math.round(P.dots), draw: drawOrbit },
      matrix: { name: "Dot matrix", group: "Patterns", desc: "A grid of dots that swell and fade as the wave sweeps across them: diagonally, by row, by column or out from the centre.",
        params: [sp("cols", "Columns", 3, 12, 1, 7, "Shape"), sp("rows", "Rows", 3, 12, 1, 5, "Shape"), sp("dot", "Dot size", 1, 8, 0.1, 4.5, "Shape"), sp("dir", "Sweep (diagonal, rows, columns, radial)", 0, 3, 1, 0, "Motion"), sp("min", "Smallest dot", 0, 1, 0.01, 0.2, "Motion"), ...MOTION()],
        variant: ["cols", [5, 7, 9]], parts: (P) => Math.round(P.cols) + Math.round(P.rows), draw: drawMatrix },
      ribbon: { name: "Ribbon", group: "Patterns", desc: "A row of rounded bars that rise and fall like a level meter. Every other bar can take the lighter tint.",
        params: [sp("bars", "Bars", 6, 32, 1, 16, "Shape"), sp("width", "Bar width", 1, 8, 0.1, 3.4, "Shape"), sp("height", "Height", 0.3, 1, 0.01, 0.8, "Shape"), tg("tint", "Tint every other bar", true), sp("min", "Lowest bar", 0, 1, 0.01, 0.15, "Motion"), ...MOTION()],
        variant: ["bars", [10, 16, 24]], parts: (P) => Math.round(P.bars), draw: drawRibbon },
      word: { name: "Kinetic word", group: "Type", desc: "Blocky letters that stretch to fill their box. Letter widths swell in a wave; the cursor pushes nearby letters wider.",
        params: [sp("odd", "Tint, odd letters", 0, 1, 0.01, 0.5, "Shape"), sp("even", "Tint, even letters", 0, 1, 0.01, 0.36, "Shape"), sp("wave", "Wave amount", 0, 1, 0.01, 0.45, "Motion"), sp("second", "Second wave", 0, 1, 0.01, 0.2, "Motion"), sp("bob", "Bob", 0, 1, 0.01, 0, "Motion"), sp("speed", "Speed", 0.2, 3, 0.01, 1.6, "Motion"), sp("push", "Cursor push", 0, 3, 0.01, 1.2, "Motion"), sp("travel", "Travel", 0, 2, 0.01, 1, "Motion")],
        extra: { word: "smoke" }, variant: ["word", ["smoke", "read", "sip", "flower"]], parts: (P) => Math.max(1, [...(P.word || "smoke")].length), draw: drawWord },
      proc: { name: "Procedural trail", group: "Cursor trails", desc: "The cursor lays down a chain of small shapes joined by a hairline. Shape, size, colour and tone step along the chain.",
        params: [sp("size", "Size", 0.5, 3, 0.01, 1.4, "Shape"), sp("hairW", "Hairline width", 0.5, 3, 0.1, 1.2, "Shape"), sp("every", "Colour changes every", 1, 12, 1, 5, "Shape"), sp("spacing", "Spacing", 6, 40, 1, 15, "Motion"), sp("life", "Life (ms)", 200, 2000, 10, 950, "Motion"), sp("maxLen", "Max length (px)", 80, 600, 1, 260, "Motion"), sp("breathe", "Breathing", 0, 0.5, 0.01, 0.12, "Motion")],
        extra: { shapes: ["dot", "square", "ring", "rect", "cell", "node", "outline"], hair: true }, draw: drawProcMini, trail: true },
      ptrail: { name: "Pattern trail", group: "Cursor trails", desc: "The patterns themselves pop out along the cursor path, cycling colours, then shrink away.",
        params: [sp("size", "Size", 20, 120, 1, 51, "Shape"), sp("max", "Max on screen", 3, 30, 1, 11, "Shape"), sp("spacing", "Spacing", 30, 200, 1, 79, "Motion"), sp("life", "Life (ms)", 300, 3000, 10, 950, "Motion"), sp("over", "Pop overshoot", 0, 3, 0.01, 1, "Motion"), sp("tumble", "Tumble", 0, 2, 0.01, 0, "Motion")],
        draw: drawPatMini, trail: true },
    };
    const KEYS = Object.keys(SYS);
    const PATTERNS = KEYS.filter((k) => SYS[k].group === "Patterns");
    const EXPORTABLE = KEYS.filter((k) => !SYS[k].trail);
    const SHAPES = SYS.proc.extra.shapes.slice();
    const SHAPE_NAMES = { dot: "Dot", square: "Square", ring: "Ring", rect: "Rect", cell: "Cell", node: "Node", outline: "Outline ring" };

    // ── State: shared knobs plus one params object per system ──
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const GLOBALS = { tempo: 1.7, offset: 1.15, wave: "sine", shaping: "linear", stagger: "linear", colorMode: "solid", bgMode: "plain", color: 0, paper: "ink" };
    const defaults = () => {
      const sys = {};
      for (const k of KEYS) { sys[k] = {}; SYS[k].params.forEach((p) => (sys[k][p.k] = p.def)); Object.assign(sys[k], clone(SYS[k].extra || {})); }
      return { ...GLOBALS, palette: DEFAULT_PAL.slice(), sys };
    };
    // Accepts anything (localStorage, a shared link) and keeps only valid values
    const load = (o, base = defaults()) => {
      if (!o || typeof o !== "object") return base;
      const num = (v, a, b, d) => (Number.isFinite(v) ? clamp(v, a, b) : d);
      base.tempo = num(o.tempo, 0.2, 3, base.tempo); base.offset = num(o.offset, 0, 3, base.offset);
      for (const [key, set] of [["wave", WAVES], ["shaping", SHAPING], ["stagger", STAGGER], ["colorMode", NAMES.colorMode], ["bgMode", NAMES.bgMode], ["paper", PAPERS]]) if (set[o[key]]) base[key] = o[key];
      if (PAL[o.color]) base.color = o.color;
      if (Array.isArray(o.palette)) o.palette.slice(0, PAL.length).forEach((c, i) => { if (/^#[0-9a-f]{6}$/i.test(c)) base.palette[i] = c.toUpperCase(); });
      for (const k of KEYS) {
        const src = o.sys && o.sys[k]; if (!src) continue;
        SYS[k].params.forEach((p) => {
          const v = src[p.k];
          if (p.toggle) { if (typeof v === "boolean") base.sys[k][p.k] = v; }
          else if (Number.isFinite(v)) base.sys[k][p.k] = clamp(v, p.min, p.max);
        });
        if (typeof src.word === "string") base.sys[k].word = src.word.slice(0, 10);
        if (Array.isArray(src.shapes)) base.sys[k].shapes = src.shapes.filter((s) => SHAPES.includes(s));
        if (typeof src.hair === "boolean") base.sys[k].hair = src.hair;
      }
      return base;
    };
    const encode = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, "");
    const decode = (s) => JSON.parse(decodeURIComponent(escape(atob(s))));
    const SHORT = { Defaults: "", Saved: "Saved", "Unsaved changes": "Edited", "From a shared link": "Shared" };
    let S = defaults(), status = "Defaults";
    const fromHash = full && /^#s=/.test(location.hash);
    try {
      if (fromHash) { S = load(decode(location.hash.slice(3))); status = "From a shared link"; }
      else { const o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o) { S = load(o); status = "Saved"; } }
    } catch {}

    /* ── the lab takes the page's theme. In the tile it is always dark, to sit on the tile's black. ── */
    const siteMode = () => (auto ? "dark" : document.documentElement.dataset.theme === "light" ? "light" : "dark");
    const syncPaper = () => { S.paper = siteMode() === "light" ? "paper" : "ink"; };
    const syncPal = () => { S.palette.forEach((c, i) => (PAL[i] = c)); };
    syncPaper(); syncPal();
    let clk = 0.35, playing = !reduce, CUR = PAL[S.color];
    const BG = () => PAPERS[S.paper].bg, FG = () => PAPERS[S.paper].fg;
    const partsOf = (k, P) => (SYS[k].parts ? SYS[k].parts(P) : 8);
    const paint = (ctx, k, x, y, s, col, copy = 0, P = S.sys[k], ex) => SYS[k].draw(ctx, x, y, s, P, col, waveFor(S, P, copy, clk, partsOf(k, P)), ex);

    // ── Canvases: every drawing surface registers here and is repainted each frame while it is on the page ──
    let R = Math.min(3, devicePixelRatio || 1);
    const cans = [];
    const resize = (e) => { e.el.width = Math.round(e.w * R); e.el.height = Math.round(e.h * R); };
    function can(w, hh, fn, cls) {
      const el = h("canvas", cls || "");
      el.style.width = `${w}px`; el.style.height = `${hh}px`; el.setAttribute("aria-hidden", "true");
      const e = { el, w, h: hh, fn, ctx: el.getContext("2d") };
      resize(e); cans.push(e);
      return el;
    }

    // ── Shell ──
    const ICON = {
      play: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>',
      pause: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor"/></svg>',
      undo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 3 2.5 6l3 3"/><path d="M2.5 6h7a4 4 0 0 1 0 8H7"/></svg>',
      redo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 3l3 3-3 3"/><path d="M13.5 6h-7a4 4 0 0 0 0 8H9"/></svg>',
      open: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h4v4M13 3 7.5 8.5M11 9.5V13H3V5h3.5"/></svg>',
      theme: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor"/></svg>',
      chev: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>',
      shuffle: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4.5h2.5c3 0 4 7 7 7H14M2 11.5h2.5c1 0 1.800-.8 2.500-1.800M9.500 6.300c.7-1 1.500-1.800 2-1.800H14M12 2.500l2 2-2 2M12 9.500l2 2-2 2"/></svg>',
    };
    const opts = (map) => Object.entries(map).map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    const cv = h("div", `ix ix-ml${full ? " is-full" : ""}`);
    cv.dataset.mode = siteMode();
    cv.innerHTML = `
      <header class="ml__top">
        <div class="ml__brand">
          ${full ? '<a class="ml__icon ml__back" href="/playground" aria-label="Back to the playground"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5"/></svg></a>' : ""}
          <span class="ml__eyebrow">Motion lab ( ${KEYS.length} )</span><span class="ml__state" data-state aria-live="polite"></span>
        </div>
        <div class="ml__ctl">
          <button class="ml__icon" type="button" data-play></button>
          <div class="ml__knobs" data-knobs></div>
          <button class="ml__btn ml__btn--ghost" type="button" data-tap title="Tap in time to set the tempo">Tap</button>
          <label class="ml__sel"><span class="ml__sr">Wave</span><select data-wave title="Wave">${opts(NAMES.wave)}</select></label>
        </div>
        <div class="ml__end">
          <div class="ml__sw" role="radiogroup" aria-label="Colour">${PAL.map((c, i) => `<button type="button" role="radio" style="--c:${c}" aria-label="${PAL_NAMES[i]}" data-c="${i}"></button>`).join("")}</div>
          <div class="ml__pair"><button class="ml__icon" type="button" data-undo aria-label="Undo">${ICON.undo}</button><button class="ml__icon" type="button" data-redo aria-label="Redo">${ICON.redo}</button></div>
          <button class="ml__icon" type="button" data-theme aria-label="Switch theme">${ICON.theme}</button>
          <button class="ml__btn ml__btn--ghost" type="button" data-export aria-haspopup="dialog">Export ${ICON.chev}</button>
          <button class="ml__btn" type="button" data-save>Save ${ICON.chev}</button>
          ${full ? "" : `<a class="ml__icon" href="/motion-lab" data-open aria-label="Open Motion lab in a full page" title="Open in a full page">${ICON.open}</a>`}
        </div>
      </header>
      <div class="ml__body">
        <nav class="ml__side" aria-label="Systems" data-side></nav>
        <div class="ml__main" data-main></div>
        <aside class="ml__panel" data-panel></aside>
      </div>
      <div class="ml__sheet" data-sheet role="dialog" aria-modal="true" aria-labelledby="ml-x-${UID}" hidden>
        <div class="ml__sheetin">
          <header class="ml__sheethead">
            <h3 id="ml-x-${UID}">Export</h3>
            <label class="ml__sel"><span>System</span><select data-xsys>${EXPORTABLE.map((k) => `<option value="${k}">${SYS[k].name}</option>`).join("")}</select></label>
            <button class="ml__icon ml__close" type="button" data-xclose aria-label="Close export"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
          </header>
          <div class="ml__tabs" role="tablist" aria-label="Format">${["js", "react", "css", "json"].map((t, i) => `<button type="button" role="tab" data-tab="${t}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}">${{ js: "JavaScript", react: "React", css: "CSS", json: "JSON" }[t]}</button>`).join("")}</div>
          <p class="ml__desc ml__xnote" data-xnote></p>
          <pre class="ml__code" tabindex="0" aria-label="Exported code"><code data-code></code></pre>
          <footer class="ml__sheetfoot">
            <div><button class="ml__btn" type="button" data-xcopy>Copy code</button><button class="ml__btn ml__btn--ghost" type="button" data-xfile>Download file</button></div>
            <div class="ml__media">
              <label class="ml__check"><input type="checkbox" data-xalpha><span>Transparent PNG</span></label>
              <button class="ml__btn ml__btn--ghost" type="button" data-xpng>PNG</button>
              <button class="ml__btn ml__btn--ghost" type="button" data-xboard title="Six frames across one loop, as a contact sheet">Storyboard</button>
              <button class="ml__btn ml__btn--ghost" type="button" data-xvid>Record loop</button>
              <button class="ml__btn ml__btn--ghost" type="button" data-xlink>Share link</button>
            </div>
          </footer>
        </div>
      </div>`;
    stage.appendChild(cv);
    const f = full ? { scale: () => 1, stop: () => {} } : fit(stage, cv, W, H, bleed ? 1 : 0.94);
    const q = (s) => cv.querySelector(s);
    const main = q("[data-main]"), panel = q("[data-panel]"), side = q("[data-side]"), stateEl = q("[data-state]");
    const playBtn = q("[data-play]"), waveSel = q("[data-wave]"), themeBtn = q("[data-theme]"), tapBtn = q("[data-tap]"), swatches = [...cv.querySelectorAll("[data-c]")];
    const undoBtn = q("[data-undo]"), redoBtn = q("[data-redo]");
    const mw = () => Math.max(320, main.clientWidth - 40);

    const fmt = (v, step) => (step >= 1 ? String(Math.round(v)) : v.toFixed(2));
    function slider(obj, p, onChange) {
      const row = h("label", "ml__row");
      row.innerHTML = `<span>${p.label}</span><input type="range" min="${p.min}" max="${p.max}" step="${p.step}"><output></output>`;
      const inp = row.querySelector("input"), out = row.querySelector("output");
      const sync = () => { const v = obj[p.k]; inp.value = v; out.textContent = fmt(v, p.step); inp.style.setProperty("--p", `${((v - p.min) / (p.max - p.min)) * 100}%`); };
      inp.addEventListener("input", () => { obj[p.k] = +inp.value; sync(); touched(); onChange && onChange(); });
      inp.addEventListener("dblclick", () => { obj[p.k] = p.def ?? obj[p.k]; sync(); touched(); onChange && onChange(); });
      row.sync = sync; sync();
      return row;
    }
    function toggle(obj, key, label, onChange) {
      const l = h("label", "ml__check ml__check--wide"), c = h("input"); c.type = "checkbox"; c.checked = !!obj[key];
      c.addEventListener("change", () => { obj[key] = c.checked; touched(); onChange && onChange(); });
      l.append(c, h("span", "", label)); return l;
    }
    function select(obj, key, label, map, onChange) {
      const l = h("label", "ml__row ml__row--sel"), s = h("select");
      s.innerHTML = opts(map); s.value = obj[key];
      s.addEventListener("change", () => { obj[key] = s.value; touched(); onChange && onChange(); });
      l.append(h("span", "", label), s); return l;
    }
    let knobs = [];
    const buildKnobs = () => {
      knobs = [slider(S, sp("tempo", "Tempo", 0.2, 3, 0.01, 1.7), refreshTop), slider(S, sp("offset", "Offset", 0, 3, 0.01, 1.15))];
      q("[data-knobs]").replaceChildren(...knobs);
    };
    buildKnobs();

    // ── History: every settled change is a step; undo and redo walk it ──
    const hist = [JSON.stringify(S)];
    let hi = 0, commitT = 0, linkT = 0;
    const commit = () => {
      const snap = JSON.stringify(S);
      if (snap === hist[hi]) return;
      hist.splice(hi + 1); hist.push(snap); if (hist.length > 80) hist.shift(); hi = hist.length - 1; refreshTop();
    };
    function apply(snap) {
      S = load(JSON.parse(snap)); syncPaper(); syncPal(); buildKnobs(); status = "Unsaved changes"; refreshTop(); renderMain(); renderPanel();
    }
    const undo = () => { clearTimeout(commitT); commit(); if (hi > 0) apply(hist[--hi]); };
    const redo = () => { if (hi < hist.length - 1) apply(hist[++hi]); };
    undoBtn.addEventListener("click", undo); redoBtn.addEventListener("click", redo);

    function touched() {
      if (auto) return;
      status = "Unsaved changes"; stateEl.textContent = (status in SHORT ? SHORT[status] : status);
      clearTimeout(commitT); commitT = setTimeout(commit, 320);
      if (full) { clearTimeout(linkT); linkT = setTimeout(() => { try { history.replaceState(null, "", `#s=${encode(S)}`); } catch {} }, 400); }
    }
    function refreshTop() {
      knobs.forEach((k) => k.sync());
      waveSel.value = S.wave; cv.dataset.mode = siteMode(); cv.dataset.bg = S.bgMode;
      themeBtn.setAttribute("aria-label", siteMode() === "dark" ? "Switch to light mode" : "Switch to dark mode");
      swatches.forEach((b, i) => b.style.setProperty("--c", PAL[i]));
      swatches.forEach((b, i) => { b.setAttribute("aria-checked", String(i === S.color)); b.tabIndex = i === S.color ? 0 : -1; });
      playBtn.innerHTML = playing ? ICON.pause : ICON.play; playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
      undoBtn.disabled = hi === 0; redoBtn.disabled = hi >= hist.length - 1;
      stateEl.textContent = (status in SHORT ? SHORT[status] : status);
      const wl = q("[data-wlab]"); if (wl) wl.textContent = `${NAMES.wave[S.wave]} · ${NAMES.shaping[S.shaping]} · ${NAMES.stagger[S.stagger]} · tempo ${S.tempo.toFixed(1)}`;
    }
    playBtn.addEventListener("click", () => { playing = !playing; refreshTop(); });
    waveSel.addEventListener("change", () => { S.wave = waveSel.value; touched(); refreshTop(); });
    themeBtn.addEventListener("click", () => {
      if (auto) return;
      const t = siteMode() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem("theme", t); } catch {}
    });
    /* the site's own toggle (or this one) flips <html data-theme>; the lab follows it */
    const themeWatch = auto ? null : new MutationObserver(() => { syncPaper(); refreshTop(); });
    themeWatch && themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    /* ── tap tempo: one tap is one wave. The mean of the last few gaps sets the tempo. ── */
    let taps = [];
    tapBtn.addEventListener("click", () => {
      const now = performance.now();
      if (taps.length && now - taps[taps.length - 1] > 2500) taps = [];
      taps.push(now); taps = taps.slice(-6);
      if (taps.length < 2) { flash(tapBtn, "Again…"); return; }
      const gap = (taps[taps.length - 1] - taps[0]) / (taps.length - 1) / 1000;
      S.tempo = clamp(+(3.125 / gap).toFixed(2), 0.2, 3); touched(); refreshTop();
      flash(tapBtn, `${S.tempo.toFixed(2)}×`);
    });
    swatches.forEach((b, i) => {
      b.addEventListener("click", () => { S.color = i; touched(); refreshTop(); markVariants(); });
      b.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
        e.preventDefault(); e.stopPropagation(); S.color = (S.color + d + PAL.length) % PAL.length; touched(); refreshTop(); markVariants(); swatches[S.color].focus();
      });
    });
    const flash = (btn, text) => { const t = btn.dataset.label || (btn.dataset.label = btn.textContent); btn.textContent = text; clearTimeout(btn._t); btn._t = setTimeout(() => (btn.textContent = t), 1400); };
    q("[data-save]").addEventListener("click", (e) => {
      if (auto) return;
      try { localStorage.setItem(KEY, JSON.stringify(S)); status = "Saved"; refreshTop(); flash(e.currentTarget, "Saved ✓"); }
      catch { flash(e.currentTarget, "Not saved"); }
    });

    // ── Sidebar ──
    let view = "all";
    const navs = {};
    const navBtn = (k, label, sub) => {
      const b = h("button", "ml__nav"); b.type = "button";
      const ico = k === "all" ? h("span", "ml__allico", "<i></i>") : can(22, 22, (c, w, hh) => paint(c, k, w / 2, hh / 2, k === "word" ? 24 : 22, CUR, 0));
      const txt = h("span", "ml__navt", label); if (sub) txt.append(h("small", "", sub));
      b.append(ico, txt);
      b.addEventListener("click", () => show(k));
      navs[k] = b; return b;
    };
    side.append(navBtn("all", "All systems", "Side by side, in sync"));
    let lastGroup = "";
    for (const k of KEYS) {
      if (SYS[k].group !== lastGroup) { lastGroup = SYS[k].group; side.append(h("p", "ml__group", lastGroup)); }
      side.append(navBtn(k, SYS[k].name));
    }

    function show(k) {
      view = k;
      Object.entries(navs).forEach(([key, b]) => b.setAttribute("aria-pressed", String(key === k)));
      renderMain(); renderPanel(); main.scrollTop = 0;
    }

    // ── Main column ──
    const head = (left, right) => { const e = h("header", "ml__sechead"); e.append(h("span", "", left), h("span", "", right || "")); return e; };
    let variantCells = [], onTick = null;
    function markVariants() {
      variantCells.forEach(({ el, key, v, ci }) => el.classList.toggle("is-on", S.sys[view] && S.sys[view][key] === v && S.color === ci));
    }
    function renderMain() {
      main.replaceChildren(); variantCells = []; onTick = null;
      main.classList.toggle("is-trail", !!(SYS[view] && SYS[view].trail));
      if (view === "all") return renderAll();
      if (SYS[view].trail) return renderTrail(view);
      const k = view, d = SYS[k], isWord = k === "word", w = mw();

      const hero = h("div", "ml__hero");
      const ptr = { x: 0, y: 0, on: false }, HH = full ? 300 : 250;
      const big = can(w, HH, (c, cw, ch) => (isWord ? paint(c, k, cw / 2, ch / 2, 0, CUR, 0, undefined, { bw: Math.min(cw * 0.7, 560), bh: ch * 0.62, ptr }) : paint(c, k, cw / 2, ch / 2, ch * 0.84, CUR)));
      big.setAttribute("role", "img"); big.removeAttribute("aria-hidden"); big.setAttribute("aria-label", `${d.name}, animated`);
      if (isWord) {
        const at = (e) => { const r = big.getBoundingClientRect(); ptr.x = ((e.clientX - r.left) / r.width) * w; ptr.y = ((e.clientY - r.top) / r.height) * HH; ptr.on = true; };
        big.addEventListener("pointermove", at); big.addEventListener("pointerdown", at);
        big.addEventListener("pointerleave", () => (ptr.on = false));
      }
      const sizes = h("div", "ml__sizes");
      for (const px of [28, 48, 96]) {
        const fig = h("figure");
        fig.append(can(px, isWord ? Math.round(px * 0.45) : px, (c, cw, ch) => paint(c, k, cw / 2, ch / 2, px, CUR, 1)), h("figcaption", "", `${px}px`));
        sizes.append(fig);
      }
      hero.append(big, sizes);

      const plot = h("section", "ml__sec");
      plot.append(head("Motion: each part over time", ""));
      plot.querySelector(".ml__sechead span:last-child").dataset.wlab = "";
      plot.append(can(w, 120, (c, cw, ch) => {
        const P = S.sys[k], n = Math.min(10, partsOf(k, P)), span = 3, amp = Math.max(1, P.travel ?? 1);
        seg(c, 0, ch / 2, cw, ch / 2, 1, mix(FG(), BG(), 0.9));
        for (let i = n - 1; i >= 0; i--) {
          c.beginPath();
          for (let x = 0; x <= cw; x += 3) {
            const v = waveFor(S, P, 0, clk - span + (span * x) / cw, partsOf(k, P))(i);
            const yy = ch / 2 - (v / amp) * ch * 0.42;
            x ? c.lineTo(x, yy) : c.moveTo(x, yy);
          }
          c.lineWidth = i ? 1 : 2; c.strokeStyle = i ? mix(CUR, BG(), 0.72) : CUR; c.lineJoin = "round"; c.stroke();
        }
        dot(c, cw - 3, ch / 2 - (waveFor(S, P, 0, clk, partsOf(k, P))(0) / amp) * ch * 0.42, 3.5, CUR);
      }));
      plot.append(h("p", "ml__foot", "part 1 = bold line · now →"));
      /* a scrubber over a 20-unit loop of the shared clock: drag to park on a frame, and it follows the clock while it plays */
      const LOOP = 20, tr = h("label", "ml__row ml__scrub");
      tr.innerHTML = `<span>Time</span><input type="range" min="0" max="${LOOP}" step="0.01" aria-label="Scrub the clock"><output></output>`;
      const si = tr.querySelector("input"), so = tr.querySelector("output");
      let scrubbing = false;
      const paintScrub = () => { const v = ((clk % LOOP) + LOOP) % LOOP; si.value = v; so.textContent = `${v.toFixed(1)}`; si.style.setProperty("--p", `${(v / LOOP) * 100}%`); };
      si.addEventListener("pointerdown", () => { scrubbing = true; });
      ["pointerup", "pointercancel", "blur"].forEach((ev) => si.addEventListener(ev, () => { scrubbing = false; }));
      si.addEventListener("input", () => { playing = false; clk = +si.value; refreshTop(); paintScrub(); });
      onTick = () => { if (!scrubbing) paintScrub(); };
      plot.append(tr);

      const vars = h("section", "ml__sec");
      vars.append(head(isWord ? "Words in use × colours" : "Variants × colours", isWord ? "Click a word to use it" : "Click one to use it"));
      const grid = h("div", "ml__swatchgrid");
      const [key, vals, label] = d.variant;
      vals.forEach((v) => PAL.forEach((col, ci) => {
        const b = h("button", "ml__cell"); b.type = "button";
        b.setAttribute("aria-label", `${label ? label(v) : v}, ${PAL_NAMES[ci]}`);
        b.append(can(isWord ? 100 : 92, isWord ? 40 : 58, (c, cw, ch) => paint(c, k, cw / 2, ch / 2, isWord ? 100 : 54, PAL[ci], ci, { ...S.sys[k], [key]: v })));
        if (!isWord) b.append(h("span", "", label ? label(v) : String(v)));
        b.addEventListener("click", () => { S.sys[k][key] = v; S.color = ci; touched(); refreshTop(); renderPanel(); markVariants(); });
        grid.append(b); variantCells.push({ el: b, key, v, ci });
      }));
      vars.append(grid);
      main.append(hero, plot, vars);
      refreshTop(); markVariants();
    }

    function renderAll() {
      const grid = h("div", "ml__cards");
      KEYS.forEach((k, i) => {
        const b = h("button", "ml__card"); b.type = "button"; b.setAttribute("aria-label", `Open ${SYS[k].name}`);
        b.append(h("span", "ml__cardlab", SYS[k].name), can(150, 86, (c, w, hh) => paint(c, k, w / 2, hh / 2, k === "word" ? 120 : 78, CUR, i)));
        b.addEventListener("click", () => show(k));
        grid.append(b);
      });
      const sec = h("section", "ml__sec");
      sec.append(head("Every pattern in every colour", "Click one to use it"));
      const sg = h("div", "ml__swatchgrid");
      PATTERNS.forEach((k, r) => PAL.forEach((col, ci) => {
        const b = h("button", "ml__cell"); b.type = "button"; b.setAttribute("aria-label", `${SYS[k].name}, ${PAL_NAMES[ci]}`);
        b.append(can(80, 52, (c, w, hh) => paint(c, k, w / 2, hh / 2, 50, PAL[ci], r + ci)));
        b.addEventListener("click", () => { S.color = ci; touched(); show(k); refreshTop(); });
        sg.append(b);
      }));
      sec.append(sg);
      main.append(grid, sec);
    }

    // Trails: the canvas is the playground. Before the first pointer move (and always in the tile) a ghost cursor draws on it.
    function renderTrail(k) {
      const wrap = h("div", "ml__trail");
      const hint = h("p", "ml__hint", "Move your pointer around in here");
      const tr = { items: [], last: null, id: 0, real: false };
      const P = () => S.sys[k], BW = mw(), BH = Math.max(300, main.clientHeight - 40);
      const add = (x, y, now) => {
        const id = tr.id++;
        tr.items.push(k === "proc" ? { x, y, born: now, id } : { x, y, born: now, id, sys: PATTERNS[id % PATTERNS.length], ci: (S.color + id) % PAL.length, rot: (id % 2 ? -1 : 1) });
        if (k === "ptrail" && tr.items.length > P().max) tr.items.splice(0, tr.items.length - Math.round(P().max));
      };
      const feed = (x, y, now) => {
        if (!tr.last) { tr.last = [x, y]; add(x, y, now); return; }
        let [lx, ly] = tr.last, d = Math.hypot(x - lx, y - ly);
        const gap = P().spacing;
        while (d >= gap) { lx += ((x - lx) * gap) / d; ly += ((y - ly) * gap) / d; add(lx, ly, now); d = Math.hypot(x - lx, y - ly); }
        tr.last = [lx, ly];
      };
      const board = can(BW, BH, (c, w, hh) => {
        const now = performance.now(), p = P();
        if (auto || !tr.real) {
          const t = now / 1000;
          feed(w / 2 + Math.cos(t * 1.1) * w * 0.32 + Math.sin(t * 2.7) * w * 0.05, hh / 2 + Math.sin(t * 1.7) * hh * 0.28, now);
        }
        tr.items = tr.items.filter((it) => now - it.born < p.life);
        wrap.classList.toggle("has-ink", tr.items.length > 0);
        if (k === "proc") {
          let len = 0;
          for (let i = tr.items.length - 1; i > 0; i--) {
            len += Math.hypot(tr.items[i].x - tr.items[i - 1].x, tr.items[i].y - tr.items[i - 1].y);
            if (len > p.maxLen) { tr.items.splice(0, i); break; }
          }
          if (p.hair && tr.items.length > 1) {
            c.beginPath(); tr.items.forEach((it, i) => (i ? c.lineTo(it.x, it.y) : c.moveTo(it.x, it.y)));
            c.lineWidth = p.hairW * 0.6; c.strokeStyle = mix(FG(), BG(), 0.55); c.lineJoin = "round"; c.stroke();
          }
          const on = SHAPES.filter((s) => p.shapes.includes(s)); if (!on.length) on.push("dot");
          tr.items.forEach((it) => {
            const a = (now - it.born) / p.life, r = p.size * 3.4 * (1 - a) ** 0.7 * (1 + p.breathe * Math.sin(now / 240 + it.id));
            shape(c, on[it.id % on.length], it.x, it.y, r, PAL[(S.color + Math.floor(it.id / p.every)) % PAL.length]);
          });
        } else {
          tr.items.forEach((it) => {
            const a = (now - it.born) / p.life, grow = backOut(Math.min(1, a / 0.22), p.over), shrink = a < 0.6 ? 1 : 1 - (a - 0.6) / 0.4;
            const s = p.size * grow * shrink;
            if (s <= 0.5) return;
            c.save(); c.translate(it.x, it.y); c.rotate(it.rot * p.tumble * a * Math.PI);
            paint(c, it.sys, 0, 0, s, PAL[it.ci], it.id); c.restore();
          });
        }
      });
      const at = (e) => { const r = board.getBoundingClientRect(); if (!tr.real) { tr.real = true; tr.last = null; } feed(((e.clientX - r.left) / r.width) * BW, ((e.clientY - r.top) / r.height) * BH, performance.now()); };
      board.addEventListener("pointermove", at); board.addEventListener("pointerdown", at);
      board.addEventListener("pointerleave", () => (tr.last = null));
      wrap.append(board, hint);
      main.append(wrap);
    }

    // ── Right panel ──
    /* Your own presets live in this browser. A preset is the whole state, so it brings its palette with it. */
    const PKEY = "pg-motion-lab-presets";
    let mine = [];
    try { const o = JSON.parse(localStorage.getItem(PKEY) || "[]"); if (Array.isArray(o)) mine = o.filter((x) => x && typeof x.name === "string" && x.state).slice(0, 12); } catch {}
    const keepMine = () => { try { localStorage.setItem(PKEY, JSON.stringify(mine)); } catch {} };
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
    const snap = (v, p) => clamp(+(Math.round((v - p.min) / p.step) * p.step + p.min).toFixed(3), p.min, p.max);
    // Random values from the middle 70% of each range, so a roll is never at an extreme that breaks the effect
    function randomise(k) {
      const P = S.sys[k];
      SYS[k].params.forEach((p) => {
        if (p.toggle) P[p.k] = Math.random() < 0.5;
        else if (p.step >= 1 && p.max - p.min <= 3) P[p.k] = Math.round(rnd(p.min, p.max));
        else P[p.k] = snap(rnd(p.min + (p.max - p.min) * 0.15, p.max - (p.max - p.min) * 0.15), p);
      });
    }
    const surprise = () => {
      Object.assign(S, { wave: pick(Object.keys(WAVES)), shaping: pick(Object.keys(SHAPING)), stagger: pick(Object.keys(STAGGER)), tempo: +rnd(0.8, 2.6).toFixed(2), offset: +rnd(0.2, 2.4).toFixed(2) });
      buildKnobs(); touched(); refreshTop(); renderPanel();
    };
    function chipRow(entries, onPick, onDelete) {
      const row = h("div", "ml__chips");
      entries.forEach(([name, val], i) => {
        const wrap = h("span", "ml__chipwrap");
        const b = h("button", "ml__chip", name); b.type = "button"; b.addEventListener("click", () => onPick(val, i));
        wrap.append(b);
        if (onDelete) { const x = h("button", "ml__chipx", "×"); x.type = "button"; x.setAttribute("aria-label", `Delete preset ${name}`); x.addEventListener("click", () => onDelete(i)); wrap.append(x); }
        row.append(wrap);
      });
      return row;
    }
    const ghost = (label, onClick, icon) => { const b = h("button", "ml__btn ml__btn--ghost ml__btn--full", `${label}${icon || ""}`); b.type = "button"; b.addEventListener("click", onClick); return b; };

    function renderPanel() {
      panel.replaceChildren();
      if (view === "all") {
        panel.append(h("h3", "", "All systems"), h("p", "ml__desc", "Everything running together on one shared clock. Pick a system on the left to tune it; the settings here and in the top bar apply to all of them."));
        panel.append(h("p", "ml__lab", "Presets"));
        panel.append(chipRow(Object.entries(PRESETS), (p) => { Object.assign(S, p); buildKnobs(); touched(); refreshTop(); renderPanel(); }));
        panel.append(ghost("Surprise me", surprise, ICON.shuffle));
        panel.append(h("p", "ml__lab", "Yours"));
        if (mine.length) panel.append(chipRow(mine.map((m) => [m.name, m.state]), (st) => { S = load(st); syncPaper(); syncPal(); buildKnobs(); touched(); refreshTop(); renderMain(); renderPanel(); }, (i) => { mine.splice(i, 1); keepMine(); renderPanel(); }));
        const nameRow = h("form", "ml__save");
        nameRow.innerHTML = '<input class="ml__text" type="text" maxlength="18" placeholder="Name this setup" aria-label="Preset name" autocomplete="off" spellcheck="false"><button class="ml__btn ml__btn--ghost" type="submit">Save</button>';
        nameRow.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = nameRow.querySelector("input").value.trim().slice(0, 18);
          if (!name) { nameRow.querySelector("input").focus(); return; }
          mine = [{ name, state: clone(S) }, ...mine.filter((m) => m.name !== name)].slice(0, 12); keepMine(); renderPanel();
        });
        panel.append(nameRow);

        panel.append(h("p", "ml__lab", "Shared"));
        panel.append(
          select(S, "shaping", "Shaping", NAMES.shaping, refreshTop),
          select(S, "stagger", "Stagger", NAMES.stagger, refreshTop),
          select(S, "colorMode", "Colour", NAMES.colorMode),
          select(S, "bgMode", "Background", NAMES.bgMode, refreshTop),
        );

        /* the palette is the brand's: six colours, each editable, and every system, swatch and export follows */
        panel.append(h("p", "ml__lab", "Palette"));
        const pal = h("div", "ml__pal");
        PAL.forEach((c, i) => {
          const l = h("label", "ml__well"); l.title = `${PAL_NAMES[i]} · ${c}`;
          const inp = h("input"); inp.type = "color"; inp.value = c; inp.setAttribute("aria-label", `${PAL_NAMES[i]} colour`);
          l.style.setProperty("--c", c);
          inp.addEventListener("input", () => { S.palette[i] = inp.value.toUpperCase(); syncPal(); l.style.setProperty("--c", PAL[i]); l.title = `${PAL_NAMES[i]} · ${PAL[i]}`; refreshTop(); touched(); });
          l.append(inp); pal.append(l);
        });
        panel.append(pal, h("p", "ml__desc", "<b>Tempo</b> is how fast every wave runs. <b>Offset</b> shifts each part and each copy so neighbours don't move in lockstep. <b>Wave</b> sets the curve, <b>Shaping</b> bends it, and <b>Stagger</b> decides who moves first."));
        if (full) {
          panel.append(h("p", "ml__lab", "Keys"));
          panel.append(h("dl", "ml__keys", [["Space", "Play or pause"], ["0–9", "Switch system"], ["← →", "Step the clock while paused"], ["[ ]", "Tempo down or up"], ["T", "Tap tempo"], ["R", "Randomise this system"], ["⌘Z", "Undo (⇧ to redo)"], ["E", "Export"]].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")));
        }
        const r = ghost("Reset everything", () => { S = defaults(); syncPaper(); syncPal(); buildKnobs(); touched(); refreshTop(); renderMain(); renderPanel(); });
        panel.append(r);
        return;
      }
      const d = SYS[view], P = S.sys[view];
      panel.append(h("h3", "", d.name), h("p", "ml__desc", d.desc));
      if (view === "word") {
        panel.append(h("p", "ml__lab", "Text"));
        const lab = h("label", "ml__row ml__row--text"), inp = h("input", "ml__text");
        inp.type = "text"; inp.maxLength = 10; inp.value = P.word; inp.spellcheck = false; inp.autocomplete = "off";
        inp.addEventListener("input", () => { P.word = inp.value.replace(/[^\p{L}\p{N} ]/gu, "").slice(0, 10); touched(); });
        lab.append(h("span", "", "Word"), inp); panel.append(lab);
      }
      for (const g of ["Shape", "Motion"]) {
        const ps = d.params.filter((p) => p.group === g);
        if (!ps.length) continue;
        panel.append(h("p", "ml__lab", g));
        if (view === "proc" && g === "Shape") {
          const box = h("div", "ml__checks"); box.setAttribute("role", "group"); box.setAttribute("aria-label", "Shapes");
          SHAPES.forEach((s) => {
            const l = h("label", "ml__check"), c = h("input"); c.type = "checkbox"; c.checked = P.shapes.includes(s);
            c.addEventListener("change", () => { P.shapes = SHAPES.filter((x) => (x === s ? c.checked : P.shapes.includes(x))); touched(); });
            l.append(c, h("span", "", SHAPE_NAMES[s])); box.append(l);
          });
          panel.append(box, toggle(P, "hair", "Hairline between shapes"));
        }
        ps.forEach((p) => panel.append(p.toggle ? toggle(P, p.k, p.label) : slider(P, p, () => p.k === d.variant?.[0] && markVariants())));
      }
      const roll = () => { randomise(view); touched(); renderPanel(); if (!d.trail) renderMain(); };
      rollThis = roll;
      panel.append(ghost("Randomise", roll, ICON.shuffle));
      panel.append(ghost(`Reset ${d.name.toLowerCase()}`, () => { S.sys[view] = defaults().sys[view]; touched(); renderPanel(); if (!d.trail) renderMain(); }));
      panel.append(h("p", "ml__foot ml__tip", "Double-click a slider to reset it."));
    }
    let rollThis = null;

    // ── Export: runnable code built from the same drawing functions the lab uses ──
    const sheet = q("[data-sheet]"), xsys = q("[data-xsys]"), codeEl = q("[data-code]"), xnote = q("[data-xnote]"), tabs = [...cv.querySelectorAll("[data-tab]")];
    let tab = "js";
    const dedent = (src) => {
      const lines = String(src).split("\n");
      const ind = Math.min(...lines.slice(1).filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length), 99);
      return [lines[0], ...lines.slice(1).map((l) => l.slice(Math.min(ind, l.match(/^ */)[0].length)))].join("\n");
    };
    const settingsFor = (k) => ({
      system: k, tempo: +S.tempo.toFixed(2), offset: +S.offset.toFixed(2), wave: S.wave, shaping: S.shaping, stagger: S.stagger,
      colorMode: S.colorMode, palette: PAL, colorIndex: S.color, paper: PAPERS[S.paper].bg, params: S.sys[k],
    });
    function core(k) {
      const d = SYS[k], uses = (name) => d.draw.toString().includes(name) || (name === "LAYOUTS" && d.parts.toString().includes(name));
      const parts = [
        `const SETTINGS = ${JSON.stringify(settingsFor(k), null, 2)};`,
        "",
        "const TAU = Math.PI * 2;",
        `const clamp = ${clamp};`,
        `const WAVES = { ${S.wave}: ${WAVES[S.wave]} };`,
        `const SHAPING = { ${S.shaping}: ${SHAPING[S.shaping]} };`,
        `const STAGGER = { ${S.stagger}: ${STAGGER[S.stagger]} };`,
        `const waveFor = ${dedent(waveFor)};`,
        `const rgb = ${rgb};`,
        `const mix = ${mix};`,
        `const colourAt = ${dedent(colourAt)};`,
        `const BG = () => SETTINGS.paper;`,
        `const dot = ${dot};`,
        `const seg = ${seg};`,
      ];
      if (uses("LAYOUTS")) parts.push(`const LAYOUTS = ${JSON.stringify(LAYOUTS)};`);
      if (uses("glyph")) parts.push(`const WFONT = ${JSON.stringify(WFONT)};`, `const mctx = document.createElement("canvas").getContext("2d"), glyphs = {};`, `const glyph = ${dedent(glyph)};`);
      parts.push(`const parts = ${d.parts};`, "", dedent(d.draw), "");
      const word = k === "word";
      parts.push(`function mountMotion(canvas) {
  const ctx = canvas.getContext("2d");
  let clk = 0, last = 0, raf = 0, dpr = 1;
  const size = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
  };
  const ro = new ResizeObserver(size); ro.observe(canvas); size();
  const frame = (now) => {
    clk += (Math.min(50, now - (last || now)) / 1000) * SETTINGS.tempo; last = now;
    const w = canvas.width / dpr, h = canvas.height / dpr, P = SETTINGS.params;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    ${d.draw.name}(ctx, w / 2, h / 2, ${word ? "0" : "Math.min(w, h) * 0.86"}, P, colourAt(SETTINGS, clk), waveFor(SETTINGS, P, 0, clk, parts(P))${word ? ", { bw: w * 0.92, bh: h * 0.8 }" : ""});
    raf = requestAnimationFrame(frame);
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) frame(0), cancelAnimationFrame(raf);
  else raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); ro.disconnect(); };
}`);
      return parts.join("\n");
    }
    const pascal = (k) => SYS[k].name.replace(/(^|\s)(\w)/g, (_, __, c) => c.toUpperCase()).replace(/\s/g, "");
    function cssFor(k) {
      const P = S.sys[k], period = 1 / ((P.speed ?? 1) * 0.32 * S.tempo), stag = 0.12 * S.offset * period;
      const stops = Array.from({ length: 21 }, (_, i) => {
        const v = SHAPING[S.shaping](WAVES[S.wave](i / 20)) * (P.travel ?? 1);
        return `  ${i * 5}% { transform: translateY(calc(var(--ml-amp) * ${(-v).toFixed(3)})); opacity: ${(0.6 + 0.4 * (0.5 + 0.5 * clamp(v, -1, 1))).toFixed(3)}; }`;
      }).join("\n");
      return `/* Motion lab · CSS tokens for ${SYS[k].name}
   ${NAMES.wave[S.wave]} wave, ${NAMES.shaping[S.shaping].toLowerCase()} shaping, tempo ${S.tempo.toFixed(2)}, offset ${S.offset.toFixed(2)}.
   The keyframes are the shared wave sampled at 21 points, so any element can move in time with the lab. */
:root {
${PAL.map((c, i) => `  --ml-${PAL_NAMES[i].toLowerCase()}: ${c};`).join("\n")}
  --ml-color: var(--ml-${PAL_NAMES[S.color].toLowerCase()});
  --ml-paper: ${PAPERS[S.paper].bg};
  --ml-period: ${period.toFixed(3)}s;   /* one full wave */
  --ml-stagger: ${stag.toFixed(3)}s;  /* delay between neighbouring parts */
  --ml-amp: 8px;              /* how far a part travels */
}

@keyframes ml-wave {
${stops}
}

/* Give each part its place in line: style="--i: 0", "--i: 1", ... */
.ml-part {
  animation: ml-wave var(--ml-period) linear infinite;
  animation-delay: calc(var(--i, 0) * var(--ml-stagger) * -1);
  background: var(--ml-color);
}

@media (prefers-reduced-motion: reduce) {
  .ml-part { animation: none; }
}
`;
    }
    function build() {
      const k = xsys.value, name = SYS[k].name;
      if (tab === "js") {
        xnote.textContent = `A standalone script for ${name}. Add a sized <canvas>, include the file, then call mountMotion(canvas). It returns a function that stops it.`;
        return `// Motion lab · ${name} · exported ${new Date().toISOString().slice(0, 10)}\n// <canvas id="motion" style="width: 320px; height: 320px"></canvas>\n// <script src="motion-${k}.js"></script>\n// <script>mountMotion(document.getElementById("motion"));</script>\n(() => {\n${core(k)}\n\nwindow.mountMotion = mountMotion;\n})();\n`;
      }
      if (tab === "react") {
        xnote.textContent = `A React component for ${name}. Drop the file in and render <${pascal(k)}Motion />; it cleans up when it unmounts.`;
        return `// Motion lab · ${name} · exported ${new Date().toISOString().slice(0, 10)}\nimport { useEffect, useRef } from "react";\n\n${core(k)}\n\nexport default function ${pascal(k)}Motion({ width = ${k === "word" ? 480 : 320}, height = ${k === "word" ? 180 : 320}, ...props }) {\n  const ref = useRef(null);\n  useEffect(() => mountMotion(ref.current), []);\n  return <canvas ref={ref} style={{ width, height }} aria-hidden="true" {...props} />;\n}\n`;
      }
      if (tab === "css") { xnote.textContent = "Tokens and a keyframe track that share the lab's clock, for moving plain HTML in time with it."; return cssFor(k); }
      xnote.textContent = "Every setting in the lab. Paste it back into a shared link, or keep it next to your storyboard.";
      return JSON.stringify(S, null, 2) + "\n";
    }
    const refreshCode = () => { codeEl.textContent = build(); if (typeof labelVid === "function") labelVid(); };
    const openSheet = () => {
      if (auto) return;
      xsys.value = EXPORTABLE.includes(view) ? view : xsys.value;
      refreshCode(); sheet.hidden = false;
      requestAnimationFrame(() => cv.querySelector(`[data-tab="${tab}"]`).focus());
    };
    const closeSheet = () => { sheet.hidden = true; q("[data-export]").focus(); };
    q("[data-export]").addEventListener("click", openSheet);
    q("[data-xclose]").addEventListener("click", closeSheet);
    xsys.addEventListener("change", refreshCode);
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => { tab = t.dataset.tab; tabs.forEach((x) => { x.setAttribute("aria-selected", String(x === t)); x.tabIndex = x === t ? 0 : -1; }); refreshCode(); });
      t.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
        e.preventDefault(); e.stopPropagation(); const n = tabs[(i + d + tabs.length) % tabs.length]; n.click(); n.focus();
      });
    });
    sheet.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeSheet(); }
      else if (e.key === "Tab") {
        const els = [...sheet.querySelectorAll("button, select, [tabindex='0']")].filter((n) => !n.disabled && n.tabIndex >= 0);
        if (e.shiftKey && document.activeElement === els[0]) { e.preventDefault(); els[els.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === els[els.length - 1]) { e.preventDefault(); els[0].focus(); }
      }
    });
    const download = (blob, name) => {
      const a = h("a"); a.href = URL.createObjectURL(blob); a.download = name;
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    q("[data-xcopy]").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      (navigator.clipboard ? navigator.clipboard.writeText(codeEl.textContent) : Promise.reject()).then(() => flash(btn, "Copied ✓"), () => flash(btn, "Copy failed"));
    });
    q("[data-xfile]").addEventListener("click", () => {
      const k = xsys.value, ext = { js: "js", react: "jsx", css: "css", json: "json" }[tab];
      download(new Blob([codeEl.textContent], { type: "text/plain" }), tab === "react" ? `${pascal(k)}Motion.jsx` : `motion-${tab === "json" ? "settings" : k}.${ext}`);
    });
    q("[data-xlink]").addEventListener("click", (e) => {
      const btn = e.currentTarget, url = `${location.origin}/motion-lab#s=${encode(S)}`;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => flash(btn, "Link copied ✓"), () => flash(btn, "Copy failed"));
    });
    // A clean frame of the chosen system on paper, at any size, on any clock. `at` places it inside a larger sheet.
    function renderFrame(ctx, k, w, hh, c, at = {}) {
      const P = S.sys[k], word = k === "word", x0 = at.x || 0, y0 = at.y || 0;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.beginPath(); ctx.rect(x0, y0, w, hh); ctx.clip();
      if (!at.transparent) { ctx.fillStyle = BG(); ctx.fillRect(x0, y0, w, hh); }
      SYS[k].draw(ctx, x0 + w / 2, y0 + hh / 2, Math.min(w, hh) * 0.62, P, colourAt({ palette: PAL, colorIndex: S.color, colorMode: S.colorMode }, c), waveFor(S, P, 0, c, partsOf(k, P)), word ? { bw: w * 0.8, bh: hh * 0.5 } : undefined);
      ctx.restore();
    }
    const alpha = q("[data-xalpha]");
    q("[data-xpng]").addEventListener("click", () => {
      const k = xsys.value, c = document.createElement("canvas"); c.width = k === "word" ? 2400 : 1600; c.height = k === "word" ? 1000 : 1600;
      renderFrame(c.getContext("2d"), k, c.width, c.height, clk, { transparent: alpha.checked });
      c.toBlob((b) => b && download(b, `motion-${k}.png`), "image/png");
    });
    // ── storyboard: six frames evenly across one loop, on a contact sheet, ready to drop into a deck ──
    const loopClk = (k) => 1 / ((S.sys[k].speed ?? 1) * 0.32);
    q("[data-xboard]").addEventListener("click", () => {
      const k = xsys.value, word = k === "word", fw = word ? 800 : 640, fh = word ? 360 : 640, gap = 16, pad = 48, cols = 3, rows = 2, foot = 96;
      const c = document.createElement("canvas"); c.width = pad * 2 + cols * fw + (cols - 1) * gap; c.height = pad * 2 + rows * fh + (rows - 1) * gap + foot;
      const g = c.getContext("2d"), fg = FG(), mute = mix(FG(), BG(), 0.45);
      g.fillStyle = BG(); g.fillRect(0, 0, c.width, c.height);
      const t0 = clk;
      for (let n = 0; n < cols * rows; n++) {
        const x = pad + (n % cols) * (fw + gap), y = pad + Math.floor(n / cols) * (fh + gap);
        g.fillStyle = mix(FG(), BG(), 0.94); g.fillRect(x, y, fw, fh);
        renderFrame(g, k, fw, fh, t0 + (n / (cols * rows)) * loopClk(k), { x, y, transparent: true });
        g.fillStyle = mute; g.font = '500 20px "Geist Mono", ui-monospace, monospace'; g.textBaseline = "top";
        g.fillText(String(n + 1).padStart(2, "0"), x + 16, y + 14);
      }
      g.fillStyle = fg; g.font = '500 22px "Geist Mono", ui-monospace, monospace';
      g.fillText(`MOTION LAB ( ${SYS[k].name.toUpperCase()} )`, pad, c.height - foot + 22);
      g.fillStyle = mute; g.font = '400 18px "Geist Mono", ui-monospace, monospace';
      g.fillText(`${NAMES.wave[S.wave]} · ${NAMES.shaping[S.shaping]} · ${NAMES.stagger[S.stagger]} · tempo ${S.tempo.toFixed(2)} · six frames across one loop`.toUpperCase(), pad, c.height - foot + 54);
      c.toBlob((b) => b && download(b, `motion-${k}-storyboard.png`), "image/png");
    });
    // ── record one loop: exactly one wave, repeated to reach two seconds if it is shorter, so it joins up when it plays again ──
    const loopSeconds = (k) => { const one = loopClk(k) / S.tempo, n = Math.max(1, Math.ceil(2 / one)); return Math.min(12, one * n); };
    const vidBtn = q("[data-xvid]");
    const labelVid = () => { if (!recording) { vidBtn.textContent = `Record loop · ${loopSeconds(xsys.value).toFixed(1)}s`; vidBtn.dataset.label = vidBtn.textContent; } };
    let recording = false;
    vidBtn.addEventListener("click", (e) => {
      const btn = e.currentTarget, k = xsys.value;
      const type = window.MediaRecorder && ["video/webm;codecs=vp9", "video/webm", "video/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
      const c = document.createElement("canvas");
      if (recording || !type || !c.captureStream) { if (!recording) flash(btn, "Not supported here"); return; }
      c.width = k === "word" ? 1920 : 1080; c.height = 1080;
      const ctx = c.getContext("2d"), rec = new MediaRecorder(c.captureStream(60), { mimeType: type, videoBitsPerSecond: 8e6 }), chunks = [];
      rec.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
      rec.onstop = () => { recording = false; btn.disabled = false; labelVid(); download(new Blob(chunks, { type: type.split(";")[0] }), `motion-${k}-loop.${type.includes("mp4") ? "mp4" : "webm"}`); };
      const c0 = clk, t0 = performance.now(), DUR = loopSeconds(k) * 1000;
      btn.disabled = true; recording = true;
      const draw = (now) => {
        const el = now - t0;
        renderFrame(ctx, k, c.width, c.height, c0 + (el / 1000) * S.tempo);
        btn.textContent = `Recording… ${Math.max(1, Math.ceil((DUR - el) / 1000))}s`;
        if (el < DUR) requestAnimationFrame(draw); else rec.stop();
      };
      rec.start(); requestAnimationFrame(draw);
    });

    // ── Keys (full page only; in the overlay the arrows and Esc belong to the board) ──
    const onKey = (e) => {
      if (!sheet.hidden || e.defaultPrevented) return;
      const tag = e.target.tagName, typing = ["INPUT", "SELECT", "TEXTAREA"].includes(tag) && !(tag === "INPUT" && e.target.type === "range" && e.key === " ");
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") { if (tag === "INPUT" && e.target.type === "text") return; e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (typing || mod || e.altKey) return;
      if (e.key === " " && !["BUTTON", "A"].includes(tag)) { e.preventDefault(); playing = !playing; refreshTop(); }
      else if (/^[0-9]$/.test(e.key)) { const k = ["all", ...KEYS][+e.key]; if (k) show(k); }
      else if (e.key === "[" || e.key === "]") { S.tempo = clamp(+(S.tempo + (e.key === "]" ? 0.1 : -0.1)).toFixed(2), 0.2, 3); touched(); refreshTop(); }
      else if (!playing && (e.key === "ArrowLeft" || e.key === "ArrowRight") && tag !== "INPUT") { e.preventDefault(); clk += (e.key === "ArrowRight" ? 1 : -1) * (S.tempo / 30); }
      else if (e.key === "e" || e.key === "E") openSheet();
      else if (e.key === "t" || e.key === "T") tapBtn.click();
      else if ((e.key === "r" || e.key === "R") && view !== "all" && rollThis) rollThis();
    };
    if (full) document.addEventListener("keydown", onKey);

    show("all"); refreshTop();

    // On the full page the drawing surfaces follow the window
    let lastW = main.clientWidth, rT = 0;
    const ro = full ? new ResizeObserver(() => { if (Math.abs(main.clientWidth - lastW) < 24) return; lastW = main.clientWidth; clearTimeout(rT); rT = setTimeout(renderMain, 120); }) : null;
    ro && ro.observe(main);

    // ── Clock ──
    let raf = 0, last = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (playing) clk += dt * S.tempo;
      CUR = colourAt({ palette: PAL, colorIndex: S.color, colorMode: S.colorMode }, clk);
      onTick && onTick();
      const r = Math.min(3, (devicePixelRatio || 1) * Math.max(1, f.scale()));
      if (Math.abs(r - R) > 0.2) { R = r; cans.forEach(resize); }
      for (let i = cans.length - 1; i >= 0; i--) {
        const e = cans[i];
        if (!e.el.isConnected) { cans.splice(i, 1); continue; }
        e.ctx.setTransform(R, 0, 0, R, 0, 0); e.ctx.clearRect(0, 0, e.w, e.h); e.fn(e.ctx, e.w, e.h);
      }
    };
    const start = () => { last = 0; raf = requestAnimationFrame(frame); return () => cancelAnimationFrame(raf); };
    const stopRun = auto ? whileVisible(cv, start) : start();

    // In the tile: tour the systems and recolour every other stop
    let tour = 0;
    if (auto && !reduce) {
      const seq = ["all", "asterisk", "orbit", "cells", "word", "matrix", "burst", "ptrail", "ribbon", "proc"];
      let n = 0;
      tour = setInterval(() => { if (motionOff() || document.hidden) return; n++; if (n % 2 === 0) S.color = (S.color + 1) % PAL.length; show(seq[n % seq.length]); refreshTop(); }, 2800);
    }
    return () => { stopRun(); f.stop(); clearInterval(tour); clearTimeout(commitT); clearTimeout(linkT); ro && ro.disconnect(); themeWatch && themeWatch.disconnect(); if (full) document.removeEventListener("keydown", onKey); };
  }

  // ── Overlay: opens over the board from a tile; arrows step through the board, Esc closes ──
  function openOverlay(items, start, opener) {
    let i = start, cleanup = null;
    const ov = h("div", "pgx");
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "pgx-title");
    ov.innerHTML = `
      <div class="pgx__scrim" data-close></div>
      <button class="pgx__btn pgx__close" type="button" aria-label="Close" data-close><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
      <button class="pgx__btn pgx__nav pgx__nav--prev" type="button" aria-label="Previous"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="pgx__btn pgx__nav pgx__nav--next" type="button" aria-label="Next"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="pgx__frame">
        <div class="pgx__stage"></div>
        <aside class="pgx__info">
          <p class="pgx__code"></p>
          <h2 class="pgx__title" id="pgx-title"></h2>
          <p class="pgx__desc"></p>
          <p class="pgx__hint"></p>
          <ul class="pgx__tags" role="list"></ul>
          <div class="pgx__credit"></div>
        </aside>
      </div>`;
    const stage = ov.querySelector(".pgx__stage"), q = (s) => ov.querySelector(s);
    const render = () => {
      const it = items[i];
      cleanup && cleanup(); cleanup = null; stage.replaceChildren();
      stage.style.background = it.bg || "";
      if (it.demo) cleanup = DEMOS[it.demo](stage, { auto: false });
      else if (it.image) { const img = h("img", "pgx__img"); img.src = it.image; img.alt = it.alt || it.title; stage.appendChild(img); }
      else if (it.thumb) {
        const fig = h("a", "pgx__shot"); fig.href = it.href;
        const img = h("img"); img.src = it.thumb; img.alt = `Preview of the ${it.title} page`;
        fig.append(img); stage.appendChild(fig);
      }
      q(".pgx__code").textContent = `${it.code} · ${it.status}`;
      q(".pgx__title").textContent = it.title;
      q(".pgx__desc").textContent = it.scope;
      q(".pgx__hint").textContent = it.hint || "";
      q(".pgx__hint").hidden = !it.hint;
      q(".pgx__tags").replaceChildren(...it.tags.map((t) => h("li", "", t)));
      const cr = q(".pgx__credit"); cr.replaceChildren();
      if (it.credit) {
        cr.append(h("p", "pgx__label", "Recreated from"));
        const a = h("a", "pgx__by"); a.href = it.credit.url; a.target = "_blank"; a.rel = "noopener";
        a.append(h("span", "", it.credit.name), h("span", "pgx__handle", `@${it.credit.handle}`), h("span", "pgx__arrow", "View on X ↗"));
        cr.append(a);
      }
      if (it.href) { const a = h("a", "btn pgx__open", `Open ${it.title} →`); a.href = it.href; cr.append(a); }
    };
    const go = (d) => { i = (i + d + items.length) % items.length; render(); };
    const close = () => {
      ov.classList.remove("is-open"); document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("pgx-lock");
      setTimeout(() => { cleanup && cleanup(); ov.remove(); opener && opener.focus(); }, 260);
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (!["INPUT", "TEXTAREA"].includes(e.target.tagName) && e.key === "ArrowRight") go(1);
      else if (!["INPUT", "TEXTAREA"].includes(e.target.tagName) && e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") { // keep focus inside the dialog
        const f = [...ov.querySelectorAll("button, a[href], input, textarea")].filter((n) => n.offsetParent !== null && n.tabIndex >= 0);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    ov.querySelectorAll("[data-close]").forEach((n) => n.addEventListener("click", close));
    q(".pgx__nav--prev").addEventListener("click", () => go(-1));
    q(".pgx__nav--next").addEventListener("click", () => go(1));
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("pgx-lock");
    document.body.appendChild(ov);
    render();
    requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add("is-open"); q(".pgx__close").focus({ preventScroll: true }); }));
  }

  window.Playground = { DEMOS, openOverlay };
})();
