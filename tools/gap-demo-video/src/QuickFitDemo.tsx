// Product demo of the Old Navy QuickFit 3D viewer prototype (js/case-demos.js, gapQuickFit).
// Every UI surface is a capture of the real prototype (capture.cjs); every move is a GSAP timeline scrubbed by Remotion.
import React from "react";
import { AbsoluteFill, Img, Sequence, useCurrentFrame } from "remotion";
import { C, Caret, Cursor, Glows, MONO, SANS, Shot, cap, useGsap } from "./lib";

const S = { intro: 72, pdp: 78, steps: 96, three: 96, wall: 42, why: 50, bag: 70, end: 62 };
export const DURATION = Object.values(S).reduce((a, b) => a + b, 0);

const page: React.CSSProperties = { background: "#fff", fontFamily: SANS, color: C.ink, overflow: "hidden" };
const big = (size: number): React.CSSProperties => ({ fontSize: size, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1 });
const blurIn = { opacity: 0, scale: 0.72, filter: "blur(16px)", ease: "expo.out", duration: 1 };
const blurOut = { opacity: 0, scale: 1.12, filter: "blur(14px)", ease: "power2.in", duration: 0.32 };

// A word that rises out of a mask
const W: React.FC<{ children: React.ReactNode; cls: string; style?: React.CSSProperties }> = ({ children, cls, style }) => (
  <span style={{ display: "inline-block", overflow: "hidden", padding: "0.06em 0.04em 0.16em", margin: "-0.06em -0.04em -0.16em", verticalAlign: "bottom" }}>
    <span className={cls} style={{ display: "inline-block", willChange: "transform", ...style }}>{children}</span>
  </span>
);

// The avatar stage: the viewer's own pale grey floor, with the captured turn sequence playing on it
const Avatar: React.FC<{ w: number; h: number; speed?: number; offset?: number; className?: string; style?: React.CSSProperties; radius?: number }> = ({ w, h, speed = 0.75, offset = 0, className, style, radius = 32 }) => {
  const f = useCurrentFrame();
  const i = Math.floor(offset + f * speed) % 72;
  return (
    <div className={className} style={{ position: "absolute", width: w, height: h, borderRadius: radius, overflow: "hidden",
      background: "linear-gradient(180deg, #F7F8FA 0%, #ECEEF2 100%)",
      boxShadow: "0 0 0 1px rgba(0,43,92,.05), 0 30px 70px -18px rgba(0,43,92,.24), 0 70px 140px -40px rgba(60,110,175,.3)", willChange: "transform, opacity, filter", ...style }}>
      <Img src={cap(`turn/t${String(i).padStart(3, "0")}.png`)} style={{ position: "absolute", left: "50%", bottom: 0, height: "100%", transform: "translateX(-50%)" }} />
    </div>
  );
};

