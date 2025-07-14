const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../ailimenta.db');
const db = new sqlite3.Database(dbPath);

// Table to log user grocery purchases (real or planned)
const createTableSql = `CREATE TABLE IF NOT EXISTS grocery_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  store TEXT,
  location TEXT,
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  items TEXT, -- JSON array: [{name, quantity, unit, price, product_id}]
  total REAL,
  source TEXT, -- e.g. 'planned', 'actual', 'imported'
  FOREIGN KEY(user_id) REFERENCES users(id)
)`;
db.run(createTableSql);

function logPurchase({ user_id, store, location, purchase_date, items, total, source }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO grocery_purchases (user_id, store, location, purchase_date, items, total, source) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [user_id, store, location, purchase_date, JSON.stringify(items), total, source], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

function getPurchasesByUser(user_id) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM grocery_purchases WHERE user_id = ?', [user_id], (err, rows) => {
      if (err) return reject(err);
      rows.forEach(row => {
        row.items = JSON.parse(row.items || '[]');
      });
      resolve(rows);
    });
  });
}

function getAllPurchases() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM grocery_purchases', [], (err, rows) => {
      if (err) return reject(err);
      rows.forEach(row => {
        row.items = JSON.parse(row.items || '[]');
      });
      resolve(rows);
    });
  });
}

module.exports = {
  logPurchase,
  getPurchasesByUser,
  getAllPurchases,
  db
};
