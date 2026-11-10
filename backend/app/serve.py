"""Entry point: `python -m app.serve`. Always binds to the loopback interface."""

from __future__ import annotations

import uvicorn

from app.config import load_settings


def main() -> None:
    settings = load_settings()
    uvicorn.run(
        "app.main:create_app",
        factory=True,
        host="127.0.0.1",
        port=settings.api_port,
        reload=True,
        reload_dirs=["app"],
    )


if __name__ == "__main__":
    main()
