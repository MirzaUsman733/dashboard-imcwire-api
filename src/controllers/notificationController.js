const connection = require("../config/dbconfig");

// ✅ Send Notification (Super Admin Only)
exports.sendNotification = async (req, res) => {
  const { userId, title, message } = req.body;
  let dbConnection;

  try {
    if (!userId || !title || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    // ✅ **Check if the user exists before sending a notification**
    const [userCheck] = await dbConnection.query(
      "SELECT auth_user_id FROM auth_user WHERE auth_user_id = ?",
      [userId]
    );

    if (userCheck.length === 0) {
      await dbConnection.rollback();
      return res.status(404).json({ error: "User not found." });
    }

    // ✅ **Insert Notification**
    await dbConnection.query(
      "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
      [userId, title, message]
    );

    // ✅ **Commit transaction after successful insertion**
    await dbConnection.commit();
    dbConnection.release();

    return res.status(201).json({
      success: true,
      message: "Notification sent successfully.",
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback in case of an error
    if (dbConnection) dbConnection.release(); // Ensure the connection is released

    return res.status(500).json({
      error: "Internal Server Error",
      details: error.sqlMessage || error.message,
    });
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
