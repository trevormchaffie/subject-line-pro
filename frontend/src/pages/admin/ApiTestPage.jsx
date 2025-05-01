import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import dashboardService from '../../services/dashboardService';

function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({
    api: 'unknown',
    auth: 'unknown',
  });
  const [envInfo, setEnvInfo] = useState(null);

  // Base URL determination
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : 'https://api.subjectlinepro.com/api';

  // Admin credentials
  const ADMIN_USERNAME = "mr1018";
  const ADMIN_PASSWORD = "Maya03112005";

  useEffect(() => {
    // Get environment info on load
    updateEnvironmentInfo();
  }, []);

  // Add a test result
  const addTestResult = (title, success, data = null) => {
    setTestResults(prev => [
      {
        id: Date.now(),
        title,
        success,
        data,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  // Update environment info
  const updateEnvironmentInfo = () => {
    const info = {
      url: window.location.href,
      apiBaseUrl: API_BASE_URL,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      hostname: window.location.hostname,
      services: {
        apiService: !!apiService,
        dashboardService: !!dashboardService
      }
    };
    
    if (apiService) {
      info.services.apiServiceMethods = Object.keys(apiService);
    }
    
    if (dashboardService) {
      info.services.dashboardServiceMethods = Object.keys(dashboardService);
    }
    
    setEnvInfo(info);
    addTestResult('Environment Information Updated', true, info);
  };

  // Test the API with Basic Auth
  const testBasicAuth = async () => {
    setLoading(true);
    try {
      addTestResult('Basic Auth Test Started', true);
      setConnectionStatus(prev => ({ ...prev, api: 'pending', auth: 'pending' }));
      
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
      addTestResult('Basic Auth API Call Successful', true, data);
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        api: 'success', 
        auth: 'success' 
      }));
      
      return data;
    } catch (err) {
      addTestResult('Basic Auth Test Failed', false, {
        error: err.message
      });
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        api: 'error', 
        auth: 'error' 
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Test API with Token Auth
  const testTokenAuth = async () => {
    setLoading(true);
    try {
      addTestResult('Token Auth Test Started', true);
      
      // Get token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        addTestResult('No Auth Token Found', false, {
          details: "No token was found in localStorage or sessionStorage. You need to log in to the application first."
        });
        
        setConnectionStatus(prev => ({ ...prev, auth: 'error' }));
        return null;
      }
      
      addTestResult('Auth Token Found', true, {
        token: `${token.substring(0, 15)}...`,
        source: localStorage.getItem('authToken') ? 'localStorage' : 'sessionStorage'
      });
      
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
      addTestResult('Token Auth API Call Successful', true, data);
      
      setConnectionStatus(prev => ({ ...prev, auth: 'success' }));
      
      return data;
    } catch (err) {
      addTestResult('Token Auth Test Failed', false, {
        error: err.message
      });
      
      setConnectionStatus(prev => ({ ...prev, auth: 'error' }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Test direct api calls
  const testDirect = async () => {
    setLoading(true);
    try {
      addTestResult('Direct apiService Tests Started', true);
      
      try {
        addTestResult('Testing apiService.getDashboardMetrics', true);
        const metrics = await apiService.getDashboardMetrics('day');
        addTestResult('apiService.getDashboardMetrics Successful', true, metrics);
      } catch (err) {
        addTestResult('apiService.getDashboardMetrics Failed', false, {
          error: err.message
        });
      }
      
      // Test apiService.makeAuthenticatedRequest if available
      if (typeof apiService.makeAuthenticatedRequest === 'function') {
        try {
          addTestResult('Testing apiService.makeAuthenticatedRequest', true);
          const result = await apiService.makeAuthenticatedRequest('/stats/dashboard');
          addTestResult('apiService.makeAuthenticatedRequest Successful', true, result);
        } catch (err) {
          addTestResult('apiService.makeAuthenticatedRequest Failed', false, {
            error: err.message
          });
        }
      }
    } catch (err) {
      addTestResult('Direct API Tests Error', false, {
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Test service methods if available
  const testServices = async () => {
    setLoading(true);
    try {
      addTestResult('Dashboard Service Tests Started', true);
      
      try {
        addTestResult('Testing dashboardService.getDashboardStats', true);
        const stats = await dashboardService.getDashboardStats();
        addTestResult('dashboardService.getDashboardStats Successful', true, stats);
      } catch (err) {
        addTestResult('dashboardService.getDashboardStats Failed', false, {
          error: err.message
        });
      }
      
      try {
        addTestResult('Testing dashboardService.getSystemStatus', true);
        const status = await dashboardService.getSystemStatus();
        addTestResult('dashboardService.getSystemStatus Successful', true, status);
      } catch (err) {
        addTestResult('dashboardService.getSystemStatus Failed', false, {
          error: err.message
        });
      }
    } catch (err) {
      addTestResult('Service Tests Error', false, {
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    addTestResult('Starting All Tests', true);
    updateEnvironmentInfo();
    
    await testBasicAuth();
    await testTokenAuth();
    await testDirect();
    await testServices();
    
    addTestResult('All Tests Completed', true);
    setLoading(false);
  };

  // Define the browser console test script
  const generateConsoleScript = () => {
    return `
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
  container.style.cssText = \`
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
  \`;
  
  container.innerHTML = \`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h3 style="margin: 0;">API Test Results</h3>
      <button id="close-test-ui" style="background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
    </div>
    <div id="test-results"></div>
  \`;
  
  document.body.appendChild(container);
  
  document.getElementById('close-test-ui').addEventListener('click', () => {
    container.remove();
  });
  
  const resultsDiv = document.getElementById('test-results');
  
  function addResult(title, success, data) {
    const result = document.createElement('div');
    result.style.cssText = \`
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 4px;
      border-left: 4px solid \${success ? '#38a169' : '#e53e3e'};
      background: \${success ? '#f0fff4' : '#fff5f5'};
    \`;
    
    result.innerHTML = \`
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <span style="color: \${success ? 'green' : 'red'}; margin-right: 8px;">\${success ? '✅' : '❌'}</span>
        <strong>\${title}</strong>
      </div>
      \${data ? \`<pre style="margin: 0; overflow: auto; max-height: 200px; background: #f8f8f8; padding: 8px; border-radius: 4px; font-size: 12px;">\${
        typeof data === 'object' ? JSON.stringify(data, null, 2) : data
      }</pre>\` : ''}
    \`;
    
    resultsDiv.appendChild(result);
  }
  
  async function testBasicAuth() {
    try {
      console.log('Testing Basic Auth...');
      
      const credentials = btoa(\`\${ADMIN_USERNAME}:\${ADMIN_PASSWORD}\`);
      
      const response = await fetch(\`\${API_BASE_URL}/stats/dashboard?period=day\`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Basic \${credentials}\`
        }
      });
      
      if (!response.ok) {
        throw new Error(\`API request failed with status \${response.status}\`);
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
    `;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Test Console</h1>
        <div className="text-sm">
          {new Date().toLocaleString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Connection Status</h2>
              <button 
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm"
                onClick={updateEnvironmentInfo}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
            
            <div className="mb-2 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                connectionStatus.api === 'success' ? 'bg-green-500' : 
                connectionStatus.api === 'error' ? 'bg-red-500' : 
                connectionStatus.api === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
              }`}></div>
              <span>API Status: {
                connectionStatus.api === 'success' ? 'Connected' :
                connectionStatus.api === 'error' ? 'Connection Failed' :
                connectionStatus.api === 'pending' ? 'Connecting...' : 'Unknown'
              }</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                connectionStatus.auth === 'success' ? 'bg-green-500' : 
                connectionStatus.auth === 'error' ? 'bg-red-500' : 
                connectionStatus.auth === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
              }`}></div>
              <span>Auth Status: {
                connectionStatus.auth === 'success' ? 'Authenticated' :
                connectionStatus.auth === 'error' ? 'Authentication Failed' :
                connectionStatus.auth === 'pending' ? 'Authenticating...' : 'Unknown'
              }</span>
            </div>
            
            {envInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold mb-2">Environment Information</h3>
                <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40">
                  <pre>{JSON.stringify(envInfo, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Test Actions</h2>
            
            <div className="space-y-4">
              <button
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                onClick={runAllTests}
                disabled={loading}
              >
                {loading ? 'Running Tests...' : 'Run All Tests'}
              </button>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md disabled:opacity-50"
                  onClick={testBasicAuth}
                  disabled={loading}
                >
                  Basic Auth Test
                </button>
                <button
                  className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md disabled:opacity-50"
                  onClick={testTokenAuth}
                  disabled={loading}
                >
                  Token Auth Test
                </button>
                <button
                  className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md disabled:opacity-50"
                  onClick={testDirect}
                  disabled={loading}
                >
                  Direct API Test
                </button>
                <button
                  className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md disabled:opacity-50"
                  onClick={testServices}
                  disabled={loading}
                >
                  Service Test
                </button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Browser Console Test</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Copy this script to run a quick test in any browser console:
                </p>
                <div className="bg-gray-800 p-3 rounded text-xs text-white overflow-auto max-h-40 relative">
                  <button 
                    className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                    onClick={() => {
                      navigator.clipboard.writeText(generateConsoleScript());
                      alert('Test script copied to clipboard!');
                    }}
                  >
                    Copy
                  </button>
                  <pre>{generateConsoleScript()}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Test Results</h2>
              <button
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm"
                onClick={() => setTestResults([])}
                disabled={loading || testResults.length === 0}
              >
                Clear Results
              </button>
            </div>
            
            <div className="h-[600px] overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No test results yet. Run some tests to see results here.
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map(result => (
                    <div 
                      key={result.id}
                      className={`p-3 rounded-md border-l-4 ${
                        result.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className={`mr-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.success ? '✓' : '✗'}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{result.title}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {result.data && (
                            <div 
                              className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60"
                              style={{ fontFamily: 'monospace' }}
                            >
                              <pre>{JSON.stringify(result.data, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiTestPage;