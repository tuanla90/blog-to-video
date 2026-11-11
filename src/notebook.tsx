// Lớp ghi chép vẽ lên một trang sổ (element `notepage`): nhãn có đường chỉ, ký hiệu bằng chứng vẽ tay,
// diagram khoa học, gạch bỏ rồi viết lại, tham chiếu chéo.
//
// Vì sao engine vẽ chứ không để ảnh sinh ra: nét nào MANG DỮ LIỆU (chiều mũi tên, độ dài thanh, vạch
// mốc, dấu trên bản đồ) mà để mô hình ảnh vẽ thì sai số, sai chữ, và đổi một con số là phải sinh lại
// cả trang. Ảnh chỉ mang hình vẽ, nền bản đồ và khoảng trống; phần đọc được đều nằm ở đây.
//
// Mọi toạ độ là toạ độ TRÊN ẢNH (0..1, gốc trên-trái), đo trên ảnh thật như toạ độ callout.
// Nét đều "run tay" theo random của remotion (có seed) nên render lại vẫn y hệt.
//
//   labels:      [{text, anchor:[x,y]?, at:[x,y], mark?, atWord|atSec}]
//   diagrams:    [{type: force|energy-bar|energy-flow|phase|field-map|day-timeline|life-timeline, ...}]
//   corrections: [{strike:[x0,y0,x1,y1], text, at:[x,y], atWord|atSec}]
//   crossrefs:   [{to: "page:14"|"species:venusaur"|"catalogue", at:[x,y], atWord|atSec}]
//   mark:        "catalogue" | "observation" | "hypothesis" — ký hiệu vẽ tay, không bao giờ là emoji
//
// Chữ: chuỗi, hoặc {vi, en, ...} — chọn theo CONFIG.text.lang (một video = một lớp chữ).
import React from "react";
import {useCurrentFrame, useVideoConfig, interpolate, random, delayRender, continueRender, staticFile} from "remotion";
import {loadFont as loadCaveat} from "@remotion/google-fonts/Caveat";
import {loadFont as loadNanumPen} from "@remotion/google-fonts/NanumPenScript";
import {loadFont as loadArchitects} from "@remotion/google-fonts/ArchitectsDaughter";
import {loadFont as loadReenie} from "@remotion/google-fonts/ReenieBeanie";
import {loadFont as loadKalam} from "@remotion/google-fonts/Kalam";
import {HAND} from "./ui";
import {CONFIG} from "./config";
import {PenBlock, PenCtx, usePenFont} from "./pen";

type Pt = [number, number];
type Rect = {left: number; top: number; w: number; h: number};
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

export const lang = () => (CONFIG as any).text?.lang || "vi";
export const pickText = (t: any): string => {
  if (t == null) return "";
  if (typeof t === "string") return t;
  return t[lang()] ?? t.vi ?? t.en ?? (Object.values(t)[0] as string) ?? "";
};
const WORDS: Record<string, Record<string, string>> = {
  vi: {page: "xem tr.", catalogue: "danh lục", unconfirmed: "chưa xác nhận"},
  en: {page: "see p.", catalogue: "catalogue", unconfirmed: "unconfirmed"},
};
const word = (k: string) => (WORDS[lang()] || WORDS.en)[k];

// ---- mực hoà vào giấy (tuỳ chọn, mặc định TẮT: render cũ không đổi) ----
// Bật bằng CONFIG.notebook.* hoặc prop của cảnh (prop thắng):
//   integrate: true | {blend:"multiply", rough:1.2, jitter:1, pressure:0.18, soft:10, double:0.5}
//   hand:      "Caveat" | "NanumPenScript" | "ArchitectsDaughter" | "ReenieBeanie" | "Kalam"  (font Google có sẵn)
//   handFile:  {family, url}  — font riêng nằm trong public/ của dự án (ví dụ font làm từ chữ tay thật)
//   stitch:    {grain:0.08, vignette:0.3}  — lớp khâu: hạt phim + vignette phủ cả ảnh lẫn chữ
// Vì sao: chữ font đặt thẳng lên ảnh trông như dán lên — mực phẳng, mép sắc, mọi chữ "a" giống hệt nhau.
export type Integ = {blend: string; rough: number; jitter: number; pressure: number; soft: number; double: number; fid: string};
export const IgCtx = React.createContext<Integ | null>(null);
export const FontCtx = React.createContext<string>(HAND);

const nbCfg = () => (CONFIG as any).notebook || {};
export const fidOf = (p: any) =>
  "nbInk" + Math.abs(Array.from(String(p?.src || "")).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36);
export const integ = (p: any): Integ | null => {
  const v = p?.integrate ?? nbCfg().integrate;
  if (!v) return null;
  const o = v === true ? {} : v;
  return {blend: o.blend ?? "multiply", rough: o.rough ?? 1.2, jitter: o.jitter ?? 1, pressure: o.pressure ?? 0.18,
    soft: o.soft ?? 10, double: o.double ?? 0.5, fid: fidOf(p)};
};

