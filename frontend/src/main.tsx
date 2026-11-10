import { StrictMode, lazy, Suspense, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "virtual:fonts";
import "./styles/index.css";
import { Site } from "./site/Site";
import { content, formspreeId } from "./lib/content";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

function mount(node: ReactNode) {
  createRoot(root as HTMLElement).render(<StrictMode>{node}</StrictMode>);
}

const path = window.location.pathname;

// The admin and preview pages exist only in the dev server. In production builds
// `import.meta.env.DEV` is false, so this branch and the admin chunk are removed entirely.
if (import.meta.env.DEV && (path.startsWith("/admin") || path.startsWith("/__preview"))) {
  const Admin = lazy(() => import("./admin/AdminRoot"));
  mount(
    <Suspense fallback={null}>
      <Admin path={path} />
    </Suspense>,
  );
} else if (root.hasChildNodes()) {
  hydrateRoot(
    root,
    <StrictMode>
      <Site content={content} formspreeId={formspreeId} />
    </StrictMode>,
  );
} else {
  mount(<Site content={content} formspreeId={formspreeId} />);
}
