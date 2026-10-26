import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { Burst, ease, INK, panelStyle, Shake, Stage } from '../promo/kit'
import { BRAND, COLS, N_CUSTOMERS, REPORT_ROWS, TEMPLATE_NAME, TOTAL_REPORT_ROWS, vn2, type Row } from './data'
import { MONO } from '../promo/scenesA'
import { fit, Tag } from './scenes1'
import { Headline, AppWindow, Badge, BRANCHES, Caret, Chip, GRAD, GRAD_H, Ico, ModelWindowBar, PathCursor, Spinner, RoleBanner, pressAt, typed, useTemplateMode, type IconKind  } from './ui'

/*
 * Các cảnh của vòng 4 (STORYBOARD-TEMPLATE.md): tiêu chí chuẩn gọn cho bản Biz, ba ngả sau
 * khi có bảng, mẫu Excel có ô giữ chỗ dạng chip, tổng kết bản Biz.
 * Luật: nội dung đến đâu hiện đến đó; không hiện code (SQL, JSON, cú pháp ô giữ chỗ).
 */

const pop = (f: number, at: number, fps: number, cfg = { damping: 14, stiffness: 190 }) => spring({ frame: f - at, fps, config: cfg })

// ─── Tiêu chí chuẩn của phòng (bản Biz): dựng giống Column Builder thật ──────────
// Catalog nguồn | Builder (nút AI Trợ lý → AI Modeling Assistant) | Preview; nhãn theo messages/vi/admin-models.json.
export const SEM_BIZ = { aiBtn: 60, dialog: 66, type: 76, typeEnd: 128, gen: 141, proposal: 154, addCanvas: 204, item: 220, run: 250, rows: 262, rowGap: 9, gov: 330, submit: 340, toast: 356, approved: 370, toCatalog: 384, banner: 405 }
/** Đỉnh 176 chừa chỗ cho đuôi chữ tiêu đề; đáy ~1012 để không đè dòng chú thích minh hoạ góc phải dưới. */
const SB_WIN = { x: 90, y: 176, w: 1740, h: 836 }
const PANEL_Y = SB_WIN.y + 52 + 16
const PANEL_H = SB_WIN.h - 52 - 32
const CAT = { x: 106, w: 400 }
const BLD = { x: 522, w: 560 }
const PRV = { x: 1098, w: 716 }
const DLG = { x: 460, y: 234, w: 1000, h: 640 }
const AI_BTN = { x: BLD.x + BLD.w - 176, y: PANEL_Y + 12, w: 160, h: 42 }
const GEN_BTN = { x: DLG.x + DLG.w - 300, y: DLG.y + 280, w: 260, h: 58 }
const ADD_BTN = { x: DLG.x + DLG.w - 272, y: DLG.y + 556, w: 240, h: 54 }
const RUN_BTN = { x: PRV.x + PRV.w - 150, y: PANEL_Y + 12, w: 134, h: 42 }
const SUBMIT_BTN = { x: BLD.x + 16, y: PANEL_Y + PANEL_H - 72, w: BLD.w - 32, h: 56 }
const SB_DESC = 'Khách thuộc diện FATCA khi quốc gia cư trú là Mỹ và hồ sơ còn hiệu lực'
const SB_FIELDS: [string, string][] = [['CIF', 'Chữ'], ['Tên khách hàng', 'Chữ'], ['Quốc gia cư trú', 'Chữ'], ['Hiệu lực hồ sơ', 'Chữ'], ['Trạng thái bản ghi', 'Chữ']]
const SB_ITEMS = ['CIF', 'Quốc gia cư trú', 'Hiệu lực hồ sơ']
/** CIF, quốc gia cư trú, hồ sơ còn hiệu lực, kết quả cột mới. Dòng cuối: ở Mỹ nhưng hồ sơ hết hiệu lực nên Không. */
const SB_ROWS: [string, string, boolean, boolean][] = [
    ['10200417', 'US', true, true],
    ['10201158', 'US', true, true],
    ['10203391', 'VN', true, false],
    ['10202275', 'US', true, true],
    ['10204410', 'US', false, false],
]
const SB_COLS = [{ h: 'CIF', w: 140 }, { h: 'Quốc gia cư trú', w: 180 }, { h: 'Hiệu lực hồ sơ', w: 170 }, { h: 'Thuộc diện FATCA', w: 194 }]

const PanelHead: React.FC<{ icon: IconKind; title: string; children?: React.ReactNode }> = ({ icon, title, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 66, padding: '0 16px', fontSize: 17, fontWeight: 800, letterSpacing: '0.06em', color: C.steel, borderBottom: `1px solid ${C.rule}` }}>
        <Ico k={icon} size={18} color={C.steel} />{title}{children}
    </div>
)
const Btn: React.FC<{ r: { x: number; y: number; w: number; h: number }; label: string; icon: IconKind; on?: boolean; press?: number; tone?: 'violet' | 'green' | 'ghost'; opacity?: number }> = ({ r, label, icon, on = true, press = 1, tone = 'violet', opacity = 1 }) => {
    const bg = tone === 'ghost' ? '#fff' : tone === 'green' ? C.emerald : on ? 'linear-gradient(90deg, #7C3AED, #4F46E5)' : '#E5E3F2'
    return (
        <span style={{
            position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 20, fontWeight: 800, color: tone === 'ghost' ? C.navy : '#fff', background: bg, border: tone === 'ghost' ? `1.5px solid ${C.rule}` : 'none',
            transform: `scale(${press})`, opacity,
        }}><Ico k={icon} size={20} color={tone === 'ghost' ? C.navy : '#fff'} />{label}</span>
    )
}

