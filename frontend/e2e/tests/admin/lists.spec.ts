import { test, expect } from "../../fixtures/test";

test.describe("Admin — lists and sections", () => {
  test.beforeEach(async ({ admin }) => {
    await admin.open();
  });

  test("reorders experience with the keyboard-accessible move buttons", async ({
    admin,
    content,
  }) => {
    await admin.tab("Experience");
    const list = admin.list("experience");
    await list.moveDown("Lead Quality Engineer @ Nomura");
    expect((await list.labels()).slice(0, 2)).toEqual([
      "Senior Test Automation Engineer @ Intelliswift Software Private Ltd.",
      "Lead Quality Engineer @ Nomura",
    ]);
    await admin.save();
    expect(
      content
        .read()
        .experience.map((e) => e.id)
        .slice(0, 2),
    ).toEqual(["intelliswift", "nomura"]);
  });

  test("reorders with drag and drop via the keyboard sensor", async ({ admin, page }) => {
    await admin.tab("Skills");
    const list = admin.list("skill group");
    const first = (await list.labels())[0] ?? "";
    await page.getByRole("button", { name: `Reorder ${first}` }).focus();
    await page.keyboard.press("Space");
    // dnd-kit narrates each step in its live region; wait for it so keys aren't dropped.
    const live = page.locator('[id^="DndLiveRegion"]');
    await expect(live).toContainText("over droppable area automation-tools");
    await page.keyboard.press("ArrowDown");
    await expect(live).toContainText("over droppable area languages");
    await page.keyboard.press("Space");
    await expect(live).toContainText("dropped");
    await expect.poll(async () => (await list.labels())[1]).toBe(first);
  });

  test("hiding a section removes it from the preview", async ({ admin, content }) => {
    await expect(admin.preview.section("education")).toBeVisible();
    await admin.tab("Sections");
    await admin.list("section").toggleVisibility("Education");
    await expect(admin.preview.section("education")).toHaveCount(0);
    await admin.save();
    expect(content.read().sections.find((s) => s.id === "education")?.visible).toBe(false);
  });

  test("adds, edits and deletes a project", async ({ admin, content }) => {
    await admin.tab("Projects");
    await admin.page.getByRole("button", { name: "+ Add project" }).click();
    const list = admin.list("project");
    // Hold the new item by position: its label changes as soon as the title is edited.
    const item = list.items.last();
    await item.getByTestId("item-label").click();
    await item.getByLabel("Title", { exact: true }).fill("Data Compare Tool v2");
    await item.getByLabel("Tech tags", { exact: true }).fill("Python, Pandas");
    await item.getByLabel("Tech tags", { exact: true }).press("Enter");
    await expect(admin.preview.text("Data Compare Tool v2")).toBeVisible();
    await admin.save();
    expect(content.read().projects.at(-1)).toMatchObject({
      title: "Data Compare Tool v2",
      tags: ["Python", "Pandas"],
    });

    await list.delete("Data Compare Tool v2");
    await admin.save();
    expect(content.read().projects).toHaveLength(2);
  });

  test("shows the publish checklist", async ({ admin }) => {
    await admin.tab("Publish");
    const panel = admin.page.getByTestId("publish-panel");
    await expect(panel).toContainText("branch");
    for (const cmd of ["npm run check", "git add content", "git push"]) {
      await expect(panel.getByText(cmd, { exact: true })).toBeVisible();
    }
  });
});
