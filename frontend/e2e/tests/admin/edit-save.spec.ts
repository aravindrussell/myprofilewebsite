import { test, expect } from "../../fixtures/test";

test.describe("Admin — edit, preview, save, undo", () => {
  test.beforeEach(async ({ admin }) => {
    await admin.open();
  });

  test("editing a field updates the live preview and marks changes unsaved", async ({ admin }) => {
    await admin.field("Headline (one-line value proposition)").fill("Quality at the speed of CI");
    await expect(admin.preview.text("Quality at the speed of CI")).toBeVisible();
    await expect(admin.saveState).toContainText("unsaved changes");
  });

  test("save writes profile.json and keeps a backup of the previous version", async ({
    admin,
    content,
  }) => {
    await admin.field("Headline (one-line value proposition)").fill("Saved by Playwright");
    await admin.save();

    await expect(admin.notice).toContainText("Saved");
    expect(content.read().profile.headline).toBe("Saved by Playwright");
    expect(content.backups()).toHaveLength(1);
  });

  test("Ctrl+S saves", async ({ admin, content, page }) => {
    await admin.field("Title").fill("Principal SDET");
    await page.keyboard.press("Control+s");
    await expect(admin.saveState).toContainText("✓ saved");
    await expect.poll(() => content.read().profile.title).toBe("Principal SDET");
  });

  test("undo last save restores the previous file", async ({ admin, content }) => {
    const original = content.read().profile.headline;
    await admin.field("Headline (one-line value proposition)").fill("Temporary");
    await admin.save();

    await admin.undoLastSave();

    expect(content.read().profile.headline).toBe(original);
    await expect(admin.field("Headline (one-line value proposition)")).toHaveValue(original);
  });

  test("discard reverts unsaved edits", async ({ admin, page }) => {
    const field = admin.field("Location");
    const before = await field.inputValue();
    await field.fill("Somewhere else");
    await page.getByRole("button", { name: "Discard" }).click();
    await expect(field).toHaveValue(before);
    await expect(admin.saveState).toContainText("✓ saved");
  });

  test("warns before leaving with unsaved changes", async ({ admin, page }) => {
    await admin.field("Location").fill("Chennai");
    const dialog = page.waitForEvent("dialog");
    void page.goto("/").catch(() => undefined);
    const d = await dialog;
    expect(d.type()).toBe("beforeunload");
    await d.dismiss();
  });
});

test.describe("Admin — validation", () => {
  test.beforeEach(async ({ admin }) => {
    await admin.open();
  });

  test("invalid input shows a field error and blocks saving", async ({ admin, content }) => {
    const before = content.read();
    await admin.field("Email").fill("not-an-email");

    await expect(admin.page.getByText("Invalid format")).toBeVisible();
    await expect(admin.field("Email")).toHaveAttribute("aria-invalid", "true");
    await expect(admin.saveState).toContainText("1 error");

    await admin.saveButton.click();
    await expect(admin.notice).toContainText("Fix 1 validation error");
    expect(content.read()).toEqual(before);
  });

  test("server-side rules are reported on save", async ({ admin, content }) => {
    await admin.tab("Experience");
    const item = await admin.list("experience").expand("Lead Quality Engineer @ Nomura");
    await item.getByLabel("End (YYYY-MM)").fill("2020-01");
    await admin.saveButton.click();
    await expect(admin.notice).toContainText("end date is before start date");
    expect(content.read().experience[0]?.end).toBe("");
  });
});
