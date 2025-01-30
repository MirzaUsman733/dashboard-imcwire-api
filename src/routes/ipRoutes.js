// routes/ipRoutes.js
const express = require("express");
const router = express.Router();
const { getIpAddress } = require("../controllers/ipController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

router.get("/get-ip", apiKeyMiddleware, getIpAddress);

module.exports = router;
 