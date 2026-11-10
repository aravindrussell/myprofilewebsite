// Generates src/types/profile.ts from content/profile.schema.json.
// Usage: node scripts/gen-types.mjs [--check]   (--check fails if the file is stale)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile } from "json-schema-to-typescript";

const schemaPath = fileURLToPath(new URL("../../content/profile.schema.json", import.meta.url));
const outPath = fileURLToPath(new URL("../src/types/profile.ts", import.meta.url));

/** Drop per-property titles so only $defs become named types. */
function stripPropertyTitles(node) {
  if (Array.isArray(node)) return node.forEach(stripPropertyTitles);
  if (!node || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    if (key === "properties") {
      for (const prop of Object.values(value)) {
        delete prop.title;
        stripPropertyTitles(prop);
      }
    } else {
      stripPropertyTitles(value);
    }
  }
}

const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
stripPropertyTitles(schema);
const ts = await compile(schema, "PortfolioContent", {
  additionalProperties: false,
  maxItems: -1,
  bannerComment:
    "/* eslint-disable */\n// Generated from content/profile.schema.json by scripts/gen-types.mjs. Do not edit.\n// Source of truth: backend/app/models.py (run `npm run gen:types` after changing it).",
  style: { printWidth: 100 },
});

if (process.argv.includes("--check")) {
  const current = existsSync(outPath) ? readFileSync(outPath, "utf8") : "";
  if (current !== ts) {
    console.error("src/types/profile.ts is stale. Run `npm run gen:types`.");
    process.exit(1);
  }
  console.log("TypeScript types are up to date.");
} else {
  writeFileSync(outPath, ts);
  console.log(`Wrote ${outPath}`);
}
