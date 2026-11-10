import type { PortfolioContent, SectionMeta } from "../../types/profile";
import { SectionShell } from "../components/SectionShell";
import { Reveal } from "../components/Reveal";
import { Chips } from "../components/Chips";
import { Icon } from "../components/Icon";
import { assetUrl } from "../../lib/content-utils";

type Props = { content: PortfolioContent; meta: SectionMeta; index: number };

export function Projects({ content, meta, index }: Props) {
  const projects = content.projects.filter((p) => p.visible);
  return (
    <SectionShell meta={meta} index={index}>
      <ul className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <li key={p.id}>
            <Reveal delay={Math.min(i, 3) * 0.05}>
              <article
                className="flex h-full flex-col overflow-hidden card"
                data-testid="project-card"
              >
                {p.image && (
                  <img
                    src={assetUrl(p.image)}
                    alt={p.imageAlt}
                    width={1200}
                    height={630}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[1200/630] w-full border-b border-line object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
                  {p.description && (
                    <p className="mt-3 leading-relaxed text-muted">{p.description}</p>
                  )}
                  <div className="mt-5">
                    <Chips items={p.tags} label={`Technologies used in ${p.title}`} />
                  </div>
                  {p.links.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-4 pt-6">
                      {p.links.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-sm text-accent hover:underline"
                        >
                          {l.label} <Icon name="external" width={14} height={14} />
                          <span className="sr-only">: {p.title} (opens in a new tab)</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
