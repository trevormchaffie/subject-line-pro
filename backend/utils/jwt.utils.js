/**
 * JWT Utilities
 *
 * This module provides functions for working with JSON Web Tokens.
 * It handles token generation, verification, and related operations.
 */

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const jwtConfig = require("../config/jwt.config");

// In-memory token blacklist (for development)
// In production, this would be replaced with a database or Redis store
let tokenBlacklist = new Set();

// Path to a JSON file to persist the blacklist between server restarts
const blacklistPath = path.join(__dirname, "../data/token-blacklist.json");

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load blacklist from file if it exists
try {
  if (fs.existsSync(blacklistPath)) {
    const blacklistData = JSON.parse(fs.readFileSync(blacklistPath, "utf8"));
    tokenBlacklist = new Set(blacklistData);
  } else {
    // Initialize empty blacklist file
    fs.writeFileSync(blacklistPath, JSON.stringify([]), "utf8");
  }
} catch (error) {
  console.error("Error loading token blacklist:", error);
}

/**
 * Saves the token blacklist to the JSON file
 * In a production system, this would be handled by a database
 */
const saveBlacklist = () => {
  try {
    fs.writeFileSync(
      blacklistPath,
      JSON.stringify([...tokenBlacklist]),
      "utf8"
    );
  } catch (error) {
    console.error("Error saving token blacklist:", error);
  }
};

/**
 * Generates a properly formatted JWT payload object
 * @param {string} userId - The user's unique identifier
 * @param {string} role - The user's role (e.g., 'admin', 'user')
 * @returns {Object} The JWT payload
 */
const createTokenPayload = (userId, role) => {
  return {
    sub: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
  };
};

/**
 * Generates an access token for authentication
 * @param {string} userId - The user's unique identifier
 * @param {string} role - The user's role (e.g., 'admin', 'user')
 * @returns {string} The signed JWT token
 */
const generateAccessToken = (userId, role) => {
  const payload = createTokenPayload(userId, role);
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn,
    algorithm: jwtConfig.accessToken.algorithm,
  });
};

/**
 * Generates a refresh token for token renewal
 * @param {string} userId - The user's unique identifier
 * @param {string} [tokenId] - Optional unique identifier for the token
 * @returns {string} The signed refresh token
 */
const generateRefreshToken = (userId, tokenId = null) => {
  // Include a unique token ID to enable specific token revocation
  const jti = tokenId || Math.random().toString(36).substring(2, 15);

  const payload = {
    sub: userId,
    jti,
  };

  return jwt.sign(payload, jwtConfig.refreshToken.secret, {
    expiresIn: jwtConfig.refreshToken.expiresIn,
    algorithm: jwtConfig.refreshToken.algorithm,
  });
};

/**
 * Verifies an access token
 * @param {string} token - The token to verify
 * @returns {Object|null} The decoded token payload if valid, null otherwise
 */
const verifyAccessToken = (token) => {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return null;
    }

    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verifies a refresh token
 * @param {string} token - The refresh token to verify
 * @returns {Object|null} The decoded token payload if valid, null otherwise
 */
const verifyRefreshToken = (token) => {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return null;
    }

    const decoded = jwt.verify(token, jwtConfig.refreshToken.secret);
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Adds a token to the blacklist (revokes it)
 * @param {string} token - The token to blacklist
 */
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  saveBlacklist();
};

/**
 * Extracts a token from the Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} The token or null if not found
 */
const extractTokenFromHeader = (req) => {
  if (!req.headers.authorization) {
    return null;
  }

  const authHeader = req.headers.authorization;
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Extracts a token from cookies
 * @param {Object} req - Express request object
 * @param {string} cookieName - Name of the cookie containing the token
 * @returns {string|null} The token or null if not found
 */
const extractTokenFromCookie = (req, cookieName) => {
  if (!req.cookies || !req.cookies[cookieName]) {
    return null;
  }

  return req.cookies[cookieName];
};

/**
 * Refreshes an access token using a valid refresh token
 * @param {string} refreshToken - The refresh token
 * @returns {Object|null} Object with new tokens if successful, null otherwise
 */
const refreshTokens = (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return null;
  }

  // Blacklist the used refresh token (token rotation for security)
  blacklistToken(refreshToken);

  // Generate new tokens
  const userId = decoded.sub;
  const newRefreshToken = generateRefreshToken(userId);
  const newAccessToken = generateAccessToken(userId, decoded.role || "user");

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  extractTokenFromHeader,
  extractTokenFromCookie,
  refreshTokens,
};
