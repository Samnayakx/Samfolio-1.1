/* Interaction sounds, ported from dmcg.co/work/sandbar.
   Every sound is synthesized live with Web Audio from a small "recipe" (voice, pitch, length, tone...),
   so there are no audio files to download. Muted state persists in localStorage. */
(() => {
  "use strict";
  const KEY = "sn:ui-sound-muted:v1";
  const MASTER = 20; // Sandbar ships at volume 20 of 100

  // Browsers differ in audio latency; Sandbar disables sound on Safari, so do the same.
  const ua = navigator.userAgent;
  const safari = /Version\/[\d.]+.*Safari\//.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Edg\/|OPR\//.test(ua);
  if (safari || !window.AudioContext) return;

  const BASE = { voice: "glass", pitch: 880, duration: 160, brightness: 55, body: 40, sweep: 0, attack: 2, space: 15, variation: 8, volume: 60, notes: 1, interval: 5, gap: 80, tape: 0 };
  const R = (o) => ({ ...BASE, ...o });
  const DIAL = R({ voice: "tick", pitch: 1760, duration: 30, brightness: 55, body: 10, attack: 0, space: 0, variation: 10, volume: 13 });
  const TAP = R({ voice: "tap", pitch: 1760, duration: 30, brightness: 42, body: 10, attack: 0, space: 0, variation: 10, volume: 13 });
  const FELT = R({ voice: "tick", pitch: 880, duration: 80, brightness: 30, body: 30, attack: 1, space: 0, variation: 10, volume: 21 });
  const SOUNDS = {
    "project.open": DIAL, "project.close": DIAL, "view.change": DIAL, "nav.hover": DIAL,
    "dock.open": FELT, "dock.close": FELT,
    "dock.hover": TAP, "page.navigate": TAP,
    "contact.copy": R({ voice: "soft", pitch: 440, duration: 320, brightness: 30, body: 55, attack: 4, space: 35, variation: 6, volume: 38, notes: 3, interval: 5, gap: 65 }),
    "sound.on": R({ voice: "chime", pitch: 2093, duration: 420, brightness: 79, body: 35, attack: 1, space: 25, variation: 6, volume: 33, notes: 3, interval: 6, gap: 70 }),
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const noiseBuffers = new WeakMap();
  const noise = (ctx) => {
    let b = noiseBuffers.get(ctx);
    if (!b) {
      b = ctx.createBuffer(1, Math.ceil(1.6 * ctx.sampleRate), ctx.sampleRate);
      const d = b.getChannelData(0); let s = 173;
      for (let i = 0; i < d.length; i++) { s = (Math.imul(s, 1664525) + 0x3c6ef35f) | 0; d[i] = (s >>> 0) / 0x80000000 - 1; }
      noiseBuffers.set(ctx, b);
    }
    return b;
  };
  const saturation = (amt) => {
    const k = 1 + (amt / 100) * 2.4, c = new Float32Array(1025);
    for (let i = 0; i < c.length; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * k) / k; }
    return c;
  };

  // One sound: a stack of enveloped oscillators / noise bursts, through a low-pass, optional tape wobble and a tiny echo.
  function synth(ctx, out, r, { volume = 1, delay = 0 } = {}) {
    const vary = (Math.random() - 0.5) * r.variation / 100;
    const base = r.pitch * 2 ** (0.35 * vary);
    const t0 = ctx.currentTime + 0.004 + Math.max(0, delay);
    const dur = r.duration / 1000;
    const att = Math.min(0.4 * dur, Math.max(0.001, r.attack / 1000));
    const total = (r.duration + (Math.max(1, r.notes) - 1) * r.gap) / 1000;
    const tape = r.tape / 100;
    const nodes = [], srcs = [];
    const master = ctx.createGain();
    master.gain.value = (r.volume / 100) * clamp(volume, 0, 1) * 0.48 * (1 + 0.15 * vary);
    master.connect(out); nodes.push(master);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.Q.value = 0.6;
    lp.frequency.value = Math.min(0.45 * ctx.sampleRate, (500 + (r.brightness / 100) * 13500) * (1 - 0.4 * tape));
    nodes.push(lp);
    let wobble;
    if (tape > 0) {
      const sh = ctx.createWaveShaper(); sh.curve = saturation(r.tape); sh.oversample = "2x";
      const g = ctx.createGain(); g.gain.value = 1 + 0.15 * tape;
      lp.connect(sh); sh.connect(g); g.connect(master);
      wobble = ctx.createGain(); nodes.push(sh, g, wobble);
      for (const [f, depth] of [[0.7 + 0.3 * Math.random(), 22], [5.6, 9]]) {
        const o = ctx.createOscillator(); o.frequency.value = f;
        const og = ctx.createGain(); og.gain.value = depth * tape;
        o.connect(og); og.connect(wobble); nodes.push(og);
        o.start(t0); o.stop(t0 + total + 0.01); srcs.push(o);
      }
    } else lp.connect(master);
    if (r.space > 0) for (const [time, amt] of [[0.045, 0.18], [0.095, 0.09]]) {
      const d = ctx.createDelay(0.2); d.delayTime.value = time;
      const g = ctx.createGain(); g.gain.value = amt * r.space / 100;
      lp.connect(d); d.connect(g); g.connect(master); nodes.push(d, g);
    }
    const body = r.body / 100, tone = r.brightness / 100;

    const note = (t, pitch, level) => {
      const end = t + dur;
      const env = (peak, len = dur, dest = lp, rise = att) => {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(Math.max(1e-4, peak * level), t + Math.min(rise, 0.4 * len));
        g.gain.exponentialRampToValueAtTime(1e-4, t + len);
        g.gain.linearRampToValueAtTime(0, t + len + 0.004);
        g.connect(dest); nodes.push(g); return g;
      };
      const osc = (mult, type, bend) => {
        const o = ctx.createOscillator(); o.type = type;
        const f = clamp(pitch * mult, 25, 0.4 * ctx.sampleRate);
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(clamp(f * 2 ** (bend / 12), 25, 0.4 * ctx.sampleRate), end);
        wobble?.connect(o.detune);
        o.start(t); o.stop(end + 0.01); srcs.push(o); return o;
      };
      const partial = (mult, peak, lenMul = 1, type = "sine", bend = r.sweep) => osc(mult, type, bend).connect(env(peak, dur * lenMul));
      const hit = (delayS = 0) => {
        const s = ctx.createBufferSource(); s.buffer = noise(ctx);
        wobble?.connect(s.detune);
        s.start(t + delayS); s.stop(end + 0.01); srcs.push(s); return s;
      };
      const burst = (type, freq, q, peak, len, rise = 5e-4) => {
        const f = ctx.createBiquadFilter(); f.type = type;
        f.frequency.value = clamp(freq, 40, 0.45 * ctx.sampleRate); f.Q.value = q;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(Math.max(1e-4, peak * level), t + rise);
        g.gain.exponentialRampToValueAtTime(1e-4, t + rise + len);
        g.gain.linearRampToValueAtTime(0, t + rise + len + 0.004);
        hit().connect(f); f.connect(g); g.connect(lp); nodes.push(f, g);
      };
      const fm = (ratio, index, peak, lenMul = 1) => {
        const carrier = osc(1, "sine", r.sweep), mod = osc(ratio, "sine", r.sweep);
        const depth = Math.max(0.1, Math.min(index, (16000 - pitch) / (pitch * ratio) - 1));
        const mg = ctx.createGain();
        mg.gain.setValueAtTime(depth * pitch * ratio, t);
        mg.gain.exponentialRampToValueAtTime(depth * pitch * ratio * 0.06, t + 0.55 * dur);
        mod.connect(mg); mg.connect(carrier.frequency); nodes.push(mg);
        carrier.connect(env(peak, dur * lenMul));
      };
      const swish = (peak, lenMul = 1, sweepIt = false) => {
        const f = ctx.createBiquadFilter(); f.type = sweepIt ? "bandpass" : "highpass";
        f.frequency.setValueAtTime(sweepIt ? 2 * pitch : 1800, t);
        if (sweepIt) f.frequency.exponentialRampToValueAtTime(Math.max(100, Math.min(12000, 2 * pitch * 2 ** (r.sweep / 12))), end);
        f.Q.value = sweepIt ? 0.7 + 3 * body : 0.5;
        hit().connect(f); f.connect(env(peak, dur * lenMul)); nodes.push(f);
      };

      switch (r.voice) {
        case "glass": partial(1, .55); partial(2.76, .16 * tone, .55); partial(5.4, .08 * tone, .25); partial(.5, .15 * body, .8); swish(.09 * tone, .12); break;
        case "wood": partial(1, .4, .65); partial(1.47, .18 * body, .35); partial(.5, .28 * body, .65); swish(.4 * tone, .25, true); break;
        case "metal": partial(1, .38); partial(2.4, .18 * tone, .8); partial(3.76, .12 * tone, .5); partial(5.91, .07 * tone, .3); partial(.5, .18 * body); break;
        case "bubble": partial(1, .65, 1, "sine", r.sweep - 10); partial(.5, .18 * body, .6, "sine", r.sweep - 6); swish(.09 * tone, .1); break;
        case "air": swish(.9, 1, true); partial(.5, .18 * body); break;
        case "digital": partial(1, .32, 1, "triangle"); partial(2, .08 * tone, .5, "square"); partial(.5, .22 * body, .8); break;
        case "soft": partial(1, .5); partial(1.5, .15 * tone, .8); partial(2, .08 * tone, .6); partial(.5, .2 * body); break;
        case "pluck": {
          const f = ctx.createBiquadFilter(); f.type = "lowpass";
          f.frequency.setValueAtTime(Math.min(0.45 * ctx.sampleRate, pitch * (2 + 14 * tone)), t);
          f.frequency.exponentialRampToValueAtTime(Math.max(60, 1.2 * pitch), t + 0.5 * dur);
          f.Q.value = 0.7 + 6 * body;
          osc(1, "sawtooth", r.sweep).connect(f); f.connect(env(.34)); nodes.push(f);
          partial(.5, .16 * body, .7); break;
        }
        case "click":
          for (const [off, peak] of [[0, 4], [.009 + (1 - tone) * .008, 1.8]]) {
            const f = ctx.createBiquadFilter(); f.type = "bandpass";
            f.frequency.value = Math.min(12000, pitch * (2.5 + 3 * tone)); f.Q.value = 1.2 + 5 * body;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t + off);
            g.gain.linearRampToValueAtTime(peak * level, t + off + 6e-4);
            g.gain.exponentialRampToValueAtTime(1e-4, t + off + .008 + .014 * body);
            g.gain.linearRampToValueAtTime(0, t + off + .02);
            hit(off).connect(f); f.connect(g); g.connect(lp); nodes.push(f, g);
          }
          partial(1, .25 + .45 * body, .5); break;
        case "tick":
          burst("highpass", 2000 + 5000 * tone, .7, 7, .0012 + (1 - tone) * .0018);
          burst("bandpass", 2.1 * pitch, 1.5 + 5 * body, 10, .003 + .005 * body);
          partial(1, .22 + 1.4 * body, .4); partial(2.71, .45 * body * tone, .18); break;
        case "tap": {
          const a = Math.max(att, .0025 + (1 - tone) * .0035);
          const o = ctx.createOscillator(), f = clamp(pitch, 25, 0.4 * ctx.sampleRate);
          o.frequency.setValueAtTime(1.12 * f, t);
          o.frequency.exponentialRampToValueAtTime(f, t + a + .008);
          o.frequency.exponentialRampToValueAtTime(Math.max(25, f * 2 ** (r.sweep / 12)), end);
          wobble?.connect(o.detune); o.start(t); o.stop(end + .01); srcs.push(o);
          o.connect(env(.56, dur * (.3 + .55 * body), lp, a));
          osc(2.43, "sine", r.sweep).connect(env(.056 + .125 * tone, dur * (.12 + .1 * body), lp, a));
          burst("lowpass", 600 + 1400 * tone, .5, .28 + .4 * tone, .004, a); break;
        }
        case "chime": fm(3.5, .5 + 3 * tone, .32); fm(1, .4 + 1.6 * tone, .1 + .16 * body, .55); partial(.5, .1 * body); burst("bandpass", 4 * pitch, 1, .25 * tone, .003); break;
        case "synth": {
          const f = ctx.createBiquadFilter(); f.type = "lowpass";
          const hi = Math.min(0.45 * ctx.sampleRate, pitch * (2.5 + 12 * tone)), lo = Math.min(0.45 * ctx.sampleRate, pitch * (1.2 + 2.5 * tone));
          f.frequency.setValueAtTime(lo, t);
          f.frequency.exponentialRampToValueAtTime(hi, t + att + .006);
          f.frequency.exponentialRampToValueAtTime(lo, t + att + .45 * dur);
          f.Q.value = 1 + 2.5 * tone;
          const spread = 5 + 12 * body;
          for (const c of [-spread, spread]) { const o = osc(1, "sawtooth", r.sweep); o.detune.value = c; o.connect(f); }
          const sub = ctx.createGain(); sub.gain.value = .5 * body;
          osc(.5, "square", r.sweep).connect(sub); sub.connect(f); f.connect(env(.36)); nodes.push(f, sub); break;
        }
        case "mallet":
          partial(1, .5); partial(3.93, .04 + .14 * tone, .22); partial(9.2, .05 * tone, .08);
          osc(1, "sine", r.sweep).connect(env(.3 * body, dur, lp, .012));
          burst("lowpass", 3 * pitch + 2400 * tone, .7, .5 + .7 * tone, .0025); break;
      }
    };
    for (let i = 0; i < r.notes; i++) note(t0 + (i * r.gap) / 1000, base * 2 ** ((i * r.interval) / 12), 0.9 ** i);

    // Silent tail oscillator so we know when to release every node
    const tail = ctx.createOscillator(), tg = ctx.createGain(); tg.gain.value = 0;
    tail.connect(tg); tg.connect(out); nodes.push(tg);
    tail.start(t0); tail.stop(t0 + total + 0.12); srcs.push(tail);
    tail.onended = () => { srcs.forEach((s) => s.disconnect()); nodes.forEach((n) => n.disconnect()); };
  }

  // ── Player: one shared AudioContext behind a gentle compressor ──
  let ctx, out, pending, keepAlive, lastPlay = 0;
  const unlock = () => {
    try {
      if (!ctx || ctx.state === "closed") {
        ctx = new AudioContext({ latencyHint: "interactive" });
        ctx.addEventListener("statechange", playPending);
        out = ctx.createDynamicsCompressor();
        out.threshold.value = -8; out.knee.value = 12; out.ratio.value = 5; out.attack.value = 0.002; out.release.value = 0.08;
        out.connect(ctx.destination);
      }
      if (ctx.state === "suspended" || ctx.state === "interrupted") ctx.resume().catch(() => {});
      return true;
    } catch { return false; }
  };
  const start = (recipe) => {
    const now = performance.now();
    if (now - lastPlay < 35) return;
    lastPlay = now;
    try { synth(ctx, out, recipe, { volume: MASTER / 100 }); keepAwake(); } catch {}
  };
  function playPending() {
    if (!pending || ctx.state !== "running") return;
    const { recipe, until } = pending; pending = undefined;
    if (performance.now() < until) start(recipe);
  }
  // Holding a silent source open keeps the audio device awake so sounds fire with no wake-up lag
  const keepAwake = () => {
    if (!ctx || ctx.state === "closed") return;
    if (ctx.state !== "running") { if (navigator.userActivation?.hasBeenActive !== false) ctx.resume().catch(() => {}); return; }
    try {
      if (!keepAlive) {
        const s = keepAlive = ctx.createConstantSource();
        s.offset.value = 1e-5; s.connect(ctx.destination); s.start();
        s.onended = () => { s.disconnect(); if (keepAlive === s) keepAlive = undefined; };
      }
      keepAlive.stop(ctx.currentTime + 60);
    } catch {}
  };

  let muted = false;
  try { muted = localStorage.getItem(KEY) === "true"; } catch {}

  const play = (id, recipe = SOUNDS[id]) => {
    if (!recipe || muted || document.hidden || !unlock()) return;
    if (ctx.state !== "running") {
      pending = { recipe, until: performance.now() + (navigator.userActivation?.isActive ? 1000 : 250) };
      return;
    }
    start(recipe);
  };

  // Browsers only allow audio after a real gesture
  const arm = (e) => { if (e.isTrusted && !muted) unlock(); };
  addEventListener("pointerdown", arm, { capture: true, passive: true });
  addEventListener("keydown", arm, { capture: true });
  let lastMove = 0;
  for (const ev of ["pointermove", "pointerdown", "keydown", "wheel", "scroll"]) {
    addEventListener(ev, () => { const n = performance.now(); if (n - lastMove < 1000 || muted) return; lastMove = n; keepAwake(); }, { capture: true, passive: true });
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) { lastMove = 0; try { ctx && keepAlive && keepAlive.stop(ctx.currentTime); } catch {} } });

  // ── Header toggle (speaker icon beside the theme control) ──
  const ON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6v4h2.5L8 13V3L4.5 6z" fill="currentColor" stroke="none"/><path d="M10.5 5.5a3.6 3.6 0 0 1 0 5M12.5 3.5a6.4 6.4 0 0 1 0 9"/></svg>';
  const OFF = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6v4h2.5L8 13V3L4.5 6z" fill="currentColor" stroke="none"/><path d="M10.5 6l4 4M14.5 6l-4 4"/></svg>';
  const theme = document.getElementById("theme");
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "icon-btn"; btn.id = "sound";
  const paint = () => {
    btn.innerHTML = muted ? OFF : ON;
    btn.setAttribute("aria-label", muted ? "Turn interaction sounds on" : "Mute interaction sounds");
    btn.setAttribute("aria-pressed", String(!muted));
    btn.title = muted ? "Sounds off" : "Sounds on";
  };
  paint();
  btn.addEventListener("click", () => {
    muted = !muted;
    try { localStorage.setItem(KEY, String(muted)); } catch {}
    paint();
    if (!muted) { unlock(); play("sound.on"); }
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && btn.animate) {
      btn.firstElementChild.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)", offset: 0.25 }, { transform: "scale(1)" }], { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)" });
    }
  });
  if (theme?.parentNode) theme.parentNode.insertBefore(btn, theme);

  // ── Wire interactions (event delegation, so panels and cards built later are covered) ──
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const internal = (a) => a && a.origin === location.origin && !a.hasAttribute("download") && a.target !== "_blank";

  // Panels opening / closing: watch aria-expanded on the tabs
  const seen = new WeakMap();
  const tabObserver = new MutationObserver((list) => {
    for (const m of list) {
      const open = m.target.getAttribute("aria-expanded") === "true";
      if (seen.get(m.target) === open) continue;
      seen.set(m.target, open);
      if (m.oldValue !== null || open) play(open ? "dock.open" : "dock.close");
    }
  });
  document.querySelectorAll("#work-tab, #menu-tab, #contact-tab").forEach((t) => {
    seen.set(t, t.getAttribute("aria-expanded") === "true");
    tabObserver.observe(t, { attributes: true, attributeFilter: ["aria-expanded"], attributeOldValue: true });
  });

  // Hover: header items tick, project rows inside the open panel tap
  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" || !fine.matches) return;
    const row = e.target.closest?.(".panel .pcard__list a");
    if (row) { if (!row.contains(e.relatedTarget)) play("dock.hover"); return; }
    const item = e.target.closest?.(".header .seg__item:not(.seg__brand):not(.seg__time), .header .icon-btn:not(#theme)");
    if (item && !item.contains(e.relatedTarget)) play("nav.hover");
  });

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest(".work__tab, .chip")) { play("view.change"); return; }
    if (t.closest(".panel .btn--ghost")) { play("contact.copy"); return; }
    const a = t.closest("a[href]");
    if (a?.protocol === "mailto:") { play("contact.copy"); return; }
  });

  // ── Theme fader: a detent tick at every scale mark, pitch rising toward light, a firmer tap where it flips, a thunk at the ends ──
  const fader = document.getElementById("theme");
  if (fader && fader.hasAttribute("aria-valuenow")) {
    let lv = +fader.getAttribute("aria-valuenow"), notch = Math.round(lv / 10), flipped = lv >= 45;
    const step = (v) => R({ ...DIAL, pitch: 1320 + v * 9, volume: 15 });
    new MutationObserver(() => {
      const v = +fader.getAttribute("aria-valuenow");
      if (!Number.isFinite(v) || v === lv) return;
      const n = Math.round(v / 10), f = v >= 45, end = (v === 0 || v === 100) && lv !== v;
      lv = v;
      if (end) { notch = n; flipped = f; play("dock.open"); }
      else if (f !== flipped) { notch = n; flipped = f; play("page.navigate", R({ ...TAP, pitch: 1100 + v * 6, duration: 45, body: 25, volume: 24 })); }
      else if (n !== notch) { notch = n; play("nav.hover", step(v)); }
    }).observe(fader, { attributes: true, attributeFilter: ["aria-valuenow"] });
  }

  // Page changes unload the document, so sound the tap on press (the click would cut it off)
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.("a[href]");
    if (!internal(a) || a.getAttribute("href").startsWith("#")) return;
    if (a.pathname === location.pathname) return;
    play(a.pathname.startsWith("/work/") ? "project.open" : "page.navigate");
  });
})();
