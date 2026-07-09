const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 15000 });
    const screenshotPath = 'frontend_screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved to', screenshotPath);
    await browser.close();
  } catch (e) {
    console.error('Error taking screenshot:', e);
    process.exit(1);
  }
})();
