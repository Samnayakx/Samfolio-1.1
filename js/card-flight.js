/* Case-study card flight, after jayasurya.design.
   Click a card and it lifts out of the page, grows into a near-fullscreen panel (7px from every edge, corner radius
   held constant), the page dims behind it, the card's content fades out, and the panel goes to black, which hands off
   to the site's existing black-cover page transition into the case study.
   Timings are theirs: 1.4s, cubic-bezier(.76, 0, .24, 1); a card that is off-screen is first centered over 1s.
   Driven by GSAP; only transforms and opacity animate, so it stays on the compositor. */
(() => {
  "use strict";
  if (!window.gsap) return;

  const FLIGHT = 1.4, INSET = 7, RADIUS = 12, DIM = "rgb(0 0 0 / .45)";
  const FADE = 0.22, SCROLL = 1;
  let busy = false;

  // CSS cubic-bezier(x1, y1, x2, y2) as a GSAP ease function (GSAP's core has no bezier ease)
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t;
    return (x) => {
      if (x <= 0 || x >= 1) return x;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 24; i++) { const v = X(t); if (Math.abs(v - x) < 1e-6) break; v < x ? (lo = t) : (hi = t); t = (lo + hi) / 2; }
      return Y(t);
    };
  };
  const FLY = bezier(0.76, 0, 0.24, 1), SOFT = bezier(0.4, 0, 0.2, 1);

  const el = (css) => Object.assign(document.createElement("div"), { style: css, ariaHidden: "true" });
  const stop = (e) => e.preventDefault();

  function flight(link, tile) {
    const r = tile.getBoundingClientRect();
    const W = innerWidth - INSET * 2, H = innerHeight - INSET * 2;
    const cover = document.querySelector(".pt-cover");
    const strip = (c) => c.split(/\s+/).filter((x) => !/^rv/.test(x) && x !== "in").join(" ");

    const dim = el("position:fixed;inset:0;z-index:1990;pointer-events:none;opacity:0;background:" + DIM);
    // Shell: the tile's own background at its FINAL size, scaled down onto the card and scaled up to the screen.
    // Only transforms move, so the GPU does the work; the corner radius is counter-scaled so it never distorts.
    const shell = tile.cloneNode(false);
    shell.removeAttribute("id"); shell.className = strip(tile.className); shell.ariaHidden = "true";
    shell.style.cssText += `;position:fixed;left:0;top:0;z-index:1995;margin:0;padding:0;pointer-events:none;aspect-ratio:auto;clip-path:none;width:${W}px;height:${H}px;transform-origin:0 0;will-change:transform;overflow:hidden`;
    const wash = el("position:absolute;inset:0;background:#000;opacity:0");
    shell.append(wash);
    // Ghost: the card exactly as it was, held in place while it fades out
    const ghost = tile.cloneNode(true);
    ghost.removeAttribute("id"); ghost.className = strip(tile.className); ghost.ariaHidden = "true";
    ghost.style.cssText += `;position:fixed;z-index:1996;margin:0;pointer-events:none;transform:none;clip-path:none;aspect-ratio:auto;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
    document.body.append(dim, shell, ghost);
    tile.style.visibility = "hidden";

    const from = { x: r.left, y: r.top, sx: r.width / W, sy: r.height / H };
    const state = { ...from };
    const paint = () => {
      gsap.set(shell, { x: state.x, y: state.y, scaleX: state.sx, scaleY: state.sy });
      shell.style.borderRadius = `${RADIUS / state.sx}px / ${RADIUS / state.sy}px`;
    };
    paint();

    const restore = () => {
      tl.kill(); dim.remove(); shell.remove(); ghost.remove(); tile.style.visibility = "";
      removeEventListener("wheel", stop, { capture: true }); removeEventListener("touchmove", stop, { capture: true });
      cover?.classList.remove("is-on");
      busy = false;
    };
    const tl = gsap.timeline({
      defaults: { ease: FLY, duration: FLIGHT },
      onComplete: () => {
        cover?.classList.add("is-on");
        try { sessionStorage.setItem("pt", "1"); } catch {}
        setTimeout(() => (location.href = link.href), 140);
        setTimeout(restore, 3500);                  // navigation cancelled or failed: give the card back
      },
    });
    tl.to(dim, { opacity: 1 }, 0)
      .to(state, { x: INSET, y: INSET, sx: 1, sy: 1, onUpdate: paint }, 0)
      .to(ghost, { opacity: 0, duration: FADE, ease: SOFT }, 0)
      .to(wash, { opacity: 1, duration: FLIGHT * 0.55, ease: SOFT }, FLIGHT * 0.45);
    addEventListener("pageshow", (e) => { if (e.persisted) restore(); }, { once: true });
  }

  function open(link, tile) {
    busy = true;
    addEventListener("wheel", stop, { capture: true, passive: false });
    addEventListener("touchmove", stop, { capture: true, passive: false });
    const r = tile.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= innerHeight) return flight(link, tile);
    // Not fully on screen: centre it first, then lift
    const max = document.documentElement.scrollHeight - innerHeight;
    const pos = { y: scrollY };
    gsap.to(pos, {
      y: Math.max(0, Math.min(max, scrollY + r.top - (innerHeight - r.height) / 2)),
      duration: SCROLL, ease: SOFT, onUpdate: () => scrollTo(0, pos.y),
      onComplete: () => requestAnimationFrame(() => requestAnimationFrame(() => flight(link, tile))),
    });
  }

  // Capture phase so we run ahead of the generic page-transition click handler in site.js
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest?.(".case__link, .lockcard");
    const tile = link?.querySelector(".case__tile");
    if (!link || !tile || !link.href) return;
    if (window.motionReduced?.()) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || link.target === "_blank") return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!busy) open(link, tile);
  }, true);
})();
