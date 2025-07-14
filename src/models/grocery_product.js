const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../ailimenta.db');
const db = new sqlite3.Database(dbPath);

// Unified grocery product table
const createTableSql = `CREATE TABLE IF NOT EXISTS grocery_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store TEXT NOT NULL,
  product_id TEXT,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price REAL,
  unit TEXT,
  stock INTEGER,
  availability TEXT,
  location TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  product_url TEXT,
  image_url TEXT
)`;
db.run(createTableSql);

function upsertGroceryProduct(product) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO grocery_products (store, product_id, name, brand, category, price, unit, stock, availability, location, last_updated, product_url, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
      ON CONFLICT(store, product_id, location) DO UPDATE SET
        name=excluded.name, brand=excluded.brand, category=excluded.category, price=excluded.price, unit=excluded.unit, stock=excluded.stock, availability=excluded.availability, last_updated=CURRENT_TIMESTAMP, product_url=excluded.product_url, image_url=excluded.image_url`;
    db.run(sql, [product.store, product.product_id, product.name, product.brand, product.category, product.price, product.unit, product.stock, product.availability, product.location, product.product_url, product.image_url], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function getGroceryProducts({ store, location, search }) {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM grocery_products WHERE 1=1';
    const params = [];
    if (store) {
      sql += ' AND store = ?';
      params.push(store);
    }
    if (location) {
      sql += ' AND location = ?';
      params.push(location);
    }
    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s);
    }
    sql += ' ORDER BY last_updated DESC';
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  upsertGroceryProduct,
  getGroceryProducts,
  db
};
