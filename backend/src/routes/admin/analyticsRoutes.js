/**
 * Analytics API routes
 */
const express = require("express");
const router = express.Router();
const analyticsController = require("../../controllers/analyticsController");
const basicAuth = require("../../middleware/basicAuth");

// Add a test endpoint that doesn't require authentication
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Analytics routes test endpoint is working"
  });
});

// Import the combined authentication middleware
const authOrBasic = require('../../middleware/authOrBasicMiddleware');

// Apply mixed authentication (JWT or Basic Auth)
router.use(authOrBasic);

// Basic analytics routes
router.get("/basic-metrics", analyticsController.getBasicMetrics);
router.get("/subject-metrics", analyticsController.getSubjectLineMetrics);
router.get("/time-series", analyticsController.getTimeSeriesData);
router.post("/refresh-cache", analyticsController.refreshCache);

// Custom reporting routes
router.post("/reports/generate", analyticsController.generateCustomReport);
router.post("/reports/export", analyticsController.exportReport);
router.get("/reports/metrics", (req, res) => {
  // Return available metrics for the UI to display
  res.json({ 
    success: true,
    data: require("../../services/analytics/analyticsService").getAvailableMetrics() 
  });
});

// Scheduled reports routes
router.get("/reports/scheduled", analyticsController.getScheduledReports);
router.post("/reports/scheduled", analyticsController.saveScheduledReport);
router.delete("/reports/scheduled/:id", analyticsController.deleteScheduledReport);

module.exports = router;
