const express = require('express');
const { createRecipe, getRecipeById, getRecipesByUser, updateRecipe, deleteRecipe } = require('../models/recipe');
const { findUserById } = require('../models/user');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// JWT middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Create a recipe
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { title, description, ingredients, steps, cuisine } = req.body;
    const recipe = await createRecipe({ user_id: user.id, title, description, ingredients, steps, cuisine });
    res.json({ recipe });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create recipe', details: err.message });
  }
});

// Get a recipe by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const recipe = await getRecipeById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ recipe });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recipe', details: err.message });
  }
});

// Filter/browse recipes (public for all users)
// Query params: cuisine, dietary, allergens, min_rating, max_rating, search
router.get('/filter', async (req, res) => {
  try {
    const { cuisine, dietary, allergens, min_rating, max_rating, search } = req.query;
    let sql = 'SELECT * FROM recipes';
    const conditions = [];
    const params = [];
    if (cuisine) {
      conditions.push('cuisine LIKE ?');
      params.push(`%${cuisine}%`);
    }
    if (dietary) {
      conditions.push('LOWER(title) LIKE ? OR LOWER(description) LIKE ?');
      params.push(`%${dietary.toLowerCase()}%`);
      params.push(`%${dietary.toLowerCase()}%`);
    }
    if (search) {
      conditions.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(ingredients) LIKE ?)');
      params.push(`%${search.toLowerCase()}%`);
      params.push(`%${search.toLowerCase()}%`);
      params.push(`%${search.toLowerCase()}%`);
    }
    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';
    // Query DB
    const recipes = await new Promise((resolve, reject) => {
      req.app.locals.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        rows.forEach(row => {
          row.ingredients = JSON.parse(row.ingredients || '[]');
          row.steps = JSON.parse(row.steps || '[]');
        });
        resolve(rows);
      });
    });
    // Filter by allergens (client provides comma-separated list)
    let filtered = recipes;
    if (allergens) {
      const allergenList = allergens.toLowerCase().split(',').map(a => a.trim());
      filtered = recipes.filter(r => {
        const allIngredients = (r.ingredients || []).join(' ').toLowerCase();
        return !allergenList.some(a => allIngredients.includes(a));
      });
    }
    // Filter by rating
    if (min_rating || max_rating) {
      // Get average ratings for all recipes
      const { getAverageRating } = require('../models/rating');
      const ratings = await Promise.all(filtered.map(async r => {
        const avg = await getAverageRating(r.id);
        return { id: r.id, avg: avg ? parseFloat(avg) : null };
      }));
      filtered = filtered.filter(r => {
        const rating = ratings.find(x => x.id === r.id)?.avg;
        if (min_rating && (rating === null || rating < parseFloat(min_rating))) return false;
        if (max_rating && (rating !== null && rating > parseFloat(max_rating))) return false;
        return true;
      });
    }
    res.json({ recipes: filtered });
  } catch (err) {
    res.status(500).json({ error: 'Failed to filter recipes', details: err.message });
  }
});

// Get all recipes for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const recipes = await getRecipesByUser(req.user.id);
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recipes', details: err.message });
  }
});

// Update a recipe
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Optionally, check if recipe belongs to user
    await updateRecipe(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recipe', details: err.message });
  }
});

// Delete a recipe
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await deleteRecipe(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe', details: err.message });
  }
});

module.exports = router;
