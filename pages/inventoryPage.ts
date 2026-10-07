import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';

  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  addButton(productId: string) {
    return this.page.getByTestId(`add-to-cart-${productId}`);
  }

  removeButton(productId: string) {
    return this.page.getByTestId(`remove-${productId}`);
  }

  async add(...productIds: string[]) {
    for (const id of productIds) await this.addButton(id).click();
  }

  async remove(...productIds: string[]) {
    for (const id of productIds) await this.removeButton(id).click();
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option);
  }

  async names(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async prices(): Promise<number[]> {
    return (await this.itemPrices.allTextContents()).map((p) => Number(p.replace('$', '')));
  }

  /** Map of product name -> image file name, read from each product card. */
  async imagesByName(): Promise<Map<string, string>> {
    await this.items.last().waitFor();
    const pairs = await this.items.evaluateAll((cards) =>
      cards.map((c) => [
        c.querySelector('[data-test="inventory-item-name"]')?.textContent ?? '',
        (c.querySelector('img')?.getAttribute('src') ?? '').split('/').pop() ?? '',
      ]),
    );
    return new Map(pairs as [string, string][]);
  }

  async openProduct(name: string) {
    await this.itemNames.filter({ hasText: name }).click();
    await this.page.getByTestId('back-to-products').waitFor();
  }
}
