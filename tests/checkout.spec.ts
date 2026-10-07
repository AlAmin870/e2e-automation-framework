import { test, expect } from '../fixtures/test';
import { PRODUCTS, TAX_RATE } from '../test-data/products';

const customer = { firstName: 'Test', lastName: 'Customer', postalCode: '1205' };
const round2 = (n: number) => Math.round(n * 100) / 100;

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('completes an order with correct subtotal, tax and total', { tag: '@smoke' }, async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    const basket = [PRODUCTS[0], PRODUCTS[3], PRODUCTS[4]];
    await inventoryPage.add(...basket.map((p) => p.id));
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo(customer);

    const expectedSubtotal = round2(basket.reduce((sum, p) => sum + p.price, 0));
    const expectedTax = round2(expectedSubtotal * TAX_RATE);
    const amounts = await checkoutPage.amounts();
    expect(amounts.subtotal).toBe(expectedSubtotal);
    expect(amounts.tax).toBe(expectedTax);
    expect(amounts.total).toBe(round2(expectedSubtotal + expectedTax));

    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutPage.cartBadge).toBeHidden(); // cart emptied after purchase
  });

  const missing = [
    { field: 'firstName', error: 'First Name is required' },
    { field: 'lastName', error: 'Last Name is required' },
    { field: 'postalCode', error: 'Postal Code is required' },
  ] as const;

  for (const { field, error } of missing) {
    test(`requires ${field}`, async ({ inventoryPage, cartPage, checkoutPage, page }) => {
      await inventoryPage.add(PRODUCTS[0].id);
      await inventoryPage.openCart();
      await cartPage.checkout();
      await checkoutPage.fillInfo({ ...customer, [field]: '' });

      await expect(checkoutPage.error).toContainText(error);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }

  test('cancel on the overview keeps the cart', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await inventoryPage.add(PRODUCTS[1].id);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo(customer);
    await checkoutPage.cancel();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});
