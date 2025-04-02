const fileUtils = require("../utils/fileUtils");
const config = require("../config/config");
const path = require("path");

// Resolve paths relative to current working directory
const leadsFilePath = path.resolve(process.cwd(), config.leadsDataPath);
const analyzedSubjectsFilePath = path.resolve(
  process.cwd(),
  config.analyzedSubjectsPath
);

/**
 * Data service for handling CRUD operations on leads and analyzed subjects
 */
const dataService = {
  /**
   * Get all collected leads
   * @returns {Promise<Array>} Array of lead objects
   */
  async getLeads() {
    return fileUtils.readJsonFile(leadsFilePath);
  },

  /**
   * Save a new lead
   * @param {Object} leadData - Lead information
   * @returns {Promise<Object>} The saved lead with ID
   */
  async saveLead(leadData) {
    // Validate lead data
    if (!leadData.email) {
      throw new Error("Email is required for leads");
    }

    // Read existing leads
    const leads = await this.getLeads();

    // Create new lead with ID and timestamp
    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...leadData,
      createdAt: new Date().toISOString(),
      subjectLine: leadData.subjectLine || null,
      analysisResults: leadData.analysisResults || null,
    };

    // Add to array and save
    leads.push(newLead);
    await fileUtils.writeJsonFile(leadsFilePath, leads);

    return newLead;
  },

  /**
   * Get all analyzed subject lines
   * @returns {Promise<Array>} Array of analyzed subject objects
   */
  async getAnalyzedSubjects() {
    return fileUtils.readJsonFile(analyzedSubjectsFilePath);
  },

  /**
   * Save a new analyzed subject
   * @param {Object} analysisData - Analysis information
   * @returns {Promise<Object>} The saved analysis with ID
   */
  async saveAnalysis(analysisData) {
    // Validate analysis data
    if (!analysisData.subjectLine) {
      throw new Error("Subject line is required for analysis");
    }

    // Read existing analyses
    const analyses = await this.getAnalyzedSubjects();

    // Create new analysis with ID and timestamp
    const newAnalysis = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...analysisData,
      createdAt: new Date().toISOString(),
    };

    // Add to array and save
    analyses.push(newAnalysis);
    await fileUtils.writeJsonFile(analyzedSubjectsFilePath, analyses);

    return newAnalysis;
  },

  /**
   * Get analysis statistics
   * @returns {Promise<Object>} Statistics about analyses performed
   */
  async getAnalysisStats() {
    const analyses = await this.getAnalyzedSubjects();
    const leads = await this.getLeads();

    return {
      totalAnalyses: analyses.length,
      totalLeads: leads.length,
      conversionRate:
        analyses.length > 0
          ? parseFloat(((leads.length / analyses.length) * 100).toFixed(2))
          : 0,
      // You can add more statistics as needed
    };
  },
};

module.exports = dataService;
