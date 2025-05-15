const Template = require("../models/Template");
const Variable = require("../models/Variable");
const { sanitizeHtml } = require("../utils/sanitizer");

/**
 * Service for template management operations
 */
const templateService = {
  /**
   * Get all templates
   * @param {Object} filter - Query filters
   * @returns {Promise<Array>} List of templates
   */
  async getAllTemplates(filter = {}) {
    return Template.find(filter);
  },

  /**
   * Get template by ID
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Template document
   */
  async getTemplateById(id) {
    return Template.findById(id);
  },

  /**
   * Create new template
   * @param {Object} templateData - Template data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData, userId) {
    const { name, description, category, content } = templateData;

    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeHtml(content);

    return Template.create({
      name,
      description,
      category,
      content: sanitizedContent,
      versionDescription: "Initial version",
      createdBy: userId,
      updatedBy: userId,
    });
  },

  /**
   * Update template
   * @param {string} id - Template ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated template
   */
  async updateTemplate(id, updateData, userId) {
    const template = await Template.findById(id);

    if (!template) {
      throw new Error("Template not found");
    }

    const { name, description, category, content, versionDescription } = updateData;

    // Prepare update data
    const update = {
      updatedBy: userId,
    };

    if (name) update.name = name;
    if (description) update.description = description;
    if (category) update.category = category;
    
    // Sanitize content if provided
    if (content) {
      update.content = sanitizeHtml(content);
      update.versionDescription = versionDescription || `Updated on ${new Date().toLocaleString()}`;
    }

    return Template.findByIdAndUpdate(id, update);
  },

  /**
   * Delete template
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTemplate(id) {
    return Template.findByIdAndDelete(id);
  },

  /**
   * Get template versions
   * @param {string} id - Template ID
   * @returns {Promise<Array>} List of versions
   */
  async getTemplateVersions(id) {
    const template = await Template.findById(id);
    return template ? template.versions : [];
  },

  /**
   * Roll back to specific version
   * @param {string} templateId - Template ID
   * @param {string} versionId - Version ID to roll back to
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated template
   */
  async rollbackToVersion(templateId, versionId, userId) {
    const template = await Template.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    const version = template.versions.find(v => v.id === versionId);

    if (!version) {
      throw new Error("Version not found");
    }

    // Create a new version based on the old one
    return Template.findByIdAndUpdate(templateId, {
      content: version.content,
      versionDescription: `Rollback to version from ${new Date(version.createdAt).toLocaleString()}`,
      currentVersion: versionId,
      updatedBy: userId,
    });
  },

  /**
   * Test template with sample data
   * @param {string} content - Template content
   * @param {Object} variables - Variables to substitute
   * @returns {string} Rendered template
   */
  async testTemplate(content, variables) {
    // Simple template variable substitution
    let renderedContent = content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${key}}`, "g");
      renderedContent = renderedContent.replace(regex, value);
    }

    return renderedContent;
  },

  /**
   * Get all system variables
   * @returns {Promise<Array>} List of variables
   */
  async getVariables() {
    return Variable.find();
  },

  /**
   * Create new variable
   * @param {Object} variableData - Variable data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created variable
   */
  async createVariable(variableData, userId) {
    return Variable.create({
      ...variableData,
      createdBy: userId,
    });
  },
};

module.exports = templateService;