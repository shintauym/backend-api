const fs = require("fs");
const path = require("path");

async function seedDatabase(db) {
  try {
    const [rows] = await db.query("SHOW TABLES LIKE 'users'");
    if (rows.length > 0) {
      console.log("Database sudah ada, skip seed.");
      return;
    }

    console.log("Database kosong, menjalankan schema.sql...");
    const sql = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );

    const statements = sql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await db.query(stmt);
    }

    console.log("Schema + seed data berhasil diimport!");
  } catch (err) {
    console.error("Gagal seed database:", err.message);
  }
}

module.exports = seedDatabase;
