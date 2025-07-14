import React, { useEffect, useState } from 'react';

function FoodClipCard({ clip }) {
  return (
    <AnimatedCard className="mb-8 overflow-hidden">
      <div className="relative">
        <video src={clip.url} controls autoPlay loop className="w-full h-72 object-cover" poster={clip.thumbnail} />
        {/* AI overlay */}
        <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="absolute left-2 top-2 bg-primary text-white px-3 py-1 rounded-full text-xs shadow">
          AI: {clip.ai_ingredients?.join(', ')}
        </motion.div>
        {clip.ai_recipe_name && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="absolute right-2 top-2 bg-accent text-primary px-3 py-1 rounded-full text-xs shadow">
            {clip.ai_recipe_name}
          </motion.div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">{clip.title}</span>
          <span className="text-xs text-gray-500">{clip.platform}</span>
        </div>
        <div className="flex gap-2 mt-2">
          <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#43a047' }} className="bg-primary-light text-white px-4 py-2 rounded-full font-semibold hover:bg-primary">Like ({clip.likes})</motion.button>
          <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#ffd600', color: '#43a047' }} className="bg-accent text-primary px-4 py-2 rounded-full font-semibold hover:bg-primary-light">Add to Plan</motion.button>
          <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#43a047', color: '#fff' }} className="bg-card border border-primary text-primary px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-white">Save</motion.button>
        </div>
      </div>
    </AnimatedCard>
  );
}

export default function Clips() {
  const [clips, setClips] = useState([]);
  useEffect(() => {
    fetch('/api/clips/feed?limit=10')
      .then(res => res.json())
      .then(data => setClips(data.clips || []));
  }, []);
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Food Clips Feed</h1>
      {clips.map(clip => <FoodClipCard key={clip.id} clip={clip} />)}
    </div>
  );
}
