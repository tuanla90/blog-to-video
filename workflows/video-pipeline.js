export const meta = {
  name: 'video-pipeline',
  description: 'Batch bài viết -> bundle video blog2video: content.py + thumb.json + vòng soát giọng',
  whenToUse: 'Khi có một batch slug cần biến thành video. args = {slugs:[...], ctx:"<bối cảnh kênh>", blogDir, videosDir, categories:[...]} hoặc chỉ mảng slug.',
  phases: [
    { title: 'Script', detail: 'bài viết -> content.py (BEATS/ORDER/PRON)' },
    { title: 'Thumbnail', detail: 'thumb.json hợp lệ 1 trong 9 layout' },
    { title: 'Review', detail: 'soát giọng; rớt thì sửa & soát lại (tối đa 2 vòng)' },
  ],
};

// ---- Tham số: mảng slug đơn giản, hoặc object đầy đủ ----
const A = typeof args === 'string' ? JSON.parse(args) : (args ?? {});
const SLUGS = Array.isArray(A) ? A : (A.slugs ?? []);
if (!SLUGS.length) throw new Error('Cần ít nhất 1 slug: args = ["slug-a"] hoặc {slugs:[...]}');

const BLOG_DIR = A.blogDir ?? 'content/blog';
const VIDEOS_DIR = A.videosDir ?? 'videos';
const CATEGORIES = A.categories ?? [];
const VOICE_DOCS = A.voiceDocs ?? [];

// Bối cảnh kênh — CHÍNH DỰ ÁN truyền vào. Engine không biết giọng của bạn.
const CTX = A.ctx ?? `Chưa truyền ctx. Trước khi viết, hãy Read tài liệu tông giọng của dự án
và bám theo. Không tự bịa giọng.`;
const CTX_FULL = [CTX, VOICE_DOCS.length ? `ĐỌC TRƯỚC (bắt buộc, Read thật):\n- ${VOICE_DOCS.join('\n- ')}` : '']
  .filter(Boolean).join('\n');

const THUMB_SPEC = `thumb.json bắt buộc có: layout, category, catLabel, kicker.${
  CATEGORIES.length ? ` category phải là 1 trong: ${CATEGORIES.map(c => `"${c}"`).join(', ')}.` : ''}
Chọn 1 layout + field riêng của nó:
- question: {pre, em}  (2 dòng, em = vế lật/nhấn màu)
- highlight: {pre, hl} (hl = cụm được bôi màu)
- cards: {cards:[{label,value,color}], hook:{pre,em}}  (so sánh 2-3 thẻ)
- bignum: {value, label, contrast}  (1 con số cực lớn)
- vs: {left, right, tail}  (đối đầu A vs B, tail = câu hỏi chốt)
- mockup: {hook:{pre,em}, query}  (giả lập màn chat -> chart)
- split: {left:{title,sub}, right:{title,sub}, kicker}  (sai / đúng)
- code: {hook (dùng [em]..[/em] để nhấn), code:[dòng...]}
- chart: {hook:{pre,em}, chart}  (chỉ khi thật cần; chart = tên preset có sẵn)
Hook NGẮN, punchy, khớp beat mở của content.py. Màu tự theo category, KHÔNG set tay.`;

const SCRIPT_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    action: { type: 'string', enum: ['created', 'refined', 'kept'] },
    beatCount: { type: 'number' },
    kineticBeat: { type: 'string', description: 'beat id punchy nhất để cắt Short' },
    thumbLayout: { type: 'string' },
    angle: { type: 'string', description: '1 câu: góc kể của video' },
  },
  required: ['slug', 'action', 'beatCount', 'thumbLayout'],
};

const THUMB_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    layout: { type: 'string' },
    action: { type: 'string', enum: ['created', 'refined', 'kept'] },
    hook: { type: 'string' },
  },
  required: ['slug', 'layout', 'action'],
};

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    pass: { type: 'boolean' },
    score: { type: 'number', description: 'tổng điểm giọng 5 tiêu chí, thang 0-50' },
    issues: { type: 'array', items: { type: 'string' } },
    fixed: { type: 'array', items: { type: 'string' } },
  },
  required: ['slug', 'pass', 'score', 'issues'],
};

