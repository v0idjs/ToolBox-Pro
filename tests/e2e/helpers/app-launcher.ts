import { type Page, type ElectronApplication } from '@playwright/test';
import { _electron as electron } from '@playwright/test';
import { resolve } from 'path';

let electronApp: ElectronApplication | null = null;
let page: Page | null = null;

export async function launchApp(): Promise<Page> {
  const appPath = resolve(__dirname, '../../..');
  
  electronApp = await electron.launch({
    args: [appPath],
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });

  // Wait for the first BrowserWindow to open
  page = await electronApp.firstWindow();
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('domcontentloaded');
  
  return page;
}

export async function closeApp(): Promise<void> {
  if (electronApp) {
    try {
      await electronApp.close();
    } catch {
      // Force kill if close hangs
      try {
        const proc = electronApp.process();
        if (proc && proc.pid) {
          process.kill(proc.pid, 'SIGTERM');
        }
      } catch {}
    }
    electronApp = null;
    page = null;
  }
}

export function getPage(): Page | null {
  return page;
}
