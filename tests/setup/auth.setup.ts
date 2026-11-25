import { mkdirSync } from 'node:fs';
import { test as setup, expect } from '@playwright/test';
import { env } from '../../src/config/env';
import { AUTH_DIR, AUTH_FILE } from '../../src/config/paths';
import { LoginPage } from '../../src/pages/saucedemo/LoginPage';

/**
 * Runs once per browser before the authenticated UI projects.
 * The saved session is reused via `storageState`, so specs never pay the cost
 * of a UI login and the auth flow itself is tested in one place.
 */
setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.SAUCE_USERNAME, env.SAUCE_PASSWORD);

  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.locator('.title')).toHaveText('Products');

  mkdirSync(AUTH_DIR, { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
