import api from "./api/api";

const BASE_URL = "/api/templates";

/**
 * Service for template API calls
 */
const templateService = {
  /**
   * Get all templates
   * @param {Object} filter - Query filters
   * @returns {Promise<Array>} List of templates
   */
  getAllTemplates: async (filter = {}) => {
    const params = new URLSearchParams();
    if (filter.category) params.append("category", filter.category);

    const response = await api.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get template by ID
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Template
   */
  getTemplateById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Created template
   */
  createTemplate: async (templateData) => {
    const response = await api.post(BASE_URL, templateData);
    return response.data;
  },

  /**
   * Update template
   * @param {string} id - Template ID
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Updated template
   */
  updateTemplate: async (id, templateData) => {
    const response = await api.put(`${BASE_URL}/${id}`, templateData);
    return response.data;
  },

  /**
   * Delete template
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Response data
   */
  deleteTemplate: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Get template versions
   * @param {string} id - Template ID
   * @returns {Promise<Array>} List of versions
   */
  getTemplateVersions: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/versions`);
    return response.data;
  },

  /**
   * Roll back to version
   * @param {string} templateId - Template ID
   * @param {string} versionId - Version ID
   * @returns {Promise<Object>} Updated template
   */
  rollbackToVersion: async (templateId, versionId) => {
    const response = await api.post(
      `${BASE_URL}/${templateId}/versions/${versionId}/rollback`
    );
    return response.data;
  },

  /**
   * Test template
   * @param {string} content - Template content
   * @param {Object} variables - Variables
   * @returns {Promise<Object>} Test result
   */
  testTemplate: async (content, variables) => {
    const response = await api.post(`${BASE_URL}/test`, {
      content,
      variables,
    });
    return response.data;
  },

  /**
   * Get all variables
   * @returns {Promise<Array>} List of variables
   */
  getVariables: async () => {
    const response = await api.get(`${BASE_URL}/variables/all`);
    return response.data;
  },

  /**
   * Create variable
   * @param {Object} variableData - Variable data
   * @returns {Promise<Object>} Created variable
   */
  createVariable: async (variableData) => {
    const response = await api.post(`${BASE_URL}/variables`, variableData);
    return response.data;
  },
};

export default templateService;
