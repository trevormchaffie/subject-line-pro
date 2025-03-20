const rateLimit = require("express-rate-limit");
const config = require("../config/config");

/**
 * Rate limiting middleware to prevent abuse
 * Limits the number of requests a client can make in a specified time window
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // Time window
  max: config.rateLimitMax, // Max number of requests per window
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: {
    error: {
      message: "Too many requests, please try again later.",
      status: 429,
    },
  },
  // Store used for tracking requests - default is memory store
  // For production, consider using a more robust store like Redis
});

module.exports = rateLimiter;
