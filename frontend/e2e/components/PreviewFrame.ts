import type { FrameLocator, Locator, Page } from "@playwright/test";

/** The live preview iframe inside the admin page. */
export class PreviewFrame {
  readonly frame: FrameLocator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.frame = page.frameLocator('[data-testid="preview-frame"]');
    this.heading = this.frame.getByRole("heading", { level: 1 });
  }

  text(value: string): Locator {
    return this.frame.getByText(value, { exact: true });
  }

  section(id: string): Locator {
    return this.frame.locator(`section#${id}`);
  }
}
