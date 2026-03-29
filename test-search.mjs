import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  console.log('Testing loading skeleton with TanStack Query...');
  await page.fill('input[name="q"]', 'cats');
  await page.click('button:has-text("Veil Search")');
  
  // Check multiple times for skeleton
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(300);
    const state = await page.evaluate(() => {
      const skeleton = document.querySelector('.animate-pulse');
      const articles = document.querySelectorAll('article');
      return { hasSkeleton: !!skeleton, articleCount: articles.length };
    });
    console.log(`Check ${i+1}: skeleton=${state.hasSkeleton}, articles=${state.articleCount}`);
    if (state.articleCount > 0 && !state.hasSkeleton) break;
  }
  
  console.log('\n✓ Test complete');
  
} catch (err) {
  console.error('Test failed:', err.message);
} finally {
  await browser.close();
}
