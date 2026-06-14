import { test, expect, type Page } from '@playwright/test';
import { launchApp, closeApp } from '../helpers/app-launcher';
import { waitForAppReady } from '../helpers/test-utils';

let page: Page;

test.beforeAll(async () => {
  page = await launchApp();
});

test.afterAll(async () => {
  await closeApp();
});

async function openSettings() {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.waitForTimeout(500);
}

async function switchToAppearanceTab() {
  await page.getByRole('button', { name: 'Appearance' }).click();
  await page.waitForTimeout(300);
}

test.describe('Settings', () => {
  test.beforeEach(async () => {
    await waitForAppReady(page);
    await openSettings();
  });

  test('should open settings page', async () => {
    await expect(page.getByRole('heading', { name: /Settings/ })).toBeVisible({ timeout: 5000 });
  });

  test('should show startup behavior option on General tab', async () => {
    await expect(page.getByText('Startup Behavior')).toBeVisible();
  });

  test('should show theme options on Appearance tab', async () => {
    await switchToAppearanceTab();
    await expect(page.getByText('Dark')).toBeVisible();
    await expect(page.getByText('Light')).toBeVisible();
  });

  test('should show accent color options on Appearance tab', async () => {
    await switchToAppearanceTab();
    await expect(page.getByText('Accent Color').first()).toBeVisible();
  });

  test('settings persist after page reload', async () => {
    await page.evaluate(() => {
      localStorage.setItem(
        'toolbox-pro-settings',
        JSON.stringify({
          theme: 'dark',
          accentColor: '#2563EB',
          startupBehavior: 'dashboard',
          showRecentInSidebar: true,
        })
      );
    });
    await page.reload();
    await waitForAppReady(page);
    await openSettings();

    await expect(page.getByRole('heading', { name: /Settings/ })).toBeVisible({ timeout: 5000 });
  });
});
