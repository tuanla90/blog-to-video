// Scene template kit — renders a beat from DATA (scenes.json) instead of bespoke JSX.
//
// Model:  beat = { bg, moments: [ { w, gap?, stack: [ element, ... ] } ] }
//   - w     : weight -> useSteps timing window for the moment (same engine as before).
//   - stack : vertical column of elements, each optionally revealed at `at` frames
//             (relative to the moment start). Arrays stagger by `stagger` frames.
//   - element = { el: "<kind>", ...props }
//
// Adding a video = writing this data, not JSX. Adding a NEW visual = one template here,
// reused by every future video (brand consistency for free). Truly one-off visuals live in
// videos/<slug>/customs.tsx (a CUSTOMS map) and are referenced by { el: "custom", name }.
import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Audio, Sequence, staticFile} from "remotion";
import {C, MONO, useVmin, useCount, FadeUp, Bg} from "./ui";
import {Lottie} from "@remotion/lottie";
import {LOTTIES} from "./lotties";

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
type Win = [number, number];

// ---- color tokens -> hex (accept raw hex too) ----
const COL: Record<string, string> = {
  accent: C.accent, good: C.good, warn: C.warn, bad: C.bad,
  muted: C.muted, purple: C.purple, text: C.text,
};
const col = (k?: string) => (k && COL[k]) || k || C.text;

// ---- inline rich text: "[accent:foo] bar [br] baz" ----
const rich = (s: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  // color content may itself contain [br] (allow it inside the group, then split).
  const re = /\[br\]|\[(accent|good|warn|bad|muted|purple|text):((?:\[br\]|[^\]])*)\]/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  const withBreaks = (txt: string): React.ReactNode[] =>
    txt.split("[br]").flatMap((p, i) => (i === 0 ? [p] : [<br key={`b${k++}`} />, p]));
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[0] === "[br]") out.push(<br key={k++} />);
    else out.push(<span key={k++} style={{color: col(m[1]), fontWeight: 800}}>{withBreaks(m[2])}</span>);
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
};

// ---- timing: split a moment's frames by weights ----
export const useSteps = (weights: number[]): Win[] => {
  const {durationInFrames: D} = useVideoConfig();
  const tot = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0; const out: Win[] = [];
  for (const w of weights) {
    const a = acc / tot; acc += w;
    out.push([Math.round(D * a), Math.round(D * acc / tot)]);
  }
  return out;
};

// Như useSteps nhưng moment có "atWord"/"atSec" sẽ NEO đúng vào timestamp giọng (timings.json) ->
// không lệ thuộc nhịp đọc (v3 đọc mỗi lần một khác). Moment không neo thì flow theo weight giữa 2 neo.
// atWord: tìm tuần tự (theo thứ tự moment) từ khoá trong các từ -> dùng start của từ đó (+ LEAD_IN).
export const useAnchoredSteps = (moments: any[], lines?: any[]): Win[] => {
  const {durationInFrames: D, fps} = useVideoConfig();
  const LEAD = Math.round(0.4 * fps);
  const words = (lines || []).flatMap((L: any) => L.words || []);
  let cursor = 0;
  const anchor: (number | null)[] = moments.map((m) => {
    if (typeof m.atSec === "number") return Math.round(m.atSec * fps);
    if (m.atWord) {
      const key = String(m.atWord).toLowerCase();
      for (let i = cursor; i < words.length; i++) {
        if (String(words[i].w).toLowerCase().includes(key)) { cursor = i + 1; return LEAD + Math.round(words[i].s * fps); }
      }
    }
    return null;
  });
  if (anchor[0] == null) anchor[0] = 0;
  const weights = moments.map((m) => m.w || 1);
  const starts: number[] = new Array(moments.length).fill(0);
  let i = 0;
  while (i < moments.length) {
    let segStart = anchor[i] as number;
    if (i > 0) segStart = Math.max(segStart, starts[i - 1] + 1);
    let j = i + 1;
    while (j < moments.length && anchor[j] == null) j++;
    let segEnd = j < moments.length ? (anchor[j] as number) : D;
    segEnd = Math.min(D, Math.max(segEnd, segStart + (j - i)));
    const span = segEnd - segStart;
    const tot = weights.slice(i, j).reduce((a: number, b: number) => a + b, 0) || 1;
    let acc = 0;
    for (let k = i; k < j; k++) { starts[k] = segStart + Math.round(span * acc / tot); acc += weights[k]; }
    i = j;
  }
  return moments.map((_, k) => [starts[k], k + 1 < moments.length ? starts[k + 1] : D] as Win);
};

