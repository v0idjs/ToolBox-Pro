import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Wait for the app to be ready
  await page.goto(config.projects[0].use.baseURL || 'http://localhost:5173');
  await page.waitForLoadState('networkidle');
  
  await browser.close();
}

export default globalSetup;
