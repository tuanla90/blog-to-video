import { spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { Burst, ease, INK, panelStyle, Stage } from '../promo/kit'
import { BRAND, REPORT_NOTE_TPL, REPORT_ROWS, REPORT_TITLE_TPL, vn2, type Row } from './data'
import { fit, Tag } from './scenes1'
import { Caret, curAt, Headline, Ico, PathCursor, RoleBanner, typed, withPlaceholders, type CurKey, type IconKind } from './ui'

/*
 * Dựng mẫu Excel ngay trên Semantix (bản Full, user 24/10): MỘT trang tính như Excel, không chia đôi
 * khung dựng / xem trước. Kéo khối và cột từ ô "Trường dữ liệu" (giống ô PivotTable Fields của Excel)
 * vào từng khu; kéo cột đến đâu hiện cột đến đó; số để thô tới khi bấm định dạng; sửa tên cột ngay trên
 * ô tiêu đề là file tải về đúng tên đó.
 */
export const XB = {
    title: 24, titleDrop: 40, note: 62, noteDrop: 78,
    cols: 118, colGap: 26, colDrag: 16,
    select: 254, fmtOpen: 270, fmtPick: 284,
    rename: 326, renameType: 338, renameEnd: 366, save: 398,
}

const XL_GREEN = '#1D6F42'
const WIN = { x: 80, y: 176, w: 1760, h: 830 }
const BAR_H = 48, RIBBON_H = 48, FX_H = 40, LETTER_H = 30
const PANE_Y = WIN.y + BAR_H + RIBBON_H + FX_H
const GRID_Y = PANE_Y + LETTER_H
const ROW_H = 56
const ROWNUM_W = 56
const PANE = { x: 1476, w: 364 }
const GRID_R = PANE.x
const rowY = (r: number) => GRID_Y + (r - 1) * ROW_H

type XCol = { field: string; header: string; w: number; pane: number; num?: boolean; get: (r: Row) => string; raw?: (r: Row) => string }
/** Cột kéo vào mẫu, theo thứ tự kéo; `pane` = vị trí trong danh sách trường bên phải. */
const XCOLS: XCol[] = [
    { field: 'CIF', header: 'CIF', w: 170, pane: 0, get: r => r.cif },
    { field: 'Tên khách hàng', header: 'Tên khách hàng', w: 350, pane: 1, get: r => r.ten },
    { field: 'Loại KH', header: 'Loại KH', w: 170, pane: 2, get: r => r.loai_kh },
    { field: 'Số dư', header: 'Số dư', w: 240, pane: 5, num: true, get: r => (r.so_du === null ? '' : vn2(r.so_du)), raw: r => (r.so_du === null ? '' : String(r.so_du)) },
    { field: 'Đóng', header: 'Đóng', w: 110, pane: 6, get: r => r.dong },
]
const PANE_FIELDS = ['CIF', 'Tên khách hàng', 'Loại KH', 'Số tài khoản', 'Tiền tệ', 'Số dư', 'Đóng']
const SLOTS = ['Năm báo cáo', 'Tỷ giá', 'Người lập', 'Ngày xuất']
const RENAME_TO = 'Tên chủ tài khoản'
const TABLE_X = WIN.x + ROWNUM_W
const TABLE_W = XCOLS.reduce((s, c) => s + c.w, 0)
const colX = (i: number) => TABLE_X + XCOLS.slice(0, i).reduce((s, c) => s + c.w, 0)
const colMid = (i: number) => colX(i) + XCOLS[i].w / 2
const ROWS = REPORT_ROWS.slice(0, 5)
/** Hai cột trống (F, G) điền nốt bề ngang trang tính cho giống Excel. */
const FILLER_W = (GRID_R - colX(XCOLS.length)) / 2
const LETTERS = 'ABCDEFG'
const letterX = (i: number) => (i < XCOLS.length ? colX(i) : colX(XCOLS.length) + (i - XCOLS.length) * FILLER_W)
const letterW = (i: number) => (i < XCOLS.length ? XCOLS[i].w : FILLER_W)

const colStart = (i: number) => XB.cols + i * XB.colGap
const colDrop = (i: number) => colStart(i) + XB.colDrag

// Vị trí chip trong ô Trường dữ liệu
const BLOCK_Y = PANE_Y + 92
const BLOCKS: { label: string; icon: IconKind; x: number }[] = [
    { label: 'Tiêu đề', icon: 'type', x: PANE.x + 16 },
    { label: 'Đoạn chữ', icon: 'fileText', x: PANE.x + 16 + 168 },
]
const FIELD_Y0 = PANE_Y + 186
const FIELD_STEP = 44
const fieldMid = (k: number) => ({ x: PANE.x + PANE.w / 2, y: FIELD_Y0 + k * FIELD_STEP + 19 })
const SAVE = { x: PANE.x + 16, y: WIN.y + WIN.h - 74, w: PANE.w - 32, h: 54 }
// Ô chọn định dạng số trên thanh ribbon + danh sách mở ra
const SEL = { x: 1176, y: WIN.y + BAR_H + 8, w: 284, h: 32 }
const FMT_OPTS = ['Chung', 'Số thập phân · 1.234,56', 'Phần trăm · 12%']
const optMid = (k: number) => ({ x: SEL.x + SEL.w / 2, y: SEL.y + SEL.h + 4 + k * 38 + 19 })

const SRC_TITLE = { x: BLOCKS[0].x + 76, y: BLOCK_Y + 20 }
const SRC_NOTE = { x: BLOCKS[1].x + 76, y: BLOCK_Y + 20 }
const DST_TITLE = { x: TABLE_X + TABLE_W / 2, y: rowY(1) + ROW_H / 2 }
const DST_NOTE = { x: TABLE_X + TABLE_W / 2, y: rowY(2) + ROW_H / 2 }
const HEAD_Y = rowY(4) + ROW_H / 2

const KEYS: CurKey[] = [
    [14, 1150, 960],
    [XB.title, SRC_TITLE.x, SRC_TITLE.y], [XB.titleDrop, DST_TITLE.x, DST_TITLE.y],
    [XB.note, SRC_NOTE.x, SRC_NOTE.y], [XB.noteDrop, DST_NOTE.x, DST_NOTE.y],
    ...XCOLS.flatMap((c, i): CurKey[] => [[colStart(i), fieldMid(c.pane).x, fieldMid(c.pane).y], [colDrop(i), colMid(i), HEAD_Y]]),
    [XB.select, colMid(3), HEAD_Y],
    [XB.fmtOpen, SEL.x + SEL.w / 2, SEL.y + SEL.h / 2],
    [XB.fmtPick, optMid(1).x, optMid(1).y],
    [XB.rename, colMid(1), HEAD_Y],
    [XB.renameEnd + 8, colMid(1) + 40, HEAD_Y + 70],
    [XB.save, SAVE.x + SAVE.w / 2, SAVE.y + SAVE.h / 2],
    [XB.save + 24, SAVE.x + SAVE.w / 2, SAVE.y + SAVE.h / 2],
]
const CLICKS = [XB.title, XB.note, ...XCOLS.map((_, i) => colStart(i)), XB.select, XB.fmtOpen, XB.fmtPick, XB.rename, XB.rename + 5, XB.save]

const PaneChip: React.FC<{ label: string; icon: IconKind; used?: boolean; num?: boolean; style?: React.CSSProperties }> = ({ label, icon, used, num, style }) => (
    <div style={{
        height: 38, borderRadius: 8, background: '#fff', border: `1.5px solid ${used ? '#A6E3C8' : '#D2D6DC'}`, display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px', boxSizing: 'border-box', fontSize: 19, fontWeight: 700, color: INK, opacity: used ? 0.6 : 1, whiteSpace: 'nowrap', ...style,
    }}>
        <Ico k={icon} size={18} color={used ? C.emerald : '#8A94A6'} />{label}
        {num && <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: '#8A94A6' }}>123</span>}
        {used && <span style={{ marginLeft: num ? 8 : 'auto' }}><Ico k="check" size={18} color={C.emerald} stroke={3} /></span>}
    </div>
)

