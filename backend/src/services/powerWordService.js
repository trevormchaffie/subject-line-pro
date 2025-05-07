// src/services/powerWordService.js
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { AppError } = require("../utils/errors");

const dataFilePath = path.join(__dirname, "../data/powerWords.json");

// Initialize data file if it doesn't exist
const initializeDataFile = async () => {
  try {
    await fs.access(dataFilePath);
  } catch (error) {
    const initialData = {
      categories: [],
      words: [],
      config: {
        ratingScale: {
          min: 1,
          max: 5,
          default: 3,
        },
      },
    };
    await fs.writeFile(dataFilePath, JSON.stringify(initialData, null, 2));
  }
};

// Read data from file
const readData = async () => {
  await initializeDataFile();
  const data = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(data);
};

// Write data to file
const writeData = async (data) => {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
};

// Get all categories
const getAllCategories = async () => {
  const data = await readData();
  return data.categories;
};

// Get category by ID
const getCategoryById = async (id) => {
  const data = await readData();
  const category = data.categories.find((c) => c.id === id);
  if (!category) {
    throw new AppError(`Category with ID ${id} not found`, 404);
  }
  return category;
};

// Create new category
const createCategory = async (categoryData) => {
  const data = await readData();

  // Check for duplicate name
  if (
    data.categories.some(
      (c) => c.name.toLowerCase() === categoryData.name.toLowerCase()
    )
  ) {
    throw new AppError(
      `Category with name '${categoryData.name}' already exists`,
      400
    );
  }

  const newCategory = {
    id: categoryData.id || categoryData.name.toLowerCase().replace(/\s+/g, "-"),
    name: categoryData.name,
    description: categoryData.description || "",
    impact: categoryData.impact || "medium",
  };

  data.categories.push(newCategory);
  await writeData(data);
  return newCategory;
};

// Update category
const updateCategory = async (id, categoryData) => {
  const data = await readData();
  const categoryIndex = data.categories.findIndex((c) => c.id === id);

  if (categoryIndex === -1) {
    throw new AppError(`Category with ID ${id} not found`, 404);
  }

  // Check for duplicate name if name is being updated
  if (
    categoryData.name &&
    data.categories.some(
      (c) =>
        c.id !== id && c.name.toLowerCase() === categoryData.name.toLowerCase()
    )
  ) {
    throw new AppError(
      `Category with name '${categoryData.name}' already exists`,
      400
    );
  }

  data.categories[categoryIndex] = {
    ...data.categories[categoryIndex],
    ...categoryData,
    id: id, // Ensure ID doesn't change
  };

  await writeData(data);
  return data.categories[categoryIndex];
};

// Delete category
const deleteCategory = async (id) => {
  const data = await readData();
  const categoryIndex = data.categories.findIndex((c) => c.id === id);

  if (categoryIndex === -1) {
    throw new AppError(`Category with ID ${id} not found`, 404);
  }

  // Check if category has words assigned
  if (data.words.some((word) => word.categoryId === id)) {
    throw new AppError(`Cannot delete category with assigned words`, 400);
  }

  data.categories.splice(categoryIndex, 1);
  await writeData(data);
  return { message: `Category with ID ${id} deleted successfully` };
};

// Get all power words
const getAllPowerWords = async (filters = {}) => {
  const data = await readData();
  let filteredWords = [...data.words];

  // Apply filters
  if (filters.categoryId) {
    filteredWords = filteredWords.filter(
      (word) => word.categoryId === filters.categoryId
    );
  }

  if (filters.minRating) {
    filteredWords = filteredWords.filter(
      (word) => word.effectivenessRating >= parseInt(filters.minRating)
    );
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredWords = filteredWords.filter(
      (word) =>
        word.word.toLowerCase().includes(searchTerm) ||
        word.description.toLowerCase().includes(searchTerm)
    );
  }

  // Apply sorting
  if (filters.sortBy) {
    const sortField = filters.sortBy;
    const sortDirection = filters.sortDir === "desc" ? -1 : 1;

    filteredWords.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortDirection;
      if (a[sortField] > b[sortField]) return 1 * sortDirection;
      return 0;
    });
  }

  return filteredWords;
};

