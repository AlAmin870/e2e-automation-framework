import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class CartPage extends BasePage {
  readonly path = '/cart.html';

  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async names(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async remove(productId: string) {
    await this.page.getByTestId(`remove-${productId}`).click();
  }

  async checkout() {
    await this.checkoutButton.click();
    await this.page.getByTestId('firstName').waitFor();
  }
}
