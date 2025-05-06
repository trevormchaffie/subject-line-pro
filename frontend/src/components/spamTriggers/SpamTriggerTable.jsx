// src/components/SpamTriggerTable.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";

const SpamTriggerTable = ({
  triggers,
  onEdit,
  onDelete,
  onToggleActive,
  onBulkAction,
}) => {
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "pattern",
    direction: "asc",
  });
  const [filterText, setFilterText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Handle sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sorted and filtered triggers
  const getSortedAndFilteredTriggers = () => {
    // First filter the triggers
    let filteredTriggers = [...triggers];

    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      filteredTriggers = filteredTriggers.filter(
        (trigger) =>
          trigger.pattern.toLowerCase().includes(lowerFilter) ||
          trigger.description.toLowerCase().includes(lowerFilter)
      );
    }

    if (categoryFilter) {
      filteredTriggers = filteredTriggers.filter(
        (trigger) => trigger.category === categoryFilter
      );
    }

    // Then sort them
    return filteredTriggers.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Handle select all checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const sortedAndFilteredTriggers = getSortedAndFilteredTriggers();
      setSelectedTriggers(
        sortedAndFilteredTriggers.map((trigger) => trigger.id)
      );
    } else {
      setSelectedTriggers([]);
    }
  };

  // Handle individual checkbox selection
  const handleSelectTrigger = (id) => {
    setSelectedTriggers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((triggerId) => triggerId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedTriggers.length === 0) return;
    onBulkAction(action, selectedTriggers);
    setSelectedTriggers([]);
  };

  // Get unique categories for filter
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(
      triggers.map((trigger) => trigger.category)
    );
    return Array.from(uniqueCategories).filter(Boolean);
  }, [triggers]);

  const sortedAndFilteredTriggers = getSortedAndFilteredTriggers();

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
        <div className="sm:w-1/3">
          <input
            type="text"
            placeholder="Search by pattern or description..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex space-x-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Bulk actions */}
          {selectedTriggers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {selectedTriggers.length} selected
              </span>
              <button
                onClick={() => handleBulkAction("activate")}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction("deactivate")}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedTriggers.length > 0 &&
                    selectedTriggers.length === sortedAndFilteredTriggers.length
                  }
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("pattern")}
              >
                Pattern {getSortIcon("pattern")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("category")}
              >
                Category {getSortIcon("category")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("impact")}
              >
                Impact {getSortIcon("impact")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("active")}
              >
                Status {getSortIcon("active")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredTriggers.length > 0 ? (
              sortedAndFilteredTriggers.map((trigger) => (
                <tr key={trigger.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTriggers.includes(trigger.id)}
                      onChange={() => handleSelectTrigger(trigger.id)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {trigger.pattern}
                    </div>
                    {trigger.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {trigger.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {trigger.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getImpactColorClass(
                            trigger.impact
                          )}`}
                          style={{ width: `${trigger.impact}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-700">
                        {trigger.impact}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        onToggleActive(trigger.id, !trigger.active)
                      }
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trigger.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {trigger.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(trigger)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(trigger.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No spam triggers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function for impact color
const getImpactColorClass = (impact) => {
  if (impact >= 80) return "bg-red-600";
  if (impact >= 50) return "bg-yellow-500";
  return "bg-green-500";
};

SpamTriggerTable.propTypes = {
  triggers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      pattern: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      impact: PropTypes.number.isRequired,
      description: PropTypes.string,
      active: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired,
  onBulkAction: PropTypes.func.isRequired,
};

export default SpamTriggerTable;
