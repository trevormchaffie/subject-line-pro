// Load environment variables from .env file
require("dotenv").config();

// Define and export configuration
const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window

  // Data paths
  leadsDataPath: process.env.LEADS_DATA_PATH || "./src/data/leads.json",
  analyzedSubjectsPath:
    process.env.ANALYZED_SUBJECTS_PATH || "./src/data/analyzed_subjects.json",

  // Admin credentials
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "changeme",
};

// Simple validation to ensure critical values are set
function validateConfig() {
  const requiredVars = ["port", "corsOrigin", "adminUsername", "adminPassword"];

  for (const item of requiredVars) {
    if (!config[item]) {
      throw new Error(`Required configuration ${item} is missing or empty`);
    }
  }

  // Warn if using default admin password
  if (config.adminPassword === "changeme") {
    console.warn(
      "WARNING: Using default admin password. Change this in production!"
    );
  }
}

validateConfig();

module.exports = config;
