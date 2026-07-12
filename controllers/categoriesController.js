const db = require("../config/db");

// GET /api/categories  (ikut jumlah produk per kategori, dipakai layar Kategori)
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        categories.*,
        COUNT(products.id) AS jumlah_produk
      FROM categories
      LEFT JOIN products ON products.category_id = categories.id
      GROUP BY categories.id
      ORDER BY categories.id ASC
    `);

    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ══════════════════════════════════════════════════════════
//  ADMIN ONLY (butuh token admin)
// ══════════════════════════════════════════════════════════

// POST /api/categories  (admin)
exports.createCategory = async (req, res) => {
  try {
    const { nama_kategori, ikon } = req.body;

    if (!nama_kategori) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const [result] = await db.query(
      "INSERT INTO categories (nama_kategori, ikon) VALUES (?, ?)",
      [nama_kategori, ikon || '🍩']
    );

    res.status(201).json({ message: "Kategori berhasil ditambahkan", id: result.insertId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/categories/:id  (admin)
exports.updateCategory = async (req, res) => {
  try {
    const { nama_kategori, ikon } = req.body;

    await db.query(
      "UPDATE categories SET nama_kategori = ?, ikon = ? WHERE id = ?",
      [nama_kategori, ikon || '🍩', req.params.id]
    );

    res.json({ message: "Kategori berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/categories/:id  (admin)
exports.deleteCategory = async (req, res) => {
  try {
    await db.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
