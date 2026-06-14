import { type Page, type Locator, test } from '@playwright/test';
import { launchApp, closeApp } from './app-launcher';

export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  // Wait for the app root to have content
  await page.waitForSelector('#root > div', { timeout: 15000 });
}

export async function navigateToTool(page: Page, toolName: string): Promise<void> {
  // Open search modal with Ctrl+K
  await page.keyboard.press('Control+k');
  await page.waitForSelector('[data-testid="search-modal"]', { state: 'visible', timeout: 5000 });
  await page.waitForSelector('[data-testid="search-input"]', { state: 'visible', timeout: 5000 });
  
  // Type tool name
  await page.keyboard.type(toolName, { delay: 30 });
  await page.waitForTimeout(800);
  
  // Click first result or press Enter
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
}

export async function openSidebarCategory(page: Page, category: string): Promise<void> {
  const categoryButton = page.locator(`[data-testid="sidebar-category-${category}"]`);
  await categoryButton.click();
  await page.waitForTimeout(300);
}

export async function clickSidebarTool(page: Page, toolId: string): Promise<void> {
  const toolLink = page.locator(`[data-testid="sidebar-tool-${toolId}"]`);
  await toolLink.click();
  await page.waitForTimeout(300);
}

export async function getSearchResults(page: Page): Promise<Locator[]> {
  return page.locator('[data-testid="search-result"]').all();
}

export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
}

// Setup and teardown helpers for tests
export function setupAppTest() {
  let page: Page;

  test.beforeAll(async () => {
    page = await launchApp();
  });

  test.afterAll(async () => {
    await closeApp();
  });

  return {
    getPage: () => page,
  };
}
