import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { ease, INK, panelStyle, Shake, Stage, Burst } from '../promo/kit'
import { MONO } from '../promo/scenesA'
import {
    AI_EXTRA, AI_FILTER_CLAUSES, AI_FILTER_COLS, AI_FILTER_SQL, AI_FILTER_TEXT, AI_PREFILL, BRAND, COLS, FILE_NAME, FILTERED_ROWS, PARAMS,
    REPORT_NOTE_TPL, REPORT_ROWS, REPORT_TITLE_TPL, SQL_AFTER, SQL_BEFORE, TEMPLATE_NAME, type SqlLine,
} from './data'
import { Headline, AppWindow, Badge, Caret, Chip, ExcelSheet, GRAD, Ico, PathCursor, RoleBanner, Spinner, StepRail, XL_GREEN, pressAt, typed, useTemplateMode, withPlaceholders, type IconKind  } from './ui'
import { Tag, fit } from './scenes1'
import { TEMPLATE_SHEET_W, TemplateSheet } from './scenesBranch'

// ─── 7 · Nhờ AI biến năm và tỷ giá thành tham số (Power User phòng Nghiệp vụ) ──────────
export const PRM = { extraStart: 30, extraEnd: 70, ask: 84, diff: 112, params: 168, checks: 194, apply: 224, manual: 246, morph: 290 }

/** Giá trị đang gõ cứng trong mẫu mà AI đề xuất đổi thành ô nhập (thay cho bản so sánh câu lệnh). */
const FIXED_VALUES: [string, string, string][] = [
    ['2025', 'Năm đang gõ cứng trong mẫu', 'Năm báo cáo'],
    ['26.000', 'Tỷ giá đang gõ cứng trong mẫu', 'Tỷ giá USD/VND'],
]

