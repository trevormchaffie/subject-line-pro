/**
 * Simple request logging middleware
 * Logs basic information about incoming requests
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log when request is received
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // When response is sent, log the status code and response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}

module.exports = requestLogger;
