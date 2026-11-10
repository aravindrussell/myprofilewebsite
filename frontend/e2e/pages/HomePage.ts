import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { NavBar } from "../components/NavBar";

export class HomePage extends BasePage {
  protected readonly path = "/";
  readonly nav: NavBar;
  readonly heading: Locator;
  readonly resumeCta: Locator;
  readonly contactCta: Locator;
  readonly stats: Locator;
  readonly timelineItems: Locator;
  readonly projectCards: Locator;
  readonly skipLink: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavBar(page);
    this.heading = page.getByRole("heading", { level: 1 });
    this.resumeCta = page.getByTestId("cta-resume");
    this.contactCta = page.getByTestId("cta-contact");
    this.stats = page.getByRole("list", { name: "Key facts" }).getByRole("listitem");
    this.timelineItems = page.getByTestId("timeline-item");
    this.projectCards = page.getByTestId("project-card");
    this.skipLink = page.getByRole("link", { name: "Skip to content" });
  }

  section(id: string): Locator {
    return this.page.locator(`section#${id}`);
  }

  sectionHeadings(): Promise<string[]> {
    return this.page.locator("main section h2").allInnerTexts();
  }

  jsonLd(): Promise<Record<string, unknown>> {
    return this.page
      .locator('script[type="application/ld+json"]')
      .textContent()
      .then((t) => JSON.parse(t ?? "{}") as Record<string, unknown>);
  }

  meta(selector: string): Promise<string | null> {
    return this.page.locator(`head ${selector}`).first().getAttribute("content");
  }
}
