// src/routes/spamTriggerRoutes.js
const express = require("express");
const router = express.Router();
const spamTriggerController = require("../controllers/spamTriggerController");
const upload = require("../middleware/upload");

// If you have auth middleware, uncomment and add it here
// const authMiddleware = require('../middleware/authMiddleware');
// router.use(authMiddleware);

// Basic CRUD routes
router.get("/", spamTriggerController.getAll);
router.get("/:id", spamTriggerController.getById);
router.post("/", spamTriggerController.create);
router.put("/:id", spamTriggerController.update);
router.delete("/:id", spamTriggerController.delete);

// Bulk operations
router.post("/bulk", spamTriggerController.bulkCreate);
router.patch("/bulk-status", spamTriggerController.bulkUpdateStatus);
router.delete("/bulk", spamTriggerController.bulkDelete);

// Import/Export
router.get("/export/json", spamTriggerController.exportToJson);
router.post("/import/json", spamTriggerController.importFromJson);
router.get("/export/csv", spamTriggerController.exportToCsv);
router.post(
  "/import/csv",
  upload.single("file"),
  spamTriggerController.importFromCsv
);

module.exports = router;
