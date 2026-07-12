const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/jwtSecret");

// REGISTER
exports.register = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { nama, email, no_telp, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
    }

    const [user] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (user.length > 0) {
      return res.status(400).json({
        message: "Email sudah digunakan"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (nama, email, no_telp, password) VALUES (?, ?, ?, ?)",
      [nama, email, no_telp, hashedPassword]
    );

    res.status(201).json({
      message: "Registrasi berhasil"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(400).json({
        message: "Email tidak ditemukan"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user[0].password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Password salah"
      });
    }

    const token = jwt.sign(
      {
       user: {
        id: user[0].id,
        nama: user[0].nama,
        email: user[0].email,
        no_telp: user[0].no_telp
        }
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user[0].id,
        nama: user[0].nama,
        email: user[0].email,
        no_telp: user[0].no_telp,
        tanggal_lahir: user[0].tanggal_lahir,
        jenis_kelamin: user[0].jenis_kelamin,
        foto_profil: user[0].foto_profil,
      }
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

// GET PROFIL SAYA (butuh token)
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nama, email, no_telp, tanggal_lahir, jenis_kelamin, foto_profil, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Statistik tambahan: total pesanan, pesanan selesai, jumlah ulasan
    const [[orderStats]] = await db.query(
      `SELECT
        COUNT(*) AS total_pesanan,
        SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) AS selesai
       FROM orders WHERE user_id = ?`,
      [req.user.id]
    );
    const [[reviewStats]] = await db.query(
      "SELECT COUNT(*) AS total_ulasan FROM reviews WHERE user_id = ?",
      [req.user.id]
    );

    res.json({
      ...rows[0],
      total_pesanan: orderStats.total_pesanan || 0,
      pesanan_selesai: orderStats.selesai || 0,
      total_ulasan: reviewStats.total_ulasan || 0,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE PROFIL SAYA (butuh token)
exports.updateProfile = async (req, res) => {
  try {
    const { nama, email, no_telp, tanggal_lahir, jenis_kelamin } = req.body;

    if (!nama || !email) {
      return res.status(400).json({ message: "Nama dan email wajib diisi" });
    }

    await db.query(
      `UPDATE users
       SET nama = ?, email = ?, no_telp = ?, tanggal_lahir = ?, jenis_kelamin = ?
       WHERE id = ?`,
      [nama, email, no_telp || null, tanggal_lahir || null, jenis_kelamin || null, req.user.id]
    );

    res.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
