/**
 * Simple test script for analytics endpoints
 */
const fs = require('fs');
const path = require('path');

// Test basic analytics endpoints
async function testAnalyticsEndpoints() {
  try {
    console.log("Testing the analytics endpoints directly without HTTP...");
    
    // Directly require the controller
    const analyticsController = require('./src/controllers/analyticsController');
    
    // Create a mock req object
    const req = {
      query: {},
      user: { id: 'test-user' }
    };
    
    // Create a mock res object
    const res = {
      json: (data) => {
        console.log("Response from getConversionMetrics:", JSON.stringify(data, null, 2));
        return res;
      },
      status: (code) => {
        console.log("Status code:", code);
        return res;
      },
      send: (data) => {
        console.log("Response sent:", data);
        return res;
      }
    };
    
    // Create a mock next function
    const next = (error) => {
      console.error("Error in controller:", error);
    };
    
    // Test getConversionMetrics
    console.log("Testing getConversionMetrics...");
    await analyticsController.getConversionMetrics(req, res, next);
    
    console.log("Test completed successfully");
  } catch (err) {
    console.error("Error testing endpoints:", err);
  }
}

// Run the tests
testAnalyticsEndpoints();