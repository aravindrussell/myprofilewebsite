import { useCallback, useEffect, useState } from "react";
import { api, type GitStatus } from "../api";
import { Fieldset } from "../components/Fieldset";

const STEPS = [
  { label: "Run the checks (lint, types, API tests, build)", cmd: "npm run check" },
  { label: "Stage the content changes", cmd: "git add content" },
  { label: "Commit them", cmd: 'git commit -m "content: update portfolio"' },
  { label: "Push, and Vercel redeploys automatically", cmd: "git push" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-fg"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 1500);
        });
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function PublishPanel({ dirty }: { dirty: boolean }) {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const refresh = useCallback(() => {
    void api.publishStatus().then(setStatus);
  }, []);
  useEffect(refresh, [refresh]);

  return (
    <div className="space-y-6" data-testid="publish-panel">
      {dirty && (
        <p
          role="alert"
          className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm"
        >
          You have unsaved changes. Save first so they are included in the commit.
        </p>
      )}
      <Fieldset legend="Git status (content/)">
        {!status && <p className="text-sm text-muted">Loading…</p>}
        {status && !status.available && (
          <p className="text-sm text-muted">Git is not available: {status.error}</p>
        )}
        {status?.available && (
          <>
            <p className="font-mono text-sm">
              branch <span className="text-accent">{status.branch}</span> ·{" "}
              {status.changed.length
                ? `${status.changed.length} changed file(s)`
                : "no uncommitted content changes"}
            </p>
            {status.changed.length > 0 && (
              <pre className="overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-xs">
                {status.changed.join("\n")}
                {status.diff_stat && `\n\n${status.diff_stat}`}
              </pre>
            )}
          </>
        )}
        <button type="button" onClick={refresh} className="text-sm text-accent hover:underline">
          Refresh
        </button>
      </Fieldset>
      <Fieldset legend="Publish checklist">
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.cmd} className="space-y-1">
              <p className="text-sm">
                <span className="font-mono text-accent">{i + 1}.</span> {s.label}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-md bg-surface-2 px-3 py-1.5 font-mono text-xs">
                  {s.cmd}
                </code>
                <CopyButton text={s.cmd} />
              </div>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted">
          Preview the production build first with <code className="font-mono">npm run build</code>{" "}
          and <code className="font-mono">npm run preview</code>.
        </p>
      </Fieldset>
    </div>
  );
}
