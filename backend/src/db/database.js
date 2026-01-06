const sqlite3 = require("sqlite3").verbose();

const dbPath = process.env.DB_PATH || "./jobtracker.db";
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

module.exports = db;

db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        status TEXT NOT NULL,
        appliedDate TEXT NOT NULL,

        hasFollowedUp INTEGER DEFAULT 0,
        canFollowUp INTEGER DEFAULT 1,
        followUpDate TEXT,

        isInteresting INTEGER DEFAULT 0,
        jobLink TEXT,

        notes TEXT,

        updatedAt TEXT
    );
`);

module.exports = db;
