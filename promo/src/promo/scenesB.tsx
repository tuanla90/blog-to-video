import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { siTelegram } from 'simple-icons'
import { C } from '../theme'
import { LogoMark, LogoWordmark } from '../components/Logo'
import { ACCENT_TEXT, CLAMP, ease, Headline, INK, panelStyle, Stage, useEdition } from './kit'
import { IllustrationTag, MONO } from './scenesA'
import { Marquee, ROW_1, ROW_2 } from '../scenes/StatsOverlay'

/** 6 — AI không tự bịa số: sơ đồ rút gọn dựng dần theo từng dòng chữ. 390f */
type Node = { x: number; y: number; w: number; h: number }
const N: Record<string, Node> = {
    user: { x: 110, y: 560, w: 330, h: 130 },
    sem: { x: 740, y: 520, w: 440, h: 210 },
    ai: { x: 800, y: 250, w: 320, h: 120 },
    db: { x: 1480, y: 560, w: 330, h: 130 },
    log: { x: 760, y: 820, w: 400, h: 170 },
}
const mid = (n: Node, side: 'l' | 'r' | 't' | 'b') =>
    side === 'l' ? [n.x, n.y + n.h / 2] : side === 'r' ? [n.x + n.w, n.y + n.h / 2] : side === 't' ? [n.x + n.w / 2, n.y] : [n.x + n.w / 2, n.y + n.h]

const Arrow: React.FC<{ from: number[]; to: number[]; at: number; color: string; label?: string; dashed?: boolean; lx?: number; ly?: number }> = ({ from, to, at, color, label, dashed, lx = 0, ly = -14 }) => {
    const f = useCurrentFrame()
    const p = ease(f, [at, at + 14], [0, 1])
    if (p <= 0) return null
    const x2 = from[0] + (to[0] - from[0]) * p
    const y2 = from[1] + (to[1] - from[1]) * p
    return (
        <g>
            <line x1={from[0]} y1={from[1]} x2={x2} y2={y2} stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={dashed ? '14 12' : undefined} />
            {p > 0.98 && !dashed && <circle cx={to[0]} cy={to[1]} r={8} fill={color} />}
            {label && p > 0.6 && (
                <text x={(from[0] + to[0]) / 2 + lx} y={(from[1] + to[1]) / 2 + ly} textAnchor="middle" fontFamily={MONO} fontSize={24} fontWeight={700} fill={color}>{label}</text>
            )}
        </g>
    )
}

const Box: React.FC<{ n: Node; at: number; title: string; sub?: string; accent?: boolean; children?: React.ReactNode }> = ({ n, at, title, sub, accent, children }) => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const p = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 170 } })
    if (f < at) return null
    return (
        <div style={{
            ...panelStyle, left: n.x, top: n.y, width: n.w, minHeight: n.h, padding: '20px 24px', boxSizing: 'border-box',
            border: accent ? `3px solid ${C.violet}` : panelStyle.border, transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 1.5),
        }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: accent ? C.navy : INK }}>{title}</div>
            {sub && <div style={{ fontSize: 22, color: C.steel, marginTop: 6 }}>{sub}</div>}
            {children}
        </div>
    )
}

