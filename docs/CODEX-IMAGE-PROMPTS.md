# Image placeholders: prompts for Codex

The case-study pages show a striped **placeholder** wherever an image is still
missing. Each one is labelled with an ID, for example `C6-02-1`. This file holds
one prompt per ID. Paste the **setup prompt** first, then the prompt for the image.

## How the IDs work

| ID | Meaning | Where it lives in `js/site.js` |
|---|---|---|
| `C6-02-1` | Case 6, section 02, first media item | `PROJECTS[5].cs.sections[1].media[0]` |
| `C2-V-1` | Case 2, hero video | The project's `thumb` (next to `metric`) |

- A placeholder is a string (`"Old sizing flow screenshot"`) or `{ ph: "…", ratio: "4:5" }`
  in a section's `media` array. To fill it, replace it with
  `{ src: "/assets/images/<folder>/<id>.webp", alt: "…", cap: "…" }`.
- **Hero videos** (`V` IDs): the top of each case shows only the product video.
  Cases 2, 3 and 5 have none yet. To fill one, add
  `thumb: { video: "/assets/images/<folder>/<id>.mp4", poster: "/assets/images/<folder>/<id>-poster.jpg", alt: "…" }`
  to the project, the same shape as the Trailhead, Arcade and CotonAI Agent entries.
- Folders: `trailhead`, `cotonai` (Modes and Agent), `aistudio`, `arcade`, `gap`.

## Two kinds of image

1. **Real product images** (screenshots, frames, photos). Codex must not invent
   these. Put your exports in `assets/inbox/<ID>.<ext>`. Codex crops, converts
   and wires them in. For CotonAI Agent, Codex can pull frames from the demo video.
2. **Diagrams** (journeys, tool sprawl, annotated flows). Codex draws them as
   HTML/SVG in the DESIGN.md style and renders them to WebP with headless Chrome.
   Diagrams may only use numbers that already appear in the case study.

---

## Setup prompt (paste once per session)

```
You are working in the Samfolio 1.1 repo, a static portfolio site.
Read docs/DESIGN.md first, especially "Case-study listing direction".

Case-study pages render from the PROJECTS array in js/site.js. Missing images
are placeholders in a section's `media` array: either a string or
{ ph: "...", ratio: "W:H" }. Each has an ID like C6-02-1:
case 6, section 02, media item 1 (both 1-based).

To fill one:
1. Produce the image at the placeholder's ratio, 1600px wide (1200px for
   1:1 and 4:5), as WebP, quality 82, under 300 KB.
2. Save it as assets/images/<folder>/<id-in-lowercase>.webp. Folders:
   trailhead, cotonai, aistudio, arcade, gap.
3. In js/site.js, replace that placeholder with
   { src: "/assets/images/<folder>/<id>.webp", alt: "<what it shows>", cap: "<short caption>" }.
   Keep the caption close to the placeholder's text. Do not touch other entries.
4. Run `node --check js/site.js`.

Rules:
- Real product images come only from assets/inbox/ or from the demo videos
  in assets/images/. Never generate or fake a product screenshot. If the source
  file is missing, stop and say which file you need.
- Diagrams: build them as a standalone HTML file in a scratch folder (not in the
  repo), using the DESIGN.md palette (#040404, #F4F4F4, greys, accent #B7471D),
  Geist / Geist Mono / Instrument Sans from Google Fonts, uppercase mono labels,
  12px radii, no gradients, no shadows. Render with headless Chrome at 2x and
  convert to WebP. Use only numbers that already appear in that case study, and
  add "Illustrative" in the corner when the shape is not measured data.
- Media on cases 2–5 is shown in greyscale on the page, so make sure the
  image still reads without colour.
```

---

## Per-image prompts

### Case 1 · Trailhead Solve (`trailhead`)

**C1-02-1 · 16:10 · Diagram** (Problem)
```
Fill C1-02-1. Draw a diagram: a power user's engagement with Trailhead over time,
as a line rising through learning, then dropping after each certification
milestone (three milestones marked with small pixel trophies). Annotate the
drop with "64% disengaged after major milestones", the figure from the
Findings section. Label the axes TIME and ENGAGEMENT in mono caps. Mark it
"Illustrative": the curve shape is not measured. Accent the drop segments in #B7471D.
```

**C1-05-1 · 16:10 · Real** (Ideation)
```
Fill C1-05-1 from assets/inbox/C1-05-1-a.png and C1-05-1-b.png: the two
vibe-coded proofs of concept. Place them side by side on a #F4F4F4 ground with
8px gaps and 12px radii, each with a mono caps label underneath (POC 01 and POC 02,
plus its name if the file names say it). Caption: "The two proofs of concept, side by side".
```

### Case 2 · CotonAI Modes (`cotonai`)

**C2-01-1 · 16:10 · Real** (Problem)
```
Fill C2-01-1 from assets/inbox/C2-01-1.png: the prompt-heavy MVP canvas.
Crop to the canvas and prompt box; blur any client names or faces.
Caption: "The MVP: a blank canvas and a prompt box".
```

**C2-02-1 · 16:10 · Real** (Research)
```
Fill C2-02-1 from assets/inbox/C2-02-1-wireframe.png and C2-02-1-mvp.png.
Compose them side by side with mono caps labels WIREFRAME and SHIPPED MVP and an
arrow between. Caption: "Wireframe vs the MVP we shipped in 3 weeks".
```

**C2-02-2 · 16:10 · Real** (Research)
```
Fill C2-02-2 from assets/inbox/C2-02-2.jpg: a photo or scan of the user shadowing
notes. Straighten and crop it, lift the contrast, and blur any personal names.
Caption: "Shadowing notes: hesitation before typing, vague prompts reused".
```

