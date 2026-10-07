import { test as base, expect } from '@playwright/test';
import { CartPage } from '../pages/cartPage';
import { CheckoutPage } from '../pages/checkoutPage';
import { InventoryPage } from '../pages/inventoryPage';
import { LoginPage } from '../pages/loginPage';
import { PASSWORD } from '../test-data/users';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** Log in as any user from a signed-out context and land on the inventory page. */
  loginAs: (username: string) => Promise<InventoryPage>;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  loginAs: async ({ page, loginPage }, use) => {
    await use(async (username) => {
      await loginPage.goto();
      await loginPage.login(username, PASSWORD);
      // performance_glitch_user takes ~5 s to log in
      await expect(page).toHaveURL(/inventory\.html/, { timeout: 15_000 });
      return new InventoryPage(page);
    });
  },
});

/** Use in a describe block whose tests must start signed out. */
export const signedOut = { storageState: { cookies: [], origins: [] } };

export { expect };
