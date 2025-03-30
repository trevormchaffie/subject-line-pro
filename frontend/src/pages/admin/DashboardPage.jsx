// frontend/src/pages/admin/DashboardPage.jsx
import AdminLayout from "../../components/admin/layout/AdminLayout";

const DashboardPage = () => {
  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
        <p className="text-gray-600">
          Welcome to the Subject Line Pro admin dashboard. Select a section from
          the sidebar to manage your application.
        </p>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
