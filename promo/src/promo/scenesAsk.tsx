import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { CLAMP, ease, Headline, INK, panelStyle, Stage } from './kit'
import { accel, IllustrationTag } from './scenesA'

/*
 * 4 — Hỏi so cùng kỳ; 5 — hỏi đào sâu. Số liệu thật: quý 3/2026 so với quý 3/2025
 * (triệu đồng), tính từ thu_ngan_sach.csv + 12 file T9.
 * Con trỏ/gợn sóng/đẩy camera theo input-trigger-moves; thẻ kế hoạch theo
 * ai-stream-response (video-shotcraft, Apache-2.0).
 */
const Q = 'Quý này đơn vị nào giảm thu so với cùng kỳ năm trước?'
const ROWS = [
    { name: 'Phường An Phú', prev: 37621, cur: 42192 },
    { name: 'Phường Bình Minh', prev: 29516, cur: 32297 },
    { name: 'Phường Đông Hải', prev: 35523, cur: 27365 },
    { name: 'Phường Hòa Bình', prev: 24008, cur: 20775 },
    { name: 'Phường Lê Lợi', prev: 32388, cur: 37349 },
    { name: 'Phường Nam Sơn', prev: 21598, cur: 23377 },
    { name: 'Thị trấn Vĩnh An', prev: 26868, cur: 30266 },
    { name: 'Xã Đại Đồng', prev: 16346, cur: 17689 },
    { name: 'Xã Minh Khai', prev: 13427, cur: 14552 },
    { name: 'Xã Phú Cường', prev: 13674, cur: 14241 },
    { name: 'Xã Sông Trà', prev: 10801, cur: 12120 },
    { name: 'Xã Tân Lập', prev: 19094, cur: 15773 },
]
const fmt = (n: number) => Math.round(n).toLocaleString('de-DE')
const pct = (r: { prev: number; cur: number }) => (r.cur / r.prev - 1) * 100
const pctLabel = (p: number) => `${p < 0 ? '−' : '+'}${Math.abs(p).toFixed(1).replace('.', ',')}%`

export const ASK = { typeStart: 12, typeEnd: 72, cursorIn: 58, click: 94, planIn: 106, chips: 120, planDone: 156, chartIn: 190, bars: 204, highlight: 258 }
const SEND = { x: 1478, y: 526 }
const P = [{ x: 420, y: 1010 }, { x: 900, y: 1080 }, { x: 1620, y: 780 }, SEND]
const bez = (t: number) => {
    const u = 1 - t
    const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
    return { x: k.reduce((s, c, i) => s + c * P[i].x, 0), y: k.reduce((s, c, i) => s + c * P[i].y, 0) }
}
const Cursor: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <svg width={46} height={46} viewBox="0 0 28 28" style={{ position: 'absolute', left: x - 3.3, top: y - 1.6, filter: 'drop-shadow(0 4px 7px rgba(0,0,0,0.35))' }}>
        <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill="#fff" stroke="#231F3A" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
)
const TONE = { blue: ['#E8F0FE', '#1D5BD8'], green: ['#E6F6EE', '#0E7A5F'], amber: ['#FEF3D7', '#A15C00'], violet: ['#EFEAFE', '#5B3FD6'] } as const
const CHIPS: [string, string, keyof typeof TONE][] = [
    ['Tôi sẽ vẽ', 'Biểu đồ cột', 'blue'], ['dựa trên', 'Tổng thu', 'blue'], ['theo', 'Đơn vị', 'green'],
    ['trong', 'Quý này', 'amber'], ['so sánh', 'Cùng kỳ năm trước', 'violet'],
]

