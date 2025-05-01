/**
 * API service for communicating with the backend
 *
 * This centralized service handles all API calls to the backend,
 * providing error handling and consistent response formatting.
 */

// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api"; // Updated to match backend port

// Admin credentials for Basic Auth - in production, use environment variables
const ADMIN_USERNAME = "mr1018";
const ADMIN_PASSWORD = "Maya03112005";

/**
 * Get stored auth token from localStorage or sessionStorage
 * @returns {string|null} The stored auth token
 */
const getStoredAuthToken = () => {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
};

/**
 * Attempt to refresh the auth token
 * @returns {Promise<boolean>} Whether the refresh was successful
 */
const refreshAuthToken = async () => {
  try {
    const url = `${API_BASE_URL}/auth/refresh`;
    const token = getStoredAuthToken();

    console.log("Attempting to refresh auth token");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include the current token in the Authorization header
        Authorization: `Bearer ${token}`,
      },
      // Remove credentials: 'include' to fix CORS issues
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Token refresh response:", data);

      if (data.token) {
        console.log("New token received, updating storage");
        // Store the new token where the old one was stored
        if (localStorage.getItem("authToken")) {
          localStorage.setItem("authToken", data.token);
        } else {
          sessionStorage.setItem("authToken", data.token);
        }
        return true;
      }
    }
    console.warn(
      "Failed to refresh token, response:",
      response.status,
      response.statusText
    );
    return false;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
};

/**
 * Make an authenticated API request with token refresh handling
 * @param {string} endpoint - API endpoint path
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} data - Request data (for POST, PUT)
 * @returns {Promise<object>} Response data
 */
const makeAuthenticatedRequest = async (
  endpoint,
  method = "GET",
  data = null
) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getStoredAuthToken()}`,
    };

    const options = {
      method,
      headers,
      // Remove credentials: 'include' to fix CORS issues
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    console.log(`Making authenticated ${method} request to ${url}`, options);
    const response = await fetch(url, options);

    // Handle token refresh if needed
    if (response.status === 401) {
      console.log("Received 401 response, attempting token refresh");
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        console.log("Token refreshed successfully, retrying request");
        return makeAuthenticatedRequest(endpoint, method, data);
      } else {
        console.error("Token refresh failed");
        throw new Error("Authentication failed");
      }
    }

    if (!response.ok) {
      console.error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log(
      `Response from authenticated request to ${endpoint}:`,
      responseData
    );
    return responseData;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

/**
 * Make an API request with error handling
 * @param {string} endpoint - API endpoint path
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} data - Request data (for POST, PUT)
 * @param {boolean} auth - Whether to use token auth
 * @param {boolean} useBasicAuth - Whether to use Basic Auth
 * @returns {Promise<object>} Response data
 */
async function apiRequest(
  endpoint,
  method = "GET",
  data = null,
  auth = false,
  useBasicAuth = false
) {
  // Make sure we're using the correct API base URL with port 3001
  const url = `http://localhost:3001/api${endpoint}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add token-based authentication
  if (auth) {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Add Basic Auth
  if (useBasicAuth) {
    const credentials = btoa(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`);
    options.headers["Authorization"] = `Basic ${credentials}`;
  }

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Making ${method} request to ${url}`, options);
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
    const responseData = await response.json();
    console.log(`Response from ${url}:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    throw error; // Re-throw to allow components to handle the error
  }
}


/**
 * API service object with methods for each endpoint
 */
const apiService = {
  // Add defaults for axios-like compatibility
  defaults: {
    baseURL: API_BASE_URL
  },
  
  // Expose the makeAuthenticatedRequest method
  makeAuthenticatedRequest,
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
    // Use Basic Auth for analytics endpoints
    return apiRequest(
      `/analytics/time-series?timeframe=${timeframe}&limit=${limit}`,
      "GET",
      null,
      false,
      true
    );
  },

  /**
   * Get score distribution data
   * @returns {Promise<object>} Distribution data
   */
  async getScoreDistribution() {
    return apiRequest(
      "/analytics/score-distribution",
      "GET",
      null,
      false,
      true
    );
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
      false,
      true
    );
  },

  /**
   * Get detailed analysis for a subject line
   * @param {string} id - ID of the subject line
   * @returns {Promise<object>} Detailed analysis
   */
  async getSubjectLineDetails(id) {
    return apiRequest(
      `/analytics/subject-details/${id}`,
      "GET",
      null,
      false,
      true
    );
  },

  /**
   * Get lead conversion metrics
   * @returns {Promise<object>} Conversion metrics
   */
  async getConversionMetrics() {
    return apiRequest("/analytics/conversion", "GET", null, false, true);
  },

  /**
   * Get dashboard metrics
   * @param {string} period - 'day', 'week', 'month', 'year', or 'all'
   * @returns {Promise<object>} Dashboard metrics
   */
  async getDashboardMetrics(period = "all") {
    // Use Basic Auth for this endpoint to match your curl command
    return apiRequest(
      `/stats/dashboard?period=${period}`,
      "GET",
      null,
      false,
      true
    );
  },

};

export default apiService;
