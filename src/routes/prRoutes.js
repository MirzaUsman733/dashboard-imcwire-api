const express = require("express");
const router = express.Router();
const prController = require("../controllers/prController");
const authMiddleware = require("../middleware/authMiddleware");
const prOrderDataController = require("../controllers/prOrderDataController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const multer = require("multer");
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
// ✅ One API to insert all data at once
router.post(
  "/submit-order",
  authMiddleware,
  apiKeyMiddleware,
  prOrderDataController.submitPR
);

// ✅ One API to insert all data at once
router.post(
  "/submit-custom-order",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  prOrderDataController.submitCustomOrder
);

// ✅ One API to insert all data at once
router.get(
  "/custom-order/:orderId",
  apiKeyMiddleware,
  prOrderDataController.getCustomOrder
);

// ✅ One API to insert all data at once
router.delete(
  "/custom-order/:orderId",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  prOrderDataController.deleteCustomOrder
);

router.get(
  "/user-order-list",
  authMiddleware,
  apiKeyMiddleware,
  prOrderDataController.getUserPRs
);

router.get(
  "/user-order/:userId",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  prOrderDataController.getUserPRsById
);

router.get(
  "/superadmin-list",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  prOrderDataController.getAllPRs
);

router.put(
  "/superadmin/update-order-status/:prId",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  prOrderDataController.updatePROrderStatusBySuperAdmin
);

// ✅ Handle `Self-Written` (File Upload to FTP) & `IMCWire-Written` (JSON Body)
router.post(
  "/submit-single-pr",
  authMiddleware,
  apiKeyMiddleware,
  checkFileUpload,
  prController.submitSinglePR
);

// ✅ **NEW**: Update Single PR API
router.put(
  "/update-single-pr/:single_pr_id",
  authMiddleware,
  apiKeyMiddleware,
  checkFileUpload,
  prController.updateSinglePR
);

router.get(
  "/get-single-pr/:pr_id",
  authMiddleware,
  apiKeyMiddleware,
  prController.getSinglePRs
);
router.get(
  "/get-single-pr/:pr_id",
  authMiddleware,
  apiKeyMiddleware,
  prController.getSinglePRs
);
router.get(
  "/get-single-pr/user/list",
  authMiddleware,
  apiKeyMiddleware,
  prController.getUserSinglePRs
);
router.get(
  "/get-single-pr/user/statuses",
  authMiddleware,
  apiKeyMiddleware,
  prController.getUserPRStatusCounts
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

router.put(
  "/superadmin/update-single-pr/:single_pr_id",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  prController.updatePRStatusBySuperAdmin
);

module.exports = router;
