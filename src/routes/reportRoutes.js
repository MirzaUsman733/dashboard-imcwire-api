const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Create Report + Upload PDF & Excel in One API
router.post(
  "/createFullReport",
  apiKeyMiddleware,
  authMiddleware,
  reportController.uploadMiddleware,
  reportController.createFullReport
);

// ✅ Update Report + Replace PDF & Excel Directly on FTP
router.put(
  "/updateFullReport",
  apiKeyMiddleware,
  authMiddleware,
  reportController.uploadMiddleware,
  reportController.updateFullReport
);

module.exports = router;
