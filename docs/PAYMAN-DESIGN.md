# Payman AI — Design System & Brand Principles

> Source of truth for the Payman page in this portfolio (`/payman`, files: `payman.html`, `css/payman.css`, `js/payman.js`).
> It is a **portfolio redesign** of [paymanai.com](https://paymanai.com): the content, logo and artwork come from the live site; the visual language is inspired by [replay.ai](https://www.replay.ai) and re-expressed in Payman's own palette.
> Every value below is taken from the shipped CSS/JS, not estimated. Where something is a design decision rather than a fact from the live site, it is marked **(decision)**.

---

## 1. What this page is

| | |
|---|---|
| **Product** | Payman AI deploys AI agents for banks and credit unions that carry out real banking transactions (payments, transfers, account analysis) under policies, approvals and audit trails the institution controls. |
| **Audience** | Bank and credit-union decision makers (executives, compliance, digital banking leads). Skeptical, risk-averse, evaluating trust before features. |
| **Page job** | Move a cautious buyer from *"AI will take my customers' questions"* to *"I can deploy this safely, and I hold the kill switch."* Primary action: **Meet your agent** (request a demo). |
| **Design thesis** | **A bank-grade document, not a startup landing page.** It should feel like a precise, audited specification: paper, hairlines, serif authority, mono labels, and evidence (numbers, logs, controls) on every screen. |

---

## 2. Brand principles

1. **Trust is the product.** Every section answers a risk question (who is accountable, what can it do, can I stop it). Controls (rules, audit, kill switch) are shown as features, never hidden in fine print.
2. **Show the control, not the magic.** We never sell "AI intelligence". We show the *process*: Requested → Checked → Approved → Logged. Process diagrams and logs beat adjectives.
3. **Documentary, not decorative.** Paper surface, hairline frame, reference IDs, classification labels. The page reads like a controlled document. Decoration (barcode strip, collage) is allowed only as *data-like* texture, never illustration.
4. **Authority through type.** One serif display voice for every headline and number. Large, tight, calm. The serif is the "signed statement"; the mono is the "system record".
5. **Teal is institutional, yellow is a signal.** Deep teal carries trust and depth. Mauve (from the halftone artwork) adds warmth. Yellow appears only as a highlight or status mark, never as a background.
6. **Evidence over claims.** Prefer a sourced number (55%, 199M+), a logged event ("5 payments · $12,480.00") or a table row over a promise. Every stat carries its source in mono.
7. **Quiet, explicit motion.** Motion explains sequence (the four steps, the count-up, the bars filling) and never performs. Opacity and transform only; everything respects reduced motion.
8. **Flat and honest.** Two-dimensional, hairline-separated, no gradients on surfaces except the two deliberate dark "stage" sections. No perspective or 3D (the earlier tilted-sheet hero was removed on purpose).
9. **Bank-held by default.** Copy and layout always put the institution in control: "Your rules", "Bank-held, instant", "Inside your bank".

---

## 3. Voice & content

- **Tone:** plain, factual, short. Declarative sentences. No hype words ("revolutionary", "supercharge"). A compliance officer must be able to quote any line.
- **Headlines:** one idea, sentence case, ending with a full stop. Max ~20 characters of measure in 2-column splits (`h2 { max-width: 20ch }`). Examples: *"We deploy AI agents that handle money."*, *"You set the rules. You see every action."*, *"Built like bank infrastructure. Because it is."*
- **Labels:** mono, uppercase, tracked. Used for tags, reference lines, table keys, step kickers, sources.
- **Numbers:** always paired with a source line (mono, 10px, uppercase): `TD Bank · 2026 AI Insights Report`.
- **Buttons / CTAs:** short imperative in serif: *Meet your agent*, *Request demo*, *See how it works*.
- **Claims we do not invent:** every factual statement (SOC 2 Type II, kill switch, data isolation, custody, FAQ answers, customer quote, stats) comes from paymanai.com. The step wording, tab groupings and hero reference ID are **(decision)** framings of those facts.
- **Reference line (decision):** `PM-2026-001 // VERSION 1.0` and `CLASSIFICATION: AGENTIC BANKING / SOC 2 TYPE II` are decorative document metadata, in the spirit of an audited record.

---

## 4. Color

### 4.1 Tokens (`:root`)

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F3F3F0` | Page background (warm off-white). With a fixed 5% grain overlay. |
| `--paper-2` | `#E9E9E5` | Secondary surface: trays, tab copy panel, skeleton lines, barcode ground |
| `--white` | `#FFFFFF` | Cards, sheets, browser frame, form inputs |
| `--ink` | `#171717` | Body text |
| `--black` | `#0B0B0B` | Headlines, primary button, "How it works" stage, CTA stage, footer |
| `--grey` | `#6F6F6C` | Secondary text |
| `--grey-2` | `#9A9A96` | Tertiary text, frame "+" marks, meta labels |
| `--line` | `rgba(23,23,23,.11)` | Hairlines (section borders, frame, dividers) |
| `--line-2` | `rgba(23,23,23,.20)` | Stronger hairlines (nav ring, cards, tabs, inputs) |
| `--teal` | `#0E3D42` | Brand teal; wordmark; chat bubble |
| `--teal-2` | `#17595E` | Request bar, check ticks, success text |
| `--teal-3` | `#2F8A8C` | Mid teal: tier bars, focus ring |
| `--cyan` | `#66D6CC` | Accent on dark: step kickers, progress line, bar ends |
| `--mauve` | `#D4B3CA` | From the halftone artwork: policy bar, scraps |
| `--yellow` | `#F4FF45` | Signal: approval bar, rare barcode bar, collage strip |

### 4.2 Surface strategy

| Surface | Where | Treatment |
|---|---|---|
| **Paper** | Hero, numbers, shift, demo, security, who, trust, FAQ | `--paper` + grain; hairline separation only |
| **Teal stage** | "You set the rules" | `linear-gradient(180deg,#0A2E33,#0E3D42 60%,#0A3037)` + soft cyan radial (`rgba(102,214,204,.28)` at 70% 100%) |
| **Black stage** | "How it works", closing CTA, footer | `--black` (`#0B0B0B`), faint 32px grid on the right panel |
| **Hatched tray** | Outside/inside comparison, demo video, orbit, trust cards | 135° hatch: `repeating-linear-gradient(135deg, transparent 0 5px, rgba(23,23,23,.045) 5px 6px)` on `--paper-2` |

### 4.3 Barcode / collage palette
`#17595E #2F8A8C #66D6CC #0E3D42 #D4B3CA #B98FAE #9A9A96 #C9C9C4 #F4FF45 #171717`. Weighting (seeded): yellow ≈4%, teals ≈46%, mauves ≈20%, greys ≈30%. Scraps: `#F3D9E8 #DCEDEA #FFF8B8 #E5E1F4`.

### 4.4 Rules
- Text on paper is `--ink` or `--grey` (≥ 4.5:1). `--grey-2` is for non-essential labels only (10px mono).
- On black/teal: headlines `#fff`, body `rgba(255,255,255,.62–.7)`, labels `rgba(255,255,255,.5–.6)`.
- Yellow never carries text on paper and is never a large fill. Pink/mauve never carries text.
- Success/status uses teal (`--teal-2`), not green. There is no red on this page.

---

## 5. Typography

| Voice | Family | Use |
|---|---|---|
| **Display serif** | `Newsreader` (400, 500; optical size 6–72) · fallback Times | All `h1–h3`, big numbers, buttons, tab labels, FAQ questions, footer column titles |
| **Body sans** | `Geist` (400, 500, 600) | Paragraphs, nav links, form fields, card copy |
| **Mono** | `Geist Mono` (400, 500) | Tags, labels, sources, reference lines, table keys/values, code digits, footer links |

Newsreader is a free stand-in for replay.ai's licensed serif; the logo itself uses Payman's own wordmark.

### 5.1 Scale

| Role | Size | Line height | Tracking | Notes |
|---|---|---|---|---|
| Hero `h1` | `clamp(44px, 6.4vw, 80px)` | .98 | −.045em | Serif 400, centered, 2 lines |
| Display numbers | `clamp(72px, 9vw, 128px)` | .9 | −.05em | Serif, tabular-nums, count-up |
| Section `h2` | `clamp(32px, 4vw, 52px)` | 1.04 | −.035em | Serif 400, max 20ch |
| CTA `h2` | `clamp(34px, 4.4vw, 52px)` | 1.04 | −.035em | |
| Card/tray `h3` | 30px | 1.1 | −.03em | Serif |
| Quote | `clamp(22px, 2.4vw, 30px)` | 1.22 | −.02em | Serif |
| Step title | 24px | 1.15 | −.02em | Serif |
| FAQ question | 22px | 1.2 | −.02em | Serif |
| Lead paragraph | 17px | 1.5 | −.01em | Geist, `--grey`, max 46ch |
| Body | 14–16px | 1.5 | 0 | Geist |
| Mono label | 11px (10px small) | 1.4 | +.06em | Uppercase |
| Button | 15px (sm 14, lg 17) | — | −.01em | Serif 500 |

### 5.2 Rules
- Headlines are **sentence case**, never uppercase. Labels are **uppercase mono**, never sentence case.
- Never set paragraphs in mono. Never set labels in serif.
- Letter-spacing on serif display is always negative (tight, confident); mono is always positive (tracked).
- Body measure ≤ 46–62ch.

---

## 6. Layout & the page frame

| Token / rule | Value |
|---|---|
| Frame width | `--frame: 1296px`, centered |
| Frame lines | `1px` `--line` hairlines down both sides (`.page { border-inline }`) |
| Side padding | `--pad: clamp(20px, 4vw, 56px)` |
| Section padding | `clamp(64px, 8vw, 112px)` top/bottom, `--pad` sides |
| Section separation | `border-top: 1px solid var(--line)` |
| Corner marks | `+` (14px mono, `--grey-2`) straddling the frame lines at each section top. Hidden ≤ 1340px (they would overflow). |
| Columns | Two-up splits (`1fr 1fr`); How-it-works `.9fr / 1.1fr`; FAQ `.8fr / 1.2fr`; tabs `1fr / 1.15fr` |
| Grid gaps | 56px between split halves (or `--pad`), 28px flow cards, 16px card pairs, 10px orbit tiles |
| Full-bleed | Only the footer artwork and the marquee-style barcode strip run edge to edge |

### Breakpoints
| Max width | Changes |
|---|---|
| 1340px | Hide frame "+" marks |
| 1023px | Nav links collapse (CTA stays); all 2-col sections → 1 col; flow → 2×2; tabs panel stacked; tiers stacked with top borders; meta cells stacked; footer 2 cols |
| 767px | Numbers stack; flow → 1 col; hero CTAs stack; orbit 2 cols with the logo tile first; tabs list vertical; form single column; footer meta stacked |

---

## 7. Shape, borders & elevation

- **Radius:** `2px` buttons/tags/cards (almost square, document-like); `50%` only for window dots; chat avatars none. No pills, no rounded cards.
- **Separation by hairline, not shadow.** Cards use a `0 0 0 1px var(--line-2)` ring. Shadows exist only as soft grounding on three "object" elements: the browser mock (`0 40px 70px -30px rgba(0,0,0,.7)`), the CTA card (`0 50px 80px -30px rgba(0,0,0,.7)`), and the demo video (`0 30px 60px -30px rgba(0,0,0,.5)`).
- **Notch:** a 14px right-angle triangle in the top-right corner (`linear-gradient(225deg, #0B0B0B 50%, transparent 50%)`) marks "key statement" cards (Customer stays, trust cards). It is the page's only ornament.
- **Hatch** (see 4.2) marks "containers for evidence" (trays, demo screen, orbit).

---

## 8. Motion

| Pattern | Spec |
|---|---|
| **Reveal** | `.rv`: `opacity 0→1`, `translateY(14px)→0`, `.7s cubic-bezier(.2,.7,.2,1)`, once per element via IntersectionObserver (threshold .15) |
| **Count-up** | 55 and 199 over 1500ms, ease-out cubic (`1 − (1−p)³`), once, when ≥ 60% visible |
| **Tier bars** | `opacity .4s` + `scaleX(.2→1)` `.6s`, staggered `70ms × index`, triggered when the section is 20% visible |
| **Steps stage** | Auto-advances every **5200ms** while the section is ≥ 30% visible; a 2px cyan progress line fills (`scaleX`, linear) under the active step; clicking a step jumps and restarts the timer; pauses when the tab is hidden |
| **Chat reveal** | Items appear (`opacity` + `translateY(8px)`, `.4s`) cumulatively as steps progress: 1 request → 2 reply & table → 3 approval code → 4 "Done" |
| **Hover** | Flow sheets `translateY(−4px)` `.3s`; primary button `translateY(−1px)` + lighten to `#2a2a2a`; orbit tiles `translateY(−3px)` |
| **Video** | Autoplay muted loop only while ≥ 40% visible; pauses when scrolled away or tab hidden |
| **Rules** | Only `opacity` and `transform`. No parallax, springs, or looping decoration. |
| **Reduced motion** | All reveals show their end state; counters set directly; step auto-advance off; progress animation off; video shows native controls instead of autoplaying |

---

## 9. Imagery, logo & artwork

| Asset | Path | Notes |
|---|---|---|
| Wordmark | `assets/images/paymanai/payman-logo.svg` | White SVG. Rendered as a **CSS mask** so one file serves any color: teal in nav (124×36), white in the orbit (150×44), 12%-white giant in the footer |
| Footer artwork | `…/footer.png` (2500×1645) | Mauve-on-teal halftone. **Full-bleed**, `aspect-ratio: 2500/1000`, `background-size: cover`, `center 60%`, min 360px / max 760px; top fade `linear-gradient(180deg,#0B0B0B 0, rgba(11,11,11,.55) 38%, rgba(11,11,11,.2) 100%)` |
| Product demo | `…/payman-product-demo.mp4` (6.9MB) + `…-poster.jpg` | `preload="none"`, poster shown until played |
| SOC badge | `…/soc.png` | AICPA SOC 2; 56–80px |
| Partner logos | `csb-logo-white.png`, `visa-…svg`, `coinbase-…svg`, `circle-…svg` | White originals turned dark with `filter: brightness(0)` at 70% opacity on paper. **ICBA** and **Middlesex Federal** are text wordmarks (not extractable) |
| Social icons | `x-twitter-icon.svg`, `linkedin-icon.svg` | 22–24px, 80% opacity |
| Barcode strip | generated | Seed `7`; ~1500px of bars 2–10px wide, opacity .55–1; ground `--paper-2`; 56px tall |
| CTA collage | generated | 46 strips (6–22px thick, 40–210px long) + 4 paper scraps, 230×150, rotated −4…5° |

**Artwork principles:** halftone/dot textures belong to the footer only; the page body uses flat color and hairlines. Generated art is seeded so it is identical on every load. No stock photography, no illustration of people or robots, no 3D renders.

---

## 10. Components

### 10.1 Floating nav
Fixed `top: 8px`, inside an 8px side gutter. Bar: `max-width 1296`, height **52px**, `rgba(255,255,255,.94)` + `backdrop-filter: blur(14px)`, ring `0 0 0 1px var(--line-2)`. Left: wordmark. Right: links (14px, `--grey`, hover `--ink`): *How it works · Security · Who it's for · FAQ* then **Meet your agent** (ink button, 36px). ≤ 1023px only the button remains.

### 10.2 Buttons
Ink only: `#0B0B0B`, white serif label, 2px radius. Sizes: sm 36 / default 40 / lg 48 (padding 16/20/32). One primary button per view. Secondary action is an underlined text link (`--grey`, 14px, 4px underline offset).

### 10.3 Tag
Outlined mono chip above each section heading: 10px, 3×8 padding, 1px `--line-2` border, white 50% fill, `--grey`. Variants on dark: `.tag--light`, `.tag--dark` (white borders/text at 22–30% / 70–80%).

### 10.4 Hero (flat process flow)
- Centered `h1`, one lead sentence, primary button + text link.
- **Flow:** four white **sheets** in a 4-column grid, 28px gap, joined by `→` (16px mono). Each sheet: 10px colored top bar, mono step label (`01 · REQUEST`), one line of copy, skeleton lines (6px `--paper-2`, last 60% wide).
  1. Request — teal `--teal-2` — *"Pay all my vendors for the month."*
  2. Policy check — mauve — *Limits · payee · amount* + `✓ Within policy`
  3. Approval required — yellow — *Enter the code we sent to your phone.* + six code digits `7 4 2 9 0 3` (28×34 mono boxes)
  4. Audit log — black — *5 payments · $12,480.00*
- A hairline row above the flow labels the ends: `CUSTOMER · CHAT` ◂──────▸ `BANK CORE · EXISTING RAILS`.
- Below: three **meta cells** (Process / Ref / Classification; mono 10px) and the **barcode strip**.
- 2D only. (Earlier 3D perspective version was removed by request.)

### 10.5 Numbers
Two cells, vertical hairline between. Serif number (72–128px) + one sentence + mono source. Bold the key claim (*"Not to their banker."*).

### 10.6 Split heading + tray ("The shift")
Left: tag + `h2`. Right: two short paragraphs, second in `--ink`. Below: a hatched **tray** labelled `WHERE THE QUESTIONS GO` holding two columns:
- **Outside your bank / Customer leaves.** Muted card, `✗` rows.
- **Inside your bank / Customer stays.** White card with ring + notch, teal `✓` rows.
Rows are mono 12px uppercase with a hairline above each.

### 10.7 Tiers ("You set the rules")
Teal stage. Three columns separated by 14%-white hairlines: **01 Your rules · 02 Full audit trail · 03 Kill switch**. Each has a 3/6/9-bar stack (18px bars, 6px gap) growing in depth and brightness (grey → teal-3 → teal-3→cyan gradient). Below: a 3-box strip *Your cores and platforms ↔ **Payman governed agent layer** ↔ Anything that moves money* (middle box white).

### 10.8 How it works (black stage)
Left: tag, `h2` *Four steps from question to payment.*, then a 4-item accordion list (`01 · Ask`, `02 · Check`, `03 · Approve`, `04 · Settle`). Inactive: 50% opacity, title only. Active: full opacity, body copy, cyan progress line. Right: a grid-textured panel (32px lines at 4% white) holding the **browser mock** (white, 520px max) — address bar `🔒 yourbank.com`, chat bubbles, vendor table (5 rows + total `$12,480.00`), approval box with six digits, and a **Done. 5 payments sent.** chip. The mock reveals cumulatively with the active step.

### 10.9 Product demo
Tag + `h2`, then the video inside a hatched screen frame (14px padding, ring), 16:9.

### 10.10 Security tabs
Panel (ring, white) split into a **copy** half (`--paper-2`: mono kicker, 38px serif title, 14px body, SOC badge) and a **document** half (teal gradient with 28px line texture; mono key/value rows). A 3-button tab bar sits under it; the **active tab is black with white text**. Tabs: *Data & custody* (Data isolation, Custody) · *Identity & policy* (Authentication, Policy) · *Audit & control* (Audit, Kill switch, Certification). Keyboard: ←/→ move between tabs. Link below: *For your compliance team: AI Banking Safety →*.

### 10.11 Who it's for (orbit)
Left copy; right a hatched 3×3 grid of dashed-outline mono tiles around a teal **logo tile**: Banks · Credit unions · Customers · Members · [Payman] · Staff · Core banking · Digital banking · Voice & text.

### 10.12 Trust
Two notched hatched cards: the **John Wiseman** quote (CEO · Middlesex Federal Savings) and **"Payman is SOC 2 Type II."** with the trust.paymanai.com link. Below, a single row of partner/customer logos (dark, 70% opacity).

### 10.13 FAQ
Native `<details>`/`<summary>` list (first open). Serif 22px question, `+` rotating 45° when open, grey 15px answer. All six answers are verbatim from paymanai.com.

### 10.14 Closing CTA
Black stage with the seeded collage behind a centered paper card (560px): serif `h2`, one line, a 2-up form (First/Last), then Work email, Financial institution, and a full-width ink **Request demo** button. Validates locally; confirms in a mono line ("This is a portfolio recreation, so nothing was sent.").

### 10.15 Footer
Black. Four numbered columns with serif titles and mono links — `01 Product · 02 Company · 03 Resources · 04 Legal` (+ social icons). Meta row: copyright (mono 10px) and the SOC badge. Below it, the **halftone artwork runs the full viewport width** with a giant 12%-white wordmark over it. External links open the live paymanai.com pages (`target=_blank rel=noopener`).

---

## 11. Page structure (order & purpose)

| # | Section | id | Purpose |
|---|---|---|---|
| 1 | Hero | `#top` | State the offer; show the 4-step control process at a glance |
| 2 | Numbers | — | Establish urgency with sourced stats |
| 3 | The shift | — | Frame the choice: outside vs inside the bank |
| 4 | Tiers | — | Show control: rules, audit, kill switch; where Payman sits |
| 5 | How it works | `#how` | Walk through question → payment, step by step |
| 6 | Product demo | — | Show the real product |
| 7 | Security | `#security` | Prove it: isolation, custody, identity, policy, audit, certification |
| 8 | Who it's for | `#who` | Define fit; reassure it integrates, not replaces |
| 9 | Trust | — | Social proof + compliance credential |
| 10 | FAQ | `#faq` | Answer the objections |
| 11 | Closing CTA | `#demo` | Convert |
| 12 | Footer | — | Navigate, certify, sign off |

Narrative arc: **Risk → Control → Process → Proof → Fit → Reassurance → Action.**

---

## 12. Interaction summary (`js/payman.js`)

| Feature | Behavior |
|---|---|
| Reveal | `.rv` elements fade/slide in once |
| Barcode & collage | Generated with a seeded PRNG (seed 7) so art is stable |
| Count-up | `[data-count]` animates once |
| Steps stage | 4 steps, 5.2s auto-advance, click to jump, pause offscreen/hidden/reduced-motion |
| Tabs | 3 tabs, ARIA `tablist/tab/tabpanel`, arrow-key navigation, content rendered from a data array |
| Video | Plays only while visible; native controls under reduced motion |
| Form | Local validation (all fields, valid email); no network |

---

## 13. Accessibility

- Skip link (`Skip to content`) first in the tab order.
- Landmarks: `header`, `main`, `section[aria-labelledby]`, `footer`; one `h1`; `h2` per section.
- Focus ring: 2px `--teal-3` (outline-offset 3px), 44px+ tap height on form fields and buttons ≥ 36px in nav.
- Decorative elements (`stage`, barcode, collage, giant wordmark, footer art) are `aria-hidden`.
- The logo mask carries `role="img"` with `aria-label="Payman"`.
- Tabs implement the WAI-ARIA tabs pattern; steps use `aria-expanded`; the chat mock is `aria-live="polite"`.
- Icon-only links (X, LinkedIn) have `aria-label`s; the video has an `aria-label` and a poster.
- Contrast: body on paper ≥ 4.5:1; labels at `--grey-2` are 10px non-essential metadata only.
- `prefers-reduced-motion` honored everywhere (see 8).

---

## 14. Playground tile (portfolio listing)

The Payman project appears in `/playground` as **PROTO-05 · Payman AI** (`Landing page · 2026`, `Fintech · Agentic banking`), filter group **Landing pages**, linking to `/payman`.

- **Thumbnail:** a live capture of this page's hero inside a mini browser frame (`assets/images/playground/payman-thumb.jpg`), not a logo or abstract art — the tile previews the real page.
- **Tint:** Payman teal gradient `["#3C9A98", "#C6E6DF", "#86C6C0"]` (brand-contextual, replacing the rotating default tints).
- **Frame:** inset 20px each side, top 56px, height 47% of the tile, 8px top radius, 1px ring, 18px bar with 3 dots and a `paymanai.com` pill; image `object-fit: cover; object-position: top`. Bleeds into the tile's lower text zone. Hover lifts it 6px.
- **Text:** the one-line description is hidden on this tile; title and category remain.
- Re-capture the thumbnail whenever the hero changes.

---

## 15. Files

```
payman.html               structure + content
css/payman.css            all styles (tokens in :root)
js/payman.js              interactions
docs/PAYMAN-DESIGN.md     this document
assets/images/paymanai/   logo, footer art, demo video + poster, badges, partner logos, icons
assets/images/playground/payman-thumb.jpg   Playground thumbnail
```
Fonts load from Google Fonts: `Geist` (400/500/600), `Geist Mono` (400/500), `Newsreader` (opsz 6–72, 400/500).

---

## 16. Do / Don't

| Do | Don't |
|---|---|
| Lead with the control (rules, audit, kill switch) | Lead with "AI magic" or capability claims |
| Pair every number with its source | Show a statistic without attribution |
| Use serif for statements, mono for records | Mix the voices (serif labels, mono paragraphs) |
| Separate with hairlines and the page frame | Add drop shadows, rounded cards, or gradients on paper |
| Keep yellow as a tiny signal (bar, digit, strip) | Use yellow/mauve as a background or text color |
| Keep the hero flat and legible (2D) | Reintroduce perspective/3D or floating device mockups |
| Use the halftone art only in the footer, full-bleed | Scatter halftone or stock imagery through the body |
| Show the institution in control ("Your rules", "Bank-held") | Imply the vendor holds funds, keys, or the kill switch |
| Respect reduced motion and keyboard use | Hide meaning in hover-only or animation-only states |
| Use `opacity` and `transform` only | Animate layout properties or add looping decoration |

---

## 17. Provenance & honesty

- **Content, logo, artwork, video, FAQ, quote and statistics** are from paymanai.com. They are reproduced here for a portfolio case study of a redesign; no claim of affiliation is made.
- **Visual language** is inspired by replay.ai (paper surface, framed nav, serif display, mono document labels, hatched trays, stepped bars, black "how it works" stage, tabbed evidence panel, giant footer wordmark) and reinterpreted with Payman's palette; nothing is copied pixel for pixel.
- **Simulated:** the chat, vendor payments and approval code are illustrative (they mirror the live site's own example). The demo form sends nothing.
- **Known gaps:** ICBA and Middlesex Federal logos are text wordmarks; the serif is a free substitute; the newsletter popup and cookie banner from the live site are intentionally omitted.
