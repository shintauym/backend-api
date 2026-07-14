const db = require("../config/db");

// GET /api/admin/orders?status=  (semua pesanan, bisa difilter status)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT
        orders.*,
        users.nama AS nama_pelanggan,
        users.no_telp AS telp_pelanggan
      FROM orders
      JOIN users ON users.id = orders.user_id
      WHERE 1 = 1
    `;
    const params = [];

    if (status) {
      sql += " AND orders.status = ?";
      params.push(status);
    }

    sql += " ORDER BY orders.created_at DESC";

    const [orders] = await db.query(sql, params);
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/admin/orders/:id  (detail + item + info pelanggan)
exports.getOrderById = async (req, res) => {
  try {
    const [[order]] = await db.query(
      `SELECT orders.*, users.nama AS nama_pelanggan, users.no_telp AS telp_pelanggan, users.email AS email_pelanggan
       FROM orders
       JOIN users ON users.id = orders.user_id
       WHERE orders.id = ?`,
      [req.params.id]
    );

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const [items] = await db.query("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);

    res.json({ ...order, items });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/admin/orders/:id/status  { status, no_resi }
const STATUS_VALID = ["Diproses", "Dikirim", "Selesai", "Dibatalkan"];

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, no_resi } = req.body;

    if (!STATUS_VALID.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    await db.query(
      "UPDATE orders SET status = ?, no_resi = COALESCE(?, no_resi) WHERE id = ?",
      [status, no_resi || null, req.params.id]
    );

    res.json({ message: "Status pesanan berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
