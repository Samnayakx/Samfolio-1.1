# Nothing — Design System

> Reverse-engineered from **https://us.nothing.tech/** (Shopify Hydrogen + Tailwind), October 2026.
> Values are taken from the live site's stylesheets and computed styles, not estimated. Where the site only implies a rule, it is marked **(inferred)**.

---

## 1. Design principles

1. **Monochrome first, colour is the product.** The UI uses only a cold greyscale. Colour comes from photography and product finishes (pink, red, teal), so the chrome never competes with it.
2. **Industrial and typographic.** Three type voices, each with one job: a dot-matrix display face (Ndot), a quirky grotesk for headlines (NType82), and a monospace for labels and UI (Geist Mono / Lattera Mono). Labels are always UPPERCASE mono.
3. **Frosted, not shadowed.** Depth comes from translucent "frost" surfaces (`backdrop-filter: blur(45px)`), not drop shadows. The site renders no box-shadows.
4. **Flat edges, small radii.** 4px on controls, 8px on cards and panels. No pills except the occasional dot or badge.
5. **Brackets as a signature.** Product names are written with spaced parentheses: `Headphone ( 1 ) Pro`, `Nothing ( Charli xcx )`, `Club Nothing (R)`.
6. **Full-bleed media, tight gutters.** Edge-to-edge 16:9 media alternates with light grey gallery sections. Grid gutters are only 8px.
7. **Quiet motion.** Opacity and transform only, 100–500ms, Material standard easing.

---

## 2. Colour

The site stores colours as space-separated RGB channels so Tailwind can apply alpha (`rgb(var(--greyscale-900) / .6)`). Keep that pattern.

### 2.1 Greyscale ramp (core palette)

| Token | RGB | Hex | Usage |
|---|---|---|---|
| `--greyscale-white` | `255 255 255` | `#FFFFFF` | Text on dark, primary button on dark media |
| `--greyscale-100` | `244 244 244` | `#F4F4F4` | **Page background (light)** |
| `--greyscale-200` | `216 217 217` | `#D8D9D9` | Section tint (at 50%), secondary text on dark |
| `--greyscale-300` | `203 204 204` | `#CBCCCC` | Dividers (inferred) |
| `--greyscale-400` | `190 192 192` | `#BEC0C0` | Disabled fills (inferred) |
| `--greyscale-default` | `177 179 179` | `#B1B3B3` | Placeholder and muted text on dark |
| `--greyscale-600` | `155 157 157` | `#9B9D9D` | Disabled text (inferred) |
| `--greyscale-700` | `133 135 135` | `#858787` | Tertiary text |
| `--greyscale-800` | `111 112 112` | `#6F7070` | Icons on light |
| `--greyscale-900` | `89 90 90` | `#595A5A` | **Secondary text**, text links, frost tint |
| `--greyscale-1000` | `60 60 60` | `#3C3C3C` | Body copy (emphasised), input fill on dark (60%) |
| `--greyscale-dm-light` | `24 24 24` | `#181818` | Raised surface in dark mode |
| `--greyscale-black` / `--greyscale-dm-dark` | `4 4 4` | `#040404` | **Primary text, dark sections, footer** |

> Use `#040404` as "black" and `#F4F4F4` as "off-white". Pure `#000` exists only as `--color-dark` for overlays.

### 2.2 Accents (use sparingly)

| Token | RGB | Hex | Usage |
|---|---|---|---|
| `--accent-yellow` | `255 199 0` | `#FFC700` | **Focus ring**, newsletter "Sign up" CTA, highlights |
| `--accent-red` | `200 16 46` | `#C8102E` | Brand red: errors, sale badges, recording dot |
| `--accent-blue` | `0 47 108` | `#002F6C` | Rare informational accent |

Campaign and product colours also appear in the CSS: `#FF42AD` (pink), `#27D4E0` (cyan), `#006479` (teal), `#F4E300`/`#FFEE00` (lemon). Treat these as **campaign-scoped**, never as system UI colours.

### 2.3 Semantic tokens (recommended mapping)

```css
:root {
  --bg-page:        rgb(var(--greyscale-100));
  --bg-section:     rgb(var(--greyscale-200) / .5);
  --bg-inverse:     rgb(var(--greyscale-black));
  --surface-card:   rgb(var(--greyscale-900) / .05);  /* product tiles */
  --text-primary:   rgb(var(--greyscale-black));
  --text-secondary: rgb(var(--greyscale-900));
  --text-body:      rgb(var(--greyscale-1000));
  --text-inverse:   rgb(var(--greyscale-white));
  --text-inverse-muted: rgb(var(--greyscale-white) / .8);
  --focus:          rgb(var(--accent-yellow));
  --danger:         rgb(var(--accent-red));
}
.dark {
  --bg-page:        rgb(var(--greyscale-dm-dark));
  --bg-section:     rgb(var(--greyscale-dm-light));
  --surface-card:   rgb(var(--greyscale-white) / .05);
  --text-primary:   rgb(var(--greyscale-white));
  --text-secondary: rgb(var(--greyscale-200));
  --text-body:      rgb(var(--greyscale-200));
}
```

### 2.4 Contrast checks

| Pair | Ratio | Passes |
|---|---|---|
| `#040404` on `#F4F4F4` | ~18.9 : 1 | AAA |
| `#595A5A` on `#F4F4F4` | ~6.3 : 1 | AA (all text) |
| `#FFFFFF` at 80% on `#040404` | ~13 : 1 | AAA |
| `#040404` on `#FFC700` | ~13.6 : 1 | AAA |
| `#B1B3B3` on `#040404` | ~9.6 : 1 | AAA |

Never put `--greyscale-700` or lighter text on `#F4F4F4`, because it fails AA.

---

## 3. Typography

### 3.1 Families

| Role | Family | Fallback | Weight | Licence |
|---|---|---|---|---|
| **Headline / UI serif-grotesk** | `NType82-Regular` (and `NType82-Headline`) | `sans-serif` | 400 | Proprietary (Nothing) |
| **Dot-matrix display** | `Ndot-Regular` (wght 55), `Ndot-Bold` (wght 57) | `"Doto", monospace` | 55 / 57 | Proprietary |
| **Body** | `Geist Variable` | `sans-serif` | 100–900 | Open (OFL) |
| **Labels / buttons / meta** | `Geist Mono Variable` | `monospace` | 100–900 | Open (OFL) |
| **Footer utility list** | `LatteraMonoLL` | `"Geist Mono", monospace` | 400 | Commercial (Lineto) |

> **Licensing:** NType82, Ndot and Lattera Mono are not freely licensed. For a non-Nothing product, use **Geist + Geist Mono** with a dot-matrix substitute such as **Doto** (Google Fonts), and a characterful grotesk such as **Instrument Sans** or **PP Neue Montreal** in place of NType82.

```css
--font-ntype:   "NType82-Regular", sans-serif;
--font-ndot:    "Ndot-Regular", "Doto", sans-serif;
--font-ndot-b:  "Ndot-Bold", "Doto", sans-serif;
--font-body:    "Geist Variable", "Geist", sans-serif;
--font-mono:    "Geist Mono Variable", "Geist Mono", monospace;
--font-utility: "LatteraMonoLL", "Geist Mono", monospace;
```

