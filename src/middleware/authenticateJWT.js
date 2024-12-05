const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi JWT token
function authenticateJWT(req, res, next) {
  // Ambil token dari header 'Authorization'
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "Token tidak ditemukan." });
  }

  // Verifikasi token menggunakan secret key
  jwt.verify(token, 'C242-PR593obesicheck', (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid." });
    }
    req.user = user; // Menyimpan data user yang terverifikasi
    next(); // Melanjutkan ke route handler berikutnya
  });
}

module.exports = authenticateJWT;