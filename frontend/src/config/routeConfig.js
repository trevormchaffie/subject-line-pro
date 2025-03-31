/**
 * Route configuration for admin dashboard
 * Centralizes route definitions and access control
 */
const routes = {
  // Public routes
  public: {
    home: "/",
    login: "/admin/login",
  },

  // Protected admin routes
  admin: {
    dashboard: "/admin/dashboard",
    leads: "/admin/leads",
    analytics: "/admin/analytics",
    settings: "/admin/settings",
    content: "/admin/content",
  },
};

/**
 * Function to check if a route requires authentication
 * @param {string} path - The route path to check
 * @returns {boolean} - Whether the route requires auth
 */
export const requiresAuth = (path) => {
  // Check if path starts with any admin route
  return Object.values(routes.admin).some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
};

/**
 * Get login redirect URL with return path
 * @param {string} returnPath - Path to return to after login
 * @returns {string} - Login URL with return query param
 */
export const getLoginUrl = (returnPath) => {
  if (!returnPath || returnPath === routes.public.login) {
    return routes.public.login;
  }
  return `${routes.public.login}?returnTo=${encodeURIComponent(returnPath)}`;
};

export default routes;
