const express = require('express');
const jwt = require('jsonwebtoken');
const { getPurchasesByUser, getAllPurchases } = require('../models/grocery_purchase');
const { db } = require('../models/grocery_product');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// JWT middleware
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

// Utility: aggregate purchases
function aggregatePurchases(purchases) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  let week = 0, month = 0, all = 0;
  let trips = 0;
  const storeBreakdown = {};
  const categoryBreakdown = {};
  const trend = [];
  const byDate = {};
  purchases.forEach(p => {
    const date = new Date(p.purchase_date);
    all += p.total || 0;
    if (date >= weekAgo) week += p.total || 0;
    if (date >= monthAgo) month += p.total || 0;
    trips++;
    // Store breakdown
    if (p.store) storeBreakdown[p.store] = (storeBreakdown[p.store] || 0) + (p.total || 0);
    // Category breakdown (by item category if available)
    (p.items || []).forEach(item => {
      const cat = item.category || 'other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (item.price || 0);
    });
    // Trend (by week)
    const weekKey = date.toISOString().slice(0,10);
    byDate[weekKey] = (byDate[weekKey] || 0) + (p.total || 0);
  });
  // Build trend array for last 12 weeks
  let trendArr = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i*7*24*60*60*1000);
    const key = d.toISOString().slice(0,10);
    trendArr.push(byDate[key] || 0);
  }
  return { week, month, all, trips, storeBreakdown, categoryBreakdown, trend: trendArr };
}

// GET /api/dashboard/metrics
router.get('/metrics', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;
    const userPurchases = await getPurchasesByUser(user_id);
    const allPurchases = await getAllPurchases();
    // Aggregate user metrics
    const userAgg = aggregatePurchases(userPurchases);
    // Aggregate all users (for comparison)
    const allAgg = aggregatePurchases(allPurchases);
    // Percentile
    const allWeekly = allPurchases.map(p => p.total || 0);
    const userWeekly = userAgg.week;
    const percentile = allWeekly.length ? (100 * allWeekly.filter(x => x < userWeekly).length / allWeekly.length) : null;
    // City/province average (if location available)
    const city = userPurchases[0]?.location || null;
    const cityPurchases = city ? allPurchases.filter(p => p.location === city) : [];
    const cityAvg = cityPurchases.length ? (cityPurchases.reduce((sum, p) => sum + (p.total || 0), 0) / cityPurchases.length) : null;
    // Top stores
    const topStores = Object.entries(allAgg.storeBreakdown).sort((a,b) => b[1]-a[1]).slice(0,3).map(x => x[0]);
    // Price metrics: volatility, best deal, inflation tracker (simple)
    // Example: price change for milk, eggs, bread
    const trackedItems = ['milk','eggs','bread'];
    const priceMetrics = {};
    for (const item of trackedItems) {
      const rows = await new Promise((resolve, reject) => {
        db.all('SELECT price, last_updated FROM grocery_products WHERE LOWER(name) LIKE ? ORDER BY last_updated DESC LIMIT 10', [`%${item}%`], (err, r) => {
          if (err) return resolve([]);
          resolve(r);
        });
      });
      if (rows.length > 1) {
        const current = rows[0].price;
        const oldest = rows[rows.length-1].price;
        const change = oldest ? ((current-oldest)/oldest*100).toFixed(1) : null;
        priceMetrics[item] = { change: (change ? (change>0?'+':'')+change+'%' : null), lowest: Math.min(...rows.map(r=>r.price)), current };
      }
    }
    // Savings (vs. city avg)
    const savings = cityAvg ? (cityAvg - userAgg.week) : null;
    // Suggestions (dummy for now)
    const suggestions = [];
    if (userAgg.storeBreakdown['walmart'] && userAgg.storeBreakdown['loblaws'] && userAgg.storeBreakdown['walmart'] < userAgg.storeBreakdown['loblaws']) {
      suggestions.push('You save more by shopping at Walmart than Loblaws!');
    }
    if (userAgg.categoryBreakdown['produce'] && userAgg.categoryBreakdown['produce'] > 0.3 * userAgg.all) {
      suggestions.push('You buy more fresh produce than average—great for your health!');
    }
    // Eco score (dummy)
    const ecoScore = userAgg.categoryBreakdown['produce'] > 0.4 * userAgg.all ? 'above average' : 'average';
    res.json({
      userSpend: { week: userAgg.week, month: userAgg.month, trend: userAgg.trend },
      storeBreakdown: userAgg.storeBreakdown,
      categoryBreakdown: userAgg.categoryBreakdown,
      percentile,
      cityAverage: cityAvg,
      topStores,
      priceMetrics,
      savings,
      suggestions,
      ecoScore
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dashboard metrics', details: err.message });
  }
});

module.exports = router;
