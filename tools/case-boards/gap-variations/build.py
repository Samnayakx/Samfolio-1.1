# Builds index.html: three alternative QuickFit UIs plus the selected one, all around the same real 3D viewer.
# The metric numbers for A, B, C and the selected design's completion, time and confidence are ILLUSTRATIVE (labelled on the board).
# The +61% add-to-bag figure is the real A/B result already published in the case study.
import math
S = 1.7; FW, FH = round(904 * S), round(562 * S)
FTOP, PANEL_H = 84, 540
CHK_H = 330
ROW_H, TOP = FTOP + FH + 44 + CHK_H + PANEL_H + 90, 200
FX = 380                         # frame x within a row
PANEL_X = FX

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

def fld(x, y, w, label, ph, unit=""):
    return (f'<div class="f" style="left:{x}px;top:{y}px;width:{w}px"><label>{label}</label><div class="in"><span>{ph}</span><i>{unit}</i></div></div>')

VIEWER = '<img class="vw" src="src/viewer.png" alt="" style="left:{x}px;top:{y}px" />'
TITLE = '<div class="mt">QUICKFIT FINDER</div><div class="mx">&#x2715;</div>'

def mock_a():
    f = ""
    f += '<div class="h">Tell us about you</div>'
    rows = [("Height", "5′3″", "", "Weight", "lbs", "lbs"), ("Age", "Years", "", "Usual size", "Select", ""),
            ("Waist", "inches", "in", "Hips", "inches", "in"), ("Inseam", "inches", "in", "Thigh", "inches", "in"), ("Calf", "inches", "in", None, None, None)]
    for r, (l1, p1, u1, l2, p2, u2) in enumerate(rows):
        y = 92 + r * 66
        f += fld(40, y, 194, l1, p1, u1)
        if l2: f += fld(246, y, 194, l2, p2, u2)
    f += '<div class="cta" style="left:40px;top:440px;width:400px">SHOW MY SIZE</div>'
    return TITLE + f + VIEWER.format(x=470, y=52)

def mock_b():
    f = '<div class="h">Enter your measurements</div><p class="sub" style="left:40px;top:80px;width:400px">Use a soft tape measure and keep it snug. Waist at the narrowest point, hips at the widest.</p>'
    for i, l in enumerate(["Waist", "Hips", "Inseam"]):
        y = 138 + i * 76
        f += fld(40, y, 300, l, "0.0", "in") + f'<span class="lk" style="left:352px;top:{y + 31}px">How to measure</span>'
    f += '<p class="sub" style="left:40px;top:372px;width:400px;color:#777">Not sure? Measuring all three takes about five minutes.</p>'
    f += '<div class="cta off" style="left:40px;top:440px;width:400px">FIND MY SIZE</div>'
    return TITLE + f + VIEWER.format(x=470, y=52)

