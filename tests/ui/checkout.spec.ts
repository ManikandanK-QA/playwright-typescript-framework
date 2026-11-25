import { products } from '../../src/data/products';
import { test, expect } from '../../src/fixtures';

test.describe('Checkout', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ page, pages }) => {
    await pages.inventory.goto();
    await pages.inventory.addToCart(products.backpack.name);
    await pages.inventory.openCart();
    await pages.cart.checkout();

    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('completes an order end to end', { tag: '@smoke' }, async ({ page, pages }) => {
    await pages.checkoutInformation.fillCustomerInformation('Manikandan', 'Kandasamy', '600001');
    await pages.checkoutInformation.continue();

    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(pages.checkoutOverview.items).toHaveCount(1);
    await expect(pages.checkoutOverview.total).toContainText('Total: $');

    await pages.checkoutOverview.finish();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(pages.checkoutOverview.orderConfirmation).toHaveText('Thank you for your order!');
  });

  test('blocks checkout when the postal code is missing', async ({ pages }) => {
    await pages.checkoutInformation.fillCustomerInformation('Manikandan', 'Kandasamy', '');
    await pages.checkoutInformation.continue();

    await expect(pages.checkoutInformation.errorMessage).toContainText('Postal Code is required');
  });
});
