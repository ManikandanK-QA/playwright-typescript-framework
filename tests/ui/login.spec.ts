import { standardUser, invalidLoginScenarios } from '../../src/data/users';
import { test, expect } from '../../src/fixtures';

// Authentication is the subject here, so start from a clean, signed-out state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', { tag: ['@ui', '@regression'] }, () => {
  test('signs in with valid credentials', { tag: '@smoke' }, async ({ page, pages }) => {
    await pages.login.goto();
    await pages.login.login(standardUser.username, standardUser.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(pages.inventory.title).toHaveText('Products');
  });

  for (const scenario of invalidLoginScenarios) {
    test(`rejects ${scenario.name}`, async ({ pages }) => {
      await pages.login.goto();
      await pages.login.login(scenario.username, scenario.password);

      await expect(pages.login.errorMessage).toBeVisible();
      await expect(pages.login.errorMessage).toContainText(scenario.expectedError);
    });
  }
});
