#!/usr/bin/env python3
"""Synthesizes the effect sound kit into public/sfx/fx-*.wav (numpy and scipy only, no sample licensing).

Design notes (v2): every sound is shaped like a designed sound, not a bare tone or raw noise.
  - whooshes sweep a band of noise through the spectrum (true frequency sweep), then sit in a short room tail
  - impacts are a pitch-dropping sub, a short body, a soft transient, and a room tail
  - UI sounds (pop, tick, type, blip) are soft, rounded and quiet, with the highs rolled off
  - bell sounds use inharmonic partials with different decays
Each file peaks at -10 dBFS. The video applies a per-cue level on top, and the default mode plays only a few cues.
"""
import os
import sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
rng = np.random.default_rng(7)
OUT = os.path.join(os.getcwd(), 'public', 'sfx')
os.makedirs(OUT, exist_ok=True)


def t_(d):
    return np.arange(int(SR * d)) / SR


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def ads(n, a, d, curve=3.0):
    """attack seconds, then exponential-ish decay to the end."""
    t = np.arange(n) / SR
    atk = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-curve * np.clip((t - a) / max(n / SR - a, 1e-4), 0, 1) * 2.3)
    return atk * dec


def room(x, wet=0.22, tail=0.6, damp=5000):
    n = int(SR * tail)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * tail / 4.2))
    ir = lp(ir, damp)
    ir[0] = 0
    ir /= np.max(np.abs(ir)) + 1e-9
    wetsig = signal.fftconvolve(x, ir)[: len(x) + n - 1] * wet * 0.35
    out = np.zeros(len(x) + n - 1)
    out[: len(x)] += x
    out += wetsig
    return out


def sweep_noise(d, f0, f1, width=1.3, shape=1.6):
    """noise whose band center moves from f0 to f1 (Hz) over d seconds, with a smooth in/out envelope."""
    n = int(SR * d)
    noise = rng.standard_normal(n)
    f, tt, Z = signal.stft(noise, SR, nperseg=2048, noverlap=1536)
    center = np.exp(np.interp(tt, [0, tt[-1]], [np.log(f0), np.log(f1)]))
    logf = np.log(np.maximum(f, 20))[:, None]
    mask = np.exp(-0.5 * ((logf - np.log(center)[None, :]) / (width * 0.45)) ** 2)
    _, y = signal.istft(Z * mask, SR, nperseg=2048, noverlap=1536)
    y = y[:n]
    x = np.arange(n) / n
    env = np.sin(np.pi * np.clip(x, 0, 1)) ** shape
    return y * env


def sine_glide(d, f0, f1, curve=4.0):
    t = t_(d)
    f = f1 + (f0 - f1) * np.exp(-curve * t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph)


def normalize(x, peak_db=-10):
    x = x - np.mean(x)
    x = x / (np.max(np.abs(x)) + 1e-9)
    return x * (10 ** (peak_db / 20))


def stereo(x, spread=0.0006):
    d = int(SR * spread)
    r = np.concatenate([np.zeros(d), x])[: len(x)]
    return np.stack([x, r], axis=1)


def write(name, x, peak=-10):
    x = normalize(x, peak)
    y = stereo(np.concatenate([x, np.zeros(int(SR * 0.02))]))
    # fade the last 15 ms so nothing clicks
    k = int(SR * 0.015)
    y[-k:] *= np.linspace(1, 0, k)[:, None]
    wavfile.write(os.path.join(OUT, f'fx-{name}.wav'), SR, (y * 32767).astype(np.int16))
    print('wrote', f'fx-{name}.wav', f'{len(y) / SR:.2f}s')


# ---------- transitions
def whoosh():
    x = sweep_noise(0.75, 260, 3200, width=1.5, shape=1.5)
    x += 0.35 * sweep_noise(0.75, 120, 900, width=1.1, shape=1.4)
    return room(lp(x, 9000), wet=0.25, tail=0.5)


def swish():
    x = sweep_noise(0.34, 1500, 6500, width=1.2, shape=1.2)
    return room(lp(x, 10000), wet=0.15, tail=0.25)


def riser():
    d = 1.3
    x = sweep_noise(d, 250, 5200, width=1.4, shape=1.0)
    n = int(SR * d)
    env = np.linspace(0.15, 1, n) ** 2.2
    tone = sine_glide(d, 180, 760, curve=0.0001) * 0.0
    tone = np.sin(2 * np.pi * np.cumsum(np.linspace(180, 760, n)) / SR) * 0.18
    return room(lp((x * env + tone * env), 9000), wet=0.2, tail=0.4)


