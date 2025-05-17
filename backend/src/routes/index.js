const express = require("express");
const router = express.Router();
const analyzeController = require("../controllers/analyze.controller");
const leadsController = require("../controllers/leads.controller");
const analyticsController = require("../controllers/analyticsController");
const authController = require("../controllers/authController");
const analyticsRoutes = require("./admin/analyticsRoutes");
const statsRoutes = require("./stats.routes");
const leadsRoutes = require("./leads.routes");
const spamTriggerRoutes = require("./spamTriggerRoutes"); // Add this import
const powerWordRoutes = require("./powerWordRoutes");
const { authenticate } = require("../middleware/auth"); // Update to correct middleware path
const authOrBasic = require("../middleware/authOrBasicMiddleware");

// Analysis routes
router.post("/analyze", analyzeController.analyzeSubject);
router.get("/analyze/spam-triggers", analyzeController.getSpamTriggers);
router.get("/analyze/power-words", analyzeController.getPowerWords);

// Leads routes - use the dedicated router
router.use("/leads", leadsRoutes);

// Analytics routes - allow both JWT and Basic Auth
router.get(
  "/analytics/time-series",
  authOrBasic,
  analyticsController.getTimeSeries
);
router.get(
  "/analytics/score-distribution",
  authOrBasic,
  analyticsController.getScoreDistribution
);
router.get(
  "/analytics/top-subjects",
  authOrBasic,
  analyticsController.getTopSubjectLines
);
router.get(
  "/analytics/conversion",
  authOrBasic,
  analyticsController.getConversionMetrics
);
router.use("/admin/analytics", analyticsRoutes);

// Spam Trigger Management routes - protected by authentication
router.use("/spam-triggers", authenticate, spamTriggerRoutes);

// Power Words Management routes
router.use("/power-words", powerWordRoutes);

// Stats routes
router.use("/stats", statsRoutes);

// Template Routes
router.use("/api/templates", require("./templateRoutes"));

// Settings routes (temporary mock endpoints)
// Create storage for persisting settings during the session
// Simplified settings store with defaults
const defaultSettings = {
  general: {
    appName: "Subject Line Pro",
    appDescription: "Email subject line optimization tool",
    defaultLanguage: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    sessionTimeout: 30,
    maxLoginAttempts: 5
  },
  email: {
    smtpServer: "smtp.example.com",
    smtpPort: 587,
    smtpUsername: "notifications@example.com",
    smtpPassword: "•••••••••",
    fromEmail: "no-reply@subjectlinepro.com",
    replyToEmail: "support@subjectlinepro.com",
    emailTemplate: "default",
    notificationFrequency: "daily"
  },
  api: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    ipWhitelist: [],
    ipBlacklist: [],
    showUsageStats: true,
    throttlingEnabled: true
  },
  ui: {
    theme: "light",
    primaryColor: "#3b82f6",
    secondaryColor: "#475569",
    fontSize: "medium",
    dashboardLayout: "default",
    showHelp: true,
    enableAnimations: true
  }
};

// Create a separate settings store object that we'll modify
// Load from JSON file if it exists, otherwise use defaults
const settingsStore = JSON.parse(JSON.stringify(defaultSettings));

// Use file system to persist settings across server restarts
const fs = require('fs');
const path = require('path');
const settingsFilePath = path.join(__dirname, '../data/settings.json');

// Try to load saved settings if they exist
try {
  if (fs.existsSync(settingsFilePath)) {
    const savedSettings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));
    // Merge saved settings with defaults to ensure all fields exist
    Object.keys(savedSettings).forEach(key => {
      if (settingsStore[key]) {
        settingsStore[key] = { ...settingsStore[key], ...savedSettings[key] };
      }
    });
    console.log('Loaded settings from file');
  } else {
    // Create the settings file with defaults if it doesn't exist
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(settingsStore, null, 2));
    console.log('Created new settings file with defaults');
  }
} catch (err) {
  console.error('Error loading settings from file:', err);
}

// Helper function to save settings to file
const saveSettingsToFile = () => {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settingsStore, null, 2));
  } catch (err) {
    console.error('Error saving settings to file:', err);
  }
};

router.get("/settings/general", (req, res) => {
  res.json(settingsStore.general);
});

router.post("/settings/general", (req, res) => {
  // Update the stored settings
  settingsStore.general = { ...settingsStore.general, ...req.body };
  // Save to file for persistence
  saveSettingsToFile();
  res.json(settingsStore.general);
});

router.get("/settings/email", (req, res) => {
  res.json(settingsStore.email);
});

router.post("/settings/email", (req, res) => {
  // Update the stored settings
  settingsStore.email = { ...settingsStore.email, ...req.body };
  // Save to file for persistence
  saveSettingsToFile();
  res.json(settingsStore.email);
});

router.get("/settings/api-limits", (req, res) => {
  res.json(settingsStore.api);
});

router.post("/settings/api-limits", (req, res) => {
  // Update the stored settings
  settingsStore.api = { ...settingsStore.api, ...req.body };
  // Save to file for persistence
  saveSettingsToFile();
  res.json(settingsStore.api);
});

router.get("/settings/ui", (req, res) => {
  res.json(settingsStore.ui);
});

router.post("/settings/ui", (req, res) => {
  // Update the stored settings
  settingsStore.ui = { ...settingsStore.ui, ...req.body };
  // Save to file for persistence
  saveSettingsToFile();
  res.json(settingsStore.ui);
});

router.post("/settings/reset", (req, res) => {
  const settingType = req.body.type || 'all';
  
  if (settingType === 'all') {
    // Reset all settings
    Object.assign(settingsStore, JSON.parse(JSON.stringify(defaultSettings)));
  } else if (defaultSettings[settingType]) {
    // Reset specific setting type
    settingsStore[settingType] = JSON.parse(JSON.stringify(defaultSettings[settingType]));
  }
  
  // Save the reset settings to file
  saveSettingsToFile();
  
  res.json({
    success: true,
    message: `${settingType} settings reset to defaults`
  });
});

router.post("/settings/email/test", (req, res) => {
  const testEmail = req.body.email;
  res.json({
    success: true,
    message: `Test email sent to ${testEmail}`
  });
});

// Auth routes
router.post("/auth/login", authController.login);
router.get("/auth/verify", authenticate, authController.verifyAuth);

module.exports = router;