### 3.2 Type scale (named tokens from the site)

All display and heading styles use `line-height: 1` (or close to it) and **no letter-spacing**. The tightness is part of the look.

**NType82: display and headings** (sentence case)

| Token | Size | Line height | Used for |
|---|---|---|---|
| `ntype-display-xxl` | 60px / 3.75rem | 1 | Campaign hero (≥1536px) |
| `ntype-display-xl` | 48px / 3rem | 1 | **H1 / H2 at desktop** |
| `ntype-display-lg` | 40px / 2.5rem | 1 | H2 at tablet |
| `ntype-heading-xl` | 32px / 2rem | 1 | **H1 / H2 on mobile**, editorial statements |
| `ntype-heading-lg` | 24px / 1.5rem | 1.1 | H3, product card titles |
| `ntype-heading-md` | 20px / 1.25rem | 1.2 | H3 on mobile |
| `ntype-subheading-lg` | 18px / 1.125rem | 1.4 | Value-prop captions |
| `ntype-subheading-md` | 16px / 1rem | 1.4 | Sub-captions |
| `ntype-subheading-sm` | 14px / .875rem | 1.4 | Small captions |

**Ndot: dot-matrix** (ALWAYS UPPERCASE)

| Token | Size | Weight | Used for |
|---|---|---|---|
| `ndot-display-xxxl` | 60px | 55 | Big numerals and statements |
| `ndot-display-xxl` | 40px | 55 | **Footer primary nav** |
| `ndot-display-xl` | 30px | 57 | Feature callouts |
| `ndot-heading-lg` | 20px | 57 | **Eyebrow above hero titles** (`HEADPHONE ( 1 ) PRO`) |
| `ndot-heading-md` | 18px | 57 | Eyebrow (tablet) |
| `ndot-heading-sm` | 16px | 57 | Eyebrow (mobile) |
| `ndot-heading-xs` | 14px | 57 | Tags |
| `logo` | 20px | 55 | Wordmark text (`NOTHING (R)`) |

**Geist: body**

| Token | Size | Line height |
|---|---|---|
| `body-lg` | 20px | 1.2 |
| `body` | 16px | 1.4 (22.4px) |
| `body-md` | 16px | 1.3 (20.8px), **most common on site** |
| `body-sm` | 14px | 1.4 |

**Geist Mono: labels** (ALWAYS UPPERCASE)

| Token | Size | Line height | Used for |
|---|---|---|---|
| `mono-lg` | 16px | 1.25 | Large labels |
| `mono-md` | 14px | 1.25 | Category links (`EARBUDS >`) |
| `mono-sm` | 12px | 1.25 | **Buttons, text links, inputs, announcement bar** |
| `mono-xs` | 11px | 1.25 | Footer utility list (Lattera), legal |

### 3.3 Responsive heading pattern

```html
<h2 class="font-ntype82 text-ntype-heading-xl md:text-ntype-display-lg xl:text-ntype-display-xl">
```
32px on mobile → 40px at 768px → 48px at 1280px.

### 3.4 Type rules

- **Eyebrow + headline pairing:** Ndot uppercase eyebrow (20px), 8–16px gap, then NType82 headline. Centre both over hero media.
- **Labels are never sentence case.** Anything that is a button, a link, metadata or a form label uses uppercase Geist Mono.
- **Headlines are never uppercase.** NType82 always stays in sentence case.
- **Brackets:** write model numbers as `( 1 )`, with a space inside each parenthesis, in eyebrows. Use `(1)` in body copy.
- Headline measure is at most ~22ch (hero copy breaks over 2 lines). Body measure is at most 60ch (`max-w-xl` / `max-w-2xl`).

---

## 4. Spacing and layout

### 4.1 Spacing scale and hierarchy

Spacing is a fixed scale on a 4px base. Nothing outside the scale is used for layout. The scale is defined once as CSS tokens and every section reads from it.

| Token | px | Role |
|---|---|---|
| `--space-1` | 4 | Icon nudges, hairline gaps |
| `--space-2` | 8 | **Grid gap** (cards, tiles), panel inset from the viewport, header padding |
| `--space-3` | 12 | Button vertical padding |
| `--space-4` | 16 | **Gutter on mobile**, button horizontal padding, small card padding |
| `--space-5` | 24 | **Stack gap** inside a card or block, card padding |
| `--space-6` | 32 | **Gutter on tablet and desktop** (side padding of every panel) |
| `--space-7` | 40 | Heading → content gap on mobile |
| `--space-8` | 48 | Heading → content gap on tablet |
| `--space-9` | 64 | **Heading → content gap on desktop**, gap between rows of illustrated items |
| `--space-10` | 96 | **Section padding on mobile** |
| `--space-11` | 112 | **Section padding on tablet**, hero top clearance |
| `--space-12` | 144 | **Section padding on desktop** |

**The hierarchy, from large to small**

1. **Section** (`--section-y`): 144px desktop, 112px tablet, 96px mobile, applied top and bottom to every panel (Work, Capabilities, About modes). Panels sit 8px apart.
2. **Heading block → content** (`--head-gap`): 64 / 48 / 40px. The same gap sits under every section heading.
3. **Gutter** (`--gutter`): 32px, or 16px below 768px. This is the side padding of every panel. Content never touches a panel edge.
4. **Grid gap** (`--grid-gap`): always 8px between cards, tiles and bars.
5. **Stack** (`--space-5`, 24px): between a card's text blocks. Inside a block, stack at 8px.

Rules:
- Larger levels must be strictly larger than the levels they contain (section > heading gap > stack > grid gap).
- Do not invent one-off values. If a gap isn't on the scale, round to the nearest token.
- Exceptions: the footer's top padding is at least 120px so the game's mascot has room to jump, and the hero's top padding is `--space-11` to clear the fixed header.
- Case studies are listed **one under another** at full width (image on top, text in two columns below), with the 8px grid gap between them.

### 4.2 Containers

| Token | Width | Use |
|---|---|---|
| `max-w-xl` | 576px | **Floating nav pill**, newsletter form |
| `max-w-2xl` | 672px | Centred copy blocks |
| `max-w-6xl` | 1152px | Content grid (value props, footer) |
| `full` | 100% | Media sections; edge-to-edge with 8px gutter |

### 4.3 Grid

- Product and category galleries: CSS grid, **8px column gap**, 40–96px row gap.
- Category row: 4 equal square tiles at desktop, horizontal scroll on mobile (inferred).
- Asymmetric editorial grid ("Going pink?"): one large square left; smaller staggered tiles right, offset vertically.
- Two-up product feature ("Pack your sound"): 2 × 4:3 tiles.

### 4.4 Breakpoints

| Name | Min width |
|---|---|
| `xs` | 400px |
| `sm` | 640px |
| `md` | 768px (main layout switch) |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |
| `3xl` | 1792px |

### 4.5 Layout variables

```css
--header-height: 64px;
--ui-top: 80px;            /* fixed header + padding */
--ui-bottom: 67px;          /* 80px at md+ */
--aside-width: 400px;      /* cart drawer */
--grid-item-width: 355px;  /* PLP card */
```

Full-viewport media uses `calc(100svh - var(--ui-top) - var(--ui-bottom))`.

