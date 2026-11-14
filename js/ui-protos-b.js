// UI prototypes B: balanceChart and timelineChart, rebuilt as live HTML/CSS/SVG from the original shots.
// Each demo is built at the pixel size of its source image and scaled to fit the stage.
(() => {
  if (!window.Playground || !window.Playground.DEMOS) return;
  const D = window.Playground.DEMOS;
  const motionOff = () => (window.motionReduced ? window.motionReduced() : matchMedia("(prefers-reduced-motion: reduce)").matches);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // Scale a W x H design to its stage; returns the live scale getter
  function fitTo(stage, node, W, H) {
    let s = 1;
    const apply = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      s = Math.min(w / W, h / H);
      node.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(stage);
    apply();
    return { scale: () => s, stop: () => ro.disconnect() };
  }

  // ───────────────────────── Balance chart (1199 x 872) ─────────────────────────
  function balanceChart(stage) {
    const W = 1199, H = 872, N = 48, X0 = 168, X1 = 1031, Y0 = 553, YA = 572, STEP = (X1 - X0) / (N - 1);
    const SER = [
      { k: "eth", n: "ETH", c: "#EC9A3C", d: "#F39C3C" },
      { k: "avax", n: "AVAX", c: "#7C8FF7", d: "#9A88FF" },
      { k: "ada", n: "ADA", c: "#5DCDBB", d: "#5FCDB5" },
      { k: "matic", n: "MATIC", c: "#4CA6E9", d: "#4FA3E8" },
      { k: "usdt", n: "USDT", c: "#E5521A", d: "#EB4F12" },
    ];
    const ORDER = [4, 2, 3, 1, 0]; // bottom to top
    const K = 169177.8 / 68; // pixels of stack height to dollars
    const xs = Array.from({ length: N }, (_, i) => X0 + i * STEP);

    // 7d keyframes (x in image px -> total stack height in px), read off the shot
    const TOT = [[168, 17], [207, 12], [232, 22], [290, 16], [345, 26], [400, 15], [435, 22], [462, 38], [500, 42], [527, 80], [575, 103], [610, 115], [655, 110], [715, 108], [740, 96], [760, 76], [800, 67], [825, 56], [885, 57], [945, 72], [980, 68], [1031, 68]];
    const FR = [[168, [.30, .15, .25, .30]], [240, [.11, .33, .39, .17]], [340, [.10, .30, .38, .22]], [555, [.13, .27, .36, .24]], [640, [.12, .27, .37, .24]], [740, [.11, .30, .36, .23]], [815, [.10, .38, .34, .18]], [900, [.09, .40, .34, .17]], [1031, [.09, .42, .33, .16]]];
    const lerpAt = (keys, x) => {
      if (x <= keys[0][0]) return keys[0][1];
      for (let j = 1; j < keys.length; j++) if (x <= keys[j][0]) { const a = keys[j - 1], b = keys[j], t = (x - a[0]) / (b[0] - a[0]); return Array.isArray(a[1]) ? a[1].map((v, q) => v + (b[1][q] - v) * t) : a[1] + (b[1] - a[1]) * t; }
      return keys[keys.length - 1][1];
    };
    function build(range) {
      const out = { eth: [], avax: [], ada: [], matic: [], usdt: [] };
      const rnd = mulberry(range === "7d" ? 7 : range === "24h" ? 24 : 30);
      let tot;
      if (range === "7d") tot = xs.map((x) => lerpAt(TOT, x));
      else {
        const kp = range === "24h" ? 9 : 14, lo = range === "24h" ? 52 : 30, hi = range === "24h" ? 100 : 124;
        const keys = Array.from({ length: kp }, (_, j) => [X0 + (j / (kp - 1)) * (X1 - X0), lo + rnd() * (hi - lo)]);
        keys[kp - 1][1] = 68; keys[kp - 2][1] = 68 + (rnd() - 0.5) * 14;
        tot = xs.map((x) => lerpAt(keys, x) + (rnd() - 0.5) * (range === "24h" ? 4 : 9));
      }
      xs.forEach((x, i) => {
        let f = lerpAt(FR, range === "7d" ? x : X0 + ((x - X0) * 0.82 + 60 + (range === "30d" ? 90 : 0)) % (X1 - X0));
        if (range !== "7d") f = f.map((v) => Math.max(0.04, v + (rnd() - 0.5) * 0.06));
        const sum = f.reduce((a, b) => a + b, 0);
        const t = Math.max(6, tot[i]);
        out.eth.push(t * f[0] / sum); out.avax.push(t * f[1] / sum); out.ada.push(t * f[2] / sum); out.usdt.push(t * f[3] / sum);
        out.matic.push(t * 0.1 * (0.8 + 0.4 * Math.sin(i * 0.7 + range.length)));
      });
      return out;
    }
    const DATA = { "7d": build("7d"), "24h": build("24h"), "30d": build("30d") };
    const DAYS = {
      "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "24h": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"],
      "30d": ["Oct 15", "Oct 20", "Oct 25", "Oct 30", "Nov 4", "Nov 9", "Nov 14"],
    };
    const WK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const timeLabel = (range, f) => {
      if (range === "24h") { const m = Math.round(f * 24 * 60); return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; }
      if (range === "30d") { const d = Math.round(f * 30); const dt = new Date(2026, 9, 15 + d); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
      const t = f * 7, di = Math.min(6, Math.floor(t)), hr = Math.round((t - di) * 24);
      return `${WK[di]} ${String(Math.min(hr, 23)).padStart(2, "0")}:00`;
    };

    // Marker data in image coordinates
    const MK = [
      { x: 290, av: [0, 1], dot: "eth", fill: 1, rings: ["ada"], who: "0x4f2…a91e", txt: "Swapped USDT for ETH" },
      { x: 435, av: [2], dot: "eth", fill: 1, rings: [], who: "vitalik.eth", txt: "Added ETH to position" },
      { x: 482, av: [3], dot: "eth", fill: 0, rings: [], who: "0x91c…03bd", txt: "Closed an ETH position" },
      { x: 575, av: [4], dot: "eth", fill: 1, rings: ["ada"], who: "degen.lens", txt: "Bought ETH, staked ADA" },
      { x: 688, av: [5], dot: "avax", fill: 1, rings: ["ada", "eth"], who: "0xa7e…77f0", txt: "Rotated into AVAX" },
    ];
    const EV = [{ x: 336, t: 0, c: "#F39C3C" }, { x: 566, t: 1, c: "#F39C3C" }, { x: 581, t: 0, c: "#A9B1FF" }, { x: 621, t: 1, c: "#9A88FF" }, { x: 722, t: 1, c: "#5FCDB5" }, { x: 742, t: 1, c: "#5FCDB5" }];
    const colOf = (k) => (SER.find((s) => s.k === k) || SER[0]).d;
    const avatar = (v, cx, front) => {
      const bgs = ["#3a3a3a", "#e7e7e7", "#b4b4b4", "#cdcdcd", "#f2f2f2", "#d8d8d8"];
      const ink = v === 0 ? "#8e8e8e" : "#161616";
      const glyph = [
        `<circle cx="11" cy="9" r="4.6" fill="${ink}"/><path d="M3 22c0-5 3.6-7 8-7s8 2 8 7Z" fill="${ink}"/>`,
        `<rect x="5.5" y="5" width="11" height="10" rx="2" fill="${ink}"/><rect x="8" y="8.5" width="2" height="2" fill="#e7e7e7"/><rect x="12" y="8.5" width="2" height="2" fill="#e7e7e7"/><rect x="8" y="12" width="6" height="1.4" fill="#e7e7e7"/><rect x="3" y="17" width="16" height="5" fill="${ink}"/>`,
        `<path d="M4 11c0-6 3-8 7-8s7 2 7 8v3H4Z" fill="${ink}"/><rect x="7" y="9.5" width="8" height="7" rx="3" fill="#b4b4b4"/><circle cx="9" cy="12" r=".9" fill="${ink}"/><circle cx="13" cy="12" r=".9" fill="${ink}"/><path d="M3 22c0-3 3-4 8-4s8 1 8 4Z" fill="${ink}"/>`,
        `<circle cx="11" cy="10" r="6" fill="none" stroke="${ink}" stroke-width="1.6"/><circle cx="8.7" cy="9.5" r="1" fill="${ink}"/><circle cx="13.3" cy="9.5" r="1" fill="${ink}"/><path d="M8 13c1.8 1.4 4.2 1.4 6 0" stroke="${ink}" fill="none" stroke-width="1.2"/><path d="M3 22c0-3 3-4 8-4s8 1 8 4Z" fill="${ink}"/>`,
        `<circle cx="11" cy="11" r="7" fill="#fff" stroke="${ink}" stroke-width="1.4"/><circle cx="11" cy="11" r="1.6" fill="${ink}"/><circle cx="7.6" cy="9" r="1.1" fill="${ink}"/><circle cx="14.4" cy="9" r="1.1" fill="${ink}"/><path d="M6.5 14c2.8 3 6.2 3 9 0" stroke="${ink}" fill="none" stroke-width="1.4"/>`,
        `<rect x="5" y="3" width="12" height="6" fill="${ink}"/><rect x="6.5" y="8" width="9" height="8" rx="2" fill="#d8d8d8" stroke="${ink}" stroke-width="1.2"/><rect x="8.5" y="11" width="1.6" height="1.6" fill="${ink}"/><rect x="12" y="11" width="1.6" height="1.6" fill="${ink}"/><path d="M3 22c0-3 3-4 8-4s8 1 8 4Z" fill="${ink}"/>`,
      ][v];
      return `<g transform="translate(${cx - 11} 342)"><g class="bc-av"><rect width="22" height="22" rx="5.5" fill="${bgs[v]}" ${front ? 'stroke="#141414" stroke-width="1"' : ""}/><clipPath id="bcav${v}${front ? "f" : "b"}"><rect width="22" height="22" rx="5.5"/></clipPath><g clip-path="url(#bcav${v}${front ? "f" : "b"})">${glyph}</g></g></g>`;
    };

    const root = el("div", "ix ix-bc");
    root.style.width = W + "px"; root.style.height = H + "px";
    const mkSvg = MK.map((m, mi) => {
      const avs = m.av.length === 2 ? avatar(m.av[0], m.x - 9, false) + avatar(m.av[1], m.x + 7, true) : avatar(m.av[0], m.x, true);
      const rings = m.rings.map((r, ri) => `<circle cx="${m.x}" cy="${381 + ri * 5.5}" r="2.6" fill="none" stroke="${colOf(r)}" stroke-width="1.2"/>`).join("");
      const dot = m.fill ? `<circle cx="${m.x}" cy="374" r="3.2" fill="${colOf(m.dot)}"/>` : `<circle cx="${m.x}" cy="374" r="3" fill="#0e0e0e" stroke="${colOf(m.dot)}" stroke-width="1.4"/>`;
      return `<g class="bc-mk" data-i="${mi}"><line class="bc-ml" x1="${m.x}" x2="${m.x}" y1="${m.rings.length ? 384 + (m.rings.length - 1) * 5.5 : 380}" y2="${Y0}"/>${avs}${dot}${rings}<rect class="bc-mh" x="${m.x - 18}" y="338" width="36" height="52" tabindex="0" role="button" aria-label="${m.who}: ${m.txt}"/></g>`;
    }).join("");
    const dayTicks = Array.from({ length: 7 }, (_, k) => { const x = X0 + (k * (X1 - X0)) / 6; return `<line x1="${x}" x2="${x}" y1="567" y2="577"/>`; }).join("");
    const evTicks = MK.map((m) => `<line x1="${m.x}" x2="${m.x}" y1="569.500" y2="574.500"/>`).join("");
    const evDots = EV.map((e) => (e.t ? `<circle cx="${e.x}" cy="${YA}" r="5.500" fill="${e.c}"/>` : `<circle cx="${e.x}" cy="${YA}" r="4.600" fill="#0e0e0e" stroke="${e.c}" stroke-width="1.8"/>`)).join("");
    root.innerHTML = `
      <div class="bc-card"></div>
      <div class="bc-lbl">Balance</div>
      <div class="bc-amt" aria-live="off"><span class="bc-cur">$</span><span class="bc-num">169,177.80</span></div>
      <div class="bc-delta"><span class="bc-pct">-18.28%</span><i>·</i><span class="bc-per">24h</span></div>
      <div class="bc-seg" role="radiogroup" aria-label="Time range">${["24h", "7d", "30d"].map((r) => `<button type="button" role="radio" data-r="${r}" aria-checked="${r === "7d"}" class="${r === "7d" ? "is-on" : ""}">${r}</button>`).join("")}</div>
      <div class="bc-hit" tabindex="0" role="slider" aria-label="Balance over time. Use left and right arrow keys to scrub." aria-valuemin="0" aria-valuemax="${N - 1}" aria-valuenow="${N - 1}"></div>
      <svg class="bc-svg" viewBox="148 330 903 260" width="903" height="260" aria-hidden="false">
        <defs><clipPath id="bc-clip"><rect x="148" y="330" width="903" height="${Y0 - 330}"/></clipPath></defs>
        <g class="bc-under">${MK.map((m, mi) => `<line data-i="${mi}" x1="${m.x}" x2="${m.x}" y1="384" y2="${Y0}"/>`).join("")}</g>
        <g class="bc-halo" clip-path="url(#bc-clip)"><path d="" fill="none" stroke="#212121" stroke-width="20" stroke-linejoin="round"/></g>
        <g class="bc-areas">${ORDER.map((s) => `<path data-s="${s}" fill="${SER[s].c}"/>`).join("")}</g>
        <g class="bc-axis"><line x1="${X0}" x2="${X1}" y1="${YA}" y2="${YA}" stroke="#1d1d1d"/><g stroke="#2d2d2d">${dayTicks}</g><g stroke="#262626">${evTicks}</g>${evDots}</g>
        <g class="bc-mks">${mkSvg}</g>
        <g class="bc-xh" opacity="0"><line y1="384" y2="${YA}"/>${SER.map((s) => `<circle r="3.200" fill="${s.c}" stroke="#0e0e0e" stroke-width="1.500"/>`).join("")}</g>
      </svg>
      <div class="bc-days">${DAYS["7d"].map((d, k) => `<span class="bc-day" style="left:${X0 + (k * (X1 - X0)) / 6}px">${d}</span>`).join("")}</div>
      <div class="bc-tip" aria-hidden="true"></div>
      <div class="bc-chips" role="group" aria-label="Tokens">${SER.map((s) => `<button type="button" class="bc-chip" data-k="${s.k}" aria-pressed="false"><i style="background:${s.d}"></i><span>${s.n}</span><b aria-hidden="true"><svg viewBox="0 0 8 8" width="8" height="8"><path d="M1 1l6 6M7 1 1 7" stroke="currentColor" stroke-width="1.200" stroke-linecap="round"/></svg></b></button>`).join("")}</div>
      <div class="bc-follow"><span>Show following</span><button type="button" class="bc-sw is-on" role="switch" aria-checked="true" aria-label="Show following"><i></i></button></div>`;
    stage.appendChild(root);
    const fit = fitTo(stage, root, W, H);
    const $ = (s) => root.querySelector(s);
    const svg = $(".bc-svg"), hit = $(".bc-hit"), tip = $(".bc-tip"), num = $(".bc-num"), pct = $(".bc-pct"), per = $(".bc-per");
    const areaEls = ORDER.map((s) => svg.querySelector(`.bc-areas [data-s="${s}"]`));
    const halo = svg.querySelector(".bc-halo path"), xh = svg.querySelector(".bc-xh"), xhLine = xh.querySelector("line"), xhDots = [...xh.querySelectorAll("circle")];
    const chips = [...root.querySelectorAll(".bc-chip")], dayEls = [...root.querySelectorAll(".bc-day")];
    const segBtns = [...root.querySelectorAll(".bc-seg button")];
    const sw = $(".bc-sw");

    // state
    let range = "7d";
    let cur = SER.map((s) => DATA[range][s.k].slice());
    let from = cur.map((a) => a.slice()), to = cur.map((a) => a.slice()), t0 = 0, dur = 0;
    const on = { eth: 1, avax: 1, ada: 1, matic: 0, usdt: 1 };
    const xbtn = { eth: 1, avax: 1, ada: 1, matic: 0, usdt: 0 };
    const vis = SER.map((s) => on[s.k]), visT = vis.slice();
    let hover = -1, hoverMk = -1, hoverF = 0, dispVal = 169177.8, tgtVal = 169177.8, raf = 0, last = 0, following = true;
    const stackAt = (f) => { // heights per series at fractional index f
      const i = clamp(Math.floor(f), 0, N - 2), t = f - i;
      return SER.map((s, q) => (cur[q][i] + (cur[q][i + 1] - cur[q][i]) * t) * vis[q]);
    };
    const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalAt = (f) => stackAt(f).reduce((a, b) => a + b, 0);

    function paint() {
      const L = new Array(N).fill(0);
      const tops = new Array(N).fill(0);
      ORDER.forEach((s, oi) => {
        const path = areaEls[oi];
        if (vis[s] < 0.004) { path.setAttribute("d", ""); return; }
        let up = "", dn = "";
        for (let i = 0; i < N; i++) {
          const lo = L[i], hi = lo + cur[s][i] * vis[s];
          up += `${i ? "L" : "M"}${xs[i].toFixed(1)} ${(Y0 - hi).toFixed(1)}`;
          dn = `L${xs[i].toFixed(1)} ${(Y0 - lo).toFixed(1)}` + dn;
          L[i] = hi; tops[i] = hi;
        }
        path.setAttribute("d", up + dn + "Z");
      });
      let hp = "";
      for (let i = 0; i < N; i++) hp += `${i ? "L" : "M"}${xs[i].toFixed(1)} ${(Y0 - L[i]).toFixed(1)}`;
      halo.setAttribute("d", hp);
      updateReadout();
    }
    function updateReadout() {
      if (hover >= 0) {
        const f = hoverF, x = X0 + f * STEP, sts = stackAt(f), total = sts.reduce((a, b) => a + b, 0);
        xh.setAttribute("opacity", "1");
        xhLine.setAttribute("x1", x); xhLine.setAttribute("x2", x); xhLine.setAttribute("y1", Y0 - total - 14);
        let acc = 0;
        ORDER.forEach((s) => { acc += sts[s]; xhDots[s].setAttribute("cx", x); xhDots[s].setAttribute("cy", Y0 - acc); xhDots[s].style.opacity = vis[s] > 0.05 ? 1 : 0; });
        tgtVal = total * K;
      } else { xh.setAttribute("opacity", "0"); tgtVal = totalAt(N - 1) * K; }
    }
    function writeNum() {
      num.textContent = fmt(dispVal);
      if (hover >= 0) {
        const t0v = totalAt(0) * K, ch = t0v > 0 ? ((dispVal - t0v) / t0v) * 100 : 0;
        pct.textContent = `${ch >= 0 ? "+" : "-"}${Math.abs(ch).toFixed(2)}%`; pct.className = "bc-pct " + (ch >= 0 ? "is-up" : "");
        per.textContent = timeLabel(range, hoverF / (N - 1));
      } else { pct.textContent = "-18.28%"; pct.className = "bc-pct"; per.textContent = "24h"; }
    }
    function tipFill() {
      if (hover < 0 && hoverMk < 0) { tip.classList.remove("is-on"); return; }
      let x, html, flip;
      if (hoverMk >= 0) {
        const m = MK[hoverMk]; x = m.x;
        html = `<div class="bc-th"><span class="bc-tav"></span>${m.who}</div><div class="bc-tr">${m.txt}</div>`;
        tip.style.top = "286px";
      } else {
        x = X0 + hoverF * STEP;
        const sts = stackAt(hoverF);
        html = `<div class="bc-th">${timeLabel(range, hoverF / (N - 1))}</div>` + [0, 1, 3, 2, 4].filter((s) => vis[s] > 0.05).map((s) => `<div class="bc-tr"><i style="background:${SER[s].d}"></i>${SER[s].n}<b>$${Math.round(sts[s] * K).toLocaleString("en-US")}</b></div>`).join("");
        tip.style.top = "388px";
      }
      tip.innerHTML = html;
      flip = x > 800;
      tip.style.left = (flip ? x - 14 - tip.offsetWidth : x + 14) + "px";
      tip.classList.add("is-on");
    }
    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      let busy = false;
      if (dur > 0) {
        const p = clamp((now - t0) / dur, 0, 1), e = ease(p);
        for (let q = 0; q < cur.length; q++) for (let i = 0; i < N; i++) cur[q][i] = from[q][i] + (to[q][i] - from[q][i]) * e;
        if (p < 1) busy = true; else dur = 0;
      }
      for (let q = 0; q < vis.length; q++) {
        const d = visT[q] - vis[q];
        if (Math.abs(d) > 0.002) { vis[q] += d * (1 - Math.exp(-dt * 10)); busy = true; } else vis[q] = visT[q];
      }
      paint();
      const dv = tgtVal - dispVal;
      if (Math.abs(dv) > 0.5) { dispVal += dv * (1 - Math.exp(-dt * 16)); busy = true; } else dispVal = tgtVal;
      writeNum();
      if (hover >= 0 || hoverMk >= 0) tipFill();
      if (busy) kick();
    }
    function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    function setRange(r) {
      if (r === range) return;
      range = r;
      segBtns.forEach((b) => { const o = b.dataset.r === r; b.classList.toggle("is-on", o); b.setAttribute("aria-checked", o); });
      from = cur.map((a) => a.slice());
      to = SER.map((s) => DATA[r][s.k].slice());
      t0 = performance.now(); dur = motionOff() ? 0 : 700;
      if (!dur) cur = to.map((a) => a.slice());
      dayEls.forEach((d, k) => { d.textContent = DAYS[r][k]; d.classList.remove("is-swap"); void d.offsetWidth; d.classList.add("is-swap"); });
      kick(); paint(); writeNum();
    }
    segBtns.forEach((b) => b.addEventListener("click", () => setRange(b.dataset.r)));
    const onSegKey = (e) => {
      const i = segBtns.findIndex((b) => b.classList.contains("is-on")), d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return; e.preventDefault(); const nb = segBtns[clamp(i + d, 0, 2)]; setRange(nb.dataset.r); nb.focus();
    };
    $(".bc-seg").addEventListener("keydown", onSegKey);

    // chips
    function syncChips() {
      chips.forEach((c) => {
        const k = c.dataset.k;
        c.classList.toggle("is-off", !on[k]); c.classList.toggle("has-x", !!xbtn[k] && !!on[k]);
        c.setAttribute("aria-pressed", !!on[k]);
        c.setAttribute("aria-label", `${on[k] ? "Hide" : "Show"} ${k.toUpperCase()}`);
      });
    }
    chips.forEach((c) => c.addEventListener("click", () => {
      const k = c.dataset.k, q = SER.findIndex((s) => s.k === k);
      on[k] = on[k] ? 0 : 1; if (on[k]) xbtn[k] = 1;
      if (motionOff()) vis[q] = on[k];
      visT[q] = on[k]; syncChips(); kick(); paint(); writeNum();
    }));
    syncChips();

    // follow toggle
    sw.addEventListener("click", () => {
      following = !following; sw.classList.toggle("is-on", following); sw.setAttribute("aria-checked", following);
      root.classList.toggle("is-nofollow", !following);
      if (!following) { hoverMk = -1; tipFill(); }
      svg.querySelectorAll(".bc-mh").forEach((r) => r.setAttribute("tabindex", following ? "0" : "-1"));
    });

    // scrub
    const fFrom = (e) => { const r = svg.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 903 + 148; return clamp((x - X0) / STEP, 0, N - 1); };
    const move = (e) => { hover = 1; hoverF = fFrom(e); hit.setAttribute("aria-valuenow", Math.round(hoverF)); tgtVal = totalAt(hoverF) * K; if (hoverMk < 0) tipFill(); kick(); updateReadout(); writeNum(); };
    const leave = () => { hover = -1; hoverMk = -1; tipFill(); kick(); updateReadout(); writeNum(); };
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerdown", move);
    hit.addEventListener("pointerleave", leave);
    hit.addEventListener("blur", leave);
    hit.addEventListener("keydown", (e) => {
      const st = e.shiftKey ? 4 : 1;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault(); hoverF = clamp((hover < 0 ? N - 1 : Math.round(hoverF)) + (e.key === "ArrowRight" ? st : -st), 0, N - 1); hover = 1;
      } else if (e.key === "Home") { hoverF = 0; hover = 1; } else if (e.key === "End") { hoverF = N - 1; hover = 1; } else if (e.key === "Escape") { leave(); return; } else return;
      e.preventDefault(); hit.setAttribute("aria-valuenow", Math.round(hoverF)); tipFill(); kick(); updateReadout(); writeNum();
    });
    // marker hover
    const mks = [...svg.querySelectorAll(".bc-mk")];
    const cleanMk = [];
    mks.forEach((g, i) => {
      const h2 = g.querySelector(".bc-mh");
      const enter = () => { if (!following) return; hoverMk = i; hover = -1; g.classList.add("is-hot"); svg.querySelector(`.bc-under [data-i="${i}"]`).classList.add("is-hot"); xh.setAttribute("opacity", "0"); tgtVal = totalAt(N - 1) * K; tipFill(); kick(); };
      const out = () => { g.classList.remove("is-hot"); svg.querySelector(`.bc-under [data-i="${i}"]`).classList.remove("is-hot"); if (hoverMk === i) { hoverMk = -1; tipFill(); } };
      h2.addEventListener("pointerenter", enter); h2.addEventListener("pointerleave", out);
      h2.addEventListener("focus", enter); h2.addEventListener("blur", out);
      cleanMk.push(() => { h2.removeEventListener("pointerenter", enter); h2.removeEventListener("pointerleave", out); h2.removeEventListener("focus", enter); h2.removeEventListener("blur", out); });
    });

    paint(); writeNum();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      cleanMk.forEach((f) => f());
      hit.removeEventListener("pointermove", move); hit.removeEventListener("pointerdown", move); hit.removeEventListener("pointerleave", leave); hit.removeEventListener("blur", leave);
      fit.stop();
      root.remove();
    };
  }

  // ───────────────────────── Timeline chart (736 x 832) ─────────────────────────
  // Traced from the shot: line y at 6px steps, starting at x=150 (chart 1 centre y 361, chart 2 centre y 559)
  const TR1 = [375, 365, 355, 346, 346, 351, 351, 382, 382, 376, 373, 371, 375, 380, 380, 380, 373, 373, 373, 378, 382, 383, 383, 382, 382, 381, 381, 379, 379, 370, 365, 360, 356, 352, 349, 345, 342, 341, 344, 347, 347, 353, 353, 353, 348, 348, 345, 343, 343, 345, 346, 346, 347, 348, 348, 364, 371, 367, 367, 360, 356, 357, 357, 370, 370, 370, 375, 376, 376, 376, 368, 368, 368, 368, 368, 358, 358, 361, 365, 365, 371, 372, 369, 355, 355, 355, 355, 351, 343, 343, 343, 342, 342, 335, 335, 335, 335, 333].map((y) => y - 361);
  const TR2 = [553, 550, 550, 550, 550, 550, 550, 555, 555, 555, 548, 548, 548, 552, 556, 560, 552, 552, 552, 555, 556, 557, 553, 553, 546, 546, 546, 546, 546, 546, 546, 546, 546, 546, 546, 546, 546, 548, 553, 553, 553, 552, 552, 550, 550, 550, 550, 550, 550, 550, 550, 550, 550, 550, 550, 555, 561, 561, 561, 564, 565, 565, 565, 565, 565, 565, 565, 565, 565, 561, 561, 556, 556, 549, 549, 549, 549, 549, 546, 548, 550, 551, 549, 547, 547, 547, 547, 547, 547, 549, 551, 550, 549, 549, 546, 546, 546, 546].map((y) => y - 559);
  let tcUid = 0;

  function timelineChart(stage) {
    const W = 736, H = 832, X0 = 149, VW = W - X0, DAY = 172, HALF = 86, PX = 6, BAND = 28, UNIT = 14;
    const uid = ++tcUid;
    const hash = (n, s) => { const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
    const vnoise = (x, s) => { const i = Math.floor(x), t = x - i; return hash(i, s) * (1 - t) + hash(i + 1, s) * t; };
    const proc = (i, s) => clamp(11 * vnoise(i / 5, s) + 5 * vnoise(i / 1.7, s + 7) + 3 * vnoise(i / 22, s + 3) * 2 - 1, -24, 22);
    const CH = [
      { top: 259, h: 137, bandTop: 88, c: 102, tr: TR1, seed: 3, fill: "#F97FDF" },
      { top: 458, h: 137, bandTop: 87, c: 101, tr: TR2, seed: 11, fill: "#E5FB05" },
    ];
    // value offset (px, negative = up) for any sample index, extended procedurally either side of the traced window
    const val = (ch, i) => {
      const n = ch.tr.length;
      if (i >= 0 && i < n) return ch.tr[i];
      if (i >= n) { const w = clamp((i - (n - 1)) / 8, 0, 1); return ch.tr[n - 1] * (1 - w) + proc(i, ch.seed) * w; }
      const w = clamp(-i / 8, 0, 1); return ch.tr[0] * (1 - w) + proc(i, ch.seed) * w;
    };
    const NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = (k) => NAMES[(((k + 5) % 6) + 6) % 6];

    const root = el("div", "ix ix-tc");
    root.style.width = W + "px"; root.style.height = H + "px";
    const boxHtml = CH.map((ch, ci) => `<div class="tc-box" data-c="${ci}" style="top:${ch.top}px;height:${ch.h}px"><svg width="${VW}" height="${ch.h}" viewBox="0 0 ${VW} ${ch.h}" aria-hidden="true">
        <defs><clipPath id="tc${uid}a${ci}"><rect x="0" y="0" width="${VW}" height="${ch.bandTop}"/></clipPath><clipPath id="tc${uid}b${ci}"><rect x="0" y="${ch.bandTop + BAND}" width="${VW}" height="${ch.h}"/></clipPath></defs>
        <rect class="tc-band" x="0" y="${ch.bandTop}" width="${VW}" height="${BAND}"/>
        <path class="tc-lines"/>
        <path class="tc-fa" fill="${ch.fill}" clip-path="url(#tc${uid}a${ci})"/><path class="tc-fb" fill="${ch.fill}" clip-path="url(#tc${uid}b${ci})"/>
        <path class="tc-ln" fill="none"/>
        <g class="tc-xd" opacity="0"><circle r="3.500"/></g>
      </svg></div>`).join("");
    root.innerHTML = `<div class="tc-bg"></div><div class="tc-panel"></div>${boxHtml}
      <div class="tc-lay"><div class="tc-hd"></div><div class="tc-ax"></div></div>
      <div class="tc-xh"></div>
      <div class="tc-rd" aria-hidden="true"></div>
      <div class="tc-hit" tabindex="0" role="group" aria-label="Timeline. Drag, swipe, scroll sideways or use the arrow keys to pan. Hover to read values."></div>`;
    stage.appendChild(root);
    const fit = fitTo(stage, root, W, H);
    const $ = (s) => root.querySelector(s);
    const hit = $(".tc-hit"), xh = $(".tc-xh"), rd = $(".tc-rd"), hd = $(".tc-hd"), ax = $(".tc-ax");
    const boxes = [...root.querySelectorAll(".tc-box")].map((b, ci) => ({ ch: CH[ci], svg: b.querySelector("svg"), lines: b.querySelector(".tc-lines"), fa: b.querySelector(".tc-fa"), fb: b.querySelector(".tc-fb"), ln: b.querySelector(".tc-ln"), xd: b.querySelector(".tc-xd") }));
    // pools
    const hdrs = Array.from({ length: 6 }, () => hd.appendChild(el("span", "tc-day")));
    const ticks = Array.from({ length: 10 }, () => ax.appendChild(el("span", "tc-tk", '<i class="tc-l1"></i><b class="tc-lb"></b><i class="tc-l2"></i>')));
    const tkCache = ticks.map(() => ({ m: null, t: null })), hdCache = hdrs.map(() => null);

    let scroll = 0, vel = 0, tgt = null, dragging = false, raf = 0, last = 0, hx = null; // hx: screen x of hover (root px)
    let lastX = 0, lastT = 0, pid = null;

    const timeText = (cx) => {
      const k = Math.floor(cx / DAY), hrs = ((cx - k * DAY) / DAY) * 24, m = Math.round(hrs * 60), hh = Math.floor(m / 60) % 24, mm = m % 60;
      const ap = hh >= 12 ? "pm" : "am", h12 = hh % 12 === 0 ? 12 : hh % 12;
      return `${dayName(k).slice(0, 3)} ${h12}:${String(mm).padStart(2, "0")}${ap}`;
    };
    const valAt = (ch, cx) => { const f = cx / PX, i = Math.floor(f), t = f - i; return val(ch, i) * (1 - t) + val(ch, i + 1) * t; };

    function draw() {
      // charts
      const i0 = Math.floor(scroll / PX) - 1, i1 = Math.ceil((scroll + VW) / PX) + 1;
      boxes.forEach(({ ch, lines, fa, fb, ln, svg }) => {
        let p = "";
        for (let i = i0; i <= i1; i++) p += `${i === i0 ? "M" : "L"}${(i * PX - scroll).toFixed(1)} ${(ch.c + val(ch, i)).toFixed(1)}`;
        const xa = (i0 * PX - scroll).toFixed(1), xb = (i1 * PX - scroll).toFixed(1);
        ln.setAttribute("d", p);
        fa.setAttribute("d", `${p}L${xb} ${ch.bandTop}L${xa} ${ch.bandTop}Z`);
        fb.setAttribute("d", `${p}L${xb} ${ch.bandTop + BAND}L${xa} ${ch.bandTop + BAND}Z`);
        let l = "";
        for (let k = Math.ceil(scroll / DAY); k * DAY - scroll < VW; k++) l += `M${(k * DAY - scroll).toFixed(1)} 0V${ch.h}`;
        lines.setAttribute("d", l);
      });
      // ticks (12am / 12pm every 86px)
      const base = Math.floor(scroll / HALF);
      ticks.forEach((t, j) => {
        const m = base + j, x = m * HALF - scroll;
        t.style.transform = `translateX(${x.toFixed(1)}px)`;
        const c = tkCache[j];
        if (c.m !== m) { const am = ((m % 2) + 2) % 2 === 0; if (c.t !== am) { t.classList.toggle("is-am", am); c.t = am; } t.children[1].textContent = am ? "12am" : "12pm"; c.m = m; }
      });
      // day headers, offset a little by their own screen position so the names drift against the columns
      const kb = Math.floor(scroll / DAY) - 1;
      hdrs.forEach((s, j) => {
        const k = kb + j, mid = DAY * k + DAY / 2 - scroll + X0;
        const off = clamp((mid - 178) * 0.176, -60, 80);
        s.style.transform = `translate(${(mid + off - X0).toFixed(1)}px, 0) translateX(-50%)`;
        if (hdCache[j] !== k) { s.textContent = dayName(k); hdCache[j] = k; }
      });
      // hover readout
      if (hx !== null && hx >= X0 && hx <= W) {
        const cx = hx - X0 + scroll;
        xh.style.opacity = 1; xh.style.transform = `translateX(${hx.toFixed(1)}px)`;
        let html = `<span class="tc-rt">${timeText(cx)}</span>`;
        boxes.forEach(({ ch, xd }, ci) => {
          const o = valAt(ch, cx), v = -o / UNIT;
          xd.setAttribute("opacity", 1); xd.firstChild.setAttribute("cx", (hx - X0).toFixed(1)); xd.firstChild.setAttribute("cy", (ch.c + o).toFixed(1));
          xd.firstChild.setAttribute("fill", ch.fill);
          html += `<span class="tc-rv"><i style="background:${ch.fill}"></i>${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}</span>`;
        });
        if (rd.dataset.k !== html) { rd.innerHTML = html; rd.dataset.k = html; }
        rd.style.opacity = 1;
        rd.style.transform = `translateX(${clamp(hx - 96, X0 + 4, W - 200).toFixed(1)}px)`;
      } else {
        xh.style.opacity = 0; rd.style.opacity = 0;
        boxes.forEach(({ xd }) => xd.setAttribute("opacity", 0));
      }
    }
    function loop(now) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      let busy = false;
      if (!dragging) {
        if (tgt !== null) {
          const d = tgt - scroll;
          if (Math.abs(d) < 0.4) { scroll = tgt; tgt = null; } else { scroll += d * (1 - Math.exp(-dt * 9)); busy = true; }
        } else if (Math.abs(vel) > 6) {
          scroll += vel * dt; vel *= Math.exp(-dt * 3.2); busy = true;
        } else vel = 0;
      } else busy = true;
      draw();
      if (busy) kick();
    }
    function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }

    const toLocal = (e) => { const r = root.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * W; };
    const onDown = (e) => {
      if (e.button != null && e.button > 0) return;
      dragging = true; tgt = null; vel = 0; pid = e.pointerId;
      try { hit.setPointerCapture(e.pointerId); } catch (_) {}
      lastX = e.clientX; lastT = performance.now(); root.classList.add("is-drag");
      hx = toLocal(e); kick();
    };
    const onMove = (e) => {
      hx = toLocal(e);
      if (dragging) {
        const now = performance.now(), dx = (e.clientX - lastX) / fit.scale(), dtm = Math.max(1, now - lastT);
        scroll -= dx;
        const inst = (-dx / dtm) * 1000; vel = vel * 0.6 + inst * 0.4;
        lastX = e.clientX; lastT = now;
      }
      kick();
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false; root.classList.remove("is-drag");
      try { hit.releasePointerCapture(pid); } catch (_) {}
      if (performance.now() - lastT > 90) vel = 0;
      vel = clamp(vel, -4000, 4000);
      if (motionOff()) vel = 0;
      kick();
    };
    const onLeave = (e) => { if (!dragging) { hx = null; kick(); } };
    const onWheel = (e) => {
      const ax_ = Math.abs(e.deltaX), ay = Math.abs(e.deltaY);
      if (!(ax_ > ay || e.shiftKey)) return; // vertical wheel keeps scrolling the page
      e.preventDefault();
      const d = (ax_ > ay ? e.deltaX : e.deltaY) * (e.deltaMode === 1 ? 16 : 1) / fit.scale();
      tgt = null; scroll += d; vel = motionOff() ? 0 : clamp(vel * 0.5 + d * 6, -3000, 3000);
      if (hx !== null) { /* keep readout live under the pointer */ }
      kick();
    };
    const onKey = (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const step = (e.shiftKey ? 3 : 1) * HALF;
      vel = 0;
      if (motionOff()) scroll += d * step; else tgt = (tgt !== null ? tgt : scroll) + d * step;
      hx = null; kick();
    };
    hit.addEventListener("pointerdown", onDown);
    hit.addEventListener("pointermove", onMove);
    hit.addEventListener("pointerup", onUp);
    hit.addEventListener("pointercancel", onUp);
    hit.addEventListener("pointerleave", onLeave);
    hit.addEventListener("wheel", onWheel, { passive: false });
    hit.addEventListener("keydown", onKey);
    draw();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      hit.removeEventListener("pointerdown", onDown); hit.removeEventListener("pointermove", onMove);
      hit.removeEventListener("pointerup", onUp); hit.removeEventListener("pointercancel", onUp);
      hit.removeEventListener("pointerleave", onLeave); hit.removeEventListener("wheel", onWheel); hit.removeEventListener("keydown", onKey);
      fit.stop();
      root.remove();
    };
  }

  D.balanceChart = balanceChart;
  D.timelineChart = timelineChart;
})();
