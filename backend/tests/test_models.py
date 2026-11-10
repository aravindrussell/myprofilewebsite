from __future__ import annotations

import copy
import json
from typing import Any

import pytest
from pydantic import ValidationError

from app.config import REPO_ROOT
from app.models import PortfolioContent


@pytest.fixture
def seed() -> dict[str, Any]:
    data: dict[str, Any] = json.loads(
        (REPO_ROOT / "content" / "profile.json").read_text(encoding="utf-8")
    )
    return data


def test_committed_profile_is_valid(seed: dict[str, Any]) -> None:
    content = PortfolioContent.model_validate(seed)
    assert content.profile.name == "Aravind Russell V"


def test_round_trip_preserves_camel_case_json(seed: dict[str, Any]) -> None:
    dumped = PortfolioContent.model_validate(seed).model_dump(mode="json")
    assert dumped == seed


@pytest.mark.parametrize(
    ("mutate", "message"),
    [
        (lambda d: d["profile"].update(unexpected="x"), "Extra inputs are not permitted"),
        (lambda d: d["profile"].update(email="not-an-email"), "pattern"),
        (lambda d: d["theme"].update(accent="blue"), "pattern"),
        (lambda d: d["profile"]["socials"].update(github="javascript:alert(1)"), "pattern"),
        (lambda d: d["projects"][0].update(image="../../etc/passwd"), "pattern"),
        (lambda d: d["experience"][0].update(start="2024-13"), "pattern"),
        (lambda d: d["experience"][1].update(end="2020-01"), "end date is before start"),
        (lambda d: d["sections"].pop(), "exactly once"),
        (lambda d: d["sections"].reverse(), "hero section must come first"),
        (lambda d: d["projects"].append(copy.deepcopy(d["projects"][0])), "Duplicate project"),
        (lambda d: d["profile"]["resume"].update(mode="file", file=""), "no file is set"),
        (lambda d: d["projects"][0].update(image="assets/a.png", imageAlt=""), "alt text"),
        (lambda d: d["seo"].update(title="x" * 71), "at most 70"),
    ],
)
def test_invalid_content_is_rejected(seed: dict[str, Any], mutate: Any, message: str) -> None:
    mutate(seed)
    with pytest.raises(ValidationError, match=message):
        PortfolioContent.model_validate(seed)


def test_referenced_assets_lists_only_set_paths(seed: dict[str, Any]) -> None:
    seed["profile"]["photo"] = "assets/me.webp"
    seed["profile"]["photoAlt"] = "Portrait"
    assert PortfolioContent.model_validate(seed).referenced_assets() == {
        "assets/me.webp",
        "assets/og-default.png",
    }