---

## 5. Shape

| Token | Value | Use |
|---|---|---|
| `radius-none` | 0 | Full-bleed media, sections |
| `radius-sm` | 2px | Checkbox tick, tiny chips |
| `radius` | **4px** | **Buttons, inputs, checkboxes** |
| `radius-md` | 6px | Announcement bar, small panels |
| `radius-lg` | **8px** | **Cards, image tiles, nav pill, footer list panel** |
| `radius-full` | 9999px | Status dots and indicators only |

No borders are used on any visible component. Separation comes from fills and space.

---

## 6. Elevation: frost surfaces

Nothing replaces shadows with **frosted glass**. Every frost class has the same blur and differs only in tint and alpha.

```css
.frost { backdrop-filter: blur(45px); -webkit-backdrop-filter: blur(45px); }
```

| Class | Background | Use |
|---|---|---|
| `frost-white-intense` / `frost-white-80` | `white / .8` | **Header nav pill (light)**, focused inputs |
| `frost-grey-intense` / `frost-900-60` | `greyscale-900 / .6` | Header nav pill (dark), media overlays |
| `frost-1000-60` | `greyscale-1000 / .6` | **Inputs on dark** (newsletter email) |
| `frost-100-60` | `greyscale-100 / .6` | Light overlay panels |
| `frost-200-50` | `greyscale-200 / .5` | **Light grey section backgrounds** |
| `frost-100-10` | `greyscale-100 / .1` | Subtle panel on dark |
| `frost-white-08` | `white / .08` | Raised items on dark |
| `frost-grey-low` / `frost-900-05` | `greyscale-900 / .05` | **Product image tiles**, hover state (light) |
| `frost-white-low` | `white / .05` | Footer list rows, hover state (dark) |

**Rule:** for a hover state, add one frost level (for example, transparent → `frost-grey-low`). Do not add shadows.

Tailwind's `shadow-sm/shadow/shadow-lg` exist in the CSS but are unused on the storefront. Reserve them for floating overlays such as the cart drawer or toasts, if you need them at all.

---

## 7. Motion

Motion is quiet, physical and a little mechanical. Most movement is **opacity and transform only**, on `ease-standard`, and anything pixel-based moves in **steps** so it keeps its pixel character.

### 7.1 Tokens

| Token | Value | Use |
|---|---|---|
| `ease-standard` | `cubic-bezier(.4, 0, .2, 1)` | Default for everything |
| `ease-out` | `cubic-bezier(0, 0, .2, 1)` | Entrances |
| `ease-expressive` | `cubic-bezier(.74, 0, .19, .99)` | Panels opening, tiles and rows settling, flights |
| `ease-pulse` | `cubic-bezier(.4, 0, .6, 1)` | Status pulse |
| `ease-back` | `1 + 2.2(u−1)³ + 1.2(u−1)²` (JS) | Pixels and discs popping in (small overshoot) |
| `steps(n)` | n = 2–14 | Pixel motion: bob, hop, scanline reveal, blink |
| `duration-fast` | 100–150ms | Tooltips, press feedback |
| `duration-base` | 200ms | Hover colour, opacity and chevron nudges |
| `duration-medium` | 300–400ms | Panels, frames, label swaps |
| `duration-slow` | 500–900ms | Reveals, image zooms, grow-ins |

### 7.2 Animation catalogue

| Where | Animation | Spec |
|---|---|---|
| **Page loader** | Ring spins, settles, flies into the nav logo | See §8.3. Plays on first open and reload only, 1.5s minimum |
| **Nav logo** | Spins on hover/focus | Accelerates to 180°/s, then eases to the next resting pose (multiple of 30°, at least 30° more) |
| **Nav dropdowns** | Panel cards stagger in | Each card: opacity `.2s`, `translateY(−6px → 0)` over `.3s` `ease-expressive`, delayed 40ms per card. Desktop opens on hover (180ms close delay) and click |
| **Hero artifacts** | Bob, hop, parallax | Idle 3px bob in `steps(1)` over 4s, staggered. Hover: 12px hop in `steps(4)` over 450ms and the name fades in (200ms). Pointer parallax 6–16px per item |
| **Hero status dot** | Pulse | Opacity to .3 and back over 2s, `ease-pulse`, infinite |
| **Pixel icons** | Boot, flicker, blink | See §8.1 |
| **Work: dot field** | Dots light at random | 6 of 240 dots light every 1.4s; fill transition .6s |
| **Work: case rows** | Image zoom, arrow nudge | Image `scale(1.03)` over .9s `ease-expressive`; chevron `translateX(3px)` over .2s |
| **Work: nav thumbnail** | Swaps with the hovered project | Instant swap (no cross-fade) |
| **Capabilities tiles** | Reveal on scroll | `translateY(16px → 0)` and opacity over .6s / .7s `ease-expressive`, staggered 70ms per tile, triggers at 12% visible |
| | Orb spots | White blobs drift `translate(6%, −8%) scale(1.25)` over 9s `ease-in-out`, 3.5s on hover |
| | Strategy / Craft toggle | Text fades out 220ms, swaps, fades in; orb hue changes over .6s |
| | Prototype flow | Three gradient screens linked by a dotted path (the dots march along it, 1.2s linear). A pixel cursor travels screen to screen over a 6s loop, and the screen under it scales to 1.07 and brightens. Runs in 3.4s on hover |
| | Sky | Clouds drift ±6% over 14s; dark blobs shift 8px on hover |
| | Flower | Sways ±3° over 1.6s on hover |
| | Ring | Spins 40°/s idle, 160°/s on hover |
| | Parallax | Art shifts up to 10px with the pointer |
| **About: modes** | Character hover | Pixels flicker (§8.1); eyes blink |
| **About: portrait** | Scanline reveal, hover shift | `clip-path` from `inset(0 0 100% 0)` to `inset(0)` in `steps(14)` over 1.1s, 200ms delay. Hover: frame `translate(−3px, 3px)`, yellow block `10px → 16px`, .4s `ease-expressive` |
| **Footer: chart** | Grow-in | Bars `scaleY(0 → 1)` over .7s `ease-expressive`, delayed 9ms × index, when 25% visible |
| | Hover | Other bars drop to .42 opacity, bars within ±4 to .8, the active bar to 1 with `brightness(1.12)`; bars within ±2 lift `scaleY(1.05)`. Guide line and tooltip follow the pointer (150ms) |
| | Wordmark | Letters alternate up and down `.03em` over .4s `ease-expressive` on hover |
| **Footer: game** | Endless runner | See §7.3 |

### 7.3 Footer game: physics

The chart is the level. The 24-hour profile repeats as day after day, with ±8% height variation per day.

| Parameter | Value (u = 4 above 900px, otherwise 3) |
|---|---|
| Gravity | `475·u` px/s² |
| Jump velocity | `160·u` px/s (apex about 108px at u = 4). Releasing early halves upward speed, so jump height is variable |
| Speed | `55·u` px/s, rising `4·u` per second up to `140·u` (reached after about 21s) |
| Obstacles | Spawn gap `speed × (0.95 to 1.95)s + 16·u`, drawn as a 7 × 6 pixel bug on the bars |
| Run cycle | Legs swap at 12 fps while grounded |
| Score | `distance / (5·u)`, high score stored in `localStorage` |
| Retry | Locked for 350ms after game over so a held key doesn't restart it |
| Pause | Pauses when off screen or the tab is hidden |

