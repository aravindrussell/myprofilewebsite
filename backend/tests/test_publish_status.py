from __future__ import annotations

import subprocess
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.git_status import git_status


def test_publish_status_endpoint_shape(client: TestClient) -> None:
    data = client.get("/api/publish/status").json()
    assert set(data) == {"available", "branch", "changed", "diff_stat", "error"}


def test_git_status_reports_changed_content(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    content = repo / "content"
    content.mkdir(parents=True)

    def git(*args: str) -> None:
        subprocess.run(["git", "-C", str(repo), *args], check=True, capture_output=True)  # noqa: S603, S607

    git("init", "-b", "main")
    git("config", "user.email", "t@example.com")
    git("config", "user.name", "Test")
    (content / "profile.json").write_text("{}\n", "utf-8")
    git("add", ".")
    git("commit", "-m", "init")
    (content / "profile.json").write_text('{"a": 1}\n', "utf-8")

    status = git_status(repo, content)

    assert status["available"] is True
    assert status["branch"] == "main"
    assert status["changed"] == [" M content/profile.json"]
    assert "profile.json" in status["diff_stat"]


def test_git_status_without_git(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.git_status.shutil.which", lambda _: None)
    status = git_status(tmp_path, tmp_path)
    assert status["available"] is False
