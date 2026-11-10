import { fileURLToPath } from "node:url";
import { join } from "node:path";

/** Ports and paths shared by playwright.config.ts, the admin stack and the fixtures. */
export const PUBLIC_PORT = 4173;
export const ADMIN_WEB_PORT = 5174;
export const ADMIN_API_PORT = 8788;

export const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export const SEED_CONTENT_DIR = join(REPO_ROOT, "content");
/** Throwaway copy of content/ used by the admin tests (never the real profile.json). */
export const E2E_CONTENT_DIR = join(REPO_ROOT, "frontend", "e2e", ".tmp", "content");