export const SemanticScene: React.FC = () => {
    const f = useCurrentFrame()
    const internal = useEdition() === 'internal'
    const logLines = internal
        ? ['08:30:12  hỏi "số dư so kế hoạch"', '08:30:13  chỉ đọc · phân quyền dòng', '08:30:14  trả 5 dòng · đã ghi vết']
        : ['09:00:12  hỏi "giảm thu so cùng kỳ"', '09:00:13  SQL có kiểm soát · RLS', '09:00:14  trả 24 dòng · đã ghi vết']
    const shown = Math.floor(interpolate(f, [292, 322], [0, 3.99], CLAMP))
    const diag = ease(f, [56, 66], [0, 1])
    return (
        <Stage>
            <Headline text="AI không tự bịa số" at={0} out={52} size={150} top={400} accent={['bịa số']} />
            <Headline text="Một chỉ số, một công thức" at={58} out={126} size={92} top={60} accent={['một công thức']} />
            <Headline text="AI chỉ thấy định nghĩa" at={128} out={196} size={92} top={60} accent={['định nghĩa']} />
            <Headline text="Truy vấn do hệ thống sinh" at={198} out={266} size={92} top={60} accent={['hệ thống']} />
            <Headline text={internal ? 'Dữ liệu ở lại ngân hàng' : 'Dữ liệu ở lại đơn vị'} at={268} size={92} top={60} accent={internal ? ['ở lại ngân hàng'] : ['ở lại đơn vị']} />
            <div style={{ position: 'absolute', inset: 0, opacity: diag }}>
                <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
                    <Arrow from={mid(N.user, 'r')} to={mid(N.sem, 'l')} at={64} color={C.navy} />
                    <Arrow from={[N.sem.x + 150, N.sem.y]} to={[N.ai.x + 110, N.ai.y + N.ai.h]} at={140} color={C.emerald} label="chỉ định nghĩa" lx={-120} />
                    <Arrow from={[N.ai.x + 210, N.ai.y + N.ai.h]} to={[N.sem.x + 290, N.sem.y]} at={152} color={C.steel} label="kế hoạch" lx={100} />
                    <Arrow from={mid(N.sem, 'r')} to={mid(N.db, 'l')} at={210} color={C.navy} label={internal ? 'truy vấn chỉ đọc' : 'SQL có kiểm soát'} />
                    <Arrow from={mid(N.db, 't')} to={mid(N.ai, 'r')} at={276} color={C.red} dashed label="dữ liệu thô ✕" lx={60} ly={-30} />
                    <Arrow from={mid(N.sem, 'b')} to={mid(N.log, 't')} at={286} color={C.steel} />
                </svg>
                <Box n={N.user} at={60} title="Cán bộ" sub="hỏi bằng tiếng Việt" />
                <Box n={N.sem} at={62} title={internal ? 'Semantix' : 'Semanio'} sub="Lớp Ngữ Nghĩa" accent>
                    <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.navy, background: '#EEEBFF', borderRadius: 10, padding: '8px 12px', opacity: ease(f, [74, 84], [0, 1]) }}>
                        {internal ? 'Tổng số dư = SUM(Số dư gốc)' : 'Tổng thu = SUM(so_thu)'}
                    </div>
                </Box>
                <Box n={N.ai} at={134} title="AI" sub="Gemini · Claude · GPT" />
                <Box n={N.db} at={204} title={internal ? 'Kho dữ liệu' : 'CSDL đơn vị'} sub={internal ? 'trong hạ tầng ngân hàng' : 'máy chủ nội bộ'} />
                <Box n={N.log} at={288} title="Nhật ký truy vết">
                    <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 18, color: C.steel, lineHeight: 1.5 }}>
                        {logLines.slice(0, shown).map(l => <div key={l}>{l}</div>)}
                    </div>
                </Box>
            </div>
        </Stage>
    )
}

