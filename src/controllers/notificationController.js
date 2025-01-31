const connection = require("../config/dbconfig");

// ✅ Send Notification (Super Admin Only)
exports.sendNotification = async (req, res) => {
  const { userId, title, message } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await connection.query(
      "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
      [userId, title, message]
    );

    return res
      .status(201)
      .json({ success: true, message: "Notification sent successfully." });
  } catch (error) {
    console.error("❌ Error Sending Notification:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Fetch All Notifications for a Specific User
exports.getUserNotifications = async (req, res) => {
  const { id } = req.user;
  try {
    const [notifications] = await connection.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [id]
    );

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("❌ Error Fetching Notifications:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Mark a Notification as Read
exports.markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const { id } = req.user;

  try {
    const [result] = await connection.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [notificationId, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Notification not found or unauthorized." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    console.error("❌ Error Marking Notification as Read:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
