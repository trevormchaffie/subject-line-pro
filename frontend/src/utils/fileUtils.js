// src/utils/fileUtils.js - FRONTEND VERSION

/**
 * Browser-side utility functions for file operations
 */
export const fileUtils = {
  // Download data as a file
  downloadFile(data, filename, type) {
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

  // Download JSON
  downloadJson(data, filename = "export.json") {
    const jsonStr = JSON.stringify(data, null, 2);
    this.downloadFile(jsonStr, filename, "application/json");
  },

  // Download CSV
  downloadCsv(blob, filename = "export.csv") {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Read file as text
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  },

  // Parse CSV to objects
  async parseCsvToJson(file) {
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
