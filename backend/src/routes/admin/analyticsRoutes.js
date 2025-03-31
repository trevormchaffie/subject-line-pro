/**
 * Analytics API routes
 */
const express = require("express");
const router = express.Router();
const analyticsController = require("../../controllers/analyticsController");
const { authenticateAdmin } = require("../../middleware/authMiddleware");

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// GET /api/admin/analytics/basic-metrics
router.get("/basic-metrics", analyticsController.getBasicMetrics);

// GET /api/admin/analytics/subject-metrics
router.get("/subject-metrics", analyticsController.getSubjectLineMetrics);

// GET /api/admin/analytics/time-series
router.get("/time-series", analyticsController.getTimeSeriesData);

// POST /api/admin/analytics/refresh-cache
router.post("/refresh-cache", analyticsController.refreshCache);

module.exports = router;
