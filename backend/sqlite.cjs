const { DatabaseSync } = require("node:sqlite");
const { HttpError } = require("./inquiries.cjs");
function openStore(path) {
  const db = new DatabaseSync(path);
  db.exec(
    "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL, notification TEXT NOT NULL DEFAULT 'pending'); CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY,count INTEGER NOT NULL, created_at TEXT NOT NULL);",
  );
  return {
    accept(record) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const previous = db
          .prepare("SELECT id,fingerprint FROM inquiries WHERE request_key=?")
          .get(record.key);
        if (previous) {
          if (previous.fingerprint !== record.fingerprint)
            throw new HttpError(
              409,
              "This request changed. Please submit it again.",
            );
          db.exec("COMMIT");
          return { id: previous.id, duplicate: true };
        }
        const rate = db
          .prepare("SELECT count FROM rate_limits WHERE key=?")
          .get(record.rateKey);
        if (rate?.count >= 5)
          throw new HttpError(
            429,
            "Too many inquiries. Please try again later or contact us on WhatsApp.",
          );
        db.prepare(
          "INSERT INTO rate_limits(key,count,created_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
        ).run(record.rateKey, record.createdAt);
        db.prepare(
          "INSERT INTO inquiries(id,request_key,fingerprint,data,created_at) VALUES(?,?,?,?,?)",
        ).run(
          record.id,
          record.key,
          record.fingerprint,
          JSON.stringify(record.data),
          record.createdAt,
        );
        db.prepare("DELETE FROM rate_limits WHERE created_at < ?").run(
          new Date(Date.parse(record.createdAt) - 172800000).toISOString(),
        );
        db.exec("COMMIT");
        return { id: record.id, duplicate: false };
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
    list() {
      return db
        .prepare(
          "SELECT id,data,created_at,notification FROM inquiries ORDER BY created_at DESC LIMIT 200",
        )
        .all()
        .map((r) => ({ ...r, data: JSON.parse(r.data) }));
    },
    markNotified(id, status) {
      db.prepare("UPDATE inquiries SET notification=? WHERE id=?").run(
        status,
        id,
      );
    },
    close() {
      db.close();
    },
  };
}
module.exports = { openStore };
