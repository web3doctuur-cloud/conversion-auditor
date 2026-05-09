import { Browser, BrowserContext, Page, chromium } from 'playwright';

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    console.log('[Browser] Chromium launched');
  }
  return browser;
}

export async function createContext(): Promise<{ page: Page; context: BrowserContext }> {
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  return { page, context };
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
