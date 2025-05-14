// src/routes/powerWordRoutes.js
const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const powerWordController = require("../controllers/powerWordController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication middleware to all routes
router.use(authenticate);

// Category routes
router.get("/categories", powerWordController.getAllCategories);
router.get("/categories/:id", powerWordController.getCategoryById);
router.post(
  "/categories",
  [
    body("name").trim().notEmpty().withMessage("Category name is required"),
    body("description").optional().trim(),
    body("impact")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Impact must be low, medium, or high"),
  ],
  powerWordController.createCategory
);
router.put(
  "/categories/:id",
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Category name cannot be empty"),
    body("description").optional().trim(),
    body("impact")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Impact must be low, medium, or high"),
  ],
  powerWordController.updateCategory
);
router.delete("/categories/:id", powerWordController.deleteCategory);

// Power word routes
router.get("/", powerWordController.getAllPowerWords);

// Bulk operations - Place specific routes BEFORE parameterized routes
router.post(
  "/import",
  upload.single("file"),
  powerWordController.importPowerWords
);
router.get("/export", powerWordController.exportPowerWords);

// Parameterized routes - These must come AFTER specific routes
router.get("/:id", powerWordController.getPowerWordById);
router.post(
  "/",
  [
    body("word").trim().notEmpty().withMessage("Power word is required"),
    body("categoryId").optional().trim(),
    body("effectiveness")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Effectiveness rating must be between 0 and 100"),
    body("usage").optional().trim(),
    body("examples")
      .optional()
      .isArray()
      .withMessage("Examples must be an array"),
  ],
  powerWordController.createPowerWord
);
router.put(
  "/:id",
  [
    body("word")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Power word cannot be empty"),
    body("categoryId").optional().trim(),
    body("effectiveness")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Effectiveness rating must be between 0 and 100"),
    body("usage").optional().trim(),
    body("examples")
      .optional()
      .isArray()
      .withMessage("Examples must be an array"),
  ],
  powerWordController.updatePowerWord
);
router.delete("/:id", powerWordController.deletePowerWord);

// Settings routes
router.get("/settings/rating-scale", powerWordController.getRatingScale);
router.put(
  "/settings/rating-scale",
  [
    body("min")
      .isInt({ min: 0 })
      .withMessage("Minimum rating must be a non-negative integer"),
    body("max")
      .isInt({ min: 1 })
      .withMessage("Maximum rating must be at least 1"),
    body("step")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Step must be a positive integer"),
  ],
  powerWordController.updateRatingScale
);

module.exports = router;
