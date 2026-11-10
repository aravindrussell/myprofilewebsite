import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PortfolioContent } from "../types/profile";
import { api, ApiError, type ApiErrorItem } from "./api";
import { useDraft } from "./useDraft";
import { Preview } from "./Preview";
import type { EditorProps } from "./editors/types";
import { ProfileEditor } from "./editors/ProfileEditor";
import { SectionsEditor } from "./editors/SectionsEditor";
import { SkillsEditor } from "./editors/SkillsEditor";
import { ExperienceEditor } from "./editors/ExperienceEditor";
import { ProjectsEditor } from "./editors/ProjectsEditor";
import {
  CertificationsEditor,
  EducationEditor,
  TestimonialsEditor,
} from "./editors/CredentialsEditors";
import { ContactEditor, SeoEditor, ThemeEditor } from "./editors/SettingsEditors";
import { PublishPanel } from "./editors/PublishPanel";

const TABS = [
  { id: "profile", label: "Profile", prefix: "/profile", Editor: ProfileEditor },
  { id: "sections", label: "Sections", prefix: "/sections", Editor: SectionsEditor },
  { id: "skills", label: "Skills", prefix: "/skills", Editor: SkillsEditor },
  { id: "experience", label: "Experience", prefix: "/experience", Editor: ExperienceEditor },
  { id: "projects", label: "Projects", prefix: "/projects", Editor: ProjectsEditor },
  { id: "education", label: "Education", prefix: "/education", Editor: EducationEditor },
  {
    id: "certifications",
    label: "Certifications",
    prefix: "/certifications",
    Editor: CertificationsEditor,
  },
  {
    id: "testimonials",
    label: "Recommendations",
    prefix: "/testimonials",
    Editor: TestimonialsEditor,
  },
  { id: "contact", label: "Contact", prefix: "/contact", Editor: ContactEditor },
  { id: "theme", label: "Theme", prefix: "/theme", Editor: ThemeEditor },
  { id: "seo", label: "SEO", prefix: "/seo", Editor: SeoEditor },
] as const satisfies readonly {
  id: string;
  label: string;
  prefix: string;
  Editor: (p: EditorProps) => ReactNode;
}[];

type TabId = (typeof TABS)[number]["id"] | "publish";

type Notice = { kind: "ok" | "error"; text: string; items?: ApiErrorItem[] } | null;

