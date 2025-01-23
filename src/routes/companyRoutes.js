const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const authMiddleware = require("../middleware/authMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");

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

// ✅ **Super Admin Routes (Super Admin Only)**
router.get(
  "/superadmin/all",
  authMiddleware,
  SuperAdminAuthMiddleware,
  companyController.getAllCompanies
);

router.get(
  "/superadmin/user",
  authMiddleware,
  SuperAdminAuthMiddleware,
  companyController.getCompaniesByUserId
);

router.get(
  "/superadmin/detail",
  authMiddleware,
  SuperAdminAuthMiddleware,
  companyController.getCompanyDetailsById
);

module.exports = router;
