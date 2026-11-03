// Case-study demos: small authored product animations (Stageshow approach) that play inside a study's media.
// js/site.js renders <div data-case-demo="name">; this file finds them, loads GSAP once, and mounts each one.
// They are illustrations, not automation: a scripted cursor presses, and the scene changes in response.
(() => {
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  let gsapP = null;
  const loadGsap = () => gsapP || (gsapP = window.gsap ? Promise.resolve(window.gsap) : new Promise((res) => {
    const s = document.createElement("script"); s.src = "/js/vendor/gsap.min.js"; s.onload = () => res(window.gsap); s.onerror = () => res(null); document.head.appendChild(s);
  }));

  // Scale a fixed design size to the container's width, switching to a compact layout in a phone column
  function fitStage(host, stage, W, H, CW, CH, onMode) {
    let mode = "";
    const ro = new ResizeObserver(() => {
      const w = host.clientWidth, compact = w < 560, dw = compact ? CW : W, dh = compact ? CH : H;
      host.style.aspectRatio = `${dw} / ${dh}`;
      stage.style.width = dw + "px"; stage.style.height = dh + "px"; stage.style.transform = `scale(${w / dw})`;
      const m = compact ? "compact" : "wide"; if (m !== mode) { mode = m; onMode(m); }
    });
    ro.observe(host);
    return () => ro.disconnect();
  }

  // The cursor: a shallow arc timed by distance on the travel curve, a visible press, aims measured live
  function cursor(stage, g, scaleOf) {
    const cub = (x1, y1, x2, y2) => (t) => { let q = t; for (let i = 0; i < 8; i++) { const x = 3 * (1 - q) * (1 - q) * q * x1 + 3 * (1 - q) * q * q * x2 + q * q * q - t, dx = 3 * (1 - q) * (1 - q) * x1 + 6 * (1 - q) * q * (x2 - x1) + 3 * q * q * (1 - x2); if (Math.abs(dx) < 1e-6) break; q -= x / dx; } q = Math.max(0, Math.min(1, q)); return 3 * (1 - q) * (1 - q) * q * y1 + 3 * (1 - q) * q * q * y2 + q * q * q; };
    const ease = cub(0.45, 0, 0.1, 1), live = new Set(), pos = { x: 0, y: 0 };
    const el = h("div", "cd-cur", '<svg viewBox="0 0 16 22" width="22" height="30" aria-hidden="true"><path d="M1.5 1.5v15.2l3.7-3.4 2.6 6 2.7-1.2-2.6-5.9h5.1z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/></svg>');
    stage.appendChild(el); g.set(el, { opacity: 0 });
    const track = (t) => (live.add(t), t);
    const api = {
      at: (t, fx = 0.5, fy = 0.5) => { const r = t.getBoundingClientRect(), b = stage.getBoundingClientRect(), s = scaleOf(); return { x: (r.left - b.left + r.width * fx) / s, y: (r.top - b.top + r.height * fy) / s }; },
      sleep: (ms) => new Promise((res) => track(g.delayedCall(ms / 1000, res))),
      place: (x, y) => { pos.x = x; pos.y = y; g.set(el, { x, y, scale: 1 }); },
      show: () => track(g.to(el, { opacity: 1, duration: 0.35 })),
      hide: () => track(g.to(el, { opacity: 0, duration: 0.4 })),
      travel: (target, k = 1) => new Promise((res) => {
        const a = { x: pos.x, y: pos.y }, d0 = target(), p = { v: 0 };
        const dur = Math.min(1.4, 0.45 + Math.hypot(d0.x - a.x, d0.y - a.y) / 560) * k;
        track(g.to(p, { v: 1, duration: dur, ease, onUpdate: () => {
          const b = target(), t = p.v, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, arc = Math.sin(Math.PI * t) * Math.min(34, len * 0.12);
          pos.x = a.x + dx * t - (dy / len) * arc; pos.y = a.y + dy * t + (dx / len) * arc; g.set(el, { x: pos.x, y: pos.y });
        }, onComplete: res }));
      }),
      drag: (dx, dur, onStep) => new Promise((res) => { const x0 = pos.x, p = { v: 0 }; track(g.to(el, { scale: 0.9, duration: 0.12 })); track(g.to(p, { v: 1, duration: dur, ease: "power2.inOut", onUpdate: () => { pos.x = x0 + dx * p.v; g.set(el, { x: pos.x }); onStep(p.v); }, onComplete: () => { track(g.to(el, { scale: 1, duration: 0.15 })); res(); } })); }),
      press: async () => { track(g.to(el, { scale: 0.84, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "0 0" })); await api.sleep(220); },
      stop: () => { live.forEach((t) => t.kill()); live.clear(); g.set(el, { opacity: 0 }); },
    };
    return api;
  }

  // ── Gap · QuickFit Finder (web): the three decisions in one pass ──
  // 1 height first (Decision 1) → the size arrives on the avatar; 2 the Hips descriptor says what fitted feels like (Decision 3);
  // 3 the reason is one tap away (Decision 2); then Add to bag confirms on itself, and "‹ Height" leaves the way the product does.
  function gapQuickFit(host, g) {
    const W = 960, H = 540, CW = 420, CH = 640;
    const stage = h("div", "gq");
    const chips = ["5′3″", "5′4″", "5′5″", "5′6″", "5′7″", "5′8″"].map((t) => `<span class="gq__c" data-h="${t}">${t}</span>`).join("");
    const row = (z, v) => `<div class="gq__z" data-z="${z}"><em>${z}</em><b>${v}</b><i class="gq__i">?</i></div>`;
    stage.innerHTML = `
      <div class="gq__app">
        <p class="gq__ttl">QUICKFIT FINDER</p>
        <section class="gq__s1 is-on">
          <div class="gq__body gq__body--ghost"></div>
          <div class="gq__ask"><p class="gq__k">(1 of 3)</p><p class="gq__q">How tall are you?</p>
            <div class="gq__chips"><span class="gq__arr">‹</span>${chips}<span class="gq__arr">›</span></div></div>
        </section>
        <section class="gq__s2">
          <span class="gq__back">‹ Height · 5′6″</span>
          <div class="gq__left">
            <p class="gq__k">Size</p><div class="gq__row"><span class="gq__c">27W</span><span class="gq__c on">28W</span><span class="gq__c">29W</span></div>
            <span class="gq__why">Why this recommendation?</span>
            <div class="gq__whycard"><p>Your height and this cut put you in 28W.</p><p><b>Feels small?</b> Try 29W. <b>Large?</b> Try 27W.</p></div>
            <div class="gq__len"><p class="gq__k">Length</p><div class="gq__row"><span class="gq__c">30L</span><span class="gq__c on">32L</span><span class="gq__c">34L</span></div></div>
            <span class="gq__add"><span class="a">ADD TO BAG</span><span class="b">✓ ADDED</span></span>
          </div>
          <div class="gq__body"><span class="gq__jean"></span></div>
          <div class="gq__tabs"><span class="on">Front</span><span>Waist</span><span>Ankles</span><span>Back</span></div>
          <div class="gq__right"><p class="gq__k">On your avatar</p><p class="gq__sz">28W 32L</p>${row("Waist", "Fitted")}${row("Hips", "Fitted")}${row("Calf", "Loose")}</div>
          <div class="gq__pop"><p class="gq__ph">Hips</p><p><span class="t">Tight:</span> Unlikely to fit</p><p><b>Fitted:</b> Some pressure on hips</p><p><b>Loose:</b> No pressure on hips</p></div>
        </section>
      </div>`;
    host.appendChild(stage);
    const $ = (q) => stage.querySelector(q), $$ = (q) => [...stage.querySelectorAll(q)];
    const s1 = $(".gq__s1"), s2 = $(".gq__s2"), pop = $(".gq__pop"), why = $(".gq__whycard");
    let scale = 1;
    const stopFit = fitStage(host, stage, W, H, CW, CH, (m) => { stage.dataset.mode = m; });
    new ResizeObserver(() => { scale = host.clientWidth / (stage.dataset.mode === "compact" ? CW : W); }).observe(host);
    const show = (el, on, from = { y: 6 }) => { if (on) { el.classList.add("is-on"); g.fromTo(el, { opacity: 0, ...from }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.55, ease: "expo.out" }); } else g.to(el, { opacity: 0, duration: 0.25, ease: "power2.in", onComplete: () => el.classList.remove("is-on") }); };
    const swap = (from, to) => { // a page swap inside one window: the body crossfades with a short rise, the frame stays
      g.to(from, { opacity: 0, y: -6, duration: 0.22, ease: "power2.in", onComplete: () => { from.classList.remove("is-on"); g.set(from, { clearProps: "all" }); } });
      to.classList.add("is-on"); g.fromTo(to, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay: 0.14 });
    };
    const reset = () => {
      s2.classList.remove("is-on"); s1.classList.add("is-on"); g.set([s1, s2], { clearProps: "all" });
      [pop, why].forEach((e) => { e.classList.remove("is-on"); g.set(e, { clearProps: "all" }); });
      $$(".gq__c[data-h]").forEach((c) => c.classList.remove("on")); $(".gq__add").classList.remove("is-added"); $$(".gq__z").forEach((z) => z.classList.remove("on"));
    };
    // poster: the result with the descriptor and the reason both open (reduced motion, screenshots)
    if (reduce()) { s1.classList.remove("is-on"); s2.classList.add("is-on"); pop.classList.add("is-on"); why.classList.add("is-on"); $('.gq__z[data-z="Hips"]').classList.add("on"); return () => stopFit(); }

    const cur = cursor(stage, g, () => scale);
    let run = 0, live = false;
    async function story(id) {
      const ok = () => id === run, cm = stage.dataset.mode === "compact";
      reset(); cur.place(cm ? 330 : 820, cm ? 600 : 470); cur.show(); await cur.sleep(600); if (!ok()) return;
      // 1 · height first
      const c = $('.gq__c[data-h="5′6″"]');
      await cur.travel(() => cur.at(c, 0.72, 0.68)); if (!ok()) return;
      await cur.press(); c.classList.add("on"); await cur.sleep(380); if (!ok()) return;
      swap(s1, s2); g.fromTo($$(".gq__z"), { opacity: 0, x: 8 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, delay: 0.4, ease: "power3.out" });
      await cur.sleep(1500); if (!ok()) return;
      // 2 · what does fitted feel like?
      const hip = $('.gq__z[data-z="Hips"] .gq__i');
      await cur.travel(() => cur.at(hip, 0.7, 0.7)); if (!ok()) return;
      await cur.press(); $('.gq__z[data-z="Hips"]').classList.add("on"); show(pop, true, { x: -10, scale: 0.97 }); await cur.sleep(2200); if (!ok()) return;
      show(pop, false); $('.gq__z[data-z="Hips"]').classList.remove("on");
      // 3 · the reason, one tap away
      await cur.travel(() => cur.at($(".gq__why"), 0.86, 0.7)); if (!ok()) return;
      await cur.press(); show(why, true); await cur.sleep(2200); if (!ok()) return;
      // 4 · decide
      await cur.travel(() => cur.at($(".gq__add"), 0.82, 0.66)); if (!ok()) return;
      await cur.press(); $(".gq__add").classList.add("is-added"); await cur.sleep(1800); if (!ok()) return;
      // 5 · out the way the product goes: back to height
      await cur.travel(() => cur.at($(".gq__back"), 0.8, 0.66)); if (!ok()) return;
      await cur.press(); swap(s2, s1); await cur.sleep(600); if (!ok()) return;
      cur.hide(); await cur.sleep(900);
    }
    const start = () => { if (live) return; live = true; const id = ++run; (async () => { while (id === run) await story(id); })(); };
    const stop = () => { live = false; run++; cur.stop(); };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()), { threshold: 0.35 });
    io.observe(host);
    return () => { io.disconnect(); stop(); stopFit(); };
  }

  const DEMOS = { gapQuickFit };
  const mount = (el) => { if (el.dataset.on) return; el.dataset.on = "1"; loadGsap().then((g) => { const fn = DEMOS[el.dataset.caseDemo]; if (fn && g) fn(el, g); }); };
  const scan = () => document.querySelectorAll("[data-case-demo]").forEach(mount);
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
