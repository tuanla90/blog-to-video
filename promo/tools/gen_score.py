"""Dựng nhạc nền khớp phách cho bản Biz từ src/template/timeline.json.

Mỗi cảnh dài bội số 2 phách (PromoTemplate.tsx kiểm), nên nhạc chỉ cần chạy đúng lưới: trống và
hợp âm bắt đầu lại ở đầu mỗi cảnh (cắt cảnh = "phách 1"), mỗi đoạn theo `mood` của cảnh, điểm
nhấn (`accents`, khung trong cảnh) làm tròn về phách gần nhất. Tổng hợp thuần numpy/scipy, không
dùng mẫu âm thanh có bản quyền. Kết: một cú nổ rồi hợp âm Đô trưởng ngân.

Usage (từ thư mục promo/): python -I tools/gen_score.py   ->  public/music/biz-score.wav
"""
import json
import os
import wave

import numpy as np
from scipy.signal import butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TIMELINE = os.path.join(ROOT, 'src', 'template', 'timeline.json')
OUT = os.path.join(ROOT, 'public', 'music', 'biz-score.wav')
SR = 44100
RNG = np.random.default_rng(7)   # cố định để chạy lại ra đúng bài cũ

# ── Hợp âm (MIDI): nốt bass + 3 nốt pad ─────────────────────────────────────────
CH = {
    'Am': (45, (57, 60, 64)), 'F': (41, (53, 57, 60)), 'E': (40, (52, 56, 59)),
    'C': (36, (60, 64, 67)), 'G': (43, (55, 59, 62)), 'Dm': (38, (57, 62, 65)),
}
PROG = {'tension': ['Am', 'Am', 'F', 'E'], 'main': ['C', 'G', 'Am', 'F']}


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def sos(kind, f, order=2):
    return butter(order, f, btype=kind, fs=SR, output='sos')


def noise(n):
    return RNG.standard_normal(n)


def tt(sec):
    return np.arange(int(sec * SR)) / SR


def saw(f, t, harm=14, detune=0.0):
    out = np.zeros_like(t)
    ff = f * (1 + detune)
    for k in range(1, harm + 1):
        if k * ff > SR / 2 - 500:
            break
        out += np.sin(2 * np.pi * k * ff * t + k) / k
    return out * 0.6


# ── Nhạc cụ ────────────────────────────────────────────────────────────────────
def kick():
    t = tt(0.45)
    f = 44 + 120 * np.exp(-t / 0.032)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.26)
    click = noise(len(t)) * np.exp(-t / 0.003) * 0.25
    return body + click


def clap():
    t = tt(0.3)
    n = sosfilt(sos('bandpass', [900, 3200]), noise(len(t)))
    env = np.exp(-t / 0.12)
    for d in (0.0, 0.011, 0.022):
        env += 0.6 * np.exp(-np.clip(t - d, 0, None) / 0.006) * (t >= d)
    return n * env * 0.5


def hat(open_=False):
    t = tt(0.25 if open_ else 0.06)
    n = sosfilt(sos('highpass', 7000), noise(len(t)))
    return n * np.exp(-t / (0.11 if open_ else 0.022)) * 0.35


def crash(length=1.6):
    t = tt(length)
    n = sosfilt(sos('highpass', 3800), noise(len(t)))
    return n * np.exp(-t / (length * 0.45)) * 0.32


def tick():
    t = tt(0.05)
    return (np.sin(2 * np.pi * 1900 * t) + 0.5 * np.sin(2 * np.pi * 2850 * t)) * np.exp(-t / 0.012) * 0.35


def bass(m, sec):
    t = tt(sec)
    x = sosfilt(sos('lowpass', 520), saw(hz(m), t, 18))
    env = np.minimum(1, t / 0.005) * (0.55 + 0.45 * np.exp(-t / 0.09)) * np.minimum(1, (sec - t) / 0.02)
    return x * env * 0.9


def pluck(m, sec=0.3, bright=2600):
    t = tt(sec)
    x = sosfilt(sos('lowpass', bright), saw(hz(m), t, 16) + 0.4 * np.sign(np.sin(2 * np.pi * hz(m) * t)))
    return x * np.exp(-t / 0.11) * np.minimum(1, t / 0.002) * 0.32


def pad(notes, sec, cutoff=1500, att=0.25):
    t = tt(sec)
    left = np.zeros_like(t)
    right = np.zeros_like(t)
    for m in notes:
        for det, pan in ((-0.004, 0.2), (0.0, 0.5), (0.004, 0.8)):
            v = saw(hz(m), t, 10, det)
            left += v * (1 - pan)
            right += v * pan
    env = np.minimum(1, t / att) * np.minimum(1, (sec - t) / 0.3)
    lp = sos('lowpass', cutoff)
    return sosfilt(lp, left) * env * 0.09, sosfilt(lp, right) * env * 0.09


