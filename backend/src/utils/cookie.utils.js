/**
 * Cookie Utilities
 */

const config = require("../config/jwt.config");

/**
 * Sets an HTTP-only cookie with the provided token
 */
const setTokenCookie = (res, name, token, maxAge) => {
  if (!maxAge) {
    const expirations = {
      access_token: 15 * 60 * 1000, // 15 minutes
      refresh_token: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    maxAge = expirations[name] || expirations.access_token;
  }

  res.cookie(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: maxAge,
    path: "/",
  });
};

/**
 * Clears a cookie
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
