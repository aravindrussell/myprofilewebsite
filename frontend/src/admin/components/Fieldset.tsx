import type { ReactNode } from "react";

export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-line bg-surface p-5">
      <legend className="px-1 label-mono">{legend}</legend>
      {children}
    </fieldset>
  );
}
