import type { PortfolioContent, SectionMeta } from "../../types/profile";
import { SectionShell } from "../components/SectionShell";
import { Reveal } from "../components/Reveal";

type Props = { content: PortfolioContent; meta: SectionMeta; index: number };

export function Skills({ content, meta, index }: Props) {
  const groups = content.skills.filter((g) => g.skills.length);
  const hasLevels = groups.some((g) => g.skills.some((s) => s.level));
  return (
    <SectionShell
      meta={meta}
      index={index}
      lead={
        hasLevels ? (
          <p className="font-mono text-xs">levels: core · proficient · familiar</p>
        ) : undefined
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => (
          <Reveal key={g.id} delay={Math.min(i, 5) * 0.04}>
            <div className="h-full card p-5">
              <h3 className="label-mono">
                <span className="text-accent">▸</span> {g.name}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.skills.map((s) => (
                  <li key={s.name} className={`chip ${s.level === "core" ? "border-accent" : ""}`}>
                    {s.name}
                    {s.level && <span className="ml-1.5 text-muted">· {s.level}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
