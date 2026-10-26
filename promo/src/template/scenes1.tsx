import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { LogoReveal } from '../components/LogoReveal'
import { LogoWordmark } from '../components/Logo'
import { ease, INK, panelStyle, Shake, Stage, useDark } from '../promo/kit'
import { ExcelIcon, MONO, accel } from '../promo/scenesA'
import { AGENT_STEPS, BRAND, COLS, N_CUSTOMERS, REPORT_ROWS, SPEC, SPEC_TITLE, SQL_RAN, TEMPLATE_NAME, TOTAL_REPORT_ROWS, type Col, type Row, type SqlLine } from './data'
import { Headline, AppWindow, Badge, Caret, Chip, GRAD, GRAD_H, Ico, ModelWindow, PathCursor, RoleBanner, Spinner, StepRail, pressAt, typed, useTemplateMode, type IconKind  } from './ui'
import { ChatShareIntro } from './scenesChat'

/** Cỡ chữ cho tiêu đề vừa MỘT dòng (luật chữ: không rơi dòng). */
export const fit = (text: string, max = 110, width = 1620) => Math.min(max, Math.floor(width / (text.length * 0.58)))

/** Nhãn trung thực ở góc phải dưới, đổi màu theo nền sáng/tối. */
export const Tag: React.FC<{ text?: string }> = ({ text = `Minh hoạ giao diện ${BRAND} · dữ liệu mô phỏng` }) => {
    const dark = useDark()
    return <div style={{ position: 'absolute', right: 40, bottom: 16, fontSize: 18, color: dark ? '#A9A3D6' : C.steel, opacity: 0.85 }}>{text}</div>
}

// ─── 1 · Nỗi đau: phiếu vào cuối hàng chờ IT, nhích lên từng ngày, sửa tiêu chí là về cuối ─
type Tk = { id: number; label: string; join: number; done?: number }
/** Hàng chờ có sẵn trước khi gửi phiếu; phiếu trên cùng lần lượt xong. */
const PRE_QUEUE: Tk[] = [
    { id: 1282, label: 'Số dư CASA theo kênh mở', join: 0, done: 172 },
    { id: 1283, label: 'Dư nợ quá hạn theo sản phẩm', join: 0, done: 204 },
    { id: 1284, label: 'Tiền gửi đáo hạn tháng 11', join: 0, done: 236 },
    { id: 1285, label: 'Giao dịch lớn cần rà AML', join: 0, done: 268 },
    { id: 1286, label: 'Khách hàng mới theo chi nhánh', join: 0 },
]
/** Phiếu mới vẫn đổ vào sau phiếu FATCA trong lúc chờ. */
const NEW_QUEUE: Tk[] = [
    { id: 1288, label: 'Báo cáo nhanh huy động vốn', join: 150 },
    { id: 1289, label: 'Đối soát phí dịch vụ thẻ', join: 186 },
    { id: 1290, label: 'Danh sách khách vay mới', join: 222 },
    { id: 1291, label: 'Số dư ký quỹ theo dự án', join: 258 },
    { id: 1292, label: 'Thu phí dịch vụ ngân quỹ', join: 292 },
]
const OURS = { id: 1287, label: 'Báo cáo FATCA năm 2025' }
export const HOOK_JOINS = NEW_QUEUE.map(t => t.join)
export const HOOK_DONES = PRE_QUEUE.flatMap(t => (t.done === undefined ? [] : [t.done]))
const SLOT = 84
const QX = 1130, QY = 212, QW = 620
export const HOOK_FLIPS = [156, 170, 184, 198, 212, 226, 240, 254, 268, 282, 296, 310, 356, 368, 380, 392]
const CAL: [string, string][] = [
    ['05', 'Thứ Hai'], ['06', 'Thứ Ba'], ['07', 'Thứ Tư'], ['08', 'Thứ Năm'], ['09', 'Thứ Sáu'],
    ['12', 'Thứ Hai'], ['13', 'Thứ Ba'], ['14', 'Thứ Tư'], ['15', 'Thứ Năm'], ['16', 'Thứ Sáu'],
    ['19', 'Thứ Hai'], ['20', 'Thứ Ba'], ['21', 'Thứ Tư'], ['22', 'Thứ Năm'], ['23', 'Thứ Sáu'],
    ['26', 'Thứ Hai'], ['27', 'Thứ Ba'],
]
const REQ = 'Xuất báo cáo FATCA năm 2025 gửi NHNN, đủ 12 cột đúng mẫu'
export const HOOK = { send: 96, fly: 98, land: 116, change: 330 }

/** Độ có mặt của phiếu trong hàng (0..1): vào mượt 10 khung, xong thì giữ "Đã xong" 8 khung rồi rời hàng. */
const presence = (t: { join: number; done?: number }, f: number) =>
    ease(f, [t.join, t.join + 10], [0, 1]) * (t.done === undefined ? 1 : 1 - ease(f, [t.done + 8, t.done + 20], [0, 1]))
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0)

