import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { LogoReveal } from '../components/LogoReveal'
import { LogoWordmark } from '../components/Logo'
import { CLAMP, ease, Headline, INK, panelStyle, Stage, useEdition } from './kit'

const MONO = 'Consolas, "Courier New", monospace'
const FILES = [
    'PhuongAnPhu', 'PhuongBinhMinh', 'PhuongDongHai', 'PhuongHoaBinh', 'PhuongLeLoi', 'PhuongNamSon',
    'ThitranVinhAn', 'XaDaiDong', 'XaMinhKhai', 'XaPhuCuong', 'XaSongTra', 'XaTanLap',
]
// nhanh dần (R2): khoảng cách giữa các phần tử co lại
const accel = (n: number, first = 7, last = 2) =>
    Array.from({ length: n }, (_, i) => i).reduce<number[]>((acc, i) => {
        const gap = first - (first - last) * (i / Math.max(1, n - 1))
        acc.push(i === 0 ? 0 : acc[i - 1] + gap)
        return acc
    }, []).map(Math.round)

const ExcelIcon: React.FC<{ size?: number }> = ({ size = 34 }) => (
    <div style={{
        width: size, height: size, borderRadius: size * 0.24, background: '#1D6F42', color: '#fff', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.58, fontWeight: 800,
    }}>X</div>
)

