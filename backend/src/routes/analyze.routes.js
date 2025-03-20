const express = require("express");
const router = express.Router();
const analyzeController = require("../controllers/analyze.controller");

// POST /api/analyze
router.post("/", analyzeController.analyzeSubject);

// GET /api/analyze/spam-triggers
router.get("/spam-triggers", analyzeController.getSpamTriggers);

// GET /api/analyze/power-words
router.get("/power-words", analyzeController.getPowerWords);

module.exports = router;
