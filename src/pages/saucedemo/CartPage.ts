import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from '../../components/HeaderComponent';
import { BasePage } from '../BasePage';

/** SauceDemo cart page. */
export class CartPage extends BasePage {
  readonly path = '/cart.html';

  readonly header: HeaderComponent;

  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  get items(): Locator {
    return this.cartItems;
  }

  itemByName(name: string): Locator {
    return this.cartItems.filter({ hasText: name });
  }

  async remove(productName: string): Promise<void> {
    await this.itemByName(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