export const ExcelBuildScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = XB
    const win = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const dropped = (i: number) => f >= colDrop(i)
    const nDropped = XCOLS.filter((_, i) => dropped(i)).length
    const formatted = f >= T.fmtPick + 2
    const flash = formatted ? ease(f, [T.fmtPick + 2, T.fmtPick + 18], [1, 0]) : 0
    const selected = f >= T.select && f < T.rename
    const editing = f >= T.rename + 5 && f < T.renameEnd + 4
    const headerText = (i: number) => (i !== 1 || f < T.renameType ? XCOLS[i].header : typed(f, RENAME_TO, T.renameType, T.renameEnd))
    const fmtOpen = f >= T.fmtOpen && f < T.fmtPick + 4
    const saved = f >= T.save + 4
    // Đang kéo gì: chip đi theo con trỏ
    const cur = curAt(f, KEYS)
    const drag: { label: string; icon: IconKind } | null =
        f >= T.title && f < T.titleDrop ? { label: 'Tiêu đề', icon: 'type' }
            : f >= T.note && f < T.noteDrop ? { label: 'Đoạn chữ', icon: 'fileText' }
                : (() => { const i = XCOLS.findIndex((_, k) => f >= colStart(k) && f < colDrop(k)); return i >= 0 ? { label: XCOLS[i].field, icon: 'grip' as IconKind } : null })()
    // Ô tên (name box) + thanh công thức
    const nameBox = f >= T.rename ? 'B4' : selected ? 'D4' : f >= T.noteDrop ? 'A2' : 'A1'
    const fxContent = f >= T.rename
        ? <span style={{ background: f < T.renameType ? '#CFE3FF' : undefined }}>{f < T.renameType ? XCOLS[1].header : headerText(1)}{editing && f >= T.renameType && <Caret color={XL_GREEN} />}</span>
        : selected ? XCOLS[3].header
            : f >= T.noteDrop ? withPlaceholders(typed(f, REPORT_NOTE_TPL, T.noteDrop + 2, T.noteDrop + 30))
                : f >= T.titleDrop ? withPlaceholders(typed(f, REPORT_TITLE_TPL, T.titleDrop + 2, T.titleDrop + 20)) : ''

    const zone = (x: number, y: number, w: number, h: number, label: string, hot: boolean) => (
        <div style={{
            position: 'absolute', left: x + 4, top: y + 4, width: w - 8, height: h - 8, borderRadius: 10, boxSizing: 'border-box',
            border: `2.5px dashed ${hot ? XL_GREEN : '#B8C2CC'}`, background: hot ? 'rgba(29,111,66,0.08)' : 'rgba(248,250,252,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 19, fontWeight: 700, color: hot ? XL_GREEN : '#8A94A6',
        }}><Ico k="download" size={20} color={hot ? XL_GREEN : '#8A94A6'} />{label}</div>
    )
    const near = (drop: number) => f >= drop - 6 && f < drop

    return (
        <Stage>
            <RoleBanner role="power" />
            <Headline text="Dựng mẫu như đang làm trên Excel" at={0} out={T.cols - 6} size={fit('Dựng mẫu như đang làm trên Excel', 92)} top={54} accent={['trên Excel']} />
            <Headline text="Kéo cột đến đâu, hiện đến đó" at={T.cols - 2} out={T.select - 8} size={fit('Kéo cột đến đâu, hiện đến đó', 92)} top={54} accent={['hiện đến đó']} />
            <Headline text="Bấm định dạng, số mới hiện đúng kiểu" at={T.select - 4} out={T.rename - 6} size={fit('Bấm định dạng, số mới hiện đúng kiểu', 92)} top={54} accent={['đúng kiểu']} />
            <Headline text="Sửa tên cột, file tải về đúng như vậy" at={T.rename - 2} size={fit('Sửa tên cột, file tải về đúng như vậy', 92)} top={54} accent={['đúng như vậy']} />

            <div style={{ ...panelStyle, left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 18, overflow: 'hidden', opacity: win, transform: `translateY(${(1 - win) * 50}px)` }}>
                {/* Thanh tiêu đề Excel */}
                <div style={{ height: BAR_H, background: XL_GREEN, color: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', fontSize: 21, fontWeight: 700 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', color: XL_GREEN, fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</span>
                    Mau_FATCA_NHNN.xlsx<span style={{ fontWeight: 500, opacity: 0.75 }}>— dựng trên {BRAND}</span>
                    {saved && <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 19 }}><Ico k="check" size={20} color="#fff" stroke={3} />Đã lưu mẫu</span>}
                </div>
                {/* Ribbon: tab + ô định dạng số */}
                <div style={{ height: RIBBON_H, background: '#F3F2F1', display: 'flex', alignItems: 'center', gap: 28, padding: '0 22px', fontSize: 18, color: '#3B3A39', borderBottom: '1px solid #E1DFDD' }}>
                    {['Tệp', 'Trang chủ', 'Chèn', 'Bố cục', 'Dữ liệu'].map(t => <span key={t} style={{ fontWeight: t === 'Trang chủ' ? 800 : 500, color: t === 'Trang chủ' ? XL_GREEN : undefined, borderBottom: t === 'Trang chủ' ? `3px solid ${XL_GREEN}` : '3px solid transparent', paddingBottom: 4 }}>{t}</span>)}
                </div>
                {/* Thanh công thức */}
                <div style={{ height: FX_H, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', fontSize: 19, borderBottom: '1px solid #E1DFDD', background: '#fff' }}>
                    <span style={{ width: 72, padding: '3px 8px', border: '1px solid #D2D0CE', borderRadius: 4, color: '#3B3A39', fontSize: 17, fontWeight: 700 }}>{nameBox}</span>
                    <span style={{ fontStyle: 'italic', color: '#8A8886', fontWeight: 700 }}>fx</span>
                    <span style={{ color: '#3B3A39', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>{fxContent}</span>
                </div>
            </div>

            {/* Lưới trang tính */}
            <div style={{ position: 'absolute', left: WIN.x, top: PANE_Y, width: GRID_R - WIN.x, height: WIN.y + WIN.h - PANE_Y, overflow: 'hidden', opacity: win, borderBottomLeftRadius: 18 }}>
                {/* chữ cái cột */}
                <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: LETTER_H, background: '#F3F5F7', borderBottom: '1px solid #E1E5EA' }} />
                {Array.from(LETTERS, (_, i) => {
                    const x = letterX(i) - WIN.x, w = letterW(i)
                    return <div key={i} style={{ position: 'absolute', left: x, top: 0, width: w, height: LETTER_H, borderRight: '1px solid #E1E5EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: selected && i === 3 ? XL_GREEN : '#7B8794', fontWeight: selected && i === 3 ? 800 : 500, background: selected && i === 3 ? '#D3F0E0' : undefined }}>{LETTERS[i]}</div>
                })}
                {/* số dòng + đường kẻ */}
                {Array.from({ length: 12 }, (_, r) => (
                    <div key={r} style={{ position: 'absolute', left: 0, top: LETTER_H + r * ROW_H, width: '100%', height: ROW_H, borderBottom: '1px solid #E8ECF0' }}>
                        <div style={{ width: ROWNUM_W, height: ROW_H, background: '#F3F5F7', borderRight: '1px solid #E1E5EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#7B8794' }}>{r + 1}</div>
                    </div>
                ))}
                {Array.from(LETTERS, (_, i) => letterX(i) + letterW(i)).map((x, i) => <div key={i} style={{ position: 'absolute', left: x - WIN.x, top: LETTER_H, width: 1, height: 12 * ROW_H, background: '#E8ECF0' }} />)}
            </div>

            {/* Khu Tiêu đề (dòng 1) và Đoạn chữ (dòng 2): ô gộp ngang bảng */}
            {f < T.titleDrop ? zone(TABLE_X, rowY(1), TABLE_W, ROW_H, 'Kéo khối Tiêu đề vào đây', near(T.titleDrop)) : (
                <div style={{ position: 'absolute', left: TABLE_X, top: rowY(1), width: TABLE_W, height: ROW_H, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 28, fontWeight: 800, color: '#1F2A37', background: '#fff', borderBottom: '1px solid #E8ECF0' }}>
                    {withPlaceholders(typed(f, REPORT_TITLE_TPL, T.titleDrop + 2, T.titleDrop + 20))}
                </div>
            )}
            {f < T.noteDrop ? (f >= 8 && zone(TABLE_X, rowY(2), TABLE_W, ROW_H, 'Kéo khối Đoạn chữ vào đây', near(T.noteDrop))) : (
                <div style={{ position: 'absolute', left: TABLE_X + 12, top: rowY(2), width: TABLE_W - 12, height: ROW_H, display: 'flex', alignItems: 'center', gap: 6, fontSize: 20, fontStyle: 'italic', color: '#4A5563', background: '#fff' }}>
                    {withPlaceholders(typed(f, REPORT_NOTE_TPL, T.noteDrop + 2, T.noteDrop + 30))}
                </div>
            )}

            {/* Khu bảng: chưa có cột thì cả khu là chỗ thả; có rồi thì chỗ thả là cột kế tiếp */}
            {nDropped === 0 && f >= 8 && zone(TABLE_X, rowY(4), TABLE_W, ROW_H * 6, 'Kéo cột dữ liệu vào đây', near(colDrop(0)))}
            {nDropped > 0 && nDropped < XCOLS.length && zone(colX(nDropped), rowY(4), XCOLS[nDropped].w, ROW_H * 6, '', near(colDrop(nDropped)))}
            {XCOLS.map((c, i) => {
                if (!dropped(i)) return null
                const p = spring({ frame: f - colDrop(i), fps, config: { damping: 14, stiffness: 200 } })
                const sel = selected && i === 3
                const edit = i === 1 && editing
                return (
                    <div key={c.field} style={{ position: 'absolute', left: colX(i), top: rowY(4), width: c.w, opacity: Math.min(1, p * 2) }}>
                        <div style={{
                            height: ROW_H, background: '#1F4E78', color: '#fff', fontSize: 21, fontWeight: 800, display: 'flex', alignItems: 'center', padding: '0 14px', boxSizing: 'border-box',
                            justifyContent: c.num ? 'flex-end' : 'flex-start', borderRight: '1px solid #3A6A94', whiteSpace: 'nowrap', overflow: 'hidden',
                            boxShadow: edit ? `inset 0 0 0 3px ${XL_GREEN}, inset 0 0 0 5px #fff` : undefined, transform: `translateY(${(1 - p) * -14}px)`,
                        }}>{headerText(i)}{edit && f >= T.renameType && <Caret color="#fff" />}</div>
                        {ROWS.map((r, k) => {
                            const q = ease(f, [colDrop(i) + 2 + k * 2, colDrop(i) + 8 + k * 2], [0, 1])
                            const val = c.num && !formatted ? (c.raw ?? c.get)(r) : c.get(r)
                            return (
                                <div key={k} style={{
                                    height: ROW_H, display: 'flex', alignItems: 'center', padding: '0 14px', boxSizing: 'border-box', justifyContent: c.num ? 'flex-end' : c.field === 'Đóng' ? 'center' : 'flex-start',
                                    fontSize: 21, fontWeight: c.num && formatted ? 800 : 600, color: c.field === 'Đóng' && r.dong === 'Y' ? '#C0392B' : '#1F2A37', fontVariantNumeric: 'tabular-nums', opacity: q,
                                    background: sel ? '#E3F2E9' : c.num && flash > 0 ? `rgba(16,185,129,${0.28 * flash})` : k % 2 ? '#EEF3F8' : '#fff', borderBottom: '1px solid #E1E5EA', whiteSpace: 'nowrap', overflow: 'hidden',
                                }}>{val}</div>
                            )
                        })}
                        {sel && <div style={{ position: 'absolute', inset: 0, border: `3px solid ${XL_GREEN}`, pointerEvents: 'none' }} />}
                    </div>
                )
            })}

            {/* Ô Trường dữ liệu bên phải */}
            <div style={{ position: 'absolute', left: PANE.x, top: PANE_Y, width: PANE.w, height: WIN.y + WIN.h - PANE_Y, background: '#F7F8FA', borderLeft: '1px solid #E1E5EA', opacity: win, borderBottomRightRadius: 18 }}>
                <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', fontSize: 21, fontWeight: 800, color: C.navy, borderBottom: '1px solid #E1E5EA' }}>
                    <Ico k="sparkles" size={20} color="#7C3AED" />Trường dữ liệu
                </div>
                <div style={{ position: 'absolute', left: 16, top: 66, fontSize: 15, fontWeight: 800, letterSpacing: '0.06em', color: '#8A94A6' }}>KHỐI</div>
                <div style={{ position: 'absolute', left: 16, top: 152, fontSize: 15, fontWeight: 800, letterSpacing: '0.06em', color: '#8A94A6' }}>CỘT TỪ KẾT QUẢ HỎI</div>
                <div style={{ position: 'absolute', left: 16, top: FIELD_Y0 - PANE_Y + PANE_FIELDS.length * FIELD_STEP + 14, fontSize: 15, fontWeight: 800, letterSpacing: '0.06em', color: '#8A94A6' }}>Ô NHẬP CỦA MẪU</div>
                <div style={{ position: 'absolute', left: 16, right: 16, top: FIELD_Y0 - PANE_Y + PANE_FIELDS.length * FIELD_STEP + 40, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SLOTS.map(s => <span key={s} style={{ fontSize: 17, fontWeight: 800, color: '#5B3FD6', background: '#EFEAFE', border: '1.5px solid #A78BFA', borderRadius: 8, padding: '3px 10px' }}>{s}</span>)}
                </div>
            </div>
            {BLOCKS.map((b, i) => <PaneChip key={b.label} label={b.label} icon={b.icon} used={f >= (i === 0 ? T.titleDrop : T.noteDrop)} style={{ position: 'absolute', left: b.x, top: BLOCK_Y, width: 160, opacity: win * (f >= (i === 0 ? T.titleDrop : T.noteDrop) ? 0.6 : 1) }} />)}
            {PANE_FIELDS.map((name, k) => {
                const ci = XCOLS.findIndex(c => c.pane === k)
                const used = ci >= 0 && dropped(ci)
                return <PaneChip key={name} label={name} icon="grip" num={name === 'Số dư'} used={used} style={{ position: 'absolute', left: PANE.x + 16, top: FIELD_Y0 + k * FIELD_STEP, width: PANE.w - 32, opacity: win * (used ? 0.6 : 1) }} />
            })}
            <div style={{
                position: 'absolute', left: SAVE.x, top: SAVE.y, width: SAVE.w, height: SAVE.h, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 22, fontWeight: 800, color: '#fff', background: saved ? C.emerald : XL_GREEN, opacity: win, transform: `scale(${f >= T.save && f < T.save + 7 ? 0.94 : 1})`,
            }}><Ico k={saved ? 'check' : 'bookmark'} size={22} color="#fff" stroke={saved ? 3 : 2} />{saved ? 'Đã lưu mẫu' : 'Lưu mẫu'}</div>

            {/* Ô chọn định dạng số */}
            <div style={{ position: 'absolute', left: SEL.x - 136, top: SEL.y, height: SEL.h, display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 700, color: '#605E5C', opacity: win }}>Định dạng số</div>
            <div style={{
                position: 'absolute', left: SEL.x, top: SEL.y, width: SEL.w, height: SEL.h, borderRadius: 6, border: `1.5px solid ${fmtOpen ? XL_GREEN : '#C8C6C4'}`, background: '#fff',
                display: 'flex', alignItems: 'center', padding: '0 10px', boxSizing: 'border-box', fontSize: 18, fontWeight: 700, color: '#3B3A39', opacity: win, zIndex: 70,
            }}>{formatted ? FMT_OPTS[1] : FMT_OPTS[0]}<span style={{ marginLeft: 'auto' }}><Ico k="chevronDown" size={18} color="#605E5C" /></span></div>
            {fmtOpen && (
                <div style={{ position: 'absolute', left: SEL.x, top: SEL.y + SEL.h + 4, width: SEL.w, borderRadius: 8, background: '#fff', border: '1px solid #C8C6C4', boxShadow: '0 14px 34px rgba(0,0,0,0.16)', zIndex: 70, overflow: 'hidden' }}>
                    {FMT_OPTS.map((o, k) => <div key={o} style={{ height: 38, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 18, fontWeight: k === 1 ? 800 : 500, color: '#3B3A39', background: k === 1 && f >= T.fmtPick - 8 ? '#D3F0E0' : undefined }}>{o}</div>)}
                </div>
            )}

            {drag && (
                <div style={{ position: 'absolute', left: cur.x + 10, top: cur.y + 8, zIndex: 480, transform: 'rotate(-3deg)' }}>
                    <PaneChip label={drag.label} icon={drag.icon} style={{ boxShadow: '0 16px 36px rgba(34,26,102,0.28)', border: `2px solid ${XL_GREEN}` }} />
                </div>
            )}
            <Burst at={T.save + 4} x={SAVE.x + SAVE.w / 2} y={SAVE.y + SAVE.h / 2} r={120} color="#10B981" />
            <PathCursor from={14} to={T.save + 24} clicks={CLICKS} keys={KEYS} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · dữ liệu mô phỏng`} />
        </Stage>
    )
}
