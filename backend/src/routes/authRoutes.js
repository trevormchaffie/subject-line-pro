const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/config");
const { authenticateJWT } = require("../middleware/authMiddleware");
const router = express.Router();

// Store for refresh tokens (in-memory for simplicity; use a database in production)
const refreshTokens = new Set();

/**
 * Generate access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: "1h" } // Short-lived token
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
  const refreshToken = crypto.randomBytes(40).toString("hex");
  refreshTokens.add(refreshToken);
  return refreshToken;
};

/**
 * Login endpoint
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password match admin credentials
    if (
      username === config.adminUsername &&
      password === config.adminPassword
    ) {
      const user = { id: "admin", username };

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Calculate token expiration for client reference
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + 60 * 60; // 1 hour from now

      // Return tokens and user info
      return res.json({
        success: true,
        token: accessToken,
        refreshToken,
        expiresAt,
        user,
      });
    }

    // Return error for invalid credentials
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
});

/**
 * Token refresh endpoint
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Check if refresh token exists
    if (!refreshToken || !refreshTokens.has(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    try {
      // Verify existing access token to get user data
      const oldToken = req.body.token;
      const decoded = jwt.decode(oldToken);

      if (!decoded || !decoded.username) {
        throw new Error("Invalid token format");
      }

      const user = { id: decoded.id, username: decoded.username };

      // Generate new access token
      const accessToken = generateAccessToken(user);

      // Calculate token expiration for client reference
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + 60 * 60; // 1 hour from now

      // Return new access token
      return res.json({
        success: true,
        token: accessToken,
        expiresAt,
        user,
      });
    } catch (error) {
      console.error("Token decode error:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during token refresh",
    });
  }
});

/**
 * Verify token endpoint
 */
router.get("/verify", authenticateJWT, async (req, res) => {
  // If middleware passes, token is valid
  return res.json({
    success: true,
    user: { username: req.user.username },
  });
});

/**
 * Logout endpoint
 */
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Remove refresh token from valid tokens
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
});

module.exports = router;