### 7.4 Rules

- **Pixel things move in steps.** Bobs, hops, reveals and blinks use `steps()`, not smooth easing. Smooth easing is for panels, images and fades.
- **Only animate** `opacity`, `transform`, `translate`, `clip-path` and (for fills) `opacity`. Never animate layout properties.
- **Stagger** by index or position (`(x + y) × 18ms` for pixels, 40–70ms for cards and tiles, 9ms for bars), never random delays, so replays look the same.
- **Pause what isn't visible.** Anything on a `requestAnimationFrame` loop (loader, ring, game, parallax) pauses when off screen or when the tab is hidden, using `IntersectionObserver` and `document.hidden`.
- **Loops are rare and slow** (4s and longer), except the status dot and the bell ring.
- **Touch:** no hover-only information. Parallax is disabled for touch pointers. Tooltips also open on tap.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no loader spin or flight (a short fade instead), no bob, hop, parallax, blink, drift or loops. Reveals show their end state. The game stays available because the player starts it.
- Page-level transitions between pages are not used.

---

## 8. Iconography

### 8.0 The icon family

| Family | Colour | Grid | Used for | Section |
|---|---|---|---|---|
| **Brand ring** | `currentColor` | 12 ellipses | Logo, loader, favicon | §8.3 |
| **Pixel icons** | `currentColor` | 11×11, 13×13 | Characters, thumbnails, glyphs | §8.1 |
| **UI pixel icons** | `currentColor` | 3×3 of 2px squares on 16px | Menu button | §8.2 |
| **Line icons** | `currentColor` | 16×16, 1.5px stroke | Theme toggle, chevrons | §8.2 |
| **Pixel artifacts** | Fixed warm palette | Up to 30×17 | Hero decoration (California motifs) | §8.4 |
| **Pixel illustrations** | Fixed palette | 9×9 to 14×8 | Capabilities tiles (bell, bouquet) | §8.5 |
| **Game sprites** | Fixed palette | 12×8, 7×6 | Footer runner | §8.6 |

What they share: **square cells, no round dots, no grey plate behind them, no shadows and no outlines.** Monochrome families follow the text colour. Coloured families (artifacts, illustrations, sprites) keep their own palette in both themes.

### 8.1 Pixel icons (signature)

Pixel icons are the system's signature graphic. They are used for navigation tiles, illustrated characters, card thumbnails and UI glyphs. They follow three hard rules:

1. **Square pixels, never dots.** Every lit cell is a **square**. Round dots belong only to the Ndot typeface and to status indicators, never to icons.
2. **No grey background.** Draw **only the lit pixels**. No unlit or "ghost" grid, no grey tile, no plate or card behind the icon. The icon sits directly on whatever surface holds it.
3. **One colour.** Use `currentColor` (`--text-primary`): `#040404` on light and `#FFFFFF` on dark. No gradients, outlines or shadows.

**Grid and geometry**

| Use | Grid | Rendered size |
|---|---|---|
| Small UI icons (menu, actions) | 16 × 16 | 16px |
| Navigation tiles, contact thumbnails | 11 × 11 | 56 / 72 / 88px |
| Illustrated characters (with faces) | 13 × 13 | 88 / 128px |

- Each cell is 8 units: a **7 × 7 square with a 1-unit gutter** (the square fills 87.5% of its cell). Set `shape-rendering: crispEdges`.
- Render at sizes where the cell lands on whole pixels where possible, so edges stay sharp.
- Author icons as text bitmaps: `#` is a lit pixel, `.` is empty, and `e` is a lit "eye" pixel that may blink.

```js
// 11×11 "contact" icon
[
  "...........",
  "###########",
  "##.......##",
  "#.#.....#.#",
  "#..#...#..#",
  "#...#.#...#",
  "#....#....#",
  "#.........#",
  "#.........#",
  "###########",
  "...........",
]
```

```html
<!-- Rendered output: only lit cells, as squares, no background -->
<svg viewBox="0 0 88 88" shape-rendering="crispEdges" aria-hidden="true">
  <rect x="0.5" y="8.5" width="7" height="7" fill="currentColor"/>
  <!-- … one <rect> per lit cell … -->
</svg>
```

**Motion**

| Behaviour | Spec |
|---|---|
| Boot-in | Pixels fade in along a diagonal sweep, delayed `(x + y) × 18ms`, with 300ms `ease-standard` per pixel |
| Hover | Flicker: opacity `.15 → 1` over 500ms, using the same diagonal delay |
| Blink (characters only) | Eye pixels drop to opacity 0 for ~3% of a 6s loop, with a random start offset per icon |
| Reduced motion | No boot, flicker or blink. Pixels are shown statically |

**Interaction:** hover and focus feedback goes on the **label** (opacity `.7`) and the pixel flicker. It never goes on a background behind the icon.

### 8.2 Other icons

- The menu icon is a 3 × 3 grid of **2px square pixels** (at x/y 2, 7, 12) on a 16px canvas, not a hamburger and not dots.
- Line icons (theme toggle, chevrons) use a 1.5px stroke on a 16 × 16 grid with `currentColor`. The theme toggle is a circle with its right half filled.
- Icon-in-button wrapper: `size-4`, gap 8px after the label.
- The chevron `›` follows every CTA and text link.
- Value-prop icons are 16–20px pixel or line glyphs, centred above an 18px NType caption.

> Note: nothing.tech itself draws its glyphs as round dots on a faint dot grid. This system deliberately uses **square pixels on a transparent ground** instead.

### 8.3 Brand mark: the ring

The logo is a ring of **12 flat discs seen in perspective**. Each disc faces outward, so the discs at the front and back are full circles and the ones at the sides turn edge-on into thin slivers.

**Geometry**

```
θ  = (i × 30° + φ)                 i = 0…11, φ = rotation
x  = RX · sin θ        RX = 228
y  = −RY · cos θ       RY = 118
rx = R · (0.12 + 0.88 · cos² θ)    R = 50   (width narrows as the disc turns)
ry = R                              (height is constant)
viewBox = −240 −175 480 350
```

At rest (φ = 0, or any multiple of 30°) the ring matches the reference: a circle at the top and bottom, ellipses narrowing toward the sides, slivers at the far left and right.

**Usage**
- **Nav:** 22px tall (≈30px wide), `currentColor`, with 12px horizontal padding. No wordmark beside it.
- **Favicon:** `logo.svg`, white discs on `#9BB5CE` in a 120px-radius rounded square.
- **Interaction tile:** white ring, `drop-shadow(0 0 10px rgba(255,255,255,.35))` on the purple tile only.
- Keep clear space of at least one disc diameter. Never recolour discs individually, outline them or add a ™ mark unless asked.

**The loader** is the same ring at 240px (34vw max), centred on the page background (`--bg-page`: white in light mode, black in dark) in `currentColor`. The theme is applied before first paint so there is no flash.

