import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/** SauceDemo sign-in page. */
export class LoginPage extends BasePage {
  readonly path = '/';

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorBanner = page.getByTestId('error');
  }

  get errorMessage(): Locator {
    return this.errorBanner;
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
