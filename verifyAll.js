const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

const FRONTEND = 'http://localhost:5173';
const BACKEND = 'http://localhost:5001';

async function crawl(page, url, visited = new Set()) {
  if (visited.has(url)) return;
  visited.add(url);
  console.log('➡️ Visiting', url);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (e) {
    console.error('❌ Failed to load', url, e.message);
    return;
  }
  const links = await page.$$eval('a[href]', as => as.map(a => a.href));
  for (const link of links) {
    if (link.startsWith(FRONTEND)) {
      await crawl(page, link, visited);
    } else if (link.startsWith(BACKEND)) {
      try {
        const res = await fetch(link);
        if (!res.ok) console.warn('⚠️ Backend link', link, 'status', res.status);
        else console.log('✅ Backend link', link);
      } catch (e) {
        console.error('❌ Failed backend link', link, e.message);
      }
    }
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await crawl(page, FRONTEND);
  await browser.close();
  console.log('✅ Crawl complete');
})();

