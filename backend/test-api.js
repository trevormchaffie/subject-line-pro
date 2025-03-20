const fetch = require("node-fetch");

// Configuration
const API_BASE_URL = "http://localhost:3000/api";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "your_secure_password_here"; // Use the same as in your .env file

// Helper function to make API calls
async function callAPI(endpoint, method = "GET", data = null, useAuth = false) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
  };

  if (useAuth) {
    const credentials = Buffer.from(
      `${ADMIN_USERNAME}:${ADMIN_PASSWORD}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    return {
      status: response.status,
      data: responseData,
    };
  } catch (error) {
    console.error(`Error calling ${method} ${url}:`, error);
    return {
      status: 500,
      error: error.message,
    };
  }
}

// Test functions
async function testAnalyzeEndpoint() {
  console.log("\n--- Testing Analyze Endpoint ---");

  const subjectLine = "FREE Exclusive Offer: LIMITED TIME ONLY!!!";
  console.log(`Subject line: "${subjectLine}"`);

  const result = await callAPI("/analyze", "POST", { subjectLine });

  if (result.status === 200) {
    console.log("Analysis successful!");
    console.log("Score:", result.data.data.overallScore);
    console.log("Spam score:", result.data.data.spamScore);
    console.log("Issues found:", result.data.data.issues.length);
    console.log("Suggestions:", result.data.data.suggestions.length);
  } else {
    console.error("Analysis failed:", result);
  }
}

async function testLeadSubmission() {
  console.log("\n--- Testing Lead Submission ---");

  const leadData = {
    name: "Test User",
    email: "test@example.com",
    businessType: "service",
    subjectLine: "Test subject line",
    analysisResults: {
      overallScore: 85,
      spamScore: 10,
    },
  };

  console.log("Submitting lead:", leadData.name, leadData.email);

  const result = await callAPI("/leads", "POST", leadData);

  if (result.status === 201) {
    console.log("Lead submitted successfully!");
    console.log("ID:", result.data.data.id);
  } else {
    console.error("Lead submission failed:", result);
  }
}

async function testGetLeads() {
  console.log("\n--- Testing Get Leads (Admin) ---");

  const result = await callAPI("/leads", "GET", null, true);

  if (result.status === 200) {
    console.log("Leads retrieved successfully!");
    console.log("Total leads:", result.data.data.length);
  } else {
    console.error("Failed to get leads:", result);
  }
}

async function testGetStats() {
  console.log("\n--- Testing Get Stats ---");

  const result = await callAPI("/stats", "GET");

  if (result.status === 200) {
    console.log("Stats retrieved successfully!");
    console.log("Stats:", result.data.data);
  } else {
    console.error("Failed to get stats:", result);
  }
}

// Run all tests
async function runTests() {
  console.log("Starting API tests...");

  try {
    await testAnalyzeEndpoint();
    await testLeadSubmission();
    await testGetLeads();
    await testGetStats();

    console.log("\nAll tests completed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run tests
runTests();