/** 7 — Ghim thành dashboard, đổi bộ lọc là cập nhật (số liệu: YTD → quý này, thật). 180f */
const KPIS: [string, string, string, string][] = [
    ['Tổng thu', '3,36 Tr', '288 Ng', '#0E7A5F'],
    ['Tỷ lệ hoàn thành dự toán', '90,93%', '86,4%', '#B4287A'],
    ['Tổng giải ngân', '163,08 Ng', '64,07 Ng', '#1D5BD8'],
    ['Tỷ lệ giải ngân', '7,41%', '11,65%', '#A15C00'],
]
const UNITS = [42.2, 32.3, 27.4, 20.8, 37.3, 23.4, 30.3, 17.7, 14.6, 14.2, 12.1, 15.8]
export const DashScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const board = spring({ frame: f - 6, fps, config: { damping: 200 } })
    const fly = spring({ frame: f - 22, fps, config: { damping: 16, stiffness: 120 } })
    const swap = ease(f, [112, 124], [0, 1])
    const chip = spring({ frame: f - 104, fps, config: { damping: 12, stiffness: 190 } })
    return (
        <Stage>
            <Headline text="Ghim thành dashboard" at={0} out={96} size={104} top={60} accent={['dashboard']} />
            <Headline text="Đổi bộ lọc, cập nhật tức thì" at={98} size={96} top={60} accent={['tức thì']} />
            <div style={{ ...panelStyle, left: 150, top: 210, width: 1620, height: 820, padding: '26px 30px', opacity: board, transform: `translateY(${(1 - board) * 50}px)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: INK }}>Báo cáo Tình hình Thu Ngân sách & Giải ngân Đầu tư Công</div>
                    {f >= 104 && (
                        <div style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 12, background: '#FEF3D7', color: '#A15C00', fontSize: 24, fontWeight: 800, transform: `scale(${chip})` }}>
                            📅 Quý này
                        </div>
                    )}
                </div>
                <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
                    {KPIS.map(([label, a, b, color]) => (
                        <div key={label} style={{ borderRadius: 16, padding: '18px 22px', background: `${color}14`, border: `1px solid ${color}33`, overflow: 'hidden', height: 118, boxSizing: 'border-box' }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color }}>{label}</div>
                            <div style={{ position: 'relative', height: 60, marginTop: 6 }}>
                                <div style={{ position: 'absolute', fontSize: 48, fontWeight: 800, color, transform: `translateY(${-swap * 60}px)`, opacity: 1 - swap }}>{a}</div>
                                <div style={{ position: 'absolute', fontSize: 48, fontWeight: 800, color, transform: `translateY(${(1 - swap) * 60}px)`, opacity: swap }}>{b}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 22, display: 'flex', gap: 18, height: 560 }}>
                    <div style={{ flex: 1, borderRadius: 16, border: `1px solid ${C.rule}`, padding: '20px 24px', position: 'relative', transform: `translateX(${(1 - fly) * 900}px) rotate(${(1 - fly) * 6}deg)`, opacity: Math.min(1, fly * 1.4) }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: INK }}>Tiến độ thu theo đơn vị</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 400, marginTop: 30, padding: '0 10px' }}>
                            {UNITS.map((v, i) => (
                                <div key={i} style={{ flex: 1, height: `${(v / 44) * 100 * ease(f, [36 + i * 2, 50 + i * 2], [0, 1])}%`, borderRadius: '8px 8px 0 0', background: '#12B981' }} />
                            ))}
                        </div>
                        {f >= 50 && (
                            <div style={{ position: 'absolute', top: 18, right: 22, padding: '6px 14px', borderRadius: 10, background: C.violet, color: '#fff', fontSize: 20, fontWeight: 800, transform: `scale(${spring({ frame: f - 50, fps, config: { damping: 11, stiffness: 190 } })})` }}>
                                📌 Đã ghim
                            </div>
                        )}
                    </div>
                    <div style={{ width: 460, borderRadius: 16, border: `1px solid ${C.rule}`, padding: '20px 24px', opacity: board }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: INK }}>Cơ cấu nguồn thu</div>
                        <svg viewBox="0 0 200 200" width={360} height={360} style={{ display: 'block', margin: '40px auto 0' }}>
                            {[[0, 0.388, '#3B82F6'], [0.388, 0.64, '#10B981'], [0.64, 0.84, '#F59E0B'], [0.84, 1, '#8B5CF6']].map(([a, b, col], i) => {
                                const A = (Number(a) * 2 * Math.PI) - Math.PI / 2
                                const B = (Number(a) + (Number(b) - Number(a)) * ease(f, [20, 50], [0, 1])) * 2 * Math.PI - Math.PI / 2
                                const large = B - A > Math.PI ? 1 : 0
                                return <path key={i} d={`M100 100 L${100 + 90 * Math.cos(A)} ${100 + 90 * Math.sin(A)} A90 90 0 ${large} 1 ${100 + 90 * Math.cos(B)} ${100 + 90 * Math.sin(B)} Z`} fill={String(col)} />
                            })}
                        </svg>
                    </div>
                </div>
            </div>
            <IllustrationTag />
        </Stage>
    )
}

/**
 * 8 — Hỏi ngay trên Zalo. Ảnh biểu đồ là ảnh thật bot đã gửi; lời nhận xét và gợi ý hỏi
 * tiếp là GIẢ LẬP (rút gọn) theo đúng các phần API bot trả về: answer · shareUrl ·
 * suggestedQueries (app/api/v1/chat/route.ts). Số: lũy kế năm, đơn vị đúng. 330f
 */
const ZALO_NOTE = 'Tổng thu lũy kế của 12 đơn vị khoảng 3.358 tỷ đồng. Phường An Phú dẫn đầu với 457,6 tỷ, gấp gần 3,5 lần Xã Sông Trà (132,2 tỷ). 5 đơn vị đứng đầu đóng góp khoảng 58% tổng thu'
const ZALO_NEXT = ['Đơn vị nào đạt tiến độ dự toán thấp nhất?', 'Cơ cấu nguồn thu của Phường An Phú?', 'Số thu quý này so với cùng kỳ?']
/** Gạch đầu dòng hiện đúng lúc bong bóng tương ứng hiện trên điện thoại. */
const ZALO_GETS: [string, number][] = [['Có biểu đồ', 88], ['Có nhận xét tự động', 116], ['Có gợi ý hỏi tiếp', 190]]
/**
 * Kênh khác, gắn chung "Hỏi đáp và nhận báo cáo cả trên" (user chốt 2026-09-12). Hiện tại
 * Telegram/Teams đã có bot hỏi đáp; Slack mới gửi báo cáo/cảnh báo (lib/messaging/channels/slack.ts)
 * — PHẢI có hỏi đáp Slack trước ngày trình chiếu. Teams/Slack không có trong simple-icons → ô chữ cái.
 */
type Channel = { name: string; color: string; path?: string; letter?: string }
const CHANNELS: Channel[] = [
    { name: 'Telegram', color: '#26A5E4', path: siTelegram.path },
    { name: 'Teams', color: '#5B5FC7', letter: 'T' },
    { name: 'Slack', color: '#4A154B', letter: '#' },
]
const ChannelLogo: React.FC<{ c: Channel }> = ({ c }) => c.path ? (
    <svg width={46} height={46} viewBox="0 0 24 24" fill={c.color}><path d={c.path} /></svg>
) : (
    <div style={{ width: 46, height: 46, borderRadius: 12, background: c.color, color: '#fff', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.letter}</div>
)
export const ZaloScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const phone = spring({ frame: f - 4, fps, config: { damping: 200 } })
    const b = (at: number) => spring({ frame: f - at, fps, config: { damping: 13, stiffness: 180 } })
    const S = 390 / 416 // ảnh gốc: vùng biểu đồ 416×240 trong khung 540×960
    const scroll = ease(f, [150, 190], [0, 1], Easing.inOut(Easing.cubic))
    const bubble: React.CSSProperties = { alignSelf: 'flex-start', background: '#fff', borderRadius: 16, maxWidth: 400 }
    return (
        <Stage>
            <Headline text="Hỏi ngay trên Zalo" at={0} size={110} top={130} align="left" left={150} width={960} accent={['Zalo']} />
            <div style={{ position: 'absolute', left: 150, top: 395, fontSize: 46, fontWeight: 600, color: C.steel, opacity: ease(f, [14, 26], [0, 1]) }}>
                Không cần mở máy tính
            </div>
            <div style={{ position: 'absolute', left: 150, top: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ZALO_GETS.map(([t, at]) => {
                    const p = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 190 } })
                    return (
                        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 42, fontWeight: 700, color: INK, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * -60}px)` }}>
                            <span style={{ width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(135deg, #6D5DF6, #E86FC6)', color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                            {t}
                        </div>
                    )
                })}
            </div>
            {f >= 212 && (
                <div style={{ position: 'absolute', left: 150, top: 735, fontSize: 28, fontWeight: 600, color: C.steel, opacity: ease(f, [212, 222], [0, 1]) }}>Hỏi đáp và nhận báo cáo cả trên</div>
            )}
            <div style={{ position: 'absolute', left: 150, top: 785, display: 'flex', gap: 18 }}>
                {CHANNELS.map((c, k) => {
                    const p = spring({ frame: f - (222 + k * 16), fps, config: { damping: 12, stiffness: 200 } })
                    return (
                        <div key={c.name} style={{
                            ...panelStyle, position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 18,
                            opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 50}px) scale(${0.85 + 0.15 * p})`,
                        }}>
                            <ChannelLogo c={c} />
                            <div style={{ fontSize: 32, fontWeight: 800, color: INK }}>{c.name}</div>
                        </div>
                    )
                })}
            </div>
            <div style={{
                position: 'absolute', left: 1160, top: 80, width: 470, height: 930, borderRadius: 60, background: '#0E0B1F', padding: 14,
                boxShadow: '0 40px 100px rgba(34,26,102,0.35)', transform: `translateY(${(1 - phone) * 120}px)`, opacity: phone,
            }}>
                <div style={{ width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', background: '#E2E8F0', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 110, bottom: 0, overflow: 'hidden' }}>
                        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, transform: `translateY(${-scroll * 360}px)` }}>
                            {f >= 22 && <div style={{ alignSelf: 'flex-end', background: '#D4EBFF', borderRadius: 16, padding: '12px 18px', fontSize: 24, transform: `scale(${b(22)})`, transformOrigin: 'right center' }}>Số thu từng đơn vị</div>}
                            {f >= 40 && f < 84 && <div style={{ ...bubble, padding: '12px 18px', fontSize: 22, color: C.steel, transform: `scale(${b(40)})`, transformOrigin: 'left center' }}>🔍 Đang xử lý câu hỏi…</div>}
                            {f >= 84 && (
                                <div style={{ ...bubble, padding: 10, transform: `scale(${b(84)})`, transformOrigin: 'left top' }}>
                                    <div style={{ width: 390, height: 240 * S, overflow: 'hidden', borderRadius: 10, position: 'relative' }}>
                                        <Img src={staticFile('footage/holds/canh7@26.80.png')} style={{ position: 'absolute', width: 540 * S, height: 960 * S, left: -62 * S, top: -112 * S, maxWidth: 'none' }} />
                                    </div>
                                </div>
                            )}
                            {f >= 112 && (
                                <div style={{ ...bubble, padding: '14px 18px', fontSize: 21, lineHeight: 1.42, color: INK, transform: `scale(${b(112)})`, transformOrigin: 'left top' }}>
                                    📊 {ZALO_NOTE}
                                    <div style={{ marginTop: 10, color: '#0068FF' }}>📈 Xem biểu đồ tương tác: https://semanio.vn/share/…</div>
                                </div>
                            )}
                            {f >= 186 && (
                                <div style={{ ...bubble, padding: '14px 18px', fontSize: 21, color: INK, transform: `scale(${b(186)})`, transformOrigin: 'left top' }}>
                                    💡 Bạn có thể hỏi tiếp:
                                    {ZALO_NEXT.map((q, k) => (
                                        <div key={q} style={{
                                            marginTop: 10, padding: '10px 14px', borderRadius: 12, background: '#EEF4FF', color: '#0050C8', fontWeight: 600,
                                            opacity: ease(f, [196 + k * 8, 206 + k * 8], [0, 1]), transform: `translateX(${(1 - ease(f, [196 + k * 8, 208 + k * 8], [0, 1])) * 30}px)`,
                                        }}>{k + 1}. {q}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 110, background: '#0068FF', color: '#fff', padding: '52px 26px 0', fontSize: 26, fontWeight: 700, boxSizing: 'border-box' }}>‹  Trợ lý Semanio</div>
                </div>
            </div>
            <IllustrationTag />
        </Stage>
    )
}

/** 9 — Kết nối dữ liệu sẵn có: 2 hàng CSDL chạy ngược chiều (từ StatsOverlay) + 3 ý chính. 225f */
export const StatsScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const edition = useEdition()
    const items = [
        'Kết nối trực tiếp 12 hệ CSDL và Google Sheets',
        edition === 'internal' ? 'Phân quyền tới từng dòng, từng cột' : 'Nộp Excel/CSV theo mẫu, lệch mẫu là chặn',
        edition === 'dfl' ? 'Triển khai riêng từng đơn vị, không giới hạn số cán bộ' : edition === 'internal' ? 'Triển khai trên hạ tầng riêng của ngân hàng' : 'Triển khai riêng, không giới hạn người dùng',
    ]
    const rows = spring({ frame: f - 8, fps, config: { damping: 200 } })
    return (
        <Stage>
            <Headline text="Kết nối thẳng vào dữ liệu đang có" at={0} size={84} top={64} accent={['dữ liệu đang có']} />
            <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: 26, opacity: rows, transform: `translateY(${(1 - rows) * 40}px)` }}>
                <Marquee items={ROW_1} secondsPerLoop={16} />
                <Marquee items={ROW_2} reverse secondsPerLoop={18} />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                {items.map((t, i) => {
                    const p = spring({ frame: f - 36 - i * 26, fps, config: { damping: 13, stiffness: 190 } })
                    return (
                        <div key={t} style={{
                            display: 'flex', alignItems: 'center', gap: 20, padding: '18px 36px', borderRadius: 18, background: '#fff',
                            border: `2px solid ${C.pink}`, boxShadow: '0 14px 34px rgba(34,26,102,0.12)',
                            fontSize: 40, fontWeight: 700, color: INK, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * -120}px)`,
                        }}>
                            <span style={{ width: 16, height: 16, borderRadius: 8, background: C.pink }} />{t}
                        </div>
                    )
                })}
            </div>
        </Stage>
    )
}

