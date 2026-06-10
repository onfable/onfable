#!/usr/bin/env python3
"""Render terminal mockups (PNG + animated GIF) for onfable marketing."""
from PIL import Image, ImageDraw, ImageFont

# ── palette (matches onfable: pure black bg, white text) ──────────────
BG = (10, 10, 11)          # #0a0a0b card
BAR = (24, 24, 27)         # title bar
EDGE = (28, 28, 31)
WHITE = (240, 240, 245)
MUTED = (113, 113, 122)
GREEN = (110, 211, 154)
CYAN = (125, 211, 252)
DIM = (82, 82, 91)
DOT = (63, 63, 70)

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FS = 26
PAD = 38
LINE_H = 40
TITLE_H = 56

font = ImageFont.truetype(FONT, FS)
font_b = ImageFont.truetype(FONT_B, FS)
CHAR_W = font.getlength("M")


def draw_window(width_chars, lines, out, scale=2):
    """lines: list of (segments, ) where segments = [(text, color, bold)]."""
    w = int(PAD * 2 + width_chars * CHAR_W)
    h = PAD * 2 + TITLE_H + len(lines) * LINE_H
    img = Image.new("RGB", (w * scale, h * scale), BG)
    d = ImageDraw.Draw(img)

    def S(v):
        return v * scale

    # title bar
    d.rectangle([0, 0, w * scale, S(TITLE_H)], fill=BAR)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        cx = S(PAD // 2 + 10 + i * 26)
        cy = S(TITLE_H // 2)
        r = S(8)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)
    title = "onfable"
    tw = font.getlength(title) * scale
    d.text(((w * scale - tw) / 2, S(TITLE_H // 2 - FS // 2)), title,
           font=ImageFont.truetype(FONT, FS * scale), fill=MUTED)

    fnt = ImageFont.truetype(FONT, FS * scale)
    fnt_b = ImageFont.truetype(FONT_B, FS * scale)
    y = S(TITLE_H + PAD // 2)
    for segs in lines:
        x = S(PAD)
        for text, color, bold in segs:
            f = fnt_b if bold else fnt
            d.text((x, y), text, font=f, fill=color)
            x += font.getlength(text) * scale
        y += S(LINE_H)

    img = img.resize((w, h), Image.LANCZOS)
    img.save(out)
    print(f"wrote {out} ({w}x{h})")
    return img


# ── 1. INSTALL session (static PNG) ───────────────────────────────────
install_lines = [
    [("$ ", DIM, False), ("curl -fsSL onfable.xyz/install.sh | sh", WHITE, False)],
    [("", WHITE, False)],
    [("  ✳ onfable", WHITE, True)],
    [("  the agent that lives in your terminal", MUTED, False)],
    [("", WHITE, False)],
    [("✓", GREEN, True), (" Node v22.22 detected", WHITE, False)],
    [("Installing onfable via npm…", MUTED, False)],
    [("✓", GREEN, True), (" onfable installed", WHITE, False)],
    [("✓", GREEN, True), (" onfable 0.1.1 is on your PATH", WHITE, False)],
    [("", WHITE, False)],
    [("  Next: run ", MUTED, False), ("onfable setup", GREEN, True),
     (" to begin.", MUTED, False)],
]
draw_window(52, install_lines, "/home/user/onfable/assets/install.png")
