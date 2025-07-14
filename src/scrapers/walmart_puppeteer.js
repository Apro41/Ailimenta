const puppeteer = require('puppeteer');
const { upsertGroceryProduct } = require('../models/grocery_product');

/**
 * Fetch Walmart products using Puppeteer (Canada, by keyword and store_id)
 * @param {Object} opts
 * @param {string} opts.location - City or postal code
 * @param {string} opts.search - Product search keyword
 * @param {string} [opts.store_id] - Walmart store ID (default: 1111 Dufferin Mall)
 * @returns {Promise<Array>} Array of product objects
 */
async function fetchWalmartProducts({ location, search, store_id }) {
  const sid = store_id || '1111';
  const url = `https://www.walmart.ca/search?q=${encodeURIComponent(search)}&store_id=${sid}`;
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('[data-automation="product"]', { timeout: 10000 });

  const products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-automation="product"]')).map(el => {
      const name = el.querySelector('[data-automation="product-title"]')?.innerText?.trim() || '';
      const price = parseFloat((el.querySelector('[data-automation="product-price"]')?.innerText || '').replace(/[^\d.]/g, ''));
      const image_url = el.querySelector('img')?.src || '';
      const product_url = 'https://www.walmart.ca' + (el.querySelector('a')?.getAttribute('href') || '');
      return {
        store: 'walmart',
        product_id: product_url.split('/').pop(),
        name,
        brand: '',
        category: '',
        price,
        unit: '',
        stock: null,
        availability: 'available',
        location: '',
        product_url,
        image_url
      };
    });
  });

  for (const p of products) {
    p.location = location;
    await upsertGroceryProduct(p);
  }

  await browser.close();
  return products;
}

module.exports = { fetchWalmartProducts };
