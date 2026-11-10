"""Request guards for the local admin API.

Every request must come from the loopback interface, carry an expected Host header (blocks
DNS rebinding) and, when present, an allow-listed Origin. State-changing requests must also
pass a double-submit CSRF check: the token from GET /api/csrf is set as a SameSite=Strict
cookie and must be echoed in the X-CSRF-Token header.
"""

from __future__ import annotations

import hmac
import secrets

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import Settings

LOOPBACK_HOSTS = frozenset({"127.0.0.1", "::1"})
SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS"})
CSRF_COOKIE = "csrf_token"
CSRF_HEADER = "x-csrf-token"


def _deny(reason: str, status: int = 403) -> JSONResponse:
    return JSONResponse({"detail": reason}, status_code=status)


def check_request(request: Request, settings: Settings) -> str | None:
    """Return a rejection reason, or None if the request may proceed."""
    client = request.client.host if request.client else ""
    if client not in LOOPBACK_HOSTS:
        return "Only localhost clients are allowed"

    host = request.headers.get("host", "")
    if host not in settings.allowed_hosts:
        return "Unexpected Host header"

    origin = request.headers.get("origin")
    if origin is not None and origin not in settings.allowed_origins:
        return "Unexpected Origin header"

    if request.headers.get("sec-fetch-site") == "cross-site":
        return "Cross-site requests are not allowed"

    if request.url.path.startswith("/api/uploads/"):
        # Reject oversized bodies before Starlette buffers the multipart payload.
        length = request.headers.get("content-length", "")
        limit = max(settings.max_image_bytes, settings.max_pdf_bytes) + 64 * 1024
        if not length.isdigit() or int(length) > limit:
            return "Upload too large or missing Content-Length"

    if request.method not in SAFE_METHODS:
        if origin is None:
            return "Missing Origin header"
        cookie = request.cookies.get(CSRF_COOKIE, "")
        header = request.headers.get(CSRF_HEADER, "")
        if not cookie or not header or not hmac.compare_digest(cookie, header):
            return "Missing or invalid CSRF token"
    return None


class LocalOnlyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        reason = check_request(request, request.app.state.settings)
        if reason:
            return _deny(reason)
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response


def issue_csrf_token(response: Response) -> str:
    token = secrets.token_urlsafe(32)
    response.set_cookie(
        CSRF_COOKIE, token, httponly=True, samesite="strict", secure=False, path="/api"
    )
    return token
