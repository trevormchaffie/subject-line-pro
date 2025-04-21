/**
 * Quick Dashboard API Test
 * 
 * This is a standalone script to test the dashboard API directly.
 * Paste this in the browser console to check if the API is working.
 */

(function() {
  console.log('🔍 Starting direct dashboard API test...');
  
  // Create UI container
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
    max-height: 90vh;
    overflow: auto;
    font-family: system-ui, sans-serif;
  `;
  
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h3 style="margin: 0;">Dashboard API Test</h3>
      <button id="close-api-test" style="background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
    </div>
    <div id="test-results"></div>
  `;
  
  document.body.appendChild(container);
  
  document.getElementById('close-api-test').addEventListener('click', () => container.remove());
  
  const resultsDiv = document.getElementById('test-results');
  
  // Add result to UI
  function addResult(title, content, success = true) {
    const result = document.createElement('div');
    result.style.cssText = `
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 4px;
      background-color: ${success ? '#f0fff4' : '#fff5f5'};
      border-left: 4px solid ${success ? '#38a169' : '#e53e3e'};
    `;
    
    result.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <span style="color: ${success ? '#38a169' : '#e53e3e'}; margin-right: 8px; font-size: 16px;">
          ${success ? '✓' : '✗'}
        </span>
        <strong>${title}</strong>
      </div>
      <div style="margin-left: 24px; font-size: 14px;">
        ${content}
      </div>
    `;
    
    resultsDiv.appendChild(result);
  }
  
  // Run direct API test with BASIC AUTH
  async function testDashboardAPI() {
    addResult('Starting API Test', 'Fetching dashboard data directly with Basic Auth...');
    
    try {
      // Use hardcoded credentials - ONLY FOR TESTING!
      const credentials = btoa('mr1018:Maya03112005');
      
      // Test API connection with basic auth
      const response = await fetch('/api/stats/dashboard?period=day', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Direct API test successful:', data);
      
      // Show success
      addResult('API Connection', 'Successfully connected to the dashboard API', true);
      
      // Check response structure
      if (data.success && data.data) {
        addResult('Response Format', 'Response has the expected structure with success and data properties', true);
        
        // Check dashboard stats
        if (data.data.dashboardStats) {
          addResult('Dashboard Stats', 'Response includes dashboardStats object', true);
          
          const stats = data.data.dashboardStats;
          addResult('Stats Content', `
            <ul>
              <li>Total Leads: ${stats.totalLeads}</li>
              <li>Total Analyses: ${stats.totalAnalyses}</li>
              <li>Conversion Rate: ${stats.conversionRate}%</li>
              <li>Average Score: ${stats.avgScore}</li>
              <li>Recent Activities: ${
                (stats.recentLeads?.length || 0) + 
                (stats.recentAnalyses?.length || 0)
              } items</li>
            </ul>
          `);
        } else {
          addResult('Dashboard Stats', 'Response missing dashboardStats object', false);
        }
        
        // Check time series data
        if (data.data.timeSeriesData) {
          addResult('Time Series Data', 'Response includes timeSeriesData object', true);
        } else {
          addResult('Time Series Data', 'Response missing timeSeriesData object', false);
        }
      } else {
        addResult('Response Format', 'Response has an unexpected structure', false);
      }
      
      return data;
    } catch (err) {
      console.error('❌ API test failed:', err);
      addResult('API Test Error', `Failed to connect: ${err.message}`, false);
      
      // Add troubleshooting suggestions
      addResult('Troubleshooting', `
        <p>Please check:</p>
        <ul>
          <li>Backend server is running at ${window.location.protocol}//${window.location.hostname}:3000</li>
          <li>CORS is properly configured</li>
          <li>Basic Auth credentials are correct</li>
          <li>API endpoint exists and is accessible</li>
        </ul>
      `, false);
      
      return null;
    }
  }
  
  // Run the test
  testDashboardAPI();
  
  // Add to window for re-running
  window.testDashboardAPI = testDashboardAPI;
  
  console.log('Dashboard API test initialized. You can run it again with window.testDashboardAPI()');
})();