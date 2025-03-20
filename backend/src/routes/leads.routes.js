const express = require("express");
const router = express.Router();
const leadsController = require("../controllers/leads.controller");
const basicAuth = require("../middleware/basicAuth");

// POST /api/leads
router.post("/", leadsController.submitLead);

// GET /api/leads (admin only)
router.get("/", basicAuth, leadsController.getLeads);

module.exports = router;