def sub_drop(sec=1.2):
    t = tt(sec)
    f = 30 + 45 * np.exp(-t / 0.35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5) * 0.8


def riser(sec):
    t = tt(sec)
    p = t / sec
    n = noise(len(t))
    lo = sosfilt(sos('lowpass', 900), n)
    hi = sosfilt(sos('highpass', 3500), n)
    sweep = np.sin(2 * np.pi * np.cumsum(220 + 700 * p ** 2) / SR) * 0.15
    return ((1 - p) * lo + p * hi + sweep) * p ** 2 * 0.35


# ── Bàn trộn ───────────────────────────────────────────────────────────────────
class Mix:
    def __init__(self, sec):
        self.L = np.zeros(int(sec * SR) + SR * 8)
        self.R = np.zeros_like(self.L)
        self.duck = np.ones_like(self.L)   # nén theo kick cho bass/pad (sidechain)
        self.bus = {'L': np.zeros_like(self.L), 'R': np.zeros_like(self.L)}   # phần bị nén
        self.fx = {'L': np.zeros_like(self.L), 'R': np.zeros_like(self.L)}    # phần có vọng (chỉ pluck)

    def add(self, x, at, gain=1.0, pan=0.5, ducked=False, fx=False):
        i = int(at * SR)
        if i >= len(self.L):
            return
        x = x[: len(self.L) - i]
        L, R = (self.fx['L'], self.fx['R']) if fx else (self.bus['L'], self.bus['R']) if ducked else (self.L, self.R)
        L[i:i + len(x)] += x * gain * (1 - pan) * 2 ** 0.5
        R[i:i + len(x)] += x * gain * pan * 2 ** 0.5

    def add_st(self, lr, at, gain=1.0, ducked=True):
        i = int(at * SR)
        l, r = lr
        n = min(len(l), len(self.L) - i)
        L, R = (self.bus['L'], self.bus['R']) if ducked else (self.L, self.R)
        L[i:i + n] += l[:n] * gain
        R[i:i + n] += r[:n] * gain

    def kick(self, at, gain=1.0):
        self.add(kick(), at, gain)
        i = int(at * SR)
        t = np.arange(int(0.3 * SR)) / SR
        seg = self.duck[i:i + len(t)]
        seg *= (1 - 0.6 * np.exp(-t / 0.11))[: len(seg)]

    def render(self, total_sec):
        n = int(total_sec * SR)
        # vọng 3/8 phách (lệch trái phải) chỉ cho pluck; trống không vọng để phách luôn gọn
        d = int(0.375 * SR)
        fl, fr = self.fx['L'].copy(), self.fx['R'].copy()
        for k in (1, 2, 3):
            fl[d * k:] += 0.28 ** k * self.fx['R'][: len(fl) - d * k]
            fr[d * k:] += 0.28 ** k * self.fx['L'][: len(fr) - d * k]
        L = self.L + self.bus['L'] * self.duck + fl
        R = self.R + self.bus['R'] * self.duck + fr
        x = np.stack([L[:n], R[:n]])
        x = np.tanh(x * 1.2) / np.tanh(1.2)
        return x / (np.abs(x).max() + 1e-9) * 0.89


