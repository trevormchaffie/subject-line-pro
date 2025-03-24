import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      setLoading(true);
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem("authToken");

        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // Verify token with backend
        const response = await fetch(
          "https://api.trevormchaffie.com/api/auth/verify",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          // Token is invalid or expired
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setUser(null);
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
  }, []);

  // Login function
  const login = async (username, password, rememberMe = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://api.trevormchaffie.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setUser(data.user);

        // Store token in localStorage if rememberMe is true, otherwise in sessionStorage
        if (rememberMe) {
          localStorage.setItem("authToken", data.token);
        } else {
          sessionStorage.setItem("authToken", data.token);
        }

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
  const logout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  // Get auth token (from either localStorage or sessionStorage)
  const getAuthToken = () => {
    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
        getAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
