import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import BreadcrumbTrail from "./BreadcrumbTrail";
import { useAdminLayout } from "../../../context/AdminLayoutContext";

const AdminLayout = ({ children }) => {
  const { sidebarOpen, isMobile } = useAdminLayout();

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobile, sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <AdminHeader />
      </header>

      <div className="flex flex-1">
        <AdminSidebar />

        <main
          className={`flex-1 flex flex-col ${
            sidebarOpen && !isMobile ? "ml-64" : "ml-0"
          }`}
        >
          <div className="sticky top-16 z-30 bg-gray-100 border-b border-gray-200">
            <div className="container mx-auto px-4 py-2">
              <BreadcrumbTrail />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
