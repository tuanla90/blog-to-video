"""Tăng âm lượng cho video đã render: đưa đỉnh về TARGET dBFS, giữ nguyên luồng hình (copy gói, không nén lại).
Usage: python audio_gain.py <in.mp4> <out.mp4> [target_dbfs=-1]"""
import sys
sys.path.append(__import__('os').environ.get('PROMO_PY_SITE', ''))  # tuỳ chọn: site-packages có av/numpy/PIL
sys.stdout.reconfigure(encoding='utf-8')
import av, numpy as np

src, dst = sys.argv[1], sys.argv[2]
target = float(sys.argv[3]) if len(sys.argv) > 3 else -1.0
inp = av.open(src)
a_in = inp.streams.audio[0]
sr = a_in.codec_context.sample_rate
rs = av.AudioResampler(format='fltp', layout='stereo', rate=sr)
x = np.concatenate([o.to_ndarray() for fr in inp.decode(a_in) for o in rs.resample(fr)], axis=1)
peak = np.abs(x).max()
gain = 10 ** (target / 20) / peak
print(f'đỉnh gốc {20 * np.log10(peak):.1f} dBFS → nhân {gain:.3f} ({20 * np.log10(gain):+.1f} dB)')
y = (x * gain).astype(np.float32)
inp.close()

inp = av.open(src)
v_in = inp.streams.video[0]
out = av.open(dst, 'w')
v_out = out.add_stream_from_template(v_in)
a_out = out.add_stream('aac', rate=sr)
a_out.layout = 'stereo'
a_out.bit_rate = 192000
for pkt in inp.demux(v_in):
    if pkt.dts is None:
        continue
    pkt.stream = v_out
    out.mux(pkt)
n = 1024
for i in range(0, y.shape[1], n):
    fr = av.AudioFrame.from_ndarray(np.ascontiguousarray(y[:, i:i + n]), format='fltp', layout='stereo')
    fr.sample_rate = sr
    fr.pts = i
    for p in a_out.encode(fr):
        out.mux(p)
for p in a_out.encode():
    out.mux(p)
out.close(); inp.close()
print('xong', dst)
