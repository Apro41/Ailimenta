import React, { useEffect, useState } from 'react';

function RecipeCard({ recipe }) {
  return (
    <AnimatedCard className="p-4 flex flex-col gap-2 mb-6">
      <img src={recipe.image || 'https://source.unsplash.com/400x200/?food'} alt={recipe.title} className="rounded-lg object-cover h-40 w-full mb-2" />
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary">{recipe.title}</span>
        <span className="text-xs bg-primary-light text-white px-2 py-1 rounded-full">{recipe.cuisine}</span>
      </div>
      <div className="text-gray-600 text-sm line-clamp-2">{recipe.description}</div>
      <div className="flex gap-2 mt-2">
        <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#43a047' }} className="bg-primary text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-primary-dark">Add to Plan</motion.button>
        <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#ffd600', color: '#43a047' }} className="bg-accent text-primary px-4 py-2 rounded-full font-semibold shadow hover:bg-primary-light">Save</motion.button>
      </div>
    </AnimatedCard>
  );
}

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  useEffect(() => {
    fetch('/api/recipes/filter')
      .then(res => res.json())
      .then(data => setRecipes(data.recipes || []));
  }, []);
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Browse Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
      </div>
    </div>
  );
}
