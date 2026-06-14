import { test, expect, type Page } from '@playwright/test';
import { launchApp, closeApp } from '../helpers/app-launcher';
import { waitForAppReady, navigateToTool } from '../helpers/test-utils';

let page: Page;

test.beforeAll(async () => {
  page = await launchApp();
});

test.afterAll(async () => {
  await closeApp();
});

test.describe('Search', () => {
  test.beforeEach(async () => {
    await waitForAppReady(page);
    // Ensure search modal is closed
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('should open search modal with Ctrl+K', async () => {
    await page.keyboard.press('Control+k');
    const modal = page.locator('[data-testid="search-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('should focus the search input on open', async () => {
    await page.keyboard.press('Control+k');
    const input = page.locator('[data-testid="search-input"]');
    await expect(input).toBeFocused({ timeout: 5000 });
  });

  test('should show placeholder text when empty', async () => {
    await page.keyboard.press('Control+k');
    const input = page.locator('[data-testid="search-input"]');
    await expect(input).toHaveAttribute('placeholder');
  });

  test('should search by tool name', async () => {
    await page.keyboard.press('Control+k');
    await page.waitForSelector('[data-testid="search-modal"]', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('[data-testid="search-input"]', { state: 'visible', timeout: 5000 });
    await page.keyboard.type('json', { delay: 50 });
    await page.waitForTimeout(800);
    
    const results = page.locator('[data-testid="search-result"]');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search by category', async () => {
    await page.keyboard.press('Control+k');
    await page.waitForSelector('[data-testid="search-modal"]', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('[data-testid="search-input"]', { state: 'visible', timeout: 5000 });
    await page.keyboard.type('Security', { delay: 50 });
    await page.waitForTimeout(800);
    
    const results = page.locator('[data-testid="search-result"]');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show no results message for unmatched query', async () => {
    await page.keyboard.press('Control+k');
    await page.waitForSelector('[data-testid="search-modal"]', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('[data-testid="search-input"]', { state: 'visible', timeout: 5000 });
    await page.keyboard.type('zzzznonexistenttool', { delay: 30 });
    await page.waitForTimeout(800);
    
    const noResults = page.getByText(/No tools found for/);
    await expect(noResults).toBeVisible({ timeout: 5000 });
  });

  test('should close search modal with Escape', async () => {
    await page.keyboard.press('Control+k');
    await page.waitForSelector('[data-testid="search-modal"]', { state: 'visible' });
    
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="search-modal"]')).not.toBeVisible({ timeout: 3000 });
  });
});
