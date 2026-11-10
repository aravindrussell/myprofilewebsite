from __future__ import annotations

import shutil
from collections.abc import Iterator
from dataclasses import replace
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.config import REPO_ROOT, Settings, load_settings
from app.main import create_app

ORIGIN = "http://localhost:5173"
LOCAL_CLIENT = ("127.0.0.1", 51000)


@pytest.fixture(autouse=True)
def _dev_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENV", "dev")
    monkeypatch.delenv("CONTENT_DIR", raising=False)


@pytest.fixture
def content_dir(tmp_path: Path) -> Path:
    """A throwaway copy of content/ so tests never touch the real profile.json."""
    target = tmp_path / "content"
    target.mkdir()
    shutil.copy(REPO_ROOT / "content" / "profile.json", target / "profile.json")
    return target


@pytest.fixture
def settings(content_dir: Path) -> Settings:
    return replace(load_settings(), content_dir=content_dir, max_backups=3)


@pytest.fixture
def app(settings: Settings) -> FastAPI:
    return create_app(settings)


def make_client(app: FastAPI, client: tuple[str, int] = LOCAL_CLIENT) -> TestClient:
    return TestClient(app, base_url="http://localhost:5173", client=client)


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    """Localhost client with an allowed Origin (no CSRF token yet)."""
    with make_client(app) as c:
        c.headers["Origin"] = ORIGIN
        yield c


@pytest.fixture
def api(client: TestClient) -> TestClient:
    """Fully authorised client: allowed origin plus a valid CSRF token."""
    token = client.get("/api/csrf").json()["token"]
    client.headers["X-CSRF-Token"] = token
    return client
