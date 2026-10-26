import { Easing, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { LogoMark, LogoWordmark } from '../components/Logo'
import { LogoReveal } from '../components/LogoReveal'
import { ease, INK, panelStyle, Shake, Stage, Burst } from '../promo/kit'
import { MONO } from '../promo/scenesA'
import { BRAND, EMAIL, N_CUSTOMERS, REPORT_ROWS, ROUTINE_CRON, ROUTINE_MSG, ROUTINE_NAME, SCHEDULE_ASK, TEMPLATE_NAME, TOTAL_REPORT_ROWS } from './data'
import { Headline, AppWindow, Badge, Caret, Chip, GRAD, GRAD_H, Ico, PathCursor, RoleBanner, Spinner, StepRail, pressAt, typed, useTemplateMode, type IconKind  } from './ui'
import { Tag, fit } from './scenes1'

const BALANCE = { textWrap: 'balance' } as React.CSSProperties

// ─── 10 · Hoặc hẹn lịch ngay trong câu trả lời, gửi email (90% Cán bộ Nghiệp vụ) ──────
export const SCH = { typeStart: 16, typeEnd: 72, send: 88, step: 100, confirm: 120, approve: 196, done: 216, phone: 284, msg: 306 }
export const ScheduleScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = SCH
    const win = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const pop = (at: number) => spring({ frame: f - at, fps, config: { damping: 14, stiffness: 190 } })
    const inbox = spring({ frame: f - T.phone, fps, config: { damping: 18, stiffness: 130 } })
    const msg = spring({ frame: f - T.msg, fps, config: { damping: 13, stiffness: 180 } })
    const soon = spring({ frame: f - 10, fps, config: { damping: 12, stiffness: 190 } })
    const sent = f >= T.send
    return (
        <Stage dark>
            <RoleBanner role="enduser" />
            <Headline text="Ngả 2 · Dặn lịch gửi email bằng một câu" at={0} out={T.phone - 4} size={fit('Ngả 2 · Dặn lịch gửi email bằng một câu', 90)} top={54} color="#fff" accent={['bằng một câu']} />
            <Headline text="Đến hẹn, file Excel tự về hộp thư" at={T.phone} size={fit('Đến hẹn, file Excel tự về hộp thư', 92)} top={54} color="#fff" accent={['tự về hộp thư']} />
            <div style={{ position: 'absolute', right: 40, top: 62, transform: `scale(${soon})`, transformOrigin: 'right top', zIndex: 55 }}><Badge kind="soon" size={20} /></div>
            <Shake hits={[T.done]} amp={8}>
                <AppWindow title="Phân tích · FATCA" icon="chat" style={{ left: 140, top: 176, width: 1000, height: 820, opacity: win, transform: `translateY(${(1 - win) * 60}px)` }}>
                    <span style={{ position: 'absolute', right: 18, top: 8, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, background: GRAD_H, color: '#fff', fontSize: 17, fontWeight: 800 }}><Ico k="bot" size={18} color="#fff" />AI Agent</span>
                    <div style={{ position: 'absolute', left: 24, right: 24, top: 62, height: 100, borderRadius: 14, border: `1px solid ${C.rule}`, padding: '12px 18px', boxSizing: 'border-box', background: '#FBFBFE' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                            <span style={{ fontSize: 22, fontWeight: 800, color: INK }}>{TEMPLATE_NAME}</span>
                            <span style={{ fontSize: 18, color: C.steel }}>Năm 2025 · {N_CUSTOMERS} khách hàng · {TOTAL_REPORT_ROWS} dòng</span>
                        </div>
                        {REPORT_ROWS.slice(0, 2).map((r, idx) => (
                            <div key={`${r.cif}-${idx}`} style={{ display: 'flex', fontSize: 17, color: '#4A4766', marginTop: 6, fontFamily: MONO }}>
                                <span style={{ width: 110 }}>{r.cif}</span><span style={{ flex: 1, fontFamily: 'inherit', fontWeight: 700 }}>{r.ten}</span><span style={{ width: 170 }}>{r.so_tk}</span><span style={{ width: 70 }}>{r.tien_te}</span>
                            </div>
                        ))}
                    </div>
                    {sent && (
                        <div style={{ position: 'absolute', right: 24, top: 178, maxWidth: 940, whiteSpace: 'nowrap', padding: '14px 20px', borderRadius: 18, background: '#16132B', color: '#fff', fontSize: 21, fontWeight: 600, transform: `scale(${pop(T.send)})`, transformOrigin: 'right center' }}>{SCHEDULE_ASK}</div>
                    )}
                    {f >= T.step && (
                        <div style={{ position: 'absolute', left: 24, right: 24, top: 244, height: 46, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', borderRadius: 12, background: '#F6F3FF', fontSize: 20, fontWeight: 700, color: INK, opacity: Math.min(1, pop(T.step) * 2) }}>
                            <Ico k="calendarClock" size={22} color={C.navy} />Tạo tác vụ định kỳ
                            <span style={{ marginLeft: 'auto' }}>{f < T.confirm ? <Spinner size={18} /> : f < T.done ? <span style={{ fontSize: 17, color: '#A15C00' }}>Chờ xác nhận</span> : <Ico k="check" size={22} color={C.emerald} stroke={3} />}</span>
                        </div>
                    )}
                    {f >= T.confirm && (
                        <div style={{ position: 'absolute', left: 24, right: 24, top: 300, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(217,119,6,0.35)', background: 'rgba(245,158,11,0.06)', opacity: Math.min(1, pop(T.confirm) * 2), transform: `translateY(${(1 - pop(T.confirm)) * 30}px)` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(245,158,11,0.12)', borderBottom: '1px solid rgba(217,119,6,0.2)' }}>
                                <Ico k="shieldAlert" size={22} color="#D97706" />
                                <span style={{ fontSize: 20, fontWeight: 700, color: '#B45309' }}>Cần bạn xác nhận</span>
                            </div>
                            <div style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20 }}>
                                    <Ico k="calendarClock" size={20} color={C.navy} /><b style={{ color: INK }}>Lịch gửi báo cáo</b>
                                </div>
                                <div style={{ marginTop: 10, borderRadius: 10, border: `1px solid ${C.rule}`, background: '#fff', padding: '10px 14px', fontSize: 19, lineHeight: 1.6, color: '#3A3755' }}>
                                    {([['Khi nào', '8:00 ngày 15/1 hằng năm'], ['Gửi tới', EMAIL], ['Đính kèm', 'File Excel đúng mẫu 12 cột']] as const).map(([k, v]) => (
                                        <div key={k} style={{ display: 'flex', gap: 14 }}><span style={{ width: 110, color: C.steel, fontWeight: 600 }}>{k}</span><b style={{ color: INK }}>{v}</b></div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                                    {f < T.approve + 4 ? (
                                        <>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: '#D97706', color: '#fff', fontSize: 19, fontWeight: 700, transform: `scale(${pressAt(f, T.approve)})` }}><Ico k="check" size={18} color="#fff" stroke={3} />Đồng ý chạy</span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: `1px solid ${C.rule}`, background: '#fff', color: C.steel, fontSize: 19, fontWeight: 700 }}><Ico k="x" size={18} color={C.steel} />Huỷ</span>
                                        </>
                                    ) : <span style={{ fontSize: 18, fontStyle: 'italic', color: C.steel, padding: '10px 0' }}>Đã gửi lựa chọn. Đang chờ trợ lý làm tiếp…</span>}
                                </div>
                            </div>
                        </div>
                    )}
                    {f >= T.done && (
                        <div style={{ position: 'absolute', left: 24, right: 24, top: 586, borderRadius: 14, border: '2px solid #A6E3C8', background: '#F3FBF7', padding: '14px 18px', boxSizing: 'border-box', opacity: Math.min(1, pop(T.done) * 2), transform: `scale(${0.92 + 0.08 * pop(T.done)})`, transformOrigin: 'left center' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <span style={{ width: 34, height: 34, borderRadius: 17, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ico k="bot" size={20} color="#fff" /></span>
                                <div style={{ fontSize: 20, lineHeight: 1.45, color: INK }}>Đã lên lịch <b>{ROUTINE_NAME}</b>: 8:00 ngày 15/1 hằng năm gửi kết quả tới <b>{EMAIL}</b></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, marginLeft: 46, fontSize: 17, color: C.steel }}>
                                <span style={{ fontWeight: 700, color: C.emerald, background: '#E6F6EE', borderRadius: 999, padding: '3px 12px' }}>Đang chạy</span>
                                <span>Hằng năm · 15/1 · 8:00</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: C.navy }}><Ico k="mail" size={18} color={C.navy} />Email</span>
                            </div>
                        </div>
                    )}
                    <div style={{ position: 'absolute', left: 24, right: 24, bottom: 20, height: 64, borderRadius: 16, border: `2px solid ${!sent && f >= T.typeStart - 4 ? C.violet : C.rule}`, display: 'flex', alignItems: 'center', padding: '0 12px 0 20px', boxSizing: 'border-box', fontSize: 21, color: !sent && f >= T.typeStart ? INK : '#A3A0B8' }}>
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{!sent && f >= T.typeStart ? <>{typed(f, SCHEDULE_ASK, T.typeStart, T.typeEnd)}<Caret /></> : 'Hỏi tiếp hoặc giao việc cho Agent'}</span>
                        <span style={{ width: 46, height: 46, borderRadius: 12, background: !sent && f >= T.typeEnd ? C.violet : '#E5E3F2', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pressAt(f, T.send)})` }}><Ico k="send" size={22} color="#fff" /></span>
                    </div>
                </AppWindow>
            </Shake>
            <PathCursor from={T.typeEnd - 8} to={T.send + 12} clicks={[T.send]} keys={[[T.typeEnd - 8, 900, 900], [T.send - 6, 1081, 944], [T.send + 12, 1081, 944]]} />
            <PathCursor from={T.approve - 30} to={T.approve + 14} clicks={[T.approve]} keys={[[T.approve - 30, 700, 960], [T.approve - 6, 260, 703], [T.approve + 14, 260, 703]]} />

            {f >= T.phone && (
                <AppWindow title="Hộp thư" icon="mail" barColor={C.navy} style={{ left: 1180, top: 176, width: 620, height: 820, opacity: Math.min(1, inbox * 1.5), transform: `translateX(${(1 - inbox) * 300}px)` }}>
                    <span style={{ position: 'absolute', right: 14, top: 9 }}><Badge kind="soon" size={14} /></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: '#F6F3FF', borderBottom: `1px solid ${C.rule}` }}>
                        <span style={{ width: 10, height: 10, borderRadius: 5, background: C.violet, flexShrink: 0 }} />
                        <span style={{ width: 40, height: 40, borderRadius: 20, background: '#fff', border: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><LogoMark size={28} /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', fontSize: 18, fontWeight: 800, color: INK }}>{BRAND}<span style={{ marginLeft: 'auto', fontWeight: 700, color: C.navy }}>08:00</span></div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Lịch gửi: {ROUTINE_NAME}</div>
                            <div style={{ fontSize: 16, color: C.steel, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ROUTINE_MSG[0]}</div>
                        </div>
                    </div>
                    {f >= T.msg && (
                        <div style={{ padding: '18px 24px', opacity: Math.min(1, msg * 2), transform: `translateY(${(1 - msg) * 30}px)` }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: INK, lineHeight: 1.25 }}>Lịch gửi: {ROUTINE_NAME}</div>
                            <div style={{ fontSize: 16, color: C.steel, marginTop: 6 }}>{BRAND} tới {EMAIL} · Thứ Sáu, 15/01/2027 08:00</div>
                            <div style={{ marginTop: 16, borderRadius: 12, background: '#F8F8FC', borderLeft: `4px solid ${C.violet}`, padding: '14px 18px' }}>
                                {ROUTINE_MSG.map((l, k) => (
                                    <div key={k} style={{ fontSize: 20, lineHeight: 1.45, color: '#2E2B45', marginTop: k ? 10 : 0, opacity: ease(f, [T.msg + 8 + k * 14, T.msg + 18 + k * 14], [0, 1]) }}>{l}</div>
                                ))}
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: '2px solid #1D6F42', opacity: ease(f, [T.msg + 36, T.msg + 46], [0, 1]) }}>
                                <Ico k="fileSheet" size={30} color="#1D6F42" />
                                <div><div style={{ fontSize: 19, fontWeight: 700, color: INK }}>Bao_cao_FATCA_2026.xlsx</div><div style={{ fontSize: 16, color: C.steel }}>Đúng mẫu 12 cột</div></div>
                            </div>
                            <div style={{ marginTop: 14, fontSize: 15, color: '#A3A0B8', textAlign: 'center', opacity: ease(f, [T.msg + 50, T.msg + 60], [0, 1]) }}>Email tự động từ {BRAND}</div>
                        </div>
                    )}
                </AppWindow>
            )}
            <Burst at={T.done} x={330} y={820} r={160} color="#E86FC6" />
            <StepRail active={3} branch={1} />
            <Tag text="Minh hoạ tính năng trong lộ trình" />
        </Stage>
    )
}

// ─── 11 · Nhanh mà vẫn có kiểm soát & chia sẻ trách nhiệm ────────────────────────────
const CTRL: { icon: IconKind; title: string; desc: string }[] = [
    { icon: 'badgeCheck', title: 'Có người duyệt', desc: 'Nghiệp vụ đề xuất, người có quyền duyệt mới áp dụng' },
    { icon: 'shield', title: 'AI chỉ đề xuất', desc: 'Xem trước công thức rồi mới bấm Áp dụng' },
    { icon: 'sparkles', title: 'Lọc chữ có rào chắn', desc: 'Chỉ lọc trên các cột đã được cấp phép' },
]
export const ControlScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const approved = f >= 100
    return (
        <Stage>
            <Headline text="Nghiệp vụ chủ động, dữ liệu vẫn chuẩn và an toàn" at={0} size={fit('Nghiệp vụ chủ động, dữ liệu vẫn chuẩn và an toàn', 86)} top={74} accent={['Nghiệp vụ chủ động', 'chuẩn và an toàn']} />
            {CTRL.map((c, i) => {
                const p = spring({ frame: f - 20 - i * 12, fps, config: { damping: 12, stiffness: 170, mass: 0.7 } })
                return (
                    <div key={c.title} style={{ ...panelStyle, left: 110 + i * 580, top: 280, width: 540, height: 440, padding: '34px 34px', boxSizing: 'border-box', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 200}px) rotate(${(1 - p) * (i % 2 ? 5 : -5)}deg)` }}>
                        <div style={{ width: 84, height: 84, borderRadius: 24, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 36px rgba(109,93,246,0.35)' }}><Ico k={c.icon} size={44} color="#fff" /></div>
                        <div style={{ fontSize: 34, fontWeight: 800, color: INK, marginTop: 26, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{c.title}</div>
                        <div style={{ fontSize: 24, color: C.steel, marginTop: 12, lineHeight: 1.4, ...BALANCE }}>{c.desc}</div>
                        <div style={{ position: 'absolute', left: 34, bottom: 30, display: 'flex', gap: 10 }}>
                            {i === 0 && (
                                <>
                                    <span style={{ padding: '8px 14px', borderRadius: 999, fontSize: 18, fontWeight: 800, color: C.violet, background: '#EFEAFE', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <Ico k="shield" size={17} color={C.violet} />BA rà soát
                                    </span>
                                    <span style={{ padding: '8px 14px', borderRadius: 999, fontSize: 18, fontWeight: 800, color: approved ? C.emerald : '#A15C00', background: approved ? '#E6F6EE' : '#FEF3D7', transform: `scale(${approved ? spring({ frame: f - 100, fps, config: { damping: 10, stiffness: 220 } }) : 1})`, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        {approved && <Ico k="check" size={17} color={C.emerald} stroke={3} />}{approved ? 'Đã duyệt' : 'Chờ duyệt'}
                                    </span>
                                </>
                            )}
                            {i === 1 && <><span style={{ padding: '8px 16px', borderRadius: 10, background: C.violet, color: '#fff', fontSize: 19, fontWeight: 800 }}>Áp dụng</span><span style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.rule}`, color: C.steel, fontSize: 19, fontWeight: 700 }}>Hoàn tác AI</span></>}
                            {i === 2 && <span style={{ fontSize: 18, fontWeight: 700, padding: '8px 12px', borderRadius: 10, background: '#F1F0F8', color: '#4A4766' }}>Loại KH · Số dư · …</span>}
                        </div>
                    </div>
                )
            })}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 34 }}>
                {([['history', 'Lịch sử phiên bản'], ['lock', 'Quyền truy cập riêng từng mẫu'], ['calendarClock', 'Lịch gửi chờ bạn đồng ý']] as [IconKind, string][]).map(([k, t], i) => {
                    const p = spring({ frame: f - 112 - i * 8, fps, config: { damping: 14, stiffness: 200 } })
                    return <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderRadius: 999, background: INK, color: '#fff', fontSize: 23, fontWeight: 700, transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}><Ico k={k} size={24} color="#fff" />{t}</div>
                })}
            </div>
        </Stage>
    )
}

// ─── 12 · Tổng kết 6 bước kèm nhãn vai trò ─────────────────────────────────────────
type RecapStep = { icon: IconKind; label: string; role: string; tone: 'blue' | 'violet' | 'green' | 'amber'; soon?: boolean }

const RECAP_FULL: RecapStep[] = [
    { icon: 'database', label: 'Dựng mô hình & nối bảng', role: 'BA Data · Kỹ sư', tone: 'blue' },
    { icon: 'badgeCheck', label: 'Chuẩn hoá tiêu chí phòng', role: 'NV + BA duyệt', tone: 'violet' },
    { icon: 'chat', label: 'Dán yêu cầu, ra 12 cột', role: 'Nghiệp vụ', tone: 'green' },
    { icon: 'calendarClock', label: 'Hỏi tiếp · hẹn lịch · tạo mẫu', role: 'Nghiệp vụ', tone: 'green' },
    { icon: 'sparkles', label: 'Tham số & mẫu Excel', role: 'Power User', tone: 'amber' },
    { icon: 'input', label: 'Cả phòng tự tải Excel', role: 'Nghiệp vụ', tone: 'green' },
]

const RECAP_BIZ: RecapStep[] = [
    { icon: 'sparkles', label: 'Tạo Cột ảo & kéo thả test', role: 'Nghiệp vụ + AI', tone: 'violet' },
    { icon: 'badgeCheck', label: 'BA bọc biên · TP duyệt', role: 'BA + Trưởng phòng', tone: 'violet' },
    { icon: 'barChart', label: 'Hỏi 12 cột & vẽ biểu đồ', role: '90% Nghiệp vụ', tone: 'green' },
    { icon: 'fileSheet', label: 'Đặt placeholder mẫu Excel', role: '90% Nghiệp vụ', tone: 'green' },
    { icon: 'input', label: 'Gõ chữ lọc & tải Excel', role: '90% Nghiệp vụ', tone: 'green' },
    { icon: 'calendarClock', label: 'Hẹn lịch gửi email', role: '90% Nghiệp vụ', tone: 'green', soon: true },
]

export const RecapScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const mode = useTemplateMode()
    const steps = mode === 'biz' ? RECAP_BIZ : RECAP_FULL
    const W = 266, G = 16, X0 = (1920 - (6 * W + 5 * G)) / 2
    const topHeadline = mode === 'biz' ? 'Quy trình 6 bước gọn nhẹ cho Cán bộ Nghiệp vụ' : 'Từ yêu cầu nghiệp vụ tới file đúng mẫu'
    return (
        <Stage>
            <Headline text={topHeadline} at={0} size={fit(topHeadline, 92)} top={130} accent={mode === 'biz' ? ['6 bước gọn nhẹ', 'Cán bộ Nghiệp vụ'] : ['file đúng mẫu']} />
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
                <line x1={X0 + W / 2} y1={520} x2={X0 + W / 2 + (5 * (W + G)) * ease(f, [20, 96], [0, 1], Easing.inOut(Easing.cubic))} y2={520} stroke="url(#rg)" strokeWidth={6} strokeLinecap="round" />
                <defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stopColor="#6D5DF6" /><stop offset="1" stopColor="#E86FC6" /></linearGradient></defs>
            </svg>
            {steps.map((s, i) => {
                const p = spring({ frame: f - 18 - i * 12, fps, config: { damping: 12, stiffness: 180 } })
                return (
                    <div key={s.label} style={{ ...panelStyle, left: X0 + i * (W + G), top: 365, width: W, height: 336, padding: '20px 16px', boxSizing: 'border-box', textAlign: 'center', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 120}px) scale(${0.85 + 0.15 * p})` }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Chip tone={s.tone} style={{ fontSize: 15, padding: '4px 10px' }}>{s.role}</Chip>
                        </div>
                        <div style={{ width: 76, height: 76, borderRadius: 22, background: GRAD, margin: '14px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k={s.icon} size={40} color="#fff" /></div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: INK, marginTop: 16, lineHeight: 1.25, ...BALANCE }}>{s.label}</div>
                        {s.soon && <div style={{ marginTop: 10 }}><Badge kind="soon" size={13} /></div>}
                    </div>
                )
            })}
            <Headline text="Đúng vai trò, chuẩn dữ liệu, không còn chờ đợi" at={100} size={fit('Đúng vai trò, chuẩn dữ liệu, không còn chờ đợi', 82)} top={760} accent={['không còn chờ đợi']} />
        </Stage>
    )
}

// ─── 13 · Kết ──────────────────────────────────────────────────────────────────
/** Giãn theo đoạn cuối bài nhạc: logo vào ô nhịp, CTA hiện trước khi bài tắt dần (bản Biz kết 300 khung). */
export const OUTRO_T = { logo: 4, word: 34, line: 90, cta: 150, note: 180 }
export const OutroT: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = OUTRO_T
    const slide = spring({ frame: f - T.word, fps, config: { damping: 200 } })
    const cta = spring({ frame: f - T.cta, fps, config: { damping: 12, stiffness: 170 } })
    const settle = ease(f, [T.cta, T.cta + 150], [1, 1.03])
    return (
        <Stage>
            <div style={{ position: 'absolute', inset: 0, transform: `scale(${settle})` }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
                    <LogoReveal size={210} delay={T.logo} />
                    <div style={{ width: 980 * slide, marginLeft: -40 * (1 - slide), overflow: 'hidden' }}>
                        <LogoWordmark fontSize={146} mode="light" text="SEMANTIX" letterProgress={i => ease(f, [T.word + 4 + i * 3, T.word + 16 + i * 3], [0, 1])} />
                    </div>
                </div>
                <Headline text="Hỏi một câu, ra đúng mẫu báo cáo" at={T.line} size={fit('Hỏi một câu, ra đúng mẫu báo cáo', 88)} top={500} accent={['ra đúng mẫu báo cáo']} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: 676, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 44px', borderRadius: 999, background: GRAD_H, color: '#fff', fontSize: 40, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 20px 50px rgba(109,93,246,0.35)', transform: `scale(${cta})` }}>
                        <Ico k="arrowRight" size={38} color="#fff" />Dùng thử: https://semantix-uat-gcp.ncb-bank.vn
                    </div>
                </div>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontSize: 22, color: C.steel, opacity: 0.8 * ease(f, [T.note, T.note + 14], [0, 1]) }}>
                    Dữ liệu khách hàng trong video là mô phỏng · hẹn lịch gửi email kèm file đang trong lộ trình
                </div>
            </div>
        </Stage>
    )
}
