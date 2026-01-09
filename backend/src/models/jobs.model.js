const db = require("../db/database");

const JobModel = {
  getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM jobs ORDER BY appliedDate DESC",
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  },

  getJobById: (id) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM jobs WHERE id = ?", [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  create(job) {
    const {
      company,
      position,
      status,
      appliedDate,
      notes,
      hasFollowedUp = 0,
      canFollowUp = 1,
      followUpDate = null,
      isInteresting = 0,
      jobLink = null,
    } = job;

    const updatedAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO jobs 
          (company, position, status, appliedDate, notes, hasFollowedUp, canFollowUp, followUpDate, isInteresting, jobLink, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company,
          position,
          status,
          appliedDate,
          notes,
          hasFollowedUp,
          canFollowUp,
          followUpDate,
          isInteresting,
          jobLink,
          updatedAt,
        ],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  },

  createMany(jobs) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        `INSERT INTO jobs 
      (company, position, status, appliedDate, notes, hasFollowedUp, canFollowUp, followUpDate, isInteresting, jobLink, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        try {
          for (const job of jobs) {
            const updatedAt = new Date().toISOString();

            stmt.run([
              job.company || "Inconnue",
              job.position || "Poste inconnu",
              job.status || "Postulé",
              job.appliedDate || null,
              job.notes || "",
              job.hasFollowedUp ?? 0,
              job.canFollowUp ?? 1,
              job.followUpDate ?? null,
              job.isInteresting ?? 2,
              job.jobLink ?? null,
              updatedAt,
            ]);
          }

          db.run("COMMIT");
          stmt.finalize();
          resolve();
        } catch (err) {
          db.run("ROLLBACK");
          reject(err);
        }
      });
    });
  },

  update(id, job) {
    const {
      company,
      position,
      status,
      appliedDate,
      notes,
      hasFollowedUp,
      canFollowUp,
      followUpDate,
      isInteresting,
      jobLink,
    } = job;

    const updatedAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE jobs
         SET company=?, position=?, status=?, appliedDate=?, notes=?, 
             hasFollowedUp=?, canFollowUp=?, followUpDate=?, isInteresting=?, jobLink=?, updatedAt=?
         WHERE id=?`,
        [
          company,
          position,
          status,
          appliedDate,
          notes,
          hasFollowedUp,
          canFollowUp,
          followUpDate,
          isInteresting,
          jobLink,
          updatedAt,
          id,
        ],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM jobs WHERE id=?`, [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  },
};

module.exports = JobModel;
