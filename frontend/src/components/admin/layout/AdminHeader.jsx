import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useAdminLayout } from "../../../context/AdminLayoutContext";

const AdminHeader = () => {
  const { toggleSidebar, isMobile } = useAdminLayout();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 h-16">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="mr-4 text-gray-600 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo with improved visibility */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">Subject Line Pro</h1>
          <span className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs text-gray-700 font-semibold">
            Admin
          </span>
        </div>
      </div>

      {/* User menu */}
      <div className="flex items-center">
        <span className="mr-4 text-sm text-gray-600 hidden md:inline">
          Logged in as{" "}
          <span className="font-medium">{user?.username || "Admin"}</span>
        </span>
        <button
          onClick={handleLogout}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;
