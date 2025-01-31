// src/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const compression = require("compression");
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

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

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
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

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later."
});

app.use(limiter);

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
