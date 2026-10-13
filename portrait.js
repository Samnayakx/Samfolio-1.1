/* Pixel-art Sambit — drawn entirely in code. Stands & fidgets, does push-ups, says hi on hover. */
(() => {
  const host = document.querySelector('[data-pixel-me]');
  if (!host) return;

  const C = {
    navy: '#1b2236', cap: '#F1EFE6', blue: '#2F5FD0', ink: '#45454c',
    skin: '#E2A672', skinD: '#B9763F', mouth: '#A8583B', eye: '#1c1c22',
    shirt: '#F5ECCE', edge: '#E8D285', pants: '#12141c', pantsHi: '#202437',
    belt: '#0a0a0a', stud: '#E9DAA3', shoe: '#A07F4A', shoeD: '#7B5D33', red: '#C8102E', white: '#fff'
  };
  const r = (x, y, w, h, c, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${extra}/>`;

  /* ── Standing, front view (local grid 28 × 68) ── */
  const letters = [0, 1, 2, 3, 4, 5, 6].map(i => {
    const x = 8.3 + i * 1.6, y = 24 + [2, 1, .4, 0, .4, 1, 2][i] ;
    return i === 5 ? '' : r(x, y, 1, 3, C.ink) + r(x, y, 1.4, 1, C.ink);
  }).join('');

  const head = `
    <g class="px-head">
      ${r(9, 0, 10, 6, C.navy)}${r(10, 1, 8, 4, C.cap)}${r(11, 2, 6, 1, C.blue)}${r(12, 3, 4, 1, C.blue)}${r(11, 4, 6, 1, C.ink)}
      ${r(8, 6, 12, 1, C.navy)}
      ${r(10, 7, 8, 7, C.skin)}${r(10, 7, 8, 1, C.navy)}
      ${r(9, 8, 1, 3, C.skin)}${r(18, 8, 1, 3, C.skin)}${r(9, 9, 1, 1, C.skinD)}${r(18, 9, 1, 1, C.skinD)}
      <g class="px-eyes">${r(11, 9, 2, 1, C.eye)}${r(15, 9, 2, 1, C.eye)}</g>
      ${r(13, 11, 2, 1, C.skinD)}${r(13, 13, 2, 1, C.mouth, 'class="px-mouth"')}
      ${r(10, 13, 8, 1, C.skinD, 'opacity=".35"')}
      ${r(12, 14, 4, 2, C.skinD)}
    </g>`;

  const armL = `<g class="px-armL">${r(4, 17, 3, 8, C.shirt)}${r(4, 24, 3, 1, C.edge)}${r(4, 17, 1, 7, C.edge)}${r(5, 25, 2, 8, C.skin)}${r(5, 33, 2, 3, C.skin)}${r(5, 25, 1, 11, C.skinD)}</g>`;
  const armR = `<g class="px-armR">${r(21, 17, 3, 8, C.shirt)}${r(21, 24, 3, 1, C.edge)}${r(23, 17, 1, 7, C.edge)}${r(21, 25, 2, 8, C.skin)}${r(21, 33, 2, 3, C.skin)}${r(22, 25, 1, 11, C.skinD)}${r(21, 33, 3, 1, C.belt)}</g>`;

  const stand = `
    <g class="st" transform="translate(26 6)">
      <g class="px-legs">
        ${r(8, 39, 13, 8, C.pants)}${r(7, 47, 7, 18, C.pants)}${r(15, 47, 7, 18, C.pants)}
        ${r(9, 50, 1, 11, C.pantsHi)}${r(19, 50, 1, 11, C.pantsHi)}
        ${r(7, 65, 7, 3, C.shoe)}${r(15, 65, 7, 3, C.shoe)}${r(7, 67, 7, 1, C.shoeD)}${r(15, 67, 7, 1, C.shoeD)}
      </g>
      <g class="px-body">
        ${r(7, 16, 14, 23, C.shirt)}${r(7, 16, 14, 1, C.edge)}${r(11, 15, 6, 1, C.edge)}
        ${r(7, 34, 3, 5, C.edge)}${r(7, 38, 14, 1, C.edge, 'opacity=".0"')}
        ${letters}${r(13, 28, 2, 2, C.red)}${r(13.6, 28, .8, 2, C.white)}${r(13, 28.6, 2, .8, C.white)}
        ${r(9, 38, 12, 1, C.belt)}${r(10, 38, 1, 1, C.stud)}${r(12, 38, 1, 1, C.stud)}${r(14, 38, 1, 1, C.stud)}${r(16, 38, 1, 1, C.stud)}
        ${r(20, 38, 3, 1, C.belt)}
        ${armL}${armR}
        ${head}
      </g>
    </g>`;

  /* ── Push-up, side view (facing right), ground at y = 74 ── */
  const G = 74;
  const frame = (sy, i) => {
    const feetY = 70, x0 = 8, x1 = 47;
    let s = '';
    for (let x = x0; x < x1; x++) {
      const t = (x - x0) / (x1 - x0);
      const yc = Math.round(feetY + (sy - feetY) * t);
      const torso = x >= 29;
      const th = torso ? 8 : 6;
      s += r(x, yc - th / 2 - (torso ? 1 : 0), 1, th, torso ? C.shirt : C.pants);
      if (torso && x < 31) s += r(x, yc - th / 2 - 1, 1, 1, C.edge);
      if (!torso && (x % 5 === 2)) s += r(x, yc - 1, 1, 3, C.pantsHi);
    }
    const hy = sy - 6;
    const head = r(48, hy, 8, 8, C.skin) + r(48, hy, 8, 2, C.navy) +                /* hair */
      r(47, hy - 2, 9, 3, C.navy) + r(48, hy - 2, 7, 2, C.cap) + r(56, hy + 1, 4, 1, C.navy) + /* cap + brim */
      r(53, hy + 3, 2, 1, C.eye) + r(55, hy + 5, 1, 1, C.skinD) + r(53, hy + 7, 3, 1, C.mouth) +
      r(46, hy + 6, 3, 3, C.skinD);                                                   /* neck */
    const shoulderY = sy - 1;
    const armTop = shoulderY + 3;
    const arm = r(42, shoulderY - 1, 6, 4, C.shirt) + r(43, armTop, 3, G - armTop, C.skin) + r(43, armTop, 1, G - armTop, C.skinD) + r(42, G - 2, 6, 2, C.skin);
    const feet = r(2, feetY - 1, 6, 5, C.shoe) + r(2, G - 1, 6, 1, C.shoeD);
    return `<g class="pf" style="--i:${i}">${feet}${s}${head}${arm}</g>`;
  };
  const push = `<g class="pu">${[54, 61, 67, 61].map((sy, i) => frame(sy, i)).join('')}</g>`;

  host.innerHTML = `
    <svg viewBox="0 0 80 80" shape-rendering="crispEdges" role="img" aria-label="Pixel-art Sambit Nayak, doing push-ups and waving hello">
      <g class="px-shadow" opacity=".16"><rect x="14" y="74" width="52" height="2" fill="currentColor"/></g>
      ${stand}${push}
    </svg>
    <span class="px-bubble" aria-hidden="true">Hi!</span>`;

  /* ── Behaviour: stand → push-ups → stand …; hover/tap = stand up & wave ── */
  const fig = host;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mode = 'stand', hovering = false, timer;
  const set = m => { mode = m; fig.dataset.mode = hovering ? 'hi' : m; };
  const loop = () => {
    clearTimeout(timer);
    if (reduce) return;
    timer = setTimeout(() => { if (!hovering) set(mode === 'stand' ? 'push' : 'stand'); loop(); }, mode === 'stand' ? 4200 : 6400);
  };
  const hi = on => { hovering = on; fig.dataset.mode = on ? 'hi' : mode; };
  fig.closest('.portrait__frame').addEventListener('pointerenter', () => hi(true));
  fig.closest('.portrait__frame').addEventListener('pointerleave', () => hi(false));
  fig.closest('.portrait__frame').addEventListener('click', () => { hi(true); setTimeout(() => hi(false), 2200); });
  set(reduce ? 'stand' : 'push'); loop();
})();
