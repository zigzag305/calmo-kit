# CalmoKit brand assets

Direction A, "handle C": a case with its carry handle, and a C for Calmo inside.

| File | Use |
|---|---|
| `calmokit-logo.svg` | Main logo on light backgrounds |
| `calmokit-logo-reverse.svg` | On charcoal, green or photos |
| `calmokit-logo-mono.svg` | One colour (stamps, box print) |
| `calmokit-symbol.svg` / `-reverse.svg` | Symbol alone (avatars, small spaces) |
| `calmokit-ads-square-1200.png` | Google Ads square logo (1:1) |
| `calmokit-ads-landscape-1200x300.png` | Google Ads landscape logo (4:1) |
| `../og-image.png` | Social share image (1200×630) |
| `../favicon.*`, `../icon-*.png`, `../apple-touch-icon.png` | Browser and phone icons |

## Colours
- Signal green `#0B6E4F` (brand, buttons; 5.5:1 on paper)
- Charcoal `#1C1F1D` (text, dark sections)
- Paper `#F4F1EA` (page background)
- Sand `#D9CBB0` (cards, dividers)
- Mint `#8FD1B4` (green text on dark backgrounds only)

## Type
- Headings: Barlow Semi Condensed 600
- Body: Source Sans 3 400/600
- Both self-hosted via @fontsource (no requests to Google Fonts).

## Rules
- Write the name as one word: **CalmoKit**.
- No neon, no grid/HUD overlays, no glass blur, no monospace labels.
- Never use a cross symbol: the red cross is legally protected, and a green cross means pharmacy in ES/PT.

Rebuild every file here with `python3 scripts/brand/build_brand.py .` (needs the fonts in `~/.fonts`, `rsvg-convert`, `uharfbuzz`, `fonttools`, `Pillow`).
