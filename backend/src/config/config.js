// Load environment variables from .env file
require("dotenv").config();

// Define and export configuration
const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // CORS configuration
  corsOrigin:
    process.env.CORS_ORIGIN || "https://subjectlinepro.trevormchaffie.com",

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute 
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 300, // 300 requests per window

  // Data paths
  leadsDataPath: process.env.LEADS_DATA_PATH || "./src/data/leads.json",
  analyzedSubjectsPath:
    process.env.ANALYZED_SUBJECTS_PATH || "./src/data/analyzed_subjects.json",

  // Admin credentials
  adminUsername: process.env.ADMIN_USERNAME || "mr1018",
  adminPassword: process.env.ADMIN_PASSWORD || "Maya03112005",

  // JWT Authentication (add this new section)
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
};

// Simple validation to ensure critical values are set
function validateConfig() {
  const requiredVars = [
    "port",
    "corsOrigin",
    "adminUsername",
    "adminPassword",
    "jwtSecret",
  ];

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

  // Warn if using default JWT secret
  if (config.jwtSecret === "your-secret-key") {
    console.warn(
      "WARNING: Using default JWT secret. Change this in production!"
    );
  }
}

validateConfig();

module.exports = config;
