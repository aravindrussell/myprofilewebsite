import type { Page } from "@playwright/test";

export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(readonly page: Page) {}

  async open(): Promise<this> {
    await this.page.goto(this.path);
    return this;
  }

  /** Pixels the document is wider than the viewport (0 means no horizontal scroll). */
  horizontalOverflow(): Promise<number> {
    return this.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  }
}
