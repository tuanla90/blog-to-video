import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from "remotion";
import {loadFont as loadInter} from "@remotion/google-fonts/Inter";
import {loadFont as loadMono} from "@remotion/google-fonts/JetBrainsMono";

// Vietnamese subset is REQUIRED or dấu becomes tofu boxes.
const inter = loadInter("normal", {weights: ["400", "600", "700", "800"], subsets: ["latin", "vietnamese"]});
const mono = loadMono("normal", {weights: ["600", "700", "800"], subsets: ["latin"]});

export const INTER = `${inter.fontFamily}, sans-serif`;
// mono is used for numbers/ASCII; Vietnamese glyphs fall back to Inter.
export const MONO = `${mono.fontFamily}, ${inter.fontFamily}, monospace`;

export const C = {
  bg: "#08090C", card: "#15171C", cardHi: "#1B1E25", border: "#2A2D36",
  text: "#FAFAFA", muted: "#9CA3AF",
  accent: "#3B82F6", good: "#00BC7D", warn: "#FE9A00", bad: "#FF6467", purple: "#AD46FF",
};

export const useVmin = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 100;
};

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

export const useAt = () => {
  const {durationInFrames: D} = useVideoConfig();
  return (p: number) => Math.round(D * p);
};

// fade + slide-up + blur-in for a premium reveal
export const FadeUp: React.FC<{at: number; d?: number; y?: number; style?: any; children: React.ReactNode}> =
({at, d = 16, y = 38, style, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + d], [0, 1], clamp);
  const ty = interpolate(f, [at, at + d], [y, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const bl = interpolate(f, [at, at + d * 0.7], [8, 0], clamp);
  return <div style={{opacity: o, transform: `translateY(${ty}px)`, filter: `blur(${bl}px)`, ...style}}>{children}</div>;
};

export const Pop: React.FC<{at: number; d?: number; style?: any; children: React.ReactNode}> =
({at, d = 14, style, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + d], [0, 1], clamp);
  const s = interpolate(f, [at, at + d], [0.72, 1], {...clamp, easing: Easing.out(Easing.back(1.5))});
  const bl = interpolate(f, [at, at + d * 0.6], [6, 0], clamp);
  return <div style={{opacity: o, transform: `scale(${s})`, filter: `blur(${bl}px)`, ...style}}>{children}</div>;
};

export const Until: React.FC<{to: number; d?: number; children: React.ReactNode; style?: any}> =
({to, d = 10, children, style}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [to - d, to], [1, 0], clamp);
  return <div style={{opacity: o, ...style}}>{children}</div>;
};

export const useCount = (at: number, d: number, from: number, to: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [at, at + d], [from, to], {...clamp, easing: Easing.out(Easing.cubic)});
};

// faint film grain to kill banding + add texture (static, cheap)
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

const Orb: React.FC<{color: string; x: number; y: number; size: number; phase: number; amp?: number; op?: number}> =
({color, x, y, size, phase, amp = 5, op = 0.16}) => {
  const f = useCurrentFrame();
  const dx = Math.sin(f / 130 + phase) * amp;
  const dy = Math.cos(f / 160 + phase) * amp;
  return (
    <div style={{position: "absolute", left: `${x}%`, top: `${y}%`, width: `${size}%`, height: `${size}%`,
      transform: `translate(-50%,-50%) translate(${dx}%,${dy}%)`,
      background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
      filter: "blur(40px)", opacity: op, pointerEvents: "none"}} />
  );
};

export const Bg: React.FC<{label?: string}> = ({label}) => {
  const vmin = useVmin();
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 90% at 50% 38%, #101218 0%, ${C.bg} 60%, #050609 100%)`}}>
      <Orb color={C.accent} x={26} y={32} size={62} phase={0} op={0.18} />
      <Orb color={C.purple} x={80} y={70} size={55} phase={2.2} op={0.12} />
      <Orb color={C.good} x={68} y={20} size={40} phase={4.1} op={0.08} amp={4} />
      <AbsoluteFill style={{
        backgroundImage:
          `linear-gradient(${C.border}40 1px, transparent 1px), linear-gradient(90deg, ${C.border}40 1px, transparent 1px)`,
        backgroundSize: `${9 * vmin}px ${9 * vmin}px`, opacity: 0.25,
        maskImage: "radial-gradient(circle at 50% 45%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 30%, transparent 80%)"}} />
      <AbsoluteFill style={{background: "radial-gradient(circle at 50% 42%, transparent 35%, rgba(0,0,0,0.55) 88%)"}} />
      <AbsoluteFill style={{backgroundImage: `url("${GRAIN}")`, backgroundSize: `${30 * vmin}px`,
        opacity: 0.05, mixBlendMode: "overlay"}} />
      {label && (
        <div style={{position: "absolute", top: 5 * vmin, left: 6 * vmin, fontFamily: MONO,
          color: C.muted, fontSize: 1.7 * vmin, letterSpacing: 4, fontWeight: 600, opacity: 0.7}}>
          <span style={{color: C.accent}}>●</span> {label}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{fontFamily: INTER, color: C.text, alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "0 7%", letterSpacing: "-0.01em"}}>
    {children}
  </AbsoluteFill>
);
