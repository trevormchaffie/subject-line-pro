/**
 * JWT Utilities
 */

const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config");

/**
 * Generates a properly formatted JWT payload object
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
 */
const generateRefreshToken = (userId) => {
  const payload = { sub: userId };
  return jwt.sign(payload, jwtConfig.refreshToken.secret, {
    expiresIn: jwtConfig.refreshToken.expiresIn,
    algorithm: jwtConfig.refreshToken.algorithm,
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
