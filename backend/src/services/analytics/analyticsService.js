/**
 * Analytics service for calculating metrics and aggregating data
 */
const fs = require("fs").promises;
const path = require("path");
const cacheService = require("./cacheService");
const { getLeadsFilePath } = require("../../utils/fileUtils");

// Helper function to format date strings consistently
const formatDate = (date) => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
};

// Helper to check if a date is within a range
const isDateInRange = (dateStr, startDate, endDate) => {
  const date = new Date(dateStr);
  return (!startDate || date >= startDate) && (!endDate || date <= endDate);
};

/**
 * Analytics service for metrics calculation and data aggregation
 */
const analyticsService = {
  /**
   * Load all leads from storage
   * @returns {Promise<Array>} Array of lead objects
   */
  async loadLeads() {
    try {
      const filePath = getLeadsFilePath();
      const data = await fs.readFile(filePath, "utf8");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return []; // File doesn't exist yet, return empty array
      }
      throw error;
    }
  },

  /**
   * Get basic metrics about leads and subject lines
   * @param {Object} options - Filter options
   * @param {Date|string} options.startDate - Start date filter (optional)
   * @param {Date|string} options.endDate - End date filter (optional)
   * @returns {Promise<Object>} Metrics object
   */
  async getBasicMetrics(options = {}) {
    const { startDate, endDate } = options;
    const cacheKey = `basic_metrics_${startDate || "all"}_${endDate || "all"}`;

    // Check cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Parse date strings to Date objects if provided
    const startDateTime = startDate ? new Date(startDate) : null;
    const endDateTime = endDate ? new Date(endDate) : null;

    // If endDate is provided, set it to end of day
    if (endDateTime) {
      endDateTime.setHours(23, 59, 59, 999);
    }

    try {
      const leads = await this.loadLeads();

      // Filter leads by date range if specified
      const filteredLeads =
        startDateTime || endDateTime
          ? leads.filter((lead) => {
              const createdAt = new Date(lead.createdAt);
              return isDateInRange(createdAt, startDateTime, endDateTime);
            })
          : leads;

      // Calculate metrics
      const totalLeads = filteredLeads.length;

      // Calculate average score
      let totalScore = 0;
      filteredLeads.forEach((lead) => {
        if (
          lead.analysisResults &&
          typeof lead.analysisResults.overallScore === "number"
        ) {
          totalScore += lead.analysisResults.overallScore;
        }
      });
      const averageScore =
        totalLeads > 0 ? Math.round(totalScore / totalLeads) : 0;

      // Count by business type
      const businessTypeCounts = {};
      filteredLeads.forEach((lead) => {
        const type = lead.businessType || "unknown";
        businessTypeCounts[type] = (businessTypeCounts[type] || 0) + 1;
      });

      // Get submission counts by day
      const submissionsByDay = {};
      filteredLeads.forEach((lead) => {
        const day = formatDate(lead.createdAt);
        submissionsByDay[day] = (submissionsByDay[day] || 0) + 1;
      });

      // Calculate spam score distribution
      const spamScoreDistribution = {
        low: 0, // 0-30
        medium: 0, // 31-70
        high: 0, // 71-100
      };

      filteredLeads.forEach((lead) => {
        if (
          lead.analysisResults &&
          typeof lead.analysisResults.spamScore === "number"
        ) {
          const score = lead.analysisResults.spamScore;
          if (score <= 30) spamScoreDistribution.low++;
          else if (score <= 70) spamScoreDistribution.medium++;
          else spamScoreDistribution.high++;
        }
      });

      const result = {
        totalLeads,
        averageScore,
        businessTypeCounts,
        submissionsByDay,
        spamScoreDistribution,
        dateRange: {
          startDate: startDateTime ? formatDate(startDateTime) : null,
          endDate: endDateTime ? formatDate(endDateTime) : null,
        },
      };

      // Cache the result
      cacheService.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Error calculating basic metrics:", error);
      throw new Error("Failed to calculate metrics");
    }
  },

  /**
   * Get detailed metrics about subject line performance
   * @param {Object} options - Filter options
   * @param {Date|string} options.startDate - Start date filter (optional)
   * @param {Date|string} options.endDate - End date filter (optional)
   * @returns {Promise<Object>} Detailed metrics object
   */
  async getSubjectLineMetrics(options = {}) {
    const { startDate, endDate } = options;
    const cacheKey = `subject_metrics_${startDate || "all"}_${
      endDate || "all"
    }`;

    // Check cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Parse date strings to Date objects if provided
    const startDateTime = startDate ? new Date(startDate) : null;
    const endDateTime = endDate ? new Date(endDate) : null;

    // If endDate is provided, set it to end of day
    if (endDateTime) {
      endDateTime.setHours(23, 59, 59, 999);
    }

    try {
      const leads = await this.loadLeads();

      // Filter leads by date range if specified
      const filteredLeads =
        startDateTime || endDateTime
          ? leads.filter((lead) => {
              const createdAt = new Date(lead.createdAt);
              return isDateInRange(createdAt, startDateTime, endDateTime);
            })
          : leads;

      // Track subject line length distribution
      const lengthDistribution = {
        short: 0, // 0-30 chars
        medium: 0, // 31-60 chars
        long: 0, // 61+ chars
      };

      // Track character counts
      let totalChars = 0;
      let totalWords = 0;

      // Track common words
      const wordFrequency = {};

      filteredLeads.forEach((lead) => {
        const subjectLine = lead.subjectLine || "";
        const length = subjectLine.length;

        // Length distribution
        if (length <= 30) lengthDistribution.short++;
        else if (length <= 60) lengthDistribution.medium++;
        else lengthDistribution.long++;

        // Character and word counts
        totalChars += length;
        const words = subjectLine
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 0);
        totalWords += words.length;

        // Word frequency
        words.forEach((word) => {
          // Only track words with 3+ characters
          if (word.length >= 3) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
          }
        });
      });

      // Get top 10 most common words
      const topWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));

      const totalSubjectLines = filteredLeads.length;

      const result = {
        totalSubjectLines,
        averageLength:
          totalSubjectLines > 0
            ? Math.round(totalChars / totalSubjectLines)
            : 0,
        averageWordCount:
          totalSubjectLines > 0
            ? Math.round(totalWords / totalSubjectLines)
            : 0,
        lengthDistribution,
        topWords,
        dateRange: {
          startDate: startDateTime ? formatDate(startDateTime) : null,
          endDate: endDateTime ? formatDate(endDateTime) : null,
        },
      };

      // Cache the result
      cacheService.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Error calculating subject line metrics:", error);
      throw new Error("Failed to calculate subject line metrics");
    }
  },

  /**
   * Get time-series data for leads over time
   * @param {Object} options - Filter options
   * @param {Date|string} options.startDate - Start date filter (optional)
   * @param {Date|string} options.endDate - End date filter (optional)
   * @param {string} options.groupBy - Grouping period ('day'|'week'|'month'), defaults to 'day'
   * @returns {Promise<Array>} Array of time-series data points
   */
  async getTimeSeriesData(options = {}) {
    const { startDate, endDate, groupBy = "day" } = options;
    const cacheKey = `timeseries_${groupBy}_${startDate || "all"}_${
      endDate || "all"
    }`;

    // Check cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Parse date strings to Date objects if provided
    const startDateTime = startDate ? new Date(startDate) : null;
    const endDateTime = endDate ? new Date(endDate) : null;

    // If endDate is provided, set it to end of day
    if (endDateTime) {
      endDateTime.setHours(23, 59, 59, 999);
    }

    try {
      const leads = await this.loadLeads();

      // Filter leads by date range if specified
      const filteredLeads =
        startDateTime || endDateTime
          ? leads.filter((lead) => {
              const createdAt = new Date(lead.createdAt);
              return isDateInRange(createdAt, startDateTime, endDateTime);
            })
          : leads;

      // Group data by the specified period
      const groupedData = {};

      filteredLeads.forEach((lead) => {
        const date = new Date(lead.createdAt);
        let groupKey;

        switch (groupBy) {
          case "week":
            // Get start of week (Sunday)
            const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const diff = date.getDate() - day;
            const weekStart = new Date(date);
            weekStart.setDate(diff);
            groupKey = formatDate(weekStart);
            break;

          case "month":
            groupKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
            break;

          case "day":
          default:
            groupKey = formatDate(date);
            break;
        }

        if (!groupedData[groupKey]) {
          groupedData[groupKey] = {
            period: groupKey,
            count: 0,
            totalScore: 0,
            totalSpamScore: 0,
          };
        }

        groupedData[groupKey].count++;

        if (lead.analysisResults) {
          if (typeof lead.analysisResults.overallScore === "number") {
            groupedData[groupKey].totalScore +=
              lead.analysisResults.overallScore;
          }

          if (typeof lead.analysisResults.spamScore === "number") {
            groupedData[groupKey].totalSpamScore +=
              lead.analysisResults.spamScore;
          }
        }
      });

      // Convert to array and calculate averages
      const result = Object.values(groupedData).map((item) => ({
        period: item.period,
        count: item.count,
        averageScore:
          item.count > 0 ? Math.round(item.totalScore / item.count) : 0,
        averageSpamScore:
          item.count > 0 ? Math.round(item.totalSpamScore / item.count) : 0,
      }));

      // Sort by period
      result.sort((a, b) => a.period.localeCompare(b.period));

      // Cache the result
      cacheService.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Error calculating time series data:", error);
      throw new Error("Failed to calculate time series data");
    }
  },

  /**
   * Invalidate all analytics caches
   */
  invalidateCache() {
    cacheService.clear();
  },
};

module.exports = analyticsService;
