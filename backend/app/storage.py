"""Reading and writing content/profile.json: atomic saves with timestamped backups."""

from __future__ import annotations

import json
import os
import re
import tempfile
import threading
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from app.models import PortfolioContent

BACKUP_RE = re.compile(r"^profile-\d{8}-\d{6}-\d{6}\.json$")


class BackupNotFoundError(LookupError):
    pass


@dataclass(frozen=True)
class BackupInfo:
    name: str
    created_at: str
    size: int


def _serialize(content: PortfolioContent) -> str:
    return json.dumps(content.model_dump(mode="json"), indent=2, ensure_ascii=False) + "\n"


def atomic_write(path: Path, text: str) -> None:
    """Write via a temp file in the same directory, fsync, then rename over the target."""
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
            fh.flush()
            os.fsync(fh.fileno())
        Path(tmp).replace(path)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise


class ContentStore:
    def __init__(self, profile_path: Path, backups_dir: Path, max_backups: int) -> None:
        self.profile_path = profile_path
        self.backups_dir = backups_dir
        self.max_backups = max_backups
        self._lock = threading.Lock()

    def read(self) -> PortfolioContent:
        return PortfolioContent.model_validate_json(self.profile_path.read_bytes())

    def save(self, content: PortfolioContent) -> str | None:
        """Back up the current file, then atomically write `content`. Returns the backup name."""
        with self._lock:
            backup = self._backup_current()
            atomic_write(self.profile_path, _serialize(content))
            self._rotate()
            return backup

    def list_backups(self) -> list[BackupInfo]:
        if not self.backups_dir.exists():
            return []
        items = [
            BackupInfo(
                name=p.name,
                created_at=datetime.strptime(p.name[8:30], "%Y%m%d-%H%M%S-%f")
                .replace(tzinfo=UTC)
                .isoformat(),
                size=p.stat().st_size,
            )
            for p in self.backups_dir.iterdir()
            if BACKUP_RE.match(p.name)
        ]
        return sorted(items, key=lambda b: b.name, reverse=True)

    def restore(self, name: str) -> PortfolioContent:
        """Replace profile.json with a backup (the current file is backed up first)."""
        if not BACKUP_RE.match(name):
            raise BackupNotFoundError(name)
        path = self.backups_dir / name
        if not path.is_file():
            raise BackupNotFoundError(name)
        content = PortfolioContent.model_validate_json(path.read_bytes())
        self.save(content)
        return content

    def _backup_current(self) -> str | None:
        if not self.profile_path.exists():
            return None
        self.backups_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(UTC).strftime("%Y%m%d-%H%M%S-%f")
        name = f"profile-{stamp}.json"
        atomic_write(self.backups_dir / name, self.profile_path.read_text(encoding="utf-8"))
        return name

    def _rotate(self) -> None:
        for old in self.list_backups()[self.max_backups :]:
            (self.backups_dir / old.name).unlink(missing_ok=True)