const AiInputBox: React.FC<{ text: React.ReactNode; active?: boolean; press?: number; busy?: boolean; height?: number }> = ({ text, active, press = 1, busy, height = 58 }) => (
    <div style={{ display: 'flex', gap: 12, height }}>
        <div style={{ flex: 1, borderRadius: 12, border: `2px solid ${active ? C.violet : '#DCD3FB'}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', fontSize: 22, color: INK, background: '#fff', boxSizing: 'border-box', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <Ico k="sparkles" size={20} color="#7C3AED" />{text}
        </div>
        <span style={{ width: 150, borderRadius: 12, background: busy ? '#E5E3F2' : 'linear-gradient(90deg, #7C3AED, #4F46E5)', color: busy ? C.steel : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 20, fontWeight: 800, transform: `scale(${press})` }}>
            {busy ? <Spinner size={18} /> : <Ico k="sparkles" size={18} color="#fff" />}Phân tích
        </span>
    </div>
)
const NumBox: React.FC<{ value: string }> = ({ value }) => (
    <div style={{ height: 58, borderRadius: 12, border: `2px solid ${C.rule}`, display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 23, fontWeight: 600, color: INK, background: '#fff', boxSizing: 'border-box' }}>{value}</div>
)

export const ParamsScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = PRM
    const modal = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const asking = f >= T.ask && f < T.diff
    const out = ease(f, [T.morph - 6, T.morph + 12], [0, 1], Easing.inOut(Easing.cubic))
    const form = spring({ frame: f - T.morph, fps, config: { damping: 18, stiffness: 140 } })
    const cardRect = (i: number) => ({ x: 160 + i * 440, y: 790, w: 420, h: 92 })
    const fieldRect = (i: number) => ({ x: 520, y: 400 + i * 132, w: 880, h: 58 })
    return (
        <Stage>
            <RoleBanner role="power" />
            <Headline text="Nhờ AI biến năm và tỷ giá thành ô nhập" at={0} out={T.manual - 4} size={fit('Nhờ AI biến năm và tỷ giá thành ô nhập', 92)} top={54} accent={['thành ô nhập']} />
            <Headline text="Thêm ô lọc bằng lời cho cả phòng" at={T.manual} out={T.morph - 4} size={fit('Thêm ô lọc bằng lời cho cả phòng', 92)} top={54} accent={['lọc bằng lời']} />
            <Headline text="Người tải chỉ cần điền ô nhập" at={T.morph + 2} size={fit('Người tải chỉ cần điền ô nhập', 92)} top={54} accent={['điền ô nhập']} />

            {f < T.morph + 14 && (
                <AppWindow title="Thiết lập ô nhập cho mẫu · Power User / BA" icon="sparkles" barColor={C.navy} style={{ left: 120, top: 176, width: 1680, height: 830, opacity: modal * (1 - out), transform: `translateY(${(1 - modal) * 60}px) scale(${1 - out * 0.06})` }}>
                    <div style={{ display: 'flex', gap: 20, padding: '20px 28px 0' }}>
                        <div style={{ flex: 1, position: 'relative', borderRadius: 14, border: `2px solid ${f >= T.extraStart - 4 && f < T.ask ? C.violet : C.rule}`, padding: '14px 18px', fontSize: 22, lineHeight: 1.5, color: INK, height: 146, boxSizing: 'border-box' }}>
                            <span style={{ position: 'absolute', right: 12, top: 10 }}><Chip tone="violet" style={{ fontSize: 16, padding: '4px 10px' }}>Mở sẵn từ lượt Agent</Chip></span>
                            <div style={{ paddingRight: 230 }}>{AI_PREFILL}</div>
                            <div style={{ fontWeight: 700, color: C.navy, marginTop: 8 }}>{typed(f, AI_EXTRA, T.extraStart, T.extraEnd)}{f >= T.extraStart && f < T.ask && <Caret />}</div>
                        </div>
                        <div style={{
                            width: 210, height: 64, alignSelf: 'flex-end', borderRadius: 14, background: asking ? '#E5E3F2' : GRAD, color: asking ? C.steel : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 22, fontWeight: 800, transform: `scale(${pressAt(f, T.ask)})`,
                        }}>{asking ? <><Spinner size={20} />Đang viết lại…</> : <><Ico k="sparkles" size={22} color="#fff" />Hỏi AI</>}</div>
                    </div>
                    {f < T.diff && (
                        <div style={{ position: 'absolute', left: 28, right: 28, top: 312, height: 280, borderRadius: 14, border: `2px dashed ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#A3A0B8' }}>
                            {asking ? <span style={{ display: 'flex', gap: 12, alignItems: 'center', color: C.steel }}><Spinner />Đang viết lại…</span> : 'Gõ yêu cầu rồi bấm Hỏi AI, đề xuất hiện ở đây'}
                        </div>
                    )}
                </AppWindow>
            )}
            {f >= T.diff && f < T.morph + 14 && (
                <div style={{ position: 'absolute', inset: 0, opacity: 1 - out, transform: `scale(${1 - out * 0.06})`, transformOrigin: '960px 600px' }}>
                    <div style={{ position: 'absolute', left: 148, top: 420, fontSize: 23, fontWeight: 800, color: C.navy }}>AI tìm thấy 2 giá trị đang gõ cứng</div>
                    {FIXED_VALUES.map(([value, where, label], i) => {
                        const p = spring({ frame: f - T.diff - i * 10, fps, config: { damping: 14, stiffness: 190 } })
                        return (
                            <div key={label} style={{
                                position: 'absolute', left: 148, top: 468 + i * 96, width: 1624, height: 80, borderRadius: 16, border: `1.5px solid ${C.rule}`, background: '#fff',
                                display: 'flex', alignItems: 'center', gap: 20, padding: '0 24px', boxSizing: 'border-box', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 20}px)`,
                            }}>
                                <span style={{ minWidth: 110, textAlign: 'center', padding: '6px 16px', borderRadius: 10, background: '#FDECEA', color: '#B03A2E', fontSize: 26, fontWeight: 800 }}>{value}</span>
                                <span style={{ fontSize: 22, color: C.steel, width: 420 }}>{where}</span>
                                <Ico k="arrowRight" size={28} color="#7C3AED" />
                                <Chip tone="violet" style={{ fontSize: 24, padding: '8px 16px' }}><Ico k="input" size={22} color="#5B3FD6" />Ô nhập {label}</Chip>
                            </div>
                        )
                    })}
                    {f >= T.checks && (
                        <div style={{ position: 'absolute', left: 148, top: 902, display: 'flex', gap: 14 }}>
                            {['Chỉ đọc dữ liệu', 'Đủ ô nhập cho mọi giá trị'].map((t, i) => {
                                const p = spring({ frame: f - T.checks - i * 6, fps, config: { damping: 12, stiffness: 200 } })
                                return <Chip key={t} tone="green" style={{ fontSize: 20, transform: `scale(${p})` }}><Ico k="shield" size={20} color={C.emerald} />{t}</Chip>
                            })}
                        </div>
                    )}
                    <div style={{ position: 'absolute', right: 148, top: 896, display: 'flex', gap: 14 }}>
                        <span style={{ padding: '14px 26px', borderRadius: 12, border: `1px solid ${C.rule}`, fontSize: 22, fontWeight: 700, color: C.steel, background: '#fff' }}>Bỏ</span>
                        <span style={{ padding: '14px 30px', borderRadius: 12, background: C.violet, color: '#fff', fontSize: 22, fontWeight: 800, transform: `scale(${pressAt(f, T.apply)})` }}>Áp dụng</span>
                    </div>
                </div>
            )}

            {f >= T.morph && (
                <AppWindow title="Cổng Dữ Liệu" icon="download" barColor={C.navy} style={{ left: 460, top: 200, width: 1000, height: 640, opacity: Math.min(1, form * 1.5), transform: `translateY(${(1 - form) * 60}px)` }}>
                    <div style={{ padding: '22px 34px 0' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: INK }}>{TEMPLATE_NAME}</div>
                        <div style={{ fontSize: 20, color: C.steel, marginTop: 4 }}>Mọi thành viên trong phòng chỉ cần điền ô nhập để tải file</div>
                    </div>
                    {PARAMS.map((p, i) => (
                        <div key={p.id} style={{ position: 'absolute', left: 60, top: 168 + i * 132, fontSize: 20, fontWeight: 700, color: C.steel, opacity: ease(f, [T.morph + 18 + i * 6, T.morph + 28 + i * 6], [0, 1]) }}>{p.label}</div>
                    ))}
                </AppWindow>
            )}
            {f >= T.params && PARAMS.map((p, i) => {
                const at = p.manual ? T.manual + 4 : T.params + i * 8
                if (f < at) return null
                const pop = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 190 } })
                const m = ease(f, [T.morph + 4 + i * 5, T.morph + 26 + i * 5], [0, 1], Easing.inOut(Easing.cubic))
                const a = cardRect(i), b = fieldRect(i)
                const x = a.x + (b.x - a.x) * m, y = a.y + (b.y - a.y) * m, w = a.w + (b.w - a.w) * m, h = a.h + (b.h - a.h) * m
                return (
                    <div key={p.id} style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${m > 0 ? 1 : pop})`, opacity: Math.min(1, pop * 2) }}>
                        {m < 0.5 ? (
                            <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', borderRadius: 16, background: '#fff', border: `2px ${p.manual ? 'dashed' : 'solid'} ${C.violet}`, boxShadow: '0 14px 34px rgba(109,93,246,0.18)', padding: '12px 18px', opacity: 1 - m * 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Ico k={p.manual ? 'sparkles' : 'input'} size={22} color="#5B3FD6" />
                                    <span style={{ fontSize: 20, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{p.label}</span>
                                    {p.manual && <span style={{ marginLeft: 'auto' }}><Chip tone="amber" style={{ fontSize: 14, padding: '3px 8px' }}>Thêm tay</Chip></span>}
                                </div>
                                <div style={{ fontSize: 18, color: C.steel, marginTop: 4, whiteSpace: 'nowrap' }}>{p.kind} · {p.detail}</div>
                            </div>
                        ) : (
                            <div style={{ opacity: (m - 0.5) * 2 }}>
                                {p.manual ? <AiInputBox text={<span style={{ color: '#A3A0B8', fontWeight: 500 }}>VD: khách cá nhân, số dư từ 20.000 USD</span>} /> : <NumBox value={i === 0 ? '2025' : '26.000'} />}
                            </div>
                        )}
                    </div>
                )
            })}
            <PathCursor from={T.extraEnd} to={T.ask + 14} clicks={[T.ask]} keys={[[T.extraEnd, 1500, 300], [T.ask - 6, 1695, 330], [T.ask + 14, 1695, 330]]} />
            <PathCursor from={T.checks + 4} to={T.apply + 12} clicks={[T.apply]} keys={[[T.checks + 4, 1300, 980], [T.apply - 6, 1700, 922], [T.apply + 12, 1700, 922]]} />
            <StepRail active={4} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · dữ liệu mô phỏng`} />
        </Stage>
    )
}

// ─── 8 · Dựng mẫu Excel ngay trên giao diện (Power User phòng Nghiệp vụ) ─────────────
export const XL = { title: 22, titleEnd: 56, note: 62, table: 82, rows: 104, rename: 120, fmt: 166, opts: 196 }
const BCOLS: { key: string; header: string; fmt: string }[] = [
    { key: 'cif', header: 'CIF', fmt: 'Chữ' },
    { key: 'ten_chu_tai_khoan', header: 'Tên khách hàng', fmt: 'Chữ' },
    { key: 'so_du', header: 'Số dư', fmt: 'Số thập phân 1.234,56' },
    { key: 'dong_trong_nam', header: 'Đóng trong năm', fmt: 'Chữ' },
]
const Block: React.FC<{ icon: IconKind; label: string; at: number; top: number; height: number; children: React.ReactNode }> = ({ icon, label, at, top, height, children }) => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const p = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 170 } })
    if (f < at) return null
    return (
        <div style={{ position: 'absolute', left: 104, width: 812, top, height, borderRadius: 16, border: `1px solid ${C.rule}`, background: '#FBFBFE', padding: '12px 18px', boxSizing: 'border-box', opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 50}px)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 19, fontWeight: 800, color: C.navy }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: '#EFEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k={icon} size={18} color={C.navy} /></span>{label}
            </div>
            {children}
        </div>
    )
}
export const ExcelScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = XL
    const panel = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const sheet = spring({ frame: f - 30, fps, config: { damping: 18, stiffness: 120 } })
    const titleTyped = typed(f, REPORT_TITLE_TPL, T.title, T.titleEnd)
    const noteTyped = f >= T.note ? REPORT_NOTE_TPL.slice(0, Math.floor(interpolate(f, [T.note, T.note + 16], [0, REPORT_NOTE_TPL.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))) : ''
    const used = (id: string) => titleTyped.includes(`{${id}}`) || noteTyped.includes(`{${id}}`)
    const rows = interpolate(f, [T.rows, T.rows + 30], [0, REPORT_ROWS.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return (
        <Stage>
            <RoleBanner role="power" />
            <Headline text="Dựng mẫu Excel ngay trên giao diện" at={0} out={140} size={fit('Dựng mẫu Excel ngay trên giao diện', 90)} top={54} accent={['mẫu Excel']} />
            <Headline text="Đặt tên cột, định dạng số, không cần file" at={142} size={fit('Đặt tên cột, định dạng số, không cần file', 86)} top={54} accent={['không cần file']} />
            <>
                <div style={{ ...panelStyle, left: 80, top: 176, width: 860, height: 836, opacity: panel, transform: `translateY(${(1 - panel) * 50}px)` }} />
                <div style={{ position: 'absolute', left: 104, top: 196, width: 812, display: 'flex', gap: 14, opacity: panel }}>
                    {[['Dựng mẫu ngay tại đây', 'Không cần file'], ['Tải file mẫu lên', '.xlsx / .docx tự thiết kế']].map(([a, b], i) => (
                        <div key={a} style={{ flex: 1, borderRadius: 14, padding: '12px 16px', border: `2px solid ${i === 0 ? C.violet : C.rule}`, background: i === 0 ? '#F6F3FF' : '#fff' }}>
                            <div style={{ fontSize: 21, fontWeight: 800, color: i === 0 ? C.navy : C.steel }}>{a}</div>
                            <div style={{ fontSize: 17, color: C.steel }}>{b}</div>
                        </div>
                    ))}
                </div>
                <div style={{ position: 'absolute', left: 104, top: 290, display: 'flex', gap: 10, opacity: panel }}>
                    {['Tiêu đề', 'Đoạn chữ', 'Bảng', 'Khoảng trống'].map(t => <span key={t} style={{ padding: '6px 14px', borderRadius: 10, border: `1px dashed ${C.rule}`, fontSize: 18, fontWeight: 600, color: C.steel }}>+ {t}</span>)}
                </div>
                <div style={{ position: 'absolute', left: 104, top: 342, width: 812, fontSize: 18, color: C.steel, opacity: panel }}>
                    Chèn ô nhập vào tiêu đề báo cáo:
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        {(['nam_bao_cao', 'ty_gia', 'today', 'user'] as const).map(id => (
                            <span key={id} style={{ fontSize: 18, fontWeight: 800, padding: '2px 10px', borderRadius: 8, color: used(id) ? '#fff' : '#5B3FD6', background: used(id) ? C.violet : '#EFEAFE' }}>{({ nam_bao_cao: 'Năm báo cáo', ty_gia: 'Tỷ giá', today: 'Ngày xuất', user: 'Người lập' })[id]}</span>
                        ))}
                    </div>
                </div>
                <Block icon="type" label="Tiêu đề" at={T.title - 8} top={414} height={104}>
                    <div style={{ marginTop: 10, height: 44, borderRadius: 10, border: `2px solid ${f < T.note ? C.violet : C.rule}`, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 22, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>
                        {withPlaceholders(titleTyped)}{f < T.note && <Caret />}
                        <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 600, color: C.steel }}>Lớn · Giữa</span>
                    </div>
                </Block>
                <Block icon="fileText" label="Đoạn chữ" at={T.note - 6} top={530} height={96}>
                    <div style={{ marginTop: 8, fontSize: 20, fontStyle: 'italic', color: '#4A4766', whiteSpace: 'nowrap', overflow: 'hidden' }}>{withPlaceholders(noteTyped)}</div>
                </Block>
                <Block icon="sheet" label="Bảng dữ liệu · 12 cột mẫu NHNN" at={T.table} top={638} height={360}>
                    <div style={{ display: 'flex', marginTop: 10, fontSize: 17, fontWeight: 700, color: C.steel, padding: '0 8px' }}>
                        <span style={{ width: 60 }}>Hiện</span><span style={{ flex: 1.2 }}>Tên cột trong file</span><span style={{ flex: 1 }}>Định dạng</span>
                    </div>
                    {BCOLS.map((c, i) => {
                        const ren = ease(f, [T.rename + i * 7, T.rename + i * 7 + 12], [0, 1])
                        const fm = spring({ frame: f - T.fmt - i * 4, fps, config: { damping: 12, stiffness: 200 } })
                        const label = ren <= 0 ? c.key : ren >= 1 ? c.header : ren < 0.5 ? c.key.slice(0, Math.ceil(c.key.length * (1 - ren * 2))) : c.header.slice(0, Math.ceil(c.header.length * (ren - 0.5) * 2))
                        return (
                            <div key={c.key} style={{ display: 'flex', alignItems: 'center', marginTop: 6, padding: '6px 8px', borderRadius: 10, background: '#fff', border: `1px solid ${C.rule}`, fontSize: 20 }}>
                                <span style={{ width: 60 }}><span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: 6, background: C.violet, alignItems: 'center', justifyContent: 'center' }}><Ico k="check" size={15} color="#fff" stroke={3} /></span></span>
                                <span style={{ flex: 1.2, fontWeight: 700, color: INK, fontFamily: ren < 0.5 ? MONO : undefined }}>{label}</span>
                                <span style={{ flex: 1 }}>{f >= T.fmt + i * 4 ? <Chip tone={c.fmt === 'Chữ' ? 'ink' : 'blue'} style={{ fontSize: 17, padding: '3px 10px', transform: `scale(${fm})`, ...(c.fmt === 'Chữ' ? { background: '#F1F0F8', color: C.steel } : {}) }}>{c.fmt}</Chip> : <span style={{ color: '#A3A0B8' }}>Tự động</span>}</span>
                            </div>
                        )
                    })}
                    <div style={{ fontSize: 17, color: C.steel, margin: '6px 8px 0' }}>và 8 cột khác theo đúng thứ tự yêu cầu</div>
                </Block>
                <ExcelSheet width={860} rowH={46} data={REPORT_ROWS} rows={rows} header={ease(f, [T.rename + 10, T.rename + 30], [0.35, 1])} fromCol={6} scale={0.92}
                    titleText={withPlaceholders(titleTyped)} noteText={withPlaceholders(noteTyped)}
                    style={{ left: 980, top: 200, opacity: Math.min(1, sheet * 1.5), transform: `translateX(${(1 - sheet) * 200}px)` }} />
            </>
            <Burst at={T.fmt + 4} x={1700} y={420} r={130} />
            <StepRail active={4} />
            <Tag />
        </Stage>
    )
}

// ─── 8b · Setup Template trên màn hình Excel: Đặt Placeholder -> Tự điền đầy đủ ──────
export const TPL_SETUP = {
    pYear: 22,
    pRate: 48,
    pUser: 72,
    pRow: 98,
    fillClick: 152,
    filled: 162,
}

const SETUP_COLS = COLS.filter(c => c.key !== 'ten_ngan_hang' && c.key !== 'giin' && c.key !== 'tin' && c.key !== 'quoc_gia')
const SETUP_PLACEHOLDERS: Record<string, string> = {
    cif: '{cif}',
    ten_chu_tai_khoan: '{ten_khach_hang}',
    ca_nhan_to_chuc: '{loai_kh}',
    so_tai_khoan: '{so_tai_khoan}',
    loai: '{loai_tk}',
    don_vi_tien_te: '{tien_te}',
    so_du: '{so_du}',
    dong_trong_nam: '{dong}',
}

export const SetupTemplateScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = TPL_SETUP
    const winIn = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const isFilled = f >= T.filled
    const fillWave = ease(f, [T.filled, T.filled + 22], [0, 1], Easing.out(Easing.cubic))

    const totalW = SETUP_COLS.reduce((s, c) => s + c.w, 0)
    const scaleW = (1740 - 56) / totalW
    const cw = SETUP_COLS.map(c => c.w * scaleW)
    const fullRowW = cw.reduce((s, w) => s + w, 0)

    const cellStyle = (w: number, h = 56, extra?: React.CSSProperties): React.CSSProperties => ({
        width: w, height: h, flexShrink: 0, boxSizing: 'border-box',
        borderRight: '1px solid #E1E5EA', borderBottom: '1px solid #E1E5EA',
        display: 'flex', alignItems: 'center', padding: '0 14px',
        fontSize: 21, whiteSpace: 'nowrap', overflow: 'hidden', ...extra,
    })
    const rowNo = (n: number | string, h = 56) => (
        <div style={cellStyle(56, h, { justifyContent: 'center', background: '#F3F5F7', color: '#7B8794', fontSize: 18, fontWeight: 700, padding: 0 })}>
            {n}
        </div>
    )

    const phPill = (txt: string, at: number, filledVal: string) => {
        if (f < at) return <span style={{ color: '#A3A0B8' }}>...</span>
        const pop = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 210 } })
        if (!isFilled) {
            return (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', padding: '3px 12px', borderRadius: 8,
                    fontFamily: MONO, fontSize: 21, fontWeight: 800, color: '#5B3FD6',
                    background: '#EFEAFE', border: '2px solid #8B5CF6',
                    transform: `scale(${pop})`,
                }}>
                    {txt}
                </span>
            )
        }
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '3px 12px', borderRadius: 8,
                fontSize: 22, fontWeight: 800, color: '#0E7A5F',
                background: '#E6F6EE', border: '1.5px solid #6FD3A6',
            }}>
                {filledVal}
            </span>
        )
    }

    return (
        <Stage>
            <RoleBanner role="enduser" />
            <Headline
                text="Đặt các ô giữ chỗ ngay trên màn hình mẫu Excel"
                at={0}
                out={T.fillClick - 4}
                size={fit('Đặt các ô giữ chỗ ngay trên màn hình mẫu Excel', 86)}
                top={54}
                accent={['ô giữ chỗ', 'màn hình mẫu Excel']}
            />
            <Headline
                text="Hệ thống tự điền số liệu thành file báo cáo đầy đủ"
                at={T.fillClick}
                size={fit('Hệ thống tự điền số liệu thành file báo cáo đầy đủ', 86)}
                top={54}
                accent={['tự điền số liệu', 'file báo cáo đầy đủ']}
            />

            <Shake hits={[T.fillClick + 2]} amp={7}>
                <div style={{
                    position: 'absolute', left: 90, top: 172, width: 1740, height: 820,
                    background: '#fff', borderRadius: 20, overflow: 'hidden',
                    boxShadow: '0 30px 80px rgba(16,60,35,0.22)', border: '2px solid #CFD8D3',
                    opacity: winIn, transform: `translateY(${(1 - winIn) * 50}px)`,
                }}>
                    {/* Thanh tiêu đề Excel */}
                    <div style={{
                        height: 54, background: XL_GREEN, color: '#fff',
                        display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px',
                        fontSize: 21, fontWeight: 800,
                    }}>
                        <Ico k="fileSheet" size={26} color="#fff" />
                        <span>{isFilled ? 'Bao_cao_FATCA_2025.xlsx · Đã tự điền hoàn chỉnh (12 cột mẫu NHNN)' : 'Thiết kế Mẫu Excel · Đặt Placeholder tự động'}</span>
                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Badge kind="sim" size={14} />
                        </span>
                    </div>

                    {/* Thanh công cụ Placeholder */}
                    <div style={{
                        height: 68, background: '#F8F9FA', borderBottom: '1px solid #E1E5EA',
                        display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px',
                    }}>
                        <span style={{ fontSize: 19, fontWeight: 800, color: INK }}>Placeholder gắn vào mẫu:</span>
                        {([
                            ['{nam_bao_cao}', f >= T.pYear],
                            ['{ty_gia}', f >= T.pRate],
                            ['{user}', f >= T.pUser],
                            ['{today}', f >= T.pUser + 8],
                            ['{dong_du_lieu_12_cot}', f >= T.pRow],
                        ] as const).map(([tok, used]) => (
                            <span key={tok} style={{
                                fontFamily: MONO, fontSize: 18, fontWeight: 800,
                                padding: '6px 14px', borderRadius: 10,
                                background: used ? (isFilled ? '#E6F6EE' : C.violet) : '#EFEAFE',
                                color: used ? (isFilled ? C.emerald : '#fff') : '#5B3FD6',
                                border: `1.5px solid ${used ? (isFilled ? '#6FD3A6' : C.violet) : '#C4B5FD'}`,
                            }}>
                                {tok}
                            </span>
                        ))}

                        <span style={{
                            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10,
                            padding: '10px 22px', borderRadius: 12,
                            background: isFilled ? '#E6F6EE' : GRAD,
                            color: isFilled ? C.emerald : '#fff',
                            border: isFilled ? `2px solid ${C.emerald}` : 'none',
                            fontSize: 20, fontWeight: 800,
                            transform: `scale(${pressAt(f, T.fillClick)})`,
                        }}>
                            <Ico k={isFilled ? 'check' : 'sparkles'} size={20} color={isFilled ? C.emerald : '#fff'} stroke={2.5} />
                            {isFilled ? 'Đã tự điền đầy đủ' : 'Tự động điền dữ liệu'}
                        </span>
                    </div>

                    {/* Lưới cột A B C D E F G H */}
                    <div style={{ display: 'flex' }}>
                        {rowNo('', 42)}
                        {SETUP_COLS.map((c, i) => (
                            <div key={c.key} style={cellStyle(cw[i], 42, { justifyContent: 'center', background: '#F3F5F7', color: '#7B8794', fontSize: 17, fontWeight: 800 })}>
                                {'ABCDEFGH'[i]}
                            </div>
                        ))}
                    </div>

                    {/* Dòng 1: Tiêu đề báo cáo có {nam_bao_cao} */}
                    <div style={{ display: 'flex' }}>
                        {rowNo(1, 64)}
                        <div style={cellStyle(fullRowW, 64, { justifyContent: 'center', gap: 12, fontSize: 27, fontWeight: 800, color: '#1F2A37', background: '#fff' })}>
                            <span>BÁO CÁO FATCA NĂM</span>
                            {phPill('{nam_bao_cao}', T.pYear, '2025')}
                        </div>
                    </div>

                    {/* Dòng 2: Ghi chú có {ty_gia}, {user}, {today} */}
                    <div style={{ display: 'flex' }}>
                        {rowNo(2, 58)}
                        <div style={cellStyle(fullRowW, 58, { justifyContent: 'center', gap: 10, fontSize: 20, fontWeight: 700, color: '#52606D', background: '#FAFAFE' })}>
                            <span>Tỷ giá USD/VND:</span>
                            {phPill('{ty_gia}', T.pRate, '26.000')}
                            <span style={{ marginLeft: 14 }}>· Người lập:</span>
                            {phPill('{user}', T.pUser, 'Nguyễn Thị Lan')}
                            <span style={{ marginLeft: 14 }}>· Ngày xuất:</span>
                            {phPill('{today}', T.pUser + 8, '23/10/2026')}
                        </div>
                    </div>

                    {/* Dòng 3: Dòng tiêu đề cột bảng (Header) */}
                    <div style={{ display: 'flex' }}>
                        {rowNo(3, 54)}
                        {SETUP_COLS.map((c, i) => (
                            <div key={c.key} style={cellStyle(cw[i], 54, {
                                background: '#1F4E78', color: '#fff', fontWeight: 800, fontSize: 20,
                                justifyContent: c.num ? 'flex-end' : 'flex-start', borderRight: '1px solid #3A6A94',
                            })}>
                                {c.header}
                            </div>
                        ))}
                    </div>

                    {/* Dòng 4..8: Trước khi điền là dòng Placeholder {cif}, {ten_kh}... Sau khi điền bung thành 5 dòng dữ liệu đầy đủ */}
                    {!isFilled ? (
                        <>
                            <div style={{ display: 'flex' }}>
                                {rowNo(4, 68)}
                                {SETUP_COLS.map((c, i) => {
                                    const p = spring({ frame: f - (T.pRow + i * 3), fps, config: { damping: 14, stiffness: 200 } })
                                    return (
                                        <div key={c.key} style={cellStyle(cw[i], 68, {
                                            background: f >= T.pRow ? '#F6F3FF' : '#fff',
                                            borderBottom: '2px dashed #8B5CF6',
                                            justifyContent: c.num ? 'flex-end' : 'flex-start',
                                        })}>
                                            {f >= T.pRow && (
                                                <span style={{
                                                    fontFamily: MONO, fontSize: 18.5, fontWeight: 800,
                                                    color: '#5B3FD6', background: '#EFEAFE',
                                                    padding: '4px 10px', borderRadius: 8, border: '1.5px solid #C4B5FD',
                                                    transform: `scale(${p})`,
                                                }}>
                                                    {SETUP_PLACEHOLDERS[c.key]}
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            {[5, 6, 7, 8].map(rNum => (
                                <div key={rNum} style={{ display: 'flex' }}>
                                    {rowNo(rNum, 60)}
                                    {rNum === 5 && f >= T.pRow + 18 ? (
                                        <div style={cellStyle(fullRowW, 60, { justifyContent: 'center', color: '#5B3FD6', fontSize: 20, fontWeight: 700, background: '#FBFBFE' })}>
                                            <Ico k="sparkles" size={20} color={C.violet} style={{ marginRight: 10 }} />
                                            Các dòng dữ liệu phía dưới sẽ tự động giãn theo số lượng khách hàng thực tế
                                        </div>
                                    ) : (
                                        cw.map((w, idx) => <div key={idx} style={cellStyle(w, 60)} />)
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        REPORT_ROWS.map((r, i) => {
                            const rowP = spring({ frame: f - (T.filled + i * 5), fps, config: { damping: 15, stiffness: 190 } })
                            const bg = i % 2 ? '#EEF3F8' : '#fff'
                            return (
                                <div key={i} style={{ display: 'flex', opacity: Math.min(1, rowP * 1.8), transform: `translateY(${(1 - rowP) * 16}px)` }}>
                                    {rowNo(4 + i, 62)}
                                    {SETUP_COLS.map((c, k) => (
                                        <div key={c.key} style={cellStyle(cw[k], 62, {
                                            background: bg,
                                            justifyContent: c.num ? 'flex-end' : c.key === 'dong_trong_nam' ? 'center' : 'flex-start',
                                            fontVariantNumeric: 'tabular-nums',
                                            fontFamily: c.key === 'cif' || c.key === 'so_tai_khoan' ? MONO : undefined,
                                            fontWeight: (c.key === 'dong_trong_nam' && r.dong === 'Y') || c.key === 'so_du' || c.key === 'ten_chu_tai_khoan' ? 800 : 600,
                                            color: c.key === 'dong_trong_nam' && r.dong === 'Y' ? C.red : INK,
                                        })}>
                                            {c.get(r)}
                                        </div>
                                    ))}
                                </div>
                            )
                        })
                    )}
                </div>
            </Shake>

            {/* Thanh chú thích nổi bật ở dưới khi đã điền xong */}
            {isFilled && (
                <div style={{
                    position: 'absolute', left: 90, top: 896,
                    display: 'flex', gap: 14, zIndex: 95,
                    opacity: fillWave, transform: `translateY(${(1 - fillWave) * 20}px)`,
                }}>
                    <Chip tone="green" style={{ fontSize: 20, padding: '8px 18px' }}>
                        <Ico k="check" size={20} color={C.emerald} stroke={3} />
                        Tự điền Năm 2025 & Tỷ giá 26.000
                    </Chip>
                    <Chip tone="violet" style={{ fontSize: 20, padding: '8px 18px' }}>
                        <Ico k="check" size={20} color="#5B3FD6" stroke={3} />
                        Tự đổ danh sách KH đúng 12 cột
                    </Chip>
                </div>
            )}

            <PathCursor
                from={12}
                to={T.fillClick + 16}
                clicks={[T.pYear, T.pRate, T.pRow, T.fillClick]}
                keys={[
                    [12, 820, 460],
                    [T.pYear, 1110, 326],
                    [T.pRate, 690, 386],
                    [T.pRow, 480, 504],
                    [T.fillClick - 10, 1660, 260],
                    [T.fillClick + 16, 1660, 260],
                ]}
            />
            <Burst at={T.fillClick} x={1660} y={260} r={140} color="#10B981" />
            <StepRail active={4} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · Thiết kế mẫu Excel bằng Placeholder`} />
        </Stage>
    )
}

