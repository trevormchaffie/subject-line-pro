/**
 * Session Manager
 *
 * Handles user session operations, tracking, and management.
 * This implementation uses JSON file storage for simplicity in the MVP.
 * For production, this would use a database or Redis.
 */

const fs = require("fs");
const path = require("path");
const jwtUtils = require("./jwt.utils");

// Path to session storage file
const sessionFilePath = path.join(__dirname, "../data/sessions.json");

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize sessions storage
let sessions = {};

// Load existing sessions if file exists
try {
  if (fs.existsSync(sessionFilePath)) {
    sessions = JSON.parse(fs.readFileSync(sessionFilePath, "utf8"));
  } else {
    // Initialize empty sessions file
    fs.writeFileSync(sessionFilePath, JSON.stringify({}), "utf8");
  }
} catch (error) {
  console.error("Error loading sessions:", error);
}

/**
 * Saves the sessions to the JSON file
 */
const saveSessions = () => {
  try {
    fs.writeFileSync(sessionFilePath, JSON.stringify(sessions), "utf8");
  } catch (error) {
    console.error("Error saving sessions:", error);
  }
};

/**
 * Creates a new session for a user
 * @param {string} userId - The user's ID
 * @param {string} role - The user's role
 * @param {string} deviceInfo - Information about the user's device
 * @returns {Object} The session data with tokens
 */
const createSession = (userId, role = "user", deviceInfo = "unknown") => {
  // Generate a unique session ID
  const sessionId = Math.random().toString(36).substring(2, 15);

  // Generate tokens
  const accessToken = jwtUtils.generateAccessToken(userId, role);
  const refreshToken = jwtUtils.generateRefreshToken(userId, sessionId);

  // Create session record
  const session = {
    userId,
    role,
    sessionId,
    deviceInfo,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
    isActive: true,
  };

  // Store session
  if (!sessions[userId]) {
    sessions[userId] = {};
  }
  sessions[userId][sessionId] = session;
  saveSessions();

  return {
    sessionId,
    accessToken,
    refreshToken,
    userId,
    role,
  };
};

/**
 * Updates the last activity timestamp for a session
 * @param {string} userId - The user's ID
 * @param {string} sessionId - The session ID
 * @returns {boolean} True if successful, false otherwise
 */
const updateSessionActivity = (userId, sessionId) => {
  if (!sessions[userId] || !sessions[userId][sessionId]) {
    return false;
  }

  sessions[userId][sessionId].lastActivityAt = Date.now();
  saveSessions();
  return true;
};

/**
 * Validates a session
 * @param {string} userId - The user's ID
 * @param {string} sessionId - The session ID
 * @returns {Object|null} The session if valid, null otherwise
 */
const validateSession = (userId, sessionId) => {
  if (!sessions[userId] || !sessions[userId][sessionId]) {
    return null;
  }

  const session = sessions[userId][sessionId];

  if (!session.isActive) {
    return null;
  }

  // Update last activity
  updateSessionActivity(userId, sessionId);

  return session;
};

/**
 * Invalidates a session (logout)
 * @param {string} userId - The user's ID
 * @param {string} sessionId - The session ID
 * @param {string} refreshToken - The refresh token to blacklist
 * @returns {boolean} True if successful, false otherwise
 */
const invalidateSession = (userId, sessionId, refreshToken) => {
  if (!sessions[userId] || !sessions[userId][sessionId]) {
    return false;
  }

  // Blacklist the refresh token
  if (refreshToken) {
    jwtUtils.blacklistToken(refreshToken);
  }

  // Mark session as inactive
  sessions[userId][sessionId].isActive = false;
  saveSessions();
  return true;
};

/**
 * Gets all active sessions for a user
 * @param {string} userId - The user's ID
 * @returns {Array} Array of active sessions
 */
const getUserActiveSessions = (userId) => {
  if (!sessions[userId]) {
    return [];
  }

  const activeSessions = [];

  for (const sessionId in sessions[userId]) {
    const session = sessions[userId][sessionId];
    if (session.isActive) {
      activeSessions.push({
        sessionId,
        deviceInfo: session.deviceInfo,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
      });
    }
  }

  return activeSessions;
};

/**
 * Cleans up expired sessions
 * @param {number} expiryTime - Time in milliseconds after which a session is considered expired
 */
const cleanupExpiredSessions = (expiryTime = 7 * 24 * 60 * 60 * 1000) => {
  // Default: 7 days
  const now = Date.now();
  let changed = false;

  for (const userId in sessions) {
    for (const sessionId in sessions[userId]) {
      const session = sessions[userId][sessionId];

      if (session.isActive && now - session.lastActivityAt > expiryTime) {
        session.isActive = false;
        changed = true;
      }
    }
  }

  if (changed) {
    saveSessions();
  }
};

module.exports = {
  createSession,
  updateSessionActivity,
  validateSession,
  invalidateSession,
  getUserActiveSessions,
  cleanupExpiredSessions,
};
