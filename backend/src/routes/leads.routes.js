const express = require("express");
const leadsController = require("../controllers/leads.controller");
const { authenticateJWT } = require("../middleware/authMiddleware");
const authOrBasic = require("../middleware/authOrBasicMiddleware");

const router = express.Router();

// Public route - submit lead from the frontend
router.post("/", leadsController.submitLead);

// Admin routes - protected by authentication (using JWT OR Basic Auth)
router.get("/admin", authOrBasic, leadsController.getLeads);
router.get("/admin/export", authOrBasic, leadsController.exportLeads);
router.get("/admin/:id", authOrBasic, leadsController.getLeadById);
router.put("/admin/:id", authOrBasic, leadsController.updateLead);
router.delete("/admin/:id", authOrBasic, leadsController.deleteLead);
router.post("/admin/bulk-delete", authOrBasic, leadsController.deleteMultipleLeads);
router.post("/admin/notes", authOrBasic, leadsController.addLeadNote);

module.exports = router;
