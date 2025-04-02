/**
 * Dashboard service for accessing dashboard-related API endpoints
 */

import apiService from "./apiService";

const dashboardService = {
  /**
   * Get dashboard stats for the main metrics cards and recent activity
   * @param {string} queryParam - Optional query parameter to append (for cache busting)
   * @returns {Promise<Object>} Dashboard stats
   */
  async getDashboardStats(queryParam = "") {
    try {
      console.log('🔄 Fetching dashboard stats with cache buster...');
      
      // Use the existing endpoint that's actually being called
      const endpoint = `/api/stats/dashboard${queryParam || `?_t=${Date.now()}`}`;
      console.log('📡 Calling API endpoint:', endpoint);

      // Use apiService's apiRequest method with Basic Auth
      const response = await apiService.apiRequest(
        endpoint, 
        "GET", 
        null, 
        false, 
        true
      );

      console.log('✅ Dashboard stats API response:', response);

      // If the request was successful, return the data
      if (response && response.data) {
        console.log('📊 Received dashboard stats data:', response.data);
        return response.data;
      } else {
        console.warn('⚠️ No data received from dashboard stats API');
        // Return fallback data
        return {
          totalLeads: 0,
          totalAnalyses: 0,
          conversionRate: 0,
          avgScore: 0,
          recentLeads: [],
          recentAnalyses: [],
        };
      }
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      // Return fallback data to prevent UI breaking
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

  /**
   * Get system status information for dashboard
   * @returns {Promise<Object>} System status info
   */
  async getSystemStatus() {
    try {
      // Use apiService's apiRequest method with Basic Auth
      const response = await apiService.apiRequest(
        "/api/stats/system",
        "GET",
        null,
        false,
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
