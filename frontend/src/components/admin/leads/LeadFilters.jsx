// src/components/admin/leads/LeadFilters.jsx
import { useState } from "react";

const LeadFilters = ({ onFilterChange, filters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Business type options
  const businessTypes = [
    { value: "", label: "All Business Types" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "service", label: "Service-based" },
    { value: "saas", label: "SaaS / Software" },
    { value: "agency", label: "Agency / Consulting" },
    { value: "other", label: "Other" },
  ];

  // Lead status options
  const statuses = [
    { value: "", label: "All Statuses" },
    { value: "New", label: "New" },
    { value: "Contacted", label: "Contacted" },
    { value: "Qualified", label: "Qualified" },
    { value: "Converted", label: "Converted" },
    { value: "Not Interested", label: "Not Interested" },
    { value: "Unsubscribed", label: "Unsubscribed" },
  ];

  // Handle filter input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  // Clear all filters
  const handleClear = () => {
    const clearedFilters = {
      status: "",
      businessType: "",
      startDate: "",
      endDate: "",
      search: "",
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="font-medium text-gray-700 mb-2">Filter Leads</h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search input */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={localFilters.search}
              onChange={handleInputChange}
              placeholder="Search name or email"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          {/* Status dropdown */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={localFilters.status}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Business Type dropdown */}
          <div>
            <label
              htmlFor="businessType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Business Type
            </label>
            <select
              id="businessType"
              name="businessType"
              value={localFilters.businessType}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={localFilters.startDate}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                To
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={localFilters.endDate}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Filter actions */}
        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadFilters;
