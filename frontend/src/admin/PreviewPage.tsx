import { useEffect, useState } from "react";
import type { PortfolioContent } from "../types/profile";
import { Site } from "../site/Site";
import { themeCss } from "../lib/seo";
import { content as built, formspreeId } from "../lib/content";
import { PREVIEW_MESSAGE } from "./Preview";

/** Renders the public site with whatever draft the admin page posts to it. */
export function PreviewPage() {
  const [content, setContent] = useState<PortfolioContent>(built);

  useEffect(() => {
    const onMessage = (e: MessageEvent<{ type?: string; content?: PortfolioContent }>) => {
      if (e.origin !== window.location.origin || e.data.type !== PREVIEW_MESSAGE) return;
      if (e.data.content) setContent(e.data.content);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage(`${PREVIEW_MESSAGE}:ready`, window.location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <>
      <style>{themeCss(content)}</style>
      <Site content={content} formspreeId={formspreeId} />
    </>
  );
}
