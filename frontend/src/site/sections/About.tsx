import type { PortfolioContent, SectionMeta } from "../../types/profile";
import { SectionShell } from "../components/SectionShell";
import { Reveal } from "../components/Reveal";
import { Icon } from "../components/Icon";

type Props = { content: PortfolioContent; meta: SectionMeta; index: number };

export function About({ content, meta, index }: Props) {
  const { profile } = content;
  const current = content.experience.find((e) => e.visible && !e.end);
  const facts = [
    ["role", profile.title],
    ["current", current ? `${current.role} @ ${current.company}` : ""],
    ["location", profile.location],
    ["open_to", profile.availability],
  ].filter(([, v]) => v);

  return (
    <SectionShell meta={meta} index={index}>
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <Reveal>
          {profile.about && <p className="text-lg leading-relaxed text-pretty">{profile.about}</p>}
          {profile.highlights.length > 0 && (
            <ul className="mt-8 space-y-4">
              {profile.highlights.map((h) => (
                <li key={h} className="flex gap-3 leading-relaxed text-muted">
                  <Icon name="check" className="mt-1 shrink-0 text-accent" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
        <Reveal delay={0.1}>
          <dl className="divide-y divide-line card font-mono text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 px-5 py-3.5">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </SectionShell>
  );
}
