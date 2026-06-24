import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from "remotion";
import {C, MONO, useVmin, useCount, Bg, FadeUp} from "./ui";

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
type Win = [number, number];

const useSteps = (weights: number[]): Win[] => {
  const {durationInFrames: D} = useVideoConfig();
  const tot = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0; const out: Win[] = [];
  for (const w of weights) {
    const a = acc / tot; acc += w;
    out.push([Math.round(D * a), Math.round(D * acc / tot)]);
  }
  return out;
};

const Moment: React.FC<{win: Win; children: React.ReactNode; style?: any}> = ({win, children, style}) => {
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
      filter: `blur(${bl}px)`, letterSpacing: "-0.015em", ...style}}>
      {children}
    </AbsoluteFill>
  );
};

const vnd = (n: number, unit = "tỷ") => `${n.toFixed(1).replace(".", ",")} ${unit}`;

const Card: React.FC<{label: string; value: string; color: string; sub?: string; v: number}> =
({label, value, color, sub, v}) => (
  <div style={{
    background: `linear-gradient(160deg, ${C.cardHi}, ${C.card})`,
    border: `1px solid ${C.border}`, borderRadius: 2.4 * v,
    padding: `${2.8 * v}px ${3.6 * v}px`, minWidth: 30 * v, position: "relative", overflow: "hidden",
    boxShadow: `0 ${1.8 * v}px ${4.5 * v}px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 ${6 * v}px ${color}24`}}>
    <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`}} />
    <div style={{color: C.muted, fontSize: 2 * v, fontWeight: 600, marginBottom: 1 * v, letterSpacing: "0.03em"}}>{label}</div>
    <div style={{fontFamily: MONO, fontSize: 7.5 * v, fontWeight: 800, color, lineHeight: 1,
      textShadow: `0 0 ${2.6 * v}px ${color}66`}}>{value}</div>
    {sub ? <div style={{color: C.muted, fontSize: 1.5 * v, marginTop: 1.2 * v}}>{sub}</div> : null}
  </div>
);

const Chip: React.FC<{t: string; color: string; v: number}> = ({t, color, v}) => (
  <div style={{border: `1.5px solid ${color}`, color, borderRadius: 100, padding: `${1.4 * v}px ${3 * v}px`,
    fontSize: 2.8 * v, fontWeight: 800, letterSpacing: 1, background: `linear-gradient(${color}22, ${color}0a)`,
    boxShadow: `0 0 ${3.6 * v}px ${color}55, inset 0 0 ${2 * v}px ${color}22`,
    textShadow: `0 0 ${1.4 * v}px ${color}66`}}>{t}</div>
);

const Big: React.FC<{v: number; size?: number; color?: string; children: React.ReactNode; style?: any}> =
({v, size = 5, color = C.text, children, style}) => (
  <div style={{fontSize: size * v, fontWeight: 800, color, lineHeight: 1.12, letterSpacing: "-0.022em", ...style}}>{children}</div>
);

const Label: React.FC<{v: number; children: React.ReactNode}> = ({v, children}) => (
  <div style={{fontFamily: MONO, color: C.muted, fontSize: 1.9 * v, letterSpacing: 4,
    fontWeight: 600, marginBottom: 3 * v}}>{children}</div>
);

// ---------- BEAT 00 — clash ----------
export const Scene00: React.FC = () => {
  const v = useVmin();
  const S = useSteps([28, 38, 15, 19]);
  const f = useCurrentFrame();
  const sales = useCount(S[1][0] + 6, 18, 0, 4.2);
  const ke = useCount(S[1][0] + 10, 18, 0, 3.8);
  const shake = interpolate(f, [S[2][0], S[2][0] + 4, S[2][0] + 9], [0, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <Bg label="SEMANTIX · DATA 101" />
      <Moment win={S[0]}>
        <Label v={v}>SÁNG THỨ HAI · GIAO BAN</Label>
        <Big v={v} size={5.4}>“Doanh thu tháng này<br />bao nhiêu?”</Big>
      </Moment>
      <Moment win={S[1]}>
        <div style={{display: "flex", gap: 5 * v, transform: `translateX(${shake * 5 - 2.5}px)`}}>
          <Card v={v} label="Sales" value={vnd(sales)} color={C.accent} />
          <Card v={v} label="Kế toán" value={vnd(ke)} color={C.warn} />
        </div>
        <FadeUp at={S[1][0] + 24} style={{color: C.muted, fontSize: 2.4 * v, marginTop: 4 * v}}>
          Cùng một công ty. Cùng một tháng.
        </FadeUp>
      </Moment>
      <Moment win={S[2]}>
        <Big v={v} size={11.5} color={C.bad} style={{letterSpacing: 2}}>AI SAI?</Big>
      </Moment>
      <Moment win={S[3]}>
        <Big v={v} size={8}>KHÔNG AI<br />SAI CẢ</Big>
        <FadeUp at={S[3][0] + 14} style={{color: C.muted, fontSize: 2.3 * v, marginTop: 3 * v}}>
          Cả ba đều đúng — theo định nghĩa của mình.
        </FadeUp>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 01 — concept / cube (KPI tách khỏi khối) ----------
const SlicesCube: React.FC<{v: number}> = ({v}) => {
  const f = useCurrentFrame();
  const ry = interpolate(f, [0, 200], [-22, 22]);
  const cols = [C.accent, C.good, C.warn];
  return (
    <div style={{perspective: 800, height: 34 * v, display: "flex", alignItems: "center"}}>
      <div style={{transformStyle: "preserve-3d", transform: `rotateX(-18deg) rotateY(${ry}deg)`}}>
        {cols.map((c, i) => (
          <div key={i} style={{position: "absolute", width: 22 * v, height: 22 * v, left: -11 * v, top: -11 * v,
            background: `${c}22`, border: `2px solid ${c}`, borderRadius: 2 * v,
            transform: `translateZ(${(i - 1) * 6 * v}px)`, boxShadow: `0 0 ${4 * v}px ${c}55`}} />
        ))}
      </div>
    </div>
  );
};
export const Scene01: React.FC = () => {
  const v = useVmin();
  const S = useSteps([28, 34, 38]);
  return (
    <AbsoluteFill>
      <Bg label="KHÁI NIỆM · RUBIK DỮ LIỆU" />
      <Moment win={S[0]}>
        <Big v={v} size={4.6} color={C.muted}>Hiếm khi là cộng sai.</Big>
        <Big v={v} size={5.2} style={{marginTop: 2 * v}}>Ba người gọi <span style={{color: C.accent}}>ba thứ khác nhau</span><br />bằng đúng một từ.</Big>
      </Moment>
      <Moment win={S[1]}>
        <div style={{display: "flex", gap: 3 * v, marginBottom: 6 * v}}>
          {[["METRIC", C.accent], ["DIMENSION", C.good], ["KPI", C.warn]].map(([t, c], i) => (
            <FadeUp key={t} at={S[1][0] + 6 + i * 6}><Chip t={t as string} color={c as string} v={v} /></FadeUp>
          ))}
        </div>
        <SlicesCube v={v} />
      </Moment>
      <Moment win={S[2]}>
        <div style={{display: "grid", gap: 2.4 * v, textAlign: "left", fontSize: 2.9 * v, fontWeight: 700}}>
          {[["Metric", C.accent, "con số trên mặt khối."],
            ["Dimension", C.good, "cách bạn xoay khối để nhìn."],
            ["KPI", C.warn, "không nằm trên khối — là cái đích phải chạm tới."]].map(([k, c, t], i) => (
            <FadeUp key={k as string} at={S[2][0] + 6 + i * 9}>
              <span style={{color: c as string, fontWeight: 800}}>{k}</span> — {t}
            </FadeUp>
          ))}
        </div>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 02 — metric: định nghĩa → chốt 3,8 ----------
export const Scene02: React.FC = () => {
  const v = useVmin();
  const S = useSteps([16, 10, 28, 22, 12, 16]);
  const traps = ["Đã chốt hay đã thu?", "Có trừ đơn hoàn?", "Có gồm phí ship?"];
  return (
    <AbsoluteFill>
      <Bg label="METRIC" />
      <Moment win={S[0]}>
        <Big v={v} size={5.2}><span style={{color: C.accent}}>Metric</span> = một con số đo được.</Big>
        <FadeUp at={S[0][0] + 12} style={{color: C.muted, fontSize: 2.4 * v, marginTop: 3 * v}}>Doanh thu · Số đơn · Khách mới</FadeUp>
      </Moment>
      <Moment win={S[1]}>
        <Big v={v} size={5.6}>Nhưng cái bẫy<br />nằm ngay đây.</Big>
      </Moment>
      <Moment win={S[2]}>
        <Big v={v} size={4.4} style={{marginBottom: 4 * v}}>“Doanh thu” — hỏi 5 người:</Big>
        <div style={{display: "grid", gap: 2 * v}}>
          {traps.map((t, i) => (
            <FadeUp key={i} at={S[2][0] + 12 + i * 10}
              style={{fontFamily: MONO, color: C.warn, fontSize: 2.8 * v, fontWeight: 700}}>{t}</FadeUp>
          ))}
        </div>
      </Moment>
      <Moment win={S[3]}>
        <div style={{display: "flex", gap: 5 * v}}>
          <Card v={v} label="Sales" value="4,2 tỷ" color={C.accent} sub="gồm ship · chưa trừ hoàn" />
          <Card v={v} label="Kế toán" value="3,8 tỷ" color={C.warn} sub="đã thu · trừ hoàn · không ship" />
        </div>
      </Moment>
      <Moment win={S[4]}>
        <Big v={v} size={5.2}>Hai <span style={{color: C.bad}}>định nghĩa</span> khác nhau —<br />chung một cái tên.</Big>
      </Moment>
      <Moment win={S[5]}>
        <Label v={v}>CHỐT MỘT ĐỊNH NGHĨA</Label>
        <Card v={v} label="Cả công ty đồng ý" value="3,8 tỷ" color={C.good} sub="đã thu · đã trừ hoàn" />
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 03 — dimension: CỘT NGÀY đổi số, rồi cắt theo kênh ----------
const DateCard: React.FC<{dept: string; col: string; month: string; color: string; v: number}> =
({dept, col, month, color, v}) => (
  <div style={{background: `linear-gradient(160deg, ${C.cardHi}, ${C.card})`, border: `1px solid ${C.border}`,
    borderRadius: 2 * v, padding: `${2 * v}px ${2.4 * v}px`, minWidth: 24 * v,
    boxShadow: `0 ${1.2 * v}px ${3 * v}px rgba(0,0,0,0.45), 0 0 ${4 * v}px ${color}22`}}>
    <div style={{color: C.text, fontSize: 2 * v, fontWeight: 700}}>{dept}</div>
    <div style={{color: C.muted, fontSize: 1.6 * v, marginBottom: 1.2 * v}}>theo {col}</div>
    <div style={{fontFamily: MONO, color, fontSize: 4.4 * v, fontWeight: 800,
      textShadow: `0 0 ${2 * v}px ${color}66`}}>{month}</div>
  </div>
);
const Bar: React.FC<{h: number; color: string; label: string; value: string; v: number}> =
({h, color, label, value, v}) => (
  <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end"}}>
    <div style={{fontFamily: MONO, color, fontSize: 2.3 * v, fontWeight: 800, marginBottom: 1 * v}}>{value}</div>
    <div style={{width: 9 * v, height: h, borderRadius: `${1 * v}px ${1 * v}px ${0.4 * v}px ${0.4 * v}px`,
      background: `linear-gradient(180deg, ${color}, ${color}aa)`,
      boxShadow: `0 0 ${3.4 * v}px ${color}77, inset 0 ${1.4 * v}px 0 rgba(255,255,255,0.2)`}} />
    <div style={{color: C.muted, fontSize: 1.9 * v, marginTop: 1.4 * v, fontWeight: 600}}>{label}</div>
  </div>
);
export const Scene03: React.FC = () => {
  const v = useVmin();
  const S = useSteps([13, 36, 16, 35]);
  const g = useCount(S[3][0] + 6, 22, 0, 1);
  return (
    <AbsoluteFill>
      <Bg label="DIMENSION" />
      <Moment win={S[0]}>
        <Big v={v} size={5.4}>Tưởng chốt định nghĩa<br />là xong? <span style={{color: C.warn}}>Chưa.</span></Big>
      </Moment>
      <Moment win={S[1]}>
        <FadeUp at={S[1][0] + 6}>
          <Chip t="CÙNG 1 ĐƠN — ĐỊNH NGHĨA Y HỆT" color={C.muted} v={v} />
        </FadeUp>
        <div style={{display: "flex", gap: 3 * v, marginTop: 4 * v}}>
          {[["Kinh doanh", "ngày tạo đơn", "Th5", C.accent],
            ["Kế toán", "ngày thanh toán", "Th6", C.good],
            ["Vận hành", "ngày giao xong", "Th7", C.warn]].map((r, i) => (
            <FadeUp key={i} at={S[1][0] + 14 + i * 9}>
              <DateCard dept={r[0]} col={r[1]} month={r[2]} color={r[3]} v={v} />
            </FadeUp>
          ))}
        </div>
        <FadeUp at={S[1][0] + 42} style={{color: C.muted, fontSize: 2.2 * v, marginTop: 4 * v}}>
          Cùng một đơn — rơi vào ba tháng khác nhau.
        </FadeUp>
      </Moment>
      <Moment win={S[2]}>
        <Big v={v} size={4.8}>Cột ngày bạn chọn <span style={{color: C.good}}>cũng là dimension</span>.<br /><span style={{color: C.bad}}>Và nó đổi cả con số.</span></Big>
      </Moment>
      <Moment win={S[3]}>
        <div style={{display: "flex", gap: 7 * v, alignItems: "flex-end"}}>
          <Bar h={(8 + 20 * g) * v} color={C.accent} label="Shopee" value="1,9" v={v} />
          <Bar h={(6 + 15 * g) * v} color={C.good} label="TikTok Shop" value="1,4" v={v} />
          <Bar h={(4 + 5 * g) * v} color={C.warn} label="KiotViet" value="0,5" v={v} />
        </div>
        <FadeUp at={S[3][0] + 30} style={{color: C.muted, fontSize: 2.1 * v, marginTop: 3.5 * v}}>
          Chốt cột ngày → cắt theo kênh → thành câu chuyện.
        </FadeUp>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 04 — KPI (dẫn liền mạch: đo đúng để làm gì → mục tiêu) ----------
export const Scene04: React.FC = () => {
  const v = useVmin();
  const S = useSteps([13, 18, 16, 26, 14, 13]);
  const pct = useCount(S[3][0] + 8, 26, 0, 95);
  const barH = useCount(S[3][0] + 8, 26, 2, 23);
  return (
    <AbsoluteFill>
      <Bg label="KPI" />
      <Moment win={S[0]}>
        <Big v={v} size={5}>Cả công ty cùng một số:<br /><span style={{color: C.good}}>3,8 tỷ</span>. Hết cãi.</Big>
      </Moment>
      <Moment win={S[1]}>
        <Big v={v} size={5}>Đo đúng rồi — để làm gì?</Big>
        <FadeUp at={S[1][0] + 14}><Big v={v} size={5.4} style={{marginTop: 2.5 * v}}>3,8 — <span style={{color: C.warn}}>tốt hay chưa?</span></Big></FadeUp>
      </Moment>
      <Moment win={S[2]}>
        <Big v={v} size={4.6} color={C.muted}>Một con số đứng một mình<br />không có tốt hay xấu.</Big>
        <FadeUp at={S[2][0] + 14}><Big v={v} size={4.8} style={{marginTop: 2.5 * v}}>Cần đặt cạnh <span style={{color: C.warn}}>một mục tiêu</span>.</Big></FadeUp>
      </Moment>
      <Moment win={S[3]}>
        <div style={{position: "relative", height: 30 * v, display: "flex", alignItems: "flex-end"}}>
          <div style={{position: "absolute", bottom: 26 * v, width: 34 * v, left: -6 * v,
            borderTop: `2px dashed ${C.good}`}} />
          <div style={{position: "absolute", bottom: 26.5 * v, right: -10 * v, color: C.good,
            fontSize: 2 * v, fontWeight: 700}}>Mục tiêu 4 tỷ</div>
          <div style={{width: 12 * v, height: barH * v, borderRadius: `${1 * v}px ${1 * v}px 0 0`,
            background: `linear-gradient(180deg, ${C.accent}, ${C.accent}aa)`,
            boxShadow: `0 0 ${3 * v}px ${C.accent}77, inset 0 ${1.4 * v}px 0 rgba(255,255,255,0.2)`}} />
        </div>
        <div style={{fontFamily: MONO, fontSize: 6 * v, fontWeight: 800, color: C.good, marginTop: 3 * v,
          textShadow: `0 0 ${2.4 * v}px ${C.good}66`}}>{Math.round(pct)}%</div>
        <div style={{color: C.muted, fontSize: 2.1 * v}}>KPI = số bạn phải ĐẠT, không phải số bạn đo.</div>
      </Moment>
      <Moment win={S[4]}>
        <div style={{display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1.4 * v, marginBottom: 4 * v}}>
          {Array.from({length: 30}).map((_, i) => {
            const keep = i % 5 === 0;
            return <div key={i} style={{width: 5 * v, height: 5 * v, borderRadius: 1 * v,
              background: keep ? C.warn : C.card, border: `1px solid ${keep ? C.warn : C.border}`,
              opacity: keep ? 1 : 0.25, boxShadow: keep ? `0 0 ${1.6 * v}px ${C.warn}66` : "none"}} />;
          })}
        </div>
        <Big v={v} size={4}>Chọn <span style={{color: C.warn}}>5–10 KPI</span> — không phải 30.</Big>
      </Moment>
      <Moment win={S[5]}>
        <Big v={v} size={4.8}>Mọi thứ đều then chốt<br />= <span style={{color: C.bad}}>không gì then chốt.</span></Big>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 05 — replay (dimension = CỘT NGÀY) ----------
export const Scene05: React.FC = () => {
  const v = useVmin();
  const S = useSteps([20, 50, 30]);
  const rows = [
    {n: "1", tag: "METRIC", color: C.accent, t: "chưa có một định nghĩa chung"},
    {n: "2", tag: "DIMENSION", color: C.good, t: "mỗi phòng chọn một cột ngày khác"},
    {n: "3", tag: "KPI", color: C.warn, t: "không ai chốt mục tiêu để đối chiếu"},
  ];
  return (
    <AbsoluteFill>
      <Bg label="ĐỌC LẠI CUỘC CÃI VÃ" />
      <Moment win={S[0]}>
        <Big v={v} size={5.2}>Cùng một cuộc cãi —<br />đọc lại bằng <span style={{color: C.accent}}>ba từ</span>.</Big>
      </Moment>
      <Moment win={S[1]}>
        <div style={{display: "grid", gap: 3 * v, textAlign: "left"}}>
          {rows.map((r, i) => (
            <FadeUp key={i} at={S[1][0] + 8 + i * 14} style={{display: "flex", alignItems: "center", gap: 3 * v}}>
              <div style={{fontFamily: MONO, color: r.color, fontSize: 4 * v, fontWeight: 800,
                textShadow: `0 0 ${2 * v}px ${r.color}66`}}>{r.n}</div>
              <div>
                <div style={{color: r.color, fontWeight: 800, fontSize: 2.4 * v, letterSpacing: 1}}>{r.tag}</div>
                <div style={{color: C.text, fontSize: 2.6 * v}}>{r.t}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </Moment>
      <Moment win={S[2]}>
        <Big v={v} size={4.6}><span style={{color: C.accent}}>Metric nào</span> · <span style={{color: C.good}}>Dimension nào</span> · <span style={{color: C.warn}}>KPI nào?</span></Big>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 07 — recap + CTA ----------
export const Scene07: React.FC = () => {
  const v = useVmin();
  const S = useSteps([50, 30, 20]);
  const rows = [
    {k: "Metric", color: C.accent, a: "Đại lượng đo được", b: "Doanh thu, số đơn"},
    {k: "Dimension", color: C.good, a: "Lát cắt để nhìn", b: "Theo kênh · cột ngày"},
    {k: "KPI", color: C.warn, a: "Metric + mục tiêu", b: "“Đạt 4 tỷ — hiện 95%”"},
  ];
  return (
    <AbsoluteFill>
      <Bg label="TÓM LẠI" />
      <Moment win={S[0]}>
        <div style={{display: "grid", gap: 2 * v}}>
          {rows.map((r, i) => (
            <FadeUp key={i} at={S[0][0] + 6 + i * 12}
              style={{display: "grid", gridTemplateColumns: `${22 * v}px ${30 * v}px ${34 * v}px`,
                gap: 2 * v, alignItems: "center", background: `linear-gradient(160deg, ${C.cardHi}, ${C.card})`,
                border: `1px solid ${C.border}`, borderRadius: 1.6 * v, padding: `${2 * v}px ${2.6 * v}px`,
                textAlign: "left", boxShadow: `0 ${1 * v}px ${3 * v}px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`}}>
              <div style={{color: r.color, fontWeight: 800, fontSize: 2.8 * v}}>{r.k}</div>
              <div style={{color: C.text, fontSize: 2.2 * v}}>{r.a}</div>
              <div style={{color: C.muted, fontSize: 2 * v}}>{r.b}</div>
            </FadeUp>
          ))}
        </div>
      </Moment>
      <Moment win={S[1]}>
        <Big v={v} size={4.8}><span style={{color: C.accent}}>Metric nào</span> · <span style={{color: C.good}}>Dimension nào</span> · <span style={{color: C.warn}}>KPI nào?</span></Big>
      </Moment>
      <Moment win={S[2]}>
        <div style={{display: "inline-flex", alignItems: "center", gap: 2 * v, border: `2px solid ${C.accent}`,
          color: C.accent, borderRadius: 100, padding: `${1.6 * v}px ${3.4 * v}px`, fontSize: 2.6 * v,
          fontWeight: 800, boxShadow: `0 0 ${3 * v}px ${C.accent}55`}}>▶ Theo dõi</div>
        <div style={{color: C.muted, fontSize: 2.1 * v, marginTop: 3 * v}}>Mỗi tuần một khái niệm data — gỡ trong vài phút.</div>
        <div style={{fontFamily: MONO, color: C.muted, fontSize: 1.7 * v, letterSpacing: 4, marginTop: 4 * v}}>SEMANTIX</div>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- SHORT OUTRO ----------
export const OutroShort: React.FC = () => {
  const v = useVmin();
  const S = useSteps([48, 52]);
  return (
    <AbsoluteFill>
      <Bg label="SEMANTIX · DATA 101" />
      <Moment win={S[0]}>
        <Big v={v} size={4.4} color={C.muted} style={{marginBottom: 4 * v}}>Câu trả lời nằm ở 3 từ:</Big>
        <div style={{display: "flex", flexDirection: "column", gap: 2.4 * v}}>
          {[["METRIC", C.accent], ["DIMENSION", C.good], ["KPI", C.warn]].map(([t, c], i) => (
            <FadeUp key={t} at={S[0][0] + 8 + i * 8}><Chip t={t as string} color={c as string} v={v} /></FadeUp>
          ))}
        </div>
      </Moment>
      <Moment win={S[1]}>
        <div style={{display: "inline-flex", alignItems: "center", gap: 2 * v, border: `2px solid ${C.accent}`,
          color: C.accent, borderRadius: 100, padding: `${1.8 * v}px ${3.6 * v}px`, fontSize: 3 * v,
          fontWeight: 800, boxShadow: `0 0 ${3 * v}px ${C.accent}55`}}>▶ Xem đầy đủ trên YouTube</div>
        <div style={{color: C.muted, fontSize: 2.4 * v, marginTop: 4 * v}}>Theo dõi để không bỏ lỡ.</div>
      </Moment>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC> = {
  "00": Scene00, "01": Scene01, "02": Scene02, "03": Scene03,
  "04": Scene04, "05": Scene05, "07": Scene07,
};
