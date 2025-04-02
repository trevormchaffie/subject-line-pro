const dataService = require("./dataService");
const { getDateRange } = require("../utils/dateUtils");

/**
 * Stats service for calculating metrics from analysis and lead data
 */
const statsService = {
  /**
   * Get core dashboard metrics
   * @param {Object} options - Query options (dateRange, etc.)
   * @returns {Object} Dashboard metrics
   */
  async getDashboardMetrics(options = {}) {
    const { startDate, endDate } = getDateRange(options.period || "all");

    // Get all data
    const leads = await dataService.getLeads();
    const analyzedSubjects = await dataService.getAnalyzedSubjects();

    // Filter by date range if specified
    const filteredLeads = leads.filter((lead) => {
      // Skip entries without createdAt date or with invalid dates
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      if (isNaN(leadDate.getTime())) return false;

      // Apply date range filter
      return leadDate >= startDate && leadDate <= endDate;
    });

    const filteredSubjects = analyzedSubjects.filter((subject) => {
      // Skip entries without createdAt date or with invalid dates
      if (!subject.createdAt) return false;
      const subjectDate = new Date(subject.createdAt);
      if (isNaN(subjectDate.getTime())) return false;

      // Apply date range filter
      return subjectDate >= startDate && subjectDate <= endDate;
    });

    // Calculate total metrics
    const totalSubjectsAnalyzed = filteredSubjects.length;
    const totalLeads = filteredLeads.length;

    // Calculate conversion rate
    const conversionRate =
      totalSubjectsAnalyzed > 0
        ? ((totalLeads / totalSubjectsAnalyzed) * 100).toFixed(2)
        : 0;

    // Calculate average scores
    const avgEffectivenessScore = this._calculateAverage(
      filteredSubjects,
      "overallScore"
    );

    const avgSpamScore = this._calculateAverage(filteredSubjects, "spamScore");

    // Calculate trends (comparing to previous period)
    const previousPeriod = this._getPreviousPeriodMetrics(
      options.period || "all",
      startDate,
      endDate
    );

    return {
      totalSubjectsAnalyzed,
      totalLeads,
      conversionRate,
      avgEffectivenessScore,
      avgSpamScore,
      trends: {
        subjectsAnalyzedTrend: this._calculateTrend(
          totalSubjectsAnalyzed,
          previousPeriod.totalSubjectsAnalyzed
        ),
        leadsTrend: this._calculateTrend(totalLeads, previousPeriod.totalLeads),
        conversionRateTrend: this._calculateTrend(
          parseFloat(conversionRate),
          previousPeriod.conversionRate
        ),
        effectivenessScoreTrend: this._calculateTrend(
          avgEffectivenessScore,
          previousPeriod.avgEffectivenessScore
        ),
        spamScoreTrend: this._calculateTrend(
          avgSpamScore,
          previousPeriod.avgSpamScore
        ),
      },
      // Provide time series data for charts
      timeSeriesData: this._getTimeSeriesData(
        filteredSubjects,
        filteredLeads,
        options.period || "all"
      ),
    };
  },

  /**
   * Calculate the average value of a property in an array of objects
   * @private
   */
  _calculateAverage(items, property) {
    if (!items || items.length === 0) return 0;

    const sum = items.reduce((total, item) => {
      return total + (item[property] || 0);
    }, 0);

    return parseFloat((sum / items.length).toFixed(2));
  },

  /**
   * Calculate trend percentage change
   * @private
   */
  _calculateTrend(currentValue, previousValue) {
    if (!previousValue) return 0;

    const change = currentValue - previousValue;
    const percentChange = ((change / previousValue) * 100).toFixed(2);

    return parseFloat(percentChange);
  },

  /**
   * Get metrics from previous time period for trend calculation
   * @private
   */
  async _getPreviousPeriodMetrics(period, currentStartDate, currentEndDate) {
    // Calculate previous period date range
    const duration = currentEndDate - currentStartDate;
    const previousEndDate = new Date(currentStartDate);
    previousEndDate.setMilliseconds(previousEndDate.getMilliseconds() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setTime(previousStartDate.getTime() - duration);

    // Get all data
    const leads = await dataService.getLeads();
    const analyzedSubjects = await dataService.getAnalyzedSubjects();

    // Filter by previous date range
    const filteredLeads = leads.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= previousStartDate && leadDate <= previousEndDate;
    });

    const filteredSubjects = analyzedSubjects.filter((subject) => {
      const subjectDate = new Date(subject.createdAt);
      return subjectDate >= previousStartDate && subjectDate <= previousEndDate;
    });

    // Calculate previous period metrics
    const totalSubjectsAnalyzed = filteredSubjects.length;
    const totalLeads = filteredLeads.length;
    const conversionRate =
      totalSubjectsAnalyzed > 0
        ? (totalLeads / totalSubjectsAnalyzed) * 100
        : 0;

    const avgEffectivenessScore = this._calculateAverage(
      filteredSubjects,
      "overallScore"
    );

    const avgSpamScore = this._calculateAverage(filteredSubjects, "spamScore");

    return {
      totalSubjectsAnalyzed,
      totalLeads,
      conversionRate,
      avgEffectivenessScore,
      avgSpamScore,
    };
  },

  /**
   * Get time series data for charts
   * @private
   */
  _getTimeSeriesData(subjects, leads, period) {
    // Group subjects and leads by date
    const grouped = this._groupDataByTimePeriod(subjects, leads, period);

    // Format for charts
    return {
      labels: grouped.labels,
      datasets: {
        subjects: grouped.subjectCounts,
        leads: grouped.leadCounts,
        conversionRates: grouped.conversionRates,
        effectivenessScores: grouped.avgEffectivenessScores,
        spamScores: grouped.avgSpamScores,
      },
    };
  },

  /**
   * Group data by time period (day, week, month, etc.)
   * @private
   */
  _groupDataByTimePeriod(subjects, leads, period) {
    // Format date based on period
    const getDateKey = (date) => {
      const d = new Date(date);

      switch (period) {
        case "day":
          return `${d.getHours()}:00`;
        case "week":
          return d.toISOString().substr(0, 10); // YYYY-MM-DD
        case "month":
          return d.toISOString().substr(0, 10); // YYYY-MM-DD
        case "year":
          return `${d.getFullYear()}-${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`; // YYYY-MM
        default: // all or custom
          return `${d.getFullYear()}-${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`; // YYYY-MM
      }
    };

    // Create a map of date keys to data
    const dataMap = new Map();

    // Process subjects
    subjects.forEach((subject) => {
      const key = getDateKey(subject.createdAt);

      if (!dataMap.has(key)) {
        dataMap.set(key, {
          subjects: [],
          leads: [],
          date: new Date(subject.createdAt),
        });
      }

      dataMap.get(key).subjects.push(subject);
    });

    // Process leads
    leads.forEach((lead) => {
      const key = getDateKey(lead.createdAt);

      if (!dataMap.has(key)) {
        dataMap.set(key, {
          subjects: [],
          leads: [],
          date: new Date(lead.createdAt),
        });
      }

      dataMap.get(key).leads.push(lead);
    });

    // Sort data points by date
    const sortedData = Array.from(dataMap.entries()).sort(
      (a, b) => a[1].date - b[1].date
    );

    // Extract required data for charts
    const labels = [];
    const subjectCounts = [];
    const leadCounts = [];
    const conversionRates = [];
    const avgEffectivenessScores = [];
    const avgSpamScores = [];

    sortedData.forEach(([key, data]) => {
      labels.push(key);

      const subjectCount = data.subjects.length;
      const leadCount = data.leads.length;

      subjectCounts.push(subjectCount);
      leadCounts.push(leadCount);

      // Calculate conversion rate
      const conversionRate =
        subjectCount > 0
          ? parseFloat(((leadCount / subjectCount) * 100).toFixed(2))
          : 0;
      conversionRates.push(conversionRate);

      // Calculate average scores
      const avgEffectivenessScore = this._calculateAverage(
        data.subjects,
        "overallScore"
      );
      avgEffectivenessScores.push(avgEffectivenessScore);

      const avgSpamScore = this._calculateAverage(data.subjects, "spamScore");
      avgSpamScores.push(avgSpamScore);
    });

    return {
      labels,
      subjectCounts,
      leadCounts,
      conversionRates,
      avgEffectivenessScores,
      avgSpamScores,
    };
  },
};

module.exports = statsService;
