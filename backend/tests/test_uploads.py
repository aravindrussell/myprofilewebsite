"""Uploads are type-checked by content, size-limited, renamed safely and re-encoded."""

from __future__ import annotations

import io
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.uploads import UploadError, process_upload, safe_stem


def _png(size: tuple[int, int] = (40, 30), exif: bool = False) -> bytes:
    img = Image.new("RGB", size, "#2563EB")
    out = io.BytesIO()
    if exif:
        data = Image.Exif()
        data[0x010F] = "SecretCameraMaker"  # Make
        img.save(out, "JPEG", exif=data)
    else:
        img.save(out, "PNG")
    return out.getvalue()


PDF = b"%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\ntrailer << >>\n%%EOF\n"


def test_image_upload_is_reencoded_to_webp(api: TestClient, content_dir: Path) -> None:
    res = api.post("/api/uploads/image", files={"file": ("My Photo!.PNG", _png(), "image/png")})
    assert res.status_code == 200
    path = res.json()["path"]
    assert path.startswith("assets/my-photo-") and path.endswith(".webp")
    with Image.open(content_dir / path) as img:
        assert img.format == "WEBP"
        assert img.size == (40, 30)


def test_image_metadata_is_stripped() -> None:
    _, body = process_upload("image", "a.jpg", _png(exif=True), max_image=10**7, max_pdf=10**7)
    assert b"SecretCameraMaker" not in body
    with Image.open(io.BytesIO(body)) as img:
        assert not img.getexif()


def test_large_images_are_downscaled() -> None:
    _, body = process_upload("image", "a.png", _png((3000, 1000)), max_image=10**8, max_pdf=0)
    with Image.open(io.BytesIO(body)) as img:
        assert max(img.size) == 2400


def test_content_type_header_is_not_trusted(api: TestClient) -> None:
    res = api.post("/api/uploads/image", files={"file": ("x.png", b"<svg onload=1>", "image/png")})
    assert res.status_code == 422


@pytest.mark.parametrize(
    "payload",
    [
        b'<svg xmlns="http://www.w3.org/2000/svg"/>',
        b"GIF89a....",
        b"\x89PNG\r\n\x1a\ntruncated",
        b"MZ\x90\x00 executable",
    ],
)
def test_rejects_non_images(payload: bytes) -> None:
    with pytest.raises(UploadError):
        process_upload("image", "x.png", payload, max_image=10**7, max_pdf=10**7)


def test_image_size_limit() -> None:
    with pytest.raises(UploadError, match="at most"):
        process_upload("image", "x.png", _png(), max_image=10, max_pdf=10**7)


def test_pdf_upload(api: TestClient, content_dir: Path) -> None:
    res = api.post("/api/uploads/resume", files={"file": ("CV 2025.pdf", PDF, "application/pdf")})
    assert res.status_code == 200
    path = res.json()["path"]
    assert path.startswith("assets/cv-2025-") and path.endswith(".pdf")
    assert (content_dir / path).read_bytes() == PDF


@pytest.mark.parametrize(
    "payload",
    [
        b"not a pdf",
        b"%PDF-1.7 no end marker",
        PDF.replace(b"/Catalog", b"/Catalog /OpenAction << /S /JavaScript /JS (app.alert(1)) >>"),
    ],
)
def test_rejects_bad_pdfs(payload: bytes) -> None:
    with pytest.raises(UploadError):
        process_upload("resume", "cv.pdf", payload, max_image=10**7, max_pdf=10**7)


def test_pdf_size_limit() -> None:
    with pytest.raises(UploadError, match="at most"):
        process_upload("resume", "cv.pdf", PDF, max_image=10**7, max_pdf=10)


def test_oversized_request_is_rejected_before_parsing(api: TestClient) -> None:
    res = api.post(
        "/api/uploads/resume",
        content=b"x" * 10,
        headers={"Content-Length": str(50 * 1024 * 1024), "Content-Type": "multipart/form-data"},
    )
    assert res.status_code == 403
    assert "too large" in res.json()["detail"]


def test_unknown_upload_kind(api: TestClient) -> None:
    res = api.post("/api/uploads/script", files={"file": ("x.js", b"alert(1)", "text/javascript")})
    assert res.status_code == 422


def test_upload_requires_csrf(client: TestClient) -> None:
    res = client.post("/api/uploads/image", files={"file": ("a.png", _png(), "image/png")})
    assert res.status_code == 403


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("../../etc/passwd", "passwd"),
        ("..\\..\\windows\\system32\\evil.png", "evil"),
        ("Résumé (final).pdf", "r-sum-final"),
        ("....png", "png"),
        ("!!!.png", "file"),
        ("a" * 200 + ".png", "a" * 40),
    ],
)
def test_safe_stem(name: str, expected: str) -> None:
    assert safe_stem(name) == expected
