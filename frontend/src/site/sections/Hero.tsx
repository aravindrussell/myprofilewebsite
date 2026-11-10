import type { PortfolioContent } from "../../types/profile";
import { Icon } from "../components/Icon";
import { yearsSince } from "../../lib/dates";

export function Hero({ content, resumeHref }: { content: PortfolioContent; resumeHref: string }) {
  const { profile } = content;
  const isFile = profile.resume.mode === "file";
  const jobs = content.experience.filter((e) => e.visible);
  const firstStart = jobs.map((j) => j.start).sort()[0];
  const years = firstStart ? yearsSince(firstStart) : 0;

  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-60" aria-hidden />
      <div className="relative container-page grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:py-28">
        <div>
          <p className="font-mono text-sm text-muted">
            <span className="text-accent">$</span> run profile --suite=career
            <span className="cursor-blink ml-0.5 text-accent" aria-hidden>
              ▍
            </span>
          </p>
          <h1
            id="hero-heading"
            className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
          >
            {profile.name}
          </h1>
          <p className="mt-3 font-mono text-base text-accent sm:text-lg">{profile.title}</p>
          <p className="mt-5 max-w-xl text-lg text-pretty text-muted sm:text-xl">
            {profile.headline}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={resumeHref}
              className="btn-primary"
              {...(isFile ? { download: "" } : { target: "_blank", rel: "noopener" })}
              data-testid="cta-resume"
            >
              <Icon name="download" /> Download Resume
            </a>
            <a href="#contact" className="btn-secondary" data-testid="cta-contact">
              <Icon name="mail" /> Contact
            </a>
          </div>

          {profile.stats.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4" aria-label="Key facts">
              {profile.stats.map((s) => (
                <li key={s.id} className="flex items-baseline gap-2">
                  <Icon name="check" className="shrink-0 self-center text-accent" />
                  <span className="font-mono text-lg font-semibold">{s.value}</span>
                  <span className="text-sm text-muted">{s.label}</span>
                </li>
              ))}
            </ul>
          )}

          {(profile.availability || profile.location) && (
            <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              {profile.availability && (
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-accent" aria-hidden />
                  {profile.availability}
                </span>
              )}
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="pin" width={15} height={15} /> Based in {profile.location}
                </span>
              )}
            </p>
          )}
        </div>

        {jobs.length > 0 && (
          <div className="hidden overflow-hidden card shadow-sm lg:block" aria-hidden>
            <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-line" />
              <span className="ml-3 font-mono text-xs text-muted">career.spec.ts</span>
            </div>
            <div className="space-y-3 p-5 font-mono text-[13px] leading-relaxed">
              <p className="text-muted">
                <span className="text-accent">$</span> npx playwright test career.spec.ts
              </p>
              <ul className="space-y-2">
                {jobs.map((j) => (
                  <li key={j.id} className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-fg">{j.company.split(" ")[0]?.toLowerCase()}</span>
                      <span className="text-muted"> › {j.role}</span>
                    </span>
                    <span className="text-muted">
                      {j.start.slice(0, 4)}–{j.end ? j.end.slice(0, 4) : "now"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-line pt-3">
                <span className="text-accent">{jobs.length} passed</span>
                {years > 0 && <span className="text-muted"> · {years} yrs</span>}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
