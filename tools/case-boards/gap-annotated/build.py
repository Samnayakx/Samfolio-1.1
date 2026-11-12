# Generates index.html (the annotated decision board) from rects.json + src/*.png
import json, math
from PIL import Image
R = json.load(open("rects.json"))
S = 1.9                                          # board px per css px: tight crops, large UI
CROP = {                                          # x, y, w, h in the 960x740 stage, per step
  "a-entry": (520, 282, 420, 286), "b-height": (60, 226, 440, 192), "c-usual": (80, 214, 420, 218),
  "d-meas": (84, 152, 412, 326), "e-result": (40, 62, 226, 276), "f-fit": (676, 68, 250, 316),
}
CELL_W, CELL_H, TOP, NOTE_W = 1230, 650, 170, 310
for n, (cx, cy, cw, ch) in CROP.items():
    im = Image.open(f"src/{n}.png"); k = im.width / 960
    im.crop((round(cx*k), round(cy*k), round((cx+cw)*k), round((cy+ch)*k))).save(f"src/crop-{n}.png")

def edge(name, key, side, fy=.5):
    r = R[name][key]
    x = r["x"] - 6 if side == "l" else r["x"] + r["w"] + 6
    return x, r["y"] + r["h"] * fy

# shot, badge, title, text, note side, target (stage coords)
ITEMS = [
 ("a-entry","01","Entry where doubt peaks","Sits just above Add to Bag, where shoppers hesitate. It is optional, so anyone who knows their size never meets it.","r", edge("a-entry","qf","r")),
 ("b-height","02","Ask one thing first","Height is the only upfront question, and the avatar resizes the moment you pick one. Value shows up before effort does.","l", edge("b-height","chips","l")),
 ("c-usual","03","Start from a size they know","Their usual size, from any brand, calibrates the body without a tape measure. Next stays off until there is an answer.","l", edge("c-usual","grid","l")),
 ("d-meas","04","Keep the numbers visible","Measurements stay in inches beside each control. People who knew a few of theirs trusted numbers over a visual guess.","l", edge("d-meas","meas","l")),
 ("e-result","05","Reasons on request","Why this recommendation is one tap, never forced open. It says when the size is smaller or larger than usual.","l", edge("e-result","why","l")),
 ("f-fit","06","Say what fit feels like","Waist, Hips and Calf each get a plain word, and the ? defines tight, fitted and loose.","r", edge("f-fit","pop","r",.3)),
]

def arrow(s, e, bow):
    (sx, sy), (ex, ey) = s, e
    mx, my = (sx + ex) / 2, (sy + ey) / 2
    dx, dy = ex - sx, ey - sy; L = math.hypot(dx, dy) or 1
    cx, cy = mx - dy / L * bow, my + dx / L * bow
    tx, ty = ex - cx, ey - cy; tl = math.hypot(tx, ty) or 1; tx, ty = tx / tl, ty / tl
    def rot(a): return (tx * math.cos(a) - ty * math.sin(a), tx * math.sin(a) + ty * math.cos(a))
    a1, a2 = rot(math.radians(150)), rot(math.radians(-150)); h = 15
    return (f'<path d="M{sx:.1f} {sy:.1f} Q{cx:.1f} {cy:.1f} {ex:.1f} {ey:.1f}"/>'
            f'<path d="M{ex + a1[0]*h:.1f} {ey + a1[1]*h:.1f} L{ex:.1f} {ey:.1f} L{ex + a2[0]*h:.1f} {ey + a2[1]*h:.1f}"/>')