export const HookScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const card = spring({ frame: f - 4, fps, config: { damping: 200 } })
    const queueIn = spring({ frame: f - 82, fps, config: { damping: 18, stiffness: 140 } })
    const fly = ease(f, [HOOK.fly, HOOK.land], [0, 1], Easing.inOut(Easing.cubic))
    const base = ease(f, [68, 86], [520, 170], Easing.inOut(Easing.cubic))
    const calIn = spring({ frame: f - 146, fps, config: { damping: 16, stiffness: 150 } })

    // Vị trí (slot) mượt của từng phiếu = tổng độ có mặt của các phiếu đứng trước nó.
    // Sửa tiêu chí (HOOK.change): phiếu FATCA chuyển từ trước sang sau toàn bộ phiếu mới.
    const dropP = ease(f, [HOOK.change + 6, HOOK.change + 38], [0, 1], Easing.inOut(Easing.cubic))
    const oursIn = presence({ join: HOOK.land }, f)
    const preP = PRE_QUEUE.map(t => presence(t, f))
    const newP = NEW_QUEUE.map(t => presence(t, f))
    const slotPre = (i: number) => sum(preP.slice(0, i))
    const slotOurs = sum(preP) + dropP * sum(newP)
    const slotNew = (i: number) => sum(preP) + oursIn * (1 - dropP) + sum(newP.slice(0, i))
    const total = Math.round(sum(preP) + oursIn + sum(newP))
    const pos = Math.round(slotOurs) + 1
    const isPiledUp = total >= 7
    const flippedCount = HOOK_FLIPS.filter(t => f >= t).length
    const waitDays = Math.min(17, 1 + flippedCount)
    const landY = QY + 76 + PRE_QUEUE.length * SLOT
    const dropping = f >= HOOK.change
    // Cung đỏ từ chỗ cũ xuống cuối hàng, tính theo hàng lúc sửa tiêu chí
    const fromSlot = sum(PRE_QUEUE.map(t => presence(t, HOOK.change)))
    const toSlot = fromSlot + sum(NEW_QUEUE.map(t => presence(t, HOOK.change)))

    const row = (key: number, label: string, slot: number, p: number, state: 'run' | 'wait' | 'done' | 'ours' | 'drop', leaving = 0) => {
        const ST = {
            run: ['Đang xử lý', '#1D5BD8', '#E8F0FE'],
            wait: ['Đang chờ', '#A15C00', '#FEF3D7'],
            done: ['Đã xong', '#0E7A5F', '#E6F6EE'],
            ours: [`#${pos} / ${total}`, '#5B3FD6', '#EFEAFE'],
            drop: [`#${pos} / ${total}`, '#fff', C.red],
        }[state]
        const isOurs = state === 'ours' || state === 'drop'
        const arcShiftX = state === 'drop' ? Math.sin(dropP * Math.PI) * -28 : 0
        const tiltDeg = state === 'drop' ? Math.sin(dropP * Math.PI) * -3.2 : 0
        return (
            <div key={key} style={{
                position: 'absolute', left: 24, right: 24, top: 76 + slot * SLOT, height: SLOT - 8, borderRadius: 14,
                display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', boxSizing: 'border-box',
                background: state === 'drop' ? '#FDECEA' : isOurs ? '#F6F3FF' : state === 'done' ? '#F3FBF7' : '#FAFAFE',
                border: `${isOurs ? 3 : 1}px solid ${state === 'drop' ? C.red : isOurs ? C.violet : state === 'done' ? '#A6E3C8' : C.rule}`,
                boxShadow: state === 'drop' ? '0 18px 40px rgba(192,57,43,0.28)' : 'none',
                zIndex: isOurs ? 30 : 10, opacity: Math.min(1, p * 1.6),
                transform: `translateX(${(1 - Math.min(1, p + leaving)) * 120 + leaving * 160 + arcShiftX}px) rotate(${tiltDeg}deg) scale(${state === 'drop' && dropP > 0 && dropP < 1 ? 1.05 : 1})`,
            }}>
                <span style={{ fontFamily: MONO, fontSize: 19, fontWeight: 700, color: state === 'drop' ? C.red : isOurs ? C.violet : C.steel }}>#{key}</span>
                <div style={{ flex: 1, minWidth: 0, fontSize: 20.5, fontWeight: 800, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                <span style={{ fontSize: 17.5, fontWeight: 800, padding: '5px 14px', borderRadius: 999, color: ST[1], background: ST[2], whiteSpace: 'nowrap', fontFamily: isOurs ? MONO : undefined }}>{ST[0]}</span>
            </div>
        )
    }

    return (
        <Stage>
            <Shake hits={[HOOK.change + 2]} amp={7}>
                <Headline text="Cần gấp báo cáo 12 cột đúng mẫu NHNN" at={0} out={88} size={fit('Cần gấp báo cáo 12 cột đúng mẫu NHNN', 96)} top={80} accent={['12 cột đúng mẫu NHNN']} />
                <Headline text="Phải lập phiếu nhờ IT kéo số" at={90} out={148} size={fit('Phải lập phiếu nhờ IT kéo số', 96)} top={80} accent={['lập phiếu nhờ IT']} />
                <Headline text="Xếp cuối hàng, nhích lên từng ngày" at={150} out={324} size={fit('Xếp cuối hàng, nhích lên từng ngày', 96)} top={80} accent={['nhích lên từng ngày']} />
                <Headline text="Gần tới lượt, sửa một tiêu chí là về cuối hàng" at={326} size={fit('Gần tới lượt, sửa một tiêu chí là về cuối hàng', 90)} top={80} accent={['về cuối hàng']} />

                {f < HOOK.land + 2 && (
                    <div style={{
                        ...panelStyle, left: interpolate(fly, [0, 1], [base, QX + 24]), top: interpolate(fly, [0, 1], [300, landY]),
                        width: interpolate(fly, [0, 1], [880, QW - 48]), padding: interpolate(fly, [0, 1], [32, 14]), boxSizing: 'border-box',
                        opacity: card * (fly > 0.9 ? 1 - (fly - 0.9) * 10 : 1), transform: `translateY(${(1 - card) * 50}px)`, overflow: 'hidden',
                        height: interpolate(fly, [0, 1], [340, SLOT - 12]), zIndex: 40,
                    }}>
                        <div style={{ opacity: 1 - fly * 1.6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 800, color: INK }}>
                                <Ico k="inbox" size={34} color={C.navy} />Yêu cầu trích xuất dữ liệu
                                <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 24, color: C.steel }}>#{OURS.id}</span>
                            </div>
                            <div style={{ marginTop: 14, fontSize: 24, color: C.steel }}>Gửi tới: Khối Công nghệ thông tin</div>
                            <div style={{ marginTop: 18, minHeight: 92, fontSize: 29, fontWeight: 500, color: INK, lineHeight: 1.4 }}>
                                {typed(f, REQ, 8, 52)}{f < 56 && <Caret />}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                                {f >= 54 && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12, border: `1px solid ${C.rule}`, background: '#FAFAFE',
                                        transform: `scale(${spring({ frame: f - 54, fps, config: { damping: 12, stiffness: 200 } })})`, transformOrigin: 'left center',
                                    }}>
                                        <ExcelIcon size={30} /><span style={{ fontSize: 22, fontWeight: 600, color: INK }}>Mau_FATCA_NHNN.xlsx</span>
                                    </div>
                                )}
                                <div style={{
                                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 14, background: C.violet, color: '#fff',
                                    fontSize: 24, fontWeight: 700, transform: `scale(${pressAt(f, HOOK.send)})`,
                                }}><Ico k="send" size={22} color="#fff" />Gửi yêu cầu</div>
                            </div>
                        </div>
                    </div>
                )}
                <PathCursor from={64} to={HOOK.send + 10} clicks={[HOOK.send]} keys={[[64, 700, 900], [90, 906, 572], [HOOK.send + 10, 906, 572]]} />

                <div style={{
                    ...panelStyle, left: QX, top: QY, width: QW, height: 824, padding: '20px 24px', boxSizing: 'border-box', overflow: 'hidden',
                    border: isPiledUp ? `2.5px solid ${C.red}` : `1px solid ${C.rule}`,
                    opacity: Math.min(1, queueIn * 1.5), transform: `translateX(${(1 - queueIn) * 500}px)`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 25, fontWeight: 800, color: INK }}>
                        <Ico k="clock" size={28} color={isPiledUp ? C.red : C.navy} />Hàng chờ IT
                        <span style={{ marginLeft: 'auto', padding: '5px 14px', borderRadius: 999, fontSize: 19, fontWeight: 800, background: isPiledUp ? '#FDECEA' : '#F1F0F8', color: isPiledUp ? C.red : C.steel }}>
                            {total} yêu cầu{isPiledUp ? ' · Dồn ứ' : ''}
                        </span>
                    </div>
                    {PRE_QUEUE.map((t, i) => {
                        const p = preP[i]
                        if (p <= 0.001) return null
                        const doneNow = t.done !== undefined && f >= t.done
                        const leaving = t.done === undefined ? 0 : ease(f, [t.done + 8, t.done + 20], [0, 1])
                        const state = doneNow ? 'done' : slotPre(i) < 0.5 ? 'run' : 'wait'
                        return row(t.id, t.label, slotPre(i), p, state, leaving)
                    })}
                    {oursIn > 0.001 && row(OURS.id, OURS.label, slotOurs, oursIn, dropping ? 'drop' : 'ours')}
                    {NEW_QUEUE.map((t, i) => (newP[i] > 0.001 ? row(t.id, t.label, slotNew(i), newP[i], 'wait') : null))}
                </div>

                {dropping && (
                    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 80 }}>
                        <defs>
                            <marker id="dropArrow" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
                                <path d="M0,0 L10,5 L0,10 Z" fill={C.red} />
                            </marker>
                        </defs>
                        <circle cx={QX + QW - 14} cy={QY + 76 + fromSlot * SLOT + 32} r={8} fill={C.red} />
                        <path
                            d={`M ${QX + QW - 14} ${QY + 76 + fromSlot * SLOT + 32} C ${QX + QW + 76} ${QY + 240}, ${QX + QW + 76} ${QY + 500}, ${QX + QW - 6} ${QY + 76 + toSlot * SLOT + 32}`}
                            fill="none" stroke={C.red} strokeWidth={4.5} strokeDasharray="10 7" markerEnd="url(#dropArrow)"
                        />
                    </svg>
                )}

                {f >= 146 && (
                    <div style={{ position: 'absolute', left: 260, top: 290, width: 460, height: 520, perspective: 1600, opacity: Math.min(1, calIn * 1.5), transform: `translateY(${(1 - calIn) * 80}px) scale(${0.9 + 0.1 * calIn})` }}>
                        {CAL.map(([d, wd], i) => {
                            const t = HOOK_FLIPS[i]
                            const last = i === CAL.length - 1
                            const dur = i >= 12 ? 7 : 10
                            if (!last && t !== undefined && f > t + dur) return null
                            const p = last || t === undefined ? 0 : ease(f, [t, t + dur], [0, 1], Easing.in(Easing.quad))
                            return (
                                <div key={`${d}-${i}`} style={{
                                    position: 'absolute', inset: 0, zIndex: 100 - i, borderRadius: 26, overflow: 'hidden', background: '#fff', border: `1px solid ${C.rule}`,
                                    boxShadow: '0 30px 70px rgba(34,26,102,0.2)', transformOrigin: 'top center', transform: `rotateX(${-p * 100}deg)`,
                                    backfaceVisibility: 'hidden', filter: `brightness(${1 - p * 0.45})`, opacity: p > 0.85 ? 0 : 1,
                                }}>
                                    <div style={{ height: 116, background: GRAD, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, letterSpacing: '0.08em' }}>THÁNG 10 · 2026</div>
                                    <div style={{ textAlign: 'center', fontSize: 236, fontWeight: 800, color: INK, lineHeight: 1.15, marginTop: 8 }}>{d}</div>
                                    <div style={{ textAlign: 'center', fontSize: 40, fontWeight: 700, color: C.steel }}>{wd}</div>
                                </div>
                            )
                        })}
                        {[125, 335].map(x => <div key={x} style={{ position: 'absolute', left: x - 12, top: -22, width: 24, height: 54, borderRadius: 12, background: '#D8D5F0', zIndex: 200, boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }} />)}
                    </div>
                )}

                {f >= 156 && (
                    <div style={{
                        position: 'absolute', left: 260, top: 836, width: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                        padding: '14px 20px', borderRadius: 16, background: waitDays >= 7 ? '#FDECEA' : '#FEF3D7',
                        border: `2px solid ${waitDays >= 7 ? C.red : '#F59E0B'}`,
                        color: waitDays >= 7 ? C.red : '#B45309', fontSize: 25, fontWeight: 800, boxSizing: 'border-box',
                    }}>
                        <Ico k="clock" size={26} color={waitDays >= 7 ? C.red : '#B45309'} />
                        Chờ {waitDays} ngày
                    </div>
                )}
            </Shake>
        </Stage>
    )
}

