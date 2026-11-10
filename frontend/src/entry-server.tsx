import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { Site } from "./site/Site";
import { content, formspreeId } from "./lib/content";

/** Used by scripts/prerender.ts to bake the site into dist/index.html. */
export function render(): string {
  return renderToString(
    <StrictMode>
      <Site content={content} formspreeId={formspreeId} />
    </StrictMode>,
  );
}
