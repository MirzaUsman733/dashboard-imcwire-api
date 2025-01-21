const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const adminAuthMiddleware = require("../middleware/AdminAuthMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");

// Admin-only routes
router.post(
  "/add",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  planController.createPlan
);
router.put(
  "/update",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  planController.updatePlan
);
router.delete(
  "/delete",
  SuperAdminAuthMiddleware,
  apiKeyMiddleware,
  planController.deletePlan
);

// Public route
router.get("/list",apiKeyMiddleware, planController.getPlans);

module.exports = router;
