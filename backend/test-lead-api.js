// Test script for leads API endpoints
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';
const AUTH_URL = `${API_URL}/auth/login`;
const LEADS_URL = `${API_URL}/leads`;
const ADMIN_LEADS_URL = `${API_URL}/leads/admin`;

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'mr1018',
  password: 'Maya03112005'
};

// Sample lead data
const SAMPLE_LEAD = {
  name: "Test User",
  email: "testuser@example.com",
  businessType: "E-commerce",
  subjectLine: "Special 50% off sale ending soon",
  analysisResults: {
    score: 85,
    feedback: "Good subject line with clear incentive",
    powerWords: ["special", "off", "ending soon"],
    problems: []
  }
};

// Helper function to log results
const logResult = (testName, success, response = null, error = null) => {
  console.log(`\n----- ${testName} -----`);
  if (success) {
    console.log("✅ SUCCESS");
    if (response) {
      console.log("Response:", typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data);
    }
  } else {
    console.log("❌ FAILED");
    if (error) {
      console.log("Error:", error.message);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
      }
    }
  }
};

// Helper function to get admin token
const getAdminToken = async () => {
  try {
    const response = await axios.post(AUTH_URL, ADMIN_CREDENTIALS);
    return response.data.token;
  } catch (error) {
    console.error("Failed to get admin token:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    throw error;
  }
};

// Test: Submit Lead (Public)
const testSubmitLead = async () => {
  try {
    const response = await axios.post(LEADS_URL, SAMPLE_LEAD);
    logResult("Submit Lead (Public)", true, response);
    return response.data.data.id; // Return ID for further tests
  } catch (error) {
    logResult("Submit Lead (Public)", false, null, error);
    return null;
  }
};

// Test: Get Leads with Filtering (Admin)
const testGetLeads = async (token) => {
  try {
    const response = await axios.get(ADMIN_LEADS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc"
      }
    });
    logResult("Get Leads with Filtering (Admin)", true, response);
    return response.data.data;
  } catch (error) {
    logResult("Get Leads with Filtering (Admin)", false, null, error);
    return [];
  }
};

// Test: Get Lead by ID (Admin)
const testGetLeadById = async (token, leadId) => {
  try {
    const response = await axios.get(`${ADMIN_LEADS_URL}/${leadId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    logResult("Get Lead by ID (Admin)", true, response);
    return response.data.data;
  } catch (error) {
    logResult("Get Lead by ID (Admin)", false, null, error);
    return null;
  }
};

// Test: Update Lead Status (Admin)
const testUpdateLead = async (token, leadId) => {
  try {
    const response = await axios.put(`${ADMIN_LEADS_URL}/${leadId}`, {
      status: "Contacted"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    logResult("Update Lead Status (Admin)", true, response);
    return response.data.data;
  } catch (error) {
    logResult("Update Lead Status (Admin)", false, null, error);
    return null;
  }
};

// Test: Add Note to Lead (Admin)
const testAddLeadNote = async (token, leadId) => {
  try {
    const response = await axios.post(`${ADMIN_LEADS_URL}/notes`, {
      leadId: leadId,
      note: "This is a test note from the API test script"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    logResult("Add Note to Lead (Admin)", true, response);
    return response.data.data;
  } catch (error) {
    logResult("Add Note to Lead (Admin)", false, null, error);
    return null;
  }
};

// Test: Export Leads (Admin)
const testExportLeads = async (token) => {
  try {
    const response = await axios.get(`${ADMIN_LEADS_URL}/export`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { format: 'json' }
    });
    logResult("Export Leads (Admin)", true, response);
    return response.data.data;
  } catch (error) {
    logResult("Export Leads (Admin)", false, null, error);
    return null;
  }
};

// Run all tests
const runTests = async () => {
  console.log("🚀 Starting Lead API Tests");
  console.log("==========================");
  
  try {
    // First, submit a new lead (public endpoint)
    const leadId = await testSubmitLead();
    
    if (!leadId) {
      console.log("❌ Cannot continue tests without a lead ID");
      return;
    }
    
    // Get admin token for protected endpoints
    const token = await getAdminToken();
    
    // Run all admin endpoints tests
    await testGetLeads(token);
    await testGetLeadById(token, leadId);
    await testUpdateLead(token, leadId);
    await testAddLeadNote(token, leadId);
    await testExportLeads(token);
    
    console.log("\n==========================");
    console.log("✅ All tests completed");
  } catch (error) {
    console.error("\n❌ Test suite failed:", error.message);
  }
};

// Execute the test suite
runTests();