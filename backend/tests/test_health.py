from __future__ import annotations

from fastapi.testclient import TestClient

from app.config import load_settings
from app.main import create_app


def test_health_endpoint_responds() -> None:
    client = TestClient(create_app(load_settings()))
    assert client.get("/api/health").json() == {"status": "ok"}
