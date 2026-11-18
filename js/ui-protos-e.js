// Playground protos E: five interface studies with GSAP micro-interactions, after the Emil Kowalski motion rules:
// strong ease-out, fast exits, origin-aware popovers, press feedback on every control, nothing scales up from zero,
// short staggers, interruptible tweens, and reduced motion respected. Each is built at a fixed design size and scaled to its stage.
//   accountMenu (plant shop)  ·  boardingStatus (flight)  ·  grindToolbar (coffee)  ·  trackQueue (music)  ·  plantHealth (care)
(() => {
  "use strict";
  if (!window.Playground || !window.Playground.DEMOS || !window.gsap) return;
  const g = window.gsap, D = window.Playground.DEMOS;
  const off = () => (window.motionReduced ? window.motionReduced() : matchMedia("(prefers-reduced-motion: reduce)").matches);
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const T = (d) => (off() ? 0 : d);                       // durations collapse to 0 when motion is off
  const OUT = "power4.out", IN_OUT = "power3.inOut";      // strong ease-out for entrances, ease-in-out for on-screen movement
  const ico = (d, w = 24, sw = 1.8) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  // Fixed design size scaled to the stage; scale() is what pointer maths divides by
  function fit(stage, c, W, H) {
    let s = 1; c.style.width = `${W}px`; c.style.height = `${H}px`;
    const apply = () => { const r = stage.getBoundingClientRect(); if (!r.width || !r.height) return; s = Math.min(r.width / W, r.height / H); c.style.transform = `translate(-50%, -50%) scale(${s})`; };
    const ro = new ResizeObserver(apply); ro.observe(stage); apply();
    return { scale: () => s, stop: () => ro.disconnect() };
  }
  // Tiles play a scripted loop while on screen and not being touched; the overlay starts quiet. Any pointer interaction stops the script.
  function autoLoop(stage, auto, script) {
    if (!auto) return () => {};
    let alive = true, vis = false, hov = false, running = false;
    const halted = () => !(alive && vis && !hov && !off());
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const run = async () => { if (running) return; running = true; while (!halted()) { await script(sleep, halted); await sleep(600); } running = false; };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) run(); }, { threshold: 0.25 });
    io.observe(stage);
    const enter = () => { hov = true; }, leave = () => { hov = false; setTimeout(run, 1400); };
    stage.addEventListener("pointerenter", enter); stage.addEventListener("pointerleave", leave);
    addEventListener("motionchange", run);
    return () => { alive = false; io.disconnect(); stage.removeEventListener("pointerenter", enter); stage.removeEventListener("pointerleave", leave); removeEventListener("motionchange", run); };
  }
  // Pressable: scale .97 on press, released quickly
  function press(el) {
    const down = () => g.to(el, { scale: 0.97, duration: T(0.12), ease: "power2.out", overwrite: "auto" });
    const up = () => g.to(el, { scale: 1, duration: T(0.2), ease: OUT, overwrite: "auto" });
    el.addEventListener("pointerdown", down); ["pointerup", "pointerleave", "pointercancel"].forEach((n) => el.addEventListener(n, up));
  }

  /* ───────────────────────── 1 · accountMenu (a plant shop) ───────────────────────── */
  D.accountMenu = function (stage, { auto } = {}) {
    const W = 720, H = 880;
    const c = h("div", "ix pm");
    const ITEMS = [
      ["Orders", ico('<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8"/>')],
      ["Plant diary", ico('<path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14zM5 19c3-4 6-7 10-9"/>')],
      ["Membership", ico('<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M3 10h18M7 15h3"/>'), "PLUS"],
      ["Preferences", ico('<rect x="2.5" y="7" width="19" height="10" rx="5"/><circle cx="8" cy="12" r="2.6"/>')],
      null,
      ["Care guide", ico('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>')],
      ["Sign out", ico('<path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4M15 8l4 4-4 4M19 12H9"/>')],
    ];
    c.innerHTML = `
      <div class="pm-top"><button class="pm-gift" type="button">Gift ${ico('<path d="M12 5v14M5 12h14"/>', 22, 2)}</button>
        <button class="pm-av" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu"><span class="pm-ring"></span><span class="pm-face"><i class="pm-eye"></i><i class="pm-eye"></i><i class="pm-mouth"></i></span></button></div>
      <div class="pm-menu" role="menu" aria-label="Account" inert><span class="pm-hl" aria-hidden="true"></span>
        ${ITEMS.map((it) => it ? `<button class="pm-it" role="menuitem" type="button" tabindex="-1">${it[1]}<span>${it[0]}</span>${it[2] ? `<b class="pm-pro">${ico('<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', 18, 2.2)}${it[2]}<i class="pm-sheen"></i></b>` : ""}</button>` : `<hr class="pm-sep">`).join("")}
      </div>
      <p class="pm-note" aria-live="polite"></p>`;
    stage.appendChild(c); const f = fit(stage, c, W, H);
    const av = c.querySelector(".pm-av"), menu = c.querySelector(".pm-menu"), hl = c.querySelector(".pm-hl"), note = c.querySelector(".pm-note");
    const items = [...c.querySelectorAll(".pm-it")], eyes = c.querySelectorAll(".pm-eye"), ring = c.querySelector(".pm-ring");
    let open = false, active = -1, tl = null;
    ITEMS.length; press(av); press(c.querySelector(".pm-gift"));
    const hlTo = (i, instant) => {
      active = i; items.forEach((b, k) => b.classList.toggle("is-on", k === i));
      if (i < 0) { g.to(hl, { opacity: 0, duration: T(0.12), overwrite: "auto" }); return; }
      const b = items[i], y = b.offsetTop, was = +hl.style.opacity > 0.01;
      if (instant || !was) g.set(hl, { y, height: b.offsetHeight });
      g.to(hl, { y, height: b.offsetHeight, opacity: 1, duration: T(was ? 0.2 : 0.01), ease: OUT, overwrite: "auto" });
    };
    const setOpen = (v, focus) => {
      if (v === open) return; open = v; av.setAttribute("aria-expanded", v);
      tl && tl.kill();
      if (v) {
        menu.inert = false; g.set(menu, { visibility: "visible" });
        tl = g.timeline();
        tl.fromTo(menu, { opacity: 0, scale: 0.96, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: T(0.24), ease: OUT }, 0)
          .fromTo(items, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: T(0.22), ease: OUT, stagger: T(0.035) }, 0.03)
          .fromTo(c.querySelector(".pm-sheen"), { xPercent: -140 }, { xPercent: 240, duration: T(0.7), ease: IN_OUT }, 0.25)
          .to(ring, { rotation: 90, duration: T(0.5), ease: OUT }, 0);
        if (focus) items[0].focus({ preventScroll: true });
      } else {
        menu.inert = true; hlTo(-1);
        tl = g.timeline({ onComplete: () => g.set(menu, { visibility: "hidden" }) });   // exits are quicker than entrances
        tl.to(menu, { opacity: 0, scale: 0.97, y: -4, duration: T(0.14), ease: "power2.out" }, 0).to(ring, { rotation: 0, duration: T(0.3), ease: OUT }, 0);
        if (focus) av.focus({ preventScroll: true });
      }
    };
    g.set(menu, { visibility: "hidden", opacity: 0 });
    const flash = (label) => { note.textContent = `Opened · ${label}`; g.fromTo(note, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: T(0.25), ease: OUT }); g.to(note, { opacity: 0, delay: 1.6, duration: T(0.3), overwrite: false }); };
    av.addEventListener("click", () => setOpen(!open, !open));
    items.forEach((b, i) => {
      b.addEventListener("pointerenter", () => hlTo(i)); press(b);
      b.addEventListener("click", () => { flash(b.querySelector("span").textContent); g.fromTo(hl, { scale: 1 }, { scale: 0.985, duration: T(0.08), yoyo: true, repeat: 1 }); setTimeout(() => setOpen(false, true), off() ? 0 : 140); });
    });
    menu.addEventListener("pointerleave", () => hlTo(-1));
    menu.addEventListener("keydown", (e) => {
      const k = e.key; if (k === "Escape") { e.preventDefault(); setOpen(false, true); }
      if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); const n = (Math.max(active, 0) + (k === "ArrowDown" ? 1 : -1) + items.length) % items.length; items[n].focus({ preventScroll: true }); hlTo(n); }
    });
    items.forEach((b, i) => b.addEventListener("focus", () => hlTo(i)));
    const away = (e) => { if (open && !menu.contains(e.target) && !av.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    // The mascot blinks now and then
    const blink = () => { if (!off()) g.to(eyes, { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }); bt = g.delayedCall(2.6 + Math.random() * 2.4, blink); };
    let bt = g.delayedCall(1.5, blink);
    const stopAuto = autoLoop(stage, auto, async (sleep, halted) => {
      setOpen(true); await sleep(700); for (const i of [0, 1, 2, 3, 4, 5]) { if (halted()) break; hlTo(i); await sleep(520); }
      setOpen(false); hlTo(-1); await sleep(1600);
    });
    return () => { stopAuto(); bt && bt.kill(); tl && tl.kill(); g.killTweensOf(c.querySelectorAll("*")); document.removeEventListener("pointerdown", away); f.stop(); c.remove(); };
  };

  /* ───────────────────────── 2 · boardingStatus (a flight) ───────────────────────── */
  D.boardingStatus = function (stage, { auto } = {}) {
    const W = 1000, H = 700, COLS = 30, ROWS = 9;
    const STEPS = [["Gate check", "0:12"], ["Security", "0:41"], ["Boarding pass", "0:07"]];
    const c = h("div", "ix pd");
    c.innerHTML = `
      <div class="pd-head"><span class="pd-mark">NH</span><span class="pd-title"><b>NH 204</b><i>·</i><em>SFO → HND</em><span class="pd-state"><span class="pd-s0">is boarding</span><span class="pd-s1">has boarded</span></span></span></div>
      <div class="pd-grid" aria-hidden="true">${"<i></i>".repeat(COLS * ROWS)}</div>
      <ul class="pd-steps">${STEPS.map((s, i) => `<li data-i="${i}"><span class="pd-ico"><svg viewBox="0 0 32 32" aria-hidden="true"><circle class="pd-dash" cx="16" cy="16" r="12" fill="none" stroke="#8b9199" stroke-width="2" stroke-dasharray="3.4 3.4" stroke-linecap="round"/><circle class="pd-fill" cx="16" cy="16" r="13" fill="#E6F6EC"/><path class="pd-tick" d="M10 16.5l4.2 4.2L22.5 12" fill="none" stroke="#1B7A43" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="pd-lab">${s[0]}</span><span class="pd-time">${s[1]}</span></li>`).join("")}</ul>
      <button class="pd-replay" type="button">${ico('<path d="M4 12a8 8 0 108-8H7M7 4L4 7l3 3"/>', 18, 2)}Replay</button>`;
    stage.appendChild(c); const f = fit(stage, c, W, H);
    const dots = [...c.querySelectorAll(".pd-grid i")], lis = [...c.querySelectorAll(".pd-steps li")];
    const dashes = c.querySelectorAll(".pd-dash"), fills = c.querySelectorAll(".pd-fill"), ticks = [...c.querySelectorAll(".pd-tick")], labs = c.querySelectorAll(".pd-lab"), times = c.querySelectorAll(".pd-time");
    const mark = c.querySelector(".pd-mark"), s0 = c.querySelector(".pd-s0"), s1 = c.querySelector(".pd-s1");
    ticks.forEach((t) => { const L = t.getTotalLength(); t.style.strokeDasharray = L; t.style.strokeDashoffset = L; t._L = L; });
    let tl = null, vis = true, wave = null, spin = [];
    const reset = () => {
      g.set(fills, { opacity: 0, scale: 0.92, transformOrigin: "50% 50%" }); g.set(dashes, { opacity: 1, rotation: 0, transformOrigin: "50% 50%" });
      ticks.forEach((t) => { t.style.strokeDashoffset = t._L; }); g.set(labs, { color: "#8b9199" }); g.set(times, { opacity: 0, x: -6 });
      g.set(s0, { opacity: 1, y: 0, filter: "blur(0px)" }); g.set(s1, { opacity: 0, y: 8, filter: "blur(3px)" }); g.set(mark, { backgroundColor: "#FBF3FF", color: "#B26BE6", borderColor: "#EBCFF7" });
      g.set(dots, { opacity: 0.4, backgroundColor: "#bccbea" });
    };
    const build = () => {
      tl && tl.kill(); wave && wave.kill(); spin.forEach((x) => x.kill()); spin = []; reset();
      // the dot field: a wave from the centre, fast while the flight is processing, calm once it has boarded
      wave = g.to(dots, { opacity: 0.95, backgroundColor: "#6E9BF2", duration: T(0.55), ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { grid: [COLS, ROWS], from: "center", each: 0.028 } });
      tl = g.timeline({ repeat: auto ? -1 : 0, repeatDelay: 1.6, onRepeat: reset }); let t = 0.5;
      STEPS.forEach((_, i) => {
        const dur = [1.2, 1.6, 1.0][i];
        tl.call(() => { spin[i] = g.to(dashes[i], { rotation: 360, duration: 1.1, ease: "none", repeat: -1, transformOrigin: "50% 50%" }); g.to(labs[i], { color: "#111418", duration: 0.2 }); }, null, t);
        tl.call(() => { spin[i] && spin[i].kill(); }, null, t + dur);
        tl.to(dashes[i], { opacity: 0, duration: T(0.18) }, t + dur).fromTo(fills[i], { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: T(0.3), ease: OUT }, t + dur)
          .to(ticks[i], { strokeDashoffset: 0, duration: T(0.34), ease: "power2.out" }, t + dur + 0.05).to(times[i], { opacity: 1, x: 0, duration: T(0.3), ease: OUT }, t + dur + 0.1);
        t += dur + 0.35;
      });
      tl.to(s0, { opacity: 0, y: -8, filter: "blur(3px)", duration: T(0.2), ease: "power2.out" }, t).to(s1, { opacity: 1, y: 0, filter: "blur(0px)", duration: T(0.34), ease: OUT }, t + 0.06)
        .to(mark, { backgroundColor: "#E6F6EC", color: "#1B7A43", borderColor: "#BFE3CB", duration: T(0.4) }, t)
        .to(dots, { opacity: 0.14, backgroundColor: "#c7d3ea", duration: T(0.6), onStart: () => wave && wave.kill() }, t + 0.1);
      if (off()) { tl.progress(1); wave.kill(); }
      return tl;
    };
    build();
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (tl) vis ? (tl.resume(), wave && wave.resume()) : (tl.pause(), wave && wave.pause()); }, { threshold: 0.2 }); io.observe(stage);
    const rp = c.querySelector(".pd-replay"); press(rp); rp.addEventListener("click", build);
    c.querySelector(".pd-head").addEventListener("click", build);
    return () => { io.disconnect(); tl && tl.kill(); wave && wave.kill(); spin.forEach((x) => x.kill()); g.killTweensOf(c.querySelectorAll("*")); f.stop(); c.remove(); };
  };

  /* ───────────────────────── 3 · grindToolbar (coffee) ───────────────────────── */
  D.grindToolbar = function (stage, { auto } = {}) {
    const W = 900, H = 675, N = 26;
    const NAMES = [[0, "Turkish"], [18, "Espresso"], [40, "Moka pot"], [62, "Pour-over"], [84, "French press"]];
    const nameOf = (v) => NAMES.filter((n) => v >= n[0]).pop()[1];
    const c = h("div", "ix pt");
    c.innerHTML = `
      <div class="pt-bar"><button class="pt-add" type="button">${ico('<path d="M12 5v14M5 12h14"/>', 22, 1.6)}<span>Add</span></button>
        <div class="pt-grp"><span class="pt-type"><i class="pt-dots">${"<b></b>".repeat(9)}</i>Grind</span>
          <button class="pt-val" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Grind size"><span class="pt-num">50</span>${ico('<path d="M6 9l6 6 6-6"/>', 18, 1.8)}</button>
          <span class="pt-div"></span><button class="pt-more" type="button" aria-label="More">${ico('<path d="M12 5h.01M12 12h.01M12 19h.01"/>', 22, 3)}</button></div></div>
      <div class="pt-pop" role="dialog" aria-label="Grind size" inert>
        <div class="pt-pl"><span>Grind size</span><em class="pt-name">${nameOf(50)}</em></div>
        <div class="pt-track" role="slider" tabindex="0" aria-label="Grind size" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><span class="pt-fill"></span><span class="pt-thumb"></span></div>
        <div class="pt-scale"><span>Fine</span><i class="pt-ticks">${"<b></b>".repeat(N)}</i><span>Coarse</span></div>
      </div>`;
    stage.appendChild(c); const f = fit(stage, c, W, H);
    const val = c.querySelector(".pt-val"), pop = c.querySelector(".pt-pop"), track = c.querySelector(".pt-track"), fill = c.querySelector(".pt-fill"), thumb = c.querySelector(".pt-thumb");
    const num = c.querySelector(".pt-num"), nameEl = c.querySelector(".pt-name"), ticks = [...c.querySelectorAll(".pt-ticks b")], chev = val.querySelector("svg"), add = c.querySelector(".pt-add"), more = c.querySelector(".pt-more");
    [add, val, more].forEach(press);
    let v = 50, open = false, last = -1, nm = nameOf(50), dragging = false, tl = null;
    const TW = 460;
    const render = () => {
      g.set(fill, { scaleX: v / 100 }); g.set(thumb, { x: (v / 100) * TW - 3 });
      ticks.forEach((t, i) => { const p = (i / (N - 1)) * 100, d = Math.abs(p - v), k = clamp(1 - d / 14, 0, 1); t.style.transform = `scaleY(${1 + k * 0.9})`; t.style.opacity = d < 2 ? 1 : 0.55 + k * 0.4; t.style.background = d < 2 ? "#B8651B" : ""; });
      track.setAttribute("aria-valuenow", Math.round(v));
      const r = Math.round(v);
      if (r !== last) { last = r; num.textContent = r; if (!off()) g.fromTo(num, { y: -3, opacity: 0.55 }, { y: 0, opacity: 1, duration: 0.14, ease: "power2.out", overwrite: "auto" }); }
      const n = nameOf(r); if (n !== nm) { nm = n; g.fromTo(nameEl, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: T(0.2), ease: OUT }); nameEl.textContent = n; }
    };
    const setV = (x) => { v = clamp(x, 0, 100); render(); };
    const setOpen = (o) => {
      if (o === open) return; open = o; val.setAttribute("aria-expanded", o); tl && tl.kill();
      if (o) { pop.inert = false; g.set(pop, { visibility: "visible" }); tl = g.timeline(); tl.fromTo(pop, { opacity: 0, scale: 0.96, y: -6 }, { opacity: 1, scale: 1, y: 0, duration: T(0.22), ease: OUT }).to(chev, { rotation: 180, duration: T(0.25), ease: OUT }, 0).fromTo(pop.querySelectorAll(".pt-pl, .pt-track, .pt-scale"), { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: T(0.2), ease: OUT, stagger: T(0.04) }, 0.04); }
      else { pop.inert = true; tl = g.timeline({ onComplete: () => g.set(pop, { visibility: "hidden" }) }); tl.to(pop, { opacity: 0, scale: 0.97, y: -4, duration: T(0.13), ease: "power2.out" }).to(chev, { rotation: 0, duration: T(0.2), ease: OUT }, 0); }
    };
    g.set(pop, { visibility: "hidden", opacity: 0 }); g.set(chev, { transformOrigin: "50% 50%" }); render();
    val.addEventListener("click", () => setOpen(!open));
    const fromEvt = (e) => { const r = track.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
    track.addEventListener("pointerdown", (e) => { dragging = true; track.setPointerCapture(e.pointerId); g.to(thumb, { scaleY: 1.3, duration: T(0.14), ease: "power2.out" }); setV(fromEvt(e)); });
    track.addEventListener("pointermove", (e) => { if (dragging) setV(fromEvt(e)); });
    const end = (e) => { if (!dragging) return; dragging = false; g.to(thumb, { scaleY: 1, duration: T(0.25), ease: OUT }); };
    track.addEventListener("pointerup", end); track.addEventListener("pointercancel", end);
    track.addEventListener("keydown", (e) => { const s = e.shiftKey ? 10 : 1; if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setV(v + s); } if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setV(v - s); } if (e.key === "Home") setV(0); if (e.key === "End") setV(100); if (e.key === "Escape") { setOpen(false); val.focus({ preventScroll: true }); } });
    const away = (e) => { if (open && !pop.contains(e.target) && !val.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    add.addEventListener("click", () => g.fromTo(add.querySelector("svg"), { rotation: 0 }, { rotation: 90, duration: T(0.3), ease: OUT, transformOrigin: "50% 50%" }));
    more.addEventListener("click", () => g.fromTo(more.querySelectorAll("path"), { y: 0 }, { y: -3, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }));
    const drive = (to, d) => new Promise((res) => { const o = { x: v }; g.to(o, { x: to, duration: T(d), ease: IN_OUT, onUpdate: () => setV(o.x), onComplete: res }); });
    const stopAuto = autoLoop(stage, auto, async (sleep, halted) => {
      setOpen(true); await sleep(650); for (const [to, d] of [[78, 0.9], [26, 1.1], [50, 0.8]]) { if (halted()) break; g.to(thumb, { scaleY: 1.3, duration: 0.14 }); await drive(to, d); g.to(thumb, { scaleY: 1, duration: 0.25, ease: OUT }); await sleep(380); }
      setOpen(false); await sleep(1500);
    });
    return () => { stopAuto(); tl && tl.kill(); g.killTweensOf(c.querySelectorAll("*")); document.removeEventListener("pointerdown", away); f.stop(); c.remove(); };
  };

  /* ───────────────────────── 4 · trackQueue (music, dark phone) ───────────────────────── */
  D.trackQueue = function (stage, { auto } = {}) {
    const W = 900, H = 750, GENRES = ["Lo-fi", "Jazz", "Ambient", "Synthwave", "Bossa nova", "Dub"];
    const c = h("div", "ix pq");
    c.innerHTML = `
      <div class="pq-phone"><div class="pq-art" aria-hidden="true"><i class="pq-glow"></i></div>
        <div class="pq-up"><span>UP NEXT</span><b class="pq-badge" aria-live="polite">0</b></div>
        <i class="pq-pg" aria-hidden="true"><b></b><b></b><b></b><b></b></i>
        <div class="pq-row"><button class="pq-sun" type="button" aria-pressed="false" aria-label="Dim the artwork">${ico('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>', 30, 1.5)}</button>
          <label class="pq-field"><span class="pq-tokens"></span><input class="pq-in" type="text" placeholder="Add a track" aria-label="Add a track" autocomplete="off" spellcheck="false"></label>
          <button class="pq-send" type="button" aria-label="Add to queue">${ico('<path d="M12 5v14M5 12h14"/>', 30, 1.6)}</button></div>
        <div class="pq-chips" role="group" aria-label="Genres">${GENRES.map((n) => `<button class="pq-chip" type="button" data-n="${n}" aria-pressed="false"><span>${n}</span><i>${ico('<path class="pq-p" d="M12 6v12M6 12h12"/><path class="pq-k" d="M6 12.5l4 4 8-9"/>', 20, 2)}</i></button>`).join("")}</div>
        <span class="pq-home" aria-hidden="true"></span></div>`;
    stage.appendChild(c); const f = fit(stage, c, W, H);
    const art = c.querySelector(".pq-art"), badge = c.querySelector(".pq-badge"), sun = c.querySelector(".pq-sun"), inp = c.querySelector(".pq-in"), toks = c.querySelector(".pq-tokens"), send = c.querySelector(".pq-send"), chipsEl = c.querySelector(".pq-chips");
    const chips = [...c.querySelectorAll(".pq-chip")], field = c.querySelector(".pq-field"), phone = c.querySelector(".pq-phone");
    [sun, send, ...chips].forEach(press);
    let queued = 0; const picked = new Set();
    const rectIn = (el) => { const a = el.getBoundingClientRect(), b = c.getBoundingClientRect(), s = f.scale(); return { x: (a.left - b.left) / s, y: (a.top - b.top) / s, w: a.width / s, h: a.height / s }; };
    chips.forEach((b) => { const k = b.querySelector(".pq-k"), L = 24; k.style.strokeDasharray = L; k.style.strokeDashoffset = L; });
    const mark = (b, on) => {
      b.setAttribute("aria-pressed", on); b.classList.toggle("is-on", on);
      const p = b.querySelector(".pq-p"), k = b.querySelector(".pq-k");
      g.to(p, { opacity: on ? 0 : 1, rotation: on ? 90 : 0, duration: T(0.2), ease: OUT, transformOrigin: "12px 12px" });
      g.to(k, { strokeDashoffset: on ? 0 : 24, duration: T(0.28), ease: "power2.out" });
    };
    const addToken = (name, from) => {
      const t = h("span", "pq-tok", name); toks.appendChild(t);
      const to = rectIn(t); g.set(t, { opacity: 0 });
      if (from && !off()) {
        const ghost = h("span", "pq-tok pq-ghost", name); c.appendChild(ghost); g.set(ghost, { x: from.x, y: from.y, width: from.w, height: from.h });
        g.to(ghost, { x: to.x, y: to.y, width: to.w, height: to.h, duration: 0.42, ease: IN_OUT, onComplete: () => { g.set(t, { opacity: 1 }); ghost.remove(); } });
      } else g.set(t, { opacity: 1 });
      t.dataset.n = name;
    };
    const toggle = (b) => {
      const n = b.dataset.n, on = !picked.has(n);
      if (on) { picked.add(n); addToken(n, rectIn(b)); } else { picked.delete(n); const t = [...toks.children].find((x) => x.dataset.n === n); t && g.to(t, { opacity: 0, scale: 0.9, duration: T(0.14), ease: "power2.out", onComplete: () => t.remove() }); }
      mark(b, on);
    };
    chips.forEach((b) => b.addEventListener("click", () => toggle(b)));
    const commit = () => {
      if (!picked.size && !inp.value.trim()) { g.fromTo(field, { x: 0 }, { x: 4, duration: 0.06, yoyo: true, repeat: 3, ease: "power1.inOut", onComplete: () => g.set(field, { x: 0 }) }); return; }
      queued += picked.size || 1; badge.textContent = queued;
      g.fromTo(badge, { scale: 1 }, { scale: 1.3, duration: T(0.16), yoyo: true, repeat: 1, ease: "power2.out" });
      g.to([...toks.children], { opacity: 0, y: -8, duration: T(0.18), ease: "power2.out", stagger: T(0.04), onComplete: () => { toks.innerHTML = ""; } });
      chips.forEach((b) => picked.has(b.dataset.n) && mark(b, false)); picked.clear(); inp.value = ""; filter("");
      g.fromTo(send.querySelector("svg"), { rotation: 0 }, { rotation: 90, duration: T(0.3), ease: OUT, transformOrigin: "50% 50%" });
    };
    send.addEventListener("click", commit);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") commit(); if (e.key === "Backspace" && !inp.value && toks.lastChild) { const n = toks.lastChild.dataset.n; toggle(chips.find((b) => b.dataset.n === n)); } });
    const filter = (q) => { q = q.toLowerCase(); chips.forEach((b) => { const hit = !q || b.dataset.n.toLowerCase().includes(q); b.hidden = false; g.to(b, { opacity: hit ? 1 : 0.28, duration: T(0.15), overwrite: "auto" }); b.tabIndex = hit ? 0 : -1; }); };
    inp.addEventListener("input", () => filter(inp.value));
    sun.addEventListener("click", () => { const on = sun.getAttribute("aria-pressed") !== "true"; sun.setAttribute("aria-pressed", on); g.to(art, { opacity: on ? 0.25 : 1, duration: T(0.3), ease: OUT }); g.to(sun.querySelector("svg"), { rotation: on ? 90 : 0, duration: T(0.4), ease: OUT, transformOrigin: "50% 50%" }); });
    // The chip row drags sideways like a native scroller
    let dx = null; chipsEl.addEventListener("pointerdown", (e) => { dx = { x: e.clientX, s: chipsEl.scrollLeft, m: false }; });
    addEventListener("pointermove", (ev) => { if (!dx) return; const d = (dx.x - ev.clientX) / f.scale(); if (Math.abs(d) > 4) dx.m = true; chipsEl.scrollLeft = dx.s + d; });
    const up = () => { if (dx && dx.m) { chipsEl.dataset.dragged = "1"; setTimeout(() => delete chipsEl.dataset.dragged, 0); } dx = null; }; addEventListener("pointerup", up);
    chipsEl.addEventListener("click", (e) => { if (chipsEl.dataset.dragged) e.stopPropagation(); }, true);
    g.from(phone, { y: 24, opacity: 0, duration: T(0.5), ease: OUT });
    const stopAuto = autoLoop(stage, auto, async (sleep, halted) => {
      for (const i of [0, 1, 3]) { if (halted()) break; toggle(chips[i]); await sleep(700); }
      if (!halted()) { commit(); await sleep(900); }
      chips.forEach((b) => picked.has(b.dataset.n) && toggle(b)); await sleep(500); queued = 0; badge.textContent = 0;
    });
    return () => { stopAuto(); removeEventListener("pointerup", up); g.killTweensOf(c.querySelectorAll("*")); f.stop(); c.remove(); };
  };

  /* ───────────────────────── 5 · plantHealth (care) ───────────────────────── */
  D.plantHealth = function (stage, { auto } = {}) {
    const W = 900, H = 900, STATES = ["thriving", "thirsty", "wilting"];
    const LOOK = [{ s: 1.08, sep: 0, b: 1, c: 1, bg: "#CFE8DA" }, { s: 0.62, sep: 0.3, b: 0.96, c: 1, bg: "#E7DFC6" }, { s: 0.2, sep: 0.5, b: 0.78, c: 1.06, bg: "#D3CFC9" }];
    const c = h("div", "ix pl");
    c.innerHTML = `
      <div class="pl-phone"><div class="pl-photo" role="img" aria-label="A garden table under trees"><i class="pl-img"></i><i class="pl-drops" aria-hidden="true"></i></div>
        <div class="pl-seg" role="radiogroup" aria-label="Plant health"><span class="pl-thumb" aria-hidden="true"><i></i></span>
          <div class="pl-ticks" aria-hidden="true">${"<b></b>".repeat(21)}</div>
          <div class="pl-labs">${STATES.map((n, i) => `<button class="pl-lab" type="button" role="radio" aria-checked="${i === 0}" data-i="${i}">${n}</button>`).join("")}</div></div>
        <div class="pl-btns"><button class="pl-water" type="button"><span>Water now</span></button><button class="pl-share" type="button">${ico('<path d="M12 15V4M8 8l4-4 4 4M6 12v7h12v-7"/>', 30, 1.6)}<span>Share</span></button></div>
        <span class="pl-home" aria-hidden="true"></span></div>`;
    stage.appendChild(c); const f = fit(stage, c, W, H);
    const img = c.querySelector(".pl-img"), drops = c.querySelector(".pl-drops"), seg = c.querySelector(".pl-seg"), thumb = c.querySelector(".pl-thumb"), labs = [...c.querySelectorAll(".pl-lab")];
    const ticks = [...c.querySelectorAll(".pl-ticks b")], water = c.querySelector(".pl-water"), share = c.querySelector(".pl-share"), wl = water.querySelector("span");
    [water, share, ...labs].forEach(press);
    const SEGW = 512, TWD = 168; const X = (i) => (i / 2) * (SEGW - TWD);
    let pos = 0, idx = 0, drag = null, watering = false, vis = { s: LOOK[0].s, sep: 0, b: 1, c: 1 }, bgc = { v: 0 };
    const paintLook = () => { img.style.filter = `saturate(${vis.s}) sepia(${vis.sep}) brightness(${vis.b}) contrast(${vis.c})`; };
    const tick = () => ticks.forEach((t, i) => { const tp = (i / 20) * (SEGW - TWD) + TWD / 2, d = Math.abs(tp - (pos + TWD / 2)), k = clamp(1 - d / 90, 0, 1); t.style.transform = `scaleY(${1 + k * 1.4})`; t.style.opacity = 0.35 + k * 0.65; });
    const place = (x) => { pos = x; g.set(thumb, { x }); tick(); };
    const setIdx = (i, animate = true) => {
      idx = i; labs.forEach((l, k) => { l.setAttribute("aria-checked", k === i); l.classList.toggle("is-on", k === i); });
      const L = LOOK[i];
      g.to(vis, { s: L.s, sep: L.sep, b: L.b, c: L.c, duration: T(animate ? 0.6 : 0), ease: "power2.out", onUpdate: paintLook, overwrite: "auto" });
      g.to(c, { backgroundColor: L.bg, duration: T(0.6), ease: "power2.out", overwrite: "auto" });
      g.to({ p: pos }, { p: X(i), duration: T(animate ? 0.5 : 0), ease: "back.out(1.15)", onUpdate() { place(this.targets()[0].p); } });
    };
    c.style.backgroundColor = LOOK[0].bg; paintLook(); place(0); labs[0].classList.add("is-on");
    labs.forEach((l, i) => l.addEventListener("click", () => { if (!drag) setIdx(i); }));
    seg.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); const n = Math.min(2, idx + 1); setIdx(n); labs[n].focus({ preventScroll: true }); } if (e.key === "ArrowLeft") { e.preventDefault(); const n = Math.max(0, idx - 1); setIdx(n); labs[n].focus({ preventScroll: true }); } });
    thumb.addEventListener("pointerdown", (e) => { thumb.setPointerCapture(e.pointerId); drag = { x: e.clientX, p: pos, m: false }; g.killTweensOf(thumb); g.to(thumb, { scale: 1.04, duration: T(0.12), ease: "power2.out" }); });
    thumb.addEventListener("pointermove", (e) => { if (!drag) return; const d = (e.clientX - drag.x) / f.scale(); if (Math.abs(d) > 3) drag.m = true; place(clamp(drag.p + d, 0, X(2))); const i = Math.round(pos / X(2) * 2); if (i !== idx) { idx = i; labs.forEach((l, k) => l.classList.toggle("is-on", k === i)); const L = LOOK[i]; g.to(vis, { s: L.s, sep: L.sep, b: L.b, c: L.c, duration: T(0.35), ease: "power2.out", onUpdate: paintLook, overwrite: "auto" }); g.to(c, { backgroundColor: L.bg, duration: T(0.5), overwrite: "auto" }); } });
    const release = () => { if (!drag) return; const fell = Math.round(pos / X(2) * 2); drag = null; g.to(thumb, { scale: 1, duration: T(0.2), ease: OUT }); setIdx(fell); setTimeout(() => { drag = null; }, 0); };
    thumb.addEventListener("pointerup", release); thumb.addEventListener("pointercancel", release);
    const rain = () => {
      drops.innerHTML = ""; const n = 9;
      for (let i = 0; i < n; i++) { const d = h("b"); d.style.left = `${8 + (i / (n - 1)) * 84}%`; drops.appendChild(d); }
      g.fromTo(drops.children, { y: -30, opacity: 0, scaleY: 0.8 }, { y: 360, opacity: 0.9, scaleY: 1.4, duration: T(0.7), ease: "power1.in", stagger: T(0.05), onComplete: () => g.to(drops.children, { opacity: 0, duration: 0.2 }) });
    };
    const doWater = () => {
      if (watering) return;
      if (idx === 0) { wl.textContent = "Already thriving"; g.fromTo(water, { x: 0 }, { x: 4, duration: 0.06, yoyo: true, repeat: 3, ease: "power1.inOut", onComplete: () => { g.set(water, { x: 0 }); setTimeout(() => { wl.textContent = "Water now"; }, 900); } }); return; }
      watering = true; wl.textContent = "Watering…"; water.classList.add("is-busy"); rain();
      setTimeout(() => { setIdx(0); wl.textContent = "Water now"; water.classList.remove("is-busy"); watering = false; }, off() ? 0 : 950);
    };
    water.addEventListener("click", doWater);
    share.addEventListener("click", () => g.fromTo(share.querySelector("svg"), { y: 0 }, { y: -5, duration: T(0.14), yoyo: true, repeat: 1, ease: "power2.out" }));
    g.from(c.querySelector(".pl-phone"), { y: 24, opacity: 0, duration: T(0.5), ease: OUT });
    const stopAuto = autoLoop(stage, auto, async (sleep, halted) => {
      await sleep(900); setIdx(1); await sleep(1100); if (halted()) return; setIdx(2); await sleep(1300); if (halted()) return; doWater(); await sleep(2200);
    });
    return () => { stopAuto(); g.killTweensOf(c.querySelectorAll("*")); g.killTweensOf(vis); g.killTweensOf(c); f.stop(); c.remove(); };
  };
})();
