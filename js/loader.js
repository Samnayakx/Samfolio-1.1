// Brand mark: a ring of 12 flat discs seen in perspective, plus the page loader.
// Disc i sits at angle θ around the ring: x = RX·sin θ, y = −RY·cos θ, and narrows as it turns edge-on.
(function () {
  // Apply the saved theme before first paint so the loader (and page) start in the right mode
  try {
    const saved = localStorage.getItem("theme");
    document.documentElement.dataset.theme = saved || "dark";
  } catch (e) {}
  // Page transition: arriving from another page of the site, start under a black cover; site.js lifts it and plays the entrance
  try {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const h = document.documentElement, c = document.createElement("div");
      c.className = "pt-cover"; document.body.appendChild(c);
      if (sessionStorage.getItem("pt")) h.classList.add("pt-in");
      h.classList.add("pt-pending");
      setTimeout(() => h.classList.remove("pt-pending", "pt-in"), 2500);   // never leave content hidden (outlasts the loader fallback below)
    }
    sessionStorage.removeItem("pt");
  } catch (e) {}
  const NS = "http://www.w3.org/2000/svg";
  const RX = 228, RY = 118, R = 50, N = 12, STEP = 360 / N;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = { out: (u) => 1 - (1 - u) ** 2, back: (u) => 1 + 2.2 * (u - 1) ** 3 + 1.2 * (u - 1) ** 2 };

  function mount(svg) {
    svg.setAttribute("viewBox", "-240 -175 480 350");
    svg.setAttribute("aria-hidden", "true");
    svg.replaceChildren();
    const dots = Array.from({ length: N }, () => svg.appendChild(document.createElementNS(NS, "ellipse")));
    dots.forEach((d) => d.setAttribute("fill", "currentColor"));
    const st = { phi: 0, v: 0, target: null, raf: 0, last: 0, grow: null };

    function draw() {
      const now = performance.now();
      dots.forEach((d, i) => {
        const t = ((i * STEP + st.phi) * Math.PI) / 180;
        const f = 0.12 + 0.88 * Math.cos(t) ** 2;
        let s = 1;
        if (st.grow) s = Math.max(0, Math.min(1, (now - st.grow.t0 - i * st.grow.stagger) / st.grow.dur));
        s = s >= 1 ? 1 : ease.back(s);
        d.setAttribute("cx", (RX * Math.sin(t)).toFixed(2));
        d.setAttribute("cy", (-RY * Math.cos(t)).toFixed(2));
        d.setAttribute("rx", Math.max(0.01, R * f * s).toFixed(2));
        d.setAttribute("ry", Math.max(0.01, R * s).toFixed(2));
      });
    }
    function loop(now) {
      const dt = Math.min(0.05, (now - (st.last || now)) / 1000);
      st.last = now;
      if (st.target) {
        const u = Math.min(1, (now - st.target.t0) / st.target.dur);
        st.phi = st.target.from + st.target.delta * ease.out(u);
        if (u >= 1) { st.phi = st.target.to; const cb = st.target.cb; st.target = null; st.v = 0; draw(); st.raf = 0; cb && cb(); return; }
      } else if (st.spin) {
        st.v += (st.spin - st.v) * Math.min(1, dt * 4);
        st.phi += st.v * dt;
      } else if (!st.grow || performance.now() - st.grow.t0 > st.grow.dur + 12 * st.grow.stagger) { st.raf = 0; return; }
      draw();
      st.raf = requestAnimationFrame(loop);
    }
    const kick = () => { if (!st.raf) { st.last = 0; st.raf = requestAnimationFrame(loop); } };
    draw();
    return {
      el: svg,
      grow(dur = 520, stagger = 45) { st.grow = { t0: performance.now(), dur, stagger }; kick(); },
      spin(degPerSec) { st.spin = degPerSec; st.target = null; kick(); },
      // coast to the next rest pose (a multiple of 30°) with an ease-out that matches the current speed
      settle(cb, minTurn = 60) {
        const v = Math.max(st.v, 60);
        let to = Math.ceil((st.phi + minTurn) / STEP) * STEP;
        if (to - st.phi < 4) to += STEP;   // already at rest: still glide one step so the exit reads as a settle
        st.spin = 0;
        st.target = { t0: performance.now(), from: st.phi, to, delta: to - st.phi, dur: Math.min(500, (2 * (to - st.phi)) / v * 1000), cb };
        kick();
      },
      get v() { return st.v; },
    };
  }
  window.Ring = { mount };

  // ── Loader: runs on first open and on reload, not on in-site navigation ──
  const el = document.getElementById("loader");
  if (!el) return;
  const nav = performance.getEntriesByType("navigation")[0];
  const type = nav ? nav.type : "navigate";
  let internal = false;
  try { internal = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
  if (!(type === "reload" || (type === "navigate" && !internal))) { el.remove(); return; }

  const root = document.documentElement;
  root.classList.add("is-loading");
  const ring = mount(el.querySelector("svg"));
  ring.grow(600, 50);
  if (!reduce) ring.spin(200);

  // The loader is a cover, not a delay: it leaves as soon as the page is parsed. Web fonts get a brief
  // chance to arrive (so the first paint is final), but fonts, images and video never hold it.
  let started = false;
  const go = () => { if (!started) { started = true; finish(); } };
  const parsed = new Promise((r) => (document.readyState === "loading" ? addEventListener("DOMContentLoaded", r, { once: true }) : r()));
  parsed.then(() => Promise.race([document.fonts ? document.fonts.ready : 0, new Promise((r) => setTimeout(r, 250))])).then(go);
  setTimeout(go, 2000);

  function finish() {
    const done = () => setTimeout(fly, reduce ? 0 : 40);
    reduce ? done() : ring.settle(done, 0);
  }
  function fly() {
    const svg = ring.el, target = document.querySelector(".seg__brand .logo");
    const bg = el.querySelector(".loader__bg");
    if (target) {
      const a = svg.getBoundingClientRect(), b = target.getBoundingClientRect();
      const s = b.width / a.width;
      const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
      el.style.color = getComputedStyle(target).color;
      svg.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    }
    bg.style.opacity = "0";
    setTimeout(() => {
      el.remove();
      root.classList.remove("is-loading");
      dispatchEvent(new Event("loader:done"));
    }, reduce ? 0 : 450);
  }
})();