| Phase | Behaviour |
|---|---|
| 1. Intro | Discs pop in one after another: 600ms each, 50ms stagger, `ease-back` |
| 2. Spin | Rotates, ramping to 200°/s. Holds for at least 1.5s and until the window `load` event and fonts are ready (6s safety limit) |
| 3. Settle | Eases out (quadratic) to the next resting pose at least 70° ahead, in `2Δ / v` seconds (about 0.7–1s), so the ring decelerates smoothly into its logo pose |
| 4. Hold | 140ms |
| 5. Fly | The ring translates and scales into the nav logo's exact position over 750ms (`ease-expressive`) while its colour matches the nav and the background fades (.6s, .1s delay). The loader is then removed |

Rules: plays on a **first visit and on reload only**, never on navigation between pages of the site (decided from the navigation type and a same-origin referrer). Page scroll is locked while it plays. With reduced motion it shows the resting ring for 700ms, then fades.

### 8.4 Pixel artifacts (California motifs)

A set of cross-stitch style illustrations decorates the hero. They are the warm, human counterpart to the monochrome UI, and are drawn from **San Francisco and California**.

- **Subjects:** California poppy (state flower), Golden Gate Bridge, cable car, Painted Ladies, grizzly (state flag), Dungeness crab, sourdough, redwood and a Pier 39 sea lion. New artifacts should come from the same place: local, specific and a little humble.
- **Pixels:** square cells that touch (no gutter), authored as text grids. Unlike UI pixel icons (§8.1), artifacts use colour and may have flat, solid fills.
- **Palette** (fixed in both themes; dark mode lifts brightness 1.28×): orange `#E8551F`, pink `#D96A8C`, olive `#6F8F3A` / `#4E6B2A`, brown `#8A4B3C` / `#5A2E26`, tan `#E8B79B`, bridge red `#C0362C`, cream `#F6EFE0`, sky `#8DB3CC`, ink `#3B3733`, gold `#F2C14E`.
- **Print texture (light mode):** every cell has a `#F5E26B` copy offset 1 unit right and 1 up beneath it, a mis-registered-ink edge like a risograph print. Hidden in dark mode.
- **Scale:** each artifact has its own cell size (5–12px at 1440px), so the set feels collected, not tiled. Sizes scale ×0.83 below 1280px, ×0.67 below 1024px and ×0.5 below 768px.
- **Placement:** scattered in the hero's side margins and never over the text column. Large screens show all nine; 1280–1399px hides the redwood and sea lion; 1024–1279px also hides the cable car and grizzly; below 1024px only four small ones (poppies, bridge, crab, sourdough) remain in the bands above and below the text.
- **Motion:** idle 3px bob in steps, staggered per item. Hover makes the artifact hop 12px in four steps and reveals its name in mono caps below. A gentle pointer parallax (6–16px, per-item depth) runs on desktop. All of it stops under reduced motion.
- Artifacts are decorative: `aria-hidden`, and never carry meaning that isn't in the text.

### 8.5 Pixel illustrations (in tiles)

Small pixel drawings used **inside** a Capabilities tile as part of its subject: the pointer cursor in the Prototyping tile and the bouquet on the "open to work" tile. They sit on top of soft gradient art and are the one sharp, pixel-true element in an otherwise blurred scene.

- Square cells. Fine pieces (the 10 × 14 cursor, drawn at 2 units per cell) use **no gutter** so they stay solid; larger pieces (the bouquet, 8 units per cell) use a 1-unit gutter. Always `crispEdges`, no background plate.
- Palette (fixed): cursor ink `#1D1D1B` and white `#FFFFFF`; bouquet pink `#EE7C9C`, orange `#F29A4B`, yellow `#F6D45A`, leaf `#4E9E6B`, blue `#6FB3E8`, pot `#2F6F9A`.
- **Contextual:** the illustration must say something about the capability. Prototyping shows a cursor clicking through a flow of screens, not a generic device. A decorative stand-in that only fills space is not allowed.
- They may move: the cursor travels between screens on a 6s loop and pauses on each; the bouquet sways ±3° on hover.

### 8.6 Game sprites

| Sprite | Grid | Colour | Notes |
|---|---|---|---|
| **Mascot** | 12 × 8 | Body `#D97757`, eyes `#141413` | Two tall eyes, arm stubs at the sides, four legs. Legs swap between two frames at 12 fps while running; eyes close (body colour) for 140ms every 3.2s when idle. On game over it turns `#9A8A82` |
| **Bug (obstacle)** | 7 × 6 | `currentColor` (black in light, white in dark) | Stands on the bars. Hitbox is inset 1 cell on each side |

Sprites are drawn with `fillRect` on a canvas at integer positions, with `image-rendering: pixelated` and no anti-aliasing. A cell is `u` px (4 above 900px wide, otherwise 3).

### 8.7 Icon do and don't

| Do | Don't |
|---|---|
| Use square cells, aligned to the pixel grid | Use round dots, rounded rects or anti-aliased edges inside an icon |
| Draw only lit cells on a transparent ground | Add a ghost grid, grey tile, plate or card behind an icon |
| Use `currentColor` for monochrome icons so they follow the theme | Hard-code black or white in a monochrome icon |
| Keep coloured artwork in its fixed palette in both themes | Tint artifacts with theme colours |
| Move pixel art in steps | Smooth-rotate or scale-blur pixel art |
| Give decorative icons `aria-hidden="true"` and icon-only buttons an `aria-label` | Rely on an icon alone to carry meaning |

---

## 9. Components

### 9.1 Floating header (nav pill)

```
┌──────────────────────── 576px ────────────────────────┐
│ [⠿]              NOTHING (R)                    [🛍] │  48px tall
└───────────────────────────────────────────────────────┘
        ┌─────── EXPLORE OFFERS  LEARN MORE ───────┐      announcement bar
```
- `position: fixed; top: 0;` with a wrapper of 8px padding and a total height of 80px.
- Pill: `max-w-xl`, `min-h-12`, `rounded-lg`, `frost-white-intense` (light) / `frost-grey-intense` (dark).
- Internal grid: `grid-cols-[80px, auto, 80px]`. Menu button left, centred wordmark, cart right.
- Hit targets: 48 × 48 (`size-12 p-4`).
- Wordmark: Ndot `logo` style, 20px.
- Announcement bar: a separate frost pill below, `mono-xs/sm` uppercase, `px-4 py-2`, with the link underlined.
- Expanding the menu grows the same pill downward (no separate overlay).

### 9.2 Buttons

All buttons share: `inline-flex items-center gap-2 rounded (4px) px-4 py-3 h-10`, a **Geist Mono 12px uppercase** label, `white-space: nowrap`, and a trailing 16px chevron.

| Variant | Background | Text | Use |
|---|---|---|---|
| **Primary, on dark media** | `#FFFFFF` | `#040404` | Hero "Discover", campaign CTA |
| **Primary, on light** | `#040404` | `#FFFFFF` | "Learn more" in editorial blocks |
| **Accent** | `#FFC700` | `#040404` | Newsletter "Sign up" (one per page at most) |
| **Ghost / frost** | `frost-white-low` / `frost-grey-low` | inherit | Secondary actions on media |
| **Text link** | none | `greyscale-900` (dark mode: `greyscale-200`) | "Discover ›" under cards: mono-sm, uppercase, **underlined**, gap 10px, `hover:opacity-70` |

