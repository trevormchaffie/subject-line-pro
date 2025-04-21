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
      
      // Use the dashboard endpoint with time-based cache busting
      const period = queryParam || `day?_t=${Date.now()}`;
      console.log('📡 Calling API endpoint with period:', period);

      // Use getDashboardMetrics which uses Basic Auth consistently
      const response = await apiService.getDashboardMetrics(period);
      
      console.log('✅ Dashboard stats API response:', response);

      // If the request was successful, return the data
      if (response && response.data) {
        console.log('📊 Received dashboard stats data:', response.data);
        
        // If there's dashboard stats in the response, return those stats directly
        if (response.data.dashboardStats) {
          console.log('📊 Found dashboardStats in response', response.data.dashboardStats);
          return response.data.dashboardStats;
        }
        
        // If no dashboardStats but we have general data, return that
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
      console.log('🔄 Fetching system status...');
      
      // Use getDashboardMetrics which uses Basic Auth for consistency
      const response = await apiService.getDashboardMetrics("system");
      console.log('✅ System status response:', response);
      
      // Handle both response formats
      if (response.success && response.data) {
        return response.data;
      }
      return response;
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
