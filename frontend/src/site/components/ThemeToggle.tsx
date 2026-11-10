import { useSyncExternalStore } from "react";
import { Icon } from "./Icon";

type Mode = "light" | "dark";

const root = () => document.documentElement;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    observer.disconnect();
  };
}

const getMode = (): Mode => (root().dataset.theme === "dark" ? "dark" : "light");

/** Flips data-theme on <html> and remembers the choice. The initial value is set pre-paint. */
export function ThemeToggle() {
  // null during SSR/hydration; the icons switch via CSS, so markup matches either way.
  const mode = useSyncExternalStore<Mode | null>(subscribe, getMode, () => null);

  function toggle() {
    const next: Mode = getMode() === "dark" ? "light" : "dark";
    root().dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex size-11 items-center justify-center rounded-lg text-muted transition-colors hover:text-fg"
      data-testid="theme-toggle"
    >
      <Icon name="moon" className="dark:hidden" />
      <Icon name="sun" className="hidden dark:block" />
    </button>
  );
}
