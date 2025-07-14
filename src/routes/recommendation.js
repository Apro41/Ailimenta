const express = require('express');
const router = express.Router();
const { getMealRecommendations } = require('../groc');

// POST /api/recommend
router.post('/', async (req, res) => {
  const { dietary_preferences = [], allergies = [], budget = '', cuisine_preferences = [] } = req.body;
  const prompt = `Create a personalized recipe based on:\n- Dietary preferences: ${dietary_preferences.join(', ')}\n- Allergies: ${allergies.join(', ')}\n- Budget: ${budget}\n- Cuisine preferences: ${cuisine_preferences.join(', ')}`;

  const payload = {
    model: 'llama3-70b-8192',
    messages: [
      {
        role: 'system',
        content: 'You are a culinary assistant that creates smart, healthy, and personalized recipes.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  };

  console.log('Sending to Groq:', payload);

  try {
    const { getMealRecommendations } = require('../groc');
    const recommendations = await getMealRecommendations({ dietary_preferences, allergies, budget, cuisine_preferences, prompt, payload });
    res.json({ recommendations });
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get recommendations', details: error.response?.data || error.message });
  }
});

module.exports = router;
