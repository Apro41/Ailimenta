const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../ailimenta.db');
const db = new sqlite3.Database(dbPath);

// Create recipes table if it doesn't exist
const createTableSql = `CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT DEFAULT '[]',
  steps TEXT DEFAULT '[]',
  cuisine TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`;
db.run(createTableSql);

function createRecipe({ user_id, title, description, ingredients, steps, cuisine }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO recipes (user_id, title, description, ingredients, steps, cuisine) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [user_id, title, description, JSON.stringify(ingredients), JSON.stringify(steps), cuisine], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, user_id, title, description, ingredients, steps, cuisine });
    });
  });
}

function getRecipeById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      // Parse JSON fields
      row.ingredients = JSON.parse(row.ingredients || '[]');
      row.steps = JSON.parse(row.steps || '[]');
      resolve(row);
    });
  });
}

function getRecipesByUser(user_id) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM recipes WHERE user_id = ?', [user_id], (err, rows) => {
      if (err) return reject(err);
      rows.forEach(row => {
        row.ingredients = JSON.parse(row.ingredients || '[]');
        row.steps = JSON.parse(row.steps || '[]');
      });
      resolve(rows);
    });
  });
}

function updateRecipe(id, { title, description, ingredients, steps, cuisine }) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE recipes SET title = ?, description = ?, ingredients = ?, steps = ?, cuisine = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(sql, [title, description, JSON.stringify(ingredients), JSON.stringify(steps), cuisine, id], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function deleteRecipe(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM recipes WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  createRecipe,
  getRecipeById,
  getRecipesByUser,
  updateRecipe,
  deleteRecipe,
  db
};
