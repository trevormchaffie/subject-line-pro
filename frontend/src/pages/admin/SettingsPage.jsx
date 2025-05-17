import React, { useState } from "react";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import GeneralSettings from "../../components/admin/settings/GeneralSettings";
import EmailSettings from "../../components/admin/settings/EmailSettings";
import ApiSettings from "../../components/admin/settings/ApiSettings";
import UiSettings from "../../components/admin/settings/UiSettings";
import { useSettings } from "../../context/SettingsContext";

const SettingsPage = () => {
  const { loading, error, resetSettings, refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleResetSettings = async (settingType) => {
    if (
      !window.confirm(
        `Are you sure you want to reset ${
          settingType === "all" ? "all settings" : `${settingType} settings`
        } to default values? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsResetting(true);
    setResetError("");

    try {
      await resetSettings(settingType || activeTab);
      setResetSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (error) {
      setResetError(`Failed to reset settings: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Application Settings</h2>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 text-sm border border-blue-500 text-blue-500 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => refreshSettings()}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh Settings"}
            </button>
            <button
              className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleResetSettings("all")}
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Reset All to Default"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        {resetError && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {resetError}
          </div>
        )}
        {resetSuccess && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
            Settings have been reset to default values.
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <nav className="flex flex-col space-y-1">
                <button
                  className={`text-left px-4 py-2 rounded-md ${
                    activeTab === "general"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("general")}
                >
                  General Settings
                </button>
                <button
                  className={`text-left px-4 py-2 rounded-md ${
                    activeTab === "email"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("email")}
                >
                  Email Settings
                </button>
                <button
                  className={`text-left px-4 py-2 rounded-md ${
                    activeTab === "api"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("api")}
                >
                  API Settings
                </button>
                <button
                  className={`text-left px-4 py-2 rounded-md ${
                    activeTab === "ui"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("ui")}
                >
                  UI Settings
                </button>
              </nav>

              <div className="mt-6">
                <button
                  className="w-full px-4 py-2 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleResetSettings()}
                  disabled={isResetting}
                >
                  Reset {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                  Settings
                </button>
              </div>
            </div>

            <div className="md:w-3/4">
              <div className="bg-white rounded-lg">
                {activeTab === "general" && <GeneralSettings />}
                {activeTab === "email" && <EmailSettings />}
                {activeTab === "api" && <ApiSettings />}
                {activeTab === "ui" && <UiSettings />}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
