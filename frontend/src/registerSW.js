import { registerSW } from "virtual:pwa-register";

export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // New content is available, show a notification or refresh automatically
        if (confirm("New version available. Reload to update?")) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        // Show a notification that the app is ready for offline use
        console.log("App ready for offline use");

        // Optional: Show a toast notification
        if (document.getElementById("offline-toast")) {
          return; // Already showing
        }

        const toast = document.createElement("div");
        toast.id = "offline-toast";
        toast.className =
          "fixed bottom-4 right-4 bg-success text-white px-4 py-2 rounded-lg shadow-lg";
        toast.textContent = "Subject Line Pro is ready for offline use!";

        // Add close button
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.className = "ml-2 font-bold";
        closeBtn.onclick = () => toast.remove();
        toast.appendChild(closeBtn);

        // Auto-remove after 5 seconds
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.getElementById("offline-toast")) {
            toast.remove();
          }
        }, 5000);
      },
    });
  }
}
