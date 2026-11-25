import { productCount, products } from '../../src/data/products';
import { test, expect } from '../../src/fixtures';

test.describe('Product catalogue', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ pages }) => {
    await pages.inventory.goto();
    await expect(pages.inventory.title).toHaveText('Products');
  });

  test('lists every catalogue product', { tag: '@smoke' }, async ({ pages }) => {
    await expect(pages.inventory.items).toHaveCount(productCount);

    const names = await pages.inventory.listProductNames();
    expect(names).toContain(products.backpack.name);
    expect(names).toContain(products.fleeceJacket.name);
  });

  test('sorts products by price ascending', async ({ pages }) => {
    await pages.inventory.sortBy('lohi');

    const prices = await pages.inventory.listProductPrices();
    expect(prices).toHaveLength(productCount);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(prices[0]).toBe(products.onesie.price);
    expect(prices.at(-1)).toBe(products.fleeceJacket.price);
  });

  test('adds and removes products, keeping the badge in sync', async ({ pages }) => {
    await pages.inventory.addToCart(products.backpack.name);
    await expect(pages.inventory.header.cartBadge).toHaveText('1');

    await pages.inventory.addToCart(products.bikeLight.name);
    await expect(pages.inventory.header.cartBadge).toHaveText('2');

    await pages.inventory.removeFromCart(products.bikeLight.name);
    await expect(pages.inventory.header.cartBadge).toHaveText('1');
  });
});
