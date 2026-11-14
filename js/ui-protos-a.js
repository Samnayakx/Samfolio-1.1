// UI prototypes A: lensPicker (iPhone camera lens wheel) and workoutApp (HIIT summary phone).
// Each is built at the pixel size of the image it replaces, then scaled to its stage.
(() => {
  if (!window.Playground || !window.Playground.DEMOS) return;
  const D = window.Playground.DEMOS;
  const motionOff = () => (window.motionReduced ? window.motionReduced() : matchMedia("(prefers-reduced-motion: reduce)").matches);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Fixed design size, scaled to the stage; scale() is what pointer maths divides by.
  function fit(stage, c, W, H) {
    let s = 1;
    c.style.width = `${W}px`; c.style.height = `${H}px`;
    const ro = new ResizeObserver(() => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      s = Math.min(r.width / W, r.height / H);
      c.style.transform = `translate(-50%, -50%) scale(${s})`;
    });
    ro.observe(stage);
    return { scale: () => s, stop: () => ro.disconnect() };
  }

  /* ───────── Lens picker ───────── */
  D.lensPicker = function lensPicker(stage) {
    const STOPS = [24, 35, 48, 77], GAP = 249, MAX = GAP * (STOPS.length - 1), CX = 368;
    const c = document.createElement("div");
    c.className = "ix lp";
    const labels = (cls) => STOPS.map((m) => `<span class="lp-lab" style="left:0" data-m="${m}">${m}MM</span>`).join("");
    c.innerHTML = `
      <div class="lp-pill" tabindex="0" role="slider" aria-label="Focal length" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="${STOPS.length - 1}" aria-valuenow="0" aria-valuetext="${STOPS[0]} millimetres">
        <div class="lp-world"><div class="lp-ticks"></div>${labels()}</div>
      </div>
      <div class="lp-glass" aria-hidden="true">
        <div class="lp-world"><div class="lp-ticks"></div>${labels()}</div>
        <span class="lp-fringe lp-fringe--l"></span><span class="lp-fringe lp-fringe--r"></span>
        <span class="lp-ind"></span>
      </div>`;
    stage.appendChild(c);
    const f = fit(stage, c, 736, 736);
    const pill = c.querySelector(".lp-pill"), glass = c.querySelector(".lp-glass");
    const ticks = [...c.querySelectorAll(".lp-ticks")];
    const outer = [...pill.querySelectorAll(".lp-lab")], inner = [...glass.querySelectorAll(".lp-lab")];
    const A = [0x52, 0x51, 0x52], B = [0xfa, 0xdf, 0x10];

    let p = 0, v = 0, cur = 0, raf = 0, drag = null, acc = 0, accT = 0;

    const render = () => {
      const off = ((((CX - p - 13) % 26) + 26) % 26);
      ticks.forEach((t) => { t.style.backgroundPositionX = `${off}px`; });
      STOPS.forEach((_, i) => {
        const x = CX + i * GAP - p;
        const tr = `translate(${x}px, 0) translate(-50%, -50%)`;
        outer[i].style.transform = tr; inner[i].style.transform = tr;
        const t = clamp(1 - Math.abs(x - CX) / 150, 0, 1);
        inner[i].style.color = `rgb(${A.map((a, k) => Math.round(a + (B[k] - a) * t)).join(",")})`;
      });
      const n = clamp(Math.round(p / GAP), 0, STOPS.length - 1);
      if (n !== cur) {
        cur = n;
        pill.setAttribute("aria-valuenow", n);
        pill.setAttribute("aria-valuetext", `${STOPS[n]} millimetres`);
        if (!motionOff() && glass.animate) glass.animate([{ scale: "1" }, { scale: "1.045" }, { scale: "1" }], { duration: 140, easing: "cubic-bezier(.2,0,0,1)" });
      }
    };

    const stopAnim = () => { cancelAnimationFrame(raf); raf = 0; };
    // Underdamped spring: a hair of overshoot reads as a detent
    const springTo = (target, v0 = 0) => {
      stopAnim();
      if (motionOff()) { p = target; v = 0; render(); return; }
      v = v0;
      let last = performance.now();
      const K = 190, C = 2 * Math.sqrt(K) * 0.74;
      const tick = (now) => {
        const dt = Math.min(0.032, (now - last) / 1000); last = now;
        v += (-K * (p - target) - C * v) * dt; p += v * dt;
        if (Math.abs(p - target) < 0.12 && Math.abs(v) < 3) { p = target; v = 0; raf = 0; render(); return; }
        render(); raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const go = (i) => springTo(clamp(i, 0, STOPS.length - 1) * GAP, 0);
    const band = (x) => (x < 0 ? x * 0.25 : x > MAX ? MAX + (x - MAX) * 0.25 : x);

    const down = (e) => {
      if (e.button != null && e.button > 0) return;
      stopAnim();
      drag = { id: e.pointerId, x0: e.clientX, raw: p, p0: p, moved: false, s: [[performance.now(), p]] };
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = (e.clientX - drag.x0) / f.scale();
      if (Math.abs(dx) > 4 && !drag.moved) { drag.moved = true; c.classList.add("is-drag"); }
      if (!drag.moved) return;
      drag.raw = drag.p0 - dx; p = band(drag.raw);
      const now = performance.now();
      drag.s.push([now, drag.raw]); while (drag.s.length > 5) drag.s.shift();
      render();
    };
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null; c.classList.remove("is-drag");
      if (!d.moved) {
        if (e.type === "pointercancel") return;
        const r = c.getBoundingClientRect(), cx = (e.clientX - r.left) / f.scale();
        go(Math.round((p + (cx - CX)) / GAP)); return;
      }
      const a = d.s[0], b = d.s[d.s.length - 1];
      const vel = b[0] > a[0] ? ((b[1] - a[1]) / (b[0] - a[0])) * 1000 : 0;
      const vv = clamp(vel, -3000, 3000);
      springTo(clamp(Math.round((p + vv * 0.2) / GAP), 0, STOPS.length - 1) * GAP, vv);
    };
    const wheel = (e) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const dir = Math.sign(d) || 0;
      const target = clamp(cur + dir, 0, STOPS.length - 1);
      if (!dir || (target === cur && Math.abs(p - cur * GAP) < 1)) return; // let the page scroll at the ends
      e.preventDefault();
      acc += d; clearTimeout(accT); accT = setTimeout(() => { acc = 0; }, 160);
      if (Math.abs(acc) > 45) { acc = 0; go(cur + dir); }
    };
    const key = (e) => {
      const m = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (m) { e.preventDefault(); go(cur + m); }
      else if (e.key === "Home") { e.preventDefault(); go(0); }
      else if (e.key === "End") { e.preventDefault(); go(STOPS.length - 1); }
    };
    const zones = [pill, glass];
    zones.forEach((z) => {
      z.addEventListener("pointerdown", down); z.addEventListener("pointermove", move);
      z.addEventListener("pointerup", up); z.addEventListener("pointercancel", up);
      z.addEventListener("wheel", wheel, { passive: false });
    });
    pill.addEventListener("keydown", key);
    render();

    return () => {
      stopAnim(); clearTimeout(accT); f.stop();
      zones.forEach((z) => {
        z.removeEventListener("pointerdown", down); z.removeEventListener("pointermove", move);
        z.removeEventListener("pointerup", up); z.removeEventListener("pointercancel", up);
        z.removeEventListener("wheel", wheel);
      });
      pill.removeEventListener("keydown", key);
      c.remove();
    };
  };

  /* ───────── Workout summary ───────── */
  const BPM_PTS = [[1.1, 125], [1.5, 129], [1.9, 134], [2.0, 138], [2.1, 149], [2.2, 144], [2.7, 142], [3.0, 141], [3.2, 134], [3.5, 133], [3.7, 137], [4.1, 138], [4.3, 145], [4.5, 139], [4.9, 140], [5.0, 148], [5.15, 153], [5.4, 149], [5.6, 148], [5.9, 141], [6.2, 145], [6.5, 141], [6.8, 145], [7.0, 146], [7.3, 143], [7.6, 147], [7.9, 152], [8.3, 153], [8.5, 150], [8.7, 136], [9.0, 134], [9.2, 143], [9.4, 150], [9.9, 152], [10.1, 146], [10.2, 155], [10.45, 160], [10.6, 153], [10.9, 154], [11.3, 152], [11.6, 148], [11.9, 145], [12.2, 140], [12.4, 135], [12.6, 130], [12.8, 127], [13.0, 122], [13.1, 118]];
  const SAMPLES = (() => {
    const out = []; let k = 0;
    for (let m = 1.1; m <= 13.1001; m += 0.1) {
      while (k < BPM_PTS.length - 2 && BPM_PTS[k + 1][0] < m) k++;
      const [m0, b0] = BPM_PTS[k], [m1, b1] = BPM_PTS[k + 1];
      const t = clamp((m - m0) / (m1 - m0), 0, 1);
      const j = Math.sin(m * 37.1) * 1.6 + Math.sin(m * 11.3) * 0.9;
      out.push({ m, b: Math.round(b0 + (b1 - b0) * t + j) });
    }
    return out;
  })();
  const zoneCol = (b) => (b < 122 ? "#cfe3ee" : b < 138 ? "#7cc4f7" : b < 148.5 ? "#f7c141" : "#ee7e55");
  const ZONES = [
    { z: 0, w: 48, min: "0min", pct: "0%", sec: 0, name: "Rest", bpm: "below 120 bpm" },
    { z: 1, w: 99, min: "1min", pct: "13%", sec: 103, name: "Easy", bpm: "120–137 bpm" },
    { z: 2, w: 208, min: "5min", pct: "39%", sec: 309, name: "Moderate", bpm: "138–148 bpm" },
    { z: 3, w: 192, min: "4min", pct: "35%", sec: 277, name: "Hard", bpm: "149–159 bpm" },
    { z: 4, w: 52, min: "<1min", pct: "1%", sec: 8, name: "Peak", bpm: "160–170 bpm" },
    { z: 5, w: 44, min: "0min", pct: "0%", sec: 0, name: "Max", bpm: "171+ bpm" },
  ];
  const T = (x, y, cls, html) => `<span class="wk-t ${cls}" style="left:${x}px;top:${y}px">${html}</span>`;
  const ms = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  const px = (m) => 1 + 33.9 * m, py = (b) => 37 + (160 - b) * 3.6;

  const IC = {
    streak: '<svg width="44" height="40" viewBox="0 0 44 40" fill="currentColor"><path d="M22 6C27-1 42 0 43 14c1 12-11 20-21 25C12 34 0 26 1 14 2 0 17-1 22 6Z"/></svg>',
    well: '<svg width="44" height="40" viewBox="0 0 44 40" fill="currentColor"><circle cx="22" cy="8" r="8"/><path d="M1 21c8 4 14 3 21-2 7 5 13 6 21 2 0 12-9 18-21 18S1 33 1 21Z"/></svg>',
    ins: '<svg width="44" height="44" viewBox="0 0 44 44" fill="currentColor"><rect width="20" height="20" rx="7"/><rect x="24" width="20" height="20" rx="7"/><rect y="24" width="20" height="20" rx="7"/><rect x="24" y="24" width="20" height="20" rx="7"/></svg>',
    run: '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="19.5" cy="5.5" r="2.6" fill="currentColor" stroke="none"/><path d="M13 11l-4 6 6 3-3 8M14 11.5l6 2.5 3 4M9 25l-5 2.5"/></svg>',
  };

  D.workoutApp = function workoutApp(stage) {
    const c = document.createElement("div");
    c.className = "ix wk";
    const btns = [[258, 195, 10], [258, 293, 55], [258, 393, 105], [258, 522, 105], [938, 430, 164]].map(([x, y, h]) => `<span class="wk-btn" style="left:${x}px;top:${y}px;height:${h}px"></span>`).join("");
    const zoneRows = ZONES.map((z) => `<div class="wk-zone" data-z="${z.z}" role="button" tabindex="0" aria-pressed="false" aria-label="Zone ${z.z}, ${z.min}, ${z.pct}" style="top:${263 + 56.6 * z.z}px"><div class="wk-bar">${z.z}</div><div class="wk-zlab" style="left:${z.w + 10}px"><b>${z.min}</b><i>${z.pct}</i></div></div>`).join("");
    const gridV = [0, 2, 4, 6, 8, 10, 12].map((m) => `<line class="wk-xv" x1="${px(m)}" x2="${px(m)}" y1="0" y2="212"/><line class="wk-xtick" x1="${px(m)}" x2="${px(m)}" y1="212" y2="236"/>`).join("");
    const gridH = [160, 150, 140, 130, 120].map((b) => `<line class="wk-xh" x1="1" x2="502" y1="${py(b)}" y2="${py(b)}"/>`).join("");
    const xl = [2, 4, 6, 8, 10, 12].map((m) => `<text x="${px(m) + 14.5}" y="226" text-anchor="middle">${m}</text>`).join("");
    const dots = SAMPLES.map((s) => `<rect x="${(px(s.m) - 3).toFixed(1)}" y="${(py(s.b) - 3.5).toFixed(1)}" width="6" height="7" rx="3" fill="${zoneCol(s.b)}"/>`).join("");
    const gear = (d) => `<path d="${d}"/>`;
    c.innerHTML = `
      <div class="wk-body">${""}</div>${btns}
      <div class="wk-screen">
        <div class="wk-head"></div>
        <div class="wk-view" tabindex="0" aria-label="Workout summary, scrollable">
          <div class="wk-pane is-on" data-tab="workouts">
            ${T(33, 25, "", "Active Energy")}
            ${T(33, 66, "wk-big", 'AE<span class="wk-unit">kcal</span>').replace("AE", "109")}
            ${T(33, 130, "", "Avg Heart Rate")}${T(33, 172, "wk-big", '144<span class="wk-unit">bpm</span>')}
            ${T(305, 130, "", "Max Heart Rate")}${T(305, 172, "wk-big", '161<span class="wk-unit">bpm</span>')}
            ${T(33, 235, "", "Heart Rate Training Zones")}<span class="wk-info" style="left:280px;top:235px">i</span>
            ${zoneRows}
            ${T(33, 614, "wk-foot", "No heart rate detected for 1 minute (9%).")}
            <div class="wk-sec" style="top:671px">
              <button class="wk-chead" aria-expanded="true" aria-label="Charts"><span class="wk-t" style="left:33px;top:35px">Charts</span><svg class="wk-chev" viewBox="0 0 26 16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l11 11L24 2"/></svg></button>
              <div class="wk-cbody">
                ${T(33, 31, "", "Heart Rate")}<span class="wk-range" data-def="117–161 bpm">117–161 bpm</span>
                <svg class="wk-plot" viewBox="0 0 552 240" width="552" height="240" tabindex="0" role="slider" aria-label="Heart rate chart. Use left and right arrows to scrub" aria-valuemin="0" aria-valuemax="${SAMPLES.length - 1}" aria-valuenow="0">
                  ${gridH}${gridV}
                  <line class="wk-avg" x1="1" x2="502" y1="${py(144)}" y2="${py(144)}"/>
                  <g>${dots}</g>
                  <text x="543" y="${py(160) + 7}" text-anchor="end">160</text>
                  <text x="543" y="${py(144) + 7}" text-anchor="end" style="fill:#fde9be;font-weight:600">144</text>
                  <text x="543" y="${py(120) + 7}" text-anchor="end">120</text>
                  <text x="24" y="226" text-anchor="middle" style="fill:#4f4f4f">min</text>${xl}
                  <line class="wk-cross" x1="0" x2="0" y1="0" y2="212"/><circle class="wk-ring" r="7" cx="0" cy="0"/>
                </svg>
                <div class="wk-stats"><div class="wk-row">Duration<b>13:12</b></div><div class="wk-row">Started<b>08:27</b></div><div class="wk-row">Avg pace<b>5'12"/km</b></div></div>
              </div>
            </div>
          </div>
          <div class="wk-pane" data-tab="streak"><div class="wk-p2" style="top:24px;position:relative">
            <div class="wk-card"><h4>Current streak</h4><div class="n">12<small>days</small></div><div class="wk-days" role="group" aria-label="This week">${"MTWTFSS".split("").map((d, i) => `<button class="${i < 5 ? "is-on" : ""}" aria-pressed="${i < 5}">${d}</button>`).join("")}</div></div>
            <div class="wk-card"><h4>Best streak</h4><div class="n">31<small>days</small></div></div>
            <div class="wk-card"><h4>Rings closed this month</h4><div class="n">19<small>of 21</small></div></div>
          </div></div>
          <div class="wk-pane" data-tab="wellbeing"><div class="wk-p2" style="top:24px;position:relative">
            <div class="wk-card"><h4>Mindful minutes</h4><div class="n">18<small>min</small></div></div>
            <div class="wk-card"><h4>Sleep</h4><div class="n">7<small>h</small> 12<small>m</small></div></div>
            <div class="wk-card"><h4>Heart rate variability</h4><div class="n">48<small>ms</small></div></div>
          </div></div>
          <div class="wk-pane" data-tab="insights"><div class="wk-p2" style="top:24px;position:relative">
            <div class="wk-card"><h4>This week</h4><div class="n">412<small>kcal</small></div>
              <div class="wk-bars" role="group" aria-label="Daily active energy">${[40, 72, 0, 100, 55, 85, 30].map((h, i) => `<button class="${i === 3 ? "is-on" : ""}" style="height:${Math.max(8, h * 2)}px" aria-label="${"MTWTFSS"[i]} ${h * 4} kcal" data-k="${h * 4}"></button>`).join("")}</div>
              <div class="wk-bars-l">${"MTWTFSS".split("").map((d) => `<span>${d}</span>`).join("")}</div></div>
            <div class="wk-card"><h4>Selected day</h4><div class="n wk-sel">400<small>kcal</small></div></div>
          </div></div>
        </div>
        <div class="wk-notch"></div>
        <span class="wk-time">09:41</span>
        <svg class="wk-sig" width="110" height="20" viewBox="0 0 110 20" fill="#fff"><rect x="0" y="11" width="5" height="6" rx="1.5"/><rect x="8" y="8" width="5" height="9" rx="1.5"/><rect x="16" y="4" width="5" height="13" rx="1.5"/><rect x="24" y="0" width="5" height="17" rx="1.5"/>
          <g transform="translate(37 0)"><path d="M11 17.5 7.6 13.8a5 5 0 0 1 6.8 0L11 17.5Z"/><path d="M2.3 8.6a12.4 12.4 0 0 1 17.4 0l-2.2 2.4a9.2 9.2 0 0 0-13 0L2.3 8.6Z" /><path d="M-1.3 4.8a17.5 17.5 0 0 1 24.6 0L21 7.1a14.3 14.3 0 0 0-20 0L-1.3 4.8Z"/></g>
          <rect x="69" y="0" width="35" height="17" rx="5" fill="#fff"/><rect x="106" y="5" width="3" height="7" rx="1.5" opacity=".5"/></svg>
        <div class="wk-title" aria-live="polite">HIIT</div>
        <button class="wk-ib wk-back" style="left:-5px;top:78px" aria-label="Back"><svg width="20" height="34" viewBox="0 0 20 34" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3 3 17l13 14"/></svg></button>
        <button class="wk-ib wk-share" style="left:444px;top:78px" aria-label="Share"><svg width="36" height="40" viewBox="0 0 36 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 24V3M10 10l8-8 8 8M12 15H7a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3V18a3 3 0 0 0-3-3h-5"/></svg></button>
        <button class="wk-ib wk-more" style="left:533px;top:78px" aria-label="More"><svg width="40" height="10" viewBox="0 0 40 10" fill="currentColor"><circle cx="5" cy="5" r="3.8"/><circle cx="20" cy="5" r="3.8"/><circle cx="35" cy="5" r="3.8"/></svg></button>
        <div class="wk-tabbar" role="tablist" aria-label="Sections">
          <button class="wk-tab" role="tab" data-tab="streak" aria-selected="false" style="left:75px"><span class="wk-ic">${IC.streak}</span><span class="wk-lab">Streak</span></button>
          <button class="wk-tab" role="tab" data-tab="wellbeing" aria-selected="false" style="left:228px"><span class="wk-ic">${IC.well}</span><span class="wk-lab">Wellbeing</span></button>
          <button class="wk-tab is-on" role="tab" data-tab="workouts" aria-selected="true" style="left:381px"><span class="wk-ic"><span class="wk-sq">${IC.run}</span></span><span class="wk-lab">Workouts</span></button>
          <button class="wk-tab" role="tab" data-tab="insights" aria-selected="false" style="left:532px"><span class="wk-ic">${IC.ins}</span><span class="wk-lab">Insights</span></button>
        </div>
        <div class="wk-home"></div>
      </div>`;
    stage.appendChild(c);
    const f = fit(stage, c, 1200, 1533);
    const $ = (s) => c.querySelector(s), $$ = (s) => [...c.querySelectorAll(s)];
    const view = $(".wk-view"), title = $(".wk-title"), sec = $(".wk-sec"), chead = $(".wk-chead"), pane0 = $('.wk-pane[data-tab="workouts"]');
    const tabs = $$(".wk-tab"), zrows = $$(".wk-zone"), foot = $(".wk-foot");
    const plot = $(".wk-plot"), cross = $(".wk-cross"), ring = $(".wk-ring"), range = $(".wk-range");
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const reduced = motionOff;

    // zone bars
    let hover = null, pinned = null;
    const FOOT = foot.innerHTML;
    const paintZones = (animate) => {
      const sel = hover != null ? hover : pinned;
      zrows.forEach((row, i) => {
        const z = ZONES[i], on = sel === i;
        const w = animate === "zero" ? 0 : z.w + (on ? 18 : 0);
        row.classList.toggle("is-on", on);
        row.setAttribute("aria-pressed", String(pinned === i));
        row.querySelector(".wk-bar").style.width = `${w}px`;
        row.querySelector(".wk-zlab").style.left = `${w + 10}px`;
      });
      if (sel == null) { foot.innerHTML = FOOT; foot.style.color = ""; }
      else { const z = ZONES[sel]; foot.textContent = `Zone ${z.z} ${z.name}: ${z.sec ? ms(z.sec) : "0:00"} (${z.pct}), ${z.bpm}`; foot.style.color = "#fff"; }
    };
    const playBars = () => {
      if (reduced()) { paintZones(); return; }
      paintZones("zero");
      void c.offsetWidth;
      later(() => paintZones(), 40);
    };
    const ac = new AbortController(), sg = { signal: ac.signal };
    zrows.forEach((row, i) => {
      row.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hover = i; paintZones(); } }, sg);
      row.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hover = null; paintZones(); } }, sg);
      row.addEventListener("click", () => { pinned = pinned === i ? null : i; paintZones(); }, sg);
      row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pinned = pinned === i ? null : i; paintZones(); } }, sg);
    });
    later(playBars, 120);

    // charts collapse
    const SECTOP = 671, BODY = 560;
    pane0.style.transition = "height .45s cubic-bezier(.2,0,0,1)";
    const paneH = (open) => SECTOP + 70 + (open ? BODY : 0) + 30;
    pane0.style.height = `${paneH(true)}px`;
    chead.addEventListener("click", () => {
      const closed = sec.classList.toggle("is-closed");
      chead.setAttribute("aria-expanded", String(!closed));
      pane0.style.height = `${paneH(!closed)}px`;
    }, sg);

    // chart scrub
    let sIdx = -1, scrubT = 0;
    const show = (i) => {
      i = clamp(i, 0, SAMPLES.length - 1); sIdx = i;
      const s = SAMPLES[i], x = px(s.m), y = py(s.b);
      cross.setAttribute("x1", x); cross.setAttribute("x2", x);
      ring.setAttribute("cx", x); ring.setAttribute("cy", y);
      ring.style.stroke = zoneCol(s.b);
      plot.classList.add("is-scrub");
      plot.setAttribute("aria-valuenow", i);
      range.textContent = `${s.b} bpm at ${ms(s.m * 60)}`;
      plot.setAttribute("aria-valuetext", range.textContent);
    };
    const hide = () => { sIdx = -1; plot.classList.remove("is-scrub"); range.textContent = range.dataset.def; };
    const near = (e) => {
      const r = plot.getBoundingClientRect(), sx = ((e.clientX - r.left) / f.scale()) * (552 / (r.width / f.scale()));
      const m = (sx - 1) / 33.9;
      return clamp(Math.round((m - SAMPLES[0].m) / 0.1), 0, SAMPLES.length - 1);
    };
    plot.addEventListener("pointermove", (e) => { clearTimeout(scrubT); show(near(e)); }, sg);
    plot.addEventListener("pointerdown", (e) => { clearTimeout(scrubT); show(near(e)); }, sg);
    plot.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hide(); }, sg);
    plot.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") { scrubT = setTimeout(hide, 1200); timers.push(scrubT); } }, sg);
    plot.addEventListener("keydown", (e) => {
      const st = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowRight") { e.preventDefault(); show((sIdx < 0 ? -1 : sIdx) + st); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); show((sIdx < 0 ? SAMPLES.length : sIdx) - st); }
      else if (e.key === "Escape") hide();
    }, sg);
    plot.addEventListener("blur", hide, sg);

    // tabs
    const TITLES = { workouts: "HIIT", streak: "Streak", wellbeing: "Wellbeing", insights: "Insights" };
    const setTab = (name) => {
      tabs.forEach((t) => { const on = t.dataset.tab === name; t.classList.toggle("is-on", on); t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
      $$(".wk-pane").forEach((p) => p.classList.toggle("is-on", p.dataset.tab === name));
      title.textContent = TITLES[name];
      ["wk-back", "wk-share", "wk-more"].forEach((k) => $("." + k).classList.toggle("is-off", name !== "workouts"));
      view.scrollTop = 0;
      if (name === "workouts") playBars();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => setTab(t.dataset.tab), sg);
      t.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); setTab(n.dataset.tab);
      }, sg);
    });
    tabs.forEach((t) => { t.tabIndex = t.classList.contains("is-on") ? 0 : -1; });

    // small pane interactions
    $$(".wk-days button").forEach((b) => b.addEventListener("click", () => { const on = b.classList.toggle("is-on"); b.setAttribute("aria-pressed", String(on)); }, sg));
    const bars = $$(".wk-bars button"), sel = $(".wk-sel");
    bars.forEach((b) => b.addEventListener("click", () => { bars.forEach((x) => x.classList.toggle("is-on", x === b)); sel.innerHTML = `${b.dataset.k}<small>kcal</small>`; }, sg));
    ["wk-back", "wk-share", "wk-more"].forEach((k) => $("." + k).addEventListener("click", (e) => e.preventDefault(), sg));

    return () => {
      ac.abort(); timers.forEach(clearTimeout); f.stop(); c.remove();
    };
  };
})();
