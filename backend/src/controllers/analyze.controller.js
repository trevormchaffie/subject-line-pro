const analysisService = require("../services/analysisService");
const dataService = require("../services/dataService");

/**
 * Controller for subject line analysis
 */
const analyzeController = {
  /**
   * Analyze a subject line and return results
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async analyzeSubject(req, res, next) {
    try {
      const { subjectLine } = req.body;

      // Validate input
      if (!subjectLine || typeof subjectLine !== "string") {
        return res.status(400).json({
          error: {
            message: "Subject line is required and must be a string",
            status: 400,
          },
        });
      }

      // Perform analysis
      const analysisResults = analysisService.analyzeSubjectLine(subjectLine);

      // Save analysis to database (async, don't await to keep response fast)
      dataService
        .saveAnalysis(analysisResults)
        .catch((err) => console.error("Error saving analysis:", err));

      // Return results
      res.status(200).json({
        success: true,
        data: analysisResults,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get spam triggers list
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getSpamTriggers(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: analysisService.spamTriggers,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get power words list
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getPowerWords(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: analysisService.powerWords,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = analyzeController;
