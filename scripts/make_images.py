"""Generate the default Open Graph image and the apple-touch icon from profile.json.

Usage (from backend/, inside the venv):  python ../scripts/make_images.py
Re-run after changing your name, title or accent colour. Replace the OG image any time by
uploading your own in /admin.
"""

from __future__ import annotations

import json
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BG, FG, MUTED, LINE = "#0B0D12", "#E8EAEE", "#9AA3B2", "#262B37"


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in ("consola.ttf", "DejaVuSansMono.ttf", "Menlo.ttc"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default(size)


def og_image(name: str, title: str, headline: str, accent: str) -> Image.Image:
    img = Image.new("RGB", (1200, 630), BG)
    d = ImageDraw.Draw(img)
    for x in range(0, 1200, 48):
        d.line([(x, 0), (x, 630)], fill="#12151C")
    for y in range(0, 630, 48):
        d.line([(0, y), (1200, y)], fill="#12151C")
    d.text((80, 110), "$ run profile --suite=career", font=font(30), fill=MUTED)
    d.text((80, 200), name, font=font(84), fill=FG)
    d.text((80, 320), title, font=font(44), fill=accent)
    for i, line in enumerate(textwrap.wrap(headline, 68)[:2]):
        d.text((80, 400 + i * 38), line, font=font(26), fill=MUTED)
    d.rectangle([(80, 520), (1120, 522)], fill=LINE)
    d.text((80, 545), "[PASS] all checks passed", font=font(26), fill=accent)
    return img


def touch_icon(initials: str, accent: str) -> Image.Image:
    img = Image.new("RGB", (180, 180), BG)
    d = ImageDraw.Draw(img)
    d.text((90, 92), initials, font=font(78), fill=accent, anchor="mm")
    d.rectangle([(128, 118), (150, 126)], fill=accent)
    return img


def main() -> None:
    data = json.loads((ROOT / "content" / "profile.json").read_text(encoding="utf-8"))
    p, accent = data["profile"], data["theme"]["accentDark"]
    initials = "".join(w[0].upper() for w in p["name"].split() if len(w) > 1)[:2]
    out = ROOT / "content" / "assets" / "og-default.png"
    og_image(p["name"], p["title"], p["headline"], accent).save(out, optimize=True)
    touch_icon(initials, accent).save(ROOT / "frontend" / "public" / "apple-touch-icon.png")
    print(f"Wrote {out} and frontend/public/apple-touch-icon.png")


if __name__ == "__main__":
    main()
