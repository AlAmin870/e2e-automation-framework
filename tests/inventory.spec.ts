import { test, expect } from '../fixtures/test';
import { SortOption } from '../pages/inventoryPage';
import { byName, byPrice, PRODUCTS } from '../test-data/products';

test.beforeEach(async ({ inventoryPage }) => {
  await inventoryPage.goto();
});

test.describe('Product catalogue', () => {
  test('lists all 6 products with correct names and prices', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(PRODUCTS.length);

    const shown = new Map((await inventoryPage.names()).map((n, i) => [n, i]));
    const prices = await inventoryPage.prices();
    for (const product of PRODUCTS) {
      expect(shown.has(product.name), `${product.name} listed`).toBe(true);
      expect(prices[shown.get(product.name)!], `${product.name} price`).toBe(product.price);
    }
  });

  test('every product shows its own image', async ({ inventoryPage }) => {
    const images = await inventoryPage.imagesByName();
    for (const product of PRODUCTS) {
      expect(images.get(product.name), `${product.name} image`).toMatch(new RegExp(`^${product.image}`));
    }
  });

  const sorts: { option: SortOption; label: string; expected: () => string[] }[] = [
    { option: 'az', label: 'name A to Z', expected: () => PRODUCTS.map(byName).sort() },
    { option: 'za', label: 'name Z to A', expected: () => PRODUCTS.map(byName).sort().reverse() },
  ];
  for (const { option, label, expected } of sorts) {
    test(`sorts by ${label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      expect(await inventoryPage.names()).toEqual(expected());
    });
  }

  for (const [option, label, direction] of [['lohi', 'low to high', 1], ['hilo', 'high to low', -1]] as const) {
    test(`sorts by price ${label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      const prices = await inventoryPage.prices();
      expect(prices).toEqual([...PRODUCTS.map(byPrice)].sort((a, b) => direction * (a - b)));
    });
  }

  test('product detail page matches the list', async ({ inventoryPage, page }) => {
    const product = PRODUCTS[3];
    await inventoryPage.openProduct(product.name);

    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(page.getByTestId('inventory-item-name')).toHaveText(product.name);
    await expect(page.getByTestId('inventory-item-price')).toHaveText(`$${product.price}`);

    await page.getByTestId('back-to-products').click();
    await expect(inventoryPage.title).toHaveText('Products');
  });
});
