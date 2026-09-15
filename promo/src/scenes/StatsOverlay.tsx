import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import {
    siClickhouse, siDatabricks, siDuckdb, siGooglebigquery, siGooglesheets,
    siMysql, siPostgresql, siSnowflake, siSqlite, siTrino,
} from 'simple-icons'
import { C, FONT } from '../theme'
import { GradientFrame } from '../components/Frame'

const ITEMS = [
    'Kết nối trực tiếp 12 hệ CSDL + Google Sheets',
    'Nộp file Excel/CSV theo mẫu, cảnh báo lệch mẫu',
    'Triển khai riêng từng đơn vị · không giới hạn người dùng',
]

type Entry = { name: string; si?: { path: string; hex: string }; glyph?: 'db' | 'sheet'; color?: string; highlight?: boolean }

// 12 hệ CSDL thật (lib/sync/source-type.ts) + Sheets + Excel/CSV.
// SQL Server / Redshift / Excel / NocoBase: simple-icons đã gỡ theo chính sách
// thương hiệu → dùng glyph trụ-CSDL / bảng-tính với màu brand quen thuộc.
// Màu icon lấy theo brand THẬT (trước đây phải làm sáng lên cho nền navy;
// giờ thẻ nền trắng nên dùng đúng màu gốc, đậm và nhận diện tốt hơn).
export const ROW_1: Entry[] = [
    { name: 'PostgreSQL', si: siPostgresql, color: '#336791' },
    { name: 'MySQL', si: siMysql, color: '#00758F' },
    { name: 'SQL Server', glyph: 'db', color: '#CC2927' },
    { name: 'BigQuery', si: siGooglebigquery },
    { name: 'Snowflake', si: siSnowflake },
    { name: 'ClickHouse', si: siClickhouse, color: '#2A2A2A' },
    { name: 'Redshift', glyph: 'db', color: '#8C4FFF' },
    { name: 'Trino', si: siTrino, color: '#DD00A1' },
]
export const ROW_2: Entry[] = [
    { name: 'Databricks', si: siDatabricks },
    { name: 'SQLite', si: siSqlite, color: '#003B57' },
    { name: 'DuckDB', si: siDuckdb, color: '#B8860B' },
    { name: 'NocoBase', glyph: 'db', color: '#1677FF' },
    { name: 'Google Sheets', si: siGooglesheets },
    { name: 'Excel / CSV kéo thả', glyph: 'sheet', color: '#217346', highlight: true },
    { name: 'API mở', glyph: 'db', color: C.steel },
]

const Glyph: React.FC<{ kind: 'db' | 'sheet'; color: string }> = ({ kind, color }) =>
    kind === 'db' ? (
        <svg width={38} height={38} viewBox="0 0 24 24" fill={color}>
            <path d="M12 2C7.6 2 4 3.3 4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5c0-1.7-3.6-3-8-3zm0 2c3.9 0 6 1 6 1.5S15.9 7 12 7 6 6 6 5.5 8.1 4 12 4zm6 15c0 .5-2.1 1.5-6 1.5S6 19.5 6 19v-2.9c1.5.8 3.7 1.2 6 1.2s4.5-.4 6-1.2V19zm0-5.5c0 .5-2.1 1.5-6 1.5s-6-1-6-1.5V8.6c1.5.8 3.7 1.2 6 1.2s4.5-.4 6-1.2v4.9z" />
        </svg>
    ) : (
        <svg width={38} height={38} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
            <rect x={3} y={3} width={18} height={18} rx={2} />
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
    )

