// Runs the backend virtualenv's Python with the given arguments (cross-platform).
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const venv = join(root, "backend", ".venv");
const python =
  process.platform === "win32" ? join(venv, "Scripts", "python.exe") : join(venv, "bin", "python");

if (!existsSync(python)) {
  console.error("Backend virtualenv not found. Run `npm run setup` first.");
  process.exit(1);
}

const result = spawnSync(python, process.argv.slice(2), {
  cwd: join(root, "backend"),
  stdio: "inherit",
  env: { ...process.env, ENV: process.env.ENV ?? "dev" },
});
process.exit(result.status ?? 1);
