import puppeteer, { type Browser, type Page } from "puppeteer-core";

let browser: Browser | null = null;

const CHROME_PATH = process.env.CHROME_PATH || "/usr/bin/google-chrome";

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--no-first-run",
        "--single-process",
      ],
    });
  }
  return browser;
}

export async function getPage(): Promise<Page> {
  const b = await getBrowser();
  const page = await b.newPage();
  await page.setJavaScriptEnabled(true);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  return page;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function scrapeWithPuppeteer(
  url: string,
  selector: string,
  extractFn: (page: Page) => Promise<any[]>
): Promise<any[]> {
  const page = await getPage();
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector(selector, { timeout: 10000 });
    return await extractFn(page);
  } finally {
    await page.close();
  }
}
