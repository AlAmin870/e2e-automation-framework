// Source of truth for the catalogue, used to check prices, sorting and images.
// `image` is the start of each product's image file name.
export const PRODUCTS = [
  { id: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: 29.99, image: 'sauce-backpack' },
  { id: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: 9.99, image: 'bike-light' },
  { id: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: 15.99, image: 'bolt-shirt' },
  { id: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', price: 49.99, image: 'sauce-pullover' },
  { id: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: 7.99, image: 'red-onesie' },
  { id: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99, image: 'red-tatt' },
] as const;

export type Product = (typeof PRODUCTS)[number];

export const TAX_RATE = 0.08;

export const byName = (p: Product) => p.name;
export const byPrice = (p: Product) => p.price;
