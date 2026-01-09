const sqlite3 = require("sqlite3").verbose();
const dbPath = process.env.DB_PATH || "./jobtracker.db";
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

db.serialize(() => {
  console.log("🔎 Vérification des doublons...");

  db.all(
    `SELECT company, position, appliedDate, COUNT(*) as count
     FROM jobs
     GROUP BY company, position, appliedDate
     HAVING count > 1`,
    (err, rows) => {
      if (err) throw err;
      console.log("Doublons trouvés :", rows.length);
      rows.forEach((r) => console.log(r));
    }
  );

  console.log("🗑️ Suppression des doublons...");
  db.run(
    `DELETE FROM jobs
     WHERE id NOT IN (
       SELECT MIN(id)
       FROM jobs
       GROUP BY company, position, appliedDate
     )`,
    function (err) {
      if (err) throw err;
      console.log(`✅ ${this.changes} doublons supprimés`);
    }
  );
});

db.close();
