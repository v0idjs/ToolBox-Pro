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

test.describe('Sidebar', () => {
  test.beforeEach(async () => {
    await waitForAppReady(page);
  });

  test('should display sidebar', async () => {
    await expect(page.locator('aside')).toBeVisible();
  });

  test('should show Index header', async () => {
    await expect(page.getByText('Index', { exact: true }).first()).toBeVisible();
  });

  test('should show Dashboard link', async () => {
    await expect(page.getByRole('button', { name: /Dashboard/ })).toBeVisible();
  });

  test('should display tool categories', async () => {
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Security').first()).toBeVisible();
    await expect(sidebar.getByText('Developer').first()).toBeVisible();
    await expect(sidebar.getByText('Image').first()).toBeVisible();
    await expect(sidebar.getByText('QR & Barcode').first()).toBeVisible();
    await expect(sidebar.getByText('Productivity').first()).toBeVisible();
  });

  test('should show tools under Security category', async () => {
    const sidebar = page.locator('aside');
    await expect(sidebar.getByRole('button', { name: /Password Generator/ }).first()).toBeVisible();
    await expect(sidebar.getByRole('button', { name: /Hash Generator/ }).first()).toBeVisible();
  });

  test('should navigate to tool from sidebar', async () => {
    await page.getByRole('button', { name: /Notes/ }).first().click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /Notes/ })).toBeVisible({ timeout: 5000 });
  });

  test('should navigate between tools', async () => {
    await page.getByRole('button', { name: /JSON Formatter/ }).first().click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /JSON Formatter/ })).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /Notes/ }).first().click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /Notes/ })).toBeVisible({ timeout: 5000 });
  });
});
