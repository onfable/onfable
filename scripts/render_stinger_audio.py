#!/usr/bin/env python3
"""3.5 s glitch-stinger audio for the onfable brand sting (promo/src/Stinger.tsx)."""
import os
import wave

import numpy as np

SR = 44100
DUR = 3.5
N = int(SR * DUR)
t = np.arange(N) / SR
mix = np.zeros(N)
rng = np.random.default_rng(11)
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


# Glitch zones mirror the video's intensity curve: ~0.73-1.7 s and 2.1-2.5 s
for zone_start, zone_end, density in [(0.7, 1.7, 18), (2.05, 2.5, 8)]:
    for start in sorted(rng.uniform(zone_start, zone_end, density)):
        dur = rng.uniform(0.02, 0.06)
        # bit-crushed stutter: gated noise + a square-ish buzz at random pitch
        f = rng.uniform(180, 900)
        seg = env(start, 0.002, dur)
        mix += 0.10 * rng.uniform(0.5, 1.0) * seg * noise
        mix += 0.06 * seg * np.sign(np.sin(2 * np.pi * f * t))

# low whoomp at each glitch onset
for when in (0.7, 2.05):
    e = env(when, 0.005, 0.4)
    mix += 0.22 * e * np.sin(2 * np.pi * (60 + 30 * np.exp(-(t - when) * 8)) * t)

# resolve: soft tonic blip when the wordmark settles (~2.9 s)
e = env(2.9, 0.01, 0.5)
mix += 0.12 * e * np.sin(2 * np.pi * 440 * t)
mix += 0.08 * env(2.95, 0.01, 0.55) * np.sin(2 * np.pi * 660 * t)

mix = np.tanh(mix * 1.5)
mix *= np.clip((3.5 - t) / 0.25, 0, 1) ** 0.5
mix = mix / np.max(np.abs(mix)) * 0.85

delay = int(0.0005 * SR)
stereo = np.stack([mix, np.concatenate([np.zeros(delay), mix[:-delay]])], axis=1)

out = "/home/user/onfable/promo/public/stinger.wav"
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print(f"wrote {out}")
