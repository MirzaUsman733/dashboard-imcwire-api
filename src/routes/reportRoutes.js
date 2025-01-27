const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
// ✅ Create Report + Upload PDF & Excel in One API
router.post(
  "/createFullReport",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  reportController.uploadMiddleware,
  reportController.createFullReport
);

// ✅ Update Report + Replace PDF & Excel Directly on FTP
router.put(
  "/updateFullReport",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
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

module.exports = router;
