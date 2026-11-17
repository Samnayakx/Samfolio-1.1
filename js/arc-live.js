// Playground rows on the home page: run the real playground pieces inside the cards, but only a few at a time.
// - The playground's styles and scripts load early, when the rows are still a screen or so away and the browser is idle.
// - At most MAX pieces run at once (fewer on phones and small machines); the rest show their still. Pieces start one by one, and a
//   running piece keeps going until it leaves the screen, so nothing is swapped mid-view.
// - The rows stop drifting while they are off screen, and every piece stops when its card is gone.
// - With reduced motion nothing runs and the stills stay.
(() => {
  const rows = document.querySelector(".arc__rows"), items = [...document.querySelectorAll(".arc__item")];
  if (!rows || !items.length) return;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const weak = matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4;
  const MAX = weak ? 2 : 3;

  // Rows: pause the drift when they are not on screen
  new IntersectionObserver((e) => rows.classList.toggle("is-away", !e[0].isIntersecting), { threshold: 0 }).observe(rows);
  if (calm) return;

  let ready = null;
  const load = () => (ready ||= new Promise((done) => {
    ["playground", "ui-protos-a", "ui-protos-b", "ui-protos-c", "ui-protos-d"].forEach((n) => {
      const css = document.createElement("link"); css.rel = "stylesheet"; css.href = `/css/${n}.css`; document.head.appendChild(css);
    });
    const srcs = ["/js/playground.js", "/js/ui-protos-a.js", "/js/ui-protos-b.js", "/js/ui-protos-c.js", "/js/ui-protos-d.js"];
    const next = (i) => {
      if (i === srcs.length) return done();
      const s = document.createElement("script"); s.src = srcs[i]; s.onload = s.onerror = () => next(i + 1); document.head.appendChild(s);
    };
    const wait = (n = 0) => (window.gsap || n > 100 ? next(0) : setTimeout(() => wait(n + 1), 50));   // the pieces use GSAP, which the page loads deferred
    wait();
  }));
  // Fetch and parse it while the rows are still below the fold, in idle time, so nothing hitches when they arrive
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); idle(() => load(), { timeout: 2500 }); } }, { rootMargin: "1400px 0px" }).observe(rows);

  const state = new WeakMap();
  const visible = new Set();
  const fit = (item) => {
    const tile = item.querySelector(".arc__live"), s = item.clientHeight / (Number(tile.dataset.h) - 6);
    tile.style.setProperty("--s", s); tile.style.left = tile.style.top = `${-3 * s}px`;   // the still has the tile's 3px edge trimmed
  };
  const mount = async (item) => {
    const st = state.get(item) || {}; state.set(item, st);
    if (st.on) return; st.on = true;
    const tile = item.querySelector(".arc__live");
    if (st.timer) { clearTimeout(st.timer); st.timer = 0; fit(item); tile.classList.add("is-on"); return; }   // it never stopped; just show it again
    await load();
    if (!st.on) return;
    const stage = tile.querySelector(".lab__stage"), demo = window.Playground && window.Playground.DEMOS && window.Playground.DEMOS[tile.dataset.demo];
    if (!demo) return;
    fit(item);
    if (!tile.classList.contains("lab__tile--hover")) stage.inert = true;
    st.cleanup = demo(stage, { auto: true });
    tile.classList.add("is-on");
  };
  const unmount = (item) => {
    const st = state.get(item); if (!st || !st.on) return;
    st.on = false;
    const tile = item.querySelector(".arc__live"); tile.classList.remove("is-on");
    st.timer = setTimeout(() => {
      st.timer = 0;
      if (typeof st.cleanup === "function") { try { st.cleanup(); } catch (e) {} }
      st.cleanup = null; tile.querySelector(".lab__stage").replaceChildren();
    }, 400);
  };

  // Which cards run: up to MAX. A piece that is running keeps running until it leaves the screen, so nothing is swapped mid-view;
  // free slots go to the visible cards nearest the middle. Checked a few times a second, since the rows drift.
  let busy = false;
  const mid = () => innerWidth / 2;
  const dist = (it) => Math.abs(it.getBoundingClientRect().left + it.offsetWidth / 2 - mid());
  const choose = () => {
    if (busy || document.hidden) return;
    const running = items.filter((it) => (state.get(it) || {}).on);
    running.filter((it) => !visible.has(it)).forEach(unmount);
    const keep = running.filter((it) => visible.has(it));
    const free = MAX - keep.length;
    if (free <= 0) return;
    const start = [...visible].filter((it) => !keep.includes(it)).sort((a, b) => dist(a) - dist(b)).slice(0, free);
    if (!start.length) return;
    busy = true;
    start.forEach((it, k) => setTimeout(() => { mount(it); if (k === start.length - 1) busy = false; }, k * 400));   // one at a time, so the page never takes a burst
  };
  const io = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))); choose(); }, { rootMargin: "0px 40px", threshold: 0.3 });
  items.forEach((it) => io.observe(it));
  setInterval(() => { if (!rows.classList.contains("is-away")) choose(); }, 900);
  if ("ResizeObserver" in window) { const ro = new ResizeObserver((es) => es.forEach((e) => { const st = state.get(e.target); if (st && st.on) fit(e.target); })); items.forEach((it) => ro.observe(it)); }
  document.addEventListener("visibilitychange", () => { if (document.hidden) items.forEach(unmount); else choose(); });
})();