States:
- **Hover:** opacity 0.7 for text links, and one frost or tint step for filled buttons (200ms standard).
- **Focus-visible:** `outline: 2px solid var(--accent-yellow)`, inset (`-outline-offset-2`) on icon buttons.
- **Disabled:** 40% opacity, `cursor: not-allowed` (inferred).
- Placement over media: anchor at `bottom-4 right-4` (16px) on desktop, centred below copy on mobile.

### 9.3 Inputs

```css
.input {
  height: 48px; padding: 8px 16px; border-radius: 4px; border: 0;
  font: 400 12px/1.25 var(--font-mono); text-transform: uppercase;
  background: rgb(var(--greyscale-1000) / .6); color: #fff;     /* on dark */
  backdrop-filter: blur(45px);
}
.input::placeholder { color: rgb(var(--greyscale-default)); }
.input:focus { outline: 2px solid rgb(var(--accent-yellow)); }
```
- Checkbox: 18 × 18, 4px radius, same frost fill, with a 12px uppercase mono label. Underline the inline links (`PRIVACY POLICY`, `TERMS`).
- Success state: swap the form for a mono confirmation line ("SIGN UP SUCCESSFUL").

### 9.4 Category tile

- Square image (1:1) on a `frost-grey-low` fill (`#595A5A` at 5%), `rounded-lg`, product cut-out centred.
- Below the tile: an **underlined mono-md uppercase label with a chevron** (`EARBUDS ›`), 8–16px gap, left aligned.
- 4-up row with 8px gutter at desktop.

### 9.5 Product / editorial card

- Image: 1:1 or 4:3, `rounded-lg`, `frost-grey-low` background, studio packshot.
- Title: NType `heading-lg` (24px).
- Description: Geist `body-md` 16px, `greyscale-900`.
- Action: text link `DISCOVER ›`.
- Stack gap: 8px between title and body, 16px before the link.

### 9.5b Case study row (Work)

Case studies are listed **one under another** in an editorial layout: a narrow label column on the left and the content on the right (`1fr 3fr`, `--gutter` between).

```
─────────────────────────────────────────────────────────  hairline (1px, --sec-line)
CASE STUDY ( 01 )   ┌──────────── gradient tile ───────────┐
CLIENT NAME         │        ┌── image, inset ──┐          │
2026                │        │                  │          │
                    │        └──────────────────┘          │
                    └──────────────────────────────────────┘
                    A studio site that sells the craft.        NType 26–40px
                    Branding, strategy and development…        Geist 15px, muted, ≤52ch
                    VIEW CASE STUDY ›                          mono 12px, underlined
```

- **Label column:** mono uppercase 12px. Index in muted, client in `--sec-fg`, year in muted. It is `position: sticky` (top `--space-10`) on desktop so it stays beside long rows. Below 1024px it moves above the tile as one wrapped line.
- **Tile:** 16:9, `radius-lg` (8px), `--space-6` padding (16px on mobile). The background is a soft three-stop gradient (two radial washes over a base colour), tinted per project. The tile is **text only**: it holds the project's headline metric set very large (NType, `clamp(64px, 17cqw, 200px)`, tight tracking) with a one-line mono caption beneath (for example `61%` / `ADD-TO-BAG LIFT`). No screenshots or stock imagery. A row may also carry small outlined mono tags (area or discipline) under the description.
- **Text sits outside the tile**, `--space-5` below it, and the whole row is one link. Hover nudges the chevron 3px.
- **Rhythm:** each row has `--space-6` above and `--space-9` below the hairline-to-hairline block (`--space-8` on mobile). No card border, no fill behind the text.
- **Section head** uses the same two columns: eyebrow and a one-line description on the left, the large title on the right, so the label column lines up through the whole section.

### 9.6 Full-bleed hero

- 16:9 or `100svh` media, black background (`#040404`).
- Centred stack: Ndot eyebrow → NType display-xl headline (white) → primary white button.
- Optional `mix-blend-difference` on text over media for mobile (the site uses `md:mix-blend-normal` to switch it off at md and up).

### 9.7 Campaign split (media + statement)

- Desktop: headline absolutely positioned `left-4 top-1/2 -translate-y-1/2 max-w-[58%]`, left aligned, white on the image. CTA anchored at `bottom-4 right-4`.
- Mobile: headline centred below or over the image, CTA below.

### 9.8 Editorial text block

- Two columns: left is an Ndot label (`NOTHING ( CHARLI XCX )`, 20px), right is a NType heading-xl statement (32px) plus Geist body plus a dark primary button.
- Section padding: `144px` vertical.

### 9.9 Value-prop strip ("Why buy on nothing.tech")

- `frost-200-50` section, 144px vertical padding, centred NType display headline.
- Five columns: icon above an NType `subheading-lg` 18px caption, centred, `max-w-6xl`.

### 9.10 Newsletter

- Inverse panel (`#040404`), inset 8px from the viewport edges with `rounded-lg`.
- Centred: NType display headline (white), Geist body at 80% white, then the email input, consent checkbox and yellow full-width (`max-w-xl`) Sign-up button.

### 9.11 Footer

- `#040404` background, padding `112px 32px 32px`.
- **Primary links:** centred stack in **Ndot 40px uppercase** (ABOUT, NOTHING OS 5.0, COMMUNITY…), 1.0 line height.
- **Utility list:** centred `max-w-xs` panel with `frost-white-low` rows, `rounded-lg`. Each row is a **Lattera Mono 11px uppercase** label with a right-aligned 16px icon (?, envelope, globe, chevron).
- **Bottom bar:** legal links on the left and socials on the right, both in mono-xs uppercase.

### 9.12 Template pages

Three page templates share one skeleton, so a new page only needs content: **Playground** (`playground.html`), **Writing** (`writing.html`) and an individual **case study** (`case-study.html?case=N`).

**Shared skeleton**
- A white `.sheet` panel (same inset, radius and padding as every section, §4.1). The first sheet has `--section-y + --space-5` top padding to clear the fixed nav.
- A two-column head (`1fr 3fr`, §9.5b): the left column holds the mono eyebrow with a live count, `Name ( 09 )`, and a one-line description; the right column holds the large title and, where needed, filter chips.
- Hairline rules (`1px`, `--sec-line`) separate rows. Labels in the left column are mono caps 12px and `position: sticky` (top `--space-10`) on desktop, then wrap into one line above the content below 1024px.
- Gradient tiles (§9.5b) carry imagery, tinted per item. The footer closes every page.

**Filter chips**: mono caps 12px, 8 / 12px padding, 4px radius, a 1px inset outline. Pressed state inverts (`--sec-fg` fill, `--sec-bg` text). Filtering hides items instantly with the `hidden` attribute; the Playground's wide tiles collapse to single-width while a filter is on, so no holes appear.

**Playground**: a 3-column grid of square tiles with the 8px grid gap; some tiles span two columns (`aspect` stays one row tall). Each tile is a soft gradient with film grain, a mono tag (top left) and year (top right), a coloured pixel artifact or the ring as its subject, and the title bottom left in NType 22–28px. Hover: the artifact hops in steps, and the artwork drifts against the pointer by up to 12px. A final "Next experiment" tile shows a small spinning ring. Tiles fade up with a 60ms stagger on first view. 2 columns below 1024px, 1 column below 768px.

