/**
 * API service for communicating with the backend
 *
 * This centralized service handles all API calls to the backend,
 * providing error handling and consistent response formatting.
 */

// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Make an API request with error handling
 * @param {string} endpoint - API endpoint path
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} data - Request data (for POST, PUT)
 * @returns {Promise<object>} Response data
 */
async function apiRequest(endpoint, method = "GET", data = null, auth = false) {
  const url = `${API_BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add this block to handle authentication
  if (auth) {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    // Check for network or HTTP errors
    if (!response.ok) {
      let errorData;
      try {
        // Attempt to parse error response
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, create a simple error object
        errorData = {
          error: {
            message: `API request failed with status ${response.status}`,
          },
        };
      }

      throw new Error(errorData.error?.message || "API request failed");
    }

    // Parse and return response data
    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    throw error; // Re-throw to allow components to handle the error
  }
}

/**
 * API service object with methods for each endpoint
 */
const apiService = {
  /**
   * Analyze a subject line
   * @param {string} subjectLine - The subject line to analyze
   * @returns {Promise<object>} Analysis results
   */
  async analyzeSubject(subjectLine) {
    return apiRequest("/analyze", "POST", { subjectLine });
  },

  /**
   * Submit a lead
   * @param {object} leadData - Lead information (name, email, businessType)
   * @returns {Promise<object>} Submission result
   */
  async submitLead(leadData) {
    return apiRequest("/leads", "POST", leadData);
  },

  /**
   * Get spam triggers
   * @returns {Promise<object>} Spam triggers data
   */
  async getSpamTriggers() {
    return apiRequest("/analyze/spam-triggers");
  },

  /**
   * Get power words
   * @returns {Promise<object>} Power words data
   */
  async getPowerWords() {
    return apiRequest("/analyze/power-words");
  },

  /**
   * Get time-series analytics data
   * @param {string} timeframe - daily, weekly, or monthly
   * @param {number} limit - number of periods to return
   * @returns {Promise<object>} Time-series data
   */
  async getAnalyticsTimeSeries(timeframe = "daily", limit = 30) {
    return apiRequest(
      `/analytics/time-series?timeframe=${timeframe}&limit=${limit}`,
      "GET",
      null,
      true
    );
  },

  /**
   * Get score distribution data
   * @returns {Promise<object>} Distribution data
   */
  async getScoreDistribution() {
    return apiRequest("/analytics/score-distribution", "GET", null, true);
  },

  /**
   * Get top-performing subject lines
   * @param {number} limit - number of items to return
   * @returns {Promise<object>} Top subject lines
   */
  async getTopSubjectLines(limit = 10) {
    return apiRequest(
      `/analytics/top-subjects?limit=${limit}`,
      "GET",
      null,
      true
    );
  },

  /**
   * Get lead conversion metrics
   * @returns {Promise<object>} Conversion metrics
   */
  async getConversionMetrics() {
    return apiRequest("/analytics/conversion", "GET", null, true);
  },
};

export default apiService;
