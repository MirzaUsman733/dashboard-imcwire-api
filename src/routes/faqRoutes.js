const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");

router.get("/list", apiKeyMiddleware, faqController.getAllFaqs);
// router.get("/:id", apiKeyMiddleware, faqController.getFaqById);
router.post(
  "/add",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  faqController.createFaq
);
router.put(
  "/update/:id",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  faqController.updateFaq
);
router.delete(
  "/delete/:id",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  faqController.deleteFaq
);

module.exports = router;
