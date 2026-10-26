import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { LogoMark } from '../components/Logo'
import { Burst, ease, INK, panelStyle, Stage } from '../promo/kit'
import { BANK, BRAND, COLS, EMAIL, GIIN, N_CUSTOMERS, REPORT_ROWS, SPEC, TEMPLATE_NAME, TOTAL_REPORT_ROWS } from './data'
import { fit, ResultTable, Tag } from './scenes1'
import { Headline, Badge, Caret, GRAD, GRAD_H, Ico, PathCursor, RoleBanner, Spinner, StepRail, pressAt, typed, type IconKind  } from './ui'

/*
 * Khung chat hai bên dùng chung cho bản Biz (vòng 4c): bạn nhắn bên phải, AI trả lời bên trái,
 * tin nổi dần lên, tin cũ cuộn lên. Các cảnh hỏi → hỏi tiếp → hẹn lịch → tạo mẫu là MỘT cuộc
 * trò chuyện: cảnh sau dựng lại các tin cảnh trước ở trạng thái đã hiện (at âm).
 * Chiều cao mỗi tin cố định để tính cuộn chắc chắn (không đo DOM lúc render).
 */

/** Đỉnh 176 chừa chỗ cho đuôi chữ tiêu đề; đáy ~1016 để không đè dòng chú thích minh hoạ góc phải dưới. */
const CHAT = { x: 250, y: 176, w: 1420, h: 840, head: 58, foot: 118 }
const BODY_H = CHAT.h - CHAT.head - CHAT.foot
const GAP = 22
const PAD = 26
const AVATAR = 46
const SHOWN = -1000   // tin đã có từ cảnh trước

export type Msg = { key: string; side: 'user' | 'ai'; at: number; until?: number; h: number; w: number; bare?: boolean; render: (f: number) => React.ReactNode }

const appear = (m: Msg, f: number) => ease(f, [m.at, m.at + 9], [0, 1], Easing.out(Easing.cubic)) * (m.until === undefined ? 1 : 1 - ease(f, [m.until, m.until + 6], [0, 1]))

/** Vị trí đầu mỗi tin trong dòng chat (đã tính tin đang nổi lên / đang tắt). */
const layout = (msgs: Msg[], f: number) => {
    let y = 0
    return msgs.map(m => {
        const a = appear(m, f)
        const top = y
        y += (m.h + GAP) * a
        return { m, a, top, end: y }
    })
}
const contentH = (msgs: Msg[], f: number) => layout(msgs, f).reduce((s, l) => Math.max(s, l.end), 0)
/** Cuộn tự động: luôn thấy trọn tin mới nhất. */
export const autoScroll = (msgs: Msg[], f: number) => Math.max(0, contentH(msgs, f) + PAD - BODY_H)
/** Toạ độ màn hình của đỉnh một tin khi cuộn `scroll`. */
export const msgTopOnScreen = (msgs: Msg[], key: string, f: number, scroll: number) => {
    const l = layout(msgs, f).find(x => x.m.key === key)
    return CHAT.y + CHAT.head + PAD + (l ? l.top : 0) - scroll
}