const GOOGLE_HANDS: Record<string, () => {fontFamily: string}> = {
  Caveat: () => loadCaveat("normal", {weights: ["400", "600"], subsets: ["latin"]}),
  NanumPenScript: () => loadNanumPen("normal", {weights: ["400"], subsets: ["latin"]}),
  ArchitectsDaughter: () => loadArchitects("normal", {weights: ["400"], subsets: ["latin"]}),
  ReenieBeanie: () => loadReenie("normal", {weights: ["400"], subsets: ["latin"]}),
  Kalam: () => loadKalam("normal", {weights: ["400"], subsets: ["latin"]}),
};
const handCache = new Map<string, string>();
export const handFamily = (p: any): string => {
  const file = p?.handFile ?? nbCfg().handFile, name = p?.hand ?? nbCfg().hand;
  const key = file ? `file:${file.url}` : name ? `g:${name}` : "";
  if (!key) return HAND;
  if (!handCache.has(key)) {
    if (file) {
      const fam = file.family || "NotebookHand", h = delayRender(`font ${file.url}`);
      new FontFace(fam, `url("${staticFile(file.url)}")`).load()
        .then((ff) => { (document as any).fonts.add(ff); continueRender(h); })
        .catch((e) => { console.error("handFile", e); continueRender(h); });
      handCache.set(key, `"${fam}", ${HAND}`);
    } else handCache.set(key, GOOGLE_HANDS[name] ? `${GOOGLE_HANDS[name]().fontFamily}, ${HAND}` : HAND);
  }
  return handCache.get(key)!;
};

