import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { ease, INK, panelStyle, Shake, Stage } from '../promo/kit'
import { AI_FILTER_CLAUSES, AI_FILTER_COLS, AI_FILTER_TEXT, BRAND, FILE_NAME, FILTERED_ROWS, TEMPLATE_NAME } from './data'
import { fit, Tag } from './scenes1'
import { TEMPLATE_SHEET_W, TemplateSheet } from './scenesBranch'
import { Headline, Badge, Caret, Chip, GRAD, Ico, PathCursor, RoleBanner, Spinner, pressAt, typed, type IconKind  } from './ui'

/*
 * Cổng Dữ Liệu bản Biz (vòng 4c): hiện từng bước — lưới vài mẫu → bấm mẫu FATCA mới ra các ô nhập
 * → gõ điều kiện bằng lời → bấm tải, file mở ra đúng mẫu có dòng chip rồi chip thành số thật.
 */
export const PTB = { grid: 10, pick: 84, open: 96, fields: 112, fieldGap: 16, focus: 166, type: 172, typeEnd: 210, analyze: 222, understood: 238, download: 278, file: 300, sheet: 312, fill: 360, chips: 392 }

const TEMPLATES: { name: string; sub: string; icon: IconKind }[] = [
    { name: TEMPLATE_NAME, sub: '3 ô nhập · Phòng Tuân thủ', icon: 'fileSheet' },
    { name: 'Danh sách khách hàng CRS', sub: '2 ô nhập · Phòng Tuân thủ', icon: 'users' },
    { name: 'Sao kê tài khoản theo kỳ', sub: '2 ô nhập · Phòng Tuân thủ', icon: 'table' },
    { name: 'Số dư CASA theo kênh mở', sub: '1 ô nhập · Khối Bán lẻ', icon: 'barChart' },
    { name: 'Tiền gửi đáo hạn trong tháng', sub: '1 ô nhập · Khối Bán lẻ', icon: 'calendarClock' },
    { name: 'Giao dịch lớn cần rà AML', sub: '2 ô nhập · Phòng Tuân thủ', icon: 'shield' },
]
const WIN = { x: 160, y: 170, w: 1600, h: 790 }
const card = (i: number) => ({ x: 200 + (i % 3) * 516, y: 330 + Math.floor(i / 3) * 180, w: 496, h: 160 })
const HEAD = { x: 200, y: 236, w: 1520, h: 110 }
const AI_BOX = { x: 200, y: 560, w: 1290, h: 74 }
const ANALYZE = { x: 1510, y: 560, w: 210, h: 74 }
const DL = { x: 1040, y: 840, w: 680, h: 78 }
const SHEET_AT = { x: 180, y: 250 }
const SHEET_SCALE = 1560 / TEMPLATE_SHEET_W

const Field: React.FC<{ label: string; p: number; x: number; y: number; w: number; children: React.ReactNode }> = ({ label, p, x, y, w, children }) => (
    <div style={{ position: 'absolute', left: x, top: y, width: w, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 30}px)` }}>
        <div style={{ fontSize: 23, fontWeight: 700, color: C.steel, marginBottom: 10 }}>{label}</div>
        {children}
    </div>
)
const Box: React.FC<{ children: React.ReactNode; on?: boolean; h?: number }> = ({ children, on, h = 74 }) => (
    <div style={{ height: h, borderRadius: 14, border: `2px solid ${on ? C.violet : C.rule}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', fontSize: 28, fontWeight: 700, color: INK, boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden' }}>{children}</div>
)

