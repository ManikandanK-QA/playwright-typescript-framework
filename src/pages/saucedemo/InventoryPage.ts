import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from '../../components/HeaderComponent';
import { BasePage } from '../BasePage';

/** SauceDemo product catalogue. */
export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';

  readonly header: HeaderComponent;

  private readonly pageTitle: Locator;
  private readonly productItems: Locator;
  private readonly sortDropdown: Locator;
  private readonly productPrices: Locator;
  private readonly productNames: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.pageTitle = page.locator('.title');
    this.productItems = page.locator('.inventory_item');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.productPrices = page.locator('.inventory_item_price');
    this.productNames = page.locator('.inventory_item_name');
  }

  get title(): Locator {
    return this.pageTitle;
  }

  get items(): Locator {
    return this.productItems;
  }

  itemByName(name: string): Locator {
    return this.productItems.filter({ hasText: name });
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(value);
  }

  async addToCart(productName: string): Promise<void> {
    await this.itemByName(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.itemByName(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async openCart(): Promise<void> {
    await this.header.openCart();
  }

  async listProductNames(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  async listProductPrices(): Promise<number[]> {
    const prices = await this.productPrices.allTextContents();
    return prices.map((price) => Number.parseFloat(price.replace('$', '')));
  }
}
