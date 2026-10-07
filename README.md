# E2E Test Automation Framework — Playwright + TypeScript

[![Playwright Tests](https://github.com/AlAmin870/e2e-automation-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/AlAmin870/e2e-automation-framework/actions/workflows/playwright.yml)

An end-to-end UI test framework for the [SauceDemo](https://www.saucedemo.com/) shop, built with **Playwright and TypeScript**. It runs across **Chromium, Firefox, WebKit and mobile Chrome**, checks accessibility with axe-core, and includes a **defect-detection suite that finds 11 bugs** in SauceDemo's deliberately faulty user accounts.

📊 **[Latest HTML test report](https://alamin870.github.io/e2e-automation-framework/)** (published by CI)

## At a glance

| | |
|---|---|
| Test scenarios | 64 (128 executions per run across browsers) |
| Browsers | Chromium, Firefox, WebKit, Pixel 7 (smoke subset) |
| Defects found | 11, tracked as expected failures |
| Stability | 3 back-to-back full runs on all browsers, 0 flaky tests |
| CI | Type check and full suite on every push and weekly; HTML report published to GitHub Pages |

## What's tested

| Suite | Scenarios | Highlights |
|---|---|---|
| `login.spec.ts` | 9 | Valid login; 5 data-driven error cases (wrong password, locked-out user, empty fields…); dismissing errors; protected-page redirect; logout invalidates the session |
| `inventory.spec.ts` | 7 | All products with correct prices against a source-of-truth catalogue; correct image per product; 4 sort orders; product detail page |
| `cart.spec.ts` | 6 | Badge and button state; remove from list and from cart; cart persists after reload |
| `checkout.spec.ts` | 5 | Full purchase with **subtotal, 8% tax and total recalculated** in the test; required-field validation; cancel keeps the cart |
| `accessibility.spec.ts` | 2 | Zero WCAG 2 A/AA violations on the login and product pages (axe-core) |
| `known-defects.spec.ts` | 35 | The same 7 checks run for 5 accounts; see below |

## Defects found

SauceDemo ships special accounts with deliberate bugs. The defect suite runs **the same checks** for `standard_user`, which must pass, and for each faulty account. Each confirmed bug is marked `test.fail()` with its ID, so:

- the suite stays green while a known bug exists,
- the test turns **red if the bug is fixed**, prompting removal of the marker,
- every defect shows as a `known defect` annotation in the HTML report.

| ID | Account | Defect |
|---|---|---|
| DEF-01 | problem_user | All 6 products show the same placeholder image |
| DEF-03 | problem_user | Sorting Z to A does not reorder the list |
| DEF-05 | problem_user | "Add to cart" does nothing for 3 of 6 products |
| DEF-07 | problem_user | Last Name field does not keep typed text, so checkout cannot continue |
| DEF-04 | error_user | Sorting raises a "Sorting is broken!" error dialog |
| DEF-06 | error_user | "Add to cart" does nothing for 3 of 6 products |
| DEF-08 | error_user | Finish button does not complete the order |
| DEF-02 | visual_user | Product list shows wrong prices (e.g. $96.78 for a $29.99 item) while the cart charges the real price |
| DEF-10 | visual_user | Sauce Labs Backpack shows a placeholder image |
| DEF-11 | visual_user | Cart icon is shifted out of the header corner |
| DEF-09 | performance_glitch_user | Products take about 5 s to appear after login (vs about 0.5 s) |

## Framework design

```
├── pages/                    # Page Object Model
│   ├── basePage.ts           # Header, cart badge, menu/logout shared by all pages
│   ├── loginPage.ts
│   ├── inventoryPage.ts
│   ├── cartPage.ts
│   └── checkoutPage.ts       # All three checkout steps
├── fixtures/test.ts          # Custom fixtures: page objects + loginAs(user)
├── test-data/
│   ├── users.ts              # Accounts, overridable from .env
│   └── products.ts           # Catalogue source of truth (names, prices, images, tax)
├── tests/
│   ├── auth.setup.ts         # Logs in once, saves session for all tests
│   └── *.spec.ts
├── playwright.config.ts
└── .github/workflows/playwright.yml
```

- **Page Object Model** with locators on SauceDemo's `data-test` attributes (`testIdAttribute`), not brittle CSS.
- **Logged-in session reuse:** a `setup` project logs in once and saves `storageState`; tests start already signed in, and suites that need a signed-out browser opt out with `test.use(signedOut)`.
- **Custom fixtures:** page objects are injected into tests, and `loginAs(user)` handles any account.
- **Reliable waits:** SauceDemo is a React app whose URL changes *before* the new page renders. Every navigation method waits for an element unique to the destination page, which removed all flakiness found during repeated WebKit runs.
- **Data-driven tests:** loops over case tables for login errors, sort orders, required fields and the 5-account defect matrix.
- **Tags:** `@smoke` marks the core path; mobile runs only `@smoke`.
- **Evidence on failure:** screenshot, video, and a trace on retry; HTML and Allure reporters.
- **Strict TypeScript,** type-checked in CI before tests run.

## Run locally

```bash
npm ci
npx playwright install
npm test                  # all browsers
npm run test:smoke        # @smoke only
npm run test:chromium
npm run test:headed       # watch it run
npm run report            # open the HTML report
```

Optional: copy `.env.example` to `.env` to point at another environment or account.

> **Windows note:** use `TEST_USERNAME`, not `USERNAME`. Windows already defines `USERNAME` as the signed-in OS user, which silently replaced the test account in an earlier version of this project.
