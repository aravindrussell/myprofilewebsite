import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { api, ApiError } from "../api";
import { assetUrl } from "../../lib/content-utils";

const inputClass =
  "mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none aria-[invalid=true]:border-red-500";

interface BaseProps {
  label: string;
  error?: string | undefined;
  hint?: ReactNode;
}

function Wrapper({
  id,
  label,
  error,
  hint,
  children,
}: BaseProps & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode): string | undefined {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  placeholder,
  maxLength,
}: BaseProps & {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={inputClass}
      />
    </Wrapper>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  hint,
  rows = 4,
}: BaseProps & { value: string; onChange: (v: string) => void; rows?: number }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={inputClass}
      />
    </Wrapper>
  );
}

/** A list of strings edited as one textarea, one item per line. */
export function LinesField({
  label,
  value,
  onChange,
  error,
  rows = 5,
}: BaseProps & { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  return (
    <TextArea
      label={label}
      rows={rows}
      error={error}
      hint="One item per line."
      value={value.join("\n")}
      onChange={(v) => {
        onChange(v.split("\n").filter((line, i, all) => line.trim() || i === all.length - 1));
      }}
    />
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
        className="size-4 accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
}: BaseProps & {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error}>
      <select
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value as T);
        }}
        className={inputClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

/** Tag/skill chips: type and press Enter or comma to add; Backspace on empty removes last. */
export function ChipsEditor({
  label,
  value,
  onChange,
  error,
}: BaseProps & { value: string[]; onChange: (v: string[]) => void }) {
  const id = useId();
  const [text, setText] = useState("");

  function add(raw: string) {
    const items = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !value.includes(s));
    if (items.length) onChange([...value, ...items]);
    setText("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <Wrapper id={id} label={label} error={error} hint="Press Enter or comma to add a tag.">
      <div className="mt-1 flex flex-wrap gap-1.5 rounded-lg border border-line bg-bg p-2 focus-within:border-accent">
        <ul className="contents" aria-label={`${label} list`}>
          {value.map((tag) => (
            <li key={tag} className="chip gap-1 py-0.5 pr-1">
              {tag}
              <button
                type="button"
                className="rounded px-1 text-muted hover:text-fg"
                aria-label={`Remove ${tag}`}
                onClick={() => {
                  onChange(value.filter((t) => t !== tag));
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <input
          id={id}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (text.trim()) add(text);
          }}
          aria-describedby={describedBy(id, error, true)}
          className="min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
          placeholder="Add…"
        />
      </div>
    </Wrapper>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  error,
  hint,
}: BaseProps & { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint}>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
          }}
          aria-label={`${label} picker`}
          className="h-9 w-12 cursor-pointer rounded border border-line bg-bg"
        />
        <input
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          className={`${inputClass} mt-0 font-mono`}
        />
      </div>
    </Wrapper>
  );
}

/** Uploads a file to content/assets via the API and stores the returned asset path. */
export function UploadField({
  label,
  kind,
  value,
  onChange,
  error,
}: BaseProps & {
  kind: "image" | "resume";
  value: string;
  onChange: (path: string) => void;
}) {
  const id = useId();
  const [status, setStatus] = useState<string>("");
  const accept = kind === "image" ? "image/png,image/jpeg,image/webp" : "application/pdf";

  async function onFile(file: File | undefined) {
    if (!file) return;
    setStatus("Uploading…");
    try {
      const { path } = await api.upload(kind, file);
      onChange(path);
      setStatus("Uploaded.");
    } catch (e) {
      setStatus(e instanceof ApiError ? e.message : "Upload failed.");
    }
  }

  return (
    <Wrapper
      id={id}
      label={label}
      error={error}
      hint={kind === "image" ? "PNG, JPEG or WebP up to 5 MB." : "PDF up to 10 MB."}
    >
      <div className="mt-1 flex flex-wrap items-center gap-3">
        {value && kind === "image" && (
          <img
            src={assetUrl(value)}
            alt=""
            className="h-14 w-24 rounded border border-line object-cover"
          />
        )}
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={(e) => void onFile(e.target.files?.[0])}
          aria-describedby={describedBy(id, error, true)}
          className="text-sm file:mr-3 file:rounded-md file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-sm"
        />
        {value && (
          <button
            type="button"
            className="text-sm text-muted underline hover:text-fg"
            onClick={() => {
              onChange("");
            }}
          >
            Remove
          </button>
        )}
      </div>
      {value && <p className="mt-1 font-mono text-xs text-muted">{value}</p>}
      <p role="status" className="mt-1 text-xs text-muted">
        {status}
      </p>
    </Wrapper>
  );
}
