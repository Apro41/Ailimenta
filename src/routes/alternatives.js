const express = require('express');
const jwt = require('jsonwebtoken');
const { getTopRatedRecipes } = require('../models/rating');
const { db: recipeDb } = require('../models/recipe');
const { getMealPlanById } = require('../models/mealplan');
const { getMealRecommendations } = require('../groc');
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

// GET /api/recipes/alternatives?schedule_date=YYYY-MM-DD&mealplan_id=123&current_recipe_id=5
// Returns top-rated, most popular, and AI-powered alternatives
router.get('/alternatives', authMiddleware, async (req, res) => {
  try {
    const { schedule_date, mealplan_id, current_recipe_id } = req.query;
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Get the meal plan and exclude already scheduled recipes for that date
    const mealPlan = await getMealPlanById(mealplan_id);
    let scheduledIds = [];
    if (mealPlan && mealPlan.schedule && mealPlan.schedule[schedule_date]) {
      scheduledIds = mealPlan.schedule[schedule_date];
    }
    // Get top-rated recipes not already scheduled
    const topRated = await getTopRatedRecipes(10);
    const topRatedIds = topRated.map(r => r.recipe_id).filter(id => !scheduledIds.includes(id) && id != current_recipe_id);
    // Fetch full recipe details
    const topRatedRecipes = await new Promise((resolve, reject) => {
      if (!topRatedIds.length) return resolve([]);
      recipeDb.all(`SELECT * FROM recipes WHERE id IN (${topRatedIds.map(() => '?').join(',')})`, topRatedIds, (err, rows) => {
        if (err) return reject(err);
        rows.forEach(row => {
          row.ingredients = JSON.parse(row.ingredients || '[]');
          row.steps = JSON.parse(row.steps || '[]');
        });
        resolve(rows);
      });
    });
    // AI-powered alternative
    let aiAlternative = null;
    if (current_recipe_id) {
      // Fetch the current recipe
      const currentRecipe = await new Promise((resolve, reject) => {
        recipeDb.get('SELECT * FROM recipes WHERE id = ?', [current_recipe_id], (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          row.ingredients = JSON.parse(row.ingredients || '[]');
          row.steps = JSON.parse(row.steps || '[]');
          resolve(row);
        });
      });
      if (currentRecipe) {
        const aiPrompt = `Suggest a meal similar to the following but with a twist or improvement.\nRecipe: ${currentRecipe.title}, Description: ${currentRecipe.description}, Ingredients: ${currentRecipe.ingredients.join(', ')}.\nUser preferences: ${JSON.stringify({
          dietary_preferences: user.dietary_preferences,
          allergies: user.allergies,
          budget: user.budget,
          cuisine_preferences: user.cuisine_preferences
        })}\nReturn a single recipe as JSON.`;
        const payload = {
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: 'You are a meal planning assistant that returns structured JSON.' },
            { role: 'user', content: aiPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        };
        const aiResponse = await getMealRecommendations({ payload });
        try {
          aiAlternative = JSON.parse(aiResponse);
        } catch (e) {
          aiAlternative = { error: 'AI returned invalid JSON', details: aiResponse };
        }
      }
    }
    res.json({ alternatives: topRatedRecipes, aiAlternative });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alternatives', details: err.message });
  }
});

module.exports = router;
