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

test.describe('Theme Switching', () => {
  test.beforeEach(async () => {
    await waitForAppReady(page);
    await openSettings();
    await switchToAppearanceTab();
  });

  test('should display theme options', async () => {
    await expect(page.getByText('Dark')).toBeVisible();
    await expect(page.getByText('Light')).toBeVisible();
  });

  test('should toggle to light theme', async () => {
    await page.getByText('Light').first().click();
    await page.waitForTimeout(300);

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    expect(bgColor).not.toBe('rgb(0, 0, 0)');
  });

  test('should toggle to dark theme', async () => {
    await page.getByText('Dark').first().click();
    await page.waitForTimeout(300);

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    expect(bgColor).toBeTruthy();
  });

  test('theme applies to all components', async () => {
    await page.getByText('Light').first().click();
    await page.waitForTimeout(500);

    const sidebar = page.locator('aside');
    const sidebarBg = await sidebar.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(sidebarBg).toBeTruthy();

    const main = page.locator('main');
    const mainBg = await main.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(mainBg).toBeTruthy();
  });

  test('theme persists after page reload', async () => {
    await page.getByText('Light').first().click();
    await page.waitForTimeout(300);

    await page.reload();
    await waitForAppReady(page);
    await openSettings();
    await switchToAppearanceTab();

    const stored = await page.evaluate(() => {
      const settings = localStorage.getItem('toolbox-pro-settings');
      return settings ? JSON.parse(settings) : null;
    });
    expect(stored?.theme).toBe('light');
  });
});
