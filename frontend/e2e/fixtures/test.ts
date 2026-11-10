import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { HomePage } from "../pages/HomePage";
import { AdminPage } from "../pages/AdminPage";
import { ContentStore } from "./content";

interface Fixtures {
  home: HomePage;
  admin: AdminPage;
  /** The admin stack's throwaway content dir (reset before every admin test). */
  content: ContentStore;
  axe: () => AxeBuilder;
}

export const test = base.extend<Fixtures>({
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  content: async ({}, use) => {
    await use(new ContentStore());
  },
  admin: async ({ page, content }, use) => {
    content.reset();
    await use(new AdminPage(page));
  },
  axe: async ({ page }, use) => {
    await use(() =>
      new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]),
    );
  },
});

export { expect };
