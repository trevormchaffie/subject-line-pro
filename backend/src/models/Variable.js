const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const variablesFilePath = path.join(__dirname, "../data/template_variables.json");

// Helper functions
const ensureFileExists = async (filePath, defaultData = []) => {
  try {
    await fs.access(filePath);
  } catch (error) {
    // File doesn't exist, create it with default data
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
  }
};

const readVariables = async () => {
  await ensureFileExists(variablesFilePath);
  const data = await fs.readFile(variablesFilePath, "utf8");
  return JSON.parse(data);
};

const writeVariables = async (variables) => {
  await fs.writeFile(variablesFilePath, JSON.stringify(variables, null, 2));
};

// Create backup of variables file
const createBackup = async () => {
  const data = await fs.readFile(variablesFilePath, "utf8");
  const backupDir = path.join(path.dirname(variablesFilePath), "backups");
  
  try {
    await fs.access(backupDir);
  } catch (error) {
    await fs.mkdir(backupDir);
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const backupPath = path.join(
    backupDir, 
    `${path.basename(variablesFilePath)}.${timestamp}.bak`
  );
  
  await fs.writeFile(backupPath, data);
  return backupPath;
};

// Variable model
const Variable = {
  // Find all variables
  async find() {
    const variables = await readVariables();
    
    // Sort alphabetically by name
    return variables.sort((a, b) => a.name.localeCompare(b.name));
  },
  
  // Find variable by ID
  async findById(id) {
    const variables = await readVariables();
    return variables.find(v => v.id === id);
  },
  
  // Find variable by name
  async findOne(filter = {}) {
    const variables = await readVariables();
    
    if (filter.name) {
      return variables.find(v => v.name === filter.name);
    }
    
    return null;
  },
  
  // Create new variable
  async create(variableData) {
    const variables = await readVariables();
    
    // Check for duplicate name
    const existing = variables.find(v => v.name === variableData.name);
    if (existing) {
      throw new Error("Variable with this name already exists");
    }
    
    // Create new variable with UUID
    const newVariable = {
      id: uuidv4(),
      name: variableData.name,
      description: variableData.description || "",
      defaultValue: variableData.defaultValue || "",
      type: variableData.type || "text",
      isSystem: variableData.isSystem || false,
      createdBy: variableData.createdBy || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    variables.push(newVariable);
    await createBackup();
    await writeVariables(variables);
    
    return newVariable;
  },
  
  // Update or insert variable
  async findOneAndUpdate(filter = {}, updateData = {}, options = {}) {
    const variables = await readVariables();
    
    // Find variable by name
    let variable = null;
    let variableIndex = -1;
    
    if (filter.name) {
      variableIndex = variables.findIndex(v => v.name === filter.name);
      if (variableIndex !== -1) {
        variable = variables[variableIndex];
      }
    }
    
    // If not found and upsert is true, create new variable
    if (!variable && options.upsert) {
      const newVariable = {
        id: uuidv4(),
        name: filter.name,
        description: updateData.description || "",
        defaultValue: updateData.defaultValue || "",
        type: updateData.type || "text",
        isSystem: updateData.isSystem || false,
        createdBy: updateData.createdBy || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      variables.push(newVariable);
      await createBackup();
      await writeVariables(variables);
      
      return newVariable;
    }
    
    // Update existing variable
    if (variable) {
      if (updateData.description !== undefined) variable.description = updateData.description;
      if (updateData.defaultValue !== undefined) variable.defaultValue = updateData.defaultValue;
      if (updateData.type) variable.type = updateData.type;
      if (updateData.isSystem !== undefined) variable.isSystem = updateData.isSystem;
      
      variable.updatedAt = new Date().toISOString();
      
      variables[variableIndex] = variable;
      await createBackup();
      await writeVariables(variables);
      
      return variable;
    }
    
    return null;
  },
  
  // Delete variable
  async findByIdAndDelete(id) {
    const variables = await readVariables();
    const filteredVariables = variables.filter(v => v.id !== id);
    
    if (filteredVariables.length === variables.length) {
      return null; // Variable not found
    }
    
    await createBackup();
    await writeVariables(filteredVariables);
    
    return { success: true };
  }
};

module.exports = Variable;