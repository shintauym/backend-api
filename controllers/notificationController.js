const db = require("../config/db");

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Notifikasi ditandai sudah dibaca" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [req.user.id]
    );
    res.json({ message: "Semua notifikasi ditandai sudah dibaca" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
