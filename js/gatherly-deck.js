// Gatherly deck: the final designs of the Gatherly study as live HTML/CSS, mounted into [data-case-demo="gatherlyDeck"].
// Screens are rebuilt from the Paper file ("Gatherly": Explore, Event, Host dashboard) using its own --gl-* tokens (css/gatherly-deck.css),
// so one component renders both light and dark. Nothing here is an exported image except the annotated hand-off boards and the two films.
(() => {
  const P = "/assets/images/gatherly/";
  const ph = (n) => `${P}photos/${n}.jpg`;

  // ── pieces ──
  const SIGNAL = (c) => `<svg width="82" height="22" viewBox="0 0 82 22" aria-hidden="true"><path fill="${c}" d="M3.7 13H2.5a1 1 0 0 0-1 1v2.5a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1V14a1 1 0 0 0-1-1m5.2-2.5H7.7a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1M14.1 8h-1.2a1 1 0 0 0-1 1v7.5a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1m5.2-2.5h-1.2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1v-10a1 1 0 0 0-1-1"/><path fill="${c}" fill-rule="evenodd" d="M36.57 7.8c2.49 0 4.88.92 6.68 2.58.14.13.36.12.49 0l1.3-1.27a.34.34 0 0 0 0-.5 12.55 12.55 0 0 0-16.93 0 .34.34 0 0 0 0 .5l1.3 1.26c.13.13.34.14.48 0a10 10 0 0 1 6.68-2.57m0 4.22a5.4 5.4 0 0 1 3.67 1.44c.14.13.35.13.48 0l1.3-1.33a.37.37 0 0 0-.01-.52 7.9 7.9 0 0 0-10.88 0 .37.37 0 0 0 0 .52l1.29 1.32c.13.14.34.14.48 0 1-.92 2.31-1.43 3.67-1.43m2.52 2.8q0 .15-.1.28l-2.18 2.45a.3.3 0 0 1-.24.11.3.3 0 0 1-.24-.1l-2.18-2.46a.43.43 0 0 1 .01-.56 3.44 3.44 0 0 1 4.82 0 .4.4 0 0 1 .11.28"/><rect x="53.5" y="5.5" width="22" height="12" rx="3.5" fill="none" stroke="${c}" opacity=".35"/><rect x="54" y="7" width="21" height="9" rx="2.5" fill="${c}"/><path fill="${c}" opacity=".35" d="M78 9.5v4.08a2.2 2.2 0 0 0 1.33-2.04A2.2 2.2 0 0 0 78 9.5"/></svg>`;
  const status = (c) => `<div class="gl-status"${c ? ` style="color:${c}"` : ""}><span>9:41</span><span>${SIGNAL(c || "currentColor")}</span></div>`;
  const ic = (d, w = 18, sw = 2, st = "var(--gl-color-text-primary)", fill = "none") => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="${fill}" stroke="${st}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const STAR = "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9-4.3-4.1 5.9-.8z";
  const HEART = "M12 20.5C5.5 15.5 3 12 3 8.8 3 6.1 5.1 4 7.7 4c1.7 0 3.3.9 4.3 2.5C13 4.9 14.6 4 16.3 4 18.9 4 21 6.1 21 8.8c0 3.2-2.5 6.7-9 11.7z";
  const AV = {
    cat: ["#CDBBFF", '<path d="M12 38C10 30 10 22 14 14V8L19 12C22 11 26 11 29 12L34 8V14C38 22 38 30 36 38C30 41 18 41 12 38Z" fill="#1D1B20"/><ellipse cx="18" cy="26" rx="2.4" ry="3.8" fill="#fff"/><ellipse cx="30" cy="26" rx="2.4" ry="3.8" fill="#fff"/>'],
    crown: ["#FF7AD1", '<path d="M10 18L13 10L18 15L24 8L30 15L35 10L38 18V34Q38 40 32 40H16Q10 40 10 34Z" fill="#fff"/><path d="M14 25H22V27A4 4 0 0 1 14 27Z M26 25H34V27A4 4 0 0 1 26 27Z" fill="#FF7AD1"/><path d="M17 40L19 44L21 40ZM27 40L29 44L31 40Z" fill="#fff"/>'],
    chef: ["#FF6A1A", '<circle cx="16" cy="17" r="6" fill="#fff"/><circle cx="24" cy="14" r="7" fill="#fff"/><circle cx="32" cy="17" r="6" fill="#fff"/><rect x="14" y="18" width="20" height="8" rx="3" fill="#fff"/><rect x="14" y="23" width="20" height="3" fill="#ECECEC"/><path d="M8 48A16 16 0 0 1 40 48Z" fill="#FFC21A"/><path d="M16 38Q19 40 22 38M26 38Q29 40 32 38" fill="none" stroke="#B26A00" stroke-width="2" stroke-linecap="round"/>'],
    flame: ["#FF3B5C", '<path d="M24 6C28 14 38 18 38 30C38 38 32 42 24 42C16 42 10 38 10 30C10 22 16 18 18 12C20 15 21 16 22 16C23 12 23 9 24 6Z" fill="#fff"/><ellipse cx="19" cy="30" rx="2.6" ry="3.6" fill="#FF3B5C"/><ellipse cx="29" cy="30" rx="2.6" ry="3.6" fill="#FF3B5C"/>'],
  };
  const av = (k, lg, stack) => `<span class="gl-av${lg ? " gl-lg" : ""}" style="background:${AV[k][0]}${stack ? ";margin-left:-24px" : ""}"><svg viewBox="0 0 48 48" width="${lg ? 44 : 20}" height="${lg ? 44 : 20}" aria-hidden="true">${AV[k][1]}</svg></span>`;
  const FRAME_UNDER = '<i class="gl-ti"></i><i class="gl-bz"></i><i class="gl-sb gl-sb--a"></i><i class="gl-sb gl-sb--v1"></i><i class="gl-sb gl-sb--v2"></i><i class="gl-sb gl-sb--p"></i>', FRAME_OVER = '<i class="gl-isl"></i><i class="gl-gl"></i>';
  const phone = (cls, inner) => `<div class="glp-wrap">${FRAME_UNDER}<div class="glp gld-tok ${cls}" aria-hidden="true">${inner}</div>${FRAME_OVER}</div>`;

  // ── screens (structure and values read from the Paper nodes) ──
  const tab = (on, d, label) => `<div class="gl-tab${on ? " gl-on" : ""}">${ic(d, 26, on ? 2.2 : 1.8, on ? "#6D4AFF" : "#767676")}<span>${label}</span></div>`;
  const tabbar = `<div class="gl-tabbar">${tab(1, "M15.5 15.5L21 21M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13", "Explore")}${tab(0, HEART, "Saved")}${tab(0, "M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z", "Tickets")}${tab(0, "M4 5h16v11H10l-4 3.5V16H4z", "Messages")}${tab(0, "M12 3a9 9 0 100 18 9 9 0 000-18M12 7a3 3 0 100 6 3 3 0 000-6M6.5 18c1.2-2.5 3-3.5 5.5-3.5s4.3 1 5.5 3.5", "Profile")}</div>`;
  const card = (img, who, title, when, extra) => `<div class="gl-col" style="flex:none;width:232px;gap:10px"><div style="position:relative;width:232px;height:232px;border-radius:26%;background:url(${img}) 50%/cover"><div class="gl-abs gl-row${extra[0] === "Selling fast" ? " m-sell" : ""}" style="left:24px;top:24px;height:32px;padding:0 12px 0 4px;gap:8px;border-radius:999px;background:var(--gl-color-surface-card);font:500 13px/16px var(--gl-font)"><span class="gl-row m-avs">${who}</span>${extra[0]}</div>${extra[1] || ""}</div><div class="gl-col" style="gap:2px"><div class="gl-t-title" style="line-height:24px">${title}</div><div class="gl-t-body">${when}</div>${extra[2] || ""}</div></div>`;
  const explore = () => `${status()}
    <div class="gl-row" style="margin:0 20px;width:286px;height:54px;flex:none;justify-content:center;gap:10px;border-radius:999px;border:1px solid var(--gl-color-border-default);background:var(--gl-color-surface-card);font:500 15px/20px var(--gl-font)">${ic("M15.5 15.5L21 21M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13", 18, 2.4, "var(--gl-color-text-primary)")}Find an event</div>
    <div class="gl-row" style="flex:none;height:36px;margin-top:14px;padding-left:20px;gap:8px"><span class="gl-pill gl-on">All</span><span class="gl-pill">Tonight</span><span class="gl-pill">This week</span><span class="gl-pill">Free</span><span class="gl-pill">Online</span></div>
    <div class="gl-abs gl-circ" style="left:316px;top:62px;width:54px;height:54px;background:var(--gl-color-surface-card)">${ic("M4 8a3 3 0 013-3h10a3 3 0 013 3v10a2 2 0 01-2 2H6a2 2 0 01-2-2zM4 10h16M9 3v4M15 3v4", 26, 2, "var(--gl-color-text-primary)")}</div>
    <div class="gl-col" style="flex:none;padding-top:22px;gap:12px"><div class="gl-t-head" style="padding-inline:20px;line-height:32px">Popular in San Francisco</div>
      <div class="gl-row m-strip" style="align-items:flex-start;padding-left:20px;gap:14px">
        ${card(ph("rooftop"), av("cat") + av("crown", 0, 1) + av("chef", 0, 1), "Rooftop Garden Social", "Sat, Sep 12 · 6:30 PM · $25", [`Selling fast`, `<div class="gl-abs gl-circ m-star" style="right:24px;bottom:24px;width:40px;height:40px;background:var(--gl-color-surface-card)">${ic(STAR, 20)}</div>`, `<div class="gl-row gl-t-meta" style="gap:6px;padding-top:2px">${ic(STAR, 14, 0, "none", "var(--gl-color-text-secondary)")}214 interested</div>`])}
        ${card(ph("cowork"), av("cat") + av("crown", 0, 1), "Garden Cowork + Coffee", "Sun, Sep 13 · 9:00 AM · Free", ["Maya and others"])}
      </div></div>
    <div class="gl-col m-ev" style="flex:none;padding:26px 20px 0;gap:12px"><div class="gl-t-head" style="line-height:32px">Popular events</div>
      <div class="gl-row" style="align-items:flex-start;gap:14px"><div style="flex:none;width:84px;height:84px;border-radius:26%;background:url(${ph("slowcafe")}) 50%/cover"></div>
        <div class="gl-col gl-grow" style="gap:3px"><div class="gl-row" style="justify-content:space-between;gap:8px"><span class="gl-row gl-t-body" style="gap:6px;white-space:nowrap"><i style="width:20px;height:20px;border-radius:999px;background:var(--gl-color-container-brand)"></i>Slow Café Collective</span><span class="gl-badge" style="background:var(--gl-color-container-brand);color:var(--gl-color-action-primary)">Waitlist open</span></div>
          <div class="gl-t-title">Sunday Slow Café</div><div class="gl-row gl-t-body" style="gap:6px">${ic("M12 3a9 9 0 100 18 9 9 0 000-18M12 7v5l3 2", 14, 2, "var(--gl-color-text-secondary)")}Sunday, 7:30 AM</div></div></div></div>
    <div class="gl-abs gl-row m-city" style="left:50%;translate:-50%;bottom:100px;height:44px;padding:0 16px 0 14px;gap:8px;border-radius:999px;background:var(--gl-color-text-primary);color:var(--gl-color-surface-canvas);font:500 15px/20px var(--gl-font);white-space:pre">${ic("M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11zM12 7.8a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4", 18, 2.2, "var(--gl-color-surface-canvas)")}San Francisco${ic("M6 9l6 6 6-6", 16, 2.4, "var(--gl-color-surface-canvas)")}</div>
    ${tabbar}`;

  const fact = (a, b, o = "") => `<div class="gl-col gl-grow" style="align-items:center;gap:2px;padding-inline:8px;${o}"><div class="gl-t-title" style="${a[1] || ""}">${a[0]}</div><div class="gl-t-cap">${b}</div></div>`;
  const line = "border-bottom:1px solid var(--gl-color-border-default)";
  const event = () => `<div class="gl-abs m-hero" style="left:0;top:0;width:390px;height:340px;background:url(${ph("rooftop")}) 50%/cover"></div>
    <div class="gl-abs gl-col m-sheet" style="left:0;right:0;top:300px;height:444px;padding:26px 20px 0;background:var(--gl-color-surface-card);border-radius:28px 28px 0 0;overflow:clip">
      <div class="gl-t-head" style="text-align:center;letter-spacing:-.03em">Rooftop Garden Social</div>
      <div class="gl-t-body" style="text-align:center;padding-top:10px">Live music · San Francisco, CA<br>Doors 6:30 PM · 18+ · 300 capacity</div>
      <div class="gl-row m-row" style="margin-top:18px;padding-block:16px;border-block:1px solid var(--gl-color-border-default)">${fact(["4.9 ★"], "Host rating")}<div class="gl-col" style="flex:1.5 1 0;align-items:center;gap:2px;padding-inline:16px;border-inline:1px solid var(--gl-color-border-default)"><div class="gl-t-title" style="color:var(--gl-color-status-warning-fg)">Selling fast</div><div class="gl-t-cap">86 spots left</div></div>${fact(["214"], "Going")}</div>
      <div class="gl-row m-row" style="gap:14px;padding-block:15px;${line}"><i style="flex:none;width:40px;height:40px;border-radius:8px;background:url(${ph("rooftop")}) 50%/cover"></i><div class="gl-col" style="gap:1px"><div style="font:500 15px/20px var(--gl-font)">Hosted by Golden Hour Co.</div><div class="gl-t-meta">38 events hosted</div></div></div>
      <div class="gl-row m-row" style="gap:14px;padding-block:15px;${line}"><div class="gl-col" style="flex:none;width:40px;height:40px;border-radius:8px;overflow:clip;background:#fff;border:1px solid var(--gl-color-border-default);align-items:center"><i style="width:40px;height:9px;background:#4285F4"></i><b style="flex:1;display:grid;place-items:center;color:#4285F4;font:700 16px/20px var(--gl-font)">31</b></div><div class="gl-col" style="gap:1px"><div style="font:500 15px/20px var(--gl-font)">Sat, Sep 12 · 6:30 – 10:00 PM</div><div class="gl-t-meta">Add to calendar</div></div></div>
      <div class="gl-row" style="gap:14px;padding-block:15px"><svg width="40" height="40" viewBox="0 0 40 40" style="border-radius:8px;background:#BFE3B4" aria-hidden="true"><path d="M-2 30L42 14" stroke="#fff" stroke-width="5"/><path d="M10 44L22 -4" stroke="#FFD25A" stroke-width="4"/><path d="M20 10a6 6 0 016 6c0 4-6 10-6 10s-6-6-6-10a6 6 0 016-6z" fill="#FF3B30"/><circle cx="20" cy="16" r="2.2" fill="#fff"/></svg><div class="gl-col" style="gap:1px"><div style="font:500 15px/20px var(--gl-font)">The Fairmont Rooftop</div><div class="gl-t-meta">950 Mason St, San Francisco</div></div></div>
    </div>
    <div class="gl-abs gl-row m-cta" style="left:0;right:0;bottom:0;height:100px;align-items:flex-start;justify-content:space-between;padding:14px 20px 0;background:var(--gl-color-surface-card);border-top:1px solid var(--gl-color-border-default)"><div class="gl-col" style="gap:2px"><div class="gl-row" style="align-items:baseline;gap:6px"><s style="font:500 15px/18px var(--gl-font);color:var(--gl-light-text-tertiary)">$30</s><b style="font:700 20px/28px var(--gl-font);letter-spacing:-.02em">$25</b></div><div class="gl-t-meta">Sat, Sep 12 · 1 ticket</div></div><div class="gl-row m-reg" style="height:52px;padding-inline:32px;justify-content:center;border-radius:999px;background:var(--gl-color-action-primary);color:#fff;font:500 16px/20px var(--gl-font)">Register</div></div>
    <div class="gl-abs" style="left:0;top:0;width:390px;height:140px;background:linear-gradient(180deg,#0000006B,#0000)"></div>
    <div class="gl-abs" style="left:0;top:0;width:390px">${status("#fff")}</div>
    <div class="gl-abs gl-row" style="left:20px;right:20px;top:66px;justify-content:space-between"><span class="gl-circ" style="width:36px;height:36px">${ic("M19 12H5M11 6l-6 6 6 6", 18, 2.2, "#1D1B20")}</span><span class="gl-row" style="gap:10px"><span class="gl-circ" style="width:36px;height:36px">${ic("M12 15V4M8 8l4-4 4 4M6 12v7h12v-7", 18, 2, "#1D1B20")}</span><span class="gl-circ m-heart" style="width:36px;height:36px">${ic(HEART, 18, 1.9, "#1D1B20")}</span></span></div>`;

  const guest = (k, name, sub, st, tone) => `<div class="gl-row m-guest" style="gap:12px;padding-block:12px;${k ? line : ""}">${av(st[0], 1)}<div class="gl-col gl-grow"><div style="font:700 15px/18px var(--gl-font)">${name}</div><div class="gl-t-cap" style="font-weight:500;font-size:13px;line-height:16px">${sub}</div></div><span class="gl-badge${tone === "warning" ? " m-pending" : ""}" style="background:var(--gl-color-status-${tone}-bg);color:var(--gl-color-status-${tone}-fg);font-weight:700;height:26px">${st[1]}</span></div>`;
  const stat = (v, l) => `<div class="gl-col gl-grow" style="gap:2px;padding:14px;border-radius:16px;background:var(--gl-color-surface-card)"><div class="gl-t-head m-num" data-to="${v}" style="line-height:30px;letter-spacing:0">${v}</div><div class="gl-t-cap" style="font-weight:500;color:var(--gl-light-text-tertiary)">${l}</div></div>`;
  const tabH = (t, on) => `<div style="padding:10px 12px 12px;${on ? "border-bottom:2px solid var(--gl-color-action-primary)" : ""};font:${on ? 700 : 500} 14px/18px var(--gl-font);color:${on ? "var(--gl-color-text-primary)" : "var(--gl-color-text-secondary)"}">${t}</div>`;
  const host = () => `${status()}
    <div class="gl-row" style="flex:none;justify-content:space-between;padding:10px 18px 2px">${ic("M19 12H5M11 6l-6 6 6 6", 24, 2.2, "#222")}${ic("M5 12h.01M12 12h.01M19 12h.01", 22, 3.6, "#222")}</div>
    <div style="flex:none;padding:12px 24px 0"><div style="font:700 13px/16px var(--gl-font);color:var(--gl-color-action-primary)">HOST DASHBOARD</div><div class="gl-t-head" style="padding-top:2px;line-height:30px;letter-spacing:-.03em">Rooftop Garden Social</div><div style="padding-top:2px;font:500 14px/18px var(--gl-font);color:var(--gl-color-text-secondary)">Sat, Sep 12 · 6:30 PM · 6 days to go</div></div>
    <div class="gl-row" style="flex:none;gap:10px;padding:18px 20px 0">${stat("214", "Registered")}${stat("86", "Spots left")}${stat("$5.3k", "Revenue")}</div>
    <div class="gl-row" style="flex:none;margin:20px 20px 0;padding-top:0;${line}">${tabH("Guests · 214", 1)}${tabH("Waitlist · 12")}${tabH("Check-in")}</div>
    <div class="gl-col" style="flex:none;padding:4px 20px 0">${guest(1, "Maya Chen", "General · 1 ticket", ["cat", "Going"], "success")}${guest(1, "Daniel Okafor", "General · 2 tickets", ["flame", "Going"], "success")}${guest(1, "Priya Nair", "VIP · 1 ticket", ["crown", "Pending"], "warning")}${guest(0, "Leo Martins", "General · 1 ticket", ["chef", "Going"], "success")}</div>
    <div class="gl-abs gl-row m-scan" style="left:20px;right:20px;bottom:30px;height:52px;justify-content:center;gap:10px;border-radius:999px;background:var(--gl-color-action-primary);color:#fff;font:700 16px/20px var(--gl-font)">${ic("M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16", 20, 2, "#fff")}Scan tickets</div>`;


  const scanner = () => `${status()}
    <div class="gl-row" style="flex:none;height:44px;padding:0 8px;justify-content:space-between"><span style="width:44px;display:grid;place-items:center">${ic("M6 6l12 12M18 6L6 18", 24, 2.2)}</span><span style="font:500 17px/22px var(--gl-font)">Check-in</span><span style="width:44px;display:grid;place-items:center">${ic("M13 3L5 14h6l-1 7 8-11h-6z", 24, 1.8)}</span></div>
    <div class="gl-t-body" style="flex:none;padding:4px 20px 0;text-align:center">Rooftop Garden Social</div>
    <div class="m-cam" style="position:relative;flex:none;height:360px;margin:16px 20px 0;border-radius:16px;background:#18181B;overflow:clip"><svg width="350" height="360" viewBox="0 0 350 360" style="position:absolute;left:0;top:0" aria-hidden="true"><path class="m-brk" d="M85 125V105a20 20 0 0120-20h20M265 125V105a20 20 0 00-20-20h-20M85 235v20a20 20 0 0020 20h20M265 235v20a20 20 0 01-20 20h-20" fill="none" stroke="#E31C5F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="m-line" style="position:absolute;left:95px;right:95px;top:178px;height:3px;border-radius:2px;background:var(--gl-color-action-primary);opacity:.9"></div><div style="position:absolute;left:0;right:0;bottom:22px;text-align:center;color:#D4D4D8;font:500 13px/18px var(--gl-font)">Align the QR code within the frame</div></div>
    <div class="gl-col m-chk" style="flex:none;margin:16px 20px 0;padding:16px;gap:12px;border-radius:16px;background:var(--gl-color-surface-card)"><div class="gl-row" style="justify-content:space-between;align-items:baseline;font:500 15px/20px var(--gl-font)"><span>Checked in</span><span><b class="m-count" style="font-weight:500">128</b> <span style="color:var(--gl-color-text-secondary)">/ 214</span></span></div><div style="height:6px;border-radius:999px;background:var(--gl-color-border-default)"><div class="m-bar" style="height:6px;width:60%;border-radius:999px;background:var(--gl-color-action-primary)"></div></div><div class="gl-row m-who" style="gap:12px;padding-top:4px"><span class="gl-circ" style="width:34px;height:34px;background:var(--gl-color-status-success-bg)">${ic("M5 12.5l4.5 4.5L19 7.5", 18, 2.8, "#1B7A43")}</span><div class="gl-col gl-grow"><div style="font:500 14px/20px var(--gl-font)">Maya Chen</div><div class="gl-t-cap">General · just now</div></div></div></div>
    <div class="gl-abs gl-row" style="left:20px;right:20px;bottom:34px;height:52px;justify-content:center;border-radius:999px;border:1px solid var(--gl-color-text-primary);font:500 16px/22px var(--gl-font)">Enter code manually</div>`;
  const stackPhone = (cls, a, b) => `<div class="glp-wrap"><div class="glp gld-tok ${cls} m-a" aria-hidden="true">${a()}</div><div class="glp gld-tok ${cls} m-b" aria-hidden="true">${b()}</div><i class="m-tap2" aria-hidden="true"></i><i class="m-tap" aria-hidden="true"></i></div>`;


  // ── more screens, from the Paper file: Search, Request to join, Confirmed, Ticket, Splash, Log in, Confirm code, Create, Review ──
  const field = (l, v, ex = "") => `<div class="gl-col m-field" style="padding:12px 16px;gap:2px;border-radius:12px;background:var(--gl-color-surface-card);${ex}"><div class="gl-t-cap" style="font-weight:500;color:var(--gl-light-text-tertiary)">${l}</div><div style="font:500 15px/18px var(--gl-font)">${v}</div></div>`;
  const navBar = (title, l, r) => `<div class="gl-row" style="flex:none;height:44px;padding:0 8px;justify-content:space-between"><span style="width:44px;display:grid;place-items:center">${l}</span><span style="font:500 17px/22px var(--gl-font)">${title}</span><span style="width:44px;display:grid;place-items:center">${r}</span></div>`;
  const BACK = ic("M19 12H5M11 6l-6 6 6 6", 24, 2.2), X = ic("M6 6l12 12M18 6L6 18", 24, 2.2);
  const btn = (t, o = "", cls = "") => `<div class="gl-row ${cls}" style="height:52px;justify-content:center;border-radius:999px;background:var(--gl-color-action-primary);color:#fff;font:500 16px/20px var(--gl-font);${o}">${t}</div>`;
  const outline = (t, o = "") => `<div class="gl-row" style="height:52px;justify-content:center;border-radius:999px;border:1px solid var(--gl-color-text-primary);font:500 16px/20px var(--gl-font);${o}">${t}</div>`;
  const rowKV = (a, b, last) => `<div class="gl-row" style="justify-content:space-between;padding-block:14px;${last ? "" : line}"><span class="gl-t-body">${a}</span><span style="font:500 15px/20px var(--gl-font)">${b}</span></div>`;

  const search = () => `${status()}
    <div class="gl-row" style="flex:none;gap:12px;padding:12px 20px 0"><div class="gl-row gl-grow" style="height:50px;padding:0 18px;gap:10px;border-radius:999px;border:1px solid var(--gl-color-border-default);background:var(--gl-color-surface-card)">${ic("M15.5 15.5L21 21M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13", 18, 2.4, "var(--gl-color-text-primary)")}<span class="gl-t-body" style="font-size:15px">Events, hosts, places</span></div><b style="font:500 15px/20px var(--gl-font)">Cancel</b></div>
    <div class="gl-row" style="flex:none;justify-content:space-between;padding:22px 20px 6px"><b style="font:700 20px/28px var(--gl-font);letter-spacing:-.02em">Recent</b><u style="font:500 13px/18px var(--gl-font)">Clear</u></div>
    <div class="gl-col" style="flex:none;padding:0 20px">${["Rooftop events", "Golden Hour Co.", "Menlo Park this weekend"].map((t, k) => `<div class="gl-row m-recent${k ? "" : " m-r0"}" style="gap:14px;padding-block:11px">${ic("M12 4a8 8 0 100 16 8 8 0 000-16M12 8v4l3 2", 20, 1.8, "#767676")}<span class="gl-grow" style="font:500 15px/20px var(--gl-font)">${t}</span>${ic("M6 6l12 12M18 6L6 18", 16, 2, "#767676")}</div>`).join("")}</div>
    <div style="flex:none;padding:18px 20px 10px"><b style="font:700 20px/28px var(--gl-font);letter-spacing:-.02em">Trending near you</b></div>
    <div class="gl-row" style="flex:none;flex-wrap:wrap;gap:8px;padding:0 20px">${["Garden social", "Garden cowork", "Slow café", "DJ night"].map((t) => `<span class="gl-pill">${t}</span>`).join("")}</div>
    <div style="flex:none;padding:22px 20px 10px"><b style="font:700 20px/28px var(--gl-font);letter-spacing:-.02em">Browse by category</b></div>
    <div class="gl-row" style="flex:none;flex-wrap:wrap;gap:12px;padding:0 20px">${[["Music", "rooftop"], ["Outdoors", "slowcafe"], ["Art", "art"], ["Talks", "talks"]].map(([t, im]) => `<div style="position:relative;width:169px;height:92px;border-radius:18%;overflow:clip;background:url(${ph(im)}) 50% 40%/cover"><i style="position:absolute;inset:0;background:linear-gradient(0deg,#0000008C,#0000000D)"></i><span style="position:absolute;left:18px;bottom:14px;color:#fff;font:500 15px/20px var(--gl-font)">${t}</span></div>`).join("")}</div>`;

  const request = () => `${status()}${navBar("Request to join", BACK, X)}
    <div class="gl-col" style="flex:none;margin:6px 20px 14px;padding:0 18px;border-radius:16px;background:var(--gl-color-surface-card)">
      <div class="gl-row" style="gap:14px;padding-block:18px;${line}"><i style="flex:none;width:84px;height:84px;border-radius:26%;background:url(${ph("register")}) 50%/cover"></i><div class="gl-col" style="gap:6px"><div class="gl-t-title" style="letter-spacing:-.01em">Rooftop Garden Social</div><div class="gl-row gl-t-meta" style="gap:5px">${ic(STAR, 13, 0, "none", "var(--gl-color-text-primary)")}4.9 (184) · Host favorite</div></div></div>
      <div class="gl-row" style="justify-content:space-between;padding-block:14px;${line}"><div class="gl-col" style="gap:3px"><b style="font:500 15px/20px var(--gl-font)">Date</b><span class="gl-t-body">Sat, Sep 12 · 6:30 PM</span><span class="gl-row m-dia" style="gap:6px;padding-top:2px;color:var(--gl-color-status-warning-fg);font:500 13px/18px var(--gl-font)">${ic("M6 4h12l4 5-10 11L2 9z", 14, 0, "none", "var(--gl-color-status-warning-fg)")}Selling fast</span></div><span class="gl-pill" style="border-color:var(--gl-color-text-primary);height:36px;font-size:14px">Change</span></div>
      <div class="gl-row" style="justify-content:space-between;padding-block:14px;${line}"><div class="gl-col" style="gap:3px"><b style="font:500 15px/20px var(--gl-font)">Guests</b><span class="gl-t-body">1 ticket</span></div><span class="gl-pill" style="border-color:var(--gl-color-text-primary)">Change</span></div>
      <div class="gl-row" style="justify-content:space-between;padding-block:14px;${line}"><div class="gl-col" style="gap:3px"><b style="font:500 15px/20px var(--gl-font)">Total</b><span class="gl-t-body m-total">$26.80 USD</span></div><span class="gl-pill" style="border-color:var(--gl-color-text-primary)">Details</span></div>
      <div class="gl-col" style="gap:3px;padding-block:14px"><b style="font:500 15px/20px var(--gl-font)">Free cancellation</b><span class="gl-t-body">Cancel before Sep 11 for a full refund. <u>Full policy</u></span></div></div>
    <div class="gl-col" style="flex:none;margin:0 20px;padding:0 18px;border-radius:16px;background:var(--gl-color-surface-card)">
      <div style="padding:18px 0 14px;${line};font:500 16px/20px var(--gl-font)">Payment method</div>
      <div class="gl-row" style="justify-content:space-between;padding-block:16px;${line}"><span class="gl-row" style="gap:14px"><span class="gl-row" style="width:48px;height:30px;justify-content:center;gap:2px;border-radius:4px;background:#000;color:#fff;font:700 14px/18px var(--gl-font)"> Pay</span><b style="font:500 15px/20px var(--gl-font)">Apple Pay</b></span><i class="m-radio" style="flex:none;width:26px;height:26px;border-radius:50%;border:8px solid var(--gl-color-action-primary)"></i></div>
      <div class="gl-row" style="justify-content:space-between;padding-block:16px"><span class="gl-row" style="gap:14px"><span class="gl-row" style="gap:6px"><span class="gl-row" style="width:48px;height:30px;justify-content:center;border-radius:4px;background:#fff;border:1px solid var(--gl-color-border-default);color:#1A1F71;font:italic 700 13px/16px var(--gl-font)">VISA</span><span class="gl-row" style="width:48px;height:30px;justify-content:center;border-radius:4px;background:#fff;border:1px solid var(--gl-color-border-default)"><svg width="30" height="19" viewBox="0 0 30 19" aria-hidden="true"><circle cx="10" cy="9.5" r="9" fill="#EB001B"/><circle cx="20" cy="9.5" r="9" fill="#F79E1B"/><path d="M15 2.1a9 9 0 010 14.8 9 9 0 010-14.8z" fill="#FF5F00"/></svg></span></span><b style="font:500 15px/20px var(--gl-font)">Credit or debit card</b></span><i style="flex:none;width:26px;height:26px;border-radius:50%;border:1.5px solid #C8C8C8"></i></div></div>
    <div class="gl-abs" style="left:20px;right:20px;bottom:28px">${btn(ic("M12 4v15M6 13l6 6 6-6", 18, 2.4, "#fff") + "Review", "gap:8px", "m-go")}</div>`;

  const confirmed = () => `${status()}<div class="m-conf-layer" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3"></div>
    <div class="gl-row" style="flex:none;justify-content:flex-end;padding:12px 24px 0">${X}</div>
    <div class="gl-col" style="flex:none;align-items:center;gap:8px;padding:14px 24px 0"><span class="gl-circ m-check" style="width:72px;height:72px;background:var(--gl-color-status-success-fg)">${ic("M5 12.5l4.5 4.5L19 7.5", 34, 2.8, "#fff")}</span><div class="m-conf" style="padding-top:10px;font:700 34px/40px var(--gl-font);letter-spacing:-.03em">You’re going!</div><div style="text-align:center;font:500 15px/22px var(--gl-font);color:var(--gl-color-text-secondary)">We’ve sent your ticket to Wallet and<br>emailed the details.</div></div>
    <div class="gl-col" style="flex:none;margin:24px 20px 0;border-radius:16px;background:var(--gl-color-surface-card);overflow:clip"><div style="height:150px;background:url(${ph("rooftop")}) 50% 40%/cover"></div><div class="gl-col" style="padding:16px 18px 18px;gap:12px"><b style="font:700 18px/22px var(--gl-font);letter-spacing:-.01em">Rooftop Garden Social</b><div class="gl-row" style="gap:10px;font:500 14px/18px var(--gl-font)">${ic("M4 8a3 3 0 013-3h10a3 3 0 013 3v10a2 2 0 01-2 2H6a2 2 0 01-2-2zM4 10h16M9 3v4M15 3v4", 18, 1.8, "#222")}Sat, Sep 12 · 6:30 PM</div><div class="gl-row" style="gap:10px;font:500 14px/18px var(--gl-font)">${ic("M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5", 18, 1.8, "#222")}The Fairmont Rooftop</div></div></div>
    <div class="gl-abs gl-col" style="left:20px;right:20px;bottom:34px;gap:12px">${btn("View ticket", "", "m-go")}${outline("Add to calendar")}</div>`;

  const QR = '<path d="M0 0h7v7H0zM1 1v5h5V1zM2 2h3v3H2zM14 0h7v7h-7zM15 1v5h5V1zM16 2h3v3h-3zM0 14h7v7H0zM1 15v5h5v-5zM2 16h3v3H2z" fill-rule="evenodd" fill="#222"/><path d="M8 0h2v1H8zM11 0h1v3h-1zM9 2h1v2H9zM8 4h3v1H8zM12 4h1v2h-1zM8 6h1v1H8zM10 6h2v1h-2zM0 8h1v1H0zM2 8h2v1H2zM5 8h3v1H5zM9 8h2v2H9zM12 8h2v1h-2zM15 8h1v1h-1zM17 8h2v1h-2zM20 8h1v2h-1zM1 10h2v1H1zM4 10h1v2H4zM6 10h2v1H6zM12 10h3v1h-3zM16 10h1v2h-1zM18 10h1v1h-1zM0 12h2v1H0zM3 12h1v1H3zM6 12h1v2H6zM8 12h2v1H8zM11 12h1v2h-1zM13 12h2v1h-2zM17 12h3v1h-3zM8 14h1v2H8zM10 14h2v1h-2zM13 14h1v3h-1zM15 14h2v1h-2zM18 14h1v2h-1zM20 14h1v1h-1zM10 16h2v1h-2zM15 16h2v2h-2zM8 17h1v2H8zM11 18h2v1h-2zM14 18h1v2h-1zM17 18h3v1h-3zM9 20h3v1H9zM16 20h2v1h-2zM20 18h1v3h-1z" fill="#222"/>';
  const ticket = () => `${status()}${navBar("Your ticket", BACK, ic("M12 15V4M8 8l4-4 4 4M6 12v7h12v-7", 24, 2))}
    <div class="gl-col" style="flex:none;align-items:center;gap:18px;margin:6px 20px 0;padding:26px 24px 22px;border-radius:16px;background:var(--gl-color-surface-card)"><div class="gl-col" style="align-items:center;gap:4px"><b style="font:700 20px/24px var(--gl-font);letter-spacing:-.02em">Rooftop Garden Social</b><span class="gl-t-body">Sat, Sep 12 · Doors 6:30 PM</span></div><div class="m-qr" style="position:relative;overflow:hidden;display:grid;place-items:center;width:208px;height:208px;border-radius:12px;background:#fff;border:1px solid var(--gl-color-border-default)"><i class="m-sweep" style="position:absolute;left:0;right:0;top:0;height:34%;transform:translateY(-110%);background:linear-gradient(to bottom,transparent,rgba(93,64,216,.28),transparent)"></i><svg width="168" height="168" viewBox="0 0 21 21" shape-rendering="crispEdges" aria-hidden="true">${QR}</svg></div><div class="gl-t-meta" style="text-align:center">Show this code at the door. Brightness will turn up automatically.</div></div>
    <div style="flex:none;padding:16px 20px 0"><div class="gl-row" style="height:52px;justify-content:center;gap:8px;border-radius:999px;background:#000;color:#fff;font:700 16px/20px var(--gl-font)"><svg width="24" height="20" viewBox="0 0 24 20" aria-hidden="true"><rect x="2" y="1" width="20" height="4" rx="1.5" fill="#FF9500"/><rect x="2" y="3" width="20" height="4" rx="1.5" fill="#FFCC00"/><rect x="2" y="5" width="20" height="4" rx="1.5" fill="#34C759"/><rect x="1" y="7" width="22" height="12" rx="3" fill="#1C1C1E" stroke="#fff" stroke-width="1.2"/><rect x="15" y="11" width="8" height="4" rx="2" fill="#fff"/></svg>Add to Apple Wallet</div></div>
    <div class="gl-col" style="flex:none;padding:6px 20px 0">${rowKV("Location", "The Fairmont Rooftop")}${rowKV("Guests", "1 ticket")}${rowKV("Free cancellation until", "Sep 11", 1)}</div>`;

  const splash = () => `<div style="position:absolute;inset:0;background:#fff;color:#1D1B20"><div style="position:absolute;left:0;right:0;top:0">${status("#000")}</div><div class="gl-col m-logo" style="position:absolute;inset:0;align-items:center;justify-content:center;gap:14px"><i style="flex:none;width:96px;height:76px;background:url(${ph("logo").replace(".jpg", ".png")}) 50%/100% 100% no-repeat"></i><b style="font:700 24px/30px var(--gl-font);letter-spacing:-.02em">Gatherly</b></div></div>`;
  const sheetTop = (inner) => `<div style="position:absolute;inset:0;background:#000"><div class="gl-abs" style="left:12px;right:12px;top:66px;height:40px;background:#7E7E7E;border-radius:28px 28px 0 0"></div><div class="gl-abs" style="left:0;right:0;bottom:0;top:80px;background:var(--gl-color-surface-card);border-radius:28px 28px 0 0;overflow:clip">${inner}</div><div class="gl-abs" style="left:0;top:0;width:390px">${status("#fff")}</div></div>`;
  const login = () => sheetTop(`<div class="gl-abs" style="right:8px;top:12px;width:44px;height:44px;display:grid;place-items:center">${X}</div>
    <div class="gl-abs gl-col" style="left:0;right:0;top:150px;align-items:center;gap:22px"><i style="flex:none;width:72px;height:57px;background:url(${ph("logo").replace(".jpg", ".png")}) 50%/100% 100% no-repeat"></i><b style="font:700 24px/32px var(--gl-font);letter-spacing:-.03em">Log in or sign up</b></div>
    <div class="gl-abs gl-col" style="left:20px;right:20px;top:236px;gap:14px"><div class="gl-row" style="height:60px;padding:0 18px;border-radius:12px;background:var(--gl-color-surface-selected);font:500 15px/20px var(--gl-font);position:relative"><span class="m-ph" style="position:absolute;left:18px;font-weight:400;color:var(--gl-light-text-tertiary)">Phone number or email</span><span class="m-typed"></span><i class="m-caret" style="width:2px;height:22px;margin-left:1px;background:var(--gl-color-action-primary);opacity:0"></i></div>${btn("Continue", "", "m-go")}<div class="gl-row" style="gap:14px;padding-block:6px"><i class="gl-grow" style="height:1px;background:var(--gl-color-border-default)"></i><span class="gl-t-body">or</span><i class="gl-grow" style="height:1px;background:var(--gl-color-border-default)"></i></div><div class="gl-row" style="gap:16px;justify-content:center"><span class="gl-row" style="width:68px;height:68px;justify-content:center;border-radius:12px;border:1px solid var(--gl-color-border-default)"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.57-5.17 3.57-8.82z" fill="#4285F4"/><path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" fill="#34A853"/><path d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" fill="#FBBC05"/><path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" fill="#EA4335"/></svg></span><span class="gl-row" style="width:68px;height:68px;justify-content:center;border-radius:12px;border:1px solid var(--gl-color-border-default)">${ic("M12.15 6.9c-.95 0-2.4-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3-2.12 3.68-.55 9.1 1.52 12.1 1.01 1.45 2.2 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.68-1.48 3.68-2.95 1.16-1.69 1.64-3.33 1.66-3.42-.04-.01-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.62-2.32-4.39-2.38-2-.16-3.68 1.09-4.61 1.09z", 24, 0, "none", "#111")}</span></div></div>`);
  const code = () => sheetTop(`<div class="gl-abs" style="left:24px;top:24px;width:44px;height:44px;display:grid;place-items:center">${BACK}</div><div class="gl-abs" style="right:2px;top:24px;width:44px;height:44px;display:grid;place-items:center">${X}</div>
    <div class="gl-abs gl-col" style="left:20px;right:20px;top:84px;align-items:center;gap:10px"><b style="font:700 24px/32px var(--gl-font);letter-spacing:-.03em">Confirm it’s you</b><span class="gl-t-body" style="font-size:15px">We sent a code to sam@gatherly.app.</span></div>
    <div class="gl-abs gl-row m-codebox" style="left:20px;right:20px;top:196px;height:64px;padding:0 14px;justify-content:space-around;border:2px solid var(--gl-color-text-primary);border-radius:12px;background:var(--gl-color-surface-card);font:500 24px/30px var(--gl-font)"><span>4</span><span>8</span><span>1</span>${["7", "2", "6"].map((d) => `<span style="position:relative;width:14px;height:30px"><i class="m-dash" style="position:absolute;left:0;top:14px;width:14px;height:3px;border-radius:99px;background:color-mix(in srgb,var(--gl-light-text-tertiary) 55%,transparent)"></i><b class="m-digit" style="position:absolute;left:0;top:0;width:14px;text-align:center;font-weight:500;opacity:0">${d}</b></span>`).join("")}</div>
    <div class="gl-abs" style="left:0;right:0;top:288px;text-align:center;font:600 15px/20px var(--gl-font)">Didn’t get it? <u>Send a new code</u></div>`);

  const create = () => `${status()}
    <div class="gl-row" style="flex:none;height:44px;gap:8px;padding:0 20px 0 8px;width:390px"><span style="width:44px;display:grid;place-items:center">${BACK}</span><span class="gl-row gl-grow" style="gap:6px">${[1, 0, 0].map((on) => `<i style="flex:1;height:4px;border-radius:99px;background:var(--gl-color-${on ? "action-primary" : "border-default"})"></i>`).join("")}</span><span class="gl-t-body" style="font-weight:500;padding-left:8px">Step 1 of 3</span></div>
    <div style="flex:none;padding:4px 20px 0"><div style="font:700 34px/40px var(--gl-font);letter-spacing:-.03em">Create your event</div><div class="gl-t-body" style="padding-top:4px;font-size:15px">Start with the basics. You can edit anything later.</div></div>
    <div class="gl-col m-cover" style="flex:none;align-items:center;justify-content:center;gap:8px;height:150px;margin:20px 20px 0;border-radius:16px;background:var(--gl-color-surface-card)"><span class="gl-circ" style="width:44px;height:44px;border-radius:8px;background:var(--gl-color-surface-selected)">${ic("M3 8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3zM9 8.2a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6M4 17l5-4 4 3 3-2 4 3", 22, 1.8, "var(--gl-color-text-primary)")}</span><span style="font:500 14px/18px var(--gl-font)">Add a cover photo</span></div>
    <div class="gl-col" style="flex:none;gap:12px;padding:16px 20px 0">${field("Event name", "Rooftop Garden Social")}<div class="gl-row" style="gap:12px;align-items:stretch">${field("Date", "Sat, Sep 12", "flex:1")}${field("Time", "6:30 PM", "flex:1")}</div><div class="gl-row m-field" style="gap:12px;padding:12px 16px;border-radius:12px;background:var(--gl-color-surface-card)">${ic("M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5", 20, 1.8, "var(--gl-color-text-primary)")}<div class="gl-col" style="gap:2px"><span class="gl-t-cap" style="font-weight:500;color:var(--gl-light-text-tertiary)">Location</span><b style="font:500 15px/20px var(--gl-font)">The Fairmont Rooftop</b></div></div>
      <div class="gl-row m-field" style="justify-content:space-between;padding:12px 16px;border-radius:12px;background:var(--gl-color-surface-card)"><div class="gl-col" style="gap:2px"><span class="gl-t-cap" style="font-weight:500;color:var(--gl-light-text-tertiary)">Capacity</span><b class="m-cap" style="font:500 15px/20px var(--gl-font)">300 guests</b></div><span class="gl-row" style="gap:8px">${["−", "+"].map((t) => `<span class="gl-circ ${t === "+" ? "m-plus" : ""}" style="width:36px;height:36px;background:var(--gl-color-surface-selected);border:1px solid var(--gl-color-border-default);font:500 20px/24px var(--gl-font)">${t}</span>`).join("")}</span></div></div>
    <div class="gl-abs" style="left:0;right:0;bottom:0;height:100px;padding:14px 20px 0;background:var(--gl-color-surface-card);border-top:1px solid var(--gl-color-border-default)">${btn("Continue", "", "m-go")}</div>`;

  const review = () => `${status()}
    <div class="gl-row" style="flex:none;height:44px;gap:8px;padding:0 20px 0 8px;width:390px"><span style="width:44px;display:grid;place-items:center">${BACK}</span><span class="gl-row gl-grow" style="gap:6px">${[1, 1, 1].map(() => `<i class="m-seg" style="flex:1;height:4px;border-radius:99px;background:var(--gl-color-action-primary)"></i>`).join("")}</span><span class="gl-t-body" style="font-weight:500;padding-left:8px">Step 3 of 3</span></div>
    <div style="flex:none;padding:4px 20px 0;font:700 34px/40px var(--gl-font);letter-spacing:-.03em">Review &amp; publish</div>
    <div style="flex:none;margin:20px 20px 0;border-radius:16px;background:var(--gl-color-surface-card);overflow:clip"><div style="height:150px;background:url(${ph("rooftop")}) 50% 40%/cover"></div><div class="gl-col" style="padding:14px 16px;gap:4px"><b style="font:500 17px/22px var(--gl-font)">Rooftop Garden Social</b><span class="gl-t-meta">Sat, Sep 12 · 6:30 PM · Oakland, CA</span><div class="gl-row" style="gap:6px;padding-top:6px"><span class="gl-badge" style="background:var(--gl-color-surface-selected)">From $25</span><span class="gl-badge" style="background:var(--gl-color-surface-selected)">Public</span><span class="gl-badge" style="background:var(--gl-color-status-warning-bg);color:var(--gl-color-status-warning-fg)">Approval</span></div></div></div>
    <div class="gl-col" style="flex:none;padding:6px 20px 0">${[["Tickets", "GA $25 · VIP $60"], ["Capacity", "240 guests"], ["Payout", "Bank ···4821 · next day"], ["Co-hosts", "Maya, Dev"]].map(([a, b], k) => `<div class="gl-row" style="justify-content:space-between;padding-block:13px;${k < 3 ? line : ""}"><span class="gl-t-body" style="font-size:15px">${a}</span><span style="font:500 15px/20px var(--gl-font)">${b}</span></div>`).join("")}</div>
    <div class="gl-row" style="flex:none;gap:10px;margin:8px 20px 0;padding:12px 14px;border-radius:12px;background:var(--gl-color-surface-selected);font:500 13px/18px var(--gl-font)">${ic("M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1", 18, 2, "var(--gl-color-text-primary)")}gatherly.app/rooftop-garden</div>
    <div class="gl-abs gl-col" style="left:0;right:0;bottom:0;height:124px;gap:10px;padding:14px 20px 0;background:var(--gl-color-surface-card);border-top:1px solid var(--gl-color-border-default)">${btn("Publish event", "", "m-go")}<u style="text-align:center;font:500 14px/20px var(--gl-font)">Save as draft</u></div>
    <div class="m-conf-layer" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:5"></div><div class="gl-abs gl-row m-toast" style="left:20px;right:20px;top:64px;height:52px;padding:0 16px;gap:10px;border-radius:14px;background:var(--gl-color-text-primary);color:var(--gl-color-surface-canvas);font:500 15px/20px var(--gl-font);opacity:0;z-index:4"><span class="gl-circ" style="width:24px;height:24px;background:var(--gl-color-status-success-fg)">${ic("M5 12.5l4.5 4.5L19 7.5", 14, 3, "#fff")}</span>Event published</div>`;

  const flowPhone = (cls, builders) => `<div class="glp-wrap">${FRAME_UNDER}<div class="gl-clip">${builders.map((b, k) => `<div class="m-l" data-k="${k}" style="position:absolute;inset:0"><div class="glp gld-tok ${cls}" aria-hidden="true">${b()}</div></div>`).join("")}<i class="m-tap2" aria-hidden="true"></i><i class="m-tap" aria-hidden="true"></i></div>${FRAME_OVER}</div>`;

  // ── cards ──
  const FLOWS = [["Onboarding", "Splash, log in, community, notifications"], ["Discover", "Search, map, filters, city"], ["Event and register", "Event page, ticket choice, confirmation"], ["Tickets and event day", "Wallet, ticket, live activity"], ["Messaging", "Inbox, event group chat"], ["Host: create", "Basics, tickets, review, invite"], ["Host: manage guests", "Dashboard, approvals, waitlist"], ["Host: event day and money", "Scanner, guest lookup, payouts"], ["Profile and settings", "Account, notifications, refunds"]];

  // ── the deck: two columns, four cards each ──
  // ── slides: a side-scrolling row. Workflow slides play their own motion; the composed slides are static, built from the same screens ──
  const FLOW = {
    find: { cls: "is-dark", screens: [explore, search, event], steps: [{ at: [42, 10], type: "fade", pre: "explore" }, { at: [40, 24], type: "push", pre: "recent" }] },
    ticket: { cls: "", screens: [event, request, confirmed, ticket], steps: [{ at: [79, 93], type: "push", pre: "press" }, { at: [50, 93], type: "push", pre: "press" }, { at: [50, 85], type: "push", pre: "press" }] },
    signup: { cls: "", screens: [splash, login, code], steps: [{ at: null, type: "up" }, { at: [50, 59], type: "push", pre: "type" }] },
    host: { cls: "", screens: [create, review], steps: [{ at: [50, 93], type: "push", pre: "plus" }] },
    checkin: { cls: "is-dark", screens: [host, scanner], steps: [{ at: [50, 93], type: "up", pre: "host" }] },
  };
  // three rows of four, one story each: a composed opener, the film, then the flows that prove it
  const ROWS = [
    { name: "Guest", note: "Find it, join it, go", slides: [
      { kind: "trio", title: "Overview", sub: "Explore · event · ticket" },
      { kind: "hand", title: "One tap to going", sub: "The event page, on a real phone" },
      { bg: "ink", media: "guest", title: "Guest", sub: "The whole trip, recorded" },
      { k: "flow", bg: "ink", title: "Find an event", sub: "Explore · search · event", flow: FLOW.find },
      { k: "flow", bg: "canvas", title: "Get a ticket", sub: "Request · confirmed · ticket", flow: FLOW.ticket },
    ] },
    { name: "Host", note: "Create, run, get paid", slides: [
      { kind: "trioh", title: "Overview", sub: "Dashboard · create · review" },
      { bg: "canvas", media: "host", title: "Host", sub: "The whole night, recorded" },
      { kind: "orbit", k: "orbit", title: "The guest list", sub: "Everyone, around one event" },
      { k: "flow", bg: "lilac", title: "Host an event", sub: "Create · review · publish", flow: FLOW.host },
      { k: "flow", bg: "ink", title: "Check in", sub: "Dashboard · scanner", flow: FLOW.checkin },
    ] },
    { name: "System", note: "How it looks and feels", slides: [
      { kind: "night", title: "After dark", sub: "Dark mode, end to end" },
      { kind: "photoe", title: "Find a night out", sub: "Explore, on a real phone" },
      { k: "flow", bg: "violet", title: "Sign up", sub: "Log in · confirm code", flow: FLOW.signup },
      { kind: "photoh", title: "Run the room", sub: "The host dashboard, on a real phone" },
      { kind: "wall", title: "Sixty-four screens", sub: "A slice of the product" },
      { kind: "bento", title: "Moments", sub: "Toast · widget · ticket" },
    ] },
  ];
  // composed slides: markup + how big their screens are
  const dev = (cls, fn) => phone(cls, fn());
  const bare = (cls, fn) => phone(cls, fn());
  // a fanned trio: the centre phone leads, the outer two sit back, lower and tilted
  const fan = (items) => `<div class="gld__fan">${items.map(([fn, theme, m, y, r, z]) => `<div class="gld__fan-i" style="--m:${m};--y:${y}cqw;--r:${r}deg;z-index:${z}">${dev(theme, fn)}</div>`).join("")}</div>`;
  const fanS = (W, H) => (H * 0.8) / 844;
  const COMPOSED = {
    trio: { bg: "trio", html: () => fan([[explore, "", 0.8, 5, -3, 1], [event, "", 1, 0, 0, 3], [ticket, "", 0.8, 5, 3, 1]]), s: fanS, fan: true },
    trioh: { bg: "trioh", html: () => fan([[host, "", 0.8, 5, -3, 1], [create, "", 1, 0, 0, 3], [review, "", 0.8, 5, 3, 1]]), s: fanS, fan: true },
    night: { bg: "night", html: () => fan([[explore, "is-dark", 0.8, 5, -3, 1], [event, "is-dark", 1, 0, 0, 3], [host, "is-dark", 0.8, 5, 3, 1]]), s: fanS, fan: true },
    orbit: { bg: "orbit", s: () => 0, html: () => {
      const oav = (k, sz) => `<span class="gld__oav" style="width:${sz};background:${AV[k][0]}"><svg viewBox="0 0 48 48" aria-hidden="true">${AV[k][1]}</svg></span>`;
      const pill = (cls, k, a, b) => `<div class="gld__o gld__pill ${cls}">${oav(k, "3.6cqw")}<span><b>${a}</b>${b ? `<small>${b}</small>` : ""}</span></div>`;
      const badge = (cls, d) => `<i class="gld__badge ${cls}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="#1D1B20" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></i>`;
      const path = "M 370 56 A 232 196 0 1 1 369.9 56";
      return `<div class="gld__orbit">
        <svg class="gld__ring" viewBox="0 0 740 470" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><ellipse cx="372" cy="252" rx="232" ry="196" fill="none" stroke="#1D1B20" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 13"/>
          <circle class="gld__node" cx="590" cy="144" r="5.5" fill="#1D1B20"/><circle class="gld__node" cx="136" cy="308" r="5.5" fill="#1D1B20"/><circle class="gld__node" cx="372" cy="448" r="0" fill="#1D1B20"/>
          <circle class="gld__runner" r="4.5" fill="#6D4AFF"><animateMotion dur="16s" repeatCount="indefinite" path="M 372 56 A 232 196 0 1 1 371.9 56"/></circle></svg>
        ${pill("gld__p1", "cat", "Maya Chen", "Going · 1 ticket")}
        <div class="gld__o gld__photo gld__ph1"></div>${badge("gld__b1", "M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z")}
        <div class="gld__o gld__pill gld__host"><span class="gld__oav" style="width:5.4cqw;background:#F5C451"><svg viewBox="0 0 48 48" aria-hidden="true">${AV.crown[1].replace(/#fff/gi, "#fff")}</svg></span><span><b>Rooftop Garden Social</b><small>Hosted by Golden Hour Co.</small></span></div>
        <div class="gld__o gld__photo gld__ph2"></div>${badge("gld__b2", "M16 11a3 3 0 100-6 3 3 0 000 6zM8 12a3 3 0 100-6 3 3 0 000 6zM2 19c.6-3 3-5 6-5s5.4 2 6 5M12 19c.5-2.4 2.3-4 4.6-4 2.3 0 4.2 1.6 4.4 4")}
        ${pill("gld__p2", "flame", "Daniel Okafor", "Going · 2 tickets")}
        ${pill("gld__p3", "chef", "Leo Martins", "Checked in · just now")}
        ${pill("gld__p4", "crown", "Priya Nair", "Pending approval")}
      </div>`; } },
    hand: { bg: "hand", s: () => 0, html: () => `<div class="gld__title" aria-hidden="true">One tap to going</div><img class="gld__handimg" src="${P}in-hand.jpg" width="736" height="981" loading="lazy" decoding="async" alt="A hand holding an iPhone that shows the Gatherly event page for Rooftop Garden Social, with its photo, host, date, price and a Register button.">` },
    photoe: { bg: "photoe", s: () => 0, html: () => `<div class="gld__title" aria-hidden="true">Find a night out</div><img class="gld__photoimg" src="${P}in-hand-explore.jpg" width="1200" height="1200" loading="lazy" decoding="async" alt="A hand tilting an iPhone that shows the Gatherly Explore screen: a search bar, filter chips, and Popular in San Francisco with a rooftop social and a garden cowork.">` },
    photoh: { bg: "photoh", s: () => 0, html: () => `<div class="gld__title" aria-hidden="true">Run the room</div><img class="gld__photoimg gld__photoimg--h" src="${P}in-hand-host.jpg" width="736" height="981" loading="lazy" decoding="async" alt="A hand holding an iPhone that shows the Gatherly host dashboard for Rooftop Garden Social: 214 registered, 86 spots left, $5.3k revenue, a guest list and a Scan tickets button.">` },
    wall: { bg: "wall", html: () => { const sc = [explore, search, event, request, confirmed, ticket, create, review, host, scanner, login, code, explore, event, ticket]; return `<div class="gld__wall">${[0, 1, 2, 3, 4].map((c) => `<div class="gld__wallcol">${sc.filter((_, i) => i % 5 === c).map((fn) => bare("", fn)).join("")}</div>`).join("")}</div>`; }, s: (W) => (W * 0.155) / 390 },
    bento: { bg: "bento", html: () => `<div class="gld__bento">
      <div class="gld__tile gld__tile--a"><div class="gld__toast"><i></i><div><small>You’re going!</small>Rooftop Garden Social</div></div></div>
      <div class="gld__tile gld__tile--b"><div class="gld__widget"><b>Rooftop Garden Social</b><code>09.12 — 18:30</code><span class="thumb"></span><span class="pill">Register <u>+</u></span></div></div>
      <div class="gld__tile gld__tile--c"></div>
      <div class="gld__tile gld__tile--d"><div class="gld__icon"><i><em>1</em></i><span>Ticket<br>(General)</span></div></div>
      <div class="gld__tile gld__tile--e">${dev("", ticket)}</div></div>`, s: (W) => (W * 0.46 * 0.5) / 390 },
  };

  // ── motion (GSAP) ──
  const EASE_IOS = "cubic-bezier(.32,.72,0,1)";
  const COLORS = ["#7A5AF8", "#FF7AD1", "#FF6A1A", "#F5C451", "#5DD28D", "#CDBBFF"];
  // Particles are built once; the burst is a timeline that can sit inside any card's timeline.
  const confetti = (g, layer, x, y, n = 20) => {
    const tl = g.timeline();
    for (let i = 0; i < n; i++) {
      const e = document.createElement("i"); e.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:${6 + (i % 3) * 2}px;height:${9 + (i % 2) * 3}px;border-radius:2px;background:${COLORS[i % COLORS.length]};opacity:0`; layer.appendChild(e);
      const dx = g.utils.random(-140, 140), up = g.utils.random(-190, -70), r = g.utils.random(-260, 260);
      tl.set(e, { opacity: 1, x: 0, y: 0, rotation: 0 }, 0)
        .to(e, { x: dx, y: up, rotation: r, duration: 0.55, ease: "power2.out" }, 0)
        .to(e, { y: up + g.utils.random(150, 260), x: dx * 1.15, rotation: r * 1.6, opacity: 0, duration: 0.9, ease: "power1.in" }, 0.5);
    }
    return tl;
  };
  const pop = (tl, el, at, amt = 1.25) => el && tl.fromTo(el, { scale: 1 }, { scale: amt, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out" }, at);

  const MOTION = {
    // the Discover card: two phones, the same screen in two themes
    explore(d, g) {
      const tl = g.timeline({ defaults: { ease: "power3.out" } });
      const w = d.querySelectorAll(".glp-wrap");
      tl.from(w, { y: 80, opacity: 0, rotation: (i) => (i ? 3 : -3), duration: 1, stagger: 0.06 }, 0)
        .from(d.querySelectorAll(".glp .gl-pill"), { opacity: 0, y: 8, duration: 0.5, stagger: 0.04 }, 0.5)
        .from(d.querySelectorAll(".m-strip > div"), { x: 90, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.6)
        .from(d.querySelectorAll(".m-ev"), { y: 24, opacity: 0, duration: 0.7 }, 0.9)
        .from(d.querySelectorAll(".m-city"), { y: 30, opacity: 0, scale: 0.9, duration: 0.7, ease: "back.out(1.8)" }, 1.1);
      tl.to(d.querySelectorAll(".m-strip"), { x: -150, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: 1, repeatDelay: 0.8 }, 2.2);
      d.querySelectorAll(".glp").forEach((ph, n) => {
        const pills = ph.querySelectorAll(".gl-pill");
        [1, 2, 0].forEach((idx, k) => tl.call(() => pills.forEach((p, j) => p.classList.toggle("gl-on", j === idx)), null, 2.4 + k * 1.6 + n * 0.25));
        pop(tl, ph.querySelector(".m-star"), 3.0 + n * 0.3, 1.35);
        tl.to(ph.querySelectorAll(".m-avs .gl-av"), { y: -3, duration: 0.25, stagger: 0.08, yoyo: true, repeat: 1, ease: "sine.inOut" }, 1.8 + n * 0.2)
          .to(ph.querySelector(".m-city"), { y: -5, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 5 }, 2 + n * 0.2);
      });
      tl.to(d.querySelectorAll(".m-sell"), { scale: 1.07, transformOrigin: "left center", duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 7 }, 1.6);
      return tl;
    },

    // the guest list: people settle around the event one by one; a single dot circles the orbit (no screen moves up and down)
    orbit(d, g) {
      const tl = g.timeline({ defaults: { ease: "power3.out" } });
      tl.from(d.querySelector(".gld__ring ellipse"), { opacity: 0, duration: 1.2 }, 0)
        .from(d.querySelector(".gld__host"), { scale: 0.86, opacity: 0, duration: 0.8, ease: "back.out(1.6)" }, 0.1)
        .from(d.querySelectorAll(".gld__o:not(.gld__host)"), { scale: 0.8, opacity: 0, duration: 0.7, stagger: 0.08, ease: "back.out(1.7)", transformOrigin: "50% 50%" }, 0.35)
        .from(d.querySelectorAll(".gld__badge"), { scale: 0.6, opacity: 0, duration: 0.4, stagger: 0.06, ease: "back.out(2)" }, 1.1)
        .to(d.querySelectorAll(".gld__node"), { scale: 1.8, transformOrigin: "50% 50%", duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut", stagger: 0.4 }, 1.6);
      return tl;
    },
    // a workflow: one phone completes a flow end to end. `at` is where the finger lands, in % of the screen.
    flow(d, g, c) {
      const f = c.flow, L = [...d.querySelectorAll(".m-l")], wrap = d.querySelector(".glp-wrap"), tap = wrap.querySelector(".m-tap"), tap2 = wrap.querySelector(".m-tap2");
      const q = (n, sel) => L[n].querySelector(sel), qa = (n, sel) => L[n].querySelectorAll(sel);
      const hide = (st) => (st.type === "up" ? { yPercent: 100 } : st.type === "fade" ? { opacity: 0 } : { xPercent: 100 });
      const dots = [...d.querySelectorAll(".gld__dots i")], setDot = (n) => dots.forEach((x, j) => x.classList.toggle("on", j === n));
      const reset = () => {
        setDot(0); g.set(wrap, { opacity: 1 });
        L.forEach((l, n) => g.set(l, n === 0 ? { xPercent: 0, yPercent: 0, opacity: 1, scale: 1, transformOrigin: "50% 50%" } : { xPercent: 0, yPercent: 0, opacity: 1, scale: 1, ...hide(f.steps[n - 1]) }));
        g.set([tap, tap2], { opacity: 0 });
        g.set(d.querySelectorAll(".m-typed"), { textContent: "" }); g.set(d.querySelectorAll(".m-ph"), { opacity: 1 }); g.set(d.querySelectorAll(".m-caret"), { opacity: 0 });
        g.set(d.querySelectorAll(".m-dash"), { opacity: 1 }); g.set(d.querySelectorAll(".m-digit"), { opacity: 0 }); g.set(d.querySelectorAll(".m-codebox"), { borderColor: "" });
        g.set(d.querySelectorAll(".m-toast"), { opacity: 0, y: -30 }); g.set(d.querySelectorAll(".m-cap"), { textContent: "300 guests" });
        g.set(d.querySelectorAll(".m-total"), { textContent: "$26.80 USD" }); g.set(d.querySelectorAll(".m-bar"), { scaleX: 1 });
        d.querySelectorAll(".m-pending").forEach((p) => { p.textContent = "Pending"; p.style.background = p.style.color = ""; });
        d.querySelectorAll(".m-count").forEach((n) => { n.textContent = "128"; });
        d.querySelectorAll(".m-brk").forEach((b) => b.setAttribute("stroke", "#E31C5F"));
      };
      const tl = g.timeline({ repeat: -1, repeatDelay: 0.3, onRepeat: reset }); reset();
      tl.from(wrap, { y: 70, opacity: 0, rotation: -2.5, duration: 1, ease: "power3.out" }, 0);

      // the first screen comes alive as the card arrives
      const intro = (n, t0) => {
        const has = (sel) => L[n].querySelector(sel);
        if (has(".m-logo")) tl.from(q(n, ".m-logo i"), { scale: 0.8, rotation: -10, opacity: 0, duration: 0.6, ease: "back.out(1.8)" }, t0).from(q(n, ".m-logo b"), { y: 14, opacity: 0, duration: 0.6 }, t0 + 0.25).to(q(n, ".m-logo i"), { scale: 1.08, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, t0 + 1);
        if (has(".m-cover")) tl.from(q(n, ".m-cover"), { y: 22, opacity: 0, duration: 0.6, ease: "power3.out" }, t0).fromTo(q(n, ".m-cover .gl-circ"), { rotation: 0 }, { rotation: 8, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut" }, t0 + 0.6);
        if (has(".m-field")) tl.from(qa(n, ".m-field"), { y: 18, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" }, t0 + 0.2);
        if (has(".m-strip")) {
          tl.from(qa(n, ".m-strip > div"), { x: 70, opacity: 0, duration: 0.7, stagger: 0.06 }, t0).to(q(n, ".m-strip"), { x: -90, duration: 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, t0 + 0.6);
          const pills = qa(n, ".gl-pill"); [1, 2, 0].forEach((idx, k) => tl.call(() => pills.forEach((p, j) => p.classList.toggle("gl-on", j === idx)), null, t0 + 0.4 + k * 0.5));
          pop(tl, q(n, ".m-star"), t0 + 1.2, 1.35); tl.to(qa(n, ".m-sell"), { scale: 1.07, transformOrigin: "left center", duration: 0.4, yoyo: true, repeat: 3, ease: "sine.inOut" }, t0);
        }
        if (has(".m-num")) { // host dashboard
          qa(n, ".m-num").forEach((el) => { const to = el.dataset.to, isK = /k$/.test(to), v = parseFloat(to.replace(/[^0-9.]/g, "")), o = { v: 0 }; tl.to(o, { v, duration: 1.2, ease: "power2.out", onUpdate: () => { el.textContent = (to[0] === "$" ? "$" : "") + (isK ? o.v.toFixed(1) + "k" : Math.round(o.v)); } }, t0); });
          tl.from(qa(n, ".m-guest"), { x: 34, opacity: 0, duration: 0.55, stagger: 0.06, ease: "power3.out" }, t0 + 0.2).from(q(n, ".m-scan"), { y: 70, opacity: 0, duration: 0.6, ease: "back.out(1.5)" }, t0 + 0.5);
          const pend = q(n, ".m-pending");
          tl.call(() => { pend.textContent = "Going"; pend.style.background = "var(--gl-color-status-success-bg)"; pend.style.color = "var(--gl-color-status-success-fg)"; }, null, t0 + 1.7).fromTo(pend, { scale: 1 }, { scale: 1.3, duration: 0.18, yoyo: true, repeat: 1 }, t0 + 1.7);
        }
        if (has(".m-hero")) tl.fromTo(q(n, ".m-hero"), { scale: 1.2 }, { scale: 1, duration: 2.4, ease: "power2.out" }, t0);
      };
      intro(0, 0.5);
      let t = 1.4 + (f.screens[0] === splash ? 1.4 : f.screens[0] === explore ? 1.6 : f.screens[0] === host ? 2.2 : f.screens[0] === create ? 0.9 : 0.4);

      f.steps.forEach((st, i) => {
        const cur = L[i], nxt = L[i + 1];
        if (st.pre === "explore") t += 0.3;
        if (st.pre === "type") {
          const typed = q(i, ".m-typed"), ph0 = q(i, ".m-ph"), caret = q(i, ".m-caret"), o = { n: 0 }, str = "sam@gatherly.app";
          tl.to(ph0, { opacity: 0, duration: 0.2 }, t).to(caret, { opacity: 1, duration: 0.1 }, t).to(caret, { opacity: 0.1, duration: 0.35, yoyo: true, repeat: 9, ease: "steps(1)" }, t + 0.2)
            .to(o, { n: str.length, duration: 1.2, ease: "none", onUpdate: () => { typed.textContent = str.slice(0, Math.round(o.n)); } }, t + 0.15); t += 1.6;
        }
        if (st.pre === "recent") tl.to(q(i, ".m-r0"), { backgroundColor: "rgba(120,110,150,.2)", duration: 0.2 }, t + 0.5);
        if (st.pre === "plus") { const cap = q(i, ".m-cap"), pl = q(i, ".m-plus"); [0, 1, 2].forEach((k) => { tl.to(pl, { scale: 0.82, duration: 0.1, yoyo: true, repeat: 1 }, t + k * 0.28).call(() => { cap.textContent = 301 + k + " guests"; }, null, t + 0.1 + k * 0.28).fromTo(cap, { y: 0 }, { y: -2, duration: 0.1, yoyo: true, repeat: 1 }, t + k * 0.28); }); t += 0.9; }
        if (st.at) {
          g.set([tap, tap2], { left: st.at[0] + "%", top: st.at[1] + "%" });
          tl.set([tap, tap2], { left: st.at[0] + "%", top: st.at[1] + "%" }, t)
            .fromTo(tap, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, t)
            .to(tap, { scale: 0.78, duration: 0.1, yoyo: true, repeat: 1 }, t + 0.38)
            .fromTo(tap2, { scale: 0.6, opacity: 0.7 }, { scale: 2.6, opacity: 0, duration: 0.6, ease: "power2.out" }, t + 0.42);
          const btn = cur.querySelector(".m-go");
          if (btn) { tl.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, t + 0.4); }
          tl.to(tap, { opacity: 0, scale: 1.7, duration: 0.35 }, t + 0.7); t += 0.75;
        } else t += 0.3;
        // the transition: iOS push, sheet rise or cross-fade, with the screen behind stepping back
        if (st.type === "up") tl.to(nxt, { yPercent: 0, duration: 0.6, ease: "expo.out" }, t).to(cur, { scale: 0.94, opacity: 0.6, transformOrigin: "50% 100%", duration: 0.6, ease: EASE_IOS }, t);
        else if (st.type === "fade") tl.to(nxt, { opacity: 1, duration: 0.5, ease: "power2.out" }, t).to(cur, { opacity: 0, duration: 0.5 }, t);
        else tl.to(nxt, { xPercent: 0, duration: 0.55, ease: EASE_IOS }, t).to(cur, { xPercent: -26, opacity: 0.55, duration: 0.55, ease: EASE_IOS }, t);
        tl.call(() => setDot(i + 1), null, t);
        t += 0.4;
        // the new screen settles with its own small moves
        const k = (sel) => nxt.querySelector(sel);
        if (k(".m-hero")) tl.fromTo(k(".m-hero"), { scale: 1.18 }, { scale: 1, duration: 2.2, ease: "power2.out" }, t - 0.5).from(nxt.querySelectorAll(".m-row"), { y: 16, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" }, t - 0.1);
        if (k(".m-heart")) pop(tl, k(".m-heart"), t + 1.2, 1.3);
        if (k(".m-recent")) tl.from(nxt.querySelectorAll(".m-recent"), { x: -16, opacity: 0, duration: 0.45, stagger: 0.05 }, t - 0.2).from(nxt.querySelectorAll(".gl-pill"), { scale: 0.8, opacity: 0, duration: 0.4, stagger: 0.06, ease: "back.out(2)" }, t + 0.3);
        if (k(".m-dia")) { tl.to(k(".m-dia"), { opacity: 0.35, duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut" }, t); }
        if (k(".m-radio")) tl.fromTo(k(".m-radio"), { scale: 1 }, { scale: 1.18, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut" }, t);
        if (k(".m-total")) { const el = k(".m-total"), o = { v: 25 }; tl.to(o, { v: 26.8, duration: 0.9, ease: "power2.out", onUpdate: () => { el.textContent = "$" + o.v.toFixed(2) + " USD"; } }, t - 0.1); }
        if (k(".m-check")) {
          const layer = k(".m-conf-layer");
          tl.from(k(".m-check"), { scale: 0.6, opacity: 0, duration: 0.45, ease: "back.out(2)" }, t - 0.2).from(k(".m-conf"), { y: 16, opacity: 0, duration: 0.5, ease: "power3.out" }, t);
          if (layer) tl.add(confetti(g, layer, 50, 22), t - 0.1);
        }
        if (k(".m-qr")) {
          tl.from(k(".m-qr"), { scale: 0.88, opacity: 0, duration: 0.7, ease: "power3.out" }, t - 0.1)
            .fromTo(k(".m-sweep"), { yPercent: -110 }, { yPercent: 330, duration: 1.1, ease: "power1.inOut", repeat: 2, repeatDelay: 0.3 }, t + 0.5)
            .fromTo(k(".m-qr"), { filter: "brightness(1)" }, { filter: "brightness(1.1)", duration: 0.8, yoyo: true, repeat: 1 }, t + 0.6);
        }
        if (k(".m-digit")) {
          const dg = nxt.querySelectorAll(".m-digit"), ds = nxt.querySelectorAll(".m-dash");
          tl.to(ds, { opacity: 0, duration: 0.15, stagger: 0.35 }, t + 0.4).fromTo(dg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.35, ease: "back.out(2)" }, t + 0.4)
            .to(k(".m-codebox"), { borderColor: "#1B7A43", duration: 0.3 }, t + 1.55).fromTo(k(".m-codebox"), { scale: 1 }, { scale: 1.03, duration: 0.2, yoyo: true, repeat: 1 }, t + 1.55); t += 1.9;
        }
        if (k(".m-line")) {
          const line = k(".m-line"), cnt = k(".m-count"), bar = k(".m-bar"), who = k(".m-who"), brk = nxt.querySelectorAll(".m-brk");
          tl.fromTo(line, { y: -60 }, { y: 60, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 3 }, t)
            .to(k(".m-brk"), { scale: 1.04, transformOrigin: "175px 180px", duration: 0.45, yoyo: true, repeat: 5, ease: "sine.inOut" }, t)
            .call(() => brk.forEach((b) => b.setAttribute("stroke", "#5DD28D")), null, t + 1.1)
            .from(who, { y: 14, opacity: 0, duration: 0.5, ease: "power3.out" }, t + 1.1).to(bar, { scaleX: 1.008, transformOrigin: "0 50%", duration: 0.5, ease: "power3.out" }, t + 1.1)
            .call(() => { cnt.textContent = "129"; }, null, t + 1.2).fromTo(cnt, { scale: 1 }, { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1 }, t + 1.2).fromTo(who.querySelector(".gl-circ"), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }, t + 1.2); t += 2.3;
        }
        t += 0.7;
      });
      // publishing: the last tap, a toast, confetti
      const last = L.length - 1, toast = L[last].querySelector(".m-toast");
      if (toast) {
        const go = L[last].querySelector(".m-go"), layer = L[last].querySelector(".m-conf-layer");
        tl.from(L[last].querySelectorAll(".m-seg"), { scaleX: 0, transformOrigin: "left", duration: 0.5, stagger: 0.07, ease: "power3.out" }, t - 1.1)
          ;
        g.set([tap, tap2], { left: "50%", top: "90%" });
        tl.set([tap, tap2], { left: "50%", top: "90%" }, t).fromTo(tap, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, t).to(go, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 }, t + 0.38)
          .fromTo(tap2, { scale: 0.6, opacity: 0.7 }, { scale: 2.6, opacity: 0, duration: 0.6 }, t + 0.42).to(tap, { opacity: 0, scale: 1.7, duration: 0.35 }, t + 0.7)
          .to(toast, { opacity: 1, y: 0, duration: 0.55, ease: "back.out(1.6)" }, t + 0.75);
        if (layer) tl.add(confetti(g, layer, 50, 28, 26), t + 0.75);
        t += 2.2;
      }
      tl.to({}, { duration: 1.2 }, t).to(wrap, { opacity: 0, duration: 0.3, ease: "power2.out" }, t + 1.2);
      tl.userData = { reset };
      return tl;
    },
  };

  // ── mount ──
  const mount = (host) => {
    if (host.querySelector(".gld")) return;
    if (!document.getElementById("gl-roboto")) { const l = document.createElement("link"); l.id = "gl-roboto"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"; document.head.appendChild(l); }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, hover = matchMedia("(hover: hover)").matches, g = window.gsap;
    const media = { guest: ["video-gatherly-guest", "Gatherly on an iPhone, recorded: a guest explores events, registers and shows a ticket at the door."], host: ["video-gatherly-host", "Gatherly on an iPhone, recorded: a host creates an event, approves guests, checks them in and gets paid."] };
    const ARROW = (d) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
    const el = document.createElement("div"); el.className = "gld";
    const cards = [], rowApis = [];
    ROWS.forEach((row, ri) => {
      const rowEl = document.createElement("section"); rowEl.className = "gld__row"; rowEl.setAttribute("aria-label", `Gatherly ${row.name.toLowerCase()} designs`);
      const N = row.slides.length;
      const head = document.createElement("div"); head.className = "gld__rowhead";
      head.innerHTML = `<span class="gld__rowname">${row.name}<em>${row.note}</em></span><span class="gld__rowmeta"><span class="gld__count" aria-live="polite">01 / ${String(N).padStart(2, "0")}</span><span class="gld__btns"><button class="gld__btn" type="button" data-d="-1" aria-label="Previous ${row.name.toLowerCase()} slide">${ARROW("M15 6l-6 6 6 6")}</button><button class="gld__btn" type="button" data-d="1" aria-label="Next ${row.name.toLowerCase()} slide">${ARROW("M9 6l6 6-6 6")}</button></span></span>`;
      const track = document.createElement("div"); track.className = "gld__track"; track.tabIndex = 0; track.setAttribute("role", "region"); track.setAttribute("aria-roledescription", "carousel"); track.setAttribute("aria-label", `${row.name}: swipe or use the arrows`);
      const rc = [];
      row.slides.forEach((c, i) => {
        const d = document.createElement("figure"); d.className = "gld__card" + (c.media ? " gld__card--media" : "") + (c.kind ? ` gld__card--${COMPOSED[c.kind].bg}` : ""); d.dataset.bg = c.bg || ""; d.dataset.word = c.kind === "trioh" ? "Host" : "Gatherly"; d._c = c; d._track = track; d.style.margin = 0;
        d.setAttribute("role", "group"); d.setAttribute("aria-roledescription", "slide"); d.setAttribute("aria-label", `${i + 1} of ${N}: ${c.title}`);
        let inner = "";
        if (c.kind) { inner = COMPOSED[c.kind].html(); d._comp = COMPOSED[c.kind]; }
        else if (c.flow) { inner = `<i class="gld__blob gld__blob--a"></i><i class="gld__blob gld__blob--b"></i><div class="gld__title" aria-hidden="true">${c.title}</div><div class="gld__dots" aria-hidden="true">${c.flow.screens.map((_, k) => `<i${k ? "" : ' class="on"'}></i>`).join("")}</div><div class="gld__stage">${flowPhone(c.flow.cls, c.flow.screens)}</div>`; d._single = true; }
        else { const [f, alt] = media[c.media]; inner = `<video muted loop playsinline preload="none" poster="${P}${f}-poster.jpg" aria-label="${alt}"><source src="${P}${f}.mp4" type="video/mp4"></video>`; }
        d.innerHTML = inner + `<figcaption class="gld__cap"><span>${String(i + 1).padStart(2, "0")} · ${c.title}</span><span>${c.sub}</span></figcaption>`;
        track.appendChild(d); cards.push(d); rc.push(d);
      });
      rowEl.append(head, track); el.appendChild(rowEl);

      // each row has its own arrows, counter and keyboard; the active slide is full strength and its neighbours step back
      const prev = head.querySelector('[data-d="-1"]'), next = head.querySelector('[data-d="1"]'), count = head.querySelector(".gld__count");
      const index = () => { const x = track.scrollLeft + track.clientWidth / 2; let best = 0, bd = 1e9; rc.forEach((c, i) => { const dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - x); if (dd < bd) { bd = dd; best = i; } }); return best; };
      let cur = -1;
      const upd = () => {
        const i = index(); count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`; prev.disabled = i === 0; next.disabled = i === N - 1;
        if (i !== cur) { cur = i; if (g && !reduce) rc.forEach((c, j) => g.to(c, { scale: j === i ? 1 : 0.965, opacity: j === i ? 1 : 0.6, duration: 0.35, ease: "power3.out", overwrite: "auto" })); }
      };
      const go = (i) => { const c = rc[Math.max(0, Math.min(N - 1, i))]; track.scrollTo({ left: c.offsetLeft, behavior: reduce ? "auto" : "smooth" }); };
      head.addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (b) go(index() + +b.dataset.d); });
      track.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(index() + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(index() - 1); } });
      let raf = 0; track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); }, { passive: true });
      rowApis.push({ track, upd });
    });
    host.appendChild(el);
    rowApis.forEach((r) => r.upd());

    // the deck reaches past the text column to the right edge of the page
    const reach = () => { const r = host.getBoundingClientRect(); el.style.width = (innerWidth < 760 ? host.clientWidth : Math.max(host.clientWidth, Math.min(1360, innerWidth - r.left - 40))) + "px"; };
    // screens scale to the card they sit in
    const fit = () => {
      reach();
      cards.forEach((d) => {
        const narrow = d._track.clientWidth < 640;
        d.classList.toggle("is-narrow", narrow);
        const W = d.clientWidth, H = d.clientHeight; let s;
        if (d._comp) s = narrow && d._comp.fan ? (H * 0.64) / 844 : d._comp.s(W, H) * (narrow ? 0.9 : 1);
        else if (d._single) s = (H * (narrow ? 0.68 : 0.86)) / 844;
        if (s) { d.style.setProperty("--s", s.toFixed(4)); d.style.setProperty("--cs", s.toFixed(4)); }
      });
    };
    new ResizeObserver(fit).observe(host); addEventListener("resize", fit); fit(); [300, 900, 2000].forEach((ms) => setTimeout(fit, ms));

    // motion: workflow slides own a timeline that plays while on screen; static slides keep still
    const tls = new Map(), idles = new Map();
    const build = (d) => { if (!g || reduce || !d._c.k) return null; if (tls.has(d)) return tls.get(d); const fn = MOTION[d._c.k]; if (!fn) return null; const tl = fn(d, g, d._c); tl.pause(0); tls.set(d, tl); return tl; };
    // ambient life is limited to the colour fields behind a workflow slide; no screen moves up or down on its own
    const idle = (d) => {
      if (!g || reduce || !d._c.k || !d.querySelector(".gld__blob--a")) return null; if (idles.has(d)) return idles.get(d);
      const tl = g.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut", duration: 6 } });
      tl.to(d.querySelector(".gld__blob--a"), { x: 40, y: -26, scale: 1.2 }, 0).to(d.querySelector(".gld__blob--b"), { x: -34, y: 30, scale: 0.9 }, 0);
      tl.pause(); idles.set(d, tl); return tl;
    };
    if (reduce || !g) cards.forEach((d) => { if (d._c.flow) { const L = d.querySelectorAll(".m-l"); L.forEach((l, n) => { l.style.transform = "none"; l.style.opacity = n === L.length - 1 ? "1" : "0"; }); } });
    // one observer per row so "on screen" means visible inside that row's own scroller
    rowApis.forEach(({ track }) => {
      const vio = new IntersectionObserver((es) => es.forEach((e) => {
        const d = e.target, v = d.querySelector("video"); d._vis = e.isIntersecting;
        if (v) { if (e.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause(); }
        const tl = build(d), id = idle(d);
        if (e.isIntersecting) { tl && tl.play(); id && id.play(); } else { if (tl) { tl.pause(0); tl.userData && tl.userData.reset && tl.userData.reset(); } id && id.pause(); }
      }), { root: track, threshold: 0.6 });
      cards.filter((d) => d._track === track).forEach((d) => vio.observe(d));
    });

    // hover: a phone leans toward the pointer
    if (hover && g && !reduce) cards.forEach((d) => {
      const wraps = d.querySelectorAll(".glp-wrap"); if (!wraps.length || d._c.kind === "wall") return;
      const rx = g.quickTo(wraps, "rotationX", { duration: 0.6, ease: "power3.out" }), ry = g.quickTo(wraps, "rotationY", { duration: 0.6, ease: "power3.out" });
      d.addEventListener("pointermove", (e) => { const b = d.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5; ry(x * 10); rx(-y * 8); });
      d.addEventListener("pointerleave", () => { ry(0); rx(0); });
    });
  };
  const scan = () => document.querySelectorAll('[data-case-demo="gatherlyDeck"]').forEach(mount);
  scan(); new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
