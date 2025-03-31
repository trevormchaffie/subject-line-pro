/**
 * Analytics API routes
 */
const express = require("express");
const router = express.Router();
const analyticsController = require("../../controllers/analyticsController");
const {
  authenticateToken,
  requireRole,
} = require("../../middleware/authMiddleware");

// Apply authentication middleware
router.use(authenticateToken);
// If you have role-based auth, add this line to require admin role
router.use((req, res, next) => requireRole("admin")(req, res, next));

// Routes remain the same
router.get("/basic-metrics", analyticsController.getBasicMetrics);
router.get("/subject-metrics", analyticsController.getSubjectLineMetrics);
router.get("/time-series", analyticsController.getTimeSeriesData);
router.post("/refresh-cache", analyticsController.refreshCache);

module.exports = router;
