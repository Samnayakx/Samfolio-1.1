# Case-study boards and covers

Static visuals and looping cover videos for the case studies are authored as HTML and rendered with headless Chrome, so they use the site's real fonts and tokens.

| Folder | Produces |
|---|---|
| `payman-boards/` | Payman design system, layout exploration, first-screen analytics (WebP) |
| `payman-cover/` (earlier cut), `payman-grid-cover/` (current), `arcade-cover/`, `gap-cover/`, `cotonai-ds-cover/` | Looping cover videos (1920x1080, 30fps; 8s, Arcade 12s) |
| `gap-boards/` | Gap 3D Fit solution board, composed from real QuickFit screens in `src/` (the three decision images are the original concept SVGs, rendered to WebP) |

## Boards (PNG, then WebP)

```sh
node tools/case-boards/boards.mjs tools/case-boards/gap-boards /tmp/gap-boards 2
python3 -c "from PIL import Image; Image.open('/tmp/gap-boards/b-flow.png').convert('RGB').save('assets/images/gap/solution-flow.webp', quality=88, method=6)"
```

## Covers (frames, then MP4)

The Arcade cover is 12s: `node tools/case-boards/video.mjs tools/case-boards/arcade-cover /tmp/arcade-frames 30 12`, poster from frame 0285.

```sh
node tools/case-boards/video.mjs tools/case-boards/gap-cover /tmp/gap-frames 30 8
ffmpeg -y -framerate 30 -i /tmp/gap-frames/%04d.png -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart -an assets/images/gap/video-gap-cover.mp4
ffmpeg -y -i /tmp/gap-frames/0090.png -q:v 3 assets/images/gap/video-gap-cover-poster.jpg
```

Needs Node 22+ (built-in WebSocket) and Google Chrome (override with `CHROME=/path/to/chrome`). `ffmpeg` can come from `pip install imageio-ffmpeg` if it is not installed. Every frame of a cover is a pure function of `t`, so renders are deterministic and loop cleanly.
