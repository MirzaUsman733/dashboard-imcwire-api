const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const AdminOrSuperAdminMiddleware = require("../middleware/AdminOrSuperAdminMiddleware");

// Routes (Only Admins Can Manage Coupons)
router.post(
  "/add",
  authMiddleware,
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  couponController.createCoupon
);
router.put(
  "/update",
  authMiddleware,
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  couponController.updateCoupon
);
router.put(
  "/updateusagelimit",
  apiKeyMiddleware,
  couponController.updateCouponUsage
);
// 🔹 Users Can Only See Active Coupons
router.get("/active-list", apiKeyMiddleware, couponController.getUserCoupons);

// 🔹 Superadmins Can See All Coupons
router.get(
  "/admin-list",
  authMiddleware,
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  couponController.getAllCoupons
);
router.get("/validate", apiKeyMiddleware, couponController.validateCoupon);
router.delete(
  "/delete",
  authMiddleware,
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  couponController.deleteCoupon
);

module.exports = router;
