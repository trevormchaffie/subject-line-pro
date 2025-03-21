import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { registerServiceWorker } from "./registerSW.js";
import syncService from "./services/syncService.js";

// Register the service worker
registerServiceWorker();

// Initialize offline data synchronization
syncService.init();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
