import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, FONT } from '../theme'
import { ease, INK, panelStyle, Stage } from '../promo/kit'
import { BRAND } from './data'
import { Headline, GRAD, GRAD_H, Ico, type IconKind  } from './ui'
import { fit, Tag } from './scenes1'

/**
 * Mốc frame cho Cảnh Data Flow (`CompareBeforeScene`):
 *  - Nhịp 1 (0..185): Trước đây — Dữ liệu phân mảnh, bỏ trống Data Mart, 200+ báo cáo RMS & xử lý tay Excel
 *  - Nhịp 2 (185..430): Có Semantix — Chuẩn hoá qua Domain/Division Mart, làm báo cáo tự động End-to-End
 */
export const CMP_BEFORE = {
    tradSources: 16,
    tradArrows: 42,
    tradRms: 68,
    tradUser: 98,
    tradWarn: 124,
    newStart: 188,
    newSources: 202,
    newMarts: 232,
    newSemantix: 268,
    newNotes: 302,
}

/**
 * Mốc frame cho Cảnh Quy Trình (`CompareAfterScene`):
 *  - Nhịp 1 (0..195): Quy trình cũ — User & team Data/Tech đẩy phiếu qua lại, Làm rõ ⇄ Phát triển nhiều vòng,
 *    nghiệm thu lộ gap thì quay lại Làm rõ; kết bằng dải cảnh báo
 *  - Nhịp 2 (195..430): Quy trình mới — User làm chủ mạch 4 bước, team Data/Tech · CĐS dựng nền phía dưới
 */
export const CMP_AFTER = {
    oldLane: 14,
    oldStep1: 20,
    oldStep2: 40,
    oldStep3: 60,
    oldStep4: 80,
    oldClarify: 98,
    oldStep5: 122,
    oldRework: 138,
    oldStep6: 152,
    oldWarn: 166,
    newStart: 196,
    newIt1: 212,
    newUser1: 238,
    newUser2: 264,
    newUser3: 290,
    newUser4: 316,
    newSupport: 342,
    newNote: 368,
}

const popAt = (f: number, at: number, fps: number) =>
    spring({ frame: f - at, fps, config: { damping: 14, stiffness: 180 } })

