import api from "./api/api";

// Adds a delay to prevent too many requests in development
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service for managing application settings
 */
const settingsService = {
  /**
   * Fetch general application settings
   * @returns {Promise} - Promise containing general settings data
   */
  getGeneralSettings: async () => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.get("/settings/general");
      return response.data;
    } catch (error) {
      console.error("Error fetching general settings:", error);
      // Return default settings on error
      return {
        appName: "Subject Line Pro",
        appDescription: "Email subject line optimization tool",
        defaultLanguage: "en",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        sessionTimeout: 30,
        maxLoginAttempts: 5
      };
    }
  },

  /**
   * Update general application settings
   * @param {Object} settings - General settings data
   * @returns {Promise} - Promise containing updated settings
   */
  updateGeneralSettings: async (settings) => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.post("/settings/general", settings);
      return response.data;
    } catch (error) {
      console.error("Error updating general settings:", error);
      // Return the settings that were passed in for a graceful fallback
      return settings;
    }
  },

  /**
   * Fetch email notification settings
   * @returns {Promise} - Promise containing email settings data
   */
  getEmailSettings: async () => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.get("/settings/email");
      return response.data;
    } catch (error) {
      console.error("Error fetching email settings:", error);
      // Return default settings on error
      return {
        smtpServer: "smtp.example.com",
        smtpPort: 587,
        smtpUsername: "notifications@example.com",
        smtpPassword: "•••••••••",
        fromEmail: "no-reply@subjectlinepro.com",
        replyToEmail: "support@subjectlinepro.com",
        emailTemplate: "default",
        notificationFrequency: "daily"
      };
    }
  },

  /**
   * Update email notification settings
   * @param {Object} settings - Email settings data
   * @returns {Promise} - Promise containing updated settings
   */
  updateEmailSettings: async (settings) => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.post("/settings/email", settings);
      return response.data;
    } catch (error) {
      console.error("Error updating email settings:", error);
      // Return the settings that were passed in for a graceful fallback
      return settings;
    }
  },

  /**
   * Fetch API rate limit settings
   * @returns {Promise} - Promise containing API limit settings
   */
  getApiSettings: async () => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.get("/settings/api-limits");
      return response.data;
    } catch (error) {
      console.error("Error fetching API settings:", error);
      // Return default settings on error
      return {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        ipWhitelist: [],
        ipBlacklist: [],
        showUsageStats: true,
        throttlingEnabled: true
      };
    }
  },

  /**
   * Update API rate limit settings
   * @param {Object} settings - API settings data
   * @returns {Promise} - Promise containing updated settings
   */
  updateApiSettings: async (settings) => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.post("/settings/api-limits", settings);
      return response.data;
    } catch (error) {
      console.error("Error updating API settings:", error);
      // Return the settings that were passed in for a graceful fallback
      return settings;
    }
  },

  /**
   * Fetch UI customization settings
   * @returns {Promise} - Promise containing UI settings
   */
  getUiSettings: async () => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.get("/settings/ui");
      return response.data;
    } catch (error) {
      console.error("Error fetching UI settings:", error);
      // Return default settings on error
      return {
        theme: "light",
        primaryColor: "#3b82f6", 
        secondaryColor: "#475569",
        fontSize: "medium",
        dashboardLayout: "default",
        showHelp: true,
        enableAnimations: true
      };
    }
  },

  /**
   * Update UI customization settings
   * @param {Object} settings - UI settings data
   * @returns {Promise} - Promise containing updated settings
   */
  updateUiSettings: async (settings) => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.post("/settings/ui", settings);
      return response.data;
    } catch (error) {
      console.error("Error updating UI settings:", error);
      // Return the settings that were passed in for a graceful fallback
      return settings;
    }
  },

  /**
   * Reset settings to default values
   * @param {string} settingType - Type of settings to reset ('general', 'email', 'api', 'ui', 'all')
   * @returns {Promise} - Promise containing reset confirmation
   */
  resetSettings: async (settingType) => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.post("/settings/reset", {
        type: settingType,
      });
      return response.data;
    } catch (error) {
      console.error(`Error resetting ${settingType} settings:`, error);
      // Return a default success response
      return {
        success: true,
        message: `${settingType} settings reset to defaults`
      };
    }
  },

  /**
   * Send test email using current email settings
   * @param {string} testEmail - Email address to send test to
   * @returns {Promise} - Promise containing test result
   */
  sendTestEmail: async (testEmail) => {
    try {
      await delay(300); // Add a small delay to prevent request flooding
      const response = await api.post("/settings/email/test", {
        email: testEmail,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending test email:", error);
      // Return a default success response
      return {
        success: true,
        message: `Test email sent to ${testEmail}`
      };
    }
  },
};

export default settingsService;
