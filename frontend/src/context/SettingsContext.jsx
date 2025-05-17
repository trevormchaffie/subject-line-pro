import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import settingsService from "../services/settingsService";
import { useAuth } from "../hooks/useAuth";

// Create context
const SettingsContext = createContext();

// Settings version for cache invalidation
const SETTINGS_VERSION = "1.0";

export const SettingsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // State for different setting types
  const [generalSettings, setGeneralSettings] = useState(null);
  const [emailSettings, setEmailSettings] = useState(null);
  const [apiSettings, setApiSettings] = useState(null);
  const [uiSettings, setUiSettings] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Check local storage for cached settings
  const getCachedSettings = (type) => {
    try {
      const cachedData = localStorage.getItem(`settings_${type}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        // Check version to ensure settings are current
        if (parsedData.version === SETTINGS_VERSION) {
          return parsedData.data;
        }
      }
    } catch (error) {
      console.error(`Error retrieving cached ${type} settings:`, error);
    }
    return null;
  };

  // Save settings to local storage
  const cacheSettings = (type, data) => {
    try {
      localStorage.setItem(
        `settings_${type}`,
        JSON.stringify({
          version: SETTINGS_VERSION,
          timestamp: new Date().toISOString(),
          data,
        })
      );
    } catch (error) {
      console.error(`Error caching ${type} settings:`, error);
    }
  };

  // Fetch all settings
  const fetchAllSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to use cached settings first
      const cachedGeneral = getCachedSettings("general");
      const cachedEmail = getCachedSettings("email");
      const cachedApi = getCachedSettings("api");
      const cachedUi = getCachedSettings("ui");

      if (cachedGeneral) setGeneralSettings(cachedGeneral);
      if (cachedEmail) setEmailSettings(cachedEmail);
      if (cachedApi) setApiSettings(cachedApi);
      if (cachedUi) setUiSettings(cachedUi);

      // Set default values if no cached settings
      if (!cachedGeneral) {
        const defaultGeneral = await settingsService.getGeneralSettings();
        setGeneralSettings(defaultGeneral);
        cacheSettings("general", defaultGeneral);
      }
      
      if (!cachedEmail) {
        const defaultEmail = await settingsService.getEmailSettings();
        setEmailSettings(defaultEmail);
        cacheSettings("email", defaultEmail);
      }
      
      if (!cachedApi) {
        const defaultApi = await settingsService.getApiSettings();
        setApiSettings(defaultApi);
        cacheSettings("api", defaultApi);
      }
      
      if (!cachedUi) {
        const defaultUi = await settingsService.getUiSettings();
        setUiSettings(defaultUi);
        cacheSettings("ui", defaultUi);
      }
      
      // We'll fetch fresh settings in the background, but not wait for them
      // This prevents the too many requests errors
      setTimeout(async () => {
        try {
          // Fetch fresh settings from API one at a time with delays
          const general = await settingsService.getGeneralSettings();
          setGeneralSettings(general);
          cacheSettings("general", general);
          
          const email = await settingsService.getEmailSettings();
          setEmailSettings(email);
          cacheSettings("email", email);
          
          const api = await settingsService.getApiSettings();
          setApiSettings(api);
          cacheSettings("api", api);
          
          const ui = await settingsService.getUiSettings();
          setUiSettings(ui);
          cacheSettings("ui", ui);
          
        } catch (backgroundErr) {
          console.error("Background settings refresh error:", backgroundErr);
          // No need to set error - we're already showing content from cache
        }
      }, 1000);
      
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings. Using default values.");
      
      // Set default values directly from the service if all else fails
      const defaultGeneral = await settingsService.getGeneralSettings();
      const defaultEmail = await settingsService.getEmailSettings();
      const defaultApi = await settingsService.getApiSettings();
      const defaultUi = await settingsService.getUiSettings();
      
      setGeneralSettings(defaultGeneral);
      setEmailSettings(defaultEmail);
      setApiSettings(defaultApi);
      setUiSettings(defaultUi);
      
    } finally {
      setLoading(false);
    }
  }, []);

  // Individual setting update functions
  const updateGeneralSettings = async (newSettings) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const updated = await settingsService.updateGeneralSettings(newSettings);
      setGeneralSettings(updated);
      cacheSettings("general", updated);
      return updated;
    } catch (err) {
      setSaveError("Failed to update general settings");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmailSettings = async (newSettings) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const updated = await settingsService.updateEmailSettings(newSettings);
      setEmailSettings(updated);
      cacheSettings("email", updated);
      return updated;
    } catch (err) {
      setSaveError("Failed to update email settings");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const updateApiSettings = async (newSettings) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const updated = await settingsService.updateApiSettings(newSettings);
      setApiSettings(updated);
      cacheSettings("api", updated);
      return updated;
    } catch (err) {
      setSaveError("Failed to update API settings");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const updateUiSettings = async (newSettings) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const updated = await settingsService.updateUiSettings(newSettings);
      setUiSettings(updated);
      cacheSettings("ui", updated);
      return updated;
    } catch (err) {
      setSaveError("Failed to update UI settings");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Reset settings function
  const resetSettings = async (settingType) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await settingsService.resetSettings(settingType);
      // Refresh all settings after reset
      await fetchAllSettings();
    } catch (err) {
      setSaveError(`Failed to reset ${settingType} settings`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Test email function
  const sendTestEmail = async (testEmail) => {
    try {
      return await settingsService.sendTestEmail(testEmail);
    } catch (err) {
      console.error("Error sending test email:", err);
      throw err;
    }
  };

  // Apply UI Settings to CSS variables
  useEffect(() => {
    if (uiSettings) {
      // Set theme-related CSS variables
      document.documentElement.style.setProperty('--primary-color', uiSettings.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', uiSettings.secondaryColor);
      
      // Apply dark/light theme
      if (uiSettings.theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
      
      // Set font size
      if (uiSettings.fontSize === 'small') {
        document.documentElement.style.setProperty('--base-font-size', '14px');
      } else if (uiSettings.fontSize === 'large') {
        document.documentElement.style.setProperty('--base-font-size', '18px');
      } else {
        document.documentElement.style.setProperty('--base-font-size', '16px');
      }
    }
  }, [uiSettings]);

  // Fetch settings on initial load and when login status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllSettings();
    }
  }, [isAuthenticated, fetchAllSettings]);

  // Create context value
  const contextValue = {
    // Settings
    generalSettings,
    emailSettings,
    apiSettings,
    uiSettings,

    // Status
    loading,
    error,
    isSaving,
    saveError,

    // Methods
    updateGeneralSettings,
    updateEmailSettings,
    updateApiSettings,
    updateUiSettings,
    resetSettings,
    sendTestEmail,
    refreshSettings: fetchAllSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for using the context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export default SettingsContext;