// ─── 9 · Cổng Dữ Liệu: gõ điều kiện bằng chữ, tải đúng mẫu (90% Cán bộ Nghiệp vụ) ────
export const PTL = { focus: 60, type: 72, typeEnd: 112, analyze: 128, result: 146, click: 200, ready: 226, file: 236, open: 270, sheet: 276, fill: 315 }
const OTHERS = ['Danh sách khách hàng CRS', 'Sao kê tài khoản theo kỳ']
export const PortalScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = PTL
    const win = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const analyzing = f >= T.analyze && f < T.result
    const res = spring({ frame: f - T.result, fps, config: { damping: 15, stiffness: 180 } })
    const busy = f >= T.click && f < T.ready
    const toast = spring({ frame: f - T.ready, fps, config: { damping: 14, stiffness: 190 } })
    const file = spring({ frame: f - T.file, fps, config: { damping: 12, stiffness: 180 } })
    const grow = ease(f, [T.sheet, T.sheet + 24], [0, 1], Easing.inOut(Easing.cubic))
    const behind = ease(f, [T.sheet, T.sheet + 20], [0, 1])
    const sx = interpolate(grow, [0, 1], [1330, 80]), sy = interpolate(grow, [0, 1], [952, 260]), sw = interpolate(grow, [0, 1], [430, 1760])
    const typedText = typed(f, AI_FILTER_TEXT, T.type, T.typeEnd)
    const mode = useTemplateMode()
    const chipsAt = mode === 'biz' ? T.fill + 30 : T.sheet + 26
    return (
        <Stage>
            <RoleBanner role="enduser" />
            <Headline text="Đồng nghiệp mở Cổng Dữ Liệu, chọn mẫu" at={0} out={T.type - 6} size={fit('Đồng nghiệp mở Cổng Dữ Liệu, chọn mẫu', 92)} top={54} accent={['Cổng Dữ Liệu', 'chọn mẫu']} />
            <Headline text="Gõ thêm điều kiện bằng lời, AI hiểu ngay" at={T.type - 2} out={T.sheet + 4} size={fit('Gõ thêm điều kiện bằng lời, AI hiểu ngay', 90)} top={54} accent={['bằng lời']} />
            {mode === 'biz'
                ? <Headline text="Bấm tải, ô giữ chỗ thành số thật" at={T.sheet + 8} size={fit('Bấm tải, ô giữ chỗ thành số thật', 96)} top={58} accent={['thành số thật']} />
                : <Headline text="Tải Excel đúng mẫu, không cần phiếu IT" at={T.sheet + 8} size={fit('Tải Excel đúng mẫu, không cần phiếu IT', 92)} top={58} accent={['đúng mẫu', 'không cần phiếu IT']} />}
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - behind * 0.85, filter: behind > 0.01 ? `blur(${behind * 6}px)` : undefined }}>
                <AppWindow title="Cổng Dữ Liệu" icon="download" barColor={C.navy} style={{ left: 110, top: 176, width: 1700, height: 820, opacity: win, transform: `translateY(${(1 - win) * 60}px)` }}>
                    <div style={{ padding: '18px 30px 0', fontSize: 20, color: C.steel }}>Chọn mẫu của phòng, điền ô nhập, bấm tải</div>
                    <div style={{ display: 'flex', gap: 26, padding: '18px 30px' }}>
                        <div style={{ width: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ height: 52, borderRadius: 12, border: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 19, color: '#A3A0B8' }}>Tìm kiếm mẫu...</div>
                            {[TEMPLATE_NAME, ...OTHERS].map((n, i) => (
                                <div key={n} style={{ borderRadius: 16, padding: '16px 20px', border: `2px solid ${i === 0 ? C.violet : C.rule}`, background: i === 0 ? '#F6F3FF' : '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Ico k="fileSheet" size={24} color={i === 0 ? C.navy : C.steel} /><span style={{ fontSize: 22, fontWeight: 800, color: INK }}>{n}</span></div>
                                    <div style={{ fontSize: 18, color: C.steel, marginTop: 6 }}>{i === 0 ? '3 ô nhập · Phòng Tuân thủ' : 'Phòng Tuân thủ'}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ flex: 1, borderRadius: 18, border: `1px solid ${C.rule}`, padding: '22px 30px', position: 'relative', height: 660, boxSizing: 'border-box' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: INK }}>{TEMPLATE_NAME}</div>
                            <div style={{ fontSize: 19, color: C.steel, marginTop: 2 }}>Ô nhập</div>
                            <div style={{ display: 'flex', gap: 20, marginTop: 18 }}>
                                {(['Năm báo cáo', 'Tỷ giá USD/VND'] as const).map((lab, i) => (
                                    <div key={lab} style={{ flex: 1 }}>
                                        <div style={{ fontSize: 19, fontWeight: 700, color: C.steel, marginBottom: 8 }}>{lab}</div>
                                        <NumBox value={i ? '26000' : '2025'} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: 19, fontWeight: 700, color: C.steel, margin: '18px 0 8px' }}>Điều kiện lọc</div>
                            <AiInputBox active={f >= T.focus && f < T.analyze} busy={analyzing} press={pressAt(f, T.analyze)}
                                text={f >= T.type ? <span>{typedText}{f < T.analyze && <Caret />}</span> : <span style={{ color: '#A3A0B8', fontWeight: 500 }}>Gõ điều kiện bằng lời</span>} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 17, color: C.steel, flexWrap: 'nowrap' }}>
                                <b style={{ color: INK }}>Cột cho phép lọc:</b>
                                {AI_FILTER_COLS.map(c => <span key={c} style={{ fontSize: 17, fontWeight: 700, padding: '2px 10px', borderRadius: 6, background: '#F1F0F8', color: '#4A4766' }}>{c}</span>)}
                            </div>
                            {f >= T.result && (
                                <div style={{ marginTop: 12, borderRadius: 14, border: '1px solid #DCD3FB', background: '#F8F5FF', padding: '14px 18px', opacity: Math.min(1, res * 2), transform: `translateY(${(1 - res) * 16}px)` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 18, fontWeight: 800, color: '#4C1D95' }}><Ico k="check" size={18} color={C.emerald} stroke={3} />AI hiểu là:</span>
                                        {AI_FILTER_CLAUSES.map((c, i) => {
                                            const p = spring({ frame: f - T.result - 4 - i * 6, fps, config: { damping: 12, stiffness: 200 } })
                                            return (
                                                <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                                    {i > 0 && <span style={{ fontSize: 15, fontWeight: 800, color: C.steel }}>VÀ</span>}
                                                    <span style={{ fontSize: 21, padding: '4px 12px', borderRadius: 8, border: '1px solid #C4B5FD', background: '#fff', color: '#5B21B6', transform: `scale(${p})`, display: 'inline-block', fontWeight: 700 }}>{c}</span>
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <div style={{ position: 'absolute', left: 30, right: 30, bottom: 26, display: 'flex', gap: 16 }}>
                                <span style={{ flex: 1, height: 60, borderRadius: 14, border: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 22, fontWeight: 700, color: C.steel }}><Ico k="fileText" size={22} />Tải Xuống CSV</span>
                                <span style={{ flex: 1, height: 60, borderRadius: 14, background: busy ? '#E5E3F2' : '#1D6F42', color: busy ? C.steel : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 22, fontWeight: 800, transform: `scale(${pressAt(f, T.click)})` }}>
                                    {busy ? <><Spinner size={20} />Đang chuẩn bị...</> : <><Ico k="fileSheet" size={22} color="#fff" />Tải Xuống Excel</>}
                                </span>
                            </div>
                        </div>
                    </div>
                </AppWindow>
                {f >= T.ready && (
                    <div style={{ ...panelStyle, right: 130, top: 196, width: 420, padding: '14px 18px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, toast * 2), transform: `translateY(${(1 - toast) * -30}px)`, zIndex: 40, borderRadius: 16 }}>
                        <span style={{ width: 40, height: 40, borderRadius: 20, background: '#E6F6EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k="check" size={24} color={C.emerald} stroke={3} /></span>
                        <div><div style={{ fontSize: 22, fontWeight: 800, color: INK }}>Tải file thành công</div><div style={{ fontSize: 18, color: C.steel }}>Đúng mẫu 12 cột NHNN</div></div>
                    </div>
                )}
            </div>
            {f >= T.file && (
                <div style={{ position: 'absolute', left: sx, top: sy, width: sw, zIndex: 80, opacity: grow > 0.02 ? 1 - grow : Math.min(1, file * 2), transform: grow > 0.02 ? undefined : `scale(${file})` }}>
                    <div style={{ ...panelStyle, position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, border: '2px solid #1D6F42' }}>
                        <Ico k="fileSheet" size={34} color="#1D6F42" /><span style={{ fontSize: 20, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{FILE_NAME}</span>
                    </div>
                </div>
            )}
            {/* Bản Biz: file mở ra là đúng file mẫu cảnh trước (dòng chip ô giữ chỗ), rồi chip thành số thật —
                màn điền số chỉ diễn một lần ở đây. Bản Full mở file dựng kéo thả. */}
            {f >= T.sheet && (mode === 'biz'
                ? <div style={{ position: 'absolute', left: sx, top: sy, width: TEMPLATE_SHEET_W, height: 600, opacity: grow, zIndex: 90, transform: `scale(${sw / TEMPLATE_SHEET_W})`, transformOrigin: 'top left' }}>
                    <Shake hits={[T.fill + 2]} amp={6}>
                        <TemplateSheet
                            fileName={FILE_NAME}
                            rows={f >= T.fill ? FILTERED_ROWS : []}
                            grow={ease(f, [T.fill, T.fill + 24], [0, 1], Easing.out(Easing.cubic))}
                            slot={f >= T.fill ? undefined : () => 1}
                            blank={f >= T.fill ? 0 : 2}
                        />
                    </Shake>
                </div>
                : <ExcelSheet width={sw} rowH={54 * (0.45 + 0.55 * grow)} data={FILTERED_ROWS} rows={FILTERED_ROWS.length} fileName={FILE_NAME} fromCol={2} scale={(sw - 44) / 1416}
                    style={{ left: sx, top: sy, opacity: grow, zIndex: 90 }} />)}
            {f >= chipsAt && (
                <div style={{ position: 'absolute', left: 80, top: 750, display: 'flex', gap: 12, zIndex: 95, opacity: ease(f, [chipsAt, chipsAt + 10], [0, 1]) }}>
                    <Badge kind="sim" size={16} />
                    <Chip tone="green" style={{ fontSize: 24, padding: '10px 18px' }}><Ico k="check" size={22} stroke={3} />Chỉ khách tổ chức, đúng điều kiện đã gõ</Chip>
                    {mode === 'biz' && <Chip tone="violet" style={{ fontSize: 24, padding: '10px 18px' }}><Ico k="send" size={22} />Không cần phiếu IT</Chip>}
                </div>
            )}
            <PathCursor from={14} to={T.open + 8} clicks={[T.focus, T.analyze, T.click, T.open]} keys={[[14, 1100, 1040], [T.focus - 6, 1150, 664], [T.analyze - 10, 1150, 664], [T.analyze - 2, 1676, 664], [T.click - 10, 1676, 664], [T.click - 2, 1500, 888], [T.open - 10, 1500, 888], [T.open - 2, 1440, 982], [T.open + 8, 1440, 982]]} />
            <StepRail active={5} />
            <Tag />
        </Stage>
    )
}
