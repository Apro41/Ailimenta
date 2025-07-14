// Scraper template for grocery stores using Puppeteer
const puppeteer = require('puppeteer');
const { upsertGroceryProduct } = require('../models/grocery_product');

/**
 * Fetch products from a grocery store using Puppeteer.
 * @param {Object} opts
 * @param {string} opts.location - City or postal code
 * @param {string} opts.search - Product search keyword
 * @param {string} [opts.store_id] - Store-specific location code
 * @returns {Promise<Array>} Array of product objects
 */
async function fetchStoreProducts({ location, search, store_id }) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // TODO: Replace with the actual store's search URL and logic
  const url = `https://www.example.com/search?q=${encodeURIComponent(search)}`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  // TODO: Wait for product list to load
  // await page.waitForSelector('.product-list__item');

  // TODO: Scrape products
  const products = await page.evaluate(() => {
    // Replace this with actual DOM selectors for the store
    return Array.from(document.querySelectorAll('.product-list__item')).map(el => ({
      store: 'store_name',
      product_id: '',
      name: el.querySelector('.product-title')?.innerText || '',
      brand: '',
      category: '',
      price: parseFloat(el.querySelector('.product-price')?.innerText.replace(/[^\d.]/g, '')),
      unit: '',
      stock: null,
      availability: 'available',
      location: '',
      product_url: '',
      image_url: ''
    }));
  });

  // Upsert products into DB
  for (const p of products) {
    await upsertGroceryProduct(p);
  }

  await browser.close();
  return products;
}

module.exports = { fetchStoreProducts };