export const SemanticBizScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = SEM_BIZ
    const mode = useTemplateMode()
    const win = pop(f, 2, fps, { damping: 200, stiffness: 100 })
    const dlgIn = ease(f, [T.dialog, T.dialog + 12], [0, 1], Easing.out(Easing.cubic)) * (1 - ease(f, [T.addCanvas + 4, T.addCanvas + 16], [0, 1]))
    const proposal = pop(f, T.proposal, fps, { damping: 14, stiffness: 190 })
    const itemIn = pop(f, T.item, fps, { damping: 13, stiffness: 200 })
    const ran = f >= T.rows
    const status = f >= T.approved ? 'approved' : f >= T.submit + 4 ? 'pending' : 'draft'
    const toast = pop(f, T.toast, fps, { damping: 14, stiffness: 190 }) * (1 - ease(f, [T.banner - 8, T.banner], [0, 1]))
    const fly = ease(f, [T.toCatalog, T.toCatalog + 20], [0, 1], Easing.inOut(Easing.cubic))
    const banner = pop(f, T.banner, fps, { damping: 14, stiffness: 180 })
    const itemY = PANEL_Y + 112 + SB_ITEMS.length * 64
    const catSlotY = PANEL_Y + 66 + 60 + SB_FIELDS.length * 44 + 76
    const pill = (s: string) => ({ draft: ['Nháp', '#A15C00', '#FEF3D7'], pending: ['Chờ duyệt', '#1D5BD8', '#E8F0FE'], approved: ['Đã duyệt', C.emerald, '#E6F6EE'] }[s] as [string, string, string])
    const [pLabel, pFg, pBg] = pill(status)
    return (
        <Stage>
            <RoleBanner role="collab-def" />
            <Headline text="Phòng tự đặt tiêu chí bằng lời" at={0} out={T.gen - 6} size={fit('Phòng tự đặt tiêu chí bằng lời', 96)} top={54} accent={['bằng lời']} />
            <Headline text="AI dựng thành tiêu chí dùng chung" at={T.gen - 2} out={T.run - 14} size={fit('AI dựng thành tiêu chí dùng chung', 96)} top={54} accent={['tiêu chí dùng chung']} />
            <Headline text="Thử ngay trên vài khách hàng" at={T.run - 10} out={T.gov - 6} size={fit('Thử ngay trên vài khách hàng', 96)} top={54} accent={['Thử ngay']} />
            <Headline text="Có người duyệt, cả phòng dùng chung" at={T.gov - 2} size={fit('Có người duyệt, cả phòng dùng chung', 96)} top={54} accent={['cả phòng dùng chung']} />

            {/* Cửa sổ mô hình, tab Thiết kế Cột */}
            <div style={{ ...panelStyle, left: SB_WIN.x, top: SB_WIN.y, width: SB_WIN.w, height: SB_WIN.h, overflow: 'hidden', opacity: win, transform: `translateY(${(1 - win) * 50}px)` }}>
                <ModelWindowBar active={2} from={mode === 'full' ? 1 : 2} at={10} />
            </div>
            {[CAT, BLD, PRV].map((p, i) => (
                <div key={i} style={{ position: 'absolute', left: p.x, top: PANEL_Y, width: p.w, height: PANEL_H, borderRadius: 16, border: `1.5px solid ${C.rule}`, background: i === 1 ? '#FBFAFF' : '#fff', overflow: 'hidden', opacity: win }}>
                    {i === 0 && <PanelHead icon="database" title="CATALOG NGUỒN" />}
                    {i === 1 && <PanelHead icon="grip" title="BUILDER" />}
                    {i === 2 && <PanelHead icon="eye" title="PREVIEW" />}
                </div>
            ))}

            {/* Catalog: bảng nguồn + mục Cột ảo (nhận cột đã duyệt) */}
            <div style={{ position: 'absolute', left: CAT.x + 14, top: PANEL_Y + 78, width: CAT.w - 28, opacity: win }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 19, fontWeight: 800, color: INK }}><Ico k="table" size={20} color={C.navy} />fatca_info <span style={{ fontWeight: 600, color: C.steel, fontSize: 16 }}>Hồ sơ FATCA</span></div>
                {SB_FIELDS.map(([n, k]) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', height: 44, padding: '0 10px', marginTop: 4, borderRadius: 10, fontSize: 19, fontWeight: 600, color: INK }}>
                        <span style={{ flex: 1 }}>{n}</span><span style={{ fontSize: 15, color: C.steel }}>{k}</span>
                    </div>
                ))}
                <div style={{ marginTop: 22, fontSize: 15, fontWeight: 800, letterSpacing: '0.06em', color: C.steel }}>CỘT ẢO</div>
                {fly < 1 && <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 10, border: `1.5px dashed ${C.rule}`, fontSize: 17, color: '#A3A0B8' }}>Chưa có cột ảo</div>}
                {fly >= 1 && (
                    <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, border: '2px solid #6FD3A6', background: '#F3FBF7', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                        <Ico k="sparkles" size={18} color="#5B3FD6" /><span style={{ fontSize: 18, fontWeight: 800, color: INK }}>Thuộc diện FATCA</span>
                        <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 999, background: '#E6F6EE', color: C.emerald, fontSize: 14, fontWeight: 800 }}>Dùng chung</span>
                    </div>
                )}
            </div>

            {/* Builder: các cột đang chọn + cột ảo mới */}
            <Btn r={AI_BTN} label="AI Trợ lý" icon="sparkles" press={pressAt(f, T.aiBtn)} opacity={win} />
            <div style={{ position: 'absolute', left: BLD.x + 16, top: PANEL_Y + 82, fontSize: 15, fontWeight: 800, letterSpacing: '0.06em', color: C.steel, opacity: win }}>CỘT & CHỈ SỐ</div>
            {SB_ITEMS.map((n, i) => (
                <div key={n} style={{ position: 'absolute', left: BLD.x + 16, top: PANEL_Y + 112 + i * 64, width: BLD.w - 32, height: 54, borderRadius: 12, border: `1.5px solid ${C.rule}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', boxSizing: 'border-box', fontSize: 20, fontWeight: 700, color: INK, opacity: win }}>
                    <Ico k="grip" size={18} color="#A3A0B8" />{n}<span style={{ marginLeft: 'auto', fontSize: 15, color: C.steel }}>Cột</span>
                </div>
            ))}
            {f >= T.item && fly < 1 && (
                <div style={{
                    position: 'absolute', left: interpolate(fly, [0, 1], [BLD.x + 16, CAT.x + 14]), top: interpolate(fly, [0, 1], [itemY, catSlotY]), width: interpolate(fly, [0, 1], [BLD.w - 32, CAT.w - 28]), height: 54,
                    borderRadius: 12, border: `2.5px solid ${status === 'approved' ? '#6FD3A6' : '#C4B5FD'}`, background: status === 'approved' ? '#F3FBF7' : '#F6F3FF', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', boxSizing: 'border-box',
                    fontSize: interpolate(fly, [0, 1], [20, 18]), fontWeight: 800, color: INK, whiteSpace: 'nowrap', zIndex: 60, opacity: Math.min(1, itemIn * 2), transform: `scale(${(0.85 + 0.15 * itemIn) * (1 + Math.sin(fly * Math.PI) * 0.05)})`,
                    boxShadow: fly > 0 ? '0 18px 40px rgba(16,122,95,0.25)' : 'none',
                }}>
                    <Ico k="sparkles" size={20} color="#5B3FD6" />Thuộc diện FATCA
                    <span style={{ marginLeft: 'auto', padding: '3px 12px', borderRadius: 999, background: pBg, color: pFg, fontSize: 16, fontWeight: 800 }}>{pLabel}</span>
                </div>
            )}
            {f >= T.item && (
                <Btn r={SUBMIT_BTN} label={status === 'draft' ? 'Lưu & gửi duyệt' : status === 'pending' ? 'Đã gửi duyệt' : 'Đã duyệt'} icon={status === 'approved' ? 'badgeCheck' : 'send'}
                    tone={status === 'approved' ? 'green' : 'violet'} on={status === 'draft'} press={pressAt(f, T.submit)} opacity={Math.min(1, itemIn * 2) * (1 - ease(f, [T.banner - 8, T.banner + 2], [0, 1]))} />
            )}

            {/* Preview: bấm Chạy, cột mới hiện kết quả từng khách */}
            <Btn r={RUN_BTN} label="Chạy" icon="play" press={pressAt(f, T.run)} opacity={win} />
            <div style={{ position: 'absolute', left: PRV.x + 16, top: PANEL_Y + 82, width: PRV.w - 32, opacity: win }}>
                <div style={{ display: 'flex', height: 46, alignItems: 'center', borderRadius: 10, background: '#F4F3FB', fontSize: 17, fontWeight: 800, color: C.navy }}>
                    {SB_COLS.map((c, i) => <span key={c.h} style={{ width: c.w, padding: '0 12px', boxSizing: 'border-box', whiteSpace: 'nowrap', opacity: i === 3 ? ease(f, [T.item, T.item + 10], [0, 1]) : 1, color: i === 3 ? '#5B3FD6' : undefined }}>{c.h}</span>)}
                </div>
                {!ran && (
                    <div style={{ marginTop: 40, textAlign: 'center', fontSize: 19, color: '#A3A0B8' }}>{f >= T.run ? <><Spinner size={20} /> Đang chạy truy vấn…</> : 'Bấm Chạy để xem dữ liệu'}</div>
                )}
                {ran && SB_ROWS.map(([cif, qg, valid, yes], i) => {
                    const p = ease(f, [T.rows + i * T.rowGap, T.rows + i * T.rowGap + 8], [0, 1])
                    const v = pop(f, T.rows + i * T.rowGap + 6, fps, { damping: 11, stiffness: 230 })
                    return (
                        <div key={cif} style={{ display: 'flex', alignItems: 'center', height: 58, borderBottom: '1px solid #EFEEF7', fontSize: 19, color: INK, opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
                            <span style={{ width: SB_COLS[0].w, padding: '0 12px', boxSizing: 'border-box', fontFamily: MONO, fontSize: 17 }}>{cif}</span>
                            <span style={{ width: SB_COLS[1].w, padding: '0 12px', boxSizing: 'border-box', fontWeight: 700 }}>{qg}</span>
                            <span style={{ width: SB_COLS[2].w, padding: '0 12px', boxSizing: 'border-box' }}>
                                {valid ? <span style={{ fontWeight: 600, color: INK }}>Còn</span> : <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 999, fontWeight: 800, fontSize: 18, background: '#FEF3D7', color: '#A15C00' }}>Hết</span>}
                            </span>
                            <span style={{ width: SB_COLS[3].w, padding: '0 12px', boxSizing: 'border-box' }}>
                                <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 999, fontWeight: 800, fontSize: 18, background: yes ? '#E6F6EE' : '#F1F0F8', color: yes ? C.emerald : C.steel, transform: `scale(${v})` }}>{yes ? 'Có' : 'Không'}</span>
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* AI Modeling Assistant */}
            {dlgIn > 0.001 && (
                <>
                    <div style={{ position: 'absolute', left: SB_WIN.x, top: SB_WIN.y, width: SB_WIN.w, height: SB_WIN.h, borderRadius: 24, background: `rgba(27,24,56,${0.28 * dlgIn})`, zIndex: 70 }} />
                    <div style={{ ...panelStyle, left: DLG.x, top: DLG.y, width: DLG.w, height: DLG.h, padding: '26px 32px', boxSizing: 'border-box', zIndex: 80, opacity: dlgIn, transform: `translateY(${(1 - dlgIn) * 40}px) scale(${0.95 + 0.05 * dlgIn})` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ width: 46, height: 46, borderRadius: 14, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k="sparkles" size={24} color="#fff" /></span>
                            <div>
                                <div style={{ fontSize: 26, fontWeight: 800, color: INK }}>AI Modeling Assistant</div>
                                <div style={{ fontSize: 17, color: C.steel }}>Tạo mới Metric, Cột ảo, Phân đoạn bằng câu lệnh tự nhiên</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 26, fontSize: 19, fontWeight: 800, color: C.steel }}>Mô tả yêu cầu</div>
                        <div style={{ marginTop: 10, height: 110, borderRadius: 14, border: `2px solid ${f < T.gen ? C.violet : C.rule}`, padding: '16px 20px', boxSizing: 'border-box', fontSize: 27, fontWeight: 600, color: INK, lineHeight: 1.35 }}>
                            {typed(f, SB_DESC, T.type, T.typeEnd)}{f < T.typeEnd + 8 && <Caret />}
                        </div>
                    </div>
                    <div style={{ zIndex: 81, position: 'absolute', inset: 0, opacity: dlgIn, pointerEvents: 'none' }}>
                        <Btn r={GEN_BTN} label={f >= T.gen && f < T.proposal ? 'Đang sinh cấu hình…' : 'AI Tạo cấu hình'} icon="sparkles" on={!(f >= T.gen && f < T.proposal)} press={pressAt(f, T.gen)} />
                        {f >= T.proposal && (
                            <div style={{ position: 'absolute', left: DLG.x + 32, top: DLG.y + 356, width: DLG.w - 64, height: 180, borderRadius: 16, border: '2px solid #C4B5FD', background: '#F8F5FF', padding: '18px 22px', boxSizing: 'border-box', opacity: Math.min(1, proposal * 2), transform: `translateY(${(1 - proposal) * 24}px)` }}>
                                <div style={{ fontSize: 17, fontWeight: 800, color: '#5B3FD6' }}>ĐỀ XUẤT TỪ AI · CỘT ẢO</div>
                                <div style={{ fontSize: 30, fontWeight: 800, color: INK, marginTop: 6 }}>Thuộc diện FATCA</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 19, color: C.steel }}>
                                    <b style={{ color: C.emerald }}>Có</b> khi
                                    <Chip tone="violet" style={{ fontSize: 19 }}>Quốc gia cư trú = US</Chip>và<Chip tone="violet" style={{ fontSize: 19 }}>Hiệu lực hồ sơ = Còn</Chip>
                                    · còn lại <b>Không</b>
                                </div>
                            </div>
                        )}
                        {f >= T.proposal && <Btn r={ADD_BTN} label="Thêm vào Canvas" icon="check" press={pressAt(f, T.addCanvas)} opacity={Math.min(1, proposal * 2)} />}
                    </div>
                </>
            )}

            {/* Duyệt: thông báo người duyệt, rồi cả phòng dùng chung */}
            {toast > 0.01 && (
                <div style={{ ...panelStyle, left: 1190, top: 858, width: 600, height: 104, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', boxSizing: 'border-box', zIndex: 90, opacity: Math.min(1, toast * 2), transform: `translateY(${(1 - toast) * 40}px)` }}>
                    <span style={{ width: 56, height: 56, borderRadius: 28, background: '#E8F0FE', color: '#1D5BD8', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>BA</span>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: INK }}>{f >= T.approved ? 'BA Data đã duyệt' : 'BA Data đang xem…'}</div>
                        <div style={{ fontSize: 17, color: C.steel }}>Thuộc diện FATCA · áp dụng cho Phòng Tuân thủ</div>
                    </div>
                    <span style={{ marginLeft: 'auto' }}>{f >= T.approved ? <Ico k="badgeCheck" size={34} color={C.emerald} /> : <Spinner size={26} />}</span>
                </div>
            )}
            <Burst at={T.approved} x={1700} y={910} r={130} color="#10B981" />
            {f >= T.banner && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: 888, display: 'flex', justifyContent: 'center', zIndex: 90 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 34px', borderRadius: 999, background: GRAD_H, color: '#fff', fontSize: 28, fontWeight: 800, boxShadow: '0 18px 40px rgba(109,93,246,0.35)', transform: `scale(${banner})` }}>
                        <Ico k="users" size={30} color="#fff" />Từ giờ mọi câu hỏi của phòng dùng chung tiêu chí này
                    </div>
                </div>
            )}
            <PathCursor from={30} to={T.submit + 14} clicks={[T.aiBtn, T.gen, T.addCanvas, T.run, T.submit]} keys={[
                [30, 900, 920], [T.aiBtn - 6, AI_BTN.x + 80, AI_BTN.y + 21], [T.dialog + 8, AI_BTN.x + 80, AI_BTN.y + 21],
                [T.gen - 8, GEN_BTN.x + 130, GEN_BTN.y + 29], [T.addCanvas - 30, GEN_BTN.x + 130, GEN_BTN.y + 29], [T.addCanvas - 6, ADD_BTN.x + 120, ADD_BTN.y + 27],
                [T.run - 8, RUN_BTN.x + 67, RUN_BTN.y + 21], [T.submit - 30, RUN_BTN.x + 67, RUN_BTN.y + 21], [T.submit - 6, SUBMIT_BTN.x + SUBMIT_BTN.w / 2, SUBMIT_BTN.y + 28], [T.submit + 14, SUBMIT_BTN.x + SUBMIT_BTN.w / 2, SUBMIT_BTN.y + 28],
            ]} />
            <Tag />
        </Stage>
    )
}

// ─── Ba ngả sau khi có bảng ─────────────────────────────────────────────────────
export const HUB_T = { card: 4, line0: 20, gap: 15 }
const HUB_SUB = ['Biểu đồ và nhận xét ngay', 'Đến hẹn tự gửi file', 'Có ô nhập, cả phòng dùng']
const HUB_Y = [214, 456, 698]
const HUB_X = 1050

export const HubScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = HUB_T
    const card = pop(f, T.card, fps, { damping: 18, stiffness: 140 })
    return (
        <Stage dark>
            <RoleBanner role="enduser" />
            <Headline text="Có bảng rồi, đi tiếp một trong ba ngả" at={0} size={fit('Có bảng rồi, đi tiếp một trong ba ngả', 92)} top={54} color="#fff" accent={['ba ngả']} />

            {/* Bảng kết quả thu nhỏ */}
            <div style={{ ...panelStyle, left: 110, top: 300, width: 700, height: 520, padding: '26px 28px', boxSizing: 'border-box', opacity: card, transform: `translateX(${(1 - card) * -80}px) scale(${0.9 + 0.1 * card})` }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: INK }}>{TEMPLATE_NAME}</div>
                <Chip tone="green" style={{ fontSize: 21, marginTop: 12 }}><Ico k="check" size={20} stroke={3} />Đủ 12 cột mẫu NHNN</Chip>
                <div style={{ marginTop: 22 }}>
                    {REPORT_ROWS.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, height: 56, borderBottom: '1px solid #EFEEF7', fontSize: 21, fontWeight: 700, color: INK }}>
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ten}</span>
                            <span style={{ width: 70, color: C.steel }}>{r.tien_te}</span>
                            <span style={{ width: 170, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.so_du === null ? '' : vn2(r.so_du)}</span>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 14, fontSize: 19, fontWeight: 600, color: C.steel }}>{N_CUSTOMERS} khách hàng · {TOTAL_REPORT_ROWS} dòng</div>
            </div>

            {/* Ba nhánh */}
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {HUB_Y.map((y, i) => {
                    const p = ease(f, [T.line0 + i * T.gap, T.line0 + i * T.gap + 14], [0, 1], Easing.inOut(Easing.cubic))
                    const d = `M 810 560 C 930 560, 930 ${y + 84}, ${HUB_X} ${y + 84}`
                    return <path key={i} d={d} fill="none" stroke="url(#hubg)" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
                })}
                <defs><linearGradient id="hubg" x1="0" x2="1"><stop offset="0" stopColor="#8B7CF8" /><stop offset="1" stopColor="#E86FC6" /></linearGradient></defs>
            </svg>
            {BRANCHES.map((b, i) => {
                const p = pop(f, T.line0 + i * T.gap + 10, fps, { damping: 13, stiffness: 190 })
                return (
                    <div key={b.label} style={{
                        ...panelStyle, left: HUB_X, top: HUB_Y[i], width: 760, height: 168, padding: '0 30px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 22,
                        opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 60}px) scale(${0.9 + 0.1 * p})`,
                    }}>
                        <span style={{ width: 82, height: 82, borderRadius: 24, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ico k={b.icon} size={42} color="#fff" /></span>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 19, fontWeight: 800, color: C.violet, letterSpacing: '0.04em' }}>NGẢ {i + 1}</div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{b.label}</div>
                            <div style={{ fontSize: 23, fontWeight: 600, color: C.steel, whiteSpace: 'nowrap' }}>{HUB_SUB[i]}</div>
                        </div>
                        {i === 1 && <span style={{ marginLeft: 'auto' }}><Badge kind="soon" size={17} /></span>}
                    </div>
                )
            })}
            <Tag text={`Minh hoạ giao diện ${BRAND} · kết quả mô phỏng`} />
        </Stage>
    )
}

