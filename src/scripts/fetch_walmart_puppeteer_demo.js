// Demo script: fetch Walmart products using Puppeteer and print/save to DB
const { fetchWalmartProducts } = require('../scrapers/walmart_puppeteer');

async function main() {
  const location = 'Toronto';
  const search = 'milk';
  const store_id = '1111'; // Walmart Dufferin Mall Toronto
  console.log(`Fetching Walmart products (Puppeteer) for '${search}' at location '${location}' (store_id: ${store_id})...`);
  const products = await fetchWalmartProducts({ location, search, store_id });
  console.log('Fetched products:', products);
  console.log(`Total products fetched: ${products.length}`);
}

main();
