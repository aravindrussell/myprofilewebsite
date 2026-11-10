import { useCallback, useEffect, useMemo, useState } from "react";
import type { PortfolioContent } from "../types/profile";
import { validateDraft, type FieldErrors } from "./validation";

export type Edit = (mutate: (draft: PortfolioContent) => void) => void;

/** Saved vs draft content, with dirty tracking, live validation and an unload guard. */
export function useDraft(initial: PortfolioContent) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);

  const edit: Edit = useCallback((mutate) => {
    setDraft((current) => {
      const next = structuredClone(current);
      mutate(next);
      return next;
    });
  }, []);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);
  const errors: FieldErrors = useMemo(() => validateDraft(draft), [draft]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty]);

  /** Replace both saved and draft (after a save, restore or reload). */
  const commit = useCallback((content: PortfolioContent) => {
    setSaved(content);
    setDraft(content);
  }, []);

  const discard = useCallback(() => {
    setDraft(saved);
  }, [saved]);

  return { saved, draft, setDraft, edit, dirty, errors, commit, discard };
}

/** URL-safe id for new list items, e.g. "item-lq3k9x2". */
export function newId(prefix = "item"): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}
