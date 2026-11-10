import type { ReactNode } from "react";
import type { SectionMeta } from "../../types/profile";
import { Reveal } from "./Reveal";

/** Common section frame: "02 / skills" mono label, heading and content. */
export function SectionShell({
  meta,
  index,
  children,
  lead,
}: {
  meta: SectionMeta;
  index: number;
  children: ReactNode;
  lead?: ReactNode;
}) {
  const headingId = `${meta.id}-heading`;
  return (
    <section
      id={meta.id}
      aria-labelledby={headingId}
      className="border-t border-line py-16 sm:py-24"
    >
      <div className="container-page">
        <Reveal>
          <p className="mb-3 label-mono">
            <span className="text-accent">{String(index).padStart(2, "0")}</span> / {meta.id}
          </p>
          <h2 id={headingId} className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {meta.title}
          </h2>
          {lead && <div className="mt-4 max-w-2xl text-muted">{lead}</div>}
        </Reveal>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
