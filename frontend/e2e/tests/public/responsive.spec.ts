import { test, expect } from "../../fixtures/test";

const WIDTHS = [360, 414, 768, 1024, 1280, 1920];

test.describe("Responsive layout", () => {
  for (const width of WIDTHS) {
    test(`has no horizontal scroll at ${width}px`, async ({ home, page }) => {
      await page.setViewportSize({ width, height: 900 });
      await home.open();
      expect(await home.horizontalOverflow()).toBe(0);
    });
  }

  test("mobile menu opens, navigates and closes", async ({ home, page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await home.open();
    await expect(home.nav.menuButton).toHaveAttribute("aria-expanded", "false");
    await home.nav.goTo("Projects");
    await expect(home.section("projects")).toBeInViewport();
    await expect(home.nav.menuButton).toHaveAttribute("aria-expanded", "false");
  });
});
