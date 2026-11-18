// Gatherly walkthrough engine: the real Paper screens in a black iPhone that rises from the bottom of a soft off-white frame,
// with iOS push and cross-fade transitions and a light tap ripple before each one. Every frame is a pure function of t.
// A clip sets window.CLIP = { T, seq: [{ id, src, at, kind, dur, tap:{x,y} }] } (tap = where to touch THIS screen to reach the next one, in its 390x844 points), then loads this file.
(() => {
  const IMG = "../../../assets/images/gatherly/";
  const W = 1080, PW = 620, BZ = 14, SW = PW - 2 * BZ, SH = (SW * 844) / 390, PH = SH + 2 * BZ, K = SW / 390, BOTTOM = 1032, PL = (W - PW) / 2, PT = BOTTOM - PH;
  const { T, seq } = window.CLIP;
  const css = document.createElement("style");
  css.textContent = `*{box-sizing:border-box}html,body{margin:0;width:${W}px;height:${W}px;overflow:hidden;background:#F1F0EC}
  #stage{position:relative;width:${W}px;height:${W}px;overflow:hidden;background:#F1F0EC}
  .phone{position:absolute;left:${PL}px;top:${PT}px;width:${PW}px;height:${PH}px;border-radius:92px;background:#0B0B0C;box-shadow:inset 0 0 0 3px #28282c,0 60px 100px -34px rgba(40,32,24,.34),0 14px 34px -14px rgba(40,32,24,.28)}
  .btn{position:absolute;width:6px;border-radius:3px;background:#1d1d20}
  .screen{position:absolute;inset:${BZ}px;border-radius:78px;overflow:hidden;background:#fff;isolation:isolate}
  .layer{position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;will-change:transform,opacity}
  .layer img{display:block;width:100%;height:100%}
  .dim{position:absolute;inset:0;background:#000;opacity:0}
  .tap{position:absolute;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;background:rgba(255,255,255,.62);border:3px solid rgba(24,24,28,.38);box-shadow:0 6px 22px rgba(0,0,0,.22);opacity:0;pointer-events:none;z-index:8}
  .home{position:absolute;left:50%;bottom:14px;width:200px;height:7px;margin-left:-100px;border-radius:4px;background:rgba(18,18,20,.88);z-index:9}`;
  document.head.appendChild(css);
  const stage = document.createElement("div"); stage.id = "stage"; document.body.appendChild(stage);
  const phone = document.createElement("div"); phone.className = "phone"; stage.appendChild(phone);
  [[330, 40], [395, 74], [488, 74]].forEach(([y, h]) => { const b = document.createElement("i"); b.className = "btn"; b.style.cssText = `left:-5px;top:${330 + (y - 330)}px;height:${h}px`; phone.appendChild(b); });
  const pw = document.createElement("i"); pw.className = "btn"; pw.style.cssText = "right:-5px;top:430px;height:110px"; phone.appendChild(pw);
  const screen = document.createElement("div"); screen.className = "screen"; phone.appendChild(screen);
  const layers = {}, dims = {};
  [...new Set(seq.map((s) => s.id))].forEach((id) => {
    const l = document.createElement("div"); l.className = "layer"; const im = new Image(); im.src = IMG + seq.find((s) => s.id === id).src + ".webp"; l.appendChild(im);
    const d = document.createElement("div"); d.className = "dim"; l.appendChild(d); screen.appendChild(l); layers[id] = l; dims[id] = d;
  });
  const taps = seq.map((s) => { if (!s.tap) return null; const t = document.createElement("div"); t.className = "tap"; t.style.left = s.tap.x * K + "px"; t.style.top = s.tap.y * K + "px"; screen.appendChild(t); return t; });
  const home = document.createElement("div"); home.className = "home"; screen.appendChild(home);
  const clamp = (v) => Math.max(0, Math.min(1, v)), ease = (p) => 1 - Math.pow(1 - clamp(p), 4);
  window.render = (t) => {
    t = Math.min(t, T - 1e-6);
    let k = 0; seq.forEach((s, i) => { if (s.at <= t) k = i; });
    const cur = seq[k], prev = k > 0 ? seq[k - 1] : null, e = k > 0 ? ease((t - cur.at) / cur.dur) : 1;
    Object.keys(layers).forEach((id) => { const l = layers[id]; l.style.display = "none"; l.style.zIndex = 0; l.style.transform = "none"; l.style.opacity = 1; l.style.boxShadow = "none"; dims[id].style.opacity = 0; });
    const top = layers[cur.id]; top.style.display = "block"; top.style.zIndex = 2;
    if (prev && e < 1 && prev.id !== cur.id) {
      const below = layers[prev.id]; below.style.display = "block"; below.style.zIndex = 1;
      if (cur.kind === "push") { top.style.transform = `translateX(${(1 - e) * SW}px)`; top.style.boxShadow = `-14px 0 40px rgba(0,0,0,${0.2 * (1 - e)})`; below.style.transform = `translateX(${-0.3 * SW * e}px)`; dims[prev.id].style.opacity = 0.2 * e; }
      else top.style.opacity = e;
    }
    seq.forEach((s, i) => {
      const el = taps[i], nx = seq[i + 1]; if (!el || !nx) return; const a = nx.at - 0.22, u = t - a; // a tap on this screen leads to the next one
      if (u < 0 || u > 0.55) { el.style.opacity = 0; return; }
      const grow = clamp(u / 0.14), fade = clamp((u - 0.22) / 0.33);
      el.style.opacity = (grow * (1 - fade)).toFixed(3); el.style.transform = `scale(${(0.55 + 0.55 * ease(u / 0.3)).toFixed(3)})`;
    });
  };
  const imgs = [...document.images]; Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve()))).then(() => { window.render(0); window.__ready = true; });
})();
