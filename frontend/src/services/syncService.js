import apiService from "./apiService";

/**
 * Service for handling offline data synchronization
 */
const syncService = {
  /**
   * Initialize offline data synchronization
   * Attempts to sync any pending leads when the user comes online
   */
  init() {
    // Check if there are pending leads to sync whenever coming online
    window.addEventListener("online", this.syncOfflineData);

    // Also try to sync when the app loads (in case we're already online)
    if (navigator.onLine) {
      this.syncOfflineData();
    }
  },

  /**
   * Sync any offline stored leads with the server
   */
  async syncOfflineData() {
    try {
      // Get stored offline leads
      const offlineLeadsStr = localStorage.getItem("offlineLeads");
      if (!offlineLeadsStr) return; // No data to sync

      const offlineLeads = JSON.parse(offlineLeadsStr);
      if (!offlineLeads.length) return; // Empty array

      console.log(`Attempting to sync ${offlineLeads.length} offline leads...`);

      // Track which leads were successfully submitted
      const successfulLeads = [];

      // Try to submit each lead
      for (const lead of offlineLeads) {
        try {
          // Submit the lead data
          await apiService.submitLead({
            name: lead.name,
            email: lead.email,
            businessType: lead.businessType,
            subjectLine: lead.subjectLine,
            analysisResults: lead.analysisResults,
            submittedFromOffline: true,
            originalTimestamp: lead.timestamp,
          });

          // If successful, mark this lead for removal
          successfulLeads.push(lead);
          console.log(`Successfully synced lead for: ${lead.email}`);
        } catch (error) {
          console.error(`Failed to sync lead for: ${lead.email}`, error);
        }
      }

      // Remove successful leads from storage
      if (successfulLeads.length > 0) {
        const remainingLeads = offlineLeads.filter(
          (lead) =>
            !successfulLeads.some(
              (successLead) => successLead.email === lead.email
            )
        );

        localStorage.setItem("offlineLeads", JSON.stringify(remainingLeads));
        console.log(
          `Synced ${successfulLeads.length} leads, ${remainingLeads.length} remaining.`
        );

        // Show a notification if supported
        if (Notification.permission === "granted") {
          new Notification("Subject Line Pro", {
            body: `Successfully synchronized ${successfulLeads.length} offline leads.`,
          });
        }
      }
    } catch (error) {
      console.error("Error syncing offline data:", error);
    }
  },
};

export default syncService;
