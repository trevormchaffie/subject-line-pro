// Test script for testing with a known token
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';
const LEADS_URL = `${API_URL}/leads/admin`;

// Token from the most recent auth test
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1yMTAxOCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NTk4OTA0MiwiZXhwIjoxNzQ2MDc1NDQyfQ.IgHsOoWIXerfBxiZL6aab7iQeGG6QlCPK0zBc2PaPLA';

// Test: Get leads with token
const testGetLeads = async () => {
  console.log("Testing get leads with provided token...");
  try {
    const response = await axios.get(LEADS_URL, {
      headers: { 
        Authorization: `Bearer ${TOKEN}` 
      },
      params: {
        page: 1,
        limit: 10
      }
    });
    console.log("SUCCESS! Retrieved leads");
    console.log("Response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log("FAILED to get leads");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
};

// Execute the test
testGetLeads();