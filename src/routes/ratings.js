const express = require('express');
const jwt = require('jsonwebtoken');
const { rateRecipe, getRecipeRatings, getAverageRating, getTopRatedRecipes } = require('../models/rating');
const { findUserById } = require('../models/user');

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

// Rate a recipe
router.post('/:recipe_id', authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { rating, comment } = req.body;
    await rateRecipe({ user_id: user.id, recipe_id: req.params.recipe_id, rating, comment });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to rate recipe', details: err.message });
  }
});

// Get all ratings for a recipe
router.get('/:recipe_id', async (req, res) => {
  try {
    const ratings = await getRecipeRatings(req.params.recipe_id);
    res.json({ ratings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get ratings', details: err.message });
  }
});

// Get average rating for a recipe
router.get('/:recipe_id/average', async (req, res) => {
  try {
    const avg = await getAverageRating(req.params.recipe_id);
    res.json({ average: avg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get average rating', details: err.message });
  }
});

// Get top-rated recipes
router.get('/top/all', async (req, res) => {
  try {
    const top = await getTopRatedRecipes(10);
    res.json({ top });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get top recipes', details: err.message });
  }
});

module.exports = router;
