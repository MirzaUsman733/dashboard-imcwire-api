const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const AdminOrSuperAdminMiddleware = require("../middleware/AdminOrSuperAdminMiddleware");

// Admin-only routes
router.post(
  "/add",
  AdminOrSuperAdminMiddleware,
  apiKeyMiddleware,
  planController.createPlan
);

router.put(
  "/update/:perma",
  AdminOrSuperAdminMiddleware,
  apiKeyMiddleware,
  planController.updatePlan
);

router.delete(
  "/delete",
  AdminOrSuperAdminMiddleware,
  apiKeyMiddleware,
  planController.deletePlan
);


// Public route
router.get("/list", apiKeyMiddleware, planController.getPlans);

router.get("/active-plans", apiKeyMiddleware, planController.getActivePlans);

// New route for getting a single plan by ID
router.get("/single/:perma", apiKeyMiddleware, planController.getPlanById);
module.exports = router;
