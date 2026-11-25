import { products } from '../../src/data/products';
import { test, expect } from '../../src/fixtures';

test.describe('Shopping cart', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ page, pages }) => {
    await pages.inventory.goto();
    await pages.inventory.addToCart(products.backpack.name);
    await pages.inventory.addToCart(products.onesie.name);
    await pages.inventory.openCart();

    await expect(page).toHaveURL(/\/cart\.html$/);
  });

  test('shows every product added from the catalogue', async ({ pages }) => {
    await expect(pages.cart.items).toHaveCount(2);
    await expect(pages.cart.itemByName(products.backpack.name)).toBeVisible();
    await expect(pages.cart.itemByName(products.onesie.name)).toBeVisible();
  });

  test('removes a product and updates the badge', async ({ pages }) => {
    await pages.cart.remove(products.backpack.name);

    await expect(pages.cart.items).toHaveCount(1);
    await expect(pages.cart.header.cartBadge).toHaveText('1');
  });

  test('continues shopping back to the catalogue', async ({ page, pages }) => {
    await pages.cart.continueShopping();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(pages.inventory.title).toHaveText('Products');
  });
});
