import { test, expect, signedOut } from '../fixtures/test';
import { PASSWORD, USERS } from '../test-data/users';

test.use(signedOut);

test.describe('Login', () => {
  test('valid credentials open the product page', { tag: '@smoke' }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard, PASSWORD);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  const errorCases = [
    { name: 'wrong password', user: USERS.standard, pass: 'wrong', error: 'Username and password do not match' },
    { name: 'unknown user', user: 'no_such_user', pass: PASSWORD, error: 'Username and password do not match' },
    { name: 'locked-out user', user: USERS.lockedOut, pass: PASSWORD, error: 'Sorry, this user has been locked out' },
    { name: 'empty username', user: '', pass: PASSWORD, error: 'Username is required' },
    { name: 'empty password', user: USERS.standard, pass: '', error: 'Password is required' },
  ];

  for (const { name, user, pass, error } of errorCases) {
    test(`shows an error for ${name}`, async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.login(user, pass);

      await expect(loginPage.error).toContainText(error);
      await expect(page).not.toHaveURL(/inventory/);
    });
  }

  test('error message can be dismissed', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('', '');
    await expect(loginPage.error).toBeVisible();

    await page.getByTestId('error-button').click();
    await expect(loginPage.error).toBeHidden();
  });

  test('protected pages redirect to login when signed out', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in");
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('logout ends the session', { tag: '@smoke' }, async ({ loginAs, page, loginPage }) => {
    const inventory = await loginAs(USERS.standard);
    await inventory.logout();
    await expect(loginPage.loginButton).toBeVisible();

    // Back button or direct URL must not reopen the shop
    await page.goto('/inventory.html');
    await expect(loginPage.error).toContainText('when you are logged in');
  });
});
