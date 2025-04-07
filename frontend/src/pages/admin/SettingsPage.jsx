import AdminLayout from "../../components/admin/layout/AdminLayout";

const SettingsPage = () => {
  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <p className="text-gray-600">
          Settings Page features coming in future updates.
        </p>
        
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Coming Soon!</h3>
          <p className="text-gray-600">
            This page will include functionality for:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-700">
            <li>Application preferences</li>
            <li>User account management</li>
            <li>Notification settings</li>
            <li>API integration options</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
