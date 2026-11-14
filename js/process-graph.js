/* About: the design-process node graph. Measures each node's ports and draws curved wires between them
   (SVG cubic beziers, drawn on as the graph scrolls into view). Redraws on resize. */
(() => {
  "use strict";
  const flow = document.querySelector("[data-flow]");
  if (!flow) return;
  const svg = flow.querySelector(".flow__wires"), tag = flow.querySelector(".flow__tag");
  const nodes = [...flow.querySelectorAll(".node")];
  const NS = "http://www.w3.org/2000/svg";
  const wide = matchMedia("(min-width: 1024px)");
  const reduce = () => (window.motionReduced ? window.motionReduced() : matchMedia("(prefers-reduced-motion: reduce)").matches);
  let drawn = false;

  const at = (el) => {
    const r = el.getBoundingClientRect(), f = flow.getBoundingClientRect();
    return [r.left + r.width / 2 - f.left, r.top + r.height / 2 - f.top];
  };
  const path = (a, b, kind) => {
    const [x1, y1] = a, [x2, y2] = b;
    if (kind === "loop") { const d = 72; return `M${x1} ${y1} C${x1} ${y1 + d} ${x2} ${y2 + d} ${x2} ${y2}`; }
    if (!wide.matches) { const d = Math.max(24, (y2 - y1) / 2); return `M${x1} ${y1} C${x1} ${y1 + d} ${x2} ${y2 - d} ${x2} ${y2}`; }
    const d = Math.max(36, Math.abs(x2 - x1) / 2);
    return `M${x1} ${y1} C${x1 + d} ${y1} ${x2 - d} ${y2} ${x2} ${y2}`;
  };

  const draw = () => {
    const f = flow.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${f.width} ${f.height}`);
    svg.replaceChildren();
    const add = (d, cls, i) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d); p.setAttribute("pathLength", "1"); p.setAttribute("class", `wire ${cls}`);
      p.style.setProperty("--i", i);
      if (drawn || reduce()) p.classList.add("is-drawn");
      svg.append(p);
    };
    for (let i = 0; i < nodes.length - 1; i++) {
      const out = nodes[i].querySelector(".port--out"), inn = nodes[i + 1].querySelector(".port--in");
      if (out && inn) add(path(at(out), at(inn)), i === 1 ? "wire--yes" : "", i);
    }
    const no = nodes[1]?.querySelector(".port--no"), back = nodes[0]?.querySelector(".port--back");
    if (wide.matches && no && back) {
      const a = at(no), b = at(back);
      add(path(a, b, "loop"), "wire--no", 4);
      if (tag) { tag.style.left = `${(a[0] + b[0]) / 2}px`; tag.style.top = `${Math.max(a[1], b[1]) + 56}px`; }
    }
  };

  draw();
  new ResizeObserver(draw).observe(flow);
  wide.addEventListener?.("change", draw);
  document.fonts?.ready.then(draw);

  // Wires draw themselves on as the graph arrives
  new IntersectionObserver(([e], io) => {
    if (!e.isIntersecting) return;
    io.disconnect(); drawn = true;
    requestAnimationFrame(() => svg.querySelectorAll(".wire").forEach((p) => p.classList.add("is-drawn")));
  }, { threshold: 0.3 }).observe(flow);
})();
