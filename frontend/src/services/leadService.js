// src/services/leadService.js
import api from "./apiService";

const leadService = {
  /**
   * Get leads with filtering, sorting, and pagination
   */
  async getLeads(params = {}) {
    try {
      // Construct URL with query parameters
      const queryParams = new URLSearchParams();
      
      // Add all parameters to the query string
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.status) queryParams.append('status', params.status);
      if (params.businessType) queryParams.append('businessType', params.businessType);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.search) queryParams.append('search', params.search);
      
      // Create URL with query parameters
      const url = `http://localhost:3001/api/leads/admin?${queryParams.toString()}`;
      console.log("Fetching leads from URL:", url);
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa('mr1018:Maya03112005')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Leads API response:", data);
      
      return {
        data: data.data || [],
        meta: data.meta || {
          total: data.data?.length || 0,
          totalPages: 1
        }
      };
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  },

  /**
   * Get a single lead by ID
   */
  async getLeadById(id) {
    try {
      console.log(`Fetching lead details for ID: ${id}`);
      
      const response = await fetch(`http://localhost:3001/api/leads/admin/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa('mr1018:Maya03112005')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Lead fetch response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error response: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched lead data:`, data);
      return data.data;
    } catch (error) {
      console.error(`Error fetching lead ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update lead details
   */
  async updateLead(id, data) {
    try {
      console.log(`Updating lead ${id} with data:`, data);
      
      const response = await fetch(`http://localhost:3001/api/leads/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa('mr1018:Maya03112005')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      console.log(`Update response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API returned error response: ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log(`Successfully updated lead. Response:`, responseData);
      return responseData.data;
    } catch (error) {
      console.error(`Error updating lead ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a note to a lead
   */
  async addNote(leadId, note) {
    try {
      const response = await fetch(`http://localhost:3001/api/leads/admin/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('mr1018:Maya03112005')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId, note })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error adding note to lead ${leadId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a lead
   */
  async deleteLead(id) {
    try {
      console.log(`Deleting lead ${id}`);
      
      const response = await fetch(`http://localhost:3001/api/leads/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa('mr1018:Maya03112005')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Delete response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API returned error response: ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting lead ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete multiple leads
   */
  async deleteMultipleLeads(ids) {
    try {
      console.log(`Deleting multiple leads: ${ids.join(', ')}`);
      
      const response = await fetch(`http://localhost:3001/api/leads/admin/bulk-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('mr1018:Maya03112005')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting multiple leads:`, error);
      throw error;
    }
  },

  /**
   * Get the URL for exporting leads
   */
  getExportUrl(format = "csv", filters = {}) {
    const baseUrl = `http://localhost:3001/api/leads/admin/export`;
    const params = new URLSearchParams({ format });
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.businessType) params.append('businessType', filters.businessType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    
    // Return URL with Basic Auth credentials included in the URL for download
    return `${baseUrl}?${params.toString()}`;
  },
};

export default leadService;
