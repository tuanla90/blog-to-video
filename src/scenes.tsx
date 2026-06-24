import React from "react";
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from "remotion";
import {C, MONO, useVmin, useAt, useCount, Bg, FadeUp} from "./ui";

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const Moment: React.FC<{from: number; to: number; d?: number; children: React.ReactNode; style?: any}> =
({from, to, d = 12, children, style}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + d, to - d, to], [0, 1, 1, 0], clamp);
  const ty = interpolate(f, [from, from + d], [26, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const bl = interpolate(f, [from, from + d * 0.7], [7, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "0 7%", opacity: o, transform: `translateY(${ty}px)`, filter: `blur(${bl}px)`,
      letterSpacing: "-0.015em", ...style}}>
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
  const v = useVmin(); const at = useAt();
  const sales = useCount(at(0.30), 16, 0, 4.2);
  const ke = useCount(at(0.34), 16, 0, 3.8);
  const f = useCurrentFrame();
  const shake = interpolate(f, [at(0.62), at(0.66), at(0.70)], [0, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <Bg label="SEMANTIX · DATA 101" />
      <Moment from={at(0.0)} to={at(0.30)}>
        <Label v={v}>SÁNG THỨ HAI · GIAO BAN</Label>
        <Big v={v} size={5.4}>“Doanh thu tháng này<br />bao nhiêu?”</Big>
      </Moment>
      <Moment from={at(0.28)} to={at(0.62)}>
        <div style={{display: "flex", gap: 5 * v, transform: `translateX(${shake * 6 - 3}px)`}}>
          <Card v={v} label="Sales" value={vnd(sales)} color={C.accent} />
          <Card v={v} label="Kế toán" value={vnd(ke)} color={C.warn} />
        </div>
        <div style={{color: C.muted, fontSize: 2.4 * v, marginTop: 4 * v}}>Cùng một công ty. Cùng một tháng.</div>
      </Moment>
      <Moment from={at(0.60)} to={at(0.80)}>
        <Big v={v} size={11} color={C.bad} style={{letterSpacing: 2}}>AI SAI?</Big>
      </Moment>
      <Moment from={at(0.78)} to={at(1.0)}>
        <Big v={v} size={8}>KHÔNG AI<br />SAI CẢ</Big>
        <div style={{color: C.muted, fontSize: 2.3 * v, marginTop: 3 * v}}>Cả ba đều đúng — theo định nghĩa của mình.</div>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 01 — concept / cube ----------
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
  const v = useVmin(); const at = useAt();
  return (
    <AbsoluteFill>
      <Bg label="KHÁI NIỆM · RUBIK DỮ LIỆU" />
      <Moment from={at(0.0)} to={at(0.32)}>
        <Big v={v} size={4.6} color={C.muted}>Hiếm khi là cộng sai.</Big>
        <Big v={v} size={5.2} style={{marginTop: 2 * v}}>Ba người gọi <span style={{color: C.accent}}>ba thứ khác nhau</span><br />bằng đúng một từ.</Big>
      </Moment>
      <Moment from={at(0.30)} to={at(0.66)}>
        <div style={{display: "flex", gap: 3 * v, marginBottom: 6 * v}}>
          <Chip t="METRIC" color={C.accent} v={v} />
          <Chip t="DIMENSION" color={C.good} v={v} />
          <Chip t="KPI" color={C.warn} v={v} />
        </div>
        <SlicesCube v={v} />
        <div style={{color: C.muted, fontSize: 2.4 * v, marginTop: 4 * v}}>Ba từ — ba việc hoàn toàn khác nhau.</div>
      </Moment>
      <Moment from={at(0.64)} to={at(1.0)}>
        <div style={{display: "grid", gap: 2.4 * v, textAlign: "left", fontSize: 3 * v, fontWeight: 700}}>
          <div><span style={{color: C.accent}}>Metric</span> — con số trên mặt khối.</div>
          <div><span style={{color: C.good}}>Dimension</span> — cách bạn xoay khối.</div>
          <div><span style={{color: C.warn}}>KPI</span> — vạch mục tiêu trên tường.</div>
        </div>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 02 — metric split ----------
export const Scene02: React.FC = () => {
  const v = useVmin(); const at = useAt();
  const traps = ["Đã chốt hay đã thu?", "Có trừ đơn hoàn?", "Có gồm phí ship?"];
  return (
    <AbsoluteFill>
      <Bg label="METRIC" />
      <Moment from={at(0.0)} to={at(0.22)}>
        <Big v={v} size={5.2}><span style={{color: C.accent}}>Metric</span> = một con số đo được.</Big>
        <div style={{color: C.muted, fontSize: 2.4 * v, marginTop: 3 * v}}>Doanh thu · Số đơn · Khách mới</div>
      </Moment>
      <Moment from={at(0.20)} to={at(0.30)}>
        <Big v={v} size={5.6}>Nhưng cái bẫy<br />nằm ngay đây.</Big>
      </Moment>
      <Moment from={at(0.28)} to={at(0.60)}>
        <Big v={v} size={4.4} style={{marginBottom: 4 * v}}>“Doanh thu” — hỏi 5 người:</Big>
        <div style={{display: "grid", gap: 2 * v}}>
          {traps.map((t, i) => (
            <FadeUp key={i} at={at(0.30 + i * 0.07)}
              style={{fontFamily: MONO, color: C.warn, fontSize: 2.8 * v, fontWeight: 700}}>{t}</FadeUp>
          ))}
        </div>
      </Moment>
      <Moment from={at(0.58)} to={at(0.84)}>
        <div style={{display: "flex", gap: 5 * v}}>
          <Card v={v} label="Sales" value="4,2 tỷ" color={C.accent} sub="gồm ship · chưa trừ hoàn" />
          <Card v={v} label="Kế toán" value="3,8 tỷ" color={C.warn} sub="đã thu · trừ hoàn · không ship" />
        </div>
      </Moment>
      <Moment from={at(0.82)} to={at(1.0)}>
        <Big v={v} size={5.2}>Hai metric khác nhau —<br /><span style={{color: C.bad}}>chung một cái tên.</span></Big>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 03 — dimension bars ----------
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
  const v = useVmin(); const at = useAt();
  const g = useCount(at(0.46), 24, 0, 1);
  return (
    <AbsoluteFill>
      <Bg label="DIMENSION" />
      <Moment from={at(0.0)} to={at(0.26)}>
        <Big v={v} size={5}><span style={{color: C.good}}>Dimension</span> = lát cắt,<br />không phải con số.</Big>
      </Moment>
      <Moment from={at(0.24)} to={at(0.46)}>
        <Bar h={26 * v} color={C.muted} label="Tổng" value="3,8 tỷ" v={v} />
        <div style={{color: C.muted, fontSize: 2.3 * v, marginTop: 4 * v}}>Con số tổng → gần như vô dụng để quyết định.</div>
      </Moment>
      <Moment from={at(0.44)} to={at(0.82)}>
        <div style={{display: "flex", gap: 7 * v, alignItems: "flex-end"}}>
          <Bar h={(8 + 20 * g) * v} color={C.accent} label="Shopee" value="1,9" v={v} />
          <Bar h={(6 + 15 * g) * v} color={C.good} label="TikTok Shop" value="1,4" v={v} />
          <Bar h={(4 + 5 * g) * v} color={C.warn} label="KiotViet" value="0,5" v={v} />
        </div>
        <div style={{color: C.muted, fontSize: 2.1 * v, marginTop: 3.5 * v}}>Cắt theo kênh → lập tức kể một câu chuyện.</div>
      </Moment>
      <Moment from={at(0.80)} to={at(1.0)}>
        <Big v={v} size={5}>Giờ bạn mới biết<br /><span style={{color: C.good}}>dồn ngân sách vào đâu.</span></Big>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 04 — KPI target ----------
export const Scene04: React.FC = () => {
  const v = useVmin(); const at = useAt();
  const pct = useCount(at(0.24), 26, 0, 95);
  const barH = useCount(at(0.24), 26, 2, 23);
  return (
    <AbsoluteFill>
      <Bg label="KPI" />
      <Moment from={at(0.0)} to={at(0.22)}>
        <Big v={v} size={5}>Không phải metric nào<br />cũng là <span style={{color: C.warn}}>KPI</span>.</Big>
      </Moment>
      <Moment from={at(0.20)} to={at(0.54)}>
        <div style={{position: "relative", height: 30 * v, display: "flex", alignItems: "flex-end"}}>
          <div style={{position: "absolute", bottom: 26 * v, width: 34 * v, left: -6 * v,
            borderTop: `2px dashed ${C.good}`}} />
          <div style={{position: "absolute", bottom: 26.5 * v, right: -10 * v, color: C.good,
            fontSize: 2 * v, fontWeight: 700}}>Mục tiêu 4 tỷ</div>
          <div style={{width: 12 * v, height: barH * v, background: C.accent, borderRadius: 1 * v,
            boxShadow: `0 0 ${3 * v}px ${C.accent}66`}} />
        </div>
        <div style={{fontFamily: MONO, fontSize: 6 * v, fontWeight: 800, color: C.good, marginTop: 3 * v}}>
          {Math.round(pct)}%
        </div>
        <div style={{color: C.muted, fontSize: 2.1 * v}}>3,8 tỷ / 4 tỷ — giờ con số có một cái thước.</div>
      </Moment>
      <Moment from={at(0.52)} to={at(0.80)}>
        <div style={{display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1.4 * v, marginBottom: 4 * v}}>
          {Array.from({length: 30}).map((_, i) => {
            const keep = i % 5 === 0;
            return <div key={i} style={{width: 5 * v, height: 5 * v, borderRadius: 1 * v,
              background: keep ? C.warn : C.card, border: `1px solid ${keep ? C.warn : C.border}`,
              opacity: keep ? 1 : 0.25}} />;
          })}
        </div>
        <Big v={v} size={4}>Chọn <span style={{color: C.warn}}>5–10 KPI</span> — không phải 30.</Big>
      </Moment>
      <Moment from={at(0.78)} to={at(1.0)}>
        <Big v={v} size={4.8}>Mọi thứ đều then chốt<br />= <span style={{color: C.bad}}>không gì then chốt.</span></Big>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 05 — replay ----------
export const Scene05: React.FC = () => {
  const v = useVmin(); const at = useAt();
  const rows = [
    {n: "1", tag: "METRIC", color: C.accent, t: "“doanh thu” chưa có định nghĩa chung"},
    {n: "2", tag: "DIMENSION", color: C.good, t: "mỗi người cầm một lát cắt khác"},
    {n: "3", tag: "KPI", color: C.warn, t: "không ai chốt mục tiêu để đối chiếu"},
  ];
  return (
    <AbsoluteFill>
      <Bg label="ĐỌC LẠI CUỘC CÃI VÃ" />
      <Moment from={at(0.0)} to={at(0.2)}>
        <Big v={v} size={5.2}>Cùng một cuộc cãi —<br />đọc lại bằng <span style={{color: C.accent}}>ba từ</span>.</Big>
      </Moment>
      <Moment from={at(0.18)} to={at(0.70)}>
        <div style={{display: "grid", gap: 3 * v, textAlign: "left"}}>
          {rows.map((r, i) => (
            <FadeUp key={i} at={at(0.22 + i * 0.10)} style={{display: "flex", alignItems: "center", gap: 3 * v}}>
              <div style={{fontFamily: MONO, color: r.color, fontSize: 4 * v, fontWeight: 800}}>{r.n}</div>
              <div>
                <div style={{color: r.color, fontWeight: 800, fontSize: 2.4 * v, letterSpacing: 1}}>{r.tag}</div>
                <div style={{color: C.text, fontSize: 2.6 * v}}>{r.t}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </Moment>
      <Moment from={at(0.66)} to={at(1.0)}>
        <Big v={v} size={4.6}><span style={{color: C.accent}}>Metric nào</span> · <span style={{color: C.good}}>Dimension nào</span> · <span style={{color: C.warn}}>KPI nào?</span></Big>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- BEAT 07 — recap + CTA ----------
export const Scene07: React.FC = () => {
  const v = useVmin(); const at = useAt();
  const rows = [
    {k: "Metric", color: C.accent, a: "Đại lượng đo được", b: "Doanh thu, số đơn"},
    {k: "Dimension", color: C.good, a: "Lát cắt để nhìn", b: "Theo kênh, theo tháng"},
    {k: "KPI", color: C.warn, a: "Metric + mục tiêu", b: "“Đạt 4 tỷ — hiện 95%”"},
  ];
  return (
    <AbsoluteFill>
      <Bg label="TÓM LẠI" />
      <Moment from={at(0.0)} to={at(0.5)}>
        <div style={{display: "grid", gap: 2 * v}}>
          {rows.map((r, i) => (
            <FadeUp key={i} at={at(0.05 + i * 0.10)}
              style={{display: "grid", gridTemplateColumns: `${22 * v}px ${30 * v}px ${34 * v}px`,
                gap: 2 * v, alignItems: "center", background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 1.6 * v, padding: `${2 * v}px ${2.6 * v}px`, textAlign: "left"}}>
              <div style={{color: r.color, fontWeight: 800, fontSize: 2.8 * v}}>{r.k}</div>
              <div style={{color: C.text, fontSize: 2.2 * v}}>{r.a}</div>
              <div style={{color: C.muted, fontSize: 2 * v}}>{r.b}</div>
            </FadeUp>
          ))}
        </div>
      </Moment>
      <Moment from={at(0.46)} to={at(0.78)}>
        <Big v={v} size={4.8}><span style={{color: C.accent}}>Metric nào</span> · <span style={{color: C.good}}>Dimension nào</span> · <span style={{color: C.warn}}>KPI nào?</span></Big>
      </Moment>
      <Moment from={at(0.74)} to={at(1.0)}>
        <div style={{display: "inline-flex", alignItems: "center", gap: 2 * v, border: `2px solid ${C.accent}`,
          color: C.accent, borderRadius: 100, padding: `${1.6 * v}px ${3.4 * v}px`, fontSize: 2.6 * v,
          fontWeight: 800, boxShadow: `0 0 ${3 * v}px ${C.accent}55`}}>▶ Theo dõi</div>
        <div style={{color: C.muted, fontSize: 2.1 * v, marginTop: 3 * v}}>Mỗi tuần một khái niệm data — gỡ trong vài phút.</div>
        <div style={{fontFamily: MONO, color: C.muted, fontSize: 1.7 * v, letterSpacing: 4, marginTop: 4 * v}}>SEMANTIX</div>
      </Moment>
    </AbsoluteFill>
  );
};

// ---------- SHORT OUTRO — bridge to full video ----------
export const OutroShort: React.FC = () => {
  const v = useVmin(); const at = useAt();
  return (
    <AbsoluteFill>
      <Bg label="SEMANTIX · DATA 101" />
      <Moment from={at(0.0)} to={at(0.5)}>
        <Big v={v} size={4.4} color={C.muted} style={{marginBottom: 4 * v}}>Câu trả lời nằm ở 3 từ:</Big>
        <div style={{display: "flex", flexDirection: "column", gap: 2.4 * v}}>
          <Chip t="METRIC" color={C.accent} v={v} />
          <Chip t="DIMENSION" color={C.good} v={v} />
          <Chip t="KPI" color={C.warn} v={v} />
        </div>
      </Moment>
      <Moment from={at(0.46)} to={at(1.0)}>
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
