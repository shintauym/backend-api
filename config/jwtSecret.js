// Secret JWT dipakai bersama oleh authController & authMiddleware.
// Sebaiknya dipindah ke .env (process.env.JWT_SECRET) untuk production.
module.exports = process.env.JWT_SECRET || "putri123";
