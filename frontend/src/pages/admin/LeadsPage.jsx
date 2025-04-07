// src/pages/admin/LeadsPage.jsx
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { useEffect } from "react";

const LeadsPage = () => {
  // For debugging
  useEffect(() => {
    console.log("Leads page mounted");
    return () => console.log("Leads page unmounted");
  }, []);

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Leads Management</h2>
        <p className="text-gray-600">
          Lead management features coming in Step 4.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="text-lg font-medium text-blue-700 mb-2">Coming Soon!</h3>
          <p className="text-blue-600">
            This page will include functionality for:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-blue-700">
            <li>Listing all leads with filtering and sorting</li>
            <li>Detailed lead information views</li> 
            <li>Lead segmentation and targeting</li>
            <li>Export capabilities for leads data</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LeadsPage;
