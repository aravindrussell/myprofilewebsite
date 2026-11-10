import type { Locator } from "@playwright/test";

/** Wraps an admin <SortableList> (data-testid="list-<noun>"). */
export class SortableListEditor {
  readonly items: Locator;

  constructor(readonly root: Locator) {
    this.items = root.getByTestId("list-item");
  }

  item(label: string): Locator {
    const page = this.root.page();
    return this.items.filter({
      has: page.getByTestId("item-label").getByText(label, { exact: true }),
    });
  }

  labels(): Promise<string[]> {
    return this.items.getByTestId("item-label").allInnerTexts();
  }

  async expand(label: string): Promise<Locator> {
    const item = this.item(label);
    await item.getByTestId("item-label").click();
    return item;
  }

  async moveDown(label: string): Promise<void> {
    await this.root.getByRole("button", { name: `Move ${label} down` }).click();
  }

  async moveUp(label: string): Promise<void> {
    await this.root.getByRole("button", { name: `Move ${label} up` }).click();
  }

  async toggleVisibility(label: string): Promise<void> {
    await this.root.getByRole("button", { name: new RegExp(`^(Hide|Show) ${label}$`) }).click();
  }

  async delete(label: string): Promise<void> {
    const page = this.root.page();
    page.once("dialog", (d) => void d.accept());
    await this.root.getByRole("button", { name: `Delete ${label}` }).click();
  }
}
