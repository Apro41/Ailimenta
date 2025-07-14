require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getMealRecommendations(userPreferences) {
  const prompt = `You are a meal planning assistant. Suggest 3 personalized dinner recipes based on these preferences: ${JSON.stringify(userPreferences)}. Each recipe should include a title, short description, and a list of ingredients.`;
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful meal planning assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
  });
  return response.choices[0].message.content;
}

module.exports = { getMealRecommendations };
