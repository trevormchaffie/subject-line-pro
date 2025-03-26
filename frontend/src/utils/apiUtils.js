import { useAuth } from "../hooks/useAuth";

/**
 * Custom hook for making authenticated API requests
 * Handles token refresh when needed
 */
export const useAuthenticatedRequest = () => {
  const { getAccessToken, refreshToken, isAuthenticated } = useAuth();

  /**
   * Make an authenticated API request
   * @param {string} url - API endpoint
   * @param {Object} options - Fetch options
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<Object>} - Response data
   */
  const fetchWithAuth = async (url, options = {}, requiresAuth = true) => {
    // Don't try to authenticate if user isn't logged in and endpoint requires auth
    if (requiresAuth && !isAuthenticated) {
      throw new Error("Authentication required");
    }

    try {
      // Add authentication header if needed
      const headers = options.headers || {};

      if (requiresAuth) {
        const token = getAccessToken();

        if (!token) {
          throw new Error("No authentication token available");
        }

        headers.Authorization = `Bearer ${token}`;
      }

      // Make the request
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });

      // If unauthorized, try to refresh the token and retry once
      if (response.status === 401 && requiresAuth) {
        const refreshSuccessful = await refreshToken();

        if (refreshSuccessful) {
          // Get the new token and retry the request
          const newToken = getAccessToken();

          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...headers,
              Authorization: `Bearer ${newToken}`,
            },
          });

          return handleResponse(retryResponse);
        } else {
          throw new Error("Session expired. Please log in again.");
        }
      }

      return handleResponse(response);
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  };

  /**
   * Handle API response
   * @param {Response} response - Fetch response object
   * @returns {Promise<Object>} - Parsed response data
   */
  const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  };

  return { fetchWithAuth };
};
