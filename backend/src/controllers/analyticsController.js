const analyticsService = require("../services/analyticsService");

/**
 * Controller for admin analytics endpoints
 */
const analyticsController = {
  /**
   * Get time-series data for subject line analyses
   */
  async getTimeSeries(req, res, next) {
    try {
      const { timeframe = "daily", limit = 30 } = req.query;

      // Validate timeframe
      if (!["daily", "weekly", "monthly"].includes(timeframe)) {
        return res.status(400).json({
          error: {
            message: "Invalid timeframe. Must be daily, weekly, or monthly",
          },
        });
      }

      // Validate limit
      const limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          error: { message: "Invalid limit. Must be between 1 and 100" },
        });
      }

      const data = await analyticsService.getAnalysisTimeSeries(
        timeframe,
        limitNum
      );

      res.json({ data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get score distribution data
   */
  async getScoreDistribution(req, res, next) {
    try {
      const data = await analyticsService.getScoreDistribution();

      res.json({ data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get top performing subject lines
   */
  async getTopSubjectLines(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      // Validate limit
      const limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({
          error: { message: "Invalid limit. Must be between 1 and 50" },
        });
      }

      const data = await analyticsService.getTopSubjectLines(limitNum);

      res.json({ data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get lead conversion metrics
   */
  async getConversionMetrics(req, res, next) {
    try {
      const data = await analyticsService.getConversionMetrics();

      res.json({ data });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = analyticsController;
