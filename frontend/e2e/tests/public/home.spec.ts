import { test, expect } from "../../fixtures/test";

test.describe("Home page — first impression", () => {
  test.beforeEach(async ({ home }) => {
    await home.open();
  });

  test("shows name, title and both CTAs above the fold", async ({ home, page }) => {
    await expect(home.heading).toHaveText("Aravind Russell V");
    await expect(page.getByText("Test Automation Architect").first()).toBeVisible();
    const viewport = page.viewportSize();
    for (const cta of [home.resumeCta, home.contactCta]) {
      await expect(cta).toBeInViewport();
      const box = await cta.boundingBox();
      expect(box && viewport && box.y + box.height).toBeLessThanOrEqual(viewport?.height ?? 0);
    }
  });

  test("Download Resume points at the PDF and opens in a new tab", async ({ home }) => {
    await expect(home.resumeCta).toHaveAttribute("href", /^https:\/\/1drv\.ms\//);
    await expect(home.resumeCta).toHaveAttribute("target", "_blank");
  });

  test("Contact CTA scrolls to the contact section", async ({ home, page }) => {
    await home.contactCta.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(home.section("contact")).toBeInViewport();
    await expect(home.section("contact").getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:aravind.russell@outlook.com",
    );
    await expect(home.section("contact").getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/aravind-russell-venugopal/",
    );
  });

  test("shows key stats from the content file", async ({ home }) => {
    await expect(home.stats).toHaveCount(3);
    await expect(home.stats.first()).toContainText("12+");
  });

  test("phone number is hidden by default", async ({ page }) => {
    await expect(page.getByText("9677873329")).toHaveCount(0);
  });
});

test.describe("Home page — sections", () => {
  test.beforeEach(async ({ home }) => {
    await home.open();
  });

  test("renders visible sections in configured order and skips hidden ones", async ({ home }) => {
    expect(await home.sectionHeadings()).toEqual([
      "About",
      "Skills",
      "Experience",
      "Projects",
      "Education",
      "Certifications & Appreciation",
      "Contact",
    ]);
    await expect(home.section("testimonials")).toHaveCount(0);
  });

  test("experience timeline lists every role, current one first", async ({ home }) => {
    await expect(home.timelineItems).toHaveCount(5);
    await expect(home.timelineItems.first()).toContainText("RUNNING");
    await expect(home.timelineItems.first()).toContainText("Lead Quality Engineer @ Nomura");
  });

  test("long bullet lists expand and collapse", async ({ home }) => {
    const nomura = home.timelineItems.first();
    const toggle = nomura.getByRole("button", { name: /show \d+ more/i });
    await expect(nomura.getByText("Led test environment planning")).toHaveCount(0);
    await toggle.click();
    await expect(nomura.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(nomura.getByText("Led test environment planning")).toBeVisible();
  });

  test("only visible projects are shown", async ({ home }) => {
    await expect(home.projectCards).toHaveCount(1);
    await expect(home.projectCards.first()).toContainText("Requirement Analysis Agent");
    await expect(home.page.getByText("Data Compare Tool", { exact: true })).toHaveCount(0);
  });
});

test.describe("Navigation", () => {
  test("highlights the section in view", async ({ home }) => {
    await home.open();
    await home.nav.goTo("Experience");
    await expect(home.nav.activeLink()).toHaveText("Experience");
    await home.nav.goTo("Contact");
    await expect(home.nav.activeLink()).toHaveText("Contact");
  });

  test("skip link moves focus to the main content", async ({ home, page }) => {
    await home.open();
    await page.keyboard.press("Tab");
    await expect(home.skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("theme toggle switches and remembers the choice", async ({ home, page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await home.open();
    expect(await home.nav.theme()).toBe("light");
    await home.nav.themeToggle.click();
    expect(await home.nav.theme()).toBe("dark");
    await page.reload();
    expect(await home.nav.theme()).toBe("dark");
  });

  test("follows the system colour scheme by default", async ({ home, page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await home.open();
    expect(await home.nav.theme()).toBe("dark");
  });
});
