import { test, expect } from '../fixtures/test';
import { PRODUCTS } from '../test-data/products';

const [backpack, bikeLight, boltShirt] = PRODUCTS;

test.beforeEach(async ({ inventoryPage }) => {
  await inventoryPage.goto();
});

test.describe('Cart', () => {
  test('adding items updates the badge and button state', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await inventoryPage.add(backpack.id);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(backpack.id)).toBeVisible();

    await inventoryPage.add(bikeLight.id, boltShirt.id);
    await expect(inventoryPage.cartBadge).toHaveText('3');
  });

  test('removing an item from the product list', async ({ inventoryPage }) => {
    await inventoryPage.add(backpack.id, bikeLight.id);
    await inventoryPage.remove(backpack.id);

    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.addButton(backpack.id)).toBeVisible();
  });

  test('cart page shows exactly the added items', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.add(backpack.id, boltShirt.id);
    await inventoryPage.openCart();

    expect((await cartPage.names()).sort()).toEqual([backpack.name, boltShirt.name].sort());
  });

  test('removing the last item from the cart page hides the badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.add(backpack.id);
    await inventoryPage.openCart();
    await cartPage.remove(backpack.id);

    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.cartBadge).toBeHidden();
  });

  test('cart survives a page reload', async ({ inventoryPage, page }) => {
    await inventoryPage.add(backpack.id, bikeLight.id);
    await page.reload();

    await expect(inventoryPage.cartBadge).toHaveText('2');
  });

  test('continue shopping returns to the product list', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();
    await cartPage.continueShoppingButton.click();

    await expect(inventoryPage.title).toHaveText('Products');
  });
});
