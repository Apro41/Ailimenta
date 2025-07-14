const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../ailimenta.db');
const db = new sqlite3.Database(dbPath);

// Create meal_plans table if it doesn't exist
const createTableSql = `CREATE TABLE IF NOT EXISTS meal_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  recipe_ids TEXT DEFAULT '[]',
  start_date TEXT,
  end_date TEXT,
  schedule_type TEXT DEFAULT 'weekly',
  schedule TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`;
db.run(createTableSql);

function createMealPlan({ user_id, title, description, recipe_ids, start_date, end_date, schedule_type = 'weekly', schedule = {} }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO meal_plans (user_id, title, description, recipe_ids, start_date, end_date, schedule_type, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [user_id, title, description, JSON.stringify(recipe_ids), start_date, end_date, schedule_type, JSON.stringify(schedule)], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, user_id, title, description, recipe_ids, start_date, end_date, schedule_type, schedule });
    });
  });
}

function getMealPlanById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM meal_plans WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      row.recipe_ids = JSON.parse(row.recipe_ids || '[]');
      row.schedule = JSON.parse(row.schedule || '{}');
      resolve(row);
    });
  });
}

function getMealPlansByUser(user_id) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM meal_plans WHERE user_id = ?', [user_id], (err, rows) => {
      if (err) return reject(err);
      rows.forEach(row => {
        row.recipe_ids = JSON.parse(row.recipe_ids || '[]');
        row.schedule = JSON.parse(row.schedule || '{}');
      });
      resolve(rows);
    });
  });
}

function updateMealPlan(id, { title, description, recipe_ids, start_date, end_date, schedule_type, schedule }) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE meal_plans SET title = ?, description = ?, recipe_ids = ?, start_date = ?, end_date = ?, schedule_type = ?, schedule = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(sql, [title, description, JSON.stringify(recipe_ids), start_date, end_date, schedule_type, JSON.stringify(schedule), id], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function deleteMealPlan(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM meal_plans WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  createMealPlan,
  getMealPlanById,
  getMealPlansByUser,
  updateMealPlan,
  deleteMealPlan,
  db
};
