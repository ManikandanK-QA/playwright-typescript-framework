import type { Page } from '@playwright/test';

/**
 * Shared behaviour for page objects: navigation and the page handle.
 *
 * Page objects model *intent* (sign in, add to cart) and expose locators for
 * assertions. They intentionally contain no `expect` calls, so every assertion
 * lives in a spec where failures are easy to locate.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /** Path relative to the configured `baseURL`. */
  abstract readonly path: string;

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
