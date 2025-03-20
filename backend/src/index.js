// Import dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config/config");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");
const requestLogger = require("./middleware/requestLogger");

// Import routes
const apiRoutes = require("./routes");

// Initialize Express app
const app = express();

// Configure middleware
app.use(helmet()); // Adds security HTTP headers
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body
app.use(requestLogger); // Log requests
app.use(rateLimiter); // Apply rate limiting

// Apply routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
