import React from "react";
import TemplateForm from "../../components/templates/TemplateForm";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { useParams } from "react-router-dom";

const TemplateFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  return (
    <AdminLayout>
      <div className="m-0">
        <div className="container-fluid px-4 pt-4 pb-0">
          <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Template" : "Create Template"}</h2>
        </div>
        <TemplateForm />
      </div>
    </AdminLayout>
  );
};

export default TemplateFormPage;