// ─── Mẫu Excel có ô giữ chỗ (chip) → gắn vào mẫu Semantix ──────────────────────
export const JINJA_T = { win: 2, slots: 112, slotGap: 10, attach: 192, fly: 204, click: 225 }
const JINJA_COLS = COLS.filter(c => ['cif', 'ten_chu_tai_khoan', 'ca_nhan_to_chuc', 'so_tai_khoan', 'don_vi_tien_te', 'so_du', 'dong_trong_nam'].includes(c.key))
const JINJA_W: Record<string, number> = { cif: 160, ten_chu_tai_khoan: 330, ca_nhan_to_chuc: 170, so_tai_khoan: 220, don_vi_tien_te: 130, so_du: 210, dong_trong_nam: 110 }
const XL_GREEN = '#1D6F42'
const SHEET = { x: 180, y: 196, w: 1560 }
/** Bề rộng gốc của TemplateSheet — nơi khác co giãn bằng transform scale. */
export const TEMPLATE_SHEET_W = SHEET.w
const LETTERS = 'ABCDEFGHI'

/** Ô giữ chỗ vẽ thành chip mang tên cột — người xem không phải đọc cú pháp. */
const SlotChip: React.FC<{ label: string; p: number }> = ({ label, p }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, maxWidth: '100%', boxSizing: 'border-box',
        background: '#EFEAFE', border: '2px solid #8B5CF6', color: '#5B3FD6', fontSize: 20, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden',
        opacity: Math.min(1, p * 2), transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * -30}px)`,
    }}><Ico k="table" size={17} color="#5B3FD6" />{label}</span>
)

/**
 * File Excel mẫu của phòng, rộng SHEET.w, có vỏ Excel (thanh tiêu đề, dải tab, thanh công thức,
 * chữ cột): tiêu đề, hàng tên cột, rồi một trong hai — dòng ô giữ chỗ (`slot` trả độ hiện của chip
 * cột thứ i) hoặc các dòng số thật (`rows`, mọc dần theo `grow`). `active` = cột của ô đang chọn
 * ở dòng 3 (viền xanh như Excel). Cảnh mẫu Excel và file tải ở Cổng Dữ Liệu dùng chung.
 */
/** mark: tô một cột dữ liệu (vd Loại KH sau khi lọc) để người xem soát được kết quả lọc, p = 0..1. */
export const TemplateSheet: React.FC<{ fileName: string; rows?: Row[]; grow?: number; slot?: (i: number) => number | null; badge?: React.ReactNode; blank?: number; active?: number; mark?: { key: string; p: number } }> = ({ fileName, rows = [], grow = 1, slot, badge, blank = 0, active = -1, mark }) => {
    const totalW = JINJA_COLS.reduce((s, c) => s + JINJA_W[c.key], 0)
    const k = (SHEET.w - 56 - 70) / totalW
    const cell = (w: number, extra?: React.CSSProperties): React.CSSProperties => ({
        width: w, height: 64, flexShrink: 0, boxSizing: 'border-box', borderRight: '1px solid #E1E5EA', borderBottom: '1px solid #E1E5EA',
        display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 22, whiteSpace: 'nowrap', overflow: 'hidden', ...extra,
    })
    const rowNo = (n: number | string, h = 64) => <div style={cell(56, { height: h, justifyContent: 'center', background: '#F3F5F7', color: '#7B8794', fontSize: 18, padding: 0 })}>{n}</div>
    const act = active >= 0 ? JINJA_COLS[active] : undefined
    return (
        <div style={{ width: SHEET.w, background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 90px rgba(16,60,35,0.24)', border: '1.5px solid #CFD8D3' }}>
            <div style={{ height: 48, background: XL_GREEN, color: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', fontSize: 21, fontWeight: 700 }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', color: XL_GREEN, fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</span>
                {fileName}<span style={{ fontWeight: 500, opacity: 0.75 }}>— Excel</span>
                {badge && <span style={{ marginLeft: 'auto' }}>{badge}</span>}
            </div>
            <div style={{ height: 40, background: '#F3F2F1', display: 'flex', alignItems: 'flex-end', gap: 28, padding: '0 22px', fontSize: 18, color: '#3B3A39', borderBottom: '1px solid #E1DFDD' }}>
                {['Tệp', 'Trang chủ', 'Chèn', 'Bố cục', 'Công thức', 'Dữ liệu'].map(t => <span key={t} style={{ paddingBottom: 8, borderBottom: t === 'Trang chủ' ? `3px solid ${XL_GREEN}` : '3px solid transparent', fontWeight: t === 'Trang chủ' ? 700 : 500, color: t === 'Trang chủ' ? XL_GREEN : undefined }}>{t}</span>)}
            </div>
            <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', fontSize: 19, borderBottom: '1px solid #E1DFDD' }}>
                <span style={{ width: 72, padding: '4px 8px', border: '1px solid #D2D0CE', borderRadius: 4, color: '#3B3A39', fontFamily: MONO, fontSize: 17 }}>{act ? `${LETTERS[active]}3` : 'A1'}</span>
                <span style={{ fontStyle: 'italic', color: '#8A8886', fontWeight: 700 }}>fx</span>
                <span style={{ color: '#3B3A39', fontWeight: 600 }}>{act ? <>Ô giữ chỗ: <b style={{ color: '#5B3FD6' }}>{act.header}</b></> : 'BÁO CÁO FATCA GỬI NHNN'}</span>
            </div>
            <div style={{ display: 'flex', height: 30 }}>
                {rowNo('', 30)}
                {JINJA_COLS.map((c, i) => <div key={c.key} style={cell(JINJA_W[c.key] * k, { height: 30, justifyContent: 'center', background: i === active ? '#D3F0E0' : '#F3F5F7', color: i === active ? XL_GREEN : '#7B8794', fontSize: 16, fontWeight: i === active ? 800 : 500 })}>{LETTERS[i]}</div>)}
                <div style={cell(70, { height: 30, justifyContent: 'center', background: '#F3F5F7', color: '#7B8794', fontSize: 16 })}>{LETTERS[7]}</div>
            </div>
            <div style={{ display: 'flex' }}>{rowNo(1)}<div style={cell(SHEET.w - 56, { justifyContent: 'center', fontWeight: 800, fontSize: 28, color: '#1F2A37' })}>BÁO CÁO FATCA GỬI NHNN</div></div>
            <div style={{ display: 'flex' }}>
                {rowNo(2)}
                {JINJA_COLS.map(c => <div key={c.key} style={cell(JINJA_W[c.key] * k, { background: mark?.key === c.key && mark.p > 0.5 ? '#5B3FD6' : '#1F4E78', color: '#fff', fontWeight: 700, borderRight: '1px solid #3A6A94', justifyContent: c.num ? 'flex-end' : 'flex-start' })}>{c.header}</div>)}
                <div style={cell(70, { background: '#1F4E78', color: '#9FB7CF', justifyContent: 'center' })}>…</div>
            </div>
            {slot && (
                <div style={{ display: 'flex' }}>
                    {rowNo(3)}
                    {JINJA_COLS.map((c, i) => {
                        const p = slot(i)
                        return (
                            <div key={c.key} style={cell(JINJA_W[c.key] * k, { background: p === null ? '#fff' : '#FAF8FF', padding: '0 8px', outline: i === active ? `3px solid ${XL_GREEN}` : undefined, outlineOffset: -3 })}>
                                {p !== null && p > 0 && <SlotChip label={c.header} p={p} />}
                            </div>
                        )
                    })}
                    <div style={cell(70)} />
                </div>
            )}
            {rows.map((r, i) => {
                const p = Math.max(0, Math.min(1, grow * rows.length - i))
                return (
                    <div key={i} style={{ display: 'flex', opacity: p, height: 64 * p, overflow: 'hidden' }}>
                        {rowNo(3 + i)}
                        {JINJA_COLS.map(c => {
                            const m = mark?.key === c.key ? mark.p : 0
                            const base = i % 2 ? '#EEF3F8' : '#fff'
                            return (
                                <div key={c.key} style={cell(JINJA_W[c.key] * k, {
                                    background: m > 0 ? `linear-gradient(rgba(124,58,237,${0.16 * m}), rgba(124,58,237,${0.16 * m})), ${base}` : base,
                                    boxShadow: m > 0 ? `inset 0 0 0 ${3 * m}px #7C3AED` : undefined,
                                    justifyContent: c.num ? 'flex-end' : c.key === 'dong_trong_nam' ? 'center' : 'flex-start', fontVariantNumeric: 'tabular-nums',
                                    fontWeight: m > 0.5 || c.key === 'so_du' || c.key === 'ten_chu_tai_khoan' ? 800 : 600,
                                    color: m > 0.5 ? '#5B3FD6' : c.key === 'dong_trong_nam' && r.dong === 'Y' ? '#C0392B' : '#1F2A37',
                                })}>{c.get(r)}</div>
                            )
                        })}
                        <div style={cell(70, { background: i % 2 ? '#EEF3F8' : '#fff' })} />
                    </div>
                )
            })}
            {Array.from({ length: blank }, (_, n) => <div key={n} style={{ display: 'flex' }}>{rowNo(4 + n)}<div style={cell(SHEET.w - 56)} /></div>)}
        </div>
    )
}

