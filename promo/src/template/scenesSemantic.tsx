import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { Burst, ease, INK, panelStyle, Shake, Stage } from '../promo/kit'
import { MONO } from '../promo/scenesA'
import { BRAND } from './data'
import { Headline, AppWindow, Badge, Caret, Chip, Cursor, GRAD, GRAD_H, Ico, PathCursor, RoleBanner, StepRail, pressAt, typed  } from './ui'
import { Tag, fit } from './scenes1'

// ─── Màn 1 · Nghiệp vụ mô tả yêu cầu (gắn cờ, gom nhóm, tính tổng, chỉ số) -> AI tạo danh sách ─
export const SEM_DEF = {
    typeStart: 12,
    typeEnd: 68,
    genClick: 80,
    ai: 90,
    addClick: 224,
}

const BATCH_PROMPT = 'Gắn cờ KH Mỹ, lọc ngưỡng 50.000 USD và tính tổng số dư FATCA'

const BATCH_ITEMS: {
    name: string
    kind: string
    tone: 'violet' | 'blue' | 'green' | 'amber'
    tag: string
    rule: string
}[] = [
    {
        name: 'Thuộc diện FATCA',
        kind: 'Cột ảo',
        tone: 'violet',
        tag: 'FLAG',
        rule: "Quốc gia = US → 'Có'",
    },
    {
        name: 'Nhóm KH & Ngưỡng 50k',
        kind: 'Cột ảo',
        tone: 'blue',
        tag: 'GROUP',
        rule: 'Cá nhân > 50.000 USD',
    },
    {
        name: 'Tổng số dư USD',
        kind: 'Chỉ số',
        tone: 'green',
        tag: 'SUM',
        rule: 'CASA + Tiền gửi quy đổi',
    },
    {
        name: 'Số KH báo cáo',
        kind: 'Chỉ số',
        tone: 'amber',
        tag: 'COUNT',
        rule: 'Đếm mã CIF duy nhất',
    },
]