// mép chữ nhám + đậm nhạt như bút đè không đều
export const InkDefs: React.FC<{ig: Integ | null}> = ({ig}) => !ig ? null :
  <svg width={0} height={0} style={{position: "absolute"}} aria-hidden>
    <defs>
      <filter id={ig.fid} x="-10%" y="-30%" width="120%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6 * ig.rough} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={3} result="p" />
        <feColorMatrix in="p" type="matrix" result="pa"
          values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-3 * ig.pressure} 0 0 0 ${1 + 1.2 * ig.pressure}`} />
        <feComposite in="d" in2="pa" operator="in" />
      </filter>
    </defs>
  </svg>;

export const inkLayer = (ig: Integ | null): React.CSSProperties =>
  ig ? {mixBlendMode: ig.blend as any, filter: `url(#${ig.fid})`} : {};
// hiện dần: mép mềm khi bật integrate, cắt thẳng như cũ khi tắt
export const reveal = (t: number, ig: Integ | null): React.CSSProperties => {
  if (!ig) return {clipPath: `inset(-0.5em ${(1 - t) * 100}% -0.5em -0.6em)`};
  const s = ig.soft, e = t * (100 + s) - s, m = `linear-gradient(90deg, #000 ${e}%, transparent ${e + s}%)`;
  return {WebkitMaskImage: m, maskImage: m} as any;
};
const graphemes = (s: string): string[] => {
  const S = (Intl as any).Segmenter;
  return S ? Array.from(new S(undefined, {granularity: "grapheme"}).segment(s), (x: any) => x.segment as string) : Array.from(s);
};
// Chữ viết tay từng chữ cái: bút đi tới đâu mực hiện tới đó, nên câu dài xuống dòng vẫn viết lần lượt từng
// dòng. t = tiến độ viết · st = tiến độ gạch bỏ · ut = tiến độ gạch chân (0..1). Gạch chạy theo từng từ và nối
// qua khoảng trắng, nên nét gạch đi đúng theo dòng chữ đã xuống dòng. Mỗi chữ cái lệch, xoay, đậm nhạt một chút.
export const InkString: React.FC<{text: string; seed: string; ig: Integ | null; t?: number; st?: number; ut?: number; color?: string}> =
({text, seed, ig, t = 1, st = 0, ut = 0, color = "currentColor"}) => {
  if (!ig) return <span style={st > 0 ? {textDecoration: "line-through"} : ut > 0 ? {textDecoration: "underline"} : undefined}>{text}</span>;
  const parts = text.split(/(\s+)/).filter((w) => w !== "");
  const lens = parts.map((w) => (/^\s+$/.test(w) ? 1 : graphemes(w).length));
  const N = Math.max(1, lens.reduce((a, b) => a + b, 0)), FADE = 2.5;   // FADE: số chữ cái "còn ướt mực" cùng lúc
  const deco = (k0: number, len: number, wseed: string): React.CSSProperties => {
    const bar = (p: number, y0: number, y1: number, jit: number): React.CSSProperties => {
      const q = Math.max(0, Math.min(1, (p * N - k0) / len));
      return q <= 0 ? {} : {backgroundImage: `linear-gradient(transparent ${y0 + jit}%, ${color} ${y0 + jit}%, ${color} ${y1 + jit}%, transparent ${y1 + jit}%)`,
        backgroundRepeat: "no-repeat", backgroundSize: `${q * 100}% 100%`};
    };
    const jit = (random(wseed + "j") - 0.5) * 6;
    return st > 0 ? bar(st, 52, 58, jit) : ut > 0 ? bar(ut, 86, 91, jit / 2) : {};
  };
  let gi = 0;
  return <>{parts.map((w, wi) => {
    const k0 = gi, len = lens[wi], ds = deco(k0, len, `${seed}-w${wi}`);
    if (/^\s+$/.test(w)) { gi += len; return <span key={wi} style={ds}>{w}</span>; }
    return <span key={wi} style={{whiteSpace: "nowrap", ...ds}}>{graphemes(w).map((g) => {
      const k = gi++, r = (n: number) => random(`${seed}-${k}-${n}`) - 0.5, j = ig.jitter;
      const wet = Math.max(0, Math.min(1, (t * (N + FADE) - k) / FADE));
      return <span key={k} style={{display: "inline-block", opacity: wet * (1 - Math.abs(r(5)) * ig.pressure * 1.6),
        transform: `translate(${r(1) * 0.03 * j}em, ${r(2) * 0.08 * j}em) rotate(${r(3) * 5 * j}deg) scale(${1 + r(4) * 0.07 * j})`}}>{g}</span>;
    })}</span>;
  })}</>;
};

// ---- mốc theo lời ----
const wordsOf = (lines: any[] | undefined) => (lines || []).flatMap((L: any) => L.words || []);
const leadFrames = (fps: number) => Math.round(((CONFIG as any).pacing?.leadIn ?? 0.4) * fps);
// mốc bắt đầu của {atSec | atWord (+nth)}; null nếu không tìm ra
export const frameAt = (m: any, lines: any[] | undefined, fps: number, from: number): number | null => {
  if (typeof m?.atSec === "number") return from + Math.round(m.atSec * fps);
  const words = wordsOf(lines);
  if (m?.atWord && words.length) {
    const key = String(m.atWord).toLowerCase();
    let n = m.nth ?? 1;
    for (const w of words) if (String(w.w).toLowerCase().includes(key) && --n === 0) return leadFrames(fps) + Math.round(w.s * fps);
  }
  return null;
};
// mốc KẾT THÚC của từ `key` đầu tiên sau khung `after` — để viết xong đúng lúc lời đọc tới đó
export const wordEnd = (key: string | undefined, lines: any[] | undefined, fps: number, after = 0): number | null => {
  if (!key) return null;
  const k = key.toLowerCase();
  for (const w of wordsOf(lines)) {
    const f = leadFrames(fps) + Math.round(w.e * fps);
    if (f > after && String(w.w).toLowerCase().includes(k)) return f;
  }
  return null;
};

// ---- mở lại một trang sổ ở cảnh sau ----
// Cảnh sau khai `reopen: <page>`: nhận lại ảnh và mọi dòng đã viết trên trang ấy (done: đã viết sẵn), rồi viết
// tiếp. `strikes: [{note|label: i, atSec|atWord, dur?}]` gạch một dòng CŨ (i = chỉ số trên trang cũ);
// `underlines` tương tự, để chốt kết luận. Chạy một lần ở makeRoot, theo thứ tự beat.
const LISTS = ["notes", "labels", "diagrams", "corrections", "crossrefs"];
export const resolvePages = (entry: any) => {
  const scenes = entry?.scenes || {};
  const order: string[] = [];
  for (const id of [...(entry?.beats || []).map((b: any) => b.id), "00", "short-outro"]) if (scenes[id] && !order.includes(id)) order.push(id);
  const pages = new Map<string, any>(), out: Record<string, any> = {};
  let touched = false;
  for (const id of order) {
    const beat = JSON.parse(JSON.stringify(scenes[id]));
    for (const m of beat.moments || []) (m.stack || []).forEach((el: any, k: number) => {
      if (!el || el.el !== "notepage") return;
      let cur = el;
      if (el.reopen != null && pages.has(String(el.reopen))) {
        touched = true;
        const prev = pages.get(String(el.reopen));
        const done = (arr: any[] = []) => arr.map((x) => ({...x, done: true,
          strike: x.strike ? {...x.strike, done: true} : undefined, underline: x.underline ? {...x.underline, done: true} : undefined}));
        cur = {...prev, ...el};
        for (const L of LISTS) cur[L] = [...done(prev[L]), ...(el[L] || [])];
        cur.scribbles = [...(prev.scribbles || []), ...(el.scribbles || [])];
        for (const [key, field] of [["strikes", "strike"], ["underlines", "underline"]] as const)
          for (const s of el[key] || []) {
            const L = s.note != null ? "notes" : s.label != null ? "labels" : null, i = s.note ?? s.label;
            if (L && cur[L][i]) cur[L][i] = {...cur[L][i], [field]: {atSec: s.atSec, atWord: s.atWord, nth: s.nth, dur: s.dur}};
          }
        delete cur.reopen; delete cur.strikes; delete cur.underlines;
        m.stack[k] = cur;
      }
      if (cur.page != null) pages.set(String(cur.page), cur);
    });
    out[id] = beat;
  }
  return touched ? {...entry, scenes: {...scenes, ...out}} : entry;
};

// lớp khâu: hạt phim đổi từng khung + vignette ấm, phủ lên cả ảnh lẫn chữ
export const Stitch: React.FC<{cfg: any; f: number; id: string}> = ({cfg, f, id}) => {
  const grain = cfg?.grain ?? 0.08, vig = cfg?.vignette ?? 0.3;
  return <>
    {grain ? <svg style={{position: "absolute", left: 0, top: 0, width: "100%", height: "100%", mixBlendMode: "overlay",
      opacity: grain, pointerEvents: "none"}} aria-hidden>
      <filter id={`${id}-g`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 16} />
        <feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter={`url(#${id}-g)`} />
    </svg> : null}
    {vig ? <div style={{position: "absolute", inset: 0, pointerEvents: "none",
      background: `radial-gradient(ellipse at 50% 50%, rgba(40,26,12,0) 58%, rgba(40,26,12,${vig}) 100%)`}} /> : null}
  </>;
};

// cỡ chữ tối thiểu (px ở khung 1080): chữ trên sổ phải đọc được cả ở bản dọc 9:16
export const minPx = (W: number, H: number, kind: "body" | "label") => {
  const s = Math.min(W, H) / 1080, portrait = H > W;
  return (kind === "body" ? (portrait ? 44 : 34) : (portrait ? 34 : 26)) * s;
};

// ---- mốc thời gian: theo từ trong giọng đọc, theo giây, hoặc chia đều ----
export const startFrames = (items: any[], lines: any[] | undefined, fps: number, from: number, to: number) => {
  const words = (lines || []).flatMap((L: any) => L.words || []);
  const lead = Math.round(((CONFIG as any).pacing?.leadIn ?? 0.4) * fps);
  const span = Math.max(1, to - from);
  return items.map((it, i) => {
    if (typeof it.atSec === "number") return from + Math.round(it.atSec * fps);
    if (it.atWord && words.length) {
      const key = String(it.atWord).toLowerCase();
      let n = it.nth ?? 1;
      for (const w of words) {
        if (String(w.w).toLowerCase().includes(key) && --n === 0) return lead + Math.round(w.s * fps);
      }
    }
    return from + Math.round((span * (i + 0.6)) / (items.length + 1));
  });
};

// ---- nét run tay ----
const rough = (pts: Pt[], seed: string, amp: number): Pt[] => {
  const out: Pt[] = [];
  pts.forEach((p, i) => {
    if (i === 0) { out.push(p); return; }
    const [x0, y0] = pts[i - 1], [x1, y1] = p;
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(len / 18));
    const nx = -(y1 - y0) / (len || 1), ny = (x1 - x0) / (len || 1);
    for (let k = 1; k <= n; k++) {
      const t = k / n, j = k === n ? 0 : (random(`${seed}-${i}-${k}`) - 0.5) * amp;
      out.push([x0 + (x1 - x0) * t + nx * j, y0 + (y1 - y0) * t + ny * j]);
    }
  });
  return out;
};
const plen = (pts: Pt[]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
const d = (pts: Pt[]) => "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
const along = (pts: Pt[], t: number): Pt => {
  const L = plen(pts) * t;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + seg >= L) {
      const u = (L - acc) / (seg || 1);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u];
    }
    acc += seg;
  }
  return pts[pts.length - 1];
};

