"""Runtime settings for the local admin API."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

DEV_WEB_PORT = 5173


class NotDevEnvironmentError(RuntimeError):
    """Raised when the API is started outside the dev environment."""


@dataclass(frozen=True)
class Settings:
    content_dir: Path
    api_port: int = 8787
    max_backups: int = 30
    max_image_bytes: int = 5 * 1024 * 1024
    max_pdf_bytes: int = 10 * 1024 * 1024
    allowed_origins: frozenset[str] = field(default_factory=frozenset)
    allowed_hosts: frozenset[str] = field(default_factory=frozenset)

    @property
    def profile_path(self) -> Path:
        return self.content_dir / "profile.json"

    @property
    def backups_dir(self) -> Path:
        return self.content_dir / "backups"

    @property
    def assets_dir(self) -> Path:
        return self.content_dir / "assets"


def load_settings() -> Settings:
    """Build settings from the environment. Refuses to run unless ENV=dev."""
    if os.environ.get("ENV") != "dev":
        raise NotDevEnvironmentError(
            "The admin API only runs in the dev environment. Set ENV=dev to start it."
        )
    api_port = int(os.environ.get("API_PORT", "8787"))
    content_dir = Path(os.environ.get("CONTENT_DIR") or REPO_ROOT / "content").resolve()
    ports = (DEV_WEB_PORT, api_port)
    names = ("localhost", "127.0.0.1")
    return Settings(
        content_dir=content_dir,
        api_port=api_port,
        allowed_origins=frozenset(f"http://{n}:{p}" for n in names for p in ports),
        allowed_hosts=frozenset(f"{n}:{p}" for n in names for p in ports),
    )
