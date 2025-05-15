const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");
const templateValidator = require("../middleware/templateValidator");
const { authenticate } = require("../middleware/authMiddleware");
const config = require("../config/config");

// Allow optional authentication for development
const authMiddleware = config.nodeEnv === 'development' 
  ? (req, res, next) => {
      // Add a dummy user for development
      req.user = { id: "dev-user-id", role: "admin" };
      next();
    }
  : authenticate;

// Template routes
router.get("/", authMiddleware, templateController.getAllTemplates);
router.get("/:id", authMiddleware, templateController.getTemplateById);
router.post(
  "/",
  authMiddleware,
  templateValidator.createTemplate,
  templateController.createTemplate
);
router.put(
  "/:id",
  authMiddleware,
  templateValidator.updateTemplate,
  templateController.updateTemplate
);
router.delete("/:id", authMiddleware, templateController.deleteTemplate);

// Version routes
router.get("/:id/versions", authMiddleware, templateController.getTemplateVersions);
router.post(
  "/:id/versions/:versionId/rollback",
  authMiddleware,
  templateController.rollbackToVersion
);

// Testing route
router.post(
  "/test",
  authMiddleware,
  templateValidator.testTemplate,
  templateController.testTemplate
);

// Variable routes
router.get("/variables/all", authMiddleware, templateController.getVariables);
router.post(
  "/variables",
  authMiddleware,
  templateValidator.createVariable,
  templateController.createVariable
);

module.exports = router;