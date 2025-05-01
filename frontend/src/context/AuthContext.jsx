import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// Get API base URL based on environment
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001/api/auth" // Development (updated to port 3001)
    : "https://api.trevormchaffie.com/api/auth"; // Production

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshingToken, setRefreshingToken] = useState(false);

  // Function to get the access token
  const getAccessToken = useCallback(() => {
    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  }, []);

  // Function to get the refresh token
  const getRefreshToken = useCallback(() => {
    return (
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken")
    );
  }, []);

  // Function to save tokens
  const saveTokens = useCallback(
    (accessToken, refreshToken, expiresAt, rememberMe) => {
      const storage = rememberMe ? localStorage : sessionStorage;

      if (accessToken) storage.setItem("authToken", accessToken);
      if (refreshToken) storage.setItem("refreshToken", refreshToken);
      if (expiresAt) storage.setItem("tokenExpiresAt", expiresAt.toString());
    },
    []
  );

  // Function to clear tokens
  const clearTokens = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiresAt");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("tokenExpiresAt");
  }, []);

  // Refresh the access token
  const refreshToken = useCallback(async () => {
    setRefreshingToken(true);
    try {
      const refreshToken = getRefreshToken();
      const currentToken = getAccessToken();

      if (!refreshToken || !currentToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
          token: currentToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Determine storage type based on where refresh token is stored
        const useLocalStorage = !!localStorage.getItem("refreshToken");

        // Save the new access token
        saveTokens(data.token, null, data.expiresAt, useLocalStorage);

        return true;
      } else {
        throw new Error(data.message || "Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setRefreshingToken(false);
    }
  }, [getRefreshToken, getAccessToken, saveTokens, clearTokens]);

  // Setup token refresh timer
  useEffect(() => {
    if (!isAuthenticated) return;

    // Get token expiration time
    const expiresAt =
      localStorage.getItem("tokenExpiresAt") ||
      sessionStorage.getItem("tokenExpiresAt");
    if (!expiresAt) return;

    // Convert to milliseconds and subtract current time
    const expiresAtMs = parseInt(expiresAt) * 1000;
    const nowMs = Date.now();

    // If already expired, refresh immediately
    if (expiresAtMs <= nowMs) {
      refreshToken();
      return;
    }

    // Set timer to refresh 5 minutes before expiration
    const timeUntilRefresh = expiresAtMs - nowMs - 5 * 60 * 1000;

    // Setup timer
    const refreshTimer = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);

    // Cleanup timer on unmount
    return () => clearTimeout(refreshTimer);
  }, [isAuthenticated, refreshToken]);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      setLoading(true);
      try {
        // Check if token exists
        const token = getAccessToken();

        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // Verify token with backend
        const response = await fetch(`${API_BASE_URL}/verify`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          // Token is invalid or expired, try to refresh it
          const refreshSuccessful = await refreshToken();

          if (!refreshSuccessful) {
            clearTokens();
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Error verifying authentication:", err);
        setError("Failed to verify authentication status");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [clearTokens, getAccessToken, refreshToken]);

  // Login function
  const login = async (username, password, rememberMe = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setUser(data.user);

        // Store tokens
        saveTokens(data.token, data.refreshToken, data.expiresAt, rememberMe);

        return true;
      } else {
        setError(data.message || "Invalid credentials");
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to authentication server");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error("Logout API error:", error);
      }
    }

    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Add this to the end of the file, before the return statement
  // Setup axios interceptor for protected requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (config.requiresAuth !== false) {
          const token = getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [getAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
        getAccessToken,
        refreshToken,
        refreshingToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
