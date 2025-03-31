/**
 * Controller for admin analytics endpoints
 */
const analyticsService = require("../services/analytics/analyticsService");

const analyticsController = {
  /**
   * Get basic metrics with optional date filtering
   */
  async getBasicMetrics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const metrics = await analyticsService.getBasicMetrics({
        startDate,
        endDate,
      });

      res.json({ data: metrics });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get subject line metrics with optional date filtering
   */
  async getSubjectLineMetrics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const metrics = await analyticsService.getSubjectLineMetrics({
        startDate,
        endDate,
      });

      res.json({ data: metrics });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get time-series data for subject line analyses with date filtering
   */
  async getTimeSeriesData(req, res, next) {
    try {
      const { startDate, endDate, groupBy } = req.query;

      // Map timeframe to groupBy format
      const groupByMapping = {
        daily: "day",
        weekly: "week",
        monthly: "month",
      };

      const mappedGroupBy = groupByMapping[groupBy] || "day";

      const data = await analyticsService.getTimeSeriesData({
        startDate,
        endDate,
        groupBy: mappedGroupBy,
      });

      res.json({ data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Force refresh analytics cache
   */
  async refreshCache(req, res, next) {
    try {
      analyticsService.invalidateCache();
      res.json({
        success: true,
        message: "Analytics cache refreshed",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get time-series data (legacy method for backward compatibility)
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

      // Map timeframe to new format
      const groupByMapping = {
        daily: "day",
        weekly: "week",
        monthly: "month",
      };

      const data = await analyticsService.getTimeSeriesData({
        groupBy: groupByMapping[timeframe],
      });

      // Limit the results
      const limitedData = data.slice(-limitNum);

      res.json({ data: limitedData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get score distribution data
   */
  async getScoreDistribution(req, res, next) {
    try {
      // Get basic metrics which include score distribution
      const metrics = await analyticsService.getBasicMetrics();
      const { spamScoreDistribution } = metrics;

      res.json({ data: spamScoreDistribution });
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

      // This functionality needs to be added to the analytics service
      // For now, return an empty array
      res.json({ data: [] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get lead conversion metrics
   */
  async getConversionMetrics(req, res, next) {
    try {
      // Use the basic metrics to get lead conversion data
      const metrics = await analyticsService.getBasicMetrics();

      res.json({
        data: {
          totalLeads: metrics.totalLeads,
          conversionRate: 0, // You'll need to implement this calculation
          businessTypeCounts: metrics.businessTypeCounts,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = analyticsController;
