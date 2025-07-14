const express = require('express');
const { createMealPlan, getMealPlanById, getMealPlansByUser, updateMealPlan, deleteMealPlan } = require('../models/mealplan');
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

// Create a meal plan
// Accepts: title, description, recipe_ids, start_date, end_date, schedule_type ('daily'|'weekly'|'monthly'), schedule (object mapping dates/days to recipe_ids)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { title, description, recipe_ids, start_date, end_date, schedule_type, schedule } = req.body;
    const mealPlan = await createMealPlan({ user_id: user.id, title, description, recipe_ids, start_date, end_date, schedule_type, schedule });
    res.json({ mealPlan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create meal plan', details: err.message });
  }
});

// Get a meal plan by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const mealPlan = await getMealPlanById(req.params.id);
    if (!mealPlan) return res.status(404).json({ error: 'Meal plan not found' });
    res.json({ mealPlan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get meal plan', details: err.message });
  }
});

// Get all meal plans for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const mealPlans = await getMealPlansByUser(req.user.id);
    res.json({ mealPlans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get meal plans', details: err.message });
  }
});

// Update a meal plan
// Accepts: title, description, recipe_ids, start_date, end_date, schedule_type, schedule
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    await updateMealPlan(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update meal plan', details: err.message });
  }
});

// Delete a meal plan
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await deleteMealPlan(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete meal plan', details: err.message });
  }
});

module.exports = router;
