const axios = require("axios");

const recaptchaMiddleware = async (req, res, next) => {
  const recaptchaToken =
    req.body.recaptchaToken || req.headers["recaptcha-token"];

  if (!recaptchaToken) {
    return res.status(400).json({ message: "reCAPTCHA token is missing" });
  }

  try {
    // Send the reCAPTCHA token to Google's verification endpoint
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY, // Secret key for reCAPTCHA from Google
          response: recaptchaToken,
        },
      }
    );

    // Check if the verification was successful
    if (!response.data.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // If successful, proceed to the next middleware/controller
    next();
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return res.status(500).json({ message: "Error verifying reCAPTCHA" });
  }
};

module.exports = recaptchaMiddleware;