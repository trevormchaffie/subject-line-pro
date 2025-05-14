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
      powerWords: [],
      settings: {
        ratingScale: {
          min: 0,
          max: 100,
          step: 5,
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
  
  // Convert ID to number if it's a numeric string
  const numericId = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
  
  // Find the category using a more flexible approach that handles both string and number IDs
  const category = data.categories.find(c => {
    // Convert category ID to number if it's a numeric string
    const catId = typeof c.id === 'string' && !isNaN(c.id) ? parseInt(c.id, 10) : c.id;
    return catId === numericId || c.id === id.toString();
  });
  
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
  
  // Convert ID to number if it's a numeric string
  const numericId = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
  
  // Find the category using a more flexible approach that handles both string and number IDs
  const categoryIndex = data.categories.findIndex(c => {
    // Convert category ID to number if it's a numeric string
    const catId = typeof c.id === 'string' && !isNaN(c.id) ? parseInt(c.id, 10) : c.id;
    return catId === numericId || c.id === id.toString();
  });

  if (categoryIndex === -1) {
    throw new AppError(`Category with ID ${id} not found`, 404);
  }

  // Check for duplicate name if name is being updated
  if (categoryData.name) {
    const nameExists = data.categories.some((c) => {
      // Skip the current category being updated (using flexible ID comparison)
      const currentCategoryId = typeof c.id === 'string' && !isNaN(c.id) ? parseInt(c.id, 10) : c.id;
      const idToCheck = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
      
      const isSameCategory = currentCategoryId === idToCheck || c.id === id.toString();
      
      // If it's the same category, allow the name update
      if (isSameCategory) {
        return false;
      }
      
      // Check if another category has the same name
      return c.name.toLowerCase() === categoryData.name.toLowerCase();
    });
    
    if (nameExists) {
      throw new AppError(
        `Category with name '${categoryData.name}' already exists`,
        400
      );
    }
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
  
  // Convert ID to number if it's a numeric string
  const numericId = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
  
  // Find the category using a more flexible approach that handles both string and number IDs
  const categoryIndex = data.categories.findIndex(c => {
    // Convert category ID to number if it's a numeric string
    const catId = typeof c.id === 'string' && !isNaN(c.id) ? parseInt(c.id, 10) : c.id;
    return catId === numericId || c.id === id.toString();
  });

  if (categoryIndex === -1) {
    throw new AppError(`Category with ID ${id} not found`, 404);
  }

  // Check if category has words assigned
  if (data.powerWords.some((word) => {
    const wordCategoryId = typeof word.categoryId === 'string' && !isNaN(word.categoryId) 
      ? parseInt(word.categoryId, 10) 
      : word.categoryId;
    return wordCategoryId === numericId || word.categoryId === id.toString();
  })) {
    throw new AppError(`Cannot delete category with assigned words`, 400);
  }

  data.categories.splice(categoryIndex, 1);
  await writeData(data);
  return { message: `Category with ID ${id} deleted successfully` };
};

// Get all power words
const getAllPowerWords = async (filters = {}) => {
  const data = await readData();
  let filteredWords = [...data.powerWords];

  // Apply filters
  if (filters.category) {
    filteredWords = filteredWords.filter(
      (word) => word.categoryId === filters.category
    );
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredWords = filteredWords.filter(
      (word) =>
        word.word.toLowerCase().includes(searchTerm) ||
        word.usage.toLowerCase().includes(searchTerm)
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

  // Apply pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const startIndex = (page - 1) * limit;

  const paginatedWords = filteredWords.slice(startIndex, startIndex + limit);

  return {
    data: paginatedWords,
    total: filteredWords.length,
    page,
    limit,
    totalPages: Math.ceil(filteredWords.length / limit),
  };
};

// Get power word by ID
const getPowerWordById = async (id) => {
  const data = await readData();
  
  // Convert ID to number if it's a numeric string
  const numericId = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
  
  // Find the power word using a more flexible approach that handles both string and number IDs
  const word = data.powerWords.find(w => {
    // Convert word ID to number if it's a numeric string
    const wordId = typeof w.id === 'string' && !isNaN(w.id) ? parseInt(w.id, 10) : w.id;
    return wordId === numericId || w.id === id.toString();
  });
  
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
    // Convert categoryId to number if it's a numeric string
    const categoryId = typeof wordData.categoryId === 'string' && !isNaN(wordData.categoryId) 
      ? parseInt(wordData.categoryId, 10) 
      : wordData.categoryId;
    
    const categoryExists = data.categories.some(c => {
      // Convert category id to number if needed for comparison
      const catId = typeof c.id === 'string' && !isNaN(c.id) ? parseInt(c.id, 10) : c.id;
      return catId === categoryId || c.id === categoryId.toString();
    });
    
    if (!categoryExists) {
      throw new AppError(
        `Category with ID ${wordData.categoryId} not found`,
        400
      );
    }
  }

  // Check for duplicate word
  if (
    data.powerWords.some(
      (w) => w.word.toLowerCase() === wordData.word.toLowerCase()
    )
  ) {
    throw new AppError(`Power word '${wordData.word}' already exists`, 400);
  }

  // Validate effectiveness rating
  const { min, max } = data.settings.ratingScale;
  if (
    wordData.effectiveness &&
    (wordData.effectiveness < min || wordData.effectiveness > max)
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
    effectiveness: wordData.effectiveness || 70,
    usage: wordData.usage || "",
    examples: wordData.examples || [],
    createdAt: now,
    updatedAt: now,
  };

  data.powerWords.push(newWord);
  await writeData(data);
  return newWord;
};

// Update power word
const updatePowerWord = async (id, wordData) => {
  const data = await readData();
  
  // Check if id is a string and convert to number if needed
  const numericId = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
  
  const wordIndex = data.powerWords.findIndex((w) => {
    // Handle both numeric and string IDs
    const wordId = typeof w.id === 'string' && !isNaN(w.id) ? parseInt(w.id, 10) : w.id;
    return wordId === numericId || w.id === id.toString();
  });

  if (wordIndex === -1) {
    throw new AppError(`Power word with ID ${id} not found`, 404);
  }

  // Validate category exists
  if (wordData.categoryId) {
    // Convert categoryId to number if it's a numeric string
    const categoryId = typeof wordData.categoryId === 'string' && !isNaN(wordData.categoryId) 
      ? parseInt(wordData.categoryId, 10) 
      : wordData.categoryId;
    
    const categoryExists = data.categories.some(c => {
      // Convert category id to number if needed for comparison
      const catId = typeof c.id === 'string' && !isNaN(c.id) ? parseInt(c.id, 10) : c.id;
      return catId === categoryId || c.id === categoryId.toString();
    });
    
    if (!categoryExists) {
      throw new AppError(
        `Category with ID ${wordData.categoryId} not found`,
        400
      );
    }
  }

  // Check for duplicate word
  if (wordData.word) {
    const wordExists = data.powerWords.some((w) => {
      // Skip the current word being updated (using flexible ID comparison)
      const currentWordId = typeof w.id === 'string' && !isNaN(w.id) ? parseInt(w.id, 10) : w.id;
      const idToCheck = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
      
      const isSameWord = currentWordId === idToCheck || w.id === id.toString();
      
      // If it's the same word, allow the update
      if (isSameWord) {
        return false;
      }
      
      // Check if another word has the same name
      return w.word.toLowerCase() === wordData.word.toLowerCase();
    });
    
    if (wordExists) {
      throw new AppError(`Power word '${wordData.word}' already exists`, 400);
    }
  }

  // Validate effectiveness rating
  const { min, max } = data.settings.ratingScale;
  if (
    wordData.effectiveness !== undefined &&
    (wordData.effectiveness < min || wordData.effectiveness > max)
  ) {
    throw new AppError(
      `Effectiveness rating must be between ${min} and ${max}`,
      400
    );
  }

  data.powerWords[wordIndex] = {
    ...data.powerWords[wordIndex],
    ...wordData,
    id: id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString(),
  };

  await writeData(data);
  return data.powerWords[wordIndex];
};

// Delete power word
const deletePowerWord = async (id) => {
  const data = await readData();
  
  // Convert ID to number if it's a numeric string
  const numericId = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
  
  // Find the power word using a more flexible approach that handles both string and number IDs
  const wordIndex = data.powerWords.findIndex(w => {
    // Convert word ID to number if it's a numeric string
    const wordId = typeof w.id === 'string' && !isNaN(w.id) ? parseInt(w.id, 10) : w.id;
    return wordId === numericId || w.id === id.toString();
  });

  if (wordIndex === -1) {
    throw new AppError(`Power word with ID ${id} not found`, 404);
  }

  data.powerWords.splice(wordIndex, 1);
  await writeData(data);
  return { message: `Power word with ID ${id} deleted successfully` };
};

// Import power words
const importPowerWords = async (importData) => {
  const data = await readData();
  let imported = 0;
  let errors = [];

  for (const item of importData) {
    try {
      if (!item.word || !item.categoryId) {
        errors.push(`Invalid data: ${JSON.stringify(item)}`);
        continue;
      }

      const existing = data.powerWords.find(
        (w) => w.word.toLowerCase() === item.word.toLowerCase()
      );

      if (existing) {
        errors.push(`Duplicate word: ${item.word}`);
        continue;
      }

      // Validate category exists
      const categoryId = typeof item.categoryId === 'string' && !isNaN(item.categoryId) 
        ? parseInt(item.categoryId, 10) 
        : item.categoryId;
      
      const categoryExists = data.categories.some(c => {
        // Convert category id to number if needed for comparison
        const catId = typeof c.id === 'string' && !isNaN(c.id) ? parseInt(c.id, 10) : c.id;
        return catId === categoryId || c.id === categoryId.toString();
      });
      
      if (!categoryExists) {
        errors.push(`Category with ID ${item.categoryId} not found for word: ${item.word}`);
        continue;
      }

      data.powerWords.push({
        id: uuidv4(),
        word: item.word,
        categoryId: item.categoryId,
        effectiveness: item.effectiveness || 70,
        usage: item.usage || "",
        examples: item.examples || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      imported++;
    } catch (err) {
      errors.push(`Error processing ${item.word}: ${err.message}`);
    }
  }

  await writeData(data);
  return { imported, errors };
};

// Export power words
const exportPowerWords = async (categoryId = null) => {
  const data = await readData();
  let words = data.powerWords;

  if (categoryId) {
    // Convert categoryId to number if it's a numeric string
    const numericCategoryId = typeof categoryId === 'string' && !isNaN(categoryId) 
      ? parseInt(categoryId, 10) 
      : categoryId;
    
    words = words.filter(w => {
      // Convert word's categoryId to number if it's a numeric string
      const wordCategoryId = typeof w.categoryId === 'string' && !isNaN(w.categoryId) 
        ? parseInt(w.categoryId, 10) 
        : w.categoryId;
      
      return wordCategoryId === numericCategoryId || w.categoryId === categoryId.toString();
    });
  }

  return words.map((w) => ({
    word: w.word,
    categoryId: w.categoryId,
    effectiveness: w.effectiveness,
    usage: w.usage,
    examples: w.examples,
  }));
};

// Update rating scale configuration
const updateRatingScale = async (scaleData) => {
  const data = await readData();

  data.settings.ratingScale = {
    ...data.settings.ratingScale,
    ...scaleData,
  };

  await writeData(data);
  return data.settings.ratingScale;
};

// Get rating scale configuration
const getRatingScale = async () => {
  const data = await readData();
  return data.settings.ratingScale;
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
  importPowerWords,
  exportPowerWords,
  updateRatingScale,
  getRatingScale,
};
