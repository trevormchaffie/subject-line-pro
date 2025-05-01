import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import services if available
let apiService, dashboardService;
try {
  apiService = require('./services/apiService').default;
  console.log('Successfully imported apiService');
} catch (err) {
  console.error('Failed to import apiService:', err);
}

try {
  dashboardService = require('./services/dashboardService').default;
  console.log('Successfully imported dashboardService');
} catch (err) {
  console.error('Failed to import dashboardService:', err);
}

// Test UI Component
function ApiTestApp() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({
    api: 'unknown',
    auth: 'unknown',
  });
  const [envInfo, setEnvInfo] = useState(null);

  // Base URL determination
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
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

  // Test service methods if available
  const testServices = async () => {
    setLoading(true);
    try {
      addTestResult('Service Tests Started', true);
      
      if (!apiService) {
        addTestResult('apiService Not Available', false);
      } else {
        // Test apiService.getDashboardMetrics
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
      }
      
      if (!dashboardService) {
        addTestResult('dashboardService Not Available', false);
      } else {
        // Test dashboardService.getDashboardStats
        try {
          addTestResult('Testing dashboardService.getDashboardStats', true);
          const stats = await dashboardService.getDashboardStats();
          addTestResult('dashboardService.getDashboardStats Successful', true, stats);
        } catch (err) {
          addTestResult('dashboardService.getDashboardStats Failed', false, {
            error: err.message
          });
        }
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
    await testServices();
    
    addTestResult('All Tests Completed', true);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-slate-800 text-white py-4 px-6 mb-6 rounded-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Subject Line Pro - API Tester</h1>
          <div className="text-sm">
            {new Date().toLocaleString()}
          </div>
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
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md disabled:opacity-50"
                  onClick={testBasicAuth}
                  disabled={loading}
                >
                  Basic Auth
                </button>
                <button
                  className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md disabled:opacity-50"
                  onClick={testTokenAuth}
                  disabled={loading}
                >
                  Token Auth
                </button>
                <button
                  className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md disabled:opacity-50"
                  onClick={testServices}
                  disabled={loading}
                >
                  Test Services
                </button>
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApiTestApp />
  </React.StrictMode>,
);