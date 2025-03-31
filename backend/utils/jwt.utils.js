/**
 * JWT Utilities
 */

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const config = require("../config/jwt.config");

// In-memory token blacklist
let tokenBlacklist = new Set();

// Path to a JSON file to persist the blacklist
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

// Save blacklist to file
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
 * Generates an access token
 */
const generateAccessToken = (userId, role) => {
  const payload = {
    sub: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, config.accessToken.secret, {
    expiresIn: config.accessToken.expiresIn,
  });
};

/**
 * Generates a refresh token
 */
const generateRefreshToken = (userId, tokenId = null) => {
  const jti = tokenId || Math.random().toString(36).substring(2, 15);

  const payload = {
    sub: userId,
    jti,
  };

  return jwt.sign(payload, config.refreshToken.secret, {
    expiresIn: config.refreshToken.expiresIn,
  });
};

/**
 * Verifies an access token
 */
const verifyAccessToken = (token) => {
  try {
    if (tokenBlacklist.has(token)) {
      return null;
    }

    return jwt.verify(token, config.accessToken.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Verifies a refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    if (tokenBlacklist.has(token)) {
      return null;
    }

    return jwt.verify(token, config.refreshToken.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Blacklists a token
 */
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  saveBlacklist();
};

/**
 * Extracts a token from the Authorization header
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
 */
const extractTokenFromCookie = (req, cookieName) => {
  if (!req.cookies || !req.cookies[cookieName]) {
    return null;
  }

  return req.cookies[cookieName];
};

/**
 * Refreshes tokens
 */
const refreshTokens = (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return null;
  }

  // Blacklist the used refresh token
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
