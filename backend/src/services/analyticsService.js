const fs = require("fs").promises;
const path = require("path");
const { getDataFilePath } = require("../utils/fileUtils");

/**
 * Analytics service for providing dashboard metrics and charts data
 */
const analyticsService = {
  /**
   * Get time-series data for subject line analysis counts
   * @param {string} timeframe - 'daily', 'weekly', or 'monthly'
   * @param {number} limit - Number of periods to return
   * @returns {Promise<Array>} Time-series data
   */
  async getAnalysisTimeSeries(timeframe = "daily", limit = 30) {
    try {
      // Get all analyzed subject lines
      const filePath = getDataFilePath("analyzed-subjects.json");
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return [];
      }

      const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

      // Group by timeframe
      const now = new Date();
      const timeseriesData = [];
      const dateFormat = {
        daily: (date) => date.toISOString().split("T")[0],
        weekly: (date) => {
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          return startOfWeek.toISOString().split("T")[0];
        },
        monthly: (date) =>
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`,
      };

      // Create map for counts
      const countMap = new Map();

      // Group data by date format
      data.forEach((item) => {
        if (!item.createdAt) return;

        const date = new Date(item.createdAt);
        const formattedDate = dateFormat[timeframe](date);

        if (!countMap.has(formattedDate)) {
          countMap.set(formattedDate, {
            date: formattedDate,
            count: 0,
            averageScore: 0,
            totalScore: 0,
            spamCount: 0,
            totalSpamScore: 0,
          });
        }

        const periodData = countMap.get(formattedDate);
        periodData.count += 1;
        periodData.totalScore += item.overallScore || 0;
        periodData.averageScore = periodData.totalScore / periodData.count;

        if ((item.spamScore || 0) > 50) {
          periodData.spamCount += 1;
        }

        periodData.totalSpamScore += item.spamScore || 0;
      });

      // Convert map to array and sort by date
      const sortedData = Array.from(countMap.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-limit);

      return sortedData;
    } catch (error) {
      console.error("Error getting analysis time series:", error);
      throw new Error("Failed to fetch analysis time series data");
    }
  },

  /**
   * Get distribution data for scores
   * @returns {Promise<Object>} Distribution data
   */
  async getScoreDistribution() {
    try {
      const filePath = getDataFilePath("analyzed-subjects.json");
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return {
          overallScore: { ranges: [], counts: [] },
          spamScore: { ranges: [], counts: [] },
        };
      }

      const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

      // Define score ranges
      const overallRanges = [0, 20, 40, 60, 80, 100];
      const spamRanges = [0, 20, 40, 60, 80, 100];

      // Initialize counters
      const overallCounts = Array(overallRanges.length - 1).fill(0);
      const spamCounts = Array(spamRanges.length - 1).fill(0);

      // Count items in each range
      data.forEach((item) => {
        const overallScore = item.overallScore || 0;
        const spamScore = item.spamScore || 0;

        // Count overall scores
        for (let i = 0; i < overallRanges.length - 1; i++) {
          if (
            overallScore >= overallRanges[i] &&
            overallScore < overallRanges[i + 1]
          ) {
            overallCounts[i] += 1;
            break;
          }
        }

        // Count spam scores
        for (let i = 0; i < spamRanges.length - 1; i++) {
          if (spamScore >= spamRanges[i] && spamScore < spamRanges[i + 1]) {
            spamCounts[i] += 1;
            break;
          }
        }
      });

      // Format ranges for display
      const overallLabels = overallRanges
        .slice(0, -1)
        .map((min, i) => `${min}-${overallRanges[i + 1]}`);
      const spamLabels = spamRanges
        .slice(0, -1)
        .map((min, i) => `${min}-${spamRanges[i + 1]}`);

      return {
        overallScore: {
          ranges: overallLabels,
          counts: overallCounts,
        },
        spamScore: {
          ranges: spamLabels,
          counts: spamCounts,
        },
      };
    } catch (error) {
      console.error("Error getting score distribution:", error);
      throw new Error("Failed to fetch score distribution data");
    }
  },

  /**
   * Get comparison data for top subject lines
   * @param {number} limit - Number of items to return
   * @returns {Promise<Array>} Top performing subject lines
   */
  async getTopSubjectLines(limit = 10) {
    try {
      const filePath = getDataFilePath("analyzed-subjects.json");
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return [];
      }

      const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

      // Sort by overall score and get top ones
      const topSubjects = data
        .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
        .slice(0, limit)
        .map((item) => ({
          subjectLine: item.subjectLine,
          overallScore: item.overallScore || 0,
          spamScore: item.spamScore || 0,
          length: item.length || 0,
          createdAt: item.createdAt,
        }));

      return topSubjects;
    } catch (error) {
      console.error("Error getting top subject lines:", error);
      throw new Error("Failed to fetch top subject lines data");
    }
  },

  /**
   * Get lead conversion metrics
   * @returns {Promise<Object>} Conversion metrics
   */
  async getConversionMetrics() {
    try {
      // Get analyzed subjects count
      const subjectsPath = getDataFilePath("analyzed-subjects.json");
      const subjectsExist = await fs
        .access(subjectsPath)
        .then(() => true)
        .catch(() => false);
      const subjectsCount = subjectsExist
        ? JSON.parse(await fs.readFile(subjectsPath, "utf-8")).length
        : 0;

      // Get leads count
      const leadsPath = getDataFilePath("leads.json");
      const leadsExist = await fs
        .access(leadsPath)
        .then(() => true)
        .catch(() => false);
      const leadsCount = leadsExist
        ? JSON.parse(await fs.readFile(leadsPath, "utf-8")).length
        : 0;

      // Calculate conversion rate
      const conversionRate =
        subjectsCount > 0 ? ((leadsCount / subjectsCount) * 100).toFixed(2) : 0;

      return {
        analyzed: subjectsCount,
        leads: leadsCount,
        conversionRate: parseFloat(conversionRate),
      };
    } catch (error) {
      console.error("Error getting conversion metrics:", error);
      throw new Error("Failed to fetch conversion metrics");
    }
  },
};

module.exports = analyticsService;
