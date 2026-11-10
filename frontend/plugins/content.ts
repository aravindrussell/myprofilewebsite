// Vite plugin that wires content/ into the site:
// - injects SEO/theme <head> tags from profile.json (dev and build)
// - provides `virtual:fonts` (all presets in dev for live preview, only the chosen pair in build)
// - serves content/assets at /content/assets in dev and copies it into the build
// - emits favicon.svg, sitemap.xml and robots.txt
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, sep, extname } from "node:path";
import type { Plugin } from "vite";
import type { PortfolioContent } from "../src/types/profile";
import { FONT_IMPORTS } from "../src/lib/fonts";
import { buildHead, faviconSvg, robotsTxt, sitemapXml, themeBootScript } from "../src/lib/seo";
import { initials } from "../src/lib/content-utils";

const VIRTUAL_FONTS = "virtual:fonts";
const RESOLVED_FONTS = "\0virtual:fonts";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export function contentPlugin(opts: { contentDir: string; siteUrl: () => string }): Plugin {
  const profilePath = join(opts.contentDir, "profile.json");
  const assetsDir = join(opts.contentDir, "assets");
  const read = (): PortfolioContent =>
    JSON.parse(readFileSync(profilePath, "utf8")) as PortfolioContent;
  let isDev = false;
  let isSsr = false;

  return {
    name: "portfolio-content",
    configResolved(config) {
      isDev = config.command === "serve";
      isSsr = Boolean(config.build.ssr);
    },
    resolveId(id) {
      return id === VIRTUAL_FONTS ? RESOLVED_FONTS : undefined;
    },
    load(id) {
      if (id !== RESOLVED_FONTS) return undefined;
      const pairs = isDev ? Object.values(FONT_IMPORTS) : [FONT_IMPORTS[read().theme.fontPair]];
      return [...new Set(pairs.flat())].map((f) => `import "${f}";`).join("\n");
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replace("<!--app-head-->", buildHead(read(), opts.siteUrl()));
      },
    },
    configureServer(server) {
      server.watcher.add(profilePath);
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0] ?? "";
        if (url === "/theme-boot.js") {
          res.setHeader("Content-Type", "text/javascript");
          res.end(themeBootScript(read().theme.defaultMode));
          return;
        }
        if (url === "/favicon.svg") {
          const c = read();
          res.setHeader("Content-Type", "image/svg+xml");
          res.end(faviconSvg(c, initials(c.profile.name)));
          return;
        }
        if (!url.startsWith("/content/assets/")) {
          next();
          return;
        }
        const file = resolve(assetsDir, decodeURIComponent(url.slice("/content/assets/".length)));
        const type = MIME[extname(file).toLowerCase()];
        if (!file.startsWith(assetsDir + sep) || !type || !existsSync(file)) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }
        res.setHeader("Content-Type", type);
        res.setHeader("Cache-Control", "no-store");
        res.end(readFileSync(file));
      });
    },
    generateBundle() {
      if (isSsr) return;
      const c = read();
      const siteUrl = opts.siteUrl();
      this.emitFile({
        type: "asset",
        fileName: "favicon.svg",
        source: faviconSvg(c, initials(c.profile.name)),
      });
      this.emitFile({
        type: "asset",
        fileName: "theme-boot.js",
        source: themeBootScript(c.theme.defaultMode),
      });
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robotsTxt(siteUrl) });
      if (siteUrl) {
        const lastmod = new Date().toISOString().slice(0, 10);
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: sitemapXml(siteUrl, lastmod),
        });
      }
      if (existsSync(assetsDir)) {
        for (const name of readdirSync(assetsDir)) {
          const file = join(assetsDir, name);
          if (!statSync(file).isFile() || !MIME[extname(name).toLowerCase()]) continue;
          this.emitFile({
            type: "asset",
            fileName: `content/assets/${name}`,
            source: readFileSync(file),
          });
        }
      }
    },
  };
}
