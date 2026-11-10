// Build gate: validates content/profile.json against content/profile.schema.json and checks
// that every referenced asset exists. Runs before `vite build`, so bad content never deploys.
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import type { PortfolioContent } from "../src/types/profile";

const contentDir = fileURLToPath(new URL("../../content/", import.meta.url));

export function validateContent(data: unknown): string[] {
  const schema: object = JSON.parse(
    readFileSync(join(contentDir, "profile.schema.json"), "utf8"),
  ) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile<PortfolioContent>(schema);
  if (!validate(data)) {
    return (validate.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message ?? ""}`);
  }
  const { profile, projects, seo } = data;
  const assets = [profile.photo, seo.ogImage, ...projects.map((p) => p.image)];
  if (profile.resume.mode === "file") assets.push(profile.resume.file);
  return assets
    .filter((a) => a && !existsSync(join(contentDir, a)))
    .map((a) => `Missing asset file: content/${a}`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const data: unknown = JSON.parse(readFileSync(join(contentDir, "profile.json"), "utf8"));
  const errors = validateContent(data);
  if (errors.length) {
    console.error("content/profile.json is invalid:\n  " + errors.join("\n  "));
    process.exit(1);
  }
  console.log("content/profile.json is valid.");
}
