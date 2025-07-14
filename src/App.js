import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Dashboard, MealPlans, Recipes, Grocery, Clips, Profile, VideoSubmit } from './pages';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/meal-plans', label: 'Meal Planner' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/grocery', label: 'Grocery Compare' },
  { to: '/clips', label: 'Food Clips' },
  { to: '/video-submit', label: 'Submit Video' },
  { to: '/profile', label: 'Profile' }
];

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans">
        <nav className="bg-white shadow sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-primary tracking-tight">AIlimenta</span>
            <div className="flex gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 rounded-full font-semibold text-primary hover:bg-primary-light hover:text-white transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meal-plans" element={<MealPlans />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/grocery" element={<Grocery />} />
            <Route path="/clips" element={<Clips />} />
            <Route path="/video-submit" element={<VideoSubmit />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
