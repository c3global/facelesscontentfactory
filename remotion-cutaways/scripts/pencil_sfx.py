"""Synthesizes pencil-on-paper writing sounds (no licensed audio needed).

Writes public/sfx/pencil-line.wav (about one handwritten line, 1.17 s) and
public/sfx/pencil-underline.wav (one quick stroke, 0.5 s). Run: python3 scripts/pencil_sfx.py
Needs numpy only. Timings match LSNote in src/LifeSceneOverlays.tsx (28 frames per line at 24 fps).
"""
import wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def bandpass(x, lo, hi):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    # soften the band edges
    k = max(1, int(len(f) * 0.002))
    m = np.convolve(m, np.ones(k) / k, mode='same')
    return np.fft.irfft(spec * m, len(x))


def stroke(n, bright):
    x = rng.standard_normal(n)
    hi = bandpass(x, 2200, 7500)
    mid = bandpass(x, 700, 2200)
    y = bright * hi + (1 - bright) * 0.7 * mid
    t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t ** 0.7) ** 1.2  # quick attack, softer release
    return y * env


def line(duration, words_every=(4, 7)):
    n = int(duration * SR)
    out = np.zeros(n)
    pos = int(0.03 * SR)
    count, next_word = 0, rng.integers(*words_every)
    while pos < n - int(0.12 * SR):
        dur = int(rng.uniform(0.06, 0.15) * SR)
        amp = rng.uniform(0.55, 1.0)
        s = stroke(dur, rng.uniform(0.55, 1.0)) * amp
        end = min(n, pos + dur)
        out[pos:end] += s[: end - pos]
        count += 1
        gap = rng.uniform(0.012, 0.045)
        if count >= next_word:
            gap = rng.uniform(0.11, 0.2)  # lift between words
            count, next_word = 0, rng.integers(*words_every)
        pos = end + int(gap * SR)
    fade = int(0.015 * SR)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out


def underline(duration):
    n = int(duration * SR)
    s = stroke(n, 0.9)
    t = np.linspace(0, 1, n)
    return s * (0.5 + 0.5 * np.sin(np.pi * t))


def save(path, mono, peak=0.6):
    mono = mono / (np.max(np.abs(mono)) + 1e-9) * peak
    data = (np.stack([mono, mono], axis=1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


save('public/sfx/pencil-line.wav', line(28 / 24))
save('public/sfx/pencil-underline.wav', underline(0.5))
print('ok')
