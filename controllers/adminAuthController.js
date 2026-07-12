const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/jwtSecret");

// POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const [rows] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Email admin tidak ditemukan" });
    }

    const admin = rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { admin: { id: admin.id, nama: admin.nama, email: admin.email } },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login admin berhasil",
      token,
      admin: { id: admin.id, nama: admin.nama, email: admin.email },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/admin/me  (cek token admin masih valid, dipakai saat buka app)
exports.getMe = async (req, res) => {
  res.json(req.admin);
};

// POST /api/admin/create  (butuh token admin - admin lama bikin admin baru)
exports.createAdmin = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
    }

    const [existing] = await db.query("SELECT id FROM admins WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email admin sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO admins (nama, email, password) VALUES (?, ?, ?)",
      [nama, email, hashedPassword]
    );

    res.status(201).json({ message: "Akun admin baru berhasil dibuat" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
