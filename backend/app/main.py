"""FastAPI application factory for the local admin API (dev environment only)."""

from __future__ import annotations

import json
from typing import Annotated, Any, Literal

from fastapi import Body, FastAPI, File, HTTPException, Response, UploadFile
from pydantic import ValidationError

from app.config import REPO_ROOT, Settings, load_settings
from app.git_status import GitStatus, git_status
from app.models import PortfolioContent
from app.security import LocalOnlyMiddleware, issue_csrf_token
from app.storage import BackupNotFoundError, ContentStore
from app.uploads import UploadError, process_upload


def _format_errors(exc: ValidationError) -> list[dict[str, str]]:
    return [
        {"path": "/" + "/".join(str(p) for p in err["loc"]), "message": err["msg"]}
        for err in exc.errors()
    ]


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or load_settings()
    app = FastAPI(title="Portfolio admin API", docs_url=None, redoc_url=None, openapi_url=None)
    app.state.settings = settings
    app.add_middleware(LocalOnlyMiddleware)
    store = ContentStore(settings.profile_path, settings.backups_dir, settings.max_backups)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/csrf")
    def csrf(response: Response) -> dict[str, str]:
        return {"token": issue_csrf_token(response)}

    @app.get("/api/profile")
    def get_profile() -> dict[str, Any]:
        return store.read().model_dump(mode="json")

    @app.put("/api/profile")
    def put_profile(content: PortfolioContent) -> dict[str, Any]:
        backup = store.save(content)
        return {"saved": True, "backup": backup, "content": content.model_dump(mode="json")}

    @app.post("/api/validate")
    def validate(payload: Annotated[Any, Body()]) -> dict[str, Any]:
        """Validate imported JSON without saving it."""
        try:
            content = PortfolioContent.model_validate(payload)
        except ValidationError as exc:
            return {"valid": False, "errors": _format_errors(exc)}
        return {"valid": True, "errors": [], "content": content.model_dump(mode="json")}

    @app.get("/api/backups")
    def backups() -> list[dict[str, Any]]:
        return [b.__dict__ for b in store.list_backups()]

    @app.post("/api/backups/{name}/restore")
    def restore(name: str) -> dict[str, Any]:
        try:
            content = store.restore(name)
        except BackupNotFoundError as exc:
            raise HTTPException(404, "Backup not found") from exc
        except (ValidationError, json.JSONDecodeError) as exc:
            raise HTTPException(422, "Backup is not valid content") from exc
        return {"restored": name, "content": content.model_dump(mode="json")}

    @app.post("/api/uploads/{kind}")
    async def upload(
        kind: Literal["image", "resume"], file: Annotated[UploadFile, File()]
    ) -> dict[str, str]:
        limit = settings.max_image_bytes if kind == "image" else settings.max_pdf_bytes
        data = await file.read(limit + 1)
        try:
            name, body = process_upload(
                kind,
                file.filename or "upload",
                data,
                max_image=settings.max_image_bytes,
                max_pdf=settings.max_pdf_bytes,
            )
        except UploadError as exc:
            raise HTTPException(422, str(exc)) from exc
        settings.assets_dir.mkdir(parents=True, exist_ok=True)
        (settings.assets_dir / name).write_bytes(body)
        return {"path": f"assets/{name}"}

    @app.get("/api/publish/status")
    def publish_status() -> GitStatus:
        return git_status(REPO_ROOT, settings.content_dir)

    return app
