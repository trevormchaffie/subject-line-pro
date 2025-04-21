// In frontend/src/main.jsx, update to include AdminLayoutProvider
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminLayoutProvider } from "./context/AdminLayoutContext";
import App from "./App.jsx";
import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import LeadsPage from "./pages/admin/LeadsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ContentPage from "./pages/admin/ContentPage";
import ApiTestPage from "./pages/admin/ApiTestPage";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { registerServiceWorker } from "./registerSW.js";
import syncService from "./services/syncService.js";
import ProtectedRoute from "./routes/ProtectedRoute";
import routes from "./config/routeConfig";
import "./index.css";

// Register the service worker
registerServiceWorker();

// Initialize offline data synchronization
syncService.init();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AdminLayoutProvider>
            <Routes>
              {/* Public routes */}
              <Route path={routes.public.home} element={<App />} />
              <Route path={routes.public.login} element={<LoginPage />} />

              {/* Protected admin routes */}
              <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path={routes.admin.dashboard} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path={routes.admin.leads} element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
              <Route path={routes.admin.analytics} element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path={routes.admin.settings} element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path={routes.admin.content} element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
              <Route path="/api-test" element={<ApiTestPage />} />

              {/* Catch-all route - 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold text-primary mb-4">
                      Page Not Found
                    </h1>
                    <p className="text-gray-600 mb-4">
                      The page you are looking for doesn't exist.
                    </p>
                    <a
                      href={routes.public.home}
                      className="text-primary hover:underline"
                    >
                      Return to Home
                    </a>
                  </div>
                }
              />
            </Routes>
          </AdminLayoutProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