export const PortalBizScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = PTB
    const win = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const open = ease(f, [T.open, T.open + 16], [0, 1], Easing.inOut(Easing.cubic))
    const field = (i: number) => spring({ frame: f - T.fields - i * T.fieldGap, fps, config: { damping: 15, stiffness: 190 } })
    const analyzing = f >= T.analyze && f < T.understood
    const busy = f >= T.download && f < T.file
    const grow = ease(f, [T.sheet, T.sheet + 24], [0, 1], Easing.inOut(Easing.cubic))
    const behind = ease(f, [T.sheet, T.sheet + 20], [0, 1])
    const c0 = card(0)
    const head = {
        x: interpolate(open, [0, 1], [c0.x, HEAD.x]), y: interpolate(open, [0, 1], [c0.y, HEAD.y]),
        w: interpolate(open, [0, 1], [c0.w, HEAD.w]), h: interpolate(open, [0, 1], [c0.h, HEAD.h]),
    }
    // File mở từ nút tải ra giữa màn
    const sx = interpolate(grow, [0, 1], [DL.x + 40, SHEET_AT.x]), sy = interpolate(grow, [0, 1], [DL.y - 30, SHEET_AT.y])
    const sScale = interpolate(grow, [0, 1], [0.25, SHEET_SCALE])
    return (
        <Stage>
            <RoleBanner role="enduser" />
            <Headline text="Đồng nghiệp mở Cổng Dữ Liệu" at={0} out={T.open - 2} size={fit('Đồng nghiệp mở Cổng Dữ Liệu', 96)} top={54} accent={['Cổng Dữ Liệu']} />
            <Headline text="Chọn mẫu, điền vài ô nhập" at={T.open + 2} out={T.focus - 4} size={fit('Chọn mẫu, điền vài ô nhập', 96)} top={54} accent={['Chọn mẫu']} />
            <Headline text="Gõ thêm điều kiện bằng lời, AI hiểu ngay" at={T.focus} out={T.sheet - 4} size={fit('Gõ thêm điều kiện bằng lời, AI hiểu ngay', 92)} top={54} accent={['bằng lời']} />
            <Headline text="Bấm tải, ô giữ chỗ thành số thật" at={T.sheet} size={fit('Bấm tải, ô giữ chỗ thành số thật', 96)} top={54} accent={['thành số thật']} />

            <div style={{ position: 'absolute', inset: 0, transform: 'translateY(8px)' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - behind * 0.85, filter: behind > 0.01 ? `blur(${behind * 6}px)` : undefined }}>
                <div style={{ ...panelStyle, left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: 'hidden', opacity: win, transform: `translateY(${(1 - win) * 50}px)` }}>
                    <div style={{ height: 50, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', borderBottom: `1px solid ${C.rule}`, background: '#FAFAFE', fontSize: 21, fontWeight: 800, color: C.navy }}>
                        {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
                        <Ico k="download" size={22} color={C.navy} style={{ marginLeft: 8 }} />Cổng Dữ Liệu
                    </div>
                </div>
                {/* 1 · Lưới mẫu (mờ đi khi đã chọn) */}
                <div style={{ position: 'absolute', left: 200, top: 246, width: 1520, height: 62, borderRadius: 14, border: `1.5px solid ${C.rule}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', boxSizing: 'border-box', fontSize: 23, color: '#A3A0B8', opacity: win * (1 - open) }}>
                    <Ico k="eye" size={22} color="#A3A0B8" />Tìm mẫu báo cáo…
                </div>
                {TEMPLATES.map((t, i) => {
                    if (i === 0) return null
                    const p = spring({ frame: f - T.grid - i * 7, fps, config: { damping: 14, stiffness: 190 } })
                    const r = card(i)
                    return (
                        <div key={t.name} style={{
                            ...panelStyle, left: r.x, top: r.y, width: r.w, height: r.h, padding: '24px 26px', boxSizing: 'border-box', boxShadow: '0 10px 26px rgba(34,26,102,0.08)',
                            opacity: Math.min(1, p * 2) * (1 - open), transform: `translateY(${(1 - p) * 30 + open * 30}px) scale(${0.94 + 0.06 * p})`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Ico k={t.icon} size={30} color={C.steel} /><span style={{ fontSize: 26, fontWeight: 800, color: INK }}>{t.name}</span></div>
                            <div style={{ fontSize: 20, color: C.steel, marginTop: 14 }}>{t.sub}</div>
                        </div>
                    )
                })}
                {/* Thẻ mẫu FATCA: từ ô lưới phóng thành đầu trang chi tiết */}
                {(() => {
                    const p = spring({ frame: f - T.grid, fps, config: { damping: 14, stiffness: 190 } })
                    const hot = f >= T.pick - 12 && f < T.open
                    return (
                        <div style={{
                            ...panelStyle, left: head.x, top: head.y, width: head.w, height: head.h, padding: '0 28px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 18,
                            border: `2.5px solid ${hot || open > 0 ? C.violet : C.rule}`, background: open > 0.5 ? '#F6F3FF' : '#fff',
                            opacity: Math.min(1, p * 2), transform: `scale(${(0.94 + 0.06 * p) * (f < T.open ? pressAt(f, T.pick) : 1)})`,
                        }}>
                            <span style={{ width: 58, height: 58, borderRadius: 16, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ico k="fileSheet" size={30} color="#fff" /></span>
                            <div>
                                <div style={{ fontSize: 28 + 6 * open, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{TEMPLATE_NAME}</div>
                                <div style={{ fontSize: 20, color: C.steel, marginTop: 6 }}>{TEMPLATES[0].sub}</div>
                            </div>
                        </div>
                    )
                })()}

                {/* 2 · Ô nhập hiện lần lượt */}
                {f >= T.fields - 2 && (
                    <>
                        <Field label="Năm báo cáo" p={field(0)} x={200} y={392} w={745}><Box><Ico k="calendarClock" size={26} color={C.navy} />2025</Box></Field>
                        <Field label="Tỷ giá USD/VND" p={field(1)} x={975} y={392} w={745}><Box><Ico k="input" size={26} color={C.navy} />26.000</Box></Field>
                        <Field label="Điều kiện lọc" p={field(2)} x={AI_BOX.x} y={AI_BOX.y - 44} w={AI_BOX.w}>
                            <Box on={f >= T.focus && f < T.analyze}>
                                <Ico k="sparkles" size={24} color="#7C3AED" />
                                {f >= T.type ? <span>{typed(f, AI_FILTER_TEXT, T.type, T.typeEnd)}{f < T.analyze && <Caret />}</span> : <span style={{ color: '#A3A0B8', fontWeight: 500 }}>Gõ điều kiện bằng lời</span>}
                            </Box>
                        </Field>
                        <span style={{
                            position: 'absolute', left: ANALYZE.x, top: ANALYZE.y, width: ANALYZE.w, height: ANALYZE.h, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            fontSize: 24, fontWeight: 800, color: analyzing ? C.steel : '#fff', background: analyzing ? '#E5E3F2' : 'linear-gradient(90deg, #7C3AED, #4F46E5)',
                            opacity: Math.min(1, field(2) * 2), transform: `scale(${pressAt(f, T.analyze)})`,
                        }}>{analyzing ? <Spinner size={22} /> : <Ico k="sparkles" size={22} color="#fff" />}Phân tích</span>
                        <div style={{ position: 'absolute', left: 200, top: 650, display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, color: C.steel, opacity: Math.min(1, field(2) * 2) }}>
                            <b style={{ color: INK }}>Chỉ lọc trên cột được phép:</b>
                            {AI_FILTER_COLS.map(c => <span key={c} style={{ fontSize: 19, fontWeight: 700, padding: '3px 12px', borderRadius: 8, background: '#F1F0F8', color: '#4A4766' }}>{c}</span>)}
                        </div>
                        {f >= T.understood && (
                            <div style={{ position: 'absolute', left: 200, top: 712, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderRadius: 14, border: '1.5px solid #DCD3FB', background: '#F8F5FF', opacity: ease(f, [T.understood, T.understood + 10], [0, 1]) }}>
                                <Ico k="check" size={24} color={C.emerald} stroke={3} /><span style={{ fontSize: 23, fontWeight: 800, color: '#4C1D95' }}>AI hiểu</span>
                                <span style={{ fontSize: 23, fontWeight: 700, color: INK, fontStyle: 'italic' }}>“khách tổ chức”</span>
                                <Ico k="arrowRight" size={24} color="#7C3AED" />
                                {AI_FILTER_CLAUSES.map(c => <Chip key={c} tone="violet" style={{ fontSize: 23 }}>{c}</Chip>)}
                            </div>
                        )}
                        <span style={{
                            position: 'absolute', left: DL.x, top: DL.y, width: DL.w, height: DL.h, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            fontSize: 27, fontWeight: 800, color: busy ? C.steel : '#fff', background: busy ? '#E5E3F2' : '#1D6F42',
                            opacity: Math.min(1, field(2) * 2), transform: `scale(${pressAt(f, T.download)})`,
                        }}>{busy ? <><Spinner size={24} />Đang chuẩn bị file…</> : <><Ico k="fileSheet" size={28} color="#fff" />Tải Excel</>}</span>
                    </>
                )}
            </div>

            {/* 3 · File mở ra: đúng file mẫu có dòng chip, rồi chip thành số thật */}
            {f >= T.sheet && (
                <div style={{ position: 'absolute', left: sx, top: sy, width: TEMPLATE_SHEET_W, height: 600, opacity: grow, zIndex: 90, transform: `scale(${sScale})`, transformOrigin: 'top left' }}>
                    <Shake hits={[T.fill + 2]} amp={6}>
                        <TemplateSheet
                            fileName={FILE_NAME}
                            rows={f >= T.fill ? FILTERED_ROWS : []}
                            grow={ease(f, [T.fill, T.fill + 24], [0, 1], Easing.out(Easing.cubic))}
                            slot={f >= T.fill ? undefined : () => 1}
                            blank={f >= T.fill ? 0 : 2}
                            mark={{ key: 'ca_nhan_to_chuc', p: ease(f, [T.fill + 26, T.fill + 38], [0, 1]) }}
                        />
                    </Shake>
                </div>
            )}
            {f >= T.chips && (
                <div style={{ position: 'absolute', left: SHEET_AT.x, top: 760, display: 'flex', gap: 14, zIndex: 95, opacity: ease(f, [T.chips, T.chips + 10], [0, 1]) }}>
                    <Chip tone="green" style={{ fontSize: 25, padding: '10px 18px' }}><Ico k="check" size={22} stroke={3} />Cả 2 dòng đều Loại KH = Entity, đúng điều kiện đã gõ</Chip>
                    <Chip tone="violet" style={{ fontSize: 25, padding: '10px 18px' }}><Ico k="send" size={22} />Không cần phiếu gửi team Data/Tech</Chip>
                </div>
            )}
            <PathCursor from={40} to={T.download + 16} clicks={[T.pick, T.focus, T.analyze, T.download]} keys={[
                [40, 1000, 980], [T.pick - 6, card(0).x + 248, card(0).y + 80], [T.open + 10, card(0).x + 248, card(0).y + 80],
                [T.focus - 4, AI_BOX.x + 500, AI_BOX.y + 37], [T.analyze - 10, AI_BOX.x + 500, AI_BOX.y + 37], [T.analyze - 2, ANALYZE.x + 105, ANALYZE.y + 37],
                [T.download - 12, ANALYZE.x + 105, ANALYZE.y + 37], [T.download - 2, DL.x + 340, DL.y + 39], [T.download + 16, DL.x + 340, DL.y + 39],
            ]} />
            </div>
            <Tag text={`Minh hoạ giao diện ${BRAND} · dữ liệu mô phỏng`} />
        </Stage>
    )
}
