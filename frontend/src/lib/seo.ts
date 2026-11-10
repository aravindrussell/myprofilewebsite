import type { PortfolioContent } from "../types/profile.ts";
import { FONT_PAIRS } from "./fonts.ts";
import { onColor } from "./color.ts";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** JSON for embedding inside a <script> tag (prevents `</script>` breakouts). */
function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\u003c");
}

export function personJsonLd(c: PortfolioContent, siteUrl: string): Record<string, unknown> {
  const { profile } = c;
  const sameAs = [profile.socials.linkedin, profile.socials.github, profile.socials.naukri].filter(
    Boolean,
  );
  const current = c.experience.find((e) => e.visible && !e.end);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.headline,
    email: `mailto:${profile.email}`,
    ...(siteUrl && { url: siteUrl }),
    ...(sameAs.length && { sameAs }),
    ...(profile.location && {
      address: { "@type": "PostalAddress", addressLocality: profile.location },
    }),
    ...(current && { worksFor: { "@type": "Organization", name: current.company } }),
    alumniOf: c.education
      .filter((e) => e.visible)
      .map((e) => ({ "@type": "EducationalOrganization", name: e.institution })),
    knowsAbout: [...new Set(c.skills.flatMap((g) => g.skills.map((s) => s.name)))],
  };
}

/** CSS custom properties derived from the theme (accent + font pair). */
export function themeCss(c: PortfolioContent): string {
  const { accent, accentDark, fontPair } = c.theme;
  const fonts = FONT_PAIRS[fontPair];
  return (
    `:root{--accent:${accent};--on-accent:${onColor(accent)};` +
    `--font-sans:${fonts.sans};--font-mono:${fonts.mono}}` +
    `:root[data-theme=dark]{--accent:${accentDark};--on-accent:${onColor(accentDark)}}`
  );
}

/**
 * Sets data-theme before first paint: saved choice, else the content default, else the OS.
 * Kept tiny and dependency-free because it is inlined into <head>.
 */
export function themeBootScript(defaultMode: string): string {
  return (
    `(function(){var d=document.documentElement,m=${JSON.stringify(defaultMode)},s;` +
    `try{s=localStorage.getItem("theme")}catch(e){}` +
    `if(s==="light"||s==="dark")m=s;` +
    `else if(m==="system")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";` +
    `d.dataset.theme=m})();`
  );
}

/** Everything that goes into <head>, as an HTML string. */
export function buildHead(c: PortfolioContent, siteUrl: string): string {
  const { seo, profile } = c;
  const url = siteUrl ? `${siteUrl}/` : "";
  const ogImage = seo.ogImage && siteUrl ? `${siteUrl}/content/${seo.ogImage}` : "";
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    seo.keywords.length ? `<meta name="keywords" content="${esc(seo.keywords.join(", "))}" />` : "",
    `<meta name="author" content="${esc(profile.name)}" />`,
    `<meta name="color-scheme" content="light dark" />`,
    `<meta name="theme-color" content="#F7F8FA" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#0B0D12" media="(prefers-color-scheme: dark)" />`,
    url ? `<link rel="canonical" href="${esc(url)}" />` : "",
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    url ? `<meta property="og:url" content="${esc(url)}" />` : "",
    ogImage ? `<meta property="og:image" content="${esc(ogImage)}" />` : "",
    ogImage ? `<meta property="og:image:alt" content="${esc(seo.title)}" />` : "",
    `<meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : "",
    `<script src="/theme-boot.js"></script>`,
    `<style id="theme-vars">${themeCss(c)}</style>`,
    `<noscript><style>[data-reveal]{opacity:1!important;transform:none!important}</style></noscript>`,
    `<script type="application/ld+json">${scriptJson(personJsonLd(c, siteUrl))}</script>`,
  ];
  return tags.filter(Boolean).join("\n    ");
}

export function sitemapXml(siteUrl: string, lastmod: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${esc(siteUrl)}/</loc><lastmod>${lastmod}</lastmod></url>
</urlset>
`;
}

export function robotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ""}`;
}

export function faviconSvg(c: PortfolioContent, monogram: string): string {
  const { accent } = c.theme;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0B0D12"/><text x="32" y="41" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="26" font-weight="700" fill="${accent}">${esc(monogram)}</text><rect x="46" y="38" width="8" height="3" fill="${accent}"/></svg>`;
}
