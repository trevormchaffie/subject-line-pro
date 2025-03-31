const express = require("express");
const router = express.Router();
const analyzeController = require("../controllers/analyze.controller");
const leadsController = require("../controllers/leads.controller");
const analyticsController = require("../controllers/analyticsController");
const authController = require("../controllers/authController");
const analyticsRoutes = require("./admin/analyticsRoutes");
const statsRoutes = require("./stats.routes");
const { authenticate } = require("../middleware/authMiddleware");

// Analysis routes
router.post("/analyze", analyzeController.analyzeSubject);
router.get("/analyze/spam-triggers", analyzeController.getSpamTriggers);
router.get("/analyze/power-words", analyzeController.getPowerWords);

// Leads routes
router.post("/leads", leadsController.submitLead);
router.get("/leads", authenticate, leadsController.getLeads);

// Analytics routes
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
router.use("/admin/analytics", analyticsRoutes);

// Stats routes
router.use("/stats", statsRoutes);

// Auth routes
router.post("/auth/login", authController.login);
router.get("/auth/verify", authenticate, authController.verifyAuth);

module.exports = router;
