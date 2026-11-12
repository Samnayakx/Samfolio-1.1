// Shared pieces: a GSAP timeline that Remotion scrubs frame by frame, plus the glow, card, cursor and image helpers.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { loadFont } from "@remotion/google-fonts/InstrumentSans";
import { loadFont as loadMono } from "@remotion/google-fonts/DMMono";

gsap.registerPlugin(TextPlugin);
gsap.ticker.sleep(); // Remotion owns time: timelines are paused and seeked, never ticked

export const { fontFamily: SANS } = loadFont("normal", { weights: ["400", "500", "600"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "500"] });

export const C = {
  ink: "#111418",
  muted: "#8A919C",
  navy: "#002F5F",   // Old Navy's navy, as used in the prototype
  denim: "#5D7A9C",
  glow: "rgba(60, 110, 175, .26)",
  line: "rgba(20, 40, 90, .08)",
};

// Build a paused GSAP timeline once, then seek it to the current frame on every render.
// Seeking is absolute, so any frame renders the same no matter which order Remotion visits them in.
export function useGsap<T extends HTMLElement = HTMLDivElement>(build: (tl: gsap.core.Timeline, q: (s: string) => Element[]) => void) {
  const scope = useRef<T>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ paused: true });
      build(t, gsap.utils.selector(scope.current!) as (s: string) => Element[]);
      tl.current = t;
    }, scope);
    return () => ctx.revert();
  }, []);
  useLayoutEffect(() => { tl.current?.seek(frame / fps, false); }, [frame, fps]);
  return scope;
}

export const cap = (name: string) => staticFile(`cap/${name}`);

// Soft blue light pooled on white, drifting slowly: the reference's "glow under every card"
export const Glows: React.FC<{ spots: { x: number; y: number; r: number; o?: number }[] }> = ({ spots }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {spots.map((s, i) => {
        const dx = Math.sin((frame + i * 40) / 70) * 26, dy = Math.cos((frame + i * 55) / 90) * 18;
        return <div key={i} style={{ position: "absolute", left: s.x - s.r + dx, top: s.y - s.r + dy, width: s.r * 2, height: s.r * 2, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.glow} 0%, rgba(93,122,156,.10) 40%, transparent 70%)`, opacity: s.o ?? 1, filter: "blur(10px)" }} />;
      })}
    </AbsoluteFill>
  );
};

// A floating white card holding a real capture of the prototype
export const Shot: React.FC<{ src: string; w: number; className?: string; style?: React.CSSProperties; radius?: number; pad?: number; glow?: boolean }> = ({ src, w, className, style, radius = 22, pad = 0, glow = true }) => (
  <div className={className} style={{ position: "absolute", width: w, padding: pad, borderRadius: radius, background: "#fff",
    boxShadow: glow ? "0 1px 0 rgba(255,255,255,.9) inset, 0 0 0 1px rgba(0,43,92,.05), 0 24px 60px -12px rgba(0,43,92,.22), 0 60px 120px -30px rgba(60,110,175,.28)" : "none",
    overflow: "hidden", willChange: "transform, opacity, filter", ...style }}>
    <Img src={cap(src)} style={{ display: "block", width: "100%", height: "auto", borderRadius: Math.max(0, radius - pad) }} />
  </div>
);

// macOS-style pointer and hand. The hand appears while over a button.
export const Cursor = React.forwardRef<HTMLDivElement, { hand?: boolean }>(({ hand }, ref) => (
  <div ref={ref} style={{ position: "absolute", left: 0, top: 0, width: 64, height: 64, zIndex: 50, willChange: "transform", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.25))" }}>
    <svg data-arrow viewBox="0 0 32 32" width="64" height="64" style={{ position: "absolute", inset: 0, opacity: hand ? 0 : 1 }}>
      <path d="M6 3 L6 25 L11.5 19.8 L15.4 28.4 L19 26.8 L15.2 18.4 L22.6 18.4 Z" fill="#111" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
    <svg data-hand viewBox="0 0 32 32" width="64" height="64" style={{ position: "absolute", inset: 0, left: -14, opacity: hand ? 1 : 0 }}>
      <path d="M12.2 4.2c1.3 0 2.3 1 2.3 2.3v7.1l.4-.1c1.1-.3 2.2.3 2.6 1.3 1-.4 2.2 0 2.7 1 1-.3 2.1.2 2.5 1.2l.1.3V22c0 4-3 6.8-7 6.8h-1.4c-2.3 0-4.4-1.1-5.7-3L5.2 20c-.7-1-.5-2.3.4-3 .9-.7 2.2-.6 3 .2l1.3 1.4V6.5c0-1.3 1-2.3 2.3-2.3Z" fill="#fff" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14.5 14v5M17.6 15.3V19M20.6 16.6V19.6" stroke="#111" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  </div>
));

// Blinking text caret, timed off the frame so it stays in step with Remotion
export const Caret: React.FC<{ h?: number; color?: string }> = ({ h = 1, color = C.ink }) => {
  const frame = useCurrentFrame();
  return <span data-caret style={{ display: "inline-block", width: "0.06em", height: `${h}em`, marginLeft: "0.04em", background: color, verticalAlign: "-0.12em", opacity: Math.floor(frame / 9) % 2 ? 0.15 : 1 }} />;
};
