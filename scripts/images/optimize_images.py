"""Builds the web images in public/images from the originals in assets/.

Run from the repo root:  python3 scripts/images/optimize_images.py
Needs Pillow (with WebP) and rsvg-convert for the SVG illustrations.

Why: the product photos were shipped at full size (one was 3.5 MB, the whole
folder 13 MB) for cards that render at ~300 px. Each product now gets:
  <id>.webp      1000 px, product modal and 2x screens
  <id>-480.webp  480 px, catalog cards, cart and phones (srcset)
  <id>.jpg       800 px on white, for Stripe line items and schema.org
"""
import pathlib, subprocess, tempfile
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "assets"
OUT = ROOT / "public/images"

PRODUCTS = {
    "calmo-crisis-72h": "photos/kit-crisis.jpg",
    "calmo-wilderness-pro": "photos/kit-wilderness.png",
    "calmo-blackout-home": "photos/kit-blackout.png",
    "calmo-food-hydration": "photos/kit-food.webp",
    "gear-water-filter": "photos/gear-filter.png",
    "gear-trauma-kit": "photos/gear-medkit.jpg",
    "gear-weather-radio": "photos/gear-radio.jpg",
    "gear-meal-pack": "photos/gear-rations.webp",
    # Illustrations until suppliers send licensed product photos.
    "gear-home-safety-duo": "illustrations/home-safety-duo.svg",
    "gear-car-escape-tool": "illustrations/car-escape-tool.svg",
    "gear-dual-power-lantern": "illustrations/dual-power-lantern.svg",
    "gear-compact-multitool": "illustrations/compact-multitool.svg",
}
# Full-bleed photos used outside product cards.
PHOTOS = {
    "hero-mountain": ("photos/hero-mountain.jpg", [1600, 800]),
    "banner-kits": ("photos/banner-kits.jpg", [900]),
    "banner-gear": ("photos/banner-gear.jpg", [600]),
}


def load(path: pathlib.Path) -> Image.Image:
    if path.suffix == ".svg":
        tmp = pathlib.Path(tempfile.mkdtemp()) / "x.png"
        subprocess.run(["rsvg-convert", "-w", "1000", "-h", "1000", str(path), "-o", str(tmp)], check=True)
        path = tmp
    im = Image.open(path)
    if im.mode in ("P", "LA", "RGBA"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, "white")
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert("RGB")


def fit(im: Image.Image, side: int) -> Image.Image:
    im = im.copy()
    im.thumbnail((side, side), Image.LANCZOS)
    return im


def kb(p: pathlib.Path) -> str:
    return f"{p.stat().st_size / 1024:.0f} KB"


(OUT / "products").mkdir(parents=True, exist_ok=True)
for pid, rel in PRODUCTS.items():
    im = load(SRC / rel)
    big = OUT / "products" / f"{pid}.webp"
    fit(im, 1000).save(big, "WEBP", quality=80, method=6)
    small = OUT / "products" / f"{pid}-480.webp"
    fit(im, 480).save(small, "WEBP", quality=78, method=6)
    jpg = OUT / "products" / f"{pid}.jpg"
    fit(im, 800).save(jpg, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"{pid:26s} {kb(big):>7s} {kb(small):>7s} {kb(jpg):>7s}")

for name, (rel, widths) in PHOTOS.items():
    im = load(SRC / rel)
    for i, w in enumerate(widths):
        copy = im.copy()
        if copy.width > w:
            copy = copy.resize((w, round(copy.height * w / copy.width)), Image.LANCZOS)
        suffix = "" if i == 0 else f"-{w}"
        out = OUT / f"{name}{suffix}.webp"
        copy.save(out, "WEBP", quality=78, method=6)
        print(f"{name}{suffix:22s} {kb(out):>7s}  {copy.size}")
