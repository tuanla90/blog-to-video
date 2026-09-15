import { Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, FONT } from '../theme'
import { Stage, ease, useDark, useEdition } from './kit'

/**
 * Đoạn quay màn hình THẬT (Playwright, nét 2880px) trong khung cửa sổ trình duyệt,
 * camera zoom mượt bám điểm thao tác — kiểu Screen Studio. Không tua: phát đúng
 * tốc độ thật từ giây `from` của clip.
 *
 * `keys`: mốc camera theo giây (tính từ đầu đoạn): s = độ phóng, (x, y) = điểm cần
 * đặt vào giữa, theo toạ độ trang 1920×1080 lúc quay.
 */
export type CamKey = { t: number; s: number; x: number; y: number }
/** Đường chuột thật: [giây tính từ đầu clip, x, y, 1 = bấm] (tools: cursor_json.py). */
export type CursorPath = number[][]
/** Chỉ gợn sóng lúc bấm (con trỏ đã có sẵn trong hình quay): [giây, x, y]. */
export type ClickMarks = [number, number, number][]
const Ripples: React.FC<{ clicks: ClickMarks; t: number }> = ({ clicks, t }) => (
    <>
        {clicks.filter(c => t >= c[0] && t < c[0] + 0.5).map(c => {
            const k = (t - c[0]) / 0.5
            return <div key={c[0]} style={{ position: 'absolute', left: c[1] - 12 - 34 * k, top: c[2] - 12 - 34 * k, width: 24 + 68 * k, height: 24 + 68 * k, borderRadius: '50%', border: '4px solid rgba(109,93,246,0.9)', opacity: 1 - k }} />
        })}
    </>
)

/** Con trỏ vẽ lại ở 30fps từ nhật ký thao tác — mượt hơn con trỏ in trong khung quay (khung quay bị rớt). */
const Cursor: React.FC<{ path: CursorPath; t: number }> = ({ path, t }) => {
    let x = path[0][1], y = path[0][2]
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1]
        if (t >= a[0] && t <= b[0]) {
            const p = b[0] > a[0] ? (t - a[0]) / (b[0] - a[0]) : 1
            x = a[1] + (b[1] - a[1]) * p; y = a[2] + (b[2] - a[2]) * p
            break
        }
        if (t > b[0]) { x = b[1]; y = b[2] }
    }
    const clicks = path.filter(p => p[3] === 1 && t >= p[0] - 0.1 && t < p[0] + 0.5)
    const press = clicks.some(c => Math.abs(t - c[0]) < 0.09) ? 0.82 : 1
    return (
        <>
            {clicks.filter(c => t >= c[0]).map(c => {
                const k = (t - c[0]) / 0.5
                return <div key={c[0]} style={{ position: 'absolute', left: c[1] - 12 - 34 * k, top: c[2] - 12 - 34 * k, width: 24 + 68 * k, height: 24 + 68 * k, borderRadius: '50%', border: '4px solid rgba(109,93,246,0.9)', opacity: 1 - k }} />
            })}
            <svg width={36} height={36} viewBox="0 0 28 28" style={{ position: 'absolute', left: x - 3.5, top: y - 1.8, transform: `scale(${press})`, transformOrigin: '3px 2px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.35))' }}>
                <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill="#fff" stroke="#231F3A" strokeWidth={1.6} strokeLinejoin="round" />
            </svg>
        </>
    )
}

const WIN_W = 1680
const WIN_H = 945
const BAR = 44

