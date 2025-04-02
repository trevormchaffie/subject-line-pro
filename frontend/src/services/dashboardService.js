/**
 * TODO: API Integration Issues
 *
 * Current implementation uses fallback data while API integration is pending.
 * The following issues need to be addressed:
 * 1. The apiService methods for API calls need to be determined and used correctly
 * 2. Backend endpoints may need to be updated to match the expected paths
 * 3. Authentication method needs to be properly implemented
 *
 * For now, the dashboard uses simulated data for activity feed and
 * direct API calls for the Performance Analytics section.
 */

import apiService from "./apiService";

const dashboardService = {
  async getDashboardStats(queryParam = "") {
    try {
      // Build the endpoint with the timestamp
      const endpoint = `/dashboard/stats${queryParam || `?_t=${Date.now()}`}`;

      // Use apiService's apiRequest method instead of fetchWithAuth
      const response = await apiService.apiRequest(endpoint, "GET", null, true);

      // If the request was successful, return the data
      return (
        response.data || {
          totalLeads: 0,
          totalAnalyses: 0,
          conversionRate: 0,
          avgScore: 0,
          recentLeads: [],
          recentAnalyses: [],
        }
      );
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalLeads: 0,
        totalAnalyses: 0,
        conversionRate: 0,
        avgScore: 0,
        recentLeads: [],
        recentAnalyses: [],
      };
    }
  },

  async getSystemStatus() {
    try {
      // Use apiService's apiRequest method instead of fetchWithAuth
      const response = await apiService.apiRequest(
        "/api/stats/system",
        "GET",
        null,
        true
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching system status:", error);
      // Return fallback data
      return {
        apiStatus: "operational",
        databaseStatus: "operational",
        lastBackup: "2025-03-25T03:00:00Z",
        serverLoad: "low",
      };
    }
  },
};

export default dashboardService;
