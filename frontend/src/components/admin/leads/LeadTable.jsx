// src/components/admin/leads/LeadTable.jsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import leadService from "../../../services/leadService";
import LeadStatusBadge from "./LeadStatusBadge";
import LeadDetailModal from "./LeadDetailModal";
import LeadFilters from "./LeadFilters";

const LeadTable = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Sorting state
  const [sorting, setSorting] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Filtering state
  const [filters, setFilters] = useState({
    status: "",
    businessType: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  // Fetch leads with current filters, pagination, and sorting
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        ...filters,
      };

      const { data, meta } = await leadService.getLeads(params);

      setLeads(data);
      setPagination((prev) => ({
        ...prev,
        total: meta.total,
        totalPages: meta.totalPages,
      }));

      setError(null);
    } catch (err) {
      setError("Failed to load leads. Please try again.");
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads when dependencies change
  useEffect(() => {
    fetchLeads();
  }, [pagination.page, pagination.limit, sorting.sortBy, sorting.sortOrder, filters]);

  // Handle sorting
  const handleSort = (column) => {
    setSorting((prev) => ({
      sortBy: column,
      sortOrder:
        prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    fetchLeads();
  };

  // Open lead detail modal
  const openLeadDetail = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  // Close lead detail modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  // Handle lead update (from modal)
  const handleLeadUpdate = async (updatedLead) => {
    try {
      console.log("Updating lead status to:", updatedLead.status);
      console.log("Lead ID being updated:", updatedLead.id);
      
      // Send update to server
      const result = await leadService.updateLead(updatedLead.id, {
        status: updatedLead.status,
      });
      
      console.log("Update result:", result);

      // Update lead in the table immediately for better UX
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === updatedLead.id ? { ...lead, status: updatedLead.status } : lead
        )
      );
      
      try {
        // Try to get the refreshed lead data, but don't fail if this doesn't work
        const refreshedLead = await leadService.getLeadById(updatedLead.id);
        console.log("Refreshed lead data:", refreshedLead);
        
        // Update the selected lead with latest data
        if (selectedLead && selectedLead.id === updatedLead.id) {
          setSelectedLead(refreshedLead);
        }
      } catch (refreshError) {
        console.warn("Could not refresh lead data, but update may have succeeded:", refreshError);
        // Still update selected lead with the status change
        if (selectedLead && selectedLead.id === updatedLead.id) {
          setSelectedLead({...selectedLead, status: updatedLead.status});
        }
      }
      
      // Don't fetch all leads as it may disrupt the user experience
      // Instead, rely on our local state update
      
      return updatedLead;
    } catch (err) {
      console.error("Error updating lead:", err);
      console.error("Error details:", err.message, err.stack);
      alert("Failed to update lead status. Please try again.");
      return null;
    }
  };

  // Toggle selection of all leads
  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };
  
  // Toggle selection of a single lead
  const toggleSelectLead = (leadId, event) => {
    // Stop propagation to prevent opening the lead detail modal
    event.stopPropagation();
    
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };
  
  // Delete selected leads
  const deleteSelectedLeads = async () => {
    if (selectedLeads.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} lead(s)?`)) {
      setIsDeleting(true);
      try {
        await leadService.deleteMultipleLeads(selectedLeads);
        setLeads(leads.filter(lead => !selectedLeads.includes(lead.id)));
        setSelectedLeads([]);
      } catch (error) {
        console.error("Error deleting leads:", error);
        alert("Failed to delete leads. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  // Delete a single lead
  const deleteLead = async (leadId, event) => {
    event.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await leadService.deleteLead(leadId);
        setLeads(leads.filter(lead => lead.id !== leadId));
      } catch (error) {
        console.error("Error deleting lead:", error);
        alert("Failed to delete lead. Please try again.");
      }
    }
  };

  // Render table header with sorting
  const renderTableHeader = () => {
    const headers = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "businessType", label: "Business Type" },
      { key: "subjectLine", label: "Subject Line" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Date Added" },
    ];

    return (
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={leads.length > 0 && selectedLeads.length === leads.length}
                onChange={toggleSelectAll}
              />
            </div>
          </th>
          {headers.map((header) => (
            <th
              key={header.key}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort(header.key)}
            >
              <div className="flex items-center">
                <span>{header.label}</span>
                {sorting.sortBy === header.key && (
                  <span className="ml-1">
                    {sorting.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
          ))}
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
    );
  };

  // Render table rows
  const renderTableRows = () => {
    if (leads.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
            No leads found
          </td>
        </tr>
      );
    }

    return leads.map((lead) => (
      <tr
        key={lead.id}
        className={`hover:bg-gray-50 cursor-pointer ${selectedLeads.includes(lead.id) ? 'bg-blue-50' : ''}`}
        onClick={() => openLeadDetail(lead)}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={selectedLeads.includes(lead.id)}
              onChange={(e) => toggleSelectLead(lead.id, e)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{lead.email}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">
            {lead.businessType.charAt(0).toUpperCase() +
              lead.businessType.slice(1)}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {lead.subjectLine}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <LeadStatusBadge status={lead.status || "New"} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">
            {format(new Date(lead.createdAt), "MMM d, yyyy")}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end space-x-3">
            <button
              className="text-blue-600 hover:text-blue-900"
              onClick={(e) => {
                e.stopPropagation();
                openLeadDetail(lead);
              }}
            >
              View
            </button>
            <button
              className="text-red-600 hover:text-red-900"
              onClick={(e) => deleteLead(lead.id, e)}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  // Render pagination controls
  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(prev.page - 1, 1),
              }))
            }
            disabled={pagination.page === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              pagination.page === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.page + 1, prev.totalPages),
              }))
            }
            disabled={pagination.page === pagination.totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              pagination.page === pagination.totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {leads.length > 0
                  ? (pagination.page - 1) * pagination.limit + 1
                  : 0}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(prev.page - 1, 1),
                  }))
                }
                disabled={pagination.page === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  pagination.page === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                } focus:z-20 focus:outline-offset-0`}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Page numbers */}
              {[...Array(pagination.totalPages).keys()].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: pageNumber }))
                    }
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      pagination.page === pageNumber
                        ? "z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.page + 1, prev.totalPages),
                  }))
                }
                disabled={pagination.page === pagination.totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  pagination.page === pagination.totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                } focus:z-20 focus:outline-offset-0`}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <LeadFilters onFilterChange={handleFilterChange} filters={filters} />
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedLeads.length > 0 && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg shadow-sm border border-blue-200 flex items-center justify-between">
          <div className="text-sm text-blue-700">
            <span className="font-medium">{selectedLeads.length}</span> leads selected
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => deleteSelectedLeads()}
              disabled={isDeleting}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isDeleting ? 'bg-gray-300' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>Delete Selected</>
              )}
            </button>
            <button
              onClick={() => setSelectedLeads([])}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            {loading ? (
              <div className="text-center py-4">
                <svg
                  className="animate-spin h-8 w-8 text-primary-600 mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-2 text-gray-500">Loading leads...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">
                <p>{error}</p>
                <button
                  className="mt-2 text-primary-600 hover:text-primary-800"
                  onClick={fetchLeads}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                {renderTableHeader()}
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderTableRows()}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {!loading && !error && renderPagination()}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={closeModal}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
};

export default LeadTable;
