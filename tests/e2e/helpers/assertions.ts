import { expect, type Page, type Locator } from '@playwright/test';

export async function expectElementVisible(page: Page, selector: string): Promise<void> {
  await expect(page.locator(selector)).toBeVisible();
}

export async function expectElementHidden(page: Page, selector: string): Promise<void> {
  await expect(page.locator(selector)).toBeHidden();
}

export async function expectTextContent(page: Page, selector: string, text: string): Promise<void> {
  await expect(page.locator(selector)).toContainText(text);
}

export async function expectInputValue(page: Page, selector: string, value: string): Promise<void> {
  await expect(page.locator(selector)).toHaveValue(value);
}

export async function expectNoConsoleErrors(page: Page): Promise<void> {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Wait a bit for any pending errors
  await page.waitForTimeout(1000);
  
  expect(errors).toHaveLength(0);
}

export async function expectThemeApplied(page: Page, theme: 'dark' | 'light'): Promise<void> {
  const body = page.locator('body');
  
  if (theme === 'dark') {
    await expect(body).toHaveClass(/dark/);
  } else {
    await expect(body).not.toHaveClass(/dark/);
  }
}

export async function expectSmoothTransition(page: Page, selector: string, maxDuration: number = 300): Promise<void> {
  const start = Date.now();
  await page.locator(selector).waitFor({ state: 'visible' });
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(maxDuration);
}
