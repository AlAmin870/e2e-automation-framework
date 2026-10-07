import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

const money = (text: string | null) => Number((text ?? '').split('$')[1]);

/** Covers the three checkout steps: your information, overview and complete. */
export class CheckoutPage extends BasePage {
  readonly path = '/checkout-step-one.html';

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;

  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;

  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.error = page.getByTestId('error');

    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');

    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async fillInfo({ firstName, lastName, postalCode }: CustomerInfo) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
    await this.continueButton.click();
    // Either the overview loads or a validation error appears
    await this.finishButton.or(this.error).waitFor();
  }

  async amounts() {
    return {
      subtotal: money(await this.subtotal.textContent()),
      tax: money(await this.tax.textContent()),
      total: money(await this.total.textContent()),
    };
  }

  async finish() {
    await this.finishButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
