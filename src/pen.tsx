// Chữ viết theo nét + đầu bút chì (tuỳ chọn, chỉ khi integrate đang bật).
//
// Cần dữ liệu "xương chữ" của font: mỗi chữ cái là vài nét (đường giữa nét bút), theo thứ tự viết, toạ độ theo em.
// Dự án tự sinh dữ liệu ấy từ ảnh render các chữ cái (rút xương ảnh), rồi khai:
//   notebook.pen = {data: <json> | url: "fonts/x.strokes.json", pencil?: true}
// Chữ hiện ra vẫn là ĐÚNG font đang dùng (<text>): xương chỉ làm mặt nạ lộ dần dọc theo đường bút, và chỉ
// đường cho đầu bút chì. Vì thế dáng chữ không đổi, chỉ cách chữ hiện ra đổi — từ "mờ dần" sang "đưa tay".
import React from "react";
import {random, delayRender, continueRender, staticFile} from "remotion";

export type Pt = [number, number];
export type PenGlyph = {adv: number; strokes: Pt[][]};
export type PenFont = {family: string; nib: number; nibMax?: number; space: number; glyphs: Record<string, PenGlyph>};
export const PenCtx = React.createContext<{font: PenFont; pencil: boolean; wob: number} | null>(null);

// dữ liệu xương chữ: nhúng thẳng (pen.data) hoặc tải từ public/ (pen.url, render chờ bằng delayRender)
const cache = new Map<string, PenFont | null>();
export const usePenFont = (pen: any): PenFont | null => {
  const url: string | null = pen && !pen.data && pen.url ? pen.url : null;
  const [, bump] = React.useState(0);
  React.useEffect(() => {
    if (!url || cache.has(url)) return;
    cache.set(url, null);
    const h = delayRender(`pen ${url}`);
    fetch(staticFile(url)).then((r) => r.json())
      .then((j) => { cache.set(url, j); bump((x) => x + 1); continueRender(h); })
      .catch((e) => { console.error("pen", e); continueRender(h); });
  }, [url]);
  if (!pen) return null;
  return pen.data || (url ? cache.get(url) || null : null);
};

