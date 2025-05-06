// src/services/spamTriggerService.js
//import api from "./api"; // Assuming you have a base API configuration
import apiService from "./apiService";

const ENDPOINT = "/api/spam-triggers";

export const spamTriggerService = {
  // Get all spam triggers with optional filtering
  async getAll(params = {}) {
    const response = await api.get(ENDPOINT, { params });
    return response.data;
  },

  // Get a single spam trigger by ID
  async getById(id) {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Create a new spam trigger
  async create(triggerData) {
    const response = await api.post(ENDPOINT, triggerData);
    return response.data;
  },

  // Update an existing spam trigger
  async update(id, triggerData) {
    const response = await api.put(`${ENDPOINT}/${id}`, triggerData);
    return response.data;
  },

  // Delete a spam trigger
  async delete(id) {
    await api.delete(`${ENDPOINT}/${id}`);
    return { success: true };
  },

  // Bulk create/update triggers
  async bulkCreate(triggers) {
    const response = await api.post(`${ENDPOINT}/bulk`, { triggers });
    return response.data;
  },

  // Update active status for multiple triggers
  async bulkUpdateStatus(ids, active) {
    const response = await api.patch(`${ENDPOINT}/bulk-status`, {
      ids,
      active,
    });
    return response.data;
  },

  // Delete multiple triggers
  async bulkDelete(ids) {
    const response = await api.delete(`${ENDPOINT}/bulk`, { data: { ids } });
    return response.data;
  },

  // Export data to JSON
  async exportToJson() {
    const response = await api.get(`${ENDPOINT}/export/json`);
    return response.data;
  },

  // Import from JSON
  async importFromJson(jsonData) {
    const response = await api.post(`${ENDPOINT}/import/json`, {
      data: jsonData,
    });
    return response.data;
  },

  // Export to CSV
  async exportToCsv() {
    const response = await api.get(`${ENDPOINT}/export/csv`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Import from CSV
  async importFromCsv(formData) {
    const response = await api.post(`${ENDPOINT}/import/csv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
