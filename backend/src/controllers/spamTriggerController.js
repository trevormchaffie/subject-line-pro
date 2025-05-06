// src/controllers/spamTriggerController.js
const fs = require("fs").promises;
const path = require("path");
const fileUtils = require("../utils/fileUtils");

// Path to the spam triggers data file
const TRIGGERS_FILE = path.join(__dirname, "../data/spamTriggers.json");

// Ensure the data directory exists
const ensureDataDir = async () => {
  const dataDir = path.dirname(TRIGGERS_FILE);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
};

// Helper to generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Controller methods
const spamTriggerController = {
  // Get all spam triggers
  async getAll(req, res) {
    try {
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);
      res.json(triggers);
    } catch (error) {
      console.error("Error fetching spam triggers:", error);
      res.status(500).json({ message: "Failed to fetch spam triggers" });
    }
  },

  // Get a single spam trigger by ID
  async getById(req, res) {
    try {
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);
      const trigger = triggers.find((t) => t.id === req.params.id);

      if (!trigger) {
        return res.status(404).json({ message: "Spam trigger not found" });
      }

      res.json(trigger);
    } catch (error) {
      console.error("Error fetching spam trigger:", error);
      res.status(500).json({ message: "Failed to fetch spam trigger" });
    }
  },

  // Create a new spam trigger
  async create(req, res) {
    try {
      const { pattern, category, impact, description, active } = req.body;

      // Basic validation
      if (!pattern || !category) {
        return res
          .status(400)
          .json({ message: "Pattern and category are required" });
      }

      // Load existing triggers
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);

      // Check for duplicates
      if (
        triggers.some((t) => t.pattern.toLowerCase() === pattern.toLowerCase())
      ) {
        return res
          .status(400)
          .json({ message: "Spam trigger with this pattern already exists" });
      }

      // Create new trigger
      const newTrigger = {
        id: generateId(),
        pattern,
        category,
        impact: impact || 50,
        description: description || "",
        active: active === undefined ? true : active,
        createdAt: new Date().toISOString(),
      };

      // Add to collection and save
      triggers.push(newTrigger);
      await fileUtils.writeJsonFile(TRIGGERS_FILE, triggers);

      res.status(201).json(newTrigger);
    } catch (error) {
      console.error("Error creating spam trigger:", error);
      res.status(500).json({ message: "Failed to create spam trigger" });
    }
  },

  // Update an existing spam trigger
  async update(req, res) {
    try {
      const { pattern, category, impact, description, active } = req.body;
      const triggerId = req.params.id;

      // Basic validation
      if ((!pattern && pattern !== "") || (!category && category !== "")) {
        return res
          .status(400)
          .json({ message: "Pattern and category are required" });
      }

      // Load existing triggers
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);

      // Find the trigger to update
      const index = triggers.findIndex((t) => t.id === triggerId);
      if (index === -1) {
        return res.status(404).json({ message: "Spam trigger not found" });
      }

      // Check for duplicates if pattern is changed
      if (
        pattern !== triggers[index].pattern &&
        triggers.some(
          (t) =>
            t.id !== triggerId &&
            t.pattern.toLowerCase() === pattern.toLowerCase()
        )
      ) {
        return res
          .status(400)
          .json({ message: "Spam trigger with this pattern already exists" });
      }

      // Update the trigger
      const updatedTrigger = {
        ...triggers[index],
        pattern: pattern !== undefined ? pattern : triggers[index].pattern,
        category: category !== undefined ? category : triggers[index].category,
        impact: impact !== undefined ? impact : triggers[index].impact,
        description:
          description !== undefined ? description : triggers[index].description,
        active: active !== undefined ? active : triggers[index].active,
        updatedAt: new Date().toISOString(),
      };

      triggers[index] = updatedTrigger;
      await fileUtils.writeJsonFile(TRIGGERS_FILE, triggers);

      res.json(updatedTrigger);
    } catch (error) {
      console.error("Error updating spam trigger:", error);
      res.status(500).json({ message: "Failed to update spam trigger" });
    }
  },

  // Delete a spam trigger
  async delete(req, res) {
    try {
      const triggerId = req.params.id;

      // Load existing triggers
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);

      // Find the trigger to delete
      const index = triggers.findIndex((t) => t.id === triggerId);
      if (index === -1) {
        return res.status(404).json({ message: "Spam trigger not found" });
      }

      // Remove trigger
      triggers.splice(index, 1);
      await fileUtils.writeJsonFile(TRIGGERS_FILE, triggers);

      res.json({ success: true, message: "Spam trigger deleted successfully" });
    } catch (error) {
      console.error("Error deleting spam trigger:", error);
      res.status(500).json({ message: "Failed to delete spam trigger" });
    }
  },

  // Bulk create/update triggers
  async bulkCreate(req, res) {
    try {
      const { triggers: newTriggers } = req.body;

      if (!Array.isArray(newTriggers) || newTriggers.length === 0) {
        return res
          .status(400)
          .json({ message: "No triggers provided for bulk creation" });
      }

      // Load existing triggers
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);

      const createdTriggers = [];
      const updatedTriggers = [];

      for (const newTrigger of newTriggers) {
        // Skip invalid triggers
        if (!newTrigger.pattern || !newTrigger.category) {
          continue;
        }

        // Check if trigger exists
        const existingIndex = triggers.findIndex(
          (t) => t.pattern.toLowerCase() === newTrigger.pattern.toLowerCase()
        );

        if (existingIndex !== -1) {
          // Update existing trigger
          triggers[existingIndex] = {
            ...triggers[existingIndex],
            ...newTrigger,
            updatedAt: new Date().toISOString(),
          };
          updatedTriggers.push(triggers[existingIndex]);
        } else {
          // Create new trigger
          const createdTrigger = {
            id: generateId(),
            pattern: newTrigger.pattern,
            category: newTrigger.category,
            impact: newTrigger.impact || 50,
            description: newTrigger.description || "",
            active: newTrigger.active === undefined ? true : newTrigger.active,
            createdAt: new Date().toISOString(),
          };

          triggers.push(createdTrigger);
          createdTriggers.push(createdTrigger);
        }
      }

      await fileUtils.writeJsonFile(TRIGGERS_FILE, triggers);

      res.status(201).json({
        created: createdTriggers.length,
        updated: updatedTriggers.length,
        triggers: [...createdTriggers, ...updatedTriggers],
      });
    } catch (error) {
      console.error("Error in bulk trigger creation:", error);
      res
        .status(500)
        .json({ message: "Failed to process bulk trigger creation" });
    }
  },

  // Update active status for multiple triggers
  async bulkUpdateStatus(req, res) {
    try {
      const { ids, active } = req.body;

      if (!Array.isArray(ids) || ids.length === 0 || active === undefined) {
        return res.status(400).json({
          message:
            "Invalid request. Please provide an array of IDs and active status.",
        });
      }

      // Load existing triggers
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);

      // Update status for each ID
      const updatedIds = [];

      for (const id of ids) {
        const index = triggers.findIndex((t) => t.id === id);
        if (index !== -1) {
          triggers[index].active = active;
          triggers[index].updatedAt = new Date().toISOString();
          updatedIds.push(id);
        }
      }

      await fileUtils.writeJsonFile(TRIGGERS_FILE, triggers);

      res.json({
        success: true,
        message: `${updatedIds.length} spam triggers updated`,
        updatedIds,
      });
    } catch (error) {
      console.error("Error updating trigger status:", error);
      res.status(500).json({ message: "Failed to update trigger status" });
    }
  },

  // Delete multiple triggers
  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          message: "Invalid request. Please provide an array of IDs to delete.",
        });
      }

      // Load existing triggers
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);

      // Filter out triggers to delete
      const initialCount = triggers.length;
      const filteredTriggers = triggers.filter((t) => !ids.includes(t.id));
      const deletedCount = initialCount - filteredTriggers.length;

      await fileUtils.writeJsonFile(TRIGGERS_FILE, filteredTriggers);

      res.json({
        success: true,
        message: `${deletedCount} spam triggers deleted successfully`,
        deletedCount,
      });
    } catch (error) {
      console.error("Error deleting triggers:", error);
      res.status(500).json({ message: "Failed to delete triggers" });
    }
  },

  // Export to JSON
  async exportToJson(req, res) {
    try {
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);
      res.json(triggers);
    } catch (error) {
      console.error("Error exporting triggers to JSON:", error);
      res.status(500).json({ message: "Failed to export triggers" });
    }
  },

  // Import from JSON
  async importFromJson(req, res) {
    try {
      const { data } = req.body;

      if (!Array.isArray(data)) {
        return res.status(400).json({
          message: "Invalid data format. Expected an array of triggers.",
        });
      }

      // Validate each trigger
      const validTriggers = data.filter(
        (trigger) => trigger.pattern && trigger.category
      );

      // Assign IDs to triggers that don't have them
      const processedTriggers = validTriggers.map((trigger) => ({
        ...trigger,
        id: trigger.id || generateId(),
        createdAt: trigger.createdAt || new Date().toISOString(),
        impact: trigger.impact || 50,
        active: trigger.active === undefined ? true : trigger.active,
      }));

      await fileUtils.writeJsonFile(TRIGGERS_FILE, processedTriggers);

      res.json({
        success: true,
        message: `${processedTriggers.length} triggers imported successfully`,
        count: processedTriggers.length,
      });
    } catch (error) {
      console.error("Error importing triggers from JSON:", error);
      res.status(500).json({ message: "Failed to import triggers from JSON" });
    }
  },

  // Export to CSV
  async exportToCsv(req, res) {
    try {
      const triggers = await fileUtils.readJsonFile(TRIGGERS_FILE);

      // Define CSV columns and header
      const columns = [
        "id",
        "pattern",
        "category",
        "impact",
        "description",
        "active",
      ];
      const header = columns.join(",");

      // Generate CSV rows
      const rows = triggers.map((trigger) => {
        return columns
          .map((column) => {
            const value = trigger[column];

            // Handle special cases for CSV formatting
            if (typeof value === "string") {
              // Escape quotes and wrap in quotes if contains commas or quotes
              if (value.includes(",") || value.includes('"')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }

            // Convert booleans and numbers to string
            return String(value);
          })
          .join(",");
      });

      // Combine header and rows
      const csvContent = [header, ...rows].join("\n");

      // Set headers for download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=spam-triggers.csv"
      );

      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting triggers to CSV:", error);
      res.status(500).json({ message: "Failed to export triggers to CSV" });
    }
  },

  // Import from CSV
  async importFromCsv(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvText = await fs.readFile(req.file.path, "utf8");
      const lines = csvText.split("\n");

      // Parse header to get column indices
      const header = lines[0].split(",");
      const columnIndices = {
        pattern: header.indexOf("pattern"),
        category: header.indexOf("category"),
        impact: header.indexOf("impact"),
        description: header.indexOf("description"),
        active: header.indexOf("active"),
        id: header.indexOf("id"),
      };

      // Validate required columns
      if (columnIndices.pattern === -1 || columnIndices.category === -1) {
        return res.status(400).json({
          message:
            "Invalid CSV format. Missing required columns: pattern, category",
        });
      }

      // Parse CSV rows into triggers
      const triggers = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted values with commas
        const values = [];
        let inQuote = false;
        let currentValue = "";

        for (let j = 0; j < line.length; j++) {
          const char = line[j];

          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === "," && !inQuote) {
            values.push(currentValue);
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue); // Add the last value

        // Create trigger object
        const trigger = {
          id:
            columnIndices.id !== -1
              ? values[columnIndices.id] || generateId()
              : generateId(),
          pattern: values[columnIndices.pattern],
          category: values[columnIndices.category],
          impact:
            columnIndices.impact !== -1
              ? parseInt(values[columnIndices.impact], 10) || 50
              : 50,
          description:
            columnIndices.description !== -1
              ? values[columnIndices.description] || ""
              : "",
          active:
            columnIndices.active !== -1
              ? values[columnIndices.active].toLowerCase() === "true"
              : true,
          createdAt: new Date().toISOString(),
        };

        if (trigger.pattern && trigger.category) {
          triggers.push(trigger);
        }
      }

      // Clean up the uploaded file
      await fs.unlink(req.file.path);

      // Save triggers
      await fileUtils.writeJsonFile(TRIGGERS_FILE, triggers);

      res.json({
        success: true,
        message: `${triggers.length} triggers imported successfully`,
        count: triggers.length,
      });
    } catch (error) {
      console.error("Error importing triggers from CSV:", error);
      res.status(500).json({ message: "Failed to import triggers from CSV" });
    }
  },
};

module.exports = spamTriggerController;
