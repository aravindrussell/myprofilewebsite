import { test, expect } from "../../fixtures/test";

test.describe("SEO and social metadata", () => {
  test.beforeEach(async ({ home }) => {
    await home.open();
  });

  test("has title, description and canonical URL", async ({ home, page }) => {
    await expect(page).toHaveTitle("Aravind Russell V — Test Automation Architect");
    expect(await home.meta('meta[name="description"]')).toContain("Test Automation Architect");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/.+\/$/);
  });

  test("has Open Graph and Twitter cards with an absolute image URL", async ({ home }) => {
    expect(await home.meta('meta[property="og:title"]')).toBe(
      "Aravind Russell V — Test Automation Architect",
    );
    expect(await home.meta('meta[property="og:image"]')).toMatch(
      /^https:\/\/.+\/content\/assets\/og-default\.png$/,
    );
    expect(await home.meta('meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  test("has a JSON-LD Person schema", async ({ home }) => {
    const ld = await home.jsonLd();
    expect(ld).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Aravind Russell V",
      jobTitle: "Test Automation Architect",
      email: "mailto:aravind.russell@outlook.com",
      sameAs: ["https://github.com/aravindrussell"],
    });
  });

  test("content is in the HTML before JavaScript runs", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain("<h1");
    expect(html).toContain("Lead Quality Engineer");
  });
});

test.describe("Static SEO files", () => {
  test("robots.txt allows crawling and links the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBe(true);
    const body = await res.text();
    expect(body).toContain("Allow: /");
    expect(body).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
  });

  test("sitemap.xml lists the home page", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    expect(body).toMatch(/<loc>https:\/\/.+\/<\/loc>/);
  });

  for (const path of ["/favicon.svg", "/apple-touch-icon.png", "/content/assets/og-default.png"]) {
    test(`serves ${path}`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(200);
    });
  }
});
