// Playground: live interaction studies and the tile overlay.
// Each demo is built at a fixed design size and scaled to fit its stage, so it reads the same in a tile and in the overlay.
// Demos take { auto } — in a tile they play a scripted loop; in the overlay they are fully interactive.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  function whileVisible(node, start) {
    let stop = null;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !stop) stop = start();
      else if (!e.isIntersecting && stop) { stop(); stop = null; }
    }, { threshold: 0.2 });
    io.observe(node);
    return () => { io.disconnect(); stop && stop(); };
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
    if (auto && !reduce) stopLoop = whileVisible(c, () => {
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
    if (auto && !reduce) stopLoop = whileVisible(c, () => {
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
    if (auto && !reduce) stopLoop = whileVisible(c, () => {
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
    if (auto && !reduce) stopLoop = whileVisible(root, () => {
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
    if (auto && !reduce) stopLoop = whileVisible(c, () => { const id = setInterval(() => go((cur + 1) % STEPS.length), 3400); return () => clearInterval(id); });
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
    if (auto && !reduce) stopLoop = whileVisible(c, () => {
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
    const f = fit(stage, c, W, H, 0.94);
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
    if (auto && !reduce) stopLoop = whileVisible(c, () => {
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
    if (auto && !reduce) stopLoop = whileVisible(root, () => {
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
    if (auto && !reduce) stopLoop = whileVisible(c, () => { setPlaying(true); if (t > DUR - 20) seek(60); return () => setPlaying(false); });
    return () => { cancelAnimationFrame(raf); document.removeEventListener("click", onDoc); unDrag(); f.stop(); stopLoop && stopLoop(); };
  }


  // ── 13 · Compose bar in three themes: type, refine, dictate, send (the message lands in the feed) ──
  function composeBars(stage, { auto }) {
    const DICT = ["Remember", "to", "book", "a", "table", "for", "Friday", "and", "ask", "if", "they", "have", "a", "quiet", "corner."];
    const TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7M10.200 11v5M13.800 11v5"/></svg>';
    const RING = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.500" stroke-dasharray="1.400 3.100"/><circle cx="12" cy="12" r="4.800"/></svg>';
    const MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="9" y="4" width="6" height="10" rx="3"/><path d="M6.500 11.500a5.500 5.500 0 0 0 11 0M12 17v3"/></svg>';
    const c = h("div", "ix ix-cb");
    c.innerHTML = ["dark", "light", "sun"].map((th) => `
      <div class="cb cb--${th}">
        <div class="cb__feed" aria-live="polite"></div>
        <div class="cb__bar">
          <textarea class="cb__in" rows="1" placeholder="Write your thoughts..." aria-label="Write your thoughts (${th} theme)"></textarea>
          <div class="cb__row">
            <button class="cb__ic cb__trash" type="button" aria-label="Clear">${TRASH}</button>
            <button class="cb__ic cb__magic" type="button" aria-label="Refine the text">${RING}</button>
            <button class="cb__ic cb__mic" type="button" aria-label="Dictate"><span class="cb__i1">${MIC}</span><span class="cb__i2"><i></i><i></i><i></i><i></i></span></button>
            <button class="cb__send" type="button" aria-label="Send">${ICON.up}</button>
          </div>
        </div>
      </div>`).join("");
    stage.appendChild(c);
    const f = fit(stage, c, 1100, 380, 0.94);
    const bars = [...c.querySelectorAll(".cb")].map((el) => {
      const q = (s) => el.querySelector(s), inp = q(".cb__in"), feed = q(".cb__feed"), send = q(".cb__send"), trash = q(".cb__trash"), magic = q(".cb__magic"), mic = q(".cb__mic");
      let dict = 0, listening = null;
      const sync = () => {
        inp.style.height = "auto"; inp.style.height = `${Math.min(110, inp.scrollHeight)}px`;
        const has = inp.value.trim().length > 0; send.disabled = !has; trash.disabled = !inp.value.length; magic.disabled = !has;
      };
      const post = () => {
        const v = inp.value.trim(); if (!v) return;
        const b = h("p", "cb__msg"); b.textContent = v; feed.appendChild(b);
        while (feed.children.length > 3) feed.firstChild.remove();
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
      sync();
      return { inp, post, sync, feed, stopMic };
    });
    let stopLoop = null;
    if (auto && !reduce) stopLoop = whileVisible(c, () => {
      let on = true;
      const lines = ["Call mum on Sunday", "Draft the launch note", "Walk before sunset"];
      (async () => {
        while (on) {
          bars.forEach((b) => { b.feed.replaceChildren(); b.inp.value = ""; b.sync(); });
          await wait(900);
          for (let i = 0; i < 3 && on; i++) {
            for (const ch of lines[i]) { if (!on) return; bars[i].inp.value += ch; bars[i].sync(); await wait(55); }
            await wait(450); if (!on) return; bars[i].post(); await wait(500);
          }
          await wait(2200);
        }
      })();
      return () => { on = false; };
    });
    return () => { bars.forEach((b) => b.stopMic()); f.stop(); stopLoop && stopLoop(); };
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
    if (auto && !reduce) stopLoop = whileVisible(c, () => {
      let on = true;
      (async () => { let k = 0; while (on) { await wait(2400); if (!on) return; shuffle(); const g = c.querySelectorAll(".es__g")[k++ % 5]; g.classList.remove("is-hop"); void g.offsetWidth; g.classList.add("is-hop"); } })();
      return () => { on = false; };
    });
    return () => { f.stop(); stopLoop && stopLoop(); };
  }

  const DEMOS = { boundingBox, segmentedNav, clouds, marketSelect, onboardingTour, apiKey, timelineScrub, glassSliders, podcastPlayer, composeBars, emptySessions };

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