function Workspace({ initial }: { initial: PortfolioContent }) {
  const { draft, setDraft, edit, dirty, errors, commit, discard } = useDraft(initial);
  const [tab, setTab] = useState<TabId>("profile");
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const errorCount = Object.keys(errors).length;

  async function save() {
    if (errorCount) {
      setNotice({
        kind: "error",
        text: `Fix ${errorCount} validation error(s) before saving.`,
        items: Object.entries(errors).map(([path, message]) => ({ path, message })),
      });
      return;
    }
    setBusy(true);
    try {
      const res = await api.saveProfile(draft);
      commit(res.content);
      setNotice({ kind: "ok", text: "Saved to content/profile.json." });
    } catch (e) {
      setNotice(errorNotice(e, "Save failed."));
    } finally {
      setBusy(false);
    }
  }

  async function undoLastSave() {
    const [latest] = await api.backups();
    if (!latest) {
      setNotice({ kind: "error", text: "There is no backup to restore yet." });
      return;
    }
    const when = new Date(latest.created_at).toLocaleString();
    const lose = dirty ? " Your unsaved changes will be lost." : "";
    if (!window.confirm(`Restore the backup from ${when}?${lose}`)) return;
    try {
      const res = await api.restore(latest.name);
      commit(res.content);
      setNotice({ kind: "ok", text: `Restored the backup from ${when}.` });
    } catch (e) {
      setNotice(errorNotice(e, "Restore failed."));
    }
  }

  async function importJson(file: File | undefined) {
    if (!file) return;
    if (dirty && !window.confirm("Importing replaces your unsaved changes. Continue?")) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      const res = await api.validate(data);
      if (res.valid && res.content) {
        setDraft(res.content);
        setNotice({ kind: "ok", text: "Imported. Review the preview, then Save." });
      } else {
        setNotice({ kind: "error", text: "The imported file is not valid.", items: res.errors });
      }
    } catch (e) {
      setNotice(errorNotice(e, "Could not read that file as JSON."));
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(draft, null, 2) + "\n"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `profile-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  });

  const active = TABS.find((t) => t.id === tab);
  const tabErrors = (prefix: string) =>
    Object.keys(errors).filter((p) => p === prefix || p.startsWith(`${prefix}/`)).length;
  const btn = "rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-accent";

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <p className="font-mono font-bold">
            admin<span className="text-accent">_</span>
          </p>
          <p
            className="font-mono text-xs"
            role="status"
            aria-live="polite"
            data-testid="save-state"
          >
            {dirty ? (
              <span className="text-amber-600 dark:text-amber-400">● unsaved changes</span>
            ) : (
              <span className="text-muted">✓ saved</span>
            )}
            {errorCount > 0 && (
              <span className="ml-2 text-red-600 dark:text-red-400">{errorCount} error(s)</span>
            )}
          </p>
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => void undoLastSave()}>
              Undo last save
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => {
                importRef.current?.click();
              }}
            >
              Import JSON
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-label="Import JSON file"
              data-testid="import-input"
              onChange={(e) => void importJson(e.target.files?.[0])}
            />
            <button type="button" className={btn} onClick={exportJson}>
              Export JSON
            </button>
            <button type="button" className={btn} disabled={!dirty} onClick={discard}>
              Discard
            </button>
            <button
              type="button"
              className="btn-primary min-h-0 py-1.5"
              disabled={busy || !dirty}
              onClick={() => void save()}
              aria-keyshortcuts="Control+S"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        {notice && (
          <div
            role={notice.kind === "error" ? "alert" : "status"}
            className={`flex items-start gap-3 border-t px-4 py-2 text-sm ${
              notice.kind === "error"
                ? "border-red-500/40 bg-red-500/10"
                : "border-accent/30 bg-accent/10"
            }`}
            data-testid="notice"
          >
            <div className="flex-1">
              <p>{notice.text}</p>
              {notice.items && notice.items.length > 0 && (
                <ul className="mt-1 list-disc pl-5 font-mono text-xs">
                  {notice.items.slice(0, 8).map((i) => (
                    <li key={i.path + i.message}>
                      {i.path}: {i.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => {
                setNotice(null);
              }}
            >
              ✕
            </button>
          </div>
        )}
      </header>

      <div className="grid gap-6 p-4 lg:grid-cols-[11rem_minmax(0,1fr)] xl:grid-cols-[11rem_minmax(0,34rem)_minmax(0,1fr)]">
        <nav aria-label="Content sections">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {[...TABS, { id: "publish" as const, label: "Publish", prefix: "" }].map((t) => {
              const count = t.prefix ? tabErrors(t.prefix) : 0;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-current={tab === t.id ? "page" : undefined}
                    onClick={() => {
                      setTab(t.id);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap ${
                      tab === t.id
                        ? "bg-surface-2 font-semibold text-fg"
                        : "text-muted hover:text-fg"
                    }`}
                  >
                    {t.label}
                    {count > 0 && (
                      <span className="rounded-full bg-red-500/15 px-1.5 font-mono text-xs text-red-600 dark:text-red-400">
                        {count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main aria-labelledby="editor-heading" className="min-w-0">
          <h1 id="editor-heading" className="mb-4 text-2xl font-semibold tracking-tight">
            {active?.label ?? "Publish"}
          </h1>
          {active ? (
            <active.Editor draft={draft} edit={edit} errors={errors} />
          ) : (
            <PublishPanel dirty={dirty} />
          )}
        </main>

        <aside aria-label="Live preview" className="min-w-0 lg:col-span-2 xl:col-span-1">
          <Preview content={draft} />
        </aside>
      </div>
    </div>
  );
}

function errorNotice(e: unknown, fallback: string): Notice {
  if (e instanceof ApiError) return { kind: "error", text: e.message, items: e.items };
  return { kind: "error", text: fallback };
}

export function AdminApp() {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; content: PortfolioContent }
  >({ status: "loading" });

  useEffect(() => {
    document.title = "Admin · Portfolio";
    api
      .getProfile()
      .then((content) => {
        setState({ status: "ready", content });
      })
      .catch((e: unknown) => {
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Could not reach the admin API.",
        });
      });
  }, []);

  if (state.status === "loading") return <p className="p-8 font-mono text-muted">Loading…</p>;
  if (state.status === "error") {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Admin API not reachable</h1>
        <p className="mt-3 text-muted">
          Start everything with <code className="font-mono">npm run dev</code> (the API listens on
          127.0.0.1:8787).
        </p>
        <p className="mt-2 font-mono text-xs text-muted">{state.message}</p>
      </main>
    );
  }
  return <Workspace initial={state.content} />;
}
