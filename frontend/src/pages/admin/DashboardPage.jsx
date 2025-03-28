import { useNavigate, NavLink } from "react-router-dom"; // Add NavLink import
import { useAuth } from "../../hooks/useAuth";
import routes from "../../config/routeConfig"; // Add this import

const DashboardPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">Subject Line Pro</h1>
            <span className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs text-gray-700">
              Admin
            </span>
          </div>

          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-600">
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
      </header>

      {/* Add navigation menu here - between header and main content */}
      <nav className="bg-white shadow-sm mt-1 mb-6">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-4 overflow-x-auto py-2">
            <li>
              <NavLink
                to={routes.admin.dashboard}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to={routes.admin.leads}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                Leads
              </NavLink>
            </li>
            <li>
              <NavLink
                to={routes.admin.analytics}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                Analytics
              </NavLink>
            </li>
            <li>
              <NavLink
                to={routes.admin.content}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                Content
              </NavLink>
            </li>
            <li>
              <NavLink
                to={routes.admin.settings}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                Settings
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      {/* Dashboard Content Placeholder */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
          <p className="text-gray-600">
            Full dashboard coming in Step 2. You are now successfully logged in
            to the admin area.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
