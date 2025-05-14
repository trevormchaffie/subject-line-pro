// src/controllers/powerWordController.js
const powerWordService = require("../services/powerWordService");
const { asyncHandler } = require("../middleware/asyncHandler");
const { validationResult } = require("express-validator");
const { AppError } = require("../utils/errors");

// Category controllers
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await powerWordService.getAllCategories();
  res.status(200).json({ success: true, data: categories });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await powerWordService.getCategoryById(req.params.id);
  res.status(200).json({ success: true, data: category });
});

const createCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const newCategory = await powerWordService.createCategory(req.body);
  res.status(201).json({ success: true, data: newCategory });
});

const updateCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }

  const updatedCategory = await powerWordService.updateCategory(
    req.params.id,
    req.body
  );
  res.status(200).json({ success: true, data: updatedCategory });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await powerWordService.deleteCategory(req.params.id);
  res.status(200).json({ success: true, data: result });
});

// Power word controllers
const getAllPowerWords = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    search: req.query.search,
    sortBy: req.query.sortBy,
    sortDir: req.query.sortDir,
    page: req.query.page,
    limit: req.query.limit,
  };

  const powerWords = await powerWordService.getAllPowerWords(filters);
  res.status(200).json({ success: true, data: powerWords });
});

const getPowerWordById = asyncHandler(async (req, res) => {
  const powerWord = await powerWordService.getPowerWordById(req.params.id);
  res.status(200).json({ success: true, data: powerWord });
});

const createPowerWord = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }

  const newPowerWord = await powerWordService.createPowerWord(req.body);
  res.status(201).json({ success: true, data: newPowerWord });
});

const updatePowerWord = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }

  const updatedPowerWord = await powerWordService.updatePowerWord(
    req.params.id,
    req.body
  );
  res.status(200).json({ success: true, data: updatedPowerWord });
});

const deletePowerWord = asyncHandler(async (req, res) => {
  const result = await powerWordService.deletePowerWord(req.params.id);
  res.status(200).json({ success: true, data: result });
});

// Import/Export controllers
const importPowerWords = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  const jsonData = JSON.parse(req.file.buffer.toString());
  const result = await powerWordService.importPowerWords(jsonData);
  res.status(200).json({ success: true, data: result });
});

const exportPowerWords = asyncHandler(async (req, res) => {
  console.log("Export controller called with categoryId:", req.query.categoryId);
  
  try {
    const data = await powerWordService.exportPowerWords(req.query.categoryId);
    console.log("Export data prepared:", data.length, "words");
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="power-words.json"'
    );
    res.json(data);
  } catch (error) {
    console.error("Export error:", error);
    throw error;
  }
});

// Rating scale controllers
const getRatingScale = asyncHandler(async (req, res) => {
  const config = await powerWordService.getRatingScale();
  res.status(200).json({ success: true, data: config });
});

const updateRatingScale = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }

  const updatedConfig = await powerWordService.updateRatingScale(req.body);
  res.status(200).json({ success: true, data: updatedConfig });
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllPowerWords,
  getPowerWordById,
  createPowerWord,
  updatePowerWord,
  deletePowerWord,
  importPowerWords,
  exportPowerWords,
  getRatingScale,
  updateRatingScale,
};
