const express = require('express');
const { getGroceryProducts } = require('../models/grocery_product');

const router = express.Router();

// GET /api/grocery/products?store=&location=&search=
router.get('/products', async (req, res) => {
  try {
    const { store, location, search } = req.query;
    const products = await getGroceryProducts({ store, location, search });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get grocery products', details: err.message });
  }
});

module.exports = router;
