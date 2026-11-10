// Starts an isolated admin stack for e2e tests: API on 127.0.0.1:8788 and Vite on
// localhost:5174, both pointed at a throwaway copy of content/ (frontend/e2e/.tmp/content).
import { spawn } from "node:child_process";
import { cpSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../../../", import.meta.url));
const contentDir = join(repo, "frontend", "e2e", ".tmp", "content");
const webPort = "5174";
const apiPort = "8788";

rmSync(contentDir, { recursive: true, force: true });
mkdirSync(contentDir, { recursive: true });
cpSync(join(repo, "content", "profile.json"), join(contentDir, "profile.json"));
cpSync(join(repo, "content", "assets"), join(contentDir, "assets"), { recursive: true });

const env = {
  ...process.env,
  ENV: "dev",
  WEB_PORT: webPort,
  API_PORT: apiPort,
  CONTENT_DIR: contentDir,
};
const python = join(
  repo,
  "backend",
  ".venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);

const children = [
  spawn(
    python,
    ["-m", "uvicorn", "app.main:create_app", "--factory", "--host", "127.0.0.1", "--port", apiPort],
    { cwd: join(repo, "backend"), env, stdio: "inherit" },
  ),
  spawn(process.execPath, [join(repo, "frontend", "node_modules", "vite", "bin", "vite.js")], {
    cwd: join(repo, "frontend"),
    env,
    stdio: "inherit",
  }),
];

function shutdown() {
  for (const child of children) child.kill();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
for (const child of children) child.on("exit", (code) => code && process.exit(code));
