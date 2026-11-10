import { useEffect, useRef, useState } from "react";
import type { PortfolioContent } from "../types/profile";

const WIDTHS = [
  { label: "Mobile", px: 360 },
  { label: "Tablet", px: 768 },
  { label: "Desktop", px: 1280 },
] as const;

export const PREVIEW_MESSAGE = "portfolio-preview";

/** The real site rendered in an iframe at /__preview, fed the draft via postMessage. */
export function Preview({ content }: { content: PortfolioContent }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState<number>(1280);
  const [box, setBox] = useState(0);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data === `${PREVIEW_MESSAGE}:ready`) {
        setReady(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    frame.current?.contentWindow?.postMessage(
      { type: PREVIEW_MESSAGE, content },
      window.location.origin,
    );
  }, [ready, content]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setBox(entry?.contentRect.width ?? 0);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  const scale = box && width > box ? box / width : 1;

  return (
    <div className="sticky top-20">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="label-mono">Live preview</h2>
        <div role="group" aria-label="Preview width" className="flex gap-1">
          {WIDTHS.map((w) => (
            <button
              key={w.px}
              type="button"
              aria-pressed={width === w.px}
              onClick={() => {
                setWidth(w.px);
              }}
              className={`rounded-md px-2 py-1 font-mono text-xs ${
                width === w.px ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={container} className="overflow-hidden rounded-xl border border-line bg-surface">
        <div style={{ height: `calc((100vh - 8rem))` }}>
          <iframe
            ref={frame}
            src="/__preview"
            title="Live preview of the public site"
            data-testid="preview-frame"
            style={{
              width,
              height: `calc((100vh - 8rem) / ${scale})`,
              transform: `scale(${scale})`,
              transformOrigin: "0 0",
            }}
            className="block border-0"
          />
        </div>
      </div>
    </div>
  );
}
