import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { ACCENT_TEXT, Burst, CLAMP, ease, Headline, INK, panelStyle, Shake, Stage, useDark } from './kit'
import { accel, IllustrationTag, MONO } from './scenesA'
import { useEdition } from './kit'

/*
 * Cảnh bổ sung 2026-09-11: định vị sản phẩm, sửa biểu đồ bằng lời, AI Agent, xuất
 * trình chiếu. Mọi số/chữ lấy từ màn hình thật đã quay (chat 44d11cbf, dashboard
 * Thu ngân sách, file HTML deck xuất ra) — xem tools/STORYBOARD.md.
 */

const GRAD = 'linear-gradient(135deg, #6D5DF6 0%, #B45FD8 55%, #E86FC6 100%)'

// ─── Định vị ────────────────────────────────────────────────────────────────
/**
 * Icon tính năng — hình vẽ lấy nguyên từ bộ Lucide 0.562 mà giao diện Semanio đang dùng
 * (message-square-text, square-pen, layout-dashboard, bot). Nhúng thẳng đường vẽ thay vì
 * import lucide-react: gói đó nằm ở app cha và kéo theo bản React khác của app.
 */
const ICONS: Record<'chat' | 'wand' | 'dash' | 'agent', React.ReactNode> = {
    chat: <><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" /><path d="M7 11h10" /><path d="M7 15h6" /><path d="M7 7h8" /></>,
    wand: <><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" /></>,
    dash: <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>,
    agent: <><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></>,
}
const Icon: React.FC<{ kind: keyof typeof ICONS; size?: number }> = ({ kind, size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{ICONS[kind]}</svg>
)
const Lock: React.FC = () => (
    <svg width={26} height={26} viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" fill="#fff" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#fff" strokeWidth={2.4} fill="none" /></svg>
)
const CAPS: { icon: 'chat' | 'wand' | 'dash' | 'agent'; title: string; desc: string }[] = [
    { icon: 'chat', title: 'Hỏi đáp tức thì', desc: 'Hỏi bằng tiếng Việt, có số liệu và biểu đồ' },
    { icon: 'wand', title: 'Sửa biểu đồ bằng lời', desc: 'Đổi kiểu, màu, nhãn chỉ bằng một câu' },
    { icon: 'dash', title: 'Dashboard & Insight', desc: 'AI tóm tắt điểm đáng chú ý, xuất trình chiếu' },
    { icon: 'agent', title: 'AI Agent', desc: 'Tự chạy nhiều bước, minh bạch cách tính' },
]
const TRUST = ['Triển khai được trên hạ tầng riêng', 'Phân quyền tới từng dòng, từng cột', 'Dữ liệu gốc không rời hệ thống']

/** Semanio là gì, giải quyết gì, làm được gì. 330f */
export const PositionScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const cues = accel(4, 12, 7).map(c => c + 214)
    const name = useEdition() === 'internal' ? 'Semantix' : 'Semanio'
    return (
        <Stage>
            <Shake hits={[8, 100, 122, 144, 214]} amp={10}>
                <Headline text={`${name} là`} at={0} out={92} size={64} top={296} accent={[name]} />
                <Headline text="Trợ lý phân tích dữ liệu" at={6} out={92} size={130} top={380} accent={['dữ liệu']} />
                <Headline text="và tự động hoá báo cáo bằng tiếng Việt" at={30} out={92} size={62} top={560} accent={['tiếng Việt']} />

                <Headline text="Không cần biết lập trình" at={100} out={194} size={100} top={240} accent={['Không']} />
                <Headline text="Không thay hệ thống sẵn có" at={122} out={194} size={100} top={395} accent={['Không']} />
                <Headline text="Không phải chờ phòng kỹ thuật" at={144} out={194} size={100} top={550} accent={['Không']} />

                <Headline text="Trọn vòng phân tích trong một nền tảng" at={198} size={80} top={64} accent={['một nền tảng']} />
                <div style={{ position: 'absolute', left: 110, right: 110, top: 250, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
                    {CAPS.map((c, i) => {
                        const p = spring({ frame: f - cues[i], fps, config: { damping: 12, stiffness: 170, mass: 0.7 } })
                        return (
                            <div key={c.title} style={{
                                ...panelStyle, position: 'relative', padding: '34px 30px 38px', boxSizing: 'border-box',
                                opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 220}px) rotate(${(1 - p) * (i % 2 ? 6 : -6)}deg) scale(${0.8 + 0.2 * p})`,
                            }}>
                                <div style={{ fontSize: 30, fontWeight: 800, ...ACCENT_TEXT }}>0{i + 1}</div>
                                <div style={{ width: 84, height: 84, borderRadius: 24, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 18, boxShadow: '0 16px 36px rgba(109,93,246,0.35)' }}>
                                    <Icon kind={c.icon} />
                                </div>
                                <div style={{ fontSize: 40, fontWeight: 800, color: INK, marginTop: 26, lineHeight: 1.15 }}>{c.title}</div>
                                <div style={{ fontSize: 26, color: C.steel, marginTop: 12, lineHeight: 1.35 }}>{c.desc}</div>
                            </div>
                        )
                    })}
                </div>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center', gap: 22 }}>
                    {TRUST.map((t, i) => {
                        const p = spring({ frame: f - 272 - i * 6, fps, config: { damping: 12, stiffness: 200 } })
                        return (
                            <div key={t} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderRadius: 999, background: INK, color: '#fff',
                                fontSize: 28, fontWeight: 700, transform: `scale(${p})`, opacity: Math.min(1, p * 2),
                            }}><Lock />{t}</div>
                        )
                    })}
                </div>
            </Shake>
        </Stage>
    )
}

// ─── Sửa biểu đồ bằng lời ─────────────────────────────────────────────────────
// Số thật quý 3/2025 → quý 3/2026 (tỷ đồng), như trên biểu đồ thật.
const UNITS: [string, number, number][] = [
    ['An Phú', 37.6, 42.2], ['Bình Minh', 29.5, 32.3], ['Đông Hải', 35.5, 27.4], ['Hòa Bình', 24.0, 20.8],
    ['Lê Lợi', 32.4, 37.3], ['Nam Sơn', 21.6, 23.4], ['Vĩnh An', 26.9, 30.3], ['Đại Đồng', 16.3, 17.7],
    ['Minh Khai', 13.4, 14.6], ['Phú Cường', 13.7, 14.2], ['Sông Trà', 10.8, 12.1], ['Tân Lập', 19.1, 15.8],
]
const BLUE = '#3B82F6'
const GREEN = '#10B981'
const REQ = 'Chuyển sang biểu đồ cột dọc'
export const EDIT = { typeStart: 26, typeEnd: 74, send: 84, done: 118 }

/** Nói một câu → biểu đồ thanh ngang đổi thành cột dọc. 210f */
export const EditScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = EDIT
    const panel = spring({ frame: f - 4, fps, config: { damping: 200 } })
    const typed = Math.floor(interpolate(f, [T.typeStart, T.typeEnd], [0, REQ.length], CLAMP))
    const sent = f >= T.send
    const done = f >= T.done
    const W = 1060, H = 640
    // thanh ngang (0) → cột dọc (1); từng cặp chuyển lệch nhau 1,5 khung
    const bar = (i: number, k: 0 | 1) => {
        const m = ease(f, [T.done + i * 1.5, T.done + 22 + i * 1.5], [0, 1], Easing.inOut(Easing.cubic))
        const v = k ? UNITS[i][2] : UNITS[i][1]
        const hz = { x: 150, y: 40 + i * 48 + k * 19, w: (v / 45) * (W - 200), h: 17 }
        const colW = 30
        const vt = { x: 70 + i * 82 + k * (colW + 3), y: H - 110 - (v / 45) * (H - 170), w: colW, h: (v / 45) * (H - 170) }
        return { x: hz.x + (vt.x - hz.x) * m, y: hz.y + (vt.y - hz.y) * m, w: hz.w + (vt.w - hz.w) * m, h: hz.h + (vt.h - hz.h) * m, m }
    }
    const labM = ease(f, [T.done, T.done + 14], [0, 1])
    return (
        <Stage>
            <Headline text="Muốn đổi biểu đồ? Nói là xong" at={0} size={96} top={52} accent={['Nói là xong']} />
            <Shake hits={[T.done]} amp={12}>
                <div style={{ ...panelStyle, left: 110, top: 230, width: W, height: H, overflow: 'hidden', opacity: panel, transform: `translateY(${(1 - panel) * 60}px)` }}>
                    <div style={{ position: 'absolute', left: 30, top: 18, display: 'flex', gap: 22, fontSize: 22, color: C.steel, zIndex: 2 }}>
                        <span><b style={{ color: BLUE }}>●</b> 2025</span><span><b style={{ color: GREEN }}>●</b> 2026</span>
                    </div>
                    {UNITS.map((u, i) => (
                        <div key={u[0]}>
                            {([0, 1] as const).map(k => {
                                const b = bar(i, k)
                                return <div key={k} style={{ position: 'absolute', left: b.x, top: b.y + 30, width: b.w, height: b.h, background: k ? GREEN : BLUE, borderRadius: 4 }} />
                            })}
                            <div style={{ position: 'absolute', left: 16, top: 70 + i * 48, width: 124, textAlign: 'right', fontSize: 19, color: C.steel, opacity: 1 - labM }}>{u[0]}</div>
                            <div style={{
                                position: 'absolute', left: 70 + i * 82 - 10, top: H - 64, width: 84, textAlign: 'center', fontSize: 17, color: C.steel,
                                opacity: labM, transform: `translateY(${(1 - labM) * 20}px)`,
                            }}>{u[0]}</div>
                        </div>
                    ))}
                </div>
                <div style={{ ...panelStyle, left: 1200, top: 230, width: 610, height: H, padding: '26px 28px', boxSizing: 'border-box', opacity: panel, transform: `translateX(${(1 - panel) * 80}px)` }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: INK }}>Cấu hình biểu đồ</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                        {['Đổi bảng màu', 'Ẩn nhãn dữ liệu', 'Hiện đường lưới'].map(c => (
                            <span key={c} style={{ fontSize: 19, padding: '8px 14px', borderRadius: 999, border: `1px solid ${C.rule}`, color: C.steel }}>{c}</span>
                        ))}
                    </div>
                    {sent && (
                        <div style={{
                            marginTop: 30, marginLeft: 'auto', width: 'fit-content', maxWidth: 440, padding: '14px 18px', borderRadius: 16,
                            background: '#FDEBD3', color: '#9A4A00', fontSize: 24, fontWeight: 600,
                            transform: `scale(${spring({ frame: f - T.send, fps, config: { damping: 13, stiffness: 200 } })})`, transformOrigin: 'right center',
                        }}>{REQ}</div>
                    )}
                    {sent && !done && (
                        <div style={{ marginTop: 22, fontSize: 23, color: C.steel, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 22, height: 22, borderRadius: 11, border: `3px solid ${C.rule}`, borderTopColor: C.violet, transform: `rotate(${f * 18}deg)` }} />
                            Đang xử lý…
                        </div>
                    )}
                    {done && (
                        <div style={{
                            marginTop: 22, display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 600, color: INK,
                            transform: `translateY(${(1 - spring({ frame: f - T.done, fps, config: { damping: 14 } })) * 20}px)`,
                        }}>
                            <span style={{ width: 30, height: 30, borderRadius: 15, background: '#E6F6EE', color: C.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✓</span>
                            Đã chuyển sang biểu đồ cột dọc
                        </div>
                    )}
                    <div style={{
                        position: 'absolute', left: 28, right: 28, bottom: 26, height: 84, borderRadius: 16, border: `2px solid ${f >= T.typeStart - 6 && !sent ? C.violet : C.rule}`,
                        padding: '16px 18px', boxSizing: 'border-box', fontSize: 25, color: typed && !sent ? INK : '#A3A0B8',
                    }}>
                        {typed && !sent ? REQ.slice(0, typed) : 'Yêu cầu thay đổi biểu đồ...'}
                        {typed > 0 && !sent && <span style={{ opacity: f % 16 < 8 ? 1 : 0, color: C.violet }}>|</span>}
                    </div>
                </div>
            </Shake>
            <Burst at={T.done} x={640} y={560} r={220} rays={14} />
            <IllustrationTag />
        </Stage>
    )
}

// ─── AI Agent ────────────────────────────────────────────────────────────────
const AGENT_Q = 'Đơn vị giảm thu mạnh nhất là ai, và khoản mục nào kéo giảm nhiều nhất?'
// Rút gọn từ 8 bước thật (chat 44d11cbf, 21:54) — giữ nguyên nội dung từng bước.
const STEPS: [string, string, string][] = [
    ['Kiểm tra các mốc quý có dữ liệu trong bảng thu ngân sách', 'SELECT MIN(thang) AS min_thang, MAX(thang) AS max_thang FROM thu_ngan_sach', '16ms'],
    ['Xác định đúng phạm vi "quý này" (Q3/2026) và cùng kỳ Q3/2025', "SELECT DATE_TRUNC('quarter', thang) AS quy, SUM(so_thu_trieu_dong) AS tong_thu …", '7ms'],
    ['Tính tổng thu từng đơn vị, chênh lệch tuyệt đối và tỷ lệ %', "WITH quy_data AS ( SELECT don_vi, SUM(CASE WHEN thang >= '2026-07-01' …", '16ms'],
    ['Phân tích từng khoản mục thu của Phường Đông Hải', "WITH dong_hai_data AS ( SELECT khoan_muc, SUM(CASE WHEN thang >= '2025-07-01' …", '20ms'],
    ['Kiểm tra khoản mục kéo giảm ở Xã Tân Lập và Phường Hòa Bình', 'WITH giam_data AS ( SELECT don_vi, khoan_muc, SUM(CASE WHEN … ) …', '24ms'],
    ['So sánh thu theo đơn vị giữa Q3/2026 và cùng kỳ Q3/2025', 'Create Visualization · high confidence', ''],
]
export const AGENT = { flip: 70, qIn: 146, steps: 164, answer: 312 }
// Nhận xét + gợi ý rút gọn từ câu trả lời thật của Agent (chat 44d11cbf)
const AGENT_NOTE = 'Thu tiền sử dụng đất tại Đông Hải hụt hơn 80% (khoảng 7,73 tỷ đồng), cho thấy tiến độ đấu giá hoặc thu nộp nghĩa vụ tài chính đất đai chậm lại trong quý này'
const AGENT_NEXT = ['Tiến độ dự toán của Đông Hải 9 tháng đầu năm?', 'Thu tiền sử dụng đất toàn địa bàn theo tháng?', 'Đơn vị nào tăng thu mạnh nhất quý 3?']

/** Bật AI Agent → chạy từng bước (SQL hiện rõ) → trả lời có lý do. 360f */
export const AgentScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = AGENT
    const sw = spring({ frame: f - T.flip, fps, config: { damping: 12, stiffness: 220 } })
    const swIn = spring({ frame: f - 44, fps, config: { damping: 14 } })
    const swOut = ease(f, [128, 142], [0, 1], Easing.in(Easing.cubic))
    const q = spring({ frame: f - T.qIn, fps, config: { damping: 14, stiffness: 180 } })
    const cues = accel(STEPS.length, 12, 6).map(c => c + T.steps)
    const toAns = ease(f, [T.answer - 6, T.answer + 10], [0, 1], Easing.inOut(Easing.cubic))
    const ans = spring({ frame: f - T.answer, fps, config: { damping: 12, stiffness: 160 } })
    const pctA = interpolate(f, [T.answer + 6, T.answer + 34], [0, 22.97], { ...CLAMP, easing: Easing.out(Easing.cubic) })
    const pctB = interpolate(f, [T.answer + 40, T.answer + 66], [0, 80.95], { ...CLAMP, easing: Easing.out(Easing.cubic) })
    const vn = (n: number) => n.toFixed(2).replace('.', ',')
    return (
        <Stage dark>
            <Shake hits={[T.flip, T.answer, T.answer + 40]} amp={14}>
                <Headline text="Câu hỏi nhiều bước?" at={0} out={40} size={124} top={400} color="#fff" accent={['nhiều bước?']} />
                <Headline text="Bật AI Agent" at={44} out={136} size={112} top={150} color="#fff" accent={['AI Agent']} />
                {f >= 40 && f < 144 && (
                    <div style={{ position: 'absolute', left: 960 - 190, top: 440, width: 380, opacity: swIn * (1 - swOut), transform: `scale(${(0.6 + 0.4 * swIn) * (1 - 0.3 * swOut)})` }}>
                        <div style={{
                            width: 380, height: 190, borderRadius: 95, position: 'relative',
                            background: sw > 0.5 ? GRAD : 'rgba(255,255,255,0.14)', boxShadow: sw > 0.5 ? `0 0 ${80 * sw}px rgba(180,95,216,0.8)` : 'none',
                            border: '3px solid rgba(255,255,255,0.25)',
                        }}>
                            <div style={{ position: 'absolute', top: 15, left: 15 + sw * 190, width: 160, height: 160, borderRadius: 80, background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }} />
                        </div>
                        <div style={{ marginTop: 26, textAlign: 'center', fontSize: 34, fontWeight: 700, color: '#fff', opacity: 0.9 }}>AI Agent (Thinking)</div>
                    </div>
                )}
                {f >= T.qIn && (
                    <div style={{
                        position: 'absolute', right: 150, top: 70 - toAns * 40, maxWidth: 1300, padding: '22px 30px', borderRadius: 26, background: '#fff', color: INK,
                        fontSize: 36, fontWeight: 600, transform: `scale(${q})`, transformOrigin: 'right center', opacity: 1 - toAns,
                    }}>{AGENT_Q}</div>
                )}
                {f >= T.steps - 4 && (
                    <div style={{
                        position: 'absolute', left: 150, right: 150, top: 200, borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
                        padding: '22px 30px', opacity: 1 - toAns, transform: `translateY(${-toAns * 60}px) scale(${1 - toAns * 0.06})`, filter: `blur(${toAns * 6}px)`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 26, color: '#CFC8FF', marginBottom: 12 }}>
                            <b style={{ color: '#fff' }}>8 bước công cụ</b> · Tool Call · SQL Query · Create Visualization
                            <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#fff' }}>48 giây · thời gian thật</span>
                        </div>
                        {STEPS.map(([t, sql, ms], i) => {
                            const p = spring({ frame: f - cues[i], fps, config: { damping: 14, stiffness: 190 } })
                            const sqlN = Math.floor(interpolate(f, [cues[i] + 2, cues[i] + 22], [0, sql.length], CLAMP))
                            return (
                                <div key={i} style={{
                                    display: 'flex', gap: 18, padding: '14px 18px', marginTop: 10, borderRadius: 16, background: 'rgba(255,255,255,0.07)',
                                    opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 120}px)`,
                                }}>
                                    <span style={{ width: 34, height: 34, borderRadius: 17, background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, flexShrink: 0, marginTop: 2, transform: `scale(${p})` }}>✓</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>{t}</div>
                                        <div style={{ fontFamily: MONO, fontSize: 19, color: '#A99CFF', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sql.slice(0, sqlN)}</div>
                                    </div>
                                    <span style={{ fontSize: 20, color: '#CFC8FF' }}>{ms}</span>
                                </div>
                            )
                        })}
                    </div>
                )}
                {f >= T.answer - 2 && (
                    <>
                        <Headline text="Có câu trả lời, kèm lý do" at={T.answer - 2} size={84} top={50} color="#fff" accent={['lý do']} />
                        <div style={{
                            position: 'absolute', left: 200, right: 200, top: 250, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36,
                            opacity: Math.min(1, ans * 2), transform: `translateY(${(1 - ans) * 160}px) scale(${0.9 + 0.1 * ans})`,
                        }}>
                            <div style={{ ...panelStyle, position: 'relative', padding: '40px 44px' }}>
                                <div style={{ fontSize: 28, color: C.steel, fontWeight: 600 }}>Đơn vị giảm thu mạnh nhất</div>
                                <div style={{ fontSize: 64, fontWeight: 800, color: INK, marginTop: 8 }}>Phường Đông Hải</div>
                                <div style={{ fontSize: 150, fontWeight: 800, color: C.red, lineHeight: 1.05, marginTop: 10 }}>−{vn(pctA)}%</div>
                                <div style={{ fontSize: 28, color: C.steel, marginTop: 6 }}>Q3/2026 so với cùng kỳ · 35.523 → 27.365 tr.đ</div>
                            </div>
                            <div style={{ ...panelStyle, position: 'relative', padding: '40px 44px', opacity: f >= T.answer + 36 ? 1 : 0.25 }}>
                                <div style={{ fontSize: 28, color: C.steel, fontWeight: 600 }}>Khoản mục kéo giảm</div>
                                <div style={{ fontSize: 64, fontWeight: 800, color: INK, marginTop: 8 }}>Thu tiền sử dụng đất</div>
                                <div style={{ fontSize: 150, fontWeight: 800, color: C.red, lineHeight: 1.05, marginTop: 10 }}>−{vn(pctB)}%</div>
                                <div style={{ fontSize: 28, color: C.steel, marginTop: 6 }}>chiếm 94,8% mức giảm · 9.549 → 1.819 tr.đ</div>
                            </div>
                        </div>
                        {f >= T.answer + 80 && (
                            <div style={{
                                position: 'absolute', left: 200, right: 200, top: 660, padding: '22px 30px', borderRadius: 20,
                                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 30, lineHeight: 1.4,
                                opacity: ease(f, [T.answer + 80, T.answer + 90], [0, 1]),
                            }}>
                                <b style={{ color: '#F3B5E4' }}>📌 Nhận xét chính: </b>
                                {AGENT_NOTE.slice(0, Math.floor(interpolate(f, [T.answer + 86, T.answer + 136], [0, AGENT_NOTE.length], CLAMP)))}
                            </div>
                        )}
                        {f >= T.answer + 140 && (
                            <div style={{ position: 'absolute', left: 200, right: 200, top: 820 }}>
                                <div style={{ fontSize: 24, color: '#CFC8FF', fontWeight: 600, marginBottom: 12 }}>Gợi ý hỏi tiếp</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                                    {AGENT_NEXT.map((q, k) => {
                                        const p = spring({ frame: f - (T.answer + 144 + k * 9), fps, config: { damping: 13, stiffness: 200 } })
                                        return (
                                            <span key={q} style={{
                                                padding: '12px 22px', borderRadius: 999, border: '2px solid #F3B5E4', color: '#FCE7F6', fontSize: 25, fontWeight: 600, whiteSpace: 'nowrap',
                                                background: 'rgba(232,111,198,0.12)', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 24}px)`,
                                            }}>{q}</span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Shake>
            <Burst at={T.flip + 2} x={960} y={535} r={260} rays={16} color="#E86FC6" />
            <div style={{ position: 'absolute', right: 40, bottom: 26, fontSize: 20, color: '#A9A3D6' }}>Minh hoạ dựng từ các bước và số liệu thật của Semanio</div>
        </Stage>
    )
}

// ─── Xuất trình chiếu ─────────────────────────────────────────────────────────
export const DeckIntro: React.FC = () => (
    <Stage><Headline text="Cần báo cáo trình chiếu?" at={0} size={116} top={410} accent={['trình chiếu?']} /></Stage>
)

const DEFAULT_SLIDES = [1, 2, 4, 5, 6, 7].map(i => `rec/stills/deck-${i}.png`)
/** Slide thật từ file HTML deck Semanio xuất ra, lật từng slide (dừng ~1,3s mỗi slide cho kịp đọc). 330f */
export const DeckScene: React.FC<{ slides?: string[] }> = ({ slides }) => {
    const SLIDES = slides ?? DEFAULT_SLIDES
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const dark = useDark()
    const name = useEdition() === 'internal' ? 'Semantix' : 'Semanio'
    // chỉ số slide đang ở giữa, trôi liên tục; mỗi slide đứng ~22 khung
    // dừng HOLD khung mỗi slide, lật trong MOVE khung
    const HOLD = 40, MOVE = 12, T0 = 24
    const step = Math.max(0, f - T0)
    const k0 = Math.min(SLIDES.length - 1, Math.floor(step / (HOLD + MOVE)))
    const inStep = step - k0 * (HOLD + MOVE)
    const a = k0 >= SLIDES.length - 1 ? SLIDES.length - 1 : k0 + ease(inStep, [HOLD, HOLD + MOVE], [0, 1], Easing.inOut(Easing.cubic))
    const enter = spring({ frame: f - 10, fps, config: { damping: 16, stiffness: 120 } })
    const chipsAt = 30
    return (
        <Stage>
            <Headline text="AI viết sẵn cả nhận định" at={0} size={92} top={46} accent={['nhận định']} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 200, height: 680, perspective: 2400 }}>
                {SLIDES.map((src, k) => {
                    const d = k - a
                    const ad = Math.abs(d)
                    if (ad > 2.6) return null
                    const x = d * 470 + (1 - enter) * 1400
                    const rot = Math.max(-55, Math.min(55, -d * 38))
                    const z = -ad * 260
                    return (
                        <div key={src} style={{
                            position: 'absolute', left: 960 - 520, top: 30, width: 1040, height: 585, borderRadius: 18, overflow: 'hidden',
                            transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rot}deg)`, zIndex: 100 - Math.round(ad * 10),
                            boxShadow: dark ? '0 40px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.22)' : '0 40px 90px rgba(34,26,102,0.35)', opacity: Math.min(1, 2.6 - ad),
                            filter: `brightness(${1 - Math.min(0.35, ad * 0.18)})`,
                        }}>
                            <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )
                })}
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center', gap: 20 }}>
                {['Xuất PowerPoint hoặc HTML', 'Khổ 16:9, trình chiếu ngay', 'AI viết nhận định từng biểu đồ'].map((t, i) => {
                    const p = spring({ frame: f - chipsAt - i * 6, fps, config: { damping: 12, stiffness: 200 } })
                    return <div key={t} style={{ padding: '14px 26px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.12)' : INK, border: dark ? '1px solid rgba(255,255,255,0.3)' : 'none', color: '#fff', fontSize: 28, fontWeight: 700, transform: `scale(${p})` }}>{t}</div>
                })}
            </div>
            <div style={{ position: 'absolute', right: 40, bottom: 26, fontSize: 20, color: dark ? '#A9A3D6' : C.steel, opacity: 0.85 }}>{name === 'Semantix' ? 'Slide thật do Semantix xuất ra · số liệu môi trường UAT (mô phỏng)' : `Slide thật trong file ${name} xuất ra`}</div>
        </Stage>
    )
}
