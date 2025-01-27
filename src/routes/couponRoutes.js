const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

// Routes (Only Admins Can Manage Coupons)
router.post(
  "/add",
  authMiddleware,
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  couponController.createCoupon
);
router.put(
  "/update",
  authMiddleware,
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  couponController.updateCoupon
);
// 🔹 Users Can Only See Active Coupons
router.get("/active-list", apiKeyMiddleware, couponController.getUserCoupons);

// 🔹 Superadmins Can See All Coupons
router.get(
  "/admin-list",
  authMiddleware,
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  couponController.getAllCoupons
);
router.get("/validate", apiKeyMiddleware, couponController.validateCoupon);
router.delete(
  "/delete",
  authMiddleware,
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  couponController.deleteCoupon
);

module.exports = router;
