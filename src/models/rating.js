const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../ailimenta.db');
const db = new sqlite3.Database(dbPath);

// Create ratings table if it doesn't exist
const createTableSql = `CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recipe_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(recipe_id) REFERENCES recipes(id)
)`;
db.run(createTableSql);

function rateRecipe({ user_id, recipe_id, rating, comment }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO ratings (user_id, recipe_id, rating, comment) VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, recipe_id) DO UPDATE SET rating = excluded.rating, comment = excluded.comment`;
    db.run(sql, [user_id, recipe_id, rating, comment], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function getRecipeRatings(recipe_id) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM ratings WHERE recipe_id = ?', [recipe_id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getAverageRating(recipe_id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT AVG(rating) as avg FROM ratings WHERE recipe_id = ?', [recipe_id], (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.avg : null);
    });
  });
}

function getTopRatedRecipes(limit = 5) {
  return new Promise((resolve, reject) => {
    db.all('SELECT recipe_id, AVG(rating) as avg_rating, COUNT(*) as count FROM ratings GROUP BY recipe_id ORDER BY avg_rating DESC, count DESC LIMIT ?', [limit], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  rateRecipe,
  getRecipeRatings,
  getAverageRating,
  getTopRatedRecipes,
  db
};
