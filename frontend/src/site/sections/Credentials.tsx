import type { PortfolioContent, SectionMeta } from "../../types/profile";
import { SectionShell } from "../components/SectionShell";
import { Reveal } from "../components/Reveal";
import { Icon } from "../components/Icon";
import { formatYearMonth } from "../../lib/dates";

type Props = { content: PortfolioContent; meta: SectionMeta; index: number };

export function Education({ content, meta, index }: Props) {
  const items = content.education.filter((e) => e.visible);
  return (
    <SectionShell meta={meta} index={index}>
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((e) => (
          <li key={e.id}>
            <Reveal>
              <div className="h-full card p-6">
                <h3 className="text-lg font-semibold tracking-tight">{e.qualification}</h3>
                <p className="mt-1 text-muted">{e.institution}</p>
                {(e.start || e.end) && (
                  <p className="mt-3 font-mono text-xs text-muted">
                    {[e.start, e.end].filter(Boolean).join(" – ")}
                  </p>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function Certifications({ content, meta, index }: Props) {
  const items = content.certifications.filter((c) => c.visible);
  return (
    <SectionShell meta={meta} index={index}>
      <Reveal>
        <ul className="divide-y divide-line card">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4"
            >
              <div className="flex items-baseline gap-3">
                <Icon name="check" className="shrink-0 self-center text-accent" />
                <span className="font-medium">
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent"
                    >
                      {c.name}
                    </a>
                  ) : (
                    c.name
                  )}
                </span>
              </div>
              <span className="font-mono text-xs text-muted">
                {[c.issuer, c.date && formatYearMonth(c.date)].filter(Boolean).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionShell>
  );
}

export function Testimonials({ content, meta, index }: Props) {
  const items = content.testimonials.filter((t) => t.visible);
  return (
    <SectionShell meta={meta} index={index}>
      <ul className="grid gap-5 md:grid-cols-2">
        {items.map((t) => (
          <li key={t.id}>
            <Reveal>
              <figure className="h-full card p-6">
                <blockquote className="leading-relaxed text-pretty">“{t.quote}”</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">
                    {t.url ? (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                      >
                        {t.author}
                      </a>
                    ) : (
                      t.author
                    )}
                  </span>
                  {t.role && <span className="text-muted"> · {t.role}</span>}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
