// src/components/admin/leads/LeadDetailModal.jsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import LeadStatusBadge from "./LeadStatusBadge";
import LeadNotes from "./LeadNotes";

const LeadDetailModal = ({ lead, isOpen, onClose, onUpdate }) => {
  const [status, setStatus] = useState(lead.status || "New");
  const [successMessage, setSuccessMessage] = useState("");

  // Clear success message after 3 seconds
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [successMessage]);

  if (!isOpen) return null;

  // Handle status change
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  // Submit status update
  const handleSubmit = async () => {
    try {
      console.log("Submit button clicked, preparing to update lead");
      console.log("Current lead:", lead);
      console.log("New status value:", status);
      
      const result = await onUpdate({ ...lead, status });
      console.log("Update result:", result);
      
      if (result) {
        setSuccessMessage("Lead updated successfully!");
      } else {
        setSuccessMessage("Update may have failed. Check the status.");
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setSuccessMessage("Error updating lead.");
    }
    // Don't close the modal here - let the user close it manually
  };

  // Format date for display
  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-0 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                {/* Header with close button */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Lead Details
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Lead information */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="mt-1 text-sm text-gray-900">{lead.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-sm text-gray-900">{lead.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Business Type
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {lead.businessType.charAt(0).toUpperCase() +
                          lead.businessType.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Date Added
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(lead.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Status
                      </p>
                      <div className="mt-1">
                        <LeadStatusBadge status={lead.status || "New"} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        IP Address
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {lead.ipAddress || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject line and analysis */}
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    Subject Line Analysis
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Subject Line
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {lead.subjectLine}
                    </p>

                    {lead.analysisResults && (
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Overall Score
                          </p>
                          <div className="mt-1 flex items-center">
                            <div className="bg-gray-200 w-full h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  lead.analysisResults.overallScore >= 80
                                    ? "bg-green-500"
                                    : lead.analysisResults.overallScore >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${lead.analysisResults.overallScore}%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-900">
                              {lead.analysisResults.overallScore}%
                            </span>
                          </div>
                        </div>

                        {lead.analysisResults.spamScore !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Spam Score
                            </p>
                            <div className="mt-1 flex items-center">
                              <div className="bg-gray-200 w-full h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    lead.analysisResults.spamScore <= 10
                                      ? "bg-green-500"
                                      : lead.analysisResults.spamScore <= 30
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${lead.analysisResults.spamScore}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-900">
                                {lead.analysisResults.spamScore}%
                              </span>
                            </div>
                          </div>
                        )}

                        {lead.analysisResults.suggestions !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Suggestions
                            </p>
                            <p className="mt-1 text-sm text-gray-900">
                              {lead.analysisResults.suggestions}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status update */}
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    Update Status
                  </h4>
                  <select
                    value={status}
                    onChange={handleStatusChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Unsubscribed">Unsubscribed</option>
                  </select>
                  {successMessage && (
                    <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-md">
                      {successMessage}
                    </div>
                  )}
                </div>

                {/* Lead notes */}
                <LeadNotes leadId={lead.id} initialNotes={lead.notes || []} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Update Lead
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
