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

  // ── 01 · Search ↔ Ask (after salt, @saltjsx) ──
  function searchAsk(stage, { auto }) {
    const c = h("div", "ix ix-sa");
    c.innerHTML = `
      <div class="sa__shell">
        <span class="sa__pill" aria-hidden="true"></span>
        <button class="sa__q" type="button" aria-label="Search">${ICON.search}</button>
        <span class="sa__word sa__word--search">Search</span>
        <button class="sa__spark" type="button" aria-label="Ask AI">${ICON.sparkle}</button>
        <span class="sa__word sa__word--ask">Ask</span>
        <button class="sa__send" type="button" aria-label="Send" tabindex="-1">${ICON.up}</button>
      </div>`;
    stage.appendChild(c);
    const f = fit(stage, c, 460, 176);
    const set = (ask) => { c.classList.toggle("is-ask", ask); c.querySelector(".sa__send").tabIndex = ask ? 0 : -1; };
    c.querySelector(".sa__spark").addEventListener("click", () => set(true));
    c.querySelector(".sa__q").addEventListener("click", () => set(false));
    c.querySelector(".sa__send").addEventListener("click", (e) => { e.currentTarget.animate([{ transform: "scale(1)" }, { transform: "scale(.9)" }, { transform: "scale(1)" }], { duration: 260, easing: "ease-out" }); });
    let stopLoop = null;
    if (auto && !reduce) stopLoop = whileVisible(c, () => {
      let on = true;
      (async () => { while (on) { await wait(1500); if (!on) break; set(!c.classList.contains("is-ask")); } })();
      return () => { on = false; };
    });
    return () => { f.stop(); stopLoop && stopLoop(); };
  }

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

  const DEMOS = { searchAsk, boundingBox, segmentedNav, clouds, marketSelect };

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
