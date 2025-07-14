import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MealPlans from './pages/MealPlans';
import Recipes from './pages/Recipes';
import Grocery from './pages/Grocery';
import Clips from './pages/Clips';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans">
        {/* NavBar */}
        <nav className="flex items-center justify-between px-8 py-4 bg-primary text-white shadow-md">
          <div className="text-2xl font-bold tracking-tight">AIlimenta</div>
          <div className="flex gap-6 text-lg">
            <Link to="/dashboard" className="hover:text-accent transition">Dashboard</Link>
            <Link to="/mealplans" className="hover:text-accent transition">Meal Plans</Link>
            <Link to="/recipes" className="hover:text-accent transition">Recipes</Link>
            <Link to="/grocery" className="hover:text-accent transition">Grocery</Link>
            <Link to="/clips" className="hover:text-accent transition">Food Clips</Link>
            <Link to="/profile" className="hover:text-accent transition">Profile</Link>
          </div>
        </nav>
        {/* Main content */}
        <main className="max-w-6xl mx-auto py-8 px-4">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mealplans" element={<MealPlans />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/grocery" element={<Grocery />} />
            <Route path="/clips" element={<Clips />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
