// Payman AI page: barcode strip, count-up, steps stage, security tabs, CTA collage, demo video, demo form
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const once = (el, fn, threshold = 0.25) => {
    if (!el) return;
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { fn(); io.disconnect(); } }, { threshold }).observe(el);
  };
  // Same seed, same art, every load
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const PAL = ["#17595E", "#2F8A8C", "#66D6CC", "#0E3D42", "#D4B3CA", "#B98FAE", "#9A9A96", "#C9C9C4", "#F4FF45", "#171717"];
  const pick = () => { const r = rnd(); return r < 0.04 ? PAL[8] : r < 0.5 ? PAL[Math.floor(rnd() * 4)] : r < 0.7 ? PAL[4 + Math.floor(rnd() * 2)] : PAL[6 + Math.floor(rnd() * 2)]; };

  // Reveal on scroll
  $$(".rv").forEach((el) => once(el, () => el.classList.add("in"), 0.15));

  // Barcode strip
  const bc = $("#barcode");
  if (bc) {
    const frag = document.createDocumentFragment();
    for (let w = 0; w < 1500; ) { const i = document.createElement("i"), width = 2 + Math.floor(rnd() * 9); i.style.cssText = `width:${width}px;background:${pick()};opacity:${(0.55 + rnd() * 0.45).toFixed(2)}`; frag.appendChild(i); w += width; }
    bc.appendChild(frag);
  }

  // Stepped bars and tiers
  $$(".tier__bars").forEach((g) => $$("i", g).forEach((b, k) => b.style.setProperty("--k", k)));
  once($(".tiers"), () => $(".tiers").classList.add("in"), 0.2);

  // Count up
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    once(el, () => {
      if (reduce) { el.textContent = to; return; }
      const t0 = performance.now(), dur = 1500;
      const tick = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, 0.6);
  });

  // How it works: four steps drive the chat; auto-advances while visible
  const steps = $$("#steps li"), chat = $("#chat"), DUR = 5200;
  let active = 0, timer = null, visible = false;
  const show = (n) => {
    active = n;
    steps.forEach((li, i) => { li.classList.toggle("is-on", i === n); $("button", li).setAttribute("aria-expanded", String(i === n)); li.style.setProperty("--dur", `${DUR}ms`); });
    $$("[data-step]", chat).forEach((el) => el.classList.toggle("on", +el.dataset.step <= n + 1));
    chat.dataset.a = n + 1;
  };
  const stop = () => { clearTimeout(timer); timer = null; };
  const queue = () => { stop(); if (reduce || !visible) return; timer = setTimeout(() => { show((active + 1) % steps.length); queue(); }, DUR); };
  steps.forEach((li, i) => $("button", li).addEventListener("click", () => { show(i); queue(); }));
  show(0);
  if (chat) new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? queue() : stop(); }, { threshold: 0.3 }).observe($(".how"));
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : queue()));

  // Security tabs
  const TABS = [
    { k: "Data & custody", t: "Your data and your funds stay yours.", d: "Each institution gets its own isolated environment, and the regulated entity always holds the funds.", rows: [["Data isolation", "Dedicated databases, compute, and encryption keys per institution — not multi-tenant"], ["Custody", "Never ours — the regulated entity holds funds, license, and KYC"]] },
    { k: "Identity & policy", t: "Every action has a human and a rule.", d: "Nothing runs without a verified person behind it, and the policy layer cannot be talked around.", rows: [["Authentication", "Every action tied to a verified human"], ["Policy", "Immutable layer the model cannot override or reason around"]] },
    { k: "Audit & control", t: "See everything. Switch it off anytime.", d: "A complete trail of what happened and why, and a switch only the bank holds.", rows: [["Audit", "Complete, tamper-evident trail — explainable by default"], ["Kill switch", "Bank-held, instant"], ["Certification", "SOC 2 Type II · built to support your KYC, BSA, and AML obligations"]] },
  ];
  const tabs = $$("[role=tab]"), panel = $("#tab-panel");
  const paint = (i) => {
    const t = TABS[i];
    tabs.forEach((b, k) => { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    panel.setAttribute("aria-labelledby", `tb-${i}`);
    $("[data-k]", panel).textContent = t.k; $("[data-t]", panel).textContent = t.t; $("[data-d]", panel).textContent = t.d;
    const dl = $("[data-rows]", panel); dl.replaceChildren();
    t.rows.forEach(([k, v]) => { const d = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = k; dd.textContent = v; d.append(dt, dd); dl.appendChild(d); });
  };
  tabs.forEach((b, i) => {
    b.addEventListener("click", () => paint(i));
    b.addEventListener("keydown", (e) => { const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (n) { const j = (i + n + tabs.length) % tabs.length; paint(j); tabs[j].focus(); } });
  });
  paint(0);

  // CTA collage: colored strips and paper scraps around the form card
  const col = $("#collage");
  if (col) {
    const mk = (css) => { const i = document.createElement("i"); i.style.cssText = css; col.appendChild(i); };
    for (let k = 0; k < 46; k++) { const horiz = rnd() > 0.45, len = 40 + Math.floor(rnd() * 170), th = 6 + Math.floor(rnd() * 16), left = k % 2 ? rnd() * 28 : 62 + rnd() * 36; mk(`left:${left}%;top:${rnd() * 96}%;width:${horiz ? len : th}px;height:${horiz ? th : len}px;background:${pick()};opacity:${(0.5 + rnd() * 0.5).toFixed(2)}`); }
    [["#F3D9E8", "6%", "12%", -4], ["#DCEDEA", "78%", "58%", 3], ["#FFF8B8", "70%", "8%", 5], ["#E5E1F4", "2%", "62%", -2]].forEach(([bg, l, t, r]) => mk(`left:${l};top:${t};width:230px;height:150px;background:${bg};transform:rotate(${r}deg);box-shadow:0 20px 30px -18px rgba(0,0,0,.5)`));
  }

  // Product demo video plays only while visible
  const video = $("#demo-video");
  if (video && !reduce) {
    new IntersectionObserver(([e]) => { e.isIntersecting && !document.hidden ? video.play().catch(() => {}) : video.pause(); }, { threshold: 0.4 }).observe(video);
    document.addEventListener("visibilitychange", () => { if (document.hidden) video.pause(); });
  } else if (video) { video.controls = true; }

  // Demo form: validate locally, confirm in place
  const form = $("#demo-form"), msg = $("#form-msg");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = $$("input", form).find((i) => !i.value.trim() || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value)));
    if (bad) { msg.textContent = "Please complete every field with a valid work email."; bad.focus(); return; }
    msg.textContent = "Thanks. This is a portfolio recreation, so nothing was sent.";
    form.reset();
  });
})();
