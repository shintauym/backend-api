const db = require("../config/db");

// GET /api/addresses
exports.getAddresses = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/addresses  { label, detail }
exports.createAddress = async (req, res) => {
  try {
    const { label, detail } = req.body;

    if (!label || !detail) {
      return res.status(400).json({ message: "Label dan detail alamat wajib diisi" });
    }

    // Alamat pertama otomatis jadi utama
    const [[{ jumlah }]] = await db.query(
      "SELECT COUNT(*) AS jumlah FROM addresses WHERE user_id = ?",
      [req.user.id]
    );
    const isDefault = jumlah === 0 ? 1 : 0;

    const [result] = await db.query(
      "INSERT INTO addresses (user_id, label, detail, is_default) VALUES (?, ?, ?, ?)",
      [req.user.id, label, detail, isDefault]
    );

    res.status(201).json({ message: "Alamat berhasil ditambahkan", id: result.insertId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/addresses/:id  { label, detail }
exports.updateAddress = async (req, res) => {
  try {
    const { label, detail } = req.body;

    await db.query(
      "UPDATE addresses SET label = ?, detail = ? WHERE id = ? AND user_id = ?",
      [label, detail, req.params.id, req.user.id]
    );

    res.json({ message: "Alamat berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/addresses/:id/default
exports.setDefaultAddress = async (req, res) => {
  try {
    await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [req.user.id]);
    await db.query(
      "UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    res.json({ message: "Alamat utama diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/addresses/:id
exports.deleteAddress = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM addresses WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Alamat berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
