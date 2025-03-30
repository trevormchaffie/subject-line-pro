/**
 * Cookie Utilities
 *
 * Helper functions for managing secure cookies
 */

const jwtConfig = require("../config/jwt.config");

/**
 * Sets an HTTP-only cookie with the provided token
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 * @param {string} token - Token value
 * @param {number} [maxAge] - Cookie max age in milliseconds
 */
const setTokenCookie = (res, name, token, maxAge) => {
  // Calculate max age based on token type
  if (!maxAge) {
    // Default expiration times in milliseconds
    const expirations = {
      access_token: 15 * 60 * 1000, // 15 minutes
      refresh_token: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    maxAge = expirations[name] || expirations.access_token;
  }

  res.cookie(name, token, {
    httpOnly: true, // Prevents JavaScript access
    secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
    sameSite: "strict", // Prevents CSRF
    maxAge: maxAge,
    path: "/", // Available across the site
  });
};

/**
 * Clears a cookie
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name to clear
 */
const clearCookie = (res, name) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};

module.exports = {
  setTokenCookie,
  clearCookie,
};
