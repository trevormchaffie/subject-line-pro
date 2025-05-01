/**
 * Test script for reporting endpoints with authentication
 */
const axios = require('axios');

// Base URL and auth credentials
const BASE_URL = 'http://localhost:3000/api';
const AUTH = {
  username: 'mr1018',
  password: 'Maya03112005'
};

// Test functions for each endpoint
async function testHealthEndpoint() {
  try {
    console.log('1. Testing health endpoint...');
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('   ✅ Success! Health endpoint is working');
    return true;
  } catch (error) {
    console.error('   ❌ Error with health endpoint:', error.message);
    return false;
  }
}

async function testAnalyticsTestEndpoint() {
  try {
    console.log('2. Testing analytics unprotected test endpoint...');
    const response = await axios.get(`${BASE_URL}/admin/analytics/test`);
    console.log('   ✅ Success! Analytics test endpoint is working');
    return true;
  } catch (error) {
    console.error('   ❌ Error with analytics test endpoint:', error.message);
    return false;
  }
}

async function testReportMetricsEndpoint() {
  try {
    console.log('3. Testing report metrics endpoint (authenticated)...');
    const response = await axios.get(`${BASE_URL}/admin/analytics/reports/metrics`, {
      auth: AUTH
    });
    console.log('   ✅ Success! Report metrics endpoint returned:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('   ❌ Error with report metrics endpoint:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    return false;
  }
}

async function testGenerateReportEndpoint() {
  try {
    console.log('4. Testing generate report endpoint (authenticated)...');
    const reportConfig = {
      startDate: '2025-01-01',
      endDate: '2025-04-01',
      metrics: ['totalLeads', 'averageScore', 'spamScoreDistribution'],
      groupBy: 'day'
    };
    
    const response = await axios.post(
      `${BASE_URL}/admin/analytics/reports/generate`, 
      reportConfig,
      { auth: AUTH }
    );
    
    console.log('   ✅ Success! Generate report endpoint returned data');
    console.log('   Report metadata:', response.data.data?.metadata || 'No metadata found');
    return true;
  } catch (error) {
    console.error('   ❌ Error with generate report endpoint:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    return false;
  }
}

async function testScheduledReportEndpoints() {
  try {
    console.log('5. Testing scheduled report endpoints (authenticated)...');
    
    // Create a scheduled report
    const reportConfig = {
      name: 'Test Weekly Report',
      startDate: '2025-01-01',
      endDate: '2025-04-01',
      metrics: ['totalLeads', 'averageScore'],
      schedule: 'weekly',
      recipients: ['test@example.com'],
      format: 'pdf'
    };
    
    console.log('   5.1 Creating a scheduled report...');
    const createResponse = await axios.post(
      `${BASE_URL}/admin/analytics/reports/scheduled`, 
      reportConfig,
      { auth: AUTH }
    );
    
    console.log('   ✅ Success! Created scheduled report with ID:', createResponse.data.data?.id);
    const reportId = createResponse.data.data?.id;
    
    // Get all scheduled reports
    console.log('   5.2 Getting all scheduled reports...');
    const getResponse = await axios.get(
      `${BASE_URL}/admin/analytics/reports/scheduled`,
      { auth: AUTH }
    );
    
    console.log('   ✅ Success! Retrieved scheduled reports:', getResponse.data.data?.length || 0, 'reports found');
    
    // Delete the created report if we have an ID
    if (reportId) {
      console.log('   5.3 Deleting the created scheduled report...');
      const deleteResponse = await axios.delete(
        `${BASE_URL}/admin/analytics/reports/scheduled/${reportId}`,
        { auth: AUTH }
      );
      
      console.log('   ✅ Success! Deleted scheduled report');
    }
    
    return true;
  } catch (error) {
    console.error('   ❌ Error with scheduled report endpoints:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting tests for custom reporting endpoints...\n');
  
  // Run the health check first
  const healthOk = await testHealthEndpoint();
  console.log();
  
  if (!healthOk) {
    console.error('\n❌ Health endpoint failed - server may not be running. Start the server with: npm run dev');
    return;
  }
  
  // Run the analytics test endpoint
  const analyticsTestOk = await testAnalyticsTestEndpoint();
  console.log();
  
  if (!analyticsTestOk) {
    console.error('\n❌ Analytics test endpoint failed - routes may not be properly configured');
    return;
  }
  
  // Run the authenticated endpoints
  await testReportMetricsEndpoint();
  console.log();
  
  await testGenerateReportEndpoint();
  console.log();
  
  await testScheduledReportEndpoints();
  console.log();
  
  console.log('🎉 All tests completed!');
}

// Check if axios is installed
try {
  require.resolve('axios');
  // Run the tests
  runTests();
} catch (e) {
  console.error('Error: axios is not installed. Please run:');
  console.error('npm install axios');
  console.error('Then run this script again.');
}