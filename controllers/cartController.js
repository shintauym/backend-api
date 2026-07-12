const db = require("../config/db");

// GET /api/cart  (butuh token)
exports.getCart = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        cart_items.id AS cart_item_id,
        cart_items.qty,
        products.id AS product_id,
        products.nama_produk,
        products.harga,
        products.emoji,
        products.gambar,
        products.stok
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.user_id = ?
       ORDER BY cart_items.id ASC`,
      [req.user.id]
    );

    const subtotal = rows.reduce((sum, item) => sum + item.harga * item.qty, 0);

    res.json({ items: rows, subtotal });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/cart  { product_id, qty }  (butuh token)
exports.addToCart = async (req, res) => {
  try {
    const { product_id, qty } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "product_id wajib diisi" });
    }

    const jumlah = qty && qty > 0 ? qty : 1;

    // Kalau produk sudah ada di keranjang, tambahkan qty-nya
    await db.query(
      `INSERT INTO cart_items (user_id, product_id, qty)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)`,
      [req.user.id, product_id, jumlah]
    );

    res.status(201).json({ message: "Produk ditambahkan ke keranjang" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/cart/:cartItemId  { qty }  (butuh token)
exports.updateCartItem = async (req, res) => {
  try {
    const { qty } = req.body;

    if (!qty || qty < 1) {
      // qty 0 atau kurang -> hapus item
      await db.query(
        "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
        [req.params.cartItemId, req.user.id]
      );
      return res.json({ message: "Item dihapus dari keranjang" });
    }

    await db.query(
      "UPDATE cart_items SET qty = ? WHERE id = ? AND user_id = ?",
      [qty, req.params.cartItemId, req.user.id]
    );

    res.json({ message: "Keranjang diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/cart/:cartItemId  (butuh token)
exports.removeCartItem = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [req.params.cartItemId, req.user.id]
    );

    res.json({ message: "Item dihapus dari keranjang" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/cart  (kosongkan keranjang, dipakai setelah checkout berhasil)
exports.clearCart = async (req, res) => {
  try {
    await db.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    res.json({ message: "Keranjang dikosongkan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
