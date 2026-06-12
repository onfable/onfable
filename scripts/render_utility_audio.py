#!/usr/bin/env python3
"""Fun + dramatic soundtrack for the $ONFABLE utility video (21 s).

Scene cuts @ 3.0, 7.0, 10.0, 13.0, 16.0 s — each gets a slam.
124 BPM four-on-the-floor for energy; playful rising blips; big outro chord.
"""
import os
import wave

import numpy as np

SR = 44100
DUR = 21.0
N = int(SR * DUR)
t = np.arange(N) / SR
mix = np.zeros(N)
rng = np.random.default_rng(21)
noise = rng.standard_normal(N)


def env(start, attack, decay):
    e = np.zeros(N)
    s = int(start * SR)
    if s >= N:
        return e
    a_end = min(N, s + int(attack * SR))
    d_end = min(N, a_end + int(decay * SR))
    e[s:a_end] = np.linspace(0, 1, a_end - s, endpoint=False)
    if a_end < d_end:
        e[a_end:d_end] = np.exp(-5 * np.linspace(0, 1, d_end - a_end))
    return e


def tone(freq, start, attack, decay, gain, h2=0.0):
    sig = np.sin(2 * np.pi * freq * t) + h2 * np.sin(2 * np.pi * freq * 2 * t)
    return gain * env(start, attack, decay) * sig


def kick(start, gain=0.30):
    e = env(start, 0.002, 0.22)
    f = 110 * np.exp(-(np.maximum(t - start, 0)) * 22) + 48
    return gain * e * np.sin(2 * np.pi * f * t)


BEAT = 60 / 124  # ~0.484 s

# drums: kick on every beat from 0.5 s, hats on offbeats, clap on 2&4
bt = 0.5
i = 0
while bt < 19.6:
    mix += kick(bt)
    if i % 2 == 1:
        mix += 0.05 * env(bt, 0.001, 0.03) * noise  # clap-ish
    mix += 0.025 * env(bt + BEAT / 2, 0.001, 0.02) * noise  # offbeat hat
    bt += BEAT
    i += 1

# bouncy bass: octave-hopping A, follows the kick
bt = 0.5
j = 0
while bt < 19.4:
    f = 55 if j % 4 in (0, 1, 3) else 110
    mix += tone(f, bt + 0.02, 0.005, 0.30, gain=0.16, h2=0.4)
    bt += BEAT
    j += 1

# scene slams: pitch-drop boom + noise crash at each cut
for cut in (3.0, 7.0, 10.0, 13.0, 16.0):
    e = env(cut, 0.003, 0.5)
    f = 160 * np.exp(-(np.maximum(t - cut, 0)) * 10) + 40
    mix += 0.34 * e * np.sin(2 * np.pi * f * t)
    mix += 0.08 * env(cut, 0.001, 0.12) * noise

# fun rising blips inside each utility scene (call-and-response feel)
for base_t, n_blips in [(3.4, 3), (7.4, 3), (10.4, 3), (13.4, 3)]:
    for k in range(n_blips):
        f = 660 * (1.2 ** k) * rng.uniform(0.98, 1.02)
        mix += tone(f, base_t + k * 0.22, 0.003, 0.12, gain=0.07)

# sparkle when LIVE stamps land (~3.2 s & 7.2 s): bright fifth
for when in (3.2, 7.2):
    mix += tone(1318.5, when, 0.003, 0.4, gain=0.09)
    mix += tone(1760.0, when + 0.05, 0.003, 0.45, gain=0.07)

# outro (16.0 s): big A-major chord swell + sparkle, drums already fading
for f, g in [(220, 0.16), (277.2, 0.12), (329.6, 0.12), (440, 0.10), (554.4, 0.06)]:
    mix += tone(f, 16.1, 0.05, 4.2, gain=g, h2=0.15)
mix += tone(1760, 18.2, 0.004, 1.0, gain=0.06)

mix = np.tanh(mix * 1.3)
mix *= np.clip((21.0 - t) / 0.8, 0, 1) ** 0.5
mix = mix / np.max(np.abs(mix)) * 0.88

delay = int(0.0006 * SR)
stereo = np.stack([mix, np.concatenate([np.zeros(delay), mix[:-delay]])], axis=1)

out = "/home/user/onfable/promo/public/utility.wav"
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print(f"wrote {out}")
