/// <reference types="vite/client" />

declare module "virtual:fonts";

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_FORMSPREE_ID?: string;
}
