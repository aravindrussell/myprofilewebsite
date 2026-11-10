import type { PortfolioContent } from "../types/profile";
import raw from "../../../content/profile.json";

/** Content baked in at build time. Validated by scripts/validate-content.ts before every build. */
export const content = raw as PortfolioContent;

export const formspreeId = import.meta.env.VITE_FORMSPREE_ID ?? "";
