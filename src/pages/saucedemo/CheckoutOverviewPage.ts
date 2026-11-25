import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/** Checkout step two: order overview and confirmation. */
export class CheckoutOverviewPage extends BasePage {
  readonly path = '/checkout-step-two.html';

  private readonly cartItems: Locator;
  private readonly summaryTotal: Locator;
  private readonly finishButton: Locator;
  private readonly completeHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('.cart_item');
    this.summaryTotal = page.locator('.summary_total_label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.locator('.complete-header');
  }

  get items(): Locator {
    return this.cartItems;
  }

  get total(): Locator {
    return this.summaryTotal;
  }

  get orderConfirmation(): Locator {
    return this.completeHeader;
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
