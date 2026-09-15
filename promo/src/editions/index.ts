import type { Edition } from '../promo/kit'
import type { Scene } from '../promo/Promo'
import { INTERNAL_OVERRIDES } from './internal'

/**
 * Thay nội dung cảnh theo edition, GIỮ id + thời lượng để nhạc/SFX không lệch.
 * Mỗi mục: { [sceneId]: Partial<Scene> } — thường chỉ đổi `el`, đôi khi `sfx`/`dur`/`soft`.
 * Đổi `dur` một cảnh thì phải bù đúng số khung ở cảnh khác (xem PLAYBOOK.md › Khớp nhạc).
 */
export const EDITION_OVERRIDES: Partial<Record<Edition, Record<string, Partial<Scene>>>> = {
    internal: INTERNAL_OVERRIDES,
}
