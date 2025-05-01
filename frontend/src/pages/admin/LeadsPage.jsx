// src/pages/admin/LeadsPage.jsx
import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import LeadTable from "../../components/admin/leads/LeadTable";
import LeadExport from "../../components/admin/leads/LeadExport";

const LeadsPage = () => {
  const [filters, setFilters] = useState({
    status: "",
    businessType: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  
  // For tracking if the page is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Cleanup on unmount
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Handle filter changes from the table component
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <LeadExport filters={filters} />
        </div>
      </div>

      <div className="mt-6">
        <LeadTable onFilterChange={handleFilterChange} filters={filters} />
      </div>
    </AdminLayout>
  );
};

export default LeadsPage;
