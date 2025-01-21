const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");

router.post(
  "/register",
  apiKeyMiddleware,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  authController.registerUser
);

router.post(
  "/login",
  apiKeyMiddleware,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.loginUser
);

// Forgot Password
router.post("/forgot-password", authMiddleware, authController.forgotPassword);

// Reset Password
router.post("/reset-password", authMiddleware, authController.resetPassword);

router.put(
  "/update",
  apiKeyMiddleware,
  authMiddleware,
  [
    body("username").optional().trim(),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  authController.updateUser
);

module.exports = router;

router.put("/superadmin-update", SuperAdminAuthMiddleware, authController.superadminUpdateUser);