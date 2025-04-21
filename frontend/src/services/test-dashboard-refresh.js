/**
 * API Service Test Tool
 * 
 * A test utility that can be run directly in the browser console to diagnose
 * API service connectivity issues with the dashboard.
 * 
 * How to use:
 * 1. Open your browser console on any page of the app
 * 2. Copy and paste this entire file into the console
 * 3. Run the test functions as described in the instructions
 */

(function() {
  console.log('🧪 Loading API Service Test Tool...');
  
  // Create a visual UI for test results
  function createTestUI() {
    // Remove any existing test UI
    const existingUI = document.getElementById('api-test-results');
    if (existingUI) {
      existingUI.remove();
    }
    
    // Create a new UI container
    const container = document.createElement('div');
    container.id = 'api-test-results';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 500px;
      max-height: 80vh;
      overflow: auto;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    // Add a header and close button
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; font-size: 16px;">API Test Results</h3>
        <button id="close-test-ui" style="background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
      </div>
      <div id="test-results-content"></div>
    `;
    
    document.body.appendChild(container);
    
    // Add close button handler
    document.getElementById('close-test-ui').addEventListener('click', () => {
      container.remove();
    });
    
    return document.getElementById('test-results-content');
  }
  
  // Add a test result to the UI
  function addTestResult(message, success = true, data = null) {
    const resultsContent = document.getElementById('test-results-content');
    if (!resultsContent) return;
    
    const resultElement = document.createElement('div');
    resultElement.style.cssText = `
      margin-bottom: 10px;
      padding: 8px;
      border-radius: 4px;
      background-color: ${success ? '#f0f9f0' : '#fff0f0'};
      border-left: 4px solid ${success ? '#38c172' : '#e3342f'};
    `;
    
    resultElement.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <span style="margin-right: 8px; color: ${success ? '#38c172' : '#e3342f'};">
          ${success ? '✅' : '❌'}
        </span>
        <strong>${message}</strong>
      </div>
      ${data ? `<pre style="margin: 4px 0 0 24px; overflow: auto; font-size: 12px; background: #f8f8f8; padding: 8px; border-radius: 4px;">${
        typeof data === 'object' ? JSON.stringify(data, null, 2) : data
      }</pre>` : ''}
    `;
    
    resultsContent.appendChild(resultElement);
  }
  
  async function runApiTest() {
    const resultsUI = createTestUI();
    
    console.log('🔍 Starting API Service Test...');
    addTestResult('API Service Test Started', true);
    
    // Check if apiService is available
    if (typeof window.apiService === 'undefined') {
      console.error('❌ apiService not found in window scope');
      addTestResult('apiService not found in window scope', false);
      addTestResult('Make sure you are running this test on a page where apiService is imported', false);
      return;
    }
    
    const apiService = window.apiService;
    addTestResult('apiService found in window scope', true);
    
    // Test 1: Basic Auth API request
    try {
      console.log('📡 Testing apiService.getDashboardMetrics (Basic Auth)...');
      addTestResult('Testing getDashboardMetrics with Basic Auth...', true);
      
      const basicAuthResult = await apiService.getDashboardMetrics('day');
      console.log('✅ Basic Auth API call result:', basicAuthResult);
      
      if (basicAuthResult && basicAuthResult.data) {
        addTestResult('Basic Auth API call succeeded', true, {
          responseType: typeof basicAuthResult,
          hasData: !!basicAuthResult.data,
          dataSize: JSON.stringify(basicAuthResult.data).length
        });
      } else {
        addTestResult('Basic Auth API call returned unexpected format', false, basicAuthResult);
      }
    } catch (err) {
      console.error('❌ Basic Auth API call failed:', err);
      addTestResult('Basic Auth API call failed', false, {
        error: err.message,
        stack: err.stack
      });
    }
    
    // Test 2: Check if dashboardService is available
    if (typeof window.dashboardService === 'undefined') {
      console.warn('⚠️ dashboardService not found in window scope');
      addTestResult('dashboardService not found in window scope', false);
    } else {
      const dashboardService = window.dashboardService;
      addTestResult('dashboardService found in window scope', true);
      
      // Test 3: Using dashboardService
      try {
        console.log('📡 Testing dashboardService.getDashboardStats...');
        addTestResult('Testing dashboardService.getDashboardStats...', true);
        
        const dashboardResult = await dashboardService.getDashboardStats();
        console.log('✅ Dashboard service call result:', dashboardResult);
        
        addTestResult('Dashboard service call succeeded', true, {
          totalLeads: dashboardResult.totalLeads,
          totalAnalyses: dashboardResult.totalAnalyses,
          hasRecentLeads: Array.isArray(dashboardResult.recentLeads) && dashboardResult.recentLeads.length > 0,
          hasRecentAnalyses: Array.isArray(dashboardResult.recentAnalyses) && dashboardResult.recentAnalyses.length > 0
        });
      } catch (err) {
        console.error('❌ Dashboard service call failed:', err);
        addTestResult('Dashboard service call failed', false, {
          error: err.message,
          stack: err.stack
        });
      }
    }
    
    // Test 4: Direct API call with makeAuthenticatedRequest
    if (apiService.makeAuthenticatedRequest) {
      try {
        console.log('📡 Testing apiService.makeAuthenticatedRequest...');
        addTestResult('Testing makeAuthenticatedRequest (Token Auth)...', true);
        
        const tokenAuthResult = await apiService.makeAuthenticatedRequest('/stats/dashboard');
        console.log('✅ Token Auth API call result:', tokenAuthResult);
        
        addTestResult('Token Auth API call succeeded', true, {
          responseType: typeof tokenAuthResult,
          hasData: !!tokenAuthResult.data,
          dataKeys: tokenAuthResult.data ? Object.keys(tokenAuthResult.data) : []
        });
      } catch (err) {
        console.error('❌ Token Auth API call failed:', err);
        addTestResult('Token Auth API call failed', false, {
          error: err.message,
          stack: err.stack
        });
      }
    } else {
      addTestResult('makeAuthenticatedRequest method not found on apiService', false);
    }
    
    console.log('✅ API Service Test completed');
    addTestResult('API Service Test completed', true);
  }
  
  // Expose test functions to the global scope
  window.runApiTest = runApiTest;
  
  // Show instructions
  console.log(`
  📊 API Service Test Tool Loaded!
  ------------------------------
  Run this command to test API connectivity:

    runApiTest()

  This will test:
  1. Basic Auth API requests
  2. Token Auth API requests
  3. Dashboard service integration

  Results will appear in the browser console and in a floating panel.
  `);
})();