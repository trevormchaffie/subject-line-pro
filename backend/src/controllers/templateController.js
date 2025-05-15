const templateService = require("../services/templateService");
const { validationResult } = require("express-validator");

/**
 * Controller for template management
 */
const templateController = {
  /**
   * Get all templates
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllTemplates(req, res) {
    try {
      const filter = {};
      if (req.query.category) {
        filter.category = req.query.category;
      }

      const templates = await templateService.getAllTemplates(filter);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get template by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTemplateById(req, res) {
    try {
      const template = await templateService.getTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Create new template
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createTemplate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const template = await templateService.createTemplate(req.body, userId);

      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Update template
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTemplate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const template = await templateService.updateTemplate(
        req.params.id,
        req.body,
        userId
      );

      res.json(template);
    } catch (error) {
      if (error.message === "Template not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Delete template
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteTemplate(req, res) {
    try {
      const result = await templateService.deleteTemplate(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get template versions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTemplateVersions(req, res) {
    try {
      const versions = await templateService.getTemplateVersions(req.params.id);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Roll back to version
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async rollbackToVersion(req, res) {
    try {
      const userId = req.user.id;
      const template = await templateService.rollbackToVersion(
        req.params.id,
        req.params.versionId,
        userId
      );

      res.json(template);
    } catch (error) {
      if (
        error.message === "Template not found" ||
        error.message === "Version not found"
      ) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Test template
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testTemplate(req, res) {
    try {
      const { content, variables } = req.body;
      const renderedContent = await templateService.testTemplate(
        content,
        variables
      );

      res.json({ renderedContent });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get all variables
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getVariables(req, res) {
    try {
      const variables = await templateService.getVariables();
      res.json(variables);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Create variable
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createVariable(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const variable = await templateService.createVariable(req.body, userId);

      res.status(201).json(variable);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = templateController;
