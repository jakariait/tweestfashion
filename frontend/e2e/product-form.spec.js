import { test, expect } from '@playwright/test';

// E2E tests run against the Vite dev server and mock ALL backend API calls,
// so they are fully deterministic — no backend/DB/Redis required.
// Browsers must be installed first: npx playwright install chromium

const EDIT_URL = '/admin/edit-product/some-product';
const OPTION_ID = 'opt1234567890';
const FLAG_LIVE_ID = 'flagaaa1111111';
const FLAG_DEAD_ID = 'flagdead9999999';

const productFixture = {
  success: true,
  data: {
    _id: 'prod123',
    name: 'Test Cotton Shirt',
    slug: 'some-product',
    isActive: true,
    freeShipping: false,
    finalPrice: 1200,
    finalDiscount: 0,
    finalStock: null,
    purchasePrice: 800,
    thumbnailImage: 'thumb.jpg',
    images: ['a.jpg', 'b.jpg'],
    category: { _id: 'cat123', name: 'Shirts' },
    subCategory: null,
    childCategory: null,
    flags: [
      { _id: FLAG_LIVE_ID, name: 'New Arrival' },
      { _id: FLAG_DEAD_ID, name: 'Deleted Flag' },
    ],
    variants: [
      {
        attributes: [
          {
            option: { _id: OPTION_ID, name: 'Size', values: ['S', 'M', 'L'] },
            value: 'XL', // stored value missing from the live option list
          },
        ],
        stock: 5,
        price: 1200,
        discount: null,
        image: 'variant1.jpg',
      },
    ],
  },
};

const flagsFixture = {
  success: true,
  data: [{ _id: FLAG_LIVE_ID, name: 'New Arrival', isActive: true }],
};

const optionsFixture = {
  message: 'Product Options fetched successfully',
  productOptions: [
    {
      _id: OPTION_ID,
      name: 'Size',
      values: ['S', 'M', 'L'], // NOTE: stored variant value 'XL' is deliberately missing here
    },
  ],
};

const categoriesFixture = { categories: [{ _id: 'cat123', name: 'Shirts' }] };

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test.beforeEach(async ({ page }) => {
  // Logged-in admin so the permission route guard passes
  await page.addInitScript(() => {
    localStorage.setItem('token', 'e2e-test-token');
  });

  // Catch-all for secondary admin bootstrap calls — MUST be registered first,
  // because Playwright evaluates routes in reverse registration order and a
  // later rule overrides earlier ones.
  await page.route(/\/api\//, (route) =>
    route.fulfill({ json: { message: 'mocked' } }),
  );
  await page.route('**/api/admin/me', (route) =>
    route.fulfill({
      json: {
        admin: {
          _id: 'admin1',
          name: 'QA Admin',
          token: 'e2e-test-token',
          permissions: ['edit_products'],
        },
      },
    }),
  );
  await page.route('**/api/products/slug/**', (route) =>
    route.fulfill({ json: productFixture }),
  );
  await page.route('**/api/flags', (route) =>
    route.fulfill({ json: flagsFixture }),
  );
  await page.route('**/api/product-options', (route) =>
    route.fulfill({ json: optionsFixture }),
  );
  await page.route('**/api/category', (route) =>
    route.fulfill({ json: categoriesFixture }),
  );
  // Mock the uploads host so variant/product image previews render
  await page.route('**/uploads/**', (route) =>
    route.fulfill({ contentType: 'image/png', body: TINY_PNG }),
  );
});

test.describe('Product edit form robustness', () => {
  test('saved variant option and value always load, even when the value is missing from the current options list', async ({
    page,
  }) => {
    await page.goto(EDIT_URL, { waitUntil: 'networkidle' });

    // Option select shows the populated option name
    await expect(page.getByText('Size', { exact: true }).first()).toBeVisible();

    // Value select shows the STORED value 'XL' even though the live option
    // list only has S/M/L — regression test for the "value missing" bug
    await expect(page.getByText('XL', { exact: true }).first()).toBeVisible();
  });

  test('selected flags always render, even when a flag was deleted after the product was saved', async ({
    page,
  }) => {
    await page.goto(EDIT_URL, { waitUntil: 'networkidle' });

    // Existing flag renders by name
    await expect(page.getByText('New Arrival', { exact: true })).toBeVisible();

    // Flag deleted after save must not silently vanish — shows as unavailable
    await expect(
      page.getByText('Unavailable flag', { exact: true }),
    ).toBeVisible();

    // Selection count still includes the missing flag
    await expect(page.getByText('2 flag(s) selected')).toBeVisible();
  });

  test('variant image always loads, can be removed and re-added', async ({
    page,
  }) => {
    await page.goto(EDIT_URL, { waitUntil: 'networkidle' });

    // Stored variant image renders in the variants table
    await expect(
      page.getByAltText('Variant 1'),
    ).toBeVisible();

    // Removing the stored image clears the preview and reveals the placeholder
    await page
      .locator('img[alt="Variant 1"]')
      .locator('..')
      .locator('button')
      .click();
    await expect(page.getByAltText('Variant 1')).toHaveCount(0);
    await expect(page.locator('label[for="variant-image-0"]')).toBeVisible();

    // Re-adding an image file shows a local preview again
    await page.setInputFiles('#variant-image-0', {
      name: 'new-variant.png',
      mimeType: 'image/png',
      buffer: TINY_PNG,
    });
    await expect(page.getByAltText('Variant 1')).toBeVisible();
  });

  test('variant edits are isolated: adding rows never disturbs neighbouring values', async ({
    page,
  }) => {
    await page.goto(EDIT_URL, { waitUntil: 'networkidle' });

    // First variant shows its stored value
    await expect(page.getByText('XL', { exact: true }).first()).toBeVisible();

    // Add a second variant row, then add an attribute to it
    await page.getByRole('button', { name: 'Add Another Variant' }).click();
    const addAttributeButtons = page.getByRole('button', {
      name: 'Add Attribute',
    });
    await expect(addAttributeButtons).toHaveCount(2);
    await addAttributeButtons.nth(1).click();

    // The FIRST variant keeps its stored option/value
    await expect(page.getByText('Size', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('XL', { exact: true }).first()).toBeVisible();

    // Both variant rows have a stock input
    const stockInputs = await page
      .locator('table input[type="number"]')
      .count();
    expect(stockInputs).toBeGreaterThanOrEqual(2);
  });
});
