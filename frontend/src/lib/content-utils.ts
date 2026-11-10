/** Pure helpers shared by the site, the admin preview and build tooling (no import.meta.env). */
import type { PortfolioContent, SectionMeta } from "../types/profile";

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Public URL for a content asset path such as "assets/photo.webp". */
export function assetUrl(path: string): string {
  return path ? `/content/${path}` : "";
}

export function resumeHref(c: PortfolioContent): string {
  const { resume } = c.profile;
  return resume.mode === "file" ? assetUrl(resume.file) : resume.url;
}

/** Sections to render, in order: visible and with something to show. */
export function renderedSections(c: PortfolioContent): SectionMeta[] {
  const hasItems: Partial<Record<SectionMeta["id"], boolean>> = {
    about: Boolean(c.profile.about || c.profile.highlights.length),
    skills: c.skills.some((g) => g.skills.length),
    experience: c.experience.some((e) => e.visible),
    projects: c.projects.some((p) => p.visible),
    education: c.education.some((e) => e.visible),
    certifications: c.certifications.some((e) => e.visible),
    testimonials: c.testimonials.some((t) => t.visible),
  };
  return c.sections.filter((s) => s.visible && hasItems[s.id] !== false);
}
