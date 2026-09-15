import { Composition } from 'remotion'
import { Promo, PROMO_FRAMES } from './promo/Promo'

const FPS = 30

/**
 * Video giới thiệu sản phẩm KHÔNG GIỌNG (chữ to + animation + clip quay thật + nhạc).
 * Ba edition cùng mã, cùng thời lượng/nhạc — chỉ khác nội dung vài cảnh (src/editions).
 * Quy trình đầy đủ: ../PLAYBOOK.md.
 */
export const Root: React.FC = () => (
    <>
        <Composition id="Promo" component={Promo} durationInFrames={PROMO_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ edition: 'general' as const }} />
        <Composition id="PromoDFL" component={Promo} durationInFrames={PROMO_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ edition: 'dfl' as const }} />
        <Composition id="PromoInternal" component={Promo} durationInFrames={PROMO_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ edition: 'internal' as const }} />
    </>
)
