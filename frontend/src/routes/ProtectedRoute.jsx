import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import routes, { getLoginUrl } from "../config/routeConfig";
import LoadingSpinner from "../components/ui/LoadingSpinner";

/**
 * Component to protect routes that require authentication
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" text="Verifying your access..." />
      </div>
    );
  }

  // If authenticated or route doesn't require auth, render children
  if (isAuthenticated || !requireAuth) {
    return children;
  }

  // If not authenticated, redirect to login with return path
  return (
    <Navigate
      to={getLoginUrl(location.pathname)}
      state={{ from: location }}
      replace
    />
  );
};

export default ProtectedRoute;
