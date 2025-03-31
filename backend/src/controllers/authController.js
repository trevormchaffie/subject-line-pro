// backend/src/controllers/authController.js
const config = require("../config/config");
const jwt = require("jsonwebtoken");

/**
 * Authentication controller for admin access
 */
const authController = {
  /**
   * Login with username and password
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // Check credentials against config
      if (
        username === config.adminUsername &&
        password === config.adminPassword
      ) {
        // Generate JWT token
        const token = jwt.sign({ username, role: "admin" }, config.jwtSecret, {
          expiresIn: "24h",
        });

        res.json({ token });
      } else {
        res.status(401).json({
          error: { message: "Invalid credentials" },
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify authentication token
   */
  async verifyAuth(req, res, next) {
    try {
      // Auth middleware will have already verified the token
      // We just need to return success
      res.json({ valid: true });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
