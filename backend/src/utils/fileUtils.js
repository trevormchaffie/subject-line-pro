const fs = require("fs").promises;
const path = require("path");

/**
 * Utility functions for file operations
 * Handles reading, writing, and creating backup files
 */
const fileUtils = {
  /**
   * Read data from a JSON file
   * @param {string} filePath - Path to the JSON file
   * @returns {Promise<any>} - Parsed JSON data
   */
  async readJsonFile(filePath) {
    try {
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return empty array
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  },

  /**
   * Write data to a JSON file with backup creation
   * @param {string} filePath - Path to the JSON file
   * @param {any} data - Data to write (will be stringified)
   * @returns {Promise<void>}
   */
  async writeJsonFile(filePath, data) {
    // Create backup before writing
    try {
      await this.createBackup(filePath);
    } catch (error) {
      console.warn(`Could not create backup for ${filePath}:`, error.message);
      // Continue even if backup fails
    }

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });

    // Write the data
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  },

  /**
   * Create a backup of a file
   * @param {string} filePath - Path to the file to backup
   * @returns {Promise<string>} - Path to the backup file
   */
  async createBackup(filePath) {
    try {
      // Check if the source file exists
      await fs.access(filePath);

      // Create a backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupDir = path.join(path.dirname(filePath), "backups");
      const fileName = path.basename(filePath);
      const backupPath = path.join(backupDir, `${fileName}.${timestamp}.bak`);

      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      // Copy the file to the backup location
      await fs.copyFile(filePath, backupPath);

      return backupPath;
    } catch (error) {
      // If file doesn't exist, no backup needed
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  },

  /**
   * Browser-side utility functions for file operations
   * These will be used by frontend code only
   */

  // Download data as a file (browser-side)
  downloadFile(data, filename, type) {
    if (typeof window === "undefined") return; // Skip in Node.js environment

    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Download JSON (browser-side)
  downloadJson(data, filename = "export.json") {
    if (typeof window === "undefined") return; // Skip in Node.js environment

    const jsonStr = JSON.stringify(data, null, 2);
    this.downloadFile(jsonStr, filename, "application/json");
  },

  // Download CSV (browser-side)
  downloadCsv(blob, filename = "export.csv") {
    if (typeof window === "undefined") return; // Skip in Node.js environment

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Read file as text (browser-side)
  readFileAsText(file) {
    if (typeof window === "undefined") return null; // Skip in Node.js environment

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  },

  // Parse CSV to objects (browser-side)
  async parseCsvToJson(file) {
    if (typeof window === "undefined") return []; // Skip in Node.js environment

    const text = await this.readFileAsText(file);
    const lines = text.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || "";
        // Try to convert numeric values
        if (!isNaN(value) && value !== "") {
          value = Number(value);
        }
        // Convert "true"/"false" strings to booleans
        if (value === "true") value = true;
        if (value === "false") value = false;

        obj[header] = value;
      });
      result.push(obj);
    }
    return result;
  },
};

// Use CommonJS module export
module.exports = fileUtils;
