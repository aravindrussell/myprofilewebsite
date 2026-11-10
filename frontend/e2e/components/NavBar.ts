import type { Locator, Page } from "@playwright/test";

export class NavBar {
  readonly root: Locator;
  readonly menuButton: Locator;
  readonly themeToggle: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole("navigation", { name: "Primary" });
    this.menuButton = page.getByRole("button", { name: /open menu|close menu/i });
    this.themeToggle = page.getByTestId("theme-toggle");
  }

  /** The link for a section, from the desktop bar or the open mobile menu. */
  link(name: string): Locator {
    return this.page
      .locator("header")
      .getByRole("link", { name, exact: true })
      .locator("visible=true");
  }

  /** The link marked aria-current (on mobile it lives in the collapsed menu). */
  activeLink(): Locator {
    return this.page.locator('header a[aria-current="location"]').first();
  }

  async goTo(name: string): Promise<void> {
    if (await this.menuButton.isVisible()) await this.menuButton.click();
    await this.link(name).click();
  }

  theme(): Promise<string | null> {
    return this.page.locator("html").getAttribute("data-theme");
  }
}
