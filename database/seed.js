const fs = require("fs");
const path = require("path");

async function seedDatabase(db) {
  try {
    const [rows] = await db.query("SHOW TABLES LIKE 'users'");
    if (rows.length > 0) {
      console.log("Database sudah ada, skip seed.");

      // Auto-migration: buat tabel notifications jika belum ada
      const [notifTable] = await db.query("SHOW TABLES LIKE 'notifications'");
      if (notifTable.length === 0) {
        console.log("Membuat tabel notifications...");
        await db.query(`
          CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            judul VARCHAR(100) NOT NULL,
            pesan TEXT NOT NULL,
            tipe ENUM('pesanan', 'promo', 'sistem') DEFAULT 'sistem',
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // Seed notifikasi contoh untuk user_id = 1
        const [existingUsers] = await db.query("SELECT id FROM users WHERE id = 1");
        if (existingUsers.length > 0) {
          const [existingNotifs] = await db.query(
            "SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = 1"
          );
          if (existingNotifs[0].cnt === 0) {
            await db.query(`
              INSERT INTO notifications (user_id, judul, pesan, tipe, is_read) VALUES
                (1, 'Selamat Datang di DonatKu! 🎉', 'Terima kasih telah bergabung. Nikmati berbagai donat lezat kami!', 'sistem', 0),
                (1, 'Promo Spesial! 🎉', 'Diskon 20% untuk semua donat Matcha! Berlaku hingga akhir bulan.', 'promo', 0),
                (1, 'Pesanan Dikirim! 📦', 'Pesanan #1 Anda sedang dalam perjalanan. Estimasi tiba 1-2 hari.', 'pesanan', 0)
            `);
          }
        }
        console.log("Tabel notifications berhasil dibuat!");
      }

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
