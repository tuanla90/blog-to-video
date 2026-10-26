import { Composition } from 'remotion'
import { Promo, PROMO_FRAMES } from './promo/Promo'
import { PromoTemplate, PromoTemplateBiz, TEMPLATE_BIZ_FRAMES, TEMPLATE_FRAMES } from './template/PromoTemplate'

const FPS = 30

/**
 * Video giới thiệu sản phẩm KHÔNG GIỌNG (chữ to + animation + clip quay thật + nhạc).
 * Quy trình đầy đủ: ../PLAYBOOK.md.
 */
export const Root: React.FC = () => (
    <>
        <Composition id="Promo" component={Promo} durationInFrames={PROMO_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ edition: 'general' as const }} />
        <Composition id="PromoDFL" component={Promo} durationInFrames={PROMO_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ edition: 'dfl' as const }} />
        <Composition id="PromoInternal" component={Promo} durationInFrames={PROMO_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ edition: 'internal' as const }} />
        {/* Bản Biz cho cán bộ nghiệp vụ */}
        <Composition id="PromoTemplateBiz" component={PromoTemplateBiz} durationInFrames={TEMPLATE_BIZ_FRAMES} fps={FPS} width={1920} height={1080} />
        {/* Bản Full cho BA / Power User */}
        <Composition id="PromoTemplate" component={PromoTemplate} durationInFrames={TEMPLATE_FRAMES} fps={FPS} width={1920} height={1080} />
    </>
)
