const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/jwtSecret");

// Melindungi route KHUSUS ADMIN. Token pelanggan biasa (yang isinya
// decoded.user) tidak akan lolos di sini karena yang dicek adalah decoded.admin.
module.exports = function verifyAdminToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token admin tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.admin) {
      return res.status(403).json({ message: "Akses ditolak, ini bukan token admin" });
    }

    req.admin = decoded.admin; // { id, nama, email }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token admin tidak valid atau sudah kedaluwarsa" });
  }
};
