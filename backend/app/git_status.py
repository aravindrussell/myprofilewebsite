"""Read-only git summary for the admin publish checklist (fixed argv, never a shell)."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from typing import TypedDict


class GitStatus(TypedDict):
    available: bool
    branch: str
    changed: list[str]
    diff_stat: str
    error: str


def _git(repo: Path, *args: str) -> str:
    git = shutil.which("git")
    if git is None:
        raise FileNotFoundError("git")
    result = subprocess.run(  # noqa: S603 - fixed argv, no shell, no user input
        [git, "-C", str(repo), *args],
        capture_output=True,
        text=True,
        timeout=5,
        check=True,
    )
    return result.stdout


def git_status(repo: Path, content_dir: Path) -> GitStatus:
    try:
        rel = content_dir.resolve().relative_to(repo.resolve()).as_posix()
    except ValueError:
        rel = "."
    try:
        branch = _git(repo, "rev-parse", "--abbrev-ref", "HEAD").strip()
        porcelain = _git(repo, "status", "--porcelain", "--", rel)
        stat = _git(repo, "diff", "--stat", "--", rel)
    except (FileNotFoundError, subprocess.SubprocessError) as exc:
        return GitStatus(available=False, branch="", changed=[], diff_stat="", error=str(exc))
    return GitStatus(
        available=True,
        branch=branch,
        changed=[line for line in porcelain.splitlines() if line.strip()],
        diff_stat=stat.strip(),
        error="",
    )
