import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { contentPlugin } from "./plugins/content";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const contentDir = process.env.CONTENT_DIR ?? fileURLToPath(new URL("../content", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "VITE_");
  const webPort = Number(process.env.WEB_PORT ?? 5173);
  const apiPort = Number(process.env.API_PORT ?? 8787);
  const siteUrl = () => {
    const fromContent = (
      JSON.parse(readFileSync(`${contentDir}/profile.json`, "utf8")) as { seo: { siteUrl: string } }
    ).seo.siteUrl;
    return (env.VITE_SITE_URL || fromContent || "").replace(/\/$/, "");
  };

  return {
    envDir: repoRoot,
    plugins: [react(), tailwindcss(), contentPlugin({ contentDir, siteUrl })],
    server: {
      host: "localhost",
      port: webPort,
      strictPort: true,
      fs: { allow: [repoRoot] },
      proxy: { "/api": { target: `http://127.0.0.1:${apiPort}`, changeOrigin: false } },
    },
    preview: { host: "localhost", port: 4173, strictPort: true },
    build: { target: "es2022", cssCodeSplit: true },
  };
});
