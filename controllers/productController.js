const db = require("../config/db");

// GET /api/products?category_id=&q=
exports.getAllProducts = async (req, res) => {
  try {
    const { category_id, q } = req.query;

    let sql = `
      SELECT
        products.*,
        categories.nama_kategori
      FROM products
      LEFT JOIN categories
      ON products.category_id = categories.id
      WHERE 1 = 1
    `;
    const params = [];

    if (category_id) {
      sql += " AND products.category_id = ?";
      params.push(category_id);
    }

    if (q) {
      sql += " AND products.nama_produk LIKE ?";
      params.push(`%${q}%`);
    }

    sql += " ORDER BY products.id ASC";

    const [products] = await db.query(sql, params);

    res.json(products);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT products.*, categories.nama_kategori
       FROM products
       LEFT JOIN categories ON products.category_id = categories.id
       WHERE products.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};