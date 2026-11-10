"""Upload sanitisation: type sniffing, size limits, safe names, image re-encoding."""

from __future__ import annotations

import hashlib
import io
import re
from pathlib import Path
from typing import Literal

from PIL import Image, ImageOps, UnidentifiedImageError

UploadKind = Literal["image", "resume"]

MAX_IMAGE_EDGE = 2400
Image.MAX_IMAGE_PIXELS = 40_000_000  # decompression-bomb guard

# Markers of active content that has no place in a resume PDF.
PDF_ACTIVE_CONTENT = (b"/JavaScript", b"/JS", b"/Launch", b"/EmbeddedFile", b"/OpenAction")


class UploadError(ValueError):
    pass


def sniff(data: bytes) -> str | None:
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    if data.startswith(b"%PDF-"):
        return "pdf"
    return None


def safe_stem(filename: str) -> str:
    stem = Path(filename.replace("\\", "/")).stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    return stem[:40] or "file"


def _reencode_image(data: bytes) -> bytes:
    """Decode and re-encode as WebP: drops metadata (EXIF/GPS) and any trailing payloads."""
    try:
        with Image.open(io.BytesIO(data)) as probe:
            probe.verify()
        with Image.open(io.BytesIO(data)) as source:
            img: Image.Image = ImageOps.exif_transpose(source)
            img.thumbnail((MAX_IMAGE_EDGE, MAX_IMAGE_EDGE))
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
            out = io.BytesIO()
            img.save(out, "WEBP", quality=85, method=6)
            return out.getvalue()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise UploadError("The image could not be decoded") from exc


def process_upload(
    kind: UploadKind, filename: str, data: bytes, *, max_image: int, max_pdf: int
) -> tuple[str, bytes]:
    """Validate an upload and return (safe filename, bytes to store)."""
    detected = sniff(data)
    if kind == "image":
        if len(data) > max_image:
            raise UploadError(f"Images must be at most {max_image // (1024 * 1024)} MB")
        if detected not in {"png", "jpeg", "webp"}:
            raise UploadError("Only PNG, JPEG or WebP images are accepted")
        body, ext = _reencode_image(data), "webp"
    else:
        if len(data) > max_pdf:
            raise UploadError(f"PDFs must be at most {max_pdf // (1024 * 1024)} MB")
        if detected != "pdf" or b"%%EOF" not in data[-2048:]:
            raise UploadError("Only PDF files are accepted")
        if any(marker in data for marker in PDF_ACTIVE_CONTENT):
            raise UploadError("PDFs with scripts, actions or embedded files are not accepted")
        body, ext = data, "pdf"
    digest = hashlib.sha256(body).hexdigest()[:10]
    return f"{safe_stem(filename)}-{digest}.{ext}", body
