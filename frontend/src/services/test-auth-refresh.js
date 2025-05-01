/**
 * API Service Test Tool - Browser Console Version
 * 
 * This tool can be directly pasted into a browser console to test API connectivity
 * without requiring imports. It's designed to work independently of the application's
 * module system.
 * 
 * How to use:
 * 1. Copy this entire file
 * 2. Open your browser console on any page of the app
 * 3. Paste the file contents into the console
 * 4. The test will run automatically
 */

(function() {
  // Display a header
  console.log(`
  ┌────────────────────────────────────────┐
  │   💉 Subject Line Pro - API Tester     │
  │   Direct Browser Console Version       │
  └────────────────────────────────────────┘
  `);
  
  // Configuration
  const API_BASE_URL = window.location.hostname === 'localhost' ? 
    'http://localhost:3001/api' : 
    'https://api.subjectlinepro.com/api';
  
  // Admin credentials
  const ADMIN_USERNAME = "mr1018";
  const ADMIN_PASSWORD = "Maya03112005";
  
  // Create a visual test UI
  function createTestUI() {
    // Remove existing UI
    const existingUI = document.getElementById('direct-api-test');
    if (existingUI) existingUI.remove();
    
    // Create container
    const container = document.createElement('div');
    container.id = 'direct-api-test';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      overflow: auto;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 10000;
    `;
    
    // Header
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; font-size: 16px;">Direct API Test Results</h3>
        <button id="close-direct-test" style="background: none; border: none; cursor: pointer; font-size: 20px;">×</button>
      </div>
      <div id="api-test-content"></div>
    `;
    
    document.body.appendChild(container);
    
    // Close button handler
    document.getElementById('close-direct-test').addEventListener('click', () => {
      container.remove();
    });
    
    return document.getElementById('api-test-content');
  }
  
  // Add a result to the UI
  function addResult(title, success, data = null) {
    const content = document.getElementById('api-test-content');
    if (!content) return;
    
    const resultElement = document.createElement('div');
    resultElement.style.cssText = `
      margin-bottom: 12px;
      padding: 10px;
      border-radius: 6px;
      background: ${success ? '#f0fff4' : '#fff5f5'};
      border-left: 4px solid ${success ? '#38a169' : '#e53e3e'};
    `;
    
    resultElement.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 6px;">
        <span style="color: ${success ? 'green' : 'red'}; margin-right: 8px;">
          ${success ? '✅' : '❌'}
        </span>
        <strong>${title}</strong>
      </div>
      ${data ? `<pre style="margin: 0; background: #f8f8f8; padding: 8px; border-radius: 4px; overflow: auto; font-size: 12px;">${
        typeof data === 'object' ? JSON.stringify(data, null, 2) : data
      }</pre>` : ''}
    `;
    
    content.appendChild(resultElement);
  }
  
  // Direct fetch to the API with Basic Auth
  async function testBasicAuth() {
    try {
      console.log('🔑 Testing Basic Auth API access...');
      
      // Create Basic Auth header
      const credentials = btoa(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`);
      
      // Make the request
      const response = await fetch(`${API_BASE_URL}/stats/dashboard?period=day`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Basic Auth API response:', data);
      
      addResult('Basic Auth API Request', true, {
        endpoint: '/stats/dashboard',
        status: response.status,
        success: data.success,
        dataKeys: data.data ? Object.keys(data.data) : []
      });
      
      return data;
    } catch (err) {
      console.error('❌ Basic Auth test failed:', err);
      addResult('Basic Auth API Request', false, {
        error: err.message
      });
      return null;
    }
  }
  
  // Test token auth if available
  async function testTokenAuth() {
    try {
      console.log('🔐 Testing Token Auth API access...');
      
      // Get token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ No auth token found in storage');
        addResult('Token Auth API Request', false, {
          error: 'No auth token found in localStorage or sessionStorage'
        });
        return null;
      }
      
      // Make the request
      const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Token Auth API response:', data);
      
      addResult('Token Auth API Request', true, {
        endpoint: '/stats/dashboard',
        status: response.status,
        success: data.success,
        dataKeys: data.data ? Object.keys(data.data) : []
      });
      
      return data;
    } catch (err) {
      console.error('❌ Token Auth test failed:', err);
      addResult('Token Auth API Request', false, {
        error: err.message
      });
      return null;
    }
  }
  
  // Check window services
  function checkGlobalServices() {
    console.log('🔍 Checking for services in global scope...');
    
    // Check for apiService
    const hasApiService = typeof window.apiService !== 'undefined';
    console.log(`apiService available: ${hasApiService}`);
    addResult('apiService in global scope', hasApiService, 
      hasApiService ? { 
        methods: Object.keys(window.apiService)
      } : null
    );
    
    // Check for dashboardService
    const hasDashboardService = typeof window.dashboardService !== 'undefined';
    console.log(`dashboardService available: ${hasDashboardService}`);
    addResult('dashboardService in global scope', hasDashboardService, 
      hasDashboardService ? { 
        methods: Object.keys(window.dashboardService)
      } : null
    );
    
    return { hasApiService, hasDashboardService };
  }
  
  // Run all tests
  async function runAllTests() {
    console.log('🧪 Starting Direct API Tests...');
    const resultUI = createTestUI();
    
    // Add test environment info
    addResult('Test Environment', true, {
      url: window.location.href,
      apiBaseUrl: API_BASE_URL,
      userAgent: navigator.userAgent
    });
    
    // Check for global services
    const { hasApiService, hasDashboardService } = checkGlobalServices();
    
    // Test Basic Auth API access
    const basicAuthResult = await testBasicAuth();
    
    // Test Token Auth API access
    const tokenAuthResult = await testTokenAuth();
    
    // If we have apiService available, test it directly
    if (hasApiService) {
      try {
        console.log('📡 Testing apiService.getDashboardMetrics directly...');
        const dashboardMetrics = await window.apiService.getDashboardMetrics('day');
        console.log('✅ apiService.getDashboardMetrics result:', dashboardMetrics);
        
        addResult('apiService.getDashboardMetrics', true, {
          success: dashboardMetrics.success,
          hasData: !!dashboardMetrics.data,
          dataKeys: dashboardMetrics.data ? Object.keys(dashboardMetrics.data) : []
        });
      } catch (err) {
        console.error('❌ apiService.getDashboardMetrics failed:', err);
        addResult('apiService.getDashboardMetrics', false, {
          error: err.message
        });
      }
    }
    
    // If we have dashboardService available, test it directly
    if (hasDashboardService) {
      try {
        console.log('📡 Testing dashboardService.getDashboardStats...');
        const dashboardStats = await window.dashboardService.getDashboardStats();
        console.log('✅ dashboardService.getDashboardStats result:', dashboardStats);
        
        addResult('dashboardService.getDashboardStats', true, {
          totalLeads: dashboardStats.totalLeads,
          totalAnalyses: dashboardStats.totalAnalyses,
          hasRecentData: !!dashboardStats.recentLeads && !!dashboardStats.recentAnalyses
        });
      } catch (err) {
        console.error('❌ dashboardService.getDashboardStats failed:', err);
        addResult('dashboardService.getDashboardStats', false, {
          error: err.message
        });
      }
    }
    
    // Final summary
    console.log('✅ All API tests completed');
    addResult('API Tests Completed', true, {
      basicAuthSuccess: !!basicAuthResult,
      tokenAuthSuccess: !!tokenAuthResult,
      apiServiceTested: hasApiService,
      dashboardServiceTested: hasDashboardService
    });
  }
  
  // Start the tests automatically
  runAllTests();
  
  // Add to global scope
  window.runApiTests = runAllTests;
  
  console.log(`
  ✅ API Test initialized and running
  
  You can run tests again by calling:
    runApiTests()
  
  Results will display in a panel and in the console.
  `);
})();