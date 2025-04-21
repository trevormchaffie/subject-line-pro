/**
 * Dashboard Debug Tool for Subject Line Pro
 * 
 * Paste this script in your browser console to debug dashboard data issues.
 * It directly calls the API and shows what's being returned to the frontend.
 */

(function() {
  console.log('🔍 Dashboard Debug Tool Starting...');
  
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
    width: 500px;
    max-height: 90vh;
    overflow: auto;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h3 style="margin: 0; font-size: 16px;">Dashboard Debug Tool</h3>
      <button id="close-debug-tool" style="background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
    </div>
    <div id="debug-content"></div>
    <div style="display: flex; gap: 8px; margin-top: 15px;">
      <button id="refresh-data" style="flex: 1; background: #3182ce; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
        Refresh Data
      </button>
      <button id="copy-data" style="flex: 1; background: #718096; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
        Copy Data
      </button>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Setup event handlers
  document.getElementById('close-debug-tool').addEventListener('click', () => container.remove());
  document.getElementById('refresh-data').addEventListener('click', fetchDashboardData);
  
  const debugContent = document.getElementById('debug-content');
  let lastResponseData = null;
  
  document.getElementById('copy-data').addEventListener('click', () => {
    if (lastResponseData) {
      const jsonString = JSON.stringify(lastResponseData, null, 2);
      navigator.clipboard.writeText(jsonString);
      alert('Dashboard data copied to clipboard!');
    } else {
      alert('No data available to copy');
    }
  });
  
  // Add a section to content
  function addSection(title, content, isSuccess = true, details = null) {
    const section = document.createElement('div');
    section.style.cssText = `
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 6px;
      background: ${isSuccess ? '#f0fff4' : '#fff5f5'};
      border-left: 4px solid ${isSuccess ? '#38a169' : '#e53e3e'};
    `;
    
    let sectionHtml = `
      <div style="margin-bottom: 8px; display: flex; align-items: center;">
        <span style="color: ${isSuccess ? '#38a169' : '#e53e3e'}; margin-right: 8px;">
          ${isSuccess ? '✓' : '✗'}
        </span>
        <strong>${title}</strong>
      </div>
      <div style="font-size: 14px;">${content}</div>
    `;
    
    if (details) {
      sectionHtml += `
        <div style="margin-top: 8px;">
          <button class="toggle-details" style="font-size: 12px; background: none; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 4px; cursor: pointer;">
            Show Details
          </button>
          <pre class="details" style="display: none; margin-top: 8px; font-size: 12px; background: #f8f9fa; padding: 8px; border-radius: 4px; overflow: auto; max-height: 300px;">
${typeof details === 'object' ? JSON.stringify(details, null, 2) : details}
          </pre>
        </div>
      `;
    }
    
    section.innerHTML = sectionHtml;
    debugContent.appendChild(section);
    
    // Add toggle functionality if details present
    const toggleButton = section.querySelector('.toggle-details');
    if (toggleButton) {
      toggleButton.addEventListener('click', function() {
        const details = section.querySelector('.details');
        if (details.style.display === 'none') {
          details.style.display = 'block';
          this.textContent = 'Hide Details';
        } else {
          details.style.display = 'none';
          this.textContent = 'Show Details';
        }
      });
    }
    
    return section;
  }
  
  // Fetch dashboard data directly with Basic Auth
  async function fetchDashboardData() {
    debugContent.innerHTML = '';
    addSection('Dashboard Debug', 'Fetching dashboard data...', true);
    
    try {
      // Basic auth credentials - hardcoded for testing
      const credentials = btoa("mr1018:Maya03112005");
      
      // Test periods
      const periods = ['day', 'week', 'month', 'all'];
      
      // Results container
      const results = {};
      
      // Fetch data for each period
      for (const period of periods) {
        try {
          const response = await fetch(`/api/stats/dashboard?period=${period}`, {
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
          results[period] = data;
          
          // Only show the first period's detailed structure
          if (period === 'day') {
            lastResponseData = data;
            validateResponseStructure(data);
          }
          
          addSection(`Period: ${period}`, 'Fetched successfully', true, {
            success: data.success,
            hasData: !!data.data,
            dataKeys: data.data ? Object.keys(data.data) : [],
            dashboardStats: data.data && data.data.dashboardStats ? 'Present' : 'Missing',
            timeSeriesData: data.data && data.data.timeSeriesData ? 'Present' : 'Missing'
          });
        } catch (err) {
          addSection(`Period: ${period}`, `Error: ${err.message}`, false);
        }
      }
      
      addSection('All Periods Data', 'Combined results from all periods', true, results);
      
    } catch (err) {
      addSection('Error', `Failed to fetch dashboard data: ${err.message}`, false);
    }
  }
  
  // Validate the API response structure
  function validateResponseStructure(response) {
    const issues = [];
    
    // Check basic structure
    if (!response) {
      issues.push('Response is empty or null');
      addSection('Response Structure', 'Invalid - Empty response', false);
      return;
    }
    
    if (!response.success) {
      issues.push('Response success flag is false');
    }
    
    if (!response.data) {
      issues.push('Response is missing data property');
      addSection('Response Structure', 'Invalid - Missing data property', false, {
        issues,
        response
      });
      return;
    }
    
    // Check for dashboardStats
    if (!response.data.dashboardStats) {
      issues.push('Response is missing dashboardStats property');
    } else {
      // Check dashboardStats structure
      const stats = response.data.dashboardStats;
      
      // Check required numeric properties
      ['totalLeads', 'totalAnalyses', 'conversionRate', 'avgScore'].forEach(prop => {
        if (typeof stats[prop] !== 'number') {
          issues.push(`dashboardStats.${prop} is not a number`);
        }
      });
      
      // Check arrays
      ['recentLeads', 'recentAnalyses'].forEach(prop => {
        if (!Array.isArray(stats[prop])) {
          issues.push(`dashboardStats.${prop} is not an array`);
        }
      });
    }
    
    // Check for advanced metrics data
    if (!response.data.timeSeriesData) {
      issues.push('Response is missing timeSeriesData property');
    }
    
    // Don't check for conversionRate at the root level since it's inside data object
    // and also available in dashboardStats
    // This was causing a validation warning but it's not a real issue
    
    // Show validation results
    if (issues.length === 0) {
      addSection('Response Structure', 'Valid - All required properties present', true, {
        dashboardStats: response.data.dashboardStats ? Object.keys(response.data.dashboardStats) : 'Missing',
        advancedMetrics: {
          timeSeriesData: response.data.timeSeriesData ? 'Present' : 'Missing',
          conversionRate: response.data.conversionRate || 'Missing'
        }
      });
    } else {
      addSection('Response Structure', `Invalid - ${issues.length} issues found`, false, {
        issues,
        dashboardStats: response.data.dashboardStats ? Object.keys(response.data.dashboardStats) : 'Missing',
        response
      });
    }
  }
  
  // Initial data fetch
  fetchDashboardData();
  
  // Add global reference
  window.dashboardDebug = {
    fetchDashboardData,
    validateResponseStructure,
    container
  };
  
  console.log('🔍 Dashboard Debug Tool loaded. You can refresh data with window.dashboardDebug.fetchDashboardData()');
})();