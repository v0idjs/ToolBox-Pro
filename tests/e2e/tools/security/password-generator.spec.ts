import { test, expect, type Page } from '@playwright/test';
import { launchApp, closeApp } from '../../helpers/app-launcher';
import { waitForAppReady } from '../../helpers/test-utils';

let page: Page;

test.beforeAll(async () => {
  page = await launchApp();
});

test.afterAll(async () => {
  await closeApp();
});

test.describe('Password Generator', () => {
  test.beforeEach(async () => {
    await waitForAppReady(page);
    await page.getByRole('button', { name: /Password Generator/ }).first().click();
    await page.waitForTimeout(500);
  });

  test('should load the tool', async () => {
    await expect(page.getByRole('heading', { name: 'Password Generator' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should have basic interactivity', async () => {
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible({ timeout: 5000 });
  });
});
