import { Ajv2020 } from "ajv/dist/2020.js";
import schema from "../../../content/profile.schema.json";
import type { PortfolioContent } from "../types/profile";

/**
 * Live validation against the same JSON Schema the API and build use. Cross-field rules
 * (unique ids, alt text, date order) are enforced by the API on save.
 */
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile<PortfolioContent>(schema);

const FRIENDLY: Record<string, (params: Record<string, unknown>) => string> = {
  pattern: () => "Invalid format",
  maxLength: (p) => `At most ${String(p.limit)} characters`,
  minLength: (p) => (p.limit === 1 ? "Required" : `At least ${String(p.limit)} characters`),
  maxItems: (p) => `At most ${String(p.limit)} items`,
};

/** Map of JSON pointer (e.g. "/profile/email") -> first error message. */
export type FieldErrors = Record<string, string>;

export function validateDraft(data: PortfolioContent): FieldErrors {
  if (validate(data)) return {};
  const errors: FieldErrors = {};
  for (const e of validate.errors ?? []) {
    const path =
      e.keyword === "required"
        ? `${e.instancePath}/${(e.params as { missingProperty: string }).missingProperty}`
        : e.instancePath || "/";
    errors[path] ??= FRIENDLY[e.keyword]?.(e.params) ?? e.message ?? "Invalid value";
  }
  return errors;
}
