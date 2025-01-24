const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const orderController = require('../controllers/orderController');

// Route to create an order
router.post("/stripe-checkout", paymentController.handleStripePayment);
router.post('/paypro-checkout', orderController.createOrder);
// Route to check order status
router.post("/checkOrderStatus", orderController.getOrderStatus);
module.exports = router;