def main():
    import sys
    sys.stdout.reconfigure(encoding='utf-8')   # console Windows mặc định cp1252
    tl = json.load(open(TIMELINE, encoding='utf-8'))
    fps, bpm, xf = tl['fps'], tl['bpm'], tl['xf']
    beat = 60.0 / bpm
    scenes = tl['biz']
    starts, t0 = [], 0
    for i, s in enumerate(scenes):
        starts.append(t0)
        t0 += s['dur'] - xf if i < len(scenes) - 1 else s['dur']
    total = t0 / fps
    mix = Mix(total)
    chord_i = 0
    print(f'{len(scenes)} cảnh, {total:.2f}s, {bpm} BPM, phách = {beat * fps:.0f} khung')

    for i, s in enumerate(scenes):
        a = starts[i] / fps
        end = (starts[i + 1] / fps) if i + 1 < len(scenes) else total
        beats = int(round((end - a) / beat))
        mood = s['mood']
        nxt = scenes[i + 1]['mood'] if i + 1 < len(scenes) else None
        prog = PROG['tension' if mood == 'tension' else 'main']
        print(f'  {s["id"]:11s} {a:7.2f}s  {beats:3d} phách  {mood}')

        # mở cảnh: chũm chọe (to ở các bước ngoặt)
        if i > 0:
            big = mood in ('reveal', 'full', 'end')
            mix.add(crash(2.2 if big else 1.2), a, 0.9 if big else 0.45, 0.55)
        if mood == 'reveal':
            mix.add(sub_drop(), a, 0.9)
        if mood == 'end':
            mix.kick(a, 1.3)
            mix.add(sub_drop(1.6), a, 1.0)
            b, notes = CH['C']
            mix.add_st(pad(notes + (72,), end - a + 0.5, cutoff=2200, att=0.02), a, 1.6, ducked=False)
            mix.add(bass(b, 3.5), a, 0.8, ducked=False)
            for k, m in enumerate((60, 64, 67, 72)):
                mix.add(pluck(m, 1.2, 3200), a + k * 0.02, 0.8, 0.3 + 0.13 * k)
            continue

        for bt in range(beats):
            tb = a + bt * beat
            if bt % 4 == 0:   # hợp âm đổi mỗi 4 phách tính từ đầu cảnh
                name = prog[chord_i % len(prog)]
                chord_i += 1
                b, notes = CH[name]
                span = min(4, beats - bt) * beat
                cutoff = {'tension': 900, 'breakdown': 1800, 'build': 1700}.get(mood, 1400)
                mix.add_st(pad(notes, span + 0.25, cutoff), tb, 0.8 if mood in ('breakdown', 'reveal') else 0.55)
            lead_in = mood == 'reveal' and bt < 8   # chờ logo hiện rồi mới vào beat
            last_bar = bt >= beats - 4

            # trống
            if mood == 'tension':
                mix.add(tick(), tb, 0.8, 0.65)
                if bt % 2 == 0:
                    mix.kick(tb, 0.65)
                mix.add(hat(), tb + beat / 2, 0.35, 0.4)
            elif mood == 'breakdown':
                mix.add(hat(), tb + beat / 2, 0.25, 0.4)
            elif not lead_in:
                mix.kick(tb, 1.0 if mood != 'reveal' else 0.8)
                if bt % 2 == 1:
                    mix.add(clap(), tb, 0.8, 0.5)
                mix.add(hat(True), tb + beat / 2, 0.35, 0.6)
                hats = 4 if mood in ('build', 'full') else 2
                for k in range(hats):
                    if k * beat / hats != beat / 2:
                        mix.add(hat(), tb + k * beat / hats, 0.22 if mood == 'groove' else 0.3, 0.35)
                if mood == 'build' and last_bar and bt % 2 == 1:
                    mix.add(clap(), tb + beat / 2, 0.45, 0.5)

            # bass
            if mood == 'tension':
                mix.add(bass(b - 12 + 12, beat * 0.9), tb, 0.55, ducked=True)
            elif mood not in ('breakdown',) and not lead_in:
                for k, mm in enumerate((b, b + 12)):
                    mix.add(bass(mm, beat / 2 * 0.9), tb + k * beat / 2, 0.7, ducked=True)

            # rải hợp âm (pluck)
            if mood in ('groove', 'build', 'full', 'breakdown') or (mood == 'reveal' and not lead_in):
                step = 4 if mood != 'breakdown' else 2
                arp = [notes[0], notes[1], notes[2], notes[0] + 12]
                for k in range(step):
                    m = arp[(bt * step + k) % len(arp)] + (12 if mood == 'full' else 0)
                    mix.add(pluck(m), tb + k * beat / step, 0.55 if mood != 'breakdown' else 0.75, 0.3 + 0.4 * (k % 2), fx=True)

        # chuyển sang bước ngoặt: dâng + dồn trống ở 2 phách cuối
        if nxt in ('reveal', 'full', 'end') or mood == 'breakdown' or nxt == 'breakdown':
            mix.add(riser(2 * beat), end - 2 * beat, 0.9)
            if nxt != 'breakdown':
                for k in range(8):
                    mix.add(clap(), end - beat + k * beat / 8, 0.25 + 0.06 * k, 0.5)

        # điểm nhấn trong cảnh, làm tròn về phách
        for acc in s.get('accents', []):
            ta = a + round(acc / fps / beat) * beat
            if abs(ta - a) < 1e-6:
                continue
            mix.kick(ta, 0.9)
            mix.add(crash(1.0), ta, 0.35, 0.45)
            for k, m in enumerate(notes):
                mix.add(pluck(m + 12, 0.45, 3400), ta, 0.5, 0.3 + 0.2 * k)

    x = mix.render(total)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    pcm = (np.clip(x.T, -1, 1) * 32767).astype('<i2')
    with wave.open(OUT, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'-> {OUT} ({total:.2f}s)')


if __name__ == '__main__':
    main()
