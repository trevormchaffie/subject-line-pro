import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import LoginPage from "./pages/admin/LoginPage";
import AdminRoutes from "./routes/AdminRoutes";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { registerServiceWorker } from "./registerSW.js";
import syncService from "./services/syncService.js";
import "./index.css";

// Import a placeholder dashboard page
import DashboardPage from "./pages/admin/DashboardPage";

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
            {/* Main app routes */}
            <Route path="/" element={<App />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<AdminRoutes />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              {/* More admin routes will be added in future steps */}
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
