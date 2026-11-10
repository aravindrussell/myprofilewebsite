import { test, expect } from "../../fixtures/test";

test.describe("Accessibility", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`has no WCAG A/AA violations in ${scheme} mode`, async ({ home, page, axe }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await home.open();
      const results = await axe().analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });
  }

  test("uses one h1 and h2s for every section", async ({ home, page }) => {
    await home.open();
    await expect(page.locator("h1")).toHaveCount(1);
    const sections = await page.locator("main section").count();
    await expect(page.locator("main section h2")).toHaveCount(sections - 1); // hero uses the h1
  });

  test("every image has alt text", async ({ home, page }) => {
    await home.open();
    await expect(page.locator("img:not([alt])")).toHaveCount(0);
  });

  test("interactive elements show a visible focus outline", async ({ home }) => {
    await home.open();
    await home.resumeCta.focus();
    const outline = await home.resumeCta.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });

  test("with reduced motion, content is visible without scrolling into view", async ({
    home,
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await home.open();
    const opacity = await home
      .section("certifications")
      .locator("[data-reveal]")
      .first()
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
  });
});