const reviewOnce = (slug, round) => agent(
  `${CTX_FULL}\n\nSOÁT GIỌNG (vòng ${round}) file: ${VIDEOS_DIR}/${slug}/content.py
Đây là SCRIPT VOICEOVER, không phải bài viết. Áp:
A. STOP-SLOP: bỏ "..." ngắt drama; câu cụt lặp tạo kịch -> gộp; văn mẫu -> đời thường; kết FOMO/nịnh -> mộc; em-dash "—"/ellipsis "…" -> "," hoặc "-".
B. GIỌNG DỰ ÁN: theo đúng tài liệu tông giọng đã đọc. Bài đã ổn thì ĐỂ YÊN, đừng viết lại cho có.
C. HỢP LỆ python: giữ ORDER/BEATS/PRON đúng cú pháp; "\\n" là nhịp ngắt; cảm xúc là [tag] inline trong BEATS; đừng phá dict.
Có vi phạm RÕ -> Edit sửa tại chỗ. Sạch -> không sửa.
Chấm 5 tiêu chí (Directness/Rhythm/Trust/Authenticity/Density) mỗi cái 0-10. pass = score >= 40 VÀ hết vi phạm RÕ.
Trả về {slug:"${slug}", pass, score, issues, fixed}.`,
  { label: `review:${slug.slice(0, 14)}·v${round}`, phase: 'Review', schema: REVIEW_SCHEMA }
);

const results = await pipeline(
  SLUGS,

  (slug) => agent(
    `${CTX_FULL}\n\nNHIỆM VỤ: biến bài viết thành SCRIPT VOICEOVER video cho slug "${slug}".
1. Read ${BLOG_DIR}/${slug}.md (nguồn nội dung + số liệu + câu chuyện).
2. Đã có ${VIDEOS_DIR}/${slug}/content.py: Read, chỉ TINH CHỈNH nếu cần ("refined"/"kept"). Chưa có: viết mới ("created").
3. Cấu trúc: ORDER (list beat id "00".."0N"), BEATS (dict id -> voiceover, "\\n" = nhịp ngắt), PRON (từ khó -> cách đọc TTS). 5-7 beat. Beat "00" HOOK mạnh (cũng là beat cắt Short); thêm "short-outro" làm đáp án cho Short; beat chốt thẳng, không lên gân.
   CẢM XÚC = [tag] inline ngay trước câu cần đổi giọng, ~1 tag/beat, bộ tag: [thoughtful] [surprised] [excited] [annoyed] [frustrated] [sarcastic] [confident] [hesitant].
4. Write vào ${VIDEOS_DIR}/${slug}/content.py. Header comment ghi nguồn + "chưa render, chưa gen audio".
Trả về {slug, action, beatCount, kineticBeat, thumbLayout, angle}.`,
    { label: `script:${slug.slice(0, 16)}`, phase: 'Script', schema: SCRIPT_SCHEMA }
  ),

  (script, slug) => agent(
    `${CTX_FULL}\n\n${THUMB_SPEC}\n\nNHIỆM VỤ: tạo/soát thumbnail cho slug "${slug}".
Từ chặng script: layout đề xuất = "${script?.thumbLayout || 'question'}", góc kể = "${script?.angle || ''}".
1. Read ${VIDEOS_DIR}/${slug}/content.py lấy beat mở làm hook.
2. Có thumb.json rồi: kiểm layout hợp lệ + đủ field + hook khớp beat mở; sai thì sửa ("refined"), ổn thì giữ ("kept"). Chưa có: viết mới ("created").
3. Chọn layout khớp NỘI DUNG. Hook cực ngắn, đọc 1 giây là hiểu.
4. Write vào ${VIDEOS_DIR}/${slug}/thumb.json (JSON hợp lệ, không comment).
Trả về {slug, layout, action, hook}.`,
    { label: `thumb:${slug.slice(0, 16)}`, phase: 'Thumbnail', schema: THUMB_SCHEMA }
  ),

  async (thumb, slug) => {
    let v = await reviewOnce(slug, 1);
    if (v && !v.pass) v = await reviewOnce(slug, 2);
    return {
      slug,
      thumbLayout: thumb?.layout || null,
      pass: !!(v && v.pass),
      score: (v && v.score) || 0,
      issues: (v && v.issues) || ['review lỗi/không trả kết quả'],
    };
  }
);

const done = results.filter(Boolean);
const ready = done.filter(r => r.pass);
const needsEye = done.filter(r => !r.pass);
log(`Bàn giao: ${ready.length}/${done.length} đạt chuẩn giọng, ${needsEye.length} cần mắt người.`);
return {
  batch: SLUGS,
  reviewed: done.length,
  readyForUser: ready.map(r => ({ slug: r.slug, thumbLayout: r.thumbLayout, score: r.score })),
  needsHumanEye: needsEye.map(r => ({ slug: r.slug, score: r.score, issues: r.issues })),
  note: `content.py + thumb.json đã ghi tại ${VIDEOS_DIR}/<slug>/. CHƯA gen thumbnail PNG, CHƯA render.`,
};
