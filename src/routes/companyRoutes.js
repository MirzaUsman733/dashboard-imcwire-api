const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const authMiddleware = require("../middleware/authMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const AdminOrSuperAdminMiddleware = require("../middleware/AdminOrSuperAdminMiddleware");

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
  "/company-list",
  authMiddleware,
  apiKeyMiddleware,
  companyController.getUserCompanyNames
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
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  companyController.getAllCompanies
);

router.get(
  "/superadmin/user",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  companyController.getCompaniesByUserId
);

router.get(
  "/superadmin/detail",
  apiKeyMiddleware,
  AdminOrSuperAdminMiddleware,
  companyController.getCompanyDetailsById
);

module.exports = router;