// Get power word by ID
const getPowerWordById = async (id) => {
  const data = await readData();
  const word = data.words.find((w) => w.id === id);
  if (!word) {
    throw new AppError(`Power word with ID ${id} not found`, 404);
  }
  return word;
};

// Create new power word
const createPowerWord = async (wordData) => {
  const data = await readData();

  // Validate category exists
  if (wordData.categoryId) {
    const categoryExists = data.categories.some(
      (c) => c.id === wordData.categoryId
    );
    if (!categoryExists) {
      throw new AppError(
        `Category with ID ${wordData.categoryId} not found`,
        400
      );
    }
  }

  // Check for duplicate word
  if (
    data.words.some((w) => w.word.toLowerCase() === wordData.word.toLowerCase())
  ) {
    throw new AppError(`Power word '${wordData.word}' already exists`, 400);
  }

  // Validate effectiveness rating
  const { min, max } = data.config.ratingScale;
  if (
    wordData.effectivenessRating &&
    (wordData.effectivenessRating < min || wordData.effectivenessRating > max)
  ) {
    throw new AppError(
      `Effectiveness rating must be between ${min} and ${max}`,
      400
    );
  }

  const now = new Date().toISOString();
  const newWord = {
    id: uuidv4(),
    word: wordData.word,
    categoryId: wordData.categoryId || null,
    effectivenessRating:
      wordData.effectivenessRating || data.config.ratingScale.default,
    description: wordData.description || "",
    example: wordData.example || "",
    createdAt: now,
    updatedAt: now,
  };

  data.words.push(newWord);
  await writeData(data);
  return newWord;
};

// Update power word
const updatePowerWord = async (id, wordData) => {
  const data = await readData();
  const wordIndex = data.words.findIndex((w) => w.id === id);

  if (wordIndex === -1) {
    throw new AppError(`Power word with ID ${id} not found`, 404);
  }

  // Validate category exists
  if (wordData.categoryId) {
    const categoryExists = data.categories.some(
      (c) => c.id === wordData.categoryId
    );
    if (!categoryExists) {
      throw new AppError(
        `Category with ID ${wordData.categoryId} not found`,
        400
      );
    }
  }

  // Check for duplicate word
  if (
    wordData.word &&
    data.words.some(
      (w) => w.id !== id && w.word.toLowerCase() === wordData.word.toLowerCase()
    )
  ) {
    throw new AppError(`Power word '${wordData.word}' already exists`, 400);
  }

  // Validate effectiveness rating
  const { min, max } = data.config.ratingScale;
  if (
    wordData.effectivenessRating !== undefined &&
    (wordData.effectivenessRating < min || wordData.effectivenessRating > max)
  ) {
    throw new AppError(
      `Effectiveness rating must be between ${min} and ${max}`,
      400
    );
  }

  data.words[wordIndex] = {
    ...data.words[wordIndex],
    ...wordData,
    id: id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString(),
  };

  await writeData(data);
  return data.words[wordIndex];
};

// Delete power word
const deletePowerWord = async (id) => {
  const data = await readData();
  const wordIndex = data.words.findIndex((w) => w.id === id);

  if (wordIndex === -1) {
    throw new AppError(`Power word with ID ${id} not found`, 404);
  }

  data.words.splice(wordIndex, 1);
  await writeData(data);
  return { message: `Power word with ID ${id} deleted successfully` };
};

// Update rating scale configuration
const updateRatingScaleConfig = async (configData) => {
  const data = await readData();

  // Validate min < max
  if (configData.min >= configData.max) {
    throw new AppError("Minimum rating must be less than maximum rating", 400);
  }

  // Validate default is within range
  if (
    configData.default < configData.min ||
    configData.default > configData.max
  ) {
    throw new AppError("Default rating must be within the min-max range", 400);
  }

  data.config.ratingScale = {
    ...data.config.ratingScale,
    ...configData,
  };

  await writeData(data);
  return data.config.ratingScale;
};

// Get rating scale configuration
const getRatingScaleConfig = async () => {
  const data = await readData();
  return data.config.ratingScale;
};

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
  updateRatingScaleConfig,
  getRatingScaleConfig,
};
