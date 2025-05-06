import React, { useEffect, useState } from "react";
import { spamTriggerService } from "../services/spamTriggerService";
import SpamTriggerTable from "../components/spamTriggers/SpamTriggerTable";
import SpamTriggerForm from "../components/spamTriggers/SpamTriggerForm";
import ImportExportControls from "../components/spamTriggers/ImportExportControls";
import Modal from "../components/ui/Modal";
import Notification from "../components/ui/Notification";

const ContentPage = () => {
  const [triggers, setTriggers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [currentTrigger, setCurrentTrigger] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    type: "success",
    message: "",
    isVisible: false,
  });

  // Load spam triggers
  const loadTriggers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await spamTriggerService.getAll();
      setTriggers(data);
    } catch (err) {
      console.error("Failed to load triggers:", err);
      setError("Failed to load spam triggers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load triggers on component mount
  useEffect(() => {
    loadTriggers();
  }, []);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
      isVisible: true,
    });
  };

  // Close notification
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // Open modal with content
  const openModal = (content, trigger = null) => {
    setModalContent(content);
    setCurrentTrigger(trigger);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setCurrentTrigger(null);
  };

  // Handle add new trigger
  const handleAddTrigger = () => {
    openModal("form");
  };

  // Handle edit trigger
  const handleEditTrigger = (trigger) => {
    openModal("form", trigger);
  };

  // Handle delete trigger
  const handleDeleteTrigger = (triggerId) => {
    openModal("confirm-delete", { id: triggerId });
  };

  // Handle toggle active status
  const handleToggleActive = async (triggerId, active) => {
    try {
      await spamTriggerService.update(triggerId, { active });
      setTriggers((prev) =>
        prev.map((trigger) =>
          trigger.id === triggerId ? { ...trigger, active } : trigger
        )
      );
      showNotification(
        "success",
        `Trigger ${active ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      console.error("Failed to update trigger status:", err);
      showNotification("error", "Failed to update trigger status");
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action, ids) => {
    try {
      if (action === "delete") {
        openModal("confirm-bulk-delete", { ids });
        return;
      }

      const active = action === "activate";
      await spamTriggerService.bulkUpdateStatus(ids, active);

      setTriggers((prev) =>
        prev.map((trigger) =>
          ids.includes(trigger.id) ? { ...trigger, active } : trigger
        )
      );

      showNotification(
        "success",
        `${ids.length} triggers ${
          active ? "activated" : "deactivated"
        } successfully`
      );
    } catch (err) {
      console.error("Failed to perform bulk action:", err);
      showNotification("error", "Failed to perform bulk action");
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      let result;
      if (currentTrigger) {
        // Update existing trigger
        result = await spamTriggerService.update(currentTrigger.id, formData);
        setTriggers((prev) =>
          prev.map((trigger) =>
            trigger.id === currentTrigger.id ? result : trigger
          )
        );
        showNotification("success", "Spam trigger updated successfully");
      } else {
        // Create new trigger
        result = await spamTriggerService.create(formData);
        setTriggers((prev) => [...prev, result]);
        showNotification("success", "Spam trigger created successfully");
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save trigger:", err);
      showNotification("error", "Failed to save spam trigger");
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!currentTrigger) return;

    try {
      await spamTriggerService.delete(currentTrigger.id);
      setTriggers((prev) =>
        prev.filter((trigger) => trigger.id !== currentTrigger.id)
      );
      showNotification("success", "Spam trigger deleted successfully");
      closeModal();
    } catch (err) {
      console.error("Failed to delete trigger:", err);
      showNotification("error", "Failed to delete spam trigger");
    }
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    if (!currentTrigger || !currentTrigger.ids || !currentTrigger.ids.length)
      return;

    try {
      await spamTriggerService.bulkDelete(currentTrigger.ids);
      setTriggers((prev) =>
        prev.filter((trigger) => !currentTrigger.ids.includes(trigger.id))
      );
      showNotification(
        "success",
        `${currentTrigger.ids.length} triggers deleted successfully`
      );
      closeModal();
    } catch (err) {
      console.error("Failed to delete triggers:", err);
      showNotification("error", "Failed to delete triggers");
    }
  };

  // Handle import completion
  const handleImportComplete = () => {
    loadTriggers();
    showNotification("success", "Triggers imported successfully");
  };

  // Render modal content
  const renderModalContent = () => {
    switch (modalContent) {
      case "form":
        return (
          <SpamTriggerForm
            trigger={currentTrigger}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
          />
        );
      case "confirm-delete":
        return (
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this spam trigger? This action
              cannot be undone.
            </p>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      case "confirm-bulk-delete":
        return (
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete {currentTrigger?.ids?.length} spam
              triggers? This action cannot be undone.
            </p>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleBulkDeleteConfirm}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete All
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Spam Trigger Management
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage words and patterns that trigger spam detection in email subject
          lines.
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <ImportExportControls onImportComplete={handleImportComplete} />

        <button
          onClick={handleAddTrigger}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Trigger
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600"
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
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={loadTriggers}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Try Again
          </button>
        </div>
      ) : (
        <SpamTriggerTable
          triggers={triggers}
          onEdit={handleEditTrigger}
          onDelete={handleDeleteTrigger}
          onToggleActive={handleToggleActive}
          onBulkAction={handleBulkAction}
        />
      )}

      {/* Modal for forms and confirmations */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalContent === "form"
            ? currentTrigger
              ? "Edit Spam Trigger"
              : "Add New Spam Trigger"
            : modalContent === "confirm-delete"
            ? "Confirm Delete"
            : modalContent === "confirm-bulk-delete"
            ? "Confirm Bulk Delete"
            : ""
        }
      >
        {renderModalContent()}
      </Modal>

      {/* Notification component */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />
    </div>
  );
};

export default ContentPage;
