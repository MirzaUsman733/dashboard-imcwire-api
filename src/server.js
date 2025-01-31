// src/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const planRoutes = require("./routes/planRoutes");
const companyRoutes = require("./routes/companyRoutes");
const couponRoutes = require("./routes/couponRoutes");
const prRoutes = require("./routes/prRoutes");
const ipRoutes = require("./routes/ipRoutes");
const reportRoutes = require("./routes/reportRoutes");
const faqRoutes = require("./routes/faqRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const howItWorksRoutes = require("./routes/howItWorksRoutes");
const compression = require("compression");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use("/v1/webhook", webhookRoutes);
app.use(
  compression({
    filter: (req, res) => {
      // Disable compression for PR and Report routes
      if (req.path.startsWith("/v1/pr") || req.path.startsWith("/v1/reports")) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/v1/pr", prRoutes);
app.use("/v1/payment", paymentRoutes);
app.use("/v1/account", authRoutes);
app.use("/v1/ip", ipRoutes);
app.use("/v1/plan", planRoutes);
app.use("/v1/company", companyRoutes);
app.use("/v1/coupon", couponRoutes);
app.use("/v1/faq", faqRoutes);
app.use("/v1/notification", notificationRoutes);
app.use("/v1/reports", reportRoutes);
app.use("/v1/how-it-works", howItWorksRoutes);
// app.use("/v1/files", fileRoutes);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
