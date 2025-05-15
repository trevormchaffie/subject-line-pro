const { body } = require("express-validator");

/**
 * Validation rules for templates
 */
const templateValidator = {
  createTemplate: [
    body("name")
      .notEmpty()
      .withMessage("Template name is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Name must be between 3 and 100 characters"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    body("category")
      .optional()
      .isIn(["length", "spam", "power-words", "personalization", "general"])
      .withMessage("Invalid category"),
    body("content")
      .notEmpty()
      .withMessage("Template content is required")
      .isLength({ min: 5, max: 5000 })
      .withMessage("Content must be between 5 and 5000 characters"),
  ],

  updateTemplate: [
    body("name")
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage("Name must be between 3 and 100 characters"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    body("category")
      .optional()
      .isIn(["length", "spam", "power-words", "personalization", "general"])
      .withMessage("Invalid category"),
    body("content")
      .optional()
      .isLength({ min: 5, max: 5000 })
      .withMessage("Content must be between 5 and 5000 characters"),
    body("versionDescription")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Version description cannot exceed 200 characters"),
  ],

  testTemplate: [
    body("content").notEmpty().withMessage("Template content is required"),
    body("variables").isObject().withMessage("Variables must be an object"),
  ],

  createVariable: [
    body("name")
      .notEmpty()
      .withMessage("Variable name is required")
      .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
      .withMessage(
        "Variable name must start with a letter and contain only letters, numbers, and underscores"
      )
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Description cannot exceed 200 characters"),
    body("defaultValue")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Default value cannot exceed 100 characters"),
    body("type")
      .optional()
      .isIn(["text", "number", "date", "boolean"])
      .withMessage("Invalid variable type"),
  ],
};

module.exports = templateValidator;
