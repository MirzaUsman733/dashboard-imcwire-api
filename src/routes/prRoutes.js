const express = require("express");
const router = express.Router();
const prController = require("../controllers/prController");
const authMiddleware = require("../middleware/authMiddleware");
const prOrderDataController = require("../controllers/prOrderDataController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const multer = require("multer");
const AdminOrSuperAdminMiddleware = require("../middleware/AdminOrSuperAdminMiddleware");
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
  "/custom-order/:perma",
  apiKeyMiddleware,
  prOrderDataController.getCustomOrder
);

router.get(
  "/all-custom-order",
  apiKeyMiddleware,
  prOrderDataController.getAllCustomOrders
);

// ✅ One API to insert all data at once
router.delete(
  "/custom-order/:orderId",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  prOrderDataController.deleteCustomOrder
);

router.get(
  "/user-order-list",
  apiKeyMiddleware,
  authMiddleware,
  prOrderDataController.getUserPRs
);

router.get(
  "/user-order/:userId",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
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
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  prOrderDataController.updatePROrderStatusBySuperAdmin
);

// ✅ Handle `Self-Written` (File Upload to FTP) & `IMCWire-Written` (JSON Body)
router.post(
  "/submit-single-pr",
  apiKeyMiddleware,
  authMiddleware,
  checkFileUpload,
  prController.submitSinglePR
);

// ✅ **NEW**: Update Single PR API
router.put(
  "/update-single-pr/:single_pr_id",
  apiKeyMiddleware,
  authMiddleware,
  checkFileUpload,
  prController.updateSinglePR
);

router.get(
  "/get-single-pr/:pr_id",
  apiKeyMiddleware,
  authMiddleware,
  prController.getSinglePRs
);
router.get(
  "/get-single-pr/:pr_id",
  apiKeyMiddleware,
  authMiddleware,
  prController.getSinglePRs
);
router.get(
  "/get-single-pr/user/list",
  apiKeyMiddleware,
  authMiddleware,
  prController.getUserSinglePRs
);
router.get(
  "/get-single-pr/user/statuses",
  apiKeyMiddleware,
  authMiddleware,
  prController.getUserPRStatusCounts
);

router.get(
  "/single-pr-detail/:single_pr_id",
  apiKeyMiddleware,
  authMiddleware,
  prController.getSinglePRDetails
);
router.get(
  "/superadmin/single-pr-list",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  prController.getAllSinglePRs
);

router.get(
  "/superadmin/single-pr-list/user/:user_id",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  prController.getSinglePRsByUser
);
router.get(
  "/superadmin/single-pr-list/pr-data/:pr_id",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  prController.getSinglePRsByPRData
);
router.get(
  "/superadmin/single-pr-details/:single_pr_id",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  prController.getSinglePRDetails
);

router.put(
  "/superadmin/update-single-pr/:single_pr_id",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  prController.updatePRStatusBySuperAdmin
);

module.exports = router;
