const express = require('express');
const { getClips, addClip, likeClip } = require('../models/food_clips');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// JWT middleware (optional for like/submit)
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

// GET /api/clips/feed?limit=10&offset=0
router.get('/feed', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const clips = await getClips({ limit, offset });
    res.json({ clips });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clips', details: err.message });
  }
});

// POST /api/clips/like (body: { id })
router.post('/like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing clip id' });
    await likeClip(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like clip', details: err.message });
  }
});

// POST /api/clips/submit (body: { url, platform, title, ... })
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { url, platform, title, creator, tags, cuisine, thumbnail } = req.body;
    if (!url || !platform) return res.status(400).json({ error: 'Missing url or platform' });
    // Simulate AI extraction (replace with real AI call)
    const fakeAI = {
      ai_ingredients: ['chicken', 'rice', 'soy sauce'],
      ai_recipe_name: 'Chicken Fried Rice',
      ai_steps: ['Cook rice', 'Fry chicken', 'Mix with rice and sauce'],
      ai_confidence: 0.92
    };
    const submitted_by = req.user?.id;
    const clip = await addClip({ url, platform, title, creator, tags, cuisine, thumbnail, ...fakeAI, submitted_by });
    res.json({ success: true, id: clip.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit clip', details: err.message });
  }
});

module.exports = router;