// ---- Moment: enter (rise+blur in) / hold / exit (rise+blur out) for a window ----
const Moment: React.FC<{win: Win; gap: number; v: number; children: React.ReactNode}> =
({win, gap, v, children}) => {
  const f = useCurrentFrame();
  const [from, to] = win;
  const IN = Math.min(11, Math.round((to - from) * 0.28));
  const OUT = Math.min(9, Math.round((to - from) * 0.24));
  const ease = {...clamp, easing: Easing.out(Easing.cubic)};
  const o = interpolate(f, [from, from + IN, to - OUT, to], [0, 1, 1, 0], clamp);
  const ty = interpolate(f, [from, from + IN, to - OUT, to], [36, 0, 0, -26], ease);
  const sc = interpolate(f, [from, from + IN, to - OUT, to], [0.96, 1, 1, 1.035], ease);
  const bl = interpolate(f, [from, from + IN, to - OUT, to], [10, 0, 0, 8], clamp);
  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "0 7%", opacity: o, transform: `translateY(${ty}px) scale(${sc})`,
      filter: `blur(${bl}px)`, letterSpacing: "-0.015em"}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: gap * v}}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

// reveal a child at `at` frames into the moment (or instantly if `at` is null)
const Reveal: React.FC<{at: number | undefined; from: number; children: React.ReactNode; style?: any}> =
({at, from, children, style}) =>
  at == null ? <div style={style}>{children}</div> : <FadeUp at={from + at} style={style}>{children}</FadeUp>;

// ---------- shared visual primitives (ported verbatim from video #1) ----------
const vnd = (n: number, unit = "tỷ") => `${n.toFixed(1).replace(".", ",")} ${unit}`;
const dec = (n: number) => n.toFixed(1).replace(".", ",");

