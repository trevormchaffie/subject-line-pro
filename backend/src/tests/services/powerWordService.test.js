// tests/services/powerWordService.test.js
const powerWordService = require("../../services/powerWordService");
const fs = require("fs").promises;
const path = require("path");
const { AppError } = require("../../utils/errors");

// Mock the fs module
jest.mock("fs", () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe("Power Word Service", () => {
  const mockData = {
    categories: [
      {
        id: "urgency",
        name: "Urgency",
        description: "Urgency words",
        impact: "high",
      },
    ],
    words: [
      {
        id: "1",
        word: "limited",
        categoryId: "urgency",
        effectivenessRating: 4,
        description: "Test",
        example: "Example",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    config: {
      ratingScale: {
        min: 1,
        max: 5,
        default: 3,
      },
    },
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    fs.access.mockResolvedValue(undefined);
    fs.readFile.mockResolvedValue(JSON.stringify(mockData));
    fs.writeFile.mockResolvedValue(undefined);
  });

  describe("getAllCategories", () => {
    it("should return all categories", async () => {
      const categories = await powerWordService.getAllCategories();
      expect(categories).toEqual(mockData.categories);
      expect(fs.readFile).toHaveBeenCalled();
    });
  });

  describe("getCategoryById", () => {
    it("should return a category by ID", async () => {
      const category = await powerWordService.getCategoryById("urgency");
      expect(category).toEqual(mockData.categories[0]);
    });

    it("should throw an error if category not found", async () => {
      await expect(
        powerWordService.getCategoryById("nonexistent")
      ).rejects.toThrow(AppError);
    });
  });

  // Add more tests for other service methods...
});
