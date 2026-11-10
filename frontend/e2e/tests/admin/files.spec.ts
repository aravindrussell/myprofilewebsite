import { test, expect } from "../../fixtures/test";

// 1x1 transparent PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

test.describe("Admin — import, export and uploads", () => {
  test.beforeEach(async ({ admin }) => {
    await admin.open();
  });

  test("importing invalid JSON shows the validation errors", async ({ admin, content }) => {
    const bad = content.seed();
    bad.theme.accent = "blue";
    await admin.importFile("bad.json", JSON.stringify(bad));
    await expect(admin.notice).toContainText("not valid");
    await expect(admin.notice).toContainText("/theme/accent");
    await expect(admin.saveState).toContainText("✓ saved");
  });

  test("importing a non-JSON file is rejected", async ({ admin }) => {
    await admin.importFile("notes.json", "this is not json");
    await expect(admin.notice).toContainText("Could not read that file as JSON");
  });

  test("importing valid JSON loads it as an unsaved draft", async ({ admin, content }) => {
    const good = content.seed();
    good.profile.headline = "Imported headline";
    await admin.importFile("good.json", JSON.stringify(good));
    await expect(admin.notice).toContainText("Imported");
    await expect(admin.preview.text("Imported headline")).toBeVisible();
    await expect(admin.saveState).toContainText("unsaved changes");
    expect(content.read().profile.headline).not.toBe("Imported headline");
  });

  test("export downloads the current draft", async ({ admin, page }) => {
    await admin.field("Location").fill("Coimbatore");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export JSON" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^profile-\d{4}-\d{2}-\d{2}\.json$/);
    const stream = await file.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const exported = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
      profile: { location: string };
    };
    expect(exported.profile.location).toBe("Coimbatore");
  });

  test("uploads a project image as sanitised WebP", async ({ admin, content }) => {
    await admin.tab("Projects");
    const item = await admin.list("project").expand("Requirement Analysis Agent");
    await item.getByLabel("Image (optional)").setInputFiles({
      name: "Screen Shot (1).png",
      mimeType: "image/png",
      buffer: PNG,
    });
    await expect(item.getByText("Uploaded.")).toBeVisible();
    await item.getByLabel("Image alt text").fill("Requirement Analysis Agent screenshot");
    await admin.save();

    const image = content.read().projects[0]?.image ?? "";
    expect(image).toMatch(/^assets\/screen-shot-1-[0-9a-f]{10}\.webp$/);
    expect(content.assets()).toContain(image.replace("assets/", ""));
  });

  test("rejects a disguised upload", async ({ admin }) => {
    await admin.tab("Projects");
    const item = await admin.list("project").expand("Requirement Analysis Agent");
    await item.getByLabel("Image (optional)").setInputFiles({
      name: "evil.png",
      mimeType: "image/png",
      buffer: Buffer.from("<svg onload=alert(1)>"),
    });
    await expect(item.getByText("Only PNG, JPEG or WebP images are accepted")).toBeVisible();
  });
});
