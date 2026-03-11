import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('CONSOLE ERROR:', msg.text());
  });

  try {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
  } catch (e) {
    console.error('Failed to goto localhost:', e.message);
  }

  await browser.close();
})();
