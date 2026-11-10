import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  envDir: repoRoot,
  plugins: [react(), tailwindcss()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    fs: { allow: [repoRoot] },
    proxy: { "/api": { target: "http://127.0.0.1:8787", changeOrigin: false } },
  },
  preview: { host: "localhost", port: 4173, strictPort: true },
});
