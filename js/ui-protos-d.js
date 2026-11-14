// Playground protos D: emailStats (Autosend-style stat card) and contentsSpread (book contents spread).
// Each is built at the size of its source image and scaled to fit its stage.
(() => {
  "use strict";
  if (!window.Playground || !window.Playground.DEMOS) return;
  const DEMOS = window.Playground.DEMOS;
  const motionOff = () => (window.motionReduced ? window.motionReduced() : matchMedia("(prefers-reduced-motion: reduce)").matches);
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  // Scale a fixed-size canvas to fit its stage (contain, no padding); returns the current scale for pointer maths
  function fit(stage, canvas, w, hgt) {
    let s = 1;
    canvas.style.width = `${w}px`; canvas.style.height = `${hgt}px`;
    const apply = () => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      s = Math.min(r.width / w, r.height / hgt);
      canvas.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(stage);
    apply();
    return { scale: () => s, stop: () => ro.disconnect() };
  }

  /* ───────────────────────── emailStats ───────────────────────── */
  const NUM = (v, d = 0, c = 0, suf = "") => ({ v, d, c, suf });
  const fmt = (n, t) => {
    const x = n.v * t;
    let s = x.toFixed(n.d);
    if (n.c) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return s + n.suf;
  };
  const COLS = [
    {
      name: "Delivered", big: NUM(98.0, 1, 0, "%"), tone: "green", rowTop: [114, 147, 181], noteTop: 231,
      rows: [
        { k: "SENT", dot: "grey", val: [NUM(415581, 0, 1)] },
        { k: "DELIVERED", dot: "green", val: [NUM(98.0, 1, 0, "%"), " (", NUM(407212, 0, 1), ")"] },
        { k: "BOUNCED", dot: "orange", val: [NUM(2.0, 1, 0, "%"), " (", NUM(8369, 0, 1), ")"] },
      ],
      note: "<b>Deliverability is solid</b> at 98%. Keep your<br>bounce rate under 2% by removing invalid or<br>inactive emails regularly.",
      spark: [96.8, 97.2, 97.9, 97.4, 98.1, 98.3, 97.8, 98.2, 98.5, 98.0, 97.6, 98.1, 98.4, 98.0], label: "DELIVERED / 14D",
    },
    {
      name: "Engaged", big: NUM(56.0, 1, 0, "%"), tone: "orange", rowTop: [140, 174], noteTop: 251,
      rows: [
        { k: "OPENS", dot: "green", val: [NUM(56.0, 1, 0, "%"), " (", NUM(228037, 0, 1), ")"] },
        { k: "CLICKS", dot: "soft", warn: 1, val: [NUM(1.39, 2, 0, "%"), " (", NUM(9555, 0, 1), ")"] },
      ],
      note: "Click rate is low at 1.39%. Aim for 2%+. Test<br>stronger CTAs and refine targeting.",
      spark: [49, 52, 55, 53, 58, 60, 57, 55, 59, 61, 56, 54, 57, 56], label: "OPENS / 14D",
    },
    {
      name: "Complaints", big: NUM(0.20, 2, 0, "%"), tone: "ink", rowTop: [140, 174], noteTop: 251,
      rows: [
        { k: "UNSUBSCRIBES", dot: "soft", val: [NUM(0.20, 2, 0, "%"), " (", NUM(820, 0, 1), ")"] },
        { k: "REPORTED SPAM", dot: "soft", val: [NUM(0.00, 2, 0, "%"), " (", NUM(2, 0, 1), ")"] },
      ],
      note: "<b>Unsubscribes and complaints are fine.</b> Keep<br>monitoring for spikes after each campaign.",
      spark: [0.26, 0.22, 0.18, 0.24, 0.2, 0.17, 0.21, 0.19, 0.23, 0.2, 0.18, 0.22, 0.19, 0.2], label: "COMPLAINTS / 14D",
    },
  ];
  const INFO = '<svg viewBox="0 0 17 17" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="8.5" cy="8.5" r="7.2"/><path d="M8.5 7.6v4.2"/><circle cx="8.5" cy="5.2" r=".5" fill="currentColor"/></svg>';
  const SEND_ICON = '<svg viewBox="0 0 28 26" width="28" height="26" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 25V10"/><path d="M14 10C10 8 10 3 14 1c4 2 4 7 0 9Z"/><path d="M14 17c-4 1-9-1-11-5 4-1 9 1 11 5Z"/><path d="M14 17c4 1 9-1 11-5-4-1-9 1-11 5Z"/><path d="M11 25h6"/></svg>';

  DEMOS.emailStats = function (stage /*, { auto } */) {
    const W = 1200, H = 720;
    const c = h("div", "ix es2");
    const valHtml = (parts) => parts.map((p) => (typeof p === "string" ? `<span class="es2-t">${p}</span>` : `<span class="es2-n" data-n="${encodeURIComponent(JSON.stringify(p))}">${fmt(p, 1)}</span>`)).join("");
    c.innerHTML = `<div class="es2-card" role="group" aria-label="Email campaign statistics">${COLS.map((col, i) => `
      <button type="button" class="es2-col es2-col--${col.tone}" data-i="${i}" aria-pressed="false" aria-label="${col.name} ${fmt(col.big, 1)}. Show 14 day trend">
        <span class="es2-title">${col.name}</span>
        <span class="es2-info" aria-hidden="true">${INFO}</span>
        <span class="es2-big"><span class="es2-n" data-n="${encodeURIComponent(JSON.stringify(col.big))}">${fmt(col.big, 1)}</span></span>
        <span class="es2-spark" aria-hidden="true"><svg viewBox="0 0 150 40" width="150" height="40" preserveAspectRatio="none"><path class="es2-area" d=""/><path class="es2-path" d=""/><circle class="es2-dot" r="3" cx="0" cy="0"/></svg><span class="es2-sl">${col.label}</span></span>
        ${col.rows.map((r, j) => `<span class="es2-row${r.warn ? " is-warn" : ""}" style="top:${col.rowTop[j]}px"><i class="es2-d es2-d--${r.dot}"></i><span class="es2-k">${r.k}</span><span class="es2-line"></span><span class="es2-v">${valHtml(r.val)}</span></span>`).join("")}
        <span class="es2-note" style="top:${col.noteTop}px">${col.note}</span>
      </button>`).join("")}</div>
      <div class="es2-brand" aria-hidden="true">${SEND_ICON}<span>AUTOSEND</span></div>`;
    stage.appendChild(c);
    const f = fit(stage, c, W, H);
    const card = c.querySelector(".es2-card");
    const cols = [...c.querySelectorAll(".es2-col")];

    const timers = new Set();
    const anims = new Set();
    let raf = 0;
    let active = -1, pinned = -1;
    const runs = new Map(); // col element -> raf id

    const sparkPath = (data, w, hh) => {
      const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
      const pts = data.map((v, k) => [(k / (data.length - 1)) * w, hh - 3 - ((v - mn) / rg) * (hh - 8)]);
      return { pts, d: pts.map((p, k) => (k ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ") };
    };
    cols.forEach((el, i) => {
      const sp = sparkPath(COLS[i].spark, 150, 40);
      el._pts = sp.pts;
      el.querySelector(".es2-path").setAttribute("d", sp.d);
      el.querySelector(".es2-area").setAttribute("d", sp.d + " L150 40 L0 40 Z");
      const dot = el.querySelector(".es2-dot");
      const last = sp.pts[sp.pts.length - 1];
      dot.setAttribute("cx", last[0]); dot.setAttribute("cy", last[1]);
    });

    const countUp = (el, dur) => {
      const ns = [...el.querySelectorAll(".es2-n")];
      cancelAnimationFrame(runs.get(el) || 0);
      const paint = (t) => ns.forEach((n) => { n.textContent = fmt(JSON.parse(decodeURIComponent(n.dataset.n)), t); });
      if (motionOff()) { paint(1); return; }
      const t0 = performance.now();
      const step = (now) => {
        const t = clamp((now - t0) / dur, 0, 1);
        paint(ease(t));
        if (t < 1) runs.set(el, requestAnimationFrame(step)); else runs.delete(el);
      };
      runs.set(el, requestAnimationFrame(step));
    };
    const growLines = (el, delay = 0) => {
      if (motionOff()) return;
      el.querySelectorAll(".es2-line").forEach((ln, k) => {
        const a = ln.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 650, delay: delay + k * 70, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" });
        anims.add(a); a.onfinish = a.oncancel = () => anims.delete(a);
      });
      const sp = el.querySelector(".es2-path");
      if (sp.getTotalLength) {
        const L = sp.getTotalLength();
        const a = sp.animate([{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }], { duration: 800, easing: "cubic-bezier(.2,.7,.2,1)" });
        anims.add(a); a.onfinish = a.oncancel = () => anims.delete(a);
      }
    };
    const setActive = (i) => {
      if (i === active) return;
      const prev = active;
      active = i;
      cols.forEach((el, k) => el.classList.toggle("is-on", k === i));
      if (i < 0) { delete card.dataset.active; return; }
      card.dataset.active = String(i);
      if (prev !== i) { countUp(cols[i], 750); growLines(cols[i]); }
    };
    const rest = () => setActive(pinned);

    const onEnter = (e) => setActive(+e.currentTarget.dataset.i);
    const onLeave = () => rest();
    const onClick = (e) => {
      const i = +e.currentTarget.dataset.i;
      pinned = pinned === i ? -1 : i;
      cols.forEach((el, k) => el.setAttribute("aria-pressed", String(k === pinned)));
      setActive(i);
      countUp(cols[i], 750); growLines(cols[i]);
    };
    // Scrub the sparkline with the pointer (the svg's rect is already scaled, so this is just a ratio)
    const onMove = (e) => {
      const el = e.currentTarget;
      const svg = el.querySelector(".es2-spark svg");
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const x = ((e.clientX - r.left) / f.scale()) ;
      if (x < -6 || x > 156) return;
      const pts = el._pts;
      const k = clamp(Math.round((x / 150) * (pts.length - 1)), 0, pts.length - 1);
      const dot = el.querySelector(".es2-dot");
      dot.setAttribute("cx", pts[k][0]); dot.setAttribute("cy", pts[k][1]);
    };
    cols.forEach((el) => {
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("focus", onEnter);
      el.addEventListener("blur", onLeave);
      el.addEventListener("click", onClick);
      el.addEventListener("pointermove", onMove);
    });

    // Intro: numbers count up and the leader lines draw in
    timers.add(setTimeout(() => { cols.forEach((el, i) => { countUp(el, 900 + i * 100); growLines(el, i * 90); }); }, 200));

    return () => {
      f.stop();
      timers.forEach(clearTimeout); timers.clear();
      runs.forEach((id) => cancelAnimationFrame(id)); runs.clear();
      anims.forEach((a) => { a.onfinish = a.oncancel = null; try { a.cancel(); } catch (e) {} }); anims.clear();
      cancelAnimationFrame(raf);
      cols.forEach((el) => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("focus", onEnter);
        el.removeEventListener("blur", onLeave);
        el.removeEventListener("click", onClick);
        el.removeEventListener("pointermove", onMove);
      });
      c.remove();
    };
  };

  /* ───────────────────────── contentsSpread ───────────────────────── */
  const CH = [
    { id: "intro", t: ["INTRODUCTION"], n: "07", side: "r", x: 338, top: 34.6, w: 223, body: "How the year in this kitchen is organised, and why the book follows the olive trees rather than the calendar." },
    { id: "day", t: ["A DAY OF EATING"], n: "21", side: "r", x: 338, top: 51.3, w: 223, body: "From the first coffee on the terrace to the last plate carried out under the lamp, one ordinary day at the table." },
    { id: "carlo", t: ["CARLO ON", "&nbsp;&nbsp;MOROSETA KITCHEN"], n: "25", side: "r", x: 338, top: 68, w: 223, body: "Carlo talks about the stone, the fire and the small rules of a kitchen that has barely changed in a century." },
    { id: "spring", t: ["SPRING"], n: "26", side: "l", x: 37, top: 210.6, photo: [37, 236, 224, 319], img: "spring", body: "Poppies take the groves. Fava, wild asparagus, young ricotta and everything green that can be eaten before it is cooked." },
    { id: "summer", t: ["SUMMER"], n: "76", side: "l", x: 286, top: 210.6, photo: [286, 236, 224, 319], img: "summer", body: "Long lunches beside the pool, tomatoes at their loudest, and a garden of cactus fruit nobody quite knows what to do with." },
    { id: "autumn", t: ["AUTUMN"], n: "130", side: "r", x: 89, top: 210.6, photo: [89, 236, 224, 319], img: "autumn", body: "Low gold light on white walls. Harvest, pressing, bread from the outdoor oven and suppers eaten in coats." },
    { id: "winter", t: ["WINTER"], n: "182", side: "r", x: 338, top: 210.6, photo: [338, 236, 224, 319], img: "winter", body: "Hens in the wet grass, brittle sky, slow pots and the fruit of the groves pressed into the new oil." },
    { id: "basics", t: ["BASICS"], n: "230", side: "l", x: 37, top: 731.6, w: 224, body: "Stocks, doughs, preserves and the handful of sauces the rest of the book quietly depends on." },
    { id: "index", t: ["INDEX"], n: "248", side: "r", x: 338, top: 697.6, w: 223, body: "Every ingredient, every dish, in the order a hungry person would look for it." },
    { id: "ack", t: ["ACKNOWLEDGEMENTS"], n: "254", side: "r", x: 338, top: 714.3, w: 223, body: "Thanks to everyone who ate, carried, washed up and stayed too late." },
    { id: "author", t: ["ABOUT THE AUTHOR"], n: "255", side: "r", x: 338, top: 731, w: 223, body: "A cook, a gardener and a reluctant photographer, writing from the heel of Italy." },
  ];

  DEMOS.contentsSpread = function (stage /*, { auto } */) {
    const W = 1199, H = 782;
    const c = h("div", "ix cx");
    const entry = (e, i) => {
      const isSeason = !!e.photo;
      const aria = `${e.t.join(" ").replace(/&nbsp;/g, "").replace(/\s+/g, " ").toLowerCase()}, page ${parseInt(e.n, 10)}`;
      if (isSeason) {
        return `<button type="button" class="cx-ent cx-season" data-i="${i}" aria-label="${aria}" style="left:${e.x}px;top:${e.top}px;width:${e.photo[2]}px;height:${e.photo[1] + e.photo[3] - e.top}px">
          <span class="cx-head"><span class="cx-lab">${e.t[0]}</span><span class="cx-n">${e.n}</span></span>
          <span class="cx-photo"><span class="cx-img cx-img--${e.img}"></span></span></button>`;
      }
      return `<button type="button" class="cx-ent cx-line" data-i="${i}" aria-label="${aria}" style="left:${e.x}px;top:${e.top}px;width:${e.w}px"><span class="cx-lab">${e.t.join("<br>")}</span><span class="cx-n">${e.n}</span></button>`;
    };
    const side = (s) => CH.map((e, i) => (e.side === s ? entry(e, i) : "")).join("");
    c.innerHTML = `
      <div class="cx-spread">
        <div class="cx-page cx-pl"><div class="cx-title">CONTENTS</div>${side("l")}</div>
        <div class="cx-page cx-under" aria-hidden="true">
          <div class="cx-hd"><button type="button" class="cx-back" tabindex="-1">&larr; CONTENTS</button><span class="cx-pg"></span></div>
          <h2 class="cx-h"></h2>
          <p class="cx-p"></p>
          <div class="cx-pn"><button type="button" class="cx-prev" tabindex="-1">&larr; PREVIOUS</button><button type="button" class="cx-next" tabindex="-1">NEXT &rarr;</button></div>
          <div class="cx-shade"></div>
        </div>
        <div class="cx-leaf">
          <div class="cx-face cx-front cx-page">${side("r")}</div>
          <div class="cx-face cx-bk" aria-hidden="true">
            <div class="cx-hd cx-hd--l"><span class="cx-bl"></span><span class="cx-bn"></span></div>
            <div class="cx-art"><span class="cx-art-img"></span><span class="cx-art-num"></span></div>
          </div>
        </div>
      </div>`;
    stage.appendChild(c);
    const f = fit(stage, c, W, H);
    const $ = (s) => c.querySelector(s);
    const spread = $(".cx-spread"), leaf = $(".cx-leaf"), front = $(".cx-front"), pl = $(".cx-pl"), under = $(".cx-under"), bk = $(".cx-bk");
    const ents = [...c.querySelectorAll(".cx-ent")];
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };

    let open = false, idx = 0, lastFocus = null, busy = false;

    const fill = (i) => {
      const e = CH[i];
      const title = e.t.join(" ").replace(/&nbsp;/g, "").replace(/\s+/g, " ").trim();
      $(".cx-pg").textContent = e.n;
      $(".cx-h").textContent = title;
      $(".cx-p").textContent = e.body;
      $(".cx-bl").textContent = title;
      $(".cx-bn").textContent = e.n;
      $(".cx-art-img").className = "cx-art-img" + (e.img ? ` cx-img--${e.img}` : " cx-art-img--plain");
      $(".cx-art-num").textContent = e.img ? "" : e.n;
    };
    const setTab = (v) => { under.querySelectorAll("button").forEach((b) => { b.tabIndex = v ? 0 : -1; }); under.setAttribute("aria-hidden", v ? "false" : "true"); };

    const openCh = (i) => {
      if (busy) return;
      idx = i; fill(i);
      lastFocus = ents[i];
      open = true; busy = true;
      spread.classList.add("is-open");
      front.inert = true; pl.inert = true;
      setTab(true);
      later(() => { busy = false; const b = $(".cx-back"); b && b.focus({ preventScroll: true }); }, motionOff() ? 0 : 950);
    };
    const closeCh = () => {
      if (!open || busy) return;
      open = false; busy = true;
      spread.classList.remove("is-open");
      setTab(false);
      later(() => {
        busy = false; front.inert = false; pl.inert = false;
        lastFocus && lastFocus.focus({ preventScroll: true });
      }, motionOff() ? 0 : 950);
    };
    const step = (d) => {
      if (!open || busy) return;
      idx = (idx + d + CH.length) % CH.length; lastFocus = ents[idx];
      const els = [under, bk];
      els.forEach((x) => x.classList.add("is-swap"));
      later(() => { fill(idx); els.forEach((x) => x.classList.remove("is-swap")); }, motionOff() ? 0 : 180);
    };

    const onClick = (e) => {
      const b = e.target.closest("button");
      if (!b || !c.contains(b)) return;
      if (b.classList.contains("cx-ent")) openCh(+b.dataset.i);
      else if (b.classList.contains("cx-back")) closeCh();
      else if (b.classList.contains("cx-prev")) step(-1);
      else if (b.classList.contains("cx-next")) step(1);
    };
    const onKey = (e) => {
      if (e.key === "Escape" && open) { e.preventDefault(); closeCh(); }
      else if (open && e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (open && e.key === "ArrowRight") { e.preventDefault(); step(1); }
    };
    // Hovering a photograph or its number marks the whole entry as hot
    c.addEventListener("click", onClick);
    c.addEventListener("keydown", onKey);
    fill(0); setTab(false);

    return () => {
      f.stop();
      timers.forEach(clearTimeout); timers.clear();
      c.removeEventListener("click", onClick);
      c.removeEventListener("keydown", onKey);
      c.remove();
    };
  };
})();
