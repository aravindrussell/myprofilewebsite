"""FastAPI application factory for the local admin API."""

from __future__ import annotations

from fastapi import FastAPI

from app.config import Settings, load_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or load_settings()
    app = FastAPI(title="Portfolio admin API", docs_url=None, redoc_url=None, openapi_url=None)
    app.state.settings = settings

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app