/** 1 — Nỗi đau: hàng chục file, mỗi đơn vị một mẫu, một đêm đối chiếu. 270f */
// Lịch bóc vắt qua kỳ chốt quý 3: 25/9 (Thứ Sáu) → 5/10 (Thứ Hai), đổi tháng khi sang 01
const CAL_DAYS: [string, string, number][] = [
    ['25', 'Thứ Sáu', 9], ['26', 'Thứ Bảy', 9], ['27', 'Chủ Nhật', 9], ['28', 'Thứ Hai', 9], ['29', 'Thứ Ba', 9], ['30', 'Thứ Tư', 9],
    ['01', 'Thứ Năm', 10], ['02', 'Thứ Sáu', 10], ['03', 'Thứ Bảy', 10], ['04', 'Chủ Nhật', 10], ['05', 'Thứ Hai', 10],
]
// nhịp lật: chậm → nhanh → chậm (khoảng cách 10·7·5·4·3·3·4·5·7·10 khung), tờ lật nhanh thì lật gọn hơn
const CAL_GAPS = [10, 7, 5, 4, 3, 3, 4, 5, 7]
export const CAL_FLIPS = CAL_GAPS.reduce<number[]>((acc, g) => [...acc, acc[acc.length - 1] + g], [210])
const CAL_DUR = [10, 8, 7, 6, 5, 5, 6, 7, 8, 10]
export const HookScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const cues = accel(12, 6, 2).map(c => c + 52)
    const out = ease(f, [188, 202], [0, 1])
    const headersIn = ease(f, [134, 146], [0, 1])
    const cal = spring({ frame: f - 204, fps, config: { damping: 16, stiffness: 150 } })
    return (
        <Stage>
            <Headline text="Cuối kỳ báo cáo" at={0} out={46} size={140} top={420} accent={['báo cáo']} />
            <Headline text="Hàng chục file Excel" at={44} out={124} size={104} top={80} accent={['Excel']} />
            <Headline text="Mỗi đơn vị một mẫu" at={124} out={192} size={104} top={80} accent={['một mẫu']} />
            {f >= 48 && f < 204 && (
                <div style={{
                    position: 'absolute', left: 200, right: 200, top: 240, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
                    opacity: (1 - 0.6 * headersIn) * (1 - out), transform: `scale(${1 - 0.05 * out})`,
                }}>
                    {FILES.map((n, i) => {
                        const p = spring({ frame: f - cues[i], fps, config: { damping: 13, stiffness: 170 } })
                        return (
                            <div key={n} style={{
                                ...panelStyle, position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 16,
                                opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * -90}px) rotate(${((i % 3) - 1) * 1.5 * p}deg)`,
                            }}>
                                <ExcelIcon />
                                <span style={{ fontSize: 23, fontWeight: 600, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>BC_Thu_T09_{n}.xlsx</span>
                            </div>
                        )
                    })}
                </div>
            )}
            {f >= 128 && f < 204 && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', gap: 28, opacity: headersIn * (1 - out) }}>
                    {['so_thu_trieu_dong', 'Số thu (triệu đồng)', 'so_tien'].map((h, i) => {
                        const p = spring({ frame: f - 138 - i * 7, fps, config: { damping: 12, stiffness: 200 } })
                        return (
                            <div key={h} style={{
                                fontFamily: MONO, fontSize: 38, fontWeight: 700, padding: '16px 30px', borderRadius: 14,
                                color: i === 0 ? C.navy : C.red, background: i === 0 ? '#EEEBFF' : '#FDECEA',
                                border: `3px solid ${i === 0 ? '#CFC8FF' : C.red}`, transform: `scale(${p})`,
                            }}>{h}</div>
                        )
                    })}
                </div>
            )}
            <Headline text="Và nhiều ngày ngồi khớp số" at={196} size={104} top={120} accent={['khớp số']} />
            {f >= 202 && (
                <div style={{ position: 'absolute', left: 960 - 250, top: 330, width: 500, height: 600, perspective: 1600, opacity: Math.min(1, cal * 1.5), transform: `translateY(${(1 - cal) * 80}px) scale(${0.9 + 0.1 * cal})` }}>
                    {/* lịch bóc: từng tờ lật lên, nhanh dần, dừng ở ngày thứ 8 */}
                    {CAL_DAYS.map(([d, wd, mo], i) => {
                        const t = CAL_FLIPS[i]
                        const last = i === CAL_DAYS.length - 1
                        const dur = CAL_DUR[i] ?? 9
                        if (!last && f > t + dur) return null
                        const p = last ? 0 : ease(f, [t, t + dur], [0, 1], Easing.in(Easing.quad))
                        return (
                            <div key={d} style={{
                                position: 'absolute', inset: 0, zIndex: 100 - i, borderRadius: 26, overflow: 'hidden', background: '#fff',
                                boxShadow: last ? '0 30px 70px rgba(34,26,102,0.22)' : 'none', border: `1px solid ${C.rule}`, transformOrigin: 'top center',
                                transform: `rotateX(${-p * 100}deg)`, backfaceVisibility: "hidden", filter: `brightness(${1 - p * 0.45})`, opacity: p > 0.85 ? 0 : 1,
                            }}>
                                <div style={{ height: 130, background: 'linear-gradient(90deg, #6D5DF6, #E86FC6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, letterSpacing: '0.08em' }}>
                                    THÁNG {mo} · 2026
                                </div>
                                <div style={{ textAlign: 'center', fontSize: 280, fontWeight: 800, color: INK, lineHeight: 1.15, marginTop: 10 }}>{d}</div>
                                <div style={{ textAlign: 'center', fontSize: 46, fontWeight: 700, color: wd.startsWith('Thứ Bảy') || wd.startsWith('Chủ') ? C.red : C.steel }}>{wd}</div>
                            </div>
                        )
                    })}
                    {[140, 360].map(x => <div key={x} style={{ position: 'absolute', left: x - 12, top: -22, width: 24, height: 54, borderRadius: 12, background: '#D8D5F0', zIndex: 200, boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }} />)}
                </div>
            )}
        </Stage>
    )
}

/** 2 — Thương hiệu. 150f */
export const BrandScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const slide = spring({ frame: f - 70, fps, config: { damping: 200 } })
    const internal = useEdition() === 'internal'
    return (
        <Stage>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
                <LogoReveal size={230} />
                <div style={{ width: 900 * slide, marginLeft: -40 * (1 - slide), overflow: 'hidden' }}>
                    <LogoWordmark fontSize={150} mode="light" text={internal ? 'SEMANTIX' : 'SEMANIO'} letterProgress={(i, n) => ease(f, [74 + i * 3, 86 + i * 3], [0, 1])} />
                </div>
            </div>
            <Headline text={internal ? 'Một câu hỏi thay nhiều ngày chờ số' : 'Một câu hỏi thay hàng giờ tổng hợp'} at={92} size={76} top={640} accent={['Một câu hỏi']} />
        </Stage>
    )
}

/** 3 — Nộp file theo mẫu; lệch mẫu bị chặn. 330f */
const ROWS = [...FILES.slice(0, 10), 'XaSongTra', 'XaTanLap', 'XaSongTra_ban-sua']
export const UploadScene: React.FC = () => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const panel = spring({ frame: f - 8, fps, config: { damping: 200 } })
    const flyCues = accel(12, 5, 2).map(c => c + 18)
    const statusCues = accel(12, 6, 2).map(c => c + 80)
    const spot = ease(f, [172, 184], [0, 1])
    const fixIn = spring({ frame: f - 214, fps, config: { damping: 14, stiffness: 170 } })
    const row = (name: string, i: number) => {
        const bad = name === 'XaSongTra'
        const fix = name === 'XaSongTra_ban-sua'
        const p = fix ? fixIn : spring({ frame: f - flyCues[i], fps, config: { damping: 15, stiffness: 180 } })
        const st = fix ? (f >= 232 ? 'ok' : 'run') : f >= statusCues[i] + 12 ? (bad ? 'bad' : 'ok') : f >= statusCues[i] ? 'run' : 'wait'
        const dim = bad || fix ? 1 : 1 - 0.55 * spot
        return (
            <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 14, height: 58, padding: '0 18px', borderRadius: 14,
                background: bad && spot > 0 ? `rgba(192,57,43,${0.08 * spot})` : '#FAFAFE', border: `1px solid ${bad && spot > 0 ? C.red : C.rule}`,
                opacity: Math.min(1, p * 1.4) * dim, transform: `translateX(${(1 - p) * -160}px)`,
            }}>
                <ExcelIcon size={30} />
                <span style={{ flex: 1, fontSize: 22, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>BC_Thu_T09_{name}.csv</span>
                {bad && f >= 176 ? (
                    <span style={{
                        fontFamily: MONO, fontSize: 17, fontWeight: 700, color: '#fff', background: C.red, borderRadius: 8, padding: '5px 10px', whiteSpace: 'nowrap',
                        transform: `scale(${spring({ frame: f - 176, fps, config: { damping: 11, stiffness: 190 } })})`, transformOrigin: 'right center',
                    }}>✕ so_tien ≠ so_thu_trieu_dong</span>
                ) : (
                    <span style={{ fontSize: 21, fontWeight: 700, whiteSpace: 'nowrap', color: st === 'ok' ? C.emerald : st === 'bad' ? C.red : C.steel }}>
                        {st === 'ok' ? '✓ Hoàn tất' : st === 'bad' ? '✕ Lệch mẫu' : st === 'run' ? 'Đang kiểm…' : 'Chờ'}
                    </span>
                )}
            </div>
        )
    }
    return (
        <Stage>
            <Headline text="Một mẫu chuẩn cho mọi đơn vị" at={0} out={164} size={100} top={60} accent={['mẫu chuẩn']} />
            <Headline text="Sai chuẩn, hệ thống tự chặn" at={166} size={100} top={60} accent={['tự chặn']} />
            <div style={{
                ...panelStyle, left: 170, top: 220, width: 1580, padding: '28px 34px', opacity: panel, transform: `translateY(${(1 - panel) * 60}px)`,
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
                    <span style={{ fontSize: 30, fontWeight: 800, color: INK }}>Nộp dữ liệu · Thu ngân sách</span>
                    <span style={{ fontSize: 22, color: C.steel }}>mẫu biểu: don_vi · thang · khoan_muc · so_thu_trieu_dong</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {ROWS.slice(0, 12).map((n, i) => row(n, i))}
                </div>
                {f >= 206 && <div style={{ marginTop: 12 }}>{row(ROWS[12], 12)}</div>}
            </div>
            <IllustrationTag />
        </Stage>
    )
}

/** Nhãn nhỏ trung thực cho các cảnh dựng lại. */
export const IllustrationTag: React.FC = () => {
    const internal = useEdition() === 'internal'
    return (
        <div style={{ position: 'absolute', right: 40, bottom: 26, fontSize: 20, color: C.steel, opacity: 0.85 }}>
            {internal ? 'Minh hoạ dựng từ giao diện thật của Semantix · số liệu môi trường UAT (mô phỏng)' : 'Minh hoạ dựng từ giao diện và số liệu thật của Semanio'}
        </div>
    )
}

export { accel, ExcelIcon, MONO }
export const _unused = { interpolate, Easing, CLAMP }
