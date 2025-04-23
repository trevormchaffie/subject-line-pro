/**
 * Middleware that accepts either JWT token OR Basic Auth
 * This allows both authentication methods to work for the same endpoint
 */

const { authenticate } = require('./authMiddleware');
const basicAuth = require('./basicAuth');

/**
 * Authenticate with JWT token or Basic Auth
 * This middleware tries JWT first, then falls back to Basic Auth if JWT fails
 */
const authOrBasic = (req, res, next) => {
  // Check if using Basic Auth
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Basic ')) {
    // Use Basic Auth
    return basicAuth(req, res, next);
  } else {
    // Try to handle JWT auth
    try {
      // Create a fake next function that will try Basic Auth if JWT fails
      const tryBasicAuthNext = (err) => {
        if (err) {
          // JWT failed, try Basic Auth instead
          console.log('JWT auth failed, falling back to Basic Auth');
          return basicAuth(req, res, next);
        }
        // JWT auth succeeded
        next();
      };
      
      // Try JWT auth first
      authenticate(req, res, tryBasicAuthNext);
    } catch (error) {
      // If JWT auth throws an error, try Basic Auth as fallback
      console.log('Error in JWT auth, falling back to Basic Auth:', error.message);
      return basicAuth(req, res, next);
    }
  }
};

module.exports = authOrBasic;