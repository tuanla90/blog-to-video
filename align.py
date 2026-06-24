# Forced-align KNOWN text to Vbee audio using energy VAD (no ML, no ctranslate2).
# We already have the exact spoken words per beat; we only need timing.
import json, re, sys
import numpy as np
import av

# Exact voiceover text per beat (must match what was sent to Vbee).
BEATS = {
"00":"Sáng thứ Hai. Phòng họp. Sếp hỏi đúng một câu: Doanh thu tháng này bao nhiêu? Anh Sales đứng lên: bốn phẩy hai tỷ. Chị Kế toán liếc file của mình: ba phẩy tám tỷ. Cùng một công ty. Cùng một tháng. Hai con số. Sếp gõ bàn hỏi: ai sai? Câu trả lời ngược đời: không ai sai cả.",
"01":"Lý do hai báo cáo lệch nhau, gần như không bao giờ là cộng sai. Mà là ba người đang gọi ba thứ khác nhau, bằng đúng một từ. Gỡ được nó chỉ cần hiểu đúng ba từ vựng: Metric, Dimension, và KPI. Hình dung dữ liệu của bạn như một khối Rubik. Metric là con số ghi trên mặt khối, thứ bạn muốn biết. Dimension là cách bạn xoay khối để nhìn con số đó từ một góc khác. KPI là vạch mục tiêu bạn kẻ lên tường, để biết con số đã chạm tới đó chưa.",
"02":"Metric là một đại lượng đo được, gói trong một con số. Doanh thu. Số đơn. Số khách mới. Nghe đơn giản. Nhưng cái bẫy nằm ngay đây. Một metric chỉ rõ ràng khi định nghĩa của nó rõ ràng. Doanh thu, thử hỏi năm người: Tính theo đơn đã chốt, hay đơn đã thu tiền? Có trừ đơn hoàn không? Có gồm phí ship không? Doanh thu của anh Sales: đã chốt, gồm ship, chưa trừ hoàn, bốn phẩy hai tỷ. Doanh thu của chị Kế toán: đã thu, trừ hoàn, không ship, ba phẩy tám tỷ. Không phải sai số. Là hai metric khác nhau, đeo chung một cái tên.",
"03":"Nếu metric là con số, thì dimension là lát cắt, góc bạn xoay để nhìn. Vẫn metric doanh thu, nhưng cắt theo các góc khác nhau. Theo kênh. Theo thời gian. Theo sản phẩm. Một con số tổng, doanh thu ba phẩy tám tỷ, gần như vô dụng để ra quyết định. Cũng con số đó, cắt theo kênh, lập tức kể một câu chuyện: Shopee một phẩy chín tỷ. Tik Tok Shop một phẩy tư tỷ. KiotViet năm trăm triệu. Giờ bạn mới biết nên dồn ngân sách vào đâu.",
"04":"Đây là chỗ nhiều người nhầm nhất, nên nói thẳng: Không phải metric nào cũng là KPI. Doanh thu tháng này ba phẩy tám tỷ, đó là một metric. Một con số trần trụi. Doanh thu phải đạt bốn tỷ, hiện ba phẩy tám, đạt chín lăm phần trăm, đó mới là KPI. Con số ấy giờ có một cái thước để biết tốt hay chưa. Một công ty đo hàng trăm metric. Nhưng chỉ nên chọn năm tới mười KPI thật sự. Khi mọi thứ đều then chốt, thì không gì là then chốt cả.",
"05":"Giờ quay lại phòng họp sáng thứ Hai, đọc lại bằng đúng ba từ vựng. Một: cãi nhau vì metric doanh thu chưa có một định nghĩa chung. Hai: mỗi người cầm một dimension khác, đã giao hay đã thu, mà không nói rõ. Ba: chẳng ai chốt KPI để biết thế nào là tốt. Ba mầm lẫn lộn, gộp thành mười lăm phút cãi nhau, đáng ra chỉ cần một câu: Mình đang nói metric nào, cắt theo dimension nào, so với KPI nào?",
"07":"Lần tới khi hai báo cáo lệch nhau, đừng vội đi tìm lỗi cộng trừ. Hỏi trước: metric nào, dimension nào, KPI nào? Chín trên mười lần, sai số sẽ tan biến ngay khi ba từ này được gọi đúng tên. Nếu thấy hữu ích, theo dõi kênh, mỗi tuần một khái niệm data, gỡ trong vài phút.",
"short-outro":"Câu trả lời nằm gọn trong ba từ: Metric, Dimension, và KPI. Xem đầy đủ trên YouTube, và theo dõi để không bỏ lỡ.",
}

