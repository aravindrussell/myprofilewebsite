"""The API must only be reachable from this machine, from the admin page, with CSRF."""

from __future__ import annotations

import inspect
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app import serve
from app.config import NotDevEnvironmentError, load_settings
from app.main import create_app
from tests.conftest import make_client


def _profile(client: TestClient) -> dict[str, Any]:
    data: dict[str, Any] = client.get("/api/profile").json()
    return data


def test_refuses_to_start_outside_dev(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENV", "production")
    with pytest.raises(NotDevEnvironmentError):
        load_settings()
    with pytest.raises(NotDevEnvironmentError):
        create_app()


def test_serve_binds_to_loopback_only() -> None:
    assert 'host="127.0.0.1"' in inspect.getsource(serve.main)


def test_health(client: TestClient) -> None:
    assert client.get("/api/health").json() == {"status": "ok"}


@pytest.mark.parametrize("remote", ["192.168.1.20", "10.0.0.5", "8.8.8.8"])
def test_rejects_non_localhost_clients(app: FastAPI, remote: str) -> None:
    with make_client(app, client=(remote, 4000)) as c:
        res = c.get("/api/profile")
    assert res.status_code == 403
    assert res.json()["detail"] == "Only localhost clients are allowed"


def test_accepts_ipv6_loopback(app: FastAPI) -> None:
    with make_client(app, client=("::1", 4000)) as c:
        assert c.get("/api/health").status_code == 200


@pytest.mark.parametrize("host", ["evil.example:5173", "localhost:9999", "0.0.0.0:8787"])
def test_rejects_unexpected_host_header(client: TestClient, host: str) -> None:
    res = client.get("/api/profile", headers={"Host": host})
    assert res.status_code == 403
    assert res.json()["detail"] == "Unexpected Host header"


@pytest.mark.parametrize("origin", ["https://evil.example", "http://localhost:3000", "null"])
def test_rejects_unexpected_origin(client: TestClient, origin: str) -> None:
    res = client.get("/api/profile", headers={"Origin": origin})
    assert res.status_code == 403
    assert res.json()["detail"] == "Unexpected Origin header"


def test_rejects_cross_site_fetch_metadata(client: TestClient) -> None:
    res = client.get("/api/profile", headers={"Sec-Fetch-Site": "cross-site"})
    assert res.status_code == 403


def test_get_without_origin_is_allowed(app: FastAPI) -> None:
    with make_client(app) as c:
        assert c.get("/api/profile").status_code == 200


def test_write_without_csrf_token_is_rejected(client: TestClient) -> None:
    res = client.put("/api/profile", json=_profile(client))
    assert res.status_code == 403
    assert res.json()["detail"] == "Missing or invalid CSRF token"


def test_write_with_wrong_csrf_token_is_rejected(client: TestClient) -> None:
    client.get("/api/csrf")
    res = client.put("/api/profile", json=_profile(client), headers={"X-CSRF-Token": "forged"})
    assert res.status_code == 403


def test_write_without_origin_is_rejected(api: TestClient) -> None:
    body = _profile(api)
    del api.headers["Origin"]
    res = api.put("/api/profile", json=body)
    assert res.status_code == 403
    assert res.json()["detail"] == "Missing Origin header"


def test_write_with_valid_csrf_token_succeeds(api: TestClient) -> None:
    assert api.put("/api/profile", json=_profile(api)).status_code == 200


def test_csrf_cookie_is_strict_and_http_only(client: TestClient) -> None:
    cookie = client.get("/api/csrf").headers["set-cookie"].lower()
    assert "samesite=strict" in cookie
    assert "httponly" in cookie


def test_responses_are_not_cached(client: TestClient) -> None:
    assert client.get("/api/profile").headers["cache-control"] == "no-store"
