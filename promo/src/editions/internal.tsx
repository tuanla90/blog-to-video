import { ScreenZoom } from '../promo/ScreenZoom'
import type { Scene } from '../promo/Promo'

/**
 * Mẫu edition nội bộ: dùng clip người dùng TỰ QUAY (OpenVid/OBS) thay clip Playwright.
 * Cách dựng một cảnh clip tự quay (xem PLAYBOOK.md › Clip quay thật):
 *  - srcH: chiều cao nguồn (vd 852 với bản quay tab 1920×852); cropTop: cắt dải navbar/logo cũ
 *  - keys: zoom 1 nhịp rồi GIỮ; muốn lia sang chỗ khác thì thêm đúng 1 mốc, không trôi liên tục
 *  - clicks: [giây, x, y] vẽ gợn sóng đúng lúc bấm (tìm giây bằng tools/find_clicks.py)
 *  - soft: true khi nối từ một clip quay thật khác (hoà tan, không whip)
 * Để trống = edition 'internal' giống hệt bản chung.
 */
export const INTERNAL_OVERRIDES: Record<string, Partial<Scene>> = {
    // realFilter: {
    //     el: <ScreenZoom src="rec/my-filter.mp4" srcH={852} cropTop={52}
    //         keys={[{ t: 0, s: 1.0, x: 960, y: 426 }, { t: 0.6, s: 1.6, x: 330, y: 470 }, { t: 4.0, s: 1.6, x: 330, y: 470 }, { t: 4.6, s: 1.3, x: 900, y: 420 }, { t: 99, s: 1.3, x: 900, y: 420 }]}
    //         clicks={[[1.0, 230, 372], [3.88, 125, 626]]} />,
    //     sfx: [[0, 'whoosh-soft.wav', 0.4], [30, 'click.wav', 0.8], [116, 'click.wav', 0.8]],
    // },
}
void ScreenZoom
