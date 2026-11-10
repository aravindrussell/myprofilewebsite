import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ComponentType } from "react";
import type { PortfolioContent, SectionMeta } from "../types/profile";
import { initials, renderedSections, resumeHref } from "../lib/content-utils";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Skills } from "./sections/Skills";
import { Experience } from "./sections/Experience";
import { Projects } from "./sections/Projects";
import { Certifications, Education, Testimonials } from "./sections/Credentials";
import { Contact } from "./sections/Contact";

type SectionProps = {
  content: PortfolioContent;
  meta: SectionMeta;
  index: number;
  formspreeId: string;
};

const SECTIONS: Record<Exclude<SectionMeta["id"], "hero">, ComponentType<SectionProps>> = {
  about: About,
  skills: Skills,
  experience: Experience,
  projects: Projects,
  education: Education,
  certifications: Certifications,
  testimonials: Testimonials,
  contact: Contact,
};

/** The public site. Pure function of `content`, so the admin preview can render drafts too. */
export function Site({ content, formspreeId }: { content: PortfolioContent; formspreeId: string }) {
  const sections = renderedSections(content);
  const resume = resumeHref(content);
  // Hero is unnumbered; the rest are numbered 01, 02, ... in display order.
  const offset = sections[0]?.id === "hero" ? 0 : 1;

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Skip to content
        </a>
        <Nav
          sections={sections}
          monogram={initials(content.profile.name)}
          name={content.profile.name}
        />
        <main id="main">
          {sections.map((meta, i) => {
            if (meta.id === "hero")
              return <Hero key="hero" content={content} resumeHref={resume} />;
            const Section = SECTIONS[meta.id];
            return (
              <Section
                key={meta.id}
                content={content}
                meta={meta}
                index={i + offset}
                formspreeId={formspreeId}
              />
            );
          })}
        </main>
        <Footer name={content.profile.name} resumeHref={resume} />
      </MotionConfig>
    </LazyMotion>
  );
}
