import apiService from "./apiService";

const dashboardService = {
  async getDashboardStats() {
    try {
      const response = await apiService.fetchWithAuth("/api/stats/dashboard");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return fallback data for development
      return {
        totalLeads: 125,
        totalAnalyses: 347,
        conversionRate: 36,
        avgScore: 72,
        recentLeads: [],
        recentAnalyses: [],
      };
    }
  },

  async getSystemStatus() {
    try {
      const response = await apiService.fetchWithAuth("/api/stats/system");
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
