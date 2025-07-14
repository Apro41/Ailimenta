const express = require('express');
const jwt = require('jsonwebtoken');
const { getMealRecommendations } = require('../groc');
const { createRecipe } = require('../models/recipe');
const { createMealPlan } = require('../models/mealplan');
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

// POST /api/mealplans/ai-generate
// Body: { prompt: string, schedule_type: 'daily'|'weekly'|'monthly', start_date, end_date }
router.post('/ai-generate', authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { prompt, schedule_type = 'weekly', start_date, end_date } = req.body;
    // Compose AI prompt
    const aiPrompt = `${prompt}\nUser preferences: ${JSON.stringify({
      dietary_preferences: user.dietary_preferences,
      allergies: user.allergies,
      budget: user.budget,
      cuisine_preferences: user.cuisine_preferences
    })}\nReturn a ${schedule_type} meal plan with a schedule and recipes. Format as JSON with 'schedule' and 'recipes' fields.`;
    // Call Groq
    const payload = {
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a meal planning assistant that returns structured JSON.' },
        { role: 'user', content: aiPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    const aiResponse = await getMealRecommendations({ payload });
    // Try to parse JSON from AI response
    let plan;
    try {
      plan = JSON.parse(aiResponse);
    } catch (e) {
      return res.status(500).json({ error: 'AI returned invalid JSON', details: aiResponse });
    }
    // Create recipes and collect their IDs
    const recipeIds = [];
    if (Array.isArray(plan.recipes)) {
      for (const r of plan.recipes) {
        const created = await createRecipe({
          user_id: user.id,
          title: r.title,
          description: r.description,
          ingredients: r.ingredients,
          steps: r.steps,
          cuisine: r.cuisine || ''
        });
        recipeIds.push(created.id);
      }
    }
    // Create meal plan
    const mealPlan = await createMealPlan({
      user_id: user.id,
      title: plan.title || `${schedule_type} meal plan`,
      description: plan.description || '',
      recipe_ids: recipeIds,
      start_date,
      end_date,
      schedule_type,
      schedule: plan.schedule
    });
    res.json({ mealPlan, recipes: plan.recipes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate meal plan', details: err.message });
  }
});

module.exports = router;
