// frontend/src/pages/admin/DashboardPage.jsx
import AdminLayout from "../../components/admin/layout/AdminLayout";
import DashboardOverview from "../../components/admin/dashboard/DashboardOverview";

const DashboardPage = () => {
  return (
    <AdminLayout>
      <DashboardOverview />
    </AdminLayout>
  );
};

export default DashboardPage;
