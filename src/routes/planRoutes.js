const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
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
router.get("/list", apiKeyMiddleware, planController.getPlans);

router.get("/active-plans", apiKeyMiddleware, planController.getActivePlans);

// New route for getting a single plan by ID
router.get("/single/:id", apiKeyMiddleware, planController.getPlanById);
module.exports = router;