/** Thẻ mẫu dữ liệu của Semantix nhận file Excel (nhịp cuối cảnh mẫu Excel). */
const TPL_CARD = { x: 1010, y: 250, w: 800, h: 600 }
const DROP = { x: TPL_CARD.x + 36, y: TPL_CARD.y + 250, w: TPL_CARD.w - 72, h: 150 }
const ATTACH_BTN = { x: TPL_CARD.x + 36, y: TPL_CARD.y + 450, w: 320, h: 64 }
const SHRINK = { x: 110, y: 300, s: 0.54 }

export const JinjaExcelScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const mode = useTemplateMode()
    const T = JINJA_T
    const win = pop(f, T.win, fps, { damping: 200, stiffness: 100 })
    const shrink = ease(f, [T.attach, T.attach + 18], [0, 1], Easing.inOut(Easing.cubic))
    const card = pop(f, T.attach + 6, fps, { damping: 15, stiffness: 180 })
    const fly = ease(f, [T.fly, T.fly + 18], [0, 1], Easing.inOut(Easing.cubic))
    const landed = f >= T.fly + 18
    const attached = f >= T.click + 4
    const first = mode === 'biz' ? 'Dùng luôn file Excel mẫu quen thuộc' : 'Hoặc dùng luôn file Excel mẫu có sẵn'
    const chipAt = (i: number) => T.slots + i * T.slotGap
    const active = f >= T.slots && f < T.attach ? Math.min(JINJA_COLS.length - 1, Math.floor((f - T.slots) / T.slotGap)) : -1
    const sx = interpolate(shrink, [0, 1], [SHEET.x, SHRINK.x]), sy = interpolate(shrink, [0, 1], [SHEET.y, SHRINK.y]), ss = interpolate(shrink, [0, 1], [1, SHRINK.s])
    const fileFrom = { x: SHRINK.x + (SHEET.w * SHRINK.s) / 2 - 170, y: SHRINK.y + 120 }
    const fileTo = { x: DROP.x + 30, y: DROP.y + 36 }
    return (
        <Stage>
            <RoleBanner role={mode === 'biz' ? 'enduser' : 'power'} />
            <Headline text={first} at={0} out={T.slots - 8} size={fit(first, 94)} top={54} accent={['file Excel mẫu']} />
            <Headline text="Đặt ô giữ chỗ vào dòng dữ liệu" at={T.slots - 4} out={T.attach - 6} size={fit('Đặt ô giữ chỗ vào dòng dữ liệu', 96)} top={54} accent={['ô giữ chỗ']} />
            <Headline text="Gắn file vào mẫu, lần tải sau tự điền số" at={T.attach - 2} size={fit('Gắn file vào mẫu, lần tải sau tự điền số', 92)} top={54} accent={['tự điền số']} />

            <div style={{ position: 'absolute', left: sx, top: sy, opacity: win, transform: `translateY(${(1 - win) * 50}px) scale(${ss})`, transformOrigin: 'top left' }}>
                <TemplateSheet
                    fileName="Mau_FATCA_NHNN.xlsx"
                    slot={i => (f < T.slots ? null : f >= chipAt(i) - 2 ? pop(f, chipAt(i), fps, { damping: 12, stiffness: 210 }) : 0)}
                    blank={3}
                    active={active}
                />
            </div>

            {/* Thẻ mẫu dữ liệu trên Semantix */}
            {f >= T.attach && (
                <div style={{ ...panelStyle, left: TPL_CARD.x, top: TPL_CARD.y, width: TPL_CARD.w, height: TPL_CARD.h, padding: '30px 36px', boxSizing: 'border-box', opacity: Math.min(1, card * 2), transform: `translateX(${(1 - card) * 120}px)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ width: 56, height: 56, borderRadius: 16, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k="fileDown" size={28} color="#fff" /></span>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: C.steel }}>Mẫu dữ liệu trên {BRAND}</div>
                            <div style={{ fontSize: 30, fontWeight: 800, color: INK }}>{TEMPLATE_NAME}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 26, fontSize: 19, color: C.steel }}>
                        <b style={{ color: INK }}>Ô nhập:</b>
                        {['Năm báo cáo', 'Tỷ giá', 'Điều kiện lọc'].map(t => <Chip key={t} tone="blue" style={{ fontSize: 18 }}>{t}</Chip>)}
                    </div>
                    <div style={{ marginTop: 22, fontSize: 19, fontWeight: 800, color: C.steel }}>File Excel mẫu</div>
                </div>
            )}
            {f >= T.attach && (
                <div style={{
                    position: 'absolute', left: DROP.x, top: DROP.y, width: DROP.w, height: DROP.h, borderRadius: 16, boxSizing: 'border-box',
                    border: `2.5px ${landed ? 'solid' : 'dashed'} ${attached ? '#6FD3A6' : landed ? '#A78BFA' : C.rule}`, background: attached ? '#F3FBF7' : landed ? '#F8F5FF' : '#FAFAFE',
                    display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', opacity: Math.min(1, card * 2), transform: `translateX(${(1 - card) * 120}px)`,
                }}>
                    {!landed && <span style={{ fontSize: 21, color: '#A3A0B8', display: 'flex', alignItems: 'center', gap: 10 }}><Ico k="download" size={24} color="#A3A0B8" />Thả file Excel mẫu vào đây</span>}
                    {landed && (
                        <>
                            <span style={{ width: 52, height: 52, borderRadius: 12, background: XL_GREEN, color: '#fff', fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</span>
                            <div>
                                <div style={{ fontSize: 23, fontWeight: 800, color: INK }}>Mau_FATCA_NHNN.xlsx</div>
                                <div style={{ fontSize: 18, fontWeight: 600, color: attached ? C.emerald : C.steel }}>{attached ? '7 ô giữ chỗ khớp 7 cột dữ liệu' : 'Đang đọc ô giữ chỗ…'}</div>
                            </div>
                            <span style={{ marginLeft: 'auto' }}>{attached ? <Ico k="badgeCheck" size={36} color={C.emerald} /> : <Spinner size={26} />}</span>
                        </>
                    )}
                </div>
            )}
            {f >= T.attach && (
                <span style={{
                    position: 'absolute', left: ATTACH_BTN.x, top: ATTACH_BTN.y, width: ATTACH_BTN.w, height: ATTACH_BTN.h, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontSize: 23, fontWeight: 800, color: '#fff', background: attached ? C.emerald : 'linear-gradient(90deg, #7C3AED, #4F46E5)',
                    opacity: Math.min(1, card * 2), transform: `translateX(${(1 - card) * 120}px) scale(${pressAt(f, T.click)})`,
                }}><Ico k={attached ? 'check' : 'pin'} size={24} color="#fff" stroke={attached ? 3 : 2} />{attached ? 'Đã gắn vào mẫu' : 'Gắn vào mẫu'}</span>
            )}
            {/* File bay từ bảng tính vào ô thả */}
            {f >= T.fly && !landed && (
                <div style={{
                    position: 'absolute', left: interpolate(fly, [0, 1], [fileFrom.x, fileTo.x]), top: interpolate(fly, [0, 1], [fileFrom.y, fileTo.y]) - Math.sin(fly * Math.PI) * 80,
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 14, background: '#fff', border: `2px solid ${XL_GREEN}`, boxShadow: '0 20px 40px rgba(16,60,35,0.3)', zIndex: 80,
                    fontSize: 21, fontWeight: 800, color: INK, transform: `scale(${1 + Math.sin(fly * Math.PI) * 0.08})`,
                }}>
                    <span style={{ width: 34, height: 34, borderRadius: 8, background: XL_GREEN, color: '#fff', fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</span>Mau_FATCA_NHNN.xlsx
                </div>
            )}
            <Burst at={T.click + 4} x={ATTACH_BTN.x + ATTACH_BTN.w / 2} y={ATTACH_BTN.y + ATTACH_BTN.h / 2} r={120} color="#10B981" />
            <PathCursor from={T.fly - 4} to={T.click + 24} clicks={[T.click]} keys={[
                [T.fly - 4, fileFrom.x + 150, fileFrom.y + 30], [T.fly + 18, fileTo.x + 150, fileTo.y + 30], [T.click - 6, ATTACH_BTN.x + ATTACH_BTN.w / 2, ATTACH_BTN.y + 32], [T.click + 24, ATTACH_BTN.x + ATTACH_BTN.w / 2, ATTACH_BTN.y + 32],
            ]} />
            <Tag text={`Minh hoạ mẫu Excel trên ${BRAND} · dữ liệu mô phỏng`} />
        </Stage>
    )
}

// ─── Tổng kết bản Biz: giá trị mang lại, Trước → Nay ─────────────────────────────
export const RECAP_T = { before: 15, strike: 36, arrow: 48, after: 60, pills: 96, pillGap: 15 }
const BEFORE_LINES = ['Lập phiếu nhờ team Data/Tech kéo số', 'Sửa tiêu chí là chờ lại từ đầu']
const AFTER_LINES = ['Tự hỏi, ra đúng 12 cột mẫu', 'Mẫu dùng chung, kỳ sau tự tải']
const RECAP_PILLS: [IconKind, string][] = [['users', 'Một tiêu chí cho cả phòng'], ['badgeCheck', 'Có người duyệt'], ['lock', 'Chỉ dùng cột được phép']]

export const RecapBizScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = RECAP_T
    const before = pop(f, T.before, fps, { damping: 14, stiffness: 180 })
    const after = pop(f, T.after, fps, { damping: 12, stiffness: 190 })
    const strike = ease(f, [T.strike, T.strike + 14], [0, 1], Easing.out(Easing.cubic))
    const arrow = ease(f, [T.arrow, T.arrow + 12], [0, 1], Easing.out(Easing.cubic))
    const lineIn = (at: number, i: number) => ease(f, [at + 14 + i * 8, at + 24 + i * 8], [0, 1])
    return (
        <Stage>
            <Headline text="Nghiệp vụ tự lấy số, đúng mẫu, không chờ team Data/Tech" at={0} size={fit('Nghiệp vụ tự lấy số, đúng mẫu, không chờ team Data/Tech', 92)} top={100} accent={['không chờ team Data/Tech']} />
            {/* Trước */}
            <div style={{ ...panelStyle, left: 170, top: 290, width: 640, height: 420, padding: '30px 40px', boxSizing: 'border-box', background: '#F7F7FB', opacity: Math.min(1, before * 2), transform: `translateX(${(1 - before) * -60}px)` }}>
                <span style={{ padding: '6px 18px', borderRadius: 999, background: '#E5E3F2', color: C.steel, fontSize: 22, fontWeight: 800 }}>Trước</span>
                <div style={{ position: 'relative', marginTop: 22, fontSize: 104, fontWeight: 800, color: '#9A96B8', lineHeight: 1 }}>
                    17 ngày
                    <span style={{ position: 'absolute', left: -8, top: 'calc(50% - 4px)', height: 8, width: `calc(${strike} * (100% + 16px))`, background: C.red, borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 22, color: C.steel, marginTop: 10 }}>chờ một báo cáo đúng mẫu</div>
                {BEFORE_LINES.map((t, i) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: i ? 12 : 26, fontSize: 27, fontWeight: 700, color: '#6E6A8C', opacity: lineIn(T.before, i) }}>
                        <Ico k="x" size={26} color={C.red} stroke={3} />{t}
                    </div>
                ))}
            </div>
            {/* Mũi tên */}
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <defs><linearGradient id="rcg" x1="0" x2="1"><stop offset="0" stopColor="#8B7CF8" /><stop offset="1" stopColor="#E86FC6" /></linearGradient></defs>
                <path d={`M 860 500 L ${860 + 196 * arrow} 500`} stroke="url(#rcg)" strokeWidth={10} strokeLinecap="round" />
                {arrow > 0.9 && <path d="M 1030 476 L 1058 500 L 1030 524" fill="none" stroke="#E86FC6" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
            {/* Nay */}
            <div style={{ ...panelStyle, left: 1110, top: 290, width: 640, height: 420, padding: '30px 40px', boxSizing: 'border-box', border: '3px solid #C4B5FD', boxShadow: '0 30px 80px rgba(109,93,246,0.25)', opacity: Math.min(1, after * 2), transform: `scale(${0.9 + 0.1 * after})` }}>
                <span style={{ padding: '6px 18px', borderRadius: 999, background: GRAD_H, color: '#fff', fontSize: 22, fontWeight: 800 }}>Nay</span>
                <div style={{ marginTop: 22, fontSize: 76, fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap', backgroundImage: GRAD_H, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Ngay khi cần</div>
                <div style={{ fontSize: 22, color: C.steel, marginTop: 16 }}>tự lấy số, không cần phiếu gửi team Data/Tech</div>
                {AFTER_LINES.map((t, i) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: i ? 12 : 26, fontSize: 27, fontWeight: 800, color: INK, opacity: lineIn(T.after, i) }}>
                        <Ico k="check" size={26} color={C.emerald} stroke={3} />{t}
                    </div>
                ))}
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 26 }}>
                {RECAP_PILLS.map(([k, t], i) => {
                    const p = pop(f, T.pills + i * T.pillGap, fps, { damping: 14, stiffness: 200 })
                    return <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderRadius: 999, background: INK, color: '#fff', fontSize: 27, fontWeight: 700, transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}><Ico k={k} size={28} color="#fff" />{t}</div>
                })}
            </div>
            <Tag text="Thời gian chờ minh hoạ theo ví dụ đầu video" />
        </Stage>
    )
}
