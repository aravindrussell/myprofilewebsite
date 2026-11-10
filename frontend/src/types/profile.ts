/* eslint-disable */
// Generated from content/profile.schema.json by scripts/gen-types.mjs. Do not edit.
// Source of truth: backend/app/models.py (run `npm run gen:types` after changing it).

/**
 * Everything the public site renders.
 */
export interface PortfolioContent {
  schemaVersion: 1;
  profile: Profile;
  sections: SectionMeta[];
  /**
   * @maxItems 20
   */
  skills: SkillGroup[];
  /**
   * @maxItems 30
   */
  experience: Experience[];
  /**
   * @maxItems 30
   */
  projects: Project[];
  /**
   * @maxItems 10
   */
  education: Education[];
  /**
   * @maxItems 30
   */
  certifications: Certification[];
  /**
   * @maxItems 20
   */
  testimonials: Testimonial[];
  contact: Contact;
  theme: Theme;
  seo: Seo;
}
export interface Profile {
  name: string;
  title: string;
  /**
   * One-line value proposition shown in the hero.
   */
  headline: string;
  about: string;
  /**
   * @maxItems 12
   */
  highlights: string[];
  location: string;
  availability: string;
  email: string;
  phone: string;
  showPhone: boolean;
  photo: string;
  photoAlt: string;
  socials: SocialLinks;
  resume: Resume;
  /**
   * @maxItems 6
   */
  stats: Stat[];
}
export interface SocialLinks {
  linkedin: string;
  github: string;
  naukri: string;
}
export interface Resume {
  mode: "url" | "file";
  url: string;
  file: string;
}
export interface Stat {
  id: string;
  value: string;
  label: string;
}
export interface SectionMeta {
  id:
    | "hero"
    | "about"
    | "skills"
    | "experience"
    | "projects"
    | "education"
    | "certifications"
    | "testimonials"
    | "contact";
  navLabel: string;
  title: string;
  visible: boolean;
}
export interface SkillGroup {
  id: string;
  name: string;
  /**
   * @maxItems 40
   */
  skills: Skill[];
}
export interface Skill {
  name: string;
  level: ("core" | "proficient" | "familiar") | null;
}
export interface Experience {
  id: string;
  company: string;
  role: string;
  start: string;
  /**
   * Empty means 'Present'.
   */
  end: string;
  location: string;
  client: string;
  project: string;
  /**
   * @maxItems 20
   */
  bullets: string[];
  /**
   * @maxItems 30
   */
  tags: string[];
  visible: boolean;
}
export interface Project {
  id: string;
  title: string;
  description: string;
  /**
   * @maxItems 20
   */
  tags: string[];
  /**
   * @maxItems 6
   */
  links: ProjectLink[];
  image: string;
  imageAlt: string;
  visible: boolean;
}
export interface ProjectLink {
  label: string;
  url: string;
}
export interface Education {
  id: string;
  qualification: string;
  institution: string;
  start: string;
  end: string;
  visible: boolean;
}
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
  visible: boolean;
}
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  url: string;
  visible: boolean;
}
export interface Contact {
  message: string;
}
export interface Theme {
  /**
   * Accent colour used on light backgrounds.
   */
  accent: string;
  /**
   * Accent colour used on dark backgrounds.
   */
  accentDark: string;
  defaultMode: "system" | "light" | "dark";
  fontPair: "inter-jetbrains" | "grotesk-plex" | "serif-mono";
}
export interface Seo {
  title: string;
  description: string;
  /**
   * @maxItems 25
   */
  keywords: string[];
  ogImage: string;
  /**
   * Overridden by VITE_SITE_URL if set.
   */
  siteUrl: string;
}
