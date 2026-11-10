"""Saves are validated, atomic, backed up, rotated and undoable."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.models import PortfolioContent
from app.storage import BackupNotFoundError, ContentStore, atomic_write


def _profile(api: TestClient) -> dict[str, Any]:
    data: dict[str, Any] = api.get("/api/profile").json()
    return data


def _on_disk(content_dir: Path) -> dict[str, Any]:
    data: dict[str, Any] = json.loads((content_dir / "profile.json").read_text("utf-8"))
    return data


def test_save_writes_profile_and_creates_backup(api: TestClient, content_dir: Path) -> None:
    original = _on_disk(content_dir)
    body = _profile(api)
    body["profile"]["headline"] = "New headline"

    res = api.put("/api/profile", json=body)

    assert res.status_code == 200
    assert _on_disk(content_dir)["profile"]["headline"] == "New headline"
    backup = content_dir / "backups" / res.json()["backup"]
    assert json.loads(backup.read_text("utf-8")) == original


def test_invalid_save_is_rejected_and_file_untouched(api: TestClient, content_dir: Path) -> None:
    before = (content_dir / "profile.json").read_bytes()
    body = _profile(api)
    body["theme"]["accent"] = "red"

    res = api.put("/api/profile", json=body)

    assert res.status_code == 422
    assert any(e["loc"][-1] == "accent" for e in res.json()["detail"])
    assert (content_dir / "profile.json").read_bytes() == before
    assert not (content_dir / "backups").exists()


def test_unknown_fields_are_rejected(api: TestClient) -> None:
    body = _profile(api)
    body["profile"]["isAdmin"] = True
    assert api.put("/api/profile", json=body).status_code == 422


def test_backups_are_rotated(api: TestClient, content_dir: Path) -> None:
    body = _profile(api)
    for i in range(5):
        body["profile"]["headline"] = f"Headline {i}"
        api.put("/api/profile", json=body)
    backups = api.get("/api/backups").json()
    assert len(backups) == 3  # max_backups in the test settings
    assert len(list((content_dir / "backups").iterdir())) == 3
    assert backups == sorted(backups, key=lambda b: b["name"], reverse=True)


def test_undo_restores_latest_backup(api: TestClient, content_dir: Path) -> None:
    original = _on_disk(content_dir)
    body = _profile(api)
    body["profile"]["headline"] = "Oops"
    api.put("/api/profile", json=body)

    latest = api.get("/api/backups").json()[0]["name"]
    res = api.post(f"/api/backups/{latest}/restore")

    assert res.status_code == 200
    assert _on_disk(content_dir) == original
    # The restore is itself undoable: the "Oops" state was backed up first.
    newest = api.get("/api/backups").json()[0]["name"]
    oops = json.loads((content_dir / "backups" / newest).read_text("utf-8"))
    assert oops["profile"]["headline"] == "Oops"


@pytest.mark.parametrize(
    "name", ["..%2Fprofile.json", "profile.json", "profile-2024.json", "profile-x.json.bak"]
)
def test_restore_rejects_bad_backup_names(api: TestClient, name: str) -> None:
    assert api.post(f"/api/backups/{name}/restore").status_code == 404


def test_restore_rejects_corrupt_backup(api: TestClient, content_dir: Path) -> None:
    backups = content_dir / "backups"
    backups.mkdir()
    (backups / "profile-20240101-000000-000000.json").write_text('{"nope": 1}', "utf-8")
    res = api.post("/api/backups/profile-20240101-000000-000000.json/restore")
    assert res.status_code == 422


def test_store_restore_unknown_backup(tmp_path: Path) -> None:
    store = ContentStore(tmp_path / "profile.json", tmp_path / "backups", 5)
    with pytest.raises(BackupNotFoundError):
        store.restore("profile-20240101-000000-000000.json")


def test_atomic_write_leaves_no_temp_files(tmp_path: Path) -> None:
    target = tmp_path / "profile.json"
    atomic_write(target, "{}")
    atomic_write(target, '{"a": 1}')
    assert target.read_text("utf-8") == '{"a": 1}'
    assert [p.name for p in tmp_path.iterdir()] == ["profile.json"]


def test_atomic_write_failure_keeps_original(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    target = tmp_path / "profile.json"
    target.write_text("original", "utf-8")

    def boom(self: Path, target: Path) -> Path:
        raise OSError("disk full")

    monkeypatch.setattr(Path, "replace", boom)
    with pytest.raises(OSError, match="disk full"):
        atomic_write(target, "new")
    monkeypatch.undo()
    assert target.read_text("utf-8") == "original"
    assert [p.name for p in tmp_path.iterdir()] == ["profile.json"]


def test_saved_file_is_stable_json(api: TestClient, content_dir: Path) -> None:
    api.put("/api/profile", json=_profile(api))
    text = (content_dir / "profile.json").read_text("utf-8")
    assert text.endswith("}\n")
    PortfolioContent.model_validate_json(text)


def test_validate_endpoint_reports_paths(api: TestClient) -> None:
    body = _profile(api)
    body["experience"][0]["start"] = "2024-13"
    res = api.post("/api/validate", json=body).json()
    assert res["valid"] is False
    assert res["errors"][0]["path"] == "/experience/0/start"


def test_validate_endpoint_accepts_good_content(api: TestClient) -> None:
    assert api.post("/api/validate", json=_profile(api)).json()["valid"] is True