**Writing**: rows of `label | content`. The label holds the date and read time. The content holds a mono tag, the title (NType 26–40px, `ch` limit 22), an excerpt (Geist 15px, muted, ≤52ch) and an underlined "Read article ›" link. The first post is a **feature**: a 21:9 gradient tile with a pixel artifact and a larger title (up to 52px). Hover dims the title and nudges the chevron. A newsletter block closes the page, with an email input (48px, outlined, mono caps, yellow focus ring) and a primary button. The form validates locally and confirms in a mono caption line.

**Case study**: the same head, then a full-width metric tile (as in §9.5b), a meta strip of up to five items (Role, Timeline, Scope, Team, Platform; any that apply) between hairlines, and a sequence of rows, each `label | content`. The rows are rendered from the project's `cs.sections` data, so each case study carries its own structure and numbering. Each section can combine a statement, stat cards, paragraphs, a pull quote, outlined cards, trade-off cards (user need / business need / constraint / compromise) and numbered steps. The default template looks like this:

| # | Row | Content |
|---|---|---|
| 01 | Overview | Lead sentence (NType 20–28px) and three stat cards |
| 02 | The problem | One-sentence statement (NType 28–48px) and context |
| 03 | Research | What was done, and three outlined cards (count, method, finding) |
| 04 | Process | Four steps in a 2-up grid, each an image tile, title and line |
| 05 | The solution | Feature blocks: one full-width, then split image/text pairs that alternate sides |
| 06 | Outcome | Two large metrics (up to 88px) and a note on how success was measured |
| 07 | Reflection | Two columns: what worked, what I'd change |

It ends with previous and next case study links in two outlined cards. The page title, client, year, description, hero image and tint are filled from the `PROJECTS` list in `site.js`, using the `case` query parameter, so all four Work cards open the same template with their own content.

Placeholder content is marked as such (for example "Template text. Replace with your own.", and image placeholders labelled with their aspect ratio) and uses the project's tint, so an unfilled template still looks designed.

---

## 10. Imagery and art direction

- **Studio packshots** on a pale grey seamless background, softly lit, with no hard shadows. These go in `frost-grey-low` tiles.
- **Campaign photography:** cinematic, dark, high contrast, shallow depth of field, full-bleed 16:9.
- Product colour (pink, red, teal, yellow) is the only saturated colour on the page.
- Video: autoplay, muted, looped, with a poster frame. Blur the poster until the video loads (the site shows a heavy blur placeholder).
- Image loading: fade in over 400ms with `ease-out`.

---

## 11. Voice and content patterns

- Short, confident and a little playful: "Going pink?", "Pack your sound", "It lasted the whole time."
- Headlines are a single idea, ending with a full stop or question mark.
- CTA vocabulary: **DISCOVER**, **LEARN MORE**, **SIGN UP**, **SHOP**, all in uppercase mono.
- Model names use the bracket convention: `Phone (4a) Pro`, `Ear (3a)`, `Headphone (1)`.

---

## 12. Accessibility

- Focus ring: 2px `--accent-yellow`. It shows only on `:focus-visible`, which keeps it visible on both light and dark backgrounds.
- Minimum hit target is 48 × 48 for icon buttons and 40px tall for text buttons.
- Body and secondary text must stay at `greyscale-900` or darker on light backgrounds.
- Ndot and uppercase mono are display-only. Never set paragraphs in them.
- Give every decorative pixel icon `aria-hidden="true"`. Icon-only buttons need an `aria-label`.
- Respect `prefers-reduced-motion`.

---

## 13. Tailwind configuration (drop-in)

```js
// tailwind.config.js
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;
module.exports = {
  darkMode: 'class',
  theme: {
    screens: { xs: '400px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px', '3xl': '1792px' },
    extend: {
      colors: {
        greyscale: {
          white: c('--greyscale-white'), 100: c('--greyscale-100'), 200: c('--greyscale-200'),
          300: c('--greyscale-300'), 400: c('--greyscale-400'), DEFAULT: c('--greyscale-default'),
          600: c('--greyscale-600'), 700: c('--greyscale-700'), 800: c('--greyscale-800'),
          900: c('--greyscale-900'), 1000: c('--greyscale-1000'),
          'dm-light': c('--greyscale-dm-light'), 'dm-dark': c('--greyscale-dm-dark'), black: c('--greyscale-black'),
        },
        accent: { yellow: c('--accent-yellow'), red: c('--accent-red'), blue: c('--accent-blue') },
      },
      fontFamily: {
        ntype82: ['NType82-Regular', 'sans-serif'],
        ndot: ['Ndot-Regular', 'Doto', 'sans-serif'],
        'ndot-bold': ['Ndot-Bold', 'Doto', 'sans-serif'],
        geist: ['Geist Variable', 'sans-serif'],
        'geist-mono': ['Geist Mono Variable', 'monospace'],
        'lettera-mono-ll': ['LatteraMonoLL', 'monospace'],
      },
      fontSize: {
        'ntype-display-xxl': ['3.75rem', { lineHeight: '1' }],
        'ntype-display-xl':  ['3rem',    { lineHeight: '1' }],
        'ntype-display-lg':  ['2.5rem',  { lineHeight: '1' }],
        'ntype-heading-xl':  ['2rem',    { lineHeight: '1' }],
        'ntype-heading-lg':  ['1.5rem',  { lineHeight: '1.1' }],
        'ntype-heading-md':  ['1.25rem', { lineHeight: '1.2' }],
        'ntype-subheading-lg': ['1.125rem', { lineHeight: '1.4' }],
        'ntype-subheading-md': ['1rem',     { lineHeight: '1.4' }],
        'ntype-subheading-sm': ['.875rem',  { lineHeight: '1.4' }],
        'ndot-display-xxxl': ['3.75rem',  { lineHeight: '1', fontWeight: '55' }],
        'ndot-display-xxl':  ['2.5rem',   { lineHeight: '1', fontWeight: '55' }],
        'ndot-display-xl':   ['1.875rem', { lineHeight: '1', fontWeight: '57' }],
        'ndot-heading-lg':   ['1.25rem',  { lineHeight: '1', fontWeight: '57' }],
        'ndot-heading-md':   ['1.125rem', { lineHeight: '1', fontWeight: '57' }],
        'ndot-heading-sm':   ['1rem',     { lineHeight: '1', fontWeight: '57' }],
        'ndot-heading-xs':   ['.875rem',  { lineHeight: '1', fontWeight: '57' }],
        logo:      ['1.25rem', { lineHeight: '1.35rem', fontWeight: '55' }],
        'body-lg': ['1.25rem', { lineHeight: '1.2' }],
        body:      ['1rem',    { lineHeight: '1.4rem' }],
        'body-md': ['1rem',    { lineHeight: '1.3' }],
        'body-sm': ['.875rem', { lineHeight: '1.4' }],
        'mono-lg': ['1rem',     { lineHeight: '1.25' }],
        'mono-md': ['.875rem',  { lineHeight: '1.25' }],
        'mono-sm': ['.75rem',   { lineHeight: '1.25' }],
        'mono-xs': ['.6875rem', { lineHeight: '1.25' }],
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(.4,0,.2,1)',
        expressive: 'cubic-bezier(.74,0,.19,.99)',
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      const frost = (bg) => ({ backgroundColor: bg, backdropFilter: 'blur(45px)', WebkitBackdropFilter: 'blur(45px)' });
      addUtilities({
        '.frost-white-intense': frost('rgb(var(--greyscale-white) / .8)'),
        '.frost-white-low':     frost('rgb(var(--greyscale-white) / .05)'),
        '.frost-white-08':      frost('rgb(var(--greyscale-white) / .08)'),
        '.frost-grey-intense':  frost('rgb(var(--greyscale-900) / .6)'),
        '.frost-grey-low':      frost('rgb(var(--greyscale-900) / .05)'),
        '.frost-1000-60':       frost('rgb(var(--greyscale-1000) / .6)'),
        '.frost-200-50':        frost('rgb(var(--greyscale-200) / .5)'),
        '.frost-100-60':        frost('rgb(var(--greyscale-100) / .6)'),
        '.frost-100-10':        frost('rgb(var(--greyscale-100) / .1)'),
      });
    },
  ],
};
```

