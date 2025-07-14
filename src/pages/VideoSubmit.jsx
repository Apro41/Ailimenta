import React, { useState } from 'react';

export default function VideoSubmit() {
  const [url, setUrl] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    fetch('/api/clips/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' },
      body: JSON.stringify({ url, platform: url.includes('tiktok') ? 'tiktok' : 'instagram', title: 'User Clip' })
    })
      .then(res => res.json())
      .then(data => {
        setAiResult(data);
        setLoading(false);
      });
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Submit a Food Video</h1>
      <AnimatedCard className="p-6 flex flex-col gap-4">
        <input
          className="border border-primary-light rounded-full px-4 py-2 focus:outline-none"
          placeholder="Paste TikTok or Instagram URL..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        <motion.button type="submit" whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#43a047' }} className="bg-primary text-white px-4 py-2 rounded-full font-semibold hover:bg-primary-dark disabled:opacity-50" disabled={loading}>
          {loading ? 'Analyzing...' : 'Submit & Analyze'}
        </motion.button>
      </AnimatedCard>
      {aiResult && (
        <div className="bg-background rounded-xl shadow-card p-4 mt-6">
          <h2 className="text-lg font-bold text-primary mb-2">AI Recognized:</h2>
          <div className="mb-2">Ingredients: <span className="font-semibold">{aiResult.ai_ingredients?.join(', ')}</span></div>
          <div>Recipe: <span className="font-semibold">{aiResult.ai_recipe_name}</span></div>
        </div>
      )}
    </div>
  );
}
