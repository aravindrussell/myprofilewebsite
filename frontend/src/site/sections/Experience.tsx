import { useState } from "react";
import type { Experience as Job, PortfolioContent, SectionMeta } from "../../types/profile";
import { SectionShell } from "../components/SectionShell";
import { Reveal } from "../components/Reveal";
import { Chips } from "../components/Chips";
import { duration, formatYearMonth } from "../../lib/dates";

type Props = { content: PortfolioContent; meta: SectionMeta; index: number };

const COLLAPSED_BULLETS = 3;

function TimelineItem({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const current = !job.end;
  const bullets = expanded ? job.bullets : job.bullets.slice(0, COLLAPSED_BULLETS);
  const hidden = job.bullets.length - COLLAPSED_BULLETS;
  const listId = `${job.id}-bullets`;

  return (
    <li className="relative pb-12 pl-8 last:pb-0 sm:pl-10" data-testid="timeline-item">
      <span
        className={`absolute top-1.5 left-0 size-3 -translate-x-[5px] rounded-full border-2 ${
          current ? "border-accent bg-accent" : "border-line bg-bg"
        }`}
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
        <span
          className={`rounded px-1.5 py-0.5 font-semibold ${
            current ? "bg-accent text-on-accent" : "border border-line"
          }`}
        >
          {current ? "RUNNING" : "PASS"}
        </span>
        <span>
          {formatYearMonth(job.start)} – {formatYearMonth(job.end)}
        </span>
        <span aria-hidden>·</span>
        <span>{duration(job.start, job.end)}</span>
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">
        {job.role} <span className="text-muted">@</span> {job.company}
      </h3>
      {(job.client || job.project || job.location) && (
        <p className="mt-1 text-sm text-muted">
          {[
            job.client && `Client: ${job.client}`,
            job.project && `Project: ${job.project}`,
            job.location,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {bullets.length > 0 && (
        <ul
          id={listId}
          className="mt-4 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed marker:text-accent"
        >
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {hidden > 0 && (
        <button
          type="button"
          className="mt-3 font-mono text-sm text-accent hover:underline"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => {
            setExpanded((e) => !e);
          }}
        >
          {expanded ? "Show less" : `Show ${hidden} more`}
        </button>
      )}
      <div className="mt-5">
        <Chips items={job.tags} label={`Technologies at ${job.company}`} />
      </div>
    </li>
  );
}

export function Experience({ content, meta, index }: Props) {
  const jobs = content.experience.filter((e) => e.visible);
  return (
    <SectionShell meta={meta} index={index}>
      <Reveal>
        <ol className="relative ml-1.5 border-l border-line">
          {jobs.map((job) => (
            <TimelineItem key={job.id} job={job} />
          ))}
        </ol>
      </Reveal>
    </SectionShell>
  );
}
