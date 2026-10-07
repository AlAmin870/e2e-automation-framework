/**
 * Defect detection across SauceDemo's special accounts.
 *
 * The same checks run for standard_user (which must pass) and for the accounts
 * SauceDemo ships with deliberate bugs. Each confirmed bug is marked with
 * test.fail(): the test is expected to fail, so the suite stays green while
 * the defect exists, and turns red if the defect is ever fixed (so the marker
 * gets removed). Every defect also appears as an annotation in the HTML report.
 */
import { test, expect, signedOut } from '../fixtures/test';
import { PRODUCTS } from '../test-data/products';
import { PASSWORD, USERS } from '../test-data/users';

test.use(signedOut);

type User = (typeof USERS)[keyof typeof USERS];

/** Known defects, keyed by check then user. Users not listed must pass. */
const DEFECTS: Record<string, Partial<Record<User, string>>> = {
  'each product shows its own image': {
    [USERS.problem]: 'DEF-01: all 6 products show the same placeholder image',
    [USERS.visual]: 'DEF-10: Sauce Labs Backpack shows a placeholder (dog) image',
  },
  'cart icon sits in the header corner': {
    [USERS.visual]: 'DEF-11: cart icon is shifted out of the top-right corner',
  },
  'list prices match catalogue': {
    [USERS.visual]: 'DEF-02: product list shows wrong prices (e.g. $96.78 for a $29.99 item) while the cart charges the real price',
  },
  'sort Z to A': {
    [USERS.problem]: 'DEF-03: choosing Z to A does not reorder the list',
    [USERS.error]: 'DEF-04: sorting raises a "Sorting is broken!" error dialog',
  },
  'every product can be added to cart': {
    [USERS.problem]: 'DEF-05: "Add to cart" does nothing for 3 of 6 products',
    [USERS.error]: 'DEF-06: "Add to cart" does nothing for 3 of 6 products',
  },
  'checkout completes': {
    [USERS.problem]: 'DEF-07: Last Name field does not keep typed text, so checkout cannot continue',
    [USERS.error]: 'DEF-08: Finish button does not complete the order',
  },
  'login responds within 2 s': {
    [USERS.performanceGlitch]: 'DEF-09: products take about 5 s to appear after login',
  },
};

const ACCOUNTS: User[] = [USERS.standard, USERS.problem, USERS.error, USERS.visual, USERS.performanceGlitch];

function expectDefect(check: string, user: User) {
  const defect = DEFECTS[check][user];
  if (defect) {
    test.info().annotations.push({ type: 'known defect', description: defect });
    test.fail(true, defect);
  }
}

for (const user of ACCOUNTS) {
  test.describe(user, () => {
    test('each product shows its own image', async ({ loginAs }) => {
      expectDefect('each product shows its own image', user);
      const inventory = await loginAs(user);
      const images = await inventory.imagesByName();
      for (const product of PRODUCTS) {
        expect(images.get(product.name), `${product.name} image`).toMatch(new RegExp(`^${product.image}`));
      }
    });

    test('cart icon sits in the header corner', async ({ loginAs, page }) => {
      expectDefect('cart icon sits in the header corner', user);
      const inventory = await loginAs(user);
      const box = (await inventory.cartLink.boundingBox())!;
      const width = page.viewportSize()!.width;
      // standard_user: icon is 20 px from the top and 20 px from the right edge
      expect(box.y, 'distance from top').toBeLessThan(20);
      expect(width - (box.x + box.width), 'distance from right edge').toBeLessThan(30);
    });

    test('list prices match catalogue', async ({ loginAs }) => {
      expectDefect('list prices match catalogue', user);
      const inventory = await loginAs(user);
      await inventory.sortBy('az');
      const expected = [...PRODUCTS].sort((a, b) => a.name.localeCompare(b.name)).map((p) => p.price);
      expect(await inventory.prices()).toEqual(expected);
    });

    test('sort Z to A', async ({ loginAs, page }) => {
      expectDefect('sort Z to A', user);
      const dialogs: string[] = [];
      page.on('dialog', (d) => {
        dialogs.push(d.message());
        void d.dismiss();
      });

      const inventory = await loginAs(user);
      await inventory.sortBy('za');
      expect(dialogs, 'no error dialog').toEqual([]);
      expect(await inventory.names()).toEqual(PRODUCTS.map((p) => p.name).sort().reverse());
    });

    test('every product can be added to cart', async ({ loginAs }) => {
      expectDefect('every product can be added to cart', user);
      const inventory = await loginAs(user);
      await expect(inventory.items).toHaveCount(PRODUCTS.length); // .all() does not wait for rendering
      for (const item of await inventory.items.all()) {
        await item.getByRole('button', { name: 'Add to cart' }).click();
      }
      await expect(inventory.cartBadge).toHaveText(String(PRODUCTS.length));
    });

    test('checkout completes', async ({ loginAs, cartPage, checkoutPage }) => {
      expectDefect('checkout completes', user);
      const inventory = await loginAs(user);
      await inventory.add(PRODUCTS[0].id);
      await inventory.openCart();
      await cartPage.checkout();

      await checkoutPage.firstName.fill('Test');
      await checkoutPage.lastName.fill('Customer');
      await expect(checkoutPage.lastName, 'last name keeps its value').toHaveValue('Customer');
      await checkoutPage.postalCode.fill('1205');
      await checkoutPage.continueButton.click();
      await checkoutPage.finish();
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!', { timeout: 5000 });
    });

    test('login responds within 2 s', async ({ loginPage, page }) => {
      expectDefect('login responds within 2 s', user);
      await loginPage.goto();
      await loginPage.username.fill(user);
      await loginPage.password.fill(PASSWORD);

      const started = Date.now();
      await loginPage.loginButton.click();
      // Measure until products are on screen; the URL can change before the page renders
      await page.getByTestId('inventory-item').first().waitFor({ timeout: 15_000 });
      const elapsed = Date.now() - started;

      test.info().annotations.push({ type: 'login time', description: `${elapsed} ms` });
      expect(elapsed).toBeLessThan(2000);
    });
  });
}
