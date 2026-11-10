import { useEffect, useState } from "react";
import type { SectionMeta } from "../../types/profile";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";

/** Sticky header with active-section highlighting (IntersectionObserver) and a mobile menu. */
export function Nav({ sections, monogram }: { sections: SectionMeta[]; monogram: string }) {
  const links = sections.filter((s) => s.id !== "hero");
  const [active, setActive] = useState<string>("hero");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => {
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
    };
  }, [sections]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkClass = (id: string) =>
    `rounded-md px-3 py-2 text-sm transition-colors ${
      active === id ? "text-accent" : "text-muted hover:text-fg"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <nav aria-label="Primary" className="container-page flex h-16 items-center justify-between">
        <a
          href="#hero"
          className="font-mono text-base font-bold tracking-tight"
          aria-label="Back to top"
        >
          {monogram}
          <span className="cursor-blink text-accent">_</span>
        </a>
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={linkClass(s.id)}
                aria-current={active === s.id ? "location" : undefined}
              >
                {s.navLabel}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg text-muted hover:text-fg md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => {
              setOpen((o) => !o);
            }}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </nav>
      {open && (
        <ul
          id="mobile-menu"
          className="container-page grid gap-1 border-t border-line pt-2 pb-4 md:hidden"
        >
          {links.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`block ${linkClass(s.id)}`}
                aria-current={active === s.id ? "location" : undefined}
                onClick={() => {
                  setOpen(false);
                }}
              >
                {s.navLabel}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
