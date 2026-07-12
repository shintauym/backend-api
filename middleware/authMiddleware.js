const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/jwtSecret");

// Melindungi route: wajib mengirim header "Authorization: Bearer <token>"
module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan, silakan login" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // { id, nama, email, no_telp }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa" });
  }
};
