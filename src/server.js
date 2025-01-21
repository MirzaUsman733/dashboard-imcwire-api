// src/app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const planRoutes = require("./routes/planRoutes");
const companyRoutes = require("./routes/companyRoutes");
const couponRoutes = require("./routes/couponRoutes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/v1/account", authRoutes);
app.use("/v1/plan", planRoutes);
app.use("/v1/company", companyRoutes);
app.use("/v1/coupon", couponRoutes);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
