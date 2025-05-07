// src/routes/powerWordRoutes.js
const express = require("express");
const { body } = require("express-validator");
const powerWordController = require("../controllers/powerWordController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

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
router.get("/words", powerWordController.getAllPowerWords);
router.get("/words/:id", powerWordController.getPowerWordById);
router.post(
  "/words",
  [
    body("word").trim().notEmpty().withMessage("Power word is required"),
    body("categoryId").optional().trim(),
    body("effectivenessRating")
      .optional()
      .isInt()
      .withMessage("Effectiveness rating must be a number"),
    body("description").optional().trim(),
    body("example").optional().trim(),
  ],
  powerWordController.createPowerWord
);
router.put(
  "/words/:id",
  [
    body("word")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Power word cannot be empty"),
    body("categoryId").optional().trim(),
    body("effectivenessRating")
      .optional()
      .isInt()
      .withMessage("Effectiveness rating must be a number"),
    body("description").optional().trim(),
    body("example").optional().trim(),
  ],
  powerWordController.updatePowerWord
);
router.delete("/words/:id", powerWordController.deletePowerWord);

// Rating config routes
router.get("/rating-config", powerWordController.getRatingConfig);
router.put(
  "/rating-config",
  [
    body("min")
      .isInt({ min: 1 })
      .withMessage("Minimum rating must be a positive integer"),
    body("max")
      .isInt({ min: 2 })
      .withMessage("Maximum rating must be at least 2"),
    body("default").isInt().withMessage("Default rating must be a number"),
  ],
  powerWordController.updateRatingConfig
);

module.exports = router;
