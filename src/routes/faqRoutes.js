const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const AdminOrSuperAdminMiddleware = require("../middleware/AdminOrSuperAdminMiddleware");

router.get("/list", apiKeyMiddleware, faqController.getAllFaqs);
// router.get("/:id", apiKeyMiddleware, faqController.getFaqById);
router.post(
  "/add",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  faqController.createFaq
);
router.put(
  "/update/:id",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  faqController.updateFaq
);
router.delete(
  "/delete/:id",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  faqController.deleteFaq
);

module.exports = router;
