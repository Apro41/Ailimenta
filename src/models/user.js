const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../ailimenta.db');
const db = new sqlite3.Database(dbPath);

// Create users table if it doesn't exist
const createTableSql = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  dietary_preferences TEXT DEFAULT '[]',
  allergies TEXT DEFAULT '[]',
  budget TEXT,
  cuisine_preferences TEXT DEFAULT '[]',
  sustainability_preferences TEXT DEFAULT '[]'
)`;
db.run(createTableSql);

async function createUser({ email, password, name }) {
  const password_hash = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`;
    db.run(sql, [email, password_hash, name], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, email, name });
    });
  });
}

function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function findUserById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function updateUserPreferences(id, prefs) {
  const {
    dietary_preferences = [],
    allergies = [],
    budget = '',
    cuisine_preferences = [],
    sustainability_preferences = []
  } = prefs;
  return new Promise((resolve, reject) => {
    const sql = `UPDATE users SET dietary_preferences = ?, allergies = ?, budget = ?, cuisine_preferences = ?, sustainability_preferences = ? WHERE id = ?`;
    db.run(sql, [
      JSON.stringify(dietary_preferences),
      JSON.stringify(allergies),
      budget,
      JSON.stringify(cuisine_preferences),
      JSON.stringify(sustainability_preferences),
      id
    ], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPreferences,
  db
};
