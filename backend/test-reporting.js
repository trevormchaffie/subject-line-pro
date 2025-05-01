/**
 * Test script for reporting endpoints
 */
const http = require('http');
const analyticsService = require('./src/services/analytics/analyticsService');

// Base URL and auth
const BASE_URL = 'http://127.0.0.1:3000/api/analytics';
const AUTH_HEADER = 'Basic ' + Buffer.from('mr1018:Maya03112005').toString('base64');

// Test direct service access first
console.log("Testing metrics service directly:");
const metrics = analyticsService.getAvailableMetrics();
console.log("Available metrics:", JSON.stringify(metrics, null, 2));

/**
 * Make an HTTP request
 * @param {string} method - HTTP method
 * @param {string} path - Endpoint path
 * @param {object} data - Request body for POST requests
 * @returns {Promise<object>} Response data
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(`${BASE_URL}${path}`, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          console.log(`Response from ${path}:`, parsedData);
          resolve(parsedData);
        } catch (e) {
          console.log(`Raw response from ${path}:`, responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Error with request to ${path}:`, error);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Run tests for reporting endpoints
 */
async function runTests() {
  try {
    console.log('Testing reporting endpoints...');

    // 1. Test getting available metrics
    console.log('\n1. Testing /reports/metrics endpoint:');
    await makeRequest('GET', '/reports/metrics');

    // 2. Test generating a report
    console.log('\n2. Testing /reports/generate endpoint:');
    const reportConfig = {
      startDate: '2025-01-01',
      endDate: '2025-04-01',
      metrics: ['totalLeads', 'averageScore', 'spamScoreDistribution'],
      groupBy: 'day'
    };
    await makeRequest('POST', '/reports/generate', reportConfig);

    // 3. Test export endpoint (JSON format)
    console.log('\n3. Testing /reports/export endpoint (JSON format):');
    const exportConfig = {
      ...reportConfig,
      format: 'json'
    };
    await makeRequest('POST', '/reports/export', exportConfig);

    // 4. Test scheduled reports
    console.log('\n4. Testing saving a scheduled report:');
    const scheduledReport = {
      name: 'Test Weekly Report',
      startDate: '2025-01-01',
      endDate: '2025-04-01',
      metrics: ['totalLeads', 'averageScore'],
      schedule: 'weekly',
      recipients: ['test@example.com'],
      format: 'pdf'
    };
    const savedReport = await makeRequest('POST', '/reports/scheduled', scheduledReport);
    
    if (savedReport.data && savedReport.data.id) {
      console.log('\n5. Testing getting all scheduled reports:');
      await makeRequest('GET', '/reports/scheduled');
      
      console.log(`\n6. Testing deleting a scheduled report (ID: ${savedReport.data.id}):`);
      await makeRequest('DELETE', `/reports/scheduled/${savedReport.data.id}`);
      
      console.log('\n7. Verifying report was deleted:');
      await makeRequest('GET', '/reports/scheduled');
    }

    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests();