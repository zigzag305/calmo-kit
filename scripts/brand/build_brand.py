"""Builds CalmoKit brand assets (direction A: handle C) into calmo-kit/public.

Wordmark text is outlined from Barlow Semi Condensed SemiBold with HarfBuzz
shaping (kerning included), so the SVGs need no font installed.
Run: python3 build_brand.py <repo_root>
"""
import os, subprocess, sys
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

REPO = sys.argv[1]
PUB = os.path.join(REPO, "public")
BRAND = os.path.join(PUB, "brand")
os.makedirs(BRAND, exist_ok=True)
FONT = os.path.expanduser("~/.fonts/barlow-semi-condensed-latin-600-normal.ttf")

GREEN, CHAR, PAPER, WHITE = "#0B6E4F", "#1C1F1D", "#F4F1EA", "#FFFFFF"


def symbol(fill, inner, handle_w=7, c_w=9, tx=0, ty=0, s=1.0):
    """The handle-C symbol in a 100x100 box. inner = colour of the C."""
    return (
        f'<g transform="translate({tx} {ty}) scale({s})">'
        f'<path d="M37 29V19a6 6 0 0 1 6-6h14a6 6 0 0 1 6 6v10" fill="none" stroke="{fill}" stroke-width="{handle_w}"/>'
        f'<rect x="10" y="27" width="80" height="62" rx="14" fill="{fill}"/>'
        f'<path d="M62.6 46.6A17 17 0 1 0 62.6 69.4" fill="none" stroke="{inner}" stroke-width="{c_w}"/>'
        f"</g>"
    )


def wordmark_path(text="CalmoKit", tracking_em=-0.01, font_path=None):
    FONT_ = font_path or FONT
    """Returns (svg path d in font units, advance width, cap height, upm)."""
    blob = hb.Blob.from_file_path(FONT_)
    face = hb.Face(blob)
    font = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    tt = TTFont(FONT_)
    gs = tt.getGlyphSet()
    order = tt.getGlyphOrder()
    upm = tt["head"].unitsPerEm
    cap = tt["OS/2"].sCapHeight
    pen = SVGPathPen(gs)
    x = 0
    track = tracking_em * upm
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        # font units, y up; flip later in the group transform
        gs[name].draw(TransformPen(pen, (1, 0, 0, 1, x + pos.x_offset, pos.y_offset)))
        x += pos.x_advance + track
    return pen.getCommands(), x - track, cap, upm


D, ADV, CAP, UPM = wordmark_path()


def lockup(text_fill, sym_fill, sym_inner, height=100):
    """Horizontal lockup. Symbol box 100 tall; cap height of text = 52% of it,
    baseline aligned with the bottom of the case (y=89)."""
    cap_px = 46.0
    s = cap_px / CAP
    gap = 16
    text_x = 92 + gap
    baseline = 89
    width = text_x + ADV * s + 6
    g = (
        symbol(sym_fill, sym_inner)
        + f'<path transform="translate({text_x:.2f} {baseline}) scale({s:.5f} {-s:.5f})" d="{D}" fill="{text_fill}"/>'
    )
    return g, width


def svg(w, h, body, vb=None, bg=None, title="CalmoKit"):
    vb = vb or f"0 0 {w} {h}"
    rect = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}" role="img" aria-label="{title}">'
        f"<title>{title}</title>{rect}{body}</svg>\n"
    )


def write(path, text):
    with open(path, "w") as f:
        f.write(text)
    print("wrote", os.path.relpath(path, REPO))


def png(svg_path, out, w, h=None):
    args = ["rsvg-convert", "-w", str(w)]
    if h:
        args += ["-h", str(h)]
    subprocess.run(args + ["-o", out, svg_path], check=True)
    print("png  ", os.path.relpath(out, REPO))


# --- vector masters -------------------------------------------------------
write(f"{BRAND}/calmokit-symbol.svg", svg(100, 100, symbol(GREEN, WHITE), vb="6 6 88 88"))
write(f"{BRAND}/calmokit-symbol-reverse.svg", svg(100, 100, symbol(PAPER, GREEN), vb="6 6 88 88"))
lk, LW = lockup(CHAR, GREEN, WHITE)
write(f"{BRAND}/calmokit-logo.svg", svg(round(LW), 100, lk, vb=f"6 6 {LW - 6:.1f} 88"))
lkr, _ = lockup(PAPER, PAPER, GREEN)
write(f"{BRAND}/calmokit-logo-reverse.svg", svg(round(LW), 100, lkr, vb=f"6 6 {LW - 6:.1f} 88"))
lkm, _ = lockup(CHAR, CHAR, WHITE)
write(f"{BRAND}/calmokit-logo-mono.svg", svg(round(LW), 100, lkm, vb=f"6 6 {LW - 6:.1f} 88"))

