/**
 * JWT Configuration Test
 *
 * This script verifies that JWT settings are correctly loaded.
 * Run this script to ensure your environment variables are properly set.
 */

const jwtConfig = require("./config/jwt.config");
const jwtUtils = require("./utils/jwt.utils");

console.log("JWT Configuration Test");
console.log("======================");

// Check that secrets are loaded (without revealing them)
console.log("Access Token Secret loaded:", !!jwtConfig.accessToken.secret);
console.log("Refresh Token Secret loaded:", !!jwtConfig.refreshToken.secret);
console.log("Access Token Expiration:", jwtConfig.accessToken.expiresIn);
console.log("Refresh Token Expiration:", jwtConfig.refreshToken.expiresIn);

// Generate sample tokens
const userId = "test-user-123";
const role = "admin";
const accessToken = jwtUtils.generateAccessToken(userId, role);
const refreshToken = jwtUtils.generateRefreshToken(userId);

console.log("\nSample Tokens Generated:");
console.log("Access Token:", accessToken.substring(0, 20) + "...");
console.log("Refresh Token:", refreshToken.substring(0, 20) + "...");
