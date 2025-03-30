/**
 * Token System Test
 *
 * This script tests the complete token generation and verification system.
 */

const jwtUtils = require("./utils/jwt.utils");
const sessionManager = require("./utils/session.manager");

console.log("Token System Test");
console.log("================");

// Test user data
const userId = "user-123";
const role = "admin";
const deviceInfo = "Chrome on MacOS";

// 1. Create a session with tokens
console.log("\n1. Creating a new session...");
const session = sessionManager.createSession(userId, role, deviceInfo);
console.log("Session created with ID:", session.sessionId);
console.log("Access token:", session.accessToken.substring(0, 20) + "...");
console.log("Refresh token:", session.refreshToken.substring(0, 20) + "...");

// 2. Verify the access token
console.log("\n2. Verifying access token...");
const decodedAccess = jwtUtils.verifyAccessToken(session.accessToken);
if (decodedAccess) {
  console.log("Access token is valid!");
  console.log("User ID:", decodedAccess.sub);
  console.log("Role:", decodedAccess.role);
} else {
  console.error("Access token verification failed!");
}

// 3. Verify the refresh token
console.log("\n3. Verifying refresh token...");
const decodedRefresh = jwtUtils.verifyRefreshToken(session.refreshToken);
if (decodedRefresh) {
  console.log("Refresh token is valid!");
  console.log("User ID:", decodedRefresh.sub);
  console.log("Token ID:", decodedRefresh.jti);
} else {
  console.error("Refresh token verification failed!");
}

// 4. Simulate token refresh
console.log("\n4. Refreshing tokens...");
const newTokens = jwtUtils.refreshTokens(session.refreshToken);
if (newTokens) {
  console.log("Token refresh successful!");
  console.log(
    "New access token:",
    newTokens.accessToken.substring(0, 20) + "..."
  );
  console.log(
    "New refresh token:",
    newTokens.refreshToken.substring(0, 20) + "..."
  );

  // Verify the old refresh token is now invalid (blacklisted)
  const oldRefreshValid = jwtUtils.verifyRefreshToken(session.refreshToken);
  console.log("Old refresh token is now invalid:", !oldRefreshValid);
} else {
  console.error("Token refresh failed!");
}

// 5. Check active sessions
console.log("\n5. Checking active sessions...");
const activeSessions = sessionManager.getUserActiveSessions(userId);
console.log(`User has ${activeSessions.length} active session(s):`);
console.log(activeSessions);

// 6. Test session validation
console.log("\n6. Validating session...");
const validSession = sessionManager.validateSession(userId, session.sessionId);
if (validSession) {
  console.log("Session is valid!");
} else {
  console.error("Session validation failed!");
}

// 7. Test session invalidation (logout)
console.log("\n7. Invalidating session (logout)...");
const invalidated = sessionManager.invalidateSession(
  userId,
  session.sessionId,
  newTokens.refreshToken
);
if (invalidated) {
  console.log("Session invalidated successfully!");

  // Verify session is now invalid
  const sessionNowInvalid = !sessionManager.validateSession(
    userId,
    session.sessionId
  );
  console.log("Session is now invalid:", sessionNowInvalid);

  // Verify refresh token is now invalid
  const refreshNowInvalid = !jwtUtils.verifyRefreshToken(
    newTokens.refreshToken
  );
  console.log("Refresh token is now invalid:", refreshNowInvalid);
} else {
  console.error("Session invalidation failed!");
}

console.log("\nToken System Test Complete");