const Bubble: React.FC<{ m: Msg; a: number; top: number; f: number }> = ({ m, a, top, f }) => {
    const user = m.side === 'user'
    return (
        <div style={{
            position: 'absolute', top, [user ? 'right' : 'left']: PAD, display: 'flex', gap: 14, flexDirection: user ? 'row-reverse' : 'row', alignItems: 'flex-end',
            opacity: Math.min(1, a * 1.6), transform: `translateY(${(1 - a) * 28}px) scale(${0.96 + 0.04 * a})`, transformOrigin: user ? 'bottom right' : 'bottom left',
        }}>
            {!user && (
                <span style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, background: '#fff', border: `1.5px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LogoMark size={30} />
                </span>
            )}
            <div style={{
                width: m.w, height: m.h, boxSizing: 'border-box', overflow: 'hidden', flexShrink: 0,
                ...(m.bare ? {} : user
                    ? { background: GRAD_H, color: '#fff', borderRadius: '26px 26px 8px 26px', padding: '18px 26px', fontSize: 27, fontWeight: 600, lineHeight: 1.4 }
                    : { background: '#fff', color: INK, border: `1.5px solid ${C.rule}`, borderRadius: '26px 26px 26px 8px', padding: '20px 26px', boxShadow: '0 10px 30px rgba(34,26,102,0.08)' }),
            }}>{m.render(f)}</div>
        </div>
    )
}

/** Khung chat: thanh tiêu đề, dòng tin (cuộn), ô soạn có nút gửi. */
export const ChatShell: React.FC<{
    msgs: Msg[]; scroll?: number; composer?: React.ReactNode; composerOn?: boolean; sendAt?: number; style?: React.CSSProperties
}> = ({ msgs, scroll, composer, composerOn = false, sendAt = -99, style }) => {
    const f = useCurrentFrame()
    const sc = scroll ?? autoScroll(msgs, f)
    return (
        <div style={{ ...panelStyle, left: CHAT.x, top: CHAT.y, width: CHAT.w, height: CHAT.h, overflow: 'hidden', ...style }}>
            <div style={{ height: CHAT.head, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', borderBottom: `1px solid ${C.rule}`, background: '#FAFAFE' }}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
                <span style={{ marginLeft: 8, fontSize: 21, fontWeight: 800, color: C.navy }}>Hỏi {BRAND} · Phân tích FATCA</span>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: GRAD_H, color: '#fff', fontSize: 17, fontWeight: 800 }}><Ico k="bot" size={18} color="#fff" />AI Agent</span>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: CHAT.head, height: BODY_H, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: PAD - sc }}>
                    {layout(msgs, f).map(({ m, a, top }) => (a > 0.001 ? <Bubble key={m.key} m={m} a={a} top={top} f={f} /> : null))}
                </div>
            </div>
            <div style={{ position: 'absolute', left: 24, right: 24, bottom: 24, height: CHAT.foot - 44, borderRadius: 18, border: `2px solid ${composerOn ? C.violet : C.rule}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px 0 24px', boxSizing: 'border-box' }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: composer ? INK : '#A3A0B8' }}>{composer ?? 'Hỏi hoặc dán yêu cầu báo cáo…'}</span>
                <span style={{ width: 54, height: 54, borderRadius: 16, background: composerOn ? C.violet : '#E5E3F2', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pressAt(f, sendAt)})` }}><Ico k="send" size={26} color="#fff" /></span>
            </div>
        </div>
    )
}
/** Toạ độ nút gửi (để con trỏ bấm). */
export const SEND_AT = { x: CHAT.x + CHAT.w - 24 - 14 - 27, y: CHAT.y + CHAT.h - 24 - (CHAT.foot - 44) / 2 }

/** Chấm "đang trả lời". */
const Dots: React.FC<{ f: number }> = ({ f }) => (
    <div style={{ display: 'flex', gap: 9, alignItems: 'center', height: '100%' }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 13, height: 13, borderRadius: 7, background: C.violet, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - i * 4) / 4)), transform: `translateY(${-4 * Math.max(0, Math.sin((f - i * 4) / 4))}px)` }} />)}
    </div>
)
export const typingMsg = (key: string, at: number, until: number): Msg => ({ key, side: 'ai', at, until, w: 132, h: 66, render: f => <Dots f={f} /> })

// ─── Các tin của cuộc trò chuyện FATCA ─────────────────────────────────────────
export const specMsg = (at: number): Msg => ({
    key: 'spec', side: 'user', at, w: 780, h: 214,
    render: () => (
        <div>
            {SPEC.map((l, i) => <div key={i} style={{ fontSize: i === 0 ? 29 : 26, fontWeight: i === 0 ? 800 : 600, marginTop: i ? 8 : 0 }}>{l}</div>)}
        </div>
    ),
})

const STEPS: [string, string][] = [
    ['Dùng tiêu chí phòng đã duyệt', 'Thuộc diện FATCA'],
    ['Lấy đủ dữ liệu', 'Khách hàng · Tài khoản · Tiền gửi'],
    ['Quy đổi USD, lọc ngưỡng', 'Cá nhân > 50.000 USD'],
]
export const stepsMsg = (at: number, gap = 26): Msg => ({
    key: 'steps', side: 'ai', at, w: 760, h: 262,
    render: f => (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 21, fontWeight: 800, color: C.steel }}>
                {f < at + STEPS.length * gap ? <Spinner size={20} /> : <Ico k="check" size={22} color={C.emerald} stroke={3} />}AI Agent · {f < at + STEPS.length * gap ? 'đang xử lý' : 'xong 3 bước'}
            </div>
            {STEPS.map(([t, d], i) => {
                const s = at + i * gap
                if (f < s) return null
                const done = f >= s + gap
                const p = ease(f, [s, s + 8], [0, 1])
                return (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
                        <span style={{ width: 34, height: 34, borderRadius: 17, background: done ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{done ? <Ico k="check" size={20} color="#fff" stroke={3} /> : <Spinner size={24} />}</span>
                        <div>
                            <div style={{ fontSize: 25, fontWeight: 800 }}>{t}</div>
                            <div style={{ fontSize: 19, fontWeight: 600, color: C.steel }}>{d}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    ),
})

/** Ba ngả = ba nút ngay dưới kết quả (giống thanh hành động dưới kết quả thật). */
export const ACTIONS: { icon: IconKind; label: string; w: number }[] = [
    { icon: 'chat', label: 'Hỏi tiếp', w: 230 },
    { icon: 'calendarClock', label: 'Hẹn lịch gửi email', w: 310 },
    { icon: 'fileDown', label: 'Tạo template tải dữ liệu', w: 400 },
]
const RESULT = { w: 1262, h: 506, pad: 22, actH: 64 }
/** Hai cột hằng số (Ngân hàng, GIIN) lên dòng đầu thẻ cho bảng đỡ chật; bộ đếm vẫn đủ 12 cột. */
const TABLE_COLS = COLS.slice(2)
export const resultMsg = (at: number, colAt: number, actAt: number, actGap = 15, hot = -1, press = 1): Msg => ({
    key: 'result', side: 'ai', at, w: RESULT.w, h: RESULT.h, bare: true,
    render: f => {
        const shown = Math.min(COLS.length, Math.max(0, Math.floor((f - colAt) / 5) + 1))
        const full = shown >= COLS.length
        return (
            <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#fff', border: `1.5px solid ${C.rule}`, borderRadius: '26px 26px 26px 8px', boxShadow: '0 10px 30px rgba(34,26,102,0.08)', padding: RESULT.pad, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 27, fontWeight: 800, color: INK }}>{TEMPLATE_NAME}</span>
                    <span style={{ fontSize: 19, fontWeight: 600, color: C.steel }}>{N_CUSTOMERS} khách hàng · {TOTAL_REPORT_ROWS} dòng</span>
                    <span style={{
                        marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 14, fontSize: 26, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                        background: full ? '#E6F6EE' : '#EFEAFE', color: full ? C.emerald : '#5B3FD6',
                        transform: `scale(${full ? 1 + 0.08 * Math.max(0, 1 - (f - colAt - 55) / 12) * (f >= colAt + 55 ? 1 : 0) : 1})`,
                    }}>{full && <Ico k="check" size={24} stroke={3} />}{shown}/{COLS.length} cột mẫu NHNN</span>
                </div>
                <div style={{ display: 'flex', gap: 22, marginTop: 8, fontSize: 19, color: C.steel }}>
                    {([['Ngân hàng', BANK], ['GIIN', GIIN]] as const).map(([k, v], i) => (
                        <span key={k} style={{ opacity: ease(f, [colAt + i * 5, colAt + i * 5 + 8], [0, 1]) }}>{k}: <b style={{ color: INK }}>{v}</b></span>
                    ))}
                </div>
                <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.rule}` }}>
                    <ResultTable rows={REPORT_ROWS} at={at + 4} width={RESULT.w - 2 * RESULT.pad - 3} rowH={44} cols={TABLE_COLS} colAt={colAt + 10} />
                </div>
                <div style={{ position: 'absolute', left: RESULT.pad, bottom: RESULT.pad, display: 'flex', gap: 16 }}>
                    {ACTIONS.map((b, i) => {
                        const p = spring({ frame: f - actAt - i * actGap, fps: 30, config: { damping: 13, stiffness: 200 } })
                        const isHot = i === hot
                        return (
                            <span key={b.label} style={{
                                position: 'relative', width: b.w, height: RESULT.actH, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                borderRadius: 16, fontSize: 23, fontWeight: 800, color: isHot ? '#fff' : C.navy, background: isHot ? C.violet : '#F6F3FF', border: `2px solid ${isHot ? C.violet : '#CFC8FF'}`,
                                opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 20}px) scale(${(0.9 + 0.1 * p) * (isHot ? press : 1)})`,
                            }}>
                                <span style={{ position: 'absolute', left: -10, top: -12, width: 30, height: 30, borderRadius: 15, background: GRAD, color: '#fff', fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                                <Ico k={b.icon} size={24} color={isHot ? '#fff' : C.navy} />{b.label}
                            </span>
                        )
                    })}
                </div>
            </div>
        )
    },
})
/** Toạ độ tâm nút thứ i dưới kết quả, khi đỉnh tin kết quả nằm ở `top` (toạ độ màn hình). */
export const actionCenter = (i: number, top: number) => {
    const left = CHAT.x + PAD + AVATAR + 14 + RESULT.pad + ACTIONS.slice(0, i).reduce((s, b) => s + b.w + 16, 0) + ACTIONS[i].w / 2
    return { x: left, y: top + RESULT.h - RESULT.pad - RESULT.actH / 2 }
}

export const textMsg = (key: string, side: 'user' | 'ai', at: number, text: string, w: number): Msg => ({
    key, side, at, w, h: 80, render: () => <div style={{ whiteSpace: 'nowrap', ...(side === 'ai' ? { fontSize: 24, fontWeight: 600 } : {}) }}>{text}</div>,
})

const DRILL_Q = 'Số dư FATCA chia theo nhóm khách và tiền tệ?'
const BARS: { label: string; sub: string; usd: string; pct: number; color: string; badge: string; alert?: boolean }[] = [
    { label: 'Tổ chức · USD', sub: '4 khách', usd: '412.800 USD', pct: 0.92, color: C.violet, badge: '58% số dư' },
    { label: 'Cá nhân · USD', sub: '2 khách', usd: '243.450 USD', pct: 0.54, color: '#3B82F6', badge: '34% · 1 TK đã đóng' },
    { label: 'Cá nhân · EUR', sub: '1 khách', usd: '57.200 USD', pct: 0.13, color: '#EC4899', badge: 'Giữ nguyên EUR', alert: true },
]
export const chartMsg = (at: number, barsAt: number, noteAt: number): Msg => ({
    key: 'chart', side: 'ai', at, w: 1120, h: 400,
    render: f => (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Ico k="barChart" size={26} color={C.violet} />
                <span style={{ fontSize: 25, fontWeight: 800 }}>Số dư FATCA theo nhóm khách và tiền tệ</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: C.steel }}>USD quy đổi</span>
            </div>
            {BARS.map((b, i) => {
                const p = spring({ frame: f - barsAt - i * 12, fps: 30, config: { damping: 15, stiffness: 140 } })
                return (
                    <div key={b.label} style={{ marginTop: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 22, fontWeight: 800 }}>{b.label} <span style={{ fontSize: 17, color: C.steel, fontWeight: 600 }}>{b.sub}</span></span>
                            <span style={{ fontSize: 22, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{b.usd}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
                            <div style={{ flex: 1, height: 34, borderRadius: 10, background: '#F1EFFB', overflow: 'hidden' }}><div style={{ width: `${b.pct * 100 * p}%`, height: '100%', borderRadius: 10, background: i === 0 ? GRAD_H : b.color }} /></div>
                            <span style={{ width: 200, textAlign: 'center', padding: '5px 10px', borderRadius: 999, fontSize: 16.5, fontWeight: 800, background: b.alert ? '#FDECEA' : '#EFEAFE', color: b.alert ? C.red : '#5B3FD6', opacity: Math.min(1, p * 2) }}>{b.badge}</span>
                        </div>
                    </div>
                )
            })}
            {f >= noteAt && (
                <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 14, background: '#F6F3FF', border: '1.5px solid #DCD3FF', color: INK, fontSize: 21, fontWeight: 600, opacity: ease(f, [noteAt, noteAt + 10], [0, 1]) }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8, background: GRAD, color: '#fff', fontWeight: 800, fontSize: 18 }}><Ico k="sparkles" size={16} color="#fff" />AI nhận xét</span>
                    Tổ chức chiếm <b style={{ color: '#5B3FD6' }}>58%</b> số dư · khoản <b style={{ color: '#C2418F' }}>EUR</b> giữ nguyên tệ khi lập báo cáo
                </div>
            )}
        </div>
    ),
})

const SCHED_Q = '8 giờ sáng 15/1 hằng năm, gửi báo cáo này vào email của tôi'
export const confirmMsg = (at: number, approveAt: number): Msg => ({
    key: 'confirm', side: 'ai', at, w: 800, h: 300,
    render: f => {
        const ok = f >= approveAt + 4
        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23, fontWeight: 800 }}>
                    <Ico k="calendarClock" size={26} color={C.navy} />Lịch gửi báo cáo
                </div>
                {([['Khi nào', '8:00 ngày 15/1 hằng năm'], ['Gửi tới', EMAIL], ['Đính kèm', 'File Excel đúng mẫu 12 cột']] as const).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 22 }}><span style={{ width: 120, color: C.steel, fontWeight: 600 }}>{k}</span><b>{v}</b></div>
                ))}
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, fontSize: 21, fontWeight: 800, color: '#fff', background: ok ? C.emerald : C.violet, transform: `scale(${pressAt(f, approveAt)})` }}><Ico k="check" size={20} color="#fff" stroke={3} />{ok ? 'Đã lên lịch' : 'Đồng ý'}</span>
                    {!ok && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, fontSize: 21, fontWeight: 700, color: C.steel, border: `1.5px solid ${C.rule}` }}>Huỷ</span>}
                </div>
            </div>
        )
    },
})
/** Toạ độ nút Đồng ý khi đỉnh tin xác nhận ở `top`. */
const approveCenter = (top: number) => ({ x: CHAT.x + PAD + AVATAR + 14 + 26 + 80, y: top + 20 + 34 + 3 * 46 + 20 + 24 })

// ─── Mốc các cảnh chat ─────────────────────────────────────────────────────────
export const CHAT_ASK = { paste: 14, send: 66, typing: 76, steps: 100, stepGap: 26, result: 195, cols: 207, actions: 285, actionGap: 15 }
export const CHAT_DRILL = { typeStart: 14, typeEnd: 52, send: 60, typing: 70, chart: 90, bars: 102, note: 165 }
export const CHAT_SCH = { typeStart: 14, typeEnd: 62, send: 70, typing: 80, confirm: 104, approve: 165, done: 180, inbox: 225, mail: 252 }

/** Toàn bộ tin của cảnh hỏi (dùng lại ở các cảnh sau với at = SHOWN). */
const askMsgs = (T = CHAT_ASK, shown = false): Msg[] => [
    specMsg(shown ? SHOWN : T.send),
    ...(shown ? [] : [typingMsg('t1', T.typing, T.steps)]),
    stepsMsg(shown ? SHOWN : T.steps, shown ? 0 : T.stepGap),
    resultMsg(shown ? SHOWN : T.result, shown ? SHOWN : T.cols, shown ? SHOWN : T.actions),
]
const drillMsgs = (shown = false): Msg[] => {
    const T = CHAT_DRILL
    return [
        textMsg('q1', 'user', shown ? SHOWN : T.send, DRILL_Q, 700),
        ...(shown ? [] : [typingMsg('t2', T.typing, T.chart)]),
        chartMsg(shown ? SHOWN : T.chart, shown ? SHOWN : T.bars, shown ? SHOWN : T.note),
    ]
}
const schMsgs = (shown = false): Msg[] => {
    const T = CHAT_SCH
    return [
        textMsg('q2', 'user', shown ? SHOWN : T.send, SCHED_Q, 880),
        ...(shown ? [] : [typingMsg('t3', T.typing, T.confirm)]),
        confirmMsg(shown ? SHOWN : T.confirm, shown ? SHOWN : T.approve),
        textMsg('done', 'ai', shown ? SHOWN : T.done, 'Đã lên lịch. Đến 8:00 ngày 15/1, file Excel sẽ tự gửi vào email của bạn.', 1000),
    ]
}

// ─── Cảnh: dán yêu cầu → AI làm → đúng 12 cột → ba nút (ba ngả) ─────────────────
export const ChatAskScene: React.FC = () => {
    const f = useCurrentFrame()
    const T = CHAT_ASK
    const msgs = askMsgs()
    const pasted = f >= T.paste && f < T.send
    return (
        <Stage>
            <RoleBanner role="enduser" />
            <Headline text="Dán nguyên yêu cầu vào khung chat" at={0} out={T.steps - 6} size={fit('Dán nguyên yêu cầu vào khung chat', 96)} top={54} accent={['Dán nguyên yêu cầu']} />
            <Headline text="AI dùng đúng tiêu chí phòng đã duyệt" at={T.steps - 2} out={T.result - 6} size={fit('AI dùng đúng tiêu chí phòng đã duyệt', 92)} top={54} accent={['tiêu chí phòng đã duyệt']} />
            <Headline text="Ra đúng 12 cột theo mẫu NHNN" at={T.result - 2} out={T.actions - 6} size={fit('Ra đúng 12 cột theo mẫu NHNN', 96)} top={54} accent={['đúng 12 cột']} />
            <Headline text="Rồi đi tiếp một trong ba ngả" at={T.actions - 2} size={fit('Rồi đi tiếp một trong ba ngả', 96)} top={54} accent={['ba ngả']} />
            <ChatShell
                msgs={msgs}
                composer={pasted ? <span><b>{SPEC[0]}</b><span style={{ color: C.steel }}> · và 3 dòng yêu cầu</span></span> : undefined}
                composerOn={pasted}
                sendAt={T.send}
                style={{ opacity: ease(f, [0, 10], [0, 1]), transform: `translateY(${(1 - ease(f, [0, 14], [0, 1])) * 40}px)` }}
            />
            {f >= T.paste && f < T.paste + 10 && <div style={{ position: 'absolute', left: CHAT.x + 24, top: CHAT.y + CHAT.h - 24 - (CHAT.foot - 44), width: CHAT.w - 48, height: CHAT.foot - 44, borderRadius: 18, background: 'rgba(109,93,246,0.16)', opacity: 1 - (f - T.paste) / 10 }} />}
            <PathCursor from={T.paste + 4} to={T.send + 12} clicks={[T.send]} keys={[[T.paste + 4, 1100, 980], [T.send - 6, SEND_AT.x, SEND_AT.y], [T.send + 12, SEND_AT.x, SEND_AT.y]]} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · kết quả mô phỏng`} />
        </Stage>
    )
}

// ─── Ngả 1: hỏi tiếp ngay trong khung chat ─────────────────────────────────────
export const ChatDrillScene: React.FC = () => {
    const f = useCurrentFrame()
    const T = CHAT_DRILL
    const msgs = [...askMsgs(CHAT_ASK, true), ...drillMsgs()]
    const typing = f >= T.typeStart && f < T.send
    return (
        <Stage>
            <RoleBanner role="enduser" />
            <Headline text="Ngả 1 · Hỏi tiếp ngay trong khung chat" at={0} out={T.note - 6} size={fit('Ngả 1 · Hỏi tiếp ngay trong khung chat', 92)} top={54} accent={['Hỏi tiếp']} />
            <Headline text="AI vẽ biểu đồ, chỉ ra điểm cần lưu ý" at={T.note - 2} size={fit('AI vẽ biểu đồ, chỉ ra điểm cần lưu ý', 92)} top={54} accent={['điểm cần lưu ý']} />
            <ChatShell msgs={msgs} composer={typing ? <span>{typed(f, DRILL_Q, T.typeStart, T.typeEnd)}<Caret /></span> : undefined} composerOn={typing} sendAt={T.send} />
            <PathCursor from={T.typeEnd - 10} to={T.send + 12} clicks={[T.send]} keys={[[T.typeEnd - 10, 1200, 980], [T.send - 6, SEND_AT.x, SEND_AT.y], [T.send + 12, SEND_AT.x, SEND_AT.y]]} />
            <StepRail active={3} branch={0} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · kết quả mô phỏng`} />
        </Stage>
    )
}

// ─── Ngả 2: dặn lịch bằng một câu → đến hẹn file về hộp thư (lộ trình: ghi ở chú thích góc + đoạn kết) ─
export const ChatScheduleScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = CHAT_SCH
    const msgs = [...askMsgs(CHAT_ASK, true), ...drillMsgs(true), ...schMsgs()]
    const typing = f >= T.typeStart && f < T.send
    const sc = autoScroll(msgs, f)
    const ap = approveCenter(msgTopOnScreen(msgs, 'confirm', f, sc))
    const side = ease(f, [T.inbox, T.inbox + 22], [0, 1], Easing.inOut(Easing.cubic))
    const mail = spring({ frame: f - T.mail, fps, config: { damping: 14, stiffness: 170 } })
    return (
        <Stage>
            <RoleBanner role="enduser" />
            <Headline text="Ngả 2 · Dặn lịch gửi email bằng một câu" at={0} out={T.inbox - 4} size={fit('Ngả 2 · Dặn lịch gửi email bằng một câu', 90)} top={54} accent={['bằng một câu']} />
            <Headline text="Đến hẹn, file Excel tự về hộp thư" at={T.inbox} size={fit('Đến hẹn, file Excel tự về hộp thư', 94)} top={54} accent={['tự về hộp thư']} />
            <ChatShell
                msgs={msgs} scroll={sc}
                composer={typing ? <span>{typed(f, SCHED_Q, T.typeStart, T.typeEnd)}<Caret /></span> : undefined} composerOn={typing} sendAt={T.send}
                style={{ transform: `translateX(${-side * 190}px) scale(${1 - side * 0.14})`, transformOrigin: 'left center' }}
            />
            <PathCursor from={T.typeEnd - 10} to={T.send + 12} clicks={[T.send]} keys={[[T.typeEnd - 10, 1200, 980], [T.send - 6, SEND_AT.x, SEND_AT.y], [T.send + 12, SEND_AT.x, SEND_AT.y]]} />
            <PathCursor from={T.approve - 24} to={T.approve + 12} clicks={[T.approve]} keys={[[T.approve - 24, 900, 900], [T.approve - 6, ap.x, ap.y], [T.approve + 12, ap.x, ap.y]]} />
            <Burst at={T.approve + 4} x={ap.x} y={ap.y} r={110} color="#10B981" />
            {f >= T.inbox && (
                <div style={{ ...panelStyle, left: 1250, top: 196, width: 600, height: 560, overflow: 'hidden', opacity: side, transform: `translateX(${(1 - side) * 260}px)` }}>
                    <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', borderBottom: `1px solid ${C.rule}`, background: '#FAFAFE', fontSize: 21, fontWeight: 800, color: C.navy }}>
                        <Ico k="mail" size={24} color={C.navy} />Hộp thư
                    </div>
                    <div style={{ padding: '22px 26px', opacity: Math.min(1, mail * 2), transform: `translateY(${(1 - mail) * 40}px)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ width: 46, height: 46, borderRadius: 23, border: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogoMark size={30} /></span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', fontSize: 21, fontWeight: 800 }}>{BRAND}<span style={{ marginLeft: 'auto', color: C.navy }}>08:00 · 15/01</span></div>
                                <div style={{ fontSize: 18, color: C.steel }}>tới {EMAIL}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 20, fontSize: 27, fontWeight: 800, color: INK }}>Báo cáo FATCA hằng năm</div>
                        <div style={{ marginTop: 10, fontSize: 21, color: '#2E2B45', lineHeight: 1.5 }}>Báo cáo FATCA năm 2026 đã chạy xong theo mẫu chuẩn.</div>
                        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, border: '2px solid #1D6F42', opacity: ease(f, [T.mail + 20, T.mail + 30], [0, 1]) }}>
                            <Ico k="fileSheet" size={36} color="#1D6F42" />
                            <div><div style={{ fontSize: 22, fontWeight: 800 }}>Bao_cao_FATCA_2026.xlsx</div><div style={{ fontSize: 18, color: C.steel }}>Đúng mẫu 12 cột</div></div>
                        </div>
                    </div>
                </div>
            )}
            <StepRail active={3} branch={1} />
            <Tag text="Minh hoạ tính năng trong lộ trình" />
        </Stage>
    )
}

