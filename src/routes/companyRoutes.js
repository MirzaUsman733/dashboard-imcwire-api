const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const authMiddleware = require("../middleware/authMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

// Routes (Only Authenticated Users)
router.post(
  "/add",
  authMiddleware,
  apiKeyMiddleware,
  companyController.createCompany
);
router.put(
  "/update",
  authMiddleware,
  apiKeyMiddleware,
  companyController.updateCompany
);
router.get(
  "/list",
  authMiddleware,
  apiKeyMiddleware,
  companyController.getUserCompanies
);
router.get(
  "/details",
  authMiddleware,
  apiKeyMiddleware,
  companyController.getCompanyById
);
router.delete(
  "/delete",
  authMiddleware,
  apiKeyMiddleware,
  companyController.deleteCompany
);

module.exports = router;
