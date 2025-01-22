// routes/ipRoutes.js
const express = require("express");
const router = express.Router();
const { getIpAddress } = require("../controllers/ipController");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

router.get("/get-ip", apiKeyMiddleware, getIpAddress); // Define the route to handle GET requests

module.exports = router;
