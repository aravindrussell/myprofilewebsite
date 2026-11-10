import type { PortfolioContent } from "../types/profile";

export interface ApiErrorItem {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly items: ApiErrorItem[] = [],
  ) {
    super(message);
  }
}

export interface BackupInfo {
  name: string;
  created_at: string;
  size: number;
}

export interface GitStatus {
  available: boolean;
  branch: string;
  changed: string[];
  diff_stat: string;
  error: string;
}

let csrfToken: Promise<string> | null = null;

function getCsrf(): Promise<string> {
  csrfToken ??= fetch("/api/csrf", { credentials: "same-origin" })
    .then((r) => r.json() as Promise<{ token: string }>)
    .then((d) => d.token);
  return csrfToken;
}

/** FastAPI 422 bodies -> flat {path, message} list (path uses the JSON field names). */
function toItems(detail: unknown): ApiErrorItem[] {
  if (!Array.isArray(detail)) return [];
  return detail.map((d: { loc?: (string | number)[]; msg?: string }) => ({
    path: "/" + (d.loc ?? []).filter((p) => p !== "body").join("/"),
    message: d.msg ?? "Invalid value",
  }));
}

async function request<T>(method: string, url: string, body?: BodyInit, json = true): Promise<T> {
  const headers: Record<string, string> = {};
  if (method !== "GET") headers["X-CSRF-Token"] = await getCsrf();
  if (body !== undefined && json) headers["Content-Type"] = "application/json";
  const res = await fetch(url, { method, headers, body, credentials: "same-origin" });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as { detail?: unknown }).detail;
    if (res.status === 403) csrfToken = null; // token may have expired with an API restart
    throw new ApiError(
      typeof detail === "string" ? detail : `Request failed (${res.status})`,
      res.status,
      toItems(detail),
    );
  }
  return data as T;
}

export const api = {
  getProfile: () => request<PortfolioContent>("GET", "/api/profile"),
  saveProfile: (c: PortfolioContent) =>
    request<{ backup: string | null; content: PortfolioContent }>(
      "PUT",
      "/api/profile",
      JSON.stringify(c),
    ),
  validate: (data: unknown) =>
    request<{ valid: boolean; errors: ApiErrorItem[]; content?: PortfolioContent }>(
      "POST",
      "/api/validate",
      JSON.stringify(data),
    ),
  backups: () => request<BackupInfo[]>("GET", "/api/backups"),
  restore: (name: string) =>
    request<{ content: PortfolioContent }>(
      "POST",
      `/api/backups/${encodeURIComponent(name)}/restore`,
    ),
  upload: (kind: "image" | "resume", file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ path: string }>("POST", `/api/uploads/${kind}`, form, false);
  },
  publishStatus: () => request<GitStatus>("GET", "/api/publish/status"),
};