**C2-03-1 · 16:10 · Real** (Solution)
```
Fill C2-03-1 from assets/inbox/C2-03-1-v1.png and C2-03-1-v2.png: the Modes toolbar
in V1 and V2. Stack them vertically, each cropped tight to the toolbar, labelled
V1 and V2 in mono caps, with "+125% adoption" next to V2 (that figure is in the case).
Caption: "Modes toolbar, V1 → V2".
```

**C2-03-2 · 16:10 · Real** (Solution)
```
Fill C2-03-2 from assets/inbox/C2-03-2.png: the redesigned colourway picker
(visual picker alongside hex input). Crop to the picker panel.
Caption: "Colourway: a visual picker alongside hex input".
```

**C2-03-3 · 16:10 · Real** (Solution)
```
Fill C2-03-3 from assets/inbox/C2-03-3-1.png, -2.png and -3.png: the three steps
of the Figure submode. Lay them out as a numbered strip (01, 02, 03) with a mono caps
note "8 CLICKS → 3 CLICKS" (from the case). Caption: "Figure submode: a try-on in 3 clicks".
```

### Case 3 · AI Studio (`aistudio`, password protected)

**C3-01-1 · 16:10 · Real** (Problem) and **C3-02-1 · 16:10 · Real** (Impact)
```
Fill C3-01-1 from assets/inbox/C3-01-1.png (product hero or workflow) and
C3-02-1 from assets/inbox/C3-02-1.png (workflow comparison). Crop each to its
key area. This case is behind a passcode, so blur anything client-identifying.
```

### Case 5 · Gap 3D Fit (`gap`)

**C5-01-1 · 16:10 · Real** (Problem)
```
Fill C5-01-1 from assets/inbox/C5-01-1.png: the old sizing flow. Crop to the size
selector and fit information. Caption: "The old flow: fit shown, risk still felt".
```

**C5-02-1 · 16:10 · Diagram** (Research)
```
Fill C5-02-1. Draw an affinity board of the four research findings in this case
study, as four clusters of sticky-note shapes (square cells, 12px radius, greys
with one #B7471D cluster for "The answer needed a reason"). Use only the four
finding titles and their one-line notes from the Research section. Mono caps
header: SIZING RESEARCH · 4 FINDINGS. Caption: "Trust, not measurements, kept coming up".
```

**C5-03-1 · 16:10 · Real** (Solution)
```
Fill C5-03-1 from assets/inbox/C5-03-1-1.png, -2.png and -3.png: baseline input,
fit calibration and optional tuning screens. Lay them out as a phone-frame strip
with arrows and mono caps step labels (BASELINE, CALIBRATION, TUNING · OPTIONAL).
Caption: "Baseline → calibration → optional tuning".
```

**C5-03-2 · 16:10 · Real** (Solution)
```
Fill C5-03-2 from assets/inbox/C5-03-2.png: the explainable fit screen with
per-zone fit (waist, hip, thigh). Crop to the fit panel.
Caption: "Explainable fit: the reason behind the size, one tap away".
```

### Case 6 · CotonAI Agent (`cotonai`)

**C6-01-1 · 16:10 · Diagram** (Problem)
```
Fill C6-01-1. Draw "before CotonAI": one collection scattered across five tool
windows (Moodboard, Spreadsheet, Image generator, Review thread, Production file),
drawn as simple window frames with mono caps title bars, connected by dotted
lines that loop back on themselves. In the middle, a small note card: "Why was this
colour rejected?" with no answer. Mark it "Illustrative". Caption: "Before:
one collection, five tools, no shared memory".
```

**C6-02-1 · 16:10 · Real, from the demo video** (Direction)
```
Fill C6-02-1 with a frame from assets/images/cotonai/video-cotonai-agent.mp4
(install ffmpeg if needed). Pick a frame where the canvas shows several
generated garments and the toolbar (Edit, Render, Colourway, Studio) is visible.
Crop away the desktop wallpaper so only the app window remains.
Caption: "The shared canvas: sketch, generate, edit, colourway and review".
```

**C6-02-2 · 4:5 · Diagram over a real frame** (Direction)
```
Fill C6-02-2. Take a frame from the same video where an image on the canvas is
selected and the agent panel is open. Crop to 4:5 around the selection and panel.
Overlay three numbered #B7471D callouts in mono caps: 01 SELECTED REGION,
02 ANNOTATION, 03 REFERENCE, each pointing to what feeds the agent.
Caption: "Canvas as context: what the agent reads before it acts".
```

### Hero videos for cases 2, 3 and 5

**C2-V-1 · CotonAI Modes**, **C3-V-1 · AI Studio**, **C5-V-1 · Gap 3D Fit** (16:9, real)
```
Fill C<N>-V-1 from assets/inbox/C<N>-V-1.mov (or .mp4): a screen recording of the
product's main flow. Codex must not generate product footage; if the file is
missing, stop and say so. With ffmpeg: trim to the strongest 20–40 seconds,
crop away the desktop so only the app window remains, scale to 1600px wide,
encode H.264 MP4 with no audio (crf 26, faststart), aim for under 8 MB.
Save as assets/images/<folder>/c<N>-v-1.mp4, export a poster frame as
c<N>-v-1-poster.jpg, and add to the project in js/site.js:
thumb: { video: "/assets/images/<folder>/c<N>-v-1.mp4", poster: "/assets/images/<folder>/c<N>-v-1-poster.jpg", alt: "<what the video shows>" }.
This also gives the homepage card and nav preview the video.
```
