// src/services/mailwizzService.js
const axios = require("axios");
const crypto = require("crypto");

class MailwizzService {
  constructor(config) {
    this.config = {
      apiUrl: config.apiUrl,
      publicKey: config.publicKey,
      privateKey: config.privateKey,
      listId: config.listId,
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Generate signature for Mailwizz API authentication
  generateSignature(requestUrl, data = {}) {
    const sortedData = {};
    Object.keys(data)
      .sort()
      .forEach((key) => {
        sortedData[key] = data[key];
      });

    const stringToSign = requestUrl + JSON.stringify(sortedData);
    return crypto
      .createHmac("sha1", this.config.privateKey)
      .update(stringToSign)
      .digest("hex");
  }

  // Add authentication headers to request
  addAuthHeaders(requestUrl, data = {}) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.generateSignature(requestUrl, data);

    return {
      "X-MW-PUBLIC-KEY": this.config.publicKey,
      "X-MW-TIMESTAMP": timestamp,
      "X-MW-SIGNATURE": signature,
    };
  }

  // Add a subscriber to Mailwizz list
  async addSubscriber(leadData) {
    try {
      const endpoint = `/lists/${this.config.listId}/subscribers`;
      const data = {
        EMAIL: leadData.email,
        FNAME: leadData.name.split(" ")[0] || "",
        LNAME: leadData.name.split(" ").slice(1).join(" ") || "",
        BUSINESS_TYPE: leadData.businessType,
        STATUS: leadData.status,
        SOURCE: "Subject Line Analyzer",
        IP_ADDRESS: leadData.ipAddress,
      };

      const headers = this.addAuthHeaders(endpoint, data);

      const response = await this.client.post(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      console.error("Mailwizz API error:", error);
      throw error;
    }
  }

  // Bulk export leads to Mailwizz
  async bulkExportLeads(leads) {
    const results = {
      success: [],
      failed: [],
    };

    for (const lead of leads) {
      try {
        await this.addSubscriber(lead);
        results.success.push(lead.id);
      } catch (error) {
        results.failed.push({
          id: lead.id,
          error: error.message,
        });
      }
    }

    return results;
  }
}

module.exports = MailwizzService;