// ── 1. Open: real fragments blur in around a typed headline ──
const Intro: React.FC = () => {
  const ref = useGsap((tl) => {
    tl.from(".frag", { ...blurIn, y: 50, stagger: 0.06 }, 0.05)
      .to(".head", { text: "Find your fit", duration: 0.7, ease: "none" }, 0.25)
      .to(".frag", { y: "-=18", duration: 2, ease: "sine.inOut", stagger: 0.05 }, 0.9)
      .to(".frag", { ...blurOut, stagger: 0.02 }, 2.05)
      .to(".hwrap", { ...blurOut, scale: 0.9 }, 2.1);
  });
  return (
    <AbsoluteFill ref={ref} style={page}>
      <Glows spots={[{ x: 360, y: 260, r: 320 }, { x: 1560, y: 780, r: 360 }, { x: 980, y: 600, r: 260, o: 0.5 }]} />
      <Shot className="frag" src="el-qf.png" w={560} style={{ left: 120, top: 150 }} radius={14} />
      <Shot className="frag" src="q-1.png" w={560} style={{ left: 1250, top: 110 }} pad={14} />
      <Avatar className="frag" w={230} h={300} offset={8} style={{ left: 190, top: 610 }} radius={24} />
      <Shot className="frag" src="el-zones.png" w={330} style={{ left: 1440, top: 650 }} pad={18} />
      <Shot className="frag" src="el-sz.png" w={300} style={{ left: 820, top: 850 }} pad={18} />
      <Shot className="frag" src="pdp-1.webp" w={150} style={{ left: 660, top: 70 }} radius={16} />
      <AbsoluteFill className="hwrap" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={big(150)}><span className="head" /><Caret /></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── 2. The Old Navy product page: the camera pushes into QuickFit Finder and the cursor clicks it ──
// Card coordinates: the stage is 922 CSS px wide, drawn here at 1500 px. QuickFit Finder sits at (505–898, 433–480) CSS px.
const K = 1500 / 922, QF = { x: 210 + 701.5 * K, y: 55 + 457 * K, w: 393.5 * K, h: 47 * K };
const PDP: React.FC = () => {
  const ref = useGsap((tl) => {
    const s0 = 0.84, s1 = 2.05;
    tl.set(".cam", { transformOrigin: "0 0", x: 960 - s0 * 960, y: 540 - s0 * 540, scale: s0 })
      .from(".card", { opacity: 0, y: 90, filter: "blur(14px)", duration: 0.8, ease: "expo.out" }, 0)
      .from(".cursor", { x: QF.x + 420, y: QF.y + 360, duration: 0.95, ease: "power3.inOut" }, 0.45)
      .to(".cam", { x: 960 - s1 * QF.x, y: 560 - s1 * QF.y, scale: s1, duration: 1.15, ease: "power3.inOut" }, 0.75)
      .to(".cursor [data-arrow]", { opacity: 0, duration: 0.08 }, 1.38).to(".cursor [data-hand]", { opacity: 1, duration: 0.08 }, 1.38)
      .to(".press", { opacity: 1, duration: 0.12 }, 1.36)
      .to(".cursor", { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: "power2.out" }, 1.95)
      .to(".press", { scale: 0.975, background: "rgba(0,47,95,.10)", duration: 0.09, yoyo: true, repeat: 1 }, 1.95)
      .to(".cam", { scale: s1 * 1.35, x: 960 - s1 * 1.35 * QF.x, y: 560 - s1 * 1.35 * QF.y, filter: "blur(12px)", opacity: 0, duration: 0.35, ease: "power2.in" }, 2.25);
  });
  return (
    <AbsoluteFill ref={ref} style={page}>
      <Glows spots={[{ x: 300, y: 900, r: 380 }, { x: 1600, y: 200, r: 360 }]} />
      <div className="cam" style={{ position: "absolute", inset: 0, willChange: "transform" }}>
        <Shot className="card" src="01-pdp.png" w={1500} style={{ left: 210, top: 55 }} radius={18} />
        <div className="press" style={{ position: "absolute", left: QF.x - QF.w / 2, top: QF.y - QF.h / 2, width: QF.w, height: QF.h, borderRadius: 3,
          boxShadow: "0 0 0 3px rgba(0,47,95,.9), 0 0 40px 6px rgba(93,122,156,.45)", opacity: 0, background: "rgba(0,47,95,0)" }} />
        <div className="cursor" style={{ position: "absolute", left: QF.x + 70, top: QF.y - 4 }}><Cursor /></div>
      </div>
    </AbsoluteFill>
  );
};

// ── 3. Three short steps, each a word, the real question, and a word ──
const BEATS = [
  { l: "Ask", src: "q-1.png", w: 920, r: "one thing", pad: 22 },
  { l: "Start from", src: "q-2.png", w: 730, r: "your size", pad: 20 },
  { l: "Tune", src: "q-3.png", w: 560, r: "if you like", pad: 18 },
];
const Steps: React.FC = () => {
  const ref = useGsap((tl) => {
    BEATS.forEach((_, i) => {
      const t = i * 1.06, b = `.b${i}`;
      tl.from(`${b} .wl`, { yPercent: 115, duration: 0.55, ease: "expo.out" }, t)
        .from(`${b} .card`, { opacity: 0, scale: 0.55, filter: "blur(14px)", duration: 0.7, ease: "expo.out" }, t + 0.06)
        .from(`${b} .wr`, { yPercent: 115, duration: 0.55, ease: "expo.out" }, t + 0.16)
        .from(`${b} .num`, { opacity: 0, y: 12, duration: 0.4, ease: "power2.out" }, t + 0.1);
      if (i < BEATS.length - 1) {
        tl.to(`${b} .wl, ${b} .wr`, { yPercent: -115, duration: 0.28, ease: "power3.in" }, t + 0.82)
          .to(`${b} .card, ${b} .num`, { opacity: 0, scale: 0.9, filter: "blur(10px)", duration: 0.26, ease: "power2.in" }, t + 0.82);
      }
    });
    tl.to(".b2", { ...blurOut }, 2.86);
  });
  return (
    <AbsoluteFill ref={ref} style={page}>
      <Glows spots={[{ x: 960, y: 620, r: 420 }, { x: 260, y: 220, r: 260, o: 0.6 }, { x: 1700, y: 900, r: 280, o: 0.6 }]} />
      {BEATS.map((b, i) => (
        <AbsoluteFill key={i} className={`b${i}`} style={{ alignItems: "center", justifyContent: "center" }}>
          <p className="num" style={{ position: "absolute", top: 130, fontFamily: MONO, fontSize: 30, letterSpacing: ".14em", color: "#5F6672", margin: 0 }}>STEP {i + 1} OF 3</p>
          <div style={{ display: "flex", alignItems: "center", gap: 44, ...big(100) }}>
            <W cls="wl">{b.l}</W>
            <div className="card" style={{ position: "relative", width: b.w, flex: "none" }}><Shot src={b.src} w={b.w} pad={b.pad} style={{ position: "relative" }} /></div>
            <W cls="wr" style={{ color: i === 2 ? C.muted : C.ink }}>{b.r}</W>
          </div>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

// ── 4. The 3D avatar turns while the fit reads out beside it ──
const ZONE_H = 123 / 3; // each fit row in el-zones.png, in CSS px
const Zone: React.FC<{ i: number; w: number }> = ({ i, w }) => {
  const k = w / 203, h = ZONE_H * k;
  return (
    <div className="zone" style={{ position: "absolute", left: 1385, top: 470 + i * (h + 26), width: w + 44, height: h + 20, padding: "10px 22px", borderRadius: 18, background: "#fff",
      boxShadow: "0 0 0 1px rgba(0,43,92,.05), 0 20px 50px -14px rgba(0,43,92,.24)", overflow: "hidden", willChange: "transform, opacity, filter" }}>
      <div style={{ position: "relative", width: w, height: h, overflow: "hidden" }}>
        <Img src={cap("el-zones.png")} style={{ position: "absolute", left: 0, top: -i * h, width: w }} />
      </div>
    </div>
  );
};
const Three: React.FC = () => {
  const ref = useGsap((tl) => {
    tl.from(".stage", { opacity: 0, scale: 0.8, y: 60, filter: "blur(16px)", duration: 1, ease: "expo.out" }, 0)
      .from(".t1, .t2", { yPercent: 115, duration: 0.7, ease: "expo.out", stagger: 0.09 }, 0.15)
      .from(".lbl", { opacity: 0, y: 10, duration: 0.4 }, 0.2)
      .from(".sz", { ...blurIn, x: 40 }, 0.55)
      .from(".zone", { ...blurIn, x: 50, stagger: 0.12 }, 0.75)
      .to(".stage", { y: -10, duration: 2.4, ease: "sine.inOut" }, 0.9)
      .to(".stage, .sz, .zone, .copy", { ...blurOut, stagger: 0.02 }, 2.85);
  });
  return (
    <AbsoluteFill ref={ref} style={page}>
      <Glows spots={[{ x: 1000, y: 560, r: 480 }, { x: 1550, y: 300, r: 260, o: 0.7 }]} />
      <div className="copy" style={{ position: "absolute", left: 130, top: 400 }}>
        <p className="lbl" style={{ fontFamily: MONO, fontSize: 28, letterSpacing: ".14em", color: "#5F6672", margin: "0 0 26px" }}>3D FIT · DRAG TO ROTATE</p>
        <div style={{ ...big(96) }}><W cls="t1">See the size</W></div>
        <div style={{ ...big(96), marginTop: 14 }}><W cls="t2" style={{ color: C.navy }}>on a body.</W></div>
      </div>
      <Avatar className="stage" w={560} h={820} speed={0.78} style={{ left: 760, top: 130 }} radius={36} />
      <div className="sz" style={{ position: "absolute", left: 1385, top: 330, padding: "22px 26px", borderRadius: 20, background: "#fff", boxShadow: "0 0 0 1px rgba(0,43,92,.05), 0 20px 50px -14px rgba(0,43,92,.24)" }}>
        <p style={{ margin: "0 0 8px", fontFamily: MONO, fontSize: 18, letterSpacing: ".12em", color: C.muted }}>ON YOUR AVATAR</p>
        <Img src={cap("el-sz.png")} style={{ display: "block", width: 380 }} />
      </div>
      {[0, 1, 2].map((i) => <Zone key={i} i={i} w={380} />)}
    </AbsoluteFill>
  );
};

// ── 5. A wall of fit words, one bracketed: fit said in plain language ──
const Wall: React.FC = () => {
  const ref = useGsap((tl) => {
    tl.from(".wall", { opacity: 0, duration: 0.25 }, 0)
      .fromTo(".wall", { y: 40 }, { y: -60, duration: 1.4, ease: "none" }, 0)
      .from(".brk", { scale: 1.6, opacity: 0, duration: 0.45, ease: "expo.out", stagger: 0.04 }, 0.05)
      .from(".core", { scale: 0.7, opacity: 0, filter: "blur(10px)", duration: 0.5, ease: "expo.out" }, 0.08)
      .from(".qm", { scale: 0, rotate: -90, duration: 0.45, ease: "back.out(2)" }, 0.35)
      .to(".all", { ...blurOut, scale: 1.25 }, 1.08);
  });
  const words = ["fitted", "loose", "fitted", "tight", "fitted"];
  return (
    <AbsoluteFill ref={ref} style={page}>
      <div className="all" style={{ position: "absolute", inset: 0 }}>
        <div className="wall" style={{ position: "absolute", left: -120, right: -120, top: -80, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", rowGap: 6, ...big(132), color: "#E3E7EE", textAlign: "center" }}>
          {Array.from({ length: 40 }, (_, k) => <span key={k} style={{ transform: `translateX(${(Math.floor(k / 4) % 2) * 120}px)` }}>{words[(k * 3 + Math.floor(k / 4)) % 5]}</span>)}
        </div>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", padding: "34px 62px 40px", background: "#fff", borderRadius: 30, boxShadow: "0 0 0 70px #fff, 0 0 120px 120px #fff" }}>
            {[[0, 0, "0 0"], [1, 0, "100% 0"], [0, 1, "0 100%"], [1, 1, "100% 100%"]].map(([r, b, o], k) => (
              <div key={k} className="brk" style={{ position: "absolute", width: 46, height: 46, [r ? "right" : "left"]: 0, [b ? "bottom" : "top"]: 0, transformOrigin: o as string,
                [`border${b ? "Bottom" : "Top"}`]: `9px solid ${C.navy}`, [`border${r ? "Right" : "Left"}`]: `9px solid ${C.navy}`, borderRadius: 6 } as React.CSSProperties} />
            ))}
            <div className="core" style={{ display: "flex", alignItems: "center", gap: 34, ...big(150) }}>
              Fitted
              <span className="qm" style={{ display: "grid", placeItems: "center", width: 96, height: 96, borderRadius: "50%", border: `6px solid ${C.navy}`, color: C.navy, fontSize: 58, fontWeight: 600, letterSpacing: 0 }}>?</span>
            </div>
          </div>
        </AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};

// ── 6. Why this recommendation: one tap, never forced open ──
const Why: React.FC = () => {
  const ref = useGsap((tl) => {
    tl.from(".link", { ...blurIn, duration: 0.6 }, 0)
      .from(".cursor", { x: 260, y: 220, duration: 0.42, ease: "power3.out" }, 0.02)
      .to(".cursor", { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 }, 0.42)
      .to(".link", { scale: 0.94, duration: 0.08, yoyo: true, repeat: 1 }, 0.42)
      .to(".link, .cursor", { opacity: 0, y: -30, filter: "blur(8px)", duration: 0.25, ease: "power2.in" }, 0.6)
      .from(".why", { opacity: 0, scale: 0.35, y: -120, filter: "blur(18px)", duration: 0.75, ease: "expo.out" }, 0.6)
      .from(".w1, .w2", { yPercent: 115, duration: 0.6, ease: "expo.out", stagger: 0.08 }, 0.7)
      .to(".why, .copy", { ...blurOut }, 1.38);
  });
  return (
    <AbsoluteFill ref={ref} style={page}>
      <Glows spots={[{ x: 1240, y: 560, r: 460 }, { x: 300, y: 800, r: 260, o: 0.6 }]} />
      <div className="copy" style={{ position: "absolute", left: 130, top: 420 }}>
        <div style={big(96)}><W cls="w1">Reasons,</W></div>
        <div style={{ ...big(96), marginTop: 14 }}><W cls="w2" style={{ color: C.navy }}>on request.</W></div>
      </div>
      <Shot className="why" src="el-why.png" w={830} style={{ left: 880, top: 152 }} radius={18} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="link" style={{ position: "relative", padding: "30px 42px", background: "#fff", borderRadius: 22, boxShadow: "0 0 0 1px rgba(0,43,92,.05), 0 24px 60px -12px rgba(0,43,92,.24)" }}>
          <Img src={cap("el-why-link.png")} style={{ display: "block", width: 620 }} />
          <div className="cursor" style={{ position: "absolute", left: 470, top: 40 }}><Cursor hand /></div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── 7. Add to bag, then the result it earned ──
const Bag: React.FC = () => {
  const ref = useGsap((tl) => {
    tl.from(".btn", { ...blurIn, scale: 0.6, duration: 0.8 }, 0)
      .from(".cursor", { x: 380, y: 300, duration: 0.6, ease: "power3.inOut" }, 0.12)
      .to(".cursor [data-arrow]", { opacity: 0, duration: 0.06 }, 0.62).to(".cursor [data-hand]", { opacity: 1, duration: 0.06 }, 0.62)
      .to(".cursor", { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1 }, 0.74)
      .to(".btn", { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1 }, 0.74)
      .to(".added", { opacity: 1, duration: 0.14 }, 0.8)
      .to(".cursor", { opacity: 0, x: 120, y: 120, duration: 0.3, ease: "power2.in" }, 1.0)
      .to(".btn", { y: -250, scale: 0.42, duration: 0.65, ease: "expo.inOut" }, 1.05)
      .from(".stat", { opacity: 0, y: 70, filter: "blur(14px)", duration: 0.7, ease: "expo.out" }, 1.25)
      .from(".n", { innerText: 0, snap: { innerText: 1 }, duration: 0.8, ease: "power3.out" }, 1.25)
      .from(".sl", { opacity: 0, y: 14, duration: 0.45 }, 1.5)
      .to(".all", { ...blurOut }, 2.0);
  });
  return (
    <AbsoluteFill ref={ref} style={page}>
      <Glows spots={[{ x: 960, y: 560, r: 520 }]} />
      <div className="all" style={{ position: "absolute", inset: 0 }}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="btn" style={{ position: "relative", width: 1000, borderRadius: 10, boxShadow: "0 40px 90px -20px rgba(0,47,95,.45)" }}>
            <Img src={cap("el-add.png")} style={{ display: "block", width: "100%", borderRadius: 10 }} />
            <Img className="added" src={cap("el-added.png")} style={{ position: "absolute", inset: 0, width: "100%", borderRadius: 10, opacity: 0 }} />
            <div className="cursor" style={{ position: "absolute", left: 610, top: 120 }}><Cursor /></div>
          </div>
        </AbsoluteFill>
        <AbsoluteFill className="stat" style={{ alignItems: "center", justifyContent: "center", paddingTop: 230 }}>
          <div style={{ ...big(270), color: C.navy, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>+<span className="n">61</span>%</div>
          <p className="sl" style={{ margin: "18px 0 0", fontFamily: MONO, fontSize: 32, letterSpacing: ".14em", color: "#5F6672" }}>ADD-TO-BAG · A/B TESTED</p>
        </AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};

// ── 8. End card ──
const End: React.FC = () => {
  const ref = useGsap((tl) => {
    tl.from(".mini", { ...blurIn, scale: 0.5 }, 0)
      .to(".e1", { text: "QuickFit Finder", duration: 0.6, ease: "none" }, 0.12)
      .from(".e2", { opacity: 0, y: 20, filter: "blur(8px)", duration: 0.55, ease: "expo.out" }, 0.75)
      .from(".e3", { opacity: 0, duration: 0.4 }, 1.0)
      .to(".all", { opacity: 0, filter: "blur(10px)", duration: 0.3, ease: "power2.in" }, 1.75);
  });
  return (
    <AbsoluteFill ref={ref} style={page}>
      <Glows spots={[{ x: 960, y: 540, r: 420, o: 0.8 }]} />
      <AbsoluteFill className="all" style={{ alignItems: "center", justifyContent: "center" }}>
        <Avatar className="mini" w={120} h={156} speed={1.1} offset={30} radius={22} style={{ position: "relative", marginBottom: 46 }} />
        <div style={big(132)}><span className="e1" /><Caret /></div>
        <div className="e2" style={{ ...big(64), marginTop: 22, color: C.muted, letterSpacing: "-0.02em" }}>on <span style={{ color: C.navy, fontWeight: 600 }}>Old Navy</span></div>
        <p className="e3" style={{ margin: "46px 0 0", fontFamily: MONO, fontSize: 26, letterSpacing: ".16em", color: "#5F6672" }}>3D FIT · A GAP INC. BRAND</p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const QuickFitDemo: React.FC = () => {
  let at = 0;
  const seq = (d: number, el: React.ReactNode) => { const s = <Sequence key={at} from={at} durationInFrames={d}>{el}</Sequence>; at += d; return s; };
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {seq(S.intro, <Intro />)}
      {seq(S.pdp, <PDP />)}
      {seq(S.steps, <Steps />)}
      {seq(S.three, <Three />)}
      {seq(S.wall, <Wall />)}
      {seq(S.why, <Why />)}
      {seq(S.bag, <Bag />)}
      {seq(S.end, <End />)}
    </AbsoluteFill>
  );
};
