import React from 'react';

export default function Profile() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Profile & Settings</h1>
      <AnimatedCard className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center text-3xl text-white font-bold">A</div>
          <div>
            <div className="text-xl font-bold text-primary">Alex Green</div>
            <div className="text-gray-600">alex@email.com</div>
          </div>
        </div>
        <div>
          <label className="block text-primary font-semibold mb-2">Dietary Preferences</label>
          <input className="w-full border border-primary-light rounded-full px-4 py-2 focus:outline-none" placeholder="e.g. Vegetarian, Gluten-Free" />
        </div>
        <div>
          <label className="block text-primary font-semibold mb-2">Saved Recipes</label>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Quinoa Avocado Salad</li>
            <li>Spaghetti Carbonara</li>
          </ul>
        </div>
        <div>
          <label className="block text-primary font-semibold mb-2">Saved Grocery Lists</label>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Weekly Staples</li>
            <li>Vegan Week</li>
          </ul>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <span className="font-semibold text-primary">Theme:</span>
          <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#43a047' }} className="bg-primary text-white px-4 py-2 rounded-full font-semibold hover:bg-primary-dark">Green</motion.button>
          <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#fffde7', color: '#43a047' }} className="bg-card border border-primary text-primary px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-white">Light</motion.button>
          <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#1b5e20', color: '#fff' }} className="bg-primary-dark text-white px-4 py-2 rounded-full font-semibold hover:bg-primary">Dark</motion.button>
        </div>
      </AnimatedCard>
    </div>
  );
}
