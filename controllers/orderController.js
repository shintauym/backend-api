const db = require("../config/db");

const ONGKIR_OPTIONS = {
  reguler: 10000,
  ekspres: 20000,
  "same-day": 30000,
};

// POST /api/orders  { address_id, metode_bayar, ongkir_option }
// Membuat pesanan dari isi keranjang milik user yang sedang login.
exports.createOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { address_id, metode_bayar, ongkir_option } = req.body;

    if (!metode_bayar) {
      conn.release();
      return res.status(400).json({ message: "Metode pembayaran wajib dipilih" });
    }

    const [cartItems] = await conn.query(
      `SELECT cart_items.qty, products.id AS product_id, products.nama_produk, products.harga
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      conn.release();
      return res.status(400).json({ message: "Keranjang masih kosong" });
    }

    let alamatSnapshot = null;
    if (address_id) {
      const [[addr]] = await conn.query(
        "SELECT detail, label FROM addresses WHERE id = ? AND user_id = ?",
        [address_id, req.user.id]
      );
      if (addr) alamatSnapshot = `${addr.label} - ${addr.detail}`;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.harga * item.qty, 0);
    const ongkir = ONGKIR_OPTIONS[ongkir_option] ?? ONGKIR_OPTIONS.reguler;
    const total = subtotal + ongkir;

    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, address_id, alamat_snapshot, metode_bayar, subtotal, ongkir, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Diproses')`,
      [req.user.id, address_id || null, alamatSnapshot, metode_bayar, subtotal, ongkir, total]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, nama_produk, harga, qty) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.product_id, item.nama_produk, item.harga, item.qty]
      );
    }

    await conn.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);

    await conn.commit();
    conn.release();

    res.status(201).json({ message: "Pesanan berhasil dibuat", order_id: orderId, total });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/orders  (semua pesanan milik user, terbaru dulu)
exports.getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/orders/:id  (detail + item pesanan)
exports.getOrderById = async (req, res) => {
  try {
    const [[order]] = await db.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [req.params.id]
    );

    res.json({ ...order, items });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    await db.query(
      "UPDATE orders SET status = 'Dibatalkan' WHERE id = ? AND user_id = ? AND status = 'Diproses'",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Pesanan dibatalkan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
