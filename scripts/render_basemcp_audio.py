#!/usr/bin/env python3
"""Soundtrack for the Base MCP teaser (10 s, mirrors promo/src/BaseMcp.tsx)."""
import os
import wave

import numpy as np

SR = 44100
DUR = 10.0
N = int(SR * DUR)
t = np.arange(N) / SR
mix = np.zeros(N)
rng = np.random.default_rng(7)
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
        e[a_end:d_end] = np.exp(-4.5 * np.linspace(0, 1, d_end - a_end))
    return e


def tone(freq, start, attack, decay, gain, h2=0.0):
    sig = np.sin(2 * np.pi * freq * t) + h2 * np.sin(2 * np.pi * freq * 2 * t)
    return gain * env(start, attack, decay) * sig


# bed: deep blue drone, fades in fast, out by 9.5 s
bed_env = np.clip(t / 1.2, 0, 1) * np.clip((9.5 - t) / 1.2, 0, 1)
mix += 0.15 * bed_env * (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 110 * t))

# pixel pops: squares assemble between 0.7 s and 3.7 s — short pitched blips
pop_times = sorted(rng.uniform(0.7, 3.7, 38))
for i, pt in enumerate(pop_times):
    f = 520 + 620 * (i / len(pop_times)) * rng.uniform(0.85, 1.15)
    mix += tone(f, pt, 0.002, 0.07, gain=0.045)

# assemble-complete thump (~3.8 s)
mix += tone(110, 3.8, 0.004, 0.5, gain=0.22, h2=0.3)
mix += 0.05 * env(3.8, 0.001, 0.06) * noise

# headline reveal chime (~5.0 s): bright fourth
mix += tone(659.3, 5.0, 0.005, 0.7, gain=0.14, h2=0.2)
mix += tone(880.0, 5.07, 0.005, 0.8, gain=0.11)

# typing ticks for the command (6.2 → 7.8 s)
tt = 6.2
while tt < 7.8:
    mix += 0.04 * rng.uniform(0.6, 1.0) * env(tt, 0.001, 0.012) * noise
    tt += rng.uniform(0.05, 0.1)

# closing resolve (~8.0 s): A major dyad, decays into the fade
mix += tone(440, 8.0, 0.02, 1.6, gain=0.10, h2=0.15)
mix += tone(554.4, 8.05, 0.02, 1.6, gain=0.07)

mix = np.tanh(mix * 1.4)
mix *= np.clip((10.0 - t) / 0.5, 0, 1) ** 0.5
mix = mix / np.max(np.abs(mix)) * 0.85

delay = int(0.0006 * SR)
stereo = np.stack([mix, np.concatenate([np.zeros(delay), mix[:-delay]])], axis=1)

out = "/home/user/onfable/promo/public/basemcp.wav"
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print(f"wrote {out}")
