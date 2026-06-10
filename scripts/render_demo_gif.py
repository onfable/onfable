#!/usr/bin/env python3
"""Animated terminal GIF of an onfable usage session (typing effect)."""
from PIL import Image, ImageDraw, ImageFont

BG = (10, 10, 11)
BAR = (24, 24, 27)
WHITE = (240, 240, 245)
MUTED = (113, 113, 122)
GREEN = (110, 211, 154)
DIM = (82, 82, 91)

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FS = 22
PAD = 30
LINE_H = 33
TITLE_H = 48
WIDTH_CHARS = 60
SCALE = 2

font = ImageFont.truetype(FONT, FS * SCALE)
font_b = ImageFont.truetype(FONT_B, FS * SCALE)
CHAR_W = ImageFont.truetype(FONT, FS).getlength("M")

# Script: (text, color, bold, mode)  mode: "type" | "instant" | "blank"
SCRIPT = [
    ("$ onfable", WHITE, False, "type"),
    ("✳ onfable — your machine, your agent, your story", WHITE, True, "instant"),
    ("", WHITE, False, "blank"),
    ("› summarize this repo and list the 3 biggest files", WHITE, False, "type"),
    ("", WHITE, False, "blank"),
    ("⚒ list_dir: . → 14 entries", DIM, False, "instant"),
    ("⚒ run_command: du -ah . | sort -rh | head -3", DIM, False, "instant"),
    ("  ✓ approved", GREEN, False, "instant"),
    ("⚒ read_file: package.json → 41 lines", DIM, False, "instant"),
    ("", WHITE, False, "blank"),
    ("It's a pnpm monorepo: a TypeScript CLI agent (packages/cli)", WHITE, False, "type"),
    ("and a Next.js site (apps/web). Biggest files:", WHITE, False, "type"),
    ("  1. pnpm-lock.yaml   2. dist/index.js   3. README.md", WHITE, False, "instant"),
    ("", WHITE, False, "blank"),
    ("⚒ memory_save: user works in a pnpm TS monorepo", DIM, False, "instant"),
]

ROWS = 16  # visible rows
W = int(PAD * 2 + WIDTH_CHARS * CHAR_W)
H = PAD * 2 + TITLE_H + ROWS * LINE_H


def render(visible, typing_text=None, caret=True):
    img = Image.new("RGB", (W * SCALE, H * SCALE), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W * SCALE, TITLE_H * SCALE], fill=BAR)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        cx = (PAD // 2 + 8 + i * 24) * SCALE
        cy = (TITLE_H // 2) * SCALE
        r = 7 * SCALE
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)
    title = "onfable — ~/onfable"
    tw = ImageFont.truetype(FONT, FS).getlength(title) * SCALE
    d.text(((W * SCALE - tw) / 2, (TITLE_H // 2 - FS // 2) * SCALE), title,
           font=ImageFont.truetype(FONT, FS * SCALE), fill=DIM)

    y = (TITLE_H + PAD // 2) * SCALE
    for text, color, bold in visible:
        f = font_b if bold else font
        d.text((PAD * SCALE, y), text, font=f, fill=color)
        y += LINE_H * SCALE
    if typing_text is not None:
        text, color, bold = typing_text
        f = font_b if bold else font
        d.text((PAD * SCALE, y), text, font=f, fill=color)
        if caret:
            cx = PAD * SCALE + ImageFont.truetype(FONT, FS).getlength(text) * SCALE
            d.rectangle([cx, y + 3 * SCALE, cx + CHAR_W * SCALE, y + (FS + 4) * SCALE],
                        fill=WHITE)
    return img.resize((W, H), Image.LANCZOS)


frames = []
durations = []
done = []  # completed lines (text,color,bold)

for text, color, bold, mode in SCRIPT:
    # keep only last ROWS-1 lines visible
    vis = done[-(ROWS - 1):]
    if mode == "blank":
        done.append(("", color, bold))
        continue
    if mode == "type":
        for i in range(1, len(text) + 1):
            frames.append(render(vis, (text[:i], color, bold)))
            durations.append(45)
        # hold the completed line a beat
        frames.append(render(vis, (text, color, bold), caret=False))
        durations.append(380)
    else:  # instant
        frames.append(render(vis, (text, color, bold), caret=False))
        durations.append(360)
    done.append((text, color, bold))

# final hold
frames.append(render(done[-(ROWS - 1):]))
durations.append(2600)

out = "/home/user/onfable/assets/demo.gif"
frames[0].save(out, save_all=True, append_images=frames[1:], duration=durations,
               loop=0, optimize=True)
print(f"wrote {out} ({W}x{H}, {len(frames)} frames)")
