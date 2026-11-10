// One-time setup: Python virtualenv (uv if available, else venv + pip) and npm deps.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const backend = join(root, "backend");
const win = process.platform === "win32";

function run(cmd, args, cwd = root) {
  console.log(`> ${cmd} ${args.join(" ")}`);
  // npm is a .cmd shim on Windows, which Node only runs through a shell (args here are fixed).
  const r =
    win && cmd === "npm"
      ? spawnSync(`npm ${args.join(" ")}`, { cwd, stdio: "inherit", shell: true })
      : spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const hasUv = spawnSync("uv", ["--version"], { stdio: "ignore" }).status === 0;
const venvPython = join(backend, ".venv", win ? "Scripts/python.exe" : "bin/python");

if (hasUv) {
  run("uv", ["venv", ".venv"], backend);
  run("uv", ["pip", "install", "--python", venvPython, "-e", ".[dev]"], backend);
} else {
  if (!existsSync(venvPython)) run(win ? "python" : "python3", ["-m", "venv", ".venv"], backend);
  run(venvPython, ["-m", "pip", "install", "--upgrade", "pip"], backend);
  run(venvPython, ["-m", "pip", "install", "-e", ".[dev]"], backend);
}

run("npm", ["install"], root);
run("npm", ["install"], join(root, "frontend"));
console.log("\nSetup complete. Run `npm run dev` to start the site, admin and API.");