# Favicon: heavier strokes so the C survives at 16px.
write(f"{PUB}/favicon.svg", svg(32, 32, symbol(GREEN, WHITE, handle_w=10, c_w=12), vb="6 6 88 88"))

# App / social tile: paper symbol on green, safe zone for maskable crops.
def tile(size, occupancy, radius_frac=0.0):
    r = size * radius_frac
    s = size * occupancy / 88
    off = (size - 88 * s) / 2 - 6 * s
    body = f'<rect width="{size}" height="{size}" rx="{r}" fill="{GREEN}"/>' + symbol(PAPER, GREEN, tx=off, ty=off, s=s)
    return svg(size, size, body)

TMP = "/home/claude/brandbuild/tmp"
os.makedirs(TMP, exist_ok=True)
for name, size, occ in [
    ("apple-touch-icon.png", 180, 0.66),
    ("icon-192.png", 192, 0.66),
    ("icon-512.png", 512, 0.66),
    ("icon-maskable-512.png", 512, 0.52),
]:
    p = f"{TMP}/{name}.svg"
    write(p, tile(size, occ))
    png(p, f"{PUB}/{name}", size)
for sz in (16, 32, 48):
    png(f"{PUB}/favicon.svg", f"{TMP}/fav-{sz}.png", sz)
from PIL import Image
imgs = [Image.open(f"{TMP}/fav-{sz}.png") for sz in (16, 32, 48)]
imgs[0].save(f"{PUB}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=imgs[1:])
print("ico   public/favicon.ico")

# --- Google Ads + social ----------------------------------------------------
# Square 1200x1200: symbol over wordmark, on paper.
ws = 360 / CAP * 0.62
sq_text_w = ADV * ws
sq = (
    symbol(GREEN, WHITE, tx=600 - 50 * 5.2, ty=170, s=5.2)
    + f'<path transform="translate({600 - sq_text_w / 2:.1f} 960) scale({ws:.5f} {-ws:.5f})" d="{D}" fill="{CHAR}"/>'
)
write(f"{TMP}/ads-square.svg", svg(1200, 1200, sq, bg=PAPER))
png(f"{TMP}/ads-square.svg", f"{BRAND}/calmokit-ads-square-1200.png", 1200)

# Landscape 1200x300 (4:1): horizontal lockup centred on paper.
scale = 170 / 88
lw = (LW - 6) * scale
land = f'<g transform="translate({(1200 - lw) / 2 - 6 * scale:.1f} {150 - 50 * scale:.1f}) scale({scale:.4f})">{lk}</g>'
write(f"{TMP}/ads-landscape.svg", svg(1200, 300, land, bg=PAPER))
png(f"{TMP}/ads-landscape.svg", f"{BRAND}/calmokit-ads-landscape-1200x300.png", 1200, 300)

TD, TADV, _, TUPM = wordmark_path("Kits de emergencia 72 h · Portugal y España", 0, os.path.expanduser("~/.fonts/source-sans-3-latin-400-normal.ttf"))
ts = 44 / TUPM
# Open Graph 1200x630: lockup + one line, using the installed body font.
scale = 140 / 88
lw = (LW - 6) * scale
og = (
    f'<g transform="translate({(1200 - lw) / 2 - 6 * scale:.1f} {230 - 50 * scale:.1f}) scale({scale:.4f})">{lk}</g>'
    f'<path transform="translate({600 - TADV * ts / 2:.1f} 420) scale({ts:.5f} {-ts:.5f})" d="{TD}" fill="#4F5550"/>'
    f'<rect x="0" y="606" width="1200" height="24" fill="{GREEN}"/>'
)
write(f"{TMP}/og.svg", svg(1200, 630, og, bg=PAPER))
png(f"{TMP}/og.svg", f"{PUB}/og-image.png", 1200, 630)
