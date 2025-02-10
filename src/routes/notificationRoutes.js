const express = require("express");
const router = express.Router();
const {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const AdminOrSuperAdminMiddleware = require("../middleware/AdminOrSuperAdminMiddleware");

// ✅ Routes (Super Admin Only)
router.post("/send", AdminOrSuperAdminMiddleware, sendNotification);

// ✅ Routes (Users)
router.get("/", authMiddleware, getUserNotifications);
router.put("/read/:notificationId", authMiddleware, markNotificationAsRead);

module.exports = router;
