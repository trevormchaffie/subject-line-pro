const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Middleware to authenticate JWT tokens
 * Adds user information to request object if valid
 */
const authenticateJWT = (req, res, next) => {
  // Get auth header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Extract token from header
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Add user info to request
    req.user = decoded;

    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        expired: true,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = { authenticateJWT };