// ─── 2 · Bước ngoặt + Thương hiệu + Lợi ích trực tiếp cho Cán bộ Nghiệp vụ ─────────
/** Bản Biz: logo + câu hứa hiện chậm hơn 15 khung để chữ SEMANTIX rơi đúng ô nhịp 16 s của bài nhạc. */
export const TURN_BIZ_SHIFT = 15
export const TurnScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const mode = useTemplateMode()
    const d = mode === 'biz' ? TURN_BIZ_SHIFT : 0
    const slide = spring({ frame: f - 104 - d, fps, config: { damping: 200 } })
    return (
        <Stage>
            <>
                {f < 30 && [0, 1, 2, 3, 4, 5].map(i => {
                    const a = (i / 6) * Math.PI * 2 + 0.4
                    const p = ease(f, [0, 26], [0, 1], Easing.out(Easing.cubic))
                    return <div key={i} style={{ ...panelStyle, left: 860 + Math.cos(a) * 900 * p, top: 500 + Math.sin(a) * 600 * p, width: 220, height: 64, borderRadius: 14, opacity: 1 - p, transform: `rotate(${(i - 2.5) * 30 * p}deg)` }} />
                })}
                <Headline
                    text="Hết cảnh gửi phiếu xếp hàng chờ IT"
                    at={0}
                    out={74 + d}
                    size={fit('Hết cảnh gửi phiếu xếp hàng chờ IT', 108)}
                    top={410}
                    accent={['Hết cảnh']}
                />
                {f >= 70 + d && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: mode === 'biz' ? 300 : 210, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
                        <LogoReveal size={220} delay={70 + d} />
                        <div style={{ width: 1000 * slide, marginLeft: -40 * (1 - slide), overflow: 'hidden' }}>
                            <LogoWordmark fontSize={148} mode="light" text="SEMANTIX" letterProgress={i => ease(f, [108 + d + i * 3, 120 + d + i * 3], [0, 1])} />
                        </div>
                    </div>
                )}
                <Headline
                    text="Hỏi một câu, ra đúng mẫu báo cáo"
                    at={130 + d}
                    size={fit('Hỏi một câu, ra đúng mẫu báo cáo', mode === 'biz' ? 100 : 88)}
                    top={mode === 'biz' ? 640 : 526}
                    accent={['ra đúng mẫu báo cáo']}
                />
                {mode === 'full' && f >= 142 && (
                    <div style={{ position: 'absolute', left: 88, right: 88, top: 696, display: 'flex', justifyContent: 'center', gap: 24 }}>
                        {([
                            ['sparkles', '1 · Chuẩn hoá tiêu chí', 'Nghiệp vụ mô tả, BA rà, có người duyệt', '#EFEAFE', '#5B3FD6'],
                            ['table', '2 · Hỏi ra đúng mẫu', 'Dán yêu cầu, ra đủ 12 cột', '#E8F0FE', '#1D5BD8'],
                            ['users', '3 · Tạo mẫu cho cả phòng', 'Ô nhập tùy chỉnh, tải Excel đúng mẫu', '#E6F6EE', '#0E7A5F'],
                        ] as const).map(([ic, title, desc, bg, fg], i) => {
                            const p = spring({ frame: f - 142 - i * 8, fps, config: { damping: 14, stiffness: 190 } })
                            return (
                                <div key={title} style={{
                                    flex: 1, padding: '22px 26px', borderRadius: 20, background: '#fff', border: `2.5px solid ${bg}`,
                                    boxShadow: '0 16px 40px rgba(34,26,102,0.1)', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 30}px)`,
                                }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: bg, color: fg, fontSize: 19, fontWeight: 800 }}>
                                        <Ico k={ic} size={20} color={fg} />{title}
                                    </div>
                                    <div style={{ marginTop: 14, fontSize: 23, fontWeight: 800, color: INK, lineHeight: 1.32 }}>{desc}</div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </>
        </Stage>
    )
}

// ─── 3 · Mô hình dữ liệu (dành cho BA Data / Kỹ sư dữ liệu) ─────────────────────────
const MCOLS: [string, string, string, string][] = [
    ['cif', 'STRING', 'CIF', 'Khoá'],
    ['effective_date', 'DATE', 'Ngày hiệu lực', 'Thời gian'],
    ['expiry_date', 'DATE', 'Ngày hết hiệu lực', 'Thời gian'],
    ['record_status', 'STRING', 'Trạng thái bản ghi', 'Chiều'],
    ['fatca_country', 'STRING', 'Quốc gia thường trú', 'Chiều'],
    ['tin', 'STRING', 'TIN', 'Chiều'],
]
const MODEL_TABLES = ['fatca_info', 'fatca_reported', 'customer_snapshot', 'casa_account', 'term_deposit']
const MW = { x: 90, y: 176, w: 1740, h: 830 }
/** Lưới biên tập bảng, toạ độ trong cửa sổ Mô hình. */
const MG = { x: 352, headY: 120, rowY: 176, rowH: 66 }
const MG_COLS = [{ h: 'Cột nguồn', w: 330 }, { h: 'Kiểu', w: 150 }, { h: 'Tên nghiệp vụ', w: 600 }, { h: 'Vai trò', w: 260 }]
const mgX = (i: number) => MG.x + MG_COLS.slice(0, i).reduce((s, c) => s + c.w, 0)
/** Mốc gõ tên nghiệp vụ cho dòng i; chip vai trò hiện khi gõ xong. */
export const MODEL_TYPE = (i: number) => 30 + i * 12
export const ModelScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const win = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const seg = spring({ frame: f - 112, fps, config: { damping: 12, stiffness: 170 } })
    return (
        <Stage>
            <RoleBanner role="data" />
            <Headline text="BA Data thiết lập mô hình dữ liệu nền" at={0} out={96} size={fit('BA Data thiết lập mô hình dữ liệu nền', 92)} top={54} accent={['mô hình dữ liệu nền']} />
            <Headline text="Đặt sẵn tên cột nghiệp vụ dễ hiểu" at={98} size={fit('Đặt sẵn tên cột nghiệp vụ dễ hiểu', 88)} top={54} accent={['tên cột nghiệp vụ']} />
            <ModelWindow active={0} style={{ left: MW.x, top: MW.y, width: MW.w, height: MW.h, opacity: win, transform: `translateY(${(1 - win) * 50}px)` }}>
                {/* Danh sách bảng của mô hình */}
                <div style={{ position: 'absolute', left: 16, top: 70, width: 300 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.06em', color: C.steel, padding: '0 10px 4px' }}>BẢNG TRONG MÔ HÌNH</div>
                    {MODEL_TABLES.map((t, i) => (
                        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 12px', marginTop: 6, borderRadius: 12, background: i === 0 ? '#EFEAFE' : 'transparent', fontFamily: MONO, fontSize: 19, fontWeight: i === 0 ? 800 : 500, color: i === 0 ? '#5B3FD6' : '#4A4766' }}>
                            <Ico k="table" size={18} color={i === 0 ? '#5B3FD6' : '#A3A0B8'} />{t}
                        </div>
                    ))}
                </div>
                <div style={{ position: 'absolute', left: 330, top: 52, bottom: 0, width: 1, background: C.rule }} />
                {/* Biên tập bảng fatca_info: mỗi cột nguồn một tên nghiệp vụ */}
                <div style={{ position: 'absolute', left: MG.x, top: 72, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 800, color: INK }}>fatca_info</span>
                    <span style={{ fontSize: 19, color: C.steel }}>Hồ sơ FATCA · {MCOLS.length} cột</span>
                </div>
                <div style={{ position: 'absolute', left: MG.x, top: MG.headY, width: mgX(MG_COLS.length) - MG.x, height: 46, borderRadius: 10, background: '#F4F3FB', display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 800, color: C.navy }}>
                    {MG_COLS.map(c => <span key={c.h} style={{ width: c.w, padding: '0 18px', boxSizing: 'border-box' }}>{c.h}</span>)}
                </div>
                {MCOLS.map(([c, ty, name, role], i) => {
                    const at = MODEL_TYPE(i)
                    const typing = f >= at && f < at + 12
                    const chip = spring({ frame: f - at - 10, fps, config: { damping: 12, stiffness: 200 } })
                    const y = MG.rowY + i * MG.rowH
                    return (
                        <div key={c} style={{ position: 'absolute', left: MG.x, top: y, width: mgX(MG_COLS.length) - MG.x, height: MG.rowH, display: 'flex', alignItems: 'center', borderBottom: '1px solid #EFEEF7' }}>
                            <span style={{ width: MG_COLS[0].w, padding: '0 18px', boxSizing: 'border-box', fontFamily: MONO, fontSize: 20, color: '#4A4766' }}>{c}</span>
                            <span style={{ width: MG_COLS[1].w, padding: '0 18px', boxSizing: 'border-box' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 8, background: '#F1F0F8', color: C.steel, fontSize: 16, fontWeight: 700 }}>{ty === 'DATE' ? 'Ngày' : 'Chữ'}</span>
                            </span>
                            <span style={{ width: MG_COLS[2].w, padding: '0 18px', boxSizing: 'border-box' }}>
                                <span style={{ display: 'flex', alignItems: 'center', height: 46, padding: '0 16px', borderRadius: 10, border: `2px solid ${typing ? C.violet : C.rule}`, background: '#fff', fontSize: 23, fontWeight: 700, color: INK }}>
                                    {typed(f, name, at, at + 10)}{typing && <Caret />}
                                </span>
                            </span>
                            <span style={{ width: MG_COLS[3].w, padding: '0 18px', boxSizing: 'border-box' }}>
                                {f >= at + 10 && <Chip tone={role === 'Khoá' ? 'violet' : role === 'Thời gian' ? 'amber' : 'blue'} style={{ fontSize: 17, transform: `scale(${chip})` }}>{role}</Chip>}
                            </span>
                        </div>
                    )
                })}
                {f >= 108 && (
                    <div style={{ position: 'absolute', left: MG.x, top: MG.rowY + MCOLS.length * MG.rowH + 34, width: mgX(MG_COLS.length) - MG.x, padding: '16px 22px', boxSizing: 'border-box', borderRadius: 16, background: GRAD, color: '#fff', transform: `scale(${0.85 + 0.15 * seg})`, opacity: Math.min(1, seg * 2), transformOrigin: 'left center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, fontWeight: 800 }}><Ico k="sparkles" size={24} color="#fff" />Nền tảng sẵn sàng cho Nghiệp vụ khai thác</div>
                        <div style={{ fontSize: 19, fontWeight: 600, marginTop: 6, opacity: 0.92 }}>Người nghiệp vụ chỉ nhìn thấy tên tiếng Việt quen thuộc</div>
                    </div>
                )}
            </ModelWindow>
            <StepRail active={0} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · tên bảng mô phỏng`} />
        </Stage>
    )
}

// ─── 4 · Nối nhiều bảng bằng quan hệ (dành cho BA Data / Kỹ sư dữ liệu) ──────────────
type TCard = { name: string; x: number; y: number; cols: string[]; key: number }
const CW = 400, HEAD = 54, RH = 42
const T_FAT: TCard = { name: 'fatca_info', x: 140, y: 316, cols: ['cif', 'effective_date', 'expiry_date', 'tin'], key: 0 }
const T_REP: TCard = { name: 'fatca_reported', x: 140, y: 596, cols: ['cif', 'report_year'], key: 0 }
const T_KH: TCard = { name: 'customer_snapshot', x: 760, y: 426, cols: ['cif', 'snapshot_date', 'customer_name', 'customer_type'], key: 0 }
const T_TT: TCard = { name: 'casa_account', x: 1380, y: 316, cols: ['account_no', 'cif', 'currency', 'balance'], key: 1 }
const T_TG: TCard = { name: 'term_deposit', x: 1380, y: 596, cols: ['account_no', 'cif', 'product_currency', 'deposit_amount'], key: 1 }
const colY = (t: TCard, i: number) => t.y + HEAD + 8 + i * RH + RH / 2
export const REL = { detect: 30, dialog: 40, accept: 96, lines: 104, ask: 178 }
const RELS: { from: TCard; pct: string }[] = [
    { from: T_FAT, pct: '100' }, { from: T_REP, pct: '100' }, { from: T_TT, pct: '99,8' }, { from: T_TG, pct: '99,6' },
]
const TableCard: React.FC<{ t: TCard; at: number; hot: boolean }> = ({ t, at, hot }) => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const p = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 170 } })
    return (
        <div style={{ ...panelStyle, left: t.x, top: t.y, width: CW, paddingBottom: 10, overflow: 'hidden', opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 60}px)` }}>
            <div style={{ height: HEAD, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', background: '#F6F3FF', borderBottom: `1px solid ${C.rule}` }}>
                <Ico k="table" size={22} color={C.navy} />
                <span style={{ fontFamily: MONO, fontSize: 19, fontWeight: 800, color: C.navy }}>{t.name}</span>
            </div>
            <div style={{ height: 8 }} />
            {t.cols.map((c, i) => (
                <div key={c} style={{ height: RH, display: 'flex', alignItems: 'center', padding: '0 16px', margin: '0 10px', borderRadius: 10, fontFamily: MONO, fontSize: 18, boxSizing: 'border-box', color: hot && i === t.key ? '#fff' : '#4A4766', background: hot && i === t.key ? C.violet : 'transparent', fontWeight: i === t.key ? 800 : 500 }}>{c}</div>
            ))}
        </div>
    )
}
export const RelScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = REL
    const win = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const dlg = spring({ frame: f - T.dialog, fps, config: { damping: 16, stiffness: 200 } })
    const dlgOut = ease(f, [T.accept + 2, T.accept + 10], [0, 1])
    const pulse = f >= T.ask ? 0.5 + 0.5 * Math.sin((f - T.ask) / 5) : 0
    const q = spring({ frame: f - T.ask, fps, config: { damping: 14, stiffness: 180 } })
    const hot = f >= T.lines
    return (
        <Stage>
            <RoleBanner role="data" />
            <Headline text="Đội Data nối sẵn quan hệ giữa các bảng" at={0} out={T.ask - 4} size={fit('Đội Data nối sẵn quan hệ giữa các bảng', 88)} top={54} accent={['quan hệ giữa các bảng']} />
            <Headline text="Nối một lần, báo cáo nào cũng lấy đủ dữ liệu" at={T.ask} size={fit('Nối một lần, báo cáo nào cũng lấy đủ dữ liệu', 88)} top={54} accent={['lấy đủ dữ liệu']} />
            <ModelWindow active={1} from={0} at={10} style={{ left: 90, top: 176, width: 1740, height: 830, opacity: win, transform: `translateY(${(1 - win) * 50}px)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderBottom: `1px solid ${C.rule}` }}>
                    <span style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 700, color: C.steel }}>{hot ? 4 : 0} Quan hệ</span>
                    <span style={{ marginLeft: 12, marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: C.violet, color: '#fff', fontSize: 18, fontWeight: 800, transform: `scale(${pressAt(f, T.detect)})` }}><Ico k="sparkles" size={18} color="#fff" />Tự động phát hiện</span>
                </div>
            </ModelWindow>
            {[T_FAT, T_REP, T_KH, T_TT, T_TG].map((t, i) => <TableCard key={t.name} t={t} at={8 + i * 4} hot={hot} />)}
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {RELS.map((r, i) => {
                    const p = ease(f, [T.lines + i * 5, T.lines + i * 5 + 16], [0, 1], Easing.inOut(Easing.cubic))
                    if (p <= 0) return null
                    const left = r.from.x < T_KH.x
                    const x0 = left ? r.from.x + CW : r.from.x, y0 = colY(r.from, r.from.key)
                    const x1 = left ? T_KH.x : T_KH.x + CW, y1 = colY(T_KH, 0)
                    const xm = x0 + (x1 - x0) * p, ym = y0 + (y1 - y0) * p
                    const dx = (x1 - x0) / 2
                    return (
                        <g key={i}>
                            <path d={`M${x0} ${y0} C ${x0 + dx} ${y0}, ${xm - dx * p} ${ym}, ${xm} ${ym}`} stroke={C.violet} strokeWidth={4 + pulse * 3} fill="none" strokeLinecap="round" opacity={0.85} />
                            {p > 0.98 && (
                                <g transform={`translate(${(x0 + x1) / 2}, ${(y0 + y1) / 2 + (y0 < y1 ? -22 : 22)})`}>
                                    <rect x={-28} y={-17} width={56} height={32} rx={10} fill="#fff" stroke={C.violet} strokeWidth={2} />
                                    <text x={0} y={6} textAnchor="middle" fontFamily={MONO} fontSize={18} fontWeight={800} fill={C.navy}>N:1</text>
                                </g>
                            )}
                        </g>
                    )
                })}
            </svg>
            {f >= T.dialog && f < T.accept + 10 && (
                <div style={{ ...panelStyle, left: 560, top: 330, width: 800, padding: '22px 26px', boxSizing: 'border-box', zIndex: 60, opacity: Math.min(1, dlg * 2) * (1 - dlgOut), transform: `scale(${0.94 + 0.06 * dlg})` }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: INK }}>Quan hệ được phát hiện tự động</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, color: C.steel, marginTop: 6 }}><Ico k="sparkles" size={18} color={C.violet} />AI phân tích & xác thực · Kiểm bằng dữ liệu</div>
                    {RELS.map((r, i) => {
                        const p = ease(f, [T.dialog + 8 + i * 5, T.dialog + 16 + i * 5], [0, 1])
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '10px 14px', borderRadius: 12, background: '#F6F3FF', opacity: p }}>
                                <span style={{ width: 24, height: 24, borderRadius: 6, background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k="check" size={16} color="#fff" stroke={3} /></span>
                                <span style={{ fontFamily: MONO, fontSize: 18, color: INK, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    {r.from.name}.cif <Ico k="arrowRight" size={16} color={C.violet} /> customer_snapshot.cif
                                </span>
                                <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                    <Chip tone="violet" style={{ fontSize: 15, padding: '3px 9px' }}>N:1</Chip>
                                    <Chip tone="green" style={{ fontSize: 15, padding: '3px 9px' }}>Khớp {r.pct}%</Chip>
                                </span>
                            </div>
                        )
                    })}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <span style={{ padding: '11px 20px', borderRadius: 10, background: C.violet, color: '#fff', fontSize: 19, fontWeight: 800, transform: `scale(${pressAt(f, T.accept)})` }}>Chấp nhận đã chọn</span>
                    </div>
                </div>
            )}
            {f >= T.accept + 6 && f < T.ask && (
                <div style={{ position: 'absolute', left: 960 - 170, top: 880, width: 340, padding: '12px 18px', borderRadius: 14, background: '#fff', border: `1px solid ${C.rule}`, boxShadow: '0 14px 34px rgba(34,26,102,0.16)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 21, fontWeight: 700, color: INK, opacity: ease(f, [T.accept + 6, T.accept + 14], [0, 1]) }}>
                    <Ico k="check" size={22} color={C.emerald} stroke={3} />Đã thêm 4 quan hệ
                </div>
            )}
            {f >= T.ask && (
                <div style={{ position: 'absolute', left: 960 - 520, top: 900, width: 1040, padding: '14px 22px', borderRadius: 18, background: GRAD_H, color: '#fff', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, fontWeight: 600, transform: `scale(${q})` }}>
                    <Ico k="table" size={24} color="#fff" />Báo cáo FATCA tự lấy hồ sơ, tài khoản, tiền gửi theo cùng một CIF
                </div>
            )}
            <PathCursor from={12} to={T.accept + 12} clicks={[T.detect, T.accept]} keys={[[12, 1400, 700], [T.detect - 8, 1692, 256], [T.detect + 30, 1692, 256], [T.accept - 8, 1300, 640], [T.accept + 12, 1300, 640]]} />
            <StepRail active={0} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · quan hệ mô phỏng`} />
        </Stage>
    )
}

// ─── 5 · Dán nguyên yêu cầu nghiệp vụ vào Agent (90% Cán bộ Nghiệp vụ) ────────────────
export const SqlBlock: React.FC<{ lines: SqlLine[]; at: number; size?: number; per?: number }> = ({ lines, at, size = 21, per = 3 }) => {
    const f = useCurrentFrame()
    return (
        <div style={{ fontFamily: MONO, fontSize: size, lineHeight: 1.65, color: '#E7E3FF', whiteSpace: 'pre' }}>
            {lines.map((l, i) => {
                const p = ease(f, [at + i * per, at + i * per + 8], [0, 1])
                return (
                    <div key={i} style={{ opacity: p, transform: `translateX(${(1 - p) * 20}px)` }}>
                        {l.map((s, k) => <span key={k} style={{ color: /^\s*\)?,?\s*(WITH|SELECT|FROM|WHERE|AND|QUALIFY|UNION ALL|JOIN)\b/.test(s.t) ? '#B7AEFF' : undefined }}>{s.t}</span>)}
                    </div>
                )
            })}
        </div>
    )
}

/** Bảng kết quả hiển thị 8 cột cốt lõi chữ TO, rõ ràng + huy hiệu "Đủ 12 cột mẫu NHNN". */
const VIEW_COLS = COLS.filter(c => c.key !== 'ten_ngan_hang' && c.key !== 'giin' && c.key !== 'tin' && c.key !== 'quoc_gia')
export const ResultTable: React.FC<{ rows: Row[]; at: number; width: number; rowH?: number; spotAt?: number; cols?: Col[]; colAt?: number }> = ({ rows, at, width, rowH = 58, spotAt, cols = VIEW_COLS, colAt }) => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const VIEW_COLS = cols
    const total = VIEW_COLS.reduce((s, c) => s + c.w, 0)
    /** Cột thứ i hiện dần từ colAt + i * 5 (không truyền colAt thì hiện cả bảng một lượt). */
    const colP = (i: number) => (colAt === undefined ? 1 : ease(f, [colAt + i * 5, colAt + i * 5 + 8], [0, 1]))
    const fs = VIEW_COLS.length > 8 ? 19 : 22
    const k = (width - 48) / total
    const spot = spotAt === undefined ? 0 : ease(f, [spotAt, spotAt + 10], [0, 1])
    return (
        <div style={{ fontVariantNumeric: 'tabular-nums' }}>
            <div style={{ display: 'flex', fontSize: 19, fontWeight: 800, color: C.navy, padding: '10px 24px', borderBottom: `2px solid ${C.rule}`, background: '#F8F7FC' }}>
                {VIEW_COLS.map((c, i) => <span key={c.key} style={{ width: c.w * k, textAlign: c.num ? 'right' : 'left', paddingRight: c.num ? 16 : 0, whiteSpace: 'nowrap', overflow: 'hidden', opacity: colP(i) }}>{c.header}</span>)}
            </div>
            {rows.map((r, i) => {
                const p = spring({ frame: f - at - i * 3, fps, config: { damping: 16, stiffness: 190 } })
                const hi = spot > 0 && (r.dong === 'Y' || r.so_tk === '' || (r.tien_te !== 'USD' && r.tien_te !== ''))
                return (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', height: rowH, padding: '0 24px', fontSize: fs, color: INK, borderBottom: '1px solid #EFEEF7',
                        background: hi ? `rgba(232,111,198,${0.12 * spot})` : 'transparent', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 14}px)`,
                    }}>
                        {VIEW_COLS.map((c, ci) => (
                            <span key={c.key} style={{
                                width: c.w * k, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: c.num ? 'right' : 'left', paddingRight: c.num ? 16 : 0, opacity: colP(ci),
                                fontFamily: c.key === 'cif' || c.key === 'so_tai_khoan' ? MONO : undefined, fontSize: c.key === 'cif' || c.key === 'so_tai_khoan' ? fs - 1 : fs,
                                fontWeight: c.key === 'so_du' || c.key === 'ten_chu_tai_khoan' ? 800 : 600,
                                color: c.key === 'dong_trong_nam' && r.dong === 'Y' ? C.red : c.key === 'ca_nhan_to_chuc' || c.key === 'loai' ? C.steel : INK,
                            }}>{c.get(r)}</span>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}

export const ToolRow: React.FC<{ hot?: number; press?: number; style?: React.CSSProperties }> = ({ hot = 0, press = 1, style }) => (
    <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 16, background: '#fff', border: `1px solid ${C.rule}`, boxShadow: '0 12px 30px rgba(34,26,102,0.12)', boxSizing: 'border-box', ...style }}>
        <span style={{ width: 34, height: 34, borderRadius: 17, background: '#E6F6EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k="check" size={20} color={C.emerald} stroke={3} /></span>
        <span style={{ fontSize: 22, fontWeight: 800, color: INK }}>Truy vấn hoàn tất</span>
        <span style={{ fontSize: 20, color: C.steel, fontWeight: 600 }}>Đủ 12 cột mẫu NHNN · {N_CUSTOMERS} khách hàng · {TOTAL_REPORT_ROWS} dòng</span>
        <span style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderRadius: 12, fontSize: 21, fontWeight: 800,
            color: hot ? '#fff' : C.navy, background: hot ? C.violet : '#EFEAFE', border: `2px solid ${hot ? C.violet : '#CFC8FF'}`, transform: `scale(${press})`,
        }}><Ico k="fileDown" size={22} color={hot ? '#fff' : C.navy} />Tạo template tải dữ liệu</span>
    </div>
)

