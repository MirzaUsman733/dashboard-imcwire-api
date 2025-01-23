const express = require("express");
const router = express.Router();
const prController = require("../controllers/prController");
const authMiddleware = require("../middleware/authMiddleware");
const prDataController = require("../controllers/prDataController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const multer = require("multer");

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

// router.post(
//   "/submit-single-pr",
//   authMiddleware,
//   apiKeyMiddleware,
//   prController.submitSinglePR
// );

// ✅ Multer Configuration: Only to Parse Form-Data, No Local Storage
const upload = multer();

// ✅ Middleware to Conditionally Handle `multipart/form-data`
const checkFileUpload = (req, res, next) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    upload.single("pdf")(req, res, next);
  } else {
    next();
  }
};

// ✅ Handle `Self-Written` (File Upload to FTP) & `IMCWire-Written` (JSON Body)
router.post(
  "/submit-single-pr",
  authMiddleware,
  apiKeyMiddleware,
  checkFileUpload, // ✅ Only processes file uploads if needed
  prController.submitSinglePR
);

// ✅ **NEW**: Update Single PR API
router.put(
  "/update-single-pr/:single_pr_id",
  authMiddleware,
  apiKeyMiddleware,
  checkFileUpload, // ✅ Supports file upload for `Self-Written`
  prController.updateSinglePR
);

router.get(
  "/get-single-pr/:pr_id",
  authMiddleware,
  apiKeyMiddleware,
  prController.getSinglePRs
);

router.get(
  "/single-pr-detail/:single_pr_id",
  authMiddleware,
  apiKeyMiddleware,
  prController.getSinglePRDetails
);
router.get(
  "/superadmin/single-pr-list",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  prController.getAllSinglePRs
);

router.get(
  "/superadmin/single-pr-list/user/:user_id",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  prController.getSinglePRsByUser
);
router.get(
  "/superadmin/single-pr-list/pr-data/:pr_id",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  prController.getSinglePRsByPRData
);
router.get(
  "/superadmin/single-pr-details/:single_pr_id",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  prController.getSinglePRDetails
);

module.exports = router;
