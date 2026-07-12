const db = require("../config/db");

// GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        wishlist.id AS wishlist_id,
        products.*
       FROM wishlist
       JOIN products ON products.id = wishlist.product_id
       WHERE wishlist.user_id = ?
       ORDER BY wishlist.id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/wishlist  { product_id }
exports.addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "product_id wajib diisi" });
    }

    await db.query(
      "INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [req.user.id, product_id]
    );

    res.status(201).json({ message: "Produk ditambahkan ke wishlist" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [req.user.id, req.params.productId]
    );
    res.json({ message: "Produk dihapus dari wishlist" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
