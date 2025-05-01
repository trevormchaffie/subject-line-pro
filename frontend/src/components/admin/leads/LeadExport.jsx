// src/components/admin/leads/LeadExport.jsx
import { useState } from "react";
import leadService from "../../../services/leadService";

const LeadExport = ({ filters }) => {
  const [format, setFormat] = useState("csv");

  // Handle format change
  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  // Instead of using <a> with href, we'll use a function to handle the download
  // This allows us to make a fetch request with proper authentication headers
  const handleExport = async () => {
    try {
      const url = leadService.getExportUrl(format, filters);
      const credentials = btoa('mr1018:Maya03112005');
      
      // Make the request with Basic Auth header
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }
      
      // Get the response data
      const data = format === 'json' ? 
        await response.json() : 
        await response.text();
      
      // Create a Blob from the response data
      const blob = format === 'json' ?
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }) :
        new Blob([data], { type: 'text/csv' });
      
      // Create a URL for the Blob
      const downloadUrl = URL.createObjectURL(blob);
      
      // Create a temporary link and click it to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `leads.${format}`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Export Leads</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Export Format
        </label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="csv"
              checked={format === "csv"}
              onChange={handleFormatChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">CSV</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="json"
              checked={format === "json"}
              onChange={handleFormatChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">JSON</span>
          </label>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Export {format.toUpperCase()}
        </button>
      </div>
    </div>
  );
};

export default LeadExport;
