// Post-build step: renders the site to HTML with the SSR bundle and writes it into
// dist/index.html (plus a static 404.html), so the page is fully readable without JS.
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const ssrDir = fileURLToPath(new URL("../dist-ssr/", import.meta.url));

const { render } = (await import(pathToFileURL(`${ssrDir}entry-server.js`).href)) as {
  render: () => string;
};

const template = readFileSync(`${dist}index.html`, "utf8");
if (!template.includes("<!--app-html-->")) throw new Error("index.html is missing <!--app-html-->");
writeFileSync(`${dist}index.html`, template.replace("<!--app-html-->", render()));

const notFound = template
  .replace(/<script type="module"[^>]*><\/script>/g, "")
  .replace(/<link rel="canonical"[^>]*>/, "")
  .replace(/<title>.*?<\/title>/, "<title>Page not found</title>")
  .replace(
    "<!--app-html-->",
    `<main class="container-page py-24 font-mono"><p class="label-mono">404 / not found</p>` +
      `<h1 class="mt-3 text-3xl font-semibold">✗ This page doesn't exist.</h1>` +
      `<p class="mt-6"><a class="text-accent underline" href="/">← Back to the portfolio</a></p></main>`,
  );
writeFileSync(`${dist}404.html`, notFound);

rmSync(ssrDir, { recursive: true, force: true });
console.log("Prerendered dist/index.html and dist/404.html");
