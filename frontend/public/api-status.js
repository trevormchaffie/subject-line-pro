/**
 * API Status Checker for Subject Line Pro
 * 
 * This script can be pasted into your browser console to check API status.
 * It will make direct fetch calls to the API using Basic Auth.
 * No need for module imports - works directly in the browser console.
 */

(function() {
  // Create status UI
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
    min-width: 300px;
    max-width: 500px;
    font-family: system-ui, sans-serif;
  `;
  
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; font-size: 16px;">API Status</h3>
      <button id="close-api-status" style="background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
    </div>
    <div id="status-content"></div>
  `;
  
  document.body.appendChild(container);
  document.getElementById('close-api-status').addEventListener('click', () => container.remove());
  
  const statusContent = document.getElementById('status-content');
  
  // Add a status item
  function addStatus(name, status, message, details = null) {
    const item = document.createElement('div');
    item.style.cssText = `
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 4px;
      border-left: 4px solid ${status === 'success' ? '#38a169' : status === 'pending' ? '#f6ad55' : '#e53e3e'};
      background: ${status === 'success' ? '#f0fff4' : status === 'pending' ? '#fffaf0' : '#fff5f5'};
    `;
    
    item.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; background-color: ${
          status === 'success' ? '#38a169' : status === 'pending' ? '#f6ad55' : '#e53e3e'
        }"></div>
        <div>
          <div style="font-weight: 600;">${name}</div>
          <div style="font-size: 12px;">${message}</div>
        </div>
      </div>
      ${details ? `
        <div style="margin-top: 8px;">
          <button class="toggle-details" style="font-size: 12px; border: none; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; cursor: pointer;">
            Show Details
          </button>
          <pre class="details" style="display: none; margin-top: 5px; font-size: 12px; background: #f8f9fa; padding: 8px; border-radius: 4px; overflow: auto; max-height: 300px;">
${typeof details === 'object' ? JSON.stringify(details, null, 2) : details}
          </pre>
        </div>
      ` : ''}
    `;
    
    statusContent.appendChild(item);
    
    // Add toggle functionality for details
    const toggleButton = item.querySelector('.toggle-details');
    if (toggleButton) {
      toggleButton.addEventListener('click', function() {
        const details = item.querySelector('.details');
        if (details.style.display === 'none') {
          details.style.display = 'block';
          this.textContent = 'Hide Details';
        } else {
          details.style.display = 'none';
          this.textContent = 'Show Details';
        }
      });
    }
    
    return item;
  }
  
  // Configuration
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://api.subjectlinepro.com/api';
  
  // Check basic API connectivity
  async function checkBasicConnectivity() {
    try {
      const item = addStatus('API Connectivity', 'pending', 'Checking basic API connectivity...');
      
      const response = await fetch(`${API_BASE_URL}/stats`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      item.remove();
      addStatus('API Connectivity', 'success', 'API is reachable and responding', data);
      return true;
    } catch (err) {
      addStatus('API Connectivity', 'error', `Failed to connect to API: ${err.message}`);
      return false;
    }
  }
  
  // Check Basic Auth
  async function checkBasicAuth() {
    try {
      const item = addStatus('Basic Auth', 'pending', 'Testing Basic Auth...');
      
      // Basic auth credentials
      const credentials = btoa("mr1018:Maya03112005");
      
      const response = await fetch(`${API_BASE_URL}/stats/dashboard?period=day`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Basic Auth request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      item.remove();
      addStatus('Basic Auth', 'success', 'Basic Auth is working correctly', data);
      return true;
    } catch (err) {
      addStatus('Basic Auth', 'error', `Basic Auth failed: ${err.message}`);
      return false;
    }
  }
  
  // Check Token Auth
  async function checkTokenAuth() {
    try {
      const item = addStatus('Token Auth', 'pending', 'Testing Token Auth...');
      
      // Get token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        item.remove();
        addStatus('Token Auth', 'error', 'No auth token found in storage');
        return false;
      }
      
      const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Token Auth request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      item.remove();
      addStatus('Token Auth', 'success', 'Token Auth is working correctly', data);
      return true;
    } catch (err) {
      addStatus('Token Auth', 'error', `Token Auth failed: ${err.message}`);
      return false;
    }
  }
  
  // Check global services
  function checkGlobalServices() {
    const item = addStatus('Service Objects', 'pending', 'Checking for apiService and dashboardService...');
    
    const hasApiService = typeof window.apiService !== 'undefined';
    const hasDashboardService = typeof window.dashboardService !== 'undefined';
    
    const details = {
      apiServiceAvailable: hasApiService,
      dashboardServiceAvailable: hasDashboardService
    };
    
    if (hasApiService) {
      details.apiServiceMethods = Object.keys(window.apiService);
    }
    
    if (hasDashboardService) {
      details.dashboardServiceMethods = Object.keys(window.dashboardService);
    }
    
    item.remove();
    
    if (hasApiService || hasDashboardService) {
      addStatus('Service Objects', 'success', 'Found service objects in global scope', details);
      return true;
    } else {
      addStatus('Service Objects', 'error', 'No service objects found in global scope');
      return false;
    }
  }
  
  // Check environment
  function checkEnvironment() {
    const env = {
      url: window.location.href,
      apiBaseUrl: API_BASE_URL,
      hostname: window.location.hostname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    addStatus('Environment', 'success', 'Environment information', env);
  }
  
  // Run all checks
  async function runAllChecks() {
    checkEnvironment();
    
    const apiConnected = await checkBasicConnectivity();
    if (!apiConnected) {
      addStatus('Status', 'error', 'Cannot connect to API. Check server status and network connection.');
      return;
    }
    
    await checkBasicAuth();
    await checkTokenAuth();
    checkGlobalServices();
    
    addStatus('Status', 'success', 'API checks completed');
  }
  
  // Run checks
  runAllChecks();
  
  // Add to window
  window.apiStatusChecker = {
    checkBasicConnectivity,
    checkBasicAuth,
    checkTokenAuth,
    checkGlobalServices,
    runAllChecks
  };
  
  console.log('API Status Checker loaded. You can run checks again with window.apiStatusChecker.runAllChecks()');
})();