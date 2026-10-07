import { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  abstract readonly path: string;

  readonly title: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async goto() {
    await this.page.goto(this.path);
  }

  async openCart() {
    await this.cartLink.click();
    // SauceDemo is a React app: the URL changes before the new page renders, so
    // every navigation waits for an element that only exists on the destination.
    await this.page.getByTestId('continue-shopping').waitFor();
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
    await this.page.getByTestId('login-button').waitFor();
  }

  /** Cart badge count; 0 when the badge is hidden. */
  async cartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    return Number(await this.cartBadge.textContent());
  }
}
