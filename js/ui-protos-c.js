// Playground: live, pixel-matched prototypes — profileCollections (1024x768) and designGuidelines (1200x800).
// Built at a fixed design size, scaled to the stage by a ResizeObserver. Pointer maths divides by the current scale.
(() => {
  if (!window.Playground || !window.Playground.DEMOS) return;
  const motionOff = () => (window.motionReduced ? window.motionReduced() : matchMedia("(prefers-reduced-motion: reduce)").matches);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Fit a fixed-size canvas into its stage: scale = min(stageW/W, stageH/H)
  function fitBox(stage, el, W, H) {
    let s = 1;
    el.style.width = `${W}px`; el.style.height = `${H}px`;
    const apply = () => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      s = Math.min(r.width / W, r.height / H);
      el.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(stage); apply();
    return { scale: () => s, stop: () => ro.disconnect() };
  }

  // Add a listener and remember how to remove it
  function binder() {
    const offs = [];
    return {
      on(t, ev, fn, opt) { t.addEventListener(ev, fn, opt); offs.push(() => t.removeEventListener(ev, fn, opt)); },
      off() { offs.splice(0).forEach((f) => f()); },
    };
  }

  /* ───────────────────────── Profile collections ───────────────────────── */
  const PC_TILES = {
    A: { cls: "pc-t-sun", alt: "Sunset over a lake" },
    V: { cls: "pc-t-vid", alt: "Video, 4:03", video: true },
    G: { cls: "pc-t-grey", alt: "Soft grey study" },
    L: { cls: "pc-t-lantern", alt: "Room with paper lantern" },
    C: { cls: "pc-t-curtain", alt: "Curtains and mirror", link: true },
    T: { cls: "pc-t-text", alt: "Note", text: true },
    R: { cls: "pc-t-red", alt: "Red study" },
    O: { cls: "pc-t-orange", alt: "Orange study" },
    M: { cls: "pc-t-mint", alt: "Mint study" },
  };
  const PC_ORDER = ["A", "V", "G", "L", "C", "T", "R", "O", "M"];
  const PC_COLL = [
    { name: "Rabbit hole", items: 128, upd: "10 hours ago", show: "AVGLCTROM", thumbs: ["pc-th1", "pc-th2", "pc-th3", "pc-th4"] },
    { name: "Outdoors", items: 42, upd: "2 days ago", show: "AOMRG", thumbs: ["pc-th2", "pc-th1", "pc-th5", "pc-th6"] },
    { name: "Architecture", items: 18, upd: "8 hours ago", show: "LCGA", thumbs: ["pc-th1", "pc-th2", "pc-th3", "pc-th4"] },
    { name: "Readings", items: 56, upd: "5 days ago", show: "TGLM", thumbs: ["pc-th6", "pc-th4", "pc-th2", "pc-th5"] },
    { name: "Mood", items: 91, upd: "1 hour ago", show: "ROVAMC", thumbs: ["pc-th3", "pc-th5", "pc-th1", "pc-th6"] },
    { name: "Films", items: 27, upd: "3 weeks ago", show: "VCLR", thumbs: ["pc-th4", "pc-th3", "pc-th6", "pc-th2"] },
  ];
  const PC_TXT = ["In a forest of dusk and", "shadows, a place once", "known only as the", "rabbit hole opens.", "To really dance at the", "bottom you must trust", "the boundary of the dark.", "Where the light is thin,", "gentle things gather and", "waits very still for you,", "unhurried and unseen."];

  function profileCollections(stage) {
    const W = 1024, H = 768, ROW0 = 250, PITCH = 40.5;
    const rm = () => motionOff();
    const root = document.createElement("div");
    root.className = "ix pc is-idle";
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", "Profile with collections: Elsa Nilsson");
    const check = '<svg class="pc-badge" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .8l1.9 1.3 2.3-.2.9 2.1 2 1.2-.7 2.2.7 2.2-2 1.2-.9 2.1-2.3-.2L8 15.2l-1.9-1.3-2.3.2-.9-2.1-2-1.2.7-2.2-.7-2.2 2-1.2.9-2.1 2.3.2z" fill="#1d1d1b"/><path d="M5.2 8.2l2 2 3.6-3.8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const globe = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.3" fill="#2b2a27"/><g fill="none" stroke="#eae6e0" stroke-width="1"><circle cx="8" cy="8" r="5"/><ellipse cx="8" cy="8" rx="2.1" ry="5"/><path d="M3 8h10"/></g></svg>';
    const link = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 0 0-3.7-3.7l-.8.8M9.2 6.8a2.6 2.6 0 0 0-3.7 0l-2 2a2.6 2.6 0 0 0 3.7 3.7l.8-.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
    const cursor = '<svg viewBox="0 0 18 22" aria-hidden="true"><path d="M6.2 1.6c.9 0 1.5.7 1.5 1.5v5.2l.2-.1c.2-.5.7-.8 1.3-.8.7 0 1.2.4 1.4.9.3-.3.7-.4 1.1-.4.8 0 1.4.5 1.6 1.2.3-.2.6-.3 1-.3.9 0 1.6.7 1.6 1.7v3.3c0 2.6-2 5.4-4.6 5.4H8.6c-1.2 0-2.2-.5-3-1.5L2.1 13c-.5-.7-.3-1.6.4-2 .6-.4 1.3-.3 1.8.1l1 1V3.1c0-.8.4-1.5 1-1.5z" fill="#fff" stroke="#1a1a18" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 14.5v3M10.4 14.5v3M12.8 14.5v3" stroke="#1a1a18" stroke-width="1" stroke-linecap="round"/></svg>';
    const tiles = PC_ORDER.map((id) => {
      const t = PC_TILES[id];
      let inner = "";
      if (t.video) {
        inner = `<div class="pc-vfur"></div><div class="pc-vring"><svg viewBox="0 0 242 242" aria-hidden="true"><circle cx="121" cy="121" r="119.5" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="3" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"></circle></svg></div>
          <button type="button" class="pc-play" aria-label="Play video"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="pc-i-play" d="M6 3.6v12.8l10.4-6.4z" fill="#fff"/><path class="pc-i-pause" d="M5.5 3.5h3.2v13H5.5zM11.3 3.5h3.2v13h-3.2z" fill="#fff"/></svg></button>
          <div class="pc-scrub" role="slider" tabindex="0" aria-label="Scrub video" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i><b></b></div>
          <span class="pc-dur">4:03</span>`;
      } else if (t.text) {
        inner = `<div class="pc-note">${PC_TXT.map((l) => `<span>${l}</span>`).join("")}</div>`;
      } else if (t.link) {
        inner = `<span class="pc-link">${link}</span>`;
      }
      return `<div class="pc-tile" data-id="${id}"><div class="pc-face ${t.cls}${t.video ? " pc-vid" : ""}" ${t.video || t.text ? "" : `role="img" aria-label="${t.alt}"`} tabindex="0">${inner}</div></div>`;
    }).join("");
    root.innerHTML = `
      <div class="pc-win"></div>
      <aside class="pc-side">
        <div class="pc-ava" role="img" aria-label="Elsa Nilsson portrait"></div>
        <div class="pc-name">Elsa Nilsson ${check}</div>
        <div class="pc-handle">@elsa.n</div>
        <p class="pc-bio">Product designer at Spotify and design<br>educator based in Stockholm, Sweden</p>
        <div class="pc-site">${globe}<span>elsanilsson.com</span></div>
        <button type="button" class="pc-follow" aria-pressed="false"><span class="pc-f-a">Follow</span><span class="pc-f-b">Following</span></button>
        <button type="button" class="pc-msg">Message</button>
        <div class="pc-colh" id="pc-colh">Collections</div>
        <div class="pc-hlbg" aria-hidden="true"></div>
        <div class="pc-list" role="list" aria-labelledby="pc-colh">
          ${PC_COLL.map((c, i) => `<button type="button" class="pc-row" role="listitem" data-i="${i}" style="top:${ROW0 + i * PITCH}px" aria-pressed="${i === 0}">${c.name}</button>`).join("")}
        </div>
      </aside>
      <div class="pc-bar">
        <div class="pc-chip pc-c1"><b class="pc-cn">Rabbit hole</b><span class="pc-cc">128 items</span></div>
        <div class="pc-chip pc-c2" aria-label="Collaborators"><i class="pc-av a1"></i><i class="pc-av a2"></i><i class="pc-av a3"></i><i class="pc-av a4"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6" cy="5.5" r="2.3" fill="none" stroke="#9a9894" stroke-width="1.2"/><path d="M1.8 13c.3-2.3 2-3.5 4.2-3.5s3.9 1.2 4.2 3.5M13 4.5v4M11 6.5h4" fill="none" stroke="#9a9894" stroke-width="1.2" stroke-linecap="round"/></svg></i></div>
        <div class="pc-chip pc-c3">Last updated: <span class="pc-cu">10 hours ago</span></div>
        <button type="button" class="pc-dots" aria-label="More options"><i></i><i></i><i></i></button>
      </div>
      <div class="pc-grid" aria-live="polite">${tiles}</div>
      <div class="pc-card" aria-hidden="true">
        <div class="pc-ct">Architecture</div><div class="pc-cs">18 items</div>
        <div class="pc-ths"><i class="pc-th1"></i><i class="pc-th2"></i><i class="pc-th3"></i><i class="pc-th4"></i></div>
        <div class="pc-cav"><i class="a1"></i><i class="a5"></i></div>
        <div class="pc-cl">Last updated: <span>8 hours ago</span></div>
      </div>
      <div class="pc-cursor" aria-hidden="true">${cursor}</div>`;
    stage.appendChild(root);
    const f = fitBox(stage, root, W, H);

    const $ = (s) => root.querySelector(s);
    const rows = [...root.querySelectorAll(".pc-row")];
    const tileEls = {}; root.querySelectorAll(".pc-tile").forEach((t) => { tileEls[t.dataset.id] = t; });
    const hlbg = $(".pc-hlbg"), card = $(".pc-card"), cursorEl = $(".pc-cursor");
    const B = binder();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    let sel = 0, hov = 2, leaveT = 0, interacted = false;

    const rowTop = (i) => ROW0 + i * PITCH;
    function place() {
      const c = PC_COLL[sel], vis = c.show.split("");
      PC_ORDER.forEach((id) => {
        const el = tileEls[id], k = vis.indexOf(id);
        const slot = k >= 0 ? k : vis.length + PC_ORDER.indexOf(id);
        const x = (slot % 3) * 260, y = Math.floor(slot / 3) * 261;
        el.style.transitionDelay = rm() ? "0s" : `${Math.max(0, k) * 28}ms`;
        el.style.transform = `translate(${x}px,${y}px) scale(${k >= 0 ? 1 : 0.9})`;
        el.style.opacity = k >= 0 ? "1" : "0";
        el.style.pointerEvents = k >= 0 ? "" : "none";
        el.setAttribute("aria-hidden", k >= 0 ? "false" : "true");
        el.querySelector(".pc-face").tabIndex = k >= 0 ? 0 : -1;
      });
    }
    function setSel(i) {
      sel = i;
      rows.forEach((r, j) => r.setAttribute("aria-pressed", String(j === i)));
      const c = PC_COLL[i];
      $(".pc-cn").textContent = c.name; $(".pc-cc").textContent = `${c.items} items`; $(".pc-cu").textContent = c.upd;
      place();
      if (!rm()) $(".pc-bar").animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 260, easing: "ease-out" });
    }
    function setHover(i, instant) {
      hov = i;
      const c = PC_COLL[i];
      hlbg.style.top = `${rowTop(i)}px`;
      hlbg.style.opacity = "1";
      const top = Math.min(118 + rowTop(i) + 17 + 40, 574);
      if (instant) { card.style.transition = "none"; }
      card.style.top = `${top}px`;
      card.style.opacity = "1"; card.style.transform = "translateY(0) scale(1)";
      if (instant) { void card.offsetWidth; card.style.transition = ""; }
      cursorEl.style.top = `${118 + rowTop(i) + 23}px`;
      card.querySelector(".pc-ct").textContent = c.name;
      card.querySelector(".pc-cs").textContent = `${c.items} items`;
      card.querySelector(".pc-cl span").textContent = c.upd;
      const ths = card.querySelectorAll(".pc-ths i");
      ths.forEach((t, k) => { t.className = c.thumbs[k]; });
      if (!rm() && !instant) ths.forEach((t, k) => t.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 260, delay: k * 35, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }));
    }
    function leaveList() {
      clearTimeout(leaveT);
      leaveT = setTimeout(() => {
        if (interacted) { card.style.opacity = "0"; card.style.transform = "translateY(6px) scale(.98)"; hlbg.style.opacity = "0"; }
      }, 140);
    }
    function touched() { if (!interacted) { interacted = true; root.classList.remove("is-idle"); } }

    rows.forEach((r, i) => {
      B.on(r, "pointerenter", () => { touched(); clearTimeout(leaveT); setHover(i); });
      B.on(r, "focus", () => { touched(); clearTimeout(leaveT); setHover(i); });
      B.on(r, "pointerleave", leaveList);
      B.on(r, "blur", leaveList);
      B.on(r, "click", () => { touched(); setSel(i); });
    });
    B.on(root, "pointerenter", touched);

    // Follow
    const follow = $(".pc-follow");
    B.on(follow, "click", () => {
      const on = follow.getAttribute("aria-pressed") !== "true";
      follow.setAttribute("aria-pressed", String(on));
      follow.classList.toggle("is-on", on);
    });

    // Video: faux progress + scrub (runs about 48x so progress is visible)
    const vid = $(".pc-vid"), playBtn = $(".pc-play"), scrub = $(".pc-scrub"), ring = $(".pc-vring circle"), dur = $(".pc-dur");
    const TOTAL = 243;
    let prog = 0, playing = false, tick = 0;
    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    function paint() {
      const p = clamp(prog, 0, 1);
      scrub.firstElementChild.style.width = `${p * 100}%`;
      scrub.lastElementChild.style.left = `${p * 100}%`;
      scrub.setAttribute("aria-valuenow", String(Math.round(p * 100)));
      ring.setAttribute("stroke-dashoffset", String(100 - p * 100));
      dur.textContent = p > 0 || playing ? `-${fmt(TOTAL * (1 - p))}` : "4:03";
    }
    function setPlay(on) {
      playing = on;
      vid.classList.toggle("is-playing", on);
      playBtn.setAttribute("aria-label", on ? "Pause video" : "Play video");
      clearInterval(tick);
      if (on) tick = setInterval(() => { prog += 0.1 / (TOTAL / 48); if (prog >= 1) { prog = 0; setPlay(false); } paint(); }, 100);
    }
    B.on(playBtn, "click", (e) => { e.stopPropagation(); touched(); setPlay(!playing); });
    const seek = (e) => { const r = scrub.getBoundingClientRect(); prog = clamp((e.clientX - r.left) / f.scale() / (r.width / f.scale()), 0, 1); paint(); };
    let dragging = false;
    B.on(scrub, "pointerdown", (e) => { dragging = true; scrub.setPointerCapture(e.pointerId); vid.classList.add("is-scrub"); seek(e); e.stopPropagation(); });
    B.on(scrub, "pointermove", (e) => { if (dragging) seek(e); });
    const endDrag = (e) => { dragging = false; vid.classList.remove("is-scrub"); try { scrub.releasePointerCapture(e.pointerId); } catch (_) {} };
    B.on(scrub, "pointerup", endDrag); B.on(scrub, "pointercancel", endDrag);
    B.on(scrub, "keydown", (e) => {
      if (e.key === "ArrowRight") { prog = clamp(prog + 0.05, 0, 1); paint(); e.preventDefault(); }
      if (e.key === "ArrowLeft") { prog = clamp(prog - 0.05, 0, 1); paint(); e.preventDefault(); }
    });
    B.on(vid, "keydown", (e) => { if (e.target === vid && (e.key === " " || e.key === "Enter")) { e.preventDefault(); setPlay(!playing); } });

    // Reduced motion flag, live
    const syncRM = () => root.classList.toggle("pc-rm", rm());
    syncRM(); B.on(window, "motionchange", syncRM);

    setSel(0); setHover(2, true); paint();
    return function cleanup() {
      B.off(); f.stop(); clearInterval(tick); clearTimeout(leaveT);
      timers.forEach(clearTimeout); timers.clear(); root.remove();
    };
  }

  /* ───────────────────────── Design guidelines ───────────────────────── */
  const DG_NAV = [
    { key: "Design principles", chev: true, w: 94, page: "Foundations", tabs: ["Overview", "Values", "Voice", "Examples"] },
    { key: "Guidelines", chev: true, w: 67, page: "Logotype", tabs: ["Overview", "Versions", "Positions", "Assets"] },
    { key: "Resources", chev: true, w: 66, page: "Downloads", tabs: ["Overview", "Files", "Templates", "Tools"] },
    { key: "Inspiration", chev: true, w: 66, page: "Gallery", tabs: ["Overview", "Campaigns", "Products", "Partners"] },
  ];
  const DG_LEFT = [534, 628, 698, 768];
  const GL = "Introduction";
  // Per page: [intro lines], [secName, secSub, lines, art, items]
  const DG_PAGES = {
    "Guidelines|Overview": {
      intro: ["The Doconomy logotype is the centerpiece of our visual identity and a vital", "representation of our brand. It serves as a symbol of our company, the", "innovator of our solutions, and the sender of our messages. Our logotype is", "the most crucial visual asset we have, and it is essential to maintain its", "integrity and consistency in all our designs and communications."],
      sec: ["Symbol", "Introduction", ["Our symbol is carefully developed", "with precision and purpose."], "symbol"],
      items: [["Grid", ["The area is an optical square."]], ["Path", ["The circle shape is optically corrected."]], ["Color versions", ["Note that the black and then white versions", "of the artwork is not identical. The white", "version has optically ajusted inner shapes."]]],
    },
    "Guidelines|Versions": {
      intro: ["The logotype exists in three versions: primary, compact and symbol only.", "Use the primary version wherever space allows, and fall back to the", "compact version in narrow placements such as app headers and badges.", "Never redraw, recolour or rearrange the parts of any version."],
      sec: ["Wordmark", "Primary version", ["The wordmark pairs the symbol", "with the name in a single line."], "wordmark"],
      items: [["Primary", ["Symbol and name, side by side."]], ["Compact", ["Symbol above the name, centred."]], ["Symbol", ["For avatars and favicons only."]]],
    },
    "Guidelines|Positions": {
      intro: ["Place the logotype top left or centred, never closer to an edge than the", "clear space allows. On photography, pick the quietest area of the image", "and use the white version for contrast. Keep one logotype per layout."],
      sec: ["Clear space", "Minimum distance", ["Keep a margin of one symbol-height", "free around the logotype."], "wordmark"],
      items: [["Margin", ["Equal to the height of the symbol."]], ["Placement", ["Top left, or centred on covers."]], ["Contrast", ["Check at least 4.5 to 1 on photos."]]],
    },
    "Guidelines|Assets": {
      intro: ["Download the approved logotype files below. Each pack contains vector", "and raster formats in light and dark versions, named by use. If you need", "a format that is not listed, ask the brand team before exporting your own."],
      sec: ["Downloads", "Logotype pack", ["SVG, PNG and PDF in every colour", "version, updated this quarter."], "swatches"],
      items: [["SVG", ["For web and product interfaces."]], ["PNG", ["For slides and documents."]], ["PDF", ["For print and press."]]],
    },
    "Design principles|Overview": {
      intro: ["Our principles describe how we make decisions. They keep products", "honest, calm and useful, and they give teams a shared way to say no", "when something does not serve people. Start here before any guideline."],
      sec: ["Principles", "Introduction", ["Four ideas guide every screen", "we ship across the company."], "swatches"],
      items: [["Clarity", ["Say one thing at a time."]], ["Trust", ["Show what is happening and why."]], ["Care", ["Design for the worst day, too."]]],
    },
    "Design principles|Values": {
      intro: ["Values sit under the principles. They describe the character of the", "company, and they show up in tone, pace and the small details that", "people remember long after they have closed the app."],
      sec: ["Values", "Character", ["Plain, warm and precise in", "everything we put out."], "wordmark"],
      items: [["Plain", ["Prefer short words."]], ["Warm", ["Speak like a person."]], ["Precise", ["Numbers need context."]]],
    },
    "Design principles|Voice": {
      intro: ["Our voice is the same in a headline and an error message. It is", "direct, kind and never clever at the expense of the reader. Write it", "aloud before you ship it, and cut every word that does not help."],
      sec: ["Voice", "Tone of voice", ["Direct and kind, in every", "headline and every error."], "swatches"],
      items: [["Direct", ["Lead with the answer."]], ["Kind", ["Blame the system, not the user."]], ["Brief", ["Cut what does not help."]]],
    },
    "Design principles|Examples": {
      intro: ["Examples show the principles at work in shipped products. Each one", "names the decision, the alternative we rejected and what we learned", "after release, so teams can borrow the reasoning, not just the pixels."],
      sec: ["Examples", "In practice", ["Three shipped decisions and", "the reasoning behind them."], "symbol"],
      items: [["Savings", ["Removed a step, kept the trust."]], ["Cards", ["Showed limits before the swipe."]], ["Support", ["Answers first, chat second."]]],
    },
    "Resources|Overview": {
      intro: ["Everything you need to build in our system lives here: files, templates", "and tools, all versioned. Download only from this page, so you always", "work from the latest approved source."],
      sec: ["Library", "Introduction", ["Files, templates and tools,", "versioned and kept in one place."], "swatches"],
      items: [["Files", ["Design libraries and tokens."]], ["Templates", ["Slides, docs and social."]], ["Tools", ["Plugins and checkers."]]],
    },
    "Resources|Files": {
      intro: ["Design files are published to the shared library and mirrored here for", "offline use. Each file lists its version, owner and the date of its last", "review. Duplicate before editing and never detach components."],
      sec: ["Files", "Design libraries", ["Core components, icons and", "colour tokens for product work."], "symbol"],
      items: [["Core", ["Buttons, inputs and layout."]], ["Icons", ["Two weights, one grid."]], ["Tokens", ["Colour, type and spacing."]]],
    },
    "Resources|Templates": {
      intro: ["Templates save time and keep decks, documents and social posts on", "brand. They are locked to the grid and the type scale, so you only", "change the content and not the structure."],
      sec: ["Templates", "Starting points", ["Slides, documents and social", "formats in light and dark."], "wordmark"],
      items: [["Slides", ["16 by 9, with speaker notes."]], ["Docs", ["Letter and A4 variants."]], ["Social", ["Square and story formats."]]],
    },
    "Resources|Tools": {
      intro: ["A small set of tools helps teams stay consistent: a contrast checker,", "a spacing inspector and a token linter. They run in the design tool", "and in code review, so problems surface before release."],
      sec: ["Tools", "Checkers and linters", ["Catch contrast and spacing", "issues before they ship."], "swatches"],
      items: [["Contrast", ["Flags pairs below 4.5 to 1."]], ["Spacing", ["Snaps to the 4 px grid."]], ["Tokens", ["Warns about raw values."]]],
    },
    "Inspiration|Overview": {
      intro: ["Inspiration collects work we admire, from inside the company and", "from outside it. Browse by campaign, product or partner, and save", "what you find useful to your own board for the next review."],
      sec: ["Gallery", "Introduction", ["Campaigns, products and partners", "worth studying closely."], "symbol"],
      items: [["Campaigns", ["Seasonal and brand work."]], ["Products", ["Interfaces we are proud of."]], ["Partners", ["Joint launches and co-brands."]]],
    },
    "Inspiration|Campaigns": {
      intro: ["Campaigns show the logotype and the type system working at scale, on", "posters, film and social. Each entry credits the team and links to the", "brief, so the thinking is as easy to find as the finished work."],
      sec: ["Campaigns", "Spring edition", ["A calm, type-led campaign", "across print and screens."], "wordmark"],
      items: [["Poster", ["One word, one colour."]], ["Film", ["Eight seconds, no voice."]], ["Social", ["Square crops, same grid."]]],
    },
    "Inspiration|Products": {
      intro: ["Products shows shipped interfaces that use the system well. Look for", "restraint, clear hierarchy and honest empty states, then ask what you", "would leave out of your own screens."],
      sec: ["Products", "Shipped work", ["Interfaces that use the system", "with restraint and care."], "swatches"],
      items: [["Mobile", ["Savings and cards."]], ["Web", ["Dashboards and reports."]], ["Watch", ["Glanceable balances."]]],
    },
    "Inspiration|Partners": {
      intro: ["Partner work covers co-branded launches and integrations. The", "logotype lockup follows the clear-space rules, with equal visual weight", "for both marks and a neutral background between them."],
      sec: ["Partners", "Co-brand lockups", ["Two marks, equal weight,", "and a neutral gap between."], "symbol"],
      items: [["Lockup", ["Equal weight, centred."]], ["Gap", ["Two symbol-heights."]], ["Colour", ["One colour, one background."]]],
    },
  };

  function dgArt(kind) {
    const sym = `
      <svg class="dg-a dg-a1" viewBox="0 0 284 330" width="284" height="330" aria-hidden="true"><defs><pattern id="dgg" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M6 0H0V6" fill="none" stroke="#d4d4cf" stroke-width=".5"/></pattern></defs>
        <path d="M0 0H137A147 147 0 0 1 284 147V330H0Z" fill="#dedfda"/><path d="M0 0H137A147 147 0 0 1 284 147V330H0Z" fill="url(#dgg)"/>
        <path d="M.5 330V.5H137A146.5 146.5 0 0 1 283.5 147" fill="none" stroke="#2c2c2a" stroke-width="1"/>
        <path d="M91 71H173L214 142V330H50V142Z" fill="none" stroke="#2c2c2a" stroke-width="1"/>
        <path d="M279 0V330" stroke="#8d8d89" stroke-width="1" stroke-dasharray="4 4"/></svg>
      <svg class="dg-a dg-a2" viewBox="0 0 340 330" width="340" height="330" aria-hidden="true">
        <path d="M0 0H213" stroke="#2c2c2a" stroke-width=".8"/><circle cx="133" cy="0" r="1.6" fill="#2c2c2a"/><circle cx="213" cy="0" r="1.6" fill="#2c2c2a"/><path d="M0 0V330" stroke="#bdbdb8" stroke-width=".8"/>
        <circle cx="150" cy="150" r="150" fill="none" stroke="#d7d2a4" stroke-width=".9"/>
        <path d="M84 71H166L206 142V330H44V142Z" fill="none" stroke="#2c2c2a" stroke-width=".9"/>
        <circle cx="330" cy="62" r="1.5" fill="#2c2c2a"/><path d="M330 62V200" stroke="#b9b9b4" stroke-width=".7"/></svg>`;
    const word = `<div class="dg-wm"><svg viewBox="0 0 40 40" width="46" height="46" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="currentColor"/><path d="M12 15h16l5 8v9H7v-9z" fill="var(--dg-bgc)"/></svg><b>Doconomy</b></div>`;
    const sw = `<div class="dg-sw"><i style="--c:#171815"></i><i style="--c:#f5f5f3"></i><i style="--c:#dedfda"></i><i style="--c:#d7d2a4"></i></div>`;
    return kind === "symbol" ? sym : kind === "wordmark" ? word : sw;
  }

  function dgSection(key, tab) {
    const p = DG_PAGES[`${key}|${tab}`];
    const sec = p.sec;
    return `
      <section class="dg-sec dg-intro"><div class="dg-lab">${GL}</div><p class="dg-lead">${p.intro.map((l) => `<span>${l}</span>`).join("")}</p></section>
      <section class="dg-sec dg-sym">
        <div class="dg-slab"><b>${sec[0]}</b><span>${sec[1]}</span></div>
        <p class="dg-sp">${sec[2].map((l) => `<span>${l}</span>`).join("")}</p>
        <ol class="dg-list">${p.items.map((it, i) => `<li><em>${i + 1}</em><b>${it[0]}</b>${it[1].map((l) => `<span>${l}</span>`).join("")}</li>`).join("")}</ol>
        <div class="dg-canvas" data-art="${sec[3]}">
          <div class="dg-ctl" role="toolbar" aria-label="Logotype view">
            <button type="button" class="dg-pill" data-act="space" aria-pressed="false">Clear space</button>
            <span class="dg-seg" role="group" aria-label="Size"><button type="button" data-size="1" aria-pressed="true">S</button><button type="button" data-size="1.1" aria-pressed="false">M</button><button type="button" data-size="1.2" aria-pressed="false">L</button></span>
            <button type="button" class="dg-pill" data-act="dark" aria-pressed="false">Dark</button>
          </div>
          <div class="dg-art">${dgArt(sec[3])}<div class="dg-clear" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
        </div>
      </section>
      <section class="dg-sec dg-more"><div class="dg-lab">Usage</div><p class="dg-lead dg-lead2"><span>Use the artwork exactly as supplied. Do not stretch, rotate, outline</span><span>or add effects. When in doubt, ask the brand team before you ship.</span></p></section>
      <div class="dg-pad"></div>`;
  }

  function designGuidelines(stage) {
    const W = 1200, H = 800;
    const root = document.createElement("div");
    root.className = "ix dg";
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", "Doconomy Design guidelines site");
    const chev = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.6 5 6.6l3-3" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    root.innerHTML = `
      <div class="dg-win">
        <header class="dg-hd">
          <div class="dg-logo">Doconomy Design</div>
          <nav class="dg-nav" aria-label="Sections">${DG_NAV.map((n, i) => `<button type="button" class="dg-ni" data-i="${i}" style="left:${DG_LEFT[i]}px;width:${n.w + (i === 1 ? 0 : 0)}px" aria-pressed="${i === 1}"><span>${n.key}</span>${chev}</button>`).join("")}</nav>
          <button type="button" class="dg-bell" aria-label="Notifications"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.8a3.3 3.3 0 0 0-3.3 3.3c0 2.5-1 3.4-1.4 4.1h9.4c-.4-.7-1.4-1.6-1.4-4.1A3.3 3.3 0 0 0 7 1.8zM5.7 11a1.4 1.4 0 0 0 2.6 0" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <button type="button" class="dg-me" aria-label="Account"></button>
        </header>
        <div class="dg-title" aria-live="polite"><div class="dg-t1"></div><div class="dg-t2"></div></div>
        <div class="dg-page" tabindex="0" role="region" aria-label="Guidelines page">
          <div class="dg-tabs" role="tablist"></div>
          <div class="dg-body"></div>
        </div>
      </div>`;
    stage.appendChild(root);
    const f = fitBox(stage, root, W, H);
    const $ = (s) => root.querySelector(s);
    const B = binder();
    const navBtns = [...root.querySelectorAll(".dg-ni")];
    const tabsEl = $(".dg-tabs"), body = $(".dg-body"), t1 = $(".dg-t1"), t2 = $(".dg-t2"), page = $(".dg-page");
    let nav = 1, tab = 0, view = { space: false, dark: false, size: 1 };
    const rm = () => motionOff();
    const anim = (el, kf, o) => { if (!rm()) el.animate(kf, Object.assign({ duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" }, o)); };

    function renderTabs() {
      const n = DG_NAV[nav];
      tabsEl.innerHTML = n.tabs.map((t, i) => `<button type="button" role="tab" class="dg-tab" data-i="${i}" aria-selected="${i === tab}">${t}</button>`).join("");
    }
    function renderBody(animate) {
      body.innerHTML = dgSection(DG_NAV[nav].key, DG_NAV[nav].tabs[tab]);
      applyView();
      if (animate) anim(body, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }]);
    }
    function renderTitle(animate) {
      const n = DG_NAV[nav];
      t1.textContent = n.key; t2.textContent = n.page;
      if (animate) { anim(t1, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 320 }); anim(t2, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 360, delay: 40, fill: "backwards" }); }
    }
    function applyView() {
      body.querySelectorAll(".dg-canvas").forEach((c) => {
        c.classList.toggle("is-dark", view.dark); c.classList.toggle("is-space", view.space);
        c.style.setProperty("--dg-z", String(view.size));
        c.querySelector('[data-act="space"]').setAttribute("aria-pressed", String(view.space));
        c.querySelector('[data-act="dark"]').setAttribute("aria-pressed", String(view.dark));
        c.querySelector('[data-act="dark"]').textContent = view.dark ? "Light" : "Dark";
        c.querySelectorAll("[data-size]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.size) === view.size)));
      });
    }
    function go(i) {
      if (i === nav) return;
      nav = i; tab = 0;
      navBtns.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
      renderTitle(true); renderTabs(); page.scrollTo({ top: 0, behavior: rm() ? "auto" : "smooth" }); renderBody(true);
    }
    navBtns.forEach((b, i) => B.on(b, "click", () => go(i)));
    B.on(tabsEl, "click", (e) => {
      const b = e.target.closest(".dg-tab"); if (!b) return;
      const i = Number(b.dataset.i); if (i === tab) return;
      tab = i;
      tabsEl.querySelectorAll(".dg-tab").forEach((t, j) => t.setAttribute("aria-selected", String(j === i)));
      renderBody(true);
    });
    B.on(tabsEl, "keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = DG_NAV[nav].tabs.length, i = (tab + (e.key === "ArrowRight" ? 1 : n - 1)) % n;
      tab = i;
      tabsEl.querySelectorAll(".dg-tab").forEach((t, j) => t.setAttribute("aria-selected", String(j === i)));
      tabsEl.querySelectorAll(".dg-tab")[i].focus(); renderBody(true); e.preventDefault();
    });
    B.on(body, "click", (e) => {
      const a = e.target.closest("[data-act]"), s = e.target.closest("[data-size]");
      if (a) { view[a.dataset.act] = !view[a.dataset.act]; applyView(); }
      else if (s) { view.size = Number(s.dataset.size); applyView(); }
    });
    // Keep wheel scrolling inside the page area
    B.on(page, "wheel", (e) => {
      const max = page.scrollHeight - page.clientHeight;
      if ((e.deltaY < 0 && page.scrollTop <= 0) || (e.deltaY > 0 && page.scrollTop >= max - 1)) return;
      e.stopPropagation();
    }, { passive: true });
    const syncRM = () => root.classList.toggle("dg-rm", rm());
    syncRM(); B.on(window, "motionchange", syncRM);

    renderTitle(false); renderTabs(); renderBody(false);
    return function cleanup() { B.off(); f.stop(); root.remove(); };
  }

  window.Playground.DEMOS.profileCollections = profileCollections;
  window.Playground.DEMOS.designGuidelines = designGuidelines;
})();