def mock_c():
    f = '<div class="lb" style="left:30px;top:62px">Size</div>'
    sizes = ["00", "0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20"]
    for i, s in enumerate(sizes):
        x, y = 30 + (i % 3) * 66, 88 + (i // 3) * 46
        f += f'<div class="chip{" on" if s == "8" else ""}" style="left:{x}px;top:{y}px">{s}</div>'
    f += '<div class="ban" style="left:30px;top:286px;width:194px"><b>Showing an average body</b><span>Edit it to match yours.</span></div>'
    f += '<div class="btn" style="left:30px;top:392px">Edit Body</div>'
    f += '<div class="lb" style="left:675px;top:62px">On your avatar</div><div class="sz" style="left:675px;top:82px">8 Short</div>'
    for i, (z, v) in enumerate([("Waist", "Fitted"), ("Hips", "Fitted"), ("Calf", "Loose")]):
        y = 130 + i * 44
        f += f'<div class="zr" style="left:675px;top:{y}px;width:199px"><em>{z}</em><b>{v}</b><i>?</i></div>'
    return TITLE + f + VIEWER.format(x=253, y=52)

def mock_d():
    f = '<div class="h">How do you like it to fit?</div>'
    f += '<div class="lb" style="left:40px;top:96px">Fit</div>'
    f += '<div class="trk" style="left:40px;top:150px;width:400px"><i class="th" style="left:50%"></i></div>'
    for i, (t, x) in enumerate([("Tight", 40), ("Fitted", 215), ("Loose", 396)]):
        al = "left" if i == 0 else ("center" if i == 1 else "right")
        f += f'<div class="stop{" on" if i == 1 else ""}" style="left:{x - (0 if i == 0 else (28 if i == 1 else 56))}px;top:178px;">{t}</div>'
    f += '<p class="sub" style="left:40px;top:222px;width:400px">Drag to change how the jeans sit on the avatar. The model updates as you slide.</p>'
    f += '<div class="lb" style="left:40px;top:296px">Size</div>'
    for i, sz in enumerate(["6", "8", "10"]):
        f += f'<div class="chip{" on" if sz == "8" else ""}" style="left:{40 + i * 66}px;top:320px">{sz}</div>'
    f += '<div class="cta" style="left:40px;top:440px;width:400px">ADD TO BAG</div>'
    return TITLE + f + VIEWER.format(x=470, y=52)

MOCKS = {"A": mock_a, "B": mock_b, "C": mock_c, "D": mock_d}

def bar(label, val, shown, final, lo_better=False, mx=1.0, final_shown=""):
    w = val / mx * 100; fx = final / mx * 100
    return (f'<div class="m"><span class="ml">{label}</span><div class="tr"><div class="fl" style="width:{w:.1f}%"></div>'
            f'<div class="tk" style="left:{fx:.1f}%"><u>Selected {final_shown}</u></div></div><b class="mv">{shown}</b></div>')

ROWS = [
 dict(k="A", name="One long form", dec="Ask for everything on one screen, so the size is exact.",
      ro="62 of every 100 people left before they ever saw a size.", why="Ten fields before any value. The avatar sat empty until the end, and nearly two in three people left.",
      call="Ten fields before any value.", target=(40 - 6, 261),
      m=[("Completed", 38, "38%", 71, 100, "71%"), ("Median time", 94, "94 s", 34, 120, "34 s"), ("Size confidence", 3.1, "3.1 / 5", 4.3, 5, "4.3")]),
 dict(k="B", name="Measurements first", dec="Lead with tape-measure numbers for the most accurate fit.",
      ro="Slower than the selected design, and still less trusted.", why="Most people don't know their waist or hips off-hand, so they guessed or stopped. Precise on paper, noisy in practice.",
      call="Numbers most people don't know.", target=(40 - 6, 167),
      m=[("Completed", 46, "46%", 71, 100, "71%"), ("Median time", 71, "71 s", 34, 120, "34 s"), ("Size confidence", 3.4, "3.4 / 5", 4.3, 5, "4.3")]),
 dict(k="C", name="Average body first", dec="Show a default body straight away and let people edit it later.",
      ro="Speed alone did not build trust, and trust is what moves a shopper to Add to Bag.", why="Fastest, with the best completion, but the body was not theirs. The size felt generic, so confidence was the lowest of the four.",
      call="An average body, not theirs.", target=(30 - 6, 326),
      m=[("Completed", 82, "82%", 71, 100, "71%"), ("Median time", 18, "18 s", 34, 120, "34 s"), ("Size confidence", 2.6, "2.6 / 5", 4.3, 5, "4.3")]),
 dict(k="D", name="Tight-to-loose slider", dec="Let people dial the garment from tight to loose on the model and judge the fit by eye.",
      ro="People moved the slider, then still asked which size to buy.", why="Fit comes from the size, not a preference, so the slider promised looks the product can't deliver. It also meant refitting the 3D garment on every drag, and people played with it instead of deciding.",
      call="A control that moves the model, not the answer.", target=(32, 150),
      m=[("Completed", 58, "58%", 71, 100, "71%"), ("Median time", 63, "63 s", 34, 120, "34 s"), ("Size confidence", 3.5, "3.5 / 5", 4.3, 5, "4.3")]),
 dict(k="E", name="Three short steps", sel=True, dec="Height first, then a size they know, with numbers optional.",
      why="Value appears after one tap, the avatar becomes theirs, and every size comes with reasons. Confidence is the highest, and in the A/B test add-to-bag rose 61%.",
      call="Value after one tap. Reasons on request.", target=(20, 156),
      m=[("Completed", 71, "71%", 71, 100, "71%"), ("Median time", 34, "34 s", 34, 120, "34 s"), ("Size confidence", 4.3, "4.3 / 5", 4.3, 5, "4.3")]),
]

CHK = {'A': [('miss', 'Accuracy first, so only 38% finished.'), ('miss', 'No reason offered. Nothing to inspect.'), ('miss', 'Fit left unexplained: a size, then guesswork.')], 'B': [('miss', 'Numbers first. 46% finished and most guessed.'), ('miss', 'A size appears with no reason attached.'), ('miss', 'No words for tight, fitted or loose.')], 'C': [('part', 'Completion first: fast, but not their body.'), ('miss', "A reason can't carry weight on an average body."), ('part', 'Fit shown by 3D alone, with no words to go with it.')], 'D': [('miss', 'Asks for a preference, not their numbers.'), ('miss', 'No reason for the size, only a slider.'), ('miss', 'Refits the 3D garment on every drag.')], 'E': [('ok', 'Numbers stay visible and optional. Complexity comes after value.'), ('ok', 'Why this recommendation: one tap, never forced.'), ('ok', 'Fit words on tap: light on mobile, clear in meaning.')]}
DECS = [("Limit 1 · Inputs", "Accuracy vs completion rate"), ("Limit 2 · Rationale", "Explainability vs purchase velocity"), ("Limit 3 · Fidelity", "Fit fidelity vs mobile performance")]
PILL = {"ok": "✓ Meets", "miss": "✕ Misses", "part": "~ Partly"}
rows = []
for i, r in enumerate(ROWS):
    top = TOP + i * ROW_H
    if r["k"] == "E":
        frame = '<img src="src/final-crop.png" style="width:100%;height:100%;display:block" alt="" />'
    else:
        frame = f'<div class="mk" style="transform:scale({S})">{MOCKS[r["k"]]()}</div>'
    tx, ty = r["target"]
    ex, ey = FX + tx * S - 8, FTOP + ty * S
    cx0, cw = 60, 290
    cy0 = max(FTOP + 40, min(FTOP + FH - 200, ey - 60))
    s0 = (cx0 + cw + 4, cy0 + 46); bow = 20 if ey > s0[1] else -20
    rows.append(f'''
 <section class="row" style="top:{top}px">
  <div class="num">{r["k"]}</div>
  <div class="ttl" style="left:{FX}px">{r["name"]}{'<span class="sel">Selected</span>' if r.get("sel") else '<span class="no">Not selected</span>'}</div>
  <div class="frame" style="left:{FX}px;top:{FTOP}px;width:{FW}px;height:{FH}px">{frame}</div>
  <p class="call" style="left:{cx0}px;top:{cy0:.0f}px;width:{cw}px">{r["call"]}</p>
  <svg class="arrow" width="3000" height="{ROW_H}" viewBox="0 0 3000 {ROW_H}">{arrow(s0, (ex, ey), bow)}</svg>
  <div class="chkl" style="left:{FX}px;top:{FTOP + FH + 40}px">Scored against the three limits</div>
  <div class="chk" style="left:{FX}px;top:{FTOP + FH + 84}px;width:{FW}px">{"".join(f'<div class="dc {st}"><div class="dh"><span class="dn">{dn}</span><span class="pill">{PILL[st]}</span></div><div class="dt">{dt}</div><p>{tx_}</p></div>' for (dn, dt), (st, tx_) in zip(DECS, CHK[r["k"]]))}</div>
  <div class="panel" style="left:{FX}px;top:{FTOP + FH + 44 + CHK_H}px;width:{FW}px">
    <div class="cols">
      <div class="txt"><p class="lab">What I tried</p><p class="hw">{r["dec"]}</p><p class="lab">{'Why it won' if r.get("sel") else 'Why not'}</p><p class="hw">{r["why"]}</p></div>
      <div class="mets">{"".join(bar(l, v, sh, fv, mx=mx, final_shown=fs) for (l, v, sh, fv, mx, fs) in r["m"])}
        {('<div class="ro"><span>Read-out</span>' + r["ro"] + '</div>') if r.get("ro") else ''}
        {'<div class="real"><b>+61%</b><span>add-to-bag in the A/B test (measured)</span></div>' if r.get("sel") else ''}
      </div>
    </div>
  </div>
 </section>''')

BW = FX + FW + 90; BH = TOP + ROW_H * len(ROWS) + 10
html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>Gap 3D Fit: design decisions</title>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Outfit:wght@400;500;600&display=block" rel="stylesheet" />
<style>
* {{ box-sizing: border-box; }} body {{ margin: 0; background: #fff; }}
.board {{ position: relative; width: {BW}px; height: {BH}px; overflow: hidden; background-color: #FAF8F2;
  background-image: linear-gradient(#E4E8EF 2px, transparent 2px), linear-gradient(90deg, #E4E8EF 2px, transparent 2px); background-size: 40px 40px; background-position: 14px 18px; font-family: "Outfit", sans-serif; color: #12233a; }}
.tag {{ position: absolute; left: 70px; top: 60px; display: flex; align-items: center; gap: 20px; padding: 0 34px; height: 88px; border-radius: 18px; background: #fff;
  font: 600 36px/1 "Outfit"; letter-spacing: .01em; text-transform: uppercase; box-shadow: 0 6px 24px -10px rgba(0,43,92,.25); }}
.tag svg {{ width: 42px; height: 42px; }}
.legend {{ position: absolute; left: 760px; top: 86px; display: flex; gap: 40px; align-items: center; font: 500 28px/1 "Outfit"; color: #2F3E52; }}
.legend i {{ display: inline-block; width: 46px; height: 12px; border-radius: 6px; margin-right: 12px; vertical-align: -1px; }}
.legend .d i {{ background: repeating-linear-gradient(90deg, #5D7A9C 0 8px, transparent 8px 13px); }}
.legend .s i {{ background: #12233a; }}
.row {{ position: absolute; left: 0; width: 100%; height: {ROW_H}px; }}
.num {{ position: absolute; left: 70px; top: 0; display: grid; place-items: center; width: 72px; height: 72px; border-radius: 18px; background: #fff; font: 600 34px/1 "Outfit"; box-shadow: 0 6px 20px -10px rgba(0,43,92,.25); }}
.frame {{ position: absolute; top: 0; overflow: hidden; border-radius: 14px; background: #fff; box-shadow: 0 0 0 1px rgba(0,43,92,.06), 0 18px 44px -20px rgba(0,43,92,.38); }}
.call {{ position: absolute; margin: 0; font: 600 46px/1.05 "Caveat", cursive; color: #12233a; }}
.arrow {{ position: absolute; left: 0; top: 0; overflow: visible; fill: none; stroke: #12233a; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; z-index: 3; }}
.chkl {{ position: absolute; font: 600 21px/1 "Outfit"; letter-spacing: .14em; text-transform: uppercase; color: #5B6B7F; }}
.chk {{ position: absolute; display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }}
.dc {{ padding: 22px 26px 24px; border-radius: 14px; background: #fff; border-top: 7px solid var(--c); box-shadow: 0 6px 22px -14px rgba(0,43,92,.35); }}
.dc.ok {{ --c: #1C7C45; --bg: #E4F3EA; }} .dc.miss {{ --c: #B3261E; --bg: #FBE7E5; }} .dc.part {{ --c: #A06A00; --bg: #FFF1D0; }}
.dh {{ display: flex; justify-content: space-between; align-items: center; }}
.dn {{ font: 600 18px/1 "Outfit"; letter-spacing: .12em; text-transform: uppercase; color: #5B6B7F; }}
.pill {{ padding: 8px 13px; border-radius: 999px; background: var(--bg); color: var(--c); font: 600 19px/1 "Outfit"; }}
.dt {{ margin-top: 12px; font: 600 28px/1.15 "Outfit"; letter-spacing: -.005em; color: #12233a; }}
.dc p {{ margin: 10px 0 0; font: 500 38px/1.08 "Caveat", cursive; color: #2F3E52; }}
.panel {{ position: absolute; }}
.ttl {{ position: absolute; top: 0; }}
.ttl {{ display: flex; align-items: center; gap: 22px; height: 72px; font: 600 50px/1 "Outfit"; letter-spacing: -.005em; }}
.sel, .no {{ font: 600 21px/1 "Outfit"; letter-spacing: .1em; text-transform: uppercase; padding: 12px 16px; border-radius: 10px; }}
.sel {{ background: #12233a; color: #fff; }} .no {{ background: #fff; color: #6B7A8E; box-shadow: inset 0 0 0 1.5px #C8D3E2; }}
.cols {{ display: grid; grid-template-columns: 1fr 1fr; gap: 70px; }}
.lab {{ margin: 0 0 8px; font: 600 21px/1 "Outfit"; letter-spacing: .12em; text-transform: uppercase; color: #5B6B7F; }}
.hw {{ margin: 0 0 30px; font: 500 43px/1.1 "Caveat", cursive; color: #2F3E52; }}
.mets {{ display: flex; flex-direction: column; gap: 34px; padding-top: 4px; }}
.m {{ margin-bottom: 14px; display: grid; grid-template-columns: 1fr 130px; grid-template-areas: "l l" "t v"; row-gap: 12px; align-items: center; }}
.ml {{ grid-area: l; font: 500 25px/1 "Outfit"; color: #4a4a62; }}
.tr {{ grid-area: t; position: relative; height: 20px; border-radius: 10px; background: rgba(0,43,92,.09); }}
.fl {{ height: 100%; border-radius: 10px; background: repeating-linear-gradient(90deg, #5D7A9C 0 14px, #8FA8C4 14px 18px); }}
.tk {{ position: absolute; top: -10px; width: 4px; height: 40px; background: #002B5C; border-radius: 2px; }}
.tk u {{ position: absolute; top: 48px; left: 50%; transform: translateX(-50%); white-space: nowrap; text-decoration: none; font: 600 19px/1 "Outfit"; letter-spacing: .06em; text-transform: uppercase; color: #002B5C; }}
.mv {{ grid-area: v; text-align: right; font: 600 44px/1 "Outfit"; letter-spacing: -.01em; }}
.ro {{ margin-top: 8px; padding: 20px 28px 22px 30px; border-radius: 14px; background: #fff; border-left: 6px solid #002B5C; font: 600 44px/1.08 "Caveat", cursive; color: #12233a; box-shadow: 0 6px 20px -12px rgba(0,43,92,.3); }}
.ro span {{ display: block; margin-bottom: 8px; font: 600 19px/1 "Outfit"; letter-spacing: .14em; text-transform: uppercase; color: #002B5C; }}
.real {{ margin-top: 6px; display: flex; align-items: baseline; gap: 16px; padding: 16px 22px; border-radius: 14px; background: #fff; box-shadow: 0 6px 20px -12px rgba(0,43,92,.3); }}
.real b {{ font: 600 70px/1 "Outfit"; color: #1C7C45; letter-spacing: -.02em; }} .real span {{ font: 500 26px/1.2 "Outfit"; color: #2F3E52; }}
/* mock UI, in the prototype's own styling (Gap/Old Navy: navy, pill chips, square buttons) */
.mk {{ position: absolute; left: 0; top: 0; width: 904px; height: 562px; transform-origin: 0 0; background: #fff; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #111; }}
.mk > * {{ position: absolute; }}
.mt {{ left: 0; right: 0; top: 16px; text-align: center; font: 700 13px/1 inherit; letter-spacing: .22em; color: #003664; }}
.mx {{ right: 22px; top: 12px; font-size: 16px; color: #111; }}
.h {{ left: 40px; top: 54px; font: 700 18px/1.2 inherit; color: #003664; }}
.f label {{ display: block; margin-bottom: 5px; font-size: 12px; color: #555; }}
.in {{ display: flex; align-items: center; justify-content: space-between; height: 38px; padding: 0 12px; border: 1px solid #b9b9b9; border-radius: 3px; font-size: 14px; color: #8a8a8a; background: #fff; }}
.in i {{ font-style: normal; font-size: 12px; color: #777; }}
.cta {{ height: 44px; display: grid; place-items: center; background: #002B5C; color: #fff; font: 700 13px/1 inherit; letter-spacing: .18em; }}
.cta.off {{ background: #B3C0D2; }}
.sub {{ margin: 0; font-size: 13px; line-height: 1.45; color: #444; }}
.lk {{ font-size: 13px; color: #003664; text-decoration: underline; }}
.vw {{ width: 398px; height: 473px; display: block; border-radius: 6px; }}
.lb {{ font-size: 13px; color: #555; }}
.chip {{ width: 58px; height: 36px; display: grid; place-items: center; border: 1px solid #c4c4c4; border-radius: 20px; font-size: 14px; background: #fff; }}
.chip.on {{ background: #002B5C; border-color: #002B5C; color: #fff; }}
.btn {{ height: 34px; padding: 0 18px; display: grid; place-items: center; border: 1.5px solid #111; font-size: 14px; background: #fff; }}
.trk {{ height: 8px; border-radius: 4px; background: linear-gradient(90deg, #C8D3E2, #002B5C 50%, #C8D3E2); }}
.th {{ position: absolute; top: -9px; width: 26px; height: 26px; margin-left: -13px; border-radius: 50%; background: #fff; border: 3px solid #002B5C; box-shadow: 0 2px 6px rgba(0,0,0,.25); }}
.stop {{ font-size: 13px; color: #666; }} .stop.on {{ color: #003664; font-weight: 700; }}
.ban {{ padding: 14px 16px; border-radius: 4px; background: #EEF3F9; border: 1px solid #C9D6E6; color: #003664; font-size: 13px; line-height: 1.4; }}
.ban b {{ display: block; font-size: 14px; margin-bottom: 4px; }}
.sz {{ font: 700 26px/1 inherit; color: #003664; }}
.zr {{ display: grid; grid-template-columns: 70px 1fr 22px; align-items: center; height: 40px; border-top: 1px solid #ddd; font-size: 14px; }}
.zr em {{ font-style: normal; color: #666; }} .zr b {{ font-weight: 700; }}
.zr i {{ width: 20px; height: 20px; border: 1.5px solid #003664; border-radius: 50%; display: grid; place-items: center; font-style: normal; font-size: 11px; color: #003664; font-weight: 700; }}
</style></head><body>
<div class="board" id="b-variations">
 <div class="tag">Design decisions
  <svg viewBox="0 0 32 32" fill="none" stroke="#002B5C" stroke-width="3.4" stroke-linecap="round"><path d="M16 3v26M4.8 9.5l22.4 13M27.2 9.5L4.8 22.5"/></svg></div>
 <div class="legend"><span class="s"><i></i>Same 3D viewer in every variation</span><span class="d"><i></i>Dashed bars: illustrative figures, not measured</span></div>{"".join(rows)}
</div>
</body></html>'''
open("index.html", "w").write(html); print("ok", BW, BH)