/** 10 — Kết. 180f */
export const OutroScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const p = spring({ frame: f, fps, config: { damping: 200 } })
    const url = spring({ frame: f - 30, fps, config: { damping: 12, stiffness: 170 } })
    const edition = useEdition()
    return (
        <Stage>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36, opacity: p, transform: `scale(${0.92 + 0.08 * p})` }}>
                <LogoMark size={190} />
                <LogoWordmark fontSize={140} mode="light" text={edition === 'internal' ? 'SEMANTIX' : 'SEMANIO'} />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
                <div style={{ padding: '18px 44px', borderRadius: 999, background: 'linear-gradient(90deg, #6D5DF6, #E86FC6)', color: '#fff', fontSize: edition === 'internal' ? 46 : 56, fontWeight: 800, whiteSpace: 'nowrap', transform: `scale(${url})` }}>
                    {edition === 'internal' ? 'Dùng thử: https://app.example.com' : 'Dùng thử: https://semanio.vn'}
                </div>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontSize: 36, color: C.steel, opacity: ease(f, [50, 64], [0, 1]) }}>
                {edition === 'dfl' ? 'NCB Team · Data for Life 2026 · Đề bài VLTN-05' : edition === 'internal' ? 'Trợ lý phân tích dữ liệu cho toàn hàng · hỏi bằng tiếng Việt' : 'Trợ lý phân tích dữ liệu AI · hỏi bằng tiếng Việt'}
            </div>
            {edition === 'internal' && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontSize: 26, color: C.steel, opacity: 0.8 * ease(f, [60, 74], [0, 1]) }}>
                    Số liệu trong video lấy từ môi trường UAT (dữ liệu mô phỏng) · tính năng là bản thật đang chạy
                </div>
            )}
            <div style={{ display: 'none' }}>
            </div>
        </Stage>
    )
}
