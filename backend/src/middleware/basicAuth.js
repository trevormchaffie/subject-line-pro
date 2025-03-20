const config = require("../config/config");

/**
 * Basic authentication middleware for admin routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function basicAuth(req, res, next) {
  // Check for authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
        status: 401,
      },
    });
  }

  // Decode credentials
  try {
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");

    // Validate credentials
    if (
      username === config.adminUsername &&
      password === config.adminPassword
    ) {
      next();
    } else {
      res.status(401).json({
        error: {
          message: "Invalid credentials",
          status: 401,
        },
      });
    }
  } catch (error) {
    res.status(401).json({
      error: {
        message: "Invalid authorization header",
        status: 401,
      },
    });
  }
}

module.exports = basicAuth;