cells = []
for i, (shot, num, title, text, side, (tx, ty)) in enumerate(ITEMS):
    col, row = i % 2, i // 2
    cx, cy, cw, ch = CROP[shot]; iw, ih = round(cw * S), round(ch * S)
    img_x = 70 if side == "r" else 70 + NOTE_W + 50
    img_y = 30
    note_x = img_x + iw + 50 if side == "r" else 70
    ex = img_x + (tx - cx) * S + (-8 if side == "l" else 8)
    ey = img_y + (ty - cy) * S
    est = 40 + math.ceil(len(title) / 13) * 46 + math.ceil(len(text) / 21) * 38
    ny = max(img_y - 20, min(img_y + ih - est + 20, ey - 50))
    sx = note_x - 8 if side == "r" else note_x + NOTE_W - 4
    sy = max(ny + 30, min(ey, ny + est - 50))
    bow = 18 if (ey > sy) else -18
    if side == "r": bow = -bow
    cells.append(f'''
  <div class="cell" style="left:{60 + col*CELL_W}px; top:{TOP + row*CELL_H}px">
    <div class="num" style="top:{img_y}px">{num}</div>
    <img class="shot" src="src/crop-{shot}.png" style="left:{img_x}px; top:{img_y}px; width:{iw}px; height:{ih}px" alt="" />
    <p class="note" style="left:{note_x}px; top:{ny:.0f}px; width:{NOTE_W}px"><b>{title}</b>{text}</p>
    <svg class="arrow" width="{CELL_W}" height="{CELL_H}" viewBox="0 0 {CELL_W} {CELL_H}">{arrow((sx, sy), (ex, ey), bow)}</svg>
  </div>''')

BW = 60*2 + CELL_W*2 + 60; BH = TOP + CELL_H*3 + 10
html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>Gap 3D Fit: annotated design decisions</title>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Outfit:wght@500;600&display=block" rel="stylesheet" />
<style>
* {{ box-sizing: border-box; }} body {{ margin: 0; background: #fff; }}
.board {{ position: relative; width: {BW}px; height: {BH}px; overflow: hidden; background-color: #FAF8F2;
  background-image: linear-gradient(#E4E8EF 2px, transparent 2px), linear-gradient(90deg, #E4E8EF 2px, transparent 2px); background-size: 40px 40px; background-position: 14px 18px; }}
.tag {{ position: absolute; left: 60px; top: 50px; display: flex; align-items: center; gap: 18px; padding: 0 26px; height: 72px; border-radius: 16px; background: #fff;
  font: 600 29px/1 "Outfit", system-ui, sans-serif; letter-spacing: .01em; text-transform: uppercase; color: #12233a; box-shadow: 0 6px 24px -10px rgba(0,43,92,.25); }}
.tag svg {{ width: 34px; height: 34px; }}
.cell {{ position: absolute; width: {CELL_W}px; height: {CELL_H}px; }}
.num {{ position: absolute; left: 0; display: grid; place-items: center; width: 60px; height: 60px; border-radius: 16px; background: #fff;
  font: 600 28px/1 "Outfit", sans-serif; color: #12233a; box-shadow: 0 6px 20px -10px rgba(0,43,92,.25); z-index: 2; }}
.shot {{ position: absolute; display: block; border-radius: 12px; background: #fff; box-shadow: 0 0 0 1px rgba(0,43,92,.06), 0 16px 40px -18px rgba(0,43,92,.35); }}
.note {{ position: absolute; margin: 0; font: 500 35px/1.1 "Caveat", cursive; color: #2F3E52; }}
.note b {{ display: block; margin-bottom: 6px; font-weight: 600; font-size: 44px; line-height: 1.0; color: #12233a; }}
.arrow {{ position: absolute; left: 0; top: 0; overflow: visible; fill: none; stroke: #12233a; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; z-index: 3; }}
</style></head><body>
<div class="board" id="b-annotated">
  <div class="tag">Final design decisions
    <svg viewBox="0 0 32 32" fill="none" stroke="#002B5C" stroke-width="3.4" stroke-linecap="round"><path d="M16 3v26M4.8 9.5l22.4 13M27.2 9.5L4.8 22.5"/></svg>
  </div>{"".join(cells)}
</div>
</body></html>'''
open("index.html", "w").write(html)
print("ok", BW, BH)
