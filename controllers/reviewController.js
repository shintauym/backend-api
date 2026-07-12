const db = require("../config/db");

// GET /api/reviews/me  (ulasan milik user yang login)
exports.getMyReviews = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        reviews.*,
        products.nama_produk,
        products.emoji
       FROM reviews
       JOIN products ON products.id = reviews.product_id
       WHERE reviews.user_id = ?
       ORDER BY reviews.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/reviews/product/:productId  (ulasan publik untuk 1 produk)
exports.getProductReviews = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT reviews.*, users.nama
       FROM reviews
       JOIN users ON users.id = reviews.user_id
       WHERE reviews.product_id = ?
       ORDER BY reviews.created_at DESC`,
      [req.params.productId]
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/reviews  { product_id, order_id, rating, komentar }
exports.createReview = async (req, res) => {
  try {
    const { product_id, order_id, rating, komentar } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ message: "product_id dan rating wajib diisi" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating harus antara 1-5" });
    }

    const [result] = await db.query(
      "INSERT INTO reviews (user_id, product_id, order_id, rating, komentar) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, product_id, order_id || null, rating, komentar || null]
    );

    res.status(201).json({ message: "Ulasan berhasil dikirim", id: result.insertId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/reviews/:id  { rating, komentar }
exports.updateReview = async (req, res) => {
  try {
    const { rating, komentar } = req.body;

    await db.query(
      "UPDATE reviews SET rating = ?, komentar = ? WHERE id = ? AND user_id = ?",
      [rating, komentar, req.params.id, req.user.id]
    );

    res.json({ message: "Ulasan berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
