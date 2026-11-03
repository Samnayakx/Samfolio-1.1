// Writing demos: small live UIs inside an article, in the spirit of benji.org/agentation.
// Each demo plays itself with a cursor while it is on screen, and hands over the moment a reader touches it.
(() => {
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms, run) => new Promise((r) => setTimeout(r, ms)).then(() => { if (run.dead) throw run; });
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tween = (run, a, b, ms, fn) =>
    new Promise((res) => {
      const t0 = performance.now();
      const f = (now) => {
        if (run.dead) return res();
        const k = Math.min(1, (now - t0) / ms);
        fn(a + (b - a) * ease(k));
        k < 1 ? requestAnimationFrame(f) : res();
      };
      requestAnimationFrame(f);
    }).then(() => { if (run.dead) throw run; });

  const makeCursor = (stage) => {
    const c = document.createElement("span");
    c.className = "demo__cur";
    c.setAttribute("aria-hidden", "true");
    c.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    stage.appendChild(c);
    const at = (x, y, ms) => {
      const s = stage.getBoundingClientRect();
      c.style.transitionDuration = ms + "ms";
      c.style.transform = `translate(${x - s.left}px, ${y - s.top}px)`;
    };
    const center = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    return {
      el: c,
      show() { c.classList.add("is-on"); },
      hide() { c.classList.remove("is-on"); },
      jump(x, y) { at(x, y, 0); },
      async to(run, target, ms = 700) { const [x, y] = Array.isArray(target) ? target : center(target); at(x, y, ms); await wait(ms + 30, run); },
      async click(run) { c.classList.add("is-down"); await wait(150, run); c.classList.remove("is-down"); await wait(140, run); },
    };
  };

  // Where a range input's thumb sits, in viewport coordinates
  const thumb = (input, v) => {
    const r = input.getBoundingClientRect(), min = +input.min, max = +input.max;
    return [r.left + 8 + ((v - min) / (max - min)) * (r.width - 16), r.top + r.height / 2];
  };
  // The cursor grabs a slider and drags it to a value
  const drag = async (run, cur, input, to, ms = 1000) => {
    const from = +input.value;
    await cur.to(run, thumb(input, from), 600);
    cur.el.classList.add("is-down");
    await tween(run, from, to, ms, (v) => {
      input.value = v;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      cur.jump(...thumb(input, v));
    });
    cur.el.classList.remove("is-down");
    await wait(220, run);
  };

  const DEMOS = {
    // ── Confidence: evidence × reversibility picks one of four states ──
    confidence(stage) {
      stage.innerHTML = `<div class="cf">
        <div class="cf__card"><span class="cf__k">The agent wants to</span><strong class="cf__act">Rename a local draft</strong></div>
        <div class="cf__ctl">
          <label><span>Evidence</span><input type="range" min="0" max="100" value="92" data-k="e" aria-label="Evidence"><output></output></label>
          <label><span>Reversibility</span><input type="range" min="0" max="100" value="95" data-k="r" aria-label="Reversibility"><output></output></label>
        </div>
        <ol class="cf__states" aria-live="polite">
          <li data-s="act"><b>Act</b><span>Does it, leaves an undo</span></li>
          <li data-s="propose"><b>Propose</b><span>Recommends one path</span></li>
          <li data-s="ask"><b>Ask</b><span>One targeted question</span></li>
          <li data-s="stop"><b>Stop</b><span>Needs a person</span></li>
        </ol></div>`;
      const $ = (s) => stage.querySelector(s), e = $('[data-k="e"]'), r = $('[data-k="r"]'), act = $(".cf__act");
      const SC = [
        ["Rename a local draft", 92, 95],
        ["Choose between two layouts", 62, 82],
        ["Which Sam? Two contacts match", 24, 70],
        ["Email 240 customers", 90, 6],
      ];
      const state = (ev, rv) => (rv < 25 ? "stop" : ev < 40 ? "ask" : ev < 75 ? "propose" : "act");
      const paint = () => {
        e.nextElementSibling.textContent = (e.value / 100).toFixed(2);
        r.nextElementSibling.textContent = (r.value / 100).toFixed(2);
        const s = state(+e.value, +r.value);
        stage.querySelectorAll(".cf__states li").forEach((li) => li.classList.toggle("is-on", li.dataset.s === s));
      };
      [e, r].forEach((i) => i.addEventListener("input", (ev) => { if (ev.isTrusted) act.textContent = "Your own action"; paint(); }));
      const set = (n) => { act.textContent = SC[n][0]; e.value = SC[n][1]; r.value = SC[n][2]; paint(); };
      return {
        rest: () => set(0),
        reset: () => set(0),
        async play(run, cur) {
          for (let n = 1; n <= SC.length; n++) {
            const sc = SC[n % SC.length];
            act.textContent = sc[0];
            await drag(run, cur, e, sc[1]);
            await drag(run, cur, r, sc[2]);
            await wait(1500, run);
          }
        },
      };
    },

    // ── Agentic UX: one transcript, four memory stores ──
    memory(stage) {
      const LINES = [
        { t: "Launch is Thursday. Two decisions still open.", s: "working", short: "Goal: launch Thursday" },
        { t: "Last draft was rejected: too long.", s: "episodic", short: "Draft rejected: too long" },
        { t: "Prefers short briefs · source: Mar 3", s: "semantic", short: "Prefers short briefs" },
        { t: "Anything external needs sign-off.", s: "procedural", short: "External needs sign-off" },
        { t: "ok one sec, back in 5", s: null },
      ];
      const NAMES = { working: "Working", episodic: "Episodic", semantic: "Semantic", procedural: "Procedural" };
      stage.innerHTML = `<div class="mem">
        <div class="mem__log">${LINES.map((l, i) => `<button type="button" class="mem__line" data-i="${i}"><span>${l.t}</span><span class="mem__tag" aria-hidden="true"></span></button>`).join("")}</div>
        <div class="mem__stores" aria-live="polite">${Object.entries(NAMES).map(([k, v]) => `<div class="mem__store" data-s="${k}"><h4>${v}</h4><ul></ul></div>`).join("")}</div></div>`;
      const lines = [...stage.querySelectorAll(".mem__line")];
      const sort = (i) => {
        const l = LINES[i], el = lines[i];
        if (el.classList.contains("is-sorted") || el.classList.contains("is-dropped")) return;
        if (l.s) {
          el.classList.add("is-sorted");
          el.querySelector(".mem__tag").textContent = "→ " + NAMES[l.s];
          const li = document.createElement("li"); li.textContent = l.short;
          stage.querySelector(`[data-s="${l.s}"] ul`).appendChild(li);
        } else {
          el.classList.add("is-dropped");
          el.querySelector(".mem__tag").textContent = "discarded";
          el.querySelector(".mem__tag").style.opacity = 1;
        }
      };
      const clear = () => {
        lines.forEach((el) => { el.classList.remove("is-sorted", "is-dropped"); el.querySelector(".mem__tag").style.opacity = ""; });
        stage.querySelectorAll(".mem__store ul").forEach((u) => (u.innerHTML = ""));
      };
      lines.forEach((el, i) => el.addEventListener("click", () => sort(i)));
      return {
        rest: () => { LINES.forEach((_, i) => sort(i)); },
        reset: clear,
        async play(run, cur) {
          clear();
          await wait(500, run);
          for (let i = 0; i < LINES.length; i++) {
            await cur.to(run, lines[i], 650);
            await cur.click(run);
            sort(i);
            await wait(450, run);
          }
          await wait(2600, run);
        },
      };
    },

    // ── Semantic tokens: one dialog, two vocabularies ──
    tokens(stage) {
      const SETS = {
        prim: [["red-500", "#ef4444"], ["red-600", "#dc2626"], ["orange-500", "#f97316"], ["blue-500", "#3b82f6"], ["gray-100", "#f3f4f6"], ["gray-900", "#111827"]],
        sem: [["action-danger", "#dc2626"], ["action-primary", "#3b82f6"], ["surface-raised", "#f3f4f6"], ["text-primary", "#111827"]],
      };
      stage.innerHTML = `<div class="tk">
        <div><div class="tk__seg" role="tablist" aria-label="Token vocabulary"><button type="button" role="tab" data-m="prim" aria-selected="true">Primitives</button><button type="button" role="tab" data-m="sem" aria-selected="false">Semantic</button></div><ul class="tk__list"></ul></div>
        <div><div class="tk__dlg"><strong>Delete project?</strong><p>This can’t be undone.</p><div class="tk__row"><span class="tk__b tk__b--ghost">Cancel</span><span class="tk__b tk__b--do">Delete</span></div></div><p class="tk__note" aria-live="polite"></p></div></div>`;
      const $ = (s) => stage.querySelector(s), list = $(".tk__list"), btn = $(".tk__b--do"), note = $(".tk__note"), tabs = [...stage.querySelectorAll(".tk__seg button")];
      let mode = "prim";
      const NOTES = {
        none: "Pick a token for the Delete button.",
        prim: "Looks fine. Nothing in the name says whether it is right.",
        ok: "Purpose matches: a destructive action.",
        bad: "Wrong purpose, and it reads that way in code review.",
      };
      const pick = (name) => {
        const t = SETS[mode].find((x) => x[0] === name);
        list.querySelectorAll(".tk__tok").forEach((b) => b.classList.toggle("is-picked", b.dataset.t === name));
        if (!t) { btn.style.removeProperty("--c"); btn.style.removeProperty("--f"); note.textContent = NOTES.none; return; }
        btn.style.setProperty("--c", t[1]);
        btn.style.setProperty("--f", name === "gray-100" || name === "surface-raised" ? "#111827" : "#fff");
        note.textContent = mode === "prim" ? NOTES.prim : name === "action-danger" ? NOTES.ok : NOTES.bad;
      };
      const show = (m) => {
        mode = m;
        tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.m === m)));
        list.innerHTML = SETS[m].map(([n, c], i) => `<li><button type="button" class="tk__tok" data-t="${n}" style="--c:${c};--i:${i}"><i></i>${n}</button></li>`).join("");
        list.querySelectorAll(".tk__tok").forEach((b) => b.addEventListener("click", () => pick(b.dataset.t)));
        pick(null);
      };
      tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.m)));
      const tok = (n) => list.querySelector(`[data-t="${n}"]`);
      return {
        rest: () => { show("sem"); pick("action-danger"); },
        reset: () => show("prim"),
        async play(run, cur) {
          show("prim");
          await wait(500, run);
          for (const n of ["orange-500", "red-500"]) { await cur.to(run, tok(n), 650); await cur.click(run); pick(n); await wait(700, run); }
          await cur.to(run, tabs[1], 700); await cur.click(run); show("sem"); await wait(600, run);
          for (const n of ["surface-raised", "action-danger"]) { await cur.to(run, tok(n), 650); await cur.click(run); pick(n); await wait(n === "action-danger" ? 2400 : 1100, run); }
        },
      };
    },

    // ── OKLCH: the same ramp rule in HSL and in OKLCH ──
    oklch(stage) {
      const C = [0.03, 0.07, 0.12, 0.16, 0.19, 0.17, 0.13, 0.09, 0.05];
      const hsl = C.map((_, i) => `hsl(var(--h) 85% ${95 - i * 10}%)`);
      const okl = C.map((c, i) => `oklch(${(0.97 - i * 0.09).toFixed(2)} ${c} var(--h))`);
      const ramp = (arr, cls = "") => `<div class="ok__ramp ${cls}">${arr.map((s) => `<i style="--s:${s}"></i>`).join("")}</div>`;
      stage.innerHTML = `<div class="ok">
        <div class="ok__row"><p class="ok__k"><span>HSL · equal lightness steps</span><span>uneven to the eye</span></p>${ramp(hsl)}${ramp(hsl, "ok__gray")}</div>
        <div class="ok__row"><p class="ok__k"><span>OKLCH · equal lightness steps</span><span>even to the eye</span></p>${ramp(okl)}${ramp(okl, "ok__gray")}</div>
        <label><span>Hue</span><input type="range" min="0" max="360" value="150" aria-label="Hue"><output></output></label></div>`;
      const root = stage.querySelector(".ok"), h = stage.querySelector("input");
      const paint = () => { root.style.setProperty("--h", h.value); h.nextElementSibling.textContent = h.value + "°"; };
      h.addEventListener("input", paint);
      return {
        rest: () => { h.value = 70; paint(); },
        reset: () => { h.value = 150; paint(); },
        async play(run, cur) {
          for (const v of [75, 255, 20, 150]) { await drag(run, cur, h, v, 1500); await wait(900, run); }
        },
      };
    },

    // ── Optical alignment: the offset as metadata on the icon ──
    optical(stage) {
      const CX = (36 + 36 + 64) / 3; // centroid x of the play triangle, 45.33
      stage.innerHTML = `<div class="op">
        <svg class="op__svg" viewBox="0 0 100 100" role="img" aria-label="A play button: a triangle inside a circle">
          <circle class="op__disc" cx="50" cy="50" r="46"/>
          <g class="op__g"><rect class="op__bb" x="36" y="34" width="28" height="32"/><path class="op__tri" d="M36 34L36 66L64 50Z"/><line class="op__mass" x1="${CX}" y1="26" x2="${CX}" y2="74"/></g>
          <line class="op__ctr" x1="50" y1="4" x2="50" y2="96"/>
        </svg>
        <div class="op__ctl">
          <label><span>Offset</span><input type="range" min="0" max="80" value="0" aria-label="Horizontal offset"><output></output></label>
          <code class="op__json"></code>
          <p class="op__note" aria-live="polite"></p>
        </div></div>`;
      const i = stage.querySelector("input"), g = stage.querySelector(".op__g"), json = stage.querySelector(".op__json"), note = stage.querySelector(".op__note");
      const paint = () => {
        const v = i.value / 10, gap = Math.abs(50 - (CX + v));
        g.setAttribute("transform", `translate(${v} 0)`);
        i.nextElementSibling.textContent = v.toFixed(1);
        json.textContent = `{ "play": { "offset": [${v.toFixed(1)}, 0] } }`;
        note.textContent = gap < 0.5 ? "Centred by mass. It reads as centred." : v < 0.3 ? "Centred by the box. It reads as sliding left." : v > CX - 50 + 5.5 ? "Past the centre of mass." : "Closer. The red line is where the weight sits.";
      };
      i.addEventListener("input", paint);
      return {
        rest: () => { i.value = 47; paint(); },
        reset: () => { i.value = 0; paint(); },
        async play(run, cur) {
          i.value = 0; paint();
          await wait(1000, run);
          await drag(run, cur, i, 47, 1700);
          await wait(2200, run);
          await drag(run, cur, i, 0, 1100);
        },
      };
    },
  };

  const mount = (fig, build) => {
    const cap = fig.querySelector("figcaption");
    const frame = document.createElement("div");
    frame.className = "demo__frame";
    frame.setAttribute("role", "group");
    frame.setAttribute("aria-label", cap ? cap.textContent : "Interactive demo");
    frame.innerHTML = `<div class="demo__bar" aria-hidden="true"><i></i><i></i><i></i><span>${fig.dataset.url || ""}</span></div><div class="demo__stage"></div>`;
    fig.insertBefore(frame, cap);
    const stage = frame.querySelector(".demo__stage");
    const demo = build(stage), cur = makeCursor(stage);
    let run = null, took = false, vis = false;
    const stop = () => { if (run) run.dead = true; run = null; cur.hide(); };
    const go = async () => {
      if (took || reduce() || run || !vis) return;
      const my = (run = { dead: false });
      demo.reset?.();
      const s = stage.getBoundingClientRect();
      cur.jump(s.left + s.width / 2, s.top + s.height / 2);
      cur.show();
      try { for (;;) await demo.play(my, cur); }
      catch (err) { if (err !== my) throw err; }
      finally { if (run === my) run = null; }
    };
    const take = () => { took = true; stop(); };
    stage.addEventListener("pointerdown", take, { passive: true });
    stage.addEventListener("keydown", take);
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) go(); else stop(); }, { threshold: 0.55 }).observe(frame);
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { fig.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.15 }).observe(fig);
    demo.rest?.();
    fig.classList.add("is-ready");
  };

  document.querySelectorAll("[data-demo]").forEach((fig) => { const b = DEMOS[fig.dataset.demo]; if (b) mount(fig, b); });
})();
