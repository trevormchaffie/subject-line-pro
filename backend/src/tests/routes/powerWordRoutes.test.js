// tests/routes/powerWordRoutes.test.js
const request = require("supertest");
const express = require("express");
const powerWordRoutes = require("../../routes/powerWordRoutes");
const powerWordService = require("../../services/powerWordService");

// Mock the service
jest.mock("../../services/powerWordService");

// Mock auth middleware
jest.mock("../../middleware/auth", () => ({
  authenticate: (req, res, next) => next(),
}));

// Create express app for testing
const app = express();
app.use(express.json());
app.use("/api/power-words", powerWordRoutes);

describe("Power Word Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /categories", () => {
    it("should get all categories", async () => {
      const mockCategories = [{ id: "test", name: "Test Category" }];

      powerWordService.getAllCategories.mockResolvedValue(mockCategories);

      const res = await request(app).get("/api/power-words/categories");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockCategories);
      expect(powerWordService.getAllCategories).toHaveBeenCalled();
    });
  });

  describe("POST /categories", () => {
    it("should create a new category", async () => {
      const newCategory = {
        name: "New Category",
        description: "Test",
        impact: "medium",
      };
      const createdCategory = { id: "new-category", ...newCategory };

      powerWordService.createCategory.mockResolvedValue(createdCategory);

      const res = await request(app)
        .post("/api/power-words/categories")
        .send(newCategory);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(createdCategory);
      expect(powerWordService.createCategory).toHaveBeenCalledWith(newCategory);
    });

    it("should validate required fields", async () => {
      const res = await request(app)
        .post("/api/power-words/categories")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // Add more tests for other routes...
});
