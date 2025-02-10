const express = require("express");
const router = express.Router();
const howItWorksController = require("../controllers/howItWorksController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const AdminOrSuperAdminMiddleware = require("../middleware/AdminOrSuperAdminMiddleware");

router.get("/list", apiKeyMiddleware, howItWorksController.getAll);
router.get("/:id", apiKeyMiddleware, howItWorksController.getById);
router.post(
  "/add",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  howItWorksController.create
);
router.put(
  "/:id",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  howItWorksController.update
);
router.delete(
  "/:id",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  howItWorksController.delete
);

module.exports = router;
