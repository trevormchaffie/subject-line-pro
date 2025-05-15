const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const templatesFilePath = path.join(__dirname, "../data/templates.json");

// Helper functions
const ensureFileExists = async (filePath, defaultData = []) => {
  try {
    await fs.access(filePath);
  } catch (error) {
    // File doesn't exist, create it with default data
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
  }
};

const readTemplates = async () => {
  await ensureFileExists(templatesFilePath);
  const data = await fs.readFile(templatesFilePath, "utf8");
  return JSON.parse(data);
};

const writeTemplates = async (templates) => {
  await fs.writeFile(templatesFilePath, JSON.stringify(templates, null, 2));
};

// Create backup of templates file
const createBackup = async () => {
  const data = await fs.readFile(templatesFilePath, "utf8");
  const backupDir = path.join(path.dirname(templatesFilePath), "backups");
  
  try {
    await fs.access(backupDir);
  } catch (error) {
    await fs.mkdir(backupDir);
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const backupPath = path.join(
    backupDir, 
    `${path.basename(templatesFilePath)}.${timestamp}.bak`
  );
  
  await fs.writeFile(backupPath, data);
  return backupPath;
};

// Template model
const Template = {
  // Find all templates with optional filter
  async find(filter = {}) {
    const templates = await readTemplates();
    
    // Apply filters if provided
    let filteredTemplates = [...templates];
    
    if (filter.category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === filter.category);
    }
    
    // Sort by updatedAt descending
    return filteredTemplates.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  },
  
  // Find template by ID
  async findById(id) {
    const templates = await readTemplates();
    return templates.find(t => t.id === id);
  },
  
  // Add new template
  async create(templateData) {
    const templates = await readTemplates();
    
    // Create a version with ID
    const version = {
      id: uuidv4(),
      content: templateData.content || "",
      description: templateData.versionDescription || "Initial version",
      createdBy: templateData.createdBy || null,
      createdAt: new Date().toISOString()
    };
    
    // Create new template with UUID
    const newTemplate = {
      id: uuidv4(),
      name: templateData.name,
      description: templateData.description || "",
      category: templateData.category || "general",
      isActive: typeof templateData.isActive === 'boolean' ? templateData.isActive : true,
      createdBy: templateData.createdBy || null,
      updatedBy: templateData.updatedBy || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [version],
      currentVersion: version.id
    };
    
    templates.push(newTemplate);
    await createBackup();
    await writeTemplates(templates);
    
    return newTemplate;
  },
  
  // Update template
  async findByIdAndUpdate(id, updateData) {
    const templates = await readTemplates();
    const templateIndex = templates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      return null;
    }
    
    const template = templates[templateIndex];
    
    // Update base fields if provided
    if (updateData.name) template.name = updateData.name;
    if (updateData.description) template.description = updateData.description;
    if (updateData.category) template.category = updateData.category;
    if (typeof updateData.isActive === 'boolean') template.isActive = updateData.isActive;
    if (updateData.updatedBy) template.updatedBy = updateData.updatedBy;
    
    template.updatedAt = new Date().toISOString();
    
    // Add new version if content is provided
    if (updateData.content) {
      const newVersion = {
        id: uuidv4(),
        content: updateData.content,
        description: updateData.versionDescription || `Updated on ${new Date().toLocaleString()}`,
        createdBy: updateData.updatedBy || null,
        createdAt: new Date().toISOString()
      };
      
      template.versions.unshift(newVersion);
      template.currentVersion = newVersion.id;
    }
    
    templates[templateIndex] = template;
    await createBackup();
    await writeTemplates(templates);
    
    return template;
  },
  
  // Delete template
  async findByIdAndDelete(id) {
    const templates = await readTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    if (filteredTemplates.length === templates.length) {
      return null; // Template not found
    }
    
    await createBackup();
    await writeTemplates(filteredTemplates);
    
    return { success: true };
  }
};

// Add version to template (as a standalone function)
const addVersion = async (templateId, content, description, userId) => {
  const templates = await readTemplates();
  const templateIndex = templates.findIndex(t => t.id === templateId);
  
  if (templateIndex === -1) {
    throw new Error("Template not found");
  }
  
  const template = templates[templateIndex];
  
  const newVersion = {
    id: uuidv4(),
    content,
    description: description || `Updated on ${new Date().toLocaleString()}`,
    createdBy: userId || null,
    createdAt: new Date().toISOString()
  };
  
  template.versions.unshift(newVersion);
  template.currentVersion = newVersion.id;
  template.updatedAt = new Date().toISOString();
  
  templates[templateIndex] = template;
  await writeTemplates(templates);
  
  return template;
};

module.exports = Template;