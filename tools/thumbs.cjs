// Writing thumbnails: an abstract artwork ground with one minimal glyph that stands for the post's idea.
// Glyphs are single-stroke SVG on a 48 grid (white, frosted plate); styles live in the "Writing grid" block of css/site.css.
const c = (x, y, r, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" ${extra}/>`;
const d = (x, y, o = 1) => `<circle cx="${x}" cy="${y}" r="1.7" fill="currentColor" stroke="none" opacity="${o}"/>`;
const line = (x1, y1, x2, y2, extra = "") => `<path d="M${x1} ${y1}L${x2} ${y2}" ${extra}/>`;
const grid = (n, step, x0, y0, pick = () => 1) => Array.from({ length: n * n }, (_, i) => d(x0 + (i % n) * step, y0 + Math.floor(i / n) * step, pick(i))).join("");

const G = {
  // evidence thins out toward the edge: a dot field that fades (confidence)
  "confidence-is-the-missing-layer": () => Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, k) => d(8 + k * 8, 8 + r * 8, Math.max(.15, 1 - k * .22))).join("")).join(""),
  // linked nodes, some faint: selective memory
  "ux-for-agentic-systems": () => `${line(12, 14, 26, 24)}${line(26, 24, 38, 12)}${line(26, 24, 20, 38)}${line(26, 24, 40, 34, 'opacity=".35"')}${c(12, 14, 3)}${c(38, 12, 3)}${c(26, 24, 4, 'fill="currentColor"')}${c(20, 38, 3)}${c(40, 34, 3, 'opacity=".35"')}`,
  // one name, many values: a token line fanning to three
  "semantic-tokens": () => `${c(10, 24, 3, 'fill="currentColor"')}${line(13, 24, 26, 24)}${line(26, 24, 38, 12)}${line(26, 24, 38, 24)}${line(26, 24, 38, 36)}${c(40, 12, 2.6)}${c(40, 24, 2.6)}${c(40, 36, 2.6)}`,
  // lightness, chroma, hue: three circles stepping in lightness
  "oklch": () => `${c(14, 24, 8, 'opacity=".35"')}${c(24, 24, 8, 'opacity=".65"')}${c(34, 24, 8)}`,
  // a triangle nudged off the square's centre
  "optical-alignment": () => `<rect x="9" y="9" width="30" height="30" rx="2"/>${line(24, 9, 24, 39, 'opacity=".3"')}${line(9, 24, 39, 24, 'opacity=".3"')}<path d="M20 17L33 24L20 31Z" fill="currentColor" stroke="none"/>`,
  // composition: boxes inside boxes
  "component-api-design": () => `<rect x="8" y="8" width="32" height="32" rx="3"/><rect x="14" y="14" width="20" height="9" rx="2"/><rect x="14" y="27" width="9" height="7" rx="2"/><rect x="26" y="27" width="8" height="7" rx="2" opacity=".4"/>`,
  // blocks stacking up
  "design-debt": () => `<rect x="8" y="32" width="10" height="8"/><rect x="19" y="26" width="10" height="14"/><rect x="30" y="16" width="10" height="24" opacity=".6"/>${line(6, 42, 42, 42)}`,
  // one circle on one line: less, but better
  "dieter-rams": () => `${line(8, 30, 40, 30)}${c(24, 20, 9)}`,
  // pixel mark, 5x5, a smile
  "susan-kare": () => `${[[1, 1], [3, 1], [0, 3], [1, 4], [2, 4], [3, 4], [4, 3]].map(([x, y]) => `<rect x="${8 + x * 6}" y="${8 + y * 6}" width="5" height="5" fill="currentColor" stroke="none"/>`).join("")}`,
  // stakes: rings that grow
  "progressive-disclosure": () => `${c(24, 24, 4, 'fill="currentColor"')}${c(24, 24, 10, 'opacity=".6"')}${c(24, 24, 17, 'opacity=".3"')}`,
  // an easing curve
  "perceived-performance": () => `${line(8, 40, 40, 40, 'opacity=".3"')}${line(8, 40, 8, 8, 'opacity=".3"')}<path d="M8 40C26 40 18 8 40 8"/>${c(40, 8, 2.4, 'fill="currentColor"')}`,
  // dots along an arc, trailing off
  "motion-choreography": () => [0, 1, 2, 3, 4, 5].map((i) => d(10 + i * 6.4, 36 - Math.sin((i / 5) * Math.PI) * 22, .2 + i * .16)).join(""),
  // a distribution
  "emil-kowalski": () => `<path d="M6 38C14 38 16 12 24 12S34 38 42 38"/>${line(24, 12, 24, 38, 'opacity=".35" stroke-dasharray="2 3"')}`,
  // ten attempts, one stands out
  "non-deterministic-systems": () => Array.from({ length: 10 }, (_, i) => c(9 + (i % 5) * 7.5, 18 + Math.floor(i / 5) * 12, 2.6, i === 6 ? 'fill="currentColor"' : 'opacity=".55"')).join(""),
  // undo: a loop back
  "trust-and-error-states": () => `<path d="M30 14H18a8 8 0 0 0 0 16h14"/><path d="M24 8L17 14L24 20"/>`,
  // waiting: bars of uneven length, one running
  "model-latency": () => `${line(10, 14, 38, 14, 'opacity=".3"')}${line(10, 24, 38, 24, 'opacity=".3"')}${line(10, 34, 38, 34, 'opacity=".3"')}${line(10, 14, 28, 14)}${line(10, 24, 20, 24)}${line(10, 34, 34, 34)}`,
  // a catalog: a grid of parts, one open slot
  "generative-ui": () => `${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${9 + (i % 3) * 11}" y="${9 + Math.floor(i / 3) * 11}" width="8" height="8" rx="1.5"/>`).join("")}<rect x="31" y="31" width="8" height="8" rx="1.5" stroke-dasharray="2 2" opacity=".5"/>`,
  // two parties, overlapping
  "jobs-to-be-done": () => `${c(18, 24, 11)}${c(30, 24, 11, 'opacity=".6"')}`,
  // a lever on a fulcrum
  "linear-design-engineering-culture": () => `${line(8, 18, 40, 30)}<path d="M20 36L26 24.5L32 36Z" opacity=".6"/>${c(8, 18, 2.4, 'fill="currentColor"')}${c(40, 30, 4)}`,
  // a grid with one selected
  "notion-craft": () => `${grid(4, 9, 7.5, 7.5, () => .5)}${c(25.5, 25.5, 5)}`,
  // a queue of rows, the first approved
  "boris-cherny": () => `${[0, 1, 2].map((i) => `<rect x="8" y="${9 + i * 11}" width="32" height="8" rx="2" opacity="${1 - i * .3}"/>`).join("")}<path d="M12 13L14.4 15.4L18.6 11" stroke-width="1.4"/>`,
  // play, inside an outline
  "jordan-singer": () => `${c(24, 24, 15)}<path d="M21 17.5L31 24L21 30.5Z" fill="currentColor" stroke="none"/>`,
  // a dashed sketch becoming a solid screen
  "paper-design-workflow": () => `<rect x="7" y="12" width="14" height="24" rx="2" stroke-dasharray="3 3" opacity=".6"/>${line(24, 24, 28, 24)}<path d="M26 21L29 24L26 27"/><rect x="31" y="10" width="10" height="28" rx="2" fill="currentColor" stroke="none" opacity=".9"/>`,
};

// Two short topic tags per post, shown above the thumbnail
const TAGS = {
  "confidence-is-the-missing-layer": ["Confidence", "Agents"], "ux-for-agentic-systems": ["Memory", "Context"],
  "semantic-tokens": ["Tokens", "Naming"], "oklch": ["Colour", "OKLCH"], "optical-alignment": ["Alignment", "Icons"],
  "component-api-design": ["Components", "APIs"], "design-debt": ["Debt", "Generated UI"], "dieter-rams": ["Principles", "Honesty"],
  "susan-kare": ["Icons", "Status"], "progressive-disclosure": ["Disclosure", "Stakes"], "perceived-performance": ["Speed", "Honesty"],
  "motion-choreography": ["Motion", "Tokens"], "emil-kowalski": ["Taste", "Distribution"], "non-deterministic-systems": ["Variance", "Selection"],
  "trust-and-error-states": ["Trust", "Recovery"], "model-latency": ["Latency", "Material"], "generative-ui": ["Catalogs", "Generative UI"],
  "jobs-to-be-done": ["Agents", "Customers"], "linear-design-engineering-culture": ["Taste", "Culture"], "notion-craft": ["Selection", "Craft"],
  "boris-cherny": ["Review", "Chat"], "jordan-singer": ["Demos", "Research"],
  "paper-design-workflow": ["Process", "Paper"],
};
const tagsFor = (slug) => { const k = Object.keys(TAGS).find((x) => slug === x || slug.includes(x)); return k ? `<span class="post__tags">${TAGS[k].map((t) => `<i>${t}</i>`).join("")}</span>\n          ` : ""; };

const thumbTile = (slug) => {
  const keys = Object.keys(G), key = keys.find((k) => slug === k || slug.includes(k));
  const n = (Math.max(0, keys.indexOf(key)) % 5) + 1;
  const art = key ? G[key]() : c(24, 24, 10);
  return `${tagsFor(slug)}<div class="post__tile pdp" style="--bg:url(/assets/images/writing/abstract/${n}.webp)" aria-hidden="true"><span class="pd-plate"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${art}</svg></span></div>`;
};
module.exports = { thumbTile, G };
