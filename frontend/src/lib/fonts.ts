import type { Theme } from "../types/profile";

type FontPair = Theme["fontPair"];

/** Font stacks per preset. The CSS for each lives in the `virtual:fonts` module (vite.config.ts). */
export const FONT_PAIRS: Record<FontPair, { label: string; sans: string; mono: string }> = {
  "inter-jetbrains": {
    label: "Inter + JetBrains Mono",
    sans: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono Variable', ui-monospace, 'Cascadia Code', monospace",
  },
  "grotesk-plex": {
    label: "Space Grotesk + IBM Plex Mono",
    sans: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, 'Cascadia Code', monospace",
  },
  "serif-mono": {
    label: "Source Serif 4 + JetBrains Mono",
    sans: "'Source Serif 4 Variable', ui-serif, Georgia, serif",
    mono: "'JetBrains Mono Variable', ui-monospace, 'Cascadia Code', monospace",
  },
};

/** CSS imports per preset, consumed by the virtual:fonts Vite plugin. */
export const FONT_IMPORTS: Record<FontPair, string[]> = {
  "inter-jetbrains": [
    "@fontsource-variable/inter/wght.css",
    "@fontsource-variable/jetbrains-mono/wght.css",
  ],
  "grotesk-plex": [
    "@fontsource-variable/space-grotesk/wght.css",
    "@fontsource/ibm-plex-mono/latin-400.css",
    "@fontsource/ibm-plex-mono/latin-500.css",
  ],
  "serif-mono": [
    "@fontsource-variable/source-serif-4/wght.css",
    "@fontsource-variable/jetbrains-mono/wght.css",
  ],
};
