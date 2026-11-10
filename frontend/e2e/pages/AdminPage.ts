import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { PreviewFrame } from "../components/PreviewFrame";
import { SortableListEditor } from "../components/SortableListEditor";

export class AdminPage extends BasePage {
  protected readonly path = "/admin";
  readonly preview: PreviewFrame;
  readonly saveButton: Locator;
  readonly undoButton: Locator;
  readonly saveState: Locator;
  readonly notice: Locator;
  readonly importInput: Locator;
  readonly editorHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.preview = new PreviewFrame(page);
    this.saveButton = page.getByRole("button", { name: "Save", exact: true });
    this.undoButton = page.getByRole("button", { name: "Undo last save" });
    this.saveState = page.getByTestId("save-state");
    this.notice = page.getByTestId("notice");
    this.importInput = page.getByTestId("import-input");
    this.editorHeading = page.locator("#editor-heading");
  }

  override async open(): Promise<this> {
    await super.open();
    await this.editorHeading.waitFor();
    await this.preview.heading.waitFor();
    return this;
  }

  async tab(name: string): Promise<void> {
    await this.page
      .getByRole("navigation", { name: "Content sections" })
      .getByRole("button", { name })
      .click();
    await this.editorHeading.filter({ hasText: name }).waitFor();
  }

  field(label: string): Locator {
    return this.page.getByRole("main").getByLabel(label, { exact: true });
  }

  list(noun: string): SortableListEditor {
    return new SortableListEditor(this.page.getByTestId(`list-${noun}`));
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.saveState.filter({ hasText: "✓ saved" }).waitFor();
  }

  async undoLastSave(): Promise<void> {
    this.page.once("dialog", (d) => void d.accept());
    await this.undoButton.click();
    await this.notice.filter({ hasText: "Restored" }).waitFor();
  }

  async importFile(name: string, json: string): Promise<void> {
    await this.importInput.setInputFiles({
      name,
      mimeType: "application/json",
      buffer: Buffer.from(json),
    });
  }
}