// một nét mực vẽ dần: t = 0..1
const Ink: React.FC<{pts: Pt[]; t: number; color: string; width: number; seed: string; amp?: number; dash?: string}> =
({pts, t, color, width, seed, amp = 2.2, dash}) => {
  const ig = React.useContext(IgCtx), k = ig ? ig.rough : 1;
  const r = rough(pts, seed, amp * k), L = plen(r);
  if (t <= 0) return null;
  const one = (rr: Pt[], LL: number, w: number, op: number, key?: string) =>
    <path key={key} d={d(rr)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={dash || `${LL} ${LL}`} strokeDashoffset={dash ? 0 : LL * (1 - t)} opacity={(dash ? t : 1) * op} />;
  if (!ig || !ig.double) return one(r, L, width, 1);
  // nét đôi kiểu bút chì: nét thứ hai mảnh, lệch hơn, nhạt hơn
  const r2 = rough(pts, seed + "2", amp * k * 1.5), L2 = plen(r2);
  return <g>{one(r, L, width, 1, "a")}{one(r2, L2, width * 0.6, ig.double, "b")}</g>;
};
const Arrow: React.FC<{a: Pt; b: Pt; t: number; color: string; width: number; seed: string; head?: number}> =
({a, b, t, color, width, seed, head = 14}) => {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const h1: Pt = [b[0] - head * Math.cos(ang - 0.45), b[1] - head * Math.sin(ang - 0.45)];
  const h2: Pt = [b[0] - head * Math.cos(ang + 0.45), b[1] - head * Math.sin(ang + 0.45)];
  const th = interpolate(t, [0.8, 1], [0, 1], clamp);
  return <g>
    <Ink pts={[a, b]} t={Math.min(1, t / 0.8)} color={color} width={width} seed={seed} />
    <Ink pts={[h1, b, h2]} t={th} color={color} width={width} seed={seed + "h"} amp={0.8} />
  </g>;
};

// ---- ký hiệu bằng chứng vẽ tay (sách · mắt · bình thí nghiệm) ----
// `at`: vẽ thành nhóm SVG tại toạ độ ấy (dùng trong khối chữ viết theo nét) thay vì một <svg> nằm trong dòng chữ
export const Mark: React.FC<{kind?: string; size: number; color: string; seed: string; at?: Pt}> = ({kind, size, color, seed, at}) => {
  if (!kind) return null;
  const s = size / 10, sw = Math.max(1.2, size / 9);
  const P = (pts: Pt[]) => <Ink pts={pts.map(([x, y]) => [x * s, y * s] as Pt)} t={1} color={color} width={sw} seed={seed} amp={0.6} />;
  const Wrap = (c: {children: React.ReactNode}) => at ? <g transform={`translate(${at[0]} ${at[1]})`}>{c.children}</g>
    : <svg width={size * 1.1} height={size} style={{display: "inline-block", verticalAlign: "-0.12em", marginRight: size * 0.3, overflow: "visible"}}>{c.children}</svg>;
  return <Wrap>
    {kind === "catalogue" ? <>{P([[0, 2], [5, 1], [5, 9], [0, 10], [0, 2]])}{P([[10, 2], [5, 1], [5, 9], [10, 10], [10, 2]])}</>
      : kind === "observation" ? <>{P([[0, 5], [3, 2], [7, 2], [10, 5], [7, 8], [3, 8], [0, 5]])}
          <circle cx={5 * s} cy={5 * s} r={1.4 * s} fill={color} /></>
      : kind === "hypothesis" ? <>{P([[3.5, 0], [6.5, 0]])}{P([[4, 0], [4, 4], [1, 10], [9, 10], [6, 4], [6, 0]])}{P([[2.5, 7], [7.5, 7]])}</>
      : null}
  </Wrap>;
};
const q = (t: string, mark?: string) => (mark === "hypothesis" && !/\(\?\)\s*$/.test(t) ? `${t} (?)` : t);

// chữ viết tay hiện dần (mực chạy từ trái sang phải)
const Hand: React.FC<{x: number; y: number; t: number; size: number; color: string; caps?: boolean; mark?: string;
  w?: number; align?: string; seed: string; st?: number; ut?: number; children: string}> =
({x, y, t, size, color, caps, mark, w, align = "left", seed, st = 0, ut = 0, children}) => {
  const ig = React.useContext(IgCtx), fam = React.useContext(FontCtx), pen = React.useContext(PenCtx);
  if (t <= 0) return null;
  const tilt = (random(seed) - 0.5) * 2.2;
  // có xương chữ (notebook.pen): chữ lộ dần dọc theo đường bút, đầu bút chì đi theo ngòi
  if (ig && pen) {
    const ms = size * 0.85;
    return <PenBlock text={caps ? children.toUpperCase() : children} font={pen.font} size={size} maxW={w} lh={1.22}
      spacing={caps ? size * 0.06 : 0} align={align} color={color} fam={fam} t={t} st={st} ut={ut} seed={seed} jitter={ig.jitter}
      pos={{position: "absolute", left: x, top: y,
        transform: `translate(${align === "right" ? "-100%" : align === "center" ? "-50%" : "0"}, -50%) rotate(${tilt}deg)`}}
      ink={inkLayer(ig)} pencil={pen.pencil} wob={pen.wob} indent={mark ? ms * 1.4 : 0}
      prefix={mark ? (b) => <Mark kind={mark} size={ms} color={color} seed={seed + "m"} at={[0, b - ms * 0.92]} /> : undefined} />;
  }
  // bật integrate: viết từng chữ cái (InkString), không cần mask; tắt: cắt thẳng từ trái sang như cũ
  return <div style={{position: "absolute", left: x, top: y, width: w, fontFamily: fam, fontSize: size, lineHeight: 1.22,
    color, letterSpacing: caps ? "0.06em" : undefined, textTransform: caps ? "uppercase" : undefined, textAlign: align as any,
    transform: `translate(${align === "right" ? "-100%" : align === "center" ? "-50%" : "0"}, -50%) rotate(${tilt}deg)`,
    ...(ig ? inkLayer(ig) : reveal(t, null)), whiteSpace: w ? "pre-wrap" : "nowrap"}}>
    <Mark kind={mark} size={size * 0.85} color={color} seed={seed + "m"} />
    <InkString text={children} seed={seed} ig={ig} t={t} st={st} ut={ut} color={color} />
  </div>;
};

// ---- diagram ----
const box = (r: any, R: Rect) => ({x0: r[0] * R.w, y0: r[1] * R.h, x1: r[2] * R.w, y1: r[3] * R.h});
const hhmm = (s: string) => { const [h, m] = String(s).split(":").map(Number); return h * 60 + (m || 0); };

const Diagram: React.FC<{g: any; R: Rect; t: number; ink: string; acc: string; sw: number; fs: number; seed: string}> =
({g, R, t, ink, acc, sw, fs, seed}) => {
  const X = (p: Pt): Pt => [p[0] * R.w, p[1] * R.h];
  const svg: React.ReactNode[] = [], txt: React.ReactNode[] = [];
  const T = (key: string, x: number, y: number, s: string, tt: number, o: any = {}) =>
    txt.push(<Hand key={key} x={x} y={y} t={tt} size={o.size ?? fs} color={o.color ?? ink} caps={o.caps} mark={o.mark}
      align={o.align} seed={seed + key}>{s}</Hand>);
  // phần thứ i trong n phần: phần cuối phải xong đúng lúc t = 1 (trước đây nó mới tới ~70% thì hết giờ)
  const step = (i: number, n: number) => interpolate(t, [i / (n + 1), Math.min(1, (i + 1.4) / (n + 1))], [0, 1], clamp);

  if (g.type === "force") {
    const a = X(g.from), ang = ((g.angle ?? 0) * Math.PI) / 180, L = (g.length ?? 0.12) * R.w;
    const b: Pt = [a[0] + Math.cos(ang) * L, a[1] + Math.sin(ang) * L];
    svg.push(<Arrow key="f" a={a} b={b} t={step(0, 1)} color={ink} width={sw * 1.3} seed={seed} head={fs * 0.55} />);
    const lbl = [pickText(g.label), g.value ? q(pickText(g.value), g.mark) : ""].filter(Boolean).join(" · ");
    T("v", b[0] + fs * 0.4, b[1], lbl, step(1, 1), {caps: true, mark: g.mark});
  } else if (g.type === "energy-bar") {
    const {x0, y0, x1, y1} = box(g.region, R), bars = g.bars || [];
    const max = Math.max(...bars.map((b: any) => b.value || 0), 1), rowH = (y1 - y0) / Math.max(1, bars.length);
    bars.forEach((b: any, i: number) => {
      const tt = step(i, bars.length), yT = y0 + rowH * i, bx = x0, bw = (x1 - x0) * 0.72, by = yT + rowH * 0.45, bh = rowH * 0.32;
      T(`l${i}`, bx, yT + rowH * 0.2, pickText(b.label), tt, {caps: true, size: fs * 0.85});
      svg.push(<Ink key={`o${i}`} pts={[[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh], [bx, by]]} t={tt} color={ink} width={sw} seed={`${seed}o${i}`} />);
      const fw = bw * ((b.value || 0) / max) * interpolate(tt, [0.4, 1], [0, 1], clamp);
      for (let k = 0; k * sw * 3.2 < fw; k++) {
        const x = bx + k * sw * 3.2;
        svg.push(<Ink key={`h${i}-${k}`} pts={[[x, by + bh], [Math.min(bx + fw, x + bh * 0.6), by]]} t={1} color={acc} width={sw * 0.8} seed={`${seed}h${i}${k}`} amp={0.5} />);
      }
      const val = b.text ? pickText(b.text) : b.value != null ? `~${b.value}${g.unit ? " " + g.unit : ""}` : "";
      if (val) T(`v${i}`, bx + bw + fs * 0.5, by + bh / 2, q(val, b.mark || g.mark), tt, {mark: b.mark || g.mark});
    });
  } else if (g.type === "energy-flow") {
    const pts = (g.path || []).map(X);
    const tt = step(0, 1);
    svg.push(<Ink key="p" pts={pts} t={tt} color={acc} width={sw * 1.6} seed={seed} amp={1.4} />);
    if (tt >= 1) {
      const f = (g._f ?? 0);
      [0, 0.33, 0.66].forEach((o, k) => {
        const p = along(pts, (f * 0.012 + o) % 1);
        svg.push(<circle key={`d${k}`} cx={p[0]} cy={p[1]} r={sw * 1.3} fill={acc} />);
      });
    }
    if (g.label && pts.length) { const e = pts[pts.length - 1]; T("l", e[0] + fs * 0.4, e[1], pickText(g.label), step(1, 1), {caps: true, color: acc, mark: g.mark}); }
  } else if (g.type === "phase") {
    const {x0, y0, x1, y1} = box(g.region, R), st = g.states || [], n = st.length || 1;
    const cw = (x1 - x0) / n, bw = cw * 0.7, bh = Math.min((y1 - y0) * 0.6, fs * 2.4), cy = (y0 + y1) / 2;
    const cx = (i: number) => x0 + cw * (i + 0.5);
    st.forEach((s: any, i: number) => {
      const tt = step(i, n), l = cx(i) - bw / 2, r = cx(i) + bw / 2;
      svg.push(<Ink key={`b${i}`} pts={[[l, cy - bh / 2], [r, cy - bh / 2], [r, cy + bh / 2], [l, cy + bh / 2], [l, cy - bh / 2]]} t={tt} color={ink} width={sw} seed={`${seed}b${i}`} />);
      T(`s${i}`, cx(i), cy, pickText(s), tt, {caps: true, align: "center", size: fs * 0.8});
    });
    (g.arrows || []).forEach(([i, j]: [number, number], k: number) => {
      const dir = j > i ? 1 : -1;
      svg.push(<Arrow key={`a${k}`} a={[cx(i) + dir * bw / 2 + dir * 4, cy]} b={[cx(j) - dir * bw / 2 - dir * 4, cy]} t={step(Math.max(i, j), n)} color={acc} width={sw} seed={`${seed}a${k}`} head={fs * 0.45} />);
    });
  } else if (g.type === "field-map") {
    (g.marks || []).forEach((m: any, i: number) => {
      const tt = step(i, (g.marks || []).length), [x, y] = X(m.at), r = fs * 0.35;
      if (m.kind === "rest") svg.push(<g key={`m${i}`} opacity={tt}><circle cx={x} cy={y} r={r} fill="none" stroke={ink} strokeWidth={sw} /><circle cx={x} cy={y} r={sw} fill={ink} /></g>);
      else if (m.kind === "track") svg.push(<g key={`m${i}`} opacity={tt}>{[[-1, 0], [0, -1.1], [1, 0]].map(([dx, dy], k) => <circle key={k} cx={x + dx * r * 0.8} cy={y + dy * r * 0.8} r={r * 0.28} fill={ink} />)}</g>);
      else svg.push(<Ink key={`m${i}`} pts={[[x, y - r], [x + r, y + r * 0.7], [x - r, y + r * 0.7], [x, y - r]]} t={tt} color={acc} width={sw} seed={`${seed}m${i}`} />);
      if (m.t) T(`t${i}`, x + r * 1.6, y, pickText(m.t), tt, {size: fs * 0.8});
    });
  } else if (g.type === "day-timeline" || g.type === "life-timeline") {
    const {x0, y0, x1, y1} = box(g.region, R), ym = (y0 + y1) / 2, tick = fs * 0.35;
    svg.push(<Ink key="ax" pts={[[x0, ym], [x1, ym]]} t={step(0, 3)} color={ink} width={sw} seed={seed + "ax"} />);
    if (g.type === "day-timeline") {
      const a = hhmm(g.from || "00:00"), b = hhmm(g.to || "24:00"), ev = g.events || [];
      T("f", x0, ym + fs * 0.9, g.from || "", step(0, 3), {size: fs * 0.75});
      T("t", x1, ym + fs * 0.9, g.to || "", step(0, 3), {size: fs * 0.75, align: "right"});
      ev.forEach((e: any, i: number) => {
        const x = x0 + (x1 - x0) * ((hhmm(e.t) - a) / Math.max(1, b - a)), tt = step(i + 1, ev.length + 1), up = i % 2 === 0;
        svg.push(<Ink key={`e${i}`} pts={[[x, ym - tick], [x, ym + tick]]} t={tt} color={acc} width={sw * 1.2} seed={`${seed}e${i}`} amp={0.5} />);
        T(`el${i}`, x, ym + (up ? -1 : 1) * fs * 1.0, `${e.t} ${pickText(e.label)}`.trim(), tt, {caps: true, size: fs * 0.75, align: "center", mark: e.mark});
      });
    } else {
      const st = g.stages || [], n = st.length || 1;
      st.forEach((s: any, i: number) => {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / n, tt = step(i + 1, n + 1);
        svg.push(<Ink key={`s${i}`} pts={[[x, ym - tick], [x, ym + tick]]} t={tt} color={ink} width={sw} seed={`${seed}s${i}`} amp={0.5} />);
        T(`sl${i}`, x, ym + fs * 1.0, pickText(s), tt, {caps: true, size: fs * 0.75, align: "center"});
      });
      if (g.threshold) {
        const x = x0 + (x1 - x0) * (g.threshold.at ?? 0.5), tt = step(n + 1, n + 1);
        svg.push(<Ink key="th" pts={[[x, y0], [x, y1]]} t={tt} color={acc} width={sw * 1.2} seed={seed + "th"} dash={`${sw * 3} ${sw * 3}`} />);
        T("thl", x, y0 - fs * 0.2, pickText(g.threshold.label), tt, {caps: true, size: fs * 0.75, align: "center", color: acc, mark: g.threshold.mark});
      }
    }
  }
  const ig = React.useContext(IgCtx);
  return <>{svg.length ? <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible", ...inkLayer(ig)}} width={R.w} height={R.h}>{svg}</svg> : null}{txt}</>;
};

// ---- lớp ghi chép trên trang ----
export const NotebookLayer: React.FC<{p: any; R: Rect; from: number; to: number; v: number; lines?: any[]}> =
({p, R, from, to, v, lines}) => {
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const nb = (CONFIG as any).notebook || {};
  const ink = p.ink || nb.ink || "#2c3742", acc = p.accentInk || nb.accent || "#1f8fae";
  const ig = integ(p), fam = handFamily(p);
  const penCfg = p.pen ?? nb.pen, penFont = usePenFont(penCfg);
  const penVal = ig && penFont && penCfg !== false ? {font: penFont, pencil: penCfg?.pencil !== false, wob: Math.sin(f / 7)} : null;
  // viết theo tốc độ tay (chữ/giây) khi bật integrate; chỉ dẫn gạch bỏ / gạch chân chạy theo mốc riêng
  const cps = p.cps ?? nb.cps ?? 12;
  const writeDur = (txt: string) => (ig ? Math.max(WRITE, Math.round((txt.length / cps) * fps)) : WRITE);
  const markProg = (m: any) => {
    if (!m) return 0;
    if (m.done) return 1;
    const s0 = frameAt(m, lines, fps, from);
    return s0 == null ? 0 : interpolate(f, [s0, s0 + Math.round((m.dur ?? 0.6) * fps)], [0, 1], clamp);
  };
  const fs = Math.max((p.labelSize ?? 2.4) * v, minPx(W, H, "label"));
  const sw = Math.max(1.6, fs * 0.09);
  const WRITE = Math.max(6, Math.round((p.writeSec ?? 0.5) * fps));

  const labels: any[] = p.labels || [], diagrams: any[] = p.diagrams || [];
  const corrections: any[] = p.corrections || [], crossrefs: any[] = p.crossrefs || [];
  const all = [...labels, ...diagrams, ...corrections, ...crossrefs];
  const at = startFrames(all, lines, fps, from, to);
  let k = 0;
  const next = () => at[k++];
  const prog = (s: number, dur = WRITE) => interpolate(f, [s, s + dur], [0, 1], clamp);
  const X = (p0: Pt): Pt => [p0[0] * R.w, p0[1] * R.h];
  const svg: React.ReactNode[] = [], html: React.ReactNode[] = [];

  labels.forEach((lb, i) => {
    const s = next(), [x, y] = X(lb.at);
    const text = q(pickText(lb.text), lb.mark), dl = writeDur(text);
    const t = lb.done ? 1 : prog(s, dl), tc = lb.done ? 1 : prog(s + Math.round(dl * 0.6));
    if (lb.anchor) {
      const [ax, ay] = X(lb.anchor), est = text.length * fs * 0.62 + (lb.mark ? fs : 0);
      const sx = ax < x ? x - fs * 0.3 : x + est + fs * 0.3;
      svg.push(<Ink key={`c${i}`} pts={[[sx, y], [ax, ay]]} t={tc} color={p.connectorInk || ink} width={sw} seed={`${p.src}-c${i}`} />);
      if (tc >= 1) svg.push(<circle key={`cd${i}`} cx={ax} cy={ay} r={sw * 1.6} fill={ink} />);
    }
    html.push(<Hand key={`l${i}`} x={x} y={y} t={t} size={fs} color={ink} caps mark={lb.mark} seed={`${p.src}-l${i}`}
      st={markProg(lb.strike)} ut={markProg(lb.underline)}>{text}</Hand>);
  });
  diagrams.forEach((g, i) => {
    const s = next(), dur = Math.round((g.drawSec ?? 1.6) * fps);
    html.push(<Diagram key={`g${i}`} g={{...g, _f: g.done ? 999 : Math.max(0, f - s)}} R={R} t={g.done ? 1 : prog(s, dur)} ink={ink} acc={acc} sw={sw} fs={fs} seed={`${p.src}-g${i}`} />);
  });
  corrections.forEach((c, i) => {
    const s = next(), t1 = c.done ? 1 : prog(s, Math.round(WRITE * 0.8)), t2 = c.done ? 1 : prog(s + Math.round(WRITE * 1.2));
    if (c.strike) {
      const {x0, y0, x1, y1} = box(c.strike, R), n = Math.max(2, Math.round((y1 - y0) / (fs * 0.6)));
      const zig: Pt[] = [];
      for (let j = 0; j <= n; j++) zig.push([j % 2 ? x1 : x0, y0 + ((y1 - y0) * j) / n]);
      svg.push(<Ink key={`x${i}`} pts={zig} t={t1} color={c.ink || ink} width={sw * 1.4} seed={`${p.src}-x${i}`} amp={3} />);
    }
    if (c.text && c.at) {
      const [x, y] = X(c.at), size = Math.max((c.size ?? p.size ?? 3.2) * v, minPx(W, H, "body"));
      html.push(<Hand key={`r${i}`} x={x} y={y} t={t2} size={size} color={c.ink || ink} mark={c.mark} w={c.w ? c.w * R.w : undefined} seed={`${p.src}-r${i}`}>{q(pickText(c.text), c.mark)}</Hand>);
    }
  });
  // chữ nền: dòng nguệch ngoạc KHÔNG đọc được, có sẵn trên trang từ trước (ghi chú cũ) — cho trang có mật độ
  //   scribbles: [{region:[x0,y0,x1,y1], lines?, size?, opacity?, strike?:[chỉ số dòng bị gạch]}]
  (p.scribbles || []).forEach((sc: any, i: number) => {
    const {x0, y0, x1, y1} = box(sc.region, R), h = (sc.size ?? 0.8) * fs, n = sc.lines ?? Math.max(1, Math.floor((y1 - y0) / (h * 1.9)));
    for (let li = 0; li < n; li++) {
      const y = y0 + h * 1.2 + li * h * 1.9, seed = `${p.src}-sc${i}-${li}`;
      let x = x0 + (li === 0 ? 0 : random(seed + "in") * h), wi = 0;
      while (x < x1 - h) {
        const end = Math.min(x1, x + h * (1.2 + random(`${seed}-w${wi}`) * 3.2)), pts: Pt[] = [];
        for (let xx = x, kk = 0; xx <= end; xx += h * 0.28, kk++) {
          const rr = random(`${seed}-${wi}-${kk}`), tall = rr > 0.86 ? 1.5 : 0.55 + rr * 0.4;
          pts.push([xx, y - (kk % 2 ? tall * h * 0.9 : 0.05 * h)]);
        }
        if (pts.length > 1) svg.push(<g key={`sc${i}-${li}-${wi}`} opacity={sc.opacity ?? 0.45}>
          <Ink pts={pts} t={1} color={ink} width={sw * 0.55} seed={`${seed}-${wi}`} amp={0.6} /></g>);
        x = end + h * (0.6 + random(`${seed}-g${wi}`) * 0.5); wi++;
      }
      if ((sc.strike || []).includes(li)) svg.push(<g key={`scx${i}-${li}`} opacity={(sc.opacity ?? 0.45) + 0.2}>
        <Ink pts={[[x0 - h * 0.2, y - h * 0.45], [x1, y - h * 0.4]]} t={1} color={ink} width={sw * 0.9} seed={seed + "x"} amp={2} /></g>);
    }
  });
  crossrefs.forEach((c, i) => {
    const s = next(), [x, y] = X(c.at), to0 = String(c.to || "");
    const txt = to0.startsWith("page:") ? `→ ${word("page")} ${to0.slice(5)}`
      : to0.startsWith("species:") ? `→ ${to0.slice(8).replace(/(^|-)(\w)/g, (_m, a, b) => (a ? " " : "") + b.toUpperCase())}`
      : word("catalogue");
    html.push(<Hand key={`x${i}`} x={x} y={y} t={c.done ? 1 : prog(s)} size={fs} color={ink} mark={to0 === "catalogue" ? "catalogue" : undefined} seed={`${p.src}-r${i}`}>{txt}</Hand>);
  });

  const debug = p.debug ? <svg style={{position: "absolute", left: 0, top: 0}} width={R.w} height={R.h}>
    {Array.from({length: 9}, (_, i) => <g key={i}>
      <line x1={(R.w * (i + 1)) / 10} y1={0} x2={(R.w * (i + 1)) / 10} y2={R.h} stroke="#f0f" strokeWidth={1} opacity={0.35} />
      <line x1={0} y1={(R.h * (i + 1)) / 10} x2={R.w} y2={(R.h * (i + 1)) / 10} stroke="#f0f" strokeWidth={1} opacity={0.35} />
    </g>)}
    {(p.keepout || []).map((kb: number[], i: number) => <rect key={`k${i}`} x={kb[0] * R.w} y={kb[1] * R.h} width={(kb[2] - kb[0]) * R.w}
      height={(kb[3] - kb[1]) * R.h} fill="#f003" stroke="#f00" strokeDasharray="8 6" />)}
  </svg> : null;

  return <IgCtx.Provider value={ig}><FontCtx.Provider value={fam}><PenCtx.Provider value={penVal}>
    <div style={{position: "absolute", left: R.left, top: R.top, width: R.w, height: R.h, pointerEvents: "none"}}>
      <InkDefs ig={ig} />
      {debug}
      <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible", ...inkLayer(ig)}} width={R.w} height={R.h}>{svg}</svg>
      {html}
    </div>
  </PenCtx.Provider></FontCtx.Provider></IgCtx.Provider>;
};