export const AskScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = ASK
    const composer = spring({ frame: f - 6, fps, config: { damping: 200 } })
    const typed = Math.floor(interpolate(f, [T.typeStart, T.typeEnd], [0, Q.length], CLAMP))
    const ct = f < T.cursorIn + 22 ? ease(f, [T.cursorIn, T.cursorIn + 22], [0, 1.05]) : ease(f, [T.cursorIn + 22, T.cursorIn + 28], [1.05, 1], Easing.inOut(Easing.quad))
    const cur = bez(ct)
    const press = interpolate(f, [T.click, T.click + 2, T.click + 6], [1, 0.92, 1], CLAMP)
    const punch = f < T.click + 22 ? ease(f, [T.click, T.click + 10], [1, 1.1]) : ease(f, [T.click + 22, T.click + 38], [1.1, 1], Easing.inOut(Easing.cubic))
    const lift = ease(f, [T.click + 2, T.click + 18], [0, 1], Easing.inOut(Easing.cubic))
    const plan = spring({ frame: f - T.planIn, fps, config: { damping: 200 } })
    const toChart = ease(f, [T.chartIn - 4, T.chartIn + 12], [0, 1])
    const rise = spring({ frame: f - T.chartIn, fps, config: { damping: 18, stiffness: 120 } })
    const spot = ease(f, [T.highlight, T.highlight + 10], [0, 1])
    const barCues = accel(12, 5, 2).map(c => c + T.bars)
    const W = 1000
    return (
        <Stage>
            <Headline text="Bạn hỏi, AI trả lời như chuyên gia" at={0} out={96} size={90} top={70} accent={['AI', 'chuyên gia']} />
            <Headline text="Kế hoạch hiện trước khi chạy" at={98} out={184} size={100} top={70} accent={['Kế hoạch']} />
            <Headline text="AI tự chọn loại biểu đồ" at={186} size={86} top={46} accent={['AI', 'loại biểu đồ']} />

            <div style={{ position: 'absolute', inset: 0, transform: `scale(${punch})`, transformOrigin: `${SEND.x}px ${SEND.y}px` }}>
                {f < T.click + 10 && (
                    <div style={{
                        ...panelStyle, left: 400, top: 480, width: 1120, height: 92, borderRadius: 22, display: 'flex', alignItems: 'center', padding: '0 20px 0 34px',
                        opacity: composer * interpolate(f, [T.click + 2, T.click + 10], [1, 0], CLAMP), transform: `translateY(${(1 - composer) * 40}px)`,
                    }}>
                        <div style={{ flex: 1, fontSize: 32, fontWeight: 500, color: typed ? INK : '#A3A0B8', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            {typed ? Q.slice(0, typed) : 'Hỏi bất cứ điều gì về Thu ngân sách'}
                            {f < T.click && Math.floor(f / 7) % 2 === 0 && <span style={{ color: C.violet, fontWeight: 300 }}>|</span>}
                        </div>
                        <div style={{
                            width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: typed === Q.length ? C.violet : '#E5E3F2', transform: `scale(${press})`,
                        }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </div>
                    </div>
                )}
                {f >= T.click + 2 && f < T.chartIn + 14 && (
                    <div style={{
                        ...panelStyle, background: '#16132B', border: 'none', color: '#fff', fontSize: 30, fontWeight: 600, padding: '20px 30px', borderRadius: 22, width: 900,
                        left: interpolate(lift, [0, 1], [434, 720]), top: interpolate(lift, [0, 1], [496, 238]), opacity: 1 - toChart,
                    }}>{Q}</div>
                )}
                {f >= T.planIn && f < T.chartIn + 14 && (
                    <div style={{ ...panelStyle, left: 300, top: 370, width: 1320, padding: '30px 40px 34px', opacity: plan * (1 - toChart), transform: `translateY(${(1 - plan) * 40 - toChart * 120}px)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, fontWeight: 800, letterSpacing: '0.08em', color: INK }}>
                            <span style={{ fontSize: 26 }}>⚡</span> KẾ HOẠCH PHÂN TÍCH
                            <span style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 600, letterSpacing: 0, color: f >= T.planDone ? C.emerald : C.steel }}>
                                {f >= T.planDone ? '✓ Sẵn sàng chạy' : 'Đang lập kế hoạch…'}
                            </span>
                        </div>
                        <div style={{ marginTop: 18, fontSize: 28, color: C.steel, clipPath: `inset(0 ${100 - ease(f, [T.planIn + 4, T.planIn + 14], [0, 100])}% 0 0)` }}>
                            Tìm các đơn vị có tổng thu quý này thấp hơn cùng kỳ năm trước.
                        </div>
                        <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px 12px', fontSize: 30, color: INK }}>
                            {CHIPS.map(([pre, chip, tone], i) => {
                                const cue = T.chips + [0, 8, 15, 21, 26][i]
                                const p = ease(f, [cue, cue + 10], [0, 1], Easing.bezier(0.2, 0.75, 0.25, 1))
                                return (
                                    <span key={chip} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: `blur(${(1 - p) * 6}px)` }}>
                                        {pre}
                                        <span style={{ padding: '6px 16px', borderRadius: 10, fontWeight: 700, background: TONE[tone][0], color: TONE[tone][1] }}>{chip}</span>
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                )}
                {f >= T.click && f < T.click + 26 && (
                    <div style={{
                        position: 'absolute', left: SEND.x - ease(f, [T.click, T.click + 22], [50, 320]) / 2, top: SEND.y - ease(f, [T.click, T.click + 22], [50, 320]) / 2,
                        width: ease(f, [T.click, T.click + 22], [50, 320]), height: ease(f, [T.click, T.click + 22], [50, 320]), borderRadius: '50%',
                        border: `6px solid ${C.violet}`, opacity: interpolate(f, [T.click, T.click + 26], [0.8, 0], CLAMP),
                    }} />
                )}
                {f >= T.cursorIn && f < T.click + 30 && (
                    <div style={{ opacity: interpolate(f, [T.click + 18, T.click + 30], [1, 0], CLAMP) }}>
                        <Cursor x={cur.x} y={cur.y + interpolate(f, [T.click, T.click + 2, T.click + 6], [0, 3, 0], CLAMP)} />
                    </div>
                )}
            </div>

            {f >= T.chartIn && (
                <div style={{ ...panelStyle, left: 200, top: 190, width: 1520, height: 850, padding: '34px 50px', transform: `translateY(${(1 - rise) * 700}px)` }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: INK }}>Tổng thu theo đơn vị · Quý 3</div>
                        <div style={{ fontSize: 22, color: C.steel }}>triệu đồng</div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 26, fontSize: 22, color: C.steel }}>
                            <span><span style={{ display: 'inline-block', width: 15, height: 15, borderRadius: 4, background: '#CFCAF3', marginRight: 8 }} />2025</span>
                            <span><span style={{ display: 'inline-block', width: 15, height: 15, borderRadius: 4, background: C.navy, marginRight: 8 }} />2026</span>
                        </div>
                    </div>
                    <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {ROWS.map((r, i) => {
                            const g = ease(f, [barCues[i], barCues[i] + 14], [0, 1])
                            const down = pct(r) < 0
                            const badge = spring({ frame: f - T.highlight - 2 - [2, 3, 11].indexOf(i) * 5, fps, config: { damping: 11, stiffness: 190 } })
                            return (
                                <div key={r.name} style={{
                                    display: 'flex', alignItems: 'center', height: 50, borderRadius: 12, padding: '0 12px',
                                    background: down ? `rgba(192,57,43,${0.07 * spot})` : 'transparent', opacity: down ? 1 : 1 - 0.7 * spot,
                                }}>
                                    <div style={{ width: 240, fontSize: 23, fontWeight: down && spot > 0 ? 700 : 500, color: INK }}>{r.name}</div>
                                    <div style={{ width: W, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{ height: 13, width: (r.prev / 44000) * W * g, borderRadius: 7, background: '#CFCAF3' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ height: 17, width: (r.cur / 44000) * W * g, borderRadius: 9, background: down && spot > 0 ? C.red : C.navy }} />
                                            <span style={{ fontSize: 19, fontWeight: 600, color: C.steel, opacity: g }}>{fmt(r.cur)}</span>
                                        </div>
                                    </div>
                                    {down && f >= T.highlight && (
                                        <div style={{ marginLeft: 'auto', padding: '6px 18px', borderRadius: 999, background: C.red, color: '#fff', fontSize: 26, fontWeight: 800, transform: `scale(${badge})` }}>
                                            {pctLabel(pct(r))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
            <IllustrationTag />
        </Stage>
    )
}

/** 5 — Hỏi tiếp, không cần nhắc lại: Đông Hải theo khoản mục. 210f */
const Q2 = 'Còn Phường Đông Hải, chia theo khoản mục?'
const KM = [
    { name: 'Thu tiền sử dụng đất', prev: 9549, cur: 1819 },
    { name: 'Thuế ngoài quốc doanh', prev: 13682, cur: 13380 },
    { name: 'Phí và lệ phí', prev: 7124, cur: 6866 },
    { name: 'Thu khác', prev: 5168, cur: 5300 },
]
// nhận xét rút từ số thật: SDĐ −81,0%; Thuế NQD −2,2%, Phí −3,6%, Thu khác +2,6%
const AI_NOTE = 'Đông Hải giảm chủ yếu do Thu tiền sử dụng đất (−81%), các khoản thu khác gần như đi ngang'
export const DrillScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const pill = spring({ frame: f - 6, fps, config: { damping: 200 } })
    const typed = Math.floor(interpolate(f, [10, 52], [0, Q2.length], CLAMP))
    const up = ease(f, [78, 94], [0, 1], Easing.inOut(Easing.cubic))
    const n = interpolate(f, [96, 126], [0, -81.0], { ...CLAMP, easing: Easing.out(Easing.cubic) })
    const big = spring({ frame: f - 94, fps, config: { damping: 14, stiffness: 160 } })
    return (
        <Stage>
            <Headline text="Hỏi tiếp, không cần nhắc lại" at={0} out={80} size={104} top={70} accent={['không cần nhắc lại']} />
            <Headline text="AI tự nhận xét" at={84} size={100} top={56} accent={['AI']} />
            <div style={{
                ...panelStyle, background: '#16132B', border: 'none', color: '#fff', fontWeight: 600, padding: '24px 36px', borderRadius: 24,
                left: interpolate(up, [0, 1], [460, 1140]), top: interpolate(up, [0, 1], [470, 210]), width: interpolate(up, [0, 1], [1000, 640]),
                fontSize: interpolate(up, [0, 1], [38, 26]), opacity: pill, transform: `translateY(${(1 - pill) * 30}px)`,
            }}>
                {Q2.slice(0, typed)}{f < 56 && Math.floor(f / 7) % 2 === 0 && <span style={{ color: '#B7AEFF' }}>|</span>}
            </div>
            {f >= 90 && (
                <>
                    <div style={{ position: 'absolute', left: 150, top: 380, width: 640, opacity: big, transform: `scale(${0.85 + 0.15 * big})`, transformOrigin: 'left center' }}>
                        <div style={{ fontSize: 44, fontWeight: 700, color: INK }}>Thu tiền sử dụng đất</div>
                        <div style={{ fontSize: 250, fontWeight: 800, color: C.red, lineHeight: 1, letterSpacing: '-0.03em' }}>
                            {n.toFixed(0).replace('-', '−')}%
                        </div>
                        <div style={{ fontSize: 34, color: C.steel, marginTop: 10 }}>9.549 → 1.819 triệu đồng · quý 3</div>
                    </div>
                    <div style={{ ...panelStyle, left: 860, top: 380, width: 900, padding: '30px 36px', opacity: ease(f, [100, 112], [0, 1]) }}>
                        {KM.map((k, i) => {
                            const g = ease(f, [104 + i * 6, 120 + i * 6], [0, 1])
                            const bad = i === 0
                            return (
                                <div key={k.name} style={{ marginBottom: i < 3 ? 22 : 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: bad ? 800 : 600, color: bad ? C.red : INK }}>
                                        <span>{k.name}</span><span>{pctLabel(pct(k))}</span>
                                    </div>
                                    <div style={{ marginTop: 8, height: 12, width: (k.prev / 14000) * 820 * g, borderRadius: 6, background: '#CFCAF3' }} />
                                    <div style={{ marginTop: 5, height: 16, width: (k.cur / 14000) * 820 * g, borderRadius: 8, background: bad ? C.red : C.navy }} />
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
            {f >= 136 && (
                <div style={{
                    ...panelStyle, left: 150, right: 160, top: 790, padding: '24px 34px', display: 'flex', gap: 20, alignItems: 'flex-start',
                    opacity: ease(f, [136, 146], [0, 1]), transform: `translateY(${(1 - ease(f, [136, 150], [0, 1])) * 30}px)`,
                }}>
                    <span style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 999, background: 'linear-gradient(90deg, #6D5DF6, #E86FC6)', color: '#fff', fontSize: 24, fontWeight: 800 }}>AI nhận xét</span>
                    <span style={{ fontSize: 32, fontWeight: 600, color: INK, lineHeight: 1.35 }}>
                        {AI_NOTE.slice(0, Math.floor(interpolate(f, [146, 200], [0, AI_NOTE.length], CLAMP)))}
                    </span>
                </div>
            )}
            <IllustrationTag />
        </Stage>
    )
}
