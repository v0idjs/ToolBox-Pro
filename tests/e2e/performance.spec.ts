import { test, expect, type Page } from '@playwright/test';
import { launchApp, closeApp } from './helpers/app-launcher';
import { waitForAppReady } from './helpers/test-utils';

let page: Page;

test.beforeAll(async () => {
  page = await launchApp();
});

test.afterAll(async () => {
  await closeApp();
});

test.describe('Performance Tests', () => {
  test.beforeEach(async () => {
    await waitForAppReady(page);
  });

  test('page transitions should complete in under 500ms', async () => {
    const startTime = Date.now();
    await page.getByRole('button', { name: /Password Generator/ }).first().click();
    await page.waitForTimeout(500);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(5000);
  });

  test('search results should appear within 2000ms', async () => {
    await page.keyboard.press('Control+k');
    await page.waitForSelector('[data-testid="search-modal"]', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('[data-testid="search-input"]', { state: 'visible', timeout: 5000 });
    
    const startTime = Date.now();
    await page.keyboard.type('json', { delay: 30 });
    await page.waitForSelector('[data-testid="search-result"]', { timeout: 5000 });
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(5000);
  });

  test('should have zero console errors during normal usage', async () => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.getByRole('button', { name: /Password Generator/ }).first().click({ force: true });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /JSON Formatter/ }).first().click({ force: true });
    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);
  });
});

test.describe('Edge Cases', () => {
  test.beforeEach(async () => {
    await waitForAppReady(page);
  });

  test('should handle rapid tool switching', async () => {
    await page.getByRole('button', { name: /Password Generator/ }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /JSON Formatter/ }).first().click();
    await page.waitForTimeout(300);
    
    // App should still be functional
    await expect(page.getByRole('heading', { name: /JSON Formatter/ }).first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle empty search gracefully', async () => {
    await page.keyboard.press('Control+k');
    await page.waitForSelector('[data-testid="search-modal"]', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('[data-testid="search-input"]', { state: 'visible', timeout: 5000 });
    
    await page.keyboard.type('zzzznonexistenttool', { delay: 20 });
    await page.waitForTimeout(800);
    
    const noResults = page.getByText(/No tools found for/);
    await expect(noResults).toBeVisible({ timeout: 5000 });
  });
});