```css
/* tokens.css */
:root {
  --greyscale-white: 255 255 255;  --greyscale-100: 244 244 244;  --greyscale-200: 216 217 217;
  --greyscale-300: 203 204 204;    --greyscale-400: 190 192 192;  --greyscale-default: 177 179 179;
  --greyscale-600: 155 157 157;    --greyscale-700: 133 135 135;  --greyscale-800: 111 112 112;
  --greyscale-900: 89 90 90;       --greyscale-1000: 60 60 60;
  --greyscale-dm-light: 24 24 24;  --greyscale-dm-dark: 4 4 4;    --greyscale-black: 4 4 4;
  --accent-yellow: 255 199 0;      --accent-red: 200 16 46;       --accent-blue: 0 47 108;
  --header-height: 64px; --ui-top: 80px; --ui-bottom: 67px; --aside-width: 400px;
}
@media (min-width: 768px) { :root { --ui-bottom: 80px; } }
body { background: rgb(var(--greyscale-100)); color: rgb(var(--greyscale-black)); font-family: var(--font-ntype); }
```

---

## 14. Do / Don't

| Do | Don't |
|---|---|
| Use uppercase Geist Mono for every label, button and link | Set buttons in sentence case or in NType |
| Separate surfaces with frost tints | Add drop shadows or 1px borders |
| Keep radii at 4px (controls) or 8px (containers) | Use pill buttons or radii of 12px and up |
| Use `#040404` and `#F4F4F4` | Use `#000` and `#FFF` as page colours |
| Use one yellow CTA per view | Use yellow or red as decoration |
| Use Ndot for short uppercase eyebrows and nav | Set sentences or body copy in Ndot |
| Draw pixel icons as square pixels on a transparent ground | Use round dots, a ghost grid or a grey tile behind pixel icons |
| Pair full-bleed media with 8px-gutter grids | Use wide gutters or boxed hero images |
| Use opacity and transform motion at 100–500ms | Use bouncy springs, parallax or long sequences |

## Case-study long-form direction (October 2026)

This section supersedes the Airbnb listing direction and §9.12's case-study template.
Every UX case study uses the **layout and UI of rachelchen.tech/projects/openai**, set in
this system's type: NType substitute for headings (sentence case), Geist for body, and
uppercase Geist Mono for every label and link. Implementation: the `page === "case"`
block in `js/site.js` and the `.study` rules in `css/case-studies.css`.

**Page order:** breadcrumb (`← WORK / PROJECT`) → 16:9 hero → eyebrow, title, lead and
meta row → sections, each preceded by a hairline → previous / next cards.

| Part | Spec |
|---|---|
| Grid | `.study`: contents rail (min 180px) · 922px main track · free column. Inside the track, a **688px reading column**; `.is-wide` items (hero, breadcrumb, interface studies, prototypes) span the full 922px |
| Contents rail | Sticky at `--space-12`. Section titles in mono 12px caps, muted. The current section turns accent with a 6px **square** marker to its left (scroll-spy). A "Book a call ›" link sits below. Hidden below 1024px |
| Hero | The product video, or the project name (NType 32–48px) on a soft gradient of the project's tint. Square corners |
| Title block | Mono eyebrow `Case study ( 01 ) · Org`, NType h1 32–40px, Geist 16px muted lead, then a meta row (`auto-fit, minmax(150px)`): mono caps label over a Geist 15px value |
| Section | Mono caps label (the section title) → NType heading 26–32px (the statement) → Geist 15px/1.55 muted paragraphs, max 64ch. Hairline above, `--space-9` before and `--space-7` after it |
| Three-up | Cards, steps and decision rows render as a borderless 3-column list (2 columns for 2 or 4 items): Geist 15px/500 title over a muted line. Steps carry an accent mono index |
| Decisions | NType 20–22px subheading `Decision 1: …`, then its rows as a three-up |
| Figure panel | `--greyscale-100` ground (dm-light in dark mode), 1px hairline, square corners, mono caps caption in the top left. Data tiles inside are white 4px-radius cards; the accent marks only the data |
| Media | One item full column width, two items side by side, square corners, Geist 13px muted captions |
| Quote | NType 22–26px with a mono caps attribution. No border or fill |
| Button | DESIGN.md §9.2 primary: 40px, 4px radius, mono caps, trailing chevron |

Rules carried over: case accent `#B7471D`, never invent data (placeholders stay
visible and carry an ID that `docs/CODEX-IMAGE-PROMPTS.md` refers to), media in
full colour. Motion follows §7:
ease-out `cubic-bezier(.23, 1, .32, 1)`, 150–250ms, reveals once, reduced motion honoured.

## Playground motion (Material 3), October 2026

INT-08 to INT-12 (onboarding tour, API key and install, day timeline, glass sliders, podcast player)
use Material 3 motion, declared once as `--m3-*` tokens on `.ix` and `.sl` in `css/playground.css`:

| Token | Value | Use |
|---|---|---|
| `--m3-std` | `cubic-bezier(.2, 0, 0, 1)` | Small moves: underline, selection highlight, icon morph, press |
| `--m3-dec` | `cubic-bezier(.05, .7, .1, 1)` | Entrances: previews, tiles, menus |
| `--m3-acc` | `cubic-bezier(.3, 0, .8, .15)` | Exits, shorter than the entrance they pair with |

Durations: 100–200ms for hover, press and icon swaps; 250–400ms for selection, tabs and panels.
Patterns: **shared axis** (12px on Y) for preview and tab swaps, **fade through** for text swaps, a **lift** for
the selected collaborator card, exponential smoothing in `requestAnimationFrame` for slider fills and playheads,
press scale .97. Only opacity, transform, clip-path and colour animate. Loops run only while on screen and are
off under `prefers-reduced-motion`; every control still works. Photos (`assets/images/playground/avatar-1..3.jpg`,
`moss.jpg`, `sunset.jpg`) are optional: initials and CSS gradients stand in until they exist.
INT-13 and INT-15 (compose bar, empty sessions) follow the same tokens and rules.
