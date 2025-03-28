// Update your src/main.jsx router configuration

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { registerServiceWorker } from "./registerSW.js";
import syncService from "./services/syncService.js";
import ProtectedRoute from "./routes/ProtectedRoute";
import routes from "./config/routeConfig";
import "./index.css";

// Placeholder components for admin routes
const LeadsPage = () => <div>Leads Page (Coming in Step 4)</div>;
const AnalyticsPage = () => <div>Analytics Page (Coming in Step 3)</div>;
const SettingsPage = () => <div>Settings Page (Coming in Step 6)</div>;
const ContentPage = () => <div>Content Management (Coming in Step 5)</div>;

// Register the service worker
registerServiceWorker();

// Initialize offline data synchronization
syncService.init();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path={routes.public.home} element={<App />} />
            <Route path={routes.public.login} element={<LoginPage />} />

            {/* Protected admin routes */}
            <Route
              path={routes.admin.dashboard}
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={routes.admin.leads}
              element={
                <ProtectedRoute>
                  <LeadsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={routes.admin.analytics}
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={routes.admin.settings}
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={routes.admin.content}
              element={
                <ProtectedRoute>
                  <ContentPage />
                </ProtectedRoute>
              }
            />

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
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