const plen = (pts: Pt[]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
const along = (pts: Pt[], L: number): Pt => {
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
const graphemes = (s: string): string[] => {
  const S = (Intl as any).Segmenter;
  return S ? Array.from(new S(undefined, {granularity: "grapheme"}).segment(s), (x: any) => x.segment as string) : Array.from(s);
};
const safeId = (s: string) => "pn" + Math.abs(Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36);
const P = (pts: Pt[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

type G = {ch: string; x: number; base: number; strokes: Pt[][]; lens: number[]; tf: string; space: boolean};
type Seg = {kind: "ink" | "lift" | "fade"; g: number; k: number; len: number; a?: Pt; b?: Pt};
export type PenLayout = {W: number; H: number; glyphs: G[]; lines: {x0: number; x1: number; base: number}[]; segs: Seg[]; total: number};

// dàn chữ theo bề rộng từng chữ cái của font (không kerning), xuống dòng giữa các từ như trình duyệt
export const layoutPen = (text: string, font: PenFont, o: {size: number; maxW?: number; lh: number; spacing: number;
  align: string; indent: number; seed: string; jitter: number}): PenLayout => {
  const {size, lh, spacing, align, indent, seed, jitter} = o;
  const adv = (ch: string) => (font.glyphs[ch]?.adv ?? (/\s/.test(ch) ? font.space : 0.55)) * size + spacing;
  const width = (s: string) => graphemes(s).reduce((a, c) => a + adv(c), 0);
  const lines: {toks: string[]; w: number}[] = [{toks: [], w: indent}];
  for (const tk of text.split(/(\n|[^\S\n]+)/).filter((s) => s !== "")) {
    if (tk === "\n") { lines.push({toks: [], w: 0}); continue; }
    const cur = lines[lines.length - 1], sp = /^\s+$/.test(tk), tw = width(tk);
    if (!sp && o.maxW && cur.w + tw > o.maxW && cur.toks.some((t) => !/^\s+$/.test(t))) {
      while (cur.toks.length && /^\s+$/.test(cur.toks[cur.toks.length - 1])) cur.w -= width(cur.toks.pop()!);
      lines.push({toks: [tk], w: tw});
    } else if (!(sp && !cur.toks.length && lines.length > 1)) { cur.toks.push(tk); cur.w += tw; }
  }
  const LH = lh * size, W = Math.max(o.maxW ?? 0, ...lines.map((l) => l.w)), H = lines.length * LH;
  const glyphs: G[] = [], out: {x0: number; x1: number; base: number}[] = [];
  lines.forEach((ln, li) => {
    const base = li * LH + LH / 2 + size * 0.3;            // chân chữ: giữa dòng, hạ xuống nửa chiều cao chữ thường
    let x = (align === "right" ? W - ln.w : align === "center" ? (W - ln.w) / 2 : 0) + (li === 0 ? indent : 0);
    const x0 = x;
    for (const tk of ln.toks) for (const ch of graphemes(tk)) {
      const k = glyphs.length, r = (n: number) => random(`${seed}-${k}-${n}`) - 0.5, gx = x;
      const strokes = (font.glyphs[ch]?.strokes || []).map((s) => s.map(([sx, sy]) => [gx + sx * size, base + sy * size] as Pt));
      glyphs.push({ch, x: gx, base, strokes, lens: strokes.map(plen), space: /\s/.test(ch),
        tf: `translate(${(r(1) * 0.03 * jitter * size).toFixed(2)} ${(r(2) * 0.08 * jitter * size).toFixed(2)}) ` +
          `rotate(${(r(3) * 5 * jitter).toFixed(2)} ${(gx + adv(ch) / 2).toFixed(1)} ${(base - size * 0.3).toFixed(1)})`});
      x += adv(ch);
    }
    out.push({x0, x1: x, base});
  });
  // đường đi của ngòi bút: mực (dọc theo nét) xen với nhấc bút (bay sang nét kế); chữ không có xương thì hiện mờ
  const segs: Seg[] = [];
  let last: Pt | null = null;
  glyphs.forEach((g, gi) => {
    if (g.space) return;
    if (!g.strokes.length) {
      const c: Pt = [g.x + size * 0.25, g.base - size * 0.3];
      if (last) segs.push({kind: "lift", g: gi, k: -1, len: Math.hypot(c[0] - last[0], c[1] - last[1]) * 0.5 + size * 0.1, a: last, b: c});
      segs.push({kind: "fade", g: gi, k: -1, len: size * 0.45});
      last = c;
      return;
    }
    g.strokes.forEach((s, k) => {
      if (last) segs.push({kind: "lift", g: gi, k, len: Math.hypot(s[0][0] - last[0], s[0][1] - last[1]) * 0.5 + size * 0.1, a: last, b: s[0]});
      segs.push({kind: "ink", g: gi, k, len: Math.max(1, g.lens[k])});
      last = s[s.length - 1];
    });
  });
  return {W, H, glyphs, lines: out, segs, total: Math.max(1, segs.reduce((a, s) => a + s.len, 0))};
};

type PenState = {done: boolean[]; strokes: number[]; active: {g: number; k: number; part: number} | null;
  fade: {g: number; u: number} | null; tip: Pt | null; lift: number};
export const penAt = (L: PenLayout, t: number): PenState => {
  const st: PenState = {done: L.glyphs.map((g) => g.space), strokes: L.glyphs.map(() => 0), active: null, fade: null, tip: null, lift: 1};
  let s = Math.max(0, Math.min(1, t)) * L.total;
  for (const sg of L.segs) {
    if (s <= 0) break;
    const u = Math.min(1, s / sg.len), g = L.glyphs[sg.g];
    if (sg.kind === "ink") {
      const pts = g.strokes[sg.k];
      if (u >= 1) {
        st.strokes[sg.g] = sg.k + 1;
        if (sg.k === g.strokes.length - 1) st.done[sg.g] = true;
        st.tip = pts[pts.length - 1];
      } else { st.active = {g: sg.g, k: sg.k, part: u * sg.len}; st.tip = along(pts, u * sg.len); }
      st.lift = 0.15;
    } else if (sg.kind === "lift") {
      st.tip = [sg.a![0] + (sg.b![0] - sg.a![0]) * u, sg.a![1] + (sg.b![1] - sg.a![1]) * u];
      st.lift = 0.15 + 0.85 * Math.sin(Math.PI * u);
    } else {
      if (u >= 1) st.done[sg.g] = true; else st.fade = {g: sg.g, u};
      st.lift = 0.2;
    }
    s -= sg.len;
  }
  return st;
};

// gạch bỏ / gạch chân: một nét tay cho mỗi dòng chữ, các dòng nối nhau
const markLines = (L: PenLayout, kind: "strike" | "under", size: number, seed: string): Pt[][] =>
  L.lines.filter((l) => l.x1 - l.x0 > 1).map((l, i) => {
    const y = l.base + (kind === "strike" ? -size * 0.27 : size * 0.14), a = l.x0 - size * 0.06, b = l.x1 + size * 0.04;
    const n = Math.max(2, Math.round((b - a) / (size * 0.7)));
    return Array.from({length: n + 1}, (_, k) => [a + ((b - a) * k) / n, y + (random(`${seed}-${kind}-${i}-${k}`) - 0.5) * size * 0.07] as Pt);
  });
const partial = (lines: Pt[][], p: number) => {
  const lens = lines.map(plen), tot = lens.reduce((a, b) => a + b, 0) || 1;
  let s = Math.max(0, Math.min(1, p)) * tot, tip: Pt | null = null;
  const shown = lines.map((ln, i) => {
    const d = Math.max(0, Math.min(lens[i], s));
    s -= lens[i];
    if (d > 0) tip = along(ln, d);
    return d;
  });
  return {lens, shown, tip: tip as Pt | null};
};

// đầu bút chì vẽ tạm bằng SVG (thay bằng ảnh thật khi có): ngòi chì, phần gỗ gọt, thân sơn, bóng đổ nhấc theo bút
export const Pencil: React.FC<{tip: Pt; lift: number; size: number; opacity: number; id: string; wob: number}> =
({tip, lift, size, opacity, id, wob}) => {
  if (opacity <= 0.001) return null;
  const Wp = size * 0.55, gT = Wp * 0.6, wT = Wp * 1.4, Lp = size * 8.5;
  const ang = -57 + wob * 2 - lift * 3;                        // người thuận tay phải: thân bút chếch lên bên phải
  const sx = size * (0.18 + lift * 0.7), sy = size * (0.28 + lift * 1.1), blur = size * (0.1 + lift * 0.22);
  const body = (shade?: string) => <>
    <polygon points={`0,0 ${gT},${-Wp * 0.17} ${gT},${Wp * 0.17}`} fill={shade || "#2b2b2b"} />
    <polygon points={`${gT},${-Wp * 0.17} ${gT + wT},${-Wp / 2} ${gT + wT},${Wp / 2} ${gT},${Wp * 0.17}`} fill={shade || "#d9bb8f"} />
    {shade ? null : <polygon points={`${gT},0 ${gT + wT},0 ${gT + wT},${Wp / 2} ${gT},${Wp * 0.17}`} fill="#c29f70" />}
    <rect x={gT + wT} y={-Wp / 2} width={Lp - gT - wT} height={Wp} fill={shade || "#2e5a3b"} />
    {shade ? null : <>
      <rect x={gT + wT} y={-Wp / 2} width={Lp - gT - wT} height={Wp * 0.3} fill="#3f7650" />
      <rect x={gT + wT} y={Wp * 0.22} width={Lp - gT - wT} height={Wp * 0.28} fill="#22452e" /></>}
  </>;
  return <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none"}} aria-hidden>
    <defs>
      <filter id={`${id}-s`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation={blur} /></filter>
      <linearGradient id={`${id}-f`}><stop offset="0.55" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-Wp} y={-Wp} width={Lp + 2 * Wp} height={2 * Wp}>
        <rect x={0} y={-Wp} width={Lp} height={2 * Wp} fill={`url(#${id}-f)`} />
      </mask>
    </defs>
    <g opacity={opacity}>
      <g transform={`translate(${tip[0] + sx} ${tip[1] + sy}) rotate(${ang})`} opacity={0.32 - lift * 0.12}>
        <g filter={`url(#${id}-s)`} mask={`url(#${id}-m)`}>{body("#000")}</g></g>
      <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${ang})`} mask={`url(#${id}-m)`}>{body()}</g>
    </g>
  </svg>;
};

// Một khối chữ viết theo nét: lớp mực (hoà vào giấy) + lớp bút chì (không hoà), cùng vị trí và cùng transform.
// Hai lớp phải là anh em chứ không lồng nhau: lồng vào thì mix-blend của mực chỉ hoà trong khối, không hoà với giấy.
export const PenBlock: React.FC<{text: string; font: PenFont; size: number; maxW?: number; lh: number; spacing?: number;
  align?: string; color: string; fam: string; t: number; st?: number; ut?: number; seed: string; jitter?: number;
  pos: React.CSSProperties; ink: React.CSSProperties; indent?: number; prefix?: (base: number) => React.ReactNode;
  pencil?: boolean; wob?: number}> = (p) => {
  const {size, t, st = 0, ut = 0} = p;
  const L = layoutPen(p.text, p.font, {size, maxW: p.maxW, lh: p.lh, spacing: p.spacing ?? 0, align: p.align ?? "left",
    indent: p.indent ?? 0, seed: p.seed, jitter: p.jitter ?? 1});
  const S = penAt(L, t), id = safeId(p.seed);
  const maskW = (p.font.nibMax ?? p.font.nib) * size * 1.9 + 1.5, penW = p.font.nib * size;
  const sLines = st > 0 ? markLines(L, "strike", size, p.seed) : [], uLines = ut > 0 ? markLines(L, "under", size, p.seed) : [];
  const strike = st > 0 ? partial(sLines, st) : null, under = ut > 0 ? partial(uLines, ut) : null;
  const glyphs = L.glyphs.map((g, i) => {
    if (g.space) return null;
    const txt = (m?: string) => <text x={g.x} y={g.base} fill={p.color} mask={m} style={{fontFamily: p.fam, fontSize: size}}>{g.ch}</text>;
    if (S.done[i]) return <g key={i} transform={g.tf}>{txt()}</g>;
    if (S.fade?.g === i) return <g key={i} transform={g.tf} opacity={S.fade.u}>{txt()}</g>;
    const n = S.strokes[i], a = S.active?.g === i ? S.active : null;
    if (!n && !a) return null;
    const mid = `${id}-g${i}`;
    const sw = {fill: "none", stroke: "#fff", strokeWidth: maskW, strokeLinecap: "round" as const, strokeLinejoin: "round" as const};
    return <g key={i} transform={g.tf}>
      <mask id={mid} maskUnits="userSpaceOnUse" x={g.x - size} y={g.base - size * 1.5} width={size * 3} height={size * 2.6}>
        {g.strokes.slice(0, n).map((s, k) => <polyline key={k} points={P(s)} {...sw} />)}
        {a ? <polyline points={P(g.strokes[a.k])} {...sw}
          strokeDasharray={`${a.part.toFixed(1)} ${(g.lens[a.k] + maskW).toFixed(1)}`} /> : null}
      </mask>
      {txt(`url(#${mid})`)}
    </g>;
  });
  const bars = (m: ReturnType<typeof partial> | null, lines: Pt[][], key: string) => !m ? null : lines.map((ln, i) => m.shown[i] > 0 ?
    <polyline key={`${key}${i}`} points={P(ln)} fill="none" stroke={p.color} strokeWidth={penW * 0.9} strokeLinecap="round"
      strokeLinejoin="round" strokeDasharray={`${m.shown[i].toFixed(1)} ${(m.lens[i] + 1).toFixed(1)}`} /> : null);
  // đầu bút: đang gạch thì theo nét gạch, đang viết thì theo ngòi; hiện lên ở đầu, rút đi ở cuối
  let tip: Pt | null = null, lift = 0.15, on = 0;
  if (strike && st < 1) { tip = strike.tip; on = Math.min(1, st * 12, (1 - st) * 12); }
  else if (under && ut < 1) { tip = under.tip; on = Math.min(1, ut * 12, (1 - ut) * 12); }
  else if (t > 0 && t < 1) { tip = S.tip; lift = S.lift; on = Math.min(1, t * 25, (1 - t) * 18); }
  const box: React.CSSProperties = {...p.pos, width: L.W, height: L.H};
  return <>
    <div style={{...box, ...p.ink}}>
      <svg width={L.W} height={L.H} style={{overflow: "visible", display: "block"}}>
        {p.prefix ? p.prefix(L.lines[0]?.base ?? size) : null}
        {glyphs}
        {bars(strike, sLines, "s")}
        {bars(under, uLines, "u")}
      </svg>
    </div>
    {p.pencil && tip && on > 0 ? <div style={{...box, pointerEvents: "none"}}>
      <Pencil tip={tip} lift={lift} size={size} opacity={on} id={id} wob={p.wob ?? 0} /></div> : null}
  </>;
};
