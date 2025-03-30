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
      <AdminHeader />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarOpen && !isMobile ? "ml-64" : "ml-0"
          }`}
        >
          <div className="container mx-auto px-4 py-6">
            <BreadcrumbTrail />
            <div className="mt-4">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
