const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user has super admin privileges
    if (decoded.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied: You are not a superadmin" });
    }

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next(); // Proceed to the next middleware/controller

  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