export const SemanticDefScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = SEM_DEF
    const winIn = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const added = f >= T.addClick + 4

    return (
        <Stage>
            <RoleBanner role="collab-def" />
            <Headline
                text="Mô tả nhu cầu gắn cờ, gom nhóm, tính tổng bằng lời"
                at={0}
                out={T.ai - 4}
                size={fit('Mô tả nhu cầu gắn cờ, gom nhóm, tính tổng bằng lời', 84)}
                top={54}
                accent={['gắn cờ, gom nhóm, tính tổng', 'bằng lời']}
            />
            <Headline
                text="AI tạo ngay danh sách Cột ảo và Chỉ số chuẩn hoá"
                at={T.ai}
                size={fit('AI tạo ngay danh sách Cột ảo và Chỉ số chuẩn hoá', 84)}
                top={54}
                accent={['Cột ảo', 'Chỉ số chuẩn hoá']}
            />

            <AppWindow
                title="Mô hình · FATCA · Trợ lý AI tạo Cột ảo & Chỉ số (Chế độ: Tạo nhiều)"
                icon="sparkles"
                barColor={C.navy}
                style={{
                    left: 110, top: 170, width: 1700, height: 824,
                    opacity: winIn, transform: `translateY(${(1 - winIn) * 50}px)`,
                }}
            >
                <div style={{ padding: '22px 32px', height: 778, boxSizing: 'border-box', position: 'relative' }}>
                    {/* Hàng chip nhu cầu nghiệp vụ */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: INK }}>Yêu cầu của Nghiệp vụ:</span>
                        <Chip tone="violet" style={{ fontSize: 18 }}>1. Logic gắn cờ (Flagging)</Chip>
                        <Chip tone="blue" style={{ fontSize: 18 }}>2. Logic gom nhóm</Chip>
                        <Chip tone="green" style={{ fontSize: 18 }}>3. Tính tổng & Chỉ số</Chip>
                        <span style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 700, color: C.steel }}>Bảng nguồn: Mô hình FATCA</span>
                    </div>

                    {/* Ô nhập mô tả ngôn ngữ tự nhiên + nút AI */}
                    <div style={{ display: 'flex', gap: 18, marginTop: 14, alignItems: 'stretch' }}>
                        <div style={{
                            flex: 1, minHeight: 88, padding: '14px 20px', borderRadius: 16,
                            border: `2.5px solid ${f < T.ai ? C.violet : C.rule}`, background: '#FAFAFE',
                            fontSize: 24, fontWeight: 700, color: INK, lineHeight: 1.38, boxSizing: 'border-box',
                            display: 'flex', alignItems: 'center',
                        }}>
                            <span>
                                {typed(f, BATCH_PROMPT, T.typeStart, T.typeEnd)}
                                {f >= T.typeStart && f < T.ai && <Caret />}
                            </span>
                        </div>
                        <div style={{
                            width: 280, borderRadius: 16,
                            background: f >= T.ai ? '#EFEAFE' : GRAD,
                            color: f >= T.ai ? '#5B3FD6' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            fontSize: 22, fontWeight: 800, whiteSpace: 'nowrap',
                            transform: `scale(${pressAt(f, T.genClick)})`,
                            boxShadow: f >= T.ai ? 'none' : '0 14px 32px rgba(109,93,246,0.28)',
                        }}>
                            <Ico k="sparkles" size={24} color={f >= T.ai ? '#5B3FD6' : '#fff'} />
                            AI đề xuất danh sách
                        </div>
                    </div>

                    {/* Danh sách 4 mục AI tạo ra (2x2 Grid chữ lớn, thoáng) */}
                    {f >= T.ai && (
                        <>
                            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ width: 32, height: 32, borderRadius: 16, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Ico k="bot" size={18} color="#fff" />
                                </span>
                                <span style={{ fontSize: 22, fontWeight: 800, color: INK }}>
                                    AI đề xuất 4 mục chuẩn hoá (2 Cột ảo · 2 Chỉ số)
                                </span>
                                <span style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 700, color: C.emerald }}>
                                    Đã chọn 4 / 4 mục
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 14 }}>
                                {BATCH_ITEMS.map((item, i) => {
                                    const p = spring({ frame: f - (T.ai + 6 + i * 8), fps, config: { damping: 14, stiffness: 190 } })
                                    return (
                                        <div key={item.name} style={{
                                            padding: '20px 24px', borderRadius: 18, background: '#fff',
                                            border: `2px solid ${added ? '#A6E3C8' : '#DCD3FB'}`,
                                            boxShadow: '0 10px 26px rgba(34,26,102,0.07)',
                                            opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 24}px)`,
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{
                                                    width: 28, height: 28, borderRadius: 8, background: C.violet,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                }}>
                                                    <Ico k="check" size={18} color="#fff" stroke={3} />
                                                </span>
                                                <span style={{ fontSize: 26, fontWeight: 800, color: INK }}>{item.name}</span>
                                                <span style={{ marginLeft: 'auto' }}>
                                                    <Chip tone={item.tone} style={{ fontSize: 17, padding: '4px 12px' }}>{item.kind}</Chip>
                                                </span>
                                            </div>
                                            <div style={{
                                                marginTop: 14, padding: '10px 14px', borderRadius: 12,
                                                background: '#F6F5FC', display: 'flex', alignItems: 'center', gap: 12,
                                            }}>
                                                <span style={{
                                                    fontFamily: MONO, fontSize: 16, fontWeight: 800, padding: '4px 10px',
                                                    borderRadius: 8, background: '#16132B', color: '#A6E3C8', whiteSpace: 'nowrap',
                                                }}>
                                                    {item.tag}
                                                </span>
                                                <span style={{ fontSize: 20, fontWeight: 700, color: '#3A3755', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.rule}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Thanh nút Thêm 4 mục vào Catalog */}
                            <div style={{
                                position: 'absolute', left: 32, right: 32, bottom: 22,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 24px', borderRadius: 16,
                                background: added ? '#E6F6EE' : '#F8F7FC',
                                border: `2px solid ${added ? C.emerald : C.rule}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 21, fontWeight: 700, color: INK }}>
                                    <Ico k="sparkles" size={22} color={C.violet} />
                                    <span>4 mục sẵn sàng đưa vào Catalog</span>
                                </div>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 26px',
                                    borderRadius: 14, background: added ? C.emerald : C.violet, color: '#fff',
                                    fontSize: 22, fontWeight: 800, transform: `scale(${pressAt(f, T.addClick)})`,
                                }}>
                                    <Ico k="check" size={22} color="#fff" stroke={3} />
                                    {added ? 'Đã thêm 4 mục vào Catalog' : 'Thêm 4 mục vào Model'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </AppWindow>

            <PathCursor
                from={T.genClick - 18}
                to={T.addClick + 16}
                clicks={[T.genClick, T.addClick]}
                keys={[
                    [T.genClick - 18, 1200, 380],
                    [T.genClick, 1630, 332],
                    [T.genClick + 20, 1630, 332],
                    [T.addClick - 12, 1600, 922],
                    [T.addClick + 16, 1600, 922],
                ]}
            />
            <Burst at={T.addClick} x={1600} y={922} r={140} />
            <StepRail active={1} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · Trợ lý AI tạo nhiều mục`} />
        </Stage>
    )
}

// ─── Màn 2 · Kéo thả Cột ảo & Chỉ số vừa tạo để test kết quả trên màn riêng ─────────
export const SEM_TEST = {
    drag1Start: 18,
    drag1End: 48,
    drag2Start: 56,
    drag2End: 86,
    runClick: 112,
    rows: 126,
    submit: 232,
}

const PREVIEW_GROUP_ROWS = [
    { group: 'Tổ chức (Entity)', flag: 'Có', count: '4 KH', sum: '412.800,00 USD', ok: true },
    { group: 'Cá nhân > 50.000 USD', flag: 'Có', count: '3 KH', sum: '300.650,50 USD', ok: true },
    { group: 'Cá nhân ≤ 50.000 USD (Loại)', flag: 'Có', count: '2 KH', sum: '31.200,00 USD', ok: false },
]

export const SemanticTestScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = SEM_TEST
    const winIn = spring({ frame: f - 2, fps, config: { damping: 200 } })
    const dropped1 = f >= T.drag1End
    const dropped2 = f >= T.drag2End
    const ran = f >= T.rows
    const submitted = f >= T.submit + 4

    // Toạ độ thẻ đang kéo (Drag Ghost)
    const dragging1 = f >= T.drag1Start && f < T.drag1End
    const dragging2 = f >= T.drag2Start && f < T.drag2End
    const d1P = ease(f, [T.drag1Start, T.drag1End], [0, 1], Easing.inOut(Easing.cubic))
    const d2P = ease(f, [T.drag2Start, T.drag2End], [0, 1], Easing.inOut(Easing.cubic))

    return (
        <Stage>
            <RoleBanner role="collab-def" />
            <Headline
                text="Kéo thả Cột ảo và Chỉ số vào khung kiểm thử"
                at={0}
                out={T.rows - 4}
                size={fit('Kéo thả Cột ảo và Chỉ số vào khung kiểm thử', 86)}
                top={54}
                accent={['Kéo thả', 'khung kiểm thử']}
            />
            <Headline
                text="Chạy thử thấy khớp số liệu rồi mới bấm Gửi duyệt"
                at={T.rows}
                size={fit('Chạy thử thấy khớp số liệu rồi mới bấm Gửi duyệt', 84)}
                top={54}
                accent={['khớp số liệu', 'Gửi duyệt']}
            />

            <AppWindow
                title="Mô hình · FATCA · Thiết kế Cột & Kiểm thử (Column Builder)"
                icon="table"
                barColor={C.navy}
                style={{
                    left: 90, top: 170, width: 1740, height: 824,
                    opacity: winIn, transform: `translateY(${(1 - winIn) * 50}px)`,
                }}
            >
                <div style={{ display: 'flex', height: 778, boxSizing: 'border-box' }}>
                    {/* Cột trái: Catalog nguồn chứa các Cột ảo & Chỉ số vừa tạo */}
                    <div style={{ width: 470, borderRight: `1px solid ${C.rule}`, padding: '20px 22px', background: '#FAFAFE', boxSizing: 'border-box' }}>
                        <div style={{ fontSize: 21, fontWeight: 800, color: C.navy, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Ico k="database" size={22} color={C.violet} />
                            Catalog nguồn (Vừa tạo)
                        </div>

                        <div style={{ marginTop: 18, fontSize: 17, fontWeight: 800, color: C.steel, letterSpacing: '0.03em' }}>
                            CỘT ẢO (CALCULATED FIELDS)
                        </div>
                        {([
                            ['Thuộc diện FATCA', 'Gắn cờ US', true],
                            ['Nhóm KH & Ngưỡng 50k', 'Gom nhóm', dropped1],
                        ] as const).map(([label, tag, active]) => (
                            <div key={label} style={{
                                marginTop: 10, padding: '14px 16px', borderRadius: 14,
                                background: active ? '#F6F3FF' : '#fff',
                                border: `2px solid ${active ? C.violet : C.rule}`,
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <Ico k="grip" size={20} color={C.violet} />
                                <span style={{ fontSize: 20, fontWeight: 800, color: INK }}>{label}</span>
                                <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 700, color: '#5B3FD6', background: '#EFEAFE', padding: '3px 10px', borderRadius: 8 }}>{tag}</span>
                            </div>
                        ))}

                        <div style={{ marginTop: 22, fontSize: 17, fontWeight: 800, color: C.steel, letterSpacing: '0.03em' }}>
                            CHỈ SỐ CHUẨN (METRICS)
                        </div>
                        {([
                            ['Tổng số dư quy đổi USD', 'SUM', dropped2],
                            ['Số KH thuộc diện FATCA', 'COUNT', true],
                        ] as const).map(([label, tag, active]) => (
                            <div key={label} style={{
                                marginTop: 10, padding: '14px 16px', borderRadius: 14,
                                background: active ? '#F3FBF7' : '#fff',
                                border: `2px solid ${active ? C.emerald : C.rule}`,
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <Ico k="grip" size={20} color={C.emerald} />
                                <span style={{ fontSize: 20, fontWeight: 800, color: INK }}>{label}</span>
                                <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 800, color: C.emerald, background: '#E6F6EE', padding: '3px 10px', borderRadius: 8 }}>{tag}</span>
                            </div>
                        ))}

                        <div style={{ marginTop: 26, padding: '14px 16px', borderRadius: 14, background: '#EFEAFE', fontSize: 18.5, fontWeight: 700, color: '#4C1D95', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Ico k="sparkles" size={20} color={C.violet} />
                            <span>Kéo sang phải để chạy thử</span>
                        </div>
                    </div>

                    {/* Khu vực phải: Khung thả Builder + Bảng Preview kết quả */}
                    <div style={{ flex: 1, padding: '20px 28px', position: 'relative', boxSizing: 'border-box' }}>
                        {/* Khung Drop Zone */}
                        <div style={{
                            padding: '18px 22px', borderRadius: 18,
                            background: '#F8F7FC', border: `2px dashed ${C.violet}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Ico k="sparkles" size={22} color={C.violet} />
                                    Khung kéo thả kiểm thử (Builder)
                                </div>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 24px',
                                    borderRadius: 12, background: GRAD, color: '#fff',
                                    fontSize: 21, fontWeight: 800, transform: `scale(${pressAt(f, T.runClick)})`,
                                    boxShadow: '0 10px 24px rgba(109,93,246,0.28)',
                                }}>
                                    <Ico k="play" size={18} color="#fff" />
                                    Chạy thử (Run)
                                </span>
                            </div>

                            {/* Hàng các thẻ đã thả vào Builder */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14, minHeight: 54, alignItems: 'center' }}>
                                <Chip tone="violet" style={{ fontSize: 19, padding: '9px 16px' }}>
                                    Bộ lọc: Thuộc diện FATCA = Có
                                </Chip>
                                {dropped1 ? (
                                    <Chip tone="blue" style={{
                                        fontSize: 19, padding: '9px 16px',
                                        transform: `scale(${spring({ frame: f - T.drag1End, fps, config: { damping: 12, stiffness: 220 } })})`,
                                    }}>
                                        Nhóm: Nhóm KH & Ngưỡng 50k
                                    </Chip>
                                ) : (
                                    <span style={{ padding: '9px 18px', borderRadius: 10, border: `2px dashed #93B8F8`, fontSize: 18, fontWeight: 700, color: '#1D5BD8' }}>
                                        + Thả Cột ảo gom nhóm vào đây
                                    </span>
                                )}
                                <Chip tone="amber" style={{ fontSize: 19, padding: '9px 16px' }}>
                                    Số KH thuộc diện FATCA
                                </Chip>
                                {dropped2 ? (
                                    <Chip tone="green" style={{
                                        fontSize: 19, padding: '9px 16px',
                                        transform: `scale(${spring({ frame: f - T.drag2End, fps, config: { damping: 12, stiffness: 220 } })})`,
                                    }}>
                                        SUM: Tổng số dư quy đổi USD
                                    </Chip>
                                ) : (
                                    <span style={{ padding: '9px 18px', borderRadius: 10, border: `2px dashed #86EFAC`, fontSize: 18, fontWeight: 700, color: C.emerald }}>
                                        + Thả Chỉ số tính tổng vào đây
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bảng Preview kết quả sau khi bấm Run */}
                        {ran ? (
                            <div style={{ marginTop: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <span style={{ width: 30, height: 30, borderRadius: 15, background: '#E6F6EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ico k="check" size={18} color={C.emerald} stroke={3} />
                                    </span>
                                    <span style={{ fontSize: 22, fontWeight: 800, color: INK }}>
                                        Kết quả Xem trước (Preview) · 7 khách hàng đủ điều kiện báo cáo
                                    </span>
                                    <span style={{ marginLeft: 'auto' }}><Badge kind="sim" size={15} /></span>
                                </div>

                                <div style={{ borderRadius: 16, border: `1px solid ${C.rule}`, overflow: 'hidden', background: '#fff' }}>
                                    <div style={{ display: 'flex', padding: '14px 22px', background: '#F1EFFB', borderBottom: `2px solid ${C.rule}`, fontSize: 19, fontWeight: 800, color: C.navy }}>
                                        <span style={{ flex: 1.5 }}>Nhóm KH & Ngưỡng 50k</span>
                                        <span style={{ width: 170 }}>tiêu chí FATCA</span>
                                        <span style={{ width: 210 }}>Số KH FATCA</span>
                                        <span style={{ width: 260, textAlign: 'right' }}>Tổng số dư quy đổi USD</span>
                                    </div>
                                    {PREVIEW_GROUP_ROWS.map((r, i) => {
                                        const rowP = spring({ frame: f - (T.rows + i * 8), fps, config: { damping: 15, stiffness: 190 } })
                                        return (
                                            <div key={r.group} style={{
                                                display: 'flex', alignItems: 'center', height: 74, padding: '0 22px',
                                                borderBottom: '1px solid #EAE8F6', fontSize: 21.5, fontWeight: 700,
                                                color: r.ok ? INK : C.steel, background: r.ok ? '#fff' : '#FAFAFE',
                                                opacity: Math.min(1, rowP * 1.8), transform: `translateY(${(1 - rowP) * 18}px)`,
                                            }}>
                                                <span style={{ flex: 1.5, fontWeight: 800 }}>{r.group}</span>
                                                <span style={{ width: 170 }}>
                                                    <Chip tone="violet" style={{ fontSize: 18, padding: '4px 14px' }}>{r.flag}</Chip>
                                                </span>
                                                <span style={{ width: 210, fontWeight: 700 }}>{r.count}</span>
                                                <span style={{ width: 260, textAlign: 'right', fontFamily: MONO, fontWeight: 800, color: r.ok ? C.navy : C.steel }}>
                                                    {r.sum}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                marginTop: 22, height: 340, borderRadius: 18, border: `2px dashed ${C.rule}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 23, fontWeight: 600, color: '#A3A0B8',
                            }}>
                                Kéo thả Cột ảo & Chỉ số rồi bấm Chạy thử (Run) để xem số liệu
                            </div>
                        )}

                        {/* Thanh gửi duyệt dưới đáy */}
                        <div style={{
                            position: 'absolute', left: 28, right: 28, bottom: 22,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 22px', borderRadius: 16,
                            background: submitted ? '#E6F6EE' : '#F8F7FC',
                            border: `2px solid ${submitted ? C.emerald : C.rule}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 700, color: INK }}>
                                <Ico k="check" size={22} color={C.emerald} stroke={3} />
                                <span>Đã khớp số liệu · Gửi duyệt chuẩn chung</span>
                            </div>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 26px',
                                borderRadius: 14, background: submitted ? C.emerald : C.violet, color: '#fff',
                                fontSize: 22, fontWeight: 800, transform: `scale(${pressAt(f, T.submit)})`,
                            }}>
                                <Ico k={submitted ? 'check' : 'send'} size={20} color="#fff" stroke={2.5} />
                                {submitted ? 'Đã gửi yêu cầu duyệt' : 'Gửi để duyệt'}
                            </span>
                        </div>
                    </div>
                </div>
            </AppWindow>

            {/* Thẻ bay khi kéo thả từ Catalog sang Builder */}
            {dragging1 && (
                <>
                    <div style={{
                        position: 'absolute',
                        left: interpolate(d1P, [0, 1], [260, 860]),
                        top: interpolate(d1P, [0, 1], [375, 290]),
                        padding: '12px 20px', borderRadius: 14, background: '#EFEAFE',
                        border: `2.5px solid ${C.violet}`, boxShadow: '0 20px 44px rgba(109,93,246,0.3)',
                        fontSize: 20, fontWeight: 800, color: '#5B3FD6', zIndex: 450,
                        transform: 'rotate(-2deg) scale(1.05)',
                    }}>
                        Nhóm KH & Ngưỡng 50k
                    </div>
                    <Cursor x={interpolate(d1P, [0, 1], [340, 960])} y={interpolate(d1P, [0, 1], [395, 310])} press={1} />
                </>
            )}
            {dragging2 && (
                <>
                    <div style={{
                        position: 'absolute',
                        left: interpolate(d2P, [0, 1], [260, 1280]),
                        top: interpolate(d2P, [0, 1], [505, 290]),
                        padding: '12px 20px', borderRadius: 14, background: '#E6F6EE',
                        border: `2.5px solid ${C.emerald}`, boxShadow: '0 20px 44px rgba(14,122,95,0.28)',
                        fontSize: 20, fontWeight: 800, color: C.emerald, zIndex: 450,
                        transform: 'rotate(2deg) scale(1.05)',
                    }}>
                        SUM: Tổng số dư quy đổi USD
                    </div>
                    <Cursor x={interpolate(d2P, [0, 1], [340, 1380])} y={interpolate(d2P, [0, 1], [525, 310])} press={1} />
                </>
            )}

            <PathCursor
                from={T.drag2End + 4}
                to={T.submit + 16}
                clicks={[T.runClick, T.submit]}
                keys={[
                    [T.drag2End + 4, 1380, 310],
                    [T.runClick - 6, 1665, 232],
                    [T.runClick + 16, 1665, 232],
                    [T.submit - 12, 1620, 922],
                    [T.submit + 16, 1620, 922],
                ]}
            />
            <Burst at={T.submit} x={1620} y={922} r={140} />
            <StepRail active={1} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · Thiết kế Cột (Column Builder)`} />
        </Stage>
    )
}

// ─── Cảnh B · Phê duyệt chuẩn chung — Thiết kế tối giản, chữ TO, đọc hiểu trong 2 giây ─
export const SEM_GOV = { edge1: 38, edge2: 66, baSign: 132, tpApprove: 196, takeaways: 218 }

export const SemanticGovScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const T = SEM_GOV
    const c1 = spring({ frame: f - 4, fps, config: { damping: 16, stiffness: 170 } })
    const c2 = spring({ frame: f - 14, fps, config: { damping: 16, stiffness: 170 } })
    const c3 = spring({ frame: f - 24, fps, config: { damping: 16, stiffness: 170 } })
    const baSigned = f >= T.baSign + 4
    const tpApproved = f >= T.tpApprove + 4

    return (
        <Stage>
            <RoleBanner role="collab-gov" />
            <Headline
                text="BA rà tình huống biên, không phải dựng từ đầu"
                at={0}
                out={156}
                size={fit('BA rà tình huống biên, không phải dựng từ đầu', 88)}
                top={54}
                accent={['tình huống biên', 'dựng từ đầu']}
            />
            <Headline
                text="Người duyệt bấm Duyệt, cả phòng dùng chung"
                at={158}
                size={fit('Người duyệt bấm Duyệt, cả phòng dùng chung', 90)}
                top={54}
                accent={['bấm Duyệt', 'cả phòng']}
            />

            <Shake hits={[T.baSign + 2, T.tpApprove + 2]} amp={7}>
                {/* Mũi tên nối 3 bước */}
                <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
                    {[596, 1266].map((x, idx) => (
                        <g key={x} transform={`translate(${x}, 480)`}>
                            <circle r={24} fill="#fff" stroke={C.violet} strokeWidth={3} />
                            <path d="M-7 0 H7 M2 -6 L8 0 L2 6" stroke={C.violet} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    ))}
                </svg>

                {/* Bước 1: Nghiệp vụ đề xuất */}
                <div style={{
                    ...panelStyle, left: 68, top: 196, width: 508, height: 576, padding: '30px 28px', boxSizing: 'border-box',
                    opacity: Math.min(1, c1 * 1.8), transform: `translateY(${(1 - c1) * 50}px)`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ width: 56, height: 56, borderRadius: 16, background: '#E6F6EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ico k="userCheck" size={30} color={C.emerald} />
                        </span>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: C.emerald }}>BƯỚC 1</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: INK }}>Cán bộ Nghiệp vụ</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 28, padding: '22px 20px', borderRadius: 18, background: '#F6F3FF', border: `2px solid ${C.violet}`, textAlign: 'center' }}>
                        <div style={{ fontSize: 19, fontWeight: 700, color: C.steel }}>Bộ tiêu chí đề xuất</div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: INK, marginTop: 8 }}>4 Cột ảo & Chỉ số FATCA</div>
                    </div>

                    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, fontWeight: 700, color: INK }}>
                        <Ico k="check" size={24} color={C.emerald} stroke={3} />
                        Tự tạo bằng lời & kéo thả test
                    </div>

                    <div style={{
                        position: 'absolute', left: 28, right: 28, bottom: 28, height: 66, borderRadius: 16,
                        background: '#E6F6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        fontSize: 23, fontWeight: 800, color: C.emerald,
                    }}>
                        <Ico k="check" size={24} color={C.emerald} stroke={3} />Đã gửi duyệt
                    </div>
                </div>

                {/* Bước 2: BA Data bọc tình huống biên */}
                <div style={{
                    ...panelStyle, left: 616, top: 196, width: 630, height: 576, padding: '30px 30px', boxSizing: 'border-box',
                    border: `3px solid ${baSigned ? C.emerald : C.violet}`,
                    opacity: Math.min(1, c2 * 1.8), transform: `translateY(${(1 - c2) * 50}px)`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ width: 56, height: 56, borderRadius: 16, background: '#EFEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ico k="shield" size={30} color={C.violet} />
                        </span>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: C.violet }}>BƯỚC 2 · RÀ SOÁT</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: INK }}>BA Data rà tình huống biên</div>
                        </div>
                    </div>

                    {([
                        ['+ Loại giao dịch đảo bút toán (REVE)', T.edge1],
                        ['+ Chỉ lấy dòng hiệu lực mới nhất mỗi KH', T.edge2],
                    ] as const).map(([label, at]) => {
                        const p = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 190 } })
                        return (
                            <div key={label} style={{
                                marginTop: 22, padding: '20px 22px', borderRadius: 16,
                                background: '#F6F3FF', border: '2px solid #CFC8FF',
                                fontSize: 24, fontWeight: 800, color: INK,
                                display: 'flex', alignItems: 'center', gap: 12,
                                opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 36}px)`,
                            }}>
                                <Chip tone="violet" style={{ fontSize: 18, padding: '5px 12px' }}>Bổ sung</Chip>
                                <span>{label}</span>
                            </div>
                        )
                    })}

                    <div style={{
                        position: 'absolute', left: 30, right: 30, bottom: 28, height: 66, borderRadius: 16,
                        background: baSigned ? '#E6F6EE' : GRAD, color: baSigned ? C.emerald : '#fff',
                        border: baSigned ? `2px solid ${C.emerald}` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                        fontSize: 24, fontWeight: 800, transform: `scale(${pressAt(f, T.baSign)})`,
                    }}>
                        <Ico k={baSigned ? 'badgeCheck' : 'shield'} size={26} color={baSigned ? C.emerald : '#fff'} stroke={2.5} />
                        {baSigned ? 'Đã bổ sung 2 tình huống' : 'Đang rà soát'}
                    </div>
                </div>

                {/* Bước 3: Trưởng phòng Nghiệp vụ duyệt */}
                <div style={{
                    ...panelStyle, left: 1286, top: 196, width: 566, height: 576, padding: '30px 28px', boxSizing: 'border-box',
                    border: tpApproved ? `3px solid ${C.violet}` : `1px solid ${C.rule}`,
                    opacity: Math.min(1, c3 * 1.8), transform: `translateY(${(1 - c3) * 50}px)`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ width: 56, height: 56, borderRadius: 16, background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ico k="badgeCheck" size={30} color="#1D5BD8" />
                        </span>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#1D5BD8' }}>BƯỚC 3 · DUYỆT MỘT LẦN</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: INK }}>Người duyệt (BA / Trưởng phòng)</div>
                        </div>
                    </div>

                    <div style={{
                        marginTop: 28, padding: '22px 20px', borderRadius: 18,
                        background: tpApproved ? GRAD_H : '#F8F8FC',
                        color: tpApproved ? '#fff' : INK,
                        border: tpApproved ? 'none' : `2px solid ${C.rule}`,
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 19, fontWeight: 700, opacity: tpApproved ? 0.9 : 0.7 }}>Phạm vi áp dụng</div>
                        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
                            {tpApproved ? 'ĐÃ ÁP DỤNG CẢ PHÒNG' : 'Chuẩn chung của cả phòng'}
                        </div>
                    </div>

                    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, fontWeight: 700, color: baSigned ? INK : C.steel }}>
                        <Ico k="check" size={24} color={baSigned ? C.emerald : C.steel} stroke={3} />
                        BA đã rà tình huống biên
                    </div>

                    <div style={{
                        position: 'absolute', left: 28, right: 28, bottom: 28, height: 66, borderRadius: 16,
                        background: tpApproved ? '#EFEAFE' : baSigned ? C.violet : '#E5E3F2',
                        color: tpApproved ? '#5B3FD6' : baSigned ? '#fff' : C.steel,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                        fontSize: 24, fontWeight: 800, transform: `scale(${pressAt(f, T.tpApprove)})`,
                    }}>
                        <Ico k="check" size={26} color={tpApproved ? '#5B3FD6' : baSigned ? '#fff' : C.steel} stroke={3} />
                        {tpApproved ? 'Đã duyệt · cả phòng dùng' : 'Duyệt'}
                    </div>
                </div>
            </Shake>

            {/* 1 thanh thông điệp duy nhất, ngắn gọn ở đáy */}
            {f >= T.takeaways && (
                <div style={{
                    position: 'absolute', left: 260, right: 260, top: 812,
                    padding: '18px 32px', borderRadius: 20, background: INK, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                    fontSize: 25, fontWeight: 800,
                    transform: `scale(${spring({ frame: f - T.takeaways, fps, config: { damping: 14, stiffness: 190 } })})`,
                }}>
                    <Ico k="shield" size={28} color="#CFC8FF" />
                    <span>Nghiệp vụ chủ động · BA rà soát · Cả phòng dùng chung</span>
                </div>
            )}

            <PathCursor
                from={T.baSign - 20}
                to={T.tpApprove + 18}
                clicks={[T.tpApprove]}
                keys={[
                    [T.baSign - 20, 930, 560],
                    [T.baSign - 4, 930, 712],
                    [T.baSign + 16, 930, 712],
                    [T.tpApprove - 8, 1568, 712],
                    [T.tpApprove + 18, 1568, 712],
                ]}
            />
            <Burst at={T.baSign} x={930} y={712} r={130} />
            <Burst at={T.tpApprove} x={1568} y={712} r={150} color="#6D5DF6" />
            <StepRail active={1} />
            <Tag text={`Minh hoạ giao diện ${BRAND} · Phê duyệt chuẩn chung`} />
        </Stage>
    )
}
