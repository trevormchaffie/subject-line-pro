/**
 * Analytics service for calculating metrics and aggregating data
 */
const fs = require("fs").promises;
const path = require("path");
const cacheService = require("./cacheService");
const fileUtils = require("../../utils/fileUtils");
const { v4: uuidv4 } = require("uuid");

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

// File paths
const getLeadsFilePath = () => path.join(process.cwd(), "src/data/leads.json");
const getAnalyzedSubjectsFilePath = () => path.join(process.cwd(), "src/data/analyzed_subjects.json");
const SCHEDULED_REPORTS_PATH = path.join(
  process.cwd(),
  "src/data/scheduled_reports.json"
);

// Available metrics mapping
const AVAILABLE_METRICS = {
  // Basic metrics (used in the UI as 'basic' category)
  totalLeads: { name: "Total Leads", category: "basic", id: "leadCount" },
  totalAnalyses: { name: "Total Subject Lines Analyzed", category: "basic", id: "subjectCount" },
  conversionRate: { name: "Conversion Rate", category: "basic", id: "conversionRate" },
  averageScore: { name: "Average Effectiveness Score", category: "subject", id: "avgScore" },
  spamScoreAverage: { name: "Average Spam Score", category: "subject", id: "avgSpamScore" },
  
  // Chart data
  spamScoreDistribution: { name: "Spam Score Distribution", category: "subject", id: "scoreDistribution" },
  businessTypeCounts: { name: "Business Type Distribution", category: "leads", id: "businessTypes" },
  
  // Detailed metrics
  subjectLineLength: { name: "Subject Line Length", category: "subject", id: "lengthDistribution" },
  wordFrequency: { name: "Word Frequency", category: "subject", id: "wordAnalysis" },
  timeSeries: { name: "Time Series Trend", category: "performance", id: "timeSeries" },
  topSubjects: { name: "Top Performing Subject Lines", category: "performance", id: "topSubjects" },
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
        // Create an empty file if it doesn't exist
        await fs.writeFile(filePath, JSON.stringify([]), "utf8");
        return []; // File doesn't exist yet, return empty array
      }
      throw error;
    }
  },

  /**
   * Load analyzed subjects from storage
   * @returns {Promise<Array>} Array of analyzed subject objects
   */
  async loadAnalyzedSubjects() {
    try {
      const filePath = getAnalyzedSubjectsFilePath();
      const data = await fs.readFile(filePath, "utf8");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        // Create an empty file if it doesn't exist
        await fs.writeFile(filePath, JSON.stringify([]), "utf8");
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
      const analyzedSubjects = await this.loadAnalyzedSubjects();

      // Filter leads by date range if specified
      const filteredLeads =
        startDateTime || endDateTime
          ? leads.filter((lead) => {
              const createdAt = new Date(lead.createdAt);
              return isDateInRange(createdAt, startDateTime, endDateTime);
            })
          : leads;
          
      // Filter analyzed subjects by date range if specified
      const filteredSubjects =
        startDateTime || endDateTime
          ? analyzedSubjects.filter((subject) => {
              const createdAt = new Date(subject.createdAt);
              return isDateInRange(createdAt, startDateTime, endDateTime);
            })
          : analyzedSubjects;

      // Calculate metrics
      const totalLeads = filteredLeads.length;
      const totalAnalyses = filteredSubjects.length;

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
        totalAnalyses,
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
  
  /**
   * Get all available metrics with their categories
   * @returns {Object} Available metrics organized by category
   */
  getAvailableMetrics() {
    // Group metrics by front-end compatible categories (basic, subject, leads, performance)
    const categories = {
      basic: [],
      subject: [],
      leads: [],
      performance: []
    };
    
    Object.entries(AVAILABLE_METRICS).forEach(([key, metric]) => {
      const category = metric.category;
      
      if (categories[category]) {
        categories[category].push({
          id: metric.id || key,
          name: metric.name,
          description: metric.description
        });
      }
    });
    
    return categories;
  },
  
  /**
   * Generate a custom report based on selected metrics and date range
   * @param {Object} options - Report options
   * @param {Date|string} options.startDate - Start date 
   * @param {Date|string} options.endDate - End date 
   * @param {Array<string>} options.metrics - Array of metric keys to include
   * @param {string} options.groupBy - Grouping for time series ('day'|'week'|'month')
   * @returns {Promise<Object>} Report data
   */
  async generateCustomReport(options = {}) {
    const { startDate, endDate, metrics = [], groupBy = "day" } = options;
    
    // Get basic metrics data
    const basicMetrics = await this.getBasicMetrics({ startDate, endDate });
    
    // Get subject line metrics if needed
    const needsSubjectMetrics = metrics.some(m => 
      ["subjectLineLength", "wordFrequency"].includes(m)
    );
    
    const subjectMetrics = needsSubjectMetrics ? 
      await this.getSubjectLineMetrics({ startDate, endDate }) : null;
    
    // Get time series data if needed
    const needsTimeSeries = metrics.some(m => m === "timeSeries");
    
    const timeSeriesData = needsTimeSeries ?
      await this.getTimeSeriesData({ startDate, endDate, groupBy }) : null;
    
    // Build the report
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        dateRange: {
          startDate,
          endDate,
        },
        metrics: metrics.map(m => AVAILABLE_METRICS[m]?.name || m),
      },
      data: {}
    };
    
    // Add requested metrics to the report
    metrics.forEach(metric => {
      switch (metric) {
        case "totalLeads":
          report.data.totalLeads = basicMetrics.totalLeads;
          break;
          
        case "totalAnalyses":
          report.data.totalAnalyses = basicMetrics.totalLeads; // Assuming each lead has an analysis
          break;
          
        case "averageScore":
          report.data.averageScore = basicMetrics.averageScore;
          break;
          
        case "spamScoreDistribution":
          report.data.spamScoreDistribution = basicMetrics.spamScoreDistribution;
          break;
          
        case "businessTypeCounts":
          report.data.businessTypeCounts = basicMetrics.businessTypeCounts;
          break;
          
        case "subjectLineLength":
          if (subjectMetrics) {
            report.data.subjectLineLength = {
              averageLength: subjectMetrics.averageLength,
              averageWordCount: subjectMetrics.averageWordCount,
              lengthDistribution: subjectMetrics.lengthDistribution,
            };
          }
          break;
          
        case "wordFrequency":
          if (subjectMetrics) {
            report.data.wordFrequency = subjectMetrics.topWords;
          }
          break;
          
        case "timeSeries":
          if (timeSeriesData) {
            report.data.timeSeries = {
              groupBy,
              data: timeSeriesData,
            };
          }
          break;
      }
    });
    
    return report;
  },
  
  /**
   * Export report data to CSV format
   * @param {Object} reportData - Report data object
   * @param {Object} options - Export options
   * @returns {Promise<string>} CSV content
   */
  async exportToCSV(reportData, options = {}) {
    // Simple CSV generation for demonstration purposes
    const { data, metadata } = reportData;
    let csvContent = [];
    
    // Add header row with metadata
    csvContent.push(`# Subject Line Pro Analytics Report`);
    csvContent.push(`# Generated: ${new Date(metadata.generatedAt).toLocaleString()}`);
    csvContent.push(`# Date Range: ${metadata.dateRange.startDate} to ${metadata.dateRange.endDate}`);
    csvContent.push(`# Metrics: ${metadata.metrics.join(", ")}`);
    csvContent.push(``);
    
    // Process each metric into CSV rows
    Object.entries(data).forEach(([metricName, metricData]) => {
      csvContent.push(`## ${AVAILABLE_METRICS[metricName]?.name || metricName}`);
      
      if (metricName === "totalLeads" || metricName === "totalAnalyses" || metricName === "averageScore") {
        csvContent.push(`Value,${metricData}`);
      } 
      else if (metricName === "spamScoreDistribution") {
        csvContent.push(`Risk Level,Count`);
        csvContent.push(`Low,${metricData.low}`);
        csvContent.push(`Medium,${metricData.medium}`);
        csvContent.push(`High,${metricData.high}`);
      }
      else if (metricName === "businessTypeCounts") {
        csvContent.push(`Business Type,Count`);
        Object.entries(metricData).forEach(([type, count]) => {
          csvContent.push(`${type},${count}`);
        });
      }
      else if (metricName === "subjectLineLength") {
        csvContent.push(`Metric,Value`);
        csvContent.push(`Average Length,${metricData.averageLength}`);
        csvContent.push(`Average Word Count,${metricData.averageWordCount}`);
        csvContent.push(``);
        csvContent.push(`Length Category,Count`);
        csvContent.push(`Short,${metricData.lengthDistribution.short}`);
        csvContent.push(`Medium,${metricData.lengthDistribution.medium}`);
        csvContent.push(`Long,${metricData.lengthDistribution.long}`);
      }
      else if (metricName === "wordFrequency") {
        csvContent.push(`Word,Frequency`);
        metricData.forEach(item => {
          csvContent.push(`${item.word},${item.count}`);
        });
      }
      else if (metricName === "timeSeries") {
        csvContent.push(`Period,Count,Average Score,Average Spam Score`);
        metricData.data.forEach(item => {
          csvContent.push(`${item.period},${item.count},${item.averageScore},${item.averageSpamScore}`);
        });
      }
      
      csvContent.push(``); // Empty line between metrics
    });
    
    return csvContent.join('\n');
  },
  
  /**
   * Export report data to PDF format
   * @param {Object} reportData - Report data object
   * @param {Object} options - Export options
   * @returns {Promise<Buffer>} PDF content as buffer
   */
  async exportToPDF(reportData, options = {}) {
    // In a real implementation, we would use a PDF library like PDFKit
    // For this demonstration, we'll return a simple string indicating PDF generation
    // In production, this would return a Buffer containing the PDF data
    
    // This is a simplified implementation
    const csvContent = await this.exportToCSV(reportData, options);
    
    return Buffer.from(`PDF Export of report: ${reportData.metadata.generatedAt}\n\n` +
      `This is a placeholder for real PDF generation.\n\n` +
      `In a production environment, this would generate a styled PDF with charts and tables.\n\n` +
      `CSV Data preview:\n${csvContent.substring(0, 500)}...`);
  },
  
  /**
   * Load scheduled reports from storage
   * @returns {Promise<Array>} Array of scheduled report configurations
   */
  async getScheduledReports() {
    try {
      const data = await fs.readFile(SCHEDULED_REPORTS_PATH, "utf8");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        // Create the directory if it doesn't exist
        await fs.mkdir(path.dirname(SCHEDULED_REPORTS_PATH), { recursive: true });
        // Create an empty file
        await fs.writeFile(SCHEDULED_REPORTS_PATH, JSON.stringify([]), "utf8");
        return []; // Return empty array
      }
      throw error;
    }
  },
  
  /**
   * Save a scheduled report configuration
   * @param {Object} report - Report configuration
   * @returns {Promise<Object>} Saved report with ID
   */
  async saveScheduledReport(report) {
    // Load existing reports
    const reports = await this.getScheduledReports();
    
    // Create new report with ID
    const newReport = {
      id: uuidv4(),
      ...report,
    };
    
    // Add to reports array
    reports.push(newReport);
    
    // Save to file
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(SCHEDULED_REPORTS_PATH), { recursive: true });
      
      // Write to file
      await fs.writeFile(
        SCHEDULED_REPORTS_PATH,
        JSON.stringify(reports, null, 2),
        "utf8"
      );
      
      return newReport;
    } catch (error) {
      console.error("Error saving scheduled report:", error);
      throw new Error("Failed to save scheduled report");
    }
  },
  
  /**
   * Delete a scheduled report by ID
   * @param {string} id - Report ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteScheduledReport(id) {
    // Load existing reports
    const reports = await this.getScheduledReports();
    
    // Filter out the report to delete
    const filteredReports = reports.filter(report => report.id !== id);
    
    // If no reports were removed, the ID didn't exist
    if (filteredReports.length === reports.length) {
      return false;
    }
    
    // Save the updated reports
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(SCHEDULED_REPORTS_PATH), { recursive: true });
      
      // Write to file
      await fs.writeFile(
        SCHEDULED_REPORTS_PATH,
        JSON.stringify(filteredReports, null, 2),
        "utf8"
      );
      
      return true;
    } catch (error) {
      console.error("Error deleting scheduled report:", error);
      throw new Error("Failed to delete scheduled report");
    }
  }
};

module.exports = analyticsService;
