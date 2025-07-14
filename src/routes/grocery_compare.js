const express = require('express');
const { db } = require('../models/grocery_product');

const router = express.Router();

// GET /api/grocery/compare?ingredients=milk,eggs,bread&location=Toronto
// Returns: for each store, total price for all items, plus per-item breakdown
router.get('/compare', async (req, res) => {
  try {
    const { ingredients, location } = req.query;
    if (!ingredients || !location) {
      return res.status(400).json({ error: 'Missing ingredients or location' });
    }
    const ingredientList = ingredients.split(',').map(i => i.trim().toLowerCase());
    // Get all stores
    db.all('SELECT DISTINCT store FROM grocery_products WHERE location = ?', [location], (err, stores) => {
      if (err) return res.status(500).json({ error: 'DB error', details: err.message });
      if (!stores.length) return res.json({ results: [] });
      const results = [];
      let processed = 0;
      stores.forEach(storeObj => {
        const store = storeObj.store;
        // For each ingredient, get the cheapest matching product at this store/location
        const placeholders = ingredientList.map(() => '?').join(',');
        db.all(
          `SELECT * FROM grocery_products WHERE store = ? AND location = ? AND LOWER(name) IN (${placeholders}) ORDER BY price ASC`,
          [store, location, ...ingredientList],
          (err2, rows) => {
            if (err2) return res.status(500).json({ error: 'DB error', details: err2.message });
            // Map ingredient to cheapest product
            const perItem = {};
            let total = 0;
            ingredientList.forEach(ingredient => {
              const match = rows.find(r => r.name.toLowerCase() === ingredient);
              if (match) {
                perItem[ingredient] = match;
                total += match.price || 0;
              } else {
                perItem[ingredient] = null;
              }
            });
            results.push({ store, total, perItem });
            processed++;
            if (processed === stores.length) {
              // Sort by total price ascending
              results.sort((a, b) => a.total - b.total);
              res.json({ results });
            }
          }
        );
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compare groceries', details: err.message });
  }
});

module.exports = router;
