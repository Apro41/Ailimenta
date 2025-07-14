const axios = require('axios');
const cheerio = require('cheerio');
const { upsertGroceryProduct } = require('../models/grocery_product');

// Walmart Canada public search URL pattern
// Example: https://www.walmart.ca/search?q=milk&store_id=1111
async function fetchWalmartProducts({ location, search, store_id }) {
  // store_id is Walmart's internal store number for the location
  // For demo: hardcode Toronto Dufferin Mall: 1111
  const sid = store_id || '1111';
  const url = `https://www.walmart.ca/search?q=${encodeURIComponent(search)}&store_id=${sid}`;
  const products = [];
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    const $ = cheerio.load(data);
    $('.product-list__item').each((i, el) => {
      const name = $(el).find('.product-title-link span').text().trim();
      const price = parseFloat($(el).find('.price-current span.visuallyhidden').first().text().replace(/[^\d.]/g, ''));
      const image_url = $(el).find('img').attr('src');
      const product_url = 'https://www.walmart.ca' + ($(el).find('.product-title-link').attr('href') || '');
      if (name && price) {
        products.push({
          store: 'walmart',
          product_id: product_url.split('/').pop(),
          name,
          brand: '',
          category: '',
          price,
          unit: '',
          stock: null,
          availability: 'available',
          location,
          product_url,
          image_url
        });
      }
    });
    // Upsert products into DB
    for (const p of products) {
      await upsertGroceryProduct(p);
    }
    return products;
  } catch (err) {
    console.error('Walmart fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchWalmartProducts };
