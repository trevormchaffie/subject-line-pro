/**
 * Authentication Middleware
 *
 * Provides middleware functions for route protection and authentication.
 * Enhanced with advanced session management capabilities.
 */

const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../config/jwt.config");

// Import or create utils as needed
const jwtUtils = require("../utils/jwt.utils");
const sessionManager = require("../utils/session.manager");
const cookieUtils = require("../utils/cookie.utils");

/**
 * Constants for session management
 */
const SESSION_DEFAULTS = {
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
  ABSOLUTE_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours max session lifetime
  DEVICE_VERIFICATION: true, // Verify device fingerprint
};

/**
 * Middleware to authenticate requests using JWT
 * Checks for a valid access token and validates session status
 */
const authenticateToken = (req, res, next) => {
  // Try to get the token from the Authorization header
  let token = jwtUtils.extractTokenFromHeader(req);

  // If no token in header, try to get it from cookies
  if (!token) {
    token = jwtUtils.extractTokenFromCookie(req, "access_token");
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  // Verify the token
  const decoded = jwtUtils.verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }

  // Extract session and user info
  const userId = decoded.sub;
  const sessionId = decoded.sessionId || req.cookies?.session_id;

  // Check if session is still valid
  if (sessionId) {
    const session = sessionManager.validateSession(userId, sessionId);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalidated.",
      });
    }

    // Check for idle timeout
    const now = Date.now();
    const lastActivity = session.lastActivityAt || session.createdAt;
    const idleTime = now - lastActivity;

    if (idleTime > SESSION_DEFAULTS.IDLE_TIMEOUT) {
      // Session is too idle, invalidate it
      sessionManager.invalidateSession(userId, sessionId);
      // Clear cookies
      cookieUtils.clearCookie(res, "access_token");
      cookieUtils.clearCookie(res, "refresh_token");

      return res.status(401).json({
        success: false,
        message: "Session expired due to inactivity.",
        code: "IDLE_TIMEOUT",
      });
    }

    // Check for absolute session timeout (max lifetime)
    const sessionAge = now - session.createdAt;
    if (sessionAge > SESSION_DEFAULTS.ABSOLUTE_TIMEOUT) {
      // Session is too old, invalidate it
      sessionManager.invalidateSession(userId, sessionId);
      // Clear cookies
      cookieUtils.clearCookie(res, "access_token");
      cookieUtils.clearCookie(res, "refresh_token");

      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
        code: "SESSION_EXPIRED",
      });
    }

    // Optional: Check device fingerprint for session hijacking detection
    if (SESSION_DEFAULTS.DEVICE_VERIFICATION && req.headers["user-agent"]) {
      const currentDevice = req.headers["user-agent"];
      if (session.deviceInfo && session.deviceInfo !== currentDevice) {
        // Possible session hijacking, invalidate session
        sessionManager.invalidateSession(userId, sessionId);
        // Blacklist the token
        jwtUtils.blacklistToken(token);

        return res.status(401).json({
          success: false,
          message: "Session invalid. Device mismatch detected.",
          code: "DEVICE_MISMATCH",
        });
      }
    }

    // Update session activity
    sessionManager.updateSessionActivity(userId, sessionId);
  }

  // Add user info to request for use in route handlers
  req.user = {
    id: userId,
    role: decoded.role || "user",
    sessionId: sessionId,
  };

  next();
};

/**
 * Middleware to check if user has a specific role
 * @param {string|Array} roles - Required role(s)
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    // First ensure the user is authenticated
    authenticateToken(req, res, (err) => {
      if (err) return next(err);

      // Convert roles to array if it's a single string
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Check if user has one of the required roles
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    });
  };
};

/**
 * Middleware to handle token refresh
 * Uses refresh token to issue new access and refresh tokens
 */
const refreshTokenMiddleware = (req, res, next) => {
  // Get refresh token from cookie or request body
  const refreshToken =
    jwtUtils.extractTokenFromCookie(req, "refresh_token") ||
    req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token required.",
    });
  }

  // Verify the refresh token
  const decoded = jwtUtils.verifyRefreshToken(refreshToken);
  if (!decoded) {
    // Clear invalid cookies if present
    cookieUtils.clearCookie(res, "access_token");
    cookieUtils.clearCookie(res, "refresh_token");

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token.",
    });
  }

  // Generate new token pair
  const newTokens = jwtUtils.refreshTokens(refreshToken);
  if (!newTokens) {
    return res.status(500).json({
      success: false,
      message: "Error generating new tokens.",
    });
  }

  // Set new tokens as cookies
  cookieUtils.setTokenCookie(res, "access_token", newTokens.accessToken);
  cookieUtils.setTokenCookie(res, "refresh_token", newTokens.refreshToken);

  // Add tokens to response
  res.locals.tokens = newTokens;

  next();
};

/**
 * Middleware to force logout on all devices for a user
 * This is useful for password changes, security concerns, etc.
 */
const forceUserLogout = (req, res, next) => {
  const userId = req.params.userId || req.body.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  // Get all user sessions
  const sessions = sessionManager.getUserActiveSessions(userId);

  // Invalidate all sessions
  let invalidatedCount = 0;
  sessions.forEach((session) => {
    if (sessionManager.invalidateSession(userId, session.sessionId)) {
      invalidatedCount++;
    }
  });

  // Add result to the request for the next middleware
  req.logoutResult = {
    userId,
    totalSessions: sessions.length,
    invalidatedSessions: invalidatedCount,
  };

  next();
};

/**
 * Middleware to clear session and token cookies
 * Used during logout and session invalidation
 */
const clearSessionCookies = (req, res, next) => {
  cookieUtils.clearCookie(res, "access_token");
  cookieUtils.clearCookie(res, "refresh_token");
  cookieUtils.clearCookie(res, "session_id");

  next();
};

/**
 * Middleware to prevent session fixation attacks
 * Regenerates session after privilege level changes (like login)
 */
const regenerateSession = (req, res, next) => {
  // Capture the user ID and role from the request
  const userId = req.user?.id || req.body.userId;
  const role = req.user?.role || req.body.role || "user";

  if (!userId) {
    return next(); // Skip if no user ID is available
  }

  // Get old session ID if it exists
  const oldSessionId = req.user?.sessionId || req.cookies?.session_id;

  // Invalidate old session if it exists
  if (oldSessionId) {
    sessionManager.invalidateSession(userId, oldSessionId);
  }

  // Create a new session
  const deviceInfo = req.headers["user-agent"] || "unknown";
  const newSession = sessionManager.createSession(userId, role, deviceInfo);

  // Set new tokens as cookies
  cookieUtils.setTokenCookie(res, "access_token", newSession.accessToken);
  cookieUtils.setTokenCookie(res, "refresh_token", newSession.refreshToken);

  // Update user info on the request
  req.user = {
    id: userId,
    role: role,
    sessionId: newSession.sessionId,
  };

  next();
};

/**
 * Middleware to track session activity
 * Useful for analytics and security auditing
 */
const trackSessionActivity = (req, res, next) => {
  if (!req.user || !req.user.sessionId) {
    return next();
  }

  const activityInfo = {
    timestamp: Date.now(),
    endpoint: req.originalUrl,
    method: req.method,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || "unknown",
  };

  // In a real application, this would write to a database or activity log
  console.log(
    `[Session Activity] User: ${req.user.id}, Session: ${
      req.user.sessionId
    }, Activity: ${JSON.stringify(activityInfo)}`
  );

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  refreshTokenMiddleware,
  forceUserLogout,
  clearSessionCookies,
  regenerateSession,
  trackSessionActivity,
};
