const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const orderController = require("../controllers/orderController");
const SuperAdminAuthMiddleware = require("../middleware/SuperAdminAuthMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// Route to create an order
router.post("/stripe-checkout", paymentController.handleStripePayment);

// Route To Create Paypro Order
router.post("/paypro-checkout", orderController.createOrder);
// Route to check order status
router.get("/checkOrderStatus", orderController.getOrderStatus);

router.get(
  "/user/:userId",
  apiKeyMiddleware,
  paymentController.getPaymentHistoryByUser
);
router.get(
  "/all",
  apiKeyMiddleware,
  SuperAdminAuthMiddleware,
  paymentController.getAllPaymentHistories
);

// ✅ Middleware: Only Authenticated Users can access this route
router.get(
  "/list",
  apiKeyMiddleware,
  authMiddleware,
  paymentController.getUserPaymentHistory
);

router.post(
  "/add",
  SuperAdminAuthMiddleware,
  paymentController.addCustomPayment
);
module.exports = router;
