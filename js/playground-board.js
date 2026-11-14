/* Playground board: a true masonry. Tiles are dealt to the shortest column in order, then each column is stretched a few
   pixels per tile so every column ends on the same line: no ragged bottom edge, no holes. Phones stay one plain column. */
(() => {
  const lab = document.querySelector(".pg-board .lab");
  if (!lab) return;
  const GAP = 8;
  const cols = () => (innerWidth >= 1024 ? 3 : innerWidth >= 768 ? 2 : 1);
  const ratio = (t) => {
    if (!t.dataset.ar) {
      t.style.aspectRatio = "";
      const v = getComputedStyle(t).aspectRatio, m = /([\d.]+)\s*(?:\/\s*([\d.]+))?/.exec(v);
      t.dataset.ar = m ? String(parseFloat(m[1]) / (m[2] ? parseFloat(m[2]) : 1)) : "1.3333";
    }
    return parseFloat(t.dataset.ar);
  };
  const layout = () => {
    const tiles = [...lab.children].filter((t) => !t.hidden);
    const n = cols();
    if (n === 1) {
      lab.classList.remove("is-masonry");
      tiles.forEach((t) => { t.style.gridColumn = t.style.gridRow = t.style.aspectRatio = ""; });
      return;
    }
    const W = lab.clientWidth, colW = (W - (n - 1) * GAP) / n;
    if (!(colW > 0)) return;
    lab.classList.add("is-masonry"); lab.style.setProperty("--cols", n);
    const col = Array.from({ length: n }, () => ({ items: [], h: 0 }));
    tiles.forEach((t) => {
      const h = colW / ratio(t) + GAP;
      const c = col.reduce((a, b) => (b.h < a.h - 0.5 ? b : a));
      c.items.push({ t, h }); c.h += h;
    });
    const target = Math.max(...col.map((c) => c.h));
    col.forEach((c, ci) => {
      const k = target / c.h;                       // spread the shortfall over every tile in the column
      let y = 0;
      c.items.forEach(({ t, h }) => {
        const span = Math.max(1, Math.round(h * k));
        t.style.aspectRatio = "auto";
        t.style.gridColumn = String(ci + 1);
        t.style.gridRow = `${Math.round(y) + 1} / span ${span}`;
        y += h * k;
      });
    });
  };
  let raf = 0;
  const queue = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };
  new ResizeObserver(queue).observe(lab);
  addEventListener("load", queue);
  layout();
})();
