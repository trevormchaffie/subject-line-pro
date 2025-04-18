const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const basicAuth = require("../middleware/basicAuth");

// GET /api/stats
router.get("/", statsController.getStats);

// GET /api/stats/analyzed-subjects (admin only)
router.get(
  "/analyzed-subjects",
  basicAuth,
  statsController.getAnalyzedSubjects
);

// GET /api/stats/dashboard (admin only)
router.get("/dashboard", basicAuth, statsController.getDashboardMetrics);

// GET /api/stats/system (admin only)
router.get("/system", basicAuth, statsController.getSystemStatus);

// GET /api/stats/dashboard-stats (admin only)
router.get("/dashboard/stats", basicAuth, statsController.getDashboardStats);

module.exports = router;
