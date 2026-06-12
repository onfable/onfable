#!/usr/bin/env python3
"""Synthesize the original soundtrack for the onfable 0.1.3 promo video.

Timeline (24 s, mirrors promo/src/Update013.tsx @ 30 fps):
  0.0 -  4.3  hook        — low drone fades in, soft typing ticks
  4.3 - 15.0  terminal    — pulse + hats; typing ticks; chime on approval (~9.8 s)
                            and on "Sent." (~12.3 s)
 15.0 - 19.0  security    — three rising soft hits (15.4 / 15.9 / 16.3 s), riser
 19.0 - 24.0  outro       — chord resolve, everything fades by 23.5 s
"""
import struct
import wave

import numpy as np

SR = 44100
DUR = 24.0
N = int(SR * DUR)
t = np.arange(N) / SR
mix = np.zeros(N)

def env_ad(start, attack, decay, length):
    """Attack/decay envelope as a full-length array starting at `start` s."""
    e = np.zeros(N)
    s = int(start * SR)
    a = int(attack * SR)
    d = int(decay * SR)
    end = min(N, s + a + d)
    if s >= N:
        return e
    a_end = min(N, s + a)
    e[s:a_end] = np.linspace(0, 1, a_end - s, endpoint=False)
    if a_end < end:
        e[a_end:end] = np.exp(-4 * np.linspace(0, 1, end - a_end))
    _ = length
    return e

def tone(freq, start, attack, decay, gain=1.0, harmonics=((1, 1.0),)):
    e = env_ad(start, attack, decay, DUR)
    sig = np.zeros(N)
    for mult, amp in harmonics:
        sig += amp * np.sin(2 * np.pi * freq * mult * t)
    return gain * e * sig

rng = np.random.default_rng(42)
noise = rng.standard_normal(N)

def click(start, gain=0.05, decay=0.012):
    """Short filtered-noise tick (keyboard / hi-hat)."""
    e = env_ad(start, 0.001, decay, DUR)
    return gain * e * noise

# ── bed: dark drone (A1 + A2, slow fade in, out by 23.5 s) ───────────────
drone_env = np.clip(t / 3.0, 0, 1) * np.clip((23.5 - t) / 2.0, 0, 1)
drone = 0.16 * drone_env * (
    np.sin(2 * np.pi * 55 * t)
    + 0.5 * np.sin(2 * np.pi * 110 * t)
    + 0.15 * np.sin(2 * np.pi * 220.5 * t)  # slight detune shimmer
)
mix += drone

# ── pulse: side-chained feel, 96 BPM half-pulse from 4.3 s to 19 s ───────
beat = 60 / 96
pulse_gate = ((t % beat) < beat * 0.55) & (t > 4.3) & (t < 19.0)
pulse_env = np.where(pulse_gate, 1 - ((t % beat) / (beat * 0.55)) ** 2, 0)
mix += 0.11 * pulse_env * np.sin(2 * np.pi * 110 * t)

# ── hats: every half beat during terminal + security ─────────────────────
ht = 4.3
while ht < 19.0:
    mix += click(ht, gain=0.022, decay=0.018)
    ht += beat / 2

# ── typing ticks: hook (0.3-3.6 s) and terminal typed lines ─────────────
def typing(start, end, cps=14, gain=0.05):
    global mix
    tt = start
    step = 1.0 / cps
    while tt < end:
        mix += click(tt + rng.uniform(-0.012, 0.012), gain=gain * rng.uniform(0.6, 1.0))
        tt += step * rng.uniform(0.8, 1.3)

typing(0.35, 1.0)            # "your terminal"
typing(1.05, 1.9)            # "can now send money."
typing(4.4, 5.1)             # $ onfable mcp add base
typing(6.4, 6.8)             # $ onfable
typing(7.1, 8.1)             # › send 5 USDC...
typing(11.0, 12.6, gain=0.04)  # Sent. ...

# ── chimes ───────────────────────────────────────────────────────────────
# wallet connected (~5.5 s): small two-note blip
mix += tone(660, 5.45, 0.004, 0.25, gain=0.10)
mix += tone(880, 5.52, 0.004, 0.30, gain=0.08)
# approval ✓ (~9.85 s): the money shot — bright fifth
mix += tone(880, 9.83, 0.004, 0.55, gain=0.16, harmonics=((1, 1.0), (2, 0.25)))
mix += tone(1318.5, 9.90, 0.004, 0.65, gain=0.13)
# "Sent." confirmation (~12.3 s): warm major third
mix += tone(587.3, 12.30, 0.005, 0.5, gain=0.10)
mix += tone(740.0, 12.38, 0.005, 0.6, gain=0.08)

# ── security scene: three ascending soft hits ────────────────────────────
for i, (when, freq) in enumerate([(15.4, 440.0), (15.87, 554.4), (16.33, 659.3)]):
    mix += tone(freq, when, 0.006, 0.45, gain=0.11, harmonics=((1, 1.0), (2, 0.2)))

# ── riser into outro (17.3 → 19.0 s): filtered noise swell ───────────────
riser_zone = (t > 17.3) & (t < 19.0)
riser_prog = np.where(riser_zone, (t - 17.3) / 1.7, 0)
mix += 0.07 * (riser_prog ** 2) * noise * np.sin(2 * np.pi * (200 + 600 * riser_prog) * t)

# ── outro chord at 19.0 s: A major resolve (A3 C#4 E4 A4), long tail ────
for freq, g in [(220, 0.14), (277.2, 0.10), (329.6, 0.10), (440, 0.08)]:
    mix += tone(freq, 19.0, 0.03, 3.8, gain=g, harmonics=((1, 1.0), (2, 0.15)))
# final sparkle on "the fable writes itself" (~21 s)
mix += tone(1760, 21.0, 0.004, 0.8, gain=0.05)

# ── master: soft clip, global fade out, normalize ────────────────────────
mix = np.tanh(mix * 1.4)
mix *= np.clip((24.0 - t) / 0.6, 0, 1) ** 0.5  # hard fade at the very end
mix = mix / np.max(np.abs(mix)) * 0.85

# subtle stereo: delay right channel 0.6 ms + width on the drone
delay = int(0.0006 * SR)
left = mix
right = np.concatenate([np.zeros(delay), mix[:-delay]])
stereo = np.stack([left, right], axis=1)

out = "/home/user/onfable/promo/public/soundtrack.wav"
import os
os.makedirs(os.path.dirname(out), exist_ok=True)
pcm = (stereo * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {out} ({DUR}s, stereo 16-bit {SR}Hz)")
