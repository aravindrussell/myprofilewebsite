import { test, expect } from "../../fixtures/test";

/** The admin page and API client must not exist in the deployed site. */
test.describe("Production build", () => {
  for (const path of ["/admin", "/__preview"]) {
    test(`${path} is not served`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("doesn't exist");
    });
  }

  test("JavaScript bundles contain no admin or API code", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1] ?? "");
    expect(scripts.length).toBeGreaterThan(0);
    for (const src of scripts) {
      const js = await (await request.get(src)).text();
      for (const marker of ["/api/profile", "/api/csrf", "X-CSRF-Token", "__preview"]) {
        expect(js, `${src} contains ${marker}`).not.toContain(marker);
      }
    }
  });

  test("makes no requests to a backend", async ({ home, page }) => {
    const apiCalls: string[] = [];
    page.on("request", (r) => {
      if (new URL(r.url()).pathname.startsWith("/api")) apiCalls.push(r.url());
    });
    await home.open();
    await page.waitForLoadState("networkidle");
    expect(apiCalls).toEqual([]);
  });
});