const Card: React.FC<{label: string; value: string; color: string; sub?: string; v: number; scale?: number}> =
({label, value, color, sub, v, scale = 1}) => (
  <div style={{
    background: `linear-gradient(152deg, ${color}26, ${C.cardHi} 40%, ${C.card})`,
    border: `1px solid ${color}55`, borderRadius: 2.4 * v,
    padding: `${2.8 * v * scale}px ${3.6 * v * scale}px`, minWidth: 30 * v * scale, position: "relative", overflow: "hidden",
    boxShadow: `0 ${1.8 * v}px ${4.5 * v}px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 ${6 * v}px ${color}24`}}>
    <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`}} />
    <div style={{color: C.muted, fontSize: 2 * v * scale, fontWeight: 600, marginBottom: 1 * v, letterSpacing: "0.03em"}}>{label}</div>
    <div style={{fontFamily: MONO, fontSize: 7.5 * v * scale, fontWeight: 800, color, lineHeight: 1, whiteSpace: "nowrap",
      textShadow: `0 0 ${2.6 * v}px ${color}66`}}>{value}</div>
    {sub ? <div style={{color: C.muted, fontSize: 1.5 * v * scale, marginTop: 1.2 * v}}>{sub}</div> : null}
  </div>
);

const DateCard: React.FC<{dept: string; col: string; month: string; color: string; v: number}> =
({dept, col: c, month, color, v}) => (
  <div style={{background: `linear-gradient(152deg, ${color}22, ${C.cardHi} 42%, ${C.card})`, border: `1px solid ${color}4d`,
    borderRadius: 2 * v, padding: `${2 * v}px ${2.4 * v}px`, minWidth: 24 * v,
    boxShadow: `0 ${1.2 * v}px ${3 * v}px rgba(0,0,0,0.45), 0 0 ${4 * v}px ${color}22`}}>
    <div style={{color: C.text, fontSize: 2 * v, fontWeight: 700}}>{dept}</div>
    <div style={{color: C.muted, fontSize: 1.6 * v, marginBottom: 1.2 * v}}>theo {c}</div>
    <div style={{fontFamily: MONO, color, fontSize: 4.4 * v, fontWeight: 800,
      textShadow: `0 0 ${2 * v}px ${color}66`}}>{month}</div>
  </div>
);

const Chip: React.FC<{t: string; color: string; v: number}> = ({t, color, v}) => (
  <div style={{border: `1.5px solid ${color}`, color, borderRadius: 100, padding: `${1.4 * v}px ${3 * v}px`,
    fontSize: 2.8 * v, fontWeight: 800, letterSpacing: 1, background: `linear-gradient(${color}22, ${color}0a)`,
    boxShadow: `0 0 ${3.6 * v}px ${color}55, inset 0 0 ${2 * v}px ${color}22`,
    textShadow: `0 0 ${1.4 * v}px ${color}66`}}>{t}</div>
);

const BarCol: React.FC<{h: number; color: string; label: string; value: string; v: number}> =
({h, color, label, value, v}) => (
  <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end"}}>
    <div style={{fontFamily: MONO, color, fontSize: 2.3 * v, fontWeight: 800, marginBottom: 1 * v}}>{value}</div>
    <div style={{width: 9 * v, height: h, borderRadius: `${1 * v}px ${1 * v}px ${0.4 * v}px ${0.4 * v}px`,
      background: `linear-gradient(180deg, ${color}, ${color}aa)`,
      boxShadow: `0 0 ${3.4 * v}px ${color}77, inset 0 ${1.4 * v}px 0 rgba(255,255,255,0.2)`}} />
    <div style={{color: C.muted, fontSize: 1.9 * v, marginTop: 1.4 * v, fontWeight: 600}}>{label}</div>
  </div>
);

// ---------- element types (the template catalog) ----------
type ElProps = any;

const Label: React.FC<{v: number; children: React.ReactNode}> = ({v, children}) => (
  <div style={{fontFamily: MONO, color: C.muted, fontSize: 1.9 * v, letterSpacing: 4, fontWeight: 600}}>{children}</div>
);

const elText = (p: ElProps, v: number) => (
  <div style={{fontSize: (p.size ?? 5) * v, fontWeight: 800, color: col(p.color), lineHeight: 1.12,
    letterSpacing: p.spacing != null ? p.spacing : "-0.022em"}}>{rich(p.value)}</div>
);

const elLabel = (p: ElProps, v: number) => <Label v={v}>{p.text}</Label>;

const elCaption = (p: ElProps, v: number) => (
  <div style={{color: col(p.color || "muted"), fontSize: (p.size ?? 2.3) * v}}>{rich(p.text)}</div>
);

const ElCards: React.FC<{p: ElProps; from: number; v: number}> = ({p, from, v}) => {
  const {width, height} = useVideoConfig();
  const cards = p.cards as ElProps[];
  const gap = p.gap ?? 5;
  // shrink to fit N cards within the usable width of THIS orientation (portrait ≪ landscape)
  const avail = height > width ? 86 : 150;
  const scale = Math.min(1, avail / (cards.length * 30 + (cards.length - 1) * gap));
  const at = p.countAt ?? 6;
  const counts = cards.map((c) => useCount(from + at, 18, 0, c.countTo ?? 0));
  return (
    <div style={{display: "flex", gap: gap * v * scale}}>
      {cards.map((c, i) => (
        <Card key={i} v={v} scale={scale} label={c.label} color={col(c.color)} sub={c.sub}
          value={c.countTo != null ? vnd(counts[i], c.unit ?? "tỷ") : c.value} />
      ))}
    </div>
  );
};

const elDateCards = (p: ElProps, from: number, v: number) => (
  <div style={{display: "flex", gap: (p.gap ?? 3) * v}}>
    {(p.rows as ElProps[]).map((r, i) => (
      <FadeUp key={i} at={from + (p.at ?? 0) + i * (p.stagger ?? 9)}>
        <DateCard dept={r.dept} col={r.col} month={r.month} color={col(r.color)} v={v} />
      </FadeUp>
    ))}
  </div>
);

const ElBars: React.FC<{p: ElProps; from: number; v: number}> = ({p, from, v}) => {
  const g = useCount(from + (p.growAt ?? 6), 24, 0, p.grow === false ? 1 : 1);
  const grow = p.grow === false ? 1 : g;
  const maxV = Math.max(...(p.bars as ElProps[]).map((b) => b.value)) || 1;
  const maxH = (p.maxH ?? 28) * v;
  return (
    <div style={{display: "flex", gap: (p.gap ?? 7) * v, alignItems: "flex-end"}}>
      {(p.bars as ElProps[]).map((b, i) => (
        <BarCol key={i} v={v} color={col(b.color)} label={b.label}
          value={b.display ?? dec(b.value)} h={(b.value / maxV) * maxH * grow + 1 * v} />
      ))}
    </div>
  );
};

const elChips = (p: ElProps, from: number, v: number) => (
  <div style={{display: "flex", flexDirection: p.dir === "col" ? "column" : "row", gap: (p.gap ?? 3) * v}}>
    {(p.items as [string, string][]).map(([t, c], i) => (
      <FadeUp key={t} at={from + (p.at ?? 0) + i * (p.stagger ?? 6)}>
        <Chip t={t} color={col(c)} v={v} />
      </FadeUp>
    ))}
  </div>
);

// ---- charts (native Remotion/SVG, frame-animated; data shape mirrors blog ECharts) ----
const niceScale = (vals: number[], pad = 0.1) => {
  let mn = Math.min(...vals), mx = Math.max(...vals);
  if (mn === mx) { mn -= 1; mx += 1; }
  const r = mx - mn || 1;
  return {mn: mn - r * pad, mx: mx + r * pad};
};
const seriesColor = (c: string | undefined, i: number) =>
  col(c || (i === 0 ? "accent" : i === 1 ? "good" : "warn"));

// line: each series draws left→right (stroke-dashoffset), area fades in, markLines are thresholds
const ElLine: React.FC<{p: ElProps; from: number; v: number}> = ({p, from, v}) => {
  const f = useCurrentFrame();
  const W = (p.w ?? 60) * v, H = (p.h ?? 26) * v;
  const at = from + (p.at ?? 6), dur = p.dur ?? 30;
  const prog = interpolate(f, [at, at + dur], [0, 1], clamp);
  const series = p.series as ElProps[];
  const marks = (p.markLine as ElProps[]) || [];
  const {mn, mx} = niceScale(series.flatMap((s) => s.values).concat(marks.map((m) => m.y)));
  const X = (i: number, len: number) => (len <= 1 ? 0 : (i / (len - 1)) * W);
  const Y = (val: number) => H - ((val - mn) / (mx - mn)) * H;
  return (
    <div>
      <svg width={W} height={H} style={{overflow: "visible", display: "block"}}>
        {marks.map((m, i) => {
          const y = Y(m.y), c = col(m.color || "bad");
          return (
            <g key={"ml" + i}>
              <line x1={0} y1={y} x2={W} y2={y} stroke={c} strokeWidth={1.5} strokeDasharray="6 5" opacity={0.85} />
              {m.label ? <text x={W} y={y - 0.6 * v} textAnchor="end" fill={c} fontSize={1.7 * v} fontFamily={MONO} fontWeight={700}>{m.label}</text> : null}
            </g>
          );
        })}
        {series.map((s, si) => {
          const c = seriesColor(s.color, si);
          const len = s.values.length;
          const pts = s.values.map((val: number, i: number) => `${X(i, len)},${Y(val)}`);
          const line = "M" + pts.join(" L");
          const area = `M${X(0, len)},${H} L` + pts.join(" L") + ` L${X(len - 1, len)},${H} Z`;
          return (
            <g key={si}>
              <path d={area} fill={c} opacity={0.13 * prog} />
              <path d={line} fill="none" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog}
                style={{filter: `drop-shadow(0 0 ${0.9 * v}px ${c})`}} />
              <circle cx={X(len - 1, len)} cy={Y(s.values[len - 1])} r={(prog > 0.95 ? 0.85 : 0) * v} fill={c} />
            </g>
          );
        })}
      </svg>
      {p.xLabels ? (
        <div style={{display: "flex", justifyContent: "space-between", width: W, marginTop: 1 * v}}>
          {(p.xLabels as string[]).map((lb, i) => <div key={i} style={{fontFamily: MONO, color: C.muted, fontSize: 1.5 * v}}>{lb}</div>)}
        </div>
      ) : null}
    </div>
  );
};

// scatter: points pop in (staggered), optional least-squares trendline draws in after
const ElScatter: React.FC<{p: ElProps; from: number; v: number}> = ({p, from, v}) => {
  const f = useCurrentFrame();
  const W = (p.w ?? 52) * v, H = (p.h ?? 28) * v;
  const at = from + (p.at ?? 6);
  const pts = p.points as {x: number; y: number}[];
  const sx = niceScale(pts.map((q) => q.x), 0.08), sy = niceScale(pts.map((q) => q.y), 0.08);
  const X = (x: number) => ((x - sx.mn) / (sx.mx - sx.mn)) * W;
  const Y = (y: number) => H - ((y - sy.mn) / (sy.mx - sy.mn)) * H;
  const c = col(p.color || "accent");
  let trend: React.ReactNode = null;
  if (p.trendline) {
    const n = pts.length;
    const sX = pts.reduce((a, q) => a + q.x, 0), sY = pts.reduce((a, q) => a + q.y, 0);
    const sXY = pts.reduce((a, q) => a + q.x * q.y, 0), sXX = pts.reduce((a, q) => a + q.x * q.x, 0);
    const slope = (n * sXY - sX * sY) / (n * sXX - sX * sX || 1);
    const itc = (sY - slope * sX) / n;
    const tc = col(p.trendColor || "bad");
    const tp = interpolate(f, [at + n * 2 + 8, at + n * 2 + 30], [0, 1], clamp);
    const x0 = sx.mn, x1 = sx.mn + (sx.mx - sx.mn) * tp;
    trend = <line x1={X(x0)} y1={Y(slope * x0 + itc)} x2={X(x1)} y2={Y(slope * x1 + itc)} stroke={tc} strokeWidth={2} strokeDasharray="6 5" />;
  }
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      {p.yName ? <div style={{alignSelf: "flex-start", color: C.muted, fontSize: 1.6 * v, marginBottom: 0.6 * v}}>↑ {p.yName}</div> : null}
      <svg width={W} height={H} style={{overflow: "visible", display: "block"}}>
        <line x1={0} y1={H} x2={W} y2={H} stroke={C.border} strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={H} stroke={C.border} strokeWidth={1} />
        {trend}
        {pts.map((q, i) => {
          const pop = interpolate(f, [at + i * 2, at + i * 2 + 10], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
          return <circle key={i} cx={X(q.x)} cy={Y(q.y)} r={1 * v * pop} fill={c} opacity={0.85}
            style={{filter: `drop-shadow(0 0 ${0.7 * v}px ${c})`}} />;
        })}
      </svg>
      {p.xName ? <div style={{color: C.muted, fontSize: 1.6 * v, marginTop: 1 * v}}>{p.xName} →</div> : null}
    </div>
  );
};

// waterfall: total bars from 0, delta bars float at the running level (green up / red down)
const ElWaterfall: React.FC<{p: ElProps; from: number; v: number}> = ({p, from, v}) => {
  const f = useCurrentFrame();
  const at = from + (p.at ?? 6);
  const items = p.items as {label: string; value: number; type?: string}[];
  let run = 0;
  const bars = items.map((it) => {
    if (it.type === "total") { run = it.value; return {base: 0, top: it.value, end: it.value}; }
    const a = run; run += it.value; return {base: Math.min(a, run), top: Math.max(a, run), end: run};
  });
  const H = (p.h ?? 24) * v, barW = (p.barW ?? 5) * v, gap = (p.gap ?? 2.6) * v;
  const totalW = items.length * barW + (items.length - 1) * gap;
  const {mn, mx} = niceScale(bars.flatMap((b) => [b.base, b.top]).concat([0]), 0.06);
  const Y = (val: number) => H - ((val - mn) / (mx - mn)) * H;
  return (
    <div>
      <svg width={totalW} height={H} style={{overflow: "visible", display: "block"}}>
        {bars.map((b, i) => {
          if (i === 0) return null;
          const grow = interpolate(f, [at + i * 5, at + i * 5 + 14], [0, 1], clamp);
          const y = Y(bars[i - 1].end);
          const x1 = (i - 1) * (barW + gap) + barW, x2 = i * (barW + gap);
          return <line key={"c" + i} x1={x1} y1={y} x2={x2} y2={y} stroke={C.muted} strokeWidth={1} strokeDasharray="3 3" opacity={0.4 * grow} />;
        })}
        {bars.map((b, i) => {
          const it = items[i];
          const up = it.type === "total" || it.value >= 0;
          const c = it.type === "total" ? col(p.totalColor || "accent") : (up ? C.good : C.bad);
          const grow = interpolate(f, [at + i * 5, at + i * 5 + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const topPx = Y(b.top), botPx = Y(b.base), full = botPx - topPx, h = full * grow;
          const y = up ? botPx - h : topPx;
          const x = i * (barW + gap);
          const lbl = (it.type === "total" ? "" : it.value >= 0 ? "+" : "−") + (it.type === "total" ? it.value : Math.abs(it.value)) + (p.unit || "");
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={Math.max(h, 0)} rx={0.8 * v} fill={c}
                style={{filter: `drop-shadow(0 0 ${0.8 * v}px ${c}66)`}} />
              <text x={x + barW / 2} y={topPx - 0.8 * v} textAnchor="middle" fill={c} fontSize={1.7 * v} fontFamily={MONO} fontWeight={800} opacity={grow}>{lbl}</text>
            </g>
          );
        })}
      </svg>
      <div style={{display: "flex", width: totalW, marginTop: 1 * v}}>
        {items.map((it, i) => (
          <div key={i} style={{width: barW, marginRight: i < items.length - 1 ? gap : 0, textAlign: "center",
            color: C.muted, fontSize: 1.3 * v, lineHeight: 1.15}}>{it.label}</div>
        ))}
      </div>
    </div>
  );
};

// ---- list: numbered rows / "key — text" / plain bullets (one flexible element) ----
const listRow = (r: ElProps, v: number): React.ReactNode => {
  if (r.n != null) return (
    <div style={{display: "flex", alignItems: "center", gap: 3 * v}}>
      <div style={{fontFamily: MONO, color: col(r.color), fontSize: 4 * v, fontWeight: 800,
        textShadow: `0 0 ${2 * v}px ${col(r.color)}66`}}>{r.n}</div>
      <div>
        {r.tag ? <div style={{color: col(r.color), fontWeight: 800, fontSize: 2.4 * v, letterSpacing: 1}}>{r.tag}</div> : null}
        <div style={{color: C.text, fontSize: 2.6 * v}}>{rich(r.text)}</div>
      </div>
    </div>
  );
  if (r.key != null) return (
    <div style={{fontSize: 2.9 * v, fontWeight: 700}}>
      <span style={{color: col(r.color), fontWeight: 800}}>{r.key}</span> — {r.text}
    </div>
  );
  return (
    <div style={{fontFamily: r.mono ? MONO : undefined, color: col(r.color || "warn"),
      fontSize: (r.size ?? 2.8) * v, fontWeight: 700}}>{rich(r.text)}</div>
  );
};
const ElList: React.FC<{p: ElProps; from: number; v: number}> = ({p, from, v}) => {
  const structured = (p.rows as ElProps[]).some((r) => r.n != null || r.key != null);
  const align = p.align ?? (structured ? "left" : "center");
  return (
    <div style={{display: "grid", gap: (p.gap ?? 2.4) * v, textAlign: align as any}}>
      {(p.rows as ElProps[]).map((r, i) => (
        <FadeUp key={i} at={from + (p.at ?? 6) + i * (p.stagger ?? 9)}>{listRow(r, v)}</FadeUp>
      ))}
    </div>
  );
};

// ---- dots: a grid where every Nth dot is "kept" (highlighted), rest dimmed ----
const ElDots: React.FC<{p: ElProps; v: number}> = ({p, v}) => {
  const total = p.total ?? 30, cols = p.cols ?? 6, keepEvery = p.keepEvery ?? 5;
  const c = col(p.color || "warn");
  return (
    <div style={{display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1.4 * v}}>
      {Array.from({length: total}).map((_, i) => {
        const keep = i % keepEvery === 0;
        return <div key={i} style={{width: 5 * v, height: 5 * v, borderRadius: 1 * v,
          background: keep ? c : C.card, border: `1px solid ${keep ? c : C.border}`,
          opacity: keep ? 1 : 0.25, boxShadow: keep ? `0 0 ${1.6 * v}px ${c}66` : "none"}} />;
      })}
    </div>
  );
};

// ---- gauge: a bar growing toward a dashed goal line + a % count-up + caption ----
const ElGauge: React.FC<{p: ElProps; from: number; v: number}> = ({p, from, v}) => {
  const at = p.at ?? 8;
  const barH = useCount(from + at, 26, p.barMin ?? 2, p.barMax ?? 23);
  const pct = useCount(from + at, 26, 0, p.pct ?? 95);
  const bar = col(p.color || "accent"), goal = col(p.goalColor || "good");
  return (
    <>
      <div style={{position: "relative", height: 30 * v, display: "flex", alignItems: "flex-end"}}>
        <div style={{position: "absolute", bottom: 26 * v, width: 34 * v, left: -6 * v, borderTop: `2px dashed ${goal}`}} />
        <div style={{position: "absolute", bottom: 26.5 * v, right: -10 * v, color: goal, fontSize: 2 * v, fontWeight: 700}}>{p.goalLabel}</div>
        <div style={{width: 12 * v, height: barH * v, borderRadius: `${1 * v}px ${1 * v}px 0 0`,
          background: `linear-gradient(180deg, ${bar}, ${bar}aa)`,
          boxShadow: `0 0 ${3 * v}px ${bar}77, inset 0 ${1.4 * v}px 0 rgba(255,255,255,0.2)`}} />
      </div>
      <div style={{fontFamily: MONO, fontSize: 6 * v, fontWeight: 800, color: goal, marginTop: 3 * v,
        textShadow: `0 0 ${2.4 * v}px ${goal}66`}}>{Math.round(pct)}%</div>
      {p.sub ? <div style={{color: C.muted, fontSize: 2.1 * v}}>{rich(p.sub)}</div> : null}
    </>
  );
};

// ---- recap: staggered 3-column rows (key | a | b) as cards ----
const ElRecap: React.FC<{p: ElProps; from: number; v: number}> = ({p, from, v}) => (
  <div style={{display: "grid", gap: (p.gap ?? 2) * v}}>
    {(p.rows as ElProps[]).map((r, i) => (
      <FadeUp key={i} at={from + (p.at ?? 6) + i * (p.stagger ?? 12)}
        style={{display: "grid", gridTemplateColumns: `${22 * v}px ${30 * v}px ${34 * v}px`,
          gap: 2 * v, alignItems: "center", background: `linear-gradient(160deg, ${C.cardHi}, ${C.card})`,
          border: `1px solid ${C.border}`, borderRadius: 1.6 * v, padding: `${2 * v}px ${2.6 * v}px`,
          textAlign: "left", boxShadow: `0 ${1 * v}px ${3 * v}px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`}}>
        <div style={{color: col(r.color), fontWeight: 800, fontSize: 2.8 * v}}>{r.key}</div>
        <div style={{color: C.text, fontSize: 2.2 * v}}>{rich(r.a)}</div>
        <div style={{color: C.muted, fontSize: 2 * v}}>{rich(r.b)}</div>
      </FadeUp>
    ))}
  </div>
);

// ---- cta: a pill button + tagline + optional brand line ----
const elCta = (p: ElProps, v: number) => {
  const c = col(p.color || "accent");
  return (
    <>
      <div style={{display: "inline-flex", alignItems: "center", gap: 2 * v, border: `2px solid ${c}`, color: c,
        borderRadius: 100, padding: `${(p.padY ?? 1.6) * v}px ${(p.padX ?? 3.4) * v}px`,
        fontSize: (p.size ?? 2.6) * v, fontWeight: 800, boxShadow: `0 0 ${3 * v}px ${c}55`}}>{p.pill}</div>
      {p.tagline ? <div style={{color: C.muted, fontSize: (p.tagSize ?? 2.1) * v, marginTop: 3 * v}}>{rich(p.tagline)}</div> : null}
      {p.brand ? <div style={{fontFamily: MONO, color: C.muted, fontSize: 1.7 * v, letterSpacing: 4, marginTop: 4 * v}}>{p.brand}</div> : null}
    </>
  );
};

// timeline: trục thời gian ngang, mỗi mốc tự NEO vào từ (atWord -> timings) nên không lệch khi re-gen
const ElTimeline: React.FC<{p: ElProps; from: number; v: number; lines?: any[]}> = ({p, from, v, lines}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const marks = p.marks || [];
  const at = p.at ?? 6, stag = p.stagger ?? 30;
  const n = marks.length || 1;
  const W = 86 * v;
  const LEAD = Math.round(0.4 * fps);
  const words = lines ? lines.flatMap((L: any) => L.words || []) : [];
  let cur = 0;                                   // con trỏ tuần tự (mark sau tìm sau mark trước)
  const frames = marks.map((m: any, i: number) => {
    if (m.atWord && words.length) {
      const key = String(m.atWord).toLowerCase();
      for (let k = cur; k < words.length; k++) {
        if (String(words[k].w).toLowerCase().includes(key)) { cur = k + 1; return LEAD + Math.round(words[k].s * fps); }
      }
    }
    return from + at + 14 + i * stag;            // fallback: weight nếu không neo được
  });
  const first = frames.length ? Math.min(...frames) : from + at;
  const grow = interpolate(f, [first - 14, first + 4], [0, 1], clamp);
  const xpos = (i: number) => (n <= 1 ? 0.5 : 0.08 + i * (0.84 / (n - 1))) * W;
  return (
    <div style={{position: "relative", width: W, height: 32 * v}}>
      <div style={{position: "absolute", top: 16 * v, left: 0, height: 0.5 * v, width: W,
        transformOrigin: "left", transform: `scaleX(${grow})`,
        background: `linear-gradient(90deg, ${col("accent")}, ${col("good")}, ${col("warn")})`,
        boxShadow: `0 0 ${2 * v}px ${col("accent")}66`}} />
      {marks.map((m: any, i: number) => {
        const a = frames[i];
        const o = interpolate(f, [a, a + 12], [0, 1], clamp);
        const ty = interpolate(f, [a, a + 12], [10, 0], {...clamp, easing: Easing.out(Easing.cubic)});
        const c = col(m.color);
        return (
          <div key={i} style={{position: "absolute", left: xpos(i), top: 16 * v, transform: "translate(-50%,-50%)"}}>
            <div style={{position: "absolute", bottom: 3.2 * v, left: "50%", transform: `translateX(-50%) translateY(${-ty}px)`,
              opacity: o, whiteSpace: "nowrap", color: C.text, fontSize: 2 * v, fontWeight: 700}}>{m.event}</div>
            <div style={{width: 2.4 * v, height: 2.4 * v, borderRadius: "50%", background: c, opacity: o,
              boxShadow: `0 0 ${2.4 * v}px ${c}`}} />
            <div style={{position: "absolute", top: 3.2 * v, left: "50%", transform: `translateX(-50%) translateY(${ty}px)`,
              opacity: o, textAlign: "center", whiteSpace: "nowrap"}}>
              <div style={{fontFamily: MONO, color: c, fontSize: 3.4 * v, fontWeight: 800, textShadow: `0 0 ${2 * v}px ${c}66`}}>{m.month}</div>
              <div style={{color: C.muted, fontSize: 1.7 * v, marginTop: 0.3 * v}}>{m.dept}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// flow: sơ đồ mũi tên nối các khái niệm (Metric -> Dimension -> KPI)
const ElFlow: React.FC<{p: ElProps; from: number; v: number}> = ({p, from, v}) => {
  const f = useCurrentFrame();
  const nodes = p.nodes || [];
  const at = p.at ?? 6, stag = p.stagger ?? 16;
  return (
    <div style={{display: "flex", alignItems: "center", gap: 1.6 * v}}>
      {nodes.map((nd: any, i: number) => {
        const a = from + at + i * stag;
        const o = interpolate(f, [a, a + 12], [0, 1], clamp);
        const sc = interpolate(f, [a, a + 12], [0.8, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
        const arrowA = from + at + (i - 1) * stag + 9;
        const arrowO = interpolate(f, [arrowA, arrowA + 8], [0, 1], clamp);
        const c = col(nd.color);
        return (
          <React.Fragment key={i}>
            {i > 0 && <div style={{opacity: arrowO, color: C.muted, fontSize: 4 * v, fontWeight: 800}}>→</div>}
            <div style={{opacity: o, transform: `scale(${sc})`, border: `2px solid ${c}`, borderRadius: 2 * v,
              padding: `${1.8 * v}px ${2.4 * v}px`, background: `linear-gradient(160deg, ${c}26, ${C.card})`,
              textAlign: "center", minWidth: 21 * v, boxShadow: `0 0 ${3 * v}px ${c}44`}}>
              <div style={{color: c, fontSize: 2.9 * v, fontWeight: 800}}>{nd.key}</div>
              <div style={{color: C.muted, fontSize: 1.85 * v, marginTop: 0.6 * v}}>{nd.sub}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------- element dispatch ----------
const El: React.FC<{e: ElProps; from: number; v: number; customs: Record<string, React.FC>; lines?: any[]}> =
({e, from, v, customs, lines}) => {
  const {fps} = useVideoConfig();
  switch (e.el) {
    case "timeline": return <ElTimeline p={e} from={from} v={v} lines={lines} />;
    case "flow": return <ElFlow p={e} from={from} v={v} />;
    case "text": return <Reveal at={e.at} from={from}>{elText(e, v)}</Reveal>;
    case "label": return <Reveal at={e.at} from={from}>{elLabel(e, v)}</Reveal>;
    case "caption": return <Reveal at={e.at} from={from}>{elCaption(e, v)}</Reveal>;
    case "chip": return <Reveal at={e.at} from={from}><Chip t={e.text} color={col(e.color)} v={v} /></Reveal>;
    case "chips": return elChips(e, from, v);
    case "cards": return <Reveal at={e.at} from={from}><ElCards p={e} from={from} v={v} /></Reveal>;
    case "date-cards": return elDateCards(e, from, v);
    case "bars": return <Reveal at={e.at} from={from}><ElBars p={e} from={from} v={v} /></Reveal>;
    case "line": return <ElLine p={e} from={from} v={v} />;
    case "scatter": return <ElScatter p={e} from={from} v={v} />;
    case "waterfall": return <ElWaterfall p={e} from={from} v={v} />;
    case "list": return <ElList p={e} from={from} v={v} />;
    case "dots": return <Reveal at={e.at} from={from}><ElDots p={e} v={v} /></Reveal>;
    case "gauge": return <ElGauge p={e} from={from} v={v} />;
    case "recap": return <ElRecap p={e} from={from} v={v} />;
    case "cta": return <Reveal at={e.at} from={from}>{elCta(e, v)}</Reveal>;
    case "sfx": {
      // SFX neo theo từ (atWord -> timings giọng) hoặc at frames trong moment
      let fr = from + (e.at ?? 0);
      if (e.atWord && lines) {
        const key = String(e.atWord).toLowerCase();
        const hit = lines.flatMap((L: any) => L.words || []).find((w: any) => String(w.w).toLowerCase().includes(key));
        if (hit) fr = Math.round(0.4 * fps) + Math.round(hit.s * fps) - Math.round((e.lead ?? 0) * fps);  // lead: bắt đầu sớm (riser build-up)
      }
      fr = Math.max(0, fr);
      return (
        <Sequence from={fr} layout="none">
          <Audio src={staticFile(`audio/sfx/${String(e.name).includes(".") ? e.name : e.name + ".wav"}`)} volume={e.volume ?? 0.1} />
        </Sequence>
      );
    }
    case "lottie": {
      const data = LOTTIES[e.name];
      const s = (e.size ?? 16) * v;
      // own Sequence so the Lottie's frame 0 starts at the moment (not the beat).
      return data ? (
        <Sequence from={from + (e.at ?? 0)} layout="none">
          <Lottie animationData={data as any} loop={e.loop ?? false} style={{width: s, height: s}} />
        </Sequence>
      ) : null;
    }
    case "custom": {
      const Cmp = customs[e.name];
      return <Reveal at={e.at} from={from}>{Cmp ? <Cmp /> : null}</Reveal>;
    }
    default: return <div style={{color: C.bad}}>?{e.el}</div>;
  }
};

// ---------- the beat renderer ----------
export type BeatData = {bg?: string; moments: {w: number; gap?: number; atSec?: number; atWord?: string; stack: ElProps[]}[]};

export const Beat: React.FC<{data: BeatData; customs?: Record<string, React.FC>; lines?: any[]}> =
({data, customs = {}, lines}) => {
  const v = useVmin();
  const S = useAnchoredSteps(data.moments, lines);
  return (
    <AbsoluteFill>
      <Bg label={data.bg} />
      {data.moments.map((m, i) => (
        <Moment key={i} win={S[i]} gap={m.gap ?? 3} v={v}>
          {m.stack.map((e, j) => <El key={j} e={e} from={S[i][0]} v={v} customs={customs} lines={lines} />)}
        </Moment>
      ))}
    </AbsoluteFill>
  );
};
