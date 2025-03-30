import { createContext, useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Create context
const AdminLayoutContext = createContext();

// Custom hook to use the context
export const useAdminLayout = () => {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error(
      "useAdminLayout must be used within an AdminLayoutProvider"
    );
  }
  return context;
};

export const AdminLayoutProvider = ({ children }) => {
  // State for sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Current location for active state detection
  const location = useLocation();

  // Track screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AdminLayoutContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        isMobile,
        currentPath: location.pathname,
      }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
};

export default AdminLayoutProvider;