/** Icon cụm máy chủ nguồn (Server Rack). */
const ServerNode: React.FC<{ label: string; p: number; tone: 'old' | 'new' }> = ({ label, p, tone }) => {
    const accent = tone === 'old' ? '#D97706' : '#4F46E5'
    const bgTint = tone === 'old' ? '#FFFBEB' : '#EEF2FF'
    return (
        <div style={{
            height: 58, borderRadius: 14, background: '#FFFFFF',
            border: `2px solid ${tone === 'old' ? '#FCD34D' : '#C7D2FE'}`,
            padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 20px rgba(15,23,42,0.06)',
            opacity: Math.min(1, p * 1.8), transform: `scale(${0.88 + 0.12 * p})`,
        }}>
            <span style={{
                width: 34, height: 34, borderRadius: 10, background: bgTint,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <Ico k="database" size={18} color={accent} />
            </span>
            <span style={{ fontFamily: FONT, fontSize: 19, fontWeight: 800, color: INK }}>{label}</span>
            <span style={{
                marginLeft: 'auto', width: 9, height: 9, borderRadius: 99,
                background: tone === 'old' ? '#F59E0B' : '#10B981',
                boxShadow: `0 0 8px ${tone === 'old' ? '#F59E0B' : '#10B981'}`,
            }} />
        </div>
    )
}

/**
 * Màn 1 (`CompareBeforeScene`):
 * Sơ đồ Visual Data Flow — So sánh trực quan Luồng Dữ Liệu Trước & Sau khi có Semantix.
 * Tối giản chữ, tập trung vào hình ảnh luồng chảy (particles), chồng báo cáo RMS và khối Data Mart.
 */
export const CompareBeforeScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()

    const s1 = popAt(f, CMP_BEFORE.tradSources, fps)
    const s2 = popAt(f, CMP_BEFORE.tradSources + 5, fps)
    const s3 = popAt(f, CMP_BEFORE.tradSources + 10, fps)
    const tradLineP = ease(f, [CMP_BEFORE.tradArrows, CMP_BEFORE.tradArrows + 24], [0, 1])
    const gapPop = popAt(f, CMP_BEFORE.tradArrows + 10, fps)
    const rmsPop = popAt(f, CMP_BEFORE.tradRms, fps)
    const rmsToUserP = ease(f, [CMP_BEFORE.tradUser - 12, CMP_BEFORE.tradUser + 6], [0, 1])
    const userPop = popAt(f, CMP_BEFORE.tradUser, fps)

    const newIn = ease(f, [CMP_BEFORE.newStart - 6, CMP_BEFORE.newStart + 12], [0, 1])
    const ns1 = popAt(f, CMP_BEFORE.newSources, fps)
    const ns2 = popAt(f, CMP_BEFORE.newSources + 5, fps)
    const ns3 = popAt(f, CMP_BEFORE.newSources + 10, fps)
    const toMartP = ease(f, [CMP_BEFORE.newMarts - 10, CMP_BEFORE.newMarts + 14], [0, 1])
    const mart1Pop = popAt(f, CMP_BEFORE.newMarts, fps)
    const mart2Pop = popAt(f, CMP_BEFORE.newMarts + 8, fps)
    const toSemP = ease(f, [CMP_BEFORE.newSemantix - 12, CMP_BEFORE.newSemantix + 12], [0, 1])
    const semPop = popAt(f, CMP_BEFORE.newSemantix, fps)

    // Hiệu ứng hạt dữ liệu trôi dọc đường nối
    const dashOffset = -(f * 2.4) % 36

    return (
        <Stage>
            <Headline
                text="Trước đây: Dữ liệu phân tán, 200+ báo cáo trùng lặp"
                at={0}
                out={CMP_BEFORE.newStart - 6}
                size={fit('Trước đây: Dữ liệu phân tán, 200+ báo cáo trùng lặp', 84)}
                top={46}
                accent={['Dữ liệu phân tán']}
            />
            <Headline
                text="Có Semantix: Chuẩn hoá Data Mart, báo cáo tự động"
                at={CMP_BEFORE.newStart}
                size={fit('Có Semantix: Chuẩn hoá Data Mart, báo cáo tự động', 84)}
                top={46}
                accent={['Chuẩn hoá Data Mart']}
            />

            {/* Khung Canvas 3 tầng dữ liệu */}
            <div style={{ position: 'absolute', left: 70, top: 158, width: 1780, height: 846 }}>
                {/* Header 3 cột phân vùng */}
                {[
                    { x: 0, w: 330, label: '1 · HỆ THỐNG NGUỒN', icon: 'database' as IconKind },
                    { x: 390, w: 430, label: '2 · TẦNG DATA MART', icon: 'shield' as IconKind },
                    { x: 880, w: 900, label: '3 · TẦNG BÁO CÁO & NGƯỜI DÙNG', icon: 'barChart' as IconKind },
                ].map((col, idx) => (
                    <div key={idx} style={{
                        position: 'absolute', left: col.x, top: 0, width: col.w, height: 846,
                        borderRadius: 24, background: '#E5E0F7',
                        border: '1.5px solid #C9BFEE',
                        boxShadow: '0 12px 36px rgba(34,26,102,0.08)',
                    }}>
                        <div style={{
                            position: 'absolute', left: 22, top: 16,
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '5px 14px', borderRadius: 99, background: '#FFFFFF', border: '1.5px solid #CFC6F5',
                            fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#5B3FD6', letterSpacing: 0.8,
                        }}>
                            <Ico k={col.icon} size={16} color="#5B3FD6" />
                            {col.label}
                        </div>
                    </div>
                ))}

                {/* =========================================================
                    NỬA TRÊN: CÁCH LÀM TRUYỀN THỐNG (VISUAL FLOW)
                   ========================================================= */}
                <div style={{
                    position: 'absolute', left: 24, top: 64,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 16px', borderRadius: 99, background: '#FEF3C7', border: '1.5px solid #F59E0B',
                    fontFamily: FONT, fontSize: 18, fontWeight: 800, color: '#9A3412',
                }}>
                    Cách truyền thống
                </div>

                {/* 3 nút nguồn */}
                <div style={{ position: 'absolute', left: 24, top: 116, width: 282, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <ServerNode label="Core T24" p={s1} tone="old" />
                    <ServerNode label="Hệ thống Tx" p={s2} tone="old" />
                    <ServerNode label="Nguồn khác" p={s3} tone="old" />
                </div>

                {/* Khối cảnh báo trống Tầng Data Mart đặt dưới 3 mũi tên đi xuyên qua */}
                <div style={{
                    position: 'absolute', left: 425, top: 282, width: 360, height: 92,
                    borderRadius: 18, border: '2px dashed #F59E0B', background: 'rgba(254,243,199,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 18px', boxSizing: 'border-box',
                    opacity: Math.min(1, gapPop * 1.8), transform: `scale(${0.9 + 0.1 * gapPop})`,
                }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 22, background: '#FEF3C7', border: '2px solid #F59E0B',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Ico k="x" size={22} color="#B45309" stroke={3} />
                    </div>
                    <div>
                        <div style={{ fontFamily: FONT, fontSize: 19, fontWeight: 800, color: '#9A3412', whiteSpace: 'nowrap' }}>
                            Thiếu tầng Data Mart
                        </div>
                        <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#B45309', whiteSpace: 'nowrap' }}>
                            Dữ liệu phân tán, tự làm sạch
                        </div>
                    </div>
                </div>

                {/* Đường bắn thẳng lộn xộn qua vùng trống phía trên */}
                <svg width={1780} height={410} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
                    <defs>
                        <marker id="arrAmber" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                            <path d="M0,0 L8,4 L0,8 Z" fill="#D97706" />
                        </marker>
                    </defs>
                    {[145, 205, 262].map((y, idx) => {
                        const xEnd = 306 + (912 - 306) * tradLineP
                        return tradLineP > 0.02 ? (
                            <g key={idx}>
                                <line
                                    x1={306} y1={y} x2={xEnd} y2={y}
                                    stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="8 6"
                                    strokeDashoffset={dashOffset}
                                    markerEnd={tradLineP > 0.92 ? 'url(#arrAmber)' : undefined}
                                />
                            </g>
                        ) : null
                    })}
                    {rmsToUserP > 0.02 && (
                        <line
                            x1={1290} y1={217}
                            x2={1290 + (1425 - 1290) * rmsToUserP} y2={217}
                            stroke="#D97706" strokeWidth="3" strokeDasharray="8 6"
                            strokeDashoffset={dashOffset}
                            markerEnd={rmsToUserP > 0.92 ? 'url(#arrAmber)' : undefined}
                        />
                    )}
                </svg>

                {/* Chồng thẻ 200+ Báo cáo trên RMS (xoè cánh quạt trực quan) */}
                <div style={{
                    position: 'absolute', left: 918, top: 106, width: 368, height: 224,
                    opacity: Math.min(1, rmsPop * 1.8), transform: `scale(${0.9 + 0.1 * rmsPop})`,
                }}>
                    <div style={{
                        position: 'absolute', left: 18, top: -12, width: 346, height: 214,
                        borderRadius: 20, background: '#FEF3C7', border: '2px solid #FCD34D',
                        transform: 'rotate(3deg)',
                    }} />
                    <div style={{
                        position: 'absolute', left: 9, top: -6, width: 346, height: 214,
                        borderRadius: 20, background: '#FFFBEB', border: '2px solid #F59E0B',
                        transform: 'rotate(1.4deg)',
                    }} />
                    <div style={{
                        position: 'absolute', left: 0, top: 0, width: 346, height: 214,
                        borderRadius: 20, background: '#FFFFFF', border: '2.5px solid #D97706',
                        padding: '20px 22px', boxSizing: 'border-box',
                        boxShadow: '0 14px 32px rgba(180,83,9,0.12)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{
                                width: 46, height: 46, borderRadius: 14, background: '#FEF3C7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Ico k="table" size={24} color="#B45309" />
                            </span>
                            <div>
                                <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: INK }}>Báo cáo trên RMS</div>
                                <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 800, color: '#D97706' }}>200+ báo cáo trùng lặp</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
                            {['CASA mẫu 1', 'CASA mẫu 2', 'FD mẫu 1', 'FD mẫu 2', '+196 mẫu...'].map((m, i) => (
                                <span key={m} style={{
                                    padding: '5px 12px', borderRadius: 10,
                                    background: i === 4 ? '#FEF3C7' : '#F8FAFC',
                                    border: `1.5px solid ${i === 4 ? '#F59E0B' : '#E2E8F0'}`,
                                    fontFamily: FONT, fontSize: 15.5, fontWeight: 700,
                                    color: i === 4 ? '#9A3412' : '#475569',
                                }}>
                                    {m}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Khối Laptop cá nhân: User tự chế biến lại bằng Excel / Code local */}
                <div style={{
                    position: 'absolute', left: 1432, top: 116, width: 316, height: 202,
                    borderRadius: 20, background: '#FFFFFF', border: '2.5px solid #EF4444',
                    padding: '20px 22px', boxSizing: 'border-box',
                    boxShadow: '0 14px 32px rgba(239,68,68,0.12)',
                    opacity: Math.min(1, userPop * 1.8), transform: `scale(${0.9 + 0.1 * userPop})`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                            width: 46, height: 46, borderRadius: 14, background: '#FEE2E2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Ico k="fileSheet" size={24} color="#DC2626" />
                        </span>
                        <div>
                            <div style={{ fontFamily: FONT, fontSize: 21, fontWeight: 800, color: INK }}>Xử lý thêm ở ngoài</div>
                            <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#DC2626' }}>Trên máy cá nhân</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {['File Excel rời', 'Code local'].map(t => (
                            <span key={t} style={{
                                flex: 1, textAlign: 'center', padding: '8px 10px', borderRadius: 12,
                                background: '#FEF2F2', border: '1.5px solid #FCA5A5',
                                fontFamily: FONT, fontSize: 16, fontWeight: 800, color: '#B91C1C',
                            }}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* =========================================================
                    ĐƯỜNG PHÂN TÁCH GIỮA 2 THẾ GIỚI
                   ========================================================= */}
                <div style={{
                    position: 'absolute', left: 0, top: 412, width: 1780 * newIn, height: 0,
                    borderTop: '2.5px dashed rgba(109,93,246,0.45)', opacity: newIn,
                }} />

                {/* =========================================================
                    NỬA DƯỚI: CÓ SEMANTIX (CHUẨN HOÁ & END-TO-END)
                   ========================================================= */}
                <div style={{ position: 'absolute', left: 0, top: 432, width: 1780, height: 414, opacity: newIn }}>
                    <div style={{
                        position: 'absolute', left: 24, top: 14,
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px', borderRadius: 99, background: GRAD_H,
                        fontFamily: FONT, fontSize: 18, fontWeight: 800, color: '#FFFFFF',
                        boxShadow: '0 8px 20px rgba(109,93,246,0.25)',
                    }}>
                        <Ico k="sparkles" size={18} color="#fff" />
                        Cách làm mới trên {BRAND}
                    </div>

                    {/* 3 nút nguồn */}
                    <div style={{ position: 'absolute', left: 24, top: 68, width: 282, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <ServerNode label="Core T24" p={ns1} tone="new" />
                        <ServerNode label="Hệ thống Tx" p={ns2} tone="new" />
                        <ServerNode label="Nguồn khác" p={ns3} tone="new" />
                    </div>

                    {/* Đường nối hội tụ mượt mà vào Data Mart -> Semantix */}
                    <svg width={1780} height={380} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
                        <defs>
                            <marker id="arrViolet" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                                <path d="M0,0 L8,4 L0,8 Z" fill="#6D5DF6" />
                            </marker>
                        </defs>
                        {toMartP > 0.02 && (
                            <g opacity={toMartP}>
                                <path d="M 306 97 L 366 97 L 366 241 L 306 241" stroke="#6D5DF6" strokeWidth="2.8" fill="none" />
                                <line x1={306} y1={169} x2={366} y2={169} stroke="#6D5DF6" strokeWidth="2.8" />
                                <line x1={366} y1={122} x2={418} y2={122} stroke="#6D5DF6" strokeWidth="2.8" markerEnd="url(#arrViolet)" />
                                <line x1={366} y1={232} x2={418} y2={232} stroke="#6D5DF6" strokeWidth="2.8" markerEnd="url(#arrViolet)" />
                            </g>
                        )}
                        {toSemP > 0.02 && (
                            <g opacity={toSemP}>
                                <path d="M 790 122 L 848 122 L 848 232 L 790 232" stroke="#6D5DF6" strokeWidth="2.8" fill="none" />
                                <line x1={848} y1={177} x2={908} y2={177} stroke="#6D5DF6" strokeWidth="3.2" markerEnd="url(#arrViolet)" />
                            </g>
                        )}
                    </svg>

                    {/* 2 khối Data Mart chuẩn hoá */}
                    {[
                        { top: 68, title: 'Domain Mart', sub: 'CASA · FD · Thẻ', p: mart1Pop, color: '#2563EB', bg: '#EFF6FF' },
                        { top: 180, title: 'Division Mart', sub: 'Rủi ro · Tài chính', p: mart2Pop, color: '#6D5DF6', bg: '#F5F3FF' },
                    ].map(m => (
                        <div key={m.title} style={{
                            position: 'absolute', left: 425, top: m.top, width: 360, height: 96,
                            borderRadius: 18, background: '#FFFFFF', border: `2.5px solid ${m.color}`,
                            padding: '0 22px', display: 'flex', alignItems: 'center', gap: 16, boxSizing: 'border-box',
                            boxShadow: '0 12px 28px rgba(37,99,235,0.1)',
                            opacity: Math.min(1, m.p * 1.8), transform: `scale(${0.9 + 0.1 * m.p})`,
                        }}>
                            <span style={{
                                width: 50, height: 50, borderRadius: 14, background: m.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Ico k="database" size={26} color={m.color} />
                            </span>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontFamily: FONT, fontSize: 21, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{m.title}</div>
                                <div style={{ fontFamily: FONT, fontSize: 16.5, fontWeight: 700, color: C.steel, marginTop: 2, whiteSpace: 'nowrap' }}>{m.sub}</div>
                            </div>
                            <span style={{
                                marginLeft: 'auto', width: 32, height: 32, borderRadius: 16,
                                background: '#E6F6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Ico k="check" size={18} color={C.emerald} stroke={3} />
                            </span>
                        </div>
                    ))}

                    {/* Khối trung tâm: Báo cáo End-to-End trên Semantix */}
                    <div style={{
                        position: 'absolute', left: 918, top: 68, width: 830, height: 220,
                        borderRadius: 24, background: '#FFFFFF', border: `3px solid ${C.violet}`,
                        padding: '22px 28px', boxSizing: 'border-box',
                        boxShadow: '0 20px 50px rgba(109,93,246,0.16)',
                        opacity: Math.min(1, semPop * 1.8), transform: `scale(${0.92 + 0.08 * semPop})`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{
                                    width: 44, height: 44, borderRadius: 14, background: GRAD,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Ico k="sparkles" size={24} color="#fff" />
                                </span>
                                <span style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>
                                    Báo cáo End-to-End trên {BRAND}
                                </span>
                            </div>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '6px 16px', borderRadius: 99, background: '#E6F6EE',
                                fontFamily: FONT, fontSize: 16, fontWeight: 800, color: C.emerald, whiteSpace: 'nowrap',
                            }}>
                                <Ico k="check" size={18} color={C.emerald} stroke={3} />
                                Trọn vẹn trên 1 hệ thống
                            </span>
                        </div>

                        {/* 3 trụ cột trực quan */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            {([
                                ['badgeCheck', 'Tầng ngữ nghĩa', 'Chuẩn dùng chung', '#F5F3FF', '#5B3FD6'],
                                ['chat', 'AI tạo báo cáo', 'Hỏi bằng tiếng Việt', '#EFF6FF', '#1D4ED8'],
                                ['fileSheet', 'Lưu Template', 'Tự động xuất kỳ sau', '#E6F6EE', '#0E7A5F'],
                            ] as const).map(([ic, title, sub, bg, fg]) => (
                                <div key={title} style={{
                                    padding: '14px 16px', borderRadius: 16, background: bg,
                                    border: `1.5px solid ${fg}33`, display: 'flex', alignItems: 'center', gap: 12,
                                }}>
                                    <span style={{
                                        width: 42, height: 42, borderRadius: 12, background: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Ico k={ic} size={22} color={fg} />
                                    </span>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{title}</div>
                                        <div style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: fg, marginTop: 2, whiteSpace: 'nowrap' }}>{sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Tag text={`So sánh Kiến trúc Dữ liệu · Trước và sau khi có ${BRAND}`} />
        </Stage>
    )
}

/** Nút bước trong sơ đồ Swimlane Quy trình (Thiết kế giàu hình ảnh, ít chữ). */
const FlowNode: React.FC<{
    x: number
    y: number
    w?: number
    h?: number
    tone: 'old' | 'new' | 'support'
    icon: IconKind
    step?: string
    title: string
    sub: string
    p: number
}> = ({ x, y, w = 258, h = 104, tone, icon, step, title, sub, p }) => {
    const cfg = {
        old: { border: '#F59E0B', iconBg: '#FEF3C7', iconFg: '#B45309', pillBg: '#FFFBEB' },
        new: { border: '#6D5DF6', iconBg: '#EFEAFE', iconFg: '#5B3FD6', pillBg: '#F5F3FF' },
        support: { border: '#60A5FA', iconBg: '#EFF6FF', iconFg: '#1D4ED8', pillBg: '#EFF6FF' },
    }[tone]

    return (
        <div style={{
            position: 'absolute', left: x, top: y, width: w, height: h,
            borderRadius: 18, background: '#FFFFFF', border: `2px solid ${cfg.border}`,
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxSizing: 'border-box',
            boxShadow: tone === 'new'
                ? '0 12px 28px rgba(109,93,246,0.14)'
                : '0 8px 20px rgba(15,23,42,0.06)',
            opacity: Math.min(1, p * 1.8), transform: `scale(${0.88 + 0.12 * p})`,
        }}>
            <span style={{
                width: 48, height: 48, borderRadius: 14, background: tone === 'new' ? GRAD : cfg.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <Ico k={icon} size={24} color={tone === 'new' ? '#fff' : cfg.iconFg} />
            </span>
            <div style={{ minWidth: 0 }}>
                {step && (
                    <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: cfg.iconFg, letterSpacing: 0.6 }}>
                        {step}
                    </div>
                )}
                <div style={{ fontFamily: FONT, fontSize: 17.5, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>
                    {title}
                </div>
                <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.steel, marginTop: 2, whiteSpace: 'nowrap' }}>
                    {sub}
                </div>
            </div>
        </div>
    )
}

/** Nhãn đầu làn (icon + tên vai + vai trò); tên dài như "Team Data/Tech" tự xuống dòng trong cột nhãn. */
const LaneLabel: React.FC<{ top: number; h: number; icon: IconKind; iconBg: string; iconFg: string; title: string; sub: string; subColor: string }> = ({ top, h, icon, iconBg, iconFg, title, sub, subColor }) => (
    <div style={{ position: 'absolute', left: 22, top, height: h, width: 196, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 46, height: 46, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ico k={icon} size={24} color={iconFg} />
        </span>
        <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: INK, lineHeight: 1.15 }}>{title}</div>
            <div style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: subColor, marginTop: 2, lineHeight: 1.2 }}>{sub}</div>
        </div>
    </div>
)

/** Dải chú thích dưới mỗi quy trình (cảnh báo ở quy trình cũ, kết luận ở quy trình mới). */
const NoteBar: React.FC<{ top: number; p: number; tone: 'warn' | 'ok'; text: string }> = ({ top, p, tone, text }) => {
    const warn = tone === 'warn'
    return (
        <div style={{
            position: 'absolute', left: 0, top, width: 1780, height: 48, boxSizing: 'border-box',
            borderRadius: 14, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 12,
            background: warn ? '#FFF6E0' : '#F3F0FF', border: `1.5px solid ${warn ? '#F0CF6E' : '#B6A5FA'}`,
            opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 10}px)`,
        }}>
            <Ico k={warn ? 'shieldAlert' : 'badgeCheck'} size={24} color={warn ? '#B45309' : '#5B3FD6'} />
            <span style={{ fontFamily: FONT, fontSize: 19, fontWeight: 700, color: INK }}>{text}</span>
        </div>
    )
}

/**
 * Màn 2 (`CompareAfterScene`):
 * Sơ đồ Swimlane Quy trình — Từ Quy trình phát triển chờ team Data/Tech sang Self-service trên Semantix.
 * Quy trình cũ có hai vòng lặp: Làm rõ yêu cầu ⇄ Phát triển (chấm chạy qua lại) và Nghiệm thu ⇢ Làm rõ (gap lộ ra ở UAT).
 */
export const CompareAfterScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()

    const o1 = popAt(f, CMP_AFTER.oldStep1, fps)
    const o2 = popAt(f, CMP_AFTER.oldStep2, fps)
    const o3 = popAt(f, CMP_AFTER.oldStep3, fps)
    const o4 = popAt(f, CMP_AFTER.oldStep4, fps)
    const oC = popAt(f, CMP_AFTER.oldClarify, fps)
    const o5 = popAt(f, CMP_AFTER.oldStep5, fps)
    const oR = popAt(f, CMP_AFTER.oldRework, fps)
    const o6 = popAt(f, CMP_AFTER.oldStep6, fps)
    const oW = popAt(f, CMP_AFTER.oldWarn, fps)

    const newIn = ease(f, [CMP_AFTER.newStart - 6, CMP_AFTER.newStart + 12], [0, 1])
    const nIt1 = popAt(f, CMP_AFTER.newIt1, fps)
    const nU1 = popAt(f, CMP_AFTER.newUser1, fps)
    const nU2 = popAt(f, CMP_AFTER.newUser2, fps)
    const nU3 = popAt(f, CMP_AFTER.newUser3, fps)
    const nU4 = popAt(f, CMP_AFTER.newUser4, fps)
    const nSup = popAt(f, CMP_AFTER.newSupport, fps)
    const nNote = popAt(f, CMP_AFTER.newNote, fps)

    const c1 = 230
    const c2 = 540
    const c3 = 850
    const c4 = 1160
    const c5 = 1470
    const boxW = 262
    const boxH = 100

    // Hai làn trong mỗi khối: làn trên (User) và làn dưới (team Data/Tech); thẻ nằm giữa làn.
    const laneH = 136
    const laneU = 46
    const laneD = 194
    const yU = laneU + (laneH - boxH) / 2
    const yD = laneD + (laneH - boxH) / 2
    const midU = yU + boxH / 2
    const midD = yD + boxH / 2
    const noteTop = laneD + laneH + 12

    const pulse = 0.5 + 0.5 * Math.sin(f / 6)

    // Chấm chạy qua lại giữa Làm rõ yêu cầu (trên) và Phát triển (dưới): xuống theo mũi trái, lên theo mũi phải.
    const pingX = c3 + boxW / 2
    const pingTop = yU + boxH + 4
    const pingBot = yD - 4
    const pingPeriod = 36
    const pingT = ((f - CMP_AFTER.oldClarify) % pingPeriod + pingPeriod) % pingPeriod / pingPeriod
    const pingDown = pingT < 0.5
    const pingY = pingDown
        ? interpolate(pingT, [0, 0.5], [pingTop, pingBot])
        : interpolate(pingT, [0.5, 1], [pingBot, pingTop])

    return (
        <Stage>
            <Headline
                text="Quy trình cũ: Qua lại nhiều vòng, chờ team Data/Tech xếp lịch"
                at={0}
                out={CMP_AFTER.newStart - 6}
                size={fit('Quy trình cũ: Qua lại nhiều vòng, chờ team Data/Tech xếp lịch', 84)}
                top={46}
                accent={['Qua lại nhiều vòng']}
            />
            <Headline
                text="Quy trình mới: Nghiệp vụ làm chủ, team Data/Tech hỗ trợ nền tảng"
                at={CMP_AFTER.newStart}
                size={fit('Quy trình mới: Nghiệp vụ làm chủ, team Data/Tech hỗ trợ nền tảng', 84)}
                top={46}
                accent={['Nghiệp vụ làm chủ']}
            />

            {/* =========================================================
                KHỐI 1: QUY TRÌNH CŨ (CHỜ TEAM DATA/TECH PHÁT TRIỂN)
               ========================================================= */}
            <div style={{ position: 'absolute', left: 70, top: 152, width: 1780, height: noteTop + 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <span style={{
                        padding: '5px 16px', borderRadius: 99, background: '#FEF3C7', border: '1.5px solid #F59E0B',
                        fontFamily: FONT, fontSize: 18, fontWeight: 800, color: '#9A3412',
                    }}>
                        Quy trình cũ · Theo luồng phát triển của team Data/Tech
                    </span>
                    {o6 > 0.2 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 14px', borderRadius: 99, background: '#FEE2E2', color: '#DC2626',
                            fontFamily: FONT, fontSize: 16, fontWeight: 800,
                        }}>
                            <Ico k="clock" size={16} color="#DC2626" />
                            Mất nhiều ngày chờ đợi
                        </span>
                    )}
                </div>

                {/* Swimlane User */}
                <div style={{
                    position: 'absolute', left: 0, top: laneU, width: 1780, height: laneH,
                    borderRadius: 20, background: '#FBEFC6', border: '1.5px solid #F0CF6E',
                }} />
                <LaneLabel top={laneU} h={laneH} icon="userCheck" iconBg="#FFFFFF" iconFg="#9A3412" title="User" sub="Bên yêu cầu" subColor="#9A3412" />

                {/* Swimlane team Data/Tech */}
                <div style={{
                    position: 'absolute', left: 0, top: laneD, width: 1780, height: laneH,
                    borderRadius: 20, background: '#FBEFC6', border: '1.5px solid #F0CF6E',
                }} />
                <LaneLabel top={laneD} h={laneH} icon="users" iconBg="#FFFFFF" iconFg="#9A3412" title="Team Data/Tech" sub="Bên phát triển" subColor="#9A3412" />

                {/* Ô chờ: chờ xếp backlog (làn User) nhấp nháy, chờ nghiệm thu (làn dưới) */}
                <div style={{
                    position: 'absolute', left: c2, top: yU, width: boxW, height: boxH, boxSizing: 'border-box',
                    borderRadius: 18, border: '2px dashed #EF4444', padding: '0 16px',
                    background: `rgba(254,226,226,${0.45 + 0.25 * pulse})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    opacity: Math.min(1, o3 * 1.8),
                }}>
                    <Ico k="clock" size={24} color="#DC2626" />
                    <span style={{ fontFamily: FONT, fontSize: 17.5, fontWeight: 800, color: '#B91C1C', lineHeight: 1.25 }}>
                        Chờ team Data/Tech<br />xếp backlog
                    </span>
                </div>

                <div style={{
                    position: 'absolute', left: c4, top: yD, width: boxW, height: boxH, boxSizing: 'border-box',
                    borderRadius: 18, border: '2px dashed #D97706', background: 'rgba(254,243,199,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    opacity: Math.min(1, o5 * 1.8),
                }}>
                    <Ico k="clock" size={22} color="#B45309" />
                    <span style={{ fontFamily: FONT, fontSize: 17.5, fontWeight: 800, color: '#9A3412' }}>
                        Chờ user nghiệm thu
                    </span>
                </div>

                {/* 7 bước: hai vòng lặp Làm rõ ⇄ Phát triển và Nghiệm thu ⇢ Làm rõ */}
                <FlowNode x={c1} y={yU} w={boxW} h={boxH} tone="old" p={o1} icon="send" title="Đưa yêu cầu" sub="Báo cáo mới" />
                <FlowNode x={c1} y={yD} w={boxW} h={boxH} tone="old" p={o2} icon="inbox" title="Nhận yêu cầu" sub="Từ nghiệp vụ" />
                <FlowNode x={c2} y={yD} w={boxW} h={boxH} tone="old" p={o3} icon="history" title="Xếp backlog" sub="Chờ nguồn lực" />
                <FlowNode x={c3} y={yD} w={boxW} h={boxH} tone="old" p={o4} icon="table" title="Phát triển" sub="Phân tích & code" />
                <FlowNode x={c3} y={yU} w={boxW} h={boxH} tone="old" p={oC} icon="chat" title="Làm rõ yêu cầu" sub="Hỏi lại nhiều vòng" />
                <FlowNode x={c4} y={yU} w={boxW} h={boxH} tone="old" p={o5} icon="badgeCheck" title="Nghiệm thu" sub="Gap lộ ra, làm lại" />
                <FlowNode x={c5} y={yD} w={boxW} h={boxH} tone="old" p={o6} icon="play" title="Go-live" sub="Đưa vào dùng" />

                <svg width={1780} height={noteTop} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
                    <defs>
                        <marker id="arrOldFlow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                            <path d="M0,0 L8,4 L0,8 Z" fill="#D97706" />
                        </marker>
                        <marker id="arrOldBack" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                            <path d="M0,0 L8,4 L0,8 Z" fill="#DC2626" />
                        </marker>
                    </defs>
                    {o2 > 0.1 && <line x1={c1 + boxW / 2} y1={yU + boxH} x2={c1 + boxW / 2} y2={yD - 6} stroke="#D97706" strokeWidth="2.4" markerEnd="url(#arrOldFlow)" opacity={o2} />}
                    {o3 > 0.1 && <line x1={c1 + boxW} y1={midD} x2={c2 - 6} y2={midD} stroke="#D97706" strokeWidth="2.4" markerEnd="url(#arrOldFlow)" opacity={o3} />}
                    {o4 > 0.1 && <line x1={c2 + boxW} y1={midD} x2={c3 - 6} y2={midD} stroke="#D97706" strokeWidth="2.4" markerEnd="url(#arrOldFlow)" opacity={o4} />}
                    {/* Làm rõ ⇄ Phát triển: mũi xuống bên trái, mũi lên bên phải, chấm chạy qua lại */}
                    {oC > 0.1 && (
                        <g opacity={oC}>
                            <line x1={pingX - 30} y1={pingTop} x2={pingX - 30} y2={pingBot - 4} stroke="#D97706" strokeWidth="2.4" markerEnd="url(#arrOldFlow)" />
                            <line x1={pingX + 30} y1={pingBot} x2={pingX + 30} y2={pingTop + 4} stroke="#D97706" strokeWidth="2.4" markerEnd="url(#arrOldFlow)" />
                            <circle cx={pingDown ? pingX - 30 : pingX + 30} cy={pingY} r={5.5} fill="#DC2626" />
                        </g>
                    )}
                    {o5 > 0.1 && <path d={`M ${c3 + boxW} ${midD} L ${c4 - 22} ${midD} L ${c4 - 22} ${yU + 74} L ${c4 - 6} ${yU + 74}`} stroke="#D97706" strokeWidth="2.4" fill="none" markerEnd="url(#arrOldFlow)" opacity={o5} />}
                    {/* Nghiệm thu ⇢ Làm rõ: gap lộ ra ở UAT, quay lại vòng làm rõ */}
                    {oR > 0.1 && <line x1={c4} y1={yU + 26} x2={c3 + boxW + 6} y2={yU + 26} stroke="#DC2626" strokeWidth="2.6" strokeDasharray="6 5" strokeDashoffset={-f * 0.6} markerEnd="url(#arrOldBack)" opacity={oR} />}
                    {o6 > 0.1 && <path d={`M ${c4 + boxW} ${midU} L ${c5 - 22} ${midU} L ${c5 - 22} ${midD} L ${c5 - 6} ${midD}`} stroke="#D97706" strokeWidth="2.4" fill="none" markerEnd="url(#arrOldFlow)" opacity={o6} />}
                </svg>

                <NoteBar top={noteTop} p={oW} tone="warn" text="Phân tích nghiệp vụ phải trao đổi qua lại nhiều vòng, tốn thời gian; dù vậy vẫn có thể còn gap, đến UAT mới phát hiện" />
            </div>

            {/* =========================================================
                KHỐI 2: QUY TRÌNH MỚI (SELF-SERVICE TRÊN SEMANTIX)
               ========================================================= */}
            <div style={{ position: 'absolute', left: 70, top: 556, width: 1780, height: noteTop + 48, opacity: newIn }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <span style={{
                        padding: '5px 16px', borderRadius: 99, background: GRAD_H,
                        fontFamily: FONT, fontSize: 18, fontWeight: 800, color: '#FFFFFF',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                    }}>
                        <Ico k="sparkles" size={18} color="#fff" />
                        Quy trình mới · Self-service trên {BRAND}
                    </span>
                    {nU4 > 0.2 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 14px', borderRadius: 99, background: '#E6F6EE', color: C.emerald,
                            fontFamily: FONT, fontSize: 16, fontWeight: 800,
                        }}>
                            <Ico k="check" size={16} color={C.emerald} stroke={3} />
                            User làm chủ hoàn toàn · Chủ động trong vài phút
                        </span>
                    )}
                </div>

                {/* Swimlane User (Owner) */}
                <div style={{
                    position: 'absolute', left: 0, top: laneU, width: 1780, height: laneH,
                    borderRadius: 20, background: '#E7E1FD', border: '2px solid #B6A5FA',
                }} />
                <LaneLabel top={laneU} h={laneH} icon="userCheck" iconBg={GRAD} iconFg="#fff" title="User" sub="Owner làm chủ" subColor="#5B3FD6" />

                {/* Swimlane team Data/Tech · CĐS (Hỗ trợ) */}
                <div style={{
                    position: 'absolute', left: 0, top: laneD, width: 1780, height: laneH,
                    borderRadius: 20, background: '#E0ECFD', border: '1.5px solid #A8C8F6',
                }} />
                <LaneLabel top={laneD} h={laneH} icon="shield" iconBg="#FFFFFF" iconFg="#1D4ED8" title="Team Data/Tech" sub="& CĐS hỗ trợ" subColor="#1D4ED8" />

                {/* Các bước thẳng mạch của User Owner */}
                <FlowNode x={c1} y={yD} w={boxW} h={boxH} tone="support" p={nIt1} icon="database" title="Kết nối Data Mart" sub="Bảng & quan hệ" />
                <FlowNode x={c2} y={yU} w={boxW} h={boxH} tone="new" p={nU1} step="BƯỚC 1" icon="sparkles" title="Khai báo ngữ nghĩa" sub="Chỉ tiêu, công thức" />
                <FlowNode x={c3} y={yU} w={boxW} h={boxH} tone="new" p={nU2} step="BƯỚC 2" icon="chat" title="Prompt yêu cầu" sub="Hỏi bằng tiếng Việt" />
                <FlowNode x={c4} y={yU} w={boxW} h={boxH} tone="new" p={nU3} step="BƯỚC 3" icon="bot" title="AI dựng báo cáo" sub="Ra bảng & biểu đồ" />
                <FlowNode x={c5} y={yU} w={boxW} h={boxH} tone="new" p={nU4} step="BƯỚC 4" icon="fileSheet" title="Save Template" sub="Tái sử dụng mọi kỳ" />

                {/* 2 bước hỗ trợ nền của team Data/Tech · CĐS */}
                <FlowNode x={c2} y={yD} w={boxW} h={boxH} tone="support" p={nSup} icon="shield" title="Verify logic" sub="Rà tình huống biên" />
                <FlowNode x={c5} y={yD} w={boxW} h={boxH} tone="support" p={nSup} icon="lock" title="Vận hành hệ thống" sub="An toàn & phân quyền" />

                <svg width={1780} height={noteTop} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
                    <defs>
                        <marker id="arrNewFlow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                            <path d="M0,0 L8,4 L0,8 Z" fill="#6D5DF6" />
                        </marker>
                    </defs>
                    {nU1 > 0.1 && <path d={`M ${c1 + boxW} ${midD} L ${c2 - 22} ${midD} L ${c2 - 22} ${midU} L ${c2 - 6} ${midU}`} stroke="#6D5DF6" strokeWidth="2.8" fill="none" markerEnd="url(#arrNewFlow)" opacity={nU1} />}
                    {nU2 > 0.1 && <line x1={c2 + boxW} y1={midU} x2={c3 - 6} y2={midU} stroke="#6D5DF6" strokeWidth="3" markerEnd="url(#arrNewFlow)" opacity={nU2} />}
                    {nU3 > 0.1 && <line x1={c3 + boxW} y1={midU} x2={c4 - 6} y2={midU} stroke="#6D5DF6" strokeWidth="3" markerEnd="url(#arrNewFlow)" opacity={nU3} />}
                    {nU4 > 0.1 && <line x1={c4 + boxW} y1={midU} x2={c5 - 6} y2={midU} stroke="#6D5DF6" strokeWidth="3" markerEnd="url(#arrNewFlow)" opacity={nU4} />}
                    {nSup > 0.1 && (
                        <>
                            <line x1={c2 + boxW / 2} y1={yU + boxH} x2={c2 + boxW / 2} y2={yD} stroke="#3B82F6" strokeWidth="2.4" strokeDasharray="6 5" opacity={nSup} />
                            <line x1={c5 + boxW / 2} y1={yU + boxH} x2={c5 + boxW / 2} y2={yD} stroke="#3B82F6" strokeWidth="2.4" strokeDasharray="6 5" opacity={nSup} />
                        </>
                    )}
                </svg>

                <NoteBar top={noteTop} p={nNote} tone="ok" text="User nắm rõ yêu cầu của chính mình nên tự làm trực tiếp: không cần trao đổi qua lại, không còn gap phát hiện muộn ở UAT" />
            </div>

            <Tag text={`So sánh Quy trình · Từ chờ team Data/Tech phát triển sang Self-service trên ${BRAND}`} />
        </Stage>
    )
}
