const express = require("express");
const router = express.Router();
const prController = require("../controllers/prController");
const authMiddleware = require("../middleware/authMiddleware");
const prDataController = require("../controllers/prDataController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");

// ✅ One API to insert all data at once
router.post(
  "/submit",
  authMiddleware,
  apiKeyMiddleware,
  prDataController.submitPR
);
router.get(
  "/user-list",
  authMiddleware,
  apiKeyMiddleware,
  prDataController.getUserPRs
);
router.get(
  "/superadmin-list",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  prDataController.getAllPRs
);

router.post(
  "/submit-single-pr",
  authMiddleware,
  apiKeyMiddleware,
  prController.submitSinglePR
);

module.exports = router;
