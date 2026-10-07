import AxeBuilder from '@axe-core/playwright';
import { test, expect, signedOut } from '../fixtures/test';

const WCAG = ['wcag2a', 'wcag2aa'];

async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  // Readable failure message: rule id, impact and how many elements are affected
  return results.violations.map((v) => `${v.impact}: ${v.id} (${v.nodes.length} elements) - ${v.help}`);
}

test.describe('Accessibility (WCAG 2 A/AA via axe-core)', () => {
  test.describe('signed out', () => {
    test.use(signedOut);

    test('login page has no violations', async ({ loginPage, page }) => {
      await loginPage.goto();
      expect(await scan(page)).toEqual([]);
    });
  });

  test('product page has no violations', async ({ inventoryPage, page }) => {
    await inventoryPage.goto();
    expect(await scan(page)).toEqual([]);
  });
});