/** `srcH`: chiều cao trang trong nguồn (mặc định 1080; bản quay OpenVid là 1920×852 — camera tự phóng tối thiểu cho kín khung). */
export const ScreenZoom: React.FC<{ src?: string; img?: string; from?: number; keys: CamKey[]; label?: string; cursor?: CursorPath; badge?: string; srcH?: number; clicks?: ClickMarks; cropTop?: number }> = ({ src, img, from = 0, keys, label = 'Quay màn hình thật · đúng tốc độ', cursor, badge, srcH = 1080, clicks, cropTop = 0 }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const t = frame / fps

    // Nội suy camera giữa các mốc, chậm đầu chậm cuối.
    let cam = keys[0]
    for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i], b = keys[i + 1]
        if (t >= a.t && t <= b.t) {
            const p = interpolate(t, [a.t, b.t], [0, 1], { easing: Easing.inOut(Easing.cubic) })
            cam = { t, s: a.s + (b.s - a.s) * p, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p }
            break
        }
        if (t > b.t) cam = b
    }
    // Trang 1920×1080 thu vào khung WIN_W×(WIN_H−BAR), rồi camera phóng quanh điểm (x, y).
    // Nguồn khác 1080 (bản quay OpenVid 1920×852, cắt navbar): khung cửa sổ thấp lại theo đúng tỉ lệ nguồn cho thoáng.
    const fit = WIN_W / 1920
    const viewH = srcH === 1080 ? WIN_H - BAR : Math.round(WIN_W * (srcH - cropTop) / 1920)
    const winH = viewH + BAR
    // `cropTop`: bỏ dải trên cùng của nguồn (thanh điều hướng có logo cũ) — không bao giờ lộ trong khung.
    const s = Math.max(cam.s * fit, viewH / (srcH - cropTop))
    let tx = WIN_W / 2 - cam.x * s
    let ty = viewH / 2 - cam.y * s
    tx = Math.min(0, Math.max(WIN_W - 1920 * s, tx))
    ty = Math.min(-cropTop * s, Math.max(viewH - srcH * s, ty))

    const enter = ease(frame, [0, 10], [0, 1])
    const dark = useDark()
    const internal = useEdition() === 'internal'
    const host = internal ? 'app.example.com' : 'semanio.vn'
    const labelText = internal && label === 'Quay màn hình thật · đúng tốc độ' ? 'Tính năng thật · số liệu UAT mô phỏng' : label
    return (
        <Stage>
            <div style={{
                position: 'absolute', left: (1920 - WIN_W) / 2, top: (1080 - winH) / 2 + 12, width: WIN_W, height: winH,
                borderRadius: 20, overflow: 'hidden', background: '#fff',
                boxShadow: '0 40px 100px rgba(34,26,102,0.28)', border: `1px solid ${C.rule}`,
                opacity: enter, transform: `scale(${0.96 + 0.04 * enter})`,
            }}>
                {/* thanh trình duyệt */}
                <div style={{ height: BAR, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', background: '#F1F0F8', borderBottom: `1px solid ${C.rule}` }}>
                    {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
                    <div style={{ marginLeft: 18, flex: 1, maxWidth: 560, height: 28, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 14px', fontFamily: FONT, fontSize: 17, color: C.steel }}>
                        🔒 {host}
                    </div>
                </div>
                <div style={{ position: 'relative', width: WIN_W, height: viewH, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: srcH, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
                        {img ? (
                            <Img src={staticFile(img)} style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, maxWidth: 'none' }} />
                        ) : <OffthreadVideo src={staticFile(src!)} trimBefore={Math.round(from * fps)} muted style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: srcH, maxWidth: 'none' }} />}
                        {cursor && <Cursor path={cursor} t={from + t} />}
                        {clicks && <Ripples clicks={clicks} t={from + t} />}
                    </div>
                </div>
            </div>
            <div style={{
                position: 'absolute', top: 26, left: 120, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px',
                borderRadius: 999, background: dark ? 'rgba(255,255,255,0.14)' : C.ink, border: dark ? '1px solid rgba(255,255,255,0.28)' : 'none', color: '#fff', fontFamily: FONT, fontSize: 24, fontWeight: 700, opacity: enter,
            }}>
                <span style={{ width: 11, height: 11, borderRadius: 6, background: '#FF5F57' }} /> {labelText}
            </div>
            {badge && (
                <div style={{
                    position: 'absolute', top: 22, right: 120, padding: '12px 26px', borderRadius: 999, background: 'linear-gradient(90deg, #6D5DF6, #E86FC6)',
                    color: '#fff', fontFamily: FONT, fontSize: 30, fontWeight: 800, opacity: ease(frame, [4, 12], [0, 1]) * ease(frame, [70, 84], [1, 0]),
                    transform: `scale(${0.8 + 0.2 * ease(frame, [4, 14], [0, 1])})`, boxShadow: '0 12px 30px rgba(109,93,246,0.4)',
                }}>{badge}</div>
            )}
        </Stage>
    )
}
