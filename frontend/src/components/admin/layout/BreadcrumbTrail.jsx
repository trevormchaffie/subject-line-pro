import { Link, useLocation } from "react-router-dom";
import routes from "../../../config/routeConfig";

const BreadcrumbTrail = () => {
  const location = useLocation();

  // Map route paths to user-friendly names
  const pathNames = {
    [routes.admin.dashboard]: "Dashboard",
    [routes.admin.leads]: "Leads",
    [routes.admin.analytics]: "Analytics",
    [routes.admin.content]: "Content Management",
    [routes.admin.settings]: "Settings",
  };

  // Function to generate breadcrumb items
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname
      .split("/")
      .filter((segment) => segment);

    // Start with admin
    const breadcrumbs = [{ path: "/admin/dashboard", label: "Admin" }];

    // Add current page
    if (location.pathname !== "/admin/dashboard") {
      breadcrumbs.push({
        path: location.pathname,
        label:
          pathNames[location.pathname] || pathSegments[pathSegments.length - 1],
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render if only showing "Admin"
  if (breadcrumbs.length <= 1 && location.pathname === "/admin/dashboard") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex text-sm text-gray-500">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && (
                <svg
                  className="mx-2 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}

              {isLast ? (
                <span className="text-gray-800 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-primary hover:text-primary-dark"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbTrail;