# ---------- impacts
def thud():
    d = 0.5
    t = t_(d)
    sub = sine_glide(d, 95, 48, curve=7) * np.exp(-t * 8)
    body = np.sin(2 * np.pi * 118 * t) * np.exp(-t * 22) * 0.45
    tr = lp(rng.standard_normal(len(t)), 3200) * np.exp(-t * 150) * 0.5
    return room(sub + body + tr, wet=0.3, tail=0.55, damp=3000)


def boom():
    d = 1.5
    t = t_(d)
    sub = sine_glide(d, 70, 38, curve=3) * np.exp(-t * 2.4)
    swell = lp(rng.standard_normal(len(t)), 420) * np.exp(-t * 3.4) * 0.6
    tr = lp(rng.standard_normal(len(t)), 2400) * np.exp(-t * 90) * 0.4
    return room(sub + swell + tr, wet=0.4, tail=0.9, damp=2500)


def snap():
    d = 0.18
    t = t_(d)
    tr = hp(rng.standard_normal(len(t)), 900) * np.exp(-t * 120)
    tone = sine_glide(d, 1100, 260, curve=12) * np.exp(-t * 55) * 0.5
    return room(lp(tr + tone, 8000), wet=0.1, tail=0.2)


# ---------- UI-style sounds (soft, rounded)
def pop():
    d = 0.16
    t = t_(d)
    x = sine_glide(d, 520, 250, curve=8) * np.exp(-t * 26)
    x *= np.clip(t / 0.004, 0, 1)
    return lp(x, 3200)


def blip():
    d = 0.14
    t = t_(d)
    x = np.sin(2 * np.pi * (880 + 260 * np.clip(t / 0.05, 0, 1)) * t) * np.exp(-t * 28) * np.clip(t / 0.005, 0, 1)
    return room(lp(x, 4000), wet=0.1, tail=0.2)


def tick():
    d = 0.06
    t = t_(d)
    x = bp(rng.standard_normal(len(t)), 1800, 3400) * np.exp(-t * 220)
    x += np.sin(2 * np.pi * 1450 * t) * np.exp(-t * 110) * 0.35
    return lp(x, 4800)


def typekey():
    d = 0.07
    t = t_(d)
    click = hp(rng.standard_normal(len(t)), 1400) * np.exp(-t * 330)
    thock = np.sin(2 * np.pi * 170 * t) * np.exp(-t * 90) * 0.7
    return lp(click * 0.5 + thock, 5000)


def ding():
    d = 1.4
    t = t_(d)
    base = 1568.0
    x = np.zeros_like(t)
    for ratio, amp, dec in [(1, 1.0, 2.6), (2.76, 0.42, 4.2), (5.4, 0.16, 7.5), (1.5, 0.22, 3.6)]:
        x += amp * np.sin(2 * np.pi * base * ratio * t) * np.exp(-t * dec)
    x *= np.clip(t / 0.003, 0, 1)
    return room(lp(x, 7000), wet=0.28, tail=0.7)


def shutter():
    d = 0.25
    t = t_(d)
    c1 = bp(rng.standard_normal(len(t)), 1800, 6200) * np.exp(-t * 170)
    t2 = np.clip(t - 0.045, 0, None)
    c2 = bp(rng.standard_normal(len(t)), 1200, 4800) * np.exp(-t2 * 150) * (t > 0.045) * 0.7
    mech = np.sin(2 * np.pi * 420 * t) * np.exp(-t * 60) * 0.25
    return room(lp(c1 + c2 + mech, 7000), wet=0.12, tail=0.25)


def crackle():
    d = 1.8
    n = int(SR * d)
    x = np.zeros(n)
    for _ in range(70):
        pos = int(rng.uniform(0, n - 400))
        amp = rng.uniform(0.15, 1.0)
        L = int(rng.uniform(40, 360))
        x[pos : pos + L] += amp * rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 4))
    rumble = lp(rng.standard_normal(n), 220) * 0.8
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7
    return room(lp(hp(x, 700), 7000) * env + rumble * env * 0.5, wet=0.15, tail=0.4)


def glitch():
    d = 0.3
    n = int(SR * d)
    x = np.zeros(n)
    t = t_(d)
    for k in range(5):
        pos = int(SR * (0.02 + k * 0.05))
        L = int(SR * 0.025)
        x[pos : pos + L] += hp(rng.standard_normal(L), 700) * np.hanning(L)
    return lp(x, 8000)


KIT = {
    'whoosh': whoosh, 'swish': swish, 'riser': riser,
    'thud': thud, 'boom': boom, 'snap': snap,
    'pop': pop, 'blip': blip, 'tick': tick, 'type': typekey, 'ding': ding,
    'shutter': shutter, 'crackle': crackle, 'glitch': glitch,
}

if __name__ == '__main__':
    for name, fn in KIT.items():
        write(name, fn())
