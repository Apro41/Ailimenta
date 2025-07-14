import React from 'react';

export default function MealPlans() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Meal Planner</h1>
      <AnimatedCard className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-primary">This Week's Plan</span>
          <motion.button
            whileTap={{ scale: 0.92, backgroundColor: '#43a047', color: '#fff' }}
            whileHover={{ scale: 1.05, backgroundColor: '#66bb6a', color: '#fff' }}
            className="bg-accent text-primary px-4 py-2 rounded-full font-semibold shadow hover:bg-primary hover:text-white transition"
            style={{ boxShadow: '0 2px 10px 0 rgba(102,187,106,0.10)' }}
          >AI Generate Plan</motion.button>
        </div>
        {/* Animated calendar grid */}
        <motion.div className="grid grid-cols-7 gap-2"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => (
            <motion.div key={day}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.04, boxShadow: '0 4px 16px 0 #66bb6a33' }}
              className="flex flex-col items-center gap-2 bg-background rounded-lg p-2 min-h-[120px] shadow-sm"
            >
              <span className="font-bold text-primary-light">{day}</span>
              <motion.div whileTap={{ scale: 0.88 }} className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-xl shadow">
                🍲
              </motion.div>
              <motion.button className="text-xs text-primary underline hover:text-accent mt-2" whileTap={{ scale: 0.92, color: '#ffd600' }}>
                Swap Meal
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedCard>
      {/* Upcoming plans/recipes */}
      <div className="bg-card rounded-xl shadow-card p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Upcoming Recipes</h2>
        <ul className="divide-y divide-primary-light">
          <li className="py-2 flex items-center gap-4">
            <span className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-white text-lg">🥗</span>
            <span className="font-semibold">Quinoa Avocado Salad</span>
            <button className="ml-auto bg-primary text-white px-4 py-1 rounded-full hover:bg-primary-dark">View</button>
          </li>
          <li className="py-2 flex items-center gap-4">
            <span className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-white text-lg">🍝</span>
            <span className="font-semibold">Spaghetti Carbonara</span>
            <button className="ml-auto bg-primary text-white px-4 py-1 rounded-full hover:bg-primary-dark">View</button>
          </li>
        </ul>
      </div>
    </div>
  );
}
