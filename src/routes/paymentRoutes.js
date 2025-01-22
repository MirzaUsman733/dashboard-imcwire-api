const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/stripe-checkout", paymentController.handleStripePayment);

module.exports = router;
