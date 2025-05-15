import React from "react";
import TemplateList from "../../components/templates/TemplateList";
import AdminLayout from "../../components/admin/layout/AdminLayout";

const TemplatesListPage = () => {
  return (
    <AdminLayout>
      <div className="m-0">
        <div className="container-fluid px-4 pt-4 pb-0">
          <h2 className="text-xl font-semibold mb-4">Suggestion Templates</h2>
        </div>
        <TemplateList />
      </div>
    </AdminLayout>
  );
};

export default TemplatesListPage;