/**
 * Ngả 3 (đầu cảnh tạo mẫu): khung chat cuộn ngược lên tin kết quả, bấm nút "Tạo template tải dữ liệu".
 * Trả `null` khi đã qua lúc chuyển sang thẻ mẫu (ButtonScene lo phần sau).
 */
export const ChatShareIntro: React.FC<{ click: number; morph: number }> = ({ click, morph }) => {
    const f = useCurrentFrame()
    const msgs = [...askMsgs(CHAT_ASK, true), ...drillMsgs(true), ...schMsgs(true)]
    const auto = autoScroll(msgs, f)
    const target = Math.max(0, msgTopOnScreen(msgs, 'result', f, 0) - (CHAT.y + CHAT.head + PAD) - 6)
    const sc = interpolate(ease(f, [4, 34], [0, 1], Easing.inOut(Easing.cubic)), [0, 1], [auto, target])
    const btn = actionCenter(2, msgTopOnScreen(msgs, 'result', f, sc))
    const out = ease(f, [morph, morph + 18], [0, 1], Easing.inOut(Easing.cubic))
    if (f > morph + 18) return null
    const hotMsgs = msgs.map(m => (m.key === 'result' ? resultMsg(SHOWN, SHOWN, SHOWN, 15, f >= click - 12 ? 2 : -1, pressAt(f, click)) : m))
    return (
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - out, transform: `scale(${1 - out * 0.12})`, transformOrigin: `${btn.x}px ${btn.y}px` }}>
            <ChatShell msgs={hotMsgs} scroll={sc} />
            <PathCursor from={20} to={morph + 2} clicks={[click]} keys={[[20, 1300, 960], [click - 10, btn.x, btn.y], [morph + 2, btn.x, btn.y]]} />
        </div>
    )
}
