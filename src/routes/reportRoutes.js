const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const AdminOrSuperAdminMiddleware = require("../middleware/AdminOrSuperAdminMiddleware");
// ✅ Create Report + Upload PDF & Excel in One API
router.post(
  "/createFullReport",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  reportController.uploadMiddleware,
  reportController.createFullReport
);

// ✅ Update Report + Replace PDF & Excel Directly on FTP
router.put(
  "/updateFullReport",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  reportController.uploadMiddleware,
  reportController.updateFullReport
);

// ✅ Create Report + Upload PDF & Excel in One API
router.get(
  "/get-pr-report/:report_id",
  apiKeyMiddleware,
  authMiddleware,
  reportController.getUserReport
);

// ✅ Create Report + Upload PDF & Excel in One API
router.get(
  "/get-user-pr-reports",
  apiKeyMiddleware,
  authMiddleware,
  reportController.getAllUserReports
);

module.exports = router;
