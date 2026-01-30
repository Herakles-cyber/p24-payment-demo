const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

async function initDb() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      paidAt TEXT
    );
  `);

  return db;
}

module.exports = { initDb };
