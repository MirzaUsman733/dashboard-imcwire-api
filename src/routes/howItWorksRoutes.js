const express = require("express");
const router = express.Router();
const howItWorksController = require("../controllers/howItWorksController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");

router.get("/list", apiKeyMiddleware, howItWorksController.getAll);
router.get("/:id", apiKeyMiddleware, howItWorksController.getById);
router.post(
  "/add",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  howItWorksController.create
);
router.put(
  "/:id",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  howItWorksController.update
);
router.delete(
  "/:id",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  howItWorksController.delete
);

module.exports = router;