export const ASK_T = { paste: 16, send: 92, steps: 108, result: 254, cols: 266, count: 324 }
export const AskScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = ASK_T
    const win = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const paste = spring({ frame: f - T.paste, fps, config: { damping: 18, stiffness: 160 } })
    const out = ease(f, [T.result - 8, T.result + 6], [0, 1], Easing.inOut(Easing.cubic))
    const rise = spring({ frame: f - T.result, fps, config: { damping: 18, stiffness: 120 } })
    const cues = accel(AGENT_STEPS.length, 30, 24).map(c => c + T.steps)
    const shown = Math.min(COLS.length, Math.max(0, Math.floor((f - T.cols) / 5) + 1))
    return (
        <Stage dark>
            <RoleBanner role="enduser" />
            <Headline text="Dán nguyên yêu cầu báo cáo bằng tiếng Việt" at={0} out={T.steps + 14} size={fit('Dán nguyên yêu cầu báo cáo bằng tiếng Việt', 86)} top={54} color="#fff" accent={['Dán nguyên yêu cầu', 'tiếng Việt']} />
            <Headline text="AI dùng đúng tiêu chí phòng đã duyệt" at={T.steps + 18} out={T.result - 6} size={fit('AI dùng đúng tiêu chí phòng đã duyệt', 90)} top={54} color="#fff" accent={['tiêu chí phòng đã duyệt']} />
            <Headline text="Ra đúng 12 cột theo mẫu NHNN" at={T.result} size={fit('Ra đúng 12 cột theo mẫu NHNN', 92)} top={54} color="#fff" accent={['đúng 12 cột']} />
            {f < T.result + 8 && (
                <div style={{ position: 'absolute', inset: 0, opacity: 1 - out, transform: `scale(${1 - out * 0.05})` }}>
                    <AppWindow title="Phân tích · FATCA (Cán bộ Nghiệp vụ hỏi trực tiếp)" icon="chat" style={{ left: 90, top: 174, width: 880, height: 820, opacity: win, transform: `translateY(${(1 - win) * 50}px)` }}>
                        <span style={{ position: 'absolute', right: 18, top: 8, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, background: GRAD_H, color: '#fff', fontSize: 17, fontWeight: 800 }}><Ico k="bot" size={18} color="#fff" />AI Agent</span>
                        <div style={{ position: 'absolute', left: 24, right: 24, top: 68, bottom: 24, borderRadius: 16, border: `2px solid ${f < T.send ? C.violet : C.rule}`, padding: '20px 24px', boxSizing: 'border-box', overflow: 'hidden', background: '#FAFAFE' }}>
                            {f < T.paste ? <span style={{ fontSize: 24, color: '#A3A0B8' }}>Dán yêu cầu báo cáo bằng tiếng Việt<Caret /></span> : (
                                <div style={{ opacity: Math.min(1, paste * 2), transform: `translateY(${(1 - paste) * 16}px)` }}>
                                    {SPEC.map((l, i) => (
                                        <div key={i} style={{
                                            fontSize: i === 0 ? 32 : 29, lineHeight: 1.45,
                                            color: i === 0 ? C.navy : INK, fontWeight: i === 0 ? 800 : 600,
                                            marginTop: i === 0 ? 0 : 26, padding: i === 1 ? '10px 14px' : 0,
                                            borderRadius: 10, background: i === 1 ? '#EFEAFE' : 'transparent',
                                        }}>{l}</div>
                                    ))}
                                </div>
                            )}
                            <span style={{ position: 'absolute', right: 18, bottom: 18, width: 58, height: 58, borderRadius: 16, background: f >= T.paste ? C.violet : '#E5E3F2', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pressAt(f, T.send)})` }}><Ico k="send" size={26} color="#fff" /></span>
                        </div>
                        {f >= T.paste && f < T.paste + 12 && <div style={{ position: 'absolute', left: 24, right: 24, top: 68, bottom: 24, borderRadius: 16, background: 'rgba(109,93,246,0.12)', opacity: 1 - (f - T.paste) / 12 }} />}
                    </AppWindow>
                    {f >= T.steps - 4 && (
                        <div style={{ position: 'absolute', left: 1000, top: 174, width: 830, height: 820, borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', padding: '26px 28px', boxSizing: 'border-box', opacity: ease(f, [T.steps - 4, T.steps + 6], [0, 1]) }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, color: '#CFC8FF', marginBottom: 14 }}>
                                <Ico k="bot" size={26} color="#fff" /><b style={{ color: '#fff' }}>AI Agent</b> · Tự động xử lý {AGENT_STEPS.length} bước
                                <span style={{ marginLeft: 'auto' }}><Badge kind="sim" size={16} /></span>
                            </div>
                            {AGENT_STEPS.map(([t, d, sql], i) => {
                                const p = spring({ frame: f - cues[i], fps, config: { damping: 14, stiffness: 190 } })
                                const doing = f < (cues[i + 1] ?? T.result - 40)
                                return f >= cues[i] ? (
                                    <div key={i} style={{ display: 'flex', gap: 16, padding: '18px 20px', marginTop: 16, borderRadius: 18, background: 'rgba(255,255,255,0.08)', opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 120}px)` }}>
                                        <span style={{ width: 38, height: 38, borderRadius: 19, background: doing ? 'transparent' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>{doing ? <Spinner size={26} color="#B7AEFF" /> : <Ico k="check" size={22} color="#fff" stroke={3} />}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{t}</div>
                                            <div style={{ fontSize: 20, fontWeight: 600, color: '#DDD6FE', marginTop: 4 }}>{d}</div>
                                            {sql && <div style={{ fontFamily: MONO, fontSize: 18, color: '#A6E3C8', marginTop: 8 }}>{typed(f, sql, cues[i] + 2, cues[i] + 18)}</div>}
                                        </div>
                                    </div>
                                ) : null
                            })}
                        </div>
                    )}
                </div>
            )}
            {f >= T.result && (
                <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - rise) * 700}px)` }}>
                    <div style={{ ...panelStyle, left: 110, top: 174, width: 1700, padding: '20px 0 14px', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px 14px' }}>
                            <span style={{ fontSize: 28, fontWeight: 800, color: INK }}>{TEMPLATE_NAME}</span>
                            <Chip tone={shown >= COLS.length ? 'green' : 'violet'} style={{ fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>{shown >= COLS.length && <Ico k="check" size={20} stroke={3} />}{shown}/{COLS.length} cột mẫu NHNN</Chip>
                            <span style={{ fontSize: 20, fontWeight: 600, color: C.steel }}>{N_CUSTOMERS} khách hàng · {TOTAL_REPORT_ROWS} dòng</span>
                            <span style={{ marginLeft: 'auto' }}><Badge kind="sim" size={16} /></span>
                        </div>
                        <ResultTable rows={REPORT_ROWS} at={T.result + 6} width={1700} rowH={62} cols={COLS} colAt={T.cols} />
                    </div>
                    {/* Bộ đếm cột to: thấy ngay "đủ 12 cột" mà không phải đọc bảng */}
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 22, padding: '22px 44px', borderRadius: 28, fontVariantNumeric: 'tabular-nums',
                            background: shown >= COLS.length ? 'rgba(16,185,129,0.16)' : 'rgba(255,255,255,0.08)', border: `2px solid ${shown >= COLS.length ? '#34D399' : 'rgba(255,255,255,0.2)'}`,
                            transform: `scale(${shown >= COLS.length ? spring({ frame: f - T.count, fps, config: { damping: 10, stiffness: 200 } }) * 0.08 + 0.92 : 0.92})`,
                        }}>
                            {shown >= COLS.length && <Ico k="check" size={56} color="#34D399" stroke={3} />}
                            <span style={{ fontSize: 72, fontWeight: 800, color: '#fff' }}>{shown}/{COLS.length}</span>
                            <span style={{ fontSize: 40, fontWeight: 800, color: '#CFC8FF' }}>cột đúng mẫu NHNN</span>
                        </div>
                    </div>
                </div>
            )}
            <PathCursor from={T.send - 24} to={T.send + 12} clicks={[T.send]} keys={[[T.send - 24, 700, 700], [T.send - 6, 918, 946], [T.send + 12, 918, 946]]} />
            <StepRail active={2} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · kết quả mô phỏng`} />
        </Stage>
    )
}

