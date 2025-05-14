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

// Auth routes
router.post("/auth/login", authController.login);
router.get("/auth/verify", authenticate, authController.verifyAuth);

module.exports = router;
