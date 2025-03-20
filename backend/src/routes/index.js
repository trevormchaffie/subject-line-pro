const express = require("express");
const router = express.Router();

// Import specific route modules
const analyzeRoutes = require("./analyze.routes");
const leadsRoutes = require("./leads.routes");
const statsRoutes = require("./stats.routes");

// Apply route modules to their respective paths
router.use("/analyze", analyzeRoutes);
router.use("/leads", leadsRoutes);
router.use("/stats", statsRoutes);

module.exports = router;
