const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysisController");
const leadsController = require("../controllers/leadsController");
const analyticsController = require("../controllers/analyticsController");
const { authenticate } = require("../middleware/authMiddleware");

// Import specific route modules
const analyzeRoutes = require("./analyze.routes");
const leadsRoutes = require("./leads.routes");
const statsRoutes = require("./stats.routes");

// Apply route modules to their respective paths
router.use("/analyze", analyzeRoutes);
router.use("/leads", leadsRoutes);
router.use("/stats", statsRoutes);

// Analysis routes
router.post("/analyze", analysisController.analyzeSubjectLine);
router.get("/analyze/spam-triggers", analysisController.getSpamTriggers);
router.get("/analyze/power-words", analysisController.getPowerWords);

// Leads routes
router.post("/leads", leadsController.createLead);
router.get("/leads", authenticate, leadsController.getLeads);

// Analytics routes (all require authentication)
router.get(
  "/analytics/time-series",
  authenticate,
  analyticsController.getTimeSeries
);
router.get(
  "/analytics/score-distribution",
  authenticate,
  analyticsController.getScoreDistribution
);
router.get(
  "/analytics/top-subjects",
  authenticate,
  analyticsController.getTopSubjectLines
);
router.get(
  "/analytics/conversion",
  authenticate,
  analyticsController.getConversionMetrics
);

module.exports = router;
