-- ============================================================
--  DATABASE: shinta_ilkom (DonatKu)
--  Disesuaikan dengan kebutuhan frontend (produk, keranjang,
--  pesanan, wishlist, alamat, ulasan, profil)
-- ============================================================

CREATE DATABASE IF NOT EXISTS shinta_ilkom;
USE shinta_ilkom;

-- ── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  no_telp VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  tanggal_lahir VARCHAR(50) DEFAULT NULL,
  jenis_kelamin ENUM('Laki-laki', 'Perempuan') DEFAULT NULL,
  foto_profil VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── ADMINS (akun pengelola toko, terpisah dari akun pelanggan) ─
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── CATEGORIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL,
  ikon VARCHAR(10) DEFAULT '🍩'
);

-- ── PRODUCTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  nama_produk VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  harga INT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0,
  emoji VARCHAR(10) DEFAULT '🍩',
  gambar VARCHAR(255) DEFAULT NULL,
  stok INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ── ADDRESSES (alamat pengiriman milik user) ───────────────
CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(50) NOT NULL,
  detail TEXT NOT NULL,
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── CART ITEMS (keranjang belanja) ─────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ── ORDERS (pesanan) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  address_id INT,
  alamat_snapshot TEXT,
  metode_bayar VARCHAR(50) NOT NULL,
  subtotal INT NOT NULL,
  ongkir INT NOT NULL DEFAULT 0,
  total INT NOT NULL,
  status ENUM('Diproses', 'Dikirim', 'Selesai', 'Dibatalkan') DEFAULT 'Diproses',
  no_resi VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- ── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  nama_produk VARCHAR(100) NOT NULL,
  harga INT NOT NULL,
  qty INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ── WISHLIST ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ── REVIEWS (ulasan) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  order_id INT DEFAULT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  komentar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ============================================================
--  SEED DATA
-- ============================================================

-- Akun admin default (email: admin@donatku.com / password: admin123)
-- ⚠️ Ganti password ini setelah login pertama kali di aplikasi.
INSERT INTO admins (nama, email, password) VALUES
  ('Admin DonatKu', 'admin@donatku.com', '$2b$10$kJJdnSujDsI4pi3/hq5ituOmNW1G6JHQEAOQfwU07Lv/fgfPcTw9.');

INSERT INTO categories (nama_kategori, ikon) VALUES
  ('Glazed', '🍩'),
  ('Cokelat', '🍫'),
  ('Fruity', '🍓'),
  ('Box Set', '📦'),
  ('Spesial', '⭐');

INSERT INTO products (category_id, nama_produk, deskripsi, harga, rating, emoji, stok) VALUES
  (1, 'Classic Glazed',  'Donat klasik dengan glazing manis yang lembut dan mengkilap.', 8000,  4.9, '🍩', 50),
  (2, 'Choco Lava',      'Donat cokelat premium dengan isian lava cokelat yang meleleh.', 10000, 4.8, '🍫', 40),
  (3, 'Strawberry',      'Donat segar dengan topping strawberry asli dan krim vanilla.', 9000,  4.7, '🍓', 35),
  (3, 'Lemon Zest',      'Donat lemon segar dengan taburan zest lemon dan gula halus.', 9500,  4.6, '🍋', 30),
  (5, 'Matcha Glaze',    'Donat matcha premium dengan lapisan white chocolate.', 11000, 4.8, '🍵', 25),
  (4, 'Birthday Box',    'Box set 6 donat spesial cocok untuk hadiah ulang tahun.', 55000, 5.0, '📦', 15);