// ─── 5b · Hỏi đào sâu tiếp trên kết quả, tự động vẽ biểu đồ & nhận xét ──────────────
export const DRILL_T = { typeStart: 10, typeEnd: 56, lift: 68, chart: 82, bars: 94, insight: 168 }
const DRILL_PROMPT = 'Số dư FATCA chia theo nhóm khách và tiền tệ?'
const DRILL_BARS: { label: string; sub: string; usd: string; pct: number; color: string; badge: string; alert?: boolean }[] = [
    { label: 'Tổ chức · USD', sub: '4 khách', usd: '412.800 USD', pct: 0.92, color: C.violet, badge: '58% số dư' },
    { label: 'Cá nhân · USD', sub: '2 khách', usd: '243.450 USD', pct: 0.54, color: '#3B82F6', badge: '34% · 1 TK đã đóng' },
    { label: 'Cá nhân · EUR', sub: '1 khách', usd: '57.200 USD', pct: 0.13, color: '#EC4899', badge: 'Giữ nguyên EUR', alert: true },
]

export const AskDrillScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = DRILL_T
    const lift = ease(f, [T.lift, T.lift + 22], [0, 1], Easing.inOut(Easing.cubic))
    const leftCard = spring({ frame: f - T.chart, fps, config: { damping: 16, stiffness: 150 } })
    const rightCard = spring({ frame: f - T.chart - 8, fps, config: { damping: 16, stiffness: 150 } })
    const noteIn = spring({ frame: f - T.insight, fps, config: { damping: 14, stiffness: 180 } })

    return (
        <Stage dark>
            <RoleBanner role="enduser" />
            <Headline
                text="Ngả 1 · Hỏi tiếp ngay trên kết quả"
                at={0}
                out={T.insight - 6}
                size={fit('Ngả 1 · Hỏi tiếp ngay trên kết quả', 90)}
                top={54}
                color="#fff"
                accent={['Hỏi tiếp']}
            />
            <Headline
                text="AI vẽ biểu đồ, chỉ ra điểm cần lưu ý"
                at={T.insight}
                size={fit('AI vẽ biểu đồ, chỉ ra điểm cần lưu ý', 90)}
                top={54}
                color="#fff"
                accent={['điểm cần lưu ý']}
            />

            {/* Thanh câu hỏi hội thoại nối tiếp (nhấc từ giữa lên đầu giống promo đầu tiên) */}
            <div style={{
                ...panelStyle,
                left: 110, width: 1700,
                top: interpolate(lift, [0, 1], [380, 168]),
                padding: '18px 28px', boxSizing: 'border-box',
                background: '#16132B', border: `2px solid ${C.violet}`,
                boxShadow: '0 24px 60px rgba(109,93,246,0.32)',
                display: 'flex', alignItems: 'center', gap: 16,
            }}>
                <span style={{
                    width: 44, height: 44, borderRadius: 14, background: GRAD,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Ico k="chat" size={24} color="#fff" />
                </span>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {typed(f, DRILL_PROMPT, T.typeStart, T.typeEnd)}
                    {f < T.typeEnd + 8 && <Caret color="#E86FC6" />}
                </div>
                <span style={{
                    marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.1)',
                    color: '#CFC8FF', fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                    <Ico k="sparkles" size={18} color="#CFC8FF" />Hỏi nối tiếp
                </span>
            </div>

            {/* Khung biểu đồ phân tích bên trái + Thẻ tổng hợp bên phải */}
            {f >= T.chart && (
                <>
                    <div style={{
                        ...panelStyle, left: 110, top: 274, width: 1120, height: 550,
                        padding: '26px 32px', boxSizing: 'border-box',
                        opacity: Math.min(1, leftCard * 1.8), transform: `translateY(${(1 - leftCard) * 50}px)`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ width: 38, height: 38, borderRadius: 12, background: '#EFEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Ico k="barChart" size={22} color={C.violet} />
                            </span>
                            <div>
                                <div style={{ fontSize: 25, fontWeight: 800, color: INK }}>Số dư FATCA theo nhóm khách và tiền tệ</div>
                                <div style={{ fontSize: 18, fontWeight: 600, color: C.steel }}>Đơn vị: USD quy đổi</div>
                            </div>
                            <span style={{ marginLeft: 'auto' }}><Badge kind="sim" size={15} /></span>
                        </div>

                        {DRILL_BARS.map((b, i) => {
                            const barP = spring({ frame: f - (T.bars + i * 12), fps, config: { damping: 15, stiffness: 140 } })
                            const badgeP = spring({ frame: f - (T.bars + 24 + i * 10), fps, config: { damping: 13, stiffness: 200 } })
                            return (
                                <div key={b.label} style={{ marginTop: i === 0 ? 28 : 26 }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div>
                                            <span style={{ fontSize: 23, fontWeight: 800, color: INK }}>{b.label}</span>
                                            <span style={{ marginLeft: 12, fontSize: 18, fontWeight: 600, color: C.steel }}>{b.sub}</span>
                                        </div>
                                        <span style={{ fontFamily: MONO, fontSize: 25, fontWeight: 800, color: INK }}>{b.usd}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ flex: 1, height: 48, borderRadius: 14, background: '#F1EFFB', overflow: 'hidden', position: 'relative' }}>
                                            <div style={{
                                                width: `${b.pct * 100 * barP}%`, height: '100%', borderRadius: 14,
                                                background: i === 0 ? GRAD_H : b.color,
                                            }} />
                                        </div>
                                        <span style={{
                                            padding: '8px 16px', borderRadius: 999, fontSize: 18.5, fontWeight: 800, whiteSpace: 'nowrap',
                                            background: b.alert ? '#FDECEA' : '#EFEAFE',
                                            color: b.alert ? C.red : '#5B3FD6',
                                            border: `1.5px solid ${b.alert ? '#F5B7B1' : '#CFC8FF'}`,
                                            transform: `scale(${badgeP})`, opacity: Math.min(1, badgeP * 2),
                                        }}>
                                            {b.badge}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Cột phải: Thẻ KPI Tổng số dư & Tóm tắt nhanh */}
                    <div style={{
                        ...panelStyle, left: 1254, top: 274, width: 556, height: 250,
                        padding: '28px 30px', boxSizing: 'border-box',
                        opacity: Math.min(1, rightCard * 1.8), transform: `translateY(${(1 - rightCard) * 50}px)`,
                    }}>
                        <div style={{ fontSize: 19, fontWeight: 800, color: C.steel, letterSpacing: '0.02em' }}>TỔNG SỐ DƯ THUỘC DIỆN FATCA</div>
                        <div style={{ marginTop: 10, fontSize: 58, fontWeight: 800, color: C.navy, fontFamily: MONO, lineHeight: 1.1 }}>
                            713.450 <span style={{ fontSize: 28, color: C.violet }}>USD</span>
                        </div>
                        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: '#E6F6EE', color: C.emerald, fontSize: 18, fontWeight: 800 }}>
                            <Ico k="check" size={18} color={C.emerald} stroke={3} />7 khách hàng · 11 dòng
                        </div>
                    </div>
                </>
            )}

            {/* Thanh AI Nhận xét ở đáy (giống promo đầu tiên) */}
            {f >= T.insight && (
                <div style={{
                    position: 'absolute', left: 110, width: 1700, top: 848,
                    padding: '18px 28px', borderRadius: 18, background: '#16132B',
                    border: '2px solid #8B5CF6', color: '#fff', boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', gap: 14, fontSize: 23, fontWeight: 600,
                    opacity: Math.min(1, noteIn * 2), transform: `translateY(${(1 - noteIn) * 30}px)`,
                }}>
                    <span style={{ padding: '6px 14px', borderRadius: 10, background: GRAD, fontWeight: 800, fontSize: 20, whiteSpace: 'nowrap' }}>
                        AI nhận xét
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Tổ chức chiếm <b style={{ color: '#F0ABFC' }}>58%</b> số dư · khoản <b style={{ color: '#FDE68A' }}>EUR</b> giữ nguyên tệ khi lập báo cáo NHNN
                    </span>
                </div>
            )}

            <StepRail active={3} branch={0} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · Phân tích biểu đồ tức thì`} />
        </Stage>
    )
}

// ─── 6 · Ngả 3: tạo mẫu từ kết quả, thêm ô nhập tùy chỉnh, chia sẻ cho cả phòng ──────
export const BTN = { click: 60, morph: 70, name: 92, inputs: 116, share: 200, save: 240 }
const SHARE_INPUTS: { icon: IconKind; label: string; value: string; ai?: boolean }[] = [
    { icon: 'calendarClock', label: 'Năm báo cáo', value: '2025' },
    { icon: 'input', label: 'Tỷ giá USD/VND', value: '26.000' },
    { icon: 'sparkles', label: 'Điều kiện lọc', value: 'Gõ bằng lời', ai: true },
]
const WIN = { x: 260, y: 196, w: 1400 }
/** Tâm nút Lưu mẫu: thanh tiêu đề AppWindow 46 + hàng chia sẻ top 470 cao 96; nút sát mép phải hàng (36 + 22), rộng ~186. */
const SAVE_AT = { x: WIN.x + WIN.w - 36 - 22 - 93, y: WIN.y + 46 + 470 + 48 }

export const ButtonScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = BTN
    const win = spring({ frame: f - T.morph - 6, fps, config: { damping: 18, stiffness: 140 } })
    const pop = (at: number) => spring({ frame: f - at, fps, config: { damping: 14, stiffness: 200 } })
    const shareOn = ease(f, [T.share + 12, T.share + 20], [0, 1])
    const saved = f >= T.save + 4
    return (
        <Stage>
            <RoleBanner role="enduser" />
            <Headline text="Ngả 3 · Tạo mẫu ngay từ kết quả này" at={0} out={T.inputs - 16} size={fit('Ngả 3 · Tạo mẫu ngay từ kết quả này', 90)} top={54} accent={['Tạo mẫu']} />
            <Headline text="Thêm ô nhập để mỗi kỳ tự đổi" at={T.inputs - 12} out={T.share - 6} size={fit('Thêm ô nhập để mỗi kỳ tự đổi', 92)} top={54} accent={['ô nhập']} />
            <Headline text="Chia sẻ cho cả phòng dùng chung" at={T.share} size={fit('Chia sẻ cho cả phòng dùng chung', 92)} top={54} accent={['cả phòng']} />
            {/* Cùng khung chat: cuộn ngược lên tin kết quả rồi bấm nút thứ ba */}
            <ChatShareIntro click={T.click} morph={T.morph} />
            {f >= T.morph && (
                <AppWindow title="Mẫu dữ liệu mới · tạo từ kết quả hỏi" icon="fileDown" barColor={C.navy} style={{
                    left: WIN.x, top: WIN.y, width: WIN.w, height: 640, opacity: Math.min(1, win * 1.6), transform: `translateY(${(1 - win) * 80}px) scale(${0.88 + 0.12 * win})`,
                }}>
                    <div style={{ position: 'relative', padding: '0 36px' }}>
                        {/* Tên mẫu: tự điền từ câu hỏi */}
                        <div style={{ position: 'absolute', left: 36, right: 36, top: 28, height: 96, borderRadius: 18, border: `2.5px solid ${pop(T.name) > 0.5 ? '#A6E3C8' : C.rule}`, background: pop(T.name) > 0.5 ? '#F3FBF7' : '#FAFAFE', display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px', boxSizing: 'border-box' }}>
                            <span style={{ fontSize: 22, fontWeight: 800, color: C.steel, whiteSpace: 'nowrap' }}>Tên mẫu</span>
                            <span style={{ fontSize: 30, fontWeight: 800, color: INK, opacity: pop(T.name) }}>{TEMPLATE_NAME}</span>
                            <span style={{ marginLeft: 'auto', width: 46, height: 46, borderRadius: 23, background: '#E6F6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(T.name)})` }}>
                                <Ico k="check" size={26} color={C.emerald} stroke={3} />
                            </span>
                        </div>

                        {/* Ô nhập tùy chỉnh: hiện lần lượt */}
                        <div style={{ position: 'absolute', left: 36, top: 156, fontSize: 23, fontWeight: 800, color: C.navy, opacity: ease(f, [T.inputs - 8, T.inputs + 2], [0, 1]) }}>
                            Ô nhập cho người dùng mẫu
                        </div>
                        <div style={{ position: 'absolute', left: 36, right: 36, top: 200, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
                            {SHARE_INPUTS.map((it, i) => {
                                const p = pop(T.inputs + i * 18)
                                return (
                                    <div key={it.label} style={{
                                        padding: '22px 24px', borderRadius: 20, background: '#fff', boxSizing: 'border-box', height: 196,
                                        border: `2.5px solid ${it.ai ? '#C4B5FD' : '#DCE6FB'}`, boxShadow: '0 14px 36px rgba(34,26,102,0.08)',
                                        opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 25, fontWeight: 800, color: INK }}>
                                            <span style={{ width: 46, height: 46, borderRadius: 14, background: it.ai ? GRAD : '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Ico k={it.icon} size={24} color={it.ai ? '#fff' : '#1D5BD8'} />
                                            </span>
                                            {it.label}
                                        </div>
                                        <div style={{ marginTop: 22, padding: '14px 18px', borderRadius: 14, border: `1.5px solid ${C.rule}`, background: '#FAFAFE', fontSize: 27, fontWeight: 700, color: it.ai ? '#8A84B3' : INK, fontStyle: it.ai ? 'italic' : undefined }}>
                                            {it.value}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Chia sẻ + Lưu */}
                        {f >= T.share && (
                            <div style={{
                                position: 'absolute', left: 36, right: 36, top: 470, height: 96, borderRadius: 18, background: '#F6F3FF', border: '2px solid #DCD3FF',
                                display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', boxSizing: 'border-box',
                                opacity: Math.min(1, pop(T.share) * 2), transform: `translateY(${(1 - pop(T.share)) * 30}px)`,
                            }}>
                                <Ico k="users" size={34} color={C.violet} />
                                <span style={{ fontSize: 26, fontWeight: 800, color: INK }}>Chia sẻ cho</span>
                                <Chip tone="violet" style={{ fontSize: 24 }}>Phòng Tuân thủ</Chip>
                                <span style={{ width: 74, height: 40, borderRadius: 20, background: shareOn > 0.5 ? C.emerald : '#D9D6EA', position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: 4, left: 4 + 34 * shareOn, width: 32, height: 32, borderRadius: 16, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
                                </span>
                                <span style={{
                                    marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 26px', borderRadius: 14, fontSize: 25, fontWeight: 800,
                                    color: '#fff', background: saved ? C.emerald : C.violet, transform: `scale(${pressAt(f, T.save)})`,
                                }}>
                                    <Ico k={saved ? 'check' : 'bookmark'} size={24} color="#fff" stroke={saved ? 3 : 2} />{saved ? 'Đã lưu' : 'Lưu mẫu'}
                                </span>
                            </div>
                        )}
                    </div>
                </AppWindow>
            )}
            <PathCursor from={T.share + 4} to={T.save + 30} clicks={[T.save]} keys={[[T.share + 4, 1180, 900], [T.save - 8, SAVE_AT.x, SAVE_AT.y], [T.save + 30, SAVE_AT.x, SAVE_AT.y]]} />
            <StepRail active={3} branch={2} />
            <Tag />
        </Stage>
    )
}

export type { IconKind }
