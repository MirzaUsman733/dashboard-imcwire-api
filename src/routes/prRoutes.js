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

router.post(
  "/add-custom-order",
  AdminOrSuperAdminMiddleware,
  apiKeyMiddleware,
  prOrderDataController.addUserPrOrder
);
router.post(
  "/superadmin/submit-single-pr",
  AdminOrSuperAdminMiddleware,
  checkFileUpload,
  apiKeyMiddleware,
  prController.submitSinglePRBySuperAdmin
);
router.put(
  "/update-single-pr-admin/:single_pr_id",
  AdminOrSuperAdminMiddleware,
  checkFileUpload,
  apiKeyMiddleware,
  prController.updateSinglePRBySuperAdmin
);

router.put(
  "/superadmin/update-order/:pr_id",
  AdminOrSuperAdminMiddleware,
  apiKeyMiddleware,
  prOrderDataController.updatePRCountriesAndCategories
);

// ✅ One API to insert all data at once
router.post(
  "/submit-custom-order",
  AdminOrSuperAdminMiddleware,
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

router.get(
  "/all-sales",
  AdminOrSuperAdminMiddleware,
  apiKeyMiddleware,
  prOrderDataController.getSalesReport
);

router.get(
  "/user-sales",
  authMiddleware,
  apiKeyMiddleware,
  prOrderDataController.getUserSalesReport
);

// ✅ Update Order/Plan Activation via `perma` in URL
router.put(
  "/update-order-plan/:perma",
  apiKeyMiddleware,
  prOrderDataController.updateOrderOrPlanActivationByPerma
);

// ✅ One API to insert all data at once
router.delete(
  "/custom-order/:orderId",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  prOrderDataController.deleteCustomOrder
);

router.get(
  "/user-order-list",
  apiKeyMiddleware,
  authMiddleware,
  prOrderDataController.getUserPRs
);

router.get(
  "/user-order-ids",
  apiKeyMiddleware,
  authMiddleware,
  prOrderDataController.getUserPRsIds
);

router.get(
  "/user-order/:userId",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  prOrderDataController.getUserPRsById
);

router.get(
  "/superadmin-list",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  prOrderDataController.getAllPRs
);

router.put(
  "/superadmin/update-order-status/:prId",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
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
  "/get-single-pr/superadmin/statuses",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  prController.getAllPRStatusCounts
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
  AdminOrSuperAdminMiddleware,
  prController.getAllSinglePRs
);

router.get(
  "/superadmin/single-pr-list/user/:user_id",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  prController.getSinglePRsByUser
);

router.get(
  "/superadmin/single-pr-list/pr-data/:pr_id",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  prController.getSinglePRsByPRData
);

router.get(
  "/superadmin/single-pr-details/:single_pr_id",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  prController.getSinglePRDetails
);

router.put(
  "/superadmin/update-single-pr/:single_pr_id",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  prController.updatePRStatusBySuperAdmin
);

// sjdfhsdj
module.exports = router;
