const dataService = require("../services/dataService");

/**
 * Controller for statistics
 */
const statsController = {
  /**
   * Get analysis statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getStats(req, res, next) {
    try {
      // Get stats
      const stats = await dataService.getAnalysisStats();

      // Return stats
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get analyzed subjects (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAnalyzedSubjects(req, res, next) {
    try {
      // Get all analyzed subjects
      const analyzedSubjects = await dataService.getAnalyzedSubjects();

      // Return analyzed subjects
      res.status(200).json({
        success: true,
        data: analyzedSubjects,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = statsController;