// Thẻ CSDL nằm trên thẻ trắng của GradientFrame (marquee chỉ chạy ở bản solid),
// nên nền/chữ theo hệ SÁNG — logo brand của từng CSDL cũng bắt màu đúng hơn.
const Tile: React.FC<{ e: Entry }> = ({ e }) => (
    <div
        style={{
            display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap',
            padding: '16px 32px', marginRight: 28, borderRadius: 14,
            background: e.highlight ? 'rgba(232,111,198,0.12)' : '#FFFFFF',
            border: `2px solid ${e.highlight ? C.pink : C.rule}`,
        }}
    >
        {e.si ? (
            <svg width={38} height={38} viewBox="0 0 24 24" fill={e.color ?? `#${e.si.hex}`}>
                <path d={e.si.path} />
            </svg>
        ) : (
            <Glyph kind={e.glyph ?? 'db'} color={e.color ?? C.steel} />
        )}
        <span style={{ fontSize: 30, fontWeight: 600, color: C.ink }}>{e.name}</span>
    </div>
)

/** Hàng thẻ chạy ngang vô tận: nhân đôi nội dung, dịch theo % nửa chiều rộng. */
export const Marquee: React.FC<{
    items: Entry[]
    reverse?: boolean
    secondsPerLoop?: number
}> = ({ items, reverse, secondsPerLoop = 26 }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const p = ((frame / (fps * secondsPerLoop)) % 1) * 50
    const x = reverse ? p - 50 : -p
    return (
        <div style={{ overflow: 'hidden', width: '100%' }}>
            <div style={{ display: 'inline-flex', transform: `translateX(${x}%)` }}>
                {[0, 1].map((copy) => (
                    <div key={copy} style={{ display: 'inline-flex' }}>
                        {items.map((e) => (
                            <Tile key={`${copy}-${e.name}`} e={e} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

// solid=true: phân cảnh độc lập đầy đủ (nền gradient + marquee CSDL + 3 thẻ).
// solid=false: bản trong suốt chỉ có 3 thẻ, để chồng lên footage (ProRes 4444).
export const StatsOverlay: React.FC<{ solid: boolean }> = ({ solid }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const at = (f: number) => spring({ frame: frame - f, fps, config: { damping: 200 } })

    // Bản overlay chồng lên footage giữ thẻ SẪM (nổi trên cửa sổ ứng dụng trắng);
    // bản solid nằm trên thẻ trắng của khung gradient nên đảo sang hệ sáng.
    const items = (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 90 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {ITEMS.map((text, i) => {
                    const appear = at(30 + i * 55)
                    return (
                        <div
                            key={text}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 20,
                                background: solid ? '#FFFFFF' : 'rgba(34,26,102,0.92)',
                                border: `2px solid ${C.pink}`,
                                borderRadius: 14,
                                padding: '18px 34px',
                                boxShadow: solid ? '0 10px 26px rgba(34,26,102,0.10)' : undefined,
                                opacity: appear,
                                transform: `translateX(${(1 - (appear as unknown as number)) * -60}px)`,
                            }}
                        >
                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.pink }} />
                            <div style={{ fontSize: 34, fontWeight: 600, color: solid ? C.ink : '#FFFFFF', whiteSpace: 'nowrap' }}>
                                {text}
                            </div>
                        </div>
                    )
                })}
            </div>
        </AbsoluteFill>
    )

    if (!solid) {
        return <AbsoluteFill style={{ fontFamily: FONT }}>{items}</AbsoluteFill>
    }

    return (
        <AbsoluteFill style={{ fontFamily: FONT }}>
            <GradientFrame cardBg={C.wash}>
                <div style={{ position: 'absolute', top: 72, left: 0, right: 0, textAlign: 'center', opacity: at(4) as unknown as number }}>
                    <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.18em', color: C.gold, marginBottom: 14 }}>
                        SẴN SÀNG VỚI HẠ TẦNG SẴN CÓ
                    </div>
                    <div style={{ fontSize: 52, fontWeight: 800, color: C.navy }}>
                        Kết nối thẳng vào dữ liệu đơn vị đang có
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute', top: 268, left: 0, right: 0,
                        display: 'flex', flexDirection: 'column', gap: 30,
                        opacity: at(12) as unknown as number,
                    }}
                >
                    <Marquee items={ROW_1} />
                    <Marquee items={ROW_2} reverse secondsPerLoop={30} />
                </div>

                {items}
            </GradientFrame>
        </AbsoluteFill>
    )
}
