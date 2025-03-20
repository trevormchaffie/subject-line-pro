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

module.exports = router;
