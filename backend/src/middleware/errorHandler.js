/**
 * Global error handling middleware
 * Centralizes error response format and logging
 */
function errorHandler(err, req, res, next) {
  // Log error for server-side debugging
  console.error(`Error [${req.method} ${req.path}]:`, err);

  // Set status code - use error status or 500 if not available
  const statusCode = err.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    error: {
      message: err.message || "Internal Server Error",
      status: statusCode,
    },
  };

  // Add stack trace in development mode only
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;
