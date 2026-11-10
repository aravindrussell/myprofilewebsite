"""Export the Pydantic content models to content/profile.schema.json.

Usage (from backend/, inside the venv):  python ../scripts/gen_schema.py [--check]
--check exits non-zero if the committed schema is out of date.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from app.models import PortfolioContent

SCHEMA_PATH = Path(__file__).resolve().parents[1] / "content" / "profile.schema.json"


def render() -> str:
    schema = PortfolioContent.model_json_schema(by_alias=True, mode="serialization")
    schema["$schema"] = "https://json-schema.org/draft/2020-12/schema"
    return json.dumps(schema, indent=2, ensure_ascii=False) + "\n"


def main() -> int:
    content = render()
    if "--check" in sys.argv:
        current = SCHEMA_PATH.read_text(encoding="utf-8") if SCHEMA_PATH.exists() else ""
        if current != content:
            print("content/profile.schema.json is stale. Run `npm run gen:types`.")
            return 1
        print("Schema is up to date.")
        return 0
    SCHEMA_PATH.write_text(content, encoding="utf-8", newline="\n")
    print(f"Wrote {SCHEMA_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
