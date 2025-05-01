// Simple test script for the public lead submission endpoint
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';
const LEADS_URL = `${API_URL}/leads`;

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

// Test: Submit Lead (Public)
const testSubmitLead = async () => {
  console.log("Testing public lead submission...");
  try {
    const response = await axios.post(LEADS_URL, SAMPLE_LEAD);
    console.log("SUCCESS! Lead submitted with ID:", response.data.data.id);
    console.log("Response:", JSON.stringify(response.data, null, 2));
    return response.data.data.id;
  } catch (error) {
    console.log("FAILED to submit lead");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
};

// Execute the test
testSubmitLead();