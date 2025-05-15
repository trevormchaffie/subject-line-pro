const fs = require("fs").promises;
const path = require("path");

// Create a simplified Variable model for file-based storage
const Variable = {
  async findOneAndUpdate(query, update, options) {
    try {
      const dataDir = path.join(__dirname);
      const filePath = path.join(dataDir, "template_variables.json");

      // Read existing data
      let variables = [];
      try {
        const data = await fs.readFile(filePath, "utf8");
        variables = JSON.parse(data);
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }

      // Find matching variable
      const index = variables.findIndex((v) => v.name === query.name);

      if (index !== -1) {
        // Update existing variable
        variables[index] = { ...variables[index], ...update };
        const updatedVar = variables[index];

        // Write back to file
        await fs.writeFile(filePath, JSON.stringify(variables, null, 2));
        return updatedVar;
      } else if (options.upsert) {
        // Create new variable with unique ID
        const newVariable = {
          id: Date.now().toString(),
          ...update,
          createdAt: new Date().toISOString(),
        };

        variables.push(newVariable);

        // Write back to file
        await fs.writeFile(filePath, JSON.stringify(variables, null, 2));
        return newVariable;
      }

      return null;
    } catch (error) {
      console.error("Error in findOneAndUpdate:", error);
      throw error;
    }
  },
};

/**
 * Initialize default system variables
 */
const initializeDefaultVariables = async () => {
  // Check if variables file exists and has content
  const dataDir = path.join(__dirname);
  const filePath = path.join(dataDir, "template_variables.json");
  
  try {
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    if (fileExists) {
      const data = await fs.readFile(filePath, "utf8");
      const variables = JSON.parse(data);
      
      // If file already has variables, don't reinitialize
      if (variables && variables.length > 0) {
        console.log("Default template variables already exist, skipping initialization");
        return;
      }
    }
  } catch (err) {
    // File doesn't exist or is invalid, proceed with initialization
  }
  
  const defaultVariables = [
    {
      name: "customer_name",
      description: "Customer or recipient name",
      defaultValue: "Customer",
      type: "text",
      isSystem: true,
    },
    {
      name: "product",
      description: "Product or service name",
      defaultValue: "Product",
      type: "text",
      isSystem: true,
    },
    {
      name: "discount",
      description: "Discount percentage",
      defaultValue: "20",
      type: "number",
      isSystem: true,
    },
    {
      name: "deadline",
      description: "Offer deadline or expiration date",
      defaultValue: "tomorrow",
      type: "text",
      isSystem: true,
    },
    {
      name: "company",
      description: "Company name",
      defaultValue: "Company",
      type: "text",
      isSystem: true,
    },
  ];

  try {
    // Write the variables directly to the file
    await fs.writeFile(filePath, JSON.stringify(defaultVariables, null, 2));
    console.log("Default template variables initialized");
  } catch (error) {
    console.error("Error initializing variables:", error);
    throw error;
  }
};

module.exports = { initializeDefaultVariables, Variable };
