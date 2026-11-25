import type { Locator, Page } from '@playwright/test';

/**
 * Header rendered on every authenticated SauceDemo page: cart entry point and
 * item-count badge. Extracted so inventory, cart and checkout pages share one
 * definition instead of duplicating selectors.
 */
export class HeaderComponent {
  constructor(private readonly page: Page) {}

  get cartLink(): Locator {
    return this.page.locator('.shopping_cart_link');
  }

  get cartBadge(): Locator {
    return this.page.locator('.shopping_cart_badge');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
