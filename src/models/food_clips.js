const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../ailimenta.db');
const db = new sqlite3.Database(dbPath);

// Table for TikTok/Instagram-style food clips
const createTableSql = `CREATE TABLE IF NOT EXISTS food_clips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  platform TEXT,
  title TEXT,
  creator TEXT,
  tags TEXT,
  cuisine TEXT,
  thumbnail TEXT,
  ai_ingredients TEXT, -- JSON array
  ai_recipe_name TEXT,
  ai_steps TEXT, -- JSON array
  ai_confidence REAL,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  submitted_by INTEGER, -- user id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;
db.run(createTableSql);

function addClip({ url, platform, title, creator, tags, cuisine, thumbnail, ai_ingredients, ai_recipe_name, ai_steps, ai_confidence, submitted_by }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO food_clips (url, platform, title, creator, tags, cuisine, thumbnail, ai_ingredients, ai_recipe_name, ai_steps, ai_confidence, submitted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [url, platform, title, creator, tags, cuisine, thumbnail, JSON.stringify(ai_ingredients||[]), ai_recipe_name, JSON.stringify(ai_steps||[]), ai_confidence, submitted_by], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

function getClips({ limit = 10, offset = 0 } = {}) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM food_clips ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
      if (err) return reject(err);
      rows.forEach(row => {
        row.ai_ingredients = JSON.parse(row.ai_ingredients||'[]');
        row.ai_steps = JSON.parse(row.ai_steps||'[]');
      });
      resolve(rows);
    });
  });
}

function likeClip(id) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE food_clips SET likes = likes + 1 WHERE id = ?', [id], function(err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  db,
  addClip,
  getClips,
  likeClip
};