def decode_mono(path):
    container = av.open(path)
    stream = container.streams.audio[0]
    sr = stream.rate
    chunks = []
    for frame in container.decode(stream):
        arr = frame.to_ndarray()
        if arr.ndim > 1:
            arr = arr.mean(axis=0)
        chunks.append(arr.astype(np.float32))
    sig = np.concatenate(chunks) if chunks else np.zeros(1, np.float32)
    m = np.max(np.abs(sig)) or 1.0
    return sig / m, sr

def voiced_span(sig, sr):
    fl = int(0.02 * sr); hop = int(0.01 * sr)
    if len(sig) < fl: return 0.0, len(sig) / sr
    n = 1 + (len(sig) - fl) // hop
    rms = np.empty(n, np.float32)
    for i in range(n):
        seg = sig[i*hop:i*hop+fl]
        rms[i] = np.sqrt(np.mean(seg*seg) + 1e-9)
    thr = max(rms.max() * 0.06, 0.01)
    idx = np.where(rms > thr)[0]
    if len(idx) == 0: return 0.0, len(sig) / sr
    t0 = idx[0] * hop / sr
    t1 = (idx[-1] * hop + fl) / sr
    return float(t0), float(t1)

def align(text, t0, t1):
    raw = text.split()
    units = []  # ('w', word, weight) or ('p', None, pause)
    for tok in raw:
        core = re.sub(r"[^\wÀ-ỹ]", "", tok)
        units.append(("w", tok, 1.0 + 0.18 * len(core)))
        tail = tok[-1] if tok else ""
        if tail in ".?!:": units.append(("p", None, 0.55))
        elif tail in ",;": units.append(("p", None, 0.22))
    total = sum(u[2] for u in units) or 1.0
    scale = (t1 - t0) / total
    t = t0; words = []
    for kind, w, wt in units:
        d = wt * scale
        if kind == "w":
            words.append({"w": w, "s": round(t, 3), "e": round(t + d, 3)})
        t += d
    # group into caption lines: break at sentence-ending word or every 5 words
    lines = []; cur = []
    for wd in words:
        cur.append(wd)
        ends = wd["w"][-1] in ".?!:"
        if ends or len(cur) >= 5:
            lines.append({"text": " ".join(x["w"] for x in cur),
                          "start": cur[0]["s"], "end": cur[-1]["e"], "words": cur})
            cur = []
    if cur:
        lines.append({"text": " ".join(x["w"] for x in cur),
                      "start": cur[0]["s"], "end": cur[-1]["e"], "words": cur})
    return lines

out = {}
for bid, text in BEATS.items():
    fn = f"public/audio/{'short-outro' if bid=='short-outro' else 'beat-'+bid}.mp3"
    sig, sr = decode_mono(fn)
    t0, t1 = voiced_span(sig, sr)
    out[bid] = align(text, t0, t1)
    sys.stdout.buffer.write((f"{bid}: voiced {t0:.2f}-{t1:.2f}s, {len(out[bid])} lines\n").encode())
json.dump(out, open("src/timings.json", "w", encoding="utf-8"), ensure_ascii=False)
print("wrote src/timings.json")
