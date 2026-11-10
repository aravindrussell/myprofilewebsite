import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PortfolioContent } from "../../src/types/profile";
import { E2E_CONTENT_DIR, SEED_CONTENT_DIR } from "../support/env";

/** Direct access to the admin stack's content files, for arranging and asserting. */
export class ContentStore {
  readonly dir = E2E_CONTENT_DIR;
  private readonly profilePath = join(E2E_CONTENT_DIR, "profile.json");
  private readonly backupsDir = join(E2E_CONTENT_DIR, "backups");

  /** Restore the seed profile.json and drop backups and uploaded files from earlier tests. */
  reset(): void {
    writeFileSync(this.profilePath, readFileSync(join(SEED_CONTENT_DIR, "profile.json")));
    rmSync(this.backupsDir, { recursive: true, force: true });
    const seedAssets = new Set(readdirSync(join(SEED_CONTENT_DIR, "assets")));
    for (const name of readdirSync(this.assetsDir)) {
      if (!seedAssets.has(name)) rmSync(join(this.assetsDir, name));
    }
  }

  get assetsDir(): string {
    return join(E2E_CONTENT_DIR, "assets");
  }

  read(): PortfolioContent {
    return JSON.parse(readFileSync(this.profilePath, "utf8")) as PortfolioContent;
  }

  seed(): PortfolioContent {
    return JSON.parse(
      readFileSync(join(SEED_CONTENT_DIR, "profile.json"), "utf8"),
    ) as PortfolioContent;
  }

  backups(): string[] {
    return existsSync(this.backupsDir) ? readdirSync(this.backupsDir).sort() : [];
  }

  assets(): string[] {
    return readdirSync(this.assetsDir);
  }
}
