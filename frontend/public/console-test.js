// Subject Line Pro - API Test Script
(function() {
  const API_BASE_URL = window.location.hostname === 'localhost' ? 
    'http://localhost:3000/api' : 
    'https://api.subjectlinepro.com/api';
  
  const ADMIN_USERNAME = "mr1018";
  const ADMIN_PASSWORD = "Maya03112005";
  
  console.log('📊 Testing API connections...');
  
  // Create results UI
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    width: 400px;
    max-height: 80vh;
    overflow: auto;
    font-family: system-ui, sans-serif;
  `;
  
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h3 style="margin: 0;">API Test Results</h3>
      <button id="close-test-ui" style="background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
    </div>
    <div id="test-results"></div>
  `;
  
  document.body.appendChild(container);
  
  document.getElementById('close-test-ui').addEventListener('click', () => {
    container.remove();
  });
  
  const resultsDiv = document.getElementById('test-results');
  
  function addResult(title, success, data) {
    const result = document.createElement('div');
    result.style.cssText = `
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 4px;
      border-left: 4px solid ${success ? '#38a169' : '#e53e3e'};
      background: ${success ? '#f0fff4' : '#fff5f5'};
    `;
    
    result.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <span style="color: ${success ? 'green' : 'red'}; margin-right: 8px;">${success ? '✅' : '❌'}</span>
        <strong>${title}</strong>
      </div>
      ${data ? `<pre style="margin: 0; overflow: auto; max-height: 200px; background: #f8f8f8; padding: 8px; border-radius: 4px; font-size: 12px;">${
        typeof data === 'object' ? JSON.stringify(data, null, 2) : data
      }</pre>` : ''}
    `;
    
    resultsDiv.appendChild(result);
  }
  
  async function testBasicAuth() {
    try {
      console.log('Testing Basic Auth...');
      
      const credentials = btoa(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`);
      
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
      console.log('Basic Auth API call successful:', data);
      
      addResult('Basic Auth API Call', true, data);
      return data;
    } catch (err) {
      console.error('Basic Auth test failed:', err);
      addResult('Basic Auth API Call', false, { error: err.message });
      return null;
    }
  }
  
  async function testApiService() {
    try {
      if (typeof window.apiService === 'undefined') {
        console.warn('apiService not available');
        addResult('apiService Check', false, { error: 'apiService not available in window scope' });
        return;
      }
      
      console.log('Testing apiService.getDashboardMetrics...');
      const result = await window.apiService.getDashboardMetrics('day');
      console.log('apiService.getDashboardMetrics result:', result);
      
      addResult('apiService.getDashboardMetrics', true, result);
    } catch (err) {
      console.error('apiService test failed:', err);
      addResult('apiService.getDashboardMetrics', false, { error: err.message });
    }
  }
  
  async function testDashboardService() {
    try {
      if (typeof window.dashboardService === 'undefined') {
        console.warn('dashboardService not available');
        addResult('dashboardService Check', false, { error: 'dashboardService not available in window scope' });
        return;
      }
      
      console.log('Testing dashboardService.getDashboardStats...');
      const result = await window.dashboardService.getDashboardStats();
      console.log('dashboardService.getDashboardStats result:', result);
      
      addResult('dashboardService.getDashboardStats', true, result);
    } catch (err) {
      console.error('dashboardService test failed:', err);
      addResult('dashboardService.getDashboardStats', false, { error: err.message });
    }
  }
  
  // Check window scope
  addResult('Environment Check', true, {
    url: window.location.href,
    apiServiceAvailable: typeof window.apiService !== 'undefined',
    dashboardServiceAvailable: typeof window.dashboardService !== 'undefined',
    apiBaseUrl: API_BASE_URL
  });
  
  // Run tests
  async function runTests() {
    await testBasicAuth();
    await testApiService();
    await testDashboardService();
    console.log('All tests completed');
  }
  
  runTests();
})();