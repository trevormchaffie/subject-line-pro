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
};

module.exports = fileUtils;
