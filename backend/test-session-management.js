// backend/test-session-management.js

const jwtUtils = require("./src/utils/jwt.utils");
const sessionManager = require("./src/utils/session.manager");

console.log("Session Management Test");
console.log("======================");

// Test user data
const userId = "user-123";
const role = "admin";
const deviceInfo = "Chrome on MacOS";

// Create a session
console.log("\n1. Creating a session...");
const session = sessionManager.createSession(userId, role, deviceInfo);
console.log("Session ID:", session.sessionId);
console.log("Access token:", session.accessToken.substring(0, 20) + "...");
console.log("Refresh token:", session.refreshToken.substring(0, 20) + "...");

// Validate the session
console.log("\n2. Validating session...");
const validSession = sessionManager.validateSession(userId, session.sessionId);
console.log("Session valid:", !!validSession);

// List active sessions
console.log("\n3. Listing active sessions...");
const activeSessions = sessionManager.getUserActiveSessions(userId);
console.log(`User has ${activeSessions.length} active session(s)`);

// Test session invalidation
console.log("\n4. Invalidating session...");
const invalidated = sessionManager.invalidateSession(
  userId,
  session.sessionId,
  session.refreshToken
);
console.log("Session invalidated:", invalidated);

// Verify session is now invalid
console.log("\n5. Verifying invalidated session...");
const invalidatedSession = sessionManager.validateSession(
  userId,
  session.sessionId
);
console.log("Session still valid (should be false):", !!invalidatedSession);

console.log("\nTest Complete");
